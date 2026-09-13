import type { Locale } from "@/lib/site-config";

interface FaqItem {
  q: string;
  a: string;
}

// Reusable FAQPage structured data. Drop this on any page that renders a
// visible FAQ section — pass the same questions/answers shown on the page.
export default function FaqJsonLd({ lang, faq }: { lang: Locale; faq: FaqItem[] }) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
    />
  );
}
