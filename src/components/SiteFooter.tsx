import { Logo } from "./Logo";
import { NAV, SITE } from "@/lib/site";
import { PRIVACY_HREF, sectionHref } from "@/lib/routes";

export function SiteFooter({ onHome = true }: { onHome?: boolean }) {
  const href = (id: string) => (onHome ? `#${id}` : sectionHref(id));
  return (
    <footer className="border-t border-white/[0.07] bg-ink">
      <div className="wrap flex flex-col gap-10 py-14 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo id="logo-footer" className="h-5 w-auto" />
          <p className="mt-5 text-[0.95rem] text-paper">Nox Security</p>
          <p className="mt-1 text-sm text-mist">{SITE.region}</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:flex sm:gap-8">
          {NAV.map((n) => (
            <a key={n.id} href={href(n.id)} className="text-mist transition-colors hover:text-paper">
              {n.label}
            </a>
          ))}
          <a href={href("pilot")} className="text-mist transition-colors hover:text-paper">
            Request a Pilot
          </a>
          <a href={PRIVACY_HREF} className="text-mist transition-colors hover:text-paper">
            Privacy
          </a>
        </nav>
      </div>
      <div className="wrap flex flex-col gap-2 border-t border-white/[0.06] py-6 text-xs text-dim sm:flex-row sm:justify-between">
        <p>© 2026 Nox Security. All rights reserved.</p>
        <p>Demo scenes on this site are simulated.</p>
      </div>
    </footer>
  );
}
