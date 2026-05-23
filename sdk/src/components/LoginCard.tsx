"use client";

import type {
  CSSProperties,
} from "react";

import {
  useAuth,
} from "../hooks/useAuth";

type LoginCardProps = {
  title?: string;
  subtitle?: string;
  providers?: Array<"github" | "google">;
  style?: CSSProperties;
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 360,
  padding: 24,
  border: "1px solid #d0d7de",
  borderRadius: 8,
  background: "#ffffff",
  color: "#111827",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  boxShadow:
    "0 14px 34px rgba(15, 23, 42, 0.10)",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 22,
  lineHeight: 1.2,
  fontWeight: 700,
};

const subtitleStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "#57606a",
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
  border: "1px solid #d0d7de",
  borderRadius: 6,
  background: "#ffffff",
  color: "#111827",
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
        borderRadius: 999,
        background:
          provider === "github"
            ? "#111827"
            : "#fbbc05",
        color:
          provider === "github"
            ? "#ffffff"
            : "#111827",
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      G
    </span>
  );
}

export function LoginCard({
  title = "Sign in",
  subtitle = "Choose a provider to continue.",
  providers = ["github", "google"],
  style,
}: LoginCardProps) {
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
        ...style,
      }}
    >
      <h2 style={titleStyle}>
        {title}
      </h2>

      {subtitle ? (
        <p style={subtitleStyle}>
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
            style={buttonStyle}
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
