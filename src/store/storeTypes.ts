export interface IdentityState {
  userId: string | null;
  userRole: "GM" | "PLAYER" | null;
  setIdentity: (userId: string, userRole: "GM" | "PLAYER") => void;
}

// 1. Structural Enums for Granular Control
export type ShapePrimitive = "CIRCLE" | "RECTANGLE" | "LINE" | "CONE" | "PLUS" | "STAR";
export type AnimationBehavior = "INSTANT" | "EXPAND_OUTWARD" | "CONTRACT_INWARD" | "TRAVEL_PROJECTILE" | "TRAVEL_BEAM" | "PULSE";
export type TargetLogic = "CASTER_ONLY" | "ALL_SIMULTANEOUS" | "CASTER_TO_TARGETS_SIMULTANEOUS" | "CHAIN_SEQUENTIAL" | "WALL_CONNECTED" | "AURA_ATTACHED";

export interface SpellDefinition {
  spellIdentifier: string;
  spellName: string;
  spellColorHex: string;
  durationInSeconds: number; // How long it stays on the map
  
  // New Granular Controls
  shapePrimitive: ShapePrimitive;
  animationBehavior: AnimationBehavior;
  targetLogic: TargetLogic;
  travelTimeInMs?: number; // Used if AnimationBehavior is a TRAVEL type
  layerOverride?: "ATTACHMENT" | "PROP" | "MAP"; // Under or over tokens
}

export interface TargetCoordinate {
  targetIdentifier: string;
  x: number;
  y: number;
}

export interface SpellState {
  availableSpells: SpellDefinition[];
  activeSpellIdentifier: string | null;
  targetPositions: TargetCoordinate[];
  configuredColorHex: string;
  configuredSize: number;
  keepTargetsAfterCast: boolean;
  setActiveSpell: (spellIdentifier: string) => void;
  addTargetPosition: (target: TargetCoordinate) => void;
  removeTargetPosition: (targetIdentifier: string) => void;
  clearTargetPositions: () => void;
  setConfiguredColorHex: (colorHex: string) => void;
  setConfiguredSize: (size: number) => void;
  setKeepTargetsAfterCast: (shouldKeep: boolean) => void;
}

export interface ParticleConfiguration {
  emitterIdentifier: string;
  
  // Passed down from the Spell Definition
  shapePrimitive: ShapePrimitive;
  animationBehavior: AnimationBehavior;
  
  originCoordinateX: number;
  originCoordinateY: number;
  destinationCoordinateX?: number;
  destinationCoordinateY?: number;
  
  particleCount: number;
  emitterLifeSpan: number; // Extracted duration
  travelTimeInMs?: number;
  
  spellColorHex: string;
  spellSize: number;
}

export interface ParticleState {
  activeEmitters: ParticleConfiguration[];
  addParticleEmitters: (emitterConfigurations: ParticleConfiguration[]) => void;
  removeParticleEmitter: (emitterIdentifier: string) => void;
}

export interface SyncState {
  isActivelySyncing: boolean;
  setSyncStatus: (status: boolean) => void;
}

export type RootStore = IdentityState & SpellState & ParticleState & SyncState;