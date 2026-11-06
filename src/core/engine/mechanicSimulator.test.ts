import { describe, it, expect } from 'vitest';
import {
  simulateProjectile,
  simulateBeam,
  simulateCone,
  simulateBurst,
  simulateAura,
  simulateMechanic,
  type MechanicSimulationContext,
} from './mechanicSimulator';
import type { Particle } from './particlePhysics';
import type { SpellDefinition, VfxConfig } from '@/types/spellSchema';

const dummySpell: SpellDefinition = {
  id: 'test-spell',
  name: 'Test Spell',
  description: 'Test spell description',
  category: 'elemental',
  castRange: 500,
  cooldownMs: 500,
  icon: 'Flame',
  mechanics: [],
};

function createTestVfx(partial: Partial<VfxConfig> & { id: string; shapeId: string; color: string }): VfxConfig {
  return {
    particleCount: 10,
    size: 14,
    speed: 5,
    lifetimeMs: 300,
    spreadAngle: 360,
    glow: true,
    glowBlur: 8,
    opacity: 1,
    ...partial,
  };
}

describe('mechanicSimulator', () => {
  it('simulateProjectile emits origin cast and in-flight trajectory particles', () => {
    const emitted: Particle[] = [];
    const context: MechanicSimulationContext = {
      spell: dummySpell,
      mechanic: {
        id: 'm1',
        type: 'projectile',
        name: 'Firebolt',
        durationMs: 300,
        params: {},
        triggers: {
          onCast: {
            vfx: [
              createTestVfx({
                id: 'v1',
                shapeId: 'sparkle',
                color: '#ffaa00',
                particleCount: 5,
                size: 10,
                lifetimeMs: 200,
              }),
            ],
            spawnMechanicIds: [],
          },
        },
      },
      origin: { x: 100, y: 100 },
      destination: { x: 400, y: 100 },
      emit: (p) => emitted.push(...p),
    };

    simulateProjectile(context);
    expect(emitted.length).toBeGreaterThan(5);
  });

  it('simulateBeam emits dense line particles connecting origin and destination', () => {
    const emitted: Particle[] = [];
    const context: MechanicSimulationContext = {
      spell: dummySpell,
      mechanic: {
        id: 'm2',
        type: 'beam',
        name: 'Lightning Ray',
        durationMs: 200,
        params: {},
        triggers: {},
      },
      origin: { x: 50, y: 50 },
      destination: { x: 350, y: 50 },
      emit: (p) => emitted.push(...p),
    };

    simulateBeam(context);
    expect(emitted.length).toBeGreaterThanOrEqual(12);
  });

  it('simulateCone emits particles in target directional wedge', () => {
    const emitted: Particle[] = [];
    const context: MechanicSimulationContext = {
      spell: dummySpell,
      mechanic: {
        id: 'm3',
        type: 'cone',
        name: 'Burning Hands',
        durationMs: 400,
        params: { angleDegrees: 60 },
        triggers: {
          onCast: {
            vfx: [
              createTestVfx({
                id: 'v2',
                shapeId: 'flame',
                color: '#ff4400',
                particleCount: 15,
                size: 14,
                lifetimeMs: 300,
              }),
            ],
            spawnMechanicIds: [],
          },
        },
      },
      origin: { x: 200, y: 200 },
      destination: { x: 500, y: 200 },
      emit: (p) => emitted.push(...p),
    };

    simulateCone(context);
    expect(emitted.length).toBe(15);
  });

  it('simulateBurst emits particles around center', () => {
    const emitted: Particle[] = [];
    const context: MechanicSimulationContext = {
      spell: dummySpell,
      mechanic: {
        id: 'm4',
        type: 'burst',
        name: 'Explosion',
        durationMs: 500,
        params: {},
        triggers: {
          onCast: {
            vfx: [
              createTestVfx({
                id: 'v3',
                shapeId: 'star',
                color: '#ffff00',
                particleCount: 10,
                size: 12,
                lifetimeMs: 400,
              }),
            ],
            spawnMechanicIds: [],
          },
        },
      },
      origin: { x: 100, y: 100 },
      emit: (p) => emitted.push(...p),
    };

    simulateBurst(context);
    expect(emitted.length).toBe(10);
  });

  it('simulateAura emits ring particles around center', () => {
    const emitted: Particle[] = [];
    const context: MechanicSimulationContext = {
      spell: dummySpell,
      mechanic: {
        id: 'm5',
        type: 'aura',
        name: 'Healing Ring',
        durationMs: 1000,
        params: { radius: 100 },
        triggers: {},
      },
      origin: { x: 150, y: 150 },
      emit: (p) => emitted.push(...p),
    };

    simulateAura(context);
    expect(emitted.length).toBe(20);
  });

  it('simulateMechanic routes cleanly based on mechanic type', () => {
    const emitted: Particle[] = [];
    simulateMechanic({
      spell: dummySpell,
      mechanic: {
        id: 'm6',
        type: 'burst',
        name: 'Burst Mech',
        durationMs: 300,
        params: {},
        triggers: {
          onCast: {
            vfx: [
              createTestVfx({
                id: 'v4',
                shapeId: 'circle',
                color: '#fff',
                particleCount: 8,
                size: 8,
                lifetimeMs: 200,
              }),
            ],
            spawnMechanicIds: [],
          },
        },
      },
      origin: { x: 0, y: 0 },
      emit: (p) => emitted.push(...p),
    });

    expect(emitted.length).toBe(8);
  });
});
