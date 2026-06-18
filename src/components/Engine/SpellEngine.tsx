import { useEffect, useRef } from "react";
import OBR, { buildShape, buildPath } from "@owlbear-rodeo/sdk";
import { useStore } from "../../store/useStore";

export function SpellEngine() {
  const activeEmitters = useStore((state) => state.activeEmitters);
  const removeParticleEmitter = useStore((state) => state.removeParticleEmitter);

  const processedEmitters = useRef<Set<string>>(new Set());

  useEffect(() => {
    activeEmitters.forEach((emitter) => {
      if (processedEmitters.current.has(emitter.emitterIdentifier)) return;

      processedEmitters.current.add(emitter.emitterIdentifier);

      let spellItem;
      const pixelSize = emitter.spellSize * 150;

      if (emitter.shapePrimitive === "RECTANGLE" || emitter.shapePrimitive === "LINE") {
        
        const startX = emitter.originCoordinateX;
        const startY = emitter.originCoordinateY;
        let endX = emitter.destinationCoordinateX;
        let endY = emitter.destinationCoordinateY;

        if (endX === undefined || endY === undefined) {
          endX = startX + pixelSize;
          endY = startY;
        }

        spellItem = buildPath()
          .commands([
            [0, 0, 0], 
            [1, endX - startX, endY - startY]
          ])
          .position({ x: startX, y: startY })
          .strokeColor(emitter.spellColorHex)
          .strokeOpacity(0.8)
          .strokeWidth(40) 
          .fillOpacity(0)
          .layer("ATTACHMENT")
          .build();

      } else {
        const burstX = emitter.destinationCoordinateX ?? emitter.originCoordinateX;
        const burstY = emitter.destinationCoordinateY ?? emitter.originCoordinateY;

        spellItem = buildShape()
          .shapeType("CIRCLE")
          .position({ x: burstX, y: burstY })
          .width(pixelSize)
          .height(pixelSize)
          .fillColor(emitter.spellColorHex)
          .fillOpacity(0.5)
          .strokeColor(emitter.spellColorHex)
          .strokeOpacity(0.8)
          .layer("ATTACHMENT")
          .build();
      }

      try {
        OBR.scene.items.addItems([spellItem]).then(() => {
          setTimeout(() => {
            try {
              OBR.scene.items.deleteItems([spellItem.id]);
            } catch (cleanupError) {
              console.error("Failed to clean up spell shape:", cleanupError);
            }
            removeParticleEmitter(emitter.emitterIdentifier);
            processedEmitters.current.delete(emitter.emitterIdentifier);
          }, emitter.emitterLifeSpan); // No longer multiplied! Runs exactly in ms.
        });
      } catch (error) {
        console.error("Failed to add spell shape to scene:", error);
      }
    });
  }, [activeEmitters, removeParticleEmitter]);

  return null;
}