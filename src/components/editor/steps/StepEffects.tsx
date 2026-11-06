import React from 'react';
import { Sparkles, Zap, Flame } from 'lucide-react';
import { ShapePicker } from '../ShapePicker';
import { NumberSpinner } from '@/components/ui/NumberSpinner';
import { createDefaultVfx } from '../editorUtils';
import type { MechanicConfig, StandardShapeId, VfxConfig } from '@/types/spellSchema';

export interface StepEffectsProps {
  mechanic: MechanicConfig;
  onUpdate: (updated: MechanicConfig) => void;
}

export const StepEffects: React.FC<StepEffectsProps> = ({ mechanic, onUpdate }) => {
  const triggers = mechanic.triggers ?? {};

  const isOnCastActive = Boolean(triggers.onCast?.vfx && triggers.onCast.vfx.length > 0);
  const isInFlightActive = Boolean(triggers.inFlight?.vfx && triggers.inFlight.vfx.length > 0);
  const isOnImpactActive = Boolean(triggers.onImpact?.vfx && triggers.onImpact.vfx.length > 0);

  const getPrimaryColor = (): string => {
    return (
      triggers.onCast?.vfx?.[0]?.color ??
      triggers.inFlight?.vfx?.[0]?.color ??
      triggers.onImpact?.vfx?.[0]?.color ??
      '#a855f7'
    );
  };

  const handleToggleHook = (hook: 'onCast' | 'inFlight' | 'onImpact', active: boolean) => {
    const nextTriggers = { ...triggers };
    if (active) {
      const defaultShape: StandardShapeId = hook === 'onImpact' ? 'star' : 'sparkle';
      nextTriggers[hook] = {
        vfx: [createDefaultVfx(defaultShape, getPrimaryColor())],
        spawnMechanicIds: [],
      };
    } else {
      delete nextTriggers[hook];
    }
    onUpdate({ ...mechanic, triggers: nextTriggers });
  };

  const handleUpdateVfx = (
    hook: 'onCast' | 'inFlight' | 'onImpact',
    updater: (vfx: VfxConfig) => VfxConfig
  ) => {
    const currentList = triggers[hook]?.vfx ?? [createDefaultVfx('sparkle', getPrimaryColor())];
    const updatedList = currentList.map(updater);
    onUpdate({
      ...mechanic,
      triggers: {
        ...triggers,
        [hook]: {
          vfx: updatedList,
          spawnMechanicIds: triggers[hook]?.spawnMechanicIds ?? [],
        },
      },
    });
  };

  return (
    <div className="sf-step-panel sf-step-effects" aria-label="Step 3: Effects & Trigger Moments">
      <div className="sf-step-header">
        <h3 className="sf-step-title">3. Visual Effects & Triggers</h3>
        <p className="sf-step-desc">
          Configure particle shapes and behavior at each phase of the spell timeline.
        </p>
      </div>

      <div className="sf-trigger-sections">
        {/* On Cast Trigger */}
        <div className={`sf-trigger-card ${isOnCastActive ? 'sf-trigger-card--active' : ''}`}>
          <div className="sf-trigger-card__header">
            <label className="sf-trigger-toggle">
              <input
                type="checkbox"
                checked={isOnCastActive}
                onChange={(e) => handleToggleHook('onCast', e.target.checked)}
              />
              <Sparkles size={16} className="sf-trigger-icon sf-trigger-icon--cast" />
              <div className="sf-trigger-toggle__text">
                <span className="sf-trigger-title">On Cast (Origin Launch)</span>
                <span className="sf-trigger-desc">Fires immediately at caster position</span>
              </div>
            </label>
          </div>

          {isOnCastActive && triggers.onCast?.vfx?.[0] && (
            <div className="sf-trigger-card__body">
              <div className="sf-form-section">
                <span className="sf-label-subtext">Particle Shape</span>
                <ShapePicker
                  value={triggers.onCast.vfx[0].shapeId}
                  onChange={(shapeId) =>
                    handleUpdateVfx('onCast', (v) => ({ ...v, shapeId }))
                  }
                />
              </div>

              <div className="sf-form-row">
                <div className="sf-form-field">
                  <span className="sf-label-subtext">Particle Count</span>
                  <NumberSpinner
                    value={triggers.onCast.vfx[0].particleCount}
                    onChange={(val) =>
                      handleUpdateVfx('onCast', (v) => ({ ...v, particleCount: val }))
                    }
                    min={2}
                    max={150}
                    step={5}
                    aria-label="On Cast particle count"
                  />
                </div>
                <div className="sf-form-field">
                  <span className="sf-label-subtext">Particle Size</span>
                  <NumberSpinner
                    value={triggers.onCast.vfx[0].size}
                    onChange={(val) =>
                      handleUpdateVfx('onCast', (v) => ({ ...v, size: val }))
                    }
                    min={4}
                    max={60}
                    step={2}
                    unit="px"
                    aria-label="On Cast particle size"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* In Flight Trigger */}
        <div className={`sf-trigger-card ${isInFlightActive ? 'sf-trigger-card--active' : ''}`}>
          <div className="sf-trigger-card__header">
            <label className="sf-trigger-toggle">
              <input
                type="checkbox"
                checked={isInFlightActive}
                onChange={(e) => handleToggleHook('inFlight', e.target.checked)}
              />
              <Zap size={16} className="sf-trigger-icon sf-trigger-icon--flight" />
              <div className="sf-trigger-toggle__text">
                <span className="sf-trigger-title">In Flight (Trajectory Trail)</span>
                <span className="sf-trigger-desc">Streams particles continuously along movement path</span>
              </div>
            </label>
          </div>

          {isInFlightActive && triggers.inFlight?.vfx?.[0] && (
            <div className="sf-trigger-card__body">
              <div className="sf-form-section">
                <span className="sf-label-subtext">Trail Shape</span>
                <ShapePicker
                  value={triggers.inFlight.vfx[0].shapeId}
                  onChange={(shapeId) =>
                    handleUpdateVfx('inFlight', (v) => ({ ...v, shapeId }))
                  }
                />
              </div>

              <div className="sf-form-row">
                <div className="sf-form-field">
                  <span className="sf-label-subtext">Density / Count</span>
                  <NumberSpinner
                    value={triggers.inFlight.vfx[0].particleCount}
                    onChange={(val) =>
                      handleUpdateVfx('inFlight', (v) => ({ ...v, particleCount: val }))
                    }
                    min={5}
                    max={100}
                    step={5}
                    aria-label="In Flight particle count"
                  />
                </div>
                <div className="sf-form-field">
                  <span className="sf-label-subtext">Particle Size</span>
                  <NumberSpinner
                    value={triggers.inFlight.vfx[0].size}
                    onChange={(val) =>
                      handleUpdateVfx('inFlight', (v) => ({ ...v, size: val }))
                    }
                    min={4}
                    max={40}
                    step={2}
                    unit="px"
                    aria-label="In Flight particle size"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* On Impact Trigger */}
        <div className={`sf-trigger-card ${isOnImpactActive ? 'sf-trigger-card--active' : ''}`}>
          <div className="sf-trigger-card__header">
            <label className="sf-trigger-toggle">
              <input
                type="checkbox"
                checked={isOnImpactActive}
                onChange={(e) => handleToggleHook('onImpact', e.target.checked)}
              />
              <Flame size={16} className="sf-trigger-icon sf-trigger-icon--impact" />
              <div className="sf-trigger-toggle__text">
                <span className="sf-trigger-title">On Impact (Destination Burst)</span>
                <span className="sf-trigger-desc">Explodes upon reaching target coordinates</span>
              </div>
            </label>
          </div>

          {isOnImpactActive && triggers.onImpact?.vfx?.[0] && (
            <div className="sf-trigger-card__body">
              <div className="sf-form-section">
                <span className="sf-label-subtext">Impact Shape</span>
                <ShapePicker
                  value={triggers.onImpact.vfx[0].shapeId}
                  onChange={(shapeId) =>
                    handleUpdateVfx('onImpact', (v) => ({ ...v, shapeId }))
                  }
                />
              </div>

              <div className="sf-form-row">
                <div className="sf-form-field">
                  <span className="sf-label-subtext">Burst Particles</span>
                  <NumberSpinner
                    value={triggers.onImpact.vfx[0].particleCount}
                    onChange={(val) =>
                      handleUpdateVfx('onImpact', (v) => ({ ...v, particleCount: val }))
                    }
                    min={5}
                    max={200}
                    step={10}
                    aria-label="On Impact particle count"
                  />
                </div>
                <div className="sf-form-field">
                  <span className="sf-label-subtext">Burst Particle Size</span>
                  <NumberSpinner
                    value={triggers.onImpact.vfx[0].size}
                    onChange={(val) =>
                      handleUpdateVfx('onImpact', (v) => ({ ...v, size: val }))
                    }
                    min={6}
                    max={80}
                    step={2}
                    unit="px"
                    aria-label="On Impact particle size"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

