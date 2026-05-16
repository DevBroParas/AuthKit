# AuthKIT Full System Summary

This document explains the full AuthKIT repository in an LLM-readable way: what each app/package does, what every API endpoint does, how data moves through the system, and how both developer-login and SDK end-user-login flows work.

## 1. High-Level Product Mental Model

AuthKIT is a small authentication platform with three main pieces:

1. **Backend API** (`backend/`)
   - Express server running on `http://localhost:8000`.
   - Owns OAuth callbacks, JWT creation, cookies, database writes, project management, and SDK session APIs.
   - Uses PostgreSQL through Drizzle ORM.

2. **Dashboard Frontend** (`frontend/`)
   - Next.js dashboard running on `http://localhost:3000`.
   - Used by developers/admins to log in, create projects, view keys, enable providers, add domains, and inspect project overview data.
   - Stores the developer dashboard JWT in `localStorage` under `token`.

3. **React SDK** (`sdk/`)
   - Published package name: `@authkit/react`.
   - Used inside customer applications.
   - Provides `AuthKitProvider`, `useAuth`, `useUser`, `SignedIn`, `SignedOut`, and `AuthButton`.
   - Talks to backend SDK APIs using `credentials: "include"` so browser cookies are sent/received.

There is also a Vite test app under `test apps/test 1/` that demonstrates using the SDK.

## 2. Two Separate Authentication Worlds

AuthKIT has two distinct auth domains:

### A. Developer Dashboard Auth

This is for AuthKIT developers/admins who manage projects.

- User table: `developers`
- JWT helper: `backend/src/lib/jwt.ts`
- Token storage: frontend `localStorage`
- Token lifetime: `7d`
- Protected APIs: `/me`, `/projects/*`
- OAuth routes: `/auth/github`, `/auth/google`

### B. SDK End-User Auth

This is for users signing into a customer app through AuthKIT.

- User table: `users`
- OAuth account table: `oauth_accounts`
- Session table: `sessions`
- JWT helper: `backend/src/lib/sdk-jwt.ts`
- Cookie names:
  - `sdk_access_token`
  - `sdk_refresh_token`
- Access token lifetime: `15m`
- Refresh token lifetime/cookie max age: `30d`
- Protected SDK API: `/sdk/me`
- OAuth routes:
  - `/sdk/oauth/github/start`
  - `/sdk/oauth/github/callback`
  - `/sdk/oauth/google/start`
  - `/sdk/oauth/google/callback`

Important: these two auth systems share `JWT_SECRET`, but they use different token payloads and different storage mechanisms.

## 3. Repository Structure

```text
authkit/
  backend/
    src/
      index.ts                 Express app entrypoint
      db/
        index.ts               PostgreSQL + Drizzle connection
        schema.ts              All database tables
      lib/
        jwt.ts                 Dashboard developer JWTs
        sdk-jwt.ts             SDK user access JWTs
        sdk-cookies.ts         SDK auth cookie set/clear helpers
        keys.ts                Project publishable/secret key generation
        oauth.ts               Dashboard OAuth clients
      middleware/
        auth.ts                Dashboard Bearer-token auth middleware
        sdk-auth.ts            SDK cookie auth middleware
      provides/
        google.ts              SDK Google OAuth client
        github.ts              SDK GitHub OAuth client + GitHub fetch helpers
      routes/
        auth.ts                Dashboard OAuth routes
        auth-me.ts             Current dashboard developer route
        projects.ts            Project/admin routes
        sdk/
          oauth.ts             SDK OAuth start/callback routes
          session.ts           SDK current-user/signout routes
  frontend/
    app/
      auth/login/page.tsx      Dashboard login page
      auth/callback/page.tsx   Stores dashboard JWT from OAuth callback
      dashboard/               Protected dashboard UI
  sdk/
    src/
      context/auth-context.tsx SDK provider and auth actions
      lib/api.ts               SDK backend calls
      hooks/                   `useAuth`, `useUser`
      components/              Auth UI helpers
  test apps/test 1/
    src/main.jsx               Wraps app in `AuthKitProvider`
    src/App.jsx                SDK demo UI
```

## 4. Backend Server Boot Flow

File: `backend/src/index.ts`

1. Loads environment variables via `dotenv/config`.
2. Creates an Express app.
3. Enables JSON body parsing with `express.json()`.
4. Enables CORS for:
   - `http://localhost:3000`
   - `http://localhost:5173`
5. Allows credentials/cookies through CORS via `credentials: true`.
6. Enables cookie parsing through `cookie-parser`.
7. Registers route groups:
   - `GET /`
   - `/auth`
   - `/me`
   - `/projects`
   - `/sdk/oauth`
   - `/sdk`
8. Starts listening on `process.env.PORT || 8000`.

Because SDK auth uses cookies, `credentials: true` and matching frontend `credentials: "include"` are required.

## 5. Database Model

File: `backend/src/db/schema.ts`

### `developers`

Represents dashboard/admin users.

Fields:

- `id`: UUID primary key.
- `email`: required email.
- `name`: optional display name.
- `avatar`: optional avatar URL.
- `provider`: OAuth provider name, e.g. `github` or `google`.
- `providerUserId`: provider-specific account ID.

Used by:

- Dashboard OAuth callbacks.
- `/me`
- Project ownership through `projects.developerId`.

### `projects`

Represents an AuthKIT project owned by a dashboard developer.

Fields:

- `id`: UUID primary key.
- `developerId`: owner developer ID.
- `name`: project name.
- `publishableKey`: public client key, starts with `pk_`.
- `secretKey`: private server key, starts with `sk_`.
- `createdAt`: creation timestamp.

Used by:

- Dashboard project CRUD.
- SDK OAuth start routes to resolve `publishableKey -> project`.
- SDK user/session scoping through `projectId`.

### `users`

Represents end-users inside customer projects.

Fields:

- `id`: UUID primary key.
- `projectId`: project this user belongs to.
- `email`: user email.
- `name`: optional display name.
- `avatar`: optional avatar URL.
- `createdAt`: creation timestamp.

Used by:

- SDK OAuth callbacks.
- `/sdk/me`.
- Project overview/recent users.

### `oauth_accounts`

Links an end-user to an OAuth provider identity.

Fields:

- `id`: UUID primary key.
- `userId`: AuthKIT user ID.
- `provider`: provider name.
- `providerUserId`: provider-specific user ID.

Current behavior:

- Inserted only when a new SDK user is created.
- Existing users are looked up by `projectId + email`, not by `oauth_accounts`.

### `sessions`

Represents SDK end-user sessions.

Fields:

- `id`: UUID primary key.
- `userId`: end-user ID.
- `projectId`: project ID.
- `refreshToken`: opaque UUID refresh token.
- `userAgent`: browser user-agent.
- `ip`: request IP.
- `expiresAt`: refresh/session expiry time.
- `createdAt`: session creation timestamp.

Current behavior:

- Created on each successful SDK OAuth callback.
- Counted in project overview.
- Not currently used by a refresh endpoint.
- Not deleted on SDK signout.

### `project_providers`

Stores provider enable/disable settings per project.

Fields:

- `id`: UUID primary key.
- `projectId`: project ID.
- `provider`: provider name.
- `enabled`: boolean, default `true`.

Current behavior:

- Managed by dashboard project settings.
- Counted in project overview.
- Not currently enforced by SDK OAuth start routes.

### `authorized_domains`

Stores domains allowed to use an AuthKIT project.

Fields:

- `id`: UUID primary key.
- `projectId`: project ID.
- `domain`: allowed domain/origin string.

Current behavior:

- Managed by dashboard project settings.
- Not currently enforced by SDK OAuth start routes.

## 6. Key and Token Helpers

### Dashboard JWTs

File: `backend/src/lib/jwt.ts`

- `createAccessToken({ userId })`
  - Creates an HS256 JWT signed with `JWT_SECRET`.
  - Adds `iat`.
  - Expires in `7d`.
  - Payload stores dashboard developer ID as `userId`.

- `verifyAccessToken(token)`
  - Verifies JWT with `JWT_SECRET`.
  - Returns JWT payload.

Used by:

- Dashboard OAuth callbacks.
- `/me`.
- `requireAuth`.

### SDK JWTs

File: `backend/src/lib/sdk-jwt.ts`

- `createSdkAccessToken({ userId, projectId })`
  - Creates an HS256 JWT signed with `JWT_SECRET`.
  - Adds `iat`.
  - Expires in `15m`.
  - Payload stores end-user ID and project ID.

- `verifySdkAccessToken(token)`
  - Verifies SDK access token.
  - Returns `{ userId, projectId }`.

Used by:

- SDK OAuth callbacks.
- `requireSdkAuth`.

### SDK Cookie Helpers

File: `backend/src/lib/sdk-cookies.ts`

- `setAuthCookies(res, accessToken, refreshToken)`
  - Sets `sdk_access_token` HTTP-only cookie for 15 minutes.
  - Sets `sdk_refresh_token` HTTP-only cookie for 30 days.
  - Uses `secure: false`, `sameSite: "lax"` for local development.

- `clearAuthCookies(res)`
  - Clears both SDK cookies.

Used by:

- GitHub SDK callback uses `setAuthCookies`.
- SDK signout uses `clearAuthCookies`.
- Google SDK callback manually sets the same cookies instead of using the helper.

### Project Key Helpers

File: `backend/src/lib/keys.ts`

- `generatePublishableKey()`
  - Creates `pk_` + 24 random bytes as hex.

- `generateSecretKey()`
  - Creates `sk_` + 32 random bytes as hex.

Used by:

- `POST /projects`.

## 7. Middleware

### `requireAuth`

File: `backend/src/middleware/auth.ts`

Protects dashboard/project APIs.

Flow:

1. Reads `Authorization` header.
2. Expects `Bearer <token>`.
3. Verifies token using `verifyAccessToken`.
4. Stores `payload.userId` on `req.developerId`.
5. Calls `next()`.
6. If missing/invalid, returns `401`.

### `requireSdkAuth`

File: `backend/src/middleware/sdk-auth.ts`

Protects SDK user APIs.

Flow:

1. Reads `sdk_access_token` from cookies.
2. Verifies token using `verifySdkAccessToken`.
3. Stores `payload.userId` on `req.userId`.
4. Stores `payload.projectId` on `req.projectId`.
5. Calls `next()`.
6. If missing/invalid, returns `401`.

Important: if the 15-minute access cookie expires, there is currently no refresh endpoint that uses `sdk_refresh_token` to mint a new access token.

## 8. Full Backend API Reference

Base URL: `http://localhost:8000`

### Health

#### `GET /`

Returns plain text:

```text
Authly API Running
```

Purpose:

- Quick server health check.

---

## 8.1 Dashboard OAuth APIs

Route file: `backend/src/routes/auth.ts`

These APIs authenticate developers who use the AuthKIT dashboard.

### `GET /auth/github`

Starts GitHub OAuth for dashboard developer login.

Input:

- No JSON body.

Flow:

1. Generates a random OAuth `state`.
2. Builds GitHub authorization URL with scope `user:email`.
3. Stores `state` in HTTP-only cookie `github_oauth_state`.
4. Redirects browser to GitHub.

Output:

- Redirect to GitHub.

Failure:

- `500 OAuth failed`.

### `GET /auth/github/callback`

Handles dashboard GitHub OAuth callback.

Expected query params:

- `code`
- `state`

Required cookies:

- `github_oauth_state`

Flow:

1. Reads `code`, query `state`, and cookie `github_oauth_state`.
2. Rejects if any are missing.
3. Rejects if query `state` does not match cookie state.
4. Clears `github_oauth_state`.
5. Exchanges authorization code for GitHub access token.
6. Fetches GitHub profile from `https://api.github.com/user`.
7. Fetches GitHub emails from `https://api.github.com/user/emails`.
8. Selects primary email.
9. Finds existing developer by:
   - `provider = "github"`
   - `providerUserId = githubUser.id`
10. If not found, inserts a new `developers` row.
11. Creates dashboard JWT with payload `{ userId: developer.id }`.
12. Redirects to frontend:
    - `http://localhost:3000/auth/callback?token=<jwt>`

Output:

- Browser redirect to dashboard callback page.

Failure:

- `400 Missing code/state`
- `400 Invalid state`
- `400 Failed to fetch GitHub user`
- `500 GitHub OAuth failed`

### `GET /auth/google`

Starts Google OAuth for dashboard developer login.

Input:

- No JSON body.

Flow:

1. Generates OAuth `state`.
2. Generates PKCE `codeVerifier`.
3. Builds Google authorization URL with scopes:
   - `openid`
   - `email`
   - `profile`
4. Stores state in HTTP-only cookie `google_oauth_state`.
5. Stores PKCE verifier in HTTP-only cookie `google_code_verifier`.
6. Redirects browser to Google.

Output:

- Redirect to Google.

Failure:

- `500 OAuth failed`.

### `GET /auth/google/callback`

Handles dashboard Google OAuth callback.

Expected query params:

- `code`
- `state`

Required cookies:

- `google_oauth_state`
- `google_code_verifier`

Flow:

1. Reads query params and cookies.
2. Rejects if required values are missing.
3. Rejects if query `state` does not match cookie state.
4. Clears OAuth state/verifier cookies.
5. Exchanges authorization code + verifier for Google tokens.
6. Fetches Google profile from `https://www.googleapis.com/oauth2/v2/userinfo`.
7. Finds existing developer by:
   - `provider = "google"`
   - `providerUserId = googleUser.id`
8. If not found, inserts a new `developers` row.
9. Creates dashboard JWT with payload `{ userId: developer.id }`.
10. Redirects to:
    - `http://localhost:3000/auth/callback?token=<jwt>`

Output:

- Browser redirect to dashboard callback page.

Failure:

- `400 Missing params`
- `400 Invalid state`
- `400 Failed to fetch Google user`
- `500 Google OAuth failed`

---

## 8.2 Dashboard Current Developer API

Route file: `backend/src/routes/auth-me.ts`

### `GET /me`

Returns the currently authenticated dashboard developer.

Auth:

- Header: `Authorization: Bearer <dashboard_jwt>`

Flow:

1. Extracts Bearer token from `Authorization`.
2. Verifies token using `verifyAccessToken`.
3. Reads `payload.userId`.
4. Finds matching row in `developers`.
5. Returns developer JSON.

Output:

```json
{
  "id": "developer_uuid",
  "email": "dev@example.com",
  "name": "Developer Name",
  "avatar": "https://...",
  "provider": "google",
  "providerUserId": "provider_id"
}
```

Failure:

- `401 Unauthorized`
- `401 Invalid token`
- `404 Developer not found`

---

## 8.3 Project/Admin APIs

Route file: `backend/src/routes/projects.ts`

All project APIs require:

```http
Authorization: Bearer <dashboard_jwt>
```

The `requireAuth` middleware sets `req.developerId`, and each project-specific route verifies the project belongs to that developer.

### `POST /projects`

Creates a new AuthKIT project.

Body:

```json
{
  "name": "My App"
}
```

Flow:

1. Requires dashboard auth.
2. Validates `name`.
3. Generates:
   - `publishableKey`
   - `secretKey`
4. Inserts a `projects` row with `developerId = req.developerId`.
5. Returns the created project.

Output:

```json
{
  "id": "project_uuid",
  "developerId": "developer_uuid",
  "name": "My App",
  "publishableKey": "pk_...",
  "secretKey": "sk_...",
  "createdAt": "timestamp"
}
```

Failure:

- `400 Project name required`
- `401 Unauthorized`
- `401 Invalid token`
- `500 Failed to create project`

### `GET /projects`

Returns all projects owned by the current developer.

Flow:

1. Requires dashboard auth.
2. Queries `projects` where `developerId = req.developerId`.
3. Returns project array.

Output:

```json
[
  {
    "id": "project_uuid",
    "developerId": "developer_uuid",
    "name": "My App",
    "publishableKey": "pk_...",
    "secretKey": "sk_...",
    "createdAt": "timestamp"
  }
]
```

Failure:

- `500 Failed to fetch projects`

### `GET /projects/:projectId`

Returns one project by ID, only if owned by the current developer.

Flow:

1. Requires dashboard auth.
2. Reads `projectId` route param.
3. Finds project where:
   - `projects.id = projectId`
   - `projects.developerId = req.developerId`
4. Returns project.

Failure:

- `404 Project not found`
- `500 Failed to fetch project`

### `PATCH /projects/:projectId`

Updates a project name.

Body:

```json
{
  "name": "New Project Name"
}
```

Flow:

1. Requires dashboard auth.
2. Validates `name`.
3. Checks project ownership.
4. Updates `projects.name`.
5. Returns updated project.

Failure:

- `400 Project name required`
- `404 Project not found`
- `500 Failed to update project`

### `DELETE /projects/:projectId`

Deletes a project.

Flow:

1. Requires dashboard auth.
2. Checks project ownership.
3. Deletes the row from `projects`.
4. Returns `{ "success": true }`.

Failure:

- `404 Project not found`
- `500 Failed to delete project`

Current behavior note:

- The route deletes only the `projects` row.
- It does not explicitly delete related `users`, `sessions`, `oauth_accounts`, `project_providers`, or `authorized_domains`.

### `GET /projects/:projectId/overview`

Returns dashboard overview data for one project.

Flow:

1. Requires dashboard auth.
2. Checks project ownership.
3. Fetches all users for the project.
4. Fetches all sessions for the project.
5. Fetches all provider settings for the project.
6. Fetches 5 most recent users ordered by `users.createdAt DESC`.
7. Returns project + computed stats + recent users.

Output:

```json
{
  "project": {
    "id": "project_uuid",
    "name": "My App",
    "publishableKey": "pk_...",
    "secretKey": "sk_..."
  },
  "stats": {
    "totalUsers": 10,
    "activeSessions": 5,
    "providersEnabled": 2
  },
  "recentUsers": []
}
```

Current behavior note:

- `activeSessions` counts all session rows for the project, not only unexpired sessions.

Failure:

- `404 Project not found`
- `500 Failed to fetch overview`

### `GET /projects/:projectId/providers`

Returns configured provider rows for a project.

Flow:

1. Requires dashboard auth.
2. Checks project ownership.
3. Queries `project_providers` by `projectId`.
4. Returns provider rows.

Output:

```json
[
  {
    "id": "provider_row_uuid",
    "projectId": "project_uuid",
    "provider": "github",
    "enabled": true
  }
]
```

Failure:

- `404 Project not found`
- `500 Failed to fetch providers`

### `PATCH /projects/:projectId/providers/:provider`

Creates or updates a provider setting for a project.

Body:

```json
{
  "enabled": true
}
```

Flow:

1. Requires dashboard auth.
2. Checks project ownership.
3. Looks for existing provider row by:
   - `projectId`
   - `provider`
4. If no row exists, inserts one.
5. If row exists, updates `enabled`.
6. Returns provider row.

Failure:

- `404 Project not found`
- `500 Failed to update provider`

Current behavior note:

- The SDK OAuth routes do not currently check this table before starting OAuth.

### `GET /projects/:projectId/domains`

Returns authorized domains for a project.

Flow:

1. Requires dashboard auth.
2. Checks project ownership.
3. Queries `authorized_domains` by `projectId`.
4. Returns domain rows.

Output:

```json
[
  {
    "id": "domain_row_uuid",
    "projectId": "project_uuid",
    "domain": "http://localhost:5173"
  }
]
```

Failure:

- `404 Project not found`
- `500 Failed to fetch domains`

### `POST /projects/:projectId/domains`

Adds an authorized domain.

Body:

```json
{
  "domain": "http://localhost:5173"
}
```

Flow:

1. Requires dashboard auth.
2. Validates `domain`.
3. Checks project ownership.
4. Rejects duplicate domain for the same project.
5. Inserts row into `authorized_domains`.
6. Returns created domain row.

Failure:

- `400 Domain required`
- `400 Domain already exists`
- `404 Project not found`
- `500 Failed to add domain`

Current behavior note:

- The SDK OAuth routes accept `redirectUrl` from the SDK request and do not currently validate it against this table.

### `DELETE /projects/:projectId/domains/:domainId`

Deletes an authorized domain row.

Flow:

1. Requires dashboard auth.
2. Checks project ownership.
3. Deletes `authorized_domains` row by `domainId`.
4. Returns `{ "success": true }`.

Failure:

- `404 Project not found`
- `500 Failed to delete domain`

Current behavior note:

- It verifies project ownership, but it does not verify that `domainId` belongs to that project before deleting.

---

## 8.4 SDK OAuth APIs

Route file: `backend/src/routes/sdk/oauth.ts`

These APIs authenticate end-users for customer apps.

Important SDK assumptions:

- Client apps call these endpoints from the browser.
- Requests must use `credentials: "include"`.
- Backend must allow the client origin in CORS.
- OAuth state/project/redirect information is temporarily stored in HTTP-only cookies.

### `POST /sdk/oauth/github/start`

Starts GitHub OAuth for an SDK end-user.

Body:

```json
{
  "publishableKey": "pk_...",
  "redirectUrl": "http://localhost:5173"
}
```

Flow:

1. Validates `publishableKey` and `redirectUrl`.
2. Finds project where `projects.publishableKey = publishableKey`.
3. Rejects if project does not exist.
4. Generates random OAuth state.
5. Creates GitHub authorization URL with scope `user:email`.
6. Sets temporary HTTP-only cookies:
   - `sdk_oauth_state`
   - `sdk_project_id`
   - `sdk_redirect_url`
7. Returns OAuth URL as JSON.

Output:

```json
{
  "url": "https://github.com/login/oauth/authorize?..."
}
```

Frontend/SDK then sets:

```js
window.location.href = data.url
```

Failure:

- `400 Missing fields`
- `404 Project not found`
- `500 OAuth failed`

Current behavior note:

- Does not check whether GitHub is enabled in `project_providers`.
- Does not check whether `redirectUrl` is in `authorized_domains`.

### `GET /sdk/oauth/github/callback`

Handles GitHub OAuth callback for SDK end-users.

Expected query params:

- `code`
- `state`

Required cookies:

- `sdk_oauth_state`
- `sdk_project_id`
- `sdk_redirect_url`

Flow:

1. Reads query `code` and `state`.
2. Reads temporary cookies.
3. Rejects if required values are missing.
4. Rejects if query `state` does not match cookie state.
5. Exchanges authorization code for GitHub access token.
6. Fetches GitHub profile from `https://api.github.com/user`.
7. Fetches GitHub emails from `https://api.github.com/user/emails`.
8. Selects primary email.
9. Finds existing end-user by:
   - `users.projectId = projectId`
   - `users.email = primaryEmail`
10. If user does not exist:
    - Inserts a new `users` row.
    - Inserts a linked `oauth_accounts` row.
11. Generates opaque refresh token with `crypto.randomUUID()`.
12. Inserts `sessions` row with:
    - `userId`
    - `projectId`
    - `refreshToken`
    - `userAgent`
    - `ip`
    - `expiresAt = now + 30d`
13. Creates SDK access JWT with `{ userId, projectId }`.
14. Sets HTTP-only SDK cookies:
    - `sdk_access_token`
    - `sdk_refresh_token`
15. Redirects browser back to `redirectUrl`.

Output:

- Browser redirect to customer app.

Failure:

- `400 Missing params`
- `400 Invalid state`
- `500 OAuth failed`

### `POST /sdk/oauth/google/start`

Starts Google OAuth for an SDK end-user.

Body:

```json
{
  "publishableKey": "pk_...",
  "redirectUrl": "http://localhost:5173"
}
```

Flow:

1. Validates `publishableKey` and `redirectUrl`.
2. Finds project by publishable key.
3. Generates OAuth state.
4. Generates PKCE code verifier.
5. Creates Google authorization URL with scopes:
   - `openid`
   - `profile`
   - `email`
6. Sets temporary HTTP-only cookies:
   - `sdk_google_oauth_state`
   - `sdk_google_code_verifier`
   - `sdk_project_id`
   - `sdk_redirect_url`
7. Returns OAuth URL as JSON.

Output:

```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

Failure:

- `400 Missing params`
- `404 Project not found`
- `500 Google OAuth failed`

Current behavior note:

- Does not check whether Google is enabled in `project_providers`.
- Does not check whether `redirectUrl` is in `authorized_domains`.

### `GET /sdk/oauth/google/callback`

Handles Google OAuth callback for SDK end-users.

Expected query params:

- `code`
- `state`

Required cookies:

- `sdk_google_oauth_state`
- `sdk_google_code_verifier`
- `sdk_project_id`
- `sdk_redirect_url`

Flow:

1. Reads query params and temporary cookies.
2. Rejects if required values are missing.
3. Rejects if query `state` does not match cookie state.
4. Exchanges authorization code + PKCE verifier for Google tokens.
5. Fetches profile from `https://openidconnect.googleapis.com/v1/userinfo`.
6. Finds existing end-user by:
   - `users.projectId = projectId`
   - `users.email = googleUser.email`
7. If user does not exist:
   - Inserts a new `users` row.
   - Inserts a linked `oauth_accounts` row.
8. Generates refresh token.
9. Inserts `sessions` row.
10. Creates SDK access JWT with `{ userId, projectId }`.
11. Sets `sdk_access_token` and `sdk_refresh_token` cookies.
12. Redirects browser back to `redirectUrl`.

Output:

- Browser redirect to customer app.

Failure:

- `400 Missing params`
- `400 Invalid state`
- `500 Google OAuth failed`

---

## 8.5 SDK Session APIs

Route file: `backend/src/routes/sdk/session.ts`

### `GET /sdk/me`

Returns the currently logged-in SDK end-user.

Auth:

- Cookie: `sdk_access_token`

Flow:

1. `requireSdkAuth` verifies `sdk_access_token`.
2. Middleware places `userId` on request.
3. Route queries `users` by `req.userId`.
4. Returns user JSON.

Output:

```json
{
  "id": "user_uuid",
  "projectId": "project_uuid",
  "email": "user@example.com",
  "name": "User Name",
  "avatar": "https://...",
  "createdAt": "timestamp"
}
```

Failure:

- `401 Unauthorized`
- `500 Failed`

Current behavior note:

- It does not verify that the returned user still belongs to `req.projectId`; it only queries by `userId`.

### `POST /sdk/signout`

Signs out an SDK end-user at the browser-cookie level.

Auth:

- No middleware required.

Flow:

1. Clears `sdk_access_token`.
2. Clears `sdk_refresh_token`.
3. Returns `{ "success": true }`.

Output:

```json
{
  "success": true
}
```

Current behavior note:

- It does not delete or revoke the corresponding row in `sessions`.

## 9. Dashboard Frontend Flow

### Login Page

File: `frontend/app/auth/login/page.tsx`

Flow:

1. On mount, checks `localStorage.getItem("token")`.
2. If token exists, first redirects to `/dashboard`.
3. Another effect validates token by calling `GET http://localhost:8000/me` with Bearer auth.
4. If valid, redirects to `/dashboard`.
5. If invalid, removes token and stays on login page.
6. GitHub button redirects browser to `http://localhost:8000/auth/github`.
7. Google button redirects browser to `http://localhost:8000/auth/google`.
8. Apple button is present in UI but has no implemented auth handler.

### OAuth Callback Page

File: `frontend/app/auth/callback/page.tsx`

Flow:

1. Reads `token` query param.
2. If present, stores it in `localStorage` as `token`.
3. Redirects to `/dashboard`.
4. If absent, redirects to `/auth/login`.

This page receives the dashboard JWT from the backend OAuth callback redirect.

### Dashboard Layout

File: `frontend/app/dashboard/layout.tsx`

Flow:

1. Every dashboard route is wrapped by this layout.
2. On mount:
   - Reads `localStorage.token`.
   - If missing, redirects to `/auth/login`.
   - Calls `GET /me`.
   - If invalid, removes token and redirects to login.
   - If valid, stores developer in local React state.
3. Renders sidebar navigation.
4. Logout removes `localStorage.token` and redirects to login.

### Projects Page

File: `frontend/app/dashboard/projects/page.tsx`

Main actions:

- Fetch all projects from `GET /projects`.
- Create project with `POST /projects`.
- Update project name with `PATCH /projects/:projectId`.
- Delete project with `DELETE /projects/:projectId`.
- Copy publishable and secret keys to clipboard.
- Link into project overview/settings pages.

Important UI behavior:

- After project creation, the newly returned keys are shown in the UI.
- All requests read the dashboard JWT from `localStorage`.

### Project Overview Page

File: `frontend/app/dashboard/projects/[projectId]/page.tsx`

Main action:

- Calls `GET /projects/:projectId/overview`.

Uses returned data to show:

- Project details.
- Total users.
- Active sessions.
- Providers enabled.
- Recent users.
- Publishable/secret keys.

The signup chart data is static mock data, not currently driven by backend analytics.

### Project Settings Page

File: `frontend/app/dashboard/projects/[projectId]/settings/page.tsx`

Main actions:

- Fetch project with `GET /projects/:projectId`.
- Rename project with `PATCH /projects/:projectId`.
- Fetch provider settings with `GET /projects/:projectId/providers`.
- Toggle provider with `PATCH /projects/:projectId/providers/:provider`.
- Fetch authorized domains with `GET /projects/:projectId/domains`.
- Add domain with `POST /projects/:projectId/domains`.
- Delete domain with `DELETE /projects/:projectId/domains/:domainId`.
- Delete project with `DELETE /projects/:projectId`.
- Copy keys to clipboard.

Current UI pages with placeholders:

- `frontend/app/dashboard/users/page.tsx`
- `frontend/app/dashboard/api-keys/page.tsx`
- `frontend/app/dashboard/docs/page.tsx`
- `frontend/app/dashboard/settings/page.tsx`

## 10. React SDK Flow

SDK entry: `sdk/src/index.ts`

Exports:

- `AuthKitProvider`
- `useAuth`
- `useUser`
- `SignedIn`
- `SignedOut`
- `AuthButton`

### `AuthKitProvider`

File: `sdk/src/context/auth-context.tsx`

Props:

```tsx
<AuthKitProvider publishableKey="pk_...">
  <App />
</AuthKitProvider>
```

State:

- `user`: current SDK end-user or `null`.
- `loading`: true while checking session.

On mount:

1. Calls `refreshUser()`.
2. Adds a browser `focus` listener to call `refreshUser()` again whenever the window regains focus.

`refreshUser()`:

1. Calls SDK helper `getCurrentUser()`.
2. `getCurrentUser()` calls `GET http://localhost:8000/sdk/me` with `credentials: "include"`.
3. If backend returns a user, sets `user`.
4. If request fails or returns non-OK, sets `user = null`.
5. Sets `loading = false`.

`signInWithGithub()`:

1. Calls `POST http://localhost:8000/sdk/oauth/github/start`.
2. Sends:
   - `publishableKey`
   - `redirectUrl: window.location.origin`
3. Uses `credentials: "include"` so temporary OAuth cookies can be set.
4. Receives `{ url }`.
5. Redirects browser to `url`.

`signInWithGoogle()`:

1. Calls `POST http://localhost:8000/sdk/oauth/google/start`.
2. Sends:
   - `publishableKey`
   - `redirectUrl: window.location.origin`
3. Uses `credentials: "include"`.
4. Receives `{ url }`.
5. Redirects browser to `url`.

`signOut()`:

1. Calls `POST http://localhost:8000/sdk/signout` with `credentials: "include"`.
2. Backend clears SDK cookies.
3. SDK sets `user = null`.

### `useAuth`

File: `sdk/src/hooks/useAuth.ts`

Returns full auth context:

```ts
{
  user,
  loading,
  signInWithGithub,
  signInWithGoogle,
  signOut,
  refreshUser
}
```

Throws an error if used outside `AuthKitProvider`.

### `useUser`

File: `sdk/src/hooks/useUser.ts`

Convenience hook returning:

```ts
{
  user,
  loading
}
```

### `SignedIn`

File: `sdk/src/components/SignedIn.tsx`

Renders children only when `user` exists.

### `SignedOut`

File: `sdk/src/components/SignedOut.tsx`

Renders children only when `user` is `null`.

### `AuthButton`

File: `sdk/src/components/AuthButton.tsx`

Simple button:

- If signed in, renders logout button.
- If signed out, renders GitHub login button.

Current behavior note:

- `AuthButton` only exposes GitHub login, even though the provider supports Google through `signInWithGoogle`.

## 11. Test App Flow

Files:

- `test apps/test 1/src/main.jsx`
- `test apps/test 1/src/App.jsx`

Flow:

1. Vite app wraps `<App />` with:

```jsx
<AuthKitProvider publishableKey="pk_...">
  <App />
</AuthKitProvider>
```

2. `App.jsx` calls:

```js
const { user, loading } = useUser()
const { signInWithGithub, signInWithGoogle, signOut } = useAuth()
```

3. While loading, renders `Loading...`.
4. When signed out:
   - `SignedOut` renders GitHub and Google login buttons.
5. When signed in:
   - `SignedIn` renders avatar, name, email, and logout button.

## 12. End-to-End Developer User Flow

This is the flow for someone using AuthKIT dashboard to create/manage a project.

```text
Developer browser
  -> frontend /auth/login
  -> click Google/GitHub
  -> backend /auth/:provider
  -> provider authorization page
  -> backend /auth/:provider/callback
  -> backend finds/creates developer
  -> backend creates 7-day dashboard JWT
  -> redirects to frontend /auth/callback?token=...
  -> frontend stores token in localStorage
  -> frontend redirects to /dashboard
  -> dashboard layout validates token via GET /me
  -> developer can manage projects
```

Detailed steps:

1. Developer opens `http://localhost:3000/auth/login`.
2. Frontend checks if a token exists in `localStorage`.
3. Developer clicks GitHub or Google.
4. Browser goes to backend `/auth/github` or `/auth/google`.
5. Backend stores OAuth anti-CSRF state in HTTP-only cookie.
6. Browser redirects to provider.
7. Provider redirects back to backend callback with `code` and `state`.
8. Backend validates state against cookie.
9. Backend exchanges code for provider access token.
10. Backend fetches provider profile/email.
11. Backend finds or creates a `developers` row.
12. Backend signs a JWT with `{ userId: developer.id }`.
13. Backend redirects browser to frontend callback with JWT in query string.
14. Frontend stores JWT in `localStorage`.
15. Dashboard layout uses JWT as Bearer token for `/me` and `/projects`.

## 13. End-to-End Project Creation Flow

```text
Dashboard frontend
  -> POST /projects with Bearer developer JWT
  -> backend requireAuth verifies developer
  -> backend generates pk_ and sk_
  -> backend inserts project row
  -> frontend receives project and displays keys
```

Detailed steps:

1. Developer opens dashboard Projects page.
2. Page calls `GET /projects` to list existing projects.
3. Developer enters a project name.
4. Page calls `POST /projects`.
5. Backend validates dashboard JWT.
6. Backend inserts a new project row owned by the developer.
7. Backend returns the full project with `publishableKey` and `secretKey`.
8. Frontend displays/copies those keys.
9. The publishable key is intended for SDK/browser use.
10. The secret key exists but is not currently used by backend APIs in this repo.

## 14. End-to-End SDK End-User Login Flow

This is the flow inside a customer app using `@authkit/react`.

```text
Customer app
  -> AuthKitProvider loads
  -> GET /sdk/me with cookies
  -> no user, render signed-out UI
  -> user clicks provider login
  -> POST /sdk/oauth/:provider/start
  -> backend validates publishable key
  -> backend stores state/project/redirect cookies
  -> SDK redirects browser to provider
  -> provider redirects to backend callback
  -> backend validates state
  -> backend finds/creates project user
  -> backend creates session row
  -> backend sets SDK auth cookies
  -> backend redirects to customer app
  -> AuthKitProvider refreshes on focus/reload
  -> GET /sdk/me returns user
  -> signed-in UI renders
```

Detailed steps:

1. Customer app wraps itself in `AuthKitProvider`.
2. SDK immediately calls `/sdk/me`.
3. If no `sdk_access_token` cookie exists, backend returns `401`; SDK stores `user = null`.
4. Customer app renders `SignedOut` children.
5. User clicks GitHub or Google login.
6. SDK calls `/sdk/oauth/github/start` or `/sdk/oauth/google/start`.
7. Request body includes:
   - `publishableKey`
   - `redirectUrl = window.location.origin`
8. Backend finds the project by publishable key.
9. Backend stores temporary OAuth state/project/redirect info in HTTP-only cookies.
10. Backend returns provider authorization URL.
11. SDK redirects browser to the provider.
12. Provider redirects to backend callback.
13. Backend validates OAuth state.
14. Backend exchanges code for provider token.
15. Backend fetches provider user profile/email.
16. Backend searches for existing `users` row by project + email.
17. If not found, backend creates `users` and `oauth_accounts` rows.
18. Backend creates a `sessions` row with an opaque refresh token.
19. Backend creates a short-lived SDK access JWT.
20. Backend stores access and refresh tokens in HTTP-only cookies.
21. Backend redirects browser back to customer app origin.
22. SDK refreshes user on page load/focus.
23. `/sdk/me` reads cookie, verifies token, and returns the user.
24. Customer app renders `SignedIn` children.

## 15. Data Flow by Entity

### Developer Data

Created when:

- A dashboard OAuth callback succeeds for a new provider identity.

Read when:

- Dashboard calls `/me`.
- Project APIs need `req.developerId` from JWT.

Updated:

- Not currently updated after first creation.

Deleted:

- No developer delete route exists.

### Project Data

Created when:

- Dashboard calls `POST /projects`.

Read when:

- Dashboard lists projects.
- Dashboard reads project overview/settings.
- SDK OAuth start resolves publishable key to project.

Updated when:

- Dashboard renames project.

Deleted when:

- Dashboard deletes project.

### SDK User Data

Created when:

- SDK OAuth callback succeeds and no user exists for `projectId + email`.

Read when:

- SDK calls `/sdk/me`.
- Dashboard project overview reads users/recent users.

Updated:

- Not currently updated when provider profile changes.

Deleted:

- No user delete route exists.

### Session Data

Created when:

- SDK OAuth callback succeeds.

Read when:

- Dashboard project overview counts sessions.

Updated:

- Not currently updated.

Deleted:

- Not currently deleted by signout.

### Provider Settings

Created or updated when:

- Dashboard toggles provider in project settings.

Read when:

- Dashboard fetches project providers.
- Dashboard project overview counts enabled providers.

Enforced:

- Not currently enforced by SDK login routes.

### Authorized Domains

Created/deleted when:

- Dashboard manages domains in project settings.

Read when:

- Dashboard settings page fetches domains.

Enforced:

- Not currently enforced by SDK login routes.

## 16. Security and Correctness Notes for Future LLMs

These are not necessarily bugs the current task must fix; they are important implementation facts.

1. **Dashboard token in URL**
   - OAuth callbacks redirect to `/auth/callback?token=<jwt>`.
   - The frontend stores it in `localStorage`.
   - This works for local development but exposes token through URL/history unless cleaned quickly.

2. **Dashboard token in localStorage**
   - Simpler to implement, but vulnerable to theft if XSS exists.

3. **SDK cookies are HTTP-only**
   - Better for browser security.
   - Current cookie config uses `secure: false`, appropriate only for local HTTP development.

4. **No SDK refresh endpoint**
   - Refresh tokens are created and stored, but no endpoint uses them to renew `sdk_access_token`.

5. **SDK signout does not revoke sessions**
   - It clears browser cookies only.
   - `sessions` table rows remain.

6. **Provider toggles are not enforced**
   - A disabled provider in dashboard can still be used if SDK calls the corresponding start endpoint.

7. **Authorized domains are not enforced**
   - SDK sends any `window.location.origin` as `redirectUrl`.
   - Backend stores it in a cookie and redirects to it after OAuth.

8. **Secret keys are generated but unused**
   - `secretKey` exists in `projects`, but no API currently authenticates with it.

9. **No database-level relationships shown in schema**
   - Drizzle table definitions use UUID/text fields but do not define foreign key constraints in the TypeScript schema.

10. **Project delete is not cascading in route code**
    - Deleting a project does not explicitly delete related rows.

11. **Existing SDK users are matched by email**
    - OAuth account provider IDs are stored, but existing-login lookup is by `projectId + email`.

12. **OAuth temporary cookies are not always cleared**
    - Dashboard callbacks clear state cookies.
    - SDK callbacks set final auth cookies but do not clear all temporary OAuth cookies.

13. **Dashboard overview uses simple counts**
    - `activeSessions` is total session rows, not filtered by `expiresAt`.
    - Signup chart in frontend is static mock data.

14. **CORS origins are hardcoded**
    - Only `localhost:3000` and `localhost:5173` are allowed.

15. **API URLs are hardcoded in frontend/SDK**
    - Dashboard and SDK currently call `http://localhost:8000` directly.

## 17. Environment Variables Implied by Code

Backend expects:

```text
PORT
DATABASE_URL
JWT_SECRET

GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET

GOOGLE_CLIENT_ID_SDK
GOOGLE_CLIENT_SECRET_SDK
GITHUB_CLIENT_ID_SDK
GITHUB_CLIENT_SECRET_SDK

BACKEND_URL
```

Dashboard OAuth redirect URLs are hardcoded in `backend/src/lib/oauth.ts`:

```text
http://localhost:8000/auth/google/callback
http://localhost:8000/auth/github/callback
```

SDK OAuth redirect URLs use `BACKEND_URL`:

```text
${BACKEND_URL}/sdk/oauth/google/callback
${BACKEND_URL}/sdk/oauth/github/callback
```

## 18. Complete Flow Diagram

```text
                      +----------------------+
                      |  Dashboard Frontend  |
                      |  localhost:3000      |
                      +----------+-----------+
                                 |
                     dashboard OAuth / projects
                                 |
                                 v
                      +----------------------+
                      |  Express Backend     |
                      |  localhost:8000      |
                      +----+------------+----+
                           |            |
                    Drizzle|            |OAuth
                           v            v
                    +-------------+  +----------------+
                    | PostgreSQL  |  | Google/GitHub  |
                    +-------------+  +----------------+
                           ^
                           |
                     SDK OAuth/session data
                           |
                      +----+-----------------+
                      | Customer React App   |
                      | localhost:5173       |
                      | @authkit/react       |
                      +----------------------+
```

## 19. Minimal Mental Model for an LLM

If an LLM needs to reason about this repo quickly, use this compressed model:

- AuthKIT is split into **dashboard developer auth** and **SDK end-user auth**.
- Dashboard auth uses OAuth -> `developers` -> 7-day JWT -> frontend `localStorage`.
- SDK auth uses OAuth -> `users` + `oauth_accounts` + `sessions` -> HTTP-only cookies.
- `projects` connect the two worlds:
  - Developers own projects.
  - SDK users belong to projects.
  - SDK start routes identify the project using `publishableKey`.
- Dashboard protected APIs use `Authorization: Bearer <developer_jwt>`.
- SDK protected APIs use `sdk_access_token` cookie.
- Project settings currently store provider/domain configuration, but SDK OAuth does not enforce those settings yet.
- Refresh tokens and secret keys exist in data model but are not actively used for refresh/server-auth flows yet.

