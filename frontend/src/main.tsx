import "./index.css";
import "virtual:windi.css";
// @deno-types="@types/react"
// import { StrictMode } from "react"; // turn this back on before deploying
// @deno-types="@types/react-dom/client"
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";

createRoot(document.getElementById("root")!)
	.render(<App />);
