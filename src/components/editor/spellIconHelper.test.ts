import { describe, it, expect } from 'vitest';
import { getSpellIconComponent, SPELL_ICONS } from './spellIconHelper';
import { Sparkles, Flame, Zap } from 'lucide-react';

describe('spellIconHelper', () => {
  it('returns Sparkles as default when icon name is undefined or empty', () => {
    expect(getSpellIconComponent()).toBe(Sparkles);
    expect(getSpellIconComponent('')).toBe(Sparkles);
  });

  it('returns correct Lucide icon for registered icon names', () => {
    expect(getSpellIconComponent('Flame')).toBe(Flame);
    expect(getSpellIconComponent('Zap')).toBe(Zap);
    expect(getSpellIconComponent('Sparkles')).toBe(Sparkles);
  });

  it('falls back to Sparkles for unknown icon name', () => {
    expect(getSpellIconComponent('NonExistentIcon')).toBe(Sparkles);
  });

  it('contains expected icon entries in SPELL_ICONS mapping', () => {
    expect(Object.keys(SPELL_ICONS)).toContain('Flame');
    expect(Object.keys(SPELL_ICONS)).toContain('Sparkles');
    expect(Object.keys(SPELL_ICONS)).toContain('Shield');
    expect(Object.keys(SPELL_ICONS)).toContain('Wand2');
  });
});

