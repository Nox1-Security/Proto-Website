// Paths used by components. The standalone preview build swaps this module out
// (see preview/vite.config.ts) so the same components work as a single page.
export const IMG = "/images";
export const HOME_HREF = "/";
export const PRIVACY_HREF = "/privacy";
export const sectionHref = (id: string) => `/#${id}`;
