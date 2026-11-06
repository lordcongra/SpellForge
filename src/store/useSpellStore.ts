import { create } from 'zustand';
import OBR from '@owlbear-rodeo/sdk';
import type {
  SpellDefinition,
  Point2D,
  CastPayload,
} from '@/types/spellSchema';
import { validateSpellDefinition } from '@/types/spellSchema';
import {
  updateParticles,
  type Particle,
} from '@/core/engine/particlePhysics';
import { simulateMechanic } from '@/core/engine/mechanicSimulator';
import { renderObrSceneCast } from '@/core/engine/obrSceneRenderer';
import { DEFAULT_PRESET_SPELLS } from './defaultSpells';

export interface ActiveCastTimeline {
  id: string;
  spell: SpellDefinition;
  origin: Point2D;
  destination?: Point2D;
  startedAt: number;
  durationMs: number;
  progress: number;
  isComplete: boolean;
}

export interface SpellStoreState {
  spells: SpellDefinition[];
  activeSpell: SpellDefinition | null;
  activeTimelines: ActiveCastTimeline[];
  activeParticles: Particle[];
  originSpot: Point2D | null;
  targetSpots: Point2D[];

  // Spell Library Actions
  setSpells: (spells: SpellDefinition[]) => void;
  setActiveSpell: (spell: SpellDefinition | null) => void;
  saveSpell: (spell: SpellDefinition) => void;
  deleteSpell: (spellId: string) => void;

  // Targeting Actions
  setOriginSpot: (spot: Point2D | null) => void;
  setTargetSpots: (spots: Point2D[]) => void;
  addTargetSpot: (spot: Point2D) => void;
  removeTargetSpot: (index: number) => void;
  clearTargetSpots: () => void;

  // Casting & Particle Simulation
  castSpell: (
    spell: SpellDefinition,
    origin?: Point2D,
    destination?: Point2D
  ) => Promise<CastPayload>;
  handleCastBroadcast: (payload: CastPayload) => void;
  spawnParticles: (particles: Particle[]) => void;
  updateParticlesTick: (deltaMs: number) => void;
  clearParticles: () => void;
  clearTimelines: () => void;
}

export { DEFAULT_PRESET_SPELLS };

const STORAGE_KEY = 'spellforge_saved_spells';

function loadInitialSpells(): SpellDefinition[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_PRESET_SPELLS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PRESET_SPELLS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const valid = parsed.filter((s) => validateSpellDefinition(s).success);
      return valid.length > 0 ? valid : DEFAULT_PRESET_SPELLS;
    }
  } catch (err) {
    console.error('[SpellStorage] Failed to load spells from localStorage', err);
  }
  return DEFAULT_PRESET_SPELLS;
}

function persistSpells(spells: SpellDefinition[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(spells));
    }
  } catch (err) {
    console.error('[SpellStorage] Failed to save spells to localStorage', err);
  }
}

/**
 * Dispatches ephemeral particles for a spell based on mechanic trigger hooks.
 */
export function dispatchSpellParticles(
  spell: SpellDefinition,
  origin: Point2D,
  destination: Point2D | undefined,
  emitter: (particles: Particle[]) => void,
  allTargets?: Point2D[]
): void {
  for (const mech of spell.mechanics) {
    simulateMechanic({
      spell,
      mechanic: mech,
      origin,
      destination,
      allTargets,
      emit: emitter,
    });
  }
}

export const useSpellStore = create<SpellStoreState>((set, get) => ({
  spells: loadInitialSpells(),
  activeSpell: null,
  activeTimelines: [],
  activeParticles: [],
  originSpot: { x: 300, y: 300 },
  targetSpots: [],

  setSpells: (spells) => {
    persistSpells(spells);
    set({ spells });
  },

  setActiveSpell: (spell) => {
    set({ activeSpell: spell });
  },

  saveSpell: (spell) => {
    set((state) => {
      const exists = state.spells.some((s) => s.id === spell.id);
      const updated = exists
        ? state.spells.map((s) => (s.id === spell.id ? spell : s))
        : [...state.spells, spell];
      persistSpells(updated);
      return { spells: updated, activeSpell: spell };
    });
  },

  deleteSpell: (spellId) => {
    set((state) => {
      const updated = state.spells.filter((s) => s.id !== spellId);
      persistSpells(updated);
      return {
        spells: updated,
        activeSpell: state.activeSpell?.id === spellId ? null : state.activeSpell,
      };
    });
  },

  setOriginSpot: (spot) => {
    set({ originSpot: spot });
  },

  setTargetSpots: (spots) => {
    set({ targetSpots: spots });
  },

  addTargetSpot: (spot) => {
    set((state) => ({ targetSpots: [...state.targetSpots, spot] }));
  },

  removeTargetSpot: (index) => {
    set((state) => ({
      targetSpots: state.targetSpots.filter((_, i) => i !== index),
    }));
  },

  clearTargetSpots: () => {
    set({ targetSpots: [] });
  },

  castSpell: async (spell, origin, destination) => {
    const originPoint = origin ?? get().originSpot ?? { x: 300, y: 300 };
    const targets = destination
      ? [destination]
      : get().targetSpots.length > 0
        ? get().targetSpots
        : [undefined];

    let lastPayload: CastPayload | null = null;
    const maxDuration = spell.mechanics.reduce(
      (max, m) => Math.max(max, m.durationMs),
      0
    );

    const isObrReady =
      typeof OBR !== 'undefined' &&
      Boolean(OBR?.isAvailable);

    for (const target of targets) {
      const castId = `cast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const payload: CastPayload = {
        castId,
        spell,
        origin: originPoint,
        destination: target,
        targetTokenIds: [],
        pathPoints: target ? [originPoint, target] : [originPoint],
        timestamp: Date.now(),
      };

      lastPayload = payload;

      // Dispatch local VFX particles
      dispatchSpellParticles(
        spell,
        originPoint,
        target,
        get().spawnParticles,
        get().targetSpots
      );

      // Track active timeline
      const timeline: ActiveCastTimeline = {
        id: castId,
        spell,
        origin: originPoint,
        destination: target,
        startedAt: Date.now(),
        durationMs: maxDuration,
        progress: 0,
        isComplete: false,
      };

      set((state) => ({ activeTimelines: [...state.activeTimelines, timeline] }));

      // Safe OBR Broadcast and Scene Render
      if (isObrReady) {
        try {
          renderObrSceneCast(payload).catch(() => {});
          await OBR.broadcast.sendMessage('spellforge/cast', payload);
        } catch (err) {
          console.error('[SpellForge] Failed to broadcast spell cast:', err);
        }
      }
    }

    return lastPayload as CastPayload;
  },

  handleCastBroadcast: (payload) => {
    dispatchSpellParticles(
      payload.spell,
      payload.origin,
      payload.destination,
      get().spawnParticles,
      payload.destination ? [payload.destination] : undefined
    );
    renderObrSceneCast(payload).catch(() => {});
  },

  spawnParticles: (particles) => {
    if (particles.length === 0) return;
    set((state) => ({
      activeParticles: [...state.activeParticles, ...particles],
    }));
  },

  updateParticlesTick: (deltaMs) => {
    const currentParticles = get().activeParticles;
    const currentTimelines = get().activeTimelines;

    const hasParticles = currentParticles.length > 0;
    const hasTimelines = currentTimelines.length > 0;

    if (!hasParticles && !hasTimelines) return;

    let nextParticles = currentParticles;
    if (hasParticles) {
      nextParticles = updateParticles(currentParticles, deltaMs);
    }

    let nextTimelines = currentTimelines;
    if (hasTimelines) {
      const now = Date.now();
      nextTimelines = currentTimelines
        .map((tl) => {
          const elapsed = now - tl.startedAt;
          const progress = tl.durationMs > 0 ? Math.min(1, elapsed / tl.durationMs) : 1;
          return {
            ...tl,
            progress,
            isComplete: progress >= 1,
          };
        })
        .filter((tl) => !tl.isComplete);
    }

    set({
      activeParticles: nextParticles,
      activeTimelines: nextTimelines,
    });
  },

  clearParticles: () => {
    set({ activeParticles: [] });
  },

  clearTimelines: () => {
    set({ activeTimelines: [] });
  },
}));
