"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/lokalt-logo.png";

type Lang = "sv" | "fi" | "en";

interface Track {
  title: string;
  desc: string;
  tagLabel: string;
  tagClass: string;
}

interface Copy {
  fourPaths: string;
  ctaLabel: string;
  heroLine1: string;
  heroLine2: string;
  heroParagraph: string;
  free: string;
  s01Heading: string;
  s01Paragraph: string;
  s02Heading: string;
  tracks: Track[];
  s03Heading: string;
  s03Paragraph: string;
  screenshotAria: string;
  screenshotSample: string;
  screenshotTag: string;
  s04Heading: string;
  s04Paragraph: string;
  ctaHeading: string;
  ctaParagraph: string;
  footerData: string;
  aboutLink: string;
  langLabel: string;
}

const COPY: Record<Lang, Copy> = {
  sv: {
    fourPaths: "Fyra vägar",
    ctaLabel: "Prova Lokalt",
    heroLine1: "Beskriv problemet.",
    heroLine2: "Vi hittar rätt väg framåt.",
    heroParagraph:
      "Du ska inte behöva kunna stadens organisation för att bli hörd. Beskriv ditt ärende med egna ord, så visar Lokalt vart det hör hemma – felanmälan, rätt nämnd, rätt rättslig väg eller en kanal för nya idéer – och hjälper dig ta första steget.",
    free: "Gratis. Inget konto behövs.",
    s01Heading: "01 · Varför Lokalt finns",
    s01Paragraph:
      "Många invånare vet inte vem i staden som faktiskt ansvarar för deras fråga, och den hamnar ofta hos fel instans, eller ingen alls. Lokalt läser vad du beskriver och avgör om det är en driftfråga, ett politiskt beslut, ett redan fattat beslut som rör dig, eller en helt ny idé, så att ärendet hamnar rätt första gången.",
    s02Heading: "02 · Fyra vägar, en fråga",
    tracks: [
      {
        title: "Drift & underhåll",
        desc: "Något är trasigt, smutsigt eller saknas på en plats, till exempel en trasig gatubelysning, klotter eller ett hål i vägen. Det här är de allra flesta ärenden.",
        tagLabel: "→ Direkt till stadens felanmälan, inget mejl behövs",
        tagClass: "tag tag-accent",
      },
      {
        title: "Beslut & politik",
        desc: "Du vill att staden ska besluta annorlunda: bygga, satsa pengar eller ändra en regel. Det enda spåret som fortfarande går via en nämnd.",
        tagLabel: "→ Mejl till rätt nämnd, med AI-utkast",
        tagClass: "tag tag-outline",
      },
      {
        title: "Rättsligt & personligt",
        desc: "Ett beslut redan fattat om dig, eller något om din egen vård, behandling eller ersättning. Förklaras som en process med överklagandetider, aldrig som ett mejl till en politiker.",
        tagLabel: "→ Rätt juridisk instans",
        tagClass: "tag tag-neutral",
      },
      {
        title: "Ny idé",
        desc: "Ett helt nytt förslag som staden inte tagit ställning till än. Passar bättre i ett deltagandespår än i ett mejl till en nämnd.",
        tagLabel: "→ OmaStadi eller invånarinitiativ, med utkast",
        tagClass: "tag tag-outline",
      },
    ],
    s03Heading: "03 · Så ser det ut",
    s03Paragraph:
      "Skriv några meningar om vad som är fel. Lokalt visar direkt vilken väg som passar, och varför, innan du skickar något.",
    screenshotAria: "Skärmdump: fråga och AI-bedömning i Lokalt",
    screenshotSample: "Gatlyktan utanför Mannerheimvägen 12 har varit trasig i tre veckor.",
    screenshotTag: "→ Drift & underhåll",
    s04Heading: "04 · Din integritet är inbyggd, inte ett tillval",
    s04Paragraph:
      "Text som innehåller hälso- eller vårduppgifter flaggas automatiskt och går alltid den rättsliga vägen, även om frågan annars sett ut att höra hemma någon annanstans. Ditt ärende hamnar aldrig av misstag i ett mejl till en namngiven politiker.",
    ctaHeading: "Redo att beskriva ditt problem?",
    ctaParagraph:
      "Gratis, inget konto. Nämnder och kontaktuppgifter hämtas direkt från paatokset.hel.fi. Jobbar du i staden? Vi visar gärna hur ärenden routas.",
    footerData: "Öppna data från paatokset.hel.fi",
    aboutLink: "Om tjänsten",
    langLabel: "Språk",
  },
  fi: {
    fourPaths: "Neljä väylää",
    ctaLabel: "Kokeile Lokaltia",
    heroLine1: "Kuvaile ongelma.",
    heroLine2: "Me löydämme oikean väylän eteenpäin.",
    heroParagraph:
      "Sinun ei tarvitse tuntea kaupungin organisaatiota tullaksesi kuulluksi. Kuvaile asiasi omin sanoin, niin Lokalt näyttää, minne se kuuluu – palautepalveluun, oikealle lautakunnalle, oikealle oikeudelliselle väylälle tai uuden idean kanavaan – ja auttaa ottamaan ensimmäisen askeleen.",
    free: "Ilmainen. Ei tiliä tarvita.",
    s01Heading: "01 · Miksi Lokalt on olemassa",
    s01Paragraph:
      "Moni asukas ei tiedä, kuka kaupungissa oikeasti vastaa hänen asiastaan, ja se päätyy usein väärälle taholle tai ei minnekään. Lokalt lukee kuvauksesi ja päättää, onko kyse ylläpitoasiasta, poliittisesta päätöksestä, jo tehdystä päätöksestä, joka koskee sinua, vai kokonaan uudesta ideasta, jotta asia löytää oikean paikan heti ensimmäisellä kerralla.",
    s02Heading: "02 · Neljä väylää, yksi kysymys",
    tracks: [
      {
        title: "Ylläpito ja huolto",
        desc: "Jokin on rikki, likainen tai puuttuu tietystä paikasta, esimerkiksi rikkinäinen katuvalo, graffiti tai kuoppa tiessä. Tämä on suurin osa asioista.",
        tagLabel: "→ Suoraan kaupungin palautepalveluun, ei sähköpostia tarvita",
        tagClass: "tag tag-accent",
      },
      {
        title: "Päätökset ja politiikka",
        desc: "Haluat kaupungin päättävän toisin: rakentaa, käyttää rahaa tai muuttaa sääntöä. Ainoa väylä, joka kulkee edelleen lautakunnan kautta.",
        tagLabel: "→ Sähköposti oikealle lautakunnalle, tekoälyn laatimalla luonnoksella",
        tagClass: "tag tag-outline",
      },
      {
        title: "Oikeudellinen ja henkilökohtainen",
        desc: "Sinua koskeva jo tehty päätös, tai jokin omaan hoitoosi, kohteluusi tai korvaukseesi liittyvä asia. Selitetään prosessina, jossa on valitusaikoja — ei koskaan sähköpostina poliitikolle.",
        tagLabel: "→ Oikea oikeudellinen taho",
        tagClass: "tag tag-neutral",
      },
      {
        title: "Uusi idea",
        desc: "Kokonaan uusi ehdotus, johon kaupunki ei ole vielä ottanut kantaa. Sopii paremmin osallistumisväylään kuin sähköpostiin lautakunnalle.",
        tagLabel: "→ OmaStadi tai kuntalaisaloite, luonnoksen kanssa",
        tagClass: "tag tag-outline",
      },
    ],
    s03Heading: "03 · Miltä se näyttää",
    s03Paragraph:
      "Kirjoita muutama lause siitä, mikä on vialla. Lokalt näyttää heti, mikä väylä sopii ja miksi, ennen kuin lähetät mitään.",
    screenshotAria: "Kuvakaappaus: kysymys ja tekoälyn arvio Lokaltissa",
    screenshotSample: "Katuvalo Mannerheimintien 12 edessä on ollut rikki kolme viikkoa.",
    screenshotTag: "→ Ylläpito ja huolto",
    s04Heading: "04 · Yksityisyytesi on sisäänrakennettu, ei valinnainen",
    s04Paragraph:
      "Teksti, joka sisältää terveys- tai hoitotietoja, merkitään automaattisesti ja ohjataan aina oikeudelliselle väylälle, vaikka asia muuten vaikuttaisi kuuluvan jonnekin muualle. Asiasi ei koskaan päädy vahingossa sähköpostiin nimetylle poliitikolle.",
    ctaHeading: "Valmis kuvailemaan ongelmasi?",
    ctaParagraph:
      "Ilmainen, ei tiliä. Lautakunnat ja yhteystiedot haetaan suoraan osoitteesta paatokset.hel.fi. Työskenteletkö kaupungilla? Näytämme mielellämme, miten asiat reititetään.",
    footerData: "Avointa dataa osoitteesta paatokset.hel.fi",
    aboutLink: "Tietoa palvelusta",
    langLabel: "Kieli",
  },
  en: {
    fourPaths: "Four paths",
    ctaLabel: "Try Lokalt",
    heroLine1: "Describe the problem.",
    heroLine2: "We'll find the right way forward.",
    heroParagraph:
      "You shouldn't need to know how the city is organised to be heard. Describe your issue in your own words, and Lokalt shows where it belongs – the fault-report service, the right committee, the right legal route, or a channel for new ideas – and helps you take the first step.",
    free: "Free. No account needed.",
    s01Heading: "01 · Why Lokalt exists",
    s01Paragraph:
      "Many residents don't know who in the city is actually responsible for their issue, and it often ends up with the wrong body — or none at all. Lokalt reads your description and works out whether it's a maintenance issue, a political decision, a decision already made that concerns you, or a brand-new idea, so your matter lands in the right place the first time.",
    s02Heading: "02 · Four paths, one question",
    tracks: [
      {
        title: "Maintenance & upkeep",
        desc: "Something is broken, dirty, or missing at a specific location — a broken bike path, dead streetlight, graffiti, or a pothole. This covers the vast majority of issues.",
        tagLabel: "→ Straight to the city's fault-report service, no email needed",
        tagClass: "tag tag-accent",
      },
      {
        title: "Decisions & policy",
        desc: "You want the city to decide differently: build something, spend money, or change a rule. The only path that still goes through a committee.",
        tagLabel: "→ Email to the right committee, with an AI draft",
        tagClass: "tag tag-outline",
      },
      {
        title: "Legal & personal",
        desc: "A decision already made about you, or something about your own care, treatment, or compensation. Explained as a process with appeal deadlines, never as an email to a politician.",
        tagLabel: "→ The right legal channel",
        tagClass: "tag tag-neutral",
      },
      {
        title: "New idea",
        desc: "A brand-new proposal the city hasn't yet considered. Fits better in a participation channel than an email to a committee.",
        tagLabel: "→ OmaStadi or a residents' initiative, with a draft",
        tagClass: "tag tag-outline",
      },
    ],
    s03Heading: "03 · What it looks like",
    s03Paragraph:
      "Write a few sentences about what's wrong. Lokalt shows you right away which path fits, and why, before you send anything.",
    screenshotAria: "Screenshot: question and AI assessment in Lokalt",
    screenshotSample: "The streetlight outside Mannerheimintie 12 has been broken for three weeks.",
    screenshotTag: "→ Maintenance & upkeep",
    s04Heading: "04 · Your privacy is built in, not a setting",
    s04Paragraph:
      "Text containing health or care information is flagged automatically and always goes through the legal path, even if the matter would otherwise look like it belongs elsewhere. Your matter never ends up by mistake in an email to a named politician.",
    ctaHeading: "Ready to describe your problem?",
    ctaParagraph:
      "Free, no account. Committees and contact details are fetched directly from paatokset.hel.fi. Work for the city? We're happy to show how issues get routed.",
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
      <header className="flex items-center justify-between border-b border-line px-6 py-5 sm:px-10">
        <Image src={logo} alt="Lokalt" priority className="h-7 w-auto" />
        <div className="flex items-center gap-6">
          <a href="#tracks" className="hidden text-sm text-ink/80 hover:text-petrol sm:inline">
            {c.fourPaths}
          </a>
          <div className="flex items-center gap-1 text-sm" role="group" aria-label={c.langLabel}>
            {(["sv", "fi", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded px-2 py-1 ${lang === l ? "bg-petrol text-white" : "text-ink/60"}`}
                aria-pressed={lang === l}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <PrimaryButton href="/app" className="px-5 py-2.5 text-sm">
            {c.ctaLabel}
          </PrimaryButton>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 sm:px-10">
        {/* Hero */}
        <section className="pt-16 pb-14 sm:pt-20 sm:pb-16">
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-6xl">
            {c.heroLine1}
            <br />
            {c.heroLine2}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75">{c.heroParagraph}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <PrimaryButton href="/app" className="px-7 py-3.5 text-base">
              {c.ctaLabel}
            </PrimaryButton>
            <span className="text-sm text-ink/55">{c.free}</span>
          </div>
        </section>

        {/* 01 · Why */}
        <section className="pb-14">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-petrol">{c.s01Heading}</p>
          <hr className="my-3 border-line" />
          <p className="max-w-3xl text-base leading-relaxed text-ink/80">{c.s01Paragraph}</p>
        </section>

        {/* 02 · Four tracks */}
        <section id="tracks" className="scroll-mt-6 pb-16">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-petrol">{c.s02Heading}</p>
          <hr className="my-3 border-line" />
          <div className="mt-3 grid gap-5 sm:grid-cols-2">
            {c.tracks.map((track) => (
              <div key={track.title} className="blueprint flex flex-col gap-2 rounded-md border border-line p-5">
                <Corners />
                <div className="text-lg font-semibold text-ink">{track.title}</div>
                <p className="flex-1 text-sm leading-relaxed text-ink/75">{track.desc}</p>
                <span className={track.tagClass}>{track.tagLabel}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 03 · Screenshot */}
        <section className="grid gap-10 pb-16 sm:grid-cols-12 sm:items-center">
          <div className="sm:col-span-7">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-petrol">{c.s03Heading}</p>
            <hr className="my-3 border-line" />
            <p className="text-base leading-relaxed text-ink/80">{c.s03Paragraph}</p>
          </div>
          <div className="sm:col-span-5">
            <div
              className="blueprint flex flex-col gap-3 rounded-md border border-line bg-white p-5"
              role="img"
              aria-label={c.screenshotAria}
            >
              <Corners />
              <div className="rounded-md border border-line bg-paper px-3 py-2.5 text-[13px] leading-relaxed text-ink/70">
                {c.screenshotSample}
              </div>
              <div className="flex flex-col gap-2 rounded-md border border-line p-3">
                <span className="tag tag-accent w-fit">{c.screenshotTag}</span>
                <div className="h-2 w-4/5 rounded-full bg-line" />
                <div className="h-2 w-3/5 rounded-full bg-line" />
                <div className="mt-1 h-8 w-32 rounded-md bg-petrol/90" />
              </div>
            </div>
          </div>
        </section>

        {/* 04 · Privacy */}
        <section className="pb-16">
          <div className="blueprint rounded-md border border-line p-6">
            <Corners />
            <div className="text-lg font-semibold text-ink">{c.s04Heading}</div>
            <p className="mt-2 text-sm leading-relaxed text-ink/75">{c.s04Paragraph}</p>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="flex flex-wrap items-center justify-between gap-8 border-t border-line py-11">
          <div>
            <h3 className="text-2xl font-semibold text-ink">{c.ctaHeading}</h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink/75">{c.ctaParagraph}</p>
          </div>
          <PrimaryButton href="/app" className="whitespace-nowrap px-6 py-3.5 text-[15px]">
            {c.ctaLabel}
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
