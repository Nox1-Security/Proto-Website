import "server-only";
import type { PilotLead } from "./pilot-schema";

/**
 * Lead delivery. Configure at least one channel with environment variables:
 *
 *   LEAD_WEBHOOK_URL   POSTs the lead as JSON (Zapier, Make, n8n, a Google Apps Script,
 *                      your CRM, or a Slack incoming webhook).
 *   RESEND_API_KEY     Sends the lead by email through Resend (https://resend.com).
 *   LEAD_TO_EMAIL      Inbox that receives pilot requests (required with RESEND_API_KEY).
 *   LEAD_FROM_EMAIL    Verified sender, e.g. "Nox Pilot <pilot@yourdomain.com>".
 *
 * If no channel is configured the API answers 503 and the form shows an error.
 * It never reports success unless a channel accepted the lead.
 */

export type Channel = "webhook" | "email";

export function configuredChannels(): Channel[] {
  const channels: Channel[] = [];
  if (process.env.LEAD_WEBHOOK_URL) channels.push("webhook");
  if (process.env.RESEND_API_KEY && process.env.LEAD_TO_EMAIL && process.env.LEAD_FROM_EMAIL) channels.push("email");
  return channels;
}

export function missingSetup(): string[] {
  const missing: string[] = [];
  if (!process.env.LEAD_WEBHOOK_URL && !process.env.RESEND_API_KEY) {
    missing.push("LEAD_WEBHOOK_URL or RESEND_API_KEY");
  }
  if (process.env.RESEND_API_KEY) {
    if (!process.env.LEAD_TO_EMAIL) missing.push("LEAD_TO_EMAIL");
    if (!process.env.LEAD_FROM_EMAIL) missing.push("LEAD_FROM_EMAIL");
  }
  return missing;
}

type Meta = { submittedAt: string; userAgent: string | null };

function summary(lead: PilotLead, meta: Meta) {
  const rows: [string, string][] = [
    ["Name", lead.name],
    ["Work email", lead.email],
    ["Business", lead.business],
    ["City", lead.city],
    ["Property type", lead.propertyType],
    ["Approx. cameras", lead.cameraCount],
    ["Camera / recorder", lead.setupUnsure ? "Not sure" : lead.cameraBrand || "—"],
    ["Wants to monitor", lead.monitor || "—"],
    ["Submitted", meta.submittedAt],
  ];
  return rows;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function withTimeout(url: string, init: RequestInit, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function sendWebhook(lead: PilotLead, meta: Meta) {
  const url = process.env.LEAD_WEBHOOK_URL!;
  const isSlack = url.includes("hooks.slack.com");
  const payload = isSlack
    ? {
        text: `New Nox pilot request from ${lead.business} (${lead.city})`,
        blocks: [
          { type: "header", text: { type: "plain_text", text: "New pilot request" } },
          {
            type: "section",
            text: { type: "mrkdwn", text: summary(lead, meta).map(([k, v]) => `*${k}:* ${v}`).join("\n") },
          },
        ],
      }
    : { type: "pilot_request", source: "website", ...lead, website: undefined, ...meta };
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.LEAD_WEBHOOK_SECRET) headers["X-Nox-Webhook-Secret"] = process.env.LEAD_WEBHOOK_SECRET;
  const res = await withTimeout(url, { method: "POST", headers, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
}

async function sendEmail(lead: PilotLead, meta: Meta) {
  const rows = summary(lead, meta);
  const html = `<h2 style="font-family:sans-serif">New pilot request</h2><table style="font-family:sans-serif;border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#666;vertical-align:top">${esc(k)}</td><td style="padding:6px 0">${esc(v).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("")}</table>`;
  const res = await withTimeout("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.LEAD_FROM_EMAIL,
      to: process.env.LEAD_TO_EMAIL!.split(",").map((s) => s.trim()),
      reply_to: lead.email,
      subject: `Pilot request: ${lead.business} (${lead.city})`,
      html,
      text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text().catch(() => "")}`);
}

export async function deliverLead(lead: PilotLead, meta: Meta) {
  const channels = configuredChannels();
  const results = await Promise.allSettled(
    channels.map((c) => (c === "webhook" ? sendWebhook(lead, meta) : sendEmail(lead, meta))),
  );
  const delivered = channels.filter((_, i) => results[i].status === "fulfilled");
  const errors = results.flatMap((r, i) => (r.status === "rejected" ? [`${channels[i]}: ${String(r.reason)}`] : []));
  return { channels, delivered, errors };
}
