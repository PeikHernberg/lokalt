import { BASE_URL, absoluteUrl, localePath, type Locale } from "@/lib/site-config";

export default function OrganizationJsonLd({ lang }: { lang: Locale }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Lokalt",
    url: BASE_URL,
    logo: absoluteUrl("/icon.png"),
    founders: [
      { "@type": "Person", name: "Peik Hernberg" },
      { "@type": "Person", name: "Daniel Vainio" },
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Lokalt",
    url: absoluteUrl(localePath(lang)),
    inLanguage: lang,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
    </>
  );
}
