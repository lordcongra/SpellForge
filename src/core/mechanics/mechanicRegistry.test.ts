import { describe, it, expect, beforeEach } from 'vitest';
import { MechanicRegistry, mechanicRegistry, registerMechanic } from './mechanicRegistry';
import type { MechanicDefinition } from './mechanicTypes';

describe('MechanicRegistry', () => {
  let registry: MechanicRegistry;

  beforeEach(() => {
    registry = new MechanicRegistry();
  });

  it('initializes with all 8 core mechanics', () => {
    const all = registry.getAll();
    expect(all.length).toBe(8);

    const ids = all.map((m) => m.id);
    expect(ids).toContain('projectile');
    expect(ids).toContain('beam');
    expect(ids).toContain('burst');
    expect(ids).toContain('cone');
    expect(ids).toContain('chain');
    expect(ids).toContain('aura');
    expect(ids).toContain('tokenSlide');
    expect(ids).toContain('tokenTeleport');
  });

  it('retrieves specific mechanic by id', () => {
    const beam = registry.get('beam');
    expect(beam).toBeDefined();
    expect(beam?.label).toBe('Beam');
    expect(beam?.category).toBe('direct');
    expect(beam?.supportedHooks).toContain('inFlight');
  });

  it('verifies supported hooks per mechanic', () => {
    expect(registry.supportsHook('tokenTeleport', 'onTeleportArrival')).toBe(true);
    expect(registry.supportsHook('tokenTeleport', 'inFlight')).toBe(false);

    expect(registry.supportsHook('projectile', 'inFlight')).toBe(true);
    expect(registry.supportsHook('aura', 'onInterval')).toBe(true);
  });

  it('filters mechanics by category', () => {
    const tokenMechs = registry.getByCategory('token');
    const ids = tokenMechs.map((m) => m.id);
    expect(ids).toContain('tokenSlide');
    expect(ids).toContain('tokenTeleport');

    const areaMechs = registry.getByCategory('area');
    const areaIds = areaMechs.map((m) => m.id);
    expect(areaIds).toContain('burst');
    expect(areaIds).toContain('cone');
    expect(areaIds).toContain('aura');
  });

  it('creates valid default config using createDefaultConfig', () => {
    const proj = registry.get('projectile');
    expect(proj).toBeDefined();
    const config = proj!.createDefaultConfig('test');
    expect(config.id.startsWith('test-projectile-')).toBe(true);
    expect(config.type).toBe('projectile');
    expect(config.durationMs).toBe(400);
    expect(config.params).toEqual({ speed: 600, arcHeight: 0 });
  });

  it('allows registering and querying custom mechanics', () => {
    const custom: MechanicDefinition = {
      id: 'projectile', // Replaces or custom
      label: 'Custom Homing Missile',
      description: 'Homing projectile tracking target',
      category: 'motion',
      supportedHooks: ['onCast', 'inFlight', 'onImpact'],
      defaultDurationMs: 800,
      defaultParams: { homingTurnRate: 15 },
      createDefaultConfig(prefix) {
        return {
          id: `${prefix ?? 'mech'}-homing`,
          type: 'projectile',
          name: 'Custom Homing',
          durationMs: 800,
          params: { homingTurnRate: 15 },
          triggers: {},
        };
      },
    };

    registry.register(custom);
    expect(registry.get('projectile')?.label).toBe('Custom Homing Missile');

    registry.resetToDefaults();
    expect(registry.get('projectile')?.label).toBe('Projectile');
  });

  it('registerMechanic registers into singleton', () => {
    const dummy: MechanicDefinition = {
      id: 'chain',
      label: 'Singleton Chain',
      description: 'Test singleton registration',
      category: 'direct',
      supportedHooks: ['onImpact'],
      defaultDurationMs: 500,
      defaultParams: {},
      createDefaultConfig: (prefix) => ({
        id: `${prefix ?? 'm'}-chain`,
        type: 'chain',
        durationMs: 500,
        params: {},
        triggers: {},
      }),
    };
    registerMechanic(dummy);
    expect(mechanicRegistry.get('chain')?.label).toBe('Singleton Chain');
    mechanicRegistry.resetToDefaults();
  });
});
