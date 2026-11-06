import type { ShapeDefinition } from '../shapeTypes';

export const ringShape: ShapeDefinition = {
  id: 'ring',
  label: 'Ring',
  category: 'combat',
  draw: (ctx, size, color, alpha) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, size / 8);
    ctx.beginPath();
    const radius = Math.max(0.5, size / 2 - ctx.lineWidth / 2);
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
};

