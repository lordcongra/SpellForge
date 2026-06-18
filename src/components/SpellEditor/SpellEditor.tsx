import { useState, useEffect } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { useStore } from "../../store/useStore";
import { Button } from "../Button/Button";
import type {
  SpellDefinition,
  ShapePrimitive,
  AnimationBehavior,
  TargetLogic,
} from "../../store/storeTypes";
import "./SpellEditor.css";

interface SpellEditorProps {
  editSpellId: string | null;
}

export function SpellEditor({ editSpellId }: SpellEditorProps) {
  const availableSpells = useStore((state) => state.availableSpells);
  const saveSpell = useStore((state) => state.saveSpell);

  const [formData, setFormData] = useState<SpellDefinition>({
    spellIdentifier: `spell-${Date.now()}`,
    spellName: "New Spell",
    spellColorHex: "#ffffff",
    secondaryColorHex: "",
    particleCount: 50,
    durationInMs: 2000,
    shapePrimitive: "CIRCLE",
    animationBehavior: "INSTANT",
    targetLogic: "CASTER_ONLY",
  });

  useEffect(() => {
    if (editSpellId) {
      const existingSpell = availableSpells.find((s) => s.spellIdentifier === editSpellId);
      if (existingSpell) setFormData(existingSpell);
    }
  }, [editSpellId, availableSpells]);

  const handleSave = async () => {
    saveSpell(formData);
    await OBR.broadcast.sendMessage("SPELLFORGE_SPELL_SAVED", formData, { destination: "LOCAL" });
    await OBR.modal.close("spellforge-editor");
  };

  const handleCancel = async () => {
    await OBR.modal.close("spellforge-editor");
  };

  return (
    <div className="spell-editor">
      <h2>{editSpellId ? "Edit Spell Blueprint" : "Create New Spell"}</h2>

      <div className="spell-editor__form">
        <label>
          Spell Name
          <input
            type="text"
            value={formData.spellName}
            onChange={(e) => setFormData({ ...formData, spellName: e.target.value })}
          />
        </label>

        <label>
          Identifier (Unique ID)
          <input
            type="text"
            value={formData.spellIdentifier}
            onChange={(e) => setFormData({ ...formData, spellIdentifier: e.target.value })}
            disabled={!!editSpellId}
          />
        </label>

        <div className="spell-editor__row">
          <label>
            Primary Color
            <div className="spell-editor__row" style={{ alignItems: "center", gap: "8px" }}>
              <input
                type="color"
                value={formData.spellColorHex}
                onChange={(e) => setFormData({ ...formData, spellColorHex: e.target.value })}
                className="spell-customization__color-picker"
              />
              <input
                type="text"
                value={formData.spellColorHex}
                onChange={(e) => setFormData({ ...formData, spellColorHex: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </label>
          <label>
            Secondary Color
            <div className="spell-editor__row" style={{ alignItems: "center", gap: "8px" }}>
              <input
                type="color"
                value={formData.secondaryColorHex || "#000000"}
                onChange={(e) => setFormData({ ...formData, secondaryColorHex: e.target.value })}
                className="spell-customization__color-picker"
              />
              <input
                type="text"
                value={formData.secondaryColorHex || ""}
                onChange={(e) => setFormData({ ...formData, secondaryColorHex: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </label>
        </div>

        <label>
          <div className="spell-editor__row" style={{ justifyContent: "space-between" }}>
            <span>Particle Density</span>
            <span style={{ color: "#a855f7", fontWeight: "bold" }}>{formData.particleCount} Sparks</span>
          </div>
          <span style={{ fontSize: "11px", color: "#888", fontWeight: "normal" }}>
            How many sparks fly when the spell goes off. Higher numbers look flashier but demand more processing power.
          </span>
          <input
            type="range"
            min="10"
            max="300"
            step="10"
            value={formData.particleCount}
            onChange={(e) => setFormData({ ...formData, particleCount: Number(e.target.value) })}
          />
        </label>

        <label>
          Duration (ms)
          <input
            type="number"
            value={formData.durationInMs}
            onChange={(e) => setFormData({ ...formData, durationInMs: Number(e.target.value) })}
          />
        </label>

        <label>
          Form (Shape)
          <select
            value={formData.shapePrimitive}
            onChange={(e) =>
              setFormData({ ...formData, shapePrimitive: e.target.value as ShapePrimitive })
            }
          >
            <option value="CIRCLE">Circle (Burst/Sphere)</option>
            <option value="RECTANGLE">Rectangle (Wall)</option>
            <option value="LINE">Line (Beam/Ray)</option>
            <option value="CONE">Cone</option>
            <option value="PLUS">Plus Shape</option>
            <option value="STAR">Star</option>
          </select>
        </label>

        <label>
          Animation Behavior
          <select
            value={formData.animationBehavior}
            onChange={(e) =>
              setFormData({ ...formData, animationBehavior: e.target.value as AnimationBehavior })
            }
          >
            <option value="INSTANT">Instant Appearance</option>
            <option value="EXPAND_OUTWARD">Expand Outward</option>
            <option value="CONTRACT_INWARD">Contract Inward</option>
            <option value="TRAVEL_PROJECTILE">Travel (Projectile)</option>
            <option value="TRAVEL_BEAM">Travel (Continuous Beam)</option>
            <option value="PULSE">Pulse</option>
          </select>
        </label>

        <label>
          Targeting Logic
          <select
            value={formData.targetLogic}
            onChange={(e) =>
              setFormData({ ...formData, targetLogic: e.target.value as TargetLogic })
            }
          >
            <option value="CASTER_ONLY">Caster Only (Self/Origin)</option>
            <option value="ALL_SIMULTANEOUS">All Targets Simultaneously</option>
            <option value="CASTER_TO_TARGETS_SIMULTANEOUS">Caster To Targets (Simultaneous)</option>
            <option value="CHAIN_SEQUENTIAL">Chain (Sequential)</option>
            <option value="WALL_CONNECTED">Wall (Connect all targets)</option>
          </select>
        </label>
      </div>

      <div className="spell-editor__actions">
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Blueprint
        </Button>
      </div>
    </div>
  );
}