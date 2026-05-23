import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { AuthKitProvider } from "@authcit/react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthKitProvider publishableKey="pk_adb84c1db01aa09ab3eaf149a28ce89cb6147426e4b623a5">
      <App />
    </AuthKitProvider>
  </StrictMode>,
);
