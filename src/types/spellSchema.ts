import { z } from 'zod';

/**
 * Categories classifying spell aesthetics and thematic intent.
 */
export const ShapeCategorySchema = z.enum(['combat', 'divine', 'elemental', 'arcane']);
export type ShapeCategory = z.infer<typeof ShapeCategorySchema>;

/**
 * Standard shape identifiers available in SpellForge.
 */
export const StandardShapeIdSchema = z.enum([
  'circle',
  'ring',
  'star',
  'plus',
  'sparkle',
  'flame',
  'mist',
  'shard',
]);
export type StandardShapeId = z.infer<typeof StandardShapeIdSchema>;

/**
 * Shape identifier can be a standard shape or a registered custom shape.
 */
export const ShapeIdSchema = z.string().min(1);
export type ShapeId = z.infer<typeof ShapeIdSchema>;

/**
 * Timeline trigger hook moments when effects and sub-mechanics are dispatched.
 */
export const TriggerHookSchema = z.enum([
  'onCast',
  'inFlight',
  'onImpact',
  'onInterval',
  'onTeleportDeparture',
  'onTeleportArrival',
]);
export type TriggerHook = z.infer<typeof TriggerHookSchema>;

/**
 * Core mechanics supported in SpellForge.
 */
export const MechanicTypeSchema = z.enum([
  'projectile',
  'beam',
  'burst',
  'cone',
  'chain',
  'aura',
  'tokenSlide',
  'tokenTeleport',
]);
export type MechanicType = z.infer<typeof MechanicTypeSchema>;

/**
 * 2D coordinate vector.
 */
export const Point2DSchema = z.object({
  x: z.number(),
  y: z.number(),
});
export type Point2D = z.infer<typeof Point2DSchema>;

/**
 * Visual effect configuration for particle bursts, trails, and shapes.
 */
export const VfxConfigSchema = z.object({
  id: z.string().min(1),
  shapeId: ShapeIdSchema,
  color: z.string().min(1), // Hex, rgba, or CSS color string
  particleCount: z.number().int().min(1).max(500).default(25),
  size: z.number().positive().default(16),
  speed: z.number().nonnegative().optional().default(5),
  lifetimeMs: z.number().positive().default(800),
  spreadAngle: z.number().min(0).max(360).optional().default(360), // Dispersion angle in degrees
  glow: z.boolean().optional().default(true),
  glowBlur: z.number().nonnegative().optional().default(8),
  opacity: z.number().min(0).max(1).optional().default(1.0),
});
export type VfxConfig = z.infer<typeof VfxConfigSchema>;

/**
 * Specific parameter schemas per mechanic type.
 */
export const ProjectileParamsSchema = z.object({
  arcHeight: z.number().optional().default(0),
  speed: z.number().positive().optional().default(600), // px per sec
});

export const BeamParamsSchema = z.object({
  beamWidth: z.number().positive().optional().default(12),
  isSustained: z.boolean().optional().default(false),
});

export const BurstParamsSchema = z.object({
  radius: z.number().positive().optional().default(150),
  ringCount: z.number().int().positive().optional().default(1),
});

export const ConeParamsSchema = z.object({
  angleDegrees: z.number().positive().max(360).optional().default(53), // Standard 53° VTT cone
  range: z.number().positive().optional().default(200),
});

export const ChainParamsSchema = z.object({
  maxHops: z.number().int().positive().optional().default(3),
  hopDelayMs: z.number().nonnegative().optional().default(150),
  rangePerHop: z.number().positive().optional().default(250),
});

export const AuraParamsSchema = z.object({
  radius: z.number().positive().optional().default(120),
  intervalMs: z.number().positive().optional().default(1000),
  tickCount: z.number().int().positive().optional().default(3),
  anchorToToken: z.boolean().optional().default(true),
});

export const TokenSlideParamsSchema = z.object({
  easing: z.enum(['linear', 'easeIn', 'easeOut', 'easeInOut']).optional().default('easeOut'),
});

export const TokenTeleportParamsSchema = z.object({
  departureDelayMs: z.number().nonnegative().optional().default(100),
});

/**
 * Trigger bindings mapping trigger hooks to VFX and spawned sub-mechanics.
 */
export const TriggerBindingSchema = z.object({
  vfx: z.array(VfxConfigSchema).optional().default([]),
  spawnMechanicIds: z.array(z.string()).optional().default([]),
});
export type TriggerBinding = z.infer<typeof TriggerBindingSchema>;

export const TriggerHooksMapSchema = z
  .object({
    onCast: TriggerBindingSchema.optional(),
    inFlight: TriggerBindingSchema.optional(),
    onImpact: TriggerBindingSchema.optional(),
    onInterval: TriggerBindingSchema.optional(),
    onTeleportDeparture: TriggerBindingSchema.optional(),
    onTeleportArrival: TriggerBindingSchema.optional(),
  })
  .partial();
export type TriggerHooksMap = z.infer<typeof TriggerHooksMapSchema>;

/**
 * Full mechanic configuration including duration, custom params, and hook triggers.
 */
export const MechanicConfigSchema = z.object({
  id: z.string().min(1),
  type: MechanicTypeSchema,
  name: z.string().optional(),
  durationMs: z.number().nonnegative().default(600),
  params: z.record(z.string(), z.unknown()).optional().default({}),
  triggers: TriggerHooksMapSchema.optional().default({}),
});
export type MechanicConfig = z.infer<typeof MechanicConfigSchema>;

/**
 * Complete spell definition holding name, category, and sequence of mechanics.
 */
export const SpellDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().default(''),
  category: ShapeCategorySchema.optional().default('arcane'),
  castRange: z.number().nonnegative().optional().default(500),
  cooldownMs: z.number().nonnegative().optional().default(0),
  icon: z.string().optional().default('Sparkles'),
  mechanics: z.array(MechanicConfigSchema).min(1),
});
export type SpellDefinition = z.infer<typeof SpellDefinitionSchema>;

/**
 * Broadcast payload transmitted over OBR broadcast channel `spellforge/cast`.
 */
export const CastPayloadSchema = z.object({
  castId: z.string().min(1),
  spell: SpellDefinitionSchema,
  casterTokenId: z.string().optional(),
  targetTokenIds: z.array(z.string()).optional().default([]),
  origin: Point2DSchema,
  destination: Point2DSchema.optional(),
  pathPoints: z.array(Point2DSchema).optional().default([]),
  timestamp: z.number().default(() => Date.now()),
});
export type CastPayload = z.infer<typeof CastPayloadSchema>;

/**
 * Safe validation helper for untrusted external Spell JSON.
 */
export function validateSpellDefinition(data: unknown): {
  success: boolean;
  spell?: SpellDefinition;
  error?: string;
} {
  const result = SpellDefinitionSchema.safeParse(data);
  if (result.success) {
    return { success: true, spell: result.data };
  }
  const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
  return { success: false, error: issues };
}

/**
 * Safe validation helper for broadcast CastPayload.
 */
export function validateCastPayload(data: unknown): {
  success: boolean;
  payload?: CastPayload;
  error?: string;
} {
  const result = CastPayloadSchema.safeParse(data);
  if (result.success) {
    return { success: true, payload: result.data };
  }
  const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
  return { success: false, error: issues };
}
