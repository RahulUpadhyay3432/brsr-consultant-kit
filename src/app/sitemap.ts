import { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/data/blog-posts";
import { INDUSTRY_LABELS, type IndustryType } from "@/lib/types";

const BASE = "https://saaksh.co";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/start`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/latest`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE}/community`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    // Free tools
    { url: `${BASE}/tools/audit-readiness`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/tools/xbrl-preflight`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/tools/scope3-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/tools/ppp-intensity`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/tools/wellbeing-schedule`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/tools/ghg-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/tools/materiality`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/tools/brsr-applicability`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/tools/brsr-framework-mapping`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    // Feature pages
    { url: `${BASE}/features/gap-analysis`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/features/ghg-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/features/materiality`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/features/alignment`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/features/templates`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/features/collect`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/features/cbam-ccts`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    // Conversion + trust + legal
    { url: `${BASE}/request-pro`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/methodology`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/security`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/dpa`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date).toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  // Programmatic "BRSR for <industry>" pages (one per real industry).
  const industryRoutes: MetadataRoute.Sitemap = (Object.keys(INDUSTRY_LABELS) as IndustryType[])
    .filter((k) => k !== "other")
    .map((k) => ({ url: `${BASE}/brsr-for/${k}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 }));

  return [...staticRoutes, ...blogRoutes, ...industryRoutes];
}
