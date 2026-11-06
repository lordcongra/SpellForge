import React, { useState, useMemo } from 'react';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { useSpellStore } from '@/store/useSpellStore';
import { Button } from '@/components/ui/Button';
import { renderSpellIcon } from './spellIconHelper';
import type { SpellDefinition, ShapeCategory } from '@/types/spellSchema';

const CATEGORIES: Array<{ id: 'all' | ShapeCategory; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'arcane', label: 'Arcane' },
  { id: 'elemental', label: 'Elemental' },
  { id: 'divine', label: 'Divine' },
  { id: 'combat', label: 'Combat' },
];

export interface SpellListProps {
  onSelectSpell?: () => void;
}

export const SpellList: React.FC<SpellListProps> = ({ onSelectSpell }) => {
  const spells = useSpellStore((s) => s.spells);
  const activeSpell = useSpellStore((s) => s.activeSpell);
  const setActiveSpell = useSpellStore((s) => s.setActiveSpell);
  const saveSpell = useSpellStore((s) => s.saveSpell);
  const deleteSpell = useSpellStore((s) => s.deleteSpell);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ShapeCategory>('all');

  const filteredSpells = useMemo(() => {
    return spells.filter((spell) => {
      const matchesCategory =
        selectedCategory === 'all' || spell.category === selectedCategory;
      const matchesSearch =
        spell.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (spell.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [spells, selectedCategory, searchQuery]);

  const handleCreateNewSpell = () => {
    const newId = `spell-${Date.now()}`;
    const newSpell: SpellDefinition = {
      id: newId,
      name: 'New Spell',
      description: 'A newly forged spell effect.',
      category: 'arcane',
      castRange: 400,
      cooldownMs: 800,
      icon: 'Sparkles',
      mechanics: [
        {
          id: `mech-${Date.now()}-proj`,
          type: 'projectile',
          name: 'Mystic Bolt',
          durationMs: 400,
          params: { speed: 600, arcHeight: 0 },
          triggers: {
            onCast: {
              vfx: [
                {
                  id: `vfx-${Date.now()}-cast`,
                  shapeId: 'sparkle',
                  color: '#818cf8',
                  particleCount: 15,
                  size: 14,
                  speed: 3,
                  lifetimeMs: 400,
                  spreadAngle: 360,
                  glow: true,
                  glowBlur: 8,
                  opacity: 1,
                },
              ],
              spawnMechanicIds: [],
            },
            onImpact: {
              vfx: [
                {
                  id: `vfx-${Date.now()}-impact`,
                  shapeId: 'star',
                  color: '#6366f1',
                  particleCount: 25,
                  size: 18,
                  speed: 6,
                  lifetimeMs: 500,
                  spreadAngle: 360,
                  glow: true,
                  glowBlur: 12,
                  opacity: 1,
                },
              ],
              spawnMechanicIds: [],
            },
          },
        },
      ],
    };

    saveSpell(newSpell);
    setActiveSpell(newSpell);
    onSelectSpell?.();
  };

  const handleDeleteSpell = (e: React.MouseEvent, spellId: string) => {
    e.stopPropagation();
    deleteSpell(spellId);
  };

  return (
    <aside className="sf-spell-list" aria-label="Spell Catalog">
      <div className="sf-spell-list__header">
        <div className="sf-spell-list__title-row">
          <h2 className="sf-spell-list__title">Spellbook</h2>
          <span className="sf-spell-list__badge">{spells.length} Spells</span>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={handleCreateNewSpell}
          isFullWidth
        >
          Create Spell
        </Button>
      </div>

      <div className="sf-spell-list__search-bar">
        <Search size={14} className="sf-spell-list__search-icon" />
        <input
          type="text"
          className="sf-spell-list__search-input"
          placeholder="Search spells..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="sf-spell-list__search-clear"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="sf-spell-list__filter-chips" role="tablist" aria-label="Spell Categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={selectedCategory === cat.id}
            className={`sf-chip ${selectedCategory === cat.id ? 'sf-chip--active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="sf-spell-list__items">
        {filteredSpells.length === 0 ? (
          <div className="sf-spell-list__empty">
            <p>No spells found matching criteria.</p>
          </div>
        ) : (
          filteredSpells.map((spell) => {
            const isSelected = activeSpell?.id === spell.id;
            return (
              <div
                key={spell.id}
                role="button"
                tabIndex={0}
                className={`sf-spell-item ${isSelected ? 'sf-spell-item--active' : ''}`}
                onClick={() => {
                  setActiveSpell(spell);
                  onSelectSpell?.();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveSpell(spell);
                    onSelectSpell?.();
                  }
                }}
              >
                <div className="sf-spell-item__icon-wrapper">
                  {renderSpellIcon(spell.icon, 18)}
                </div>
                <div className="sf-spell-item__info">
                  <div className="sf-spell-item__title-row">
                    <span className="sf-spell-item__name">{spell.name}</span>
                    <span className={`sf-tag sf-tag--${spell.category}`}>
                      {spell.category}
                    </span>
                  </div>
                  <div className="sf-spell-item__meta">
                    <span>{spell.mechanics.length} mechanic{spell.mechanics.length === 1 ? '' : 's'}</span>
                    <span>•</span>
                    <span>{spell.castRange}ft range</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="sf-spell-item__delete-btn"
                  title={`Delete ${spell.name}`}
                  aria-label={`Delete ${spell.name}`}
                  onClick={(e) => handleDeleteSpell(e, spell.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

