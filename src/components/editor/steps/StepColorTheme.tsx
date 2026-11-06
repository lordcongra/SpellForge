import React, { useState } from 'react';
import { THEME_PALETTES, updateAllVfxColor, updateAllVfxSize, updateAllVfxGlow } from '../editorUtils';
import { NumberSpinner } from '@/components/ui/NumberSpinner';
import type { MechanicConfig } from '@/types/spellSchema';

export interface StepColorThemeProps {
  mechanic: MechanicConfig;
  onUpdate: (updated: MechanicConfig) => void;
}

export const StepColorTheme: React.FC<StepColorThemeProps> = ({ mechanic, onUpdate }) => {
  const triggers = mechanic.triggers ?? {};
  const currentVfx =
    triggers.onCast?.vfx?.[0] ??
    triggers.inFlight?.vfx?.[0] ??
    triggers.onImpact?.vfx?.[0];

  const currentColor = currentVfx?.color ?? '#a855f7';
  const currentSize = currentVfx?.size ?? 16;
  const currentGlow = currentVfx?.glow ?? true;
  const currentGlowBlur = currentVfx?.glowBlur ?? 10;

  const [customHex, setCustomHex] = useState(currentColor);

  const handlePaletteSelect = (color: string) => {
    setCustomHex(color);
    const updated = updateAllVfxColor(mechanic, color);
    onUpdate(updated);
  };

  const handleCustomHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextColor = e.target.value;
    setCustomHex(nextColor);
    const updated = updateAllVfxColor(mechanic, nextColor);
    onUpdate(updated);
  };

  const handleSizeChange = (val: number) => {
    const updated = updateAllVfxSize(mechanic, val);
    onUpdate(updated);
  };

  const handleGlowToggle = (glow: boolean) => {
    const updated = updateAllVfxGlow(mechanic, glow, currentGlowBlur);
    onUpdate(updated);
  };

  const handleGlowBlurChange = (val: number) => {
    const updated = updateAllVfxGlow(mechanic, currentGlow, val);
    onUpdate(updated);
  };

  return (
    <div className="sf-step-panel sf-step-color-theme" aria-label="Step 4: Color & Theme">
      <div className="sf-step-header">
        <h3 className="sf-step-title">4. Color & Energy Palette</h3>
        <p className="sf-step-desc">
          Set elemental theme palettes, glow intensity, and overall particle luminescence.
        </p>
      </div>

      <div className="sf-form-section">
        <span className="sf-label-text">Thematic Energy Palettes</span>
        <div className="sf-palette-grid" role="radiogroup" aria-label="Elemental Palette">
          {THEME_PALETTES.map((pal) => {
            const isSelected = currentColor.toLowerCase() === pal.color.toLowerCase();

            return (
              <button
                key={pal.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`sf-palette-card ${isSelected ? 'sf-palette-card--active' : ''}`}
                onClick={() => handlePaletteSelect(pal.color)}
                title={pal.description}
              >
                <span
                  className="sf-palette-swatch"
                  style={{
                    backgroundColor: pal.color,
                    boxShadow: `0 0 10px ${pal.color}88`,
                  }}
                />
                <div className="sf-palette-card__info">
                  <span className="sf-palette-card__name">{pal.label}</span>
                  <span className="sf-palette-card__hex">{pal.color}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sf-form-section">
        <span className="sf-label-text">Custom Hex Tuning</span>
        <div className="sf-color-input-row">
          <input
            type="color"
            className="sf-color-picker-native"
            value={customHex.startsWith('#') && customHex.length === 7 ? customHex : '#a855f7'}
            onChange={handleCustomHexChange}
            aria-label="Native color picker"
          />
          <input
            type="text"
            className="sf-input sf-input--hex"
            value={customHex}
            onChange={handleCustomHexChange}
            placeholder="#a855f7"
            aria-label="Custom hex string"
          />
          <span
            className="sf-live-swatch"
            style={{
              backgroundColor: customHex,
              boxShadow: `0 0 12px ${customHex}aa`,
            }}
          />
        </div>
      </div>

      <div className="sf-form-section">
        <span className="sf-label-text">Luminescence & Particle Scale</span>
        <div className="sf-form-row">
          <div className="sf-form-field">
            <span className="sf-label-subtext">Base Particle Size</span>
            <NumberSpinner
              value={currentSize}
              onChange={handleSizeChange}
              min={4}
              max={64}
              step={2}
              unit="px"
              aria-label="Base particle size"
            />
          </div>

          <div className="sf-form-field">
            <span className="sf-label-subtext">Glow Blur Radius</span>
            <NumberSpinner
              value={currentGlowBlur}
              onChange={handleGlowBlurChange}
              min={0}
              max={30}
              step={2}
              unit="px"
              disabled={!currentGlow}
              aria-label="Glow blur radius"
            />
          </div>

          <div className="sf-form-field sf-form-field--checkbox">
            <label className="sf-checkbox-wrap">
              <input
                type="checkbox"
                checked={currentGlow}
                onChange={(e) => handleGlowToggle(e.target.checked)}
              />
              <span className="sf-label-subtext">Luminous Additive Glow</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

