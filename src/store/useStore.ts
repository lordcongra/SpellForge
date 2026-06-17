import { create } from "zustand";
import type { RootStore } from "./storeTypes";

export const useStore = create<RootStore>((set) => ({
  // Identity Slice
  userId: null,
  userRole: null,
  setIdentity: (userId, userRole) => set({ userId, userRole }),

  // Spell Slice
  availableSpells: [],
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