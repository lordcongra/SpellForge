import React, { useState } from 'react';
import {
  Wand2,
  Crosshair,
  Sparkles,
  Palette,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useSpellStore } from '@/store/useSpellStore';
import { Button } from '@/components/ui/Button';
import { renderSpellIcon } from './spellIconHelper';
import { SpellIconPicker } from './SpellIconPicker';
import { StepFunction } from './steps/StepFunction';
import { StepTargeting } from './steps/StepTargeting';
import { StepEffects } from './steps/StepEffects';
import { StepColorTheme } from './steps/StepColorTheme';
import type { SpellDefinition, ShapeCategory, MechanicConfig } from '@/types/spellSchema';
import './SpellInspector.css';

export type GuidedStep = 1 | 2 | 3 | 4;

export const SpellInspector: React.FC = () => {
  const activeSpell = useSpellStore((s) => s.activeSpell);
  const saveSpell = useSpellStore((s) => s.saveSpell);

  const [currentStep, setCurrentStep] = useState<GuidedStep>(1);

  if (!activeSpell) {
    return (
      <section className="sf-inspector sf-inspector--empty" aria-label="Spell Inspector">
        <div className="sf-inspector__empty-state">
          <Wand2 size={40} className="sf-inspector__empty-icon" />
          <h3>No Spell Selected</h3>
          <p>Select a spell from the library or create a new one to start forging effects.</p>
        </div>
      </section>
    );
  }

  const updateSpell = (partial: Partial<SpellDefinition>) => {
    const updated: SpellDefinition = {
      ...activeSpell,
      ...partial,
    };
    saveSpell(updated);
  };

  const handleUpdatePrimaryMechanic = (updatedMech: MechanicConfig) => {
    const mechanics = [...activeSpell.mechanics];
    mechanics[0] = updatedMech;
    updateSpell({ mechanics });
  };

  const primaryMechanic = activeSpell.mechanics[0];

  return (
    <section className="sf-inspector" aria-label="Spell Inspector">
      {/* 1. Identity & Icon Header */}
      <div className="sf-inspector__header">
        <div className="sf-inspector__title-area">
          <div className="sf-inspector__icon-preview">
            {renderSpellIcon(activeSpell.icon, 22)}
          </div>
          <div>
            <h2 className="sf-inspector__title">{activeSpell.name}</h2>
            <span className="sf-inspector__subtitle">
              School: <code>{activeSpell.category}</code>
            </span>
          </div>
        </div>
        <div className="sf-form-row" style={{ gap: '8px' }}>
          <select
            className="sf-select sf-select--sm"
            value={activeSpell.category}
            onChange={(e) => updateSpell({ category: e.target.value as ShapeCategory })}
            aria-label="Spell school category"
          >
            <option value="arcane">Arcane</option>
            <option value="elemental">Elemental</option>
            <option value="divine">Divine</option>
            <option value="combat">Combat</option>
          </select>
        </div>
      </div>

      {/* Spell Name & Icon quick bar */}
      <div className="sf-form-row">
        <label className="sf-form-field">
          <span className="sf-label-text">Spell Name</span>
          <input
            type="text"
            className="sf-input"
            value={activeSpell.name}
            onChange={(e) => updateSpell({ name: e.target.value })}
            placeholder="Enter spell name..."
          />
        </label>
        <div className="sf-form-field" style={{ flex: '0 0 auto' }}>
          <span className="sf-label-text">Icon</span>
          <SpellIconPicker
            value={activeSpell.icon ?? 'Sparkles'}
            onChange={(icon) => updateSpell({ icon })}
          />
        </div>
      </div>

      {/* 2. 4-Step Stepper Navigation */}
      <nav className="sf-stepper-nav" aria-label="Spell Forge Stepper">
        <button
          type="button"
          className={`sf-step-tab ${currentStep === 1 ? 'sf-step-tab--active' : ''}`}
          onClick={() => setCurrentStep(1)}
        >
          <span className="sf-step-tab__num">1</span>
          <Wand2 size={13} />
          <span>Function</span>
        </button>

        <button
          type="button"
          className={`sf-step-tab ${currentStep === 2 ? 'sf-step-tab--active' : ''}`}
          onClick={() => setCurrentStep(2)}
        >
          <span className="sf-step-tab__num">2</span>
          <Crosshair size={13} />
          <span>Targeting</span>
        </button>

        <button
          type="button"
          className={`sf-step-tab ${currentStep === 3 ? 'sf-step-tab--active' : ''}`}
          onClick={() => setCurrentStep(3)}
        >
          <span className="sf-step-tab__num">3</span>
          <Sparkles size={13} />
          <span>Effects</span>
        </button>

        <button
          type="button"
          className={`sf-step-tab ${currentStep === 4 ? 'sf-step-tab--active' : ''}`}
          onClick={() => setCurrentStep(4)}
        >
          <span className="sf-step-tab__num">4</span>
          <Palette size={13} />
          <span>Color & Theme</span>
        </button>
      </nav>

      {/* 3. Step Content Area */}
      <div className="sf-inspector__content">
        {currentStep === 1 && (
          <StepFunction
            mechanic={primaryMechanic}
            onUpdate={handleUpdatePrimaryMechanic}
          />
        )}

        {currentStep === 2 && (
          <StepTargeting
            spell={activeSpell}
            onUpdate={updateSpell}
          />
        )}

        {currentStep === 3 && (
          <StepEffects
            mechanic={primaryMechanic}
            onUpdate={handleUpdatePrimaryMechanic}
          />
        )}

        {currentStep === 4 && (
          <StepColorTheme
            mechanic={primaryMechanic}
            onUpdate={handleUpdatePrimaryMechanic}
          />
        )}
      </div>

      {/* 4. Stepper Footer Controls */}
      <footer className="sf-inspector__footer">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={<ArrowLeft size={14} />}
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as GuidedStep)}
        >
          Previous
        </Button>

        <span className="sf-step-indicator-text">
          Step {currentStep} of 4
        </span>

        <Button
          type="button"
          size="sm"
          variant={currentStep === 4 ? 'secondary' : 'primary'}
          icon={<ArrowRight size={14} />}
          disabled={currentStep === 4}
          onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1) as GuidedStep)}
        >
          Next Step
        </Button>
      </footer>
    </section>
  );
};
