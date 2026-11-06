import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { useSpellStore } from "./store/useSpellStore";

if (import.meta.env.DEV) {
  // Expose store for debugging and automated QA verification
  (window as unknown as { useSpellStore: typeof useSpellStore }).useSpellStore = useSpellStore;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
