import { describe, it, expect, vi } from 'vitest';

vi.mock('@owlbear-rodeo/sdk', () => ({
  default: {
    isAvailable: false,
  },
  buildShape: () => ({}),
}));

import { getTokenCenter } from './useObrTargeting';
import type { Item } from '@owlbear-rodeo/sdk';

describe('getTokenCenter', () => {
  it('calculates center from image bounds and position', () => {
    const mockToken = {
      position: { x: 100, y: 200 },
      image: { width: 300, height: 300 },
      scale: { x: 1, y: 1 },
    } as unknown as Item;

    const center = getTokenCenter(mockToken);
    expect(center).toEqual({ x: 250, y: 350 });
  });

  it('accounts for scaling factors', () => {
    const mockToken = {
      position: { x: 50, y: 50 },
      image: { width: 100, height: 100 },
      scale: { x: 2, y: 1.5 },
    } as unknown as Item;

    const center = getTokenCenter(mockToken);
    expect(center).toEqual({ x: 150, y: 125 });
  });

  it('falls back to default cell size of 150 when dimensions are missing', () => {
    const mockToken = {
      position: { x: 0, y: 0 },
    } as unknown as Item;

    const center = getTokenCenter(mockToken);
    expect(center).toEqual({ x: 75, y: 75 });
  });
});
