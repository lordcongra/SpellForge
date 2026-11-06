import React, { useEffect, useState } from 'react';
import { BookOpen, Wand2, Crosshair } from 'lucide-react';
import { useSpellStore } from '@/store/useSpellStore';
import { SpellList } from './SpellList';
import { SpellInspector } from './SpellInspector';
import { CastControls } from './CastControls';
import { TargetRoster } from './TargetRoster';
import { useObrTargeting } from '@/hooks/useObrTargeting';
import { Button } from '@/components/ui/Button';
import './SpellForgeEditor.css';

export type EditorTab = 'library' | 'editor' | 'cast';

export const SpellForgeEditor: React.FC = () => {
  const spells = useSpellStore((s) => s.spells);
  const activeSpell = useSpellStore((s) => s.activeSpell);
  const setActiveSpell = useSpellStore((s) => s.setActiveSpell);
  const castSpell = useSpellStore((s) => s.castSpell);

  const [activeTab, setActiveTab] = useState<EditorTab>('editor');
  const [isClickToCastActive, setIsClickToCastActive] = useState(false);

  const { isObrAvailable, isToolActive, activateObrTool } = useObrTargeting();

  // Auto-select first spell if none selected
  useEffect(() => {
    if (!activeSpell && spells.length > 0) {
      setActiveSpell(spells[0]);
    }
  }, [activeSpell, spells, setActiveSpell]);

  // Handle click-to-cast anywhere on the workspace
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isClickToCastActive || !activeSpell) return;

    // Do not trigger if clicking inside an interactive UI control
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('textarea') ||
      target.closest('.sf-spell-list') ||
      target.closest('.sf-inspector') ||
      target.closest('.sf-cast-controls') ||
      target.closest('.sf-target-roster') ||
      target.closest('.sf-editor-tabs')
    ) {
      return;
    }

    const clickPoint = { x: e.clientX, y: e.clientY };
    const centerOrigin = {
      x: Math.round(window.innerWidth / 2),
      y: Math.round(window.innerHeight / 2),
    };

    castSpell(activeSpell, centerOrigin, clickPoint);
  };

  return (
    <div
      className={`sf-editor-container ${isClickToCastActive ? 'sf-editor--crosshair' : ''}`}
      onClick={handleCanvasClick}
    >
      {/* Segmented View Tabs */}
      <nav className="sf-editor-tabs" aria-label="Editor Navigation Tabs">
        <button
          type="button"
          className={`sf-tab-btn ${activeTab === 'library' ? 'sf-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          <BookOpen size={14} />
          <span>Library</span>
        </button>
        <button
          type="button"
          className={`sf-tab-btn ${activeTab === 'editor' ? 'sf-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          <Wand2 size={14} />
          <span>Spell Editor</span>
        </button>
        <button
          type="button"
          className={`sf-tab-btn ${activeTab === 'cast' ? 'sf-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('cast')}
        >
          <Crosshair size={14} />
          <span>Cast & Targets</span>
        </button>
      </nav>

      {/* Active Tab Panel */}
      <div className="sf-editor-tab-body">
        {activeTab === 'library' && (
          <div className="sf-tab-panel sf-tab-panel--library">
            <SpellList onSelectSpell={() => setActiveTab('editor')} />
          </div>
        )}

        {activeTab === 'editor' && (
          <div className="sf-tab-panel sf-tab-panel--editor">
            <main className="sf-editor-main">
              <SpellInspector />
            </main>
          </div>
        )}

        {activeTab === 'cast' && (
          <div className="sf-tab-panel sf-tab-panel--cast">
            <div className="sf-cast-view">
              <div className="sf-cast-view__header">
                <div>
                  <h3 className="sf-section-title">Tactical Target Deck & Cast</h3>
                  <p className="sf-section-desc">
                    1-click token center targeting and dynamic tactical deck.
                  </p>
                </div>
                {isObrAvailable && (
                  <Button
                    type="button"
                    size="sm"
                    variant={isToolActive ? 'primary' : 'secondary'}
                    icon={<Crosshair size={14} />}
                    onClick={() => activateObrTool('target')}
                    title="Activate map reticle tool in Owlbear Rodeo"
                  >
                    {isToolActive ? 'OBR Tool Active' : 'Map Click Tool'}
                  </Button>
                )}
              </div>

              <TargetRoster />

              <div className="sf-cast-view__controls">
                <CastControls
                  isClickToCastActive={isClickToCastActive}
                  onCanvasClickToCastToggle={setIsClickToCastActive}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
