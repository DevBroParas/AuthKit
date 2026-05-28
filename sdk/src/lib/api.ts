const API_URL =
  "https://authkitbackend.devbro.site";

const TOKEN_STORAGE_KEY =
  "authkit_access_token";

export function getStoredAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(
    TOKEN_STORAGE_KEY
  );
}

export function storeAccessToken(
  accessToken: string
) {
  window.localStorage.setItem(
    TOKEN_STORAGE_KEY,
    accessToken
  );
}

export function clearStoredAccessToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(
    TOKEN_STORAGE_KEY
  );
}

export async function getCurrentUser() {
  const accessToken =
    getStoredAccessToken();

  const response = await fetch(
    `${API_URL}/sdk/me`,
    {
      credentials: "include",

      headers: accessToken
        ? {
            Authorization:
              `Bearer ${accessToken}`,
          }
        : undefined,
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAccessToken();
    }

    return null;
  }

  return response.json();
}

export async function exchangeOAuthCode(
  code: string
) {
  const response = await fetch(
    `${API_URL}/sdk/oauth/exchange`,
    {
      method: "POST",

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        code,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to exchange AuthCit code"
    );
  }

  return response.json();
}

export async function signOutRequest() {
  clearStoredAccessToken();

  await fetch(
    `${API_URL}/sdk/signout`,
    {
      method: "POST",

      credentials: "include",
    }
  );
}
