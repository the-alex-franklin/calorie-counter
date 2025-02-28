import "./index.css";
import "virtual:uno.css";
import "react-circular-progressbar/dist/styles.css";

import { createRoot } from "react-dom/client";
import { Router } from "./Router.tsx";

createRoot(document.getElementById("root")!).render(<Router />);
