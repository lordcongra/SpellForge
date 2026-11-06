import { describe, it, expect } from 'vitest';
import {
  SpellDefinitionSchema,
  CastPayloadSchema,
  validateSpellDefinition,
  validateCastPayload,
  type SpellDefinition,
} from './spellSchema';

describe('spellSchema', () => {
  const sampleSpell: SpellDefinition = {
    id: 'fireball-01',
    name: 'Fireball',
    description: 'A bright streak flashes from pointing finger into an explosion.',
    category: 'elemental',
    castRange: 600,
    cooldownMs: 1000,
    icon: 'Flame',
    mechanics: [
      {
        id: 'mech-proj-1',
        type: 'projectile',
        name: 'Fire Orb',
        durationMs: 400,
        params: { speed: 800, arcHeight: 40 },
        triggers: {
          onCast: {
            vfx: [
              {
                id: 'vfx-cast-sparkle',
                shapeId: 'sparkle',
                color: '#ffaa00',
                particleCount: 15,
                size: 14,
                speed: 4,
                lifetimeMs: 400,
                spreadAngle: 360,
                glow: true,
                glowBlur: 6,
                opacity: 1,
              },
            ],
            spawnMechanicIds: [],
          },
          inFlight: {
            vfx: [
              {
                id: 'vfx-trail-flame',
                shapeId: 'flame',
                color: '#ff4400',
                particleCount: 8,
                size: 10,
                speed: 2,
                lifetimeMs: 300,
                spreadAngle: 45,
                glow: true,
                glowBlur: 8,
                opacity: 0.8,
              },
            ],
            spawnMechanicIds: [],
          },
          onImpact: {
            vfx: [
              {
                id: 'vfx-burst-star',
                shapeId: 'star',
                color: '#ff2200',
                particleCount: 40,
                size: 24,
                speed: 10,
                lifetimeMs: 700,
                spreadAngle: 360,
                glow: true,
                glowBlur: 12,
                opacity: 1,
              },
            ],
            spawnMechanicIds: ['mech-burst-1'],
          },
        },
      },
    ],
  };

  it('validates a correct spell definition schema', () => {
    const parsed = SpellDefinitionSchema.parse(sampleSpell);
    expect(parsed.id).toBe('fireball-01');
    expect(parsed.mechanics).toHaveLength(1);
    expect(parsed.mechanics[0].triggers?.onImpact?.vfx).toHaveLength(1);
  });

  it('provides safe validation wrapper with validateSpellDefinition', () => {
    const result = validateSpellDefinition(sampleSpell);
    expect(result.success).toBe(true);
    expect(result.spell?.name).toBe('Fireball');

    const invalid = validateSpellDefinition({ id: 'bad' });
    expect(invalid.success).toBe(false);
    expect(invalid.error).toBeDefined();
  });

  it('validates a broadcast cast payload', () => {
    const payload = {
      castId: 'cast-uuid-1234',
      spell: sampleSpell,
      casterTokenId: 'token-caster-1',
      targetTokenIds: ['token-target-2'],
      origin: { x: 100, y: 150 },
      destination: { x: 450, y: 300 },
      pathPoints: [],
      timestamp: 1700000000000,
    };

    const parsed = CastPayloadSchema.parse(payload);
    expect(parsed.castId).toBe('cast-uuid-1234');
    expect(parsed.origin.x).toBe(100);

    const safeRes = validateCastPayload(payload);
    expect(safeRes.success).toBe(true);
    expect(safeRes.payload?.castId).toBe('cast-uuid-1234');
  });

  it('rejects invalid cast payload', () => {
    const badPayload = { castId: 'test' };
    const res = validateCastPayload(badPayload);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});

