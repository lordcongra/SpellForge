export interface IdentityState {
  userId: string | null;
  userRole: "GM" | "PLAYER" | null;
  setIdentity: (userId: string, userRole: "GM" | "PLAYER") => void;
}

export type ShapePrimitive = "CIRCLE" | "RECTANGLE" | "LINE" | "CONE" | "PLUS" | "STAR";
export type AnimationBehavior =
  | "INSTANT"
  | "EXPAND_OUTWARD"
  | "CONTRACT_INWARD"
  | "TRAVEL_PROJECTILE"
  | "TRAVEL_BEAM"
  | "PULSE";
export type TargetLogic =
  | "CASTER_ONLY"
  | "ALL_SIMULTANEOUS"
  | "CASTER_TO_TARGETS_SIMULTANEOUS"
  | "CHAIN_SEQUENTIAL"
  | "WALL_CONNECTED"
  | "AURA_ATTACHED";

export interface SpellDefinition {
  spellIdentifier: string;
  spellName: string;
  spellColorHex: string;
  secondaryColorHex?: string;
  durationInMs: number;
  shapePrimitive: ShapePrimitive;
  animationBehavior: AnimationBehavior;
  targetLogic: TargetLogic;
  travelTimeInMs?: number;
  layerOverride?: "ATTACHMENT" | "PROP" | "MAP";
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
  configuredDurationMs: number;
  keepTargetsAfterCast: boolean;

  setActiveSpell: (spellIdentifier: string) => void;
  addTargetPosition: (target: TargetCoordinate) => void;
  removeTargetPosition: (targetIdentifier: string) => void;
  clearTargetPositions: () => void;
  setConfiguredColorHex: (colorHex: string) => void;
  setConfiguredSize: (size: number) => void;
  setConfiguredDurationMs: (durationMs: number) => void;
  setKeepTargetsAfterCast: (shouldKeep: boolean) => void;

  // New Spellbook Management Methods
  saveSpell: (spell: SpellDefinition) => void;
  deleteSpell: (spellIdentifier: string) => void;
  importSpells: (spells: SpellDefinition[]) => void;
}

export interface ParticleConfiguration {
  emitterIdentifier: string;
  shapePrimitive: ShapePrimitive;
  animationBehavior: AnimationBehavior;
  originCoordinateX: number;
  originCoordinateY: number;
  destinationCoordinateX?: number;
  destinationCoordinateY?: number;
  particleCount: number;
  emitterLifeSpan: number;
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