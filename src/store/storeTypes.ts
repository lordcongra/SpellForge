export interface IdentityState {
  userId: string | null;
  userRole: "GM" | "PLAYER" | null;
  setIdentity: (userId: string, userRole: "GM" | "PLAYER") => void;
}

export interface SpellDefinition {
  spellIdentifier: string;
  spellName: string;
  spellColorHex: string;
  durationInSeconds: number;
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
  spellType: string;
  originCoordinateX: number;
  originCoordinateY: number;
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