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
  getCurrentUser,
  signOutRequest,
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

  useEffect(() => {

    refreshUser();

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
        `http://localhost:8000/sdk/oauth/github/start?publishableKey=${publishableKey}&redirectUrl=${redirectUrl}`;
    };


  const signInWithGoogle =
    async () => {

      const redirectUrl =
        encodeURIComponent(
          window.location.origin
        );

      window.location.href =
        `http://localhost:8000/sdk/oauth/google/start?publishableKey=${publishableKey}&redirectUrl=${redirectUrl}`;
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