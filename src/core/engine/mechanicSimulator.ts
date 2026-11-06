import type { Point2D, SpellDefinition, MechanicConfig } from '@/types/spellSchema';
import {
  createParticle,
  createParticlesFromVfx,
  type Particle,
} from './particlePhysics';

export interface MechanicSimulationContext {
  spell: SpellDefinition;
  mechanic: MechanicConfig;
  origin: Point2D;
  destination?: Point2D;
  allTargets?: Point2D[];
  emit: (particles: Particle[]) => void;
}

/**
 * Simulates a projectile mechanic traveling from origin to destination.
 */
export function simulateProjectile(context: MechanicSimulationContext): void {
  const { mechanic, origin, destination, emit } = context;
  const target = destination ?? { x: origin.x + 300, y: origin.y };
  const durationMs = mechanic.durationMs || 400;

  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const distance = Math.hypot(dx, dy) || 1;
  const angle = Math.atan2(dy, dx);
  const speed = (distance / (durationMs / 1000));

  // 1. OnCast VFX at origin
  if (mechanic.triggers?.onCast?.vfx) {
    for (const vfx of mechanic.triggers.onCast.vfx) {
      emit(createParticlesFromVfx({ vfx, origin, target }));
    }
  }

  // 2. Projectile core and travel stream particles
  const coreVfx = mechanic.triggers?.inFlight?.vfx?.[0] ?? mechanic.triggers?.onCast?.vfx?.[0];
  const color = coreVfx?.color ?? '#ff6600';
  const shapeId = coreVfx?.shapeId ?? 'circle';
  const size = coreVfx?.size ?? 18;

  const steps = Math.max(8, Math.min(24, Math.round(distance / 25)));
  for (let i = 0; i < steps; i++) {
    const fraction = i / steps;
    const px = origin.x + dx * fraction;
    const py = origin.y + dy * fraction;
    const delayOffset = fraction * (durationMs * 0.7);

    emit([
      createParticle({
        shapeId,
        x: px,
        y: py,
        vx: Math.cos(angle) * (speed * 0.15),
        vy: Math.sin(angle) * (speed * 0.15),
        size: size * (1 - fraction * 0.3),
        color,
        alpha: 0.9,
        glow: true,
        glowBlur: 10,
        lifetimeMs: durationMs - delayOffset + 150,
      }),
    ]);
  }

  // 3. OnImpact VFX at destination
  if (mechanic.triggers?.onImpact?.vfx) {
    const impactVfxList = mechanic.triggers.onImpact.vfx;
    setTimeout(() => {
      for (const vfx of impactVfxList) {
        emit(createParticlesFromVfx({ vfx, origin: target }));
      }
    }, durationMs);
  }
}

/**
 * Simulates a continuous or instantaneous beam connecting origin to destination.
 */
export function simulateBeam(context: MechanicSimulationContext): void {
  const { mechanic, origin, destination, emit } = context;
  const target = destination ?? { x: origin.x + 400, y: origin.y };
  const durationMs = mechanic.durationMs || 300;

  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const distance = Math.hypot(dx, dy) || 1;
  const angle = Math.atan2(dy, dx);

  const beamVfx = mechanic.triggers?.inFlight?.vfx?.[0] ??
    mechanic.triggers?.onCast?.vfx?.[0] ?? {
      id: 'default-beam',
      shapeId: 'sparkle',
      color: '#38bdf8',
      particleCount: 20,
      size: 14,
      lifetimeMs: durationMs,
      spreadAngle: 360,
      glow: true,
      glowBlur: 12,
      opacity: 1,
    };

  // OnCast flash at origin
  if (mechanic.triggers?.onCast?.vfx) {
    for (const vfx of mechanic.triggers.onCast.vfx) {
      emit(createParticlesFromVfx({ vfx, origin, target }));
    }
  }

  // Generate dense luminous beam with superheated central core and orbiting plasma filaments
  const particleSpacing = 14;
  const beamCount = Math.max(14, Math.floor(distance / particleSpacing));
  const beamParticles: Particle[] = [];
  const perpAngle = angle + Math.PI / 2;
  const amplitude = Math.max(14, beamVfx.size * 1.1);
  const omega = 4 * Math.PI; // 2 complete wave cycles along the beam axis

  for (let i = 0; i <= beamCount; i++) {
    const t = i / beamCount;
    const bx = origin.x + dx * t;
    const by = origin.y + dy * t;
    const coreJitter = (Math.random() - 0.5) * 3;

    // 1. Superheated central ray core (white-hot)
    beamParticles.push(
      createParticle({
        shapeId: beamVfx.shapeId,
        x: bx + Math.cos(perpAngle) * coreJitter,
        y: by + Math.sin(perpAngle) * coreJitter,
        vx: Math.cos(angle) * (Math.random() * 15),
        vy: Math.sin(angle) * (Math.random() * 15),
        size: Math.max(4, beamVfx.size * 0.55),
        color: '#ffffff',
        alpha: 1.0,
        glow: true,
        glowBlur: 16,
        lifetimeMs: durationMs * (0.8 + Math.random() * 0.3),
      })
    );

    // 2. Surging plasma filament 1 (+ A * sin(omega * t))
    const filamentOffset1 = amplitude * Math.sin(omega * t);
    beamParticles.push(
      createParticle({
        shapeId: 'sparkle',
        x: bx + Math.cos(perpAngle) * filamentOffset1,
        y: by + Math.sin(perpAngle) * filamentOffset1,
        vx: Math.cos(angle) * (15 + Math.random() * 20),
        vy: Math.sin(angle) * (15 + Math.random() * 20),
        size: beamVfx.size * 0.8,
        color: beamVfx.color,
        alpha: 0.9,
        glow: true,
        glowBlur: 12,
        lifetimeMs: durationMs * (0.7 + Math.random() * 0.4),
      })
    );

    // 3. Surging plasma filament 2 (out-of-phase: - A * sin(omega * t))
    const filamentOffset2 = -amplitude * Math.sin(omega * t);
    beamParticles.push(
      createParticle({
        shapeId: 'sparkle',
        x: bx + Math.cos(perpAngle) * filamentOffset2,
        y: by + Math.sin(perpAngle) * filamentOffset2,
        vx: Math.cos(angle) * (15 + Math.random() * 20),
        vy: Math.sin(angle) * (15 + Math.random() * 20),
        size: beamVfx.size * 0.8,
        color: beamVfx.color,
        alpha: 0.9,
        glow: true,
        glowBlur: 12,
        lifetimeMs: durationMs * (0.7 + Math.random() * 0.4),
      })
    );
  }

  // 4. High-intensity impact flash at destination
  const impactFlashCount = 10;
  for (let k = 0; k < impactFlashCount; k++) {
    const flashAngle = (k / impactFlashCount) * 2 * Math.PI + Math.random() * 0.2;
    const flashSpeed = 40 + Math.random() * 60;
    beamParticles.push(
      createParticle({
        shapeId: k % 2 === 0 ? 'star' : 'sparkle',
        x: target.x,
        y: target.y,
        vx: Math.cos(flashAngle) * flashSpeed,
        vy: Math.sin(flashAngle) * flashSpeed,
        size: beamVfx.size * (0.8 + Math.random() * 0.8),
        color: k % 3 === 0 ? '#ffffff' : beamVfx.color,
        alpha: 1.0,
        glow: true,
        glowBlur: 18,
        lifetimeMs: Math.min(350, durationMs * 0.8),
      })
    );
  }

  emit(beamParticles);

  // Additional trigger-defined OnImpact at beam arrival
  if (mechanic.triggers?.onImpact?.vfx) {
    for (const vfx of mechanic.triggers.onImpact.vfx) {
      emit(createParticlesFromVfx({ vfx, origin: target }));
    }
  }
}

/**
 * Simulates a cone spread outward from origin toward target.
 */
export function simulateCone(context: MechanicSimulationContext): void {
  const { mechanic, origin, destination, emit } = context;
  const target = destination ?? { x: origin.x + 250, y: origin.y };
  const targetAngle = Math.atan2(target.y - origin.y, target.x - origin.x);
  const spreadDeg = Number(mechanic.params?.angleDegrees ?? 53);

  if (mechanic.triggers?.onCast?.vfx) {
    for (const vfx of mechanic.triggers.onCast.vfx) {
      emit(
        createParticlesFromVfx({
          vfx,
          origin,
          baseAngleRad: targetAngle,
          spreadAngleDeg: spreadDeg,
        })
      );
    }
  }
}

/**
 * Simulates a radial burst or explosion expanding from center.
 */
export function simulateBurst(context: MechanicSimulationContext): void {
  const { mechanic, origin, destination, emit } = context;
  const center = destination ?? origin;

  const vfxList = mechanic.triggers?.onImpact?.vfx ?? mechanic.triggers?.onCast?.vfx;
  if (vfxList) {
    for (const vfx of vfxList) {
      emit(
        createParticlesFromVfx({
          vfx,
          origin: center,
          spreadAngleDeg: 360,
        })
      );
    }
  }
}

/**
 * Simulates an aura or persistent circular zone pulsing around center.
 */
export function simulateAura(context: MechanicSimulationContext): void {
  const { mechanic, origin, destination, emit } = context;
  const center = destination ?? origin;
  const radius = Number(mechanic.params?.radius ?? 120);
  const ringCount = 20;

  const vfx = mechanic.triggers?.onCast?.vfx?.[0] ?? {
    id: 'aura-vfx',
    shapeId: 'ring',
    color: '#818cf8',
    particleCount: ringCount,
    size: 16,
    lifetimeMs: mechanic.durationMs || 1000,
    spreadAngle: 360,
    glow: true,
    glowBlur: 10,
    opacity: 0.8,
  };

  const auraParticles: Particle[] = [];
  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2;
    const px = center.x + Math.cos(angle) * radius;
    const py = center.y + Math.sin(angle) * radius;

    auraParticles.push(
      createParticle({
        shapeId: vfx.shapeId,
        x: px,
        y: py,
        vx: Math.cos(angle + Math.PI / 2) * 15,
        vy: Math.sin(angle + Math.PI / 2) * 15,
        size: vfx.size,
        color: vfx.color,
        alpha: vfx.opacity ?? 0.8,
        glow: true,
        glowBlur: 10,
        lifetimeMs: vfx.lifetimeMs,
      })
    );
  }
  emit(auraParticles);
}

/**
 * Main dispatcher routing spell mechanics to their dedicated particle simulation.
 */
export function simulateMechanic(context: MechanicSimulationContext): void {
  switch (context.mechanic.type) {
    case 'projectile':
      simulateProjectile(context);
      break;
    case 'beam':
      simulateBeam(context);
      break;
    case 'burst':
      simulateBurst(context);
      break;
    case 'cone':
      simulateCone(context);
      break;
    case 'aura':
      simulateAura(context);
      break;
    case 'chain': {
      // Chain hops from origin to each target
      const targets = context.allTargets && context.allTargets.length > 0
        ? context.allTargets
        : context.destination
          ? [context.destination]
          : [];

      let currentFrom = context.origin;
      const hopDelay = Number(context.mechanic.params?.hopDelayMs ?? 150);

      if (targets.length === 0) {
        simulateProjectile(context);
      } else {
        targets.forEach((tgt, index) => {
          const fromPoint = currentFrom;
          setTimeout(() => {
            simulateBeam({
              ...context,
              origin: fromPoint,
              destination: tgt,
            });
          }, index * hopDelay);
          currentFrom = tgt;
        });
      }
      break;
    }
    case 'tokenSlide':
    case 'tokenTeleport':
      simulateBurst(context);
      break;
    default:
      simulateBurst(context);
      break;
  }
}
