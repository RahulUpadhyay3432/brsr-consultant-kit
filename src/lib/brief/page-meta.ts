// Shared OG/Twitter meta fetcher: pulls an image, description, and title from a
// public article's <head> for better grounding + a nicer card. SSRF-guarded,
// real-UA, 5s timeout, reads at most 50KB of HTML. (Adapted from Kapyn.)
import "server-only";
import { isSafePublicUrl } from "./url-guard";

export type PageMeta = { imageUrl: string | null; description: string | null; title: string | null };
const EMPTY: PageMeta = { imageUrl: null, description: null, title: null };

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;|&#x27;/g, "'")
    .replace(/&nbsp;/g, " ").trim();
}

function extractMeta(html: string, property: string, nameAttr = "property"): string | null {
  return (
    html.match(new RegExp(`<meta[^>]+${nameAttr}=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"))?.[1] ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${nameAttr}=["']${property}["']`, "i"))?.[1] ??
    null
  );
}

export async function fetchPageMeta(url: string): Promise<PageMeta> {
  if (!url || !isSafePublicUrl(url)) return EMPTY;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +SaakshBrief)" },
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return EMPTY;
    const reader = res.body?.getReader();
    if (!reader) return EMPTY;
    const decoder = new TextDecoder();
    let html = "";
    try {
      while (html.length < 51200) {
        const { value, done } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
      }
    } finally {
      reader.cancel().catch(() => {});
    }
    const rawImageUrl =
      extractMeta(html, "og:image") ??
      extractMeta(html, "og:image:secure_url") ??
      extractMeta(html, "twitter:image", "name") ??
      extractMeta(html, "twitter:image:src", "name") ??
      null;
    let imageUrl: string | null = null;
    if (rawImageUrl) {
      try { imageUrl = new URL(rawImageUrl, url).href; }
      catch { imageUrl = rawImageUrl.startsWith("http") ? rawImageUrl : null; }
    }
    const description =
      extractMeta(html, "og:description") ?? extractMeta(html, "twitter:description", "name") ?? null;
    const titleRaw =
      extractMeta(html, "og:title") ?? extractMeta(html, "twitter:title", "name") ?? null;
    return {
      imageUrl,
      description: description ? decodeHTMLEntities(description).slice(0, 700) : null,
      title: titleRaw ? decodeHTMLEntities(titleRaw) : null,
    };
  } catch {
    return EMPTY;
  }
}
