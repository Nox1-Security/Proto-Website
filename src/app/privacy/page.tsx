import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PrivacyContent } from "@/components/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy | Nox Security",
  description: "How the Nox Security website handles information submitted through the pilot request form.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader onHome={false} />
      <main id="main">
        <PrivacyContent />
      </main>
      <SiteFooter onHome={false} />
    </>
  );
}
