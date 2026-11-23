import { IMG } from "@/lib/routes";

const PLACES = [
  {
    title: "Storefronts",
    example: "Activity near the front door or a back entrance after closing.",
    image: "fit-storefront",
    alt: "A corner storefront at dusk with warm interior lights and a camera above the entrance.",
    pos: "50% 50%",
  },
  {
    title: "Warehouses",
    example: "Movement in a loading area or at a roll-up door overnight.",
    image: "fit-warehouse",
    alt: "A lit roll-up loading door at night with a camera and wall light above it.",
    pos: "50% 50%",
  },
  {
    title: "Offices & commercial properties",
    example: "Someone entering a restricted exterior area, like a side service door.",
    image: "fit-commercial",
    alt: "The side of a commercial building at night with a service door and storefront glazing.",
    pos: "50% 50%",
  },
];

export function WhereNoxFits() {
  return (
    <section aria-labelledby="fits-title" className="py-24 md:py-32">
      <div className="wrap">
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <div>
            <p className="eyebrow">Where Nox fits</p>
            <h2 id="fits-title" className="h2 mt-4 max-w-xl">
              Built for the places that sit empty at night.
            </h2>
          </div>
          <p className="lede max-w-md md:justify-self-end">
            The first version is for commercial properties: storefronts, warehouses, offices, and commercial lots.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {PLACES.map((p) => (
            <li key={p.title} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-2">
              <div className="relative aspect-[4/5] overflow-hidden md:aspect-[4/5]">
                <picture>
                  <source type="image/avif" srcSet={`${IMG}/${p.image}-640.avif 640w, ${IMG}/${p.image}-960.avif 960w`} sizes="(min-width: 768px) 33vw, 100vw" />
                  <source type="image/webp" srcSet={`${IMG}/${p.image}-640.webp 640w, ${IMG}/${p.image}-960.webp 960w`} sizes="(min-width: 768px) 33vw, 100vw" />
                  <img
                    src={`${IMG}/${p.image}-960.webp`}
                    width={960}
                    height={1200}
                    alt={p.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    style={{ objectPosition: p.pos }}
                  />
                </picture>
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(0deg,rgb(13_11_18/0.96)_0%,rgb(13_11_18/0.6)_32%,transparent_60%)]" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="text-xl font-semibold tracking-[-0.02em]">{p.title}</h3>
                <p className="mt-2 text-[0.97rem] leading-relaxed text-[#d4cddc]">{p.example}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
