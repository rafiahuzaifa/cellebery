"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MediaVideo } from "@/components/media-video";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

type GalleryItem = { type: "image" | "video"; src: string; size: "sm" | "md" | "lg" };

const GALLERY_ITEMS: GalleryItem[] = [
  { type: "image", src: "/lifestyle/travel.jpg", size: "md" },
  { type: "image", src: "/products/earbuds-hero.jpg", size: "sm" },
  { type: "video", src: "/CELIBERY_Bluetooth_speaker_comme%E2%80%A6_202609080042.mp4", size: "lg" },
  { type: "image", src: "/lifestyle/work.jpg", size: "md" },
  { type: "image", src: "/products/speaker-hero.jpg", size: "sm" },
  { type: "video", src: "/Friends_playing_football_with_sp%E2%80%A6_202609080042.mp4", size: "md" },
  { type: "image", src: "/lifestyle/home.jpg", size: "sm" },
  { type: "video", src: "/WhatsApp%20Video%202026-09-08%20at%2007.52.47.mp4", size: "lg" },
];

const TILE_WIDTH: Record<GalleryItem["size"], string> = {
  sm: "w-[62vw] sm:w-[36vw] lg:w-[22vw]",
  md: "w-[76vw] sm:w-[46vw] lg:w-[30vw]",
  lg: "w-[88vw] sm:w-[62vw] lg:w-[40vw]",
};

// Coverflow tuning: how far a tile at the very edge of the pinned
// viewport tilts/shrinks/recedes relative to the one centered under
// the viewer (distance 0 = dead center, 1 = at or past the edge).
const MAX_ROTATE_DEG = 42;
const MIN_SCALE = 0.8;
const MIN_OPACITY = 0.42;
const MAX_RECEDE = 260;

// Desktop-only (matchMedia below skips it under 1024px, and for
// prefers-reduced-motion): a pinned viewport where vertical scroll
// distance is converted 1:1 into horizontal track movement via
// ScrollTrigger's scrub, then reversed for RTL so it reads in the
// same visual direction as Arabic body text. On top of the horizontal
// move, every tile is given a live 3D coverflow transform (rotateY /
// scale / opacity / translateZ) driven off its own distance from the
// viewport's center, computed from the track's untransformed layout
// geometry rather than getBoundingClientRect — reading the box after
// it's already rotated would feed the tilt back into itself.
export function ScrollGallery({ isArabic }: { isArabic: boolean }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const pinEl = pinRef.current;
    const track = trackRef.current;
    if (!pinEl || !track) return;

    const mm = gsap.matchMedia();

    mm.add(
      { isDesktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)" },
      (context) => {
        const { isDesktop } = context.conditions as { isDesktop: boolean };
        if (!isDesktop) return;

        const tiles = tileRefs.current.filter((el): el is HTMLDivElement => el != null);
        const distance = () => track.scrollWidth - pinEl.offsetWidth;
        const direction = isArabic ? 1 : -1;

        const applyCoverflow = () => {
          const trackX = (gsap.getProperty(track, "x") as number) || 0;
          const pinCenter = pinEl.offsetWidth / 2;
          for (const tile of tiles) {
            const tileCenter = tile.offsetLeft + tile.offsetWidth / 2 + trackX;
            const dist = gsap.utils.clamp(-1, 1, (tileCenter - pinCenter) / pinCenter);
            const magnitude = Math.abs(dist);
            gsap.set(tile, {
              rotateY: -dist * MAX_ROTATE_DEG,
              scale: gsap.utils.interpolate(1, MIN_SCALE, magnitude),
              opacity: gsap.utils.interpolate(1, MIN_OPACITY, magnitude),
              z: gsap.utils.interpolate(0, -MAX_RECEDE, magnitude),
            });
          }
        };

        const trigger = ScrollTrigger.create({
          trigger: pinEl,
          start: "top top",
          end: () => `+=${Math.max(distance(), 1)}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
          animation: gsap.to(track, { x: () => direction * distance(), ease: "none" }),
          onUpdate: (self) => {
            if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`;
            applyCoverflow();
          },
          onRefresh: applyCoverflow,
        });

        applyCoverflow();
        return () => trigger.kill();
      }
    );

    return () => mm.revert();
  }, [isArabic]);

  return (
    <div ref={pinRef} className="relative h-[78vh] overflow-hidden bg-[#080a0c] lg:h-screen lg:perspective-[1600px]">
      <div className="pointer-events-none absolute inset-0 z-10 hidden bg-[radial-gradient(ellipse_at_center,transparent_35%,#080a0c_88%)] lg:block" />
      <div
        ref={trackRef}
        className="no-scrollbar flex h-full snap-x snap-mandatory items-center gap-4 overflow-x-auto px-6 will-change-transform lg:snap-none lg:gap-10 lg:overflow-visible lg:px-[30vw] lg:transform-3d"
      >
        {GALLERY_ITEMS.map((item, index) =>
          item.type === "video" ? (
            <div
              key={item.src}
              ref={(el) => { tileRefs.current[index] = el; }}
              className={`relative h-[58vh] shrink-0 snap-center overflow-hidden rounded-2xl bg-[#151a1c] shadow-2xl shadow-black/60 ring-1 ring-white/10 will-change-transform lg:h-[62vh] ${TILE_WIDTH[item.size]}`}
            >
              <MediaVideo src={item.src} className="h-full w-full" label={isArabic ? "تفعيل أو كتم صوت الفيديو" : "Toggle sound"} />
            </div>
          ) : (
            <div
              key={item.src}
              ref={(el) => { tileRefs.current[index] = el; }}
              className={`h-[58vh] shrink-0 snap-center overflow-hidden rounded-2xl bg-cover bg-center shadow-2xl shadow-black/60 ring-1 ring-white/10 will-change-transform lg:h-[62vh] ${TILE_WIDTH[item.size]}`}
              style={{ backgroundImage: `url(${item.src})` }}
              role="img"
              aria-label={`Gallery image ${index + 1}`}
            />
          )
        )}
      </div>
      <div className="pointer-events-none absolute inset-x-12 bottom-10 hidden h-[2px] bg-white/10 z-20 lg:block">
        <div ref={progressRef} className="h-full w-full origin-left scale-x-0 bg-[#22d3ee]" />
      </div>
    </div>
  );
}
