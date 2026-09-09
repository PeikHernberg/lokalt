# Byggspec: från utlänk till inbyggd dubblettsökning

Skriven 9.9.2026. Underlag för Claude Code. Läs hela filen innan du börjar koda.

Det här dokumentet beskriver två saker:

1. Hur Lokalt slutar länka ut till palautteet.hel.fi och i stället visar befintliga felanmälningar direkt i appen.
2. Hur `data/bodies.json` växer från 6 organ till stadens fullständiga uppsättning nämnder, jaostot och johtokunnat.

---

## Del 0: Vad som faktiskt finns i den öppna datan (verifierat 9.9.2026)

Det här är kontrollerat mot live-API:et, inte antaget. Flera av punkterna motsäger tidigare arbetsantaganden, så läs dem innan du planerar matchningen.

**Basadress:** `https://palautteet.hel.fi/public-api/open311-public-service/v1`

**Fält per respons (`/requests.json`):**
`service_request_id`, `status_notes`, `service_name`, `service_code`, `status`, `description`, `agency_responsible`, `service_notice`, `requested_datetime`, `updated_datetime`, `expected_datetime`, `address`, `media_url`, `extended_attributes`, `lat`, `long`.

**Vad som verkligen är ifyllt:**

| Fält | Verkligheten |
|---|---|
| `description` | Alltid ifylld. Fritext, oftast finska. Det här är vår viktigaste signal. |
| `lat` / `long` | Ifyllda. Vår viktigaste filtreringssignal. |
| `address` | Ifylld i ungefär tre av fyra poster, och då bara gatunamn utan husnummer. |
| `service_code` / `service_name` | **Tomma i praktiken.** I stickproven var de null respektive tom sträng i samtliga poster. |
| `status` | `READY` i de allra flesta fall, `PROCESSING` i enstaka. Inte `open` / `closed`. |
| `status_notes` | Ibland stadens faktiska svarstext. Guld när det finns. |
| `agency_responsible`, `service_notice`, `extended_attributes` | Tomma. |

**Konsekvens 1, den viktigaste:** planen att söka på "plats, servicekod och textlikhet" fungerar inte som skriven. Servicekoden finns bara i `/services.json`, som listar exakt fem koder på sektornivå (2805 Kasvatus, 2806 Kaupunkiympäristö, 2807 Kulttuuri, 2808 Sote, 2809 Yleinen). De enskilda responserna bär inte den koden. Vi kan alltså inte filtrera fram kaupunkiympäristös responser med ett API-anrop. **Vi måste klassificera texterna själva.**

Det är inte bara en kostnad, det är också ett argument: den struktur staden saknar i sitt eget öppna flöde är precis den vi lägger till. Ta med det till mötet på tisdag i stället för att lova en filtrering på servicekod som inte går att göra.

**Konsekvens 2:** `status` duger inte för att säga "öppen" eller "åtgärdad" i användargränssnittet. Skriv aldrig ut en statusetikett vi inte kan belägga. Visa i stället datum, antal och stadens svarstext när den finns.

**Konsekvens 3, om paginering:** `lat`, `long` och `radius` som query-parametrar ignoreras. Testat: samma poster kommer tillbaka med och utan dem. `start_date` och `end_date` fungerar däremot, och ett anrop ger max 100 poster. Därför:

- Historik hämtas genom att gå bakåt ett dygn i taget.
- Om ett dygn returnerar 100 poster är dygnet avkortat, dela då upp det i sexstimmarsfönster.
- All geografisk sökning måste ske i vår egen databas. Det är inte en optimering, det är enda vägen.

**Ingen API-nyckel behövs för läsning.** Skrivning kräver nyckel och ligger utanför den här specen.

---

## Del 1: Datalagret i Supabase

### 1.1 Tabellen

Skapa tabellen `feedback_reports`:

- `service_request_id` text, primärnyckel
- `description` text
- `address` text
- `lat` double precision, `lon` double precision
- `geom` geography(Point, 4326), genererad från lat/lon
- `status` text
- `status_notes` text
- `requested_at` timestamptz
- `updated_at` timestamptz
- `media_url` text
- `category` text, vår egen kategori, null tills den är satt
- `category_confidence` text
- `raw` jsonb, hela originalposten
- `ingested_at` timestamptz default now()

Aktivera `postgis` och `pg_trgm`. Index:

- GIST-index på `geom`
- GIN-index med `gin_trgm_ops` på `description`
- GIN-index med `gin_trgm_ops` på `address`
- btree på `requested_at`
- btree på `category`

### 1.2 Inhämtningen

En Supabase Edge Function, `ingest-palaute`, med två lägen:

**Löpande läge**, körs varje timme via cron: hämta `start_date` = nu minus 3 dygn, `end_date` = nu. Upserta på `service_request_id`. Tre dygn ger överlapp så att inget tappas om en körning missas, och upserten gör dubbelhämtning ofarlig.

**Backfill-läge**, körs manuellt en gång: gå från i dag och bakåt tolv månader, ett dygn per anrop. Om ett dygn ger exakt 100 poster, dela det i fyra sexstimmarsfönster och hämta om. Lägg in en paus på några hundra millisekunder mellan anropen. Logga antal poster per dygn till en enkel `ingest_log`-tabell så att luckor syns.

Tolv månader är rätt startvolym. Det räcker för att visa återkommande problem och håller matchningen relevant. Äldre än så är sällan samma grop.

### 1.3 Vår egen kategorisering

Eftersom stadens servicekod är tom sätter vi kategorin själva vid inhämtningen, inte vid sökningen. Det är avgörande för snabbheten.

Taxonomi, håll den kort och stadsdelsneutral:

`gatuunderhall`, `sno_och_halka`, `belysning`, `nedskrapning_och_graffiti`, `parkering`, `trafik_och_skyltar`, `park_och_gronomraden`, `lekplats_och_idrott`, `kollektivtrafik`, `vatten_och_avlopp`, `byggande_och_buller`, `ovrigt`

Kör klassificeringen i satser om 50 beskrivningar per modellanrop, med en instruktion som returnerar en array av `{service_request_id, category, confidence}`. Använd en billig modell. Skriv tillbaka `category` och `category_confidence`. Poster som inte kan klassificeras får `ovrigt`.

Kör det som ett andra steg efter inhämtningen, så att en misslyckad klassificering aldrig blockerar att rådatan sparas.

---

## Del 2: Matchningen

Det här är produkten. Allt annat är rörmokeri.

### 2.1 Två svar, inte ett

Användaren ska få ett snabbt svar medan hen skriver och ett bättre svar när hen är klar. Blanda inte ihop dem.

**Steg A, direkt (mål under 300 ms, ren SQL, inget modellanrop):**

1. Filtrera på `ST_DWithin(geom, användarens punkt, 300)`.
2. Filtrera på `requested_at > now() - interval '12 months'`.
3. Om vi redan har en kategori på användarens text, prioritera samma kategori men uteslut inte andra.
4. Ranka på `similarity(description, användarens text)` från `pg_trgm` plus avstånd.
5. Returnera högst 20 kandidater.

**Steg B, när användaren är klar med sin beskrivning (ett modellanrop, mål under 2 s):**

Skicka de 20 kandidaterna plus användarens text till modellen och be den märka varje kandidat som `samma`, `kanske` eller `annat`, med en kort motivering på användarens språk. Visa bara `samma` och `kanske`.

Det här är den arkitektoniskt viktiga poängen: trigram-likhet hittar inte "hål i asfalten" när någon annan skrev "farlig grop vid övergångsstället". Modellen gör det. Men modellen kan inte läsa 40 000 poster, så SQL:en måste först skära ned till en kort lista. Radien gör det jobbet.

### 2.2 Radien

Börja på 300 meter. Om färre än 3 kandidater hittas, vidga automatiskt till 800 meter och märk resultatet som "i närheten". Vidga aldrig mer än så. En felanmälan två kilometer bort är inte samma grop, och ett falskt "det här är redan anmält" är den enda felmodell som verkligen skadar produkten.

### 2.3 Platsen, utan extern geokodare

Användaren behöver inte skriva en exakt adress.

1. Knapp för webbläsarens `geolocation`, ett klick, mest exakt.
2. Textfält för gatunamn. Matcha texten mot distinkta `address`-värden i **vår egen tabell** med trigram, och använd medianpunkten för de träffarna som sökpunkt. Det är gratis, kräver ingen extern tjänst, och täcker per definition exakt de gator som förekommer i datan.

Digitransits geokodnings-API är uppgraderingen om det behövs senare. Bygg inte in det nu, det kräver en nyckel och en extra felkälla.

### 2.4 API-rutten

Ny route: `src/app/api/existing-reports/route.ts`

In: `{ description, lat, lon, streetQuery, lang, stage }` där `stage` är `"fast"` eller `"ranked"`.

Ut:
```
{
  matches: [{ id, description, address, requested_at, status_notes, distance_m, verdict }],
  cluster: { count, first_at, last_at },
  radius_used_m,
  disclaimer
}
```

`cluster.count` är antalet poster som märkts `samma`. Det är siffran som ska stå i rubriken: "Det här har anmälts 3 gånger i närheten, senast 12.8."

Använd samma försiktighet som i `route-question`: validera indata, returnera tydliga felkoder, och låt aldrig ett modellfel krascha rutten. Om steg B misslyckas, visa steg A:s resultat med en mildare formulering ("möjliga träffar i närheten").

---

## Del 3: Gränssnittet, det som ersätter utlänken

### 3.1 Det som finns i dag

I `src/app/app/page.tsx`:

```
const FELANMALAN_URL = "https://palautteet.hel.fi/";
const FELANMALAN_SEARCH_URL = "https://palautteet.hel.fi/hae-palautteita";
```

I den operativa spåret renderas två knappar, `t.operationalCheckExistingButton` som länkar till söksidan och `t.operationalButton` som länkar till anmälningsformuläret.

### 3.2 Det som ska hända

`FELANMALAN_SEARCH_URL` och dess knapp tas bort. I stället renderas en ny komponent, `<ExistingReports>`, direkt i den operativa panelen, i det läget klassificeraren redan har landat i `track: "operational"`.

Flödet i panelen:

1. Rubrik: det här är ett praktiskt fel. Behåll `t.operationalHeading` och `t.operationalExplain`.
2. Platsväljare: "använd min plats" eller gatunamn.
3. Så snart en plats finns, kör steg A och visa kandidaterna direkt.
4. Kör steg B och byt ut listan mot de rangordnade träffarna.
5. Varje träff visar datum, gatunamn, avstånd, beskrivningens första rad och stadens svarstext om `status_notes` finns.
6. Under listan: knappen "ställ dig bakom den här anmälan" per träff, och därunder `t.operationalButton` som fortfarande går till stadens formulär för en ny anmälan.
7. Om inga träffar hittas: säg det rakt ut, "vi hittade ingen tidigare anmälan om det här på den platsen", och visa anmälningsknappen.

Behåll `FELANMALAN_URL` och den utgående anmälningsknappen. Vi kan inte skriva in i stadens system utan nyckel, så den länken är fortfarande vägen framåt för en ny anmälan.

### 3.3 Språk

Nya i18n-nycklar i alla tre språk i `src/lib/i18n.ts`. Följ registret som redan finns i filen, naturligt talspråk, inga tankstreck. Nycklar som behövs minst:

`existingHeading`, `existingLocationPrompt`, `existingUseMyLocation`, `existingStreetPlaceholder`, `existingSearching`, `existingNoMatches`, `existingClusterSummary` (med platshållare för antal, gata och datum), `existingBackThisReport`, `existingBacked`, `existingCityReplied`, `existingNearbyNote`, `existingDisclaimer`.

Kom ihåg att beskrivningarna i datan nästan alltid är på finska, även när användaren kör gränssnittet på svenska. Översätt dem inte, visa dem som de är och låt rubriken och etiketterna bära språket. Att hitta på en översättning av en annan invånares text är fel sorts frihet.

### 3.4 "Ställ dig bakom"

Tabell `backings`: `id`, `service_request_id`, `created_at`, `session_hash`.

Vi kan inte skicka stödet in i stadens system utan skrivnyckel. Det stödet gör i dag är två saker: användaren får en kvittens på att hen inte behövde skriva en dubblett, och vi får den siffra som hela pitchen bygger på, alltså "400 meddelanden är ett ärende med 400 personer bakom".

**Flagga innan du bygger:** ingen inloggning, ingen lagrad persondata är kärnan i produktens positionering, och en `session_hash` är ändå ett spår. Använd en slumpad token i `sessionStorage` som försvinner när fliken stängs, spara ingen IP-adress, och ta upp frågan med Peik innan något annat läggs till. Det här är en positioneringsfråga, inte en teknisk detalj.

---

## Del 4: Från 6 till alla nämnder

### 4.1 Vad staden faktiskt har

Verifierat mot paatokset.hel.fi 9.9.2026. Utöver fullmäktige och stadsstyrelsen med två sektioner finns tjugo organ under `lautakunnat-ja-johtokunnat`:

**Fostran och utbildning**
- `kasvatus-ja-koulutuslautakunta`
- `kasvatus-ja-koulutuslautakunnan-suomenkielinen-jaosto`
- `kasvatus-ja-koulutuslautakunnan-ruotsinkielinen-jaosto`

**Stadsmiljö**
- `kaupunkiymparistolautakunta`
- `kaupunkiymparistolautakunnan-ymparisto-ja-lupajaosto`
- `kaupunkiymparistolautakunnan-rakennusten-ja-yleisten-alueiden-jaosto`
- `liikenneliikelaitoksen-johtokunta`

**Kultur och fritid**
- `kulttuuri-ja-vapaa-aikalautakunta`
- `kulttuuri-ja-vapaa-aikalautakunnan-kulttuuri-ja-kirjastojaosto`
- `kulttuuri-ja-vapaa-aikalautakunnan-liikuntajaosto`
- `kulttuuri-ja-vapaa-aikalautakunnan-nuorisojaosto`

**Social, hälsa och räddning**
- `sosiaali-terveys-ja-pelastuslautakunta`
- `sosiaali-terveys-ja-pelastuslautakunnan-pelastusjaosto`
- `sosiaali-terveys-ja-pelastuslautakunnan-yksiloasioiden-jaosto`

**Centralförvaltning**
- `tarkastuslautakunta`
- `keskusvaalilautakunta`
- `rakentamispalveluliikelaitoksen-johtokunta`
- `taloushallintopalveluliikelaitoksen-johtokunta`
- `tyollisyyspalveluliikelaitoksen-johtokunta`
- `palvelukeskusliikelaitoksen-johtokunta`

Plus `kaupunginvaltuusto`, `kaupunginhallitus`, `kaupunginhallituksen-konsernijaosto`, `kaupunginhallituksen-elinkeinojaosto`.

### 4.2 Alla ska in i datan, inte alla i klassificeraren

Det här är den viktigaste designbeslutet i den här delen, och det går emot instinkten "fler organ, bättre routing".

`bodiesForPrompt()` i `src/lib/bodies.ts` skickar hela listan till modellen. Om listan växer från 6 till 24 poster där tre av dem heter något med "kasvatus- ja koulutuslautakunta", blir routingen sämre, inte bättre. En invånare som skriver om skolmaten kan omöjligt veta om ärendet hör till nämnden eller till dess finskspråkiga sektion, och modellen kan det inte heller.

Lägg därför till två fält i varje post i `data/bodies.json`:

- `routable`: boolean. Bara `true` för organ en invånare rimligen ska riktas till.
- `parent_id`: id för moderorganet, null för de högsta.
- `toimiala`: sektorn, som text.
- `body_type`: `"valtuusto" | "hallitus" | "lautakunta" | "jaosto" | "johtokunta"`.

Ändra `bodiesForPrompt()` så att den bara returnerar poster med `routable: true`. Allt annat i filen finns för visning, för källänkar och för framtiden.

Sätt `routable: true` för: de fyra sektornämnderna, stadsstyrelsen, fullmäktige, `liikenneliikelaitoksen-johtokunta` (HST är begripligt för en invånare), och sektionerna för kultur och bibliotek, idrott och ungdom (de har egna, tydliga ansvarsområden som invånare faktiskt skriver om). Sätt `routable: false` för de tvåspråkiga sektionerna, yksilöasioiden jaosto (den handlar om enskilda personers ärenden och ska aldrig få ett fritextmeddelande), tarkastuslautakunta, keskusvaalilautakunta och liikelaitosernas johtokunnat.

Det ger ungefär tolv routningsbara organ av tjugofyra i filen. Om Peik vill ha fler routningsbara senare är det en enrads ändring per post, vilket är hela poängen med fältet.

### 4.3 Ordförandena

Det finns ingen fungerande öppen rajapinta för medlemmar. OpenAhjo stängdes i december 2024 och hade aldrig medlemsdata. `dev.hel.fi` svarar inte längre. Datasetsidan på avoindata.fi pekar fortfarande på den döda adressen och uppdaterades senast 2020. Medlemslistorna på paatokset.hel.fi laddas klientsidigt, så de går inte att hämta med ett vanligt anrop, bara med en riktig webbläsare.

Slutsatsen är att ordförandena samlas in för hand, en gång per fullmäktigeperiod. Det är tjugofyra rader, inte ett integrationsprojekt, och de ändras vart fjärde år. Bygg ingen automatik för det.

Metod: öppna varje slug ovan under `https://paatokset.hel.fi/sv/beslutsfattare/<slug>` i en webbläsare, läs av ordförande, parti och roll, och fyll i `members`-arrayen enligt den struktur som redan finns i filen. Behåll `source_url` per person. Sätt `fetched_at` till insamlingsdagen.

Notera att de fyra sektornämndernas ordförande är biträdande borgmästare, vilket redan stämmer i filen. Sektionernas och johtokuntornas ordförande är vanliga förtroendevalda, och deras e-postadresser är inte alltid publicerade i formen `fornamn.efternamn@hel.fi`. Där adressen inte är verifierad, lämna `email` som null och låt `registry_email` bära kontakten. Att gissa en adress är värre än att inte ha någon.

### 4.4 Klassificerarprompten

`CLASSIFY_SYSTEM` i `src/lib/classify-prompt.ts` behöver ingen strukturell ändring, men två tillägg:

1. En rad om att listan nu innehåller både nämnder och sektioner, och att sektioner bara ska väljas när ärendet uppenbart hör dit.
2. Behåll regeln om att aldrig returnera namn eller e-postadresser. Den blir viktigare, inte mindre viktig, när listan växer.

Den befintliga regeln att hellre välja `operational` än `policy` vid osäkerhet ska stå kvar. Med den nya dubblettsökningen är det operativa spåret dessutom det som ger mest värde, så den försiktigheten kostar nu ingenting.

---

## Del 5: Ordning att bygga i

1. Tabell, index och inhämtning. Backfill tolv månader. Kontrollera antal poster per månad.
2. Kategoriseringen som ett separat steg ovanpå den datan.
3. Steg A, ren SQL-sökning, testad i Supabase innan någon UI-kod skrivs.
4. `/api/existing-reports` med steg A.
5. `<ExistingReports>` i det operativa spåret, med utlänken borttagen.
6. Steg B, modellrangordningen.
7. "Ställ dig bakom", efter att privatfrågan är avgjord.
8. `bodies.json` med alla organ, `routable`-fältet och ordförandena.

Punkt 1 till 3 är det som avgör om produkten fungerar. Punkt 8 kan göras parallellt av vem som helst och blockerar ingenting.

---

## Del 6: Hur vi vet att det fungerar

Bygg en testfil, `test/matching-cases.json`, med minst 20 verkliga fall. Ta dem från datan själv: leta upp tjugo poster som uppenbart handlar om samma sak som en annan post i närheten, och skriv för varje ett par varianter av hur en invånare kunde ha formulerat det.

Måttet är enkelt: i hur många av fallen ligger den rätta befintliga anmälan bland de tre översta träffarna. Notera siffran innan och efter varje ändring i matchningen. Utan den siffran är all justering av radie, tröskelvärden och prompt ren gissning.

Kontrollera dessutom tre felmodeller uttryckligen:

- **Falsk träff.** En helt annan sorts problem på samma gata får aldrig märkas `samma`. Det här är det farligaste felet, eftersom det får en invånare att avstå från att anmäla något verkligt.
- **Tom plats.** Vad händer när gatunamnet inte finns i vår data. Svaret ska vara ett ärligt "vi hittade inget", inte en tom skärm.
- **Modellen nere.** Steg B ska falla tillbaka på steg A, inte på ett felmeddelande.

---

## Öppna frågor som inte ska gissas

1. Finns en publik webbsida per enskild respons på palautteet.hel.fi som vi kan länka till, eller bara API-svaret. Kontrollera i webbläsaren innan träffarna får en länk.
2. Hur stor andel av de ungefär 60 000 årliga responserna som faktiskt publiceras i det öppna flödet. Fråga staden på tisdag. Backfillen ger ett eget svar: räkna poster per månad och jämför mot 60 000 delat på tolv.
3. Om `session_hash` överhuvudtaget ska finnas, se 3.4.
