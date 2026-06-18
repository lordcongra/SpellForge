export interface IdentityState {
  userId: string | null;
  userRole: "GM" | "PLAYER" | null;
  setIdentity: (userId: string, userRole: "GM" | "PLAYER") => void;
}

export type BehaviorType = "PROJECTILE" | "BURST" | "WALL";
export type TargetLogic = "CASTER_ONLY" | "ALL_TARGETS" | "CASTER_TO_TARGETS";

export interface SpellDefinition {
  spellIdentifier: string;
  spellName: string;
  spellColorHex: string;
  durationInSeconds: number;
  behaviorType: BehaviorType;
  targetLogic: TargetLogic;
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
  behaviorType: BehaviorType;
  originCoordinateX: number;
  originCoordinateY: number;
  destinationCoordinateX?: number;
  destinationCoordinateY?: number;
  particleCount: number;
  emitterLifeSpan: number;
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