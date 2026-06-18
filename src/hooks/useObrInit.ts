import { useEffect } from "react";
import OBR, { buildShape } from "@owlbear-rodeo/sdk";
import { useStore } from "../store/useStore";

// Module-level state to track reticle animations without querying OBR constantly
let activeReticleIdentifiers: string[] = [];
let reticleSpinInterval: ReturnType<typeof setInterval> | null = null;

// Helper function to maintain the spinning animation loop
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

  useEffect(() => {
    if (OBR.isAvailable) {
      OBR.onReady(async () => {
        const playerColor = await OBR.player.getColor();
        const playerRole = await OBR.player.getRole();
        setIdentity(playerColor, playerRole);

        // Start the global animation loop immediately
        startGlobalReticleAnimation();

        OBR.tool.create({
          id: "spellforge-tool",
          icons: [{ icon: "/icon.svg", label: "SpellForge" }],
          defaultMode: "spellforge-add-mode",
        });

        // Mode 1: ADD TARGETS
        OBR.tool.createMode({
          id: "spellforge-add-mode",
          icons: [
            {
              icon: "/icon.svg",
              label: "Add Target",
              filter: { activeTools: ["spellforge-tool"] },
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

            const newReticleIdentifier = `spellforge-target-reticle-${Date.now()}`;

            // Save to Zustand
            useStore.getState().addTargetPosition({
              targetIdentifier: newReticleIdentifier,
              x: clickPosition.x,
              y: clickPosition.y,
            });

            // Add to animation tracker
            activeReticleIdentifiers.push(newReticleIdentifier);

            const reticleBuilder = buildShape()
              .shapeType("CIRCLE")
              .width(180)
              .height(180)
              .position(clickPosition)
              .fillOpacity(0)
              .strokeColor("#9b59b6")
              .strokeWidth(6)
              .strokeDash([40, 20])
              .layer("ATTACHMENT")
              .locked(true)
              .disableHit(true) // Keeps it from blocking tokens
              .id(newReticleIdentifier);

            if (attachedTokenId) {
              reticleBuilder.attachedTo(attachedTokenId);
            }

            await OBR.scene.local.addItems([reticleBuilder.build()]);
          },
        });

        // Mode 2: REMOVE TARGETS
        OBR.tool.createMode({
          id: "spellforge-remove-mode",
          icons: [
            {
              icon: "/icon.svg",
              label: "Remove Target",
              filter: { activeTools: ["spellforge-tool"] },
            },
          ],
          cursors: [{ cursor: "crosshair" }],
          async onToolClick(_context, event) {
            const currentState = useStore.getState();
            const clickPosition = event.pointerPosition;

            // Find any target within a 90px radius (our 180px wide reticle)
            const targetToRemove = currentState.targetPositions.find(
              (target) => Math.hypot(target.x - clickPosition.x, target.y - clickPosition.y) <= 90
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
          id: "spellforge-clear-action",
          icons: [
            {
              icon: "/icon.svg",
              label: "Clear All Targets",
              filter: { activeTools: ["spellforge-tool"] },
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
          id: "spellforge-cast-action",
          icons: [
            {
              icon: "/icon.svg",
              label: "Cast Selected Spell",
              filter: { activeTools: ["spellforge-tool"] },
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

            const newEmitters = targetPositions.map((target) => ({
              emitterIdentifier: `${activeSpellIdentifier}-${target.targetIdentifier}-${Date.now()}`,
              spellType: activeSpellIdentifier,
              originCoordinateX: target.x,
              originCoordinateY: target.y,
              particleCount: 50,
              emitterLifeSpan: spellDefinition.durationInSeconds,
              spellColorHex: configuredColorHex,
              spellSize: configuredSize,
            }));

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
  }, [setIdentity]);
}