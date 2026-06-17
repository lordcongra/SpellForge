import { useObrInit } from "./hooks/useObrInit";
import { useStore } from "./store/useStore";
import { SpellPanel } from "./components/SpellPanel/SpellPanel";
import "./App.css";

export default function App() {
  useObrInit();

  const userId = useStore((state) => state.userId);
  const userRole = useStore((state) => state.userRole);

  return (
    <div className="app-container">
      <h1>SpellForge</h1>
      <div className="status-panel">
        <p><strong>Status:</strong> {userId ? "Connected" : "Connecting..."}</p>
        <p><strong>Role:</strong> {userRole || "..."}</p>
      </div>
      
      {/* Our new UI Module */}
      <SpellPanel />
    </div>
  );
}