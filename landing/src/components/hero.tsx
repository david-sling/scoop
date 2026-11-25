import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

/** Where the product lives. The landing page only links to it. */
export const APP_URL = 'https://app.scoop.davidsling.in'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * One entry per rotating headline word. Each word brings its own save,
 * so the headline and the scene always say the same thing.
 * Sample content, written for this page. None of it is a real person's library.
 */
const SAVES = [
  {
    word: 'taste',
    kind: 'Image',
    title: 'Poster with oversized numerals',
    note: 'Big numbers, tiny labels.',
    tags: ['Typography', 'Posters'],
    used: 'Set the pricing headings',
    thumb: 'poster',
  },
  {
    word: 'references',
    kind: 'Site',
    title: 'A small easing playground',
    note: 'Good for picking curves.',
    tags: ['Animation', 'Tools'],
    used: 'Picked the menu curve',
    thumb: 'curve',
  },
  {
    word: 'tools',
    kind: 'MCP server',
    title: 'Component registry',
    note: 'Adds components by name.',
    tags: ['Components'],
    used: 'Added the date picker',
    thumb: 'registry',
  },
  {
    word: 'process',
    kind: 'Skill',
    title: 'impeccable',
    note: 'Use it for every design task.',
    tags: ['Design'],
    used: 'Runs it before UI changes',
    thumb: 'skill',
  },
] as const

type Save = (typeof SAVES)[number]

/** A save arrives untagged (0), the agent tags it (1), then uses it (2). */
type Phase = 0 | 1 | 2

const STEP_MS = [900, 900, 2200] as const
/** The scene plays this many full rounds, then rests on the first word. */
const ROUNDS = 3

function useScene() {
  const reduced = useReducedMotion()
  // Server render and first paint show the finished state: nothing is hidden waiting for motion.
  const [state, setState] = useState<{ i: number; phase: Phase; seen: number }>({
    i: 0,
    phase: 2,
    seen: 0,
  })

  useEffect(() => {
    if (reduced) return
    const total = SAVES.length * ROUNDS
    if (state.seen >= total && state.phase === 2) return
    const wait = state.seen === 0 && state.phase === 2 ? 2600 : STEP_MS[state.phase]
    const id = window.setTimeout(() => {
      // A hidden tab keeps its place and carries on when it is visible again.
      if (document.hidden) return setState((s) => ({ ...s }))
      setState((s) =>
        s.phase < 2
          ? { ...s, phase: (s.phase + 1) as Phase }
          : { i: (s.i + 1) % SAVES.length, phase: 0, seen: s.seen + 1 },
      )
    }, wait)
    return () => window.clearTimeout(id)
  }, [state, reduced])

  return { save: SAVES[state.i], phase: state.phase }
}

export function Hero() {
  const { save, phase } = useScene()

  return (
    <header className="relative isolate m-2 flex min-h-[calc(100svh-16px)] flex-col overflow-hidden rounded-[28px] bg-pink sm:m-3.5 sm:min-h-[calc(100svh-28px)] sm:rounded-[36px]">
      <nav
        aria-label="Main"
        className="relative z-20 flex items-center justify-between px-5 pt-5 sm:px-9 sm:pt-7"
      >
        <a href="/" className="rounded-full" aria-label="Scoop, home">
          <img src="/brand/wordmark.svg" alt="" className="h-11 w-auto sm:h-[52px]" />
        </a>
        <a
          href={APP_URL}
          className="inline-flex min-h-11 items-center rounded-full px-4 font-medium text-ink transition-colors duration-150 ease-[var(--ease-out-expo)] hover:bg-white/60 active:bg-white"
        >
          Sign in
        </a>
      </nav>

      <img
        src="/brand/mark.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-24 top-[34%] -z-10 w-[420px] max-w-none select-none sm:-right-16 sm:top-16 sm:w-[560px] lg:right-[-40px] lg:top-10 lg:w-[660px]"
      />

      <div className="relative z-10 grid flex-1 grid-cols-[minmax(0,1fr)] items-end gap-10 px-5 pb-6 pt-10 sm:px-9 sm:pb-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-6 lg:pt-6">
        <div className="max-w-[46rem]">
          <h1
            aria-label="Stop re-explaining your taste."
            className="text-[clamp(2.375rem,7.4vw,5.75rem)] font-light leading-[0.98] tracking-[-0.04em] text-ink"
          >
            <span aria-hidden className="block">
              Stop re-explaining
            </span>
            <span aria-hidden className="mt-[0.08em] flex items-baseline">
              <span className="mr-[0.22em]">your</span>
              <Word word={save.word} />
              <motion.span layout="position" transition={{ duration: 0.5, ease: EASE }}>
                .
              </motion.span>
            </span>
          </h1>
          <p className="mt-6 text-balance text-[1.25rem] leading-snug text-[#5a2a45] sm:text-[1.375rem]">
            Save what you like. Your agent takes it from there.
          </p>
          <a
            href={APP_URL}
            className="mt-8 inline-flex min-h-[52px] items-center rounded-full bg-ink px-7 text-[1.0625rem] font-medium text-white transition-[background-color,transform] duration-150 ease-[var(--ease-out-expo)] hover:bg-mauve-deep active:translate-y-px active:scale-[0.98]"
          >
            Create your library
          </a>
        </div>

        <Scene save={save} phase={phase} />
      </div>
    </header>
  )
}

/** The rotating word sits in a white pill, the way a tag does in the app. */
function Word({ word }: { word: string }) {
  return (
    <motion.span
      layout
      transition={{ duration: 0.5, ease: EASE }}
      style={{ borderRadius: 999 }}
      className="relative inline-flex overflow-hidden bg-white px-[0.26em] pb-[0.1em] pt-[0.02em]"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={word}
          layout="position"
          initial={{ y: '55%', opacity: 0, filter: 'blur(10px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-55%', opacity: 0, filter: 'blur(10px)', transition: { duration: 0.22, ease: EASE } }}
          transition={{ duration: 0.5, ease: EASE }}
          className="inline-block whitespace-nowrap"
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  )
}

function Scene({ save, phase }: { save: Save; phase: Phase }) {
  return (
    <div
      role="img"
      aria-label="A saved item arrives in a library without tags. Your agent tags it, then uses it in a project."
      className="relative mx-auto w-full max-w-[380px] lg:mb-2 lg:mr-6"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={save.word}
          initial={{ y: 36, opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
          animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ y: -20, opacity: 0, scale: 0.98, filter: 'blur(6px)', transition: { duration: 0.24, ease: EASE } }}
          transition={{ duration: 0.6, ease: EASE }}
          className="overflow-hidden rounded-[26px] bg-white"
        >
          <Thumb kind={save.thumb} />
          <div className="px-5 pb-5 pt-4">
            <div className="flex items-center justify-between font-mono text-[0.75rem] text-ink-3">
              <span>{save.kind}</span>
              <span>Just now</span>
            </div>
            <div className="mt-1.5 truncate text-[1.0625rem] font-medium text-ink">{save.title}</div>
            <div className="truncate text-mauve-deep">Your note: {save.note}</div>
            <div className="mt-3.5 flex h-7 items-center gap-1.5">
              <AnimatePresence mode="popLayout" initial={false}>
                {phase === 0 ? (
                  <motion.span
                    key="none"
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                    className="flex items-center gap-2"
                  >
                    <span className="rounded-full border border-dashed border-ink-3 px-2.5 text-[0.8125rem] leading-[1.6] text-ink-2">
                      Untagged
                    </span>
                    <span className="text-[0.8125rem] text-ink-3">no tags yet</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="tags"
                    initial={{ opacity: 0, scale: 0.86 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="flex origin-left items-center gap-1.5"
                  >
                    {save.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-pink px-2.5 text-[0.8125rem] font-medium leading-[1.7] text-ink"
                      >
                        {t}
                      </span>
                    ))}
                    <span className="ml-1 text-[0.8125rem] text-ink-3">by your agent</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* What the agent did with it. The row keeps its height so the card never jumps. */}
      <div className="mt-3 h-12">
        <AnimatePresence initial={false}>
          {phase === 2 && (
            <motion.div
              key={save.word}
              initial={{ y: 10, opacity: 0, filter: 'blur(6px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex h-12 items-center gap-2.5 rounded-full bg-ink pl-2 pr-5 text-[0.9375rem] text-white"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-pink">
                <img src="/brand/mark-small.svg" alt="" className="w-[18px]" />
              </span>
              <span className="truncate">
                <span className="text-pink">Your agent:</span> {save.used.charAt(0).toLowerCase() + save.used.slice(1)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/** Drawn stand-ins for what a save looks like. Shapes only, no real artwork. */
function Thumb({ kind }: { kind: Save['thumb'] }) {
  const base = 'flex h-[176px] w-full items-center'
  if (kind === 'poster')
    return (
      <div className={`${base} justify-between bg-pink-wash px-7`}>
        <span className="text-[6.5rem] font-medium leading-none tracking-[-0.04em] text-mauve">48</span>
        <span className="flex w-20 flex-col gap-2.5">
          <i className="h-1.5 rounded-full bg-mauve" />
          <i className="h-1.5 w-3/4 rounded-full bg-mauve" />
          <i className="h-1.5 w-1/2 rounded-full bg-mauve" />
        </span>
      </div>
    )
  if (kind === 'curve')
    return (
      <div className={`${base} justify-center bg-[#e1ecfa]`}>
        <svg viewBox="0 0 300 150" className="h-[130px]" fill="none" aria-hidden>
          <path d="M30 20v100M30 120h240" stroke="#9fb6d9" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
          <path d="M30 120c70 0 80-90 240-96" stroke="#2f6fd0" strokeWidth="5" strokeLinecap="round" />
          <circle cx="30" cy="120" r="9" fill="#fff" stroke="#2f6fd0" strokeWidth="5" />
          <circle cx="270" cy="24" r="10" fill="#2f6fd0" />
        </svg>
      </div>
    )
  if (kind === 'registry')
    return (
      <div className={`${base} bg-ink px-7`}>
        <span>
          <span className="block text-[1.75rem] font-light tracking-[-0.03em] text-white">Component registry</span>
          <span className="mt-2 block font-mono text-[0.75rem] text-pink">https://registry.example/mcp</span>
        </span>
      </div>
    )
  return (
    <div className={`${base} bg-cream px-7`}>
      <span>
        <span className="block text-[2.5rem] font-light tracking-[-0.04em] text-ink">impeccable</span>
        <span className="mt-1 block font-mono text-[0.75rem] text-ink-2">saved by name</span>
      </span>
    </div>
  )
}
