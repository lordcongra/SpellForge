import { describe, it, expect, vi } from 'vitest';
import {
  createParticle,
  createParticlesFromVfx,
  updateParticle,
  updateParticles,
  renderParticle,
  type Particle,
} from './particlePhysics';
import type { VfxConfig } from '@/types/spellSchema';

describe('particlePhysics', () => {
  it('creates a particle with default attributes', () => {
    const p = createParticle({
      shapeId: 'sparkle',
      x: 100,
      y: 200,
      vx: 50,
      vy: -50,
      size: 20,
      color: '#ffaa00',
    });

    expect(p.shapeId).toBe('sparkle');
    expect(p.x).toBe(100);
    expect(p.y).toBe(200);
    expect(p.vx).toBe(50);
    expect(p.vy).toBe(-50);
    expect(p.size).toBe(20);
    expect(p.color).toBe('#ffaa00');
    expect(p.alpha).toBe(1.0);
    expect(p.glow).toBe(true);
    expect(p.ageMs).toBe(0);
  });

  it('creates particles from VfxConfig', () => {
    const vfx: VfxConfig = {
      id: 'vfx-test-1',
      shapeId: 'flame',
      color: '#ff4400',
      particleCount: 10,
      size: 15,
      speed: 6,
      lifetimeMs: 500,
      spreadAngle: 180,
      glow: true,
      glowBlur: 10,
      opacity: 0.8,
    };

    const particles = createParticlesFromVfx({
      vfx,
      origin: { x: 50, y: 50 },
    });

    expect(particles).toHaveLength(10);
    for (const p of particles) {
      expect(p.shapeId).toBe('flame');
      expect(p.x).toBe(50);
      expect(p.y).toBe(50);
      expect(p.color).toBe('#ff4400');
      expect(p.initialAlpha).toBe(0.8);
    }
  });

  it('advances linear motion over deltaMs', () => {
    const p: Particle = createParticle({
      shapeId: 'circle',
      x: 0,
      y: 0,
      vx: 100, // 100 px / s
      vy: 200, // 200 px / s
      lifetimeMs: 1000,
    });

    // Advance 500ms (0.5s)
    const alive = updateParticle(p, 500);

    expect(alive).toBe(true);
    expect(p.x).toBeCloseTo(50, 1);
    expect(p.y).toBeCloseTo(100, 1);
    expect(p.alpha).toBeCloseTo(0.5, 1);
  });

  it('applies gravity over time', () => {
    const p: Particle = createParticle({
      shapeId: 'circle',
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      gravityY: 400, // 400 px / s^2 downwards
      lifetimeMs: 1000,
    });

    updateParticle(p, 500); // 0.5s -> vy becomes 200, y becomes 100
    expect(p.vy).toBeCloseTo(200, 1);
    expect(p.y).toBeCloseTo(100, 1);
  });

  it('curves velocity direction when curve is specified', () => {
    const p: Particle = createParticle({
      shapeId: 'circle',
      x: 0,
      y: 0,
      vx: 100,
      vy: 0,
      curve: Math.PI, // 180 deg / sec
      lifetimeMs: 1000,
    });

    updateParticle(p, 500); // After 0.5s, angle shifts by ~90 deg (pi/2)
    // vx should approach 0, vy should be ~100
    expect(p.vx).toBeCloseTo(0, 0);
    expect(p.vy).toBeCloseTo(100, 0);
  });

  it('fades alpha and expires dead particles', () => {
    const p1 = createParticle({ shapeId: 'circle', x: 0, y: 0, lifetimeMs: 200 });
    const p2 = createParticle({ shapeId: 'circle', x: 0, y: 0, lifetimeMs: 800 });

    const updated = updateParticles([p1, p2], 300);

    expect(updated).toHaveLength(1);
    expect(updated[0].id).toBe(p2.id);
  });

  it('renders particle with canvas translation and glow', () => {
    const ctx = {
      save: vi.fn(),
      translate: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      shadowColor: '',
      shadowBlur: 0,
      globalAlpha: 1,
      fillStyle: '',
    } as unknown as CanvasRenderingContext2D;

    const p = createParticle({
      shapeId: 'circle',
      x: 42,
      y: 84,
      color: '#00ffcc',
      glow: true,
      glowBlur: 14,
    });

    renderParticle(ctx, p);

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.translate).toHaveBeenCalledWith(42, 84);
    expect(ctx.shadowColor).toBe('#00ffcc');
    expect(ctx.shadowBlur).toBe(14);
    expect(ctx.restore).toHaveBeenCalled();
  });
});

