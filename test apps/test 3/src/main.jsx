import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { AuthKitProvider } from "@authcit/react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthKitProvider publishableKey="pk_78c7dbeb62a8645c2c793c41c100f35e1d292c1adeb9eebc">
      <App />
    </AuthKitProvider>
  </StrictMode>,
);
