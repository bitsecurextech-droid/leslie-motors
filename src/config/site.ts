/**
 * Centralized Leslie Motors site configuration.
 * Never hardcode contact details in components — import from here.
 * Values can be overridden with VITE_* env vars without code changes.
 */

const env = import.meta.env as Record<string, string | undefined>;

export const siteConfig = {
  name: "Leslie Motor Co.",
  shortName: "Leslie Motors",
  tagline: "Quality pre-owned vehicles, honest deals.",
  contact: {
    /** E.164 phone used for tel: links */
    phone: env["VITE_DEALERSHIP_PHONE"] ?? "+13153672420",
    /** Human readable phone */
    phoneDisplay: "+1 315-367-2420",
    /** Digits only, used for wa.me links */
    whatsapp: env["VITE_WHATSAPP_NUMBER"] ?? "13092595685",
    whatsappDisplay: "+1 309-259-5685",
    email: env["VITE_DEALERSHIP_EMAIL"] ?? "franckauto704@gmail.com",
    facebookGroupUrl:
      env["VITE_FACEBOOK_GROUP_URL"] ??
      "https://www.facebook.com/share/g/1E64vLDW5c/?mibextid=wwXIfr",
  },
} as const;

export const telHref = () => `tel:${siteConfig.contact.phone}`;

export const mailtoHref = (subject?: string, body?: string) => {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const qs = params.toString();
  return `mailto:${siteConfig.contact.email}${qs ? `?${qs}` : ""}`;
};

export const whatsappHref = (message?: string) =>
  `https://wa.me/${siteConfig.contact.whatsapp}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

export const vehicleWhatsappMessage = (v: {
  year: number;
  make: string;
  model: string;
  stock: string;
}) =>
  `Hello ${siteConfig.shortName}, I'm interested in the ${v.year} ${v.make} ${v.model}, stock #${v.stock}. Is it still available?`;
