import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { engine } from "./film/engine";

// Exposed for debugging / automated checks.
(window as unknown as { __film: typeof engine }).__film = engine;

createRoot(document.getElementById("root")!).render(<App />);
