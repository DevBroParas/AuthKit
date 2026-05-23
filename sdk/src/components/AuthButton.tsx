"use client";

import type {
  CSSProperties,
} from "react";

import {
  useAuth,
} from "../hooks/useAuth";

import type {
  AuthKitTheme,
} from "../lib/theme";

import {
  useAuthKitTheme,
} from "../lib/theme";

import {
  ProviderIcon,
} from "./provider-icons";

type AuthProvider = "github" | "google";

type AuthButtonProps = {
  provider?: AuthProvider;
  children?: React.ReactNode;
  style?: CSSProperties;
  theme?: AuthKitTheme;
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  minHeight: 40,
  padding: "0 14px",
  border: "1px solid",
  borderRadius: 6,
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const logoutButtonStyle: CSSProperties = {
  ...buttonStyle,
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
        color: "currentColor",
      }}
    >
      <ProviderIcon
        provider={provider}
        size={18}
      />
    </span>
  );
}

export function AuthButton({
  provider = "github",
  children,
  style,
  theme = "system",
}: AuthButtonProps) {
  const tokens =
    useAuthKitTheme(theme);

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
          borderColor: tokens.dangerBorder,
          background: tokens.dangerBg,
          color: tokens.dangerText,
          boxShadow: tokens.shadow,
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
        borderColor: tokens.border,
        background: tokens.buttonSurface,
        color: tokens.buttonText,
        boxShadow: tokens.shadow,
        ...style,
      }}
    >
      <ProviderMark provider={provider} />

      {children || providerLabels[provider]}
    </button>
  );
}
