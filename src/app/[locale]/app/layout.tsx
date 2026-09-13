import type { Metadata } from "next";
import { isLocale, localeAlternates, type Locale } from "@/lib/site-config";

// Title and description reuse the tool's own on-page copy (i18n askHeading /
// tagline) per locale, rather than inventing new text.
const META: Record<Locale, { title: string; description: string }> = {
  sv: {
    title: "Vad gäller din fråga? | Lokalt",
    description:
      "Skriv ett problem i din vardag. Vi visar vem i Helsingfors som bestämmer om det och hjälper dig skriva ett mejl.",
  },
  fi: {
    title: "Mitä asiasi koskee? | Lokalt",
    description:
      "Kirjoita arjen ongelma. Näytämme, kuka Helsingissä siitä päättää, ja autamme sinua kirjoittamaan sähköpostin.",
  },
  en: {
    title: "What's your question about? | Lokalt",
    description:
      "Describe an everyday problem. We'll show you who in Helsinki decides on it and help you write an email.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const meta = META[locale];
  return {
    title: meta.title,
    description: meta.description,
    alternates: localeAlternates(locale, "/app"),
  };
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
