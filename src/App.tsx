import { useObrInit } from "./hooks/useObrInit";
import { useStore } from "./store/useStore";

export default function App() {
  // Initialize the OBR connection
  useObrInit();

  // Pull identity state to verify it works
  const userId = useStore((state) => state.userId);
  const userRole = useStore((state) => state.userRole);

  return (
    <div className="app-container">
      <h1>Particle Spell Engine</h1>
      <div className="status-panel">
        <p><strong>User ID:</strong> {userId || "Connecting..."}</p>
        <p><strong>Role:</strong> {userRole || "Connecting..."}</p>
      </div>
    </div>
  );
}