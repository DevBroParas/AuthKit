import crypto from "crypto";

export function generatePublishableKey() {
  return `pk_${crypto.randomBytes(24).toString("hex")}`;
}

export function generateSecretKey() {
  return `sk_${crypto.randomBytes(32).toString("hex")}`;
}