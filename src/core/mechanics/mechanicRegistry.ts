import type { MechanicType, TriggerHook } from '@/types/spellSchema';
import type { MechanicCategory, MechanicDefinition } from './mechanicTypes';

function generateMechanicId(type: MechanicType, prefix = 'mech'): string {
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${type}-${randomSuffix}`;
}

export const builtInMechanics: MechanicDefinition[] = [
  {
    id: 'projectile',
    label: 'Projectile',
    description:
      'Moves a concentrated payload or visual projectile from origin to target with optional parabolic arc.',
    category: 'motion',
    supportedHooks: ['onCast', 'inFlight', 'onImpact'],
    defaultDurationMs: 400,
    defaultParams: { speed: 600, arcHeight: 0 },
    createDefaultConfig(prefix) {
      return {
        id: generateMechanicId('projectile', prefix),
        type: 'projectile',
        name: 'Projectile',
        durationMs: 400,
        params: { speed: 600, arcHeight: 0 },
        triggers: {},
      };
    },
  },
  {
    id: 'beam',
    label: 'Beam',
    description: 'Instant flash ray or sustained energy beam connecting origin to target.',
    category: 'direct',
    supportedHooks: ['onCast', 'inFlight', 'onImpact'],
    defaultDurationMs: 300,
    defaultParams: { beamWidth: 12, isSustained: false },
    createDefaultConfig(prefix) {
      return {
        id: generateMechanicId('beam', prefix),
        type: 'beam',
        name: 'Beam',
        durationMs: 300,
        params: { beamWidth: 12, isSustained: false },
        triggers: {},
      };
    },
  },
  {
    id: 'burst',
    label: 'Burst',
    description: 'Radial visual blast expanding outward from an impact coordinate.',
    category: 'area',
    supportedHooks: ['onCast', 'onImpact'],
    defaultDurationMs: 500,
    defaultParams: { radius: 150, ringCount: 1 },
    createDefaultConfig(prefix) {
      return {
        id: generateMechanicId('burst', prefix),
        type: 'burst',
        name: 'Burst',
        durationMs: 500,
        params: { radius: 150, ringCount: 1 },
        triggers: {},
      };
    },
  },
  {
    id: 'cone',
    label: 'Cone',
    description: 'Directional sector spread outward from caster at standard 53° or custom angle.',
    category: 'area',
    supportedHooks: ['onCast', 'onImpact'],
    defaultDurationMs: 450,
    defaultParams: { angleDegrees: 53, range: 200 },
    createDefaultConfig(prefix) {
      return {
        id: generateMechanicId('cone', prefix),
        type: 'cone',
        name: 'Cone',
        durationMs: 450,
        params: { angleDegrees: 53, range: 200 },
        triggers: {},
      };
    },
  },
  {
    id: 'chain',
    label: 'Chain',
    description: 'Sequenced leaping hops across multiple target coordinates with interval delays.',
    category: 'direct',
    supportedHooks: ['onCast', 'inFlight', 'onImpact'],
    defaultDurationMs: 600,
    defaultParams: { maxHops: 3, hopDelayMs: 150, rangePerHop: 250 },
    createDefaultConfig(prefix) {
      return {
        id: generateMechanicId('chain', prefix),
        type: 'chain',
        name: 'Chain',
        durationMs: 600,
        params: { maxHops: 3, hopDelayMs: 150, rangePerHop: 250 },
        triggers: {},
      };
    },
  },
  {
    id: 'aura',
    label: 'Aura',
    description: 'Persistent circular zone on ground or anchored to a token firing periodic pulses.',
    category: 'area',
    supportedHooks: ['onCast', 'onInterval', 'onImpact'],
    defaultDurationMs: 3000,
    defaultParams: { radius: 120, intervalMs: 1000, tickCount: 3, anchorToToken: true },
    createDefaultConfig(prefix) {
      return {
        id: generateMechanicId('aura', prefix),
        type: 'aura',
        name: 'Aura',
        durationMs: 3000,
        params: { radius: 120, intervalMs: 1000, tickCount: 3, anchorToToken: true },
        triggers: {},
      };
    },
  },
  {
    id: 'tokenSlide',
    label: 'Token Slide',
    description: 'Smoothly slides token coordinates from origin to destination with easing.',
    category: 'token',
    supportedHooks: ['onCast', 'inFlight', 'onImpact'],
    defaultDurationMs: 500,
    defaultParams: { easing: 'easeOut' },
    createDefaultConfig(prefix) {
      return {
        id: generateMechanicId('tokenSlide', prefix),
        type: 'tokenSlide',
        name: 'Token Slide',
        durationMs: 500,
        params: { easing: 'easeOut' },
        triggers: {},
      };
    },
  },
  {
    id: 'tokenTeleport',
    label: 'Token Teleport',
    description: 'Instantly updates token coordinates with departure and arrival burst hooks.',
    category: 'token',
    supportedHooks: ['onCast', 'onTeleportDeparture', 'onTeleportArrival'],
    defaultDurationMs: 350,
    defaultParams: { departureDelayMs: 100 },
    createDefaultConfig(prefix) {
      return {
        id: generateMechanicId('tokenTeleport', prefix),
        type: 'tokenTeleport',
        name: 'Token Teleport',
        durationMs: 350,
        params: { departureDelayMs: 100 },
        triggers: {},
      };
    },
  },
];

/**
 * Registry storing all spell behavior mechanics available in SpellForge.
 */
export class MechanicRegistry {
  private mechanics = new Map<MechanicType, MechanicDefinition>();

  constructor(autoSeed = true) {
    if (autoSeed) {
      this.resetToDefaults();
    }
  }

  /**
   * Registers a mechanic definition.
   */
  public register(mechanic: MechanicDefinition): void {
    if (!mechanic.id) {
      throw new Error('[MechanicRegistry] Mechanic definition must have a valid id');
    }
    this.mechanics.set(mechanic.id, mechanic);
  }

  /**
   * Retrieves a mechanic by ID.
   */
  public get(id: MechanicType): MechanicDefinition | undefined {
    return this.mechanics.get(id);
  }

  /**
   * Checks if a mechanic ID is registered.
   */
  public has(id: MechanicType): boolean {
    return this.mechanics.has(id);
  }

  /**
   * Returns all registered mechanics.
   */
  public getAll(): MechanicDefinition[] {
    return Array.from(this.mechanics.values());
  }

  /**
   * Returns mechanics filtered by category.
   */
  public getByCategory(category: MechanicCategory): MechanicDefinition[] {
    return this.getAll().filter((m) => m.category === category);
  }

  /**
   * Checks whether a specific trigger hook is supported by a given mechanic type.
   */
  public supportsHook(type: MechanicType, hook: TriggerHook): boolean {
    const def = this.get(type);
    return def ? def.supportedHooks.includes(hook) : false;
  }

  /**
   * Resets registry to built-in mechanics.
   */
  public resetToDefaults(): void {
    this.mechanics.clear();
    for (const mechanic of builtInMechanics) {
      this.mechanics.set(mechanic.id, mechanic);
    }
  }
}

/**
 * Singleton instance of MechanicRegistry.
 */
export const mechanicRegistry = new MechanicRegistry();

/**
 * Standalone helper to register a custom mechanic.
 */
export function registerMechanic(mechanic: MechanicDefinition): void {
  mechanicRegistry.register(mechanic);
}
