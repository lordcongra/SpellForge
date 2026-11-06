import type { ShapeDefinition } from '../shapeTypes';

export const shardShape: ShapeDefinition = {
  id: 'shard',
  label: 'Shard',
  category: 'combat',
  draw: (ctx, size, color, alpha) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(0.5, size / 16);

    const half = size / 2;

    ctx.beginPath();
    ctx.moveTo(0, -half); // sharp apex
    ctx.lineTo(half * 0.6, -half * 0.1); // upper right facet
    ctx.lineTo(half * 0.4, half * 0.7); // lower right facet
    ctx.lineTo(0, half); // sharp base
    ctx.lineTo(-half * 0.5, half * 0.5); // lower left facet
    ctx.lineTo(-half * 0.6, -half * 0.3); // upper left facet
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },
};

