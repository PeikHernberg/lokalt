"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/lokalt-logo.png";

type Lang = "sv" | "fi" | "en";

interface Track {
  title: string;
  desc: string;
  tag: string;
  tagClass: string;
}

interface Limit {
  title: string;
  desc: string;
}

interface Copy {
  navPaths: string;
  cta: string;
  heroLine1: string;
  heroLine2: string;
  heroParagraph: string;
  free: string;
  notOfficial: string;
  s01Heading: string;
  step1Title: string;
  step1Example: string;
  step1Note: string;
  step2Title: string;
  step2Tag: string;
  step2Body: string;
  step2ChairLine: string;
  step2ChairBadge: string;
  source: string;
  step3Title: string;
  subjectLabel: string;
  subject: string;
  draftBody: string;
  step3Note: string;
  s02Heading: string;
  s02Lead: string;
  s02Body: string;
  s03Heading: string;
  tracks: Track[];
  s04Heading: string;
  limits: Limit[];
  ctaHeading: string;
  ctaParagraph: string;
  footerData: string;
  aboutLink: string;
  langLabel: string;
}

const COPY: Record<Lang, Copy> = {
  sv: {
    navPaths: "Fyra vägar",
    cta: "Tryck här",
    heroLine1: "Du behöver inte veta hur staden fungerar.",
    heroLine2: "Det räcker att du vet vad som är fel.",
    heroParagraph:
      "Skriv med dina egna ord. Du får veta vem i Helsingfors som bestämmer om just din fråga, och ett färdigt utkast som du ändrar och skickar själv. Du behåller kontrollen hela vägen.",
    free: "Gratis. Inget konto behövs.",
    notOfficial: "Oberoende verktyg, inte en officiell tjänst från Helsingfors stad.",
    s01Heading: "01 · Tre steg, och du är framme",
    step1Title: "Du skriver",
    step1Example: "Biblioteket i min stadsdel borde ha öppet på söndagar.",
    step1Note: "Inga formulär, inga rubriker att välja. Din egen mening räcker.",
    step2Title: "Du får veta vem som bestämmer",
    step2Tag: "→ Beslut & politik",
    step2Body: "Kultur- och fritidsnämnden",
    step2ChairLine: "Nämndens ordförande",
    step2ChairBadge: "Ordförande",
    source: "Källa: paatokset.hel.fi",
    step3Title: "Du skickar, med egna ord",
    subjectLabel: "Ämne",
    subject: "Söndagsöppet på biblioteket i [stadsdel]",
    draftBody:
      "Hej, jag bor i [stadsdel] och använder biblioteket ofta. Jag önskar att nämnden ser över söndagsöppet …",
    step3Note: "Utkastet är ditt. Ändra allt du vill innan det öppnas i din e-post.",
    s02Heading: "02 · Varför du behöver Lokalt",
    s02Lead:
      "Du märker något i din vardag. Du vet inte vem som ansvarar. Frågan hamnar hos fel instans, eller ingen alls.",
    s02Body:
      "Lokalt läser vad du beskriver och avgör om det är en driftfråga, ett politiskt beslut, ett redan fattat beslut som rör dig, eller en helt ny idé. Du behöver inte kunna skillnaden. Din fråga hamnar rätt första gången.",
    s03Heading: "03 · Fyra vägar, en fråga",
    tracks: [
      {
        title: "Drift & underhåll",
        desc: "Något är trasigt, smutsigt eller saknas på en plats, till exempel en trasig gatubelysning, klotter eller ett hål i vägen. Det här är de allra flesta ärenden.",
        tag: "→ Direkt till stadens felanmälan, inget mejl behövs",
        tagClass: "tag tag-accent",
      },
      {
        title: "Beslut & politik",
        desc: "Du vill att staden ska besluta annorlunda: bygga, satsa pengar eller ändra en regel. Det enda spåret som fortfarande går via en nämnd.",
        tag: "→ Mejl till rätt nämnd, med AI-utkast",
        tagClass: "tag tag-outline",
      },
      {
        title: "Rättsligt & personligt",
        desc: "Ett beslut som redan har fattats om dig, eller något som gäller din egen vård, behandling eller ersättning. Förklaras som en process med överklagandetider, aldrig som ett mejl till en politiker.",
        tag: "→ Rätt juridisk instans",
        tagClass: "tag tag-neutral",
      },
      {
        title: "Ny idé",
        desc: "Ett helt nytt förslag som staden inte tagit ställning till än. Passar bättre i ett deltagandespår än i ett mejl till en nämnd.",
        tag: "→ OmaStadi eller invånarinitiativ, med utkast",
        tagClass: "tag tag-outline",
      },
    ],
    s04Heading: "04 · Vad Lokalt inte gör",
    limits: [
      {
        title: "Vi skickar inga mejl åt dig",
        desc: "Knappen öppnar ditt eget e-postprogram med texten ifylld. Du läser, redigerar och skickar själv.",
      },
      {
        title: "AI:n kan ha fel",
        desc: "Varje svar har en källänk till paatokset.hel.fi. Kontrollera den innan du skickar.",
      },
      {
        title: "Din vård är aldrig ett mejl till en politiker",
        desc: "Text med hälso- eller vårduppgifter flaggas automatiskt och går alltid den lagstadgade vägen.",
      },
      {
        title: "Inget konto, ingen spårning",
        desc: "Lokalt är ett oberoende verktyg, inte en officiell tjänst från Helsingfors stad.",
      },
    ],
    ctaHeading: "Du vet redan vad som är fel.",
    ctaParagraph:
      "Resten hjälper vi dig med. Gratis, inget konto. Nämnder och kontaktuppgifter hämtas direkt från paatokset.hel.fi.",
    footerData: "Öppna data från paatokset.hel.fi",
    aboutLink: "Om tjänsten",
    langLabel: "Språk",
  },
  fi: {
    navPaths: "Neljä väylää",
    cta: "Paina tästä",
    heroLine1: "Sinun ei tarvitse tietää, miten kaupunki toimii.",
    heroLine2: "Riittää, että tiedät mikä on vialla.",
    heroParagraph:
      "Kirjoita omin sanoin. Saat tietää, kuka Helsingissä päättää juuri sinun asiastasi, ja valmiin luonnoksen, jota muokkaat ja lähetät itse. Sinä pidät ohjat koko ajan.",
    free: "Ilmainen. Ei tiliä tarvita.",
    notOfficial: "Riippumaton työkalu, ei Helsingin kaupungin virallinen palvelu.",
    s01Heading: "01 · Kolme askelta, ja olet valmis",
    step1Title: "Sinä kirjoitat",
    step1Example: "Kaupunginosani kirjaston pitäisi olla auki sunnuntaisin.",
    step1Note: "Ei lomakkeita, ei valittavia otsikoita. Oma lauseesi riittää.",
    step2Title: "Saat tietää, kuka päättää",
    step2Tag: "→ Päätökset ja politiikka",
    step2Body: "Kulttuuri- ja vapaa-aikalautakunta",
    step2ChairLine: "Lautakunnan puheenjohtaja",
    step2ChairBadge: "Puheenjohtaja",
    source: "Lähde: paatokset.hel.fi",
    step3Title: "Sinä lähetät, omin sanoin",
    subjectLabel: "Aihe",
    subject: "Kirjaston sunnuntaiaukiolo [kaupunginosassa]",
    draftBody:
      "Hei, asun [kaupunginosassa] ja käytän kirjastoa usein. Toivoisin, että lautakunta tarkastelisi sunnuntaiaukioloa …",
    step3Note: "Luonnos on sinun. Muokkaa sitä vapaasti, ennen kuin se avautuu sähköpostissasi.",
    s02Heading: "02 · Miksi tarvitset Lokaltia",
    s02Lead:
      "Huomaat jotain arjessasi. Et tiedä, kuka siitä vastaa. Asia päätyy väärälle taholle tai ei minnekään.",
    s02Body:
      "Lokalt lukee kuvauksesi ja päättelee, onko kyse ylläpitoasiasta, poliittisesta päätöksestä, jo tehdystä päätöksestä vai kokonaan uudesta ideasta. Sinun ei tarvitse tietää eroa. Asiasi löytää oikean paikan heti ensimmäisellä kerralla.",
    s03Heading: "03 · Neljä väylää, yksi kysymys",
    tracks: [
      {
        title: "Ylläpito ja huolto",
        desc: "Jokin on rikki, likainen tai puuttuu tietystä paikasta, esimerkiksi rikkinäinen katuvalo, graffiti tai kuoppa tiessä. Tämä on suurin osa asioista.",
        tag: "→ Suoraan kaupungin palautepalveluun, ei sähköpostia tarvita",
        tagClass: "tag tag-accent",
      },
      {
        title: "Päätökset ja politiikka",
        desc: "Haluat kaupungin päättävän toisin: rakentaa, käyttää rahaa tai muuttaa sääntöä. Ainoa väylä, joka kulkee edelleen lautakunnan kautta.",
        tag: "→ Sähköposti oikealle lautakunnalle, tekoälyn laatimalla luonnoksella",
        tagClass: "tag tag-outline",
      },
      {
        title: "Oikeudellinen ja henkilökohtainen",
        desc: "Sinua koskeva jo tehty päätös, tai jokin omaan hoitoosi, kohteluusi tai korvaukseesi liittyvä asia. Selitetään prosessina, jossa on valitusaikoja, ei koskaan sähköpostina poliitikolle.",
        tag: "→ Oikea oikeudellinen taho",
        tagClass: "tag tag-neutral",
      },
      {
        title: "Uusi idea",
        desc: "Kokonaan uusi ehdotus, johon kaupunki ei ole vielä ottanut kantaa. Sopii paremmin osallistumisväylään kuin sähköpostiin lautakunnalle.",
        tag: "→ OmaStadi tai kuntalaisaloite, luonnoksen kanssa",
        tagClass: "tag tag-outline",
      },
    ],
    s04Heading: "04 · Mitä Lokalt ei tee",
    limits: [
      {
        title: "Emme lähetä sähköposteja puolestasi",
        desc: "Painike avaa oman sähköpostiohjelmasi valmiiksi täytetyllä tekstillä. Sinä luet, muokkaat ja lähetät itse.",
      },
      {
        title: "Tekoäly voi erehtyä",
        desc: "Joka vastauksessa on lähdelinkki osoitteeseen paatokset.hel.fi. Tarkista se ennen lähettämistä.",
      },
      {
        title: "Hoitoasi ei koskaan lähetetä poliitikolle",
        desc: "Terveys- tai hoitotietoja sisältävä teksti merkitään automaattisesti ja ohjataan aina lakisääteiselle väylälle.",
      },
      {
        title: "Ei tiliä, ei seurantaa",
        desc: "Lokalt on riippumaton työkalu, ei Helsingin kaupungin virallinen palvelu.",
      },
    ],
    ctaHeading: "Tiedät jo, mikä on vialla.",
    ctaParagraph:
      "Autamme lopun kanssa. Ilmainen, ei tiliä. Lautakunnat ja yhteystiedot haetaan suoraan osoitteesta paatokset.hel.fi.",
    footerData: "Avointa dataa osoitteesta paatokset.hel.fi",
    aboutLink: "Tietoa palvelusta",
    langLabel: "Kieli",
  },
  en: {
    navPaths: "Four paths",
    cta: "Tap here",
    heroLine1: "You don't need to know how the city works.",
    heroLine2: "It's enough that you know what's wrong.",
    heroParagraph:
      "Write it in your own words. You'll find out who in Helsinki decides on your issue, and get a ready draft that you edit and send yourself. You stay in control the whole way.",
    free: "Free. No account needed.",
    notOfficial: "Independent tool, not an official service of the City of Helsinki.",
    s01Heading: "01 · Three steps, and you're there",
    step1Title: "You write",
    step1Example: "The library in my neighbourhood should be open on Sundays.",
    step1Note: "No forms, no categories to pick from. Your own sentence is enough.",
    step2Title: "You find out who decides",
    step2Tag: "→ Decisions & policy",
    step2Body: "Culture and Leisure Committee",
    step2ChairLine: "Committee chair",
    step2ChairBadge: "Chair",
    source: "Source: paatokset.hel.fi",
    step3Title: "You send it, in your own words",
    subjectLabel: "Subject",
    subject: "Sunday opening hours at the library in [neighbourhood]",
    draftBody:
      "Hello, I live in [neighbourhood] and use the library often. I'd like the committee to look at Sunday opening hours …",
    step3Note: "The draft is yours. Change anything you like before it opens in your email app.",
    s02Heading: "02 · Why you need Lokalt",
    s02Lead:
      "You notice something in your everyday life. You don't know who is responsible. The issue ends up with the wrong body, or none at all.",
    s02Body:
      "Lokalt reads your description and works out whether it's a maintenance issue, a political decision, a decision already made about you, or a brand-new idea. You don't need to know the difference. Your issue lands in the right place the first time.",
    s03Heading: "03 · Four paths, one question",
    tracks: [
      {
        title: "Maintenance & upkeep",
        desc: "Something is broken, dirty, or missing at a specific location, like a broken streetlight, graffiti, or a pothole. This covers the vast majority of issues.",
        tag: "→ Straight to the city's fault-report service, no email needed",
        tagClass: "tag tag-accent",
      },
      {
        title: "Decisions & policy",
        desc: "You want the city to decide differently: build something, spend money, or change a rule. The only path that still goes through a committee.",
        tag: "→ Email to the right committee, with an AI draft",
        tagClass: "tag tag-outline",
      },
      {
        title: "Legal & personal",
        desc: "A decision already made about you, or something about your own care, treatment, or compensation. Explained as a process with appeal deadlines, never as an email to a politician.",
        tag: "→ The right legal channel",
        tagClass: "tag tag-neutral",
      },
      {
        title: "New idea",
        desc: "A brand-new proposal the city hasn't yet considered. Fits better in a participation channel than an email to a committee.",
        tag: "→ OmaStadi or a residents' initiative, with a draft",
        tagClass: "tag tag-outline",
      },
    ],
    s04Heading: "04 · What Lokalt doesn't do",
    limits: [
      {
        title: "We don't send emails for you",
        desc: "The button opens your own email app with the text filled in. You read it, edit it, and send it yourself.",
      },
      {
        title: "The AI can be wrong",
        desc: "Every answer carries a source link to paatokset.hel.fi. Check it before you send.",
      },
      {
        title: "Your care is never an email to a politician",
        desc: "Text containing health or care information is flagged automatically and always goes the statutory route.",
      },
      {
        title: "No account, no tracking",
        desc: "Lokalt is an independent tool, not an official service of the City of Helsinki.",
      },
    ],
    ctaHeading: "You already know what's wrong.",
    ctaParagraph:
      "We'll help with the rest. Free, no account. Committees and contact details come straight from paatokset.hel.fi.",
    footerData: "Open data from paatokset.hel.fi",
    aboutLink: "About the service",
    langLabel: "Language",
  },
};

function Corners() {
  return (
    <>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
    </>
  );
}

function PrimaryButton({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`blueprint inline-flex items-center justify-center rounded-md bg-petrol font-medium text-white transition hover:bg-petrol-dark ${className}`}
    >
      <Corners />
      {children}
    </Link>
  );
}

export default function LandingClient() {
  const [lang, setLang] = useState<Lang>("sv");
  const c = COPY[lang];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between gap-6 border-b border-line px-6 py-5 sm:px-10">
        <Image src={logo} alt="Lokalt" priority className="h-7 w-auto" />
        <div className="flex items-center gap-5">
          <a href="#vagar" className="hidden text-sm text-ink/80 hover:text-petrol sm:inline">
            {c.navPaths}
          </a>
          <div className="flex items-center gap-1 text-sm" role="group" aria-label={c.langLabel}>
            {(["sv", "fi", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`rounded px-2 py-1 font-medium transition ${
                  lang === l ? "bg-petrol text-white" : "text-ink/55"
                }`}
                aria-pressed={lang === l}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <PrimaryButton href="/app" className="px-4 py-2 text-sm">
            {c.cta}
          </PrimaryButton>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 sm:px-10">
        {/* Hero */}
        <section className="flex flex-col gap-7 pt-16 pb-14 sm:pt-20 sm:pb-16">
          <h1 className="max-w-3xl text-[34px] font-semibold leading-[1.08] tracking-tight text-balance sm:text-6xl">
            {c.heroLine1}
            <br />
            <span className="text-petrol">{c.heroLine2}</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-ink/75">{c.heroParagraph}</p>
          <div className="flex flex-wrap items-center gap-4">
            <PrimaryButton href="/app" className="px-9 py-4 text-base">
              {c.cta}
            </PrimaryButton>
            <span className="text-sm text-ink/55">{c.free}</span>
          </div>
          <p className="max-w-lg text-xs tracking-wide text-ink/55">{c.notOfficial}</p>
        </section>

        {/* 01 · Three steps */}
        <section className="pb-16">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-petrol">{c.s01Heading}</p>
          <hr className="my-3 border-line" />
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="flex flex-col gap-3 rounded-lg border border-line bg-white p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold tracking-wider text-ink/55">01</span>
                <span className="text-lg font-semibold">{c.step1Title}</span>
              </div>
              <div className="rounded-md border border-line bg-paper px-3.5 py-3 text-sm leading-relaxed text-ink/75">
                {c.step1Example}
              </div>
              <p className="text-sm leading-relaxed text-ink/55">{c.step1Note}</p>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-line bg-white p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold tracking-wider text-ink/55">02</span>
                <span className="text-lg font-semibold">{c.step2Title}</span>
              </div>
              <div className="flex flex-col gap-2 rounded-md border border-line px-3.5 py-3">
                <span className="tag tag-accent w-fit">{c.step2Tag}</span>
                <div className="text-[15px] font-semibold">{c.step2Body}</div>
                <div className="flex items-center gap-2 text-sm text-ink/75">
                  <span>{c.step2ChairLine}</span>
                  <span className="tag tag-badge">{c.step2ChairBadge}</span>
                </div>
                <span className="text-xs text-ink/55">{c.source}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-line bg-white p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold tracking-wider text-ink/55">03</span>
                <span className="text-lg font-semibold">{c.step3Title}</span>
              </div>
              <div className="flex flex-col gap-2 rounded-md border border-line px-3.5 py-3">
                <span className="text-xs tracking-wide text-ink/55">{c.subjectLabel}</span>
                <div className="text-sm font-medium">{c.subject}</div>
                <div className="my-0.5 h-px bg-line" />
                <p className="text-sm leading-relaxed text-ink/75">{c.draftBody}</p>
              </div>
              <p className="text-sm leading-relaxed text-ink/55">{c.step3Note}</p>
            </div>
          </div>
        </section>

        {/* 02 · Why */}
        <section className="pb-16">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-petrol">{c.s02Heading}</p>
          <hr className="my-3 border-line" />
          <div className="grid items-start gap-8 sm:grid-cols-2">
            <p className="text-balance text-xl font-medium leading-snug sm:text-2xl">{c.s02Lead}</p>
            <p className="text-base leading-relaxed text-ink/75">{c.s02Body}</p>
          </div>
        </section>

        {/* 03 · Four tracks */}
        <section id="vagar" className="scroll-mt-4 pb-16">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-petrol">{c.s03Heading}</p>
          <hr className="my-3 border-line" />
          <div className="mt-3 grid gap-5 sm:grid-cols-2">
            {c.tracks.map((track) => (
              <div key={track.title} className="blueprint flex flex-col gap-2 rounded-md border border-line p-5">
                <Corners />
                <div className="text-lg font-semibold text-ink">{track.title}</div>
                <p className="flex-1 text-sm leading-relaxed text-ink/75">{track.desc}</p>
                <span className={track.tagClass}>{track.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 04 · What Lokalt doesn't do */}
        <section className="pb-16">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-petrol">{c.s04Heading}</p>
          <hr className="my-3 border-line" />
          <div className="grid gap-6 sm:grid-cols-2">
            {c.limits.map((limit) => (
              <div key={limit.title} className="flex flex-col gap-1.5">
                <div className="text-[15px] font-semibold">{limit.title}</div>
                <p className="text-sm leading-relaxed text-ink/75">{limit.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="flex flex-wrap items-center justify-between gap-8 border-t border-line py-12">
          <div>
            <h3 className="text-2xl font-semibold text-ink">{c.ctaHeading}</h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink/75">{c.ctaParagraph}</p>
          </div>
          <PrimaryButton href="/app" className="whitespace-nowrap px-6 py-3.5 text-[15px]">
            {c.cta}
          </PrimaryButton>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line px-6 py-5 sm:px-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-xs text-ink/55">
          <span>{c.footerData}</span>
          <Link href="/om" className="text-petrol underline underline-offset-2">
            {c.aboutLink}
          </Link>
        </div>
      </footer>
    </div>
  );
}
