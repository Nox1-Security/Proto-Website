# Nox Security website

Marketing site for Nox Security: a one-page site with an interactive (simulated) alert demo, a pilot
request form, and a privacy page. Built with Next.js 16 (App Router), TypeScript, and Tailwind CSS v4.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in one lead-delivery option
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

Deploys as-is to Vercel or any Node host. Set the same environment variables in your host's dashboard.

## Lead delivery (required before launch)

The pilot form posts to `/api/pilot`, which validates every field on the server (Zod) and then forwards
the lead. It only shows "Request received" after a delivery channel accepts the lead. With nothing
configured, it returns `503` and the form shows an error.

| Variable | Purpose |
| --- | --- |
| `LEAD_WEBHOOK_URL` | POSTs the lead as JSON. Works with Zapier, Make, n8n, Google Apps Script, a CRM, or Slack incoming webhooks (auto-formatted). |
| `LEAD_WEBHOOK_SECRET` | Optional. Sent as `X-Nox-Webhook-Secret`. |
| `RESEND_API_KEY`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL` | Emails each lead through Resend. `LEAD_FROM_EMAIL` must use a domain verified in Resend. |
| `NEXT_PUBLIC_SITE_URL` | Your production URL, for canonical and social preview links. |

The form also has a honeypot field, a duplicate-click guard, and a simple per-IP rate limit (5 per 10 min).

## Where things live

- `src/components/` – page sections (`Hero`, `Demo`, `HowItWorks`, `WhereNoxFits`, `Faqs`, `PilotForm`, …)
- `src/app/api/pilot/route.ts` – form endpoint; `src/lib/deliver-lead.ts` – webhook / email delivery
- `src/lib/pilot-schema.ts` – form fields and validation, shared by browser and server
- `src/app/privacy/` – privacy notice (update it if you add analytics or change providers)
- `public/images/` – generated scene renders (AVIF + WebP). Replace with real photography any time,
  keeping the same file names and aspect ratios. If you swap the hero, update the lens position in
  `src/lib/images.ts` so the one-time lens reflection lines up.
- `src/app/icon.svg`, `apple-icon.png`, `favicon.ico`, `opengraph-image.jpg` – favicon and social preview

## Notes

- Demo scenes, camera names, and timestamps are fictional and labeled "Simulated demo".
- No pricing, guarantees, logos, or testimonials are included.
- Animations respect `prefers-reduced-motion`; all demo controls work with motion turned off.
