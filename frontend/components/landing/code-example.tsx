"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const tabs = [
  {
    label: "Provider Setup",
    code: `import { AuthKitProvider } from "@authcit/react"

export default function App({ children }) {
  return (
    <AuthKitProvider publishableKey="pk_live_xxx">
      {children}
    </AuthKitProvider>
  )
}`,
  },
  {
    label: "Auth Hook",
    code: `import { useAuth } from "@authcit/react"

export function Dashboard() {
  const { user, signOut, isLoading } = useAuth()

  if (isLoading) return <Spinner />
  if (!user) return <Redirect to="/login" />

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}`,
  },
  {
    label: "Components",
    code: `import { 
  SignedIn, 
  SignedOut, 
  LoginCard,
  ProfileCard 
} from "@authcit/react"

export function AuthArea() {
  return (
    <>
      <SignedOut>
        <LoginCard />
      </SignedOut>
      <SignedIn>
        <ProfileCard />
      </SignedIn>
    </>
  )
}`,
  },
]

export function CodeExample() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <section id="sdk" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left side - Text */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Simple SDK Integration
            </h2>
            <p className="mt-4 text-muted-foreground">
              Add authentication to your React app in minutes with our
              developer-friendly SDK. Full TypeScript support included.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 size-1.5 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">Drop-in Components</p>
                  <p className="text-sm text-muted-foreground">
                    Pre-built LoginCard, ProfileCard, and conditional rendering
                    components.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 size-1.5 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">React Hooks</p>
                  <p className="text-sm text-muted-foreground">
                    useAuth and useUser hooks for full control over auth state.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 size-1.5 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">TypeScript First</p>
                  <p className="text-sm text-muted-foreground">
                    Fully typed API with IntelliSense support in your editor.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Code */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {/* Tabs */}
            <div className="flex border-b border-border">
              {tabs.map((tab, index) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(index)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium transition-colors",
                    activeTab === index
                      ? "border-b-2 border-primary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Code block */}
            <div className="overflow-x-auto p-4">
              <pre className="font-mono text-sm">
                <code>
                  {tabs[activeTab].code.split("\n").map((line, i) => (
                    <div key={i} className="flex">
                      <span className="mr-4 w-6 shrink-0 select-none text-right text-muted-foreground/50">
                        {i + 1}
                      </span>

                      <div
                        className="whitespace-pre"
                        dangerouslySetInnerHTML={{
                          __html: highlightCode(line),
                        }}
                      />
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Simple syntax highlighting
function highlightCode(line: string) {
  const keywords = [
    "import",
    "export",
    "from",
    "return",
    "const",
    "function",
    "if",
    "default",
  ]

  return line
    .split(/(\s+)/)
    .map((word) => {
      // keywords
      if (keywords.includes(word)) {
        return `<span style="color:#60a5fa">${word}</span>`
      }

      // strings
      if (
        word.startsWith('"') &&
        word.endsWith('"')
      ) {
        return `<span style="color:#4ade80">${word}</span>`
      }

      return word
    })
    .join("")
}