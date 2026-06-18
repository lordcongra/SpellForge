import { useStore } from "../../store/useStore";
import { Button } from "../Button/Button";
import type { ParticleConfiguration } from "../../store/storeTypes";
import "./SpellPanel.css";
import OBR from "@owlbear-rodeo/sdk";

export function SpellPanel() {
  const availableSpells = useStore((state) => state.availableSpells);
  const activeSpellIdentifier = useStore((state) => state.activeSpellIdentifier);
  const targetPositions = useStore((state) => state.targetPositions);
  const configuredColorHex = useStore((state) => state.configuredColorHex);
  const configuredSize = useStore((state) => state.configuredSize);
  const keepTargetsAfterCast = useStore((state) => state.keepTargetsAfterCast);

  const setActiveSpell = useStore((state) => state.setActiveSpell);
  const setConfiguredColorHex = useStore((state) => state.setConfiguredColorHex);
  const setConfiguredSize = useStore((state) => state.setConfiguredSize);
  const setKeepTargetsAfterCast = useStore((state) => state.setKeepTargetsAfterCast);
  const addParticleEmitters = useStore((state) => state.addParticleEmitters);
  const clearTargetPositions = useStore((state) => state.clearTargetPositions);

  const handleCastSpell = async () => {
    if (!activeSpellIdentifier) {
      console.warn("No spell selected!");
      return;
    }

    if (targetPositions.length === 0) {
      console.warn("No targets selected!");
      return;
    }

    try {
      const spellDefinition = availableSpells.find(
        (spell) => spell.spellIdentifier === activeSpellIdentifier
      );

      if (!spellDefinition) return;

      const casterOrigin = targetPositions[0];
      let newEmitters: ParticleConfiguration[] = [];

      if (spellDefinition.targetLogic === "CASTER_ONLY") {
        newEmitters.push({
          emitterIdentifier: `${activeSpellIdentifier}-${casterOrigin.targetIdentifier}-${Date.now()}`,
          shapePrimitive: spellDefinition.shapePrimitive,
          animationBehavior: spellDefinition.animationBehavior,
          originCoordinateX: casterOrigin.x,
          originCoordinateY: casterOrigin.y,
          particleCount: 50,
          emitterLifeSpan: spellDefinition.durationInSeconds,
          spellColorHex: configuredColorHex,
          spellSize: configuredSize,
        });
      } else if (spellDefinition.targetLogic === "ALL_SIMULTANEOUS") {
        newEmitters = targetPositions.map((target) => ({
          emitterIdentifier: `${activeSpellIdentifier}-${target.targetIdentifier}-${Date.now()}`,
          shapePrimitive: spellDefinition.shapePrimitive,
          animationBehavior: spellDefinition.animationBehavior,
          originCoordinateX: target.x,
          originCoordinateY: target.y,
          particleCount: 50,
          emitterLifeSpan: spellDefinition.durationInSeconds,
          spellColorHex: configuredColorHex,
          spellSize: configuredSize,
        }));
      } else if (spellDefinition.targetLogic === "CASTER_TO_TARGETS_SIMULTANEOUS") {
        const destinations = targetPositions.slice(1);
        
        if (destinations.length === 0) {
          newEmitters.push({
            emitterIdentifier: `${activeSpellIdentifier}-${casterOrigin.targetIdentifier}-${Date.now()}`,
            shapePrimitive: spellDefinition.shapePrimitive,
            animationBehavior: spellDefinition.animationBehavior,
            originCoordinateX: casterOrigin.x,
            originCoordinateY: casterOrigin.y,
            particleCount: 50,
            emitterLifeSpan: spellDefinition.durationInSeconds,
            spellColorHex: configuredColorHex,
            spellSize: configuredSize,
          });
        } else {
          newEmitters = destinations.map((destinationTarget) => ({
            emitterIdentifier: `${activeSpellIdentifier}-${destinationTarget.targetIdentifier}-${Date.now()}`,
            shapePrimitive: spellDefinition.shapePrimitive,
            animationBehavior: spellDefinition.animationBehavior,
            originCoordinateX: casterOrigin.x,
            originCoordinateY: casterOrigin.y,
            destinationCoordinateX: destinationTarget.x,
            destinationCoordinateY: destinationTarget.y,
            particleCount: 50,
            emitterLifeSpan: spellDefinition.durationInSeconds,
            spellColorHex: configuredColorHex,
            spellSize: configuredSize,
          }));
        }
      }

      addParticleEmitters(newEmitters);

      if (!keepTargetsAfterCast) {
        const reticleIdentifiers = targetPositions.map((t) => t.targetIdentifier);
        await OBR.scene.local.deleteItems(reticleIdentifiers);
        clearTargetPositions();
      }

    } catch (error) {
      console.error("Error casting spell:", error);
    }
  };

  return (
    <div className="spell-panel">
      <h2 className="spell-panel__header">Available Forms</h2>

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

      <div className="spell-customization">
        <h3 className="spell-customization__header">Spell Customization</h3>

        <div className="spell-customization__row">
          <label className="spell-customization__label">Color:</label>
          <input
            type="color"
            value={configuredColorHex}
            onChange={(e) => setConfiguredColorHex(e.target.value)}
            className="spell-customization__color-picker"
          />
        </div>

        <div className="spell-customization__row">
          <label className="spell-customization__label">Size: {configuredSize} Grids</label>
          <input
            type="range"
            min="1"
            max="8"
            value={configuredSize}
            onChange={(e) => setConfiguredSize(Number(e.target.value))}
            className="spell-customization__slider"
          />
        </div>
        
        <div className="spell-customization__row spell-customization__row--checkbox">
          <input
            type="checkbox"
            id="keep-targets-checkbox"
            checked={keepTargetsAfterCast}
            onChange={(e) => setKeepTargetsAfterCast(e.target.checked)}
          />
          <label htmlFor="keep-targets-checkbox">Keep targeting after cast</label>
        </div>
      </div>

      <div className="spell-panel__actions">
        <Button
          variant="primary"
          isFullWidth
          onClick={handleCastSpell}
          disabled={!activeSpellIdentifier || targetPositions.length === 0}
        >
          {targetPositions.length > 0 ? `Cast Spell (${targetPositions.length > 1 ? targetPositions.length - 1 : 1} Targets)` : "Select Targets First"}
        </Button>
      </div>
    </div>
  );
}