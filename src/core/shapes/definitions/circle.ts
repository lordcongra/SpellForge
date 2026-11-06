import type { ShapeDefinition } from '../shapeTypes';

export const circleShape: ShapeDefinition = {
  id: 'circle',
  label: 'Circle',
  category: 'arcane',
  draw: (ctx, size, color, alpha) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0.5, size / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};

