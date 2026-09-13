#!/usr/bin/env node
// One-off generator for data/bodies.json, per lokalt-kontext/claude-kontext/02-byggordning.md, step 3.
//
// Fetches the city's own decision-making bodies (lautakunnat/nämnder,
// jaostot/sektioner, hallitus/styrelse, valtuusto/fullmäktige) from the live
// paatokset_policymakers index, and layers hand-authored routing content
// (remit text, plain-language topics, chairs) on top for the subset we mark
// routable — the only ones ever offered to the classifier model.
//
// Run with: node scripts/generate-bodies.mjs

const BASE = "https://paatokset-elastic-proxy.api.hel.ninja";
const ORG_TYPES = ["Lautakunta", "Jaosto", "Hallitus", "Valtuusto"];

// The ~12 bodies a resident's everyday concern should actually reach. See
// 02-byggordning.md step 3 for the reasoning behind this exact set.
const ROUTABLE_IDS = new Set([
  "U540", // Kaupunkiympäristölautakunta
  "U420", // Kasvatus- ja koulutuslautakunta
  "U480", // Kulttuuri- ja vapaa-aikalautakunta
  "U321", // Sosiaali-, terveys- ja pelastuslautakunta
  "00400", // Kaupunginhallitus
  "02900", // Kaupunginvaltuusto
  "U75000", // Liikenneliikelaitoksen johtokunta
  "U480310", // Kulttuuri- ja kirjastojaosto
  "U480100", // Liikuntajaosto
  "U480200", // Nuorisojaosto
]);

// Hand-authored content the live index does not carry: remit text in plain
// language, topic examples for routing, and named chairs. Never invented —
// chairs are published office-holders; where no verified email exists it
// stays null and the registry route carries the contact instead.
const HAND_CONTENT = {
  U540: {
    name_en: "Urban Environment Committee",
    remit_sv:
      "Ansvarar för stadens byggda miljö och trafik: gator och deras underhåll, cykel- och gångvägar, parkering, trafikarrangemang, stadsplanering och detaljplaner, byggnadstillsyn, parker och grönområden samt miljöfrågor.",
    remit_fi:
      "Vastaa kaupungin rakennetusta ympäristöstä ja liikenteestä: kadut ja niiden kunnossapito, pyörä- ja jalankulkuväylät, pysäköinti, liikennejärjestelyt, kaupunkisuunnittelu ja asemakaavat, rakennusvalvonta, puistot ja viheralueet sekä ympäristöasiat.",
    remit_en:
      "Responsible for the city's built environment and traffic: streets and their upkeep, cycling and walking routes, parking, traffic arrangements, urban planning and local detailed plans, building supervision, parks and green areas, and environmental matters.",
    topics_sv: ["cykelväg trasig eller saknas", "gropar och dåligt gatuunderhåll", "snöröjning och halkbekämpning", "parkering och parkeringsplatser", "gatubelysning", "trafikljus och övergångsställen", "hastighetsbegränsningar och farthinder", "parker, lekplatser och grönområden", "träd som fälls", "detaljplan och byggande i närområdet", "buller och luftkvalitet"],
    topics_fi: ["rikkinäinen tai puuttuva pyörätie", "kuopat ja katujen kunnossapito", "lumenauraus ja liukkaudentorjunta", "pysäköinti ja pysäköintipaikat", "katuvalaistus", "liikennevalot ja suojatiet", "nopeusrajoitukset ja hidasteet", "puistot, leikkipaikat ja viheralueet", "puiden kaataminen", "asemakaava ja lähialueen rakentaminen", "melu ja ilmanlaatu"],
    topics_en: ["broken or missing bike path", "potholes and poor street maintenance", "snow ploughing and de-icing", "parking and parking spaces", "street lighting", "traffic lights and pedestrian crossings", "speed limits and traffic-calming bumps", "parks, playgrounds and green areas", "trees being felled", "local detailed plan and nearby construction", "noise and air quality"],
    members: [
      {
        name: "Johanna Laisaari",
        role_sv: "ordförande (biträdande borgmästare, stadsmiljösektorn)",
        role_fi: "puheenjohtaja (apulaispormestari, kaupunkiympäristö)",
        role_en: "chair (deputy mayor, urban environment)",
        party: "SDP",
        email: "johanna.laisaari@hel.fi",
        phone: null,
      },
    ],
  },
  U420: {
    name_en: "Education Committee",
    remit_sv:
      "Ansvarar för småbarnspedagogik (dagvård), förskola, grundskola, gymnasier och yrkesutbildning i staden, inklusive skolmat, skolskjuts, elevantagning och skolnätet.",
    remit_fi:
      "Vastaa varhaiskasvatuksesta (päivähoito), esiopetuksesta, peruskoulusta, lukioista ja ammatillisesta koulutuksesta, mukaan lukien kouluruoka, koulukuljetukset, oppilasvalinnat ja kouluverkko.",
    remit_en:
      "Responsible for early childhood education (day care), pre-school, comprehensive school, upper secondary schools and vocational education in the city, including school meals, school transport, student admissions, and the school network.",
    topics_sv: ["skolmaten i mitt barns skola", "dagvård och dagisplats", "förskola", "grundskola och undervisning", "gymnasium och yrkesutbildning", "skolskjuts", "klasstorlek och elevantal", "skolans lokaler och inomhusluft", "morgon- och eftermiddagsverksamhet"],
    topics_fi: ["kouluruoka lapseni koulussa", "varhaiskasvatus ja päivähoitopaikka", "esiopetus", "peruskoulu ja opetus", "lukio ja ammatillinen koulutus", "koulukuljetus", "luokkakoko ja oppilasmäärä", "koulun tilat ja sisäilma", "aamu- ja iltapäivätoiminta"],
    topics_en: ["school meals at my child's school", "day care and a day care place", "pre-school", "comprehensive school and teaching", "upper secondary and vocational education", "school transport", "class size and pupil numbers", "school facilities and indoor air quality", "morning and afternoon activities"],
    members: [
      {
        name: "Reetta Vanhanen",
        role_sv: "ordförande (biträdande borgmästare, fostran och utbildning)",
        role_fi: "puheenjohtaja (apulaispormestari, kasvatus ja koulutus)",
        role_en: "chair (deputy mayor, education)",
        party: "Gröna / Vihreät",
        email: "reetta.vanhanen@hel.fi",
        phone: null,
      },
    ],
  },
  U480: {
    name_en: "Culture and Leisure Committee",
    remit_sv:
      "Ansvarar för kultur, bibliotek, idrott och motion, ungdomsarbete samt friluftsliv: bibliotek, idrottsplatser, simhallar, ungdomsgårdar, kulturhus, evenemang och motionsområden.",
    remit_fi:
      "Vastaa kulttuurista, kirjastoista, liikunnasta, nuorisotyöstä ja ulkoilusta: kirjastot, liikuntapaikat, uimahallit, nuorisotalot, kulttuuritalot, tapahtumat ja ulkoilualueet.",
    remit_en:
      "Responsible for culture, libraries, sport and exercise, youth work, and outdoor recreation: libraries, sports facilities, swimming halls, youth centres, culture houses, events, and exercise areas.",
    topics_sv: ["bibliotek och öppettider", "idrottsplatser och motionsområden", "simhall", "konstgräsplan och bollplan", "ungdomsgård", "kultur och evenemang", "friluftsområden och motionsspår", "skridskobana och skidspår"],
    topics_fi: ["kirjasto ja aukioloajat", "liikuntapaikat", "uimahalli", "tekonurmi ja pallokenttä", "nuorisotalo", "kulttuuri ja tapahtumat", "ulkoilualueet ja kuntoradat", "luistelurata ja latu"],
    topics_en: ["library and opening hours", "sports facilities and exercise areas", "swimming hall", "artificial turf and ball field", "youth centre", "culture and events", "outdoor recreation areas and exercise trails", "skating rink and ski track"],
    members: [
      {
        name: "Paavo Arhinmäki",
        role_sv: "ordförande (biträdande borgmästare, kultur och fritid)",
        role_fi: "puheenjohtaja (apulaispormestari, kulttuuri ja vapaa-aika)",
        role_en: "chair (deputy mayor, culture and leisure)",
        party: "Vänsterförbundet / Vasemmistoliitto",
        email: "paavo.arhinmaki@hel.fi",
        phone: null,
      },
    ],
  },
  U321: {
    name_en: "Social Services, Health Care and Rescue Committee",
    remit_sv:
      "Ansvarar för social- och hälsovårdstjänster samt räddningsväsendet: hälsostationer, äldreomsorg, barnskydd, socialservice, mun- och tandvård, mentalvård och räddningstjänst.",
    remit_fi:
      "Vastaa sosiaali- ja terveyspalveluista sekä pelastustoimesta: terveysasemat, vanhustenhuolto, lastensuojelu, sosiaalipalvelut, suun terveydenhuolto, mielenterveyspalvelut ja pelastustoimi.",
    remit_en:
      "Responsible for social and health care services and the rescue department: health stations, elderly care, child protection, social services, dental care, mental health services, and rescue services.",
    topics_sv: ["hälsostation och läkartid", "äldreomsorg och hemvård", "socialservice och utkomststöd", "barnskydd", "tandvård", "mentalvård och missbrukarvård", "rådgivning (barn- och mödrarådgivning)", "räddningsväsende och brandsäkerhet"],
    topics_fi: ["terveysasema ja lääkäriaika", "vanhustenhuolto ja kotihoito", "sosiaalipalvelut ja toimeentulotuki", "lastensuojelu", "hammashoito", "mielenterveys- ja päihdepalvelut", "neuvola", "pelastustoimi ja paloturvallisuus"],
    topics_en: ["health station and doctor's appointment", "elderly care and home care", "social services and income support", "child protection", "dental care", "mental health and substance abuse services", "maternity and child health clinic", "rescue services and fire safety"],
    members: [
      {
        name: "Maarit Vierunen",
        role_sv: "ordförande (biträdande borgmästare, social-, hälsovårds- och räddningssektorn)",
        role_fi: "puheenjohtaja (apulaispormestari, sosiaali-, terveys- ja pelastustoimi)",
        role_en: "chair (deputy mayor, social services, health care and rescue)",
        party: "Samlingspartiet / Kokoomus",
        email: "maarit.vierunen@hel.fi",
        phone: null,
      },
    ],
  },
  "00400": {
    name_en: "City Board",
    remit_sv:
      "Leder stadens förvaltning och ekonomi, bereder ärenden till fullmäktige och ansvarar för övergripande frågor som berör hela staden: budget, markpolitik, strategi, personal och ägarstyrning.",
    remit_fi:
      "Johtaa kaupungin hallintoa ja taloutta, valmistelee asiat valtuustolle ja vastaa koko kaupunkia koskevista kokonaisuuksista: talousarvio, maapolitiikka, strategia, henkilöstö ja omistajaohjaus.",
    remit_en:
      "Leads the city's administration and finances, prepares matters for the council, and is responsible for city-wide issues: the budget, land policy, strategy, personnel, and ownership steering.",
    topics_sv: ["stadens budget och ekonomi", "övergripande strategi", "markpolitik och stora projekt", "ärenden som berör hela staden och inte hör till en enskild nämnd"],
    topics_fi: ["kaupungin talousarvio ja talous", "kokonaisstrategia", "maapolitiikka ja suuret hankkeet", "koko kaupunkia koskevat asiat, jotka eivät kuulu yksittäiselle lautakunnalle"],
    topics_en: ["the city's budget and finances", "overall strategy", "land policy and major projects", "city-wide matters that don't belong to any single committee"],
    members: [
      {
        name: "Daniel Sazonov",
        role_sv: "ordförande (borgmästare)",
        role_fi: "puheenjohtaja (pormestari)",
        role_en: "chair (mayor)",
        party: "Samlingspartiet / Kokoomus",
        email: "daniel.sazonov@hel.fi",
        phone: null,
      },
    ],
  },
  "02900": {
    name_en: "City Council",
    remit_sv:
      "Stadens högsta beslutande organ. Beslutar om stadens strategi, budget och de största principiella frågorna. Ledamöterna väljs i kommunalvalet.",
    remit_fi:
      "Kaupungin ylin päättävä toimielin. Päättää kaupungin strategiasta, talousarviosta ja suurimmista periaatteellisista kysymyksistä. Valtuutetut valitaan kuntavaaleissa.",
    remit_en:
      "The city's highest decision-making body. Decides on the city's strategy, budget, and the largest matters of principle. Members are elected in the municipal elections.",
    topics_sv: ["stadens strategi och stora principbeslut", "godkännande av budgeten", "frågor som fullmäktige beslutar om på högsta nivå"],
    topics_fi: ["kaupungin strategia ja suuret periaatepäätökset", "talousarvion hyväksyminen", "asiat, joista valtuusto päättää ylimmällä tasolla"],
    topics_en: ["the city's strategy and major decisions of principle", "approval of the budget", "matters the council decides at the highest level"],
    members: [],
  },
  U75000: {
    name_en: "Transport Enterprise Board (HKL)",
    remit_sv:
      "Ansvarar för Helsingfors stads trafikaffärsverk (HKL): spårvagns- och metrotrafikens drift, biljetter och resekort samt Sveaborgsfärjan.",
    remit_fi:
      "Vastaa Helsingin kaupungin liikenneliikelaitoksesta (HKL): raitiovaunu- ja metroliikenteen operoinnista, lipuista ja matkakorteista sekä Suomenlinnan lautasta.",
    remit_en:
      "Responsible for the City of Helsinki's transport enterprise (HKL): tram and metro operations, tickets and travel cards, and the Suomenlinna ferry.",
    topics_sv: ["spårvagnstrafik och turtäthet", "metrons drift och tidtabeller", "HRT-biljetter och resekort", "Sveaborgsfärjans tidtabell", "spårvagnshållplatser"],
    topics_fi: ["raitiovaunuliikenne ja vuoroväli", "metron liikennöinti ja aikataulut", "HSL-liput ja matkakortit", "Suomenlinnan lautan aikataulu", "raitiovaunupysäkit"],
    topics_en: ["tram service and frequency", "metro operations and schedules", "HSL tickets and travel cards", "Suomenlinna ferry schedule", "tram stops"],
    members: [],
  },
  U480310: {
    name_en: "Culture and Library Section",
    remit_sv:
      "Bereder och beslutar i frågor om bibliotek och kultur inom kultur- och fritidssektorn, till exempel bibliotekens öppettider och kulturhusens verksamhet, som en del av kultur- och fritidsnämndens ansvarsområde.",
    remit_fi:
      "Valmistelee ja päättää kirjasto- ja kulttuuriasioista kulttuurin ja vapaa-ajan toimialalla, esimerkiksi kirjastojen aukioloajoista ja kulttuuritalojen toiminnasta, osana kulttuuri- ja vapaa-aikalautakunnan vastuualuetta.",
    remit_en:
      "Prepares and decides on library and culture matters within the culture and leisure sector, such as library opening hours and the activities of culture houses, as part of the Culture and Leisure Committee's remit.",
    topics_sv: ["bibliotek och öppettider", "kulturhus och kulturverksamhet", "konstutställningar i stadens regi"],
    topics_fi: ["kirjastot ja aukioloajat", "kulttuuritalot ja kulttuuritoiminta", "kaupungin taidenäyttelyt"],
    topics_en: ["libraries and opening hours", "culture houses and cultural activities", "city-run art exhibitions"],
    members: [],
  },
  U480100: {
    name_en: "Sports Section",
    remit_sv:
      "Bereder och beslutar i idrotts- och motionsfrågor inom kultur- och fritidssektorn, till exempel idrottsplatser, simhallar och motionsområden.",
    remit_fi:
      "Valmistelee ja päättää liikunta-asioista kulttuurin ja vapaa-ajan toimialalla, esimerkiksi liikuntapaikoista, uimahalleista ja ulkoilualueista.",
    remit_en:
      "Prepares and decides on sport and exercise matters within the culture and leisure sector, such as sports facilities, swimming halls, and outdoor recreation areas.",
    topics_sv: ["idrottsplatser och motionsområden", "simhallar", "konstgräsplaner och sporthallar", "skridskobanor och skidspår"],
    topics_fi: ["liikuntapaikat ja ulkoilualueet", "uimahallit", "tekonurmet ja liikuntahallit", "luistelu- ja hiihtoladut"],
    topics_en: ["sports facilities and outdoor recreation areas", "swimming halls", "artificial turf pitches and sports halls", "skating rinks and ski tracks"],
    members: [],
  },
  U480200: {
    name_en: "Youth Section",
    remit_sv:
      "Bereder och beslutar i ungdomsfrågor inom kultur- och fritidssektorn, till exempel ungdomsgårdarnas verksamhet och stöd till ungdomsarbete.",
    remit_fi:
      "Valmistelee ja päättää nuorisoasioista kulttuurin ja vapaa-ajan toimialalla, esimerkiksi nuorisotalojen toiminnasta ja nuorisotyön tuesta.",
    remit_en:
      "Prepares and decides on youth matters within the culture and leisure sector, such as the activities of youth centres and support for youth work.",
    topics_sv: ["ungdomsgårdar och deras verksamhet", "stöd till ungdomsföreningar", "uppsökande ungdomsarbete"],
    topics_fi: ["nuorisotalot ja niiden toiminta", "nuorisojärjestöjen tuki", "etsivä nuorisotyö"],
    topics_en: ["youth centres and their activities", "support for youth organisations", "outreach youth work"],
    members: [],
  },
};

const REGISTRY_EMAIL = "helsinki.kirjaamo@hel.fi";

// organization_hierarchy skips the immediate parent committee for jaostot/
// sektioner (it jumps straight from the toimiala to the section), so the
// generic hierarchy-walk in findParentId can't recover these. Verified live
// 2026-09-13 by comparing each section's hierarchy array against its actual
// parent lautakunta.
const PARENT_OVERRIDES = {
  U480310: "U480", // Kulttuuri- ja kirjastojaosto -> Kulttuuri- ja vapaa-aikalautakunta
  U480100: "U480", // Liikuntajaosto -> Kulttuuri- ja vapaa-aikalautakunta
  U480200: "U480", // Nuorisojaosto -> Kulttuuri- ja vapaa-aikalautakunta
  U420200: "U420", // Ruotsinkielinen jaosto -> Kasvatus- ja koulutuslautakunta
  U420100: "U420", // Suomenkielinen jaosto -> Kasvatus- ja koulutuslautakunta
  U540100: "U540", // Rakennusten ja yleisten alueiden jaosto -> Kaupunkiympäristölautakunta
  U540200: "U540", // Ympäristö- ja lupajaosto -> Kaupunkiympäristölautakunta
  U320100: "U320", // Sosiaali- ja terveyslautakunnan jaosto -> Sosiaali- ja terveyslautakunta
  U321110: "U321", // Pelastusjaosto -> Sosiaali-, terveys- ja pelastuslautakunta
  U321100: "U321", // Yksilöasioiden jaosto -> Sosiaali-, terveys- ja pelastuslautakunta
};

async function fetchOrgUnits(lang) {
  const res = await fetch(`${BASE}/paatokset_policymakers/_search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      size: 100,
      query: {
        bool: {
          filter: [{ term: { _language: lang } }, { terms: { field_organization_type: ORG_TYPES } }],
        },
      },
      _source: ["title", "field_organization_type", "field_sector_name", "field_policymaker_id", "organization_hierarchy", "url"],
    }),
  });
  if (!res.ok) throw new Error(`paatokset_policymakers svarade ${res.status}`);
  const data = await res.json();
  return data.hits.hits.map((h) => {
    const s = h._source;
    return {
      id: s.field_policymaker_id?.[0] ?? h._id,
      title: s.title?.[0] ?? null,
      bodyType: s.field_organization_type?.[0] ?? null,
      sector: s.field_sector_name?.[0] || null,
      hierarchy: s.organization_hierarchy ?? [],
      url: s.url?.[0] ?? null,
    };
  });
}

function findParentId(unit, byTitle) {
  // Walk the hierarchy from its own position backward; the first ancestor
  // title that is also one of our fetched org units is the parent.
  const ownIndex = unit.hierarchy.lastIndexOf(unit.title);
  const ancestors = ownIndex >= 0 ? unit.hierarchy.slice(0, ownIndex) : unit.hierarchy.slice(0, -1);
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const candidate = byTitle.get(ancestors[i]);
    if (candidate) return candidate.id;
  }
  return null;
}

async function main() {
  const [fi, sv] = await Promise.all([fetchOrgUnits("fi"), fetchOrgUnits("sv")]);

  const svByPolicymakerId = new Map(sv.map((u) => [u.id, u]));
  const fiByTitle = new Map(fi.map((u) => [u.title, u]));

  const bodies = fi.map((unit) => {
    const swedish = svByPolicymakerId.get(unit.id);
    const routable = ROUTABLE_IDS.has(unit.id);
    const hand = HAND_CONTENT[unit.id];
    const sourceUrlFi = unit.url ? `https://paatokset.hel.fi${unit.url}` : "";
    const sourceUrlSv = swedish?.url ? `https://paatokset.hel.fi${swedish.url}` : sourceUrlFi;

    return {
      id: unit.id,
      name_sv: swedish?.title ?? unit.title,
      name_fi: unit.title,
      // Helsinki doesn't publish an official English name for most bodies;
      // hand-authored ones get a working translation, the rest fall back to
      // the Finnish name since they're never shown to a user (routable: false).
      name_en: hand?.name_en ?? unit.title,
      sector: unit.sector,
      body_type: unit.bodyType,
      hierarchy: unit.hierarchy,
      routable,
      parent_id: PARENT_OVERRIDES[unit.id] ?? findParentId(unit, fiByTitle),
      source_url_fi: sourceUrlFi,
      source_url_sv: sourceUrlSv,
      source_url_en: sourceUrlFi,
      registry_email: REGISTRY_EMAIL,
      remit_sv: hand?.remit_sv ?? "",
      remit_fi: hand?.remit_fi ?? "",
      remit_en: hand?.remit_en ?? "",
      topics_sv: hand?.topics_sv ?? [],
      topics_fi: hand?.topics_fi ?? [],
      topics_en: hand?.topics_en ?? [],
      members: (hand?.members ?? []).map((m) => ({ ...m, source_url: sourceUrlFi })),
    };
  });

  bodies.sort((a, b) => (b.routable ? 1 : 0) - (a.routable ? 1 : 0) || a.name_fi.localeCompare(b.name_fi, "fi"));

  const output = {
    fetched_at: new Date().toISOString().slice(0, 10),
    source:
      "Generated from paatokset_policymakers (https://paatokset-elastic-proxy.api.hel.ninja), filtered to lautakunnat/nämnder, jaostot/sektioner, hallitus/styrelse and valtuusto/fullmäktige (excludes all viranhaltijat/office-holders). 'routable' marks the bodies a resident's everyday concern should reach — see lokalt-kontext/claude-kontext/02-byggordning.md step 3 for the exact criteria. remit_*/topics_*/members are hand-authored and only populated for routable bodies; the live index carries no remit text or contact details. Chairs are published office-holders; email stays null where no verified address exists — never guessed. Re-run scripts/generate-bodies.mjs to refresh identity/hierarchy fields; hand content must be re-applied by editing HAND_CONTENT in that script.",
    disclaimer_sv: "Detta är ett oberoende verktyg, inte en officiell tjänst från Helsingfors stad. Kontrollera alltid uppgifterna via källänken.",
    disclaimer_fi: "Tämä on riippumaton työkalu, ei Helsingin kaupungin virallinen palvelu. Tarkista tiedot aina lähdelinkistä.",
    disclaimer_en: "This is an independent tool, not an official service of the City of Helsinki. Always check the details via the source link.",
    bodies,
  };

  const fs = await import("node:fs/promises");
  await fs.writeFile(new URL("../data/bodies.json", import.meta.url), JSON.stringify(output, null, 2) + "\n");

  const routableCount = bodies.filter((b) => b.routable).length;
  console.log(`Skrev ${bodies.length} organ till data/bodies.json (${routableCount} routable).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
