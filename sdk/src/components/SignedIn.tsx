"use client";

import {
  useAuth,
} from "../hooks/useAuth";

export function SignedIn({
  children,
}: {
  children: React.ReactNode;
}) {

  const {
    user,
  } = useAuth();

  if (!user) {
    return null;
  }

  return children;
}