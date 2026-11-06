import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShapeRegistry, shapeRegistry, registerShape } from './shapeRegistry';
import type { ShapeDefinition } from './shapeTypes';

function createMockContext(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    createRadialGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

describe('ShapeRegistry', () => {
  let registry: ShapeRegistry;

  beforeEach(() => {
    registry = new ShapeRegistry();
  });

  it('initializes with all 8 standard built-in shapes', () => {
    const all = registry.getAll();
    expect(all.length).toBe(8);

    const ids = all.map((s) => s.id);
    expect(ids).toContain('circle');
    expect(ids).toContain('ring');
    expect(ids).toContain('star');
    expect(ids).toContain('plus');
    expect(ids).toContain('sparkle');
    expect(ids).toContain('flame');
    expect(ids).toContain('mist');
    expect(ids).toContain('shard');
  });

  it('retrieves shape by id', () => {
    const star = registry.get('star');
    expect(star).toBeDefined();
    expect(star?.label).toBe('Star');
    expect(star?.category).toBe('arcane');
  });

  it('falls back to circle if requested shape does not exist', () => {
    const fallback = registry.getOrFallback('non-existent-shape');
    expect(fallback.id).toBe('circle');
  });

  it('filters shapes by category', () => {
    const divine = registry.getByCategory('divine');
    const ids = divine.map((s) => s.id);
    expect(ids).toContain('plus');
    expect(ids).toContain('sparkle');

    const combat = registry.getByCategory('combat');
    const combatIds = combat.map((s) => s.id);
    expect(combatIds).toContain('ring');
    expect(combatIds).toContain('shard');
  });

  it('registers and unregisters custom shapes', () => {
    const customShape: ShapeDefinition = {
      id: 'custom-rune',
      label: 'Ancient Rune',
      category: 'arcane',
      draw: vi.fn(),
    };

    registry.register(customShape);
    expect(registry.has('custom-rune')).toBe(true);
    expect(registry.get('custom-rune')?.label).toBe('Ancient Rune');

    const removed = registry.unregister('custom-rune');
    expect(removed).toBe(true);
    expect(registry.has('custom-rune')).toBe(false);
  });

  it('throws when registering shape without id', () => {
    expect(() =>
      registry.register({ id: '', label: 'Bad', category: 'arcane', draw: vi.fn() })
    ).toThrow();
  });

  it('draws each built-in shape without throwing canvas errors', () => {
    const mockCtx = createMockContext();
    const allShapes = registry.getAll();

    for (const shape of allShapes) {
      expect(() => {
        shape.draw(mockCtx, 32, '#ffaa00', 0.8);
      }).not.toThrow();
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    }
  });

  it('registerShape helper registers into the singleton shapeRegistry', () => {
    const dynamicShape: ShapeDefinition = {
      id: 'dynamic-spark',
      label: 'Dynamic Spark',
      category: 'elemental',
      draw: vi.fn(),
    };

    registerShape(dynamicShape);
    expect(shapeRegistry.has('dynamic-spark')).toBe(true);
    expect(shapeRegistry.get('dynamic-spark')?.label).toBe('Dynamic Spark');
    shapeRegistry.unregister('dynamic-spark');
  });
});

