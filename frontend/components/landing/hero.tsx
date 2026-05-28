"use client"

import { Button } from "@/components/ui/button"
import { Copy, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function Hero() {
  const [copied, setCopied] = useState(false)
  const installCommand = "npm i @authcit/react"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(installCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Open Source Authentication
          </div>

          {/* Heading */}
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Authentication for{" "}
            <span className="text-primary">Modern Applications</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
            The complete authentication platform for developers. OAuth login,
            API keys, user management, and a React SDK to get you started in
            minutes.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/auth/login">
                Get Started
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>

            {/* Install command */}
            <button
              onClick={copyToClipboard}
              className="flex h-11 items-center gap-3 rounded-lg border border-border bg-card px-4 font-mono text-sm transition-colors hover:bg-secondary"
            >
              <span className="text-muted-foreground">$</span>
              <span>{installCommand}</span>
              <Copy className={`size-4 ${copied ? "text-primary" : "text-muted-foreground"}`} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
