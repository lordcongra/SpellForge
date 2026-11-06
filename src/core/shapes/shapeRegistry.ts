import type { ShapeDefinition } from './shapeTypes';
import type { ShapeCategory } from '@/types/spellSchema';
import { builtInShapes, circleShape } from './definitions';

/**
 * Registry storing all active visual shapes available for SpellForge effects.
 * Supports dynamic runtime extension and categorization.
 */
export class ShapeRegistry {
  private shapes = new Map<string, ShapeDefinition>();

  constructor(autoSeed = true) {
    if (autoSeed) {
      this.resetToDefaults();
    }
  }

  /**
   * Registers a new shape definition. If a shape with the same ID exists, it is replaced.
   */
  public register(shape: ShapeDefinition): void {
    if (!shape.id) {
      throw new Error('[ShapeRegistry] Shape definition must have a valid id');
    }
    this.shapes.set(shape.id, shape);
  }

  /**
   * Retrieves a shape by ID.
   */
  public get(id: string): ShapeDefinition | undefined {
    return this.shapes.get(id);
  }

  /**
   * Retrieves a shape by ID or falls back to standard circle if not found.
   */
  public getOrFallback(id: string): ShapeDefinition {
    return this.shapes.get(id) ?? circleShape;
  }

  /**
   * Checks if a shape ID is registered.
   */
  public has(id: string): boolean {
    return this.shapes.has(id);
  }

  /**
   * Unregisters a shape by ID.
   */
  public unregister(id: string): boolean {
    return this.shapes.delete(id);
  }

  /**
   * Returns all registered shapes.
   */
  public getAll(): ShapeDefinition[] {
    return Array.from(this.shapes.values());
  }

  /**
   * Returns all shapes under a specific thematic category.
   */
  public getByCategory(category: ShapeCategory): ShapeDefinition[] {
    return this.getAll().filter((shape) => shape.category === category);
  }

  /**
   * Clears all registered shapes.
   */
  public clear(): void {
    this.shapes.clear();
  }

  /**
   * Resets registry to the built-in preset shapes.
   */
  public resetToDefaults(): void {
    this.shapes.clear();
    for (const shape of builtInShapes) {
      this.shapes.set(shape.id, shape);
    }
  }
}

/**
 * Singleton instance of ShapeRegistry used across the application.
 */
export const shapeRegistry = new ShapeRegistry();

/**
 * Convenient plug-and-play registration helper for standalone shape definition files.
 */
export function registerShape(shape: ShapeDefinition): void {
  shapeRegistry.register(shape);
}

