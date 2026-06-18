import { useEffect } from "react";
import OBR, { buildShape } from "@owlbear-rodeo/sdk";
import { useStore } from "../store/useStore";

let reticleSpinInterval: ReturnType<typeof setInterval> | null = null;

export function useObrInit() {
  const setIdentity = useStore((state) => state.setIdentity);
  const setPrimaryTarget = useStore((state) => state.setPrimaryTarget);

  useEffect(() => {
    if (OBR.isAvailable) {
      OBR.onReady(async () => {
        // 1. Set the user identity
        const playerColor = await OBR.player.getColor();
        const playerRole = await OBR.player.getRole();
        setIdentity(playerColor, playerRole);

        // 2. Register our Custom Toolbar Icon
        OBR.tool.create({
          id: "spellforge-tool",
          icons: [
            {
              // We will need a real SVG path here eventually!
              icon: "/icon.svg",
              label: "SpellForge",
            },
          ],
          defaultMode: "spellforge-cast-mode",
        });

        // 3. Register the behavior when our tool is active
        OBR.tool.createMode({
          id: "spellforge-cast-mode",
          icons: [
            {
              icon: "/icon.svg",
              label: "Cast Spells",
              filter: { activeTools: ["spellforge-tool"] },
            },
          ],
          // A: Make the cursor change to a pointer hand when hovering over tokens!
          cursors: [
            {
              cursor: "pointer",
              filter: {
                target: [
                  { key: "layer", value: "CHARACTER", coordinator: "||" },
                  { key: "layer", value: "MOUNT", coordinator: "||" },
                  { key: "layer", value: "PROP" },
                ],
              },
            },
          ],
          // B: Draw the temporary targeting reticle on click
          async onToolClick(_context, event) {
            // 1. Determine exactly where to place the reticle
            let clickPosition = event.pointerPosition;
            let attachedTokenId = undefined;

            if (event.target) {
              clickPosition = event.target.position;
              attachedTokenId = event.target.id;
            }
            setPrimaryTarget(clickPosition);
            // 2. Clear existing targeting reticles AND stop the old animation loop
            await OBR.scene.local.deleteItems(["spellforge-target-reticle"]);
            if (reticleSpinInterval) {
              clearInterval(reticleSpinInterval);
              reticleSpinInterval = null;
            }

            // 3. Create a "SpellForge" aesthetic reticle (A dashed magical ring)
            const reticleBuilder = buildShape()
              .shapeType("CIRCLE")
              .width(180) // Slightly larger than the token
              .height(180)
              .position(clickPosition)
              .fillOpacity(0)
              .strokeColor("#9b59b6") // A cool arcane purple!
              .strokeWidth(6)
              .strokeDash([40, 20]) // This creates the broken lines/crosshair look
              .layer("ATTACHMENT")
              .locked(true)
              .disableHit(true)
              .id("spellforge-target-reticle");

            // 4. 'Glue' it to the token if one was clicked
            if (attachedTokenId) {
              reticleBuilder.attachedTo(attachedTokenId);
            }

            const reticle = reticleBuilder.build();

            // 5. Draw it on the map
            await OBR.scene.local.addItems([reticle]);

            // 6. Start the spinning animation!
            let currentRotation = 0;
            reticleSpinInterval = setInterval(async () => {
              currentRotation += 2; // Rotate 2 degrees every frame

              // We use updateItems to silently rotate the shape without redrawing it
              await OBR.scene.local.updateItems(["spellforge-target-reticle"], (items) => {
                for (const item of items) {
                  item.rotation = currentRotation;
                }
              });
            }, 40); // 40ms equals roughly 25 frames per second
          },
        });
      }); // <-- This closes OBR.onReady
    }
  }, [setIdentity]); // <-- This closes useEffect
} // <-- This closes the useObrInit function
