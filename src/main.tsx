import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { App } from "./App";
import { LandscapePrompt } from "./LandscapePrompt";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <LandscapePrompt />
        <App />
    </StrictMode>,
);
