import { useObrInit } from "./hooks/useObrInit";
import { useStore } from "./store/useStore";
import { SpellPanel } from "./components/SpellPanel/SpellPanel";
import { SpellEngine } from "./components/Engine/SpellEngine";
import { SpellEditor } from "./components/SpellEditor/SpellEditor";
import { ParticleOverlay } from "./components/Engine/ParticleOverlay";
import "./App.css";

export default function App() {
  useObrInit();

  const userId = useStore((state) => state.userId);
  const userRole = useStore((state) => state.userRole);

  // Read URL parameters to determine if we are in the Modal
  const urlParams = new URLSearchParams(window.location.search);
  const viewMode = urlParams.get("view");
  const editSpellId = urlParams.get("spellId");

  if (viewMode === "editor") {
    return <SpellEditor editSpellId={editSpellId} />;
  }

  return (
    <div className="app-container">
      <ParticleOverlay />
      <SpellEngine />

      <h1>SpellForge</h1>
      <div className="status-panel">
        <p>
          <strong>Status:</strong> {userId ? "Connected" : "Connecting..."}
        </p>
        <p>
          <strong>Role:</strong> {userRole || "..."}
        </p>
      </div>

      <SpellPanel />
    </div>
  );
}