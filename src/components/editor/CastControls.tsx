import React from 'react';
import { Play, RotateCcw, Crosshair, Sparkles } from 'lucide-react';
import { useSpellStore } from '@/store/useSpellStore';
import { Button } from '@/components/ui/Button';

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

  const handleCast = async () => {
    if (!activeSpell) return;
    await castSpell(activeSpell);
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

