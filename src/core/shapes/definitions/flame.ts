import type { ShapeDefinition } from '../shapeTypes';

export const flameShape: ShapeDefinition = {
  id: 'flame',
  label: 'Flame',
  category: 'elemental',
  draw: (ctx, size, color, alpha) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = color;

    const half = size / 2;

    ctx.beginPath();
    ctx.moveTo(0, -half);
    // Right curve down to rounded bottom
    ctx.bezierCurveTo(half * 0.7, -half * 0.2, half * 0.9, half * 0.6, 0, half);
    // Left curve back up to tip
    ctx.bezierCurveTo(-half * 0.9, half * 0.6, -half * 0.7, -half * 0.2, 0, -half);
    ctx.closePath();

    ctx.fill();
    ctx.restore();
  },
};

