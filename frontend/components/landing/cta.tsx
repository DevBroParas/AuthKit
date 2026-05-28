import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTA() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 md:p-12">
          {/* Background gradient */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -right-20 -top-20 size-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="flex flex-col items-center text-center">
            <h2 className="max-w-lg text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Ready to Simplify Your Auth?
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Get started with AuthCit today. Free tier available for development
              and small projects.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/auth/login">
                  Start Building
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/docs">Read the Docs</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
