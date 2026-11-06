import OBR, { buildShape, buildPath, type Item } from '@owlbear-rodeo/sdk';
import type { CastPayload } from '@/types/spellSchema';

const TEMPORARY_ITEM_KEY = 'spellforge/isTemporary';

/**
 * Renders temporary native VFX items directly into the Owlbear Rodeo local scene
 * without bloating room metadata or cluttering the persistent canvas.
 */
export async function renderObrSceneCast(payload: CastPayload): Promise<void> {
  if (typeof OBR === 'undefined' || !OBR?.isAvailable) {
    return;
  }

  const { spell, origin, destination } = payload;
  const target = destination ?? origin;
  const itemsToAdd: Item[] = [];
  const durationMs = spell.mechanics.reduce((max, m) => Math.max(max, m.durationMs), 500);

  const mainMechanic = spell.mechanics[0];
  const primaryVfx =
    mainMechanic?.triggers?.onCast?.vfx?.[0] ??
    mainMechanic?.triggers?.onImpact?.vfx?.[0] ?? {
      color: '#ff6600',
      size: 30,
    };
  const color = primaryVfx.color || '#ff6600';
  const size = Math.max(40, (primaryVfx.size || 20) * 3);

  try {
    if (mainMechanic?.type === 'beam' || mainMechanic?.type === 'projectile') {
      const startX = origin.x;
      const startY = origin.y;
      const endX = target.x;
      const endY = target.y;

      const pathCommands: [number, number, number][] = [
        [0, 0, 0],
        [1, endX - startX, endY - startY],
      ];

      if (mainMechanic.type === 'beam') {
        // Multi-layered luminous energy beam
        // Layer 1: Wide outer glow path
        const outerGlow = buildPath()
          .commands(pathCommands)
          .position({ x: startX, y: startY })
          .strokeColor(color)
          .strokeOpacity(0.3)
          .strokeWidth(40)
          .fillOpacity(0)
          .layer('ATTACHMENT')
          .metadata({ [TEMPORARY_ITEM_KEY]: true })
          .build();

        // Layer 2: Main energy body
        const energyBody = buildPath()
          .commands(pathCommands)
          .position({ x: startX, y: startY })
          .strokeColor(color)
          .strokeOpacity(0.8)
          .strokeWidth(16)
          .fillOpacity(0)
          .layer('ATTACHMENT')
          .metadata({ [TEMPORARY_ITEM_KEY]: true })
          .build();

        // Layer 3: Superheated central core
        const centralCore = buildPath()
          .commands(pathCommands)
          .position({ x: startX, y: startY })
          .strokeColor('#ffffff')
          .strokeOpacity(1.0)
          .strokeWidth(4)
          .fillOpacity(0)
          .layer('ATTACHMENT')
          .metadata({ [TEMPORARY_ITEM_KEY]: true })
          .build();

        itemsToAdd.push(outerGlow, energyBody, centralCore);
      } else {
        const projLine = buildPath()
          .commands(pathCommands)
          .position({ x: startX, y: startY })
          .strokeColor(color)
          .strokeOpacity(0.85)
          .strokeWidth(12)
          .fillOpacity(0)
          .layer('ATTACHMENT')
          .metadata({ [TEMPORARY_ITEM_KEY]: true })
          .build();
        itemsToAdd.push(projLine);
      }

      // Impact burst at destination
      const impactShape = buildShape()
        .shapeType('CIRCLE')
        .position({ x: endX - size / 2, y: endY - size / 2 })
        .width(size)
        .height(size)
        .fillColor(color)
        .fillOpacity(0.6)
        .strokeColor(color)
        .strokeOpacity(0.9)
        .layer('ATTACHMENT')
        .metadata({ [TEMPORARY_ITEM_KEY]: true })
        .build();

      itemsToAdd.push(impactShape);
    } else if (mainMechanic?.type === 'cone') {
      const startX = origin.x;
      const startY = origin.y;
      const endX = target.x;
      const endY = target.y;
      const angle = Math.atan2(endY - startY, endX - startX);
      const coneLength = Math.max(120, Math.hypot(endX - startX, endY - startY) || 200);
      const halfAngle = (26.5 * Math.PI) / 180;

      const leftX = coneLength * Math.cos(angle - halfAngle);
      const leftY = coneLength * Math.sin(angle - halfAngle);
      const rightX = coneLength * Math.cos(angle + halfAngle);
      const rightY = coneLength * Math.sin(angle + halfAngle);

      const conePath = buildPath()
        .commands([
          [0, 0, 0],
          [1, leftX, leftY],
          [1, rightX, rightY],
          [1, 0, 0],
        ])
        .position({ x: startX, y: startY })
        .fillColor(color)
        .fillOpacity(0.45)
        .strokeColor(color)
        .strokeOpacity(0.8)
        .strokeWidth(4)
        .layer('ATTACHMENT')
        .metadata({ [TEMPORARY_ITEM_KEY]: true })
        .build();

      itemsToAdd.push(conePath);
    } else {
      // Radial burst / aura / default
      const centerX = target.x;
      const centerY = target.y;

      const burstShape = buildShape()
        .shapeType('CIRCLE')
        .position({ x: centerX - size, y: centerY - size })
        .width(size * 2)
        .height(size * 2)
        .fillColor(color)
        .fillOpacity(0.4)
        .strokeColor(color)
        .strokeOpacity(0.85)
        .strokeWidth(6)
        .layer('ATTACHMENT')
        .metadata({ [TEMPORARY_ITEM_KEY]: true })
        .build();

      itemsToAdd.push(burstShape);
    }

    if (itemsToAdd.length > 0) {
      await OBR.scene.local.addItems(itemsToAdd);

      setTimeout(async () => {
        try {
          if (OBR?.isAvailable) {
            await OBR.scene.local.deleteItems(itemsToAdd.map((i) => i.id));
          }
        } catch (cleanupErr) {
          console.warn('[ObrSceneRenderer] Failed to prune temp items', cleanupErr);
        }
      }, durationMs);
    }
  } catch (err) {
    console.warn('[ObrSceneRenderer] Error creating scene items', err);
  }
}
