"use client";

import {
  useAuth,
} from "../hooks/useAuth";

export function AuthButton() {

  const {
    user,
    signInWithGithub,
    signOut,
  } = useAuth();

  if (user) {
    return (
      <button onClick={signOut}>
        Logout
      </button>
    );
  }

  return (
    <button onClick={signInWithGithub}>
      Login with GitHub
    </button>
  );
}