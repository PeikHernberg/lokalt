import type { MetadataRoute } from "next";
import { BASE_URL, LOCALES, DEFAULT_LOCALE, absoluteUrl, localePath } from "@/lib/site-config";

const LAST_MODIFIED = new Date("2026-09-12");

const PAGES: { path: string; changeFrequency: "monthly" | "yearly"; priority: number }[] = [
  { path: "", changeFrequency: "monthly", priority: 1 },
  { path: "/app", changeFrequency: "monthly", priority: 0.9 },
  { path: "/om", changeFrequency: "yearly", priority: 0.5 },
];

// Sitemap hreflang alternates need absolute URLs, unlike page Metadata's
// alternates.languages (which is relative to metadataBase).
function absoluteLanguageAlternates(subpath: string) {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = absoluteUrl(localePath(locale, subpath));
  }
  languages["x-default"] = absoluteUrl(localePath(DEFAULT_LOCALE, subpath));
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((page) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}${localePath(locale, page.path)}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: { languages: absoluteLanguageAlternates(page.path) },
    })),
  );
}
