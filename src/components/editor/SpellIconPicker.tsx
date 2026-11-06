import React from 'react';
import { SPELL_ICONS } from './spellIconHelper';

export interface SpellIconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  className?: string;
}

export const SpellIconPicker: React.FC<SpellIconPickerProps> = ({
  value = 'Sparkles',
  onChange,
  className = '',
}) => {
  const iconKeys = Object.keys(SPELL_ICONS);

  return (
    <div
      className={`sf-spell-icon-picker ${className}`.trim()}
      role="radiogroup"
      aria-label="Spell Icon"
    >
      {iconKeys.map((key) => {
        const IconComponent = SPELL_ICONS[key];
        const isSelected = value === key;

        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`sf-spell-icon-btn ${isSelected ? 'sf-spell-icon-btn--active' : ''}`}
            onClick={() => onChange(key)}
            title={key}
            aria-label={key}
          >
            <IconComponent size={18} />
          </button>
        );
      })}
    </div>
  );
};

