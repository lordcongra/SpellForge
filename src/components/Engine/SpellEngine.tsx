import { useEffect, useRef } from "react";
import OBR, { buildShape } from "@owlbear-rodeo/sdk";
import { useStore } from "../../store/useStore";

export function SpellEngine() {
  const activeEmitters = useStore((state) => state.activeEmitters);
  const removeParticleEmitter = useStore((state) => state.removeParticleEmitter);

  // We use a ref to keep track of which spells we've already drawn
  // so we don't accidentally draw duplicates when React re-renders.
  const processedEmitters = useRef<Set<string>>(new Set());

  useEffect(() => {
    activeEmitters.forEach((emitter) => {
      if (processedEmitters.current.has(emitter.emitterIdentifier)) return;

      // Mark as processed immediately
      processedEmitters.current.add(emitter.emitterIdentifier);

      // 1. Build a native Owlbear Rodeo shape
      // 1. Determine which primitive shape to build based on the spell type
      // 1. Determine which primitive shape to build based on the spell type
      let primitiveShapeBuilder = buildShape()
        .fillColor(emitter.spellColorHex) // Dynamic Color from State!
        .fillOpacity(0.5)
        .strokeColor(emitter.spellColorHex)
        .strokeOpacity(0.8)
        .layer("ATTACHMENT");

      // Standard OBR grid square is 150px
      const pixelSize = emitter.spellSize * 150;

      if (emitter.spellType === "primitive-line-ray") {
        // Build a ray projecting to the right using dynamic size length, 40px thick
        primitiveShapeBuilder = primitiveShapeBuilder
          .shapeType("RECTANGLE")
          .position({ x: emitter.originCoordinateX, y: emitter.originCoordinateY - 20 })
          .width(pixelSize)
          .height(40);
      } else {
        // Default to Token Burst circle using dynamic size diameter
        primitiveShapeBuilder = primitiveShapeBuilder
          .shapeType("CIRCLE")
          .position({ x: emitter.originCoordinateX, y: emitter.originCoordinateY })
          .width(pixelSize)
          .height(pixelSize);
      }

      const primitiveBurst = primitiveShapeBuilder.build();

      // 2. Add it locally to the scene (only visible to the person casting for now)
      OBR.scene.items.addItems([primitiveBurst]).then(() => {
        // 3. Set a timer to clean up the spell when the duration expires
        setTimeout(() => {
          OBR.scene.items.deleteItems([primitiveBurst.id]);
          removeParticleEmitter(emitter.emitterIdentifier);
          processedEmitters.current.delete(emitter.emitterIdentifier);
        }, emitter.emitterLifeSpan * 1000);
      });
    });
  }, [activeEmitters, removeParticleEmitter]);

  // This component doesn't have a UI, it's just pure logic!
  return null;
}
