import React from 'react';
import { Trash2 } from 'lucide-react';
import { mechanicRegistry } from '@/core/mechanics/mechanicRegistry';
import { NumberSpinner } from '@/components/ui/NumberSpinner';
import { ShapePicker } from './ShapePicker';
import { MechanicTypePicker } from './MechanicTypePicker';
import type { MechanicConfig, MechanicType, StandardShapeId } from '@/types/spellSchema';

interface MechanicCardProps {
  mechanic: MechanicConfig;
  index: number;
  canRemove: boolean;
  onUpdate: (updated: MechanicConfig) => void;
  onRemove: () => void;
}

export const MechanicCard: React.FC<MechanicCardProps> = ({
  mechanic,
  index,
  canRemove,
  onUpdate,
  onRemove,
}) => {
  const handleTypeChange = (newType: MechanicType) => {
    const def = mechanicRegistry.get(newType);
    if (!def) return;
    const freshConfig = def.createDefaultConfig(`m${index}`);
    // Preserve any existing trigger VFX if possible
    onUpdate({
      ...freshConfig,
      id: mechanic.id,
      name: `${def.label} Stage`,
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

  // Find or create primary VFX for editing
  const primaryVfx =
    mechanic.triggers?.onCast?.vfx?.[0] ??
    mechanic.triggers?.onImpact?.vfx?.[0];

  const handleVfxColorChange = (color: string) => {
    const triggers = { ...(mechanic.triggers ?? {}) };
    let updated = false;

    if (triggers.onCast?.vfx && triggers.onCast.vfx.length > 0) {
      triggers.onCast = {
        ...triggers.onCast,
        vfx: triggers.onCast.vfx.map((v) => ({ ...v, color })),
      };
      updated = true;
    }
    if (triggers.onImpact?.vfx && triggers.onImpact.vfx.length > 0) {
      triggers.onImpact = {
        ...triggers.onImpact,
        vfx: triggers.onImpact.vfx.map((v) => ({ ...v, color })),
      };
      updated = true;
    }

    if (!updated) {
      // Create default cast vfx with this color
      triggers.onCast = {
        vfx: [
          {
            id: `vfx-${Date.now()}`,
            shapeId: 'sparkle',
            color,
            particleCount: 20,
            size: 16,
            speed: 4,
            lifetimeMs: 500,
            spreadAngle: 360,
            glow: true,
            glowBlur: 8,
            opacity: 1,
          },
        ],
        spawnMechanicIds: [],
      };
    }

    onUpdate({ ...mechanic, triggers });
  };

  const handleVfxShapeChange = (shapeId: StandardShapeId) => {
    const triggers = { ...(mechanic.triggers ?? {}) };
    let updated = false;
    if (triggers.onCast?.vfx && triggers.onCast.vfx.length > 0) {
      triggers.onCast = {
        ...triggers.onCast,
        vfx: triggers.onCast.vfx.map((v) => ({ ...v, shapeId })),
      };
      updated = true;
    }
    if (triggers.onImpact?.vfx && triggers.onImpact.vfx.length > 0) {
      triggers.onImpact = {
        ...triggers.onImpact,
        vfx: triggers.onImpact.vfx.map((v) => ({ ...v, shapeId })),
      };
      updated = true;
    }
    if (!updated) {
      triggers.onCast = {
        vfx: [
          {
            id: `vfx-${Date.now()}`,
            shapeId,
            color: '#ffaa00',
            particleCount: 20,
            size: 16,
            speed: 4,
            lifetimeMs: 500,
            spreadAngle: 360,
            glow: true,
            glowBlur: 8,
            opacity: 1,
          },
        ],
        spawnMechanicIds: [],
      };
    }
    onUpdate({ ...mechanic, triggers });
  };

  return (
    <div className="sf-mech-card">
      <div className="sf-mech-card__header">
        <div className="sf-mech-card__header-left">
          <span className="sf-mech-card__step-num">#{index + 1}</span>
          <MechanicTypePicker
            value={mechanic.type}
            onChange={handleTypeChange}
          />
        </div>
        {canRemove && (
          <button
            type="button"
            className="sf-mech-card__remove-btn"
            title="Remove mechanic"
            aria-label="Remove mechanic"
            onClick={onRemove}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="sf-mech-card__body">
        <div className="sf-form-row">
          <label className="sf-form-field">
            <span className="sf-label-text">Stage Name</span>
            <input
              type="text"
              className="sf-input"
              value={mechanic.name ?? ''}
              onChange={(e) => onUpdate({ ...mechanic, name: e.target.value })}
              placeholder="e.g. Explosion Wave"
            />
          </label>
          <div className="sf-form-field">
            <span className="sf-label-text">Duration</span>
            <NumberSpinner
              value={mechanic.durationMs}
              onChange={(val) => onUpdate({ ...mechanic, durationMs: val })}
              min={0}
              step={50}
              unit="ms"
              aria-label="Duration in milliseconds"
            />
          </div>
        </div>

        {/* Mechanic specific parameter controls */}
        {mechanic.type === 'projectile' && (
          <div className="sf-form-row">
            <div className="sf-form-field">
              <span className="sf-label-text">Speed</span>
              <NumberSpinner
                value={Number(mechanic.params?.speed ?? 600)}
                onChange={(val) => handleParamChange('speed', val)}
                min={100}
                max={2500}
                step={50}
                unit="px/s"
                aria-label="Speed in pixels per second"
              />
            </div>
            <div className="sf-form-field">
              <span className="sf-label-text">Arc Height</span>
              <NumberSpinner
                value={Number(mechanic.params?.arcHeight ?? 0)}
                onChange={(val) => handleParamChange('arcHeight', val)}
                min={0}
                max={300}
                step={10}
                unit="px"
                aria-label="Arc height in pixels"
              />
            </div>
          </div>
        )}

        {mechanic.type === 'burst' && (
          <div className="sf-form-row">
            <div className="sf-form-field">
              <span className="sf-label-text">Radius</span>
              <NumberSpinner
                value={Number(mechanic.params?.radius ?? 150)}
                onChange={(val) => handleParamChange('radius', val)}
                min={20}
                max={600}
                step={10}
                unit="px"
                aria-label="Burst radius in pixels"
              />
            </div>
            <div className="sf-form-field">
              <span className="sf-label-text">Rings</span>
              <NumberSpinner
                value={Number(mechanic.params?.ringCount ?? 1)}
                onChange={(val) => handleParamChange('ringCount', val)}
                min={1}
                max={5}
                step={1}
                aria-label="Number of rings"
              />
            </div>
          </div>
        )}

        {mechanic.type === 'beam' && (
          <div className="sf-form-row">
            <div className="sf-form-field">
              <span className="sf-label-text">Beam Width</span>
              <NumberSpinner
                value={Number(mechanic.params?.beamWidth ?? 12)}
                onChange={(val) => handleParamChange('beamWidth', val)}
                min={2}
                max={60}
                step={2}
                unit="px"
                aria-label="Beam width in pixels"
              />
            </div>
          </div>
        )}

        {/* VFX Particle Shape Picker */}
        <div className="sf-form-section">
          <span className="sf-label-text">VFX Shape</span>
          <ShapePicker
            value={primaryVfx?.shapeId ?? 'sparkle'}
            onChange={handleVfxShapeChange}
          />
        </div>

        {/* VFX Color */}
        <div className="sf-form-row">
          <label className="sf-form-field">
            <span className="sf-label-text">VFX Color</span>
            <div className="sf-color-input-group">
              <input
                type="color"
                className="sf-color-picker"
                value={primaryVfx?.color ?? '#ffaa00'}
                onChange={(e) => handleVfxColorChange(e.target.value)}
              />
              <input
                type="text"
                className="sf-input sf-input--color-text"
                value={primaryVfx?.color ?? '#ffaa00'}
                onChange={(e) => handleVfxColorChange(e.target.value)}
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
