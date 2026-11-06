import { useEffect, useState, useCallback, useRef } from 'react';
import OBR, { buildShape, type Item } from '@owlbear-rodeo/sdk';
import { useSpellStore } from '@/store/useSpellStore';
import type { Point2D } from '@/types/spellSchema';

const TOOL_ID = 'spellforge/tool';
const MODE_ID = 'spellforge/mode';
const RETICLE_METADATA_KEY = 'spellforge/isReticle';

export interface TargetMetadata {
  tokenId?: string;
  tokenName?: string;
}

/**
 * Calculates the center point of an Owlbear Rodeo item based on dimensions and scale.
 * Defaults to 150px cell size if dimensions cannot be inferred.
 */
export function getTokenCenter(token: Item, defaultCellSize = 150): Point2D {
  const rawWidth =
    (token as { image?: { width?: number } }).image?.width ??
    (token as { text?: { width?: number } }).text?.width ??
    (token as { shape?: { width?: number } }).shape?.width ??
    (token as { width?: number }).width ??
    defaultCellSize;

  const rawHeight =
    (token as { image?: { height?: number } }).image?.height ??
    (token as { text?: { height?: number } }).text?.height ??
    (token as { shape?: { height?: number } }).shape?.height ??
    (token as { height?: number }).height ??
    defaultCellSize;

  const scaleX = (token as { scale?: { x?: number } }).scale?.x ?? 1;
  const scaleY = (token as { scale?: { y?: number } }).scale?.y ?? 1;

  const w = rawWidth * Math.abs(scaleX);
  const h = rawHeight * Math.abs(scaleY);

  return {
    x: Math.round(token.position.x + w / 2),
    y: Math.round(token.position.y + h / 2),
  };
}

export function useObrTargeting() {
  const [isObrAvailable, setIsObrAvailable] = useState<boolean>(
    () => typeof OBR !== 'undefined' && Boolean(OBR?.isAvailable)
  );
  const [isToolActive, setIsToolActive] = useState<boolean>(false);
  const [targetingRole, setTargetingRole] = useState<'origin' | 'target'>('target');
  const [originTokenInfo, setOriginTokenInfo] = useState<TargetMetadata | null>(null);

  const originSpot = useSpellStore((s) => s.originSpot);
  const setOriginSpot = useSpellStore((s) => s.setOriginSpot);
  const targetSpots = useSpellStore((s) => s.targetSpots);
  const addTargetSpot = useSpellStore((s) => s.addTargetSpot);
  const removeTargetSpot = useSpellStore((s) => s.removeTargetSpot);
  const clearTargetSpots = useSpellStore((s) => s.clearTargetSpots);

  const targetingRoleRef = useRef(targetingRole);
  const originSpotRef = useRef(originSpot);
  const targetSpotsRef = useRef(targetSpots);
  const originTokenRef = useRef(originTokenInfo);
  const activeReticleIdsRef = useRef<string[]>([]);

  useEffect(() => {
    targetingRoleRef.current = targetingRole;
  }, [targetingRole]);

  useEffect(() => {
    originSpotRef.current = originSpot;
  }, [originSpot]);

  useEffect(() => {
    targetSpotsRef.current = targetSpots;
  }, [targetSpots]);

  useEffect(() => {
    originTokenRef.current = originTokenInfo;
  }, [originTokenInfo]);

  // Clean up reticles from the local scene
  const cleanupReticles = useCallback(async () => {
    if (!OBR?.isAvailable) return;
    try {
      const items = await OBR.scene.local.getItems(
        (item: Item) => item.metadata[RETICLE_METADATA_KEY] === true
      );
      if (items.length > 0) {
        await OBR.scene.local.deleteItems(items.map((i) => i.id));
      }
      activeReticleIdsRef.current = [];
    } catch (e) {
      console.warn('[useObrTargeting] Failed to prune reticle items', e);
    }
  }, []);

  // Sync scene reticles in OBR scene.local
  const syncSceneReticles = useCallback(
    async (origin: Point2D | null, targets: Point2D[]) => {
      if (!OBR?.isAvailable) return;
      try {
        await cleanupReticles();
        const reticleItems: Item[] = [];
        const reticleRadius = 40;
        const reticleDiameter = reticleRadius * 2;

        if (origin) {
          const originBuilder = buildShape()
            .id('spellforge-reticle-origin')
            .width(reticleDiameter)
            .height(reticleDiameter)
            .shapeType('CIRCLE')
            .position({ x: origin.x - reticleRadius, y: origin.y - reticleRadius })
            .fillColor('#9b59b6')
            .fillOpacity(0)
            .strokeColor('#9b59b6')
            .strokeWidth(5)
            .strokeDash([30, 15])
            .layer('ATTACHMENT')
            .locked(true)
            .disableHit(true)
            .metadata({ [RETICLE_METADATA_KEY]: true, role: 'origin' });

          if (originTokenRef.current?.tokenId) {
            originBuilder.attachedTo(originTokenRef.current.tokenId);
          }
          reticleItems.push(originBuilder.build());
        }

        targets.forEach((tgt, index) => {
          const targetItem = buildShape()
            .id(`spellforge-reticle-target-${index}`)
            .width(reticleDiameter)
            .height(reticleDiameter)
            .shapeType('CIRCLE')
            .position({ x: tgt.x - reticleRadius, y: tgt.y - reticleRadius })
            .fillColor('#00e5ff')
            .fillOpacity(0)
            .strokeColor('#00e5ff')
            .strokeWidth(5)
            .strokeDash([30, 15])
            .layer('ATTACHMENT')
            .locked(true)
            .disableHit(true)
            .metadata({ [RETICLE_METADATA_KEY]: true, role: 'target', index })
            .build();
          reticleItems.push(targetItem);
        });

        if (reticleItems.length > 0) {
          activeReticleIdsRef.current = reticleItems.map((i) => i.id);
          await OBR.scene.local.addItems(reticleItems);
        } else {
          activeReticleIdsRef.current = [];
        }
      } catch (e) {
        console.warn('[useObrTargeting] Failed to update scene reticles', e);
      }
    },
    [cleanupReticles]
  );

  useEffect(() => {
    if (isObrAvailable) {
      syncSceneReticles(originSpot, targetSpots);
    }
  }, [originSpot, targetSpots, isObrAvailable, syncSceneReticles]);

  // Animated spinning rotation loop: 40ms interval rotating active reticles
  useEffect(() => {
    if (!isObrAvailable) return;
    const interval = setInterval(async () => {
      const ids = activeReticleIdsRef.current;
      if (!ids || ids.length === 0) return;
      try {
        if (OBR?.isAvailable) {
          await OBR.scene.local.updateItems(ids, (items) => {
            for (const item of items) {
              item.rotation = ((item.rotation ?? 0) + 2) % 360;
            }
          });
        }
      } catch {
        // Suppress benign update errors during scene switching
      }
    }, 40);

    return () => {
      clearInterval(interval);
    };
  }, [isObrAvailable]);

  // Register OBR tool and listeners
  useEffect(() => {
    let isSubscribed = true;
    if (typeof OBR === 'undefined' || !OBR?.isAvailable) {
      return;
    }

    OBR.onReady(async () => {
      if (!isSubscribed) return;
      setIsObrAvailable(true);

      try {
        await OBR.tool.create({
          id: TOOL_ID,
          icons: [
            {
              icon: '/icon.svg',
              label: 'SpellForge Targeting',
            },
          ],
          defaultMode: MODE_ID,
        });

        await OBR.tool.createMode({
          id: MODE_ID,
          icons: [
            {
              icon: '/icon.svg',
              label: 'Spell Target',
              filter: { activeTools: [TOOL_ID] },
            },
          ],
          cursors: [{ cursor: 'crosshair' }],
          onToolClick: async (_context, event) => {
            let clickPos: Point2D;
            let attachedId: string | undefined = undefined;
            let tokenName: string | undefined = undefined;

            if (event.target) {
              clickPos = getTokenCenter(event.target);
              attachedId = event.target.id;
              tokenName = (event.target as { name?: string }).name || 'Token';
            } else {
              clickPos = {
                x: Math.round(event.pointerPosition.x),
                y: Math.round(event.pointerPosition.y),
              };
            }

            const isNear = (p1: Point2D, p2: Point2D, thresh = 45) =>
              Math.hypot(p1.x - p2.x, p1.y - p2.y) <= thresh;

            const currentOrigin = originSpotRef.current;
            const currentTargets = targetSpotsRef.current;

            // Explicit origin role assignment
            if (targetingRoleRef.current === 'origin') {
              setOriginSpot(clickPos);
              setOriginTokenInfo(attachedId ? { tokenId: attachedId, tokenName } : null);
              setTargetingRole('target');
              return;
            }

            // Clicking existing origin removes it
            if (currentOrigin && isNear(clickPos, currentOrigin)) {
              setOriginSpot(null);
              setOriginTokenInfo(null);
              return;
            }

            // Clicking existing target removes it
            const matchedTargetIndex = currentTargets.findIndex((tgt) => isNear(clickPos, tgt));
            if (matchedTargetIndex !== -1) {
              removeTargetSpot(matchedTargetIndex);
              return;
            }

            // Sequential click flow: 1st click sets Origin, subsequent clicks add Targets
            if (!currentOrigin) {
              setOriginSpot(clickPos);
              setOriginTokenInfo(attachedId ? { tokenId: attachedId, tokenName } : null);
            } else {
              addTargetSpot(clickPos);
            }
          },
        });

        const unsub = OBR.tool.onToolChange((activeId) => {
          if (isSubscribed) {
            setIsToolActive(activeId === TOOL_ID);
          }
        });

        return () => {
          unsub();
        };
      } catch (err) {
        console.warn('[useObrTargeting] Failed to register tool', err);
      }
    });

    return () => {
      isSubscribed = false;
      if (OBR?.isAvailable) {
        OBR.tool.remove(TOOL_ID).catch(() => {});
        OBR.tool.removeMode(MODE_ID).catch(() => {});
        cleanupReticles().catch(() => {});
      }
    };
  }, [setOriginSpot, addTargetSpot, removeTargetSpot, cleanupReticles]);

  const activateObrTool = useCallback(async (role: 'origin' | 'target' = 'target') => {
    setTargetingRole(role);
    if (OBR?.isAvailable) {
      try {
        await OBR.tool.activateTool(TOOL_ID);
      } catch (err) {
        console.warn('[useObrTargeting] Could not activate tool', err);
      }
    }
  }, []);

  // Quick 1-click: Set currently selected OBR token as Origin
  const useSelectedAsOrigin = useCallback(async () => {
    if (!OBR?.isAvailable) return false;
    try {
      const selection = await OBR.player.getSelection();
      if (!selection || selection.length === 0) {
        OBR.notification?.show('Select a token on the map first.', 'WARNING');
        return false;
      }
      const items = await OBR.scene.items.getItems(selection);
      const token = items[0];
      if (token) {
        const pos = getTokenCenter(token);
        setOriginSpot(pos);
        setOriginTokenInfo({
          tokenId: token.id,
          tokenName: (token as { name?: string }).name || 'Token',
        });
        OBR.notification?.show('Origin set to selected token.', 'SUCCESS');
        return true;
      }
    } catch (err) {
      console.warn('[useObrTargeting] Failed to use selected token as origin', err);
    }
    return false;
  }, [setOriginSpot]);

  // Quick 1-click: Add currently selected OBR tokens as Targets
  const addSelectedAsTargets = useCallback(async () => {
    if (!OBR?.isAvailable) return false;
    try {
      const selection = await OBR.player.getSelection();
      if (!selection || selection.length === 0) {
        OBR.notification?.show('Select token(s) on the map first.', 'WARNING');
        return false;
      }
      const items = await OBR.scene.items.getItems(selection);
      let added = 0;
      for (const token of items) {
        const pos = getTokenCenter(token);
        addTargetSpot(pos);
        added++;
      }
      if (added > 0) {
        OBR.notification?.show(`Added ${added} target token(s).`, 'SUCCESS');
        return true;
      }
    } catch (err) {
      console.warn('[useObrTargeting] Failed to add selected tokens as targets', err);
    }
    return false;
  }, [addTargetSpot]);

  const clearAll = useCallback(async () => {
    setOriginSpot(null);
    clearTargetSpots();
    setOriginTokenInfo(null);
    await cleanupReticles();
  }, [setOriginSpot, clearTargetSpots, cleanupReticles]);

  return {
    isObrAvailable,
    isToolActive,
    targetingRole,
    setTargetingRole,
    originTokenInfo,
    activateObrTool,
    useSelectedAsOrigin,
    addSelectedAsTargets,
    clearAll,
  };
}
