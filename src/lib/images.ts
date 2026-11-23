import { IMG } from "./routes";

/** Rendered scene imagery (generated for Nox; swap for real photography any time). */
export const HERO = {
  wide: { w: 2400, h: 1350, widths: [960, 1600, 2400], name: "hero-camera-wide" },
  tall: { w: 1200, h: 2000, widths: [640, 1200], name: "hero-camera-tall" },
  // Lens position as a fraction of the image (x, y) and radius as a fraction of width.
  lensWide: { x: 0.6866, y: 0.3338, r: 0.0269 },
  lensTall: { x: 0.59, y: 0.2549, r: 0.0397 },
  alt: "A matte charcoal security camera mounted high on the corner of a storefront at dusk, angled down toward the entrance.",
};

export const srcset = (name: string, widths: number[], ext: string) =>
  widths.map((w) => `${IMG}/${name}-${w}.${ext} ${w}w`).join(", ");

export const img = (file: string) => `${IMG}/${file}`;
