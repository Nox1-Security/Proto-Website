"use client";

import { useId, useState } from "react";
import { PRIVACY_HREF } from "@/lib/routes";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Will Nox work with the cameras I already have?",
    a: "Possibly. Compatibility depends on your camera or recorder setup, so we check it with you during onboarding. Tell us the brand or model in the pilot form if you know it. If you're not sure, that's fine too.",
  },
  {
    q: "What do alerts look like?",
    a: "The goal is a phone notification that tells you which camera saw the activity, when it happened, and links to a short clip you can review. The demo on this page is a simulation built from sample scenes, so the exact alert format may change during the pilot.",
  },
  {
    q: "Does Nox record or monitor audio?",
    a: "No. The initial product is video-only. There is no audio monitoring.",
  },
  {
    q: "Which businesses is the pilot for?",
    a: "Commercial properties in the Los Angeles metropolitan area, such as storefronts, warehouses, offices, and commercial lots. It isn't designed for homes in this first version.",
  },
  {
    q: "What happens after I submit the form?",
    a: (
      <>
        We review your request and reply by email to set up a short call about your property and camera setup. There&rsquo;s
        no commitment, and we never ask you to upload footage through the form. Your details are used only to respond to
        your request. See our <a href={PRIVACY_HREF} className="text-thistle underline decoration-thistle/40 underline-offset-4 hover:decoration-thistle">privacy notice</a>.
      </>
    ),
  },
];

export function Faqs() {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();
  return (
    <section id="faqs" aria-labelledby="faq-title" className="scroll-mt-20 border-t border-white/[0.07] py-24 md:py-32">
      <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">FAQs</p>
          <h2 id="faq-title" className="h2 mt-4">
            Questions owners ask first.
          </h2>
          <p className="lede mt-5 max-w-sm">
            Anything else? Add it to the notes in the pilot form and we&rsquo;ll answer it on our call.
          </p>
        </div>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <h3>
                  <button
                    type="button"
                    id={`${uid}-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${uid}-a${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left text-[1.08rem] font-medium tracking-[-0.01em] transition-colors hover:text-thistle sm:text-[1.18rem]"
                  >
                    {f.q}
                    <span
                      aria-hidden="true"
                      className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${isOpen ? "border-thistle bg-thistle/15" : "border-white/20"}`}
                    >
                      <span className="absolute h-px w-3 bg-current" />
                      <span className={`absolute h-3 w-px bg-current transition-transform duration-200 ${isOpen ? "scale-y-0" : ""}`} />
                    </span>
                  </button>
                </h3>
                <div
                  id={`${uid}-a${i}`}
                  role="region"
                  aria-labelledby={`${uid}-q${i}`}
                  hidden={!isOpen}
                  className="pb-6 pr-12 text-[1.02rem] leading-relaxed text-mist"
                >
                  {f.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
