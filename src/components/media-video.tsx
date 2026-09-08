"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type MediaVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  label?: string;
  showSoundButton?: boolean;
};

export function MediaVideo({ src, poster, className = "", label = "Toggle video sound", showSoundButton = true }: MediaVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  // With several of these on one page, letting every <video autoPlay>
  // fire at mount hits browsers' simultaneous-autoplay limits and some
  // silently never start. Only ask a video to play once it's actually
  // in view, and pause it again once it scrolls away.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !muted;
    video.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted) void video.play();
  };

  return (
    <div className={`media-video ${className}`}>
      <div className="media-video-backdrop bg-cover bg-center opacity-35 blur-xl scale-110" style={{ backgroundImage: poster ? `url(${poster})` : undefined }} />
      <video ref={videoRef} className="media-video-player object-cover" muted loop playsInline preload="metadata" poster={poster}>
        <source src={src} type="video/mp4" />
      </video>
      {showSoundButton && (
        <button type="button" onClick={toggleSound} aria-label={label} className="absolute bottom-4 right-4 z-20 grid size-10 place-items-center rounded-full border border-white/30 bg-[#080a0c]/75 text-white backdrop-blur-md transition hover:border-[#22d3ee] hover:text-[#22d3ee]">
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}
    </div>
  );
}
