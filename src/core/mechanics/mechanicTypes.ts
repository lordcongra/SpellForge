import type { MechanicType, TriggerHook, MechanicConfig } from '@/types/spellSchema';

export type MechanicCategory = 'motion' | 'area' | 'direct' | 'token';

/**
 * Core definition describing a spell behavior mechanic.
 */
export interface MechanicDefinition {
  id: MechanicType;
  label: string;
  description: string;
  category: MechanicCategory;
  supportedHooks: TriggerHook[];
  defaultDurationMs: number;
  defaultParams: Record<string, unknown>;
  createDefaultConfig(idPrefix?: string): MechanicConfig;
}

