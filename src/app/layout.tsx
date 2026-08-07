import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lokalt: hitta rätt beslutsfattare i Helsingfors",
  description:
    "Ett oberoende verktyg som hjälper Helsingforsbor att hitta vilket organ som beslutar om en fråga och skriva ett mejl. Oberoende tjänst, inte officiell.",
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#4c6c95",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
