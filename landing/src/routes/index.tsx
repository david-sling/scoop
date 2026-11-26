import { createFileRoute } from '@tanstack/react-router'
import { Hero } from '@/components/hero'
import { AgentScene } from '@/components/agent-scene'
import { HowItWorks } from '@/components/how-it-works'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main id="main">
      <Hero />
      {/* Sits above the hero, which stays put on wide screens while this slides over it. */}
      <div className="relative z-10 bg-white">
        <AgentScene />
        <HowItWorks />
      </div>
    </main>
  )
}
