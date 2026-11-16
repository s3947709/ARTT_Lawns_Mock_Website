"use client";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";

type JobCarouselProps = { before: string; after: string; job: number };

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeToMotionPreference(onChange: () => void) {
  const preference = window.matchMedia(motionQuery);
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}
function getReducedMotion() {
  return window.matchMedia(motionQuery).matches;
}
function getServerReducedMotion() {
  return true;
}

export default function JobCarousel({ before, after, job }: JobCarouselProps) {
  const [showAfter, setShowAfter] = useState(false);
  // Respect reduced motion for autoplay, but allow an explicit Play request.
  const [playback, setPlayback] = useState<boolean | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    getReducedMotion,
    getServerReducedMotion,
  );
  const playing = playback ?? !reducedMotion;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setShowAfter((current) => !current), 1000);
    return () => window.clearInterval(timer);
  }, [playing]);
  return <div className="job-carousel" role="group" aria-label={`Job ${job}: before and after`}>
    <div className="job-images">{[before, after].map((file, index) =>
      <div key={file} className={showAfter === Boolean(index) ? "job-slide active" : "job-slide"} aria-hidden={showAfter !== Boolean(index)}>
        <Image src={`/images/${file}`} alt={`Job ${job} ${index === 0 ? "before" : "after"} garden maintenance`} fill sizes="(max-width: 767px) 100vw, 33vw" />
        <span className="job-caption">{index === 0 ? "Before" : "After"}</span>
      </div>
    )}</div>
    <div className="carousel-controls">
      <button type="button" aria-pressed={!showAfter} onClick={() => { setShowAfter(false); setPlayback(false); }}>Before</button>
      <button type="button" aria-pressed={showAfter} onClick={() => { setShowAfter(true); setPlayback(false); }}>After</button>
      <button type="button" aria-label={`Job ${job}: ${playing ? "pause" : "play"} slideshow`} onClick={() => {
        if (!playing) setShowAfter((current) => !current);
        setPlayback(!playing);
      }}>{playing ? "Pause" : "Play"}</button>
    </div>
  </div>;
}

