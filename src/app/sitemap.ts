import { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/data/blog-posts";

const BASE = "https://saaksh.co";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/start`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/features/gap-analysis`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/features/ghg-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/features/templates`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/features/collect`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/features/cbam-ccts`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/methodology`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date).toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  return [...staticRoutes, ...blogRoutes];
}
