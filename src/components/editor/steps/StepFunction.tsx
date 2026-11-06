import React from 'react';
import { mechanicRegistry } from '@/core/mechanics/mechanicRegistry';
import { MechanicTypePicker } from '../MechanicTypePicker';
import { NumberSpinner } from '@/components/ui/NumberSpinner';
import type { MechanicConfig, MechanicType } from '@/types/spellSchema';

export interface StepFunctionProps {
  mechanic: MechanicConfig;
  onUpdate: (updated: MechanicConfig) => void;
}

export const StepFunction: React.FC<StepFunctionProps> = ({ mechanic, onUpdate }) => {
  const handleTypeChange = (newType: MechanicType) => {
    const def = mechanicRegistry.get(newType);
    if (!def) return;
    const freshConfig = def.createDefaultConfig(mechanic.id || 'm0');
    onUpdate({
      ...freshConfig,
      id: mechanic.id,
      name: `${def.label} Archetype`,
      triggers: mechanic.triggers,
    });
  };

  const handleParamChange = (key: string, value: unknown) => {
    onUpdate({
      ...mechanic,
      params: {
        ...(mechanic.params ?? {}),
        [key]: value,
      },
    });
  };

  const type = mechanic.type;
  const params = mechanic.params ?? {};

  return (
    <div className="sf-step-panel sf-step-function" aria-label="Step 1: Function & Archetype">
      <div className="sf-step-header">
        <h3 className="sf-step-title">1. Function & Archetype</h3>
        <p className="sf-step-desc">
          Choose the core movement and geometric delivery mechanic for the spell.
        </p>
      </div>

      <div className="sf-form-section">
        <span className="sf-label-text">Select Archetype</span>
        <MechanicTypePicker value={mechanic.type} onChange={handleTypeChange} />
      </div>

      <div className="sf-form-section">
        <span className="sf-label-text">Physical Execution Parameters</span>
        <div className="sf-form-row">
          <div className="sf-form-field">
            <span className="sf-label-subtext">Duration</span>
            <NumberSpinner
              value={mechanic.durationMs}
              onChange={(val) => onUpdate({ ...mechanic, durationMs: val })}
              min={50}
              max={5000}
              step={50}
              unit="ms"
              aria-label="Mechanic Duration in milliseconds"
            />
          </div>

          {/* Projectile Specific */}
          {type === 'projectile' && (
            <>
              <div className="sf-form-field">
                <span className="sf-label-subtext">Flight Speed</span>
                <NumberSpinner
                  value={Number(params.speed ?? 600)}
                  onChange={(val) => handleParamChange('speed', val)}
                  min={100}
                  max={2500}
                  step={50}
                  unit="px/s"
                  aria-label="Projectile flight speed"
                />
              </div>
              <div className="sf-form-field">
                <span className="sf-label-subtext">Arc Height</span>
                <NumberSpinner
                  value={Number(params.arcHeight ?? 0)}
                  onChange={(val) => handleParamChange('arcHeight', val)}
                  min={0}
                  max={400}
                  step={10}
                  unit="px"
                  aria-label="Projectile trajectory arc height"
                />
              </div>
            </>
          )}

          {/* Beam Specific */}
          {type === 'beam' && (
            <div className="sf-form-field">
              <span className="sf-label-subtext">Beam Width</span>
              <NumberSpinner
                value={Number(params.beamWidth ?? 12)}
                onChange={(val) => handleParamChange('beamWidth', val)}
                min={2}
                max={60}
                step={2}
                unit="px"
                aria-label="Beam width"
              />
            </div>
          )}

          {/* Burst / Explosion Specific */}
          {type === 'burst' && (
            <>
              <div className="sf-form-field">
                <span className="sf-label-subtext">Blast Radius</span>
                <NumberSpinner
                  value={Number(params.radius ?? 150)}
                  onChange={(val) => handleParamChange('radius', val)}
                  min={20}
                  max={800}
                  step={10}
                  unit="px"
                  aria-label="Burst radius in pixels"
                />
              </div>
              <div className="sf-form-field">
                <span className="sf-label-subtext">Shockwave Rings</span>
                <NumberSpinner
                  value={Number(params.ringCount ?? 1)}
                  onChange={(val) => handleParamChange('ringCount', val)}
                  min={1}
                  max={5}
                  step={1}
                  aria-label="Number of expanding rings"
                />
              </div>
            </>
          )}

          {/* Cone Specific */}
          {type === 'cone' && (
            <>
              <div className="sf-form-field">
                <span className="sf-label-subtext">Spread Angle</span>
                <NumberSpinner
                  value={Number(params.angleDegrees ?? 53)}
                  onChange={(val) => handleParamChange('angleDegrees', val)}
                  min={15}
                  max={180}
                  step={5}
                  unit="°"
                  aria-label="Cone spread angle in degrees"
                />
              </div>
              <div className="sf-form-field">
                <span className="sf-label-subtext">Cone Range</span>
                <NumberSpinner
                  value={Number(params.range ?? 200)}
                  onChange={(val) => handleParamChange('range', val)}
                  min={50}
                  max={600}
                  step={25}
                  unit="px"
                  aria-label="Cone range in pixels"
                />
              </div>
            </>
          )}

          {/* Aura Specific */}
          {type === 'aura' && (
            <>
              <div className="sf-form-field">
                <span className="sf-label-subtext">Aura Radius</span>
                <NumberSpinner
                  value={Number(params.radius ?? 120)}
                  onChange={(val) => handleParamChange('radius', val)}
                  min={30}
                  max={500}
                  step={10}
                  unit="px"
                  aria-label="Aura radius in pixels"
                />
              </div>
              <div className="sf-form-field">
                <span className="sf-label-subtext">Pulse Interval</span>
                <NumberSpinner
                  value={Number(params.intervalMs ?? 1000)}
                  onChange={(val) => handleParamChange('intervalMs', val)}
                  min={200}
                  max={3000}
                  step={100}
                  unit="ms"
                  aria-label="Aura pulse interval"
                />
              </div>
            </>
          )}

          {/* Chain Specific */}
          {type === 'chain' && (
            <>
              <div className="sf-form-field">
                <span className="sf-label-subtext">Max Hops</span>
                <NumberSpinner
                  value={Number(params.maxHops ?? 3)}
                  onChange={(val) => handleParamChange('maxHops', val)}
                  min={1}
                  max={8}
                  step={1}
                  aria-label="Maximum chain hops"
                />
              </div>
              <div className="sf-form-field">
                <span className="sf-label-subtext">Hop Delay</span>
                <NumberSpinner
                  value={Number(params.hopDelayMs ?? 150)}
                  onChange={(val) => handleParamChange('hopDelayMs', val)}
                  min={50}
                  max={500}
                  step={25}
                  unit="ms"
                  aria-label="Delay between hops"
                />
              </div>
            </>
          )}

          {/* Slide / Teleport Specific */}
          {type === 'tokenSlide' && (
            <div className="sf-form-field">
              <span className="sf-label-subtext">Easing Motion</span>
              <select
                className="sf-select"
                value={String(params.easing ?? 'easeOut')}
                onChange={(e) => handleParamChange('easing', e.target.value)}
              >
                <option value="easeOut">Ease Out (Decelerate)</option>
                <option value="easeInOut">Ease In-Out (Smooth)</option>
                <option value="easeIn">Ease In (Accelerate)</option>
                <option value="linear">Linear (Constant)</option>
              </select>
            </div>
          )}

          {type === 'tokenTeleport' && (
            <div className="sf-form-field">
              <span className="sf-label-subtext">Departure Delay</span>
              <NumberSpinner
                value={Number(params.departureDelayMs ?? 100)}
                onChange={(val) => handleParamChange('departureDelayMs', val)}
                min={0}
                max={1000}
                step={50}
                unit="ms"
                aria-label="Departure effect delay"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

