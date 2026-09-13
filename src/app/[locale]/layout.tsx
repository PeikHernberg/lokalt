import type { Metadata, Viewport } from "next";
import { Karla } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { BASE_URL, LOCALES, isLocale, type Locale } from "@/lib/site-config";

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#4c6c95",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  manifest: "/site.webmanifest",
  verification: {
    google: "hzN4rhbOuVsKML5haMPMydEAOW0ipBSNLvTzExafa48",
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const lang: Locale = locale;

  return (
    <html lang={lang} className={karla.variable}>
      <body>{children}</body>
    </html>
  );
}
