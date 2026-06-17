import { useStore } from "../../store/useStore";
import { Button } from "../Button/Button";
import "./SpellPanel.css";
import OBR from "@owlbear-rodeo/sdk";

export function SpellPanel() {
  const availableSpells = useStore((state) => state.availableSpells);
  const activeSpellIdentifier = useStore((state) => state.activeSpellIdentifier);
  const setActiveSpell = useStore((state) => state.setActiveSpell);

const handleCastSpell = async () => {
    if (!activeSpellIdentifier) return;

    try {
      // 1. Get the IDs of whatever the user currently has selected on the map
      const selectedItemIds = await OBR.player.getSelection();

      if (!selectedItemIds || selectedItemIds.length === 0) {
        console.warn("No token selected! Please select a token to act as the origin.");
        return;
      }

      // 2. Fetch the full item data from the scene using those IDs
      const selectedItems = await OBR.scene.items.getItems(selectedItemIds);

      // 3. Grab the first selected item to be our "caster"
      const casterToken = selectedItems[0];

      console.log(`Casting [${activeSpellIdentifier}] from token:`, casterToken.name);
      console.log("Origin coordinates:", { x: casterToken.position.x, y: casterToken.position.y });

    } catch (error) {
      console.error("Error retrieving token data from OBR:", error);
    }
  };
  return (
    <div className="spell-panel">
      <h2 className="spell-panel__header">Available Primitives</h2>
      
      <div className="spell-panel__list">
        {availableSpells.map((spell) => {
          const isActive = activeSpellIdentifier === spell.spellIdentifier;

          return (
            <div
              key={spell.spellIdentifier}
              className={`spell-card ${isActive ? "spell-card--active" : ""}`}
              onClick={() => setActiveSpell(spell.spellIdentifier)}
              role="button"
              tabIndex={0}
            >
              <div className="spell-card__info">
                <p className="spell-card__title">{spell.spellName}</p>
                <p className="spell-card__meta">Duration: {spell.durationInSeconds}s</p>
              </div>
              <div
                className="spell-card__color-indicator"
                style={{ backgroundColor: spell.spellColorHex }}
                title={`Color: ${spell.spellColorHex}`}
              />
            </div>
          );
        })}
      </div>

      <div className="spell-panel__actions">
        <Button 
          variant="primary" 
          isFullWidth 
          onClick={handleCastSpell}
          disabled={!activeSpellIdentifier}
        >
          Cast Selected Spell
        </Button>
      </div>
    </div>
  );
}