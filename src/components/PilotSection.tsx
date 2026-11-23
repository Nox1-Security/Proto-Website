import { PilotForm } from "./PilotForm";
import { IMG } from "@/lib/routes";

export function PilotSection() {
  return (
    <section id="pilot" aria-labelledby="pilot-title" className="relative isolate scroll-mt-16 overflow-hidden py-24 md:py-32">
      <picture>
        <source type="image/avif" srcSet={`${IMG}/loading-night-1280.avif 1280w, ${IMG}/loading-night-1920.avif 1920w`} sizes="100vw" />
        <source type="image/webp" srcSet={`${IMG}/loading-night-1280.webp 1280w, ${IMG}/loading-night-1920.webp 1920w`} sizes="100vw" />
        <img
          src={`${IMG}/loading-night-1280.webp`}
          width={1920}
          height={960}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[70%_50%]"
        />
      </picture>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(13_11_18/0.95)_0%,rgb(13_11_18/0.82)_45%,rgb(13_11_18/0.55)_100%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#0d0b12_0%,transparent_18%,transparent_82%,#0d0b12_100%)]" />

      <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div className="lg:pt-6">
          <p className="eyebrow">Request a pilot</p>
          <h2 id="pilot-title" className="h2 mt-4">
            See how Nox would work on your property.
          </h2>
          <p className="lede mt-5 max-w-md">
            We&rsquo;re working with a small group of Los Angeles–area businesses on the first version. Tell us about
            your property and current cameras.
          </p>
          <ol className="mt-10 space-y-5">
            {[
              ["We review your request", "We look at your property type and camera setup."],
              ["A short call", "We reply by email to talk through compatibility and what you want to watch."],
              ["Pilot setup", "If it's a fit, we plan the cameras, areas, and hours to monitor together."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-thistle/50 text-[0.8rem] text-thistle">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-paper">{t}</p>
                  <p className="mt-1 text-[0.95rem] leading-relaxed text-mist">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="min-w-0">
          <PilotForm />
        </div>
      </div>
    </section>
  );
}
