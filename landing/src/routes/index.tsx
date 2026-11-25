import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main id="main" className="mx-auto max-w-[1312px] px-4 py-10 sm:px-9">
      <h1 className="text-4xl font-light tracking-tight">Scoop</h1>
    </main>
  )
}
