import React from 'react';
import {
  Circle,
  Disc,
  Star,
  Plus,
  Sparkles,
  Flame,
  Cloud,
  Diamond,
  type LucideIcon,
} from 'lucide-react';
import { shapeRegistry } from '@/core/shapes/shapeRegistry';
import type { StandardShapeId } from '@/types/spellSchema';

const SHAPE_ICON_MAP: Record<string, LucideIcon> = {
  circle: Circle,
  ring: Disc,
  star: Star,
  plus: Plus,
  sparkle: Sparkles,
  flame: Flame,
  mist: Cloud,
  shard: Diamond,
};

export interface ShapePickerProps {
  value: StandardShapeId | string;
  onChange: (shapeId: StandardShapeId) => void;
  className?: string;
}

export const ShapePicker: React.FC<ShapePickerProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const shapes = shapeRegistry.getAll();

  return (
    <div className={`sf-shape-picker ${className}`.trim()} role="radiogroup" aria-label="Particle Shape">
      {shapes.map((shape) => {
        const IconComponent = SHAPE_ICON_MAP[shape.id] ?? Sparkles;
        const isSelected = value === shape.id;

        return (
          <button
            key={shape.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`sf-shape-btn ${isSelected ? 'sf-shape-btn--active' : ''}`}
            onClick={() => onChange(shape.id as StandardShapeId)}
            title={`${shape.label} (${shape.category})`}
          >
            <IconComponent size={16} className="sf-shape-btn__icon" />
            <span className="sf-shape-btn__label">{shape.label}</span>
          </button>
        );
      })}
    </div>
  );
};

