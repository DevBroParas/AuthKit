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

type LoginCardProps = {
  title?: string;
  subtitle?: string;
  providers?: Array<"github" | "google">;
  style?: CSSProperties;
  theme?: AuthKitTheme;
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 360,
  padding: 24,
  border: "1px solid",
  borderRadius: 8,
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 22,
  lineHeight: 1.2,
  fontWeight: 700,
};

const subtitleStyle: CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.5,
};

const buttonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  width: "100%",
  minHeight: 42,
  padding: "0 14px",
  border: "1px solid",
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 650,
  cursor: "pointer",
};

const providerText = {
  github: "Continue with GitHub",
  google: "Continue with Google",
};

function ProviderMark({
  provider,
}: {
  provider: "github" | "google";
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        color: "currentColor",
      }}
    >
      <ProviderIcon
        provider={provider}
        size={20}
      />
    </span>
  );
}

export function LoginCard({
  title = "Sign in",
  subtitle = "Choose a provider to continue.",
  providers = ["github", "google"],
  style,
  theme = "system",
}: LoginCardProps) {
  const tokens =
    useAuthKitTheme(theme);

  const {
    signInWithGithub,
    signInWithGoogle,
  } = useAuth();

  const signIn = {
    github: signInWithGithub,
    google: signInWithGoogle,
  };

  return (
    <section
      aria-label="Sign in"
      style={{
        ...cardStyle,
        borderColor: tokens.border,
        background: tokens.surfaceRaised,
        color: tokens.text,
        boxShadow: tokens.shadow,
        ...style,
      }}
    >
      <h2 style={titleStyle}>
        {title}
      </h2>

      {subtitle ? (
        <p
          style={{
            ...subtitleStyle,
            color: tokens.mutedText,
          }}
        >
          {subtitle}
        </p>
      ) : null}

      <div
        style={{
          display: "grid",
          gap: 10,
          marginTop: 20,
        }}
      >
        {providers.map((provider) => (
          <button
            key={provider}
            type="button"
            onClick={signIn[provider]}
            style={{
              ...buttonStyle,
              borderColor: tokens.border,
              background: tokens.buttonSurface,
              color: tokens.buttonText,
            }}
          >
            <ProviderMark
              provider={provider}
            />

            {providerText[provider]}
          </button>
        ))}
      </div>
    </section>
  );
}
