import { GitHub } from "arctic";

export const githubProvider = new GitHub(
  process.env.GITHUB_CLIENT_ID_SDK!,
  process.env.GITHUB_CLIENT_SECRET_SDK!,
  `${process.env.BACKEND_URL}/sdk/oauth/github/callback`
);

export async function getGithubUser(
  accessToken: string
) {

  const response = await fetch(
    "https://api.github.com/user",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch GitHub user"
    );
  }

  return response.json();
}

export async function getGithubEmails(
  accessToken: string
) {

  const response = await fetch(
    "https://api.github.com/user/emails",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.json();
}