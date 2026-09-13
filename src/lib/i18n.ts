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

  // Unclear track (the text names a topic but no situation)
  unclearExplain: string;
  unclearExamplesLabel: string;
  unclearExamples: string[];
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
  operationalCheckExisting: string;
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

  // "What else can I do?" — track-specific follow-up tips, shown after the
  // routing result. Skipped for "unclear" (nothing routed yet) and
  // "statutory" (avoids inventing personal-case channels we don't have data
  // for; see CLAUDE.md's contact-data invariant).
  whatElseHeading: string;
  whatElseOperational: string;
  whatElsePolicy: string;
  whatElseAgenda: string;

  // Location picker
  locationHeading: string;
  locationAutoFilledHint: string;
  locationMapHint: string;
  locationMapActivateHint: string;
  locationMapZoomHint: string;
  locationMapLoadingAreas: string;
  legendKaupunki: string;
  legendKiinteisto: string;
  legendHkl: string;
  legendValtio: string;
  legendLiikunta: string;
  legendIngen: string;
  locationGeoButton: string;
  locationGeoError: string;
  locationStreetLabel: string;
  locationStreetHint: string;
  locationStreetPlaceholder: string;
  locationStreetNotFoundError: string;
  locationStreetButton: string;
  locationSelectedLabel: string;

  // Area responsibility (step 1)
  responsibilityHeading: string;
  responsibilityLoading: string;
  responsibilityMaintenanceLevelLabel: string;
  responsibilityCityText: string;
  responsibilityOtherText: string;
  responsibilityNotFoundText: string;
  partyLabelKiinteisto: string;
  partyLabelHkl: string;
  partyLabelValtio: string;
  partyLabelLiikunta: string;

  // Decisions — shown only for the policy track
  decisionsHeading: string;
  decisionsLoading: string;
  decisionsStatusUpcoming: string;
  decisionsStatusDecided: string;
  decisionsUpcomingHint: string;
  decisionsEmpty: string;
  decisionsShowMore: string;
  decisionsSourceLabel: string;

  // Nearby reports (step 4, MVP slice)
  nearbyHeading: string;
  nearbyHint: string;
  nearbyVerifiedHint: string;
  nearbyUnverifiedHint: string;
  nearbyLoading: string;
  nearbyEmpty: string;
  nearbyWideNote: string;
  nearbyDistance: string;
  nearbyCityReplyLabel: string;
  nearbySourceLabel: string;
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
  unclearExplain:
    "Vi vet ännu inte vad du vill ha hjälp med. Skriv en mening till om vad som är fel eller vad du tycker borde ändras, så hittar vi rätt väg.",
  unclearExamplesLabel: "Så här kan du skriva:",
  unclearExamples: [
    "spårvagnen på min gata låter för mycket på natten",
    "spårvagnshållplatsen vid mitt hem har ingen väderskydd",
    "spårvagnslinje 6 borde gå oftare på kvällarna",
  ],
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
  operationalCheckExisting:
    "Innan du anmäler: sök nedan om felet redan är anmält, så slipper du göra en dubblettanmälan.",
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

  whatElseHeading: "Vad kan jag mer göra?",
  whatElseOperational:
    "Om problemet är återkommande, eller du tycker att staden borde göra något annorlunda i området:",
  whatElsePolicy: "Utöver att skriva till nämnden ovan kan du också:",
  whatElseAgenda:
    "Du kan också be en fullmäktigeledamot lyfta frågan direkt i stadsfullmäktige, utöver de vägar som redan nämnts ovan.",

  locationHeading: "Visa senaste felanmälningar i ett visst område",
  locationAutoFilledHint: "Ifyllt utifrån din fråga — ändra gärna om det inte stämmer.",
  locationMapHint: "Tryck på kartan för att peka ut exakt plats.",
  locationMapActivateHint: "Tryck för att kunna dra och zooma kartan",
  locationMapZoomHint: "Zooma in för att se vem som ansvarar för olika områden.",
  locationMapLoadingAreas: "Laddar ansvarsområden …",
  legendKaupunki: "Staden",
  legendKiinteisto: "Fastighetsägaren",
  legendHkl: "HKL",
  legendValtio: "Staten",
  legendLiikunta: "Idrottsservicen",
  legendIngen: "Inte fastställt",
  locationGeoButton: "Använd min plats",
  locationGeoError: "Kunde inte hämta din plats. Skriv en gatuadress i stället.",
  locationStreetLabel: "Eller skriv en gatuadress",
  locationStreetHint: "Skriv bara gatans namn, utan husnummer, på finska (t.ex. Unioninkatu, inte Unionsgatan).",
  locationStreetPlaceholder: "T.ex. Unioninkatu",
  locationStreetNotFoundError: "Vi hittade ingen gata med det namnet. Prova gatans finska namn, utan husnummer.",
  locationStreetButton: "Sök",
  locationSelectedLabel: "Vald plats",

  responsibilityHeading: "Vem ansvarar för platsen",
  responsibilityLoading: "Slår upp ansvar …",
  responsibilityMaintenanceLevelLabel: "Servicenivå",
  responsibilityCityText: "Det här är Helsingfors stads ansvar.",
  responsibilityOtherText: "Det här är {party} ansvar, inte stadens.",
  responsibilityNotFoundText:
    "Vi kunde inte avgöra vem som ansvarar för just den här punkten.",
  partyLabelKiinteisto: "fastighetsägarens",
  partyLabelHkl: "trafikaffärsverkets (HKL)",
  partyLabelValtio: "statens",
  partyLabelLiikunta: "idrottsservicens",

  decisionsHeading: "Relaterade beslut",
  decisionsLoading: "Söker i beslutsindexet …",
  decisionsStatusUpcoming: "Behandlas snart",
  decisionsStatusDecided: "Beslutat",
  decisionsUpcomingHint: "Det går att påverka innan mötet.",
  decisionsEmpty: "Vi hittade inga beslut som verkar relatera till din fråga.",
  decisionsShowMore: "Visa fler",
  decisionsSourceLabel: "Källa: paatokset.hel.fi",

  nearbyHeading: "Tidigare anmälningar i närheten",
  nearbyHint: "Visar publicerade felanmälningar från de senaste tolv månaderna. Det är bara ungefär en åttondel av allt som anmäls till staden.",
  nearbyVerifiedHint: "Dessa verkar handla om samma sak. Kontrollera själv innan du anmäler på nytt.",
  nearbyUnverifiedHint: "Vi kunde inte jämföra dessa mot din text just nu, så de är bara rankade efter avstånd och likhet.",
  nearbyLoading: "Söker bland tidigare anmälningar …",
  nearbyEmpty: "Vi hittade ingen publicerad anmälan om det här inom tolv månader här.",
  nearbyWideNote: "Få träffar nära platsen, visar därför även anmälningar lite längre bort.",
  nearbyDistance: "{distance} m bort",
  nearbyCityReplyLabel: "Stadens svar",
  nearbySourceLabel: "Källa: palautteet.hel.fi",
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
  unclearExplain:
    "Emme vielä tiedä, mihin haluat apua. Kirjoita vielä yksi lause siitä, mikä on vialla tai mitä mielestäsi pitäisi muuttaa, niin löydämme oikean reitin.",
  unclearExamplesLabel: "Voit kirjoittaa esimerkiksi näin:",
  unclearExamples: [
    "raitiovaunu meluaa kadullani öisin liikaa",
    "kotini lähellä olevalla raitiovaunupysäkillä ei ole katosta",
    "raitiovaunulinjan 6 pitäisi kulkea useammin iltaisin",
  ],
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
  operationalCheckExisting:
    "Ennen kuin ilmoitat: tarkista alta, onko vika jo ilmoitettu, näin vältät päällekkäisen ilmoituksen.",
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

  whatElseHeading: "Mitä muuta voin tehdä?",
  whatElseOperational: "Jos ongelma toistuu tai mielestäsi kaupungin pitäisi toimia alueella toisin:",
  whatElsePolicy: "Yllä olevan lautakunnalle kirjoittamisen lisäksi voit myös:",
  whatElseAgenda:
    "Voit myös pyytää valtuutettua ottamaan asian suoraan esille kaupunginvaltuustossa, edellä mainittujen keinojen lisäksi.",

  locationHeading: "Näytä viimeisimmät vikailmoitukset tietyllä alueella",
  locationAutoFilledHint: "Täytetty kysymyksesi perusteella — muokkaa, jos tämä ei pidä paikkaansa.",
  locationMapHint: "Napauta karttaa osoittaaksesi tarkan paikan.",
  locationMapActivateHint: "Napauta, jotta voit vetää ja zoomata karttaa",
  locationMapZoomHint: "Lähennä nähdäksesi kuka vastaa eri alueista.",
  locationMapLoadingAreas: "Ladataan vastuualueita …",
  legendKaupunki: "Kaupunki",
  legendKiinteisto: "Kiinteistön omistaja",
  legendHkl: "HKL",
  legendValtio: "Valtio",
  legendLiikunta: "Liikuntapalvelut",
  legendIngen: "Ei määritelty",
  locationGeoButton: "Käytä sijaintiani",
  locationGeoError: "Sijaintia ei saatu. Kirjoita katuosoite sen sijaan.",
  locationStreetLabel: "Tai kirjoita katuosoite",
  locationStreetHint: "Kirjoita vain kadun nimi, ilman talon numeroa (esim. Unioninkatu).",
  locationStreetPlaceholder: "Esim. Unioninkatu",
  locationStreetNotFoundError: "Emme löytäneet kyseistä katua. Kirjoita vain kadun nimi, ilman talon numeroa.",
  locationStreetButton: "Hae",
  locationSelectedLabel: "Valittu sijainti",

  responsibilityHeading: "Kuka vastaa paikasta",
  responsibilityLoading: "Haetaan vastuutietoa …",
  responsibilityMaintenanceLevelLabel: "Ylläpidon taso",
  responsibilityCityText: "Tästä vastaa Helsingin kaupunki.",
  responsibilityOtherText: "Tästä vastaa {party}, ei kaupunki.",
  responsibilityNotFoundText: "Emme pystyneet määrittämään, kuka vastaa juuri tästä kohdasta.",
  partyLabelKiinteisto: "kiinteistön omistaja",
  partyLabelHkl: "liikenneliikelaitos (HKL)",
  partyLabelValtio: "valtio",
  partyLabelLiikunta: "liikuntapalvelut",

  decisionsHeading: "Liittyvät päätökset",
  decisionsLoading: "Haetaan päätösindeksistä …",
  decisionsStatusUpcoming: "Käsitellään pian",
  decisionsStatusDecided: "Päätetty",
  decisionsUpcomingHint: "Asiaan voi vielä vaikuttaa ennen kokousta.",
  decisionsEmpty: "Emme löytäneet kysymykseesi liittyviä päätöksiä.",
  decisionsShowMore: "Näytä lisää",
  decisionsSourceLabel: "Lähde: paatokset.hel.fi",

  nearbyHeading: "Aiemmat ilmoitukset lähistöllä",
  nearbyHint: "Näyttää julkaistut palautteet viimeisen 12 kuukauden ajalta. Tämä on vain noin kahdeksasosa kaikesta kaupungille tehdystä palautteesta.",
  nearbyVerifiedHint: "Nämä vaikuttavat koskevan samaa asiaa. Tarkista silti itse ennen kuin ilmoitat uudelleen.",
  nearbyUnverifiedHint: "Emme voineet vertailla näitä tekstiisi juuri nyt, joten ne on järjestetty vain etäisyyden ja samankaltaisuuden perusteella.",
  nearbyLoading: "Haetaan aiempia ilmoituksia …",
  nearbyEmpty: "Emme löytäneet julkaistua palautetta tästä 12 kuukauden ajalta.",
  nearbyWideNote: "Vähän osumia lähistöltä, näytämme siksi myös hieman kauempana olevia palautteita.",
  nearbyDistance: "{distance} m päässä",
  nearbyCityReplyLabel: "Kaupungin vastaus",
  nearbySourceLabel: "Lähde: palautteet.hel.fi",
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
  unclearExplain:
    "We don't yet know what you need help with. Add one more sentence about what is wrong, or what you think should change, and we'll find the right route.",
  unclearExamplesLabel: "You could write something like:",
  unclearExamples: [
    "the tram on my street is too noisy at night",
    "the tram stop near my home has no shelter",
    "tram line 6 should run more often in the evenings",
  ],
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
  operationalCheckExisting:
    "Before you report it: search below to check if it's already been reported, so you avoid filing a duplicate.",
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

  whatElseHeading: "What else can I do?",
  whatElseOperational: "If the problem keeps recurring, or you think the city should handle the area differently:",
  whatElsePolicy: "Besides writing to the committee above, you can also:",
  whatElseAgenda:
    "You can also ask a city councillor to raise the matter directly in the city council, in addition to the routes above.",

  locationHeading: "Show recent fault reports in a specific area",
  locationAutoFilledHint: "Filled in from your question — feel free to change it if that's not right.",
  locationMapHint: "Tap the map to point to the exact spot.",
  locationMapActivateHint: "Tap to drag and zoom the map",
  locationMapZoomHint: "Zoom in to see who's responsible for different areas.",
  locationMapLoadingAreas: "Loading responsibility areas …",
  legendKaupunki: "The city",
  legendKiinteisto: "Property owner",
  legendHkl: "HKL",
  legendValtio: "The state",
  legendLiikunta: "Sports services",
  legendIngen: "Not determined",
  locationGeoButton: "Use my location",
  locationGeoError: "Couldn't get your location. Type a street address instead.",
  locationStreetLabel: "Or type a street address",
  locationStreetHint: "Type just the street name, no house number, in Finnish (e.g. Unioninkatu, not Union Street).",
  locationStreetPlaceholder: "E.g. Unioninkatu",
  locationStreetNotFoundError: "We couldn't find that street. Try its Finnish name, without a house number.",
  locationStreetButton: "Search",
  locationSelectedLabel: "Selected location",

  responsibilityHeading: "Who's responsible for this spot",
  responsibilityLoading: "Looking up responsibility …",
  responsibilityMaintenanceLevelLabel: "Service level",
  responsibilityCityText: "This is the City of Helsinki's responsibility.",
  responsibilityOtherText: "This is {party} responsibility, not the city's.",
  responsibilityNotFoundText: "We couldn't determine who's responsible for this exact spot.",
  partyLabelKiinteisto: "the property owner's",
  partyLabelHkl: "the transport authority's (HKL)",
  partyLabelValtio: "the state's",
  partyLabelLiikunta: "the sports services'",

  decisionsHeading: "Related decisions",
  decisionsLoading: "Searching the decisions index …",
  decisionsStatusUpcoming: "Coming up soon",
  decisionsStatusDecided: "Decided",
  decisionsUpcomingHint: "It's still possible to weigh in before the meeting.",
  decisionsEmpty: "We couldn't find any decisions that seem related to your question.",
  decisionsShowMore: "Show more",
  decisionsSourceLabel: "Source: paatokset.hel.fi",

  nearbyHeading: "Earlier reports nearby",
  nearbyHint: "Shows published fault reports from the last 12 months. This is only about an eighth of everything reported to the city.",
  nearbyVerifiedHint: "These look like they're about the same thing. Check for yourself before reporting again.",
  nearbyUnverifiedHint: "We couldn't compare these against your text right now, so they're only ranked by distance and similarity.",
  nearbyLoading: "Searching earlier reports …",
  nearbyEmpty: "We found no published report about this within the last 12 months here.",
  nearbyWideNote: "Few matches close by, so we're also showing reports a bit further away.",
  nearbyDistance: "{distance} m away",
  nearbyCityReplyLabel: "City's reply",
  nearbySourceLabel: "Source: palautteet.hel.fi",
};

export function strings(lang: Lang): Strings {
  return lang === "sv" ? sv : lang === "en" ? en : fi;
}
