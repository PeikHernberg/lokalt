import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  isLocale,
  localeAlternates,
  absoluteUrl,
  localePath,
  SITE_LAST_UPDATED,
  SITE_LAST_UPDATED_LABEL,
  type Locale,
} from "@/lib/site-config";

interface PageCopy {
  back: string;
  heading: string;
  description: string;
}

// Title and description reuse the text already on this page (previously
// shown stacked in all three languages on a single /om route).
const META: Record<Locale, PageCopy> = {
  sv: {
    back: "← Tillbaka",
    heading: "Om tjänsten",
    description:
      "Lokalt är ett oberoende, ideellt verktyg. Det är inte en officiell tjänst från Helsingfors stad och drivs inte av staden.",
  },
  fi: {
    back: "← Takaisin",
    heading: "Tietoa palvelusta",
    description:
      "Lokalt on riippumaton, ei-kaupallinen työkalu. Se ei ole Helsingin kaupungin virallinen palvelu.",
  },
  en: {
    back: "← Back",
    heading: "About the service",
    description:
      "Lokalt is an independent, non-commercial tool. It is not an official service of the City of Helsinki and is not run by the city.",
  },
};

const SOURCE_LINK_CLASS = "text-petrol underline underline-offset-4";

function SourceLink() {
  return (
    <a
      href="https://paatokset.hel.fi"
      className={SOURCE_LINK_CLASS}
      target="_blank"
      rel="noopener noreferrer"
    >
      paatokset.hel.fi
    </a>
  );
}

function Body({ locale }: { locale: Locale }) {
  if (locale === "sv") {
    return (
      <>
        <p>
          <strong>Lokalt</strong> är ett oberoende, ideellt verktyg. Det är{" "}
          <strong>inte</strong> en officiell tjänst från Helsingfors stad och drivs inte
          av staden.
        </p>
        <p>
          Alla uppgifter om organ och beslutsfattare kommer från stadens offentliga
          beslutssidor på <SourceLink />. Varje kort visar en källänk så att du själv kan
          kontrollera uppgifterna.
        </p>
        <p>
          Verktyget använder en AI-modell för att gissa vilket organ som är ansvarigt och
          för att skriva ett utkast till mejl. <strong>AI:n kan ha fel.</strong> Den
          väljer bara bland organ vi redan har hämtat, den hittar aldrig på ett namn
          eller en e-postadress, men den kan välja fel organ. Kontrollera alltid
          källänken innan du skickar något.
        </p>
        <p>
          Vi skickar inga mejl åt dig. Knappen öppnar ditt eget e-postprogram med texten
          ifylld. Du läser, redigerar och skickar själv.
        </p>
        <p>
          Ingen inloggning, inga konton och inga cookies. Vi sparar inte vem du är. Det
          du skriver skickas till vår server och vår AI enbart för att hitta rätt organ
          och skapa ett utkast. För att kunna svara snabbare mellanlagrar vi sökningar i
          beslutsregistret en kort tid, utan koppling till dig, innan de raderas
          automatiskt.
        </p>
      </>
    );
  }

  if (locale === "fi") {
    return (
      <>
        <p>
          <strong>Lokalt</strong> on riippumaton, ei-kaupallinen työkalu. Se{" "}
          <strong>ei ole</strong> Helsingin kaupungin virallinen palvelu.
        </p>
        <p>
          Kaikki tiedot toimielimistä ja päättäjistä ovat peräisin kaupungin julkisilta
          päätössivuilta osoitteesta <SourceLink />. Jokaisessa kortissa on lähdelinkki,
          jotta voit tarkistaa tiedot itse.
        </p>
        <p>
          Työkalu käyttää tekoälyä oikean toimielimen valintaan ja
          sähköpostiluonnoksen kirjoittamiseen. <strong>Tekoäly voi erehtyä.</strong> Se
          valitsee vain ennalta kokoamistamme toimielimistä, se ei koskaan keksi nimeä
          tai sähköpostiosoitetta, mutta se voi valita väärän toimielimen. Tarkista aina
          lähdelinkki ennen lähettämistä.
        </p>
        <p>
          Emme lähetä sähköposteja puolestasi. Painike avaa oman sähköpostiohjelmasi
          valmiiksi täytetyllä tekstillä. Luet, muokkaat ja lähetät sen itse.
        </p>
        <p>
          Ei kirjautumista, ei tilejä, ei evästeitä. Emme tallenna tietoa siitä, kuka
          olet. Kirjoittamasi teksti lähetetään palvelimellemme ja tekoälyllemme vain
          oikean toimielimen löytämistä ja luonnoksen laatimista varten. Nopeuttaaksemme
          vastauksia tallennamme päätösrekisteriin tehdyt haut välimuistiin lyhyeksi
          aikaa ilman yhteyttä sinuun, minkä jälkeen ne poistetaan automaattisesti.
        </p>
      </>
    );
  }

  return (
    <>
      <p>
        <strong>Lokalt</strong> is an independent, non-commercial tool. It is{" "}
        <strong>not</strong> an official service of the City of Helsinki and is not run
        by the city.
      </p>
      <p>
        All information about bodies and decision-makers comes from the city&apos;s
        public decision pages at <SourceLink />. Every card shows a source link so you
        can check the details yourself.
      </p>
      <p>
        The tool uses an AI model to guess which body is responsible and to write a
        draft email. <strong>The AI can be wrong.</strong> It only picks from bodies
        we&apos;ve already gathered, it never invents a name or an email address, but it
        can pick the wrong body. Always check the source link before sending anything.
      </p>
      <p>
        We never send emails on your behalf. The button opens your own email app with
        the text filled in. You read it, edit it, and send it yourself.
      </p>
      <p>
        No login, no accounts, and no cookies. We don&apos;t store who you are. What you
        write is sent to our server and our AI only to find the right body and create a
        draft. To answer faster, we briefly cache searches of the decisions register,
        with no link to you, before they&apos;re automatically deleted.
      </p>
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const meta = META[locale];
  return {
    title: `${meta.heading} | Lokalt`,
    description: meta.description,
    alternates: localeAlternates(locale, "/om"),
  };
}

export default async function OmPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const meta = META[locale];

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: meta.heading,
    description: meta.description,
    url: absoluteUrl(localePath(locale, "/om")),
    inLanguage: locale,
    dateModified: SITE_LAST_UPDATED,
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <Link href={`/${locale}/app`} className="text-sm text-petrol underline underline-offset-4">
        {meta.back}
      </Link>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold text-petrol">{meta.heading}</h1>
        <span className="text-xs text-ink/55">{SITE_LAST_UPDATED_LABEL[locale]}</span>
      </div>

      <section className="mt-6 space-y-3 text-[15px] leading-relaxed">
        <Body locale={locale} />
      </section>
    </main>
  );
}
