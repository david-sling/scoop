import SpecularButton from "./react-bits/SpecularButton";
import { ScrollVideo } from "./scroll-video";

/** Where the product lives. The landing page only links to it. */
export const APP_URL = "https://app.scoop.davidsling.in";

/**
 * The scene is a short silent video that plays while the page scrolls. `w` and `h` are its
 * own size, so the page can keep its shape while it loads; the poster is its first frame.
 */
const SCENE = {
  src: "/hero/scene.mp4",
  poster: "/hero/scene-poster.webp",
  w: 2560,
  h: 1440,
};

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
 * On narrow screens the copy is centred at the top and an upright scene sits behind it,
 * anchored to the bottom and sized so its sweets stay clear of the button.
 *
 * The scene plays forward at its natural speed while the page scrolls. On wide screens the hero stays
 * put and the rest of the page slides up over it; on narrow ones it scrolls away as usual.
 */
/**
 * Narrow screens get their own upright scene: empty pink in its top half for the copy,
 * the sweets in its bottom half. It is cropped just above the generator's mark.
 */
const SCENE_MOBILE = {
  src: "/hero/scene-mobile.mp4",
  poster: "/hero/scene-mobile-poster.webp",
  w: 716,
  h: 1150,
};

const FRAME = "mx-auto w-full max-w-[1440px]";

export function Hero() {
  return (
    <header className="relative isolate flex min-h-svh flex-col overflow-hidden bg-[radial-gradient(120%_90%_at_35%_40%,#fbbdd2,#f3b2c6)] lg:sticky lg:top-0">
      <div
        className={`${FRAME} pointer-events-none absolute inset-y-0 left-1/2 -z-10 hidden -translate-x-1/2 lg:block`}
      >
        <ScrollVideo
          src={SCENE.src}
          poster={SCENE.poster}
          width={SCENE.w}
          height={SCENE.h}
          className="absolute left-[23%] top-1/2 h-auto w-[110%] max-w-none -translate-y-1/2 [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_72%,transparent_90%),linear-gradient(to_bottom,transparent,#000_10%,#000_90%,transparent)]"
        />
      </div>

      <nav
        aria-label="Main"
        className={`${FRAME} flex items-center justify-between px-5 pt-5 sm:px-9 sm:pt-7 lg:px-[min(7vw,100.8px)]`}
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
          className="inline-flex min-h-11 items-center rounded-full bg-white/75 px-5 text-[0.9375rem] font-semibold text-[#5e2a47] backdrop-blur-sm transition-[background-color,transform] duration-150 ease-[var(--ease-out-expo)] hover:bg-white active:translate-y-px active:scale-[0.98]"
        >
          Sign in
        </a>
      </nav>

      <div
        className={`${FRAME} flex flex-1 flex-col items-center px-5 pb-10 pt-10 text-center sm:px-9 lg:items-start lg:justify-center lg:pb-20 lg:pl-[min(7vw,100.8px)] lg:pt-0 lg:text-left`}
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
        {/* A plum pill whose rim catches a pink light that follows the cursor.
            Its stylesheet is not in a Tailwind layer, so spacing and weight go in `style`. */}
        <SpecularButton
          href={APP_URL}
          size="lg"
          radius={999}
          tint="#5e2a47"
          tintOpacity={1}
          textColor="#ffffff"
          lineColor="#ffabda"
          baseColor="#9f527c"
          idleIntensity={0.6}
          thickness={2}
          shineSize={16}
          glow={1.6}
          className="lg:self-start"
          style={{ marginTop: 32, fontWeight: 600, boxShadow: "none" }}
        >
          Create your library
        </SpecularButton>
      </div>

      {/* Narrow screens: the upright scene behind the copy, standing on the bottom edge.
          Its sweets fill its lower half, so its height is twice the room left under the
          copy, and never wider than the screen. It fades into the pink on every side. */}
      <ScrollVideo
        src={SCENE_MOBILE.src}
        poster={SCENE_MOBILE.poster}
        width={SCENE_MOBILE.w}
        height={SCENE_MOBILE.h}
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[min(160.6vw,calc((100svh_-_26rem)_*_2))] w-auto max-w-none -translate-x-1/2 [mask-composite:intersect] [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_98%,transparent),linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)] sm:h-[min(160.6vw,calc((100svh_-_33rem)_*_2))] lg:hidden"
      />
    </header>
  );
}
