# SDK Localhost Auth Flow Handoff

This file explains the change made to make the AuthKit SDK work from a localhost app without relying on third-party cookies.

## Problem

The test app runs at:

```txt
http://localhost:5173
```

The hosted AuthKit backend runs at:

```txt
https://authkitbackend.devbro.site
```

The original SDK login flow stored `sdk_access_token` and `sdk_refresh_token` as `HttpOnly` cookies on `authkitbackend.devbro.site`.

That works when visiting the backend directly, but Firefox Enhanced Tracking Protection blocked those backend cookies from being sent during cross-site `fetch` calls from `localhost:5173` to `authkitbackend.devbro.site`.

Result:

```txt
GET /sdk/me -> no Cookie header -> 401 Unauthorized
```

Turning off tracking protection made it work, which confirmed the issue was browser cross-site cookie blocking, not OAuth, database, or JWT creation.

## New Approach

The SDK now supports a Clerk-style OAuth code exchange flow for localhost/SPAs.

OAuth still starts on the hosted AuthKit backend, but after GitHub/Google login the backend redirects back to the app with a short-lived one-time code:

```txt
http://localhost:5173/?authkit_code=<one-time-code>
```

The SDK consumes that code, exchanges it for an SDK access token, stores the access token in `localStorage`, and sends it on future API requests:

```txt
Authorization: Bearer <access-token>
```

This avoids relying on third-party cookies for `/sdk/me`.

## Current Flow

1. Test app renders `AuthKitProvider`.
2. User clicks `Login with GitHub`.
3. SDK redirects to:

```txt
https://authkitbackend.devbro.site/sdk/oauth/github/start?publishableKey=...&redirectUrl=http%3A%2F%2Flocalhost%3A5173
```

4. Backend validates the publishable key and authorized redirect origin.
5. Backend stores temporary OAuth cookies for state/project/redirect.
6. Browser goes to GitHub.
7. GitHub redirects back to:

```txt
https://authkitbackend.devbro.site/sdk/oauth/github/callback
```

8. Backend validates OAuth state, fetches GitHub user/email, creates or finds the SDK user, creates a DB session, and still sets the old backend cookies for compatibility.
9. Backend creates an in-memory one-time exchange code that expires after 60 seconds.
10. Backend redirects back to:

```txt
http://localhost:5173/?authkit_code=<one-time-code>
```

11. SDK detects `authkit_code`, removes it from the URL with `history.replaceState`, and calls:

```txt
POST https://authkitbackend.devbro.site/sdk/oauth/exchange
```

12. Backend consumes the code once and returns:

```json
{
  "accessToken": "...",
  "user": {
    "id": "...",
    "projectId": "...",
    "email": "...",
    "name": "...",
    "avatar": "...",
    "createdAt": "..."
  }
}
```

13. SDK stores the access token in:

```txt
localStorage["authkit_access_token"]
```

14. SDK calls `/sdk/me` with:

```txt
Authorization: Bearer <access-token>
```

15. Backend `requireSdkAuth` accepts either the bearer token or the old `sdk_access_token` cookie.

## Important Files

- `backend/src/routes/sdk/oauth.ts`
  - Creates one-time exchange codes.
  - Adds `authkit_code` to OAuth callback redirects.
  - Adds `POST /sdk/oauth/exchange`.

- `backend/src/middleware/sdk-auth.ts`
  - Reads `Authorization: Bearer ...` first.
  - Falls back to `req.cookies.sdk_access_token`.

- `backend/src/routes/sdk/session.ts`
  - `/sdk/me` sets `Cache-Control: no-store` so auth checks do not show confusing `304` responses.

- `sdk/src/lib/api.ts`
  - Stores and clears `authkit_access_token` in `localStorage`.
  - Sends bearer token on `/sdk/me`.
  - Exchanges `authkit_code` through `/sdk/oauth/exchange`.

- `sdk/src/context/auth-context.tsx`
  - Detects `authkit_code` on page load.
  - Exchanges it.
  - Removes it from the URL.
  - Sets SDK user state.

## Verification

Both builds passed after the change:

```txt
cd backend && npm run build
cd sdk && npm run build
```

The user confirmed the new localhost flow worked.

## Known Limitations / Next Steps

The exchange code is currently stored in memory:

```ts
const exchangeCodes = new Map(...)
```

That is okay for local testing or a single backend instance, but production should use Redis or a database table so codes survive restarts and work across multiple server instances.

The exchange code is one-time use and expires after 60 seconds.

The SDK access token still expires after 15 minutes. There is no refresh endpoint yet for the localStorage bearer-token flow. A future AI should add a refresh mechanism, probably using one of these designs:

- Return both access and refresh tokens from `/sdk/oauth/exchange`, store refresh token carefully, and add `/sdk/token/refresh`.
- Prefer an app-backend flow for production apps, where the customer app backend exchanges the code and sets its own first-party cookie.

For now, this change fixes the localhost SPA case without disabling browser tracking protection.
