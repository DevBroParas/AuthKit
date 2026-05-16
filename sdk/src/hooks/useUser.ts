"use client";

import {
  useAuth,
} from "./useAuth";

export function useUser() {

  const {
    user,
    loading,
  } = useAuth();

  return {
    user,
    loading,
  };
}