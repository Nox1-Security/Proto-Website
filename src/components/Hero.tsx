"use client";

import { useEffect, useRef, useState } from "react";
import { HERO, srcset } from "@/lib/images";
import { IMG } from "@/lib/routes";

type Lens = { x: number; y: number; r: number } | null;

export function Hero() {
  const driftRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [lens, setLens] = useState<Lens>(null);

  // Place the lens reflection over the camera lens for whichever crop is showing.
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const mq = window.matchMedia("(max-width: 767px)");
    const place = () => {
      const tall = mq.matches;
      const meta = tall ? HERO.tall : HERO.wide;
      const l = tall ? HERO.lensTall : HERO.lensWide;
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (!cw || !ch) return;
      const s = Math.max(cw / meta.w, ch / meta.h);
      const rw = meta.w * s;
      const rh = meta.h * s;
      const style = getComputedStyle(el).objectPosition.split(" ");
      const px = parseFloat(style[0]) / 100 || 0.5;
      const py = parseFloat(style[1] ?? "50%") / 100 || 0;
      const ox = (cw - rw) * px;
      const oy = (ch - rh) * py;
      setLens({ x: ox + l.x * rw, y: oy + l.y * rh, r: l.r * rw });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    mq.addEventListener("change", place);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", place);
    };
  }, []);

  // Gentle drift of the photograph as the hero scrolls away. Text stays put.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, window.innerHeight * 1.2);
        if (driftRef.current) driftRef.current.style.transform = `translate3d(0, ${y * 0.22}px, 0)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate flex min-h-[640px] h-[100svh] max-h-[1080px] overflow-hidden">
      <div ref={driftRef} className="absolute inset-0 -z-20 will-change-transform">
        <div className="settle absolute inset-0">
          <picture>
            <source
              media="(max-width: 767px)"
              type="image/avif"
              srcSet={srcset(HERO.tall.name, HERO.tall.widths, "avif")}
              sizes="100vw"
            />
            <source
              media="(max-width: 767px)"
              type="image/webp"
              srcSet={srcset(HERO.tall.name, HERO.tall.widths, "webp")}
              sizes="100vw"
            />
            <source type="image/avif" srcSet={srcset(HERO.wide.name, HERO.wide.widths, "avif")} sizes="100vw" />
            <source type="image/webp" srcSet={srcset(HERO.wide.name, HERO.wide.widths, "webp")} sizes="100vw" />
            <img
              ref={imgRef}
              src={`${IMG}/${HERO.wide.name}-1600.jpg`}
              width={HERO.wide.w}
              height={HERO.wide.h}
              alt={HERO.alt}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover object-[66%_50%] max-md:object-[60%_0%]"
            />
          </picture>
          {lens && (
            <span
              aria-hidden="true"
              className="lens-sweep pointer-events-none absolute overflow-hidden rounded-full"
              style={{ left: lens.x - lens.r, top: lens.y - lens.r, width: lens.r * 2, height: lens.r * 2 }}
            />
          )}
        </div>
      </div>

      {/* Readability gradients; kept separate from the photo so text stays crisp. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(13_11_18/0.55)_0%,transparent_18%)]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden md:block bg-[linear-gradient(90deg,rgb(13_11_18/0.94)_0%,rgb(13_11_18/0.78)_32%,rgb(13_11_18/0.2)_58%,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,#0d0b12_0%,rgb(13_11_18/0.92)_30%,rgb(13_11_18/0.55)_50%,transparent_66%)] md:bg-[linear-gradient(0deg,#0d0b12_0%,transparent_26%)]"
      />

      <div className="wrap relative flex w-full flex-col justify-end pb-[max(3rem,env(safe-area-inset-bottom))] md:justify-center md:pb-0">
        <div className="max-w-[640px] md:pt-10">
          <p className="rise mb-6 inline-flex items-center gap-2.5 rounded-full border border-thistle/30 bg-ink/40 px-3.5 py-1.5 text-[0.82rem] text-thistle backdrop-blur-sm" style={{ animationDelay: "0.15s" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-amber" aria-hidden="true" />
            Pilot program · Los Angeles area
          </p>
          <h1
            id="hero-title"
            className="rise text-[clamp(2.65rem,1.55rem+4.4vw,5.35rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-balance"
            style={{ animationDelay: "0.3s" }}
          >
            Know what&rsquo;s happening after&nbsp;hours.
          </h1>
          <p className="rise lede mt-6 max-w-[34rem] !text-[clamp(1.05rem,1rem+0.3vw,1.22rem)] !text-[#d4cddc]" style={{ animationDelay: "0.45s" }}>
            Nox Security is building AI-assisted camera monitoring that helps Los Angeles–area businesses spot
            activity and review it quickly.
          </p>
          <div className="rise mt-9 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "0.6s" }}>
            <a href="#pilot" className="btn btn-primary">
              Request a pilot
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#demo" className="btn btn-ghost">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M5 3.5v9l7-4.5-7-4.5Z" fill="currentColor" />
              </svg>
              Try the demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
