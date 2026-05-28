   # Project Explain: AuthCit / AuthKIT

   Use this file when explaining the project to another AI agent. It describes what the app does, how the codebase is organized, and the visual/product style already used in the UI.

   ## One-Line Description

   AuthCit is a full-stack authentication platform for developers: it lets developers log in, create auth projects, manage API keys, configure OAuth providers/domains, inspect users/sessions, and embed authentication into customer apps through a React SDK.

   ## Product Mental Model

   The project has three main parts:

   1. `backend/`
      - Express API server.
      - Handles developer OAuth login, project CRUD, dashboard overview data, users, API keys, provider settings, authorized domains, SDK OAuth, SDK sessions, JWTs, cookies, and database access.
      - Uses PostgreSQL through Drizzle ORM.

   2. `frontend/`
      - Next.js dashboard for AuthCit developers/admins.
      - Developers log in with Google/GitHub, then manage projects, users, API keys, docs, and settings.
      - Dashboard auth token is stored in `localStorage` as `token`.

   3. `sdk/`
      - React package published as `@authcit/react`.
      - Exports `AuthKitProvider`, `useAuth`, `useUser`, `SignedIn`, `SignedOut`, `AuthButton`, `LoginCard`, and `ProfileCard`.
      - Customer apps wrap their React tree in `AuthKitProvider` with a project publishable key, then use SDK components/hooks to sign users in with Google/GitHub.

   There are also Vite demo apps inside `test apps/` for testing SDK integration.

   ## What The App Does

   Developer-facing dashboard:

   - Lets a developer sign in with OAuth.
   - Shows an overview page with total apps, total users, active sessions, enabled providers, activity chart, recent users, and app list.
   - Lets the developer create projects/apps.
   - Generates a publishable key and secret key per project.
   - Shows API keys, supports copying keys, hiding/showing secret keys, and regenerating keys.
   - Shows users across projects with search and project filters.
   - Supports blocking/unblocking users per project.
   - Shows per-project overview with user/session/provider stats and recent users.
   - Supports project settings such as project name, provider enablement, and authorized domains.

   End-user / SDK flow:

   - A customer app uses the SDK with a publishable key.
   - The SDK redirects the end user to AuthCit OAuth start routes.
   - Backend validates the project and provider, completes OAuth, creates/finds the user, creates a session, and returns the user to the customer app.
   - SDK stores/uses the returned access token and refreshes current user state.
   - SDK exposes sign-in, sign-out, current-user, and conditional rendering helpers.

   ## Authentication Domains

   There are two separate auth worlds:

   - Dashboard developer auth:
   - For the developer/admin using the AuthCit dashboard.
   - Uses the `developers` table.
   - Uses dashboard JWTs.
   - Frontend stores token in `localStorage`.
   - Protects routes like `/me`, `/projects`, `/users`, and dashboard overview APIs.

   - SDK end-user auth:
   - For users signing into customer apps.
   - Uses `users`, `oauth_accounts`, `sessions`, `project_providers`, `authorized_domains`, and `user_project_status`.
   - Uses SDK access tokens and refresh/session handling.
   - Project isolation is based on `projectId`.

   ## Tech Stack

   Frontend:

   - Next.js app router.
   - React.
   - TypeScript.
   - Tailwind CSS v4.
   - shadcn UI components.
   - lucide-react icons.
   - Recharts for dashboard charts.
   - Geist / Geist Mono / JetBrains Mono fonts.

   Backend:

   - Node.js.
   - Express.
   - TypeScript.
   - Drizzle ORM.
   - PostgreSQL.
   - `jose` for JWTs.
   - `arctic` for OAuth clients.
   - Cookie parsing and CORS for SDK auth.

   SDK:

   - React package.
   - TypeScript.
   - Built with `tsup`.
   - Inline style tokens for SDK UI instead of depending on the host app's Tailwind setup.

   ## Existing Visual Style

   The app uses a clean developer-tool dashboard style. It should feel practical, focused, and infrastructure-oriented, not like a marketing landing page.

   Core style traits:

   - Monospace-first personality through Geist Mono / JetBrains Mono.
   - White and near-white surfaces in light mode.
   - Dark charcoal surfaces in dark mode.
   - Violet-blue primary accent for brand emphasis and primary actions.
   - Soft gray borders and muted backgrounds.
   - Large page headings with tight tracking.
   - Data-heavy dashboard layouts with cards, tables, filters, badges, charts, and side navigation.
   - lucide icons used throughout buttons, stat cards, nav items, and actions.
   - shadcn-style controls: `Button`, `Card`, `Dialog`, `Table`, `Badge`, `Input`, `Select`, `Tabs`, `Switch`, `Sidebar`, etc.
   - Rounded UI with moderate radius. Many dashboard cards/dialog areas currently use rounded corners and soft shadows.
   - Clear action affordances: copy icons, eye/eye-off icons, settings icon, plus icon, trash icon, back arrow.

   ## Color Palette

   The main palette is defined in `frontend/app/globals.css` using OKLCH design tokens.

   Light theme:

   - Background: white, `oklch(1 0 0)`.
   - Foreground: near-black cool charcoal, `oklch(0.148 0.004 228.8)`.
   - Card/popover: white.
   - Primary: violet-blue, `oklch(0.488 0.243 264.376)`.
   - Primary foreground: pale blue-white, `oklch(0.97 0.014 254.604)`.
   - Muted/accent surfaces: very pale cool gray, `oklch(0.963 0.002 197.1)`.
   - Muted text: cool gray-blue, `oklch(0.56 0.021 213.5)`.
   - Border/input: light cool gray, `oklch(0.925 0.005 214.3)`.
   - Destructive: red, `oklch(0.577 0.245 27.325)`.

   Dark theme:

   - Background: dark cool charcoal, `oklch(0.148 0.004 228.8)`.
   - Foreground: near-white cool gray, `oklch(0.987 0.002 197.1)`.
   - Card/popover: dark slate, `oklch(0.218 0.008 223.9)`.
   - Primary: darker violet-blue, `oklch(0.424 0.199 265.638)`.
   - Muted/accent: deep cool gray, `oklch(0.275 0.011 216.9)`.
   - Border: translucent white, `oklch(1 0 0 / 10%)`.
   - Destructive: warm red, `oklch(0.704 0.191 22.216)`.

   SDK component palette:

   - Light SDK surface: `#ffffff`.
   - Light SDK text: `#111827`.
   - Light SDK muted text: `#57606a`.
   - Light SDK border: `#d0d7de`.
   - Dark SDK surface: `#0b1120`.
   - Dark SDK raised surface: `#111827`.
   - Dark SDK button surface: `#1f2937`.
   - Dark SDK text: `#f8fafc`.
   - Dark SDK muted text: `#94a3b8`.
   - Dark SDK border: `#334155`.

   Brand naming note:

   - The repo/docs often say `AuthKIT`.
   - The dashboard UI brand says `AuthCIT` / `AuthCit`.
   - The SDK package name is `@authcit/react`.
   - If updating copy, keep naming consistent unless the user explicitly wants a rename.

   ## UI Patterns To Preserve

   When adding or changing frontend UI:

   - Keep dashboard pages utilitarian and scannable.
   - Use existing shadcn components from `frontend/components/ui/`.
   - Use lucide-react icons for actions and navigation.
   - Use Tailwind token classes such as `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-muted`, `border`, `text-primary`, and `shadow-sm`.
   - Prefer tables for key/user/admin data.
   - Prefer cards for repeated summaries, stats, dialogs, and contained management surfaces.
   - Keep actions explicit and icon-backed: copy, delete, edit, settings, regenerate, back.
   - Keep page structure similar to existing dashboard pages: title block, optional description, then cards/tables/charts.
   - Maintain responsive behavior with `flex-col` on mobile and grid/flex layouts on desktop.

   ## Important Files

   - `frontend/app/auth/login/page.tsx`: developer OAuth login screen with Google/GitHub/Apple buttons and login artwork.
   - `frontend/app/dashboard/layout.tsx`: protected dashboard shell with sidebar navigation and developer profile menu.
   - `frontend/app/dashboard/page.tsx`: global overview dashboard.
   - `frontend/app/dashboard/projects/page.tsx`: project creation and project list.
   - `frontend/app/dashboard/projects/[projectId]/page.tsx`: per-project overview.
   - `frontend/app/dashboard/projects/[projectId]/settings/page.tsx`: project settings, domains, provider switches.
   - `frontend/app/dashboard/users/page.tsx`: user management table and filters.
   - `frontend/app/dashboard/api-keys/page.tsx`: project keys table and key actions.
   - `frontend/app/globals.css`: design tokens, palette, font/theme setup.
   - `backend/src/index.ts`: Express app setup and route registration.
   - `backend/src/db/schema.ts`: database tables.
   - `backend/src/routes/auth.ts`: developer OAuth.
   - `backend/src/routes/projects.ts`: project, provider, domain, and key routes.
   - `backend/src/routes/users.ts`: dashboard user management.
   - `backend/src/routes/sdk/oauth.ts`: SDK OAuth start/callback routes.
   - `backend/src/routes/sdk/session.ts`: SDK current user/signout/session routes.
   - `sdk/src/context/auth-context.tsx`: SDK provider and auth actions.
   - `sdk/src/lib/theme.ts`: SDK UI light/dark tokens.
   - `sdk/src/components/LoginCard.tsx`: embeddable login card.
   - `sdk/src/index.ts`: SDK public exports.

   ## Current Product State

   The repo is already beyond a simple prototype. It has:

   - A dashboard app.
   - Backend routes for auth, projects, users, SDK OAuth, and sessions.
   - Database schema and migrations.
   - A packaged React SDK.
   - Test apps for SDK behavior.
   - Existing docs: `AUTHKIT_FULL_SUMMARY.md` and `SDK_LOCALHOST_AUTH_FLOW.md`.

   Some areas still look in-progress:

   - Home page is still a simple `Hello world!` placeholder.
   - Login includes an Apple button visually, but only Google/GitHub handlers are wired.
   - Naming is inconsistent between AuthKIT, AuthCit, and AuthCIT.
   - Some metadata still says `Create Next App`.
   - UI implementation is functional but may need polish/consistency cleanup before production.

   ## How To Explain This To Another AI Agent

   Say:

   > This is AuthCit/AuthKIT, a full-stack authentication-as-a-service project. It has an Express + Drizzle + PostgreSQL backend, a Next.js developer dashboard, and a React SDK. Developers log into the dashboard, create projects, get publishable/secret keys, configure OAuth providers and domains, inspect users/sessions, and manage API keys. Customer apps install `@authcit/react`, wrap their app in `AuthKitProvider`, and use SDK components/hooks to authenticate end users through AuthCit-hosted OAuth flows.

   Then add:

   > The design language is a clean developer dashboard: shadcn UI, Tailwind tokens, mono typography, white/cool-gray surfaces, violet-blue primary accents, lucide icons, cards, tables, badges, sidebars, and charts. Keep future changes quiet, utilitarian, and scannable.

