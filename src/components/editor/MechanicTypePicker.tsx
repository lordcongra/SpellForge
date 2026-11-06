import React from 'react';
import {
  MoveUpRight,
  Zap,
  Sun,
  Cone,
  Link,
  Shield,
  Footprints,
  LocateFixed,
  type LucideIcon,
} from 'lucide-react';
import { mechanicRegistry } from '@/core/mechanics/mechanicRegistry';
import type { MechanicType } from '@/types/spellSchema';

const MECHANIC_ICON_MAP: Record<MechanicType, LucideIcon> = {
  projectile: MoveUpRight,
  beam: Zap,
  burst: Sun,
  cone: Cone,
  chain: Link,
  aura: Shield,
  tokenSlide: Footprints,
  tokenTeleport: LocateFixed,
};

export interface MechanicTypePickerProps {
  value: MechanicType;
  onChange: (type: MechanicType) => void;
  className?: string;
}

export const MechanicTypePicker: React.FC<MechanicTypePickerProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const mechanics = mechanicRegistry.getAll();

  return (
    <div
      className={`sf-mechanic-picker ${className}`.trim()}
      role="radiogroup"
      aria-label="Mechanic Type"
    >
      {mechanics.map((mech) => {
        const IconComponent = MECHANIC_ICON_MAP[mech.id] ?? Zap;
        const isSelected = value === mech.id;

        return (
          <button
            key={mech.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`sf-mechanic-pill ${isSelected ? 'sf-mechanic-pill--active' : ''}`}
            onClick={() => onChange(mech.id)}
            title={mech.description}
          >
            <IconComponent size={14} className="sf-mechanic-pill__icon" />
            <span className="sf-mechanic-pill__label">{mech.label}</span>
          </button>
        );
      })}
    </div>
  );
};

