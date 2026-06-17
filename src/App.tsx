import { useObrInit } from "./hooks/useObrInit";
import { useStore } from "./store/useStore";
import { SpellPanel } from "./components/SpellPanel/SpellPanel";
import { SpellEngine } from "./components/Engine/SpellEngine"; // <-- 1. This import links our new file
import "./App.css";

export default function App() {
  useObrInit();

  const userId = useStore((state) => state.userId);
  const userRole = useStore((state) => state.userRole);

  return (
    <div className="app-container">
      {/* 2. We place the invisible engine right here inside the main container */}
      <SpellEngine /> 
      
      <h1>SpellForge</h1>
      <div className="status-panel">
        <p><strong>Status:</strong> {userId ? "Connected" : "Connecting..."}</p>
        <p><strong>Role:</strong> {userRole || "..."}</p>
      </div>
      
      <SpellPanel />
    </div>
  );
}