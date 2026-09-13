# Byggordning

Fyra steg. Bygg dem i ordning. Varje steg ska fungera och vara demonstrerbart innan nästa påbörjas.

Den bärande principen: **bygg de fullständiga datakällorna först.**

| Lager | Täckning | Ordning |
|---|---|---|
| Ansvar (WFS) | Fullständig | 1 |
| Beslut och kommande behandling | Fullständig | 2 |
| Rutning till rätt organ | Fullständig | 3 |
| Tidigare anmälningar (Open311) | Cirka 12 % | 4 |

Den gamla byggspecen satte dubblettmatchningen först. Det var rätt när den var det enda som fanns. Nu är den det svagaste lagret och det dyraste att bygga, och den ska därför byggas sist.

---

## Steg 0: platsväljaren

Allt annat hänger på att vi har en punkt. Bygg den först, den är liten.

1. Knapp för webbläsarens `geolocation`. Ett klick, mest exakt.
2. Textfält för gatunamn som fallback.

Gatunamn till koordinat utan extern tjänst: matcha mot distinkta `alueen_nimi`-värden i WFS-lagret, eller mot `address`-värden i vår egen responstabell när den finns. Använd medianpunkten för träffarna.

Digitransits geokodning är uppgraderingen senare. Bygg inte in den nu, den kräver nyckel och är en extra felkälla.

**Klart när:** användaren kan ge en punkt på två sätt, och punkten syns på skärmen så att hen kan se om den är rätt.

---

## Steg 1: ansvarsskiktet

Det billigaste och starkaste lagret. Inget databasarbete, ingen backfill, inget modellanrop. Ett WFS-anrop på en punkt.

**Bygg:**

- `src/app/api/area-responsibility/route.ts`. In: `{ lat, lon, lang }`. Ut: närmaste eller överlappande yta med normaliserade ansvarsvärden, servicenivå och områdesnamn.
- Normaliseringstabell för fältvärdena, eftersom stavningen varierar i källan. Mappa till en intern enum: `kaupunki`, `kiinteisto`, `hkl`, `valtio`, `liikunta`, `ingen`.
- Komponent `<Responsibility>` som visar svaret på användarens språk.

**Texterna, tre fall:**

- Stadens ansvar: säg det, och lägg till servicenivån när `yllapidon_taso_selite` finns.
- Fastighetens eller någon annans ansvar: säg vem, och förklara i en mening vad användaren kan göra i stället. Visa ändå knappen vidare till staden.
- Ingen yta hittad: säg att vi inte kunde avgöra, och visa knappen vidare.

**Klart när:** en punkt på en trottoar med `talvikunnossapito: Kiinteistö / Yksityinen` ger ett annat och korrekt svar än en punkt på en körbana med `Kaupunkiympäristö`, på alla tre språken.

**Cacha** på avrundad koordinat i Supabase. Samma gata slås upp om och om igen.

---

## Steg 2: beslutslagret

**Bygg:**

- `src/app/api/decisions/route.ts`. In: `{ query, lang, limit }`. Ut: två listor.
  - `upcoming`: `field_is_decision: false` och `meeting_date` framåt i tiden. Detta är utfall B, det viktigaste.
  - `decided`: `field_is_decision: true`, sorterat på relevans och sedan datum.
- Deduplicera på `issue_id`, eftersom samma ärende finns på flera språk och ibland i flera behandlingar.
- Komponent `<Decisions>` med två block, `upcoming` överst.

**Texterna:**

- `upcoming`: ärendets rubrik, organ, mötesdatum, och en mening om att det går att påverka före mötet. Länk till `decision_url`.
- `decided`: rubrik, organ, datum, länk. Ingen tolkning av vad beslutet innebär.

**Gör inte:** sammanfatta `decision_content` med en modell i det här steget. Det är en förbättring senare. Visa rubriken och länka.

**Klart när:** en sökning på ett verkligt ämne, till exempel en namngiven gata eller "pyörätie", ger relevanta träffar i båda listorna, och `upcoming` är tom när den ska vara det i stället för att visa gammalt.

**Cacha** varje fråga i Supabase med kort livslängd. Miljövariabel för basadressen. Om indexet inte svarar: visa resten av skärmen utan beslutsblocket, aldrig ett felmeddelande över hela sidan.

---

## Steg 3: rutningen

**Bygg:**

- Ett engångsskript som hämtar `paatokset_policymakers` och genererar `data/bodies.json`.
- Fält per post: `id` (`field_policymaker_id`), `title`, `sector` (`field_sector_name`), `body_type` (`field_organization_type`), `hierarchy` (`organization_hierarchy`), `url`, plus fälten `routable` och `parent_id`.
- `routable: true` sätts för organ en invånare rimligen ska riktas till. Utgångspunkt: de fyra sektornämnderna, stadsstyrelsen, fullmäktige, liikenneliikelaitoksen johtokunta, och sektionerna för kultur och bibliotek, idrott och ungdom.
- `routable: false` för de tvåspråkiga sektionerna, yksilöasioiden jaosto (får aldrig ta emot fritext), tarkastuslautakunta, keskusvaalilautakunta, liikelaitosernas johtokunnat, och samtliga viranhaltijat.
- `bodiesForPrompt()` i `src/lib/bodies.ts` returnerar bara `routable: true`.

Ordförandena fylls i för hand. Lämna `email` som `null` där adressen inte är verifierad och låt registerkontakten bära kontakten. Att gissa en adress är värre än att inte ha någon.

**Klart när:** listan som går till klassificeraren innehåller ungefär tolv organ, inte 3 948, och rutningen är minst lika bra som i dag.

---

## Steg 4: tidigare anmälningar

Nu först. Det här är det gamla dubblettarbetet, och det är fortfarande värdefullt, men det står på tunn data.

**Datalagret:**

Tabell `feedback_reports` i Supabase: `service_request_id` (pk), `description`, `address`, `lat`, `lon`, `geom` (geography Point 4326, genererad), `status`, `status_notes`, `requested_at`, `updated_at`, `media_url`, `category`, `category_confidence`, `raw` (jsonb), `ingested_at`.

Aktivera `postgis` och `pg_trgm`. Index: GIST på `geom`, GIN med `gin_trgm_ops` på `description` och på `address`, btree på `requested_at` och `category`.

Edge Function `ingest-palaute`, två lägen:

- Löpande, varje timme: `start_date` = nu minus tre dygn. Upserta på `service_request_id`.
- Backfill, en gång: tolv månader bakåt, ett dygn per anrop. Logga antal per dygn i `ingest_log`. Räkna med ungefär 8 000 poster totalt.

**Klassificeringen** körs som ett separat steg efter inhämtningen, aldrig i samma transaktion, så att en misslyckad klassificering inte blockerar rådatan. Satser om 50 beskrivningar per modellanrop, billig modell, returnera `{service_request_id, category, confidence}`. Taxonomi:

`gatuunderhall`, `sno_och_halka`, `belysning`, `nedskrapning_och_graffiti`, `parkering`, `trafik_och_skyltar`, `park_och_gronomraden`, `lekplats_och_idrott`, `kollektivtrafik`, `vatten_och_avlopp`, `byggande_och_buller`, `ovrigt`

**Sökningen, två svar:**

Steg A, direkt, ren SQL, mål under 300 ms: `ST_DWithin(geom, punkt, 300)`, `requested_at` inom tolv månader, ranka på `similarity(description, text)` plus avstånd, högst 20 kandidater.

Steg B, när användaren skrivit klart, ett modellanrop, mål under 2 s: skicka de 20 kandidaterna plus användarens text och låt modellen märka varje som `samma`, `kanske` eller `annat`. Visa bara `samma` och `kanske`.

Radie: börja på 300 meter. Under 3 kandidater, vidga till 800 och märk som "i närheten". Aldrig mer.

**Gränssnittet:** varje träff visar datum, gatunamn, avstånd, beskrivningens första rad, stadens svarstext när `status_notes` finns, och en länk till `https://palautteet.hel.fi/julkaistu-palaute#/published/{service_request_id}`.

**Klart när:** testfilen nedan går igenom, och de tre felmodellerna beter sig rätt.

---

## Hur vi vet att steg 4 fungerar

Bygg `test/matching-cases.json` med minst 20 verkliga fall, tagna ur datan själv: hitta tjugo poster som uppenbart handlar om samma sak som en annan post i närheten, och skriv för varje ett par varianter av hur en invånare kunde ha formulerat det.

Måttet: i hur många fall ligger rätt befintlig anmälan bland de tre översta. Notera siffran före och efter varje ändring av radie, tröskel eller prompt. Utan den siffran är all justering gissning.

Tre felmodeller som ska kontrolleras uttryckligen:

- **Falsk träff.** Ett helt annat problem på samma gata får aldrig märkas `samma`. Det här är det farligaste felet, för det får någon att avstå från att anmäla något verkligt.
- **Tom plats.** Gatunamnet finns inte i datan. Svaret ska vara ett ärligt "vi hittade inget", inte en tom skärm.
- **Modellen nere.** Steg B faller tillbaka på steg A med mildare formulering, aldrig på ett felmeddelande.

---

## Skärmen, när allt är byggt

Ett flöde, fyra block, i fallande ordning efter hur säker datan är:

1. **Ansvar.** Fullständig data.
2. **Behandlas nu.** Fullständig data. Det här blocket är det mest värdefulla för användaren när det finns.
3. **Redan beslutat.** Fullständig data.
4. **Tidigare anmälningar.** Ofullständig data, och det ska stå.

Under allt: knappen vidare till staden. Alltid synlig, oavsett vad blocken ovanför säger.

---

## Vad som ändrats sedan byggspec-palautematchning.md (9.9.2026)

1. **Ordningen är omvänd.** Dubbletterna sist, inte först.
2. **Volymen.** Backfill ger ungefär 8 000 poster, inte tiotusentals. Den öppna datan är cirka en åttondel av stadens verkliga responsvolym.
3. **Träffarna länkas.** Publik sida per respons finns och är verifierad.
4. **Formuleringen vid noll träffar** måste säga "ingen publicerad anmälan", aldrig "inte anmält".
5. **Organen genereras**, de samlas inte in för hand. Bara ordförandena är handarbete.
6. **Nytt lager: ansvar**, WFS-uppslag på punkten, före inmatningen.
7. **Nytt lager: beslut och kommande behandling**, via det öppna beslutsindexet.
8. **Klassificeringen står kvar**, men stadens egen taxonomi existerar och ska efterfrågas hos staden. Om de öppnar den försvinner klassificeringssteget.

Det som står kvar oförändrat från den gamla specen: radielogiken, tvåstegssökningen, felmodellerna, och regeln att utlänken till stadens formulär aldrig tas bort.
