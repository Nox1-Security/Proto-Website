"use client";

import { useRef, useState } from "react";
import {
  CAMERA_COUNTS,
  PROPERTY_TYPES,
  flattenErrors,
  pilotSchema,
  type FieldErrors,
  type PilotField,
  type PilotInput,
} from "@/lib/pilot-schema";
import { submitPilot } from "@/lib/submit-pilot";
import { PRIVACY_HREF } from "@/lib/routes";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY: PilotInput = {
  name: "",
  email: "",
  business: "",
  city: "",
  propertyType: "" as PilotInput["propertyType"],
  cameraCount: "" as PilotInput["cameraCount"],
  cameraBrand: "",
  setupUnsure: false,
  monitor: "",
  website: "",
};

const ORDER: PilotField[] = ["name", "email", "business", "city", "propertyType", "cameraCount", "cameraBrand", "monitor"];

function Req() {
  return (
    <span className="text-[0.8rem] font-normal text-thistle">
      <span aria-hidden="true">*</span>
      <span className="sr-only">(required)</span>
    </span>
  );
}

function Opt() {
  return <span className="text-[0.8rem] font-normal text-dim">Optional</span>;
}

export function PilotForm() {
  const [values, setValues] = useState<PilotInput>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const inFlight = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof PilotInput>(k: K, v: PilotInput[K]) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k as PilotField]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const focusFirstError = (errs: FieldErrors) => {
    const first = ORDER.find((k) => errs[k]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return;
    const check = pilotSchema.safeParse(values);
    if (!check.success) {
      const errs = flattenErrors(check.error);
      setErrors(errs);
      setStatus("error");
      setMessage("Please fix the highlighted fields.");
      focusFirstError(errs);
      return;
    }
    inFlight.current = true;
    setStatus("submitting");
    setMessage("");
    const res = await submitPilot(values);
    inFlight.current = false;
    if (res.ok) {
      setStatus("success");
      requestAnimationFrame(() => successRef.current?.focus());
      return;
    }
    setStatus("error");
    setMessage(res.message);
    if (res.fieldErrors) {
      setErrors(res.fieldErrors);
      focusFirstError(res.fieldErrors);
    } else {
      requestAnimationFrame(() => alertRef.current?.focus());
    }
  };

  if (status === "success") {
    return (
      <div ref={successRef} tabIndex={-1} className="rounded-3xl border border-thistle/30 bg-ink/85 p-8 backdrop-blur-xl sm:p-10" role="status">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-thistle text-ink" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="m5 11.5 4 4 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <h3 className="mt-6 text-2xl font-semibold tracking-tight">Request received.</h3>
        <p className="mt-3 leading-relaxed text-mist">
          Thanks, {values.name.split(" ")[0]}. We&rsquo;ll reply to <span className="text-paper">{values.email}</span> to set up a
          short call about {values.business}. Please don&rsquo;t send footage by email. We&rsquo;ll walk through your setup together.
        </p>
      </div>
    );
  }

  const fieldProps = (k: PilotField) => ({
    id: `pf-${k}`,
    name: k,
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `pf-${k}-err` : undefined,
  });

  const err = (k: PilotField) =>
    errors[k] ? (
      <p id={`pf-${k}-err`} className="mt-1.5 flex items-start gap-1.5 text-[0.85rem] text-danger">
        <svg width="14" height="14" viewBox="0 0 14 14" className="mt-[3px] shrink-0" aria-hidden="true"><circle cx="7" cy="7" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="M7 3.8v3.7M7 9.6v.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
        {errors[k]}
      </p>
    ) : null;

  const submitting = status === "submitting";

  return (
    <form
      ref={formRef}
      noValidate
      method="post"
      action="/api/pilot"
      onSubmit={onSubmit}
      aria-labelledby="pilot-form-title"
      aria-busy={submitting}
      className="rounded-3xl border border-white/10 bg-ink/85 p-6 shadow-[0_40px_100px_-40px_rgb(0_0_0/0.9)] backdrop-blur-xl sm:p-8"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 id="pilot-form-title" className="text-xl font-semibold tracking-tight">
          Pilot request
        </h3>
        <p className="text-xs text-dim">
          <span className="text-thistle">*</span> Required
        </p>
      </div>

      {status === "error" && message && (
        <div
          ref={alertRef}
          tabIndex={-1}
          role="alert"
          className="mt-5 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-[0.92rem] leading-relaxed text-[#ffd2d2]"
        >
          {message}
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-name" className="field-label">Name <Req /></label>
          <input {...fieldProps("name")} className="field" autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} required />
          {err("name")}
        </div>
        <div>
          <label htmlFor="pf-email" className="field-label">Work email <Req /></label>
          <input {...fieldProps("email")} type="email" inputMode="email" className="field" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} required />
          {err("email")}
        </div>
        <div>
          <label htmlFor="pf-business" className="field-label">Business name <Req /></label>
          <input {...fieldProps("business")} className="field" autoComplete="organization" value={values.business} onChange={(e) => set("business", e.target.value)} required />
          {err("business")}
        </div>
        <div>
          <label htmlFor="pf-city" className="field-label">City <Req /></label>
          <input {...fieldProps("city")} className="field" autoComplete="address-level2" placeholder="e.g. Burbank" value={values.city} onChange={(e) => set("city", e.target.value)} required />
          {err("city")}
        </div>
        <div>
          <label htmlFor="pf-propertyType" className="field-label">Property type <Req /></label>
          <select {...fieldProps("propertyType")} className="field" value={values.propertyType} onChange={(e) => set("propertyType", e.target.value as PilotInput["propertyType"])} required>
            <option value="" disabled>Select one</option>
            {PROPERTY_TYPES.map((p) => <option key={p}>{p}</option>)}
          </select>
          {err("propertyType")}
        </div>
        <div>
          <label htmlFor="pf-cameraCount" className="field-label">Approximate camera count <Req /></label>
          <select {...fieldProps("cameraCount")} className="field" value={values.cameraCount} onChange={(e) => set("cameraCount", e.target.value as PilotInput["cameraCount"])} required>
            <option value="" disabled>Select one</option>
            {CAMERA_COUNTS.map((c) => <option key={c}>{c}</option>)}
          </select>
          {err("cameraCount")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="pf-cameraBrand" className="field-label">Camera or recorder brand <Opt /></label>
          <input
            {...fieldProps("cameraBrand")}
            className="field disabled:opacity-50"
            placeholder="e.g. Hikvision NVR, Reolink, Axis"
            value={values.setupUnsure ? "" : values.cameraBrand}
            disabled={values.setupUnsure}
            onChange={(e) => set("cameraBrand", e.target.value)}
          />
          <label className="mt-2.5 inline-flex min-h-[32px] cursor-pointer items-center gap-2.5 text-[0.92rem] text-mist">
            <input
              type="checkbox"
              name="setupUnsure"
              checked={values.setupUnsure}
              onChange={(e) => set("setupUnsure", e.target.checked)}
              className="h-[18px] w-[18px] accent-thistle"
            />
            Not sure about my camera setup
          </label>
          {err("cameraBrand")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="pf-monitor" className="field-label">What do you want to monitor? <Opt /></label>
          <textarea
            {...fieldProps("monitor")}
            rows={3}
            maxLength={1000}
            className="field min-h-[96px] resize-y"
            placeholder="e.g. Back door and parking lot after we close at 9 PM"
            value={values.monitor}
            onChange={(e) => set("monitor", e.target.value)}
          />
          {err("monitor")}
        </div>
        {/* Honeypot: hidden from people and assistive tech. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
          <label htmlFor="pf-website">Website</label>
          <input id="pf-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set("website", e.target.value)} />
        </div>
      </div>

      <p className="mt-6 text-[0.85rem] leading-relaxed text-dim">
        We&rsquo;ll use these details only to respond to your pilot request and discuss your setup. We don&rsquo;t sell
        them. Please don&rsquo;t include footage or passwords. Read the{" "}
        <a href={PRIVACY_HREF} className="text-thistle underline decoration-thistle/40 underline-offset-4 hover:decoration-thistle">
          privacy notice
        </a>
        .
      </p>

      <button type="submit" disabled={submitting} className="btn btn-primary mt-6 w-full disabled:cursor-wait disabled:opacity-70 sm:w-auto">
        {submitting ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
              <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Sending request…
          </>
        ) : (
          "Request a pilot"
        )}
      </button>
      <p className="sr-only" aria-live="polite">{submitting ? "Sending your request." : ""}</p>
    </form>
  );
}
