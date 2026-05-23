"use client";

import type {
  CSSProperties,
} from "react";

type ProviderIconProps = {
  provider: "github" | "google";
  size?: number;
  style?: CSSProperties;
};

export function ProviderIcon({
  provider,
  size = 20,
  style,
}: ProviderIconProps) {
  if (provider === "google") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        style={{
          display: "block",
          flex: "0 0 auto",
          ...style,
        }}
      >
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.39 3.64v3h3.87c2.26-2.08 3.54-5.16 3.54-8.88Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.94-2.85l-3.87-3a7.23 7.23 0 0 1-10.77-3.8H1.31v3.09A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.3 14.35a7.18 7.18 0 0 1 0-4.7V6.56H1.31a12.01 12.01 0 0 0 0 10.88l3.99-3.09Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.31 6.56L5.3 9.65A7.15 7.15 0 0 1 12 4.77Z"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      style={{
        display: "block",
        flex: "0 0 auto",
        ...style,
      }}
    >
      <path d="M12 .5A12 12 0 0 0 8.2 23.88c.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.4 11.4 0 0 1 12 6.46c1.02 0 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.93.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}
