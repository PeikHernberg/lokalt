import type { Metadata } from "next";
import LandingClient from "./LandingClient";
import { isLocale, localeAlternates, type Locale } from "@/lib/site-config";
import { notFound } from "next/navigation";

// Title and description reuse the hero copy already rendered on the page in
// each language (see LandingClient's COPY) rather than inventing new text.
const META: Record<Locale, { title: string; description: string }> = {
  sv: {
    title: "Lokalt: Du behöver inte veta hur staden fungerar. Det räcker att du vet vad som är fel.",
    description:
      "Skriv med dina egna ord. Du får veta vem i Helsingfors som bestämmer om just din fråga, och ett färdigt utkast som du ändrar och skickar själv. Du behåller kontrollen hela vägen.",
  },
  fi: {
    title: "Lokalt: Sinun ei tarvitse tietää, miten kaupunki toimii. Riittää, että tiedät, mitä haluat muuttaa.",
    description:
      "Kerro asiasi omin sanoin. Me kerromme, kuka Helsingissä siitä päättää, ja kirjoitamme valmiin viestiluonnoksen. Sinä muokkaat ja lähetät sen itse omasta sähköpostistasi. Ohjat pysyvät koko ajan sinulla.",
  },
  en: {
    title: "Lokalt: You don't need to know how the city works. It's enough that you know what's wrong.",
    description:
      "Write it in your own words. You'll find out who in Helsinki decides on your issue, and get a ready draft that you edit and send yourself. You stay in control the whole way.",
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
    alternates: localeAlternates(locale),
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LandingClient lang={locale} />;
}
