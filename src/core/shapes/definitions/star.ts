import type { ShapeDefinition } from '../shapeTypes';

export const starShape: ShapeDefinition = {
  id: 'star',
  label: 'Star',
  category: 'arcane',
  draw: (ctx, size, color, alpha) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, size / 16);

    const outerRadius = size / 2;
    const innerRadius = outerRadius / 2.5;
    const numberOfPoints = 10;
    const angleStep = (Math.PI * 2) / numberOfPoints;

    ctx.beginPath();
    for (let i = 0; i <= numberOfPoints; i++) {
      const currentRadius = i % 2 === 0 ? outerRadius : innerRadius;
      const currentAngle = i * angleStep - Math.PI / 2;
      const pointX = currentRadius * Math.cos(currentAngle);
      const pointY = currentRadius * Math.sin(currentAngle);

      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },
};

