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
  const clearTargetSpots = useSpellStore((s) => s.clearTargetSpots);

  const targetingRoleRef = useRef(targetingRole);
  const originSpotRef = useRef(originSpot);
  const originTokenRef = useRef(originTokenInfo);

  useEffect(() => {
    targetingRoleRef.current = targetingRole;
  }, [targetingRole]);

  useEffect(() => {
    originSpotRef.current = originSpot;
  }, [originSpot]);

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

        if (origin) {
          const originBuilder = buildShape()
            .width(80)
            .height(80)
            .shapeType('CIRCLE')
            .position({ x: origin.x - 40, y: origin.y - 40 })
            .fillColor('#6366f1')
            .fillOpacity(0.2)
            .strokeColor('#818cf8')
            .strokeWidth(4)
            .strokeDash([16, 8])
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
            .width(70)
            .height(70)
            .shapeType('CIRCLE')
            .position({ x: tgt.x - 35, y: tgt.y - 35 })
            .fillColor('#06b6d4')
            .fillOpacity(0.2)
            .strokeColor('#22d3ee')
            .strokeWidth(3)
            .strokeDash([14, 7])
            .layer('ATTACHMENT')
            .locked(true)
            .disableHit(true)
            .metadata({ [RETICLE_METADATA_KEY]: true, role: 'target', index })
            .build();
          reticleItems.push(targetItem);
        });

        if (reticleItems.length > 0) {
          await OBR.scene.local.addItems(reticleItems);
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
            let clickPos: Point2D = {
              x: Math.round(event.pointerPosition.x),
              y: Math.round(event.pointerPosition.y),
            };
            let attachedId: string | undefined = undefined;
            let tokenName: string | undefined = undefined;

            if (event.target) {
              clickPos = {
                x: Math.round(event.target.position.x),
                y: Math.round(event.target.position.y),
              };
              attachedId = event.target.id;
              tokenName = (event.target as { name?: string }).name || 'Token';
            }

            if (targetingRoleRef.current === 'origin' || !originSpotRef.current) {
              setOriginSpot(clickPos);
              setOriginTokenInfo(attachedId ? { tokenId: attachedId, tokenName } : null);
              setTargetingRole('target');
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
  }, [setOriginSpot, addTargetSpot, cleanupReticles]);

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
        const pos = {
          x: Math.round(token.position.x),
          y: Math.round(token.position.y),
        };
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
        const pos = {
          x: Math.round(token.position.x),
          y: Math.round(token.position.y),
        };
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
    clearTargetSpots();
    setOriginTokenInfo(null);
    await cleanupReticles();
  }, [clearTargetSpots, cleanupReticles]);

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
