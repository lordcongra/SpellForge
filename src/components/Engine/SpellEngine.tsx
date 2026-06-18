import { useEffect, useRef } from "react";
import OBR, { buildShape, buildPath } from "@owlbear-rodeo/sdk";
import type { Item } from "@owlbear-rodeo/sdk";
import { useStore } from "../../store/useStore";

export function SpellEngine() {
  const activeEmitters = useStore((state) => state.activeEmitters);
  const removeParticleEmitter = useStore((state) => state.removeParticleEmitter);

  const processedEmitters = useRef<Set<string>>(new Set());

  useEffect(() => {
    activeEmitters.forEach((emitter) => {
      if (processedEmitters.current.has(emitter.emitterIdentifier)) return;

      processedEmitters.current.add(emitter.emitterIdentifier);

      let spellItem: Item;
      const pixelSize = emitter.spellSize * 150;

      try {
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
              [1, endX - startX, endY - startY],
            ])
            .position({ x: startX, y: startY })
            .strokeColor(emitter.spellColorHex)
            .strokeOpacity(0.8)
            .strokeWidth(40)
            .fillOpacity(0)
            .layer("ATTACHMENT")
            .metadata({ "spellforge/isTemporary": true })
            .build();
        } else if (emitter.shapePrimitive === "CONE") {
          const startX = emitter.originCoordinateX;
          const startY = emitter.originCoordinateY;
          let endX = emitter.destinationCoordinateX;
          let endY = emitter.destinationCoordinateY;

          if (endX === undefined || endY === undefined) {
            endX = startX + pixelSize;
            endY = startY;
          }

          const angleInRadians = Math.atan2(endY - startY, endX - startX);
          const coneLength = pixelSize; // Force length to match spell config size, target is just for aiming
          
          // 53.13 degrees is roughly standard for a VTT cone (width equals length)
          // Half of that is ~26.5 degrees converted to radians
          const halfAngleInRadians = (26.5 * Math.PI) / 180;

          // Calculate exact vertices relative to the 0,0 origin
          const leftTargetX = coneLength * Math.cos(angleInRadians - halfAngleInRadians);
          const leftTargetY = coneLength * Math.sin(angleInRadians - halfAngleInRadians);
          const rightTargetX = coneLength * Math.cos(angleInRadians + halfAngleInRadians);
          const rightTargetY = coneLength * Math.sin(angleInRadians + halfAngleInRadians);

          spellItem = buildPath()
            .commands([
              [0, 0, 0], // Move to origin
              [1, leftTargetX, leftTargetY], // Line to left corner
              [1, rightTargetX, rightTargetY], // Line to right corner
              [1, 0, 0], // Close back to origin
            ])
            .position({ x: startX, y: startY })
            .fillColor(emitter.spellColorHex)
            .fillOpacity(0.5)
            .strokeColor(emitter.spellColorHex)
            .strokeOpacity(0.8)
            .layer("ATTACHMENT")
            .metadata({ "spellforge/isTemporary": true })
            .build();
        } else if (emitter.shapePrimitive === "PLUS") {
          const burstX = emitter.destinationCoordinateX ?? emitter.originCoordinateX;
          const burstY = emitter.destinationCoordinateY ?? emitter.originCoordinateY;
          const halfSize = pixelSize / 2;
          const thickness = pixelSize / 6;

          spellItem = buildPath()
            .commands([
              [0, thickness, halfSize],
              [1, thickness, thickness],
              [1, halfSize, thickness],
              [1, halfSize, -thickness],
              [1, thickness, -thickness],
              [1, thickness, -halfSize],
              [1, -thickness, -halfSize],
              [1, -thickness, -thickness],
              [1, -halfSize, -thickness],
              [1, -halfSize, thickness],
              [1, -thickness, thickness],
              [1, -thickness, halfSize],
              [1, thickness, halfSize], // Close shape
            ])
            .position({ x: burstX, y: burstY })
            .fillColor(emitter.spellColorHex)
            .fillOpacity(0.5)
            .strokeColor(emitter.spellColorHex)
            .strokeOpacity(0.8)
            .layer("ATTACHMENT")
            .metadata({ "spellforge/isTemporary": true })
            .build();
        } else if (emitter.shapePrimitive === "STAR") {
          const burstX = emitter.destinationCoordinateX ?? emitter.originCoordinateX;
          const burstY = emitter.destinationCoordinateY ?? emitter.originCoordinateY;
          const outerRadius = pixelSize / 2;
          const innerRadius = outerRadius / 2.5; // Controls the depth of the star spikes
          const numberOfPoints = 10; // 5 outer points, 5 inner valleys
          const angleStep = (Math.PI * 2) / numberOfPoints;
          
          // Strictly typing the OBR command array signature
          const starCommands: [number, number, number][] = [];

          for (let index = 0; index <= numberOfPoints; index++) {
            const currentRadius = index % 2 === 0 ? outerRadius : innerRadius;
            const currentAngle = index * angleStep - Math.PI / 2; // Subtract PI/2 to point top spike up
            
            const pointX = currentRadius * Math.cos(currentAngle);
            const pointY = currentRadius * Math.sin(currentAngle);

            if (index === 0) {
              starCommands.push([0, pointX, pointY]);
            } else {
              starCommands.push([1, pointX, pointY]);
            }
          }

          spellItem = buildPath()
            .commands(starCommands)
            .position({ x: burstX, y: burstY })
            .fillColor(emitter.spellColorHex)
            .fillOpacity(0.5)
            .strokeColor(emitter.spellColorHex)
            .strokeOpacity(0.8)
            .layer("ATTACHMENT")
            .metadata({ "spellforge/isTemporary": true })
            .build();
        } else {
          // Default: CIRCLE
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
            .metadata({ "spellforge/isTemporary": true })
            .build();
        }

        // Apply item to scene and schedule cleanup
        OBR.scene.items.addItems([spellItem]).then(() => {
          setTimeout(() => {
            try {
              OBR.scene.items.deleteItems([spellItem.id]);
            } catch (cleanupError) {
              console.error("Failed to clean up spell shape:", cleanupError);
            }
            removeParticleEmitter(emitter.emitterIdentifier);
            processedEmitters.current.delete(emitter.emitterIdentifier);
          }, emitter.emitterLifeSpan);
        });
      } catch (renderingError) {
        console.error("Failed to calculate or render spell geometry:", renderingError);
      }
    });
  }, [activeEmitters, removeParticleEmitter]);

  return null;
}