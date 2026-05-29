# AuthCit Project Explanation

This project is an authentication product. Think of it like a small version of Clerk/Auth0:

- `frontend/` is the AuthCit dashboard where a developer logs in, creates apps, adds domains, enables providers, and copies keys.
- `backend/` is the API server. It talks to the database, GitHub, Google, creates JWT tokens, creates projects, stores users, sessions, domains, providers, and keys.
- `sdk/` is the React package that another app installs. That app uses AuthCit login buttons/components so its own users can sign in.


## The Most Important Mental Model

There are two different kinds of people in this project:

1. `developer`
   - This is you, the person using the AuthCit dashboard.
   - You log in at `frontend/app/auth/login/page.tsx`.
   - Your data is saved in the `developers` table.
   - Your dashboard token is stored in browser `localStorage` as `token`.

2. `user`
   - This is the end user of an app that uses the AuthCit SDK.
   - They click a login button from `sdk/`.
   - Their data is saved in the `users` table.
   - Their session is saved in the `sessions` table.
   - Their SDK access token is stored by the SDK in browser `localStorage` as `authkit_access_token`, and the backend also sets SDK auth cookies.

So:

```txt
Dashboard login -> developer
SDK login       -> user
```

## What Runs First

### Backend

The backend starts from:

```txt
backend/src/index.ts
```

When you run:

```bash
cd backend
npm run dev
```

this script runs:

```json
"dev": "tsx watch src/index.ts"
```

`backend/src/index.ts` does these things:

1. Loads environment variables with `dotenv/config`.
2. Creates an Express app.
3. Enables JSON body parsing using `express.json()`.
4. Enables CORS so frontend requests can include credentials.
5. Enables cookies using `cookie-parser`.
6. Registers route files:

```txt
/auth        -> backend/src/routes/auth.ts
/me          -> backend/src/routes/auth-me.ts
/projects    -> backend/src/routes/projects.ts
/users       -> backend/src/routes/users.ts
/dashboard   -> backend/src/routes/dashboard.ts
/sdk/oauth   -> backend/src/routes/sdk/oauth.ts
/sdk         -> backend/src/routes/sdk/session.ts
```

7. Starts listening on `PORT`, usually `8000`.

The database connection is created in:

```txt
backend/src/db/index.ts
```

The database table shapes are defined in:

```txt
backend/src/db/schema.ts
```

### Frontend

The dashboard frontend is a Next.js app. It starts from the Next.js `app` folder.

When you run:

```bash
cd frontend
npm run dev
```

this script runs:

```json
"dev": "next dev"
```

Important frontend entry files:

```txt
frontend/app/layout.tsx
frontend/app/page.tsx
frontend/app/auth/login/page.tsx
frontend/app/auth/callback/page.tsx
frontend/app/dashboard/layout.tsx
frontend/app/dashboard/page.tsx
frontend/app/dashboard/projects/page.tsx
frontend/app/dashboard/projects/[projectId]/page.tsx
frontend/app/dashboard/projects/[projectId]/settings/page.tsx
frontend/app/dashboard/api-keys/page.tsx
```

`frontend/lib/api.ts` contains:

```ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL!;
```

That means the frontend uses `NEXT_PUBLIC_API_URL` to know where the backend is.

### SDK

The SDK package starts from:

```txt
sdk/src/index.ts
```

That file exports the things another React app can use:

```txt
AuthKitProvider
useAuth
useUser
SignedIn
SignedOut
AuthButton
LoginCard
ProfileCard
```

When the SDK is built, it uses:

```json
"build": "tsup src/index.ts --format esm,cjs --dts --tsconfig tsconfig.build.json"
```

The most important SDK file is:

```txt
sdk/src/context/auth-context.tsx
```

That file stores the logged-in user state and contains the functions:

```txt
signInWithGithub()
signInWithGoogle()
signOut()
refreshUser()
```

## Main Database Tables

Defined in:

```txt
backend/src/db/schema.ts
```

Important tables:

```txt
developers
```

Stores dashboard users. A developer owns projects.

```txt
projects
```

Stores apps created in the dashboard. Each project has:

- `developerId`
- `name`
- `publishableKey`
- `secretKey`

```txt
authorized_domains
```

Stores allowed frontend origins for a project, for example:

```txt
http://localhost:5173
https://myapp.com
```

The SDK login flow checks this table before allowing login.

```txt
project_providers
```

Stores which OAuth providers are enabled/disabled for a project.

Example:

```txt
project A -> github -> enabled true
project A -> google -> enabled false
```

```txt
users
```

Stores end users who log in to apps using the SDK.

```txt
oauth_accounts
```

Connects an AuthCit user to their GitHub/Google account.

```txt
sessions
```

Stores user sessions for SDK users.

```txt
user_project_status
```

Stores whether a user is blocked inside a project.

## Dashboard Login Flow

This is the login flow for the developer dashboard.

### 1. User opens dashboard login page

File:

```txt
frontend/app/auth/login/page.tsx
```

This page checks browser `localStorage`:

```txt
localStorage.getItem("token")
```

If a token already exists, it calls:

```txt
GET /me
```

If the token is valid, the user is redirected to:

```txt
/dashboard
```

If no token exists, it shows Google and GitHub login buttons.

### 2. Developer clicks Google or GitHub

In:

```txt
frontend/app/auth/login/page.tsx
```

GitHub button runs:

```txt
window.location.replace(`${API_URL}/auth/github`)
```

Google button runs:

```txt
window.location.replace(`${API_URL}/auth/google`)
```

So the browser leaves the frontend and goes to the backend.

### 3. Backend starts OAuth

File:

```txt
backend/src/routes/auth.ts
```

Routes:

```txt
GET /auth/github
GET /auth/google
```

For GitHub:

1. Backend creates a random `state`.
2. Backend saves that state in a cookie called `github_oauth_state`.
3. Backend redirects the browser to GitHub's login page.

For Google:

1. Backend creates a `state`.
2. Backend creates a `codeVerifier`.
3. Backend saves them in cookies:

```txt
google_oauth_state
google_code_verifier
```

4. Backend redirects the browser to Google's login page.

The `state` protects the login flow from fake callback requests.

### 4. GitHub/Google sends the browser back to backend

Callback routes:

```txt
GET /auth/github/callback
GET /auth/google/callback
```

Still in:

```txt
backend/src/routes/auth.ts
```

The backend receives:

```txt
code
state
```

Then it:

1. Compares the returned `state` with the state stored in the cookie.
2. Exchanges the OAuth `code` for an OAuth access token.
3. Calls GitHub or Google API to get the developer profile.
4. Searches the `developers` table for this provider account.
5. If the developer does not exist, inserts a new row into `developers`.
6. Creates a dashboard JWT using:

```txt
backend/src/lib/jwt.ts
```

The function is:

```txt
createAccessToken({ userId: developer.id })
```

This token expires in `7d`.

### 5. Backend redirects back to frontend

The backend redirects to:

```txt
${FRONTEND_URL}/auth/callback?token=JWT_HERE
```

The frontend callback page is:

```txt
frontend/app/auth/callback/page.tsx
```

That file:

1. Reads `token` from the URL.
2. Saves it in browser localStorage:

```txt
localStorage.setItem("token", token)
```

3. Redirects to:

```txt
/dashboard
```

### 6. Dashboard verifies the developer

Dashboard layout file:

```txt
frontend/app/dashboard/layout.tsx
```

This layout wraps all dashboard pages. When it loads, it:

1. Reads `token` from localStorage.
2. Calls:

```txt
GET /me
Authorization: Bearer token
```

Backend route:

```txt
backend/src/routes/auth-me.ts
```

That route:

1. Reads the Bearer token.
2. Verifies it using:

```txt
backend/src/lib/jwt.ts
```

3. Gets `developerId` from the token payload.
4. Finds that developer in the `developers` table.
5. Returns developer data to the frontend.

Now the dashboard knows who is logged in.

## Dashboard Overview Flow

Dashboard page:

```txt
frontend/app/dashboard/page.tsx
```

This page calls:

```txt
GET /dashboard/overview
Authorization: Bearer token
```

Backend route:

```txt
backend/src/routes/dashboard.ts
```

Before the route runs, it uses middleware:

```txt
backend/src/middleware/auth.ts
```

That middleware is called:

```txt
requireAuth
```

It:

1. Reads `Authorization: Bearer token`.
2. Verifies the dashboard JWT.
3. Adds this to the request:

```txt
req.developerId = payload.userId
```

Then `/dashboard/overview`:

1. Finds all projects owned by this developer.
2. Finds users belonging to those projects.
3. Finds sessions belonging to those projects.
4. Finds enabled providers belonging to those projects.
5. Returns stats to the dashboard.

## Create App / Create Project Flow

In this codebase, "app" and "project" mean almost the same thing. The dashboard UI calls them projects.

### 1. Developer opens Projects page

File:

```txt
frontend/app/dashboard/projects/page.tsx
```

When the page loads, it calls:

```txt
GET /projects
Authorization: Bearer token
```

Backend file:

```txt
backend/src/routes/projects.ts
```

Route:

```txt
GET /projects
```

This returns all projects where:

```txt
projects.developerId === req.developerId
```

### 2. Developer enters project name and clicks Create Project

Frontend function:

```txt
createProject()
```

in:

```txt
frontend/app/dashboard/projects/page.tsx
```

It sends:

```txt
POST /projects
Authorization: Bearer token
Content-Type: application/json

{
  "name": "My SaaS App"
}
```

### 3. Backend creates the project

Backend route:

```txt
POST /projects
```

in:

```txt
backend/src/routes/projects.ts
```

This route uses:

```txt
requireAuth
```

So only a logged-in developer can create a project.

Then it:

1. Reads `name` from `req.body`.
2. Uses `req.developerId` from the JWT.
3. Generates keys using:

```txt
backend/src/lib/keys.ts
```

Functions:

```txt
generatePublishableKey()
generateSecretKey()
```

These generate strings like:

```txt
pk_randomhex
sk_randomhex
```

4. Inserts a row into the `projects` table:

```txt
name
developerId
publishableKey
secretKey
```

5. Returns the new project to the frontend.

### 4. Frontend shows the keys

Back in:

```txt
frontend/app/dashboard/projects/page.tsx
```

The response is stored in:

```txt
createdProject
```

Then a dialog opens and shows:

```txt
Publishable Key
Secret Key
```

The publishable key is used in frontend apps with the SDK.

The secret key should stay private. In this codebase, it is created and shown in the dashboard, but the SDK login flow mostly uses the publishable key.

## Get Keys / API Keys Flow

There are two places keys are shown:

1. Project creation dialog:

```txt
frontend/app/dashboard/projects/page.tsx
```

2. API Keys page:

```txt
frontend/app/dashboard/api-keys/page.tsx
```

When the API Keys page loads, it calls:

```txt
GET /projects/keys
Authorization: Bearer token
```

Backend route:

```txt
GET /projects/keys
```

in:

```txt
backend/src/routes/projects.ts
```

That route:

1. Uses `requireAuth`.
2. Finds all projects owned by the logged-in developer.
3. Returns project IDs, names, publishable keys, and secret keys.

The API Keys page also allows regenerating keys.

When the developer clicks regenerate, frontend sends:

```txt
POST /projects/:projectId/regenerate
Authorization: Bearer token

{
  "type": "publishable"
}
```

or:

```txt
{
  "type": "secret"
}
```

Backend route:

```txt
POST /projects/:projectId/regenerate
```

in:

```txt
backend/src/routes/projects.ts
```

It:

1. Checks that the project belongs to the logged-in developer.
2. Creates a new key.
3. Updates either `publishableKey` or `secretKey` in the `projects` table.
4. Returns the new key.

## Add Domain Flow

Domains are important because the SDK login flow checks them.

Example:

```txt
http://localhost:5173
https://myapp.com
```

The domain must match the app origin exactly, because the backend compares it with:

```txt
new URL(redirectUrl).origin
```

### 1. Developer opens project settings

File:

```txt
frontend/app/dashboard/projects/[projectId]/settings/page.tsx
```

When it loads, it calls:

```txt
GET /projects/:projectId
GET /projects/:projectId/providers
GET /projects/:projectId/domains
```

All requests include:

```txt
Authorization: Bearer token
```

### 2. Developer enters a domain and clicks Add

Frontend function:

```txt
addDomain()
```

in:

```txt
frontend/app/dashboard/projects/[projectId]/settings/page.tsx
```

It sends:

```txt
POST /projects/:projectId/domains
Authorization: Bearer token
Content-Type: application/json

{
  "domain": "http://localhost:5173"
}
```

### 3. Backend saves the domain

Backend route:

```txt
POST /projects/:projectId/domains
```

in:

```txt
backend/src/routes/projects.ts
```

It:

1. Checks the domain exists in the request body.
2. Checks the project belongs to the logged-in developer.
3. Checks this domain is not already saved for the project.
4. Inserts a row into `authorized_domains`.
5. Returns the new domain row.

Later, when an end user clicks an SDK login button, this domain is checked before OAuth starts.

## Setup Providers Flow

Providers are controlled from:

```txt
frontend/app/dashboard/projects/[projectId]/settings/page.tsx
```

The UI currently shows:

```txt
github
google
discord
```

Important note: the backend SDK OAuth routes currently implement GitHub and Google only:

```txt
backend/src/routes/sdk/oauth.ts
```

There is no Discord SDK OAuth flow in the current backend route file.

### 1. Settings page fetches existing providers

Frontend calls:

```txt
GET /projects/:projectId/providers
Authorization: Bearer token
```

Backend route:

```txt
GET /projects/:projectId/providers
```

in:

```txt
backend/src/routes/projects.ts
```

It:

1. Checks the project belongs to the developer.
2. Finds rows in `project_providers` for that project.
3. Returns them.

### 2. Developer toggles providers and clicks Save Providers

Frontend function:

```txt
saveProviders()
```

It loops over the provider draft values and sends:

```txt
PATCH /projects/:projectId/providers/:provider
Authorization: Bearer token
Content-Type: application/json

{
  "enabled": true
}
```

Example URLs:

```txt
PATCH /projects/project-id/providers/github
PATCH /projects/project-id/providers/google
```

Backend route:

```txt
PATCH /projects/:projectId/providers/:provider
```

in:

```txt
backend/src/routes/projects.ts
```

It:

1. Checks the project belongs to the developer.
2. Looks for an existing provider row.
3. If no row exists, inserts one.
4. If a row exists, updates `enabled`.
5. Returns the provider row.

Later, the SDK login start route checks this setting.

Example from GitHub SDK login:

```txt
GET /sdk/oauth/github/start
```

The backend finds:

```txt
project_providers where projectId = project.id and provider = "github"
```

If the row exists and `enabled` is false, backend returns:

```txt
403 GitHub login disabled
```

Small behavior detail: if there is no provider row at all, the code currently allows login. It only blocks login when a provider row exists with `enabled = false`.

## Project Overview Page Flow

File:

```txt
frontend/app/dashboard/projects/[projectId]/page.tsx
```

When this page loads, it calls:

```txt
GET /projects/:projectId/overview
Authorization: Bearer token
```

Backend route:

```txt
GET /projects/:projectId/overview
```

in:

```txt
backend/src/routes/projects.ts
```

It:

1. Checks the project belongs to the logged-in developer.
2. Gets all users for that project from `users`.
3. Gets all sessions for that project from `sessions`.
4. Gets all providers for that project from `project_providers`.
5. Gets 5 recent users.
6. Returns:

```txt
project
stats.totalUsers
stats.activeSessions
stats.providersEnabled
recentUsers
```

The frontend displays those numbers.

## How A Developer Sets Up Their Own Project With The SDK

A developer creates a project in the dashboard, then copies the publishable key.

In their React app, they would use the SDK something like this:

```tsx
import {
  AuthKitProvider,
  LoginCard,
  AuthButton,
  SignedIn,
  SignedOut,
  useUser,
} from "@authcit/react";

export default function App() {
  return (
    <AuthKitProvider publishableKey="pk_...">
      <SignedOut>
        <LoginCard />
      </SignedOut>

      <SignedIn>
        <Dashboard />
        <AuthButton />
      </SignedIn>
    </AuthKitProvider>
  );
}
```

The app must also add its origin to Authorized Domains in the AuthCit dashboard.

For local Vite apps, that might be:

```txt
http://localhost:5173
```

For production, that might be:

```txt
https://myapp.com
```

## SDK Login Flow: What Happens When The User Clicks Login

This is the end-user login flow. This is different from dashboard developer login.

### 1. App wraps itself in AuthKitProvider

SDK file:

```txt
sdk/src/context/auth-context.tsx
```

The consuming app passes:

```txt
publishableKey
```

Example:

```tsx
<AuthKitProvider publishableKey="pk_...">
  <App />
</AuthKitProvider>
```

When `AuthKitProvider` first loads, it runs this logic:

1. Checks the current URL for:

```txt
authkit_code
```

2. If `authkit_code` exists, it exchanges the code for an SDK access token.
3. If no `authkit_code` exists, it calls `refreshUser()`.
4. `refreshUser()` calls the backend:

```txt
GET /sdk/me
```

using the token from:

```txt
localStorage.authkit_access_token
```

or using backend cookies.

### 2. User clicks SDK login button

Button files:

```txt
sdk/src/components/AuthButton.tsx
sdk/src/components/LoginCard.tsx
```

These components call functions from:

```txt
sdk/src/context/auth-context.tsx
```

For GitHub:

```txt
signInWithGithub()
```

For Google:

```txt
signInWithGoogle()
```

These functions build:

```txt
redirectUrl = window.location.origin
```

Then the browser goes to:

```txt
https://authkitbackend.devbro.site/sdk/oauth/github/start?publishableKey=pk_...&redirectUrl=http%3A%2F%2Flocalhost%3A5173
```

or:

```txt
https://authkitbackend.devbro.site/sdk/oauth/google/start?publishableKey=pk_...&redirectUrl=http%3A%2F%2Flocalhost%3A5173
```

Important file:

```txt
sdk/src/lib/api.ts
```

This SDK currently uses a hardcoded backend URL:

```txt
https://authkitbackend.devbro.site
```

### 3. Backend receives SDK OAuth start request

File:

```txt
backend/src/routes/sdk/oauth.ts
```

Routes:

```txt
GET /sdk/oauth/github/start
GET /sdk/oauth/google/start
```

The backend:

1. Reads `publishableKey` from query params.
2. Reads `redirectUrl` from query params.
3. Finds the project by:

```txt
projects.publishableKey === publishableKey
```

4. Parses the redirect URL:

```txt
new URL(redirectUrl).origin
```

5. Looks up domains in:

```txt
authorized_domains
```

6. Checks whether the redirect origin is authorized.

If the domain was not added in the dashboard, the backend returns:

```txt
403 Unauthorized domain
```

7. Checks whether the provider is disabled in:

```txt
project_providers
```

If disabled, backend returns:

```txt
403 GitHub login disabled
```

or:

```txt
403 Google login disabled
```

8. Creates OAuth state.
9. Saves temporary cookies:

For GitHub:

```txt
sdk_oauth_state
sdk_project_id
sdk_redirect_url
```

For Google:

```txt
sdk_google_oauth_state
sdk_google_code_verifier
sdk_project_id
sdk_redirect_url
```

10. Redirects the browser to GitHub or Google.

### 4. GitHub/Google sends browser back to backend

Callback routes:

```txt
GET /sdk/oauth/github/callback
GET /sdk/oauth/google/callback
```

Still in:

```txt
backend/src/routes/sdk/oauth.ts
```

The backend:

1. Reads OAuth `code` and `state`.
2. Reads saved cookies like `sdk_project_id` and `sdk_redirect_url`.
3. Verifies the OAuth state.
4. Exchanges the OAuth code for provider tokens.
5. Fetches the user's profile from GitHub or Google.

For GitHub, it fetches:

```txt
https://api.github.com/user
https://api.github.com/user/emails
```

For Google, it fetches:

```txt
https://openidconnect.googleapis.com/v1/userinfo
```

6. Looks for an existing user in the `users` table for this exact project and email:

```txt
users.projectId === projectId
users.email === providerEmail
```

7. If no user exists, inserts a new row into `users`.
8. Inserts an OAuth account row into `oauth_accounts`.
9. Checks `user_project_status`.
10. If the user is blocked, returns:

```txt
403 User blocked
```

11. Creates a refresh token:

```txt
crypto.randomUUID()
```

12. Inserts a session row into `sessions`:

```txt
userId
projectId
refreshToken
userAgent
ip
expiresAt
```

13. Creates an SDK access token using:

```txt
backend/src/lib/sdk-jwt.ts
```

Function:

```txt
createSdkAccessToken({ userId, projectId })
```

This token expires in `15m`.

14. Sets cookies using:

```txt
backend/src/lib/sdk-cookies.ts
```

Cookies:

```txt
sdk_access_token
sdk_refresh_token
```

15. Creates a short-lived exchange code in memory.

This code is stored in a JavaScript `Map` inside:

```txt
backend/src/routes/sdk/oauth.ts
```

It expires after 1 minute.

16. Redirects the browser back to the original app:

```txt
redirectUrl?authkit_code=exchange-code
```

Example:

```txt
http://localhost:5173?authkit_code=abc-123
```

### 5. SDK consumes `authkit_code`

Back in the user's app, `AuthKitProvider` runs again.

File:

```txt
sdk/src/context/auth-context.tsx
```

It sees:

```txt
authkit_code
```

in the URL.

Then it:

1. Removes `authkit_code` from the URL using `window.history.replaceState`.
2. Calls:

```txt
exchangeOAuthCode(code)
```

from:

```txt
sdk/src/lib/api.ts
```

That sends:

```txt
POST /sdk/oauth/exchange
Content-Type: application/json

{
  "code": "exchange-code"
}
```

### 6. Backend exchanges code for token and user

Backend route:

```txt
POST /sdk/oauth/exchange
```

in:

```txt
backend/src/routes/sdk/oauth.ts
```

It:

1. Reads the exchange code.
2. Consumes it from the in-memory `Map`.
3. Finds the user in the `users` table.
4. Creates a new SDK access token.
5. Returns:

```json
{
  "accessToken": "jwt_here",
  "user": {
    "id": "...",
    "projectId": "...",
    "email": "...",
    "name": "...",
    "avatar": "..."
  }
}
```

### 7. SDK stores the login state

Back in:

```txt
sdk/src/context/auth-context.tsx
```

The SDK:

1. Stores the access token using:

```txt
storeAccessToken(data.accessToken)
```

from:

```txt
sdk/src/lib/api.ts
```

That saves:

```txt
localStorage.authkit_access_token = accessToken
```

2. Sets React state:

```txt
setUser(data.user)
```

Now SDK components know the user is logged in.

For example:

- `SignedIn` can show logged-in content.
- `SignedOut` can hide logged-in content.
- `useUser()` can return the current user.
- `AuthButton` changes into a sign out button.

## SDK `GET /sdk/me` Flow

Whenever the SDK wants to refresh the current user, it calls:

```txt
GET /sdk/me
```

SDK function:

```txt
getCurrentUser()
```

in:

```txt
sdk/src/lib/api.ts
```

It sends:

```txt
Authorization: Bearer authkit_access_token
```

if the token exists in localStorage.

Backend route:

```txt
GET /sdk/me
```

in:

```txt
backend/src/routes/sdk/session.ts
```

That route uses:

```txt
requireSdkAuth
```

from:

```txt
backend/src/middleware/sdk-auth.ts
```

`requireSdkAuth`:

1. Looks for a Bearer token in the Authorization header.
2. If not found, looks for cookie:

```txt
sdk_access_token
```

3. Verifies the token using:

```txt
backend/src/lib/sdk-jwt.ts
```

4. Adds this to the request:

```txt
req.userId
req.projectId
```

Then `/sdk/me`:

1. Finds the user by `req.userId`.
2. Returns the user JSON.

## SDK Sign Out Flow

SDK button:

```txt
sdk/src/components/AuthButton.tsx
```

If a user is logged in, clicking the button calls:

```txt
signOut()
```

from:

```txt
sdk/src/context/auth-context.tsx
```

That calls:

```txt
signOutRequest()
```

from:

```txt
sdk/src/lib/api.ts
```

The SDK:

1. Removes localStorage token:

```txt
authkit_access_token
```

2. Sends:

```txt
POST /sdk/signout
```

Backend route:

```txt
POST /sdk/signout
```

in:

```txt
backend/src/routes/sdk/session.ts
```

Backend clears:

```txt
sdk_access_token
sdk_refresh_token
```

Then the SDK sets:

```txt
user = null
```

## Full End-To-End Flow In Simple Words

### Developer dashboard setup

```txt
Developer opens /auth/login
-> clicks Google/GitHub
-> frontend redirects to backend /auth/google or /auth/github
-> backend redirects to provider
-> provider redirects to backend callback
-> backend creates/fetches developer
-> backend creates dashboard JWT
-> backend redirects to frontend /auth/callback?token=...
-> frontend saves token in localStorage
-> frontend opens /dashboard
-> dashboard calls /me and loads developer
```

### Developer creates app

```txt
Developer opens /dashboard/projects
-> frontend calls GET /projects
-> developer enters project name
-> frontend sends POST /projects
-> backend verifies dashboard JWT
-> backend creates publishable key and secret key
-> backend inserts project into database
-> frontend shows project and keys
```

### Developer adds domain

```txt
Developer opens project settings
-> frontend calls GET /projects/:projectId/domains
-> developer enters origin like http://localhost:5173
-> frontend sends POST /projects/:projectId/domains
-> backend verifies project ownership
-> backend inserts domain into authorized_domains
```

### Developer sets providers

```txt
Developer opens project settings
-> frontend calls GET /projects/:projectId/providers
-> developer toggles GitHub/Google
-> frontend sends PATCH /projects/:projectId/providers/:provider
-> backend inserts or updates project_providers
```

### End user logs into developer's app

```txt
User opens app that uses AuthCit SDK
-> AuthKitProvider loads
-> user clicks LoginCard/AuthButton
-> SDK redirects to /sdk/oauth/github/start or /sdk/oauth/google/start
-> backend finds project by publishable key
-> backend checks authorized_domains
-> backend checks project_providers
-> backend redirects to GitHub/Google
-> provider redirects to backend callback
-> backend creates/fetches user
-> backend creates session
-> backend creates SDK JWT
-> backend redirects back to app with authkit_code
-> SDK exchanges authkit_code for accessToken and user
-> SDK stores accessToken
-> SDK sets user state
-> app now knows the user is logged in
```

## File-To-File Data Movement Summary

### Dashboard login

```txt
frontend/app/auth/login/page.tsx
-> backend/src/routes/auth.ts
-> backend/src/db/schema.ts developers table
-> backend/src/lib/jwt.ts
-> frontend/app/auth/callback/page.tsx
-> browser localStorage token
-> frontend/app/dashboard/layout.tsx
-> backend/src/routes/auth-me.ts
```

### Create project

```txt
frontend/app/dashboard/projects/page.tsx
-> backend/src/middleware/auth.ts
-> backend/src/routes/projects.ts
-> backend/src/lib/keys.ts
-> backend/src/db/schema.ts projects table
-> frontend project state
```

### Add domain

```txt
frontend/app/dashboard/projects/[projectId]/settings/page.tsx
-> backend/src/middleware/auth.ts
-> backend/src/routes/projects.ts
-> backend/src/db/schema.ts authorized_domains table
-> frontend domains state
```

### Setup providers

```txt
frontend/app/dashboard/projects/[projectId]/settings/page.tsx
-> backend/src/middleware/auth.ts
-> backend/src/routes/projects.ts
-> backend/src/db/schema.ts project_providers table
-> frontend providers state
```

### SDK user login

```txt
developer app using sdk/src/index.ts exports
-> sdk/src/context/auth-context.tsx
-> sdk/src/components/AuthButton.tsx or sdk/src/components/LoginCard.tsx
-> backend/src/routes/sdk/oauth.ts
-> backend/src/db/schema.ts projects table
-> backend/src/db/schema.ts authorized_domains table
-> backend/src/db/schema.ts project_providers table
-> GitHub/Google
-> backend/src/routes/sdk/oauth.ts callback
-> backend/src/db/schema.ts users table
-> backend/src/db/schema.ts oauth_accounts table
-> backend/src/db/schema.ts sessions table
-> backend/src/lib/sdk-jwt.ts
-> backend/src/lib/sdk-cookies.ts
-> SDK app URL with authkit_code
-> sdk/src/context/auth-context.tsx
-> sdk/src/lib/api.ts exchangeOAuthCode()
-> backend/src/routes/sdk/oauth.ts POST /exchange
-> sdk localStorage authkit_access_token
-> SDK React user state
```

## Beginner Notes About Tokens

There are two token systems:

### Dashboard token

Created by:

```txt
backend/src/lib/jwt.ts
```

Used by:

```txt
frontend dashboard pages
```

Stored as:

```txt
localStorage.token
```

Represents:

```txt
developer
```

### SDK token

Created by:

```txt
backend/src/lib/sdk-jwt.ts
```

Used by:

```txt
customer app using the SDK
```

Stored as:

```txt
localStorage.authkit_access_token
```

Also set as cookie:

```txt
sdk_access_token
```

Represents:

```txt
end user inside a project
```

## Small Things To Be Aware Of

1. The SDK backend URL is hardcoded in:

```txt
sdk/src/lib/api.ts
```

as:

```txt
https://authkitbackend.devbro.site
```

2. The frontend dashboard backend URL comes from:

```txt
frontend/lib/api.ts
```

which reads:

```txt
NEXT_PUBLIC_API_URL
```

3. Project provider settings currently show Discord in the UI, but the backend SDK OAuth implementation only has GitHub and Google routes.

4. Authorized domains must match the origin exactly. If your app runs at:

```txt
http://localhost:5173
```

then saving only:

```txt
localhost:5173
```

will not match this backend logic, because the backend compares against `URL.origin`.

5. The SDK exchange code is stored in memory in the backend process. If the backend restarts between OAuth callback and exchange, that code disappears.

