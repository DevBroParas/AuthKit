"use client";

import type {
  CSSProperties,
} from "react";

import {
  useEffect,
  useRef,
  useState,
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

type ProfileCardProps = {
  style?: CSSProperties;
  showEmail?: boolean;
  align?: "left" | "right";
  theme?: AuthKitTheme;
};

const baseCardStyle: CSSProperties = {
  position: "absolute",
  top: "calc(100% + 10px)",
  width: "min(300px, calc(100vw - 24px))",
  padding: 16,
  border: "1px solid",
  borderRadius: 8,
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  zIndex: 50,
};

const avatarStyle: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 999,
  objectFit: "cover",
  border: "1px solid",
  flex: "0 0 auto",
};

const fallbackAvatarStyle: CSSProperties = {
  ...avatarStyle,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 20,
  fontWeight: 800,
};

const triggerStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 42,
  height: 42,
  padding: 0,
  border: "1px solid",
  borderRadius: 999,
  cursor: "pointer",
};

const nameStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  lineHeight: 1.3,
  fontWeight: 700,
};

const emailStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 13,
  lineHeight: 1.4,
  overflowWrap: "anywhere",
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 38,
  width: "100%",
  padding: "0 14px",
  border: "1px solid",
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 650,
  cursor: "pointer",
};

function getInitial(
  value?: string | null
) {
  return value?.trim().charAt(0).toUpperCase() || "?";
}

export function ProfileCard({
  align = "left",
  style,
  showEmail = true,
  theme = "system",
}: ProfileCardProps) {
  const tokens =
    useAuthKitTheme(theme);

  const [open, setOpen] =
    useState(false);

  const rootRef =
    useRef<HTMLDivElement | null>(null);

  const {
    user,
    signOut,
  } = useAuth();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown =
      (event: PointerEvent) => {
        if (
          rootRef.current &&
          !rootRef.current.contains(
            event.target as Node
          )
        ) {
          setOpen(false);
        }
      };

    const handleKeyDown =
      (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      };

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  if (!user) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      style={{
        position: "relative",
        display: "inline-flex",
        ...style,
      }}
    >
      <button
        type="button"
        aria-label="Open profile menu"
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => !current);
        }}
        style={{
          ...triggerStyle,
          borderColor: tokens.border,
          background: tokens.buttonSurface,
          boxShadow: tokens.shadow,
        }}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            style={{
              ...avatarStyle,
              width: 38,
              height: 38,
              borderColor: tokens.border,
              background: tokens.avatarBg,
            }}
          />
        ) : (
          <span
            aria-hidden="true"
            style={{
              ...fallbackAvatarStyle,
              width: 38,
              height: 38,
              fontSize: 16,
              borderColor: tokens.border,
              background: tokens.avatarBg,
              color: tokens.text,
            }}
          >
            {getInitial(
              user.name || user.email
            )}
          </span>
        )}
      </button>

      {open ? (
        <section
          aria-label="Profile"
          style={{
            ...baseCardStyle,
            borderColor: tokens.border,
            background: tokens.surfaceRaised,
            color: tokens.text,
            boxShadow: tokens.menuShadow,
            ...(align === "right"
              ? {
                  right: 0,
                }
              : {
                  left: 0,
                }),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt=""
                style={{
                  ...avatarStyle,
                  borderColor: tokens.border,
                  background: tokens.avatarBg,
                }}
              />
            ) : (
              <span
                aria-hidden="true"
                style={{
                  ...fallbackAvatarStyle,
                  borderColor: tokens.border,
                  background: tokens.avatarBg,
                  color: tokens.text,
                }}
              >
                {getInitial(
                  user.name || user.email
                )}
              </span>
            )}

            <div
              style={{
                minWidth: 0,
              }}
            >
              <h2 style={nameStyle}>
                {user.name || user.email}
              </h2>

              {showEmail ? (
                <p
                  style={{
                    ...emailStyle,
                    color: tokens.mutedText,
                  }}
                >
                  {user.email}
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            style={{
              ...buttonStyle,
              borderColor: tokens.dangerBorder,
              background: tokens.dangerBg,
              color: tokens.dangerText,
              marginTop: 18,
            }}
          >
            Sign out
          </button>
        </section>
      ) : null}
    </div>
  );
}
