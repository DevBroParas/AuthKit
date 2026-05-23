"use client";

import {
  useEffect,
  useState,
} from "react";

export type AuthKitTheme =
  | "light"
  | "dark"
  | "system";

type ResolvedTheme =
  | "light"
  | "dark";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
}

export function useAuthKitTheme(
  theme: AuthKitTheme = "system"
) {
  const [systemTheme, setSystemTheme] =
    useState<ResolvedTheme>(
      getSystemTheme
    );

  useEffect(() => {
    if (
      theme !== "system" ||
      typeof window === "undefined"
    ) {
      return;
    }

    const media = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleChange = () => {
      setSystemTheme(
        media.matches ? "dark" : "light"
      );
    };

    handleChange();

    media.addEventListener(
      "change",
      handleChange
    );

    return () => {
      media.removeEventListener(
        "change",
        handleChange
      );
    };
  }, [theme]);

  const resolvedTheme =
    theme === "system"
      ? systemTheme
      : theme;

  return resolvedTheme === "dark"
    ? darkTokens
    : lightTokens;
}

const lightTokens = {
  surface: "#ffffff",
  surfaceRaised: "#ffffff",
  buttonSurface: "#ffffff",
  buttonText: "#111827",
  text: "#111827",
  mutedText: "#57606a",
  border: "#d0d7de",
  avatarBg: "#f3f4f6",
  shadow: "0 14px 34px rgba(15, 23, 42, 0.10)",
  menuShadow:
    "0 18px 42px rgba(15, 23, 42, 0.16)",
  dangerBg: "#fff7f7",
  dangerText: "#b42318",
  dangerBorder: "#fecaca",
};

const darkTokens = {
  surface: "#0b1120",
  surfaceRaised: "#111827",
  buttonSurface: "#1f2937",
  buttonText: "#f8fafc",
  text: "#f8fafc",
  mutedText: "#94a3b8",
  border: "#334155",
  avatarBg: "#1e293b",
  shadow: "0 14px 34px rgba(0, 0, 0, 0.36)",
  menuShadow:
    "0 18px 42px rgba(0, 0, 0, 0.46)",
  dangerBg: "#3b1116",
  dangerText: "#fecaca",
  dangerBorder: "#7f1d1d",
};
