import type { Lang } from "./bodies";

export interface Strings {
  tagline: string;
  askHeading: string;
  askPlaceholder: string;
  askButton: string;
  thinking: string;
  drafting: string;
  resultHeading: string;
  whyLabel: string;
  confidenceHigh: string;
  confidenceMedium: string;
  confidenceLow: string;
  uncertainNote: string;
  nationalNote: string;
  clarifyHeading: string;
  chairBadge: string;
  registryLabel: string;
  registryHint: string;
  source: string;
  noEmail: string;
  writeButton: string;
  draftHeading: string;
  draftIntro: string;
  subjectLabel: string;
  bodyLabel: string;
  recipientLabel: string;
  openMail: string;
  copy: string;
  copied: string;
  startOver: string;
  error: string;
  aboutLink: string;
  langLabel: string;
  footerDisclaimer: string;

  // Operational track
  operationalHeading: string;
  operationalExplain: string;
  operationalButton: string;
  operationalLowConfidenceNote: string;

  // Policy track (uncertain wording reused from result heading above)
  policyLowConfidenceNote: string;

  // Statutory track
  statutoryHeading: string;
  statutoryExplain: string;

  // Agenda track
  agendaHeading: string;
  agendaExplain: string;
  agendaOmaStadi: string;
  agendaInitiative: string;
  agendaCouncillor: string;
  agendaDraftButton: string;
  agendaDraftHeading: string;
  agendaDraftIntro: string;
}

const sv: Strings = {
  tagline: "Skriv ett problem i din vardag. Vi visar vem i Helsingfors som bestämmer om det och hjälper dig skriva ett mejl.",
  askHeading: "Vad gäller din fråga?",
  askPlaceholder: "T.ex. \"biblioteket i min stadsdel borde ha öppet på söndagar\" eller \"skolmaten i min dotters skola borde bli bättre\"",
  askButton: "Hitta rätt organ",
  thinking: "Söker rätt organ …",
  drafting: "Skriver utkast …",
  resultHeading: "Ansvarigt organ",
  whyLabel: "Varför",
  confidenceHigh: "Säker",
  confidenceMedium: "Ganska säker",
  confidenceLow: "Osäker",
  uncertainNote: "Vi är inte helt säkra. Här är de mest sannolika organen, välj det som passar bäst.",
  nationalNote: "Det här verkar vara en nationell fråga, inte en kommunal. Helsingfors stad beslutar troligen inte om detta.",
  clarifyHeading: "En kort fråga tillbaka",
  chairBadge: "Ordförande",
  registryLabel: "Stadens registratur (kirjaamo)",
  registryHint: "Adressera ditt ärende till organet ovan. Registraturen vidarebefordrar det och det blir en officiell handling.",
  source: "Källa: paatokset.hel.fi",
  noEmail: "Ingen personlig e-post publicerad. Använd registraturen nedan.",
  writeButton: "Skriv ett mejl till den här mottagaren",
  draftHeading: "Ditt utkast",
  draftIntro: "Redigera fritt. Fyll i det som står inom [ ]. Öppna sedan i din e-post.",
  subjectLabel: "Ämne",
  bodyLabel: "Meddelande",
  recipientLabel: "Mottagare",
  openMail: "Öppna i e-postprogram",
  copy: "Kopiera texten",
  copied: "Kopierat!",
  startOver: "Börja om",
  error: "Något gick fel. Försök igen om en stund.",
  aboutLink: "Om tjänsten",
  langLabel: "Språk",
  footerDisclaimer:
    "Oberoende verktyg, inte en officiell tjänst från Helsingfors stad. AI:n kan ha fel, kontrollera alltid källänken.",

  operationalHeading: "Det här är ett praktiskt fel, inte ett beslut",
  operationalExplain:
    "Sådant här, till exempel trasiga cykelvägar, trasig gatubelysning, klotter eller snö, åtgärdas av stadens felanmälan, inte av en nämnd.",
  operationalButton: "Gör en felanmälan på palautteet.hel.fi",
  operationalLowConfidenceNote:
    "Om du istället vill att staden ska besluta annorlunda, till exempel bygga något nytt, ändra en regel eller finansiera något, är det en annan väg. Beskriv i så fall vad du vill att staden ska besluta, så hittar vi rätt nämnd.",

  policyLowConfidenceNote:
    "Vi är inte helt säkra på att det här är rätt organ. Beskriv gärna vad du vill att staden ska besluta, om något verkar fel.",

  statutoryHeading: "Det här är ett ärende med lagstadgad process",
  statutoryExplain:
    "Det här gäller ett beslut som redan fattats, eller din egen vård, omsorg eller bemötande, sådant hanteras av en lagstadgad process med tidsfrister (t.ex. begäran om omprövning, dvs. oikaisuvaatimus, eller patientombud och socialombud), inte av en politiker eller nämnd.",

  agendaHeading: "En ny idé för staden",
  agendaExplain:
    "Det här verkar vara en helt ny fråga som staden inte redan behandlar. Här är några sätt att föra den vidare:",
  agendaOmaStadi: "OmaStadi: föreslå och rösta om budget i ditt område (omastadi.hel.fi)",
  agendaInitiative: "Kommuninvånarinitiativ: samla stöd för din idé (kuntalaisaloite.fi)",
  agendaCouncillor: "Be en fullmäktigeledamot väcka frågan i stadsfullmäktige",
  agendaDraftButton: "Hjälp mig skriva en start­text",
  agendaDraftHeading: "Din starttext",
  agendaDraftIntro:
    "Redigera fritt. Fyll i det som står inom [ ]. Klistra sedan in texten där du vill lämna in den.",
};

const fi: Strings = {
  tagline: "Kirjoita arjen ongelma. Näytämme, kuka Helsingissä siitä päättää, ja autamme sinua kirjoittamaan sähköpostin.",
  askHeading: "Mitä asiasi koskee?",
  askPlaceholder: "Esim. \"kaupunginosani kirjaston pitäisi olla auki sunnuntaisin\" tai \"tyttäreni koulun kouluruokaa pitäisi parantaa\"",
  askButton: "Etsi oikea toimielin",
  thinking: "Etsitään oikeaa toimielintä …",
  drafting: "Kirjoitetaan luonnosta …",
  resultHeading: "Vastuullinen toimielin",
  whyLabel: "Miksi",
  confidenceHigh: "Varma",
  confidenceMedium: "Melko varma",
  confidenceLow: "Epävarma",
  uncertainNote: "Emme ole aivan varmoja. Tässä todennäköisimmät toimielimet, valitse sopivin.",
  nationalNote: "Tämä vaikuttaa valtakunnalliselta asialta, ei kunnalliselta. Helsingin kaupunki ei todennäköisesti päätä tästä.",
  clarifyHeading: "Lyhyt tarkentava kysymys",
  chairBadge: "Puheenjohtaja",
  registryLabel: "Kaupungin kirjaamo",
  registryHint: "Osoita asiasi yllä olevalle toimielimelle. Kirjaamo välittää sen eteenpäin ja siitä tulee virallinen asiakirja.",
  source: "Lähde: paatokset.hel.fi",
  noEmail: "Henkilökohtaista sähköpostia ei ole julkaistu. Käytä alla olevaa kirjaamoa.",
  writeButton: "Kirjoita sähköposti tälle vastaanottajalle",
  draftHeading: "Luonnoksesi",
  draftIntro: "Muokkaa vapaasti. Täytä [ ]-kohdat. Avaa sitten sähköpostiohjelmassasi.",
  subjectLabel: "Aihe",
  bodyLabel: "Viesti",
  recipientLabel: "Vastaanottaja",
  openMail: "Avaa sähköpostiohjelmassa",
  copy: "Kopioi teksti",
  copied: "Kopioitu!",
  startOver: "Aloita alusta",
  error: "Jokin meni pieleen. Yritä hetken kuluttua uudelleen.",
  aboutLink: "Tietoa palvelusta",
  langLabel: "Kieli",
  footerDisclaimer:
    "Riippumaton työkalu, ei Helsingin kaupungin virallinen palvelu. Tekoäly voi erehtyä, tarkista aina lähdelinkki.",

  operationalHeading: "Tämä on käytännön vika, ei päätös",
  operationalExplain:
    "Tällaiset asiat, esimerkiksi rikkinäiset pyörätiet, sammuneet valot, graffitit tai lumi, korjataan kaupungin palautepalvelun kautta, ei lautakunnassa.",
  operationalButton: "Tee palaute osoitteessa palautteet.hel.fi",
  operationalLowConfidenceNote:
    "Jos haluat sen sijaan, että kaupunki päättää jostain toisin, esimerkiksi rakentaa uutta, muuttaa sääntöä tai rahoittaa jotain, kyse on eri polusta. Kuvaile silloin, mitä haluat kaupungin päättävän, niin löydämme oikean lautakunnan.",

  policyLowConfidenceNote:
    "Emme ole aivan varmoja, että tämä on oikea toimielin. Kuvaile mielellään, mitä haluat kaupungin päättävän, jos jokin vaikuttaa väärältä.",

  statutoryHeading: "Tämä on lakisääteinen prosessi",
  statutoryExplain:
    "Tämä koskee jo tehtyä päätöstä tai omaa hoitoasi, huolenpitoasi tai kohteluasi, tällaiset asiat käsitellään lakisääteisessä prosessissa määräaikoineen (esim. oikaisuvaatimus, potilasasiavastaava tai sosiaaliasiavastaava), ei poliitikon tai lautakunnan kautta.",

  agendaHeading: "Uusi idea kaupungille",
  agendaExplain:
    "Tämä vaikuttaa kokonaan uudelta asialta, jota kaupunki ei vielä käsittele. Tässä muutama tapa viedä sitä eteenpäin:",
  agendaOmaStadi: "OmaStadi: ehdota ja äänestä alueesi budjetista (omastadi.hel.fi)",
  agendaInitiative: "Kuntalaisaloite: kerää tukea ideallesi (kuntalaisaloite.fi)",
  agendaCouncillor: "Pyydä valtuutettua ottamaan asia esille kaupunginvaltuustossa",
  agendaDraftButton: "Auta minua kirjoittamaan aloitusteksti",
  agendaDraftHeading: "Aloitustekstisi",
  agendaDraftIntro:
    "Muokkaa vapaasti. Täytä [ ]-kohdat. Liitä teksti sitten sinne, minne haluat sen jättää.",
};

const en: Strings = {
  tagline: "Describe an everyday problem. We'll show you who in Helsinki decides on it and help you write an email.",
  askHeading: "What's your question about?",
  askPlaceholder: "E.g. \"the library in my neighbourhood should be open on Sundays\" or \"school meals at my daughter's school should be better\"",
  askButton: "Find the right body",
  thinking: "Finding the right body …",
  drafting: "Writing a draft …",
  resultHeading: "Responsible body",
  whyLabel: "Why",
  confidenceHigh: "Confident",
  confidenceMedium: "Fairly confident",
  confidenceLow: "Uncertain",
  uncertainNote: "We're not entirely sure. Here are the most likely bodies, pick whichever fits best.",
  nationalNote: "This looks like a national matter, not a municipal one. The City of Helsinki likely doesn't decide on this.",
  clarifyHeading: "One quick follow-up question",
  chairBadge: "Chair",
  registryLabel: "City registry (kirjaamo)",
  registryHint: "Address your matter to the body above. The registry forwards it, and it becomes an official document.",
  source: "Source: paatokset.hel.fi",
  noEmail: "No personal email published. Use the registry below.",
  writeButton: "Write an email to this recipient",
  draftHeading: "Your draft",
  draftIntro: "Edit freely. Fill in anything shown in [ ]. Then open it in your email app.",
  subjectLabel: "Subject",
  bodyLabel: "Message",
  recipientLabel: "Recipient",
  openMail: "Open in email app",
  copy: "Copy text",
  copied: "Copied!",
  startOver: "Start over",
  error: "Something went wrong. Please try again shortly.",
  aboutLink: "About the service",
  langLabel: "Language",
  footerDisclaimer:
    "Independent tool, not an official service of the City of Helsinki. The AI can be wrong, always check the source link.",

  operationalHeading: "This is a practical fault, not a decision",
  operationalExplain:
    "Things like this, such as broken bike paths, dead streetlights, graffiti, or snow, get fixed through the city's fault-report service, not a committee.",
  operationalButton: "Report it at palautteet.hel.fi",
  operationalLowConfidenceNote:
    "If instead you want the city to decide something differently, such as building something new, changing a rule, or funding something, that's a different path. Describe what you want the city to decide, and we'll find the right committee.",

  policyLowConfidenceNote:
    "We're not entirely sure this is the right body. Feel free to describe what you want the city to decide if something looks off.",

  statutoryHeading: "This matter has a statutory process",
  statutoryExplain:
    "This concerns a decision already made, or your own care, treatment, or how you were treated, matters like this are handled through a statutory process with deadlines (e.g. a request for rectification, or a patient or social services ombudsperson), not by a politician or committee.",

  agendaHeading: "A new idea for the city",
  agendaExplain:
    "This looks like an entirely new matter the city isn't already considering. Here are some ways to take it forward:",
  agendaOmaStadi: "OmaStadi: propose and vote on budget items in your area (omastadi.hel.fi)",
  agendaInitiative: "Residents' initiative: gather support for your idea (kuntalaisaloite.fi)",
  agendaCouncillor: "Ask a city councillor to raise the matter in the city council",
  agendaDraftButton: "Help me write a starting text",
  agendaDraftHeading: "Your starting text",
  agendaDraftIntro:
    "Edit freely. Fill in anything shown in [ ]. Then paste the text wherever you want to submit it.",
};

export function strings(lang: Lang): Strings {
  return lang === "sv" ? sv : lang === "en" ? en : fi;
}
