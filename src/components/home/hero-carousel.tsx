"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import type { PublicHeroSlide } from "@/actions/hero-campaigns";

const AUTOPLAY_MS = 7000;

function subscribeIsMobile(callback: () => void) {
  const query = window.matchMedia("(max-width: 767px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function getIsMobileSnapshot() {
  return window.matchMedia("(max-width: 767px)").matches;
}
function useIsMobile() {
  return useSyncExternalStore(subscribeIsMobile, getIsMobileSnapshot, () => false);
}

// Server and the first client render can't know the real viewport, so they
// both render as "not yet mounted" (no mismatch). Once React checks this
// against the real client snapshot right after hydration, it flips —
// giving a reliable "safe to make client-only decisions now" signal
// without a manual setState-in-effect.
function useHasMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}

// If the video's own aspect ratio is close to the hero's, cropping it to
// fill the frame (cover) looks natural. But several of this site's source
// clips are portrait (shot for mobile/social), and cover-fitting a portrait
// video into a wide landscape hero forces a massive blow-up with almost all
// of the frame cropped away — the "extremely zoomed in" look. Past this
// mismatch threshold, show the full frame instead (contain) over a blurred
// fill of the poster so there's no hard letterbox bars.
const COVER_MISMATCH_THRESHOLD = 1.6;

// Target minimum duration (seconds) for one loop of a hero video, achieved
// by slowing playback down when the clip itself is shorter than this.
const MIN_LOOP_SECONDS = 3.5;

function SlideVisual({ slide, active, reducedMotion, isMobile }: { slide: PublicHeroSlide; active: boolean; reducedMotion: boolean; isMobile: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");
  // The server has no way to know the real viewport, so isMobile always
  // starts false there — meaning a naive `src` pick would put the (heavy,
  // wrong-aspect) desktop video into the initial HTML on a phone. Browsers'
  // HTML preload scanners start fetching <video><source> as soon as they're
  // parsed, before React hydration gets a chance to correct it — so the
  // fix isn't just picking the right src, it's not rendering any <video>
  // tag at all until we're certain of the real viewport.
  const readyForVideo = useHasMounted();

  // No OR-fallback to the desktop clip on mobile: a wrong-aspect,
  // desktop-sized video is worse for mobile data/load time than just
  // showing the (properly portrait-cropped) poster. Video only plays on
  // mobile when a dedicated mobileVideo is actually set for that slide.
  const src = readyForVideo ? (isMobile ? slide.mobileVideo : slide.desktopVideo) : null;
  const posterSrc = (isMobile && slide.posterImageMobile) || slide.posterImage;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      // React sets .muted as a JS property but doesn't reliably reflect it
      // as the actual "muted" HTML attribute — some browsers' autoplay
      // policies check the attribute, silently blocking play() otherwise.
      video.muted = true;
      video.defaultMuted = true;
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
    // Re-run when src changes: the <video> remounts (key={src}) once
    // readyForVideo flips true after mount, so this must fire again for
    // the newly-created element, not just once on the initial (srcless) mount.
  }, [active, src]);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;
    const checkFit = () => {
      if (!video.videoWidth || !video.videoHeight || !container.clientWidth || !container.clientHeight) return;
      const videoAspect = video.videoWidth / video.videoHeight;
      const containerAspect = container.clientWidth / container.clientHeight;
      const mismatch = Math.max(videoAspect / containerAspect, containerAspect / videoAspect);
      setFitMode(mismatch > COVER_MISMATCH_THRESHOLD ? "contain" : "cover");
      // The trimmed hero clips are short (kept to just their clean,
      // caption/overlay-free window) — played at 1x they loop so fast
      // within a single slide's view that it reads as stuttering/
      // restarting rather than a video actually playing. Slow short clips
      // down so each loop takes a more natural, cinematic few seconds;
      // never speed a clip up past its own real pace.
      if (video.duration && Number.isFinite(video.duration)) {
        video.playbackRate = Math.min(1, video.duration / MIN_LOOP_SECONDS);
      }
    };
    checkFit();
    video.addEventListener("loadedmetadata", checkFit);
    window.addEventListener("resize", checkFit);
    return () => {
      video.removeEventListener("loadedmetadata", checkFit);
      window.removeEventListener("resize", checkFit);
    };
  }, [src]);

  return (
    <div ref={containerRef} className="absolute inset-0 bg-[#05070a]">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${posterSrc})` }} />
      {src && !reducedMotion && fitMode === "contain" && (
        <div className="absolute inset-0 scale-110 bg-cover bg-center opacity-70 blur-2xl" style={{ backgroundImage: `url(${posterSrc})` }} />
      )}
      {src && !reducedMotion && (
        <video
          ref={videoRef}
          key={src}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full ${fitMode === "cover" ? "object-cover" : "object-contain"}`}
          muted
          loop
          playsInline
          preload={active ? "auto" : "none"}
          poster={posterSrc}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05070a]/75 via-[#05070a]/15 to-[#05070a]/35" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#05070a]/55 via-transparent to-transparent" />
    </div>
  );
}

export function HeroCarousel({ slides, locale, isArabic }: { slides: PublicHeroSlide[]; locale: string; isArabic: boolean }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (paused || reducedMotion || slides.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, reducedMotion, slides.length]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const parallaxX = useTransform(springX, [-0.5, 0.5], [8, -8]);
  const parallaxY = useTransform(springY, [-0.5, 0.5], [6, -6]);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    if (reducedMotion) return;
    const bounds = sectionRef.current?.getBoundingClientRect();
    if (!bounds) return;
    mouseX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    mouseY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  if (slides.length === 0) {
    return (
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden border-b border-white/10 bg-[#05070a] text-center">
        <SiteNav overlay />
        <div>
          <h1 className="display-font text-6xl font-semibold uppercase leading-[0.9]">{isArabic ? "صوت بلا حدود" : "Sound without limits"}</h1>
          <Link href={`/${locale}/shop`} className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#22d3ee] px-7 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#080a0c]">{isArabic ? "تسوق الآن" : "Shop now"} <ArrowUpRight size={15} /></Link>
        </div>
      </section>
    );
  }

  const safeIndex = index % slides.length;
  const slide = slides[safeIndex];
  const title = isArabic ? slide.titleAr : slide.title;
  const description = isArabic ? slide.descriptionAr : slide.description;
  const ctaText = isArabic ? slide.ctaTextAr : slide.ctaText;
  const secondaryText = isArabic ? slide.secondaryTextAr : slide.secondaryText;

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      aria-roledescription="carousel"
      aria-label={isArabic ? "شرائح العرض الرئيسية" : "Hero campaign slides"}
      className="relative min-h-[86vh] overflow-hidden border-b border-white/10 bg-[#05070a] lg:min-h-[90vh]"
    >
      <AnimatePresence>
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="absolute inset-0"
          style={reducedMotion ? undefined : { x: parallaxX, y: parallaxY }}
        >
          <SlideVisual slide={slide} active reducedMotion={reducedMotion} isMobile={isMobile} />
        </motion.div>
      </AnimatePresence>
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.12]" />

      <SiteNav overlay />

      <div className="relative z-10 mx-auto flex min-h-[86vh] max-w-[1440px] items-end px-6 pb-24 pt-28 lg:min-h-[90vh] lg:items-center lg:px-12 lg:pt-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-xl"
          >
            <div className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#22d3ee]">
              <span className="inline-block h-px w-8 bg-[#22d3ee]" />
              CELIBERY {isArabic ? "أوديو" : "AUDIO"}
            </div>
            <h1 className="display-font text-[clamp(2.5rem,6vw,4.75rem)] font-semibold uppercase leading-[0.96] tracking-[-0.03em]">{title}</h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/65">{description}</p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href={`/${locale}${slide.ctaLink}`}
                className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#22d3ee] px-7 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#080a0c] transition hover:shadow-[0_0_28px_rgba(34,211,238,0.45)] sm:w-fit"
              >
                {ctaText}
                <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              {slide.secondaryLink && secondaryText && (
                <Link
                  href={`/${locale}${slide.secondaryLink}`}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/25 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white/85 transition hover:border-[#22d3ee] hover:text-[#22d3ee] sm:w-fit"
                >
                  {secondaryText}
                </Link>
              )}
            </div>

            {slide.features.length > 0 && (
              <div className="mt-11 flex gap-5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
                {slide.features.map((feature, i) => (
                  <motion.div
                    key={`${slide.id}-${feature.en}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                    className="flex shrink-0 items-center gap-2 text-[9px] font-bold uppercase tracking-[0.1em] text-white/60"
                  >
                    <span className="inline-block size-1.5 shrink-0 rounded-full bg-[#22d3ee]" />
                    {isArabic ? feature.ar : feature.en}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <div className="relative z-10 mx-auto flex max-w-[1440px] items-center gap-3 px-6 pb-8 lg:px-12">
          <button
            aria-label={paused ? (isArabic ? "تشغيل" : "Play") : (isArabic ? "إيقاف مؤقت" : "Pause")}
            onClick={() => setPaused((p) => !p)}
            className="grid size-7 shrink-0 place-items-center rounded-full border border-white/25 text-white/70 transition hover:border-[#22d3ee] hover:text-[#22d3ee]"
          >
            {paused ? <Play size={11} /> : <Pause size={11} />}
          </button>
          <div className="flex flex-1 items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                aria-label={`${isArabic ? "الشريحة" : "Slide"} ${i + 1}`}
                aria-current={i === safeIndex}
                onClick={() => setIndex(i)}
                className="group relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/15"
              >
                {i === safeIndex && !paused && !reducedMotion && (
                  <motion.span
                    key={`${s.id}-progress`}
                    className="absolute inset-y-0 left-0 rounded-full bg-[#22d3ee]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                  />
                )}
                {(i === safeIndex && (paused || reducedMotion)) && <span className="absolute inset-0 rounded-full bg-[#22d3ee]/70" />}
                {i < safeIndex && <span className="absolute inset-0 rounded-full bg-[#22d3ee]/40" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
