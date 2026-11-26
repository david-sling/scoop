/**
 * "How it works" in three steps: save, library, project. Each step has a small sketch of
 * the real interface. They are illustrations, not screenshots.
 */
export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="bg-white py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-9 lg:px-[min(7vw,100.8px)]">
        <h2
          id="how-heading"
          className="max-w-[20ch] text-[clamp(2.25rem,4.4vw,3.75rem)] font-medium leading-[1] tracking-[-0.04em] text-[#5e2a47]"
        >
          Three scoops, <b className="font-extrabold text-mauve">one</b> library.
        </h2>

        <ol className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
          <Step
            n="1"
            title="Save in one click"
            body="Save from any page with the Chrome extension and add a few words on why. Newsletters go straight to your Scoop address."
          >
            <SaveSketch />
          </Step>
          <Step
            n="2"
            title="Everything in one shape"
            body="Posts, pages, videos, images and emails all become the same kind of card. You or your agent add tags."
          >
            <TagSketch />
          </Step>
          <Step
            n="3"
            title="Point your agent at a project"
            body="Add the saves you want used to a project. Your agent reads them over MCP and records how each one was used."
          >
            <ProjectSketch />
          </Step>
        </ol>
      </div>
    </section>
  );
}

function Step({
  n,
  title,
  body,
  children,
}: {
  n: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-col rounded-[28px] bg-pink-wash p-6 sm:p-8">
      <span
        aria-hidden
        className="grid size-12 place-items-center rounded-full bg-[#5e2a47] text-[1.25rem] font-extrabold text-white"
      >
        {n}
      </span>
      <h3 className="mt-6 text-[1.5rem] font-semibold leading-tight tracking-[-0.02em] text-ink">
        {title}
      </h3>
      <p className="mt-2 text-pretty text-[1rem] leading-snug text-ink-2">{body}</p>
      <div aria-hidden className="mt-8 flex flex-1 items-end">
        <div className="w-full rounded-[20px] bg-white p-4 shadow-[0_1px_0_rgba(94,42,71,0.06)]">
          {children}
        </div>
      </div>
    </li>
  );
}

function SaveSketch() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <img src="/brand/mark-small.svg" alt="" className="size-5" />
        <span className="text-[0.875rem] font-semibold text-ink">Save to Scoop</span>
      </div>
      <div className="mt-3 rounded-xl bg-cream px-3 py-2.5 text-[0.875rem] text-ink-2">
        text morphs, use for step titles<span className="ml-px inline-block h-4 w-px translate-y-0.5 animate-pulse bg-mauve" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[0.75rem] text-ink-3">you@scoop.davidsling.in</span>
        <span className="rounded-full bg-[#5e2a47] px-3 py-1.5 text-[0.8125rem] font-semibold text-white">
          Save
        </span>
      </div>
    </div>
  );
}

function TagSketch() {
  const rows = [
    { icon: "/icons/x.svg", label: "Menu subpages", tags: ["menus"] },
    { icon: "/icons/torph.svg", label: "Torph text morphing", tags: ["motion", "text"] },
    { icon: "/icons/sileo.png", label: "Sileo toasts", tags: ["toasts"] },
  ];
  return (
    <ul className="grid gap-2">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center gap-2.5 rounded-xl bg-cream px-3 py-2">
          <img src={r.icon} alt="" className="size-4 rounded-[3px] object-contain" />
          <span className="min-w-0 flex-1 truncate text-[0.875rem] text-ink">{r.label}</span>
          {r.tags.map((t) => (
            <span key={t} className="rounded-full bg-white px-2 py-0.5 font-mono text-[0.6875rem] text-ink-2">
              {t}
            </span>
          ))}
        </li>
      ))}
    </ul>
  );
}

function ProjectSketch() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[0.875rem] font-semibold text-ink">Onboarding redesign</span>
        <span className="font-mono text-[0.75rem] text-ink-3">4 saves</span>
      </div>
      <div className="mt-3 rounded-xl bg-cream px-3 py-2.5">
        <p className="text-[0.8125rem] text-ink-3">Used by your agent</p>
        <p className="mt-1 text-[0.875rem] leading-snug text-ink">
          “Torph text morphing” → morphing step titles in onboarding
        </p>
      </div>
    </div>
  );
}
