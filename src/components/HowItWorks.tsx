const STEPS = [
  {
    title: "Check camera compatibility",
    body: "Tell us what cameras or recorder you already use.",
    icon: (
      <path d="M4 9.5A2.5 2.5 0 0 1 6.5 7H17l4-2.5v11L17 13H6.5A2.5 2.5 0 0 1 4 10.5v-1Zm5 4.5-1.5 5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "Choose what to monitor",
    body: "Identify areas and times that matter to your business, such as a back entrance after closing.",
    icon: (
      <>
        <rect x="3.5" y="4.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="10" width="7" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 1.6" />
        <path d="M6.5 8h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Review the alert",
    body: "Preview how an event notification could give you the camera location, time, and a clip to review.",
    icon: (
      <>
        <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="8.5" y="7" width="7" height="4" rx="1" fill="currentColor" opacity="0.9" />
        <path d="M10.5 18.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-20 border-y border-white/[0.07] bg-ink-2 py-24 md:py-32">
      <div className="wrap grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">How it works</p>
          <h2 id="how-title" className="h2 mt-4">
            Starts with the cameras you already have.
          </h2>
          <p className="lede mt-5 max-w-md">
            The pilot is built around your current setup and the parts of your property you actually worry about.
          </p>
          <a href="#pilot" className="btn btn-ghost mt-8">
            Check if your setup fits
          </a>
        </div>

        <ol className="relative">
          <span aria-hidden="true" className="absolute bottom-8 left-[27px] top-8 w-px bg-gradient-to-b from-thistle/60 via-thistle/25 to-transparent" />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative flex gap-6 pb-12 last:pb-0 sm:gap-8">
              <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-thistle/40 bg-ink text-thistle">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {s.icon}
                </svg>
              </span>
              <div className="min-w-0 pt-1.5">
                <p className="text-sm text-dim">Step {i + 1}</p>
                <h3 className="mt-1 text-[1.4rem] font-semibold tracking-[-0.02em] sm:text-2xl">{s.title}</h3>
                <p className="mt-2.5 max-w-[34rem] text-[1.02rem] leading-relaxed text-mist">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
