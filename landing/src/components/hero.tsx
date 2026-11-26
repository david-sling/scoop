/** Where the product lives. The landing page only links to it. */
export const APP_URL = "https://app.scoop.davidsling.in";

/** The scene's own size, so the page can keep its shape while it loads. */
const SCENE = { src: "/hero/scene.webp", w: 1376, h: 768 };

/**
 * The hero: copy on the left, an ice-cream scene on the right. On wide screens the scene
 * is pushed right so its far edge (and the generator's corner mark) bleeds off the page,
 * and its empty left third sits under the copy. The scene grows with the screen's height,
 * so on tall screens it is pushed further right: its first sweet, about 21.5% in, always
 * starts after "re-explaining", the longest line (about 5.9 times the headline size).
 * On narrow screens the scene sits under the copy instead.
 */
export function Hero() {
  return (
    <header className="relative isolate flex min-h-svh flex-col overflow-hidden bg-[radial-gradient(120%_90%_at_20%_30%,#ffc5d9,#f6b0cc)]">
      <img
        src={SCENE.src}
        width={SCENE.w}
        height={SCENE.h}
        alt=""
        fetchPriority="high"
        className="pointer-events-none absolute left-[max(9vw,calc(clamp(2.5rem,7vw,7.5rem)+5.9*clamp(2.75rem,5.2vw,5.25rem)-38.5svh))] top-0 -z-10 hidden h-full w-auto max-w-none [mask-image:linear-gradient(to_right,transparent,#000_10%)] lg:block"
      />

      <nav
        aria-label="Main"
        className="flex items-center justify-between px-5 pt-5 sm:px-9 sm:pt-7"
      >
        <a href="/" className="rounded-full" aria-label="Scoop, home">
          <img
            src="/brand/wordmark.svg"
            alt=""
            className="h-11 w-auto sm:h-[52px]"
          />
        </a>
        <a
          href={APP_URL}
          className="inline-flex min-h-11 items-center rounded-full px-4 font-medium text-ink transition-colors duration-150 ease-[var(--ease-out-expo)] hover:bg-white/40 active:bg-white/60"
        >
          Sign in
        </a>
      </nav>

      <div className="flex flex-1 flex-col justify-center px-5 pb-10 pt-12 sm:px-9 lg:max-w-[46rem] lg:pb-20 lg:pl-[clamp(2.5rem,7vw,7.5rem)] lg:pt-0">
        <h1 className="text-[clamp(2.75rem,11vw,5.25rem)] font-medium leading-[0.95] tracking-[-0.045em] text-[#5e2a47] lg:text-[clamp(2.75rem,5.2vw,5.25rem)]">
          Stop
          <br />
          re&#8209;explaining
          <br />
          your <b className="font-extrabold text-mauve">taste</b>.
        </h1>
        <p className="mt-6 max-w-[26rem] text-pretty text-[1.125rem] leading-snug text-[#5e2a47] sm:text-[1.25rem]">
          Scoop collects what you save from everywhere into one library,
          organised for your agent.
        </p>
        <a
          href={APP_URL}
          className="mt-8 inline-flex min-h-[56px] items-center self-start rounded-full bg-[#5e2a47] px-7 text-[1.0625rem] font-semibold text-white transition-[background-color,transform] duration-150 ease-[var(--ease-out-expo)] hover:bg-ink active:translate-y-px active:scale-[0.98]"
        >
          Create your library
        </a>
      </div>

      {/* Narrow screens: the scene under the copy, cropped to where the sweets are. */}
      <img
        src={SCENE.src}
        width={SCENE.w}
        height={SCENE.h}
        alt=""
        className="pointer-events-none -mt-4 aspect-[4/3] w-full object-cover object-[48%_50%] lg:hidden"
      />
    </header>
  );
}

