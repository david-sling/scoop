import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

/**
 * "Your agent starts with your taste": a story told as the page scrolls.
 *
 * 1. In Scoop, the person adds four saves to a project.
 * 2. In their coding agent's desktop app, they ask for the project's references.
 * 3. The agent calls Scoop over MCP, once per save.
 * 4. Each save comes back with the person's own note.
 * 5. The agent replies using those notes.
 *
 * The whole scene is pinned while the section scrolls past: step titles stack under each
 * other as they arrive, and the Scoop browser and the agent window swap places at the
 * hand-off. At the end, everything leaves together. The agent window is a generic desktop
 * app in the style of today's coding agents, with no other company's logo or product
 * names. All content is a labelled example. With reduced motion, or before scripts load,
 * the finished agent conversation is shown.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

type Save = {
  id: string;
  icon: string;
  source: string;
  title: string;
  note: string;
  tags: string[];
};

/** The saves the person adds to the project. They are real pages; the notes are examples. */
const SAVES: Save[] = [
  {
    id: "sv_01",
    icon: "/icons/torph.svg",
    source: "torph.lochie.me",
    title: "Torph: dependency-free text morphing",
    note: "text morphs instead of swapping. use for step titles",
    tags: ["motion", "text"],
  },
  {
    id: "sv_02",
    icon: "/icons/x.svg",
    source: "x.com/kianbazza",
    title: "Inline label creation with menu subpages",
    note: "a subpage in the menu beats a modal for quick input",
    tags: ["menus", "patterns"],
  },
  {
    id: "sv_03",
    icon: "/icons/sileo.png",
    source: "sileo.aaryan.design",
    title: "Sileo: an opinionated toast component",
    note: "calm toasts. use these, don't build our own",
    tags: ["toasts", "components"],
  },
  {
    id: "sv_04",
    icon: "/icons/reactbits.png",
    source: "reactbits.dev",
    title: "Image Trail: images that follow the cursor",
    note: "fun for the welcome screen. only there",
    tags: ["motion", "delight"],
  },
];

/** Other saves in the library that are not added, so the choice reads as a choice. */
const OTHERS = [
  { icon: "/icons/dribbble.svg", title: "Bento grid pricing page" },
  { icon: "/icons/youtube.svg", title: "A talk on design tokens" },
];

/** The library as the person sees it, with the project's saves mixed in. */
const LIBRARY: { icon: string; title: string; save?: Save }[] = [
  { icon: SAVES[0].icon, title: SAVES[0].title, save: SAVES[0] },
  OTHERS[0],
  { icon: SAVES[1].icon, title: SAVES[1].title, save: SAVES[1] },
  { icon: SAVES[2].icon, title: SAVES[2].title, save: SAVES[2] },
  OTHERS[1],
  { icon: SAVES[3].icon, title: SAVES[3].title, save: SAVES[3] },
];

const PROJECT = "Onboarding redesign";

const PROMPT =
  "Starting the onboarding redesign. Pull the references I've saved for it in Scoop.";

const REPLY =
  "Found 4, and your notes point the same way: keep people where they are and let things change smoothly. I'll morph the step titles with Torph, create the workspace in a menu subpage instead of a modal, use Sileo for the confirmations, and keep Image Trail to the welcome screen only, like you said.";

/**
 * Where each beat happens, as a share of the scroll through the section. Each of the
 * five steps gets an equal fifth, and the window's beats sit inside its fifth.
 */
const BEATS = {
  /** The four saves are added to the project in Scoop. */
  adds: [0.03, 0.07, 0.11, 0.15],
  /** Scoop gives way to the agent's window. */
  swap: 0.2,
  prompt: [0.23, 0.34] as const,
  /** Each save is its own tool call: it appears running... */
  calls: [0.41, 0.46, 0.51, 0.56],
  /** ...and its card comes back while the "notes" explanation is in the middle. */
  answers: [0.62, 0.66, 0.7, 0.74],
  reply: [0.82, 0.97] as const,
};

/** The explanations, one per fifth of the scroll. */
const STEPS = [
  {
    title: "Add saves to a project",
    body: "Pick what this project should draw on. Each save keeps the note you wrote when you saved it.",
  },
  {
    title: "Ask your agent",
    body: "Start the work in your agent, like you always do. No need to describe your taste again.",
  },
  {
    title: "It calls Scoop",
    body: "Over MCP, your agent pulls the saves you added to the project, one at a time.",
  },
  {
    title: "Your notes come back",
    body: "What you saved, where it came from, and the few words you wrote about why.",
  },
  {
    title: "It builds with your taste",
    body: "The agent reads your notes and makes the calls you would have made.",
  },
];


const span = (p: number, [a, b]: readonly [number, number]) =>
  Math.min(1, Math.max(0, (p - a) / (b - a)));

export function AgentScene() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  // The story starts while the section is still coming up the screen (its top at 70% of
  // the way down), so saves are already being added before the scene fills the page.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end end"],
  });
  // Server render and no-script show the finished conversation. Once scripts run, the
  // scene starts from where the page actually is, so arriving from above starts at step 1.
  const [progress, setProgress] = useState(1);
  const sync = (v: number) => setProgress(Math.round(v * 1000) / 1000);
  useMotionValueEvent(scrollYProgress, "change", sync);
  useEffect(() => {
    // The value only changes once the section reaches the top of the screen, so read it now.
    const id = requestAnimationFrame(() => sync(scrollYProgress.get()));
    return () => cancelAnimationFrame(id);
  }, [scrollYProgress]);
  const p = reduced ? 1 : progress;
  const step = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length));
  const scoopFront = p < BEATS.swap;

  return (
    // The section is the scroll track. The whole scene (title, steps and windows) is one
    // pinned block, so scrolling plays it and, at the end, everything leaves together.
    <section
      ref={ref}
      aria-labelledby="agent-heading"
      className="relative bg-cream motion-safe:h-[480svh]"
    >
      <ol className="sr-only">
        {STEPS.map((s, i) => (
          <li key={s.title} aria-current={i === step ? "step" : undefined}>
            {s.title}. {s.body}
          </li>
        ))}
      </ol>

      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-5 pb-6 pt-8 sm:px-9 lg:px-[min(7vw,100.8px)] lg:pb-10 lg:pt-14">
          <h2
            id="agent-heading"
            className="max-w-[22ch] text-[clamp(1.875rem,4vw,3.5rem)] font-medium leading-[1] tracking-[-0.04em] text-[#5e2a47]"
          >
            Your agent starts with your{" "}
            <b className="font-extrabold text-mauve">taste</b>, not a blank page.
          </h2>

          <div className="mt-10 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] content-center gap-4 lg:mt-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-14">
            <Steps step={step} progress={scrollYProgress} still={!!reduced} />
            <Windows p={p} scoopFront={scoopFront} />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The explanation. On wide screens the titles so far stack under each other, each new
 * one sliding in under the last, with the current step's sentence under it. On phones,
 * where there is no room for the stack, only the current step shows.
 */
function Steps({
  step,
  progress,
  still,
}: {
  step: number;
  progress: MotionValue<number>;
  still: boolean;
}) {
  return (
    <div aria-hidden className="lg:order-1 lg:self-start">
      {/* Wide screens: every step is laid out from the start. Each one waits below the
          screen and rises with the scroll itself, the way page content would, until it
          settles under the steps before it. */}
      <ol className="hidden lg:block">
        {STEPS.map((s, i) => (
          <RisingStep key={s.title} i={i} now={i === step} progress={progress} still={still} />
        ))}
      </ol>

      <div className="min-h-[6.5rem] lg:hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <Title n={step + 1} title={STEPS[step].title} dim={false} />
            <p className="mt-1.5 pl-[calc(1.3ch*1.15+0.75rem)] text-pretty text-[1rem] leading-snug text-ink-2">
              {STEPS[step].body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * How far the scene's scroll travels from start to end, in screen heights: the section is
 * 480svh tall and its progress runs from its top at 70% of the screen to its bottom at the
 * screen's bottom, so 4.8 - 1 + 0.7. Steps rise by exactly this much per unit of progress,
 * which makes them move one pixel for every pixel scrolled, like the rest of the page.
 */
const TRAVEL_VH = 450;

function RisingStep({
  i,
  now,
  progress,
  still,
}: {
  i: number;
  now: boolean;
  progress: MotionValue<number>;
  still: boolean;
}) {
  const s = STEPS[i];
  const at = i / STEPS.length;
  // Lands in its slot just as it becomes current; below the screen until it is close.
  const y = useTransform(progress, (v) => `${Math.min(100, Math.max(0, (at - v) * TRAVEL_VH))}vh`);
  return (
    <motion.li style={still ? undefined : { y }}>
      <Title n={i + 1} title={s.title} dim={!now} />
      {/* The current step's sentence always shows. Earlier ones stay too, dimmed, when
          the screen is tall enough to hold the whole stack with them. */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)] ${
          now
            ? "grid-rows-[1fr]"
            : "grid-rows-[0fr] opacity-60 [@media(min-height:860px)]:grid-rows-[1fr]"
        }`}
      >
        <p className="min-h-0 max-w-[24rem] overflow-hidden text-pretty text-[1.0625rem] leading-snug text-ink-2">
          <span className="block pb-3 pt-2">{s.body}</span>
        </p>
      </div>
    </motion.li>
  );
}

function Title({ n, title, dim }: { n: number; title: string; dim: boolean }) {
  return (
    <p
      className={`flex items-baseline gap-3 py-1 text-[clamp(1.375rem,2.4vw,2.125rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-ink transition-opacity duration-500 ease-[var(--ease-out-expo)] ${
        dim ? "opacity-40" : "opacity-100"
      }`}
    >
      {/* Wide screens: the number hangs in the margin, so the titles line up with the
          section title and the rest of the content edge. */}
      <span className="w-[1.3ch] shrink-0 text-right font-display text-[1.15em] font-normal leading-none text-mauve lg:-ml-[calc(1.3ch*1.15+0.75rem)]">
        {n}
      </span>
      {title}
    </p>
  );
}

/**
 * Both windows share one spot, one behind the other. The one in use is in front; the other
 * peeks out above it, smaller and dimmer. They swap at the hand-off.
 */
function Windows({ p, scoopFront }: { p: number; scoopFront: boolean }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] pt-7 lg:order-2">
      <motion.div
        className="min-w-0 [grid-area:1/1]"
        style={{ zIndex: scoopFront ? 2 : 1, transformOrigin: "50% 0%" }}
        animate={scoopFront ? FRONT : BACK}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <ScoopWindow p={p} />
      </motion.div>
      <motion.div
        className="min-w-0 [grid-area:1/1]"
        style={{ zIndex: scoopFront ? 1 : 2, transformOrigin: "50% 0%" }}
        animate={scoopFront ? BACK : FRONT}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <AgentWindow p={p} />
      </motion.div>
    </div>
  );
}

/** Where the window in use sits, and where the other one waits behind it. */
const FRONT = { y: 0, scale: 1, opacity: 1, filter: "brightness(1)" };
const BACK = { y: -26, scale: 0.92, opacity: 0.9, filter: "brightness(0.93)" };

const WINDOW_H = "h-[min(560px,50svh)] lg:h-[min(560px,58svh)]";

/** Scoop's own web app: the library on the left, the project filling up on the right. */
function ScoopWindow({ p }: { p: number }) {
  const added = SAVES.filter((_, i) => p >= BEATS.adds[i]);
  const isAdded = (id: string) => added.some((s) => s.id === id);

  return (
    <div
      role="img"
      aria-label={`Example: Scoop's web app. The person adds four saves to the project ${PROJECT}: ${SAVES.map((s) => s.title).join("; ")}.`}
      className="overflow-hidden rounded-[18px] bg-cream shadow-[0_30px_80px_-30px_rgba(43,23,33,0.45)] ring-1 ring-[#5e2a47]/10"
    >
      <div aria-hidden className={`flex flex-col ${WINDOW_H}`}>
        {/* Browser chrome: a tab strip, then the address bar. */}
        <div className="bg-[#ece6e9]">
          <div className="flex items-end gap-3 px-4 pt-2.5">
            <span className="flex gap-1.5 pb-3">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
            </span>
            <span className="flex min-w-0 max-w-[15rem] items-center gap-2 rounded-t-[10px] bg-white px-3 py-2 text-[0.75rem] text-ink">
              <img src="/brand/mark-small.svg" alt="" className="size-3.5 shrink-0" />
              <span className="truncate">{PROJECT} · Scoop</span>
              <span className="ml-1 text-ink-3">×</span>
            </span>
            <span className="pb-2 text-[0.875rem] text-ink-3">+</span>
          </div>
          <div className="flex items-center gap-3 border-b border-rule bg-white px-4 py-2">
            <span className="flex gap-2.5 text-[0.8125rem] text-ink-3">
              <span>←</span>
              <span>→</span>
              <span>↻</span>
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-[#f4eff1] px-3 py-1 font-mono text-[0.6875rem] text-ink-2">
              <svg viewBox="0 0 12 12" className="size-3 shrink-0 text-ink-3" fill="none" aria-hidden>
                <rect x="2.5" y="5.5" width="7" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              <span className="truncate">
                app.scoop.davidsling.in<span className="text-ink-3">/projects/onboarding-redesign</span>
              </span>
            </span>
            <span className="rounded-full bg-pink-wash px-2 py-0.5 text-[0.6875rem] font-medium text-mauve-deep">
              Example
            </span>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-3 p-3 sm:grid-cols-[1fr_1.1fr] sm:p-4">
          {/* Library */}
          <div className="hidden min-h-0 flex-col rounded-[14px] bg-white p-3 sm:flex">
            <span className="px-1 text-[0.8125rem] font-semibold text-ink">Library</span>
            <ul className="mt-2 grid gap-1.5">
              {LIBRARY.map((row) => {
                const on = row.save ? isAdded(row.save.id) : false;
                return (
                  <li
                    key={row.title}
                    className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors duration-300 ${
                      on ? "bg-pink-wash" : "bg-cream/60"
                    }`}
                  >
                    <img src={row.icon} alt="" className="size-4 shrink-0 rounded-[3px] object-contain" />
                    <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-ink">{row.title}</span>
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full text-[0.75rem] font-bold transition-colors duration-300 ${
                        on ? "bg-[#5e2a47] text-white" : "bg-white text-ink-3 ring-1 ring-rule"
                      }`}
                    >
                      {on ? "✓" : "+"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Project */}
          <div className="flex min-h-0 flex-col overflow-hidden rounded-[14px] bg-white">
            <div className="bg-pink px-4 pb-4 pt-5">
              <p className="text-[1.375rem] font-light leading-none tracking-[-0.03em] text-ink sm:text-[1.625rem]">
                {PROJECT}
              </p>
              <p className="mt-2 font-mono text-[0.6875rem] text-[#5a2a45]">
                {added.length} {added.length === 1 ? "save" : "saves"} · for your agent
              </p>
            </div>
            <ul className="grid min-h-0 flex-1 content-start gap-2 overflow-hidden p-3">
              <AnimatePresence initial={false}>
                {added.map((s) => (
                  <motion.li
                    key={s.id}
                    layout
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="rounded-xl bg-cream px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <img src={s.icon} alt="" className="size-4 shrink-0 rounded-[3px] object-contain" />
                      <span className="truncate text-[0.8125rem] font-medium text-ink">{s.title}</span>
                    </div>
                    <p className="mt-1 truncate text-[0.75rem] text-mauve-deep">“{s.note}”</p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The agent's desktop app: the conversation, Scoop's four answers, and the reply. */
function AgentWindow({ p }: { p: number }) {
  // The prompt types out and the reply streams in, both tied to the scroll.
  const typed = Math.round(PROMPT.length * span(p, BEATS.prompt));
  const replied = Math.round(REPLY.length * span(p, BEATS.reply));

  return (
    <div
      role="img"
      aria-label={`Example: a coding agent's desktop app. The person asks: "${PROMPT}" The agent calls Scoop four times and gets back four saves, each with the person's note: ${SAVES.map((s) => `${s.title}, noted "${s.note}"`).join("; ")}. The agent replies: "${REPLY}"`}
      className="overflow-hidden rounded-[18px] bg-[#1f1e1d] text-[#e8e6e3] shadow-[0_30px_80px_-30px_rgba(43,23,33,0.55)] ring-1 ring-black/10"
    >
      <div aria-hidden className={`flex min-w-0 flex-col ${WINDOW_H}`}>
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5 text-[0.8125rem]">
          <span className="mr-2 flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="font-medium text-[#e8e6e3]">onboarding</span>
          <span className="text-[#6f6a62]">/</span>
          <span className="truncate text-[#9a958c]">Redesign the onboarding flow</span>
          <span className="ml-auto rounded-full bg-[#ffabda]/15 px-2 py-0.5 text-[0.6875rem] font-medium text-[#ffabda]">
            Example
          </span>
        </div>

        {/* Newest at the bottom; older messages scroll up and out of the top. */}
        <div className="relative flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-5 pb-4 sm:px-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-[#1f1e1d] to-transparent" />
          <div className="flex flex-col gap-3.5">
            {typed > 0 && (
              <div className="mb-1 ml-auto max-w-[85%] rounded-2xl bg-[#26313d] px-4 py-2.5 text-[0.875rem] leading-snug text-[#bcd6f2]">
                {PROMPT.slice(0, typed)}
                {typed < PROMPT.length && <Caret />}
              </div>
            )}

            <AnimatePresence initial={false}>
              {SAVES.map((s, i) =>
                p >= BEATS.calls[i] ? (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <ToolCall save={s} answered={p >= BEATS.answers[i]} />
                  </motion.div>
                ) : null,
              )}
            </AnimatePresence>

            {replied > 0 && (
              <p className="mt-1 text-[0.875rem] leading-relaxed text-[#e8e6e3]">
                {REPLY.slice(0, replied)}
                {replied < REPLY.length && <Caret />}
              </p>
            )}
          </div>
        </div>

        <div className="px-5 pb-4 sm:px-8">
          <div className="rounded-xl border border-white/10 bg-[#262524] px-3.5 py-3 text-[0.8125rem] text-[#6f6a62]">
            Describe a task or ask a question
            <div className="mt-3 flex items-center gap-3 text-[0.75rem]">
              <span className="text-[#9a958c]">+</span>
              <span>Auto</span>
              <span className="ml-auto grid size-6 place-items-center rounded-full bg-white/10 text-[#9a958c]">
                ↑
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * One MCP call to Scoop and what it returned: a muted tool row, then the save as a card
 * with where it came from, its title, the person's note and its tags.
 */
function ToolCall({ save, answered }: { save: Save; answered: boolean }) {
  return (
    <div className="text-[0.8125rem]">
      <div className="flex items-center gap-2 whitespace-nowrap text-[#9a958c]">
        {answered ? <Check /> : <Spinner />}
        <span>
          {answered ? "Called" : "Calling"} <span className="text-[#e8e6e3]">scoop</span>
          <span className="text-[#6f6a62]"> · </span>
          <span className="font-mono text-[0.75rem] text-[#e8e6e3]">get_save</span>
        </span>
        <span className="truncate font-mono text-[0.75rem] text-[#6f6a62]">{save.id}</span>
      </div>

      <AnimatePresence initial={false}>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-xl border border-white/[0.06] bg-[#262524] p-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white">
                  <img src={save.icon} alt="" className="size-4 rounded-[3px] object-contain" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[0.875rem] font-medium text-[#e8e6e3]">
                    {save.title}
                  </span>
                  <span className="block truncate font-mono text-[0.6875rem] text-[#8a857c]">
                    {save.source}
                  </span>
                </span>
              </div>
              <div className="mt-2.5 rounded-lg bg-[#ffabda]/[0.09] px-3 py-2 [box-shadow:inset_2px_0_0_#ffabda]">
                <span className="block text-[0.6875rem] font-medium text-[#ffabda]/75">
                  Your note
                </span>
                <span className="block text-[0.8125rem] leading-snug text-[#ffd3ea]">
                  {save.note}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {save.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[0.6875rem] text-[#9a958c]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function Caret() {
  return (
    <span className="ml-px inline-block h-[1em] w-[2px] translate-y-[0.15em] animate-pulse bg-current" />
  );
}

function Spinner() {
  return (
    <span className="size-3 animate-spin rounded-full border-[1.5px] border-[#6f6a62] border-t-[#e8e6e3]" />
  );
}

function Check() {
  return (
    <svg viewBox="0 0 12 12" className="size-3 text-[#28c840]" fill="none">
      <path
        d="M2.5 6.5 5 9l4.5-5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
