import React, { useState } from 'react';
import { User, Target, Users, Link } from 'lucide-react';
import { NumberSpinner } from '@/components/ui/NumberSpinner';
import { DELIVERY_MODES, type DeliveryMode } from '../editorUtils';
import type { SpellDefinition } from '@/types/spellSchema';

export interface StepTargetingProps {
  spell: SpellDefinition;
  onUpdate: (partial: Partial<SpellDefinition>) => void;
}

const DELIVERY_ICONS = {
  self: User,
  single: Target,
  multi: Users,
  chain: Link,
};

export const StepTargeting: React.FC<StepTargetingProps> = ({ spell, onUpdate }) => {
  // Infer initial mode from spell mechanic or default to single
  const [activeDelivery, setActiveDelivery] = useState<DeliveryMode>(() => {
    const mainType = spell.mechanics[0]?.type;
    if (mainType === 'aura' || mainType === 'tokenTeleport') return 'self';
    if (mainType === 'chain') return 'chain';
    if (mainType === 'burst' || mainType === 'cone') return 'multi';
    return 'single';
  });

  const handleDeliverySelect = (mode: DeliveryMode) => {
    setActiveDelivery(mode);
    // Suggest standard default ranges based on delivery mode if not set
    if (mode === 'self' && (!spell.castRange || spell.castRange > 0)) {
      onUpdate({ castRange: 0 });
    } else if (mode !== 'self' && spell.castRange === 0) {
      onUpdate({ castRange: 300 });
    }
  };

  return (
    <div className="sf-step-panel sf-step-targeting" aria-label="Step 2: Targeting & Delivery">
      <div className="sf-step-header">
        <h3 className="sf-step-title">2. Targeting & Delivery Mode</h3>
        <p className="sf-step-desc">
          Configure how the spell selects and tracks tokens across the map.
        </p>
      </div>

      <div className="sf-form-section">
        <span className="sf-label-text">Delivery Mode</span>
        <div className="sf-delivery-grid" role="radiogroup" aria-label="Delivery Mode">
          {DELIVERY_MODES.map((dm) => {
            const Icon = DELIVERY_ICONS[dm.id] ?? Target;
            const isSelected = activeDelivery === dm.id;

            return (
              <button
                key={dm.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`sf-delivery-card ${isSelected ? 'sf-delivery-card--active' : ''}`}
                onClick={() => handleDeliverySelect(dm.id)}
              >
                <div className="sf-delivery-card__icon">
                  <Icon size={18} />
                </div>
                <div className="sf-delivery-card__content">
                  <span className="sf-delivery-card__title">{dm.label}</span>
                  <span className="sf-delivery-card__desc">{dm.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sf-form-section">
        <span className="sf-label-text">Range & Tactical Bounds</span>
        <div className="sf-form-row">
          <div className="sf-form-field">
            <span className="sf-label-subtext">Cast Range</span>
            <NumberSpinner
              value={spell.castRange ?? 500}
              onChange={(val) => onUpdate({ castRange: val })}
              min={0}
              max={2500}
              step={25}
              unit="ft"
              aria-label="Cast range in feet"
            />
          </div>

          <div className="sf-form-field">
            <span className="sf-label-subtext">Cooldown</span>
            <NumberSpinner
              value={spell.cooldownMs ?? 0}
              onChange={(val) => onUpdate({ cooldownMs: val })}
              min={0}
              max={60000}
              step={250}
              unit="ms"
              aria-label="Cooldown in milliseconds"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

