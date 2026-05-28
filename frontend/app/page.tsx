import { CodeExample } from "@/components/landing/code-example";
import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { ModeToggle } from "@/components/modeSwitch";
import { Button } from "@/components/ui/button";


export default function Home() {
  return (
    <div>
      <Header />
      <main>
        <Hero />
        <Features />
        <CodeExample />
        <CTA />
      </main>
    </div>

  )
}