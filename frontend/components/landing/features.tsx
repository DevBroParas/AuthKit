import {
  Shield,
  Key,
  Users,
  Layers,
  Lock,
  Zap,
} from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "OAuth Providers",
    description:
      "Support for Google, GitHub, and more OAuth providers out of the box. Easy to configure and manage.",
  },
  {
    icon: Key,
    title: "API Key Management",
    description:
      "Generate and manage publishable and secret keys for your projects. Secure by default.",
  },
  {
    icon: Users,
    title: "User Management",
    description:
      "Full user dashboard with search, filters, and the ability to block/unblock users per project.",
  },
  {
    icon: Layers,
    title: "Multi-Project Support",
    description:
      "Create and manage multiple projects from a single dashboard. Each with isolated users and settings.",
  },
  {
    icon: Lock,
    title: "Session Management",
    description:
      "Secure session handling with JWT tokens, automatic refresh, and configurable expiration.",
  },
  {
    icon: Zap,
    title: "React SDK",
    description:
      "Drop-in React components and hooks. AuthKitProvider, useAuth, SignedIn, SignedOut, and more.",
  },
]

export function Features() {
  return (
    <section id="features" className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything You Need
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete authentication solution designed for developers.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
