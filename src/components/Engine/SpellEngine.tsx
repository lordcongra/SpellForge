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
      const primitiveBurst = buildShape()
        .shapeType("CIRCLE")
        .position({ x: emitter.originCoordinateX, y: emitter.originCoordinateY })
        .width(300) // 1 square is typically 150px in OBR, so this is a 2x2 grid burst
        .height(300)
        .fillColor(emitter.spellColorHex)
        .fillOpacity(0.5)
        .strokeColor(emitter.spellColorHex)
        .strokeOpacity(0.8)
        .layer("ATTACHMENT") // Puts it above the map but below fog
        .build();

      // 2. Add it locally to the scene (only visible to the person casting for now)
      OBR.scene.local.addItems([primitiveBurst]).then(() => {
        
        // 3. Set a timer to clean up the spell when the duration expires
        setTimeout(() => {
          OBR.scene.local.deleteItems([primitiveBurst.id]);
          removeParticleEmitter(emitter.emitterIdentifier);
          processedEmitters.current.delete(emitter.emitterIdentifier);
        }, emitter.emitterLifeSpan * 1000);
        
      });
    });
  }, [activeEmitters, removeParticleEmitter]);

  // This component doesn't have a UI, it's just pure logic!
  return null; 
}