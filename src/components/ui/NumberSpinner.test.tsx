import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NumberSpinner } from './NumberSpinner';
import { clampNumber, stepNumber } from './numberSpinnerUtils';

describe('NumberSpinner - logic', () => {
  it('clamps numbers within given bounds', () => {
    expect(clampNumber(5, 0, 10)).toBe(5);
    expect(clampNumber(-5, 0, 10)).toBe(0);
    expect(clampNumber(15, 0, 10)).toBe(10);
    expect(clampNumber(42)).toBe(42);
  });

  it('steps numbers correctly with bounds and step increments', () => {
    expect(stepNumber(10, 5, 0, 50)).toBe(15);
    expect(stepNumber(10, -5, 0, 50)).toBe(5);
    expect(stepNumber(48, 5, 0, 50)).toBe(50);
    expect(stepNumber(2, -5, 0, 50)).toBe(0);
  });

  it('handles floating point step math cleanly without precision artifacts', () => {
    expect(stepNumber(0.1, 0.2, 0, 1)).toBe(0.3);
    expect(stepNumber(0.3, -0.1, 0, 1)).toBe(0.2);
  });
});

describe('NumberSpinner - component markup', () => {
  it('renders input with value, min, max, and step', () => {
    const html = renderToStaticMarkup(
      <NumberSpinner
        value={25}
        onChange={vi.fn()}
        min={10}
        max={100}
        step={5}
        unit="px"
        label="Radius"
      />
    );

    expect(html).toContain('Radius');
    expect(html).toContain('value="25"');
    expect(html).toContain('min="10"');
    expect(html).toContain('max="100"');
    expect(html).toContain('step="5"');
    expect(html).toContain('px');
  });

  it('disables decrement button when value reaches min', () => {
    const html = renderToStaticMarkup(
      <NumberSpinner value={0} onChange={vi.fn()} min={0} max={100} />
    );

    // Decrement button should be disabled
    expect(html).toMatch(/sf-number-spinner__btn--decrement[^>]*disabled/);
    // Increment button should NOT be disabled
    expect(html).not.toMatch(/sf-number-spinner__btn--increment[^>]*disabled/);
  });

  it('disables increment button when value reaches max', () => {
    const html = renderToStaticMarkup(
      <NumberSpinner value={100} onChange={vi.fn()} min={0} max={100} />
    );

    // Increment button should be disabled
    expect(html).toMatch(/sf-number-spinner__btn--increment[^>]*disabled/);
    // Decrement button should NOT be disabled
    expect(html).not.toMatch(/sf-number-spinner__btn--decrement[^>]*disabled/);
  });

  it('disables both buttons and input when disabled prop is true', () => {
    const html = renderToStaticMarkup(
      <NumberSpinner value={50} onChange={vi.fn()} disabled={true} />
    );

    expect(html).toContain('sf-number-spinner--disabled');
    expect(html).toMatch(/sf-number-spinner__btn--decrement[^>]*disabled/);
    expect(html).toMatch(/sf-number-spinner__btn--increment[^>]*disabled/);
    expect(html).toMatch(/<input[^>]*disabled/);
  });
});
