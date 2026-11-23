import type { PilotInput, SubmitResult } from "./pilot-schema";

export async function submitPilot(data: PilotInput): Promise<SubmitResult> {
  try {
    const res = await fetch("/api/pilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = (await res.json().catch(() => null)) as SubmitResult | null;
    if (res.ok && body?.ok) return { ok: true };
    if (body && body.ok === false) return body;
    return { ok: false, code: "unknown", message: "Something went wrong on our side. Please try again in a few minutes." };
  } catch {
    return {
      ok: false,
      code: "network",
      message: "We couldn't reach the server. Check your connection and try again.",
    };
  }
}
