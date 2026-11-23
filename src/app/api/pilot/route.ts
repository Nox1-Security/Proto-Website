import { pilotSchema, flattenErrors, type SubmitResult } from "@/lib/pilot-schema";
import { configuredChannels, deliverLead, missingSetup } from "@/lib/deliver-lead";

const json = (body: SubmitResult, status: number) => Response.json(body, { status });

// Best-effort rate limit (per server instance). Use your host's firewall for stronger protection.
const hits = new Map<string, number[]>();
function limited(key: string, max = 5, windowMs = 10 * 60_000) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}

// Fallback for browsers without JavaScript: the form posts here directly and gets a plain page back.
function htmlPage(result: SubmitResult, status: number) {
  const ok = result.ok;
  const msg = ok
    ? "Thanks. We received your pilot request and will reply by email."
    : result.code === "validation"
      ? "Some required fields were missing or invalid. Please go back and check the form."
      : result.message;
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${ok ? "Request received" : "Request not sent"} | Nox Security</title></head><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0D0B12;color:#F5F1F8;font:17px/1.6 system-ui,sans-serif;padding:24px"><main style="max-width:520px"><h1 style="font-size:28px;letter-spacing:-.02em">${ok ? "Request received." : "Your request was not sent."}</h1><p style="color:#B9B1C4">${msg}</p><p><a href="/#pilot" style="color:#C9A9D8">Back to Nox Security</a></p></main></body></html>`;
  return new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function POST(request: Request) {
  const type = request.headers.get("content-type") ?? "";
  const isForm = type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data");
  if (!type.includes("application/json") && !isForm) {
    return json({ ok: false, code: "validation", message: "Unsupported request." }, 415);
  }
  const reply = (body: SubmitResult, status: number) => (isForm ? htmlPage(body, status) : json(body, status));
  if (Number(request.headers.get("content-length") ?? 0) > 10_000) {
    return reply({ ok: false, code: "validation", message: "That request is too large." }, 413);
  }
  let data: unknown;
  try {
    if (isForm) {
      const fd = await request.formData();
      const o: Record<string, unknown> = {};
      for (const [k, v] of fd.entries()) if (typeof v === "string") o[k] = v;
      o.setupUnsure = fd.get("setupUnsure") === "on";
      data = o;
    } else {
      const raw = await request.text();
      if (raw.length > 10_000) {
        return reply({ ok: false, code: "validation", message: "That request is too large." }, 413);
      }
      data = JSON.parse(raw);
    }
  } catch {
    return reply({ ok: false, code: "validation", message: "We couldn't read that request." }, 400);
  }

  const parsed = pilotSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors = flattenErrors(parsed.error);
    if (fieldErrors.website) {
      return reply({ ok: false, code: "validation", message: "Your request couldn't be submitted." }, 400);
    }
    return reply(
      { ok: false, code: "validation", message: "Please fix the highlighted fields.", fieldErrors },
      422,
    );
  }

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (limited(ip)) {
    return reply(
      { ok: false, code: "rate_limited", message: "Too many requests from this connection. Please try again later." },
      429,
    );
  }

  if (configuredChannels().length === 0) {
    console.error(`[pilot] Lead delivery is not configured. Missing: ${missingSetup().join(", ")}`);
    return reply(
      {
        ok: false,
        code: "not_configured",
        message:
          "Our request form isn't accepting submissions yet. Your details were not sent. Please try again soon.",
      },
      503,
    );
  }

  const { delivered, errors } = await deliverLead(parsed.data, {
    submittedAt: new Date().toISOString(),
    userAgent: request.headers.get("user-agent"),
  });
  if (errors.length) console.error("[pilot] Delivery errors:", errors);
  if (delivered.length === 0) {
    return reply(
      {
        ok: false,
        code: "delivery_failed",
        message: "We couldn't send your request just now. Your details were not saved. Please try again in a few minutes.",
      },
      502,
    );
  }
  return reply({ ok: true }, 200);
}
