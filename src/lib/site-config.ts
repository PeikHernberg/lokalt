export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.helppolokal.org";

export const LOCALES = ["fi", "sv", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fi";

// Single source of truth for the site's "last updated" date, used both for
// JSON-LD dateModified and the visible "Updated" line on /om and in the FAQ.
export const SITE_LAST_UPDATED = "2026-09-12";

// Same date, in the locale's own display format — kept in sync with
// SITE_LAST_UPDATED by hand, and reused verbatim wherever the page already
// shows this string (the FAQ heading on the home page and the /om page).
export const SITE_LAST_UPDATED_LABEL: Record<Locale, string> = {
  sv: "Uppdaterad 12 september 2026",
  fi: "Päivitetty 12. syyskuuta 2026",
  en: "Updated 12 September 2026",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function localePath(locale: Locale, path: string = ""): string {
  return `/${locale}${path}`;
}

export function absoluteUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

// Builds the reciprocal Metadata.alternates block (canonical + hreflang) for
// a given locale and locale-independent subpath (e.g. "" for home, "/app").
export function localeAlternates(locale: Locale, subpath: string = "") {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[l] = localePath(l, subpath);
  }
  languages["x-default"] = localePath(DEFAULT_LOCALE, subpath);

  return {
    canonical: localePath(locale, subpath),
    languages,
  };
}
