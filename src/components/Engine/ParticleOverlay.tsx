import { useEffect, useState } from "react";
import * as tsParticlesReact from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useStore } from "../../store/useStore";

export function ParticleOverlay() {
  const [isEngineReady, setIsEngineReady] = useState(false);
  const activeEmitters = useStore((state) => state.activeEmitters);

  useEffect(() => {
    const setup = async () => {
      try {
        const ParticlesModule = tsParticlesReact as any;
        const initFn = ParticlesModule.initParticlesEngine || ParticlesModule.default?.initParticlesEngine;
        
        if (initFn) {
          await initFn(async (engine: any) => {
            await loadSlim(engine);
          });
          console.log("%c[SpellForge] Particle Engine Ready!", "color: cyan;");
          setIsEngineReady(true);
        }
      } catch (err) {
        console.error("SpellForge: Failed to initialize physics engine.", err);
      }
    };
    setup();
  }, []);

  if (!isEngineReady) return null;
  
  if (activeEmitters.length === 0) {
    console.log("[SpellForge] 0 Active Emitters. Overlay sleeping.");
    return null;
  }

  const activeSpell = activeEmitters[0];
  console.log("%c[SpellForge] RENDERING PARTICLES NOW!", "color: yellow; font-size: 16px;", activeSpell);

  const ParticlesModule = tsParticlesReact as any;
  const ParticlesComponent = ParticlesModule.default || ParticlesModule.Particles;

  return (
    <div 
      className="particle-overlay-container"
      style={{ 
        position: "absolute", 
        top: 0, 
        left: 0, 
        width: "100%", 
        height: "100%", 
        pointerEvents: "none", 
        zIndex: 9999,
        backgroundColor: "rgba(255, 0, 0, 0.2)" // A red tint proves this component is actually mounting!
      }}
    >
      <ParticlesComponent
        id={`spellforge-particles-${activeSpell.emitterIdentifier}`}
        style={{ width: "100%", height: "100%" }}
        options={{
          fullScreen: { enable: false },
          background: { opacity: 0 },
          fpsLimit: 60,
          particles: {
            color: { value: activeSpell.spellColorHex },
            number: { value: 100 }, // Huge burst
            shape: { type: "circle" },
            size: { value: { min: 10, max: 20 } }, // Massive particles so we can't miss them
            move: {
              enable: true,
              speed: 5,
              direction: "none",
              outModes: "none", // Prevent them from destroying instantly
            },
          }
        }}
      />
    </div>
  );
}