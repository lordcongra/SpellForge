import { useRef } from "react";
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
  const configuredDurationMs = useStore((state) => state.configuredDurationMs);
  const keepTargetsAfterCast = useStore((state) => state.keepTargetsAfterCast);

  const setActiveSpell = useStore((state) => state.setActiveSpell);
  const setConfiguredColorHex = useStore((state) => state.setConfiguredColorHex);
  const setConfiguredSize = useStore((state) => state.setConfiguredSize);
  const setConfiguredDurationMs = useStore((state) => state.setConfiguredDurationMs);
  const setKeepTargetsAfterCast = useStore((state) => state.setKeepTargetsAfterCast);
  const addParticleEmitters = useStore((state) => state.addParticleEmitters);
  const clearTargetPositions = useStore((state) => state.clearTargetPositions);
  const deleteSpell = useStore((state) => state.deleteSpell);
  const importSpells = useStore((state) => state.importSpells);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSpellClick = async (spellId: string) => {
    setActiveSpell(spellId);
    if (OBR.isAvailable) {
      try {
        await OBR.tool.activateTool("spellforge/tool");
      } catch (error) {
        console.warn("Failed to activate SpellForge tool:", error);
      }
    }
  };

  const handleOpenEditor = async (spellId?: string) => {
    const url = spellId ? `/SpellForge/?view=editor&spellId=${spellId}` : `/SpellForge/?view=editor`;
    await OBR.modal.open({ id: "spellforge-editor", url: url, height: 650, width: 500 });
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(availableSpells, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "spellforge-spells.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSpells = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedSpells)) {
          importSpells(importedSpells);
          OBR.notification.show("Spells imported successfully!", "SUCCESS");
        }
      } catch (err) {
        console.error("Invalid JSON file:", err);
      }
    };
    reader.readAsText(file);
  };

  const handleCastSpell = async () => {
    // DIAGNOSTIC ALERT 1: Proves the button actually received your click
    window.alert(`SpellForge Debug: Cast clicked! You have ${targetPositions.length} targets.`);
    
    if (!activeSpellIdentifier || targetPositions.length === 0) {
      window.alert("SpellForge Debug: Cast aborted. No spell active or 0 targets.");
      return;
    }

    try {
      const spellDefinition = availableSpells.find((s) => s.spellIdentifier === activeSpellIdentifier);
      if (!spellDefinition) return;

      const casterOrigin = targetPositions[0];
      let newEmitters: ParticleConfiguration[] = [];

      newEmitters.push({
        emitterIdentifier: `${activeSpellIdentifier}-${casterOrigin.targetIdentifier}-${Date.now()}`,
        shapePrimitive: spellDefinition.shapePrimitive,
        animationBehavior: spellDefinition.animationBehavior,
        originCoordinateX: casterOrigin.x,
        originCoordinateY: casterOrigin.y,
        particleCount: spellDefinition.particleCount || 50,
        emitterLifeSpan: configuredDurationMs,
        spellColorHex: configuredColorHex,
        spellSize: configuredSize,
      });

      addParticleEmitters(newEmitters);

      // DIAGNOSTIC ALERT 2: Proves the data was sent to the particle engine successfully
      window.alert("SpellForge Debug: Data sent to Particle Engine!");

      if (!keepTargetsAfterCast) {
        const reticleIdentifiers = targetPositions.map((t) => t.targetIdentifier);
        await OBR.scene.local.deleteItems(reticleIdentifiers);
        clearTargetPositions();
      }
    } catch (error) {
      window.alert(`SpellForge Debug Error: ${error}`);
    }
  };

  return (
    <div className="spell-panel">
      
      <div className="spell-panel__management-bar">
        <Button variant="secondary" onClick={() => handleOpenEditor()} style={{ padding: "4px 8px", fontSize: "12px" }}>+ New</Button>
        <Button variant="secondary" onClick={handleExportJSON} style={{ padding: "4px 8px", fontSize: "12px" }}>Export</Button>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()} style={{ padding: "4px 8px", fontSize: "12px" }}>Import</Button>
        <input type="file" ref={fileInputRef} onChange={handleImportJSON} accept=".json" style={{ display: "none" }} />
      </div>

      <h2 className="spell-panel__header">Spellbook</h2>

      <div className="spell-panel__list">
        {availableSpells.map((spell) => {
          const isActive = activeSpellIdentifier === spell.spellIdentifier;

          return (
            <div
              key={spell.spellIdentifier}
              className={`spell-card ${isActive ? "spell-card--active" : ""}`}
              onClick={() => handleSpellClick(spell.spellIdentifier)}
              role="button"
              tabIndex={0}
            >
              <div className="spell-card__info">
                <p className="spell-card__title">{spell.spellName}</p>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <button className="text-button" onClick={(e) => { e.stopPropagation(); handleOpenEditor(spell.spellIdentifier); }}>Edit</button>
                  <button className="text-button text-button--danger" onClick={(e) => { e.stopPropagation(); deleteSpell(spell.spellIdentifier); }}>Delete</button>
                </div>
              </div>
              <div
                className="spell-card__color-indicator"
                style={{ backgroundColor: spell.spellColorHex }}
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
          <label className="spell-customization__label">Size:</label>
          <div className="spell-customization__input-group">
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={configuredSize}
              onChange={(e) => setConfiguredSize(Number(e.target.value))}
              className="spell-customization__number-input"
            />
            <span className="spell-customization__unit">Grid</span>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={configuredSize}
              onChange={(e) => setConfiguredSize(Number(e.target.value))}
              className="spell-customization__slider"
            />
          </div>
        </div>

        <div className="spell-customization__row">
          <label className="spell-customization__label">Duration:</label>
          <div className="spell-customization__input-group">
            <input
              type="number"
              min="100"
              step="100"
              value={configuredDurationMs}
              onChange={(e) => setConfiguredDurationMs(Number(e.target.value))}
              className="spell-customization__number-input"
            />
            <span className="spell-customization__unit">ms</span>
            <input
              type="range"
              min="1"
              max="60"
              step="1"
              value={Math.round(configuredDurationMs / 1000)}
              onChange={(e) => setConfiguredDurationMs(Number(e.target.value) * 1000)}
              className="spell-customization__slider"
            />
          </div>
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