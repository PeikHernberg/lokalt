import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Om tjänsten — Lokalt",
};

export default function OmPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/app" className="text-sm text-petrol underline underline-offset-4">
        ← Tillbaka
      </Link>

      <h1 className="mt-6 text-2xl font-semibold text-petrol">Om tjänsten</h1>

      <section className="mt-6 space-y-3 text-[15px] leading-relaxed">
        <p>
          <strong>Lokalt</strong> är ett oberoende, ideellt verktyg. Det är{" "}
          <strong>inte</strong> en officiell tjänst från Helsingfors stad och
          drivs inte av staden.
        </p>
        <p>
          Alla uppgifter om organ och beslutsfattare kommer från stadens
          offentliga beslutssidor på{" "}
          <a
            href="https://paatokset.hel.fi"
            className="text-petrol underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            paatokset.hel.fi
          </a>
          . Varje kort visar en källänk så att du själv kan kontrollera
          uppgifterna.
        </p>
        <p>
          Verktyget använder en AI-modell för att gissa vilket organ som är
          ansvarigt och för att skriva ett utkast till mejl.{" "}
          <strong>AI:n kan ha fel.</strong> Den väljer bara bland organ vi redan
          har hämtat — den hittar aldrig på ett namn eller en e-postadress — men
          den kan välja fel organ. Kontrollera alltid källänken innan du skickar
          något.
        </p>
        <p>
          Vi skickar inga mejl åt dig. Knappen öppnar ditt eget e-postprogram med
          texten ifylld. Du läser, redigerar och skickar själv.
        </p>
        <p>
          Ingen inloggning, inga konton, ingen spårning och inga cookies. Det du
          skriver skickas till vår server bara för att hitta rätt organ och skapa
          ett utkast.
        </p>
      </section>

      <hr className="my-8 border-line" />

      <h2 className="text-xl font-semibold text-petrol">Tietoa palvelusta</h2>
      <section className="mt-4 space-y-3 text-[15px] leading-relaxed">
        <p>
          <strong>Lokalt</strong> on riippumaton, ei-kaupallinen työkalu. Se{" "}
          <strong>ei ole</strong> Helsingin kaupungin virallinen palvelu.
        </p>
        <p>
          Kaikki tiedot toimielimistä ja päättäjistä ovat peräisin kaupungin
          julkisilta päätössivuilta osoitteesta{" "}
          <a
            href="https://paatokset.hel.fi"
            className="text-petrol underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            paatokset.hel.fi
          </a>
          . Jokaisessa kortissa on lähdelinkki, jotta voit tarkistaa tiedot itse.
        </p>
        <p>
          Työkalu käyttää tekoälyä oikean toimielimen valintaan ja
          sähköpostiluonnoksen kirjoittamiseen. <strong>Tekoäly voi erehtyä.</strong>{" "}
          Se valitsee vain ennalta kokoamistamme toimielimistä — se ei koskaan keksi nimeä
          tai sähköpostiosoitetta — mutta se voi valita väärän toimielimen.
          Tarkista aina lähdelinkki ennen lähettämistä.
        </p>
        <p>
          Emme lähetä sähköposteja puolestasi. Painike avaa oman
          sähköpostiohjelmasi valmiiksi täytetyllä tekstillä. Luet, muokkaat ja
          lähetät sen itse.
        </p>
        <p>
          Ei kirjautumista, ei tilejä, ei seurantaa, ei evästeitä. Kirjoittamasi
          teksti lähetetään palvelimellemme vain oikean toimielimen löytämistä ja
          luonnoksen laatimista varten.
        </p>
      </section>

      <hr className="my-8 border-line" />

      <h2 className="text-xl font-semibold text-petrol">About the service</h2>
      <section className="mt-4 space-y-3 text-[15px] leading-relaxed">
        <p>
          <strong>Lokalt</strong> is an independent, non-commercial tool. It is{" "}
          <strong>not</strong> an official service of the City of Helsinki and is not
          run by the city.
        </p>
        <p>
          All information about bodies and decision-makers comes from the city&apos;s
          public decision pages at{" "}
          <a
            href="https://paatokset.hel.fi"
            className="text-petrol underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            paatokset.hel.fi
          </a>
          . Every card shows a source link so you can check the details yourself.
        </p>
        <p>
          The tool uses an AI model to guess which body is responsible and to write a
          draft email. <strong>The AI can be wrong.</strong> It only picks from bodies
          we&apos;ve already gathered — it never invents a name or an email address — but
          it can pick the wrong body. Always check the source link before sending
          anything.
        </p>
        <p>
          We never send emails on your behalf. The button opens your own email app with
          the text filled in. You read it, edit it, and send it yourself.
        </p>
        <p>
          No login, no accounts, no tracking, and no cookies. What you write is sent to
          our server only to find the right body and create a draft.
        </p>
      </section>
    </main>
  );
}
