"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { NAV } from "@/lib/site";
import { HOME_HREF, sectionHref } from "@/lib/routes";

export function SiteHeader({ onHome = true }: { onHome?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const onResize = () => window.innerWidth >= 768 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const href = (id: string) => (onHome ? `#${id}` : sectionHref(id));
  const solid = scrolled || open || !onHome;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        solid
          ? "border-b border-white/[0.07] bg-ink/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <div className="wrap flex h-[68px] items-center justify-between gap-6">
        <a href={onHome ? "#top" : HOME_HREF} className="-m-2 flex items-center rounded-md p-2" aria-label="Nox Security home">
          <Logo id="logo-header" className="h-[18px] w-auto" />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={href(n.id)}
              className="rounded-full px-4 py-2 text-[0.94rem] text-mist transition-colors hover:bg-white/[0.06] hover:text-paper"
            >
              {n.label}
            </a>
          ))}
          <a href={href("pilot")} className="btn btn-primary ml-3 !min-h-[42px] !px-5 !text-[0.92rem]">
            Request a Pilot
          </a>
        </nav>

        <button
          ref={btnRef}
          type="button"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-paper hover:bg-white/[0.06] md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            {open ? (
              <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            ) : (
              <path d="M3 7h16M3 15h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-white/[0.07] bg-ink/95 backdrop-blur-xl md:hidden"
      >
        <nav aria-label="Mobile" className="wrap flex flex-col py-3">
          {NAV.map((n, i) => (
            <a
              key={n.id}
              ref={i === 0 ? firstLinkRef : undefined}
              href={href(n.id)}
              onClick={() => setOpen(false)}
              className="flex min-h-[52px] items-center border-b border-white/[0.06] text-lg text-paper"
            >
              {n.label}
            </a>
          ))}
          <a href={href("pilot")} onClick={() => setOpen(false)} className="btn btn-primary my-4 w-full">
            Request a Pilot
          </a>
        </nav>
      </div>
    </header>
  );
}
