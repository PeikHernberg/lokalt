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

interface FaqItem {
  q: string;
  a: string;
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
  faqHeading: string;
  faqUpdated: string;
  faq: FaqItem[];
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
    faqHeading: "Vanliga frågor",
    faqUpdated: "Uppdaterad 12 september 2026",
    faq: [
      {
        q: "Vad är Lokalt?",
        a: "Lokalt är ett gratis verktyg som listar ut vem på Helsingfors stad som ansvarar för ett problem eller en idé, och skriver ett meddelandeutkast som du själv skickar. Du beskriver saken med egna ord, och Lokalt berättar vilken sektor, nämnd eller kontaktperson som är rätt, och skriver ett utkast som du kan redigera innan du skickar.",
      },
      {
        q: "Hur fungerar Lokalt?",
        a: "Du skriver vad som är fel i en mening eller två, så som du skulle förklara det för en kompis. Lokalt avgör om det handlar om en underhållsfråga, en politisk fråga, ett juridiskt eller personligt ärende eller en helt ny idé, och visar sedan vem som ansvarar och skriver ett utkast. Du läser det, redigerar om du vill, och skickar det själv från din egen e-post.",
      },
      {
        q: "Vem kontaktar jag i Helsingfors om en trasig gatlykta, ett bullerklagomål, ett fallet träd eller en parkeringsbot?",
        a: "Det beror på ärendet, och det är precis det problemet Lokalt löser. Trasiga gatlyktor, gropar i gatan, klotter och fallna träd går via stadens vanliga felanmälningstjänst. En parkeringsbot har en egen rättelseprocess och en tidsfrist. Ett bullerklagomål som gäller en granne eller ett bygge går till en annan del av staden än buller från trafiken. Beskriv vad som är fel på Lokalt, så får du veta exakt vart det hör, med ett färdigt utkast om det behövs.",
      },
      {
        q: "Är Lokalt gratis att använda?",
        a: "Ja. Det är gratis och du behöver inte skapa något konto.",
      },
      {
        q: "Skickar Lokalt meddelandet åt mig?",
        a: "Nej. Lokalt skriver utkastet och öppnar det i ditt eget e-postprogram. Du läser, redigerar och trycker på skicka själv. Lokalt skickar aldrig något i ditt namn.",
      },
      {
        q: "Är Lokalt en officiell tjänst från Helsingfors stad?",
        a: "Nej. Lokalt är ett oberoende verktyg, inte en officiell kanal för Helsingfors stad. Det använder stadens egna publicerade beslutsdata från paatokset.hel.fi för att hänvisa dig rätt.",
      },
      {
        q: "Sparar Lokalt det jag skriver, eller följer det mig?",
        a: "Nej. Det finns inget konto och inget av det du skriver sparas. När du stänger sidan är det borta.",
      },
      {
        q: "På vilka språk fungerar Lokalt?",
        a: "Finska, svenska och engelska, så att du kan beskriva ditt ärende på det språk du är mest bekväm med.",
      },
      {
        q: "Kan Lokalt hjälpa med något personligt, till exempel en hälso- eller förmånsfråga?",
        a: "Ja, men på ett annat sätt. Om det du skriver berör din egen hälsa, vård eller dina förmåner känner Lokalt igen det och hänvisar dig till rätt officiell, lagstadgad process i stället för att skriva ett mejl till en politiker eller en nämnd.",
      },
      {
        q: "Hur exakt är Lokalt, och kan jag lita på svaret?",
        a: "Lokalt använder AI för att matcha ditt ärende med rätt kontakt, och AI kan ha fel. Varje svar länkar till sin källa på paatokset.hel.fi, så du kan kontrollera det själv innan du skickar något.",
      },
    ],
  },
  fi: {
    navPaths: "Neljä väylää",
    cta: "Aloita tästä",
    heroLine1: "Sinun ei tarvitse tietää, miten kaupunki toimii.",
    heroLine2: "Riittää, että tiedät, mitä haluat muuttaa.",
    heroParagraph:
      "Kerro asiasi omin sanoin. Me kerromme, kuka Helsingissä siitä päättää, ja kirjoitamme valmiin viestiluonnoksen. Sinä muokkaat ja lähetät sen itse omasta sähköpostistasi. Ohjat pysyvät koko ajan sinulla.",
    free: "Ilmainen. Ei rekisteröitymistä.",
    notOfficial: "Riippumaton, kehitysvaiheessa oleva palvelu. Ei Helsingin kaupungin virallinen kanava.",
    s01Heading: "01 · Kolme askelta, ei sen enempää",
    step1Title: "Kirjoita omin sanoin",
    step1Example: "Kirjaston pitäis olla auki myös sunnuntaisin.",
    step1Note: "Ei lomakkeita, ei valikoita. Yksi lause riittää.",
    step2Title: "Näet, kuka päättää",
    step2Tag: "→ Päätökset ja politiikka",
    step2Body: "Kulttuuri- ja vapaa-aikalautakunta",
    step2ChairLine: "Lautakunnan puheenjohtaja",
    step2ChairBadge: "",
    source: "Lähde: paatokset.hel.fi",
    step3Title: "Lähetä omalla nimelläsi",
    subjectLabel: "Aihe",
    subject: "Kirjaston aukioloajat [kaupunginosa]ssa",
    draftBody:
      "Hei, asun [kaupunginosassa] ja käytän lähikirjastoa viikoittain. Toivoisin, että lautakunta harkitsisi sunnuntaiaukioloa…",
    step3Note: "Luonnos avautuu omassa sähköpostiohjelmassasi. Muokkaa sitä vapaasti ennen kuin lähetät.",
    s02Heading: "02 · Miksi Lokalt on olemassa",
    s02Lead:
      "Huomaat arjessasi jotain, mikä pitäisi korjata. Et tiedä, kenelle asia kuuluu. Se päätyy väärään osoitteeseen tai ei minnekään.",
    s02Body:
      "Lokalt lukee tekstisi ja tunnistaa, onko kyse huoltoasiasta, poliittisesta päätöksestä, jo tehdystä päätöksestä vai kokonaan uudesta ideasta. Sinun ei tarvitse tuntea eroa. Asiasi menee oikeaan osoitteeseen jo ensimmäisellä kerralla.",
    s03Heading: "03 · Neljä väylää, yksi kysymys",
    tracks: [
      {
        title: "Korjaus ja kunnossapito",
        desc: "Jokin on rikki, sotkuinen tai puuttuu tietystä paikasta: sammunut katuvalo, töhry seinässä tai kuoppa kadussa. Suurin osa asioista on tätä.",
        tag: "→ Suoraan kaupungin palautepalveluun. Sähköpostia ei tarvita.",
        tagClass: "tag tag-accent",
      },
      {
        title: "Päätökset ja politiikka",
        desc: "Haluat, että kaupunki päättää toisin: rakentaa jotain, kohdentaa rahaa uudelleen tai muuttaa sääntöä. Tämä on ainoa väylä, joka kulkee lautakunnan kautta.",
        tag: "→ Sähköposti oikealle lautakunnalle, luonnos valmiina.",
        tagClass: "tag tag-outline",
      },
      {
        title: "Oikeudellinen ja henkilökohtainen",
        desc: "Sinua itseäsi koskeva päätös tai asia, joka liittyy omaan palveluusi, kohteluusi tai korvaukseesi. Näissä on määräaikoja ja oma muutoksenhakutiensä, joten selitämme prosessin vaihe vaiheelta. Poliitikolle näitä ei koskaan lähetetä.",
        tag: "→ Oikea viranomainen tai muutoksenhakutie.",
        tagClass: "tag tag-neutral",
      },
      {
        title: "Uusi idea",
        desc: "Kokonaan uusi ehdotus, johon kaupunki ei ole vielä ottanut kantaa. Tällainen etenee paremmin osallistumiskanavassa kuin sähköpostina lautakunnalle.",
        tag: "→ OmaStadi tai kuntalaisaloite, luonnos mukana.",
        tagClass: "tag tag-outline",
      },
    ],
    s04Heading: "04 · Mitä Lokalt ei tee",
    limits: [
      {
        title: "Emme lähetä sähköposteja puolestasi",
        desc: "Painike avaa sähköpostiohjelmasi, teksti valmiina. Sinä luet, muokkaat ja painat lähetä.",
      },
      {
        title: "Tekoäly voi erehtyä",
        desc: "Jokaisessa vastauksessa on linkki lähteeseen osoitteessa paatokset.hel.fi. Tarkista se ennen kuin lähetät.",
      },
      {
        title: "Terveysasiasi eivät päädy poliitikolle",
        desc: "Jos teksti sisältää terveyteen tai hoitoon liittyviä tietoja, se tunnistetaan automaattisesti ja ohjataan aina viralliselle, lakisääteiselle väylälle.",
      },
      {
        title: "Ei tiliä, ei seurantaa",
        desc: "Emme pyydä tunnistautumista emmekä tallenna kirjoittamaasi. Lokalt on riippumaton työkalu, ei Helsingin kaupungin virallinen palvelu.",
      },
    ],
    ctaHeading: "Tiedät jo, mitä pitäisi muuttaa.",
    ctaParagraph:
      "Me hoidamme loput. Ilmainen, ei rekisteröitymistä. Lautakunnat ja yhteystiedot haetaan suoraan osoitteesta paatokset.hel.fi.",
    footerData: "Avoin data: paatokset.hel.fi",
    aboutLink: "Tietoa palvelusta",
    langLabel: "Kieli",
    faqHeading: "Usein kysytyt kysymykset",
    faqUpdated: "Päivitetty 12. syyskuuta 2026",
    faq: [
      {
        q: "Mikä Lokalt on?",
        a: "Lokalt on ilmainen työkalu, joka selvittää, kuka Helsingin kaupungilla vastaa ongelmastasi tai ideastasi, ja kirjoittaa valmiin viestiluonnoksen, jonka lähetät itse. Kerrot asiasi omin sanoin, ja Lokalt kertoo, mikä toimiala, lautakunta tai yhteyshenkilö on oikea, ja kirjoittaa luonnoksen, jota voit muokata ennen lähettämistä.",
      },
      {
        q: "Miten Lokalt toimii?",
        a: "Kirjoitat parilla lauseella, mikä on vialla, samaan tapaan kuin selittäisit asian kaverille. Lokalt tunnistaa, onko kyse kunnossapitoasiasta, poliittisesta kysymyksestä, oikeudellisesta tai henkilökohtaisesta asiasta vai kokonaan uudesta ideasta, ja näyttää sitten, kenelle asia kuuluu, sekä kirjoittaa viestiluonnoksen. Luet sen, muokkaat halutessasi ja lähetät sen itse omasta sähköpostistasi.",
      },
      {
        q: "Keneen otan Helsingissä yhteyttä, jos katuvalo on sammunut, naapurista kuuluu melua, puu on kaatunut tai sain pysäköintivirhemaksun?",
        a: "Se riippuu asiasta, ja juuri sen ongelman Lokalt ratkaisee. Sammuneet katuvalot, kuopat kadussa, töhryt ja kaatuneet puut menevät kaupungin tavalliseen palautepalveluun. Pysäköintivirhemaksulla on oma oikaisuvaatimusprosessinsa ja määräaikansa. Naapurin tai työmaan melua koskeva ilmoitus menee kaupungin eri osaan kuin liikenteen melu. Kerro Lokaltissa, mikä on vialla, niin saat tietää tarkalleen, minne asia kuuluu, ja valmiin viestiluonnoksen, jos sellaista tarvitaan.",
      },
      {
        q: "Onko Lokalt ilmainen?",
        a: "Kyllä. Se on ilmainen, eikä sinun tarvitse rekisteröityä.",
      },
      {
        q: "Lähettääkö Lokalt viestin puolestani?",
        a: "Ei. Lokalt kirjoittaa luonnoksen ja avaa sen omassa sähköpostiohjelmassasi. Luet, muokkaat ja painat lähetä itse. Lokalt ei koskaan lähetä mitään puolestasi.",
      },
      {
        q: "Onko Lokalt Helsingin kaupungin virallinen palvelu?",
        a: "Ei. Lokalt on riippumaton työkalu, ei Helsingin kaupungin virallinen kanava. Se käyttää kaupungin omaa julkista päätöksentekodataa osoitteesta paatokset.hel.fi ja ohjaa sinut oikeaan paikkaan.",
      },
      {
        q: "Tallentaako Lokalt kirjoittamani tai seuraako se minua?",
        a: "Ei. Tiliä ei ole, eikä kirjoittamaasi tallenneta. Kun suljet sivun, teksti on poissa.",
      },
      {
        q: "Millä kielillä Lokalt toimii?",
        a: "Suomeksi, ruotsiksi ja englanniksi, joten voit kuvailla asiasi sillä kielellä, joka tuntuu sinulle luontevimmalta.",
      },
      {
        q: "Voiko Lokalt auttaa henkilökohtaisessa asiassa, esimerkiksi terveyteen tai etuuksiin liittyvässä?",
        a: "Kyllä, mutta eri tavalla. Jos kirjoittamasi koskee omaa terveyttäsi, hoitoasi tai etuuksiasi, Lokalt tunnistaa sen ja ohjaa sinut oikealle viralliselle, lakisääteiselle väylälle sen sijaan, että kirjoittaisi sähköpostin poliitikolle tai lautakunnalle.",
      },
      {
        q: "Kuinka tarkka Lokalt on, ja voinko luottaa vastaukseen?",
        a: "Lokalt käyttää tekoälyä asiasi yhdistämiseen oikeaan yhteystietoon, ja tekoäly voi erehtyä. Jokaisessa vastauksessa on linkki lähteeseen osoitteessa paatokset.hel.fi, joten voit tarkistaa sen itse ennen kuin lähetät mitään.",
      },
    ],
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
    faqHeading: "Common questions",
    faqUpdated: "Updated 12 September 2026",
    faq: [
      {
        q: "What is Lokalt?",
        a: "Lokalt is a free tool that figures out who at the City of Helsinki is responsible for a problem or idea, and drafts a message you can send yourself. You describe the issue in your own words, and Lokalt tells you the right department, board, or contact, and writes a draft you can edit before sending.",
      },
      {
        q: "How does Lokalt work?",
        a: "You write what's wrong in a sentence or two, like you would explain it to a friend. Lokalt works out whether it's a maintenance issue, a policy question, a legal or personal matter, or a new idea, then shows you who's responsible and drafts a message. You read it, edit it if you want, and send it yourself from your own email.",
      },
      {
        q: "Who do I contact in Helsinki about a broken streetlight, a noise complaint, a fallen tree, or a parking fine?",
        a: "It depends on the issue, which is exactly the problem Lokalt solves. Broken streetlights, potholes, graffiti, and fallen trees go through the city's regular fault-report service. A parking fine has its own appeal process and a deadline. A noise complaint about a neighbor or a building site goes to a different part of the city than noise from traffic. Describe what's wrong on Lokalt and it tells you exactly where it goes, with a draft message ready if one is needed.",
      },
      {
        q: "Is Lokalt free to use?",
        a: "Yes. It's free, and you don't need to create an account.",
      },
      {
        q: "Does Lokalt send the message for me?",
        a: "No. Lokalt drafts the message and opens it in your own email program. You read it, edit it, and press send yourself. Lokalt never sends anything on your behalf.",
      },
      {
        q: "Is Lokalt an official City of Helsinki service?",
        a: "No. Lokalt is an independent tool, not an official channel of the City of Helsinki. It uses the city's own published decision-making data, from paatokset.hel.fi, to point you to the right place.",
      },
      {
        q: "Does Lokalt store what I write, or track me?",
        a: "No. There's no account and nothing you write is saved. Once you close the page, it's gone.",
      },
      {
        q: "What languages does Lokalt work in?",
        a: "Finnish, Swedish, and English, so you can describe your concern in whichever one you're most comfortable with.",
      },
      {
        q: "Can Lokalt help with something personal, like a health or benefits issue?",
        a: "Yes, but differently. If what you write touches your own health, care, or benefits, Lokalt recognizes that and points you to the correct official, statutory process instead of drafting an email to a politician or board.",
      },
      {
        q: "How accurate is Lokalt, and can I trust the answer?",
        a: "Lokalt uses AI to match your concern to the right contact, and AI can get things wrong. Every answer links to its source on paatokset.hel.fi, so you can check it yourself before you send anything.",
      },
    ],
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

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang,
    mainEntity: c.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
                  {c.step2ChairBadge && <span className="tag tag-badge">{c.step2ChairBadge}</span>}
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

        {/* FAQ */}
        <section id="faq" className="scroll-mt-4 pb-16">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-petrol">{c.faqHeading}</p>
            <span className="text-xs text-ink/55">{c.faqUpdated}</span>
          </div>
          <hr className="my-3 border-line" />
          <div className="flex flex-col divide-y divide-line">
            {c.faq.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="cursor-pointer list-none text-[15px] font-semibold text-ink marker:content-none">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{item.a}</p>
              </details>
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
