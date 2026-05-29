# AuthCit

A modern authentication platform for developers, inspired by Clerk and Auth0.

AuthCit enables developers to add secure authentication to their applications using a hosted dashboard, OAuth providers, API key management, domain authorization, and a React SDK.

---

## 🌐 Live Services

### Dashboard

https://authkit.devbro.site

### Backend API

https://authkitbackend.devbro.site

---

## ✨ Features

### Developer Dashboard

- GitHub Authentication
- Google Authentication
- Create and Manage Projects
- API Key Management
- Authorized Domain Management
- OAuth Provider Configuration
- User Analytics
- Session Analytics

### React SDK

- Simple Authentication Integration
- GitHub Login
- Google Login
- User Context Hooks
- Protected Components
- Session Management
- Automatic Authentication State Handling

### Backend API

- OAuth Authentication Flow
- JWT Authentication
- Session Management
- Domain Authorization
- Project Management
- API Key Generation
- User Management

---

## 🏗 Architecture

```text
┌────────────────────┐
│     Developer      │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  AuthCit Dashboard │
│ authkit.devbro.site│
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│   AuthCit Backend  │
│ authkitbackend     │
│ .devbro.site       │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│     Database       │
└────────────────────┘

          ▲
          │

┌────────────────────┐
│    AuthCit SDK     │
│ Installed in Apps  │
└────────────────────┘
```

---

## 📂 Repository Structure

```text
.
├── frontend/      # Next.js Dashboard
├── backend/       # Express API Server
├── sdk/           # AuthCit React SDK
└── README.md
```

---

## 🛠 Tech Stack

### Frontend

- Next.js
- TypeScript
- React
- Tailwind CSS

### Backend

- Node.js
- Express.js
- TypeScript
- JWT Authentication

### SDK

- React
- TypeScript
- TSUP

### Authentication Providers

- GitHub OAuth
- Google OAuth

---

# 🚀 Getting Started

## Prerequisites

- Node.js 20+
- npm / pnpm
- PostgreSQL Database

---

## Clone the Repository

```bash
git clone https://github.com/your-username/authcit.git

cd authcit
```

---

# 🔐 Environment Variables

Both frontend and backend include `.env.sample` files.

## Backend Setup

```bash
cd backend

cp .env.sample .env
```

Configure all required environment variables inside `.env`.

---

## Frontend Setup

```bash
cd frontend

cp .env.sample .env.local
```

Configure all required environment variables inside `.env.local`.

---

# 📦 Install Dependencies

## Backend

```bash
cd backend

npm install
```

## Frontend

```bash
cd frontend

npm install
```

## SDK

```bash
cd sdk

npm install
```

---

# ▶️ Run Locally

## Start Backend

```bash
cd backend

npm run dev
```

Backend:

```text
http://localhost:8000
```

---

## Start Frontend

```bash
cd frontend

npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

## Build SDK

```bash
cd sdk

npm run build
```

---

# 📚 SDK Usage

Install the AuthCit SDK:

```bash
npm install authcit
```

Wrap your application with `AuthKitProvider`.

```tsx
import {
  AuthKitProvider,
  LoginCard,
  SignedIn,
  SignedOut,
} from "authcit";

export default function App() {
  return (
    <AuthKitProvider publishableKey="pk_xxxxxxxxx">
      <SignedOut>
        <LoginCard />
      </SignedOut>

      <SignedIn>
        <Dashboard />
      </SignedIn>
    </AuthKitProvider>
  );
}
```

---

# 🔑 Supported OAuth Providers

Currently supported:

- GitHub
- Google

---

# 🔒 Security Features

- OAuth State Validation
- JWT Authentication
- Authorized Domain Verification
- Session Management
- Secure API Keys
- Refresh Token Support

---

# 🌍 Production URLs

| Service | URL |
|----------|-----|
| Dashboard | https://authkit.devbro.site |
| Backend API | https://authkitbackend.devbro.site |

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

# 📄 License

MIT License

---

# 👨‍💻 Author

Built with ❤️ by DevBro