export function clampNumber(val: number, min = -Infinity, max = Infinity): number {
  let result = val;
  if (min !== undefined && result < min) result = min;
  if (max !== undefined && result > max) result = max;
  return result;
}

export function stepNumber(
  current: number,
  delta: number,
  min = -Infinity,
  max = Infinity
): number {
  return clampNumber(Number((current + delta).toFixed(4)), min, max);
}

