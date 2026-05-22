const API_URL = "https://authkitbackend.devbro.site";

export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/sdk/me`, {
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function signOutRequest() {
  await fetch(`${API_URL}/sdk/signout`, {
    method: "POST",

    credentials: "include",
  });
}
