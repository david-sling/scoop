/** Where the product lives. The landing page only links to it. */
export const APP_URL = "https://app.scoop.davidsling.in";

/** The scene's own size, so the page can keep its shape while it loads. */
const SCENE = { src: "/hero/scene.webp", w: 1376, h: 768 };

/**
 * The hero: copy on the left, an ice-cream scene on the right, together in one centred
 * frame up to 1440px wide. The scene is sized to the frame, not the screen, and fades out
 * on every side into the pink, so wider screens get more pink rather than a hard image edge.
 * The fade also hides the generator's mark in the scene's bottom-right corner. The page's
 * pinks are sampled from the scene's own edges so the fade leaves no visible box.
 *
 * Everything in the frame scales with its width, so the copy and scene keep the same
 * relation at every size: the scene's first sweet, about 21.5% into the image, starts
 * just after "re-explaining", the longest line (about 5.9 times the headline size).
 * On narrow screens the scene sits under the copy instead.
 */
const FRAME = "mx-auto w-full max-w-[1440px]";

export function Hero() {
  return (
    <header className="relative isolate flex min-h-svh flex-col overflow-hidden bg-[radial-gradient(120%_90%_at_35%_40%,#fbbdd2,#f3b2c6)]">
      <div
        className={`${FRAME} pointer-events-none absolute inset-y-0 left-1/2 -z-10 hidden -translate-x-1/2 lg:block`}
      >
        <img
          src={SCENE.src}
          width={SCENE.w}
          height={SCENE.h}
          alt=""
          fetchPriority="high"
          className="absolute left-[17%] top-1/2 h-auto w-[110%] max-w-none -translate-y-1/2 [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_72%,transparent_90%),linear-gradient(to_bottom,transparent,#000_10%,#000_90%,transparent)]"
        />
      </div>

      <nav
        aria-label="Main"
        className={`${FRAME} flex items-center justify-between px-5 pt-5 sm:px-9 sm:pt-7`}
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

      <div
        className={`${FRAME} flex flex-1 flex-col justify-center px-5 pb-10 pt-12 sm:px-9 lg:pb-20 lg:pl-[min(7vw,100.8px)] lg:pt-0`}
      >
        <h1 className="text-[clamp(2.75rem,11vw,5.25rem)] font-medium leading-[0.95] tracking-[-0.045em] text-[#5e2a47] lg:text-[min(5.2vw,74.9px)]">
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
        className="pointer-events-none -mt-4 aspect-[4/3] w-full object-cover object-[48%_50%] [mask-image:linear-gradient(to_bottom,transparent,#000_15%)] lg:hidden"
      />
    </header>
  );
}

