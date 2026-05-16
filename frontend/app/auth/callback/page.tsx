"use client";

import { useEffect } from "react";

export default function CallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      window.location.replace("/dashboard");
    } else {
      window.location.replace("/auth/login");
    }
  }, []);

  return (
    <div>
      Logging you in...
    </div>
  );
}