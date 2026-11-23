export const SITE = {
  name: "Nox Security",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  title: "Nox Security | AI-assisted camera monitoring for Los Angeles businesses",
  description:
    "Nox Security is building AI-assisted camera monitoring that helps Los Angeles–area businesses spot after-hours activity and review it quickly. Request a pilot for your storefront, warehouse, office, or commercial lot.",
  region: "Serving the Los Angeles metropolitan area",
};

export const NAV = [
  { id: "how-it-works", label: "How It Works" },
  { id: "demo", label: "Demo" },
  { id: "faqs", label: "FAQs" },
] as const;
