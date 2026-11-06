import { ParticleCanvas } from '@/core/engine/ParticleCanvas';
import { SpellForgeEditor } from '@/components/editor/SpellForgeEditor';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <ParticleCanvas />
      <header className="app-header">
        <div className="app-header__branding">
          <h1>SpellForge</h1>
          <p className="app-subtitle">Custom Spell Maker for Owlbear Rodeo</p>
        </div>
      </header>
      <main className="app-main">
        <SpellForgeEditor />
      </main>
    </div>
  );
}
