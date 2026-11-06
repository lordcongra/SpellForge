import React, { useState } from 'react';
import { Play, RotateCcw, Crosshair, Sparkles } from 'lucide-react';
import { useSpellStore } from '@/store/useSpellStore';
import { Button } from '@/components/ui/Button';
import { NumberSpinner } from '@/components/ui/NumberSpinner';
import type { Point2D } from '@/types/spellSchema';

interface CastControlsProps {
  onCanvasClickToCastToggle?: (enabled: boolean) => void;
  isClickToCastActive?: boolean;
}

export const CastControls: React.FC<CastControlsProps> = ({
  onCanvasClickToCastToggle,
  isClickToCastActive = false,
}) => {
  const activeSpell = useSpellStore((s) => s.activeSpell);
  const castSpell = useSpellStore((s) => s.castSpell);
  const activeTimelines = useSpellStore((s) => s.activeTimelines);
  const activeParticles = useSpellStore((s) => s.activeParticles);
  const clearParticles = useSpellStore((s) => s.clearParticles);

  const originSpot = useSpellStore((s) => s.originSpot);
  const setOriginSpot = useSpellStore((s) => s.setOriginSpot);
  const targetSpots = useSpellStore((s) => s.targetSpots);
  const setTargetSpots = useSpellStore((s) => s.setTargetSpots);

  const [useDestination, setUseDestination] = useState<boolean>(true);

  const currentOrigin: Point2D = originSpot ?? { x: 300, y: 300 };
  const destPoint: Point2D = targetSpots[0] ?? { x: 650, y: 300 };

  const handleDestinationChange = (x: number, y: number) => {
    const nextDest: Point2D = { x, y };
    if (targetSpots.length > 0) {
      setTargetSpots([nextDest, ...targetSpots.slice(1)]);
    } else {
      setTargetSpots([nextDest]);
    }
  };

  const handleCast = async () => {
    if (!activeSpell) return;
    if (useDestination) {
      if (targetSpots.length > 0) {
        for (const tgt of targetSpots) {
          await castSpell(activeSpell, currentOrigin, tgt);
        }
      } else {
        await castSpell(activeSpell, currentOrigin, destPoint);
      }
    } else {
      await castSpell(activeSpell, currentOrigin, undefined);
    }
  };

  const setPreset = (type: 'center' | 'beam' | 'diagonal') => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 800;
    const height = typeof window !== 'undefined' ? window.innerHeight : 600;
    const cx = Math.round(width / 2);
    const cy = Math.round(height / 2);

    if (type === 'center') {
      setOriginSpot({ x: cx, y: cy });
      setUseDestination(false);
      setTargetSpots([]);
    } else if (type === 'beam') {
      const o = { x: Math.max(50, cx - 250), y: cy };
      const d = { x: Math.min(width - 50, cx + 250), y: cy };
      setOriginSpot(o);
      setTargetSpots([d]);
      setUseDestination(true);
    } else if (type === 'diagonal') {
      const o = { x: Math.max(50, cx - 200), y: Math.max(50, cy - 150) };
      const d = { x: Math.min(width - 50, cx + 200), y: Math.min(height - 50, cy + 150) };
      setOriginSpot(o);
      setTargetSpots([d]);
      setUseDestination(true);
    }
  };

  return (
    <footer className="sf-cast-controls" aria-label="Cast Controls">
      <div className="sf-cast-controls__left">
        <div className="sf-cast-controls__spell-tag">
          <Sparkles size={16} className="sf-cast-controls__spell-icon" />
          <span className="sf-cast-controls__spell-name">
            {activeSpell ? activeSpell.name : 'No Spell Selected'}
          </span>
        </div>

        <div className="sf-cast-coords">
          <div className="sf-coord-group">
            <span className="sf-coord-label">Origin:</span>
            <NumberSpinner
              value={currentOrigin.x}
              onChange={(val) => setOriginSpot({ x: val, y: currentOrigin.y })}
              unit="X"
              aria-label="Origin X"
            />
            <NumberSpinner
              value={currentOrigin.y}
              onChange={(val) => setOriginSpot({ x: currentOrigin.x, y: val })}
              unit="Y"
              aria-label="Origin Y"
            />
          </div>

          <div className="sf-coord-group">
            <label className="sf-checkbox-wrap">
              <input
                type="checkbox"
                checked={useDestination}
                onChange={(e) => setUseDestination(e.target.checked)}
              />
              <span className="sf-coord-label">Dest:</span>
            </label>
            <NumberSpinner
              value={destPoint.x}
              onChange={(val) => handleDestinationChange(val, destPoint.y)}
              disabled={!useDestination}
              unit="X"
              aria-label="Destination X"
            />
            <NumberSpinner
              value={destPoint.y}
              onChange={(val) => handleDestinationChange(destPoint.x, val)}
              disabled={!useDestination}
              unit="Y"
              aria-label="Destination Y"
            />
          </div>
        </div>

        <div className="sf-preset-pills">
          <button
            type="button"
            className="sf-chip sf-chip--sm"
            onClick={() => setPreset('center')}
            title="Set origin to center, burst in place"
          >
            Center Burst
          </button>
          <button
            type="button"
            className="sf-chip sf-chip--sm"
            onClick={() => setPreset('beam')}
            title="Cast across horizontal line"
          >
            Horizontal Path
          </button>
          <button
            type="button"
            className="sf-chip sf-chip--sm"
            onClick={() => setPreset('diagonal')}
            title="Cast diagonally"
          >
            Diagonal Path
          </button>
        </div>
      </div>

      <div className="sf-cast-controls__right">
        {onCanvasClickToCastToggle && (
          <Button
            variant={isClickToCastActive ? 'primary' : 'secondary'}
            size="sm"
            icon={<Crosshair size={14} />}
            onClick={() => onCanvasClickToCastToggle(!isClickToCastActive)}
            title="Click anywhere on canvas to cast at that coordinate"
          >
            {isClickToCastActive ? 'Click-to-Cast: ON' : 'Click-to-Cast'}
          </Button>
        )}

        {activeParticles.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw size={14} />}
            onClick={clearParticles}
            title="Clear active particles"
            aria-label="Clear active particles"
          >
            Clear
          </Button>
        )}

        <div className="sf-cast-stats">
          <span className="sf-stat-badge" title="Active Timelines">
            {activeTimelines.length} active
          </span>
          <span className="sf-stat-badge" title="Simulated Particles">
            {activeParticles.length} particles
          </span>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Play size={16} />}
          disabled={!activeSpell}
          onClick={handleCast}
        >
          Cast Spell
        </Button>
      </div>
    </footer>
  );
};
