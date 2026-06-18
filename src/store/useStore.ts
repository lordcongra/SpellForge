import { create } from "zustand";
import type { RootStore } from "./storeTypes";

export const useStore = create<RootStore>((set) => ({
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
      durationInSeconds: 2,
    },
    {
      spellIdentifier: "token-burst",
      spellName: "Token Shape Burst",
      spellColorHex: "#33ccff",
      durationInSeconds: 3,
    },
  ],
  activeSpellIdentifier: null,
  targetPositions: [],
  configuredColorHex: "#3498db",
  configuredSize: 2,
  keepTargetsAfterCast: false,
  
  setActiveSpell: (activeSpellIdentifier) => set({ activeSpellIdentifier }),
  
  addTargetPosition: (targetCoordinate) => 
    set((state) => ({ targetPositions: [...state.targetPositions, targetCoordinate] })),
    
  removeTargetPosition: (targetIdentifier) => 
    set((state) => ({
      targetPositions: state.targetPositions.filter(
        (target) => target.targetIdentifier !== targetIdentifier
      )
    })),
    
  clearTargetPositions: () => set({ targetPositions: [] }),
  setConfiguredColorHex: (colorHex) => set({ configuredColorHex: colorHex }),
  setConfiguredSize: (size) => set({ configuredSize: size }),
  setKeepTargetsAfterCast: (shouldKeep) => set({ keepTargetsAfterCast: shouldKeep }),

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
}));