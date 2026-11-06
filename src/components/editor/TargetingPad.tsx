import React, { useRef, useState } from 'react';
import {
  Crosshair,
  MapPin,
  Trash2,
  Users,
  User,
  Sparkles,
  MousePointer,
} from 'lucide-react';
import { useSpellStore } from '@/store/useSpellStore';
import { Button } from '@/components/ui/Button';
import { useObrTargeting } from '@/hooks/useObrTargeting';
import type { Point2D } from '@/types/spellSchema';

export const TargetingPad: React.FC = () => {
  const originSpot = useSpellStore((s) => s.originSpot);
  const setOriginSpot = useSpellStore((s) => s.setOriginSpot);
  const targetSpots = useSpellStore((s) => s.targetSpots);
  const addTargetSpot = useSpellStore((s) => s.addTargetSpot);
  const removeTargetSpot = useSpellStore((s) => s.removeTargetSpot);
  const clearTargetSpots = useSpellStore((s) => s.clearTargetSpots);

  const {
    isObrAvailable,
    originTokenInfo,
    activateObrTool,
    useSelectedAsOrigin,
    addSelectedAsTargets,
  } = useObrTargeting();

  const [mode, setMode] = useState<'origin' | 'target'>('origin');
  const padRef = useRef<HTMLDivElement>(null);

  const handlePadClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.sf-pad-marker')) {
      return;
    }

    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const clickPoint: Point2D = {
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
    };

    if (mode === 'origin' || !originSpot) {
      setOriginSpot(clickPoint);
      setMode('target');
    } else {
      addTargetSpot(clickPoint);
    }
  };

  const applyPreset = (preset: 'self' | 'single' | 'multi') => {
    const width = padRef.current?.clientWidth || 400;
    const height = padRef.current?.clientHeight || 240;
    const cx = Math.round(width / 2);
    const cy = Math.round(height / 2);

    if (preset === 'self') {
      setOriginSpot({ x: cx, y: cy });
      clearTargetSpots();
    } else if (preset === 'single') {
      setOriginSpot({ x: Math.round(width * 0.25), y: cy });
      clearTargetSpots();
      addTargetSpot({ x: Math.round(width * 0.75), y: cy });
    } else if (preset === 'multi') {
      setOriginSpot({ x: Math.round(width * 0.2), y: cy });
      clearTargetSpots();
      addTargetSpot({ x: Math.round(width * 0.7), y: Math.round(height * 0.25) });
      addTargetSpot({ x: Math.round(width * 0.8), y: cy });
      addTargetSpot({ x: Math.round(width * 0.7), y: Math.round(height * 0.75) });
    }
  };

  return (
    <div className="sf-targeting-pad-container" aria-label="Targeting & Reticles Controller">
      {/* OBR Token Integration Bar */}
      {isObrAvailable && (
        <div className="sf-obr-target-bar">
          <div className="sf-obr-bar-col">
            <span className="sf-obr-col-title">Map Token Origin:</span>
            <div className="sf-btn-row">
              <Button
                type="button"
                size="sm"
                variant="primary"
                icon={<User size={13} />}
                onClick={() => useSelectedAsOrigin()}
                title="Set the currently selected map token as Caster Origin"
              >
                Use Selected Token
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                icon={<MousePointer size={13} />}
                onClick={() => activateObrTool('origin')}
                title="Click on the Owlbear map or token to set Origin"
              >
                Pick on Map
              </Button>
            </div>
          </div>

          <div className="sf-obr-bar-col">
            <span className="sf-obr-col-title">Map Token Targets:</span>
            <div className="sf-btn-row">
              <Button
                type="button"
                size="sm"
                variant="primary"
                icon={<Users size={13} />}
                onClick={() => addSelectedAsTargets()}
                title="Add all currently selected map tokens as Targets"
              >
                + Add Selected Tokens
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                icon={<Crosshair size={13} />}
                onClick={() => activateObrTool('target')}
                title="Click on the Owlbear map or tokens to add Targets"
              >
                + Pick on Map
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Target Status Cards */}
      <div className="sf-targets-summary">
        <div className="sf-summary-card sf-summary-card--origin">
          <div className="sf-summary-header">
            <MapPin size={14} className="sf-icon-origin" />
            <span className="sf-summary-label">Origin (Caster):</span>
          </div>
          <span className="sf-summary-val">
            {originTokenInfo?.tokenName ? (
              <span className="sf-token-badge">{originTokenInfo.tokenName}</span>
            ) : originSpot ? (
              `(${originSpot.x}, ${originSpot.y})`
            ) : (
              <span className="sf-dim">Not set</span>
            )}
          </span>
        </div>

        <div className="sf-summary-card sf-summary-card--target">
          <div className="sf-summary-header">
            <Crosshair size={14} className="sf-icon-target" />
            <span className="sf-summary-label">Destinations ({targetSpots.length}):</span>
          </div>
          <span className="sf-summary-val">
            {targetSpots.length === 0 ? (
              <span className="sf-dim">None (Self / Radius only)</span>
            ) : (
              `${targetSpots.length} target${targetSpots.length > 1 ? 's' : ''}`
            )}
          </span>
          {targetSpots.length > 0 && (
            <button
              type="button"
              className="sf-clear-btn"
              onClick={clearTargetSpots}
              title="Clear all targets"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Testing Pad Toolbar */}
      <div className="sf-pad-toolbar">
        <div className="sf-pad-mode-group">
          <Button
            type="button"
            size="sm"
            variant={mode === 'origin' ? 'primary' : 'secondary'}
            icon={<MapPin size={13} />}
            onClick={() => setMode('origin')}
            title="Next click places the caster Origin"
          >
            Origin Mode
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === 'target' ? 'primary' : 'secondary'}
            icon={<Crosshair size={13} />}
            onClick={() => setMode('target')}
            title="Next clicks add spell Target destinations"
          >
            + Target Mode
          </Button>
        </div>

        <div className="sf-preset-pills">
          <button
            type="button"
            className="sf-pill-btn"
            onClick={() => applyPreset('self')}
            title="Single-point spell (Self / Aura / Burst)"
          >
            Self
          </button>
          <button
            type="button"
            className="sf-pill-btn"
            onClick={() => applyPreset('single')}
            title="Two-point spell (Projectile / Beam / Slide)"
          >
            Beam / Bolt
          </button>
          <button
            type="button"
            className="sf-pill-btn"
            onClick={() => applyPreset('multi')}
            title="Multi-point spell (Chain / Multi-target)"
          >
            Chain
          </button>
        </div>
      </div>

      {/* Interactive Visual Canvas Pad */}
      <div
        ref={padRef}
        className="sf-targeting-pad"
        onClick={handlePadClick}
        title="Click anywhere to place Origin or Targets"
      >
        <svg className="sf-pad-svg-layer">
          {originSpot &&
            targetSpots.map((tgt, i) => (
              <line
                key={`line-${i}`}
                x1={originSpot.x}
                y1={originSpot.y}
                x2={tgt.x}
                y2={tgt.y}
                className="sf-pad-ray"
              />
            ))}
        </svg>

        {/* Origin Marker */}
        {originSpot && (
          <div
            className="sf-pad-marker sf-pad-marker--origin"
            style={{ left: `${originSpot.x}px`, top: `${originSpot.y}px` }}
            title={`Origin: (${originSpot.x}, ${originSpot.y})`}
          >
            <div className="sf-pad-marker__dot" />
            <span className="sf-pad-marker__label">Origin</span>
          </div>
        )}

        {/* Target Markers */}
        {targetSpots.map((tgt, i) => (
          <div
            key={`target-${i}`}
            className="sf-pad-marker sf-pad-marker--target"
            style={{ left: `${tgt.x}px`, top: `${tgt.y}px` }}
            onClick={(e) => {
              e.stopPropagation();
              removeTargetSpot(i);
            }}
            title={`Target ${i + 1}: (${tgt.x}, ${tgt.y}) - Click to remove`}
          >
            <div className="sf-pad-marker__dot" />
            <span className="sf-pad-marker__label">T{i + 1}</span>
          </div>
        ))}

        {!originSpot && (
          <div className="sf-pad-empty-hint">
            <Sparkles size={16} />
            <span>Click to place Origin point</span>
          </div>
        )}
      </div>
    </div>
  );
};
