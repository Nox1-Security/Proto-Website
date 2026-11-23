import { SiteHeader } from "./SiteHeader";
import { Hero } from "./Hero";
import { Demo } from "./Demo";
import { HowItWorks } from "./HowItWorks";
import { WhereNoxFits } from "./WhereNoxFits";
import { Faqs } from "./Faqs";
import { PilotSection } from "./PilotSection";
import { SiteFooter } from "./SiteFooter";

export function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Demo />
        <HowItWorks />
        <WhereNoxFits />
        <Faqs />
        <PilotSection />
      </main>
      <SiteFooter />
    </>
  );
}
