import React, { useEffect, useRef } from 'react';
import { useSpellStore } from '@/store/useSpellStore';
import { renderParticles, type Particle } from './particlePhysics';
import './ParticleCanvas.css';

export interface ParticleCanvasProps {
  /** Optional custom particles array. When omitted, reads from useSpellStore.activeParticles */
  particles?: Particle[];
  /** Optional custom per-frame tick callback */
  onTick?: (deltaMs: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Lightweight HTML5 overlay canvas particle renderer.
 * Runs a high-performance requestAnimationFrame loop to render ephemeral VFX
 * without triggering Owlbear Rodeo scene updates or React re-render cascades.
 */
export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  particles: externalParticles,
  onTick,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Resize canvas to match container dimensions with device pixel ratio scaling
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => updateSize());
      observer.observe(container);
      return () => observer.disconnect();
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  // requestAnimationFrame animation loop
  useEffect(() => {
    let animId: number;
    let lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const loop = (currentTime: number) => {
      const deltaMs = Math.min(100, Math.max(1, currentTime - lastTime));
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
          const width = canvas.width / dpr;
          const height = canvas.height / dpr;

          ctx.clearRect(0, 0, width, height);

          if (externalParticles) {
            if (onTick) {
              onTick(deltaMs);
            }
            const prevGco = ctx.globalCompositeOperation;
            ctx.globalCompositeOperation = 'lighter';
            renderParticles(ctx, externalParticles);
            ctx.globalCompositeOperation = prevGco;
          } else {
            const store = useSpellStore.getState();
            if (store.activeParticles.length > 0 || store.activeTimelines.length > 0) {
              store.updateParticlesTick(deltaMs);
            }
            const active = useSpellStore.getState().activeParticles;
            if (active.length > 0) {
              const prevGco = ctx.globalCompositeOperation;
              ctx.globalCompositeOperation = 'lighter';
              renderParticles(ctx, active);
              ctx.globalCompositeOperation = prevGco;
            }
          }
        }
      }

      if (typeof requestAnimationFrame !== 'undefined') {
        animId = requestAnimationFrame(loop);
      }
    };

    if (typeof requestAnimationFrame !== 'undefined') {
      animId = requestAnimationFrame(loop);
    }

    return () => {
      if (typeof cancelAnimationFrame !== 'undefined' && animId) {
        cancelAnimationFrame(animId);
      }
    };
  }, [externalParticles, onTick]);

  return (
    <div
      ref={containerRef}
      className={`particle-canvas-container ${className ?? ''}`.trim()}
      style={style}
    >
      <canvas ref={canvasRef} className="particle-canvas" />
    </div>
  );
};

