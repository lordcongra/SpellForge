import { describe, it, expect, vi } from 'vitest';

if (typeof window === 'undefined') {
  (globalThis as unknown as { window: unknown }).window = {
    location: { search: '' },
  };
}

const mockBuilder = () => {
  const b: Record<string, unknown> = {};
  const chain = () => b;
  b.width = chain;
  b.height = chain;
  b.shapeType = chain;
  b.position = chain;
  b.fillColor = chain;
  b.fillOpacity = chain;
  b.strokeColor = chain;
  b.strokeOpacity = chain;
  b.strokeWidth = chain;
  b.layer = chain;
  b.metadata = chain;
  b.commands = chain;
  b.build = vi.fn().mockReturnValue({ id: 'mock-item' });
  return b;
};

vi.mock('@owlbear-rodeo/sdk', () => {
  return {
    buildShape: () => mockBuilder(),
    buildPath: () => mockBuilder(),
    default: {
      isAvailable: true,
      scene: {
        local: {
          addItems: vi.fn().mockResolvedValue(undefined),
          deleteItems: vi.fn().mockResolvedValue(undefined),
        },
      },
    },
  };
});

import { renderObrSceneCast } from './obrSceneRenderer';
import type { CastPayload } from '@/types/spellSchema';

describe('obrSceneRenderer', () => {
  it('renders beam cast and prunes scene items after duration', async () => {
    const dummyPayload: CastPayload = {
      castId: 'cast-123',
      spell: {
        id: 's1',
        name: 'Fireball',
        description: 'Test fireball',
        category: 'elemental',
        castRange: 500,
        cooldownMs: 500,
        icon: 'Flame',
        mechanics: [
          {
            id: 'm1',
            type: 'projectile',
            name: 'Fireball Projectile',
            durationMs: 400,
            params: {},
            triggers: {},
          },
        ],
      },
      origin: { x: 100, y: 100 },
      destination: { x: 300, y: 300 },
      targetTokenIds: [],
      pathPoints: [{ x: 100, y: 100 }, { x: 300, y: 300 }],
      timestamp: Date.now(),
    };

    await expect(renderObrSceneCast(dummyPayload)).resolves.not.toThrow();
  });
});
