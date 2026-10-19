import type { MetadataRoute } from "next";
import { SITE } from "@/constants/site";
import { listUpcomingWorkshops } from "@/src/domains/workshops/service";

export const revalidate = 3600;

const STATIC = [
  "", "/workshops", "/join", "/courses", "/courses/class-11", "/courses/class-12", "/courses/cuet-ug",
  "/courses/boards-cuet", "/pricing", "/about", "/contact", "/privacy-policy", "/terms", "/refund-policy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = STATIC.map((p) => ({
    url: `${SITE.url}${p}`,
    lastModified: now,
    changeFrequency: p === "/workshops" ? "daily" : "weekly",
    priority: p === "" ? 1 : p === "/workshops" || p === "/join" ? 0.9 : 0.6,
  }));
  try {
    const workshops = await listUpcomingWorkshops();
    pages.push(...workshops.map((w) => ({ url: `${SITE.url}/workshops/${w.id}`, lastModified: w.updatedAt, changeFrequency: "daily" as const, priority: 0.8 })));
  } catch (err) {
    console.error("[sitemap] workshops unavailable", err);
  }
  return pages;
}
