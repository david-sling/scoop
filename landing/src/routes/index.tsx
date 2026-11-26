import { createFileRoute } from '@tanstack/react-router'
import { Hero } from '@/components/hero'
import { AgentScene } from '@/components/agent-scene'
import { HowItWorks } from '@/components/how-it-works'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main id="main">
      <Hero />
      <AgentScene />
      <HowItWorks />
    </main>
  )
}
