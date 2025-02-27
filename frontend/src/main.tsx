import "./index.css";
import "virtual:uno.css";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";

createRoot(document.getElementById("root")!)
	.render(<App />);
