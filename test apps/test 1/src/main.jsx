import React from "react";

import ReactDOM from "react-dom/client";

import App from "./App";

import {
  AuthKitProvider,
} from "@authkit/react";

ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    <AuthKitProvider
      publishableKey="pk_02f5d90a0e1352a5216fe0ec2b62060abef653881ba3abaf"
    >

      <App />

    </AuthKitProvider>

  </React.StrictMode>
);