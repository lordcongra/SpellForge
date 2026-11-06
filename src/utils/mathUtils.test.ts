import { describe, expect, it } from 'vitest';
import { distance, lerp } from './mathUtils';

describe('mathUtils', () => {
  it('lerps correctly between two values', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('calculates distance between points correctly', () => {
    expect(distance(0, 0, 3, 4)).toBe(5);
  });
});

