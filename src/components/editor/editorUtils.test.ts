import { describe, it, expect } from 'vitest';
import {
  THEME_PALETTES,
  updateAllVfxColor,
  updateAllVfxSize,
  updateAllVfxGlow,
  createDefaultVfx,
} from './editorUtils';
import type { MechanicConfig } from '@/types/spellSchema';

describe('editorUtils', () => {
  it('has 6 theme palettes', () => {
    expect(THEME_PALETTES).toHaveLength(6);
    expect(THEME_PALETTES.map((p) => p.id)).toEqual([
      'fire',
      'frost',
      'arcane',
      'radiant',
      'necrotic',
      'lightning',
    ]);
  });

  it('updates color across all triggers', () => {
    const config: MechanicConfig = {
      id: 'm1',
      type: 'projectile',
      durationMs: 400,
      params: {},
      triggers: {
        onCast: { vfx: [createDefaultVfx('circle', '#000000')], spawnMechanicIds: [] },
      },
    };

    const updated = updateAllVfxColor(config, '#ff5500');
    expect(updated.triggers?.onCast?.vfx?.[0].color).toBe('#ff5500');
  });

  it('updates particle size across triggers', () => {
    const config: MechanicConfig = {
      id: 'm1',
      type: 'burst',
      durationMs: 400,
      params: {},
      triggers: {
        onCast: { vfx: [createDefaultVfx('star', '#ff5500')], spawnMechanicIds: [] },
      },
    };

    const updated = updateAllVfxSize(config, 32);
    expect(updated.triggers?.onCast?.vfx?.[0].size).toBe(32);
  });

  it('updates glow and glow blur across triggers', () => {
    const config: MechanicConfig = {
      id: 'm1',
      type: 'beam',
      durationMs: 400,
      params: {},
      triggers: {
        onCast: { vfx: [createDefaultVfx('sparkle', '#38bdf8')], spawnMechanicIds: [] },
      },
    };

    const updated = updateAllVfxGlow(config, false, 0);
    expect(updated.triggers?.onCast?.vfx?.[0].glow).toBe(false);
    expect(updated.triggers?.onCast?.vfx?.[0].glowBlur).toBe(0);
  });
});

