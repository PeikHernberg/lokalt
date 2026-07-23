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
  emptyState: string;
}

const sv: Strings = {
  tagline: "Skriv ett problem i din vardag. Vi visar vem i Helsingfors som bestämmer om det och hjälper dig skriva ett mejl.",
  askHeading: "Vad gäller din fråga?",
  askPlaceholder: "T.ex. \"cykelvägen utanför mitt hus är trasig\" eller \"skolmaten i min dotters skola\"",
  askButton: "Hitta rätt organ",
  thinking: "Söker rätt organ …",
  drafting: "Skriver utkast …",
  resultHeading: "Ansvarigt organ",
  whyLabel: "Varför",
  confidenceHigh: "Säker",
  confidenceMedium: "Ganska säker",
  confidenceLow: "Osäker",
  uncertainNote: "Vi är inte helt säkra. Här är de mest sannolika organen — välj det som passar bäst.",
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
  emptyState: "Skriv en fråga i rutan för att se vilket organ som kunde hjälpa dig.",
};

const fi: Strings = {
  tagline: "Kirjoita arjen ongelma. Näytämme, kuka Helsingissä siitä päättää, ja autamme sinua kirjoittamaan sähköpostin.",
  askHeading: "Mitä asiasi koskee?",
  askPlaceholder: "Esim. \"talon edessä oleva pyörätie on rikki\" tai \"tyttäreni koulun kouluruoka\"",
  askButton: "Etsi oikea toimielin",
  thinking: "Etsitään oikeaa toimielintä …",
  drafting: "Kirjoitetaan luonnosta …",
  resultHeading: "Vastuullinen toimielin",
  whyLabel: "Miksi",
  confidenceHigh: "Varma",
  confidenceMedium: "Melko varma",
  confidenceLow: "Epävarma",
  uncertainNote: "Emme ole aivan varmoja. Tässä todennäköisimmät toimielimet — valitse sopivin.",
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
  emptyState: "Kirjoita kysymys ruutuun nähdäksesi, mikä toimielin voisi auttaa sinua.",
};

export function strings(lang: Lang): Strings {
  return lang === "sv" ? sv : fi;
}
