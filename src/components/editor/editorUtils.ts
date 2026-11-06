import type { MechanicConfig, VfxConfig, StandardShapeId } from '@/types/spellSchema';

export interface ThemePalette {
  id: string;
  label: string;
  color: string;
  description: string;
}

export const THEME_PALETTES: ThemePalette[] = [
  { id: 'fire', label: 'Fire', color: '#ff5500', description: 'Blazing inferno flame' },
  { id: 'frost', label: 'Frost', color: '#00d4ff', description: 'Frigid crystalline ice' },
  { id: 'arcane', label: 'Arcane', color: '#a855f7', description: 'Mystic eldritch energy' },
  { id: 'radiant', label: 'Radiant', color: '#facc15', description: 'Holy solar brilliance' },
  { id: 'necrotic', label: 'Necrotic', color: '#22c55e', description: 'Toxic withered plague' },
  { id: 'lightning', label: 'Lightning', color: '#38bdf8', description: 'Crackling electric storm' },
];

export type DeliveryMode = 'self' | 'single' | 'multi' | 'chain';

export const DELIVERY_MODES: { id: DeliveryMode; label: string; desc: string }[] = [
  { id: 'self', label: 'Self / Caster Only', desc: 'Emits centered on the caster' },
  { id: 'single', label: 'Single Target', desc: 'Aimed at one focal target' },
  { id: 'multi', label: 'Multi-Target', desc: 'Spreads across multiple map targets' },
  { id: 'chain', label: 'Chain Arc', desc: 'Leaps consecutively between targets' },
];

/**
 * Creates a default VFX configuration.
 */
export function createDefaultVfx(shapeId: StandardShapeId = 'sparkle', color = '#a855f7'): VfxConfig {
  return {
    id: `vfx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    shapeId,
    color,
    particleCount: 20,
    size: 16,
    speed: 5,
    lifetimeMs: 600,
    spreadAngle: 360,
    glow: true,
    glowBlur: 10,
    opacity: 1,
  };
}

/**
 * Updates color across all VFX triggers on a mechanic.
 */
export function updateAllVfxColor(mechanic: MechanicConfig, color: string): MechanicConfig {
  const triggers = { ...(mechanic.triggers ?? {}) };

  const updateList = (list?: VfxConfig[]) =>
    list ? list.map((v) => ({ ...v, color })) : [createDefaultVfx('sparkle', color)];

  triggers.onCast = {
    vfx: updateList(triggers.onCast?.vfx),
    spawnMechanicIds: triggers.onCast?.spawnMechanicIds ?? [],
  };
  triggers.inFlight = {
    vfx: updateList(triggers.inFlight?.vfx),
    spawnMechanicIds: triggers.inFlight?.spawnMechanicIds ?? [],
  };
  triggers.onImpact = {
    vfx: updateList(triggers.onImpact?.vfx),
    spawnMechanicIds: triggers.onImpact?.spawnMechanicIds ?? [],
  };

  return { ...mechanic, triggers };
}

/**
 * Updates particle size across all VFX triggers on a mechanic.
 */
export function updateAllVfxSize(mechanic: MechanicConfig, size: number): MechanicConfig {
  const triggers = { ...(mechanic.triggers ?? {}) };
  const updateList = (list?: VfxConfig[]) =>
    list ? list.map((v) => ({ ...v, size })) : [];

  if (triggers.onCast?.vfx) triggers.onCast = { ...triggers.onCast, vfx: updateList(triggers.onCast.vfx) };
  if (triggers.inFlight?.vfx) triggers.inFlight = { ...triggers.inFlight, vfx: updateList(triggers.inFlight.vfx) };
  if (triggers.onImpact?.vfx) triggers.onImpact = { ...triggers.onImpact, vfx: updateList(triggers.onImpact.vfx) };

  return { ...mechanic, triggers };
}

/**
 * Updates glow across all VFX triggers on a mechanic.
 */
export function updateAllVfxGlow(mechanic: MechanicConfig, glow: boolean, glowBlur = 10): MechanicConfig {
  const triggers = { ...(mechanic.triggers ?? {}) };
  const updateList = (list?: VfxConfig[]) =>
    list ? list.map((v) => ({ ...v, glow, glowBlur })) : [];

  if (triggers.onCast?.vfx) triggers.onCast = { ...triggers.onCast, vfx: updateList(triggers.onCast.vfx) };
  if (triggers.inFlight?.vfx) triggers.inFlight = { ...triggers.inFlight, vfx: updateList(triggers.inFlight.vfx) };
  if (triggers.onImpact?.vfx) triggers.onImpact = { ...triggers.onImpact, vfx: updateList(triggers.onImpact.vfx) };

  return { ...mechanic, triggers };
}

