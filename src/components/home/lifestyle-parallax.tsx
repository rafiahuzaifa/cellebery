"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LucideIcon } from "lucide-react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export type LifestyleItem = {
  key: string;
  image?: string;
  video?: string;
  icon: LucideIcon;
  en: string[];
  ar: string[];
};

// A different move from the gallery's pinned coverflow: no pinning here,
// just two layered GSAP techniques scrubbed to the ordinary page scroll —
// (1) each tile's media sits oversized inside its clipped card and drifts
// vertically at its own speed as the card passes through the viewport
// (classic parallax, continuous/scrub-tied so it tracks the scrollbar
// exactly, no easing lag), and (2) the card itself plays a one-time
// staggered rise-and-fade the first time it crosses into view. Columns
// alternate parallax direction/strength so the row breathes instead of
// moving as one flat plane.
export function LifestyleParallax({ items, isArabic }: { items: LifestyleItem[]; isArabic: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLDivElement | HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const triggers: ScrollTrigger[] = [];

      cardRefs.current.forEach((card, i) => {
        const media = mediaRefs.current[i];
        if (!card) return;

        gsap.fromTo(
          card,
          { y: 70, opacity: 0, scale: 0.94 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            delay: (isArabic ? items.length - 1 - i : i) * 0.09,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%", toggleActions: "play none none reverse" },
          }
        );

        if (media) {
          const depth = i % 2 === 0 ? 10 : 16;
          const tween = gsap.fromTo(
            media,
            { yPercent: -depth },
            {
              yPercent: depth,
              ease: "none",
              scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
          if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
        }
      });

      return () => triggers.forEach((t) => t.kill());
    });

    return () => mm.revert();
  }, [items.length, isArabic]);

  return (
    <div ref={rootRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ key, image, video, icon: Icon, en, ar }, index) => {
        const [title, caption] = isArabic ? ar : en;
        return (
          <div key={key} ref={(el) => { cardRefs.current[index] = el; }} className="group relative aspect-[3/4] overflow-hidden bg-[#151a1c]">
            {video ? (
              <video
                ref={(el) => { mediaRefs.current[index] = el; }}
                className="absolute -top-[16%] left-0 h-[132%] w-full object-cover opacity-75 transition-opacity duration-700 group-hover:opacity-95"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              >
                <source src={video} type="video/mp4" />
              </video>
            ) : (
              <div
                ref={(el) => { mediaRefs.current[index] = el; }}
                className="full-media absolute -top-[16%] left-0 h-[132%] w-full bg-cover bg-center opacity-75 transition-opacity duration-700 group-hover:opacity-95"
                style={{ backgroundImage: `url(${image})` }}
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080a0c] via-[#080a0c]/10 to-transparent" />
            <div className="pointer-events-none absolute inset-0 border border-white/10 transition group-hover:border-[#22d3ee]/50" />
            <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-white/25 bg-[#080a0c]/50 text-[#22d3ee] backdrop-blur-sm"><Icon size={15} strokeWidth={1.5} /></span>
            <div className="absolute bottom-5 left-5 right-5"><h3 className="text-xl font-semibold uppercase tracking-[-0.02em]">{title}</h3><p className="mt-1.5 text-xs leading-5 text-white/55">{caption}</p></div>
          </div>
        );
      })}
    </div>
  );
}
