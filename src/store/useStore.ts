import { create } from "zustand";
import type { RootStore } from "./storeTypes";

export const useStore = create<RootStore>((set) => ({
  // Identity Slice
  userId: null,
  userRole: null,
  primaryTargetPosition: null,
  setIdentity: (userId, userRole) => set({ userId, userRole }),
  setPrimaryTarget: (position) => set({ primaryTargetPosition: position }),

  // Spell Slice - Seeded with MVP primitives
  availableSpells: [
    {
      spellIdentifier: "primitive-line-ray",
      spellName: "Straight Line Ray",
      spellColorHex: "#ff3366",
      durationInSeconds: 2,
    },
    {
      spellIdentifier: "primitive-token-burst",
      spellName: "Token Shape Burst",
      spellColorHex: "#33ccff",
      durationInSeconds: 3,
    },
  ],
  activeSpellIdentifier: null,
  setActiveSpell: (activeSpellIdentifier) => set({ activeSpellIdentifier }),

  // Particle Slice
  activeEmitters: [],
  addParticleEmitter: (emitterConfiguration) =>
    set((state) => ({
      activeEmitters: [...state.activeEmitters, emitterConfiguration],
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
}));
