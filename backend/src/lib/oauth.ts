import { GitHub, Google } from "arctic";

const BACKEND_URL = process.env.BACKEND_URL!;

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${BACKEND_URL}/auth/google/callback`,
);

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  `${BACKEND_URL}/auth/github/callback`,
);
