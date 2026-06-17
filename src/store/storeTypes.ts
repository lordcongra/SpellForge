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

export interface SpellState {
  availableSpells: SpellDefinition[];
  activeSpellIdentifier: string | null;
  setActiveSpell: (spellIdentifier: string) => void;
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
  addParticleEmitter: (emitterConfiguration: ParticleConfiguration) => void;
  removeParticleEmitter: (emitterIdentifier: string) => void;
}

export interface SyncState {
  isActivelySyncing: boolean;
  setSyncStatus: (status: boolean) => void;
}

export type RootStore = IdentityState & SpellState & ParticleState & SyncState;
