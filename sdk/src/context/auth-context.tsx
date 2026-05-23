"use client";

import {
  createContext,
  useEffect,
  useState,
} from "react";

import type {
  AuthContextType,
  User,
} from "../types";

import {
  clearStoredAccessToken,
  exchangeOAuthCode,
  getCurrentUser,
  signOutRequest,
  storeAccessToken,
} from "../lib/api";

export const AuthContext =
  createContext<AuthContextType | null>(
    null
  );

export function AuthKitProvider({
  children,
  publishableKey,
}: {
  children: React.ReactNode;
  publishableKey: string;
}) {

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const refreshUser = async () => {

    try {

      const data =
        await getCurrentUser();

      setUser(data);

    } catch (error) {

      console.log(error);

      setUser(null);

    } finally {

      setLoading(false);

    }
  };

  const consumeOAuthCode =
    async () => {
      const url =
        new URL(window.location.href);

      const code =
        url.searchParams.get("authkit_code");

      if (!code) {
        return false;
      }

      url.searchParams.delete("authkit_code");

      window.history.replaceState(
        {},
        "",
        url.toString()
      );

      try {
        const data =
          await exchangeOAuthCode(code);

        storeAccessToken(
          data.accessToken
        );

        setUser(data.user);

      } catch (error) {

        console.log(error);

        clearStoredAccessToken();

        setUser(null);

      } finally {

        setLoading(false);

      }

      return true;
    };

  useEffect(() => {

    consumeOAuthCode().then(
      (consumed) => {
        if (!consumed) {
          refreshUser();
        }
      }
    );

    window.addEventListener(
      "focus",
      refreshUser
    );

    return () => {
      window.removeEventListener(
        "focus",
        refreshUser
      );
    };

  }, []);

  const signInWithGithub =
    async () => {

      const redirectUrl =
        encodeURIComponent(
          window.location.origin
        );

      window.location.href =
        `https://authkitbackend.devbro.site/sdk/oauth/github/start?publishableKey=${publishableKey}&redirectUrl=${redirectUrl}`;
    };


  const signInWithGoogle =
    async () => {

      const redirectUrl =
        encodeURIComponent(
          window.location.origin
        );

      window.location.href =
        `https://authkitbackend.devbro.site/sdk/oauth/google/start?publishableKey=${publishableKey}&redirectUrl=${redirectUrl}`;
    };

  const signOut = async () => {

    try {

      await signOutRequest();

      setUser(null);

    } catch (error) {

      console.log(error);

    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGithub,
        signInWithGoogle,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
