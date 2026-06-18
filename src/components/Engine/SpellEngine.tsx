import { useEffect, useRef } from "react";
import OBR, { buildShape } from "@owlbear-rodeo/sdk";
import { useStore } from "../../store/useStore";

export function SpellEngine() {
  const activeEmitters = useStore((state) => state.activeEmitters);
  const removeParticleEmitter = useStore((state) => state.removeParticleEmitter);

  const processedEmitters = useRef<Set<string>>(new Set());

  useEffect(() => {
    activeEmitters.forEach((emitter) => {
      if (processedEmitters.current.has(emitter.emitterIdentifier)) return;

      processedEmitters.current.add(emitter.emitterIdentifier);

      let spellShapeBuilder = buildShape()
        .fillColor(emitter.spellColorHex)
        .fillOpacity(0.5)
        .strokeColor(emitter.spellColorHex)
        .strokeOpacity(0.8)
        .layer("ATTACHMENT");

      const pixelSize = emitter.spellSize * 150;

      if (emitter.spellType === "line-ray") {
        spellShapeBuilder = spellShapeBuilder
          .shapeType("RECTANGLE")
          .position({ x: emitter.originCoordinateX, y: emitter.originCoordinateY - 20 })
          .width(pixelSize)
          .height(40);
      } else {
        spellShapeBuilder = spellShapeBuilder
          .shapeType("CIRCLE")
          .position({ x: emitter.originCoordinateX, y: emitter.originCoordinateY })
          .width(pixelSize)
          .height(pixelSize);
      }

      const spellShape = spellShapeBuilder.build();

      try {
        OBR.scene.items.addItems([spellShape]).then(() => {
          setTimeout(() => {
            try {
              OBR.scene.items.deleteItems([spellShape.id]);
            } catch (cleanupError) {
              console.error("Failed to clean up spell shape:", cleanupError);
            }
            removeParticleEmitter(emitter.emitterIdentifier);
            processedEmitters.current.delete(emitter.emitterIdentifier);
          }, emitter.emitterLifeSpan * 1000);
        });
      } catch (error) {
        console.error("Failed to add spell shape to scene:", error);
      }
    });
  }, [activeEmitters, removeParticleEmitter]);

  return null;
}