import type { ShapeDefinition } from '../shapeTypes';

export const plusShape: ShapeDefinition = {
  id: 'plus',
  label: 'Cross',
  category: 'divine',
  draw: (ctx, size, color, alpha) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(0.5, size / 20);

    const halfSize = size / 2;
    const thickness = size / 6;

    ctx.beginPath();
    ctx.moveTo(thickness, halfSize);
    ctx.lineTo(thickness, thickness);
    ctx.lineTo(halfSize, thickness);
    ctx.lineTo(halfSize, -thickness);
    ctx.lineTo(thickness, -thickness);
    ctx.lineTo(thickness, -halfSize);
    ctx.lineTo(-thickness, -halfSize);
    ctx.lineTo(-thickness, -thickness);
    ctx.lineTo(-halfSize, -thickness);
    ctx.lineTo(-halfSize, thickness);
    ctx.lineTo(-thickness, thickness);
    ctx.lineTo(-thickness, halfSize);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },
};

