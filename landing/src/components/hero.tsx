import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react'

/** Where the product lives. The landing page only links to it. */
export const APP_URL = 'https://app.scoop.davidsling.in'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * The hero shows one thing: saves from many places all flow to one centre.
 * Every logo is a place a save can come from, or a tool that can be saved.
 * They are examples, not partnerships. Each one carries a headline word.
 *
 * The logos sit in a honeycomb of flat-topped cells (points left and right) inside a
 * 1400 x 700 drawing. A is the cell size from centre to point, and the drawn hexagons are
 * a little smaller, which leaves an even channel between them for the wires to run in.
 * Cell (col, row) is centred at x = X0 + 1.5A * col, y = Y0 + 2HH * row, and odd columns
 * sit half a cell lower. The right side mirrors the left.
 */
const W = 1400
const H = 700
const A = 46
const HH = (Math.sqrt(3) / 2) * A
const X0 = 64
const Y0 = H / 2 - 6 * HH
const COLS = 5
const cell = (col: number, row: number) => ({ x: X0 + 1.5 * A * col, y: Y0 + 2 * HH * row + (col % 2 ? HH : 0) })

const LEFT = [
  { id: 'instagram', name: 'Instagram', word: 'taste', col: 1, row: 0 },
  { id: 'youtube', name: 'YouTube', word: 'references', col: 3, row: 1 },
  { id: 'x', name: 'X', word: 'references', col: 0, row: 2 },
  { id: 'googlechrome', name: 'any web page', word: 'references', col: 2, row: 3 },
  { id: 'dribbble', name: 'Dribbble', word: 'taste', col: 0, row: 4 },
  { id: 'gmail', name: 'email newsletters', word: 'references', col: 3, row: 4 },
  { id: 'pinterest', name: 'Pinterest', word: 'taste', col: 1, row: 5 },
] as const

const RIGHT = [
  { id: 'figma', name: 'Figma', word: 'tools', col: 1, row: 0 },
  { id: 'claude', name: 'Claude skills', word: 'process', col: 3, row: 1 },
  { id: 'github', name: 'GitHub', word: 'tools', col: 0, row: 2 },
  { id: 'notion', name: 'Notion', word: 'process', col: 2, row: 3 },
  { id: 'linear', name: 'Linear', word: 'process', col: 0, row: 4 },
  { id: 'supabase', name: 'Supabase', word: 'tools', col: 3, row: 4 },
  { id: 'slack', name: 'Slack', word: 'tools', col: 1, row: 5 },
] as const

/** Every cell of the honeycomb on one side. Cells without a logo are drawn as faint outlines. */
const CELLS = Array.from({ length: COLS }, (_, col) =>
  Array.from({ length: 7 }, (_, row) => ({ col, row })).filter(({ row }) => {
    const y = cell(col, row).y
    // The innermost column is shorter, so the honeycomb thins out towards the centre.
    return y > 90 && y < H - 90 && (col < COLS - 1 || Math.abs(y - H / 2) < 100)
  }),
).flat()

/** The order the light travels in. It alternates sides and walks through the four words. */
const ORDER = [
  'instagram', 'x', 'figma', 'claude', 'dribbble', 'youtube', 'github',
  'notion', 'pinterest', 'googlechrome', 'supabase', 'linear', 'gmail', 'slack',
] as const

type Node = { id: string; name: string; word: string; col: number; row: number; x: number; y: number; left: boolean }
const place = (n: (typeof LEFT)[number] | (typeof RIGHT)[number], left: boolean): Node => {
  const p = cell(n.col, n.row)
  return { ...n, left, x: left ? p.x : W - p.x, y: p.y }
}
const ALL: Node[] = [...LEFT.map((n) => place(n, true)), ...RIGHT.map((n) => place(n, false))]
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
          initial={{ x: '35%', opacity: 0, filter: 'blur(8px)' }}
          animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ x: '-35%', opacity: 0, filter: 'blur(8px)', transition: { duration: 0.22, ease: EASE } }}
          transition={{ duration: 0.5, ease: EASE }}
          className="inline-block whitespace-nowrap"
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  )
}

/** Flat-topped hexagon outline around a centre point: points to the left and right. */
function hex(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 180) * 60 * k
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

/**
 * A wire from a logo to the centre. It leaves from the point of the logo's hexagon that faces
 * the centre and then only ever runs along the edges between cells: a short level run, then a
 * 60 degree slant to the next column, each time stepping towards the middle line. Wires that
 * meet share an edge, so they gather into one trunk before they reach the headline.
 */
function wire(n: Node) {
  const mid = H / 2
  const dir = n.left ? 1 : -1
  const fx = (x: number) => (n.left ? x : W - x).toFixed(1)
  const start = cell(n.col, n.row)
  let x = start.x + A
  let y = start.y
  let d = `M${fx(x)} ${y.toFixed(1)}`
  let flip = start.y <= mid ? 1 : -1
  for (let col = n.col; col < COLS - 1; col++) {
    const away = Math.abs(y - mid) < 1
    const step = away ? -flip : y < mid ? 1 : -1
    if (away) flip = -flip
    x += A
    d += ` H${fx(x)}`
    x += A / 2
    y += step * HH
    d += ` L${fx(x)} ${y.toFixed(1)}`
  }
  if (Math.abs(y - mid) > 1) {
    x += Math.abs(y - mid) / Math.sqrt(3)
    d += ` L${fx(x)} ${mid}`
  }
  return `${d} H${W / 2 - dir * 60}`
}

/** How strongly each of the three surface finishes shows the shared sheen at rest. */
const SHEEN = [0.25, 0.6, 0.4]
const finishOf = (i: number, x: number) => (i * 7 + (x > W / 2 ? 1 : 0)) % 3
/** How far the cursor's light reaches, in scene units. */
const CURSOR_REACH = 260

/** How long one pulse of light takes to travel its wire, in seconds. */
const PULSE_S = 1.4
/** The lit part of the wire, as a share of its length. */
const DASH = 0.26
/** How long the trail a pulse leaves behind takes to fade, in seconds. */
const TRAIL_S = 10
/** How strong a fresh trail is. */
const TRAIL_OPACITY = 0.5
/** How long the glow around a logo takes to fade after its signal leaves, in seconds. */
const GLOW_S = 7
/** How strong that glow is at its peak. */
const GLOW_OPACITY = 0.55

/**
 * Wide screens: logos in hexagons on both sides, wired to the centre behind the headline.
 * The cells of the honeycomb touch, so the wires run along the lines where cells meet.
 * At rest only the logo cells and the wires show. The rest of the honeycomb appears faintly
 * in a soft circle around the light as it travels, and fades again behind it.
 */
function Honeycomb({ active, moving, run }: { active: Node; moving: boolean; run: number }) {
  const wires = ALL.map((n) => ({ n, d: wire(n) }))
  const cells = [true, false].flatMap((left) =>
    CELLS.map((c) => {
      const p = cell(c.col, c.row)
      return { x: left ? p.x : W - p.x, y: p.y }
    }),
  )

  const wireRefs = useRef<Record<string, SVGPathElement | null>>({})
  const pulseRef = useRef<SVGPathElement>(null)
  const spotRef = useRef<SVGCircleElement>(null)
  const fades = useRef<Record<string, { stop: () => void } | undefined>>({})
  const glowRefs = useRef<Record<string, SVGPolygonElement | null>>({})
  const svgRef = useRef<SVGSVGElement>(null)
  const sheenRefs = useRef<(SVGPolygonElement | null)[]>([])

  // The cursor is a second, small light. Cells near it catch more of the sheen, and the
  // light eases after the cursor rather than snapping to it.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const target = { x: 0, y: 0, on: 0 }
    const now = { x: 0, y: 0, on: 0 }
    let frame = 0
    const paint = () => {
      frame = 0
      now.x += (target.x - now.x) * 0.16
      now.y += (target.y - now.y) * 0.16
      now.on += (target.on - now.on) * 0.1
      cells.forEach((c, i) => {
        const el = sheenRefs.current[i]
        if (!el) return
        const near = Math.max(0, 1 - Math.hypot(c.x - now.x, c.y - now.y) / CURSOR_REACH)
        const base = SHEEN[finishOf(i, c.x)]
        el.setAttribute('fill-opacity', String(base + (1 - base) * near * near * now.on))
      })
      const settled =
        Math.abs(target.x - now.x) < 0.5 && Math.abs(target.y - now.y) < 0.5 && Math.abs(target.on - now.on) < 0.01
      if (!settled) frame = requestAnimationFrame(paint)
    }
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(paint)
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const box = svg.getBoundingClientRect()
      if (!box.width) return
      target.x = ((e.clientX - box.left) / box.width) * W
      target.y = ((e.clientY - box.top) / box.height) * H
      if (!target.on && now.on < 0.01) {
        now.x = target.x
        now.y = target.y
      }
      target.on = 1
      wake()
    }
    const leave = () => {
      target.on = 0
      wake()
    }
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
      cancelAnimationFrame(frame)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const running = fades.current
    return () => Object.values(running).forEach((f) => f?.stop())
  }, [])

  useEffect(() => {
    const path = wireRefs.current[active.id]
    const pulse = pulseRef.current
    const spot = spotRef.current
    if (!moving || !path || !pulse || !spot) return
    const length = path.getTotalLength()
    const id = active.id
    // The route itself is the trail: it is uncovered behind the light, then fades slowly.
    fades.current[id]?.stop()
    path.setAttribute('stroke-dashoffset', '1')
    path.setAttribute('opacity', String(TRAIL_OPACITY))
    let fading = false
    const fade = () => {
      if (fading) return
      fading = true
      fades.current[id] = animate(TRAIL_OPACITY, 0, {
        duration: TRAIL_S,
        ease: 'linear',
        onUpdate: (o) => path.setAttribute('opacity', String(o)),
      })
    }
    // The logo glows as the signal leaves it, then the glow fades on its own slow clock.
    const glow = glowRefs.current[id]
    if (glow) {
      fades.current[`glow-${id}`]?.stop()
      fades.current[`glow-${id}`] = animate(0, 1, {
        duration: GLOW_S,
        ease: 'linear',
        onUpdate: (t) => {
          const rise = 0.04
          const level = t < rise ? t / rise : 1 - (t - rise) / (1 - rise)
          glow.setAttribute('opacity', String(GLOW_OPACITY * level))
        },
      })
    }
    const controls = animate(0, 1, {
      duration: PULSE_S,
      ease: [0.45, 0, 0.2, 1],
      onUpdate: (p) => {
        pulse.setAttribute('stroke-dashoffset', String(DASH - (1 + DASH) * p))
        path.setAttribute('stroke-dashoffset', String(1 - Math.min(1, (1 + DASH) * p)))
        // The circle follows the middle of the lit part, and eases in and out at the two ends.
        const at = Math.min(1, Math.max(0, (1 + DASH) * p - DASH / 2))
        const point = path.getPointAtLength(at * length)
        spot.setAttribute('cx', String(point.x))
        spot.setAttribute('cy', String(point.y))
        spot.setAttribute('opacity', String(Math.min(1, p / 0.18, (1 - p) / 0.3)))
      },
      onComplete: fade,
    })
    return () => {
      controls.stop()
      fade()
    }
  }, [run, moving, active.id])

  return (
    <svg
      ref={svgRef}
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
          <stop offset="0.3" stopColor="#fff" />
          <stop offset="0.43" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.57" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id="fade-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <rect width={W} height={H} fill="url(#fade)" />
        </mask>

        {/* The soft circle that travels with the light and uncovers the cells near it. */}
        <radialGradient id="spot-falloff">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="spot-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <circle ref={spotRef} r="150" fill="url(#spot-falloff)" opacity="0" />
        </mask>

        {/* One light for the whole honeycomb: a single gradient laid across the full scene. */}
        <linearGradient id="field" x1="0" y1="0" x2="0" y2={H} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fffaf5" />
          <stop offset="1" stopColor="#f8e5d4" />
        </linearGradient>
        {/* The same sheen on every cell, from the same side. Only its strength differs. */}
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cell-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffead8" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="logo-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#fff1e4" />
        </linearGradient>
        <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      {/* Always there, very quietly: every cell sits in the same light and has no outline.
          Cells differ only in how much of that light their surface gives back. */}
      <g>
        {cells.map((c, i) => {
          const finish = finishOf(i, c.x)
          const points = hex(c.x, c.y, A)
          return (
            <g key={`${c.x}-${c.y}`}>
              <polygon points={points} fill="url(#field)" fillOpacity={[0.55, 0.78, 1][finish]} />
              <polygon
                ref={(el) => {
                  sheenRefs.current[i] = el
                }}
                points={points}
                fill="url(#sheen)"
                fillOpacity={SHEEN[finish]}
              />
            </g>
          )
        })}
      </g>

      <g mask="url(#spot-mask)">
        {cells.map((c) => (
          <polygon
            key={`${c.x}-${c.y}`}
            points={hex(c.x, c.y, A)}
            fill="url(#cell-fill)"
          />
        ))}
      </g>

      <g mask="url(#fade-mask)">
        {wires.map(({ n, d }) => (
          <path
            key={n.id}
            ref={(el) => {
              wireRefs.current[n.id] = el
            }}
            d={d}
            // Hidden at rest. It gives the light its route and shows as the trail behind it.
            pathLength={1}
            stroke="#f0489f"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 1"
            strokeDashoffset={1}
            opacity={0}
          />
        ))}
        {moving && (
          <path
            ref={pulseRef}
            d={wire(active)}
            pathLength={1}
            stroke="#f0489f"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${DASH} 1`}
            strokeDashoffset={DASH}
            style={{ filter: 'drop-shadow(0 0 4px #ffabda) drop-shadow(0 0 10px #ffabda)' }}
          />
        )}
      </g>

      {/* The glow a logo gives off when its signal leaves. Invisible until then. */}
      {ALL.map((n) => (
        <polygon
          key={n.id}
          ref={(el) => {
            glowRefs.current[n.id] = el
          }}
          points={hex(n.x, n.y, A + 6)}
          fill="#f66bb4"
          filter="url(#glow)"
          opacity={0}
        />
      ))}

      {ALL.map((n) => (
        <g key={n.id}>
          <polygon points={hex(n.x, n.y, A)} fill="url(#logo-fill)" />
          <image href={`/icons/${n.id}.svg`} x={n.x - 18} y={n.y - 18} width="36" height="36" />
        </g>
      ))}
    </svg>
  )
}

/** Narrow screens: the same logos as a small honeycomb under the copy, with no wires. */
function Comb() {
  const bands = [ALL.slice(0, 7), ALL.slice(7, 14)]
  return (
    <ul
      aria-label={`Places you save from and tools you can save: ${ALL.map((n) => n.name).join(', ')}`}
      className="mt-12 flex flex-col items-center gap-[5px] pb-7 xl:hidden"
    >
      {bands.map((band, b) => (
        <li key={b}>
          <ul className="flex">
            {band.map((n, i) => (
              <li
                key={n.id}
                className={`grid h-[46px] w-[53px] place-items-center bg-white [clip-path:polygon(25%_0,75%_0,100%_50%,75%_100%,25%_100%,0_50%)] ${
                  i ? '-ml-[9px]' : ''
                } ${i % 2 ? 'translate-y-[25.5px]' : ''}`}
              >
                <img src={`/icons/${n.id}.svg`} alt="" className="size-[22px] object-contain" />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
