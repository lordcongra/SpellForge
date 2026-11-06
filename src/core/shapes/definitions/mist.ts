import type { ShapeDefinition } from '../shapeTypes';

export const mistShape: ShapeDefinition = {
  id: 'mist',
  label: 'Mist',
  category: 'elemental',
  draw: (ctx, size, color, alpha) => {
    ctx.save();
    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    ctx.globalAlpha = clampedAlpha;

    const radius = Math.max(1, size / 2);
    // Radial soft gradient
    try {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
    } catch {
      ctx.fillStyle = color;
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};

