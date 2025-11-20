import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Import stili globali
import "./styles/base.css";
import "./styles/globals.css";

createRoot(document.getElementById("root")).render(
  <App />
);
