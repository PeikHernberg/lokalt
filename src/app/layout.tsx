import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lokalt — hitta rätt beslutsfattare i Helsingfors",
  description:
    "Ett oberoende verktyg som hjälper Helsingforsbor att hitta vilket organ som beslutar om en fråga och skriva ett mejl. Oberoende tjänst, inte officiell.",
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
