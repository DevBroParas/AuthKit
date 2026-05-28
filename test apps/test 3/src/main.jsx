import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { AuthKitProvider } from "@authcit/react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthKitProvider publishableKey="pk_5ceb6ceaa02c0bb4de0b576e6224e3282145cc97232419c1">
      <App />
    </AuthKitProvider>
  </StrictMode>,
);
