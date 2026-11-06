import type { ShapeDefinition } from '../shapeTypes';

export const sparkleShape: ShapeDefinition = {
  id: 'sparkle',
  label: 'Sparkle',
  category: 'divine',
  draw: (ctx, size, color, alpha) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = color;

    const radius = size / 2;

    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.quadraticCurveTo(0, 0, 0, radius);
    ctx.quadraticCurveTo(0, 0, -radius, 0);
    ctx.quadraticCurveTo(0, 0, 0, -radius);
    ctx.closePath();

    ctx.fill();
    ctx.restore();
  },
};

