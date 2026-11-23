import { HOME_HREF } from "@/lib/routes";

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-12 text-xl font-semibold tracking-[-0.015em] text-paper sm:text-2xl">{children}</h2>
);

export function PrivacyContent() {
  return (
    <article className="wrap max-w-[760px] pb-24 pt-32 sm:pt-40">
      <p className="eyebrow">Privacy</p>
      <h1 className="mt-4 text-[clamp(2.2rem,1.6rem+2.4vw,3.4rem)] font-semibold leading-[1.04] tracking-[-0.035em]">
        Website privacy notice
      </h1>
      <p className="mt-4 text-sm text-dim">Effective November 23, 2026</p>
      <div className="mt-8 space-y-4 text-[1.04rem] leading-relaxed text-mist [&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-paper [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        <p>
          This notice explains what Nox Security collects through this website and how we use it. It covers the website
          and its pilot request form only. It does not describe a monitoring service agreement; any pilot would be
          covered by separate terms.
        </p>

        <H>What we collect</H>
        <p>When you submit the pilot request form, we receive:</p>
        <ul>
          <li>Your name, work email, business name, and city</li>
          <li>Your property type and approximate number of cameras</li>
          <li>Your camera or recorder brand, if you choose to share it</li>
          <li>Any notes you write about what you want to monitor</li>
          <li>The time of submission and your browser&rsquo;s user-agent string</li>
        </ul>
        <p>
          The form does not accept video, images, or other file uploads, and we ask you not to include passwords or
          camera login details.
        </p>

        <H>How we use it</H>
        <p>
          We use form submissions only to respond to your pilot request, evaluate whether your property and camera
          setup are a fit, and contact you about the pilot. We do not sell your information or use it for third-party
          advertising.
        </p>

        <H>How it is delivered and stored</H>
        <p>
          When you submit the form, our server checks the details and forwards them to Nox through a delivery service
          we configure, such as an email provider or a workflow tool, so our team can reply. Those providers process
          the information on our behalf. We keep pilot requests for as long as needed to respond and manage the pilot
          conversation, and delete them when they are no longer needed.
        </p>

        <H>Cookies and analytics</H>
        <p>
          This website does not use advertising cookies or third-party analytics. Like most websites, our hosting
          provider may keep standard server logs (such as IP address, browser type, and pages requested) for security
          and reliability.
        </p>

        <H>Your choices</H>
        <p>
          You can ask us to access, correct, or delete the information you submitted. Reply to any email we send you
          about your pilot request and we&rsquo;ll take care of it. California residents may have additional rights
          under the California Consumer Privacy Act.
        </p>

        <H>Changes</H>
        <p>If we change how the website handles information, we&rsquo;ll update this page and its effective date.</p>
      </div>
      <a href={HOME_HREF} className="btn btn-ghost mt-14">
        ← Back to Nox Security
      </a>
    </article>
  );
}
