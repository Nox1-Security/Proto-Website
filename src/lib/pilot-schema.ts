import { z } from "zod";

export const PROPERTY_TYPES = [
  "Storefront / retail",
  "Warehouse / industrial",
  "Office",
  "Commercial lot",
  "Mixed-use / other",
] as const;

export const CAMERA_COUNTS = ["1–4", "5–8", "9–16", "17–32", "33+", "Not sure"] as const;

const required = (label: string, max = 120) =>
  z
    .string({ error: `Enter your ${label}.` })
    .trim()
    .min(1, `Enter your ${label}.`)
    .max(max, `Keep this under ${max} characters.`);

export const pilotSchema = z.object({
  name: required("name", 100),
  email: z
    .string({ error: "Enter your work email." })
    .trim()
    .min(1, "Enter your work email.")
    .max(200, "Keep this under 200 characters.")
    .pipe(z.email("Enter a valid email address, like name@business.com.")),
  business: required("business name", 140),
  city: required("city", 80),
  propertyType: z.enum(PROPERTY_TYPES, { error: "Choose a property type." }),
  cameraCount: z.enum(CAMERA_COUNTS, { error: "Choose an approximate camera count." }),
  cameraBrand: z.string().trim().max(120, "Keep this under 120 characters.").optional().default(""),
  setupUnsure: z.boolean().optional().default(false),
  monitor: z.string().trim().max(1000, "Keep this under 1,000 characters.").optional().default(""),
  // Honeypot. Real visitors never see or fill this.
  website: z.string().max(0).optional().default(""),
});

export type PilotInput = z.input<typeof pilotSchema>;
export type PilotLead = z.output<typeof pilotSchema>;
export type PilotField = keyof PilotInput;
export type FieldErrors = Partial<Record<PilotField, string>>;

export function flattenErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as PilotField | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

export type SubmitResult =
  | { ok: true }
  | {
      ok: false;
      code: "validation" | "not_configured" | "delivery_failed" | "rate_limited" | "network" | "preview" | "unknown";
      message: string;
      fieldErrors?: FieldErrors;
    };
