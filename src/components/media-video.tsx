"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";

type MediaVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  label?: string;
};

export function MediaVideo({ src, poster, className = "", label = "Toggle video sound" }: MediaVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !muted;
    video.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted) void video.play();
  };

  return (
    <div className={`media-video relative z-0 overflow-hidden bg-[#151a1c] ${className}`}>
      <div className="media-video-backdrop absolute inset-0 bg-cover bg-center opacity-35 blur-xl scale-110" style={{ backgroundImage: poster ? `url(${poster})` : undefined }} />
      <video ref={videoRef} className="media-video-player relative z-10 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster={poster}>
        <source src={src} type="video/mp4" />
      </video>
      <button type="button" onClick={toggleSound} aria-label={label} className="absolute bottom-4 right-4 z-20 grid size-10 place-items-center rounded-full border border-white/30 bg-[#080a0c]/75 text-white backdrop-blur-md transition hover:border-[#9ff6ed] hover:text-[#9ff6ed]">
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </div>
  );
}
