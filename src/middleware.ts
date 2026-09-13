import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/site-config";

function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const preferred = acceptLanguage
    .split(",")
    .map((part) => part.trim().split(";")[0].toLowerCase().split("-")[0]);

  for (const lang of preferred) {
    if ((LOCALES as readonly string[]).includes(lang)) {
      return lang as Locale;
    }
  }
  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const locale = detectLocale(request.headers.get("accept-language"));
  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}

// Only the bare root path redirects based on Accept-Language. Everything
// else is either already locale-prefixed or handled by next.config.ts's
// permanent redirects for the old /app and /om paths.
export const config = {
  matcher: "/",
};
