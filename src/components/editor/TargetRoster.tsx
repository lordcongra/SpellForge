import React from 'react';
import { User, Users, Crosshair, MousePointer, Trash2, Target } from 'lucide-react';
import { useSpellStore } from '@/store/useSpellStore';
import { Button } from '@/components/ui/Button';
import { useObrTargeting } from '@/hooks/useObrTargeting';
import './TargetRoster.css';

export const TargetRoster: React.FC = () => {
  const originSpot = useSpellStore((s) => s.originSpot);
  const setOriginSpot = useSpellStore((s) => s.setOriginSpot);
  const targetSpots = useSpellStore((s) => s.targetSpots);
  const removeTargetSpot = useSpellStore((s) => s.removeTargetSpot);

  const {
    isObrAvailable,
    originTokenInfo,
    activateObrTool,
    useSelectedAsOrigin,
    addSelectedAsTargets,
    clearAll,
  } = useObrTargeting();

  const handleClearOrigin = () => {
    setOriginSpot(null);
  };

  return (
    <div className="sf-target-roster" aria-label="Tactical Target Deck">
      {/* 1. Origin / Caster Card */}
      <div className="sf-roster-card sf-roster-card--origin">
        <div className="sf-roster-card__header">
          <div className="sf-roster-card__title">
            <span className="sf-roster-badge sf-roster-badge--origin">
              <User size={13} />
              <span>Caster Origin</span>
            </span>
          </div>
          {originSpot && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              icon={<Trash2 size={13} />}
              onClick={handleClearOrigin}
              title="Clear Origin"
              aria-label="Clear Origin"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="sf-roster-card__body">
          <div className="sf-roster-token-info">
            {originTokenInfo?.tokenName ? (
              <div className="sf-roster-entity">
                <span className="sf-roster-entity__name">{originTokenInfo.tokenName}</span>
                <span className="sf-roster-entity__coord">
                  ({originSpot?.x ?? 0}, {originSpot?.y ?? 0})
                </span>
              </div>
            ) : originSpot ? (
              <div className="sf-roster-entity">
                <span className="sf-roster-entity__name">Map Coordinate</span>
                <span className="sf-roster-entity__coord">
                  ({originSpot.x}, {originSpot.y})
                </span>
              </div>
            ) : (
              <div className="sf-roster-entity sf-roster-entity--empty">
                <span>Not set (Defaults to center map)</span>
              </div>
            )}
          </div>

          <div className="sf-roster-actions">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              icon={<MousePointer size={13} />}
              onClick={() => activateObrTool('origin')}
              title="Click on the Owlbear Rodeo map to select Origin"
            >
              Pick on Map
            </Button>
            {isObrAvailable && (
              <Button
                type="button"
                size="sm"
                variant="primary"
                icon={<User size={13} />}
                onClick={() => useSelectedAsOrigin()}
                title="Use the currently selected map token as Origin"
              >
                Use Selected Token
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Tactical Targets Roster */}
      <div className="sf-roster-card sf-roster-card--targets">
        <div className="sf-roster-card__header">
          <div className="sf-roster-card__title">
            <span className="sf-roster-badge sf-roster-badge--targets">
              <Target size={13} />
              <span>Active Targets</span>
            </span>
            <span className="sf-target-count-pill" title="Number of active targets">
              {targetSpots.length}
            </span>
          </div>
          {(originSpot || targetSpots.length > 0) && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              icon={<Trash2 size={13} />}
              onClick={clearAll}
              title="Clear all origins and targets"
            >
              Clear All
            </Button>
          )}
        </div>

        <div className="sf-roster-card__body">
          {targetSpots.length === 0 ? (
            <div className="sf-roster-empty">
              <Crosshair size={24} className="sf-roster-empty__icon" />
              <p>No targets selected. Spell will burst or target at caster.</p>
            </div>
          ) : (
            <ul className="sf-target-list" aria-label="Targets List">
              {targetSpots.map((spot, idx) => (
                <li key={`target-${idx}-${spot.x}-${spot.y}`} className="sf-target-item">
                  <div className="sf-target-item__info">
                    <span className="sf-target-item__index">#{idx + 1}</span>
                    <span className="sf-target-item__coord">
                      ({spot.x}, {spot.y})
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    icon={<Trash2 size={13} />}
                    onClick={() => removeTargetSpot(idx)}
                    title={`Remove target #${idx + 1}`}
                    aria-label={`Remove target #${idx + 1}`}
                  />
                </li>
              ))}
            </ul>
          )}

          <div className="sf-roster-actions">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              icon={<MousePointer size={13} />}
              onClick={() => activateObrTool('target')}
              title="Click on the map to add targets"
            >
              + Pick on Map
            </Button>
            {isObrAvailable && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                icon={<Users size={13} />}
                onClick={() => addSelectedAsTargets()}
                title="Add all currently selected map tokens as targets"
              >
                + Add Selected Tokens
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

