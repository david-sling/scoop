import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

/** Where the product lives. The landing page only links to it. */
export const APP_URL = 'https://app.scoop.davidsling.in'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * The hero shows one thing: saves come in from many places on one side, pass
 * through Scoop, and come out organised on the other. Each source carries one
 * of the rotating headline words and lights the tags its save ends up under.
 * Sample content, written for this page. None of it is a real person's library.
 */
const SOURCES = [
  { id: 'instagram', label: 'Images', word: 'taste', tags: ['Typography', 'Design'] },
  { id: 'youtube', label: 'Videos', word: 'taste', tags: ['Typography'] },
  { id: 'x', label: 'Posts', word: 'references', tags: ['Animation'] },
  { id: 'web', label: 'Any page', word: 'references', tags: ['Animation', 'Tools'] },
  { id: 'mail', label: 'Newsletters', word: 'references', tags: ['Components'] },
  { id: 'mcp', label: 'MCP servers', word: 'tools', tags: ['Components', 'Tools'] },
  { id: 'skill', label: 'Skills', word: 'process', tags: ['Design'] },
] as const

type Source = (typeof SOURCES)[number]

const TAGS = ['Typography', 'Animation', 'Components', 'Tools', 'Design'] as const

/** Light travels in along one wire (0), then out along the wires of the tags it lands under (1). */
const STEP_MS = [1000, 1500] as const
/** The scene plays this many full rounds, then rests on the first word. */
const ROUNDS = 3

function useScene() {
  const reduced = useReducedMotion()
  // Server render and first paint are the resting state: everything is visible without motion.
  const [state, setState] = useState<{ seen: number; phase: 0 | 1; moving: boolean }>({
    seen: 0,
    phase: 1,
    moving: false,
  })

  useEffect(() => {
    if (reduced) return
    if (state.seen >= SOURCES.length * ROUNDS && state.phase === 1) return
    const wait = !state.moving ? 1600 : STEP_MS[state.phase]
    const id = window.setTimeout(() => {
      // A hidden tab keeps its place and carries on when it is visible again.
      if (document.hidden) return setState((s) => ({ ...s }))
      setState((s) =>
        s.phase === 0
          ? { ...s, phase: 1, moving: true }
          : { seen: s.seen + 1, phase: 0, moving: true },
      )
    }, wait)
    return () => window.clearTimeout(id)
  }, [state, reduced])

  return state
}

export function Hero() {
  const { seen, phase, moving } = useScene()
  const active = SOURCES[seen % SOURCES.length]
  const activeIn = SOURCES.indexOf(active)
  const activeOut = TAGS.flatMap((t, i) => ((active.tags as readonly string[]).includes(t) ? [i] : []))

  return (
    <header className="relative isolate m-2 flex min-h-[calc(100svh-16px)] flex-col overflow-hidden rounded-[28px] bg-[#23111a] text-white sm:m-3.5 sm:min-h-[calc(100svh-28px)] sm:rounded-[36px]">
      <nav aria-label="Main" className="flex items-center justify-between px-5 pt-5 sm:px-9 sm:pt-7">
        <a href="/" className="rounded-full" aria-label="Scoop, home">
          <img src="/brand/wordmark.svg" alt="" className="h-11 w-auto sm:h-[52px]" />
        </a>
        <a
          href={APP_URL}
          className="inline-flex min-h-11 items-center rounded-full px-4 font-medium text-white transition-colors duration-150 ease-[var(--ease-out-expo)] hover:bg-white/10 active:bg-white/20"
        >
          Sign in
        </a>
      </nav>

      <div className="my-auto flex flex-col gap-5 px-5 py-10 sm:px-9 lg:grid lg:grid-cols-[auto_minmax(48px,1fr)_minmax(0,620px)_minmax(48px,1fr)_auto] lg:items-stretch lg:gap-0 lg:py-14">
        <ul
          aria-label="Where saves come from"
          className="order-2 flex flex-wrap justify-center gap-2 lg:order-none lg:grid lg:grid-rows-7 lg:justify-items-end lg:gap-0"
        >
          {SOURCES.map((s) => (
            <li key={s.id} className="flex items-center">
              <Chip on={moving && s.id === active.id}>
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white">
                  <SourceIcon id={s.id} />
                </span>
                {s.label}
              </Chip>
            </li>
          ))}
        </ul>

        <Wires side="in" count={SOURCES.length} lit={moving && phase === 0 ? [activeIn] : []} run={seen} />

        <div className="relative order-1 lg:order-none">
          <img
            src="/brand/mark.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -top-[92px] right-8 -z-10 hidden w-[170px] select-none lg:block"
          />
          <div className="flex h-full flex-col items-center justify-center rounded-[28px] bg-white px-6 py-10 text-center text-ink sm:rounded-[36px] sm:px-10 sm:py-14">
            <h1
              aria-label="Stop re-explaining your taste."
              className="text-[clamp(2.125rem,8.4vw,4rem)] font-light leading-[1] tracking-[-0.04em]"
            >
              <span aria-hidden className="block">
                Stop re-explaining
              </span>
              <span aria-hidden className="mt-[0.1em] flex items-baseline justify-center">
                <span className="mr-[0.22em]">your</span>
                <Word word={active.word} />
                <motion.span layout="position" transition={{ duration: 0.5, ease: EASE }}>
                  .
                </motion.span>
              </span>
            </h1>
            <p className="mt-5 max-w-[26rem] text-balance text-[1.0625rem] leading-snug text-ink-2 sm:text-[1.1875rem]">
              Scoop collects what you save from everywhere into one library, organised for your agent.
            </p>
            <a
              href={APP_URL}
              className="mt-7 inline-flex min-h-[52px] items-center rounded-full bg-ink px-7 text-[1.0625rem] font-medium text-white transition-[background-color,transform] duration-150 ease-[var(--ease-out-expo)] hover:bg-mauve-deep active:translate-y-px active:scale-[0.98]"
            >
              Create your library
            </a>
          </div>
        </div>

        <Wires side="out" count={TAGS.length} lit={moving && phase === 1 ? activeOut : []} run={seen} />

        <ul
          aria-label="How your library is organised"
          className="order-4 flex flex-wrap justify-center gap-2 lg:order-none lg:grid lg:grid-rows-5 lg:justify-items-start lg:gap-0"
        >
          {TAGS.map((t, i) => (
            <li key={t} className="flex items-center">
              <Chip on={moving && phase === 1 && activeOut.includes(i)} tag>
                {t}
              </Chip>
            </li>
          ))}
        </ul>

        {/* Below the desktop width the wires are replaced by one short link between the two lists. */}
        <div aria-hidden className="order-3 flex justify-center lg:hidden">
          <span className="h-7 w-px bg-gradient-to-b from-white/10 via-pink to-white/10" />
        </div>
      </div>

      <p className="px-5 pb-6 text-center text-[0.9375rem] text-[#c9aebb] sm:px-9 sm:pb-8">
        Posts, videos, images, pages, newsletters and tools go in. One library, tagged by your agent, comes out.
      </p>
    </header>
  )
}

/** The rotating word sits in a pink pill, the way a tag does in the app. */
function Word({ word }: { word: string }) {
  return (
    <motion.span
      layout
      transition={{ duration: 0.5, ease: EASE }}
      style={{ borderRadius: 999 }}
      className="relative inline-flex overflow-hidden bg-pink px-[0.26em] pb-[0.1em] pt-[0.02em]"
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

function Chip({ children, on, tag }: { children: ReactNode; on: boolean; tag?: boolean }) {
  const rest = tag ? 'px-4 ' : 'pl-1.5 pr-4 '
  return (
    <span
      className={`flex h-10 items-center gap-2.5 whitespace-nowrap rounded-full border text-[0.9375rem] font-medium transition-[background-color,border-color,color] duration-300 ease-[var(--ease-out-expo)] ${rest}${
        on ? 'border-pink bg-pink text-ink' : 'border-white/15 bg-white/[0.06] text-white'
      }`}
    >
      {children}
    </span>
  )
}

/**
 * Wires between a list and the box. They are drawn in real pixels, measured from the space they
 * fill, so each one starts level with its chip and the stroke keeps an even weight.
 */
function Wires({ side, count, lit, run }: { side: 'in' | 'out'; count: number; lit: number[]; run: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 180, h: 380 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setSize({ w: Math.max(el.clientWidth, 1), h: Math.max(el.clientHeight, 1) })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { w, h } = size
  const paths = Array.from({ length: count }, (_, i) => {
    const far = ((i + 0.5) / count) * h
    const near = h / 2 + (i - (count - 1) / 2) * 12
    return side === 'in'
      ? `M0 ${far} C ${w * 0.55} ${far} ${w * 0.45} ${near} ${w} ${near}`
      : `M0 ${near} C ${w * 0.55} ${near} ${w * 0.45} ${far} ${w} ${far}`
  })
  const id = `wire-${side}`

  return (
    <div ref={ref} aria-hidden className="relative hidden lg:block">
      <svg viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 size-full overflow-visible" fill="none">
        <defs>
          <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={w} y2="0">
            <stop offset="0" stopColor="#9f527c" stopOpacity={side === 'in' ? 0.35 : 0.95} />
            <stop offset="1" stopColor="#9f527c" stopOpacity={side === 'in' ? 0.95 : 0.35} />
          </linearGradient>
        </defs>
        {paths.map((d, i) => (
          <path key={i} d={d} stroke={`url(#${id})`} strokeWidth="1.5" />
        ))}
        {lit.map((i) => (
          <motion.path
            key={`${run}-${i}`}
            d={paths[i]}
            pathLength={1}
            stroke="#ffd9ee"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="0.3 1"
            initial={{ strokeDashoffset: 0.3 }}
            animate={{ strokeDashoffset: -1 }}
            transition={{ duration: 1, ease: [0.45, 0, 0.2, 1] }}
            style={{ filter: 'drop-shadow(0 0 5px #ffabda) drop-shadow(0 0 12px #ffabda)' }}
          />
        ))}
      </svg>
    </div>
  )
}

function SourceIcon({ id }: { id: Source['id'] }) {
  const logo: Partial<Record<Source['id'], string>> = {
    instagram: '/icons/instagram.svg',
    youtube: '/icons/youtube.svg',
    x: '/icons/x.svg',
    web: '/icons/googlechrome.svg',
  }
  const src = logo[id]
  if (src) return <img src={src} alt="" className="size-4 object-contain" />

  const drawn: Record<'mail' | 'mcp' | 'skill', ReactNode> = {
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4 8 8 6 8-6" />
      </>
    ),
    mcp: <path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4" />,
    skill: <path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5" />,
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4 text-mauve-deep"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {drawn[id as 'mail' | 'mcp' | 'skill']}
    </svg>
  )
}
