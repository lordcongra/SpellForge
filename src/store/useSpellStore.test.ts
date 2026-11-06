import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSpellStore } from './useSpellStore';
import { createParticle } from '@/core/engine/particlePhysics';
import type { SpellDefinition } from '@/types/spellSchema';
import OBR from '@owlbear-rodeo/sdk';

const mockBuilder = () => {
  const b: Record<string, unknown> = {};
  const chain = () => b;
  b.width = chain;
  b.height = chain;
  b.shapeType = chain;
  b.position = chain;
  b.fillColor = chain;
  b.fillOpacity = chain;
  b.strokeColor = chain;
  b.strokeOpacity = chain;
  b.strokeWidth = chain;
  b.layer = chain;
  b.metadata = chain;
  b.commands = chain;
  b.build = vi.fn().mockReturnValue({ id: 'mock-item' });
  return b;
};

vi.mock('@owlbear-rodeo/sdk', () => {
  return {
    buildShape: () => mockBuilder(),
    buildPath: () => mockBuilder(),
    default: {
      isAvailable: true,
      broadcast: {
        sendMessage: vi.fn().mockResolvedValue(undefined),
      },
      scene: {
        local: {
          addItems: vi.fn().mockResolvedValue(undefined),
          deleteItems: vi.fn().mockResolvedValue(undefined),
        },
      },
    },
  };
});

describe('useSpellStore', () => {
  const testSpell: SpellDefinition = {
    id: 'test-spell-1',
    name: 'Spark Bolt',
    description: 'Shoots a spark bolt.',
    category: 'elemental',
    castRange: 400,
    cooldownMs: 500,
    icon: 'Sparkles',
    mechanics: [
      {
        id: 'mech-1',
        type: 'projectile',
        name: 'Bolt',
        durationMs: 300,
        params: { speed: 500, arcHeight: 0 },
        triggers: {
          onCast: {
            vfx: [
              {
                id: 'vfx-1',
                shapeId: 'sparkle',
                color: '#ffff00',
                particleCount: 5,
                size: 10,
                speed: 5,
                lifetimeMs: 200,
                spreadAngle: 360,
                glow: true,
                glowBlur: 6,
                opacity: 1,
              },
            ],
            spawnMechanicIds: [],
          },
        },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSpellStore.setState({
      spells: [testSpell],
      activeSpell: null,
      activeTimelines: [],
      activeParticles: [],
    });
  });

  it('initializes with default state', () => {
    const state = useSpellStore.getState();
    expect(state.spells.length).toBeGreaterThan(0);
    expect(state.activeSpell).toBeNull();
    expect(state.activeTimelines).toEqual([]);
    expect(state.activeParticles).toEqual([]);
  });

  it('sets active spell', () => {
    useSpellStore.getState().setActiveSpell(testSpell);
    expect(useSpellStore.getState().activeSpell).toEqual(testSpell);

    useSpellStore.getState().setActiveSpell(null);
    expect(useSpellStore.getState().activeSpell).toBeNull();
  });

  it('saves a new spell and updates existing', () => {
    const newSpell: SpellDefinition = {
      ...testSpell,
      id: 'test-spell-2',
      name: 'Flame Surge',
    };

    useSpellStore.getState().saveSpell(newSpell);
    expect(useSpellStore.getState().spells).toHaveLength(2);
    expect(useSpellStore.getState().activeSpell).toEqual(newSpell);

    // Update existing
    const modifiedSpell: SpellDefinition = {
      ...newSpell,
      name: 'Flame Surge Max',
    };
    useSpellStore.getState().saveSpell(modifiedSpell);
    expect(useSpellStore.getState().spells).toHaveLength(2);
    expect(
      useSpellStore.getState().spells.find((s) => s.id === 'test-spell-2')?.name
    ).toBe('Flame Surge Max');
  });

  it('deletes a spell and resets activeSpell if matched', () => {
    useSpellStore.getState().setActiveSpell(testSpell);
    useSpellStore.getState().deleteSpell(testSpell.id);

    expect(useSpellStore.getState().spells).toHaveLength(0);
    expect(useSpellStore.getState().activeSpell).toBeNull();
  });

  it('spawns and clears particles', () => {
    const p = createParticle({ shapeId: 'circle', x: 10, y: 10 });
    useSpellStore.getState().spawnParticles([p]);

    expect(useSpellStore.getState().activeParticles).toHaveLength(1);

    useSpellStore.getState().clearParticles();
    expect(useSpellStore.getState().activeParticles).toHaveLength(0);
  });

  it('updates particles tick and prunes expired particles', () => {
    const p1 = createParticle({ shapeId: 'circle', x: 0, y: 0, lifetimeMs: 100 });
    const p2 = createParticle({ shapeId: 'circle', x: 0, y: 0, lifetimeMs: 800 });
    useSpellStore.getState().spawnParticles([p1, p2]);

    useSpellStore.getState().updateParticlesTick(200);

    const active = useSpellStore.getState().activeParticles;
    expect(active).toHaveLength(1);
    expect(active[0].id).toBe(p2.id);
  });

  it('casts spell, dispatches particles, tracks timeline, and broadcasts over OBR', async () => {
    const origin = { x: 100, y: 150 };
    const destination = { x: 300, y: 400 };

    const payload = await useSpellStore.getState().castSpell(testSpell, origin, destination);

    // Verify payload
    expect(payload.spell.id).toBe(testSpell.id);
    expect(payload.origin).toEqual(origin);
    expect(payload.destination).toEqual(destination);

    // Verify timeline
    const timelines = useSpellStore.getState().activeTimelines;
    expect(timelines).toHaveLength(1);
    expect(timelines[0].id).toBe(payload.castId);
    expect(timelines[0].durationMs).toBe(300);

    // Verify particles spawned from onCast
    const particles = useSpellStore.getState().activeParticles;
    expect(particles.length).toBeGreaterThan(0);

    // Verify OBR broadcast was called
    expect(OBR.broadcast.sendMessage).toHaveBeenCalledWith('spellforge/cast', payload);
  });

  it('handles remote cast broadcast by spawning particles', () => {
    const payload = {
      castId: 'remote-1',
      spell: testSpell,
      origin: { x: 50, y: 50 },
      destination: { x: 150, y: 150 },
      targetTokenIds: [],
      pathPoints: [],
      timestamp: Date.now(),
    };

    useSpellStore.getState().handleCastBroadcast(payload);

    const particles = useSpellStore.getState().activeParticles;
    expect(particles.length).toBeGreaterThan(0);
  });

  it('manages originSpot and targetSpots correctly', () => {
    const store = useSpellStore.getState();
    expect(store.originSpot).toEqual({ x: 300, y: 300 });
    expect(store.targetSpots).toEqual([]);

    store.setOriginSpot({ x: 120, y: 240 });
    expect(useSpellStore.getState().originSpot).toEqual({ x: 120, y: 240 });

    store.addTargetSpot({ x: 500, y: 500 });
    store.addTargetSpot({ x: 600, y: 600 });
    expect(useSpellStore.getState().targetSpots).toHaveLength(2);

    store.removeTargetSpot(0);
    expect(useSpellStore.getState().targetSpots).toEqual([{ x: 600, y: 600 }]);

    store.clearTargetSpots();
    expect(useSpellStore.getState().targetSpots).toEqual([]);
  });

  it('casts to all target spots when multiple targetSpots are present', async () => {
    const store = useSpellStore.getState();
    store.setOriginSpot({ x: 100, y: 100 });
    store.setTargetSpots([
      { x: 200, y: 200 },
      { x: 300, y: 300 },
    ]);

    await store.castSpell(testSpell);

    // Timelines should be created for each target spot
    expect(useSpellStore.getState().activeTimelines).toHaveLength(2);
    expect(OBR.broadcast.sendMessage).toHaveBeenCalledTimes(2);
  });
});
