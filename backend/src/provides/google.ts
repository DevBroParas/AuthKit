import { Google } from "arctic";

export const googleProvider = new Google(
  process.env.GOOGLE_CLIENT_ID_SDK!,
  process.env.GOOGLE_CLIENT_SECRET_SDK!,
  `${process.env.BACKEND_URL}/sdk/oauth/google/callback`,
);
