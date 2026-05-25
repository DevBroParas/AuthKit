import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { AuthKitProvider } from "@authcit/react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthKitProvider publishableKey="pk_d40ad8572efe3eb4ea5c4c6c20f63d412cde5f8add5d6045">
      <App />
    </AuthKitProvider>
  </StrictMode>,
);
