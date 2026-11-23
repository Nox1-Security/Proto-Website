"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Mark } from "./Logo";
import { IMG } from "@/lib/routes";

type Scenario = {
  id: string;
  tab: string;
  image: string;
  camera: string;
  location: string;
  label: string;
  time: string;
  clock: string;
  date: string;
  stamp: string;
  title: string;
  body: string;
  /** detection box as fractions of the frame: left, top, right, bottom */
  box: [number, number, number, number];
  story: [string, string, string];
};

const SCENARIOS: Scenario[] = [
  {
    id: "after-hours",
    tab: "After-hours person",
    image: "cctv-entrance",
    camera: "Front Entrance",
    location: "Storefront · street side",
    label: "Person",
    time: "11:42 PM",
    clock: "11:42",
    date: "Saturday, November 21",
    stamp: "2026-11-21 23:42:08",
    title: "Person detected at Front Entrance",
    body: "11:42 PM · Storefront is closed. Tap to review the clip.",
    box: [0.346, 0.3, 0.422, 0.59],
    story: ["Approaching", "Detected", "Close-up"],
  },
  {
    id: "unexpected-motion",
    tab: "Unexpected motion",
    image: "cctv-sidedoor",
    camera: "Side Door",
    location: "Building side · service door",
    label: "Motion",
    time: "2:17 AM",
    clock: "2:17",
    date: "Sunday, November 22",
    stamp: "2026-11-22 02:17:31",
    title: "Unexpected motion at Side Door",
    body: "2:17 AM · Door movement outside business hours.",
    box: [0.443, 0.29, 0.555, 0.655],
    story: ["Door closed", "Movement", "Close-up"],
  },
  {
    id: "loading-area",
    tab: "Loading area activity",
    image: "cctv-loading",
    camera: "Loading Door",
    location: "Loading area · roll-up door",
    label: "Person",
    time: "4:05 AM",
    clock: "4:05",
    date: "Sunday, November 22",
    stamp: "2026-11-22 04:05:12",
    title: "Activity in Loading Area",
    body: "4:05 AM · Person near the open roll-up door.",
    box: [0.474, 0.38, 0.55, 0.66],
    story: ["Door opening", "Detected", "Close-up"],
  },
];

type Phase = "scan" | "detect" | "notify";

const RM = "(prefers-reduced-motion: reduce)";
const subscribeRM = (cb: () => void) => {
  const mq = window.matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useReducedMotion = () =>
  useSyncExternalStore(subscribeRM, () => window.matchMedia(RM).matches, () => false);

function Frame({ s, className = "", sizes = "(min-width: 1024px) 60vw, 100vw" }: { s: Scenario; className?: string; sizes?: string }) {
  return (
    <picture>
      <source type="image/avif" srcSet={`${IMG}/${s.image}-800.avif 800w, ${IMG}/${s.image}-1280.avif 1280w`} sizes={sizes} />
      <source type="image/webp" srcSet={`${IMG}/${s.image}-800.webp 800w, ${IMG}/${s.image}-1280.webp 1280w`} sizes={sizes} />
      <img
        src={`${IMG}/${s.image}-1280.webp`}
        width={1280}
        height={720}
        alt={`Simulated night view from the ${s.camera} camera`}
        loading="lazy"
        decoding="async"
        className={className}
      />
    </picture>
  );
}

/** Crops the frame around the detection box for thumbnails and close-ups. */
function Crop({ s, size, zoom = 1.5, round = "rounded-lg" }: { s: Scenario; size: number; zoom?: number; round?: string }) {
  const [l, t, r, b] = s.box;
  const cx = (l + r) / 2;
  const cy = (t + b) / 2;
  const h = size / ((b - t) * zoom);
  const w = (h * 16) / 9;
  return (
    <span className={`relative block shrink-0 overflow-hidden bg-black ${round}`} style={{ width: size, height: size }}>
      <img
        src={`${IMG}/${s.image}-800.webp`}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute max-w-none"
        style={{ width: w, height: h, left: size / 2 - cx * w, top: size / 2 - cy * h }}
      />
    </span>
  );
}

function DetectionBox({ s, animate, runKey }: { s: Scenario; animate: boolean; runKey: number }) {
  const [l, t, r, b] = s.box;
  return (
    <div
      key={runKey}
      className={`absolute ${animate ? "box-in" : ""}`}
      style={{ left: `${l * 100}%`, top: `${t * 100}%`, width: `${(r - l) * 100}%`, height: `${(b - t) * 100}%` }}
    >
      <div className="absolute inset-0 rounded-[4px] border-2 border-amber shadow-[0_0_0_1px_rgb(0_0_0/0.35),0_0_24px_rgb(255_181_71/0.35)]" />
      {(["-left-[3px] -top-[3px] border-l-2 border-t-2", "-right-[3px] -top-[3px] border-r-2 border-t-2", "-left-[3px] -bottom-[3px] border-l-2 border-b-2", "-right-[3px] -bottom-[3px] border-r-2 border-b-2"] as const).map((c) => (
        <span key={c} className={`absolute h-3 w-3 border-amber ${c}`} />
      ))}
      <span className="absolute -top-7 left-0 inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-amber px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-ink">
        {s.label}
      </span>
    </div>
  );
}

export function Demo() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("scan");
  const [run, setRun] = useState(0);
  const reduced = useReducedMotion();
  const started = useRef(false);
  const timers = useRef<number[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const uid = useId();
  const s = SCENARIOS[idx];

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const play = useCallback(() => {
    clear();
    setRun((r) => r + 1);
    if (reduced) {
      setPhase("notify");
      return;
    }
    setPhase("scan");
    timers.current.push(window.setTimeout(() => setPhase("detect"), 900));
    timers.current.push(window.setTimeout(() => setPhase("notify"), 1900));
  }, [reduced]);

  // Start the first walkthrough when the demo scrolls into view.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!started.current && entries.some((e) => e.isIntersecting)) {
          started.current = true;
          play();
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clear();
    };
  }, [play]);

  // Selecting a scenario resets the previous one and replays from the start.
  const select = (i: number) => {
    started.current = true;
    setIdx(i);
    play();
  };

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const n = SCENARIOS.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = n - 1;
    if (next >= 0) {
      e.preventDefault();
      tabRefs.current[next]?.focus();
      select(next);
    }
  };

  const showBox = phase !== "scan";
  const showNotif = phase === "notify";

  return (
    <section ref={sectionRef} id="demo" aria-labelledby="demo-title" className="relative scroll-mt-20 py-24 md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_70%_0%,rgb(49_32_63/0.55),transparent_70%)]" />
      <div className="wrap">
        <div className="flex flex-col gap-8">
          <div className="max-w-2xl">
            <p className="eyebrow">Simulated demo</p>
            <h2 id="demo-title" className="h2 mt-4">
              From camera event to phone alert in seconds.
            </h2>
            <p className="lede mt-5 max-w-xl">
              Pick a scenario. Watch the camera view flag the activity, then see the matching alert you could review
              on your phone. Sample scenes, fictional camera names.
            </p>
          </div>
          <div role="tablist" aria-label="Demo scenarios" className="flex flex-wrap gap-2">
            {SCENARIOS.map((sc, i) => (
              <button
                key={sc.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`${uid}-tab-${i}`}
                aria-selected={i === idx}
                aria-controls={`${uid}-panel`}
                tabIndex={i === idx ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`min-h-[44px] rounded-full border px-4 text-[0.92rem] transition-colors ${
                  i === idx
                    ? "border-thistle bg-thistle/[0.14] text-paper"
                    : "border-white/15 text-mist hover:border-white/30 hover:text-paper"
                }`}
              >
                {sc.tab}
              </button>
            ))}
          </div>
        </div>

        <div
          role="tabpanel"
          id={`${uid}-panel`}
          aria-labelledby={`${uid}-tab-${idx}`}
          className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-6"
        >
          {/* Camera view */}
          <div className="flex min-w-0 flex-col">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_40px_80px_-40px_rgb(0_0_0/0.8)]">
              <div className="relative aspect-video">
                <Frame s={s} className="absolute inset-0 h-full w-full object-cover" />
                {phase === "scan" && !reduced && (
                  <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[10%]">
                    <div className="scanline h-full bg-[linear-gradient(180deg,transparent,rgb(201_169_216/0.18),transparent)]" />
                  </div>
                )}
                {showBox && <DetectionBox s={s} animate={!reduced} runKey={run} />}
                {/* on-screen display */}
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 font-mono text-[11px] text-white/90 sm:p-4 sm:text-xs">
                  <span className="flex items-center gap-2 rounded bg-black/55 px-2 py-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${showBox ? "bg-amber" : "bg-white/50"}`} aria-hidden="true" />
                    {s.camera.toUpperCase()}
                  </span>
                  <span className="hidden rounded bg-black/55 px-2 py-1 sm:inline">{s.stamp}</span>
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-3 sm:p-4">
                  <span className="rounded-md border border-thistle/40 bg-ink/75 px-2 py-1 text-[11px] font-medium text-thistle backdrop-blur sm:text-xs">
                    Simulated demo · sample scene
                  </span>
                  <span className="flex items-center gap-1.5 rounded bg-black/55 px-2 py-1 font-mono text-[11px] text-white/85 sm:text-xs">
                    <span className="rec-dot h-2 w-2 rounded-full bg-[#ff4d4d]" aria-hidden="true" /> LIVE
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-mist">
                <span className="text-paper">{s.camera}</span> · {s.location}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={play} className="btn btn-ghost !min-h-[44px] !px-4 !text-sm">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2.5 8a5.5 5.5 0 1 0 1.8-4.07M2.5 2.5v3h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Replay
                </button>
                <button
                  type="button"
                  onClick={() => dialogRef.current?.showModal()}
                  className="btn btn-primary !min-h-[44px] !px-4 !text-sm"
                >
                  View event
                </button>
              </div>
            </div>
          </div>

          {/* Phone preview */}
          <div className="relative flex min-w-0 flex-col items-center justify-start rounded-2xl border border-white/10 bg-[linear-gradient(160deg,#1a1422,#0f0c15)] px-5 py-8 sm:py-10">
            <div className="relative w-full max-w-[290px] rounded-[44px] border border-white/15 bg-[#07060a] p-2.5 shadow-[0_30px_70px_-30px_rgb(0_0_0/0.9),inset_0_0_0_1px_rgb(255_255_255/0.04)]">
              <div className="relative aspect-[9/17.5] overflow-hidden rounded-[36px] bg-[radial-gradient(120%_70%_at_50%_0%,#3a2650_0%,#1b1326_45%,#0d0b12_100%)]">
                <div className="absolute left-1/2 top-2.5 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
                <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-semibold text-white/90" aria-hidden="true">
                  <span>{s.clock}</span>
                  <span className="flex items-center gap-1">
                    <svg width="15" height="10" viewBox="0 0 15 10" fill="currentColor"><rect x="0" y="6" width="2.5" height="4" rx=".6" /><rect x="4" y="4" width="2.5" height="6" rx=".6" /><rect x="8" y="2" width="2.5" height="8" rx=".6" /><rect x="12" y="0" width="2.5" height="10" rx=".6" /></svg>
                    <svg width="20" height="10" viewBox="0 0 20 10" fill="none"><rect x=".5" y=".5" width="16" height="9" rx="2.2" stroke="currentColor" /><rect x="2" y="2" width="11" height="6" rx="1.2" fill="currentColor" /></svg>
                  </span>
                </div>
                <div className="mt-8 text-center" aria-hidden="true">
                  <p className="text-[12px] font-medium text-white/70">{s.date}</p>
                  <p className="text-[56px] font-semibold leading-none tracking-tight text-white/95">{s.clock}</p>
                </div>
                <div className="absolute inset-x-3 top-[46%]" aria-live="polite">
                  {showNotif ? (
                    <div key={run} className={`${reduced ? "" : "notif-in"} rounded-[20px] border border-white/10 bg-[#1c1724]/90 p-3 shadow-xl backdrop-blur`}>
                      <div className="flex items-center gap-2">
                        <Mark className="h-5 w-5 rounded-[5px]" />
                        <span className="text-[11px] font-semibold tracking-wide text-white/80">NOX</span>
                        <span className="ml-auto text-[11px] text-white/50">now</span>
                      </div>
                      <div className="mt-2 flex gap-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 text-[13px] font-semibold leading-snug text-white">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber" aria-hidden="true" />
                            {s.title}
                          </p>
                          <p className="mt-0.5 text-[12px] leading-snug text-white/70">{s.body}</p>
                        </div>
                        <Crop s={s} size={52} />
                      </div>
                      <span className="sr-only">Simulated alert.</span>
                    </div>
                  ) : (
                    <div className="rounded-[20px] border border-dashed border-white/10 p-3 text-center text-[11px] text-white/40">
                      {phase === "scan" ? "Watching camera…" : "Event detected…"}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/40" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-5 max-w-[290px] text-center text-[13px] leading-relaxed text-dim">
              {showNotif ? (
                <>
                  Alert triggered by the <span className="text-amber">highlighted event</span> on {s.camera}.
                </>
              ) : (
                "Example notification preview."
              )}
            </p>
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${uid}-dlg-title`}
        className="m-auto w-[min(960px,calc(100vw-24px))] max-h-[calc(100dvh-24px)] overflow-y-auto rounded-2xl border border-white/10 bg-ink-2 p-0 text-paper backdrop:bg-black/75 backdrop:backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-thistle">Simulated event · sample scene</p>
              <h3 id={`${uid}-dlg-title`} className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
                {s.title}
              </h3>
            </div>
            <form method="dialog">
              <button className="-mr-2 -mt-1 inline-flex h-11 w-11 items-center justify-center rounded-full text-mist hover:bg-white/[0.06] hover:text-paper" aria-label="Close event preview">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M4 4l10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </button>
            </form>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            {s.story.map((label, i) => (
              <figure key={label} className="min-w-0">
                <div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-black">
                  {i === 2 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Crop s={s} size={400} zoom={1.15} round="rounded-none" />
                    </div>
                  ) : (
                    <Frame s={s} sizes="33vw" className={`absolute inset-0 h-full w-full object-cover ${i === 0 ? "opacity-75" : ""}`} />
                  )}
                  {i === 1 && (
                    <div
                      className="absolute rounded-[3px] border-2 border-amber"
                      style={{ left: `${s.box[0] * 100}%`, top: `${s.box[1] * 100}%`, width: `${(s.box[2] - s.box[0]) * 100}%`, height: `${(s.box[3] - s.box[1]) * 100}%` }}
                    />
                  )}
                </div>
                <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-x-2 text-[11px] sm:text-xs">
                  <span className={i === 1 ? "text-amber" : "text-mist"}>{label}</span>
                  <span className="font-mono text-dim">{["−4s", "0s", "+2s"][i]}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <dl className="mt-6 grid gap-x-6 gap-y-4 border-t border-white/10 pt-5 text-sm sm:grid-cols-4">
            {[
              ["Camera", s.camera],
              ["Location", s.location],
              ["Timestamp (example)", s.stamp],
              ["Detected", s.label],
            ].map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-xs text-dim">{k}</dt>
                <dd className="mt-1 break-words text-paper">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-dim">
            This storyboard is a simulated preview built from a sample scene. In a pilot, an event would link to the
            recorded clip from your own camera.
          </p>
        </div>
      </dialog>
    </section>
  );
}
