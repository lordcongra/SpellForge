import { useEffect } from "react";
import OBR, { buildShape } from "@owlbear-rodeo/sdk";
import { useStore } from "../store/useStore";
import type { ParticleConfiguration, SpellDefinition } from "../store/storeTypes";

// Strict IDs to prevent OBR SDK namespace mismatches
const TOOL_ID = "spellforge/tool";
const ADD_MODE_ID = "spellforge/add-mode";
const REMOVE_MODE_ID = "spellforge/remove-mode";
const CLEAR_ACTION_ID = "spellforge/clear-action";
const CAST_ACTION_ID = "spellforge/cast-action";

// Explicit absolute path matching your Vite base to prevent 404 image errors
const ICON_PATH = "/SpellForge/icon.svg";

let activeReticleIdentifiers: string[] = [];
let reticleSpinInterval: ReturnType<typeof setInterval> | null = null;

function startGlobalReticleAnimation() {
  if (reticleSpinInterval) return;

  let currentRotation = 0;
  reticleSpinInterval = setInterval(async () => {
    if (activeReticleIdentifiers.length === 0) return;

    currentRotation += 2;
    try {
      await OBR.scene.local.updateItems(activeReticleIdentifiers, (items) => {
        for (const item of items) {
          item.rotation = currentRotation;
        }
      });
    } catch (error) {
      console.error("Error animating reticles:", error);
    }
  }, 40);
}

export function useObrInit() {
  const setIdentity = useStore((state) => state.setIdentity);
  const saveSpell = useStore((state) => state.saveSpell);

  useEffect(() => {
    if (OBR.isAvailable) {
      OBR.onReady(async () => {
        const playerColor = await OBR.player.getColor();
        const playerRole = await OBR.player.getRole();
        setIdentity(playerColor, playerRole);

        // Clean up orphaned temporary items from previous ungraceful exits/refreshes
        try {
          const orphanedItems = await OBR.scene.items.getItems(
            (item) => item.metadata["spellforge/isTemporary"] === true
          );
          if (orphanedItems.length > 0) {
            await OBR.scene.items.deleteItems(orphanedItems.map((i) => i.id));
          }
        } catch (cleanupError) {
          console.error("Failed to clean up orphaned items on init:", cleanupError);
        }

        startGlobalReticleAnimation();

        // Listen for the Modal saving a spell so we can update the main panel instantly
        OBR.broadcast.onMessage("SPELLFORGE_SPELL_SAVED", (event) => {
          const newSpell = event.data as SpellDefinition;
          saveSpell(newSpell);
        });

        // Register the main tool
        OBR.tool.create({
          id: TOOL_ID,
          icons: [{ icon: ICON_PATH, label: "SpellForge" }],
          defaultMode: ADD_MODE_ID,
        });

        // Mode 1: ADD TARGETS
        OBR.tool.createMode({
          id: ADD_MODE_ID,
          icons: [
            {
              icon: ICON_PATH,
              label: "Add Target(s)",
              filter: { activeTools: [TOOL_ID] }, // Strictly mapped to TOOL_ID
            },
          ],
          cursors: [{ cursor: "pointer" }],
          async onToolClick(_context, event) {
            try {
              const currentSelection = await OBR.player.getSelection();
              if (currentSelection && currentSelection.length > 0) {
                await OBR.player.deselect(currentSelection);
              }
            } catch (error) {
              console.error("Failed to clear native selection:", error);
            }

            let clickPosition = event.pointerPosition;
            let attachedTokenId = undefined;

            if (event.target) {
              clickPosition = event.target.position;
              attachedTokenId = event.target.id;
            }

            const currentState = useStore.getState();
            const isPrimaryTarget = currentState.targetPositions.length === 0;
            const reticleColor = isPrimaryTarget ? "#9b59b6" : "#00e5ff";
            const newReticleIdentifier = `spellforge-target-reticle-${Date.now()}`;

            currentState.addTargetPosition({
              targetIdentifier: newReticleIdentifier,
              x: clickPosition.x,
              y: clickPosition.y,
            });

            activeReticleIdentifiers.push(newReticleIdentifier);

            const reticleBuilder = buildShape()
              .shapeType("CIRCLE")
              .width(130)
              .height(130)
              .position(clickPosition)
              .fillOpacity(0)
              .strokeColor(reticleColor)
              .strokeOpacity(0.65)
              .strokeWidth(5)
              .strokeDash([30, 15])
              .layer("ATTACHMENT")
              .locked(true)
              .disableHit(true)
              .id(newReticleIdentifier)
              .metadata({ "spellforge/isTemporary": true }); // Stamp it for garbage collection

            if (attachedTokenId) {
              reticleBuilder.attachedTo(attachedTokenId);
            }

            await OBR.scene.local.addItems([reticleBuilder.build()]);
          },
        });

        // Mode 2: REMOVE TARGETS
        OBR.tool.createMode({
          id: REMOVE_MODE_ID,
          icons: [
            {
              icon: ICON_PATH,
              label: "Remove Target",
              filter: { activeTools: [TOOL_ID] },
            },
          ],
          cursors: [{ cursor: "crosshair" }],
          async onToolClick(_context, event) {
            const currentState = useStore.getState();
            const clickPosition = event.pointerPosition;

            const targetToRemove = currentState.targetPositions.find(
              (target) => Math.hypot(target.x - clickPosition.x, target.y - clickPosition.y) <= 65
            );

            if (targetToRemove) {
              try {
                await OBR.scene.local.deleteItems([targetToRemove.targetIdentifier]);
                activeReticleIdentifiers = activeReticleIdentifiers.filter(
                  (id) => id !== targetToRemove.targetIdentifier
                );
                currentState.removeTargetPosition(targetToRemove.targetIdentifier);
              } catch (error) {
                console.error("Failed to remove target reticle:", error);
              }
            }
          },
        });

        // Action 1: CLEAR ALL TARGETS
        OBR.tool.createAction({
          id: CLEAR_ACTION_ID,
          icons: [
            {
              icon: ICON_PATH,
              label: "Clear All Targets",
              filter: { activeTools: [TOOL_ID] },
            },
          ],
          onClick: async () => {
            if (activeReticleIdentifiers.length > 0) {
              await OBR.scene.local.deleteItems(activeReticleIdentifiers);
              activeReticleIdentifiers = [];
              useStore.getState().clearTargetPositions();
            }
          },
        });

        // Action 2: CAST SPELLS
        OBR.tool.createAction({
          id: CAST_ACTION_ID,
          icons: [
            {
              icon: ICON_PATH,
              label: "Cast Selected Spell",
              filter: { activeTools: [TOOL_ID] },
            },
          ],
          onClick: async () => {
            const currentState = useStore.getState();
            const {
              activeSpellIdentifier,
              targetPositions,
              availableSpells,
              configuredColorHex,
              configuredSize,
              configuredDurationMs,
              keepTargetsAfterCast,
              addParticleEmitters,
              clearTargetPositions,
            } = currentState;

            if (!activeSpellIdentifier || targetPositions.length === 0) {
              await OBR.notification.show("Please select a spell and map target.", "WARNING");
              return;
            }

            const spellDefinition = availableSpells.find(
              (spell) => spell.spellIdentifier === activeSpellIdentifier
            );

            if (!spellDefinition) return;

            let newEmitters: ParticleConfiguration[] = [];
            const casterOrigin = targetPositions[0];

            if (spellDefinition.targetLogic === "CASTER_ONLY") {
              newEmitters.push({
                emitterIdentifier: `${activeSpellIdentifier}-${casterOrigin.targetIdentifier}-${Date.now()}`,
                shapePrimitive: spellDefinition.shapePrimitive,
                animationBehavior: spellDefinition.animationBehavior,
                originCoordinateX: casterOrigin.x,
                originCoordinateY: casterOrigin.y,
                particleCount: 50,
                emitterLifeSpan: configuredDurationMs,
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
                emitterLifeSpan: configuredDurationMs,
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
                  emitterLifeSpan: configuredDurationMs,
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
                  emitterLifeSpan: configuredDurationMs,
                  spellColorHex: configuredColorHex,
                  spellSize: configuredSize,
                }));
              }
            }

            addParticleEmitters(newEmitters);

            if (!keepTargetsAfterCast) {
              await OBR.scene.local.deleteItems(activeReticleIdentifiers);
              activeReticleIdentifiers = [];
              clearTargetPositions();
            }
          },
        });
      });
    }
  }, [setIdentity, saveSpell]);
}