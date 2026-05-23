"use client";

import type {
  CSSProperties,
} from "react";

import {
  useAuth,
} from "../hooks/useAuth";

type AuthProvider = "github" | "google";

type AuthButtonProps = {
  provider?: AuthProvider;
  children?: React.ReactNode;
  style?: CSSProperties;
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  minHeight: 40,
  padding: "0 14px",
  border: "1px solid #d0d7de",
  borderRadius: 6,
  background: "#ffffff",
  color: "#111827",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const logoutButtonStyle: CSSProperties = {
  ...buttonStyle,
  borderColor: "#fecaca",
  background: "#fff7f7",
  color: "#b42318",
};

const providerLabels: Record<
  AuthProvider,
  string
> = {
  github: "Continue with GitHub",
  google: "Continue with Google",
};

function ProviderMark({
  provider,
}: {
  provider: AuthProvider;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
        height: 18,
        borderRadius: 999,
        background:
          provider === "github"
            ? "#111827"
            : "#fbbc05",
        color:
          provider === "github"
            ? "#ffffff"
            : "#111827",
        fontSize: 11,
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      {provider === "github" ? "G" : "G"}
    </span>
  );
}

export function AuthButton({
  provider = "github",
  children,
  style,
}: AuthButtonProps) {

  const {
    user,
    signInWithGithub,
    signInWithGoogle,
    signOut,
  } = useAuth();

  if (user) {
    return (
      <button
        type="button"
        onClick={signOut}
        style={{
          ...logoutButtonStyle,
          ...style,
        }}
      >
        {children || "Sign out"}
      </button>
    );
  }

  const signIn =
    provider === "github"
      ? signInWithGithub
      : signInWithGoogle;

  return (
    <button
      type="button"
      onClick={signIn}
      style={{
        ...buttonStyle,
        ...style,
      }}
    >
      <ProviderMark provider={provider} />

      {children || providerLabels[provider]}
    </button>
  );
}
