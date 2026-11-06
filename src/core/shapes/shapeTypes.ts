import type { ShapeCategory } from '@/types/spellSchema';

/**
 * Shape drawing callback executed on a 2D HTML5 canvas context.
 * Shape coordinate origin (0, 0) is the center of the particle.
 */
export type ShapeDrawFunction = (
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string,
  alpha: number
) => void;

/**
 * Shape definition registered in the ShapeRegistry.
 */
export interface ShapeDefinition {
  id: string;
  label: string;
  category: ShapeCategory;
  draw: ShapeDrawFunction;
}

