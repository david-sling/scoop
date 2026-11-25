import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

/** Where the product lives. The landing page only links to it. */
export const APP_URL = 'https://app.scoop.davidsling.in'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * The hero shows one thing: saves from many places all flow to one centre.
 * Every logo is a place a save can come from, or a tool that can be saved.
 * They are examples, not partnerships. Each one carries a headline word.
 *
 * Positions sit on a honeycomb lattice in a 1400 x 700 drawing:
 * even rows at x = 70 + 80c, odd rows at x = 110 + 80c, rows at y = 140 + 70r.
 * The right side mirrors the left.
 */
const W = 1400
const H = 700
const R = 34

const LEFT = [
  { id: 'instagram', name: 'Instagram', word: 'taste', x: 150, y: 140 },
  { id: 'x', name: 'X', word: 'references', x: 110, y: 210 },
  { id: 'youtube', name: 'YouTube', word: 'references', x: 230, y: 280 },
  { id: 'googlechrome', name: 'any web page', word: 'references', x: 190, y: 350 },
  { id: 'dribbble', name: 'Dribbble', word: 'taste', x: 70, y: 420 },
  { id: 'gmail', name: 'email newsletters', word: 'references', x: 110, y: 490 },
  { id: 'pinterest', name: 'Pinterest', word: 'taste', x: 150, y: 560 },
] as const

const RIGHT = [
  { id: 'figma', name: 'Figma', word: 'tools', x: W - 150, y: 140 },
  { id: 'github', name: 'GitHub', word: 'tools', x: W - 110, y: 210 },
  { id: 'claude', name: 'Claude skills', word: 'process', x: W - 230, y: 280 },
  { id: 'notion', name: 'Notion', word: 'process', x: W - 190, y: 350 },
  { id: 'linear', name: 'Linear', word: 'process', x: W - 70, y: 420 },
  { id: 'supabase', name: 'Supabase', word: 'tools', x: W - 110, y: 490 },
  { id: 'slack', name: 'Slack', word: 'tools', x: W - 150, y: 560 },
] as const

/** Empty cells of the same lattice, drawn as faint outlines around the logos. */
const GHOST_LEFT = [
  [70, 140], [230, 140], [190, 210], [70, 280], [150, 280], [110, 350],
  [270, 350], [150, 420], [230, 420], [190, 490], [70, 560], [230, 560],
] as const

/** The order the light travels in. It alternates sides and walks through the four words. */
const ORDER = [
  'instagram', 'x', 'figma', 'claude', 'dribbble', 'youtube', 'github',
  'notion', 'pinterest', 'googlechrome', 'supabase', 'linear', 'gmail', 'slack',
] as const

const ALL = [...LEFT, ...RIGHT]
type Node = (typeof ALL)[number]
const byId = (id: string) => ALL.find((n) => n.id === id) as Node

const STEP_MS = 1900
/** The scene plays this many full rounds, then rests on the first word. */
const ROUNDS = 2

function useScene() {
  const reduced = useReducedMotion()
  // Server render and first paint are the resting state: everything is visible without motion.
  const [state, setState] = useState({ seen: 0, moving: false })

  useEffect(() => {
    if (reduced) return
    if (state.seen >= ORDER.length * ROUNDS) return
    const id = window.setTimeout(
      () => {
        // A hidden tab keeps its place and carries on when it is visible again.
        if (document.hidden) return setState((s) => ({ ...s }))
        setState((s) => ({ seen: s.moving ? s.seen + 1 : s.seen, moving: true }))
      },
      state.moving ? STEP_MS : 1200,
    )
    return () => window.clearTimeout(id)
  }, [state, reduced])

  return state
}

export function Hero() {
  const { seen, moving } = useScene()
  const active = byId(ORDER[seen % ORDER.length])

  return (
    <header className="relative isolate m-2 flex min-h-[calc(100svh-16px)] flex-col overflow-hidden rounded-[28px] bg-cream sm:m-3.5 sm:min-h-[calc(100svh-28px)] sm:rounded-[36px]">
      <nav aria-label="Main" className="relative z-10 flex items-center justify-between px-5 pt-5 sm:px-9 sm:pt-7">
        <a href="/" className="rounded-full" aria-label="Scoop, home">
          <img src="/brand/wordmark.svg" alt="" className="h-11 w-auto sm:h-[52px]" />
        </a>
        <a
          href={APP_URL}
          className="inline-flex min-h-11 items-center rounded-full px-4 font-medium text-ink transition-colors duration-150 ease-[var(--ease-out-expo)] hover:bg-white active:bg-pink-wash"
        >
          Sign in
        </a>
      </nav>

      <div className="relative flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-9">
        <Honeycomb active={active} moving={moving} run={seen} />

        <div className="relative z-10 flex max-w-[36rem] flex-col items-center text-center">
          <h1
            aria-label="Stop re-explaining your taste."
            className="text-[clamp(2.25rem,8.6vw,4.25rem)] font-light leading-[1] tracking-[-0.04em] text-ink xl:text-[clamp(3.25rem,4.3vw,4.25rem)]"
          >
            <span aria-hidden className="block">
              Stop re-explaining
            </span>
            <span aria-hidden className="mt-[0.1em] flex items-baseline justify-center">
              <span className="mr-[0.22em]">your</span>
              <Word word={moving ? active.word : 'taste'} />
              <motion.span layout="position" transition={{ duration: 0.5, ease: EASE }}>
                .
              </motion.span>
            </span>
          </h1>
          <p className="mt-5 max-w-[27rem] text-balance text-[1.0625rem] leading-snug text-ink-2 sm:text-[1.1875rem]">
            Scoop collects what you save from everywhere into one library, organised for your agent.
          </p>
          <a
            href={APP_URL}
            className="mt-7 inline-flex min-h-[52px] items-center rounded-full bg-ink px-7 text-[1.0625rem] font-medium text-white transition-[background-color,transform] duration-150 ease-[var(--ease-out-expo)] hover:bg-mauve-deep active:translate-y-px active:scale-[0.98]"
          >
            Create your library
          </a>
        </div>

        <Comb />
      </div>
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

/** Pointy-top hexagon outline around a centre point. */
function hex(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 180) * (60 * k - 90)
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

/** A wire from a logo to the centre. It leaves level, then bends in to the middle line. */
function wire(n: { x: number; y: number }, i: number, count: number) {
  const left = n.x < W / 2
  const endX = left ? W / 2 - 60 : W / 2 + 60
  const endY = H / 2 + (i - (count - 1) / 2) * 9
  const mid = n.x + (endX - n.x) * 0.5
  return `M${n.x} ${n.y} C ${mid} ${n.y} ${mid} ${endY} ${endX} ${endY}`
}

/** Wide screens: logos in hexagons on both sides, wired to the centre behind the headline. */
function Honeycomb({ active, moving, run }: { active: Node; moving: boolean; run: number }) {
  const wires = [
    ...LEFT.map((n, i) => ({ n, d: wire(n, i, LEFT.length) })),
    ...RIGHT.map((n, i) => ({ n, d: wire(n, i, RIGHT.length) })),
  ]
  const ghosts = [...GHOST_LEFT.map(([x, y]) => [x, y]), ...GHOST_LEFT.map(([x, y]) => [W - x, y])]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Logos of places you save from and tools you can save, including ${ALL.map((n) => n.name).join(', ')}. A line runs from each one to the centre of the page.`}
      className="pointer-events-none absolute left-1/2 top-1/2 hidden h-auto w-[min(100%,1400px)] -translate-x-1/2 -translate-y-1/2 xl:block"
      fill="none"
    >
      <defs>
        {/* Wires and their light fade out as they reach the headline. */}
        <linearGradient id="fade" x1="0" y1="0" x2={W} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.2" stopColor="#fff" />
          <stop offset="0.37" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.63" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.8" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id="fade-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <rect width={W} height={H} fill="url(#fade)" />
        </mask>
      </defs>

      {ghosts.map(([x, y]) => (
        <polygon key={`${x}-${y}`} points={hex(x, y, R + 4)} stroke="#eadfe4" strokeWidth="1.5" strokeLinejoin="round" />
      ))}

      <g mask="url(#fade-mask)">
        {wires.map(({ n, d }) => (
          <path key={n.id} d={d} stroke="#9f527c" strokeOpacity="0.38" strokeWidth="1.5" />
        ))}
        {moving &&
          wires
            .filter(({ n }) => n.id === active.id)
            .map(({ n, d }) => (
              <motion.path
                key={`${run}-${n.id}`}
                d={d}
                pathLength={1}
                stroke="#f0489f"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="0.28 1"
                initial={{ strokeDashoffset: 0.28 }}
                animate={{ strokeDashoffset: -1 }}
                transition={{ duration: 1.3, ease: [0.45, 0, 0.2, 1] }}
                style={{ filter: 'drop-shadow(0 0 4px #ffabda) drop-shadow(0 0 10px #ffabda)' }}
              />
            ))}
      </g>

      {ALL.map((n) => {
        const on = moving && n.id === active.id
        return (
          <g
            key={n.id}
            style={{
              transformBox: 'fill-box',
              transformOrigin: 'center',
              transform: on ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <polygon
              points={hex(n.x, n.y, R)}
              stroke={on ? '#ffabda' : '#eadfe4'}
              strokeWidth={on ? 13 : 10}
              strokeLinejoin="round"
              style={{ transition: 'stroke 300ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
            <polygon points={hex(n.x, n.y, R)} fill="#fff" stroke="#fff" strokeWidth="7" strokeLinejoin="round" />
            <image href={`/icons/${n.id}.svg`} x={n.x - 17} y={n.y - 17} width="34" height="34" />
          </g>
        )
      })}
    </svg>
  )
}

/** Narrow screens: the same logos as a small honeycomb under the copy, with no wires. */
function Comb() {
  const rows = [ALL.slice(0, 5), ALL.slice(5, 9), ALL.slice(9, 14)]
  return (
    <ul
      aria-label={`Places you save from and tools you can save: ${ALL.map((n) => n.name).join(', ')}`}
      className="mt-12 flex flex-col items-center xl:hidden"
    >
      {rows.map((row, r) => (
        <li key={r} className={r ? '-mt-3' : ''}>
          <ul className="flex gap-1.5">
            {row.map((n) => (
              <li
                key={n.id}
                className="grid h-[66px] w-[58px] place-items-center bg-white [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]"
              >
                <img src={`/icons/${n.id}.svg`} alt="" className="size-6 object-contain" />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
