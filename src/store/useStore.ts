import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RootStore } from "./storeTypes";

export const useStore = create<RootStore>()(
  persist(
    (set) => ({
      // Identity Slice
      userId: null,
      userRole: null,
      setIdentity: (userId, userRole) => set({ userId, userRole }),

      // Spell Slice
      availableSpells: [
        {
          spellIdentifier: "line-ray",
          spellName: "Straight Line Ray",
          spellColorHex: "#ff3366",
          durationInMs: 2000,
          shapePrimitive: "LINE",
          animationBehavior: "TRAVEL_BEAM",
          targetLogic: "CASTER_TO_TARGETS_SIMULTANEOUS",
        },
        {
          spellIdentifier: "token-burst",
          spellName: "Token Shape Burst",
          spellColorHex: "#33ccff",
          durationInMs: 3000,
          shapePrimitive: "CIRCLE",
          animationBehavior: "EXPAND_OUTWARD",
          targetLogic: "ALL_SIMULTANEOUS",
        },
      ],
      activeSpellIdentifier: null,
      targetPositions: [],
      configuredColorHex: "#3498db",
      configuredSize: 2,
      configuredDurationMs: 2000,
      keepTargetsAfterCast: false,

      setActiveSpell: (activeSpellIdentifier) => {
        set((state) => {
          const spell = state.availableSpells.find(
            (s) => s.spellIdentifier === activeSpellIdentifier
          );
          return {
            activeSpellIdentifier,
            configuredColorHex: spell ? spell.spellColorHex : state.configuredColorHex,
            configuredDurationMs: spell ? spell.durationInMs : state.configuredDurationMs,
          };
        });
      },

      addTargetPosition: (targetCoordinate) =>
        set((state) => ({ targetPositions: [...state.targetPositions, targetCoordinate] })),

      removeTargetPosition: (targetIdentifier) =>
        set((state) => ({
          targetPositions: state.targetPositions.filter(
            (target) => target.targetIdentifier !== targetIdentifier
          ),
        })),

      clearTargetPositions: () => set({ targetPositions: [] }),
      setConfiguredColorHex: (colorHex) => set({ configuredColorHex: colorHex }),
      setConfiguredSize: (size) => set({ configuredSize: size }),
      setConfiguredDurationMs: (durationMs) => set({ configuredDurationMs: durationMs }),
      setKeepTargetsAfterCast: (shouldKeep) => set({ keepTargetsAfterCast: shouldKeep }),

      // Spellbook Management
      saveSpell: (newSpell) =>
        set((state) => {
          const exists = state.availableSpells.some(
            (s) => s.spellIdentifier === newSpell.spellIdentifier
          );
          if (exists) {
            return {
              availableSpells: state.availableSpells.map((s) =>
                s.spellIdentifier === newSpell.spellIdentifier ? newSpell : s
              ),
            };
          }
          return { availableSpells: [...state.availableSpells, newSpell] };
        }),

      deleteSpell: (spellIdentifier) =>
        set((state) => ({
          availableSpells: state.availableSpells.filter(
            (s) => s.spellIdentifier !== spellIdentifier
          ),
          activeSpellIdentifier:
            state.activeSpellIdentifier === spellIdentifier ? null : state.activeSpellIdentifier,
        })),

      importSpells: (spells) =>
        set((state) => {
          // Merge imported spells, preventing exact ID duplicates
          const currentIds = new Set(state.availableSpells.map((s) => s.spellIdentifier));
          const newSpells = spells.filter((s) => !currentIds.has(s.spellIdentifier));
          return { availableSpells: [...state.availableSpells, ...newSpells] };
        }),

      // Particle Slice
      activeEmitters: [],
      addParticleEmitters: (emitterConfigurations) =>
        set((state) => ({
          activeEmitters: [...state.activeEmitters, ...emitterConfigurations],
        })),
      removeParticleEmitter: (emitterIdentifier) =>
        set((state) => ({
          activeEmitters: state.activeEmitters.filter(
            (emitter) => emitter.emitterIdentifier !== emitterIdentifier
          ),
        })),

      // Sync Slice
      isActivelySyncing: false,
      setSyncStatus: (isActivelySyncing) => set({ isActivelySyncing }),
    }),
    {
      name: "spellforge-storage",
      partialize: (state) => ({
        availableSpells: state.availableSpells,
        configuredColorHex: state.configuredColorHex,
        configuredSize: state.configuredSize,
        configuredDurationMs: state.configuredDurationMs,
        keepTargetsAfterCast: state.keepTargetsAfterCast,
      }),
    }
  )
);
