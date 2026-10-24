import crypto from "crypto";
import { SITE } from "@/constants/site";

export function hashToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/** A random token for a payment link. Only its hash is stored. */
export function newPayToken(days = 7) {
  const raw = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return { raw, hash: hashToken(raw), expiresAt };
}

let warned = false;

/**
 * Absolute link to a page on this site, for emails. Uses APP_URL. A live build never links to
 * localhost: if APP_URL is missing or still points at localhost there, it uses the real domain.
 */
export function appUrl(path = "") {
  let base = process.env.APP_URL || "";
  if (process.env.NODE_ENV === "production" && (!base || /localhost|127\.0\.0\.1/.test(base))) {
    if (!warned) {
      console.warn(`[appUrl] APP_URL is ${base ? `"${base}"` : "not set"}; using ${SITE.url}. Set APP_URL in the hosting settings.`);
      warned = true;
    }
    base = SITE.url;
  }
  return `${(base || "http://localhost:3000").replace(/\/$/, "")}${path}`;
}
