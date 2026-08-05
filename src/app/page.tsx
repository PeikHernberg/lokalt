import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import logo from "../../public/lokalt-logo.png";

export const metadata: Metadata = {
  title: "Lokalt — hitta rätt beslutsfattare i Helsingfors",
  description:
    "Beskriv problemet. Lokalt läser vad du skriver och avgör vilken väg som passar: en snabb felanmälan, ett mejl till rätt nämnd, rätt instans för ett redan fattat beslut, eller rätt kanal för en ny idé.",
};

const TRACKS = [
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
];

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

const CTA_LABEL = "Prova Lokalt";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-line px-6 py-5 sm:px-10">
        <Image src={logo} alt="Lokalt" priority className="h-7 w-auto" />
        <div className="flex items-center gap-8">
          <a href="#tracks" className="hidden text-sm text-ink/80 hover:text-petrol sm:inline">
            Fyra vägar
          </a>
          <PrimaryButton href="/app" className="px-5 py-2.5 text-sm">
            {CTA_LABEL}
          </PrimaryButton>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 sm:px-10">
        {/* Hero */}
        <section className="pt-16 pb-14 sm:pt-20 sm:pb-16">
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-6xl">
            Beskriv problemet.
            <br />
            Vi hittar rätt väg framåt.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75">
            Lokalt läser vad du skriver och avgör vilken väg som passar: en snabb felanmälan, ett
            mejl till rätt nämnd, rätt instans för ett redan fattat beslut, eller rätt kanal för
            en ny idé.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <PrimaryButton href="/app" className="px-7 py-3.5 text-base">
              {CTA_LABEL}
            </PrimaryButton>
            <span className="text-sm text-ink/55">Gratis. Inget konto behövs.</span>
          </div>
        </section>

        {/* 01 · Why */}
        <section className="pb-14">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-petrol">
            01 · Varför Lokalt finns
          </p>
          <hr className="my-3 border-line" />
          <p className="max-w-3xl text-base leading-relaxed text-ink/80">
            Många invånare vet inte vem i staden som faktiskt ansvarar för deras fråga, och den
            hamnar ofta hos fel instans, eller ingen alls. Lokalt läser vad du beskriver och
            avgör om det är en driftfråga, ett politiskt beslut, ett redan fattat beslut som rör
            dig, eller en helt ny idé, så att ärendet hamnar rätt första gången.
          </p>
        </section>

        {/* 02 · Four tracks */}
        <section id="tracks" className="scroll-mt-6 pb-16">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-petrol">
            02 · Fyra vägar, en fråga
          </p>
          <hr className="my-3 border-line" />
          <div className="mt-3 grid gap-5 sm:grid-cols-2">
            {TRACKS.map((track) => (
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
            <p className="text-[13px] font-semibold uppercase tracking-wider text-petrol">
              03 · Så ser det ut
            </p>
            <hr className="my-3 border-line" />
            <p className="text-base leading-relaxed text-ink/80">
              Skriv några meningar om vad som är fel. Lokalt visar direkt vilken väg som passar,
              och varför, innan du skickar något.
            </p>
          </div>
          <div className="sm:col-span-5">
            <div
              className="blueprint flex flex-col gap-3 rounded-md border border-line bg-white p-5"
              role="img"
              aria-label="Skärmdump: fråga och AI-bedömning i Lokalt"
            >
              <Corners />
              <div className="rounded-md border border-line bg-paper px-3 py-2.5 text-[13px] leading-relaxed text-ink/70">
                Gatlyktan utanför Mannerheimvägen 12 har varit trasig i tre veckor.
              </div>
              <div className="flex flex-col gap-2 rounded-md border border-line p-3">
                <span className="tag tag-accent w-fit">→ Drift &amp; underhåll</span>
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
            <div className="text-lg font-semibold text-ink">
              04 · Din integritet är inbyggd, inte ett tillval
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink/75">
              Text som innehåller hälso- eller vårduppgifter flaggas automatiskt och går alltid
              den rättsliga vägen, även om frågan annars sett ut att höra hemma någon
              annanstans. Ditt ärende hamnar aldrig av misstag i ett mejl till en namngiven
              politiker.
            </p>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="flex flex-wrap items-center justify-between gap-8 border-t border-line py-11">
          <div>
            <h3 className="text-2xl font-semibold text-ink">Redo att beskriva ditt problem?</h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink/75">
              Gratis, inget konto. Nämnder och kontaktuppgifter hämtas direkt från
              paatokset.hel.fi. Jobbar du i staden? Vi visar gärna hur ärenden routas.
            </p>
          </div>
          <PrimaryButton href="/app" className="whitespace-nowrap px-6 py-3.5 text-[15px]">
            {CTA_LABEL}
          </PrimaryButton>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line px-6 py-5 sm:px-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-xs text-ink/55">
          <span>Öppna data från paatokset.hel.fi</span>
          <Link href="/om" className="text-petrol underline underline-offset-2">
            Om tjänsten
          </Link>
        </div>
      </footer>
    </div>
  );
}
