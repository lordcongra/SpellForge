import React from 'react';
import { Plus, Wand2 } from 'lucide-react';
import { useSpellStore } from '@/store/useSpellStore';
import { Button } from '@/components/ui/Button';
import { NumberSpinner } from '@/components/ui/NumberSpinner';
import { MechanicCard } from './MechanicCard';
import { renderSpellIcon } from './spellIconHelper';
import { SpellIconPicker } from './SpellIconPicker';
import { mechanicRegistry } from '@/core/mechanics/mechanicRegistry';
import type {
  SpellDefinition,
  ShapeCategory,
  MechanicConfig,
} from '@/types/spellSchema';

export const SpellInspector: React.FC = () => {
  const activeSpell = useSpellStore((s) => s.activeSpell);
  const saveSpell = useSpellStore((s) => s.saveSpell);

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

  const handleAddMechanic = () => {
    const defaultMechDef = mechanicRegistry.get('burst') ?? mechanicRegistry.getAll()[0];
    const newMechanic = defaultMechDef.createDefaultConfig(`m${activeSpell.mechanics.length + 1}`);
    updateSpell({
      mechanics: [...activeSpell.mechanics, newMechanic],
    });
  };

  const handleUpdateMechanic = (index: number, updatedMech: MechanicConfig) => {
    const mechanics = [...activeSpell.mechanics];
    mechanics[index] = updatedMech;
    updateSpell({ mechanics });
  };

  const handleRemoveMechanic = (index: number) => {
    if (activeSpell.mechanics.length <= 1) return;
    const mechanics = activeSpell.mechanics.filter((_, i) => i !== index);
    updateSpell({ mechanics });
  };

  return (
    <section className="sf-inspector" aria-label="Spell Inspector">
      <div className="sf-inspector__header">
        <div className="sf-inspector__title-area">
          <div className="sf-inspector__icon-preview">
            {renderSpellIcon(activeSpell.icon, 22)}
          </div>
          <div>
            <h2 className="sf-inspector__title">{activeSpell.name}</h2>
            <span className="sf-inspector__subtitle">
              ID: <code>{activeSpell.id}</code>
            </span>
          </div>
        </div>
        <span className={`sf-tag sf-tag--${activeSpell.category}`}>
          {activeSpell.category}
        </span>
      </div>

      <div className="sf-inspector__content">
        <div className="sf-inspector__section">
          <h3 className="sf-section-title">Spell Identity</h3>

          <div className="sf-form-row">
            <label className="sf-form-field">
              <span className="sf-label-text">Spell Name</span>
              <input
                type="text"
                className="sf-input"
                value={activeSpell.name}
                onChange={(e) => updateSpell({ name: e.target.value })}
              />
            </label>

            <label className="sf-form-field">
              <span className="sf-label-text">School / Category</span>
              <select
                className="sf-select"
                value={activeSpell.category}
                onChange={(e) =>
                  updateSpell({ category: e.target.value as ShapeCategory })
                }
              >
                <option value="arcane">Arcane</option>
                <option value="elemental">Elemental</option>
                <option value="divine">Divine</option>
                <option value="combat">Combat</option>
              </select>
            </label>
          </div>

          <div className="sf-form-section">
            <span className="sf-label-text">Spell Icon</span>
            <SpellIconPicker
              value={activeSpell.icon ?? 'Sparkles'}
              onChange={(icon) => updateSpell({ icon })}
            />
          </div>

          <div className="sf-form-row">
            <div className="sf-form-field">
              <span className="sf-label-text">Cast Range</span>
              <NumberSpinner
                value={activeSpell.castRange ?? 500}
                onChange={(val) => updateSpell({ castRange: val })}
                min={0}
                step={25}
                unit="ft"
                aria-label="Cast Range in feet"
              />
            </div>

            <div className="sf-form-field">
              <span className="sf-label-text">Cooldown</span>
              <NumberSpinner
                value={activeSpell.cooldownMs ?? 0}
                onChange={(val) => updateSpell({ cooldownMs: val })}
                min={0}
                step={100}
                unit="ms"
                aria-label="Cooldown in milliseconds"
              />
            </div>
          </div>

          <label className="sf-form-field">
            <span className="sf-label-text">Description</span>
            <textarea
              className="sf-textarea"
              rows={2}
              value={activeSpell.description ?? ''}
              onChange={(e) => updateSpell({ description: e.target.value })}
              placeholder="Brief flavor or tactical summary of the spell..."
            />
          </label>
        </div>

        <div className="sf-inspector__section">
          <div className="sf-inspector__section-header">
            <div>
              <h3 className="sf-section-title">Mechanics & Stages</h3>
              <p className="sf-section-desc">
                Configure timeline execution sequence and triggered VFX particle shapes.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={handleAddMechanic}
            >
              Add Stage
            </Button>
          </div>

          <div className="sf-mechanic-list">
            {activeSpell.mechanics.map((mech, index) => (
              <MechanicCard
                key={mech.id || `mech-${index}`}
                mechanic={mech}
                index={index}
                canRemove={activeSpell.mechanics.length > 1}
                onUpdate={(updated) => handleUpdateMechanic(index, updated)}
                onRemove={() => handleRemoveMechanic(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
