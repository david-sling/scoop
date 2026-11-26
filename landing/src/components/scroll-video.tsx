import { useEffect, useRef } from "react";

type Props = {
  /** A silent video whose last frame matches its first, so it loops without a seam. */
  src: string;
  /** The video's first frame, shown until the video has loaded. */
  poster: string;
  width: number;
  height: number;
  className?: string;
};

/** A scroll this recent, in milliseconds, counts as still scrolling when a run ends. */
const RECENT = 250;

/**
 * A video that scrolling sets running.
 *
 * A scroll in either direction plays it forward at its natural speed, however fast the
 * scroll is; it never runs backwards. Once started it always runs through to its end,
 * which looks the same as its start, and rests there. It goes round again only if the
 * page is still being scrolled at that moment, and a scroll made after its `<header>`
 * has been scrolled past does not start it.
 *
 * The file is only fetched when the video is visible, so a copy hidden at the current
 * screen size costs nothing. With reduced motion on, only the poster shows.
 */
export function ScrollVideo({ src, poster, width, height, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stage = video.closest("header");
    let requested = false;
    let lastScroll = -Infinity;

    /** Fetch the file the first time the video is visible at this screen size. */
    const visible = () => {
      if (video.offsetParent === null) return false;
      if (!requested) {
        requested = true;
        video.src = src;
        video.load();
      }
      return true;
    };

    const inView = () =>
      visible() && (!stage || window.scrollY < stage.offsetHeight);

    const onScroll = () => {
      if (!inView()) return;
      lastScroll = performance.now();
      if (video.paused) video.play().catch(() => {});
    };

    /** At the end of a run: back to the matching first frame, and on again if still scrolling. */
    const onEnded = () => {
      video.currentTime = 0;
      if (inView() && performance.now() - lastScroll < RECENT) {
        video.play().catch(() => {});
      }
    };

    /**
     * Swap the poster for the video's own first frame as soon as it can be drawn. A still
     * image and a decoded video frame never come out exactly the same colour, so leaving
     * the poster up would make the scene shift colour the moment it starts playing.
     */
    const onLoaded = () => {
      if (video.paused && video.currentTime === 0) video.currentTime = 0.001;
    };

    const onResize = () => {
      if (!visible()) video.pause();
    };

    visible();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    video.addEventListener("ended", onEnded);
    video.addEventListener("loadeddata", onLoaded);
    return () => {
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("ended", onEnded);
      video.pause();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      poster={poster}
      width={width}
      height={height}
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
      className={className}
    />
  );
}
