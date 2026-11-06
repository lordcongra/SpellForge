import { shapeRegistry } from '@/core/shapes/shapeRegistry';
import type { Point2D, VfxConfig } from '@/types/spellSchema';

/**
 * Ephemeral particle instance simulated in 2D canvas space.
 */
export interface Particle {
  id: string;
  shapeId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravityY: number;
  gravityX: number;
  curve: number; // angular velocity in radians / sec
  size: number;
  initialSize: number;
  color: string;
  alpha: number;
  initialAlpha: number;
  glow: boolean;
  glowBlur: number;
  lifetimeMs: number;
  ageMs: number;
}

/**
 * Options for spawning a single granular particle.
 */
export interface ParticleSpawnOptions {
  shapeId: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  speed?: number;
  angleRad?: number;
  gravityY?: number;
  gravityX?: number;
  curve?: number;
  size?: number;
  color?: string;
  alpha?: number;
  glow?: boolean;
  glowBlur?: number;
  lifetimeMs?: number;
}

/**
 * Options for spawning a burst/batch of particles from a VfxConfig.
 */
export interface SpawnVfxOptions {
  vfx: VfxConfig;
  origin: Point2D;
  target?: Point2D;
  baseAngleRad?: number;
  spreadAngleDeg?: number;
  speedMultiplier?: number;
  gravityY?: number;
  curve?: number;
}

let nextParticleId = 0;

/**
 * Creates a single particle with default fallbacks.
 */
export function createParticle(options: ParticleSpawnOptions): Particle {
  const angle =
    options.angleRad ??
    (options.vx !== undefined && options.vy !== undefined
      ? Math.atan2(options.vy, options.vx)
      : 0);

  const speed =
    options.speed ??
    (options.vx !== undefined && options.vy !== undefined
      ? Math.hypot(options.vx, options.vy)
      : 0);

  const vx = options.vx ?? Math.cos(angle) * speed;
  const vy = options.vy ?? Math.sin(angle) * speed;
  const size = options.size ?? 16;
  const alpha = options.alpha ?? 1.0;

  return {
    id: `p-${++nextParticleId}-${Math.random().toString(36).substring(2, 6)}`,
    shapeId: options.shapeId,
    x: options.x,
    y: options.y,
    vx,
    vy,
    gravityY: options.gravityY ?? 0,
    gravityX: options.gravityX ?? 0,
    curve: options.curve ?? 0,
    size,
    initialSize: size,
    color: options.color ?? '#ffffff',
    alpha,
    initialAlpha: alpha,
    glow: options.glow ?? true,
    glowBlur: options.glowBlur ?? 8,
    lifetimeMs: options.lifetimeMs ?? 800,
    ageMs: 0,
  };
}

/**
 * Generates an array of particles conforming to a VfxConfig declaration.
 */
export function createParticlesFromVfx(options: SpawnVfxOptions): Particle[] {
  const { vfx, origin, target } = options;
  const count = vfx.particleCount;
  const particles: Particle[] = [];

  let baseAngle = options.baseAngleRad;
  if (baseAngle === undefined && target) {
    baseAngle = Math.atan2(target.y - origin.y, target.x - origin.x);
  } else if (baseAngle === undefined) {
    baseAngle = 0;
  }

  const spreadDeg = options.spreadAngleDeg ?? vfx.spreadAngle ?? 360;
  const spreadRad = (spreadDeg * Math.PI) / 180;
  const isFullCircle = spreadDeg >= 359;

  // Convert speed: scale speed factor by 50 to convert to px/sec if < 20
  const speedScale = options.speedMultiplier ?? (vfx.speed && vfx.speed > 20 ? 1 : 50);
  const baseSpeed = (vfx.speed ?? 5) * speedScale;

  for (let i = 0; i < count; i++) {
    let angle: number;
    if (isFullCircle) {
      angle = Math.random() * Math.PI * 2;
    } else {
      const offset = (Math.random() - 0.5) * spreadRad;
      angle = baseAngle + offset;
    }

    const speed = baseSpeed * (0.8 + Math.random() * 0.4);
    const lifetime = vfx.lifetimeMs * (0.9 + Math.random() * 0.2);

    particles.push(
      createParticle({
        shapeId: vfx.shapeId,
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravityY: options.gravityY ?? 0,
        curve: options.curve ?? 0,
        size: vfx.size,
        color: vfx.color,
        alpha: vfx.opacity ?? 1.0,
        glow: vfx.glow ?? true,
        glowBlur: vfx.glowBlur ?? 8,
        lifetimeMs: lifetime,
      })
    );
  }

  return particles;
}

/**
 * Updates a particle's trajectory, velocity, curvature, gravity, and alpha fade.
 * Returns true if particle is still active, or false if it has expired.
 */
export function updateParticle(particle: Particle, deltaMs: number): boolean {
  particle.ageMs += deltaMs;
  if (particle.ageMs >= particle.lifetimeMs) {
    particle.alpha = 0;
    return false;
  }

  const dt = deltaMs / 1000;

  // Apply gravity
  if (particle.gravityY !== 0) {
    particle.vy += particle.gravityY * dt;
  }
  if (particle.gravityX !== 0) {
    particle.vx += particle.gravityX * dt;
  }

  // Apply angular curve
  if (particle.curve !== 0) {
    const currentAngle = Math.atan2(particle.vy, particle.vx);
    const speed = Math.hypot(particle.vx, particle.vy);
    const nextAngle = currentAngle + particle.curve * dt;
    particle.vx = Math.cos(nextAngle) * speed;
    particle.vy = Math.sin(nextAngle) * speed;
  }

  // Apply linear velocity
  particle.x += particle.vx * dt;
  particle.y += particle.vy * dt;

  // Linear alpha fade over particle lifetime
  const progress = Math.min(1, particle.ageMs / particle.lifetimeMs);
  particle.alpha = Math.max(0, particle.initialAlpha * (1 - progress));

  return particle.alpha > 0.001;
}

/**
 * Batch updates an array of particles and filters out dead ones.
 */
export function updateParticles(particles: Particle[], deltaMs: number): Particle[] {
  const activeParticles: Particle[] = [];
  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    if (updateParticle(particle, deltaMs)) {
      activeParticles.push(particle);
    }
  }
  return activeParticles;
}

/**
 * Renders a single particle with glow blur and shape registry drawing.
 */
export function renderParticle(ctx: CanvasRenderingContext2D, particle: Particle): void {
  if (particle.alpha <= 0.001) return;

  ctx.save();
  ctx.translate(particle.x, particle.y);

  if (particle.glow && particle.glowBlur > 0) {
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = particle.glowBlur;
  }

  const shape = shapeRegistry.getOrFallback(particle.shapeId);
  shape.draw(ctx, particle.size, particle.color, particle.alpha);

  ctx.restore();
}

/**
 * Renders an array of particles to the target canvas context.
 */
export function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (let i = 0; i < particles.length; i++) {
    renderParticle(ctx, particles[i]);
  }
}

