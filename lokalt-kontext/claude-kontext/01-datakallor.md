# Datakällorna, verifierade 13.9.2026

Allt i den här filen är testat mot live-tjänsterna i webbläsare den 13.9.2026. Inget är antaget. Där något är oprövat står det uttryckligen.

Ingen av källorna kräver API-nyckel för läsning.

---

## 1. Ansvarsskiktet: stadens kartdata (WFS)

Svarar på frågan **är det här stadens ansvar, och vilken servicenivå gäller?**

**Bas:** `https://kartta.hel.fi/ws/geoserver/avoindata/wfs`
Öppen, ingen nyckel, CC BY 4.0, 304 lager. `outputFormat=application/json` fungerar. Ange alltid `srsName=EPSG:4326`.

### Huvudlager: `avoindata:YLRE_Katu_ja_viherosat_kaikki_alue`

Ytor med tre separata ansvarsfält:

| Fält | Svarar på |
|---|---|
| `talvikunnossapito` | Vem som skottar och sandar |
| `puhtaanapito` | Vem som städar |
| `rakenteellinen_kunnossapito` | Vem som lagar |

Observerade värden i ett stickprov på 3 000 ytor:

`Kaupunkiympäristö`, `Kiinteistö / Yksityinen`, `Kaupunkiliikenne Oy(HKL)`, `Valtio`, `Liikunta`, `Ei talvikunnossapitoa`, `Ei toimenpiteitä`.

Fältvärdena är fritext och stavningen varierar mellan fälten (`Kaupunkiliikenne Oy(HKL)` i ett fält, `Kaupunkiliikenne OY (HKL)` i ett annat). Normalisera med en mappningstabell i koden, matcha aldrig på exakt sträng.

Andra användbara fält på samma lager:

- `yllapidon_taso` och `yllapidon_taso_selite`, till exempel `III` och `Tonttikadut ja vähäliikenteiset klv:t`. Det här är servicenivån och ett ärligt svar på "varför plogas inte min gata".
- `alueen_nimi`, gatans eller områdets namn.
- `alueen_kayttotarkoitus`, till exempel `Asuntokatu`.
- `paatyyppi` och `alatyyppi`: `Ajorata`, `Kevyt liikenne`, `Nurmikot ja niityt`, `Puut, pensaat ja köynnökset`, `Silta`, `Varusteet`, `Muut alueet`.
- `tkp_kiireellisyys_lk`, ofta null.
- `materiaali`.

### Stödlager

**`avoindata:YLRE_Katualue_alue`**, gatuområden. Fält: `kadun_nimi`, `yllapitoluokka`, `kayttotarkoitus`, `kaupunginosa`, `osa_alue`, **`suurpiiri`**, `pinta_ala`, `rakentamisen_tila`.

`suurpiiri` är samma indelning som stadens stadiluotsar. Använd det fältet när stadsdelsvyer ska byggas.

Obs: fältet `omistaja` finns men innehåller ofta `Ei tietoa`. Använd det inte.

**`avoindata:Talvihoidon_priorisoitu_reitisto`**, prioriterade vinterrutter. Fält: `nimi`, `hoitotapa`, `urakoitsija`, `lisatiedot`. `lisatiedot` innehåller stadens uttalade kvalitetslöfte i klartext, till exempel att laatulupausaikaväli är klo 7 till 19 på vardagar. Guld vid snöärenden.

**`avoindata:Kiinteisto_alue`**, tomtgränser med `kiinteistotunnus`. Innehåller ingen ägare. Personägande ligger hos Maanmittauslaitos, är avgiftsbelagt och ska inte försökas.

### Färdigt anrop

```
GET https://kartta.hel.fi/ws/geoserver/avoindata/wfs
  ?service=WFS&version=2.0.0&request=GetFeature
  &typeNames=avoindata:YLRE_Katu_ja_viherosat_kaikki_alue
  &outputFormat=application/json
  &srsName=EPSG:4326
  &count=5
  &cql_filter=INTERSECTS(geom, POINT(24.9621 60.18779))
```

**Oprövat:** geometrikolumnens namn i `cql_filter`. Kör `request=DescribeFeatureType` på lagret först och läs av det rätta namnet. Allt annat i anropet är testat.

**Fallback om INTERSECTS strular:** använd `bbox=minLon,minLat,maxLon,maxLat,EPSG:4326` med en liten ruta runt punkten och välj närmaste yta i koden.

---

## 2. Beslutsindexet: stadens beslutssökning (Elasticsearch)

Svarar på frågorna **finns det redan ett beslut?** och **behandlas det just nu?**

**Bas:** `https://paatokset-elastic-proxy.api.hel.ninja`

POST med `Content-Type: application/json`. **Ingen autentisering.** Verifierat med riktiga frågor, svar 200.

Två index:

- `paatokset_decisions/_search`
- `paatokset_policymakers/_search`

### `paatokset_decisions`

**144 953 dokument**, meeting_date från 2015-01-23 till 2026-09-17.

Fält: `subject`, `issue_subject`, `issue_id` (formen `HEL-2026-014924`), `unique_issue_id`, `decision_content` (full HTML), `decision_url`, `meeting_date`, `organization_name`, `organization_above_name`, `organization_type`, `field_policymaker_id`, `field_is_decision`, `field_decision_section`, `top_category_code`, `top_category_name`, `sector_id`, `_language`, `color_class`, `status`, `more_decisions`.

**`field_is_decision` är det viktigaste fältet:**

| Värde | Antal | Betydelse |
|---|---|---|
| `true` | 144 542 | Beslutet är fattat |
| `false` | 411 | Ärendet ligger på en föredragningslista och är inte avgjort |

Med tidsfilter framåt: **54 ärenden på kommande möten** vid mätningen.

`decision_url` är en relativ sökväg, till exempel `/fi/asia/hel-2026-014924?paatos=d411a5ec-62fb-41af-b887-55569f32f26a`. Prefixa med `https://paatokset.hel.fi`.

`_language` är `fi` eller `sv`. Samma ärende finns ofta på båda, så filtrera på användarens språk eller deduplicera på `issue_id`.

**Fallgrop, viktig:** `meeting_date` i `_source` är epoch-sekunder, men ett `range`-filter med ett rått sekundtal filtrerar inte alls, det matchar allt. Använd ISO-sträng:

```json
{"range": {"meeting_date": {"gte": "2026-09-13T00:00:00Z"}}}
```

### Färdiga anrop

Kommande ärenden i ett organ:

```
POST https://paatokset-elastic-proxy.api.hel.ninja/paatokset_decisions/_search
{
  "size": 50,
  "query": {"bool": {"must": [
    {"range": {"meeting_date": {"gte": "2026-09-13T00:00:00Z"}}},
    {"term": {"organization_name": "Kaupunkiympäristölautakunta"}}
  ]}},
  "sort": [{"meeting_date": "asc"}],
  "_source": ["subject","issue_id","organization_name","meeting_date","decision_url","field_is_decision"]
}
```

Fritextsökning på ämne:

```
POST https://paatokset-elastic-proxy.api.hel.ninja/paatokset_decisions/_search
{
  "size": 10,
  "query": {"bool": {
    "must": [{"multi_match": {"query": "pyörätie Mechelininkatu", "fields": ["subject^3","issue_subject^2","decision_content"]}}],
    "filter": [{"term": {"_language": "fi"}}]
  }},
  "sort": ["_score", {"meeting_date": "desc"}],
  "_source": ["subject","issue_id","organization_name","meeting_date","decision_url","field_is_decision","top_category_name"]
}
```

### `paatokset_policymakers`

**3 948 beslutsfattare.** Fält: `title`, `decisionmaker_combined_title`, `field_dm_org_name`, `field_organization_type` (`Lautakunta`, `Jaosto`, `Johtokunta`, `Viranhaltija`, `Hallitus`, `Valtuusto`), `field_sector_name`, `field_policymaker_id`, **`organization_hierarchy`** (array, full trädstig uppifrån och ned), `url`, `_language`.

Det här ersätter handinsamlingen av organ i den gamla byggspecen. Generera `data/bodies.json` härifrån.

**Vad som inte finns:** personnamn och e-postadresser. Indexet beskriver ämbetet, inte personen. Ordförandena samlas fortfarande in för hand, en gång per fullmäktigeperiod. Gissa aldrig en e-postadress.

### Varning om driftsäkerhet

`api.hel.ninja` är stadens driftdomän för sin egen frontend, inte en publicerad öppen rajapinta. Den kan byta adress utan varsel. Därför:

- Lägg adressen i en miljövariabel, aldrig hårdkodad.
- Bygg felhantering som degraderar snällt: om indexet inte svarar ska resten av skärmen fungera och beslutsblocket bara utebli.
- Cacha svaren på vanliga frågor i Supabase.

---

## 3. Responsdatan: Open311

Svarar på frågan **har någon annan anmält samma sak?**

**Bas:** `https://palautteet.hel.fi/public-api/open311-public-service/v1`

- `/services.json`, fem servicekoder på sektornivå.
- `/requests.json`, responserna.
- `/requests/<id>.json`, en enskild.

Läsning kräver ingen nyckel. Skrivning kräver nyckel och ligger utanför det här arbetet.

### Volymen, och varför den är viktig

Uppmätt 13.9.2026: **15 till 37 poster per dygn**. En hel vecka i början av september gav 152. Det blir ungefär **7 000 till 10 000 poster per år**.

Staden tar emot ungefär 60 000 responser per år. **Den öppna datan är alltså ungefär en åttondel av verkligheten.**

Konsekvenser som måste synas i produkten:

1. Tolv månaders backfill ger ungefär 8 000 poster, inte tiotusentals.
2. Gränssnittet får aldrig säga "det här är inte anmält". Det ska säga att ingen publicerad anmälan hittades.
3. Dubblettmatchningen är därför det svagaste av de fyra lagren, inte det starkaste. Se `02-byggordning.md`.

### Fälten, och vad som faktiskt är ifyllt

| Fält | Verkligheten |
|---|---|
| `description` | Alltid ifylld. Fritext, oftast finska |
| `lat`, `long` | Ifyllda, som strängar. Konvertera |
| `address` | Ifylld i ungefär tre av fyra, bara gatunamn utan husnummer |
| `service_code`, `service_name` | Tomma i praktiken |
| `status` | `READY` eller `PROCESSING`, inte `open` / `closed` |
| `status_notes` | Ibland stadens faktiska svarstext. Guld när den finns |
| `agency_responsible`, `service_notice`, `extended_attributes` | Tomma |

### Publik sida per respons: ja

**`https://palautteet.hel.fi/julkaistu-palaute#/published/{service_request_id}`**

Verifierat. Varje träff i gränssnittet ska länkas dit.

### Paginering

`start_date` och `end_date` fungerar. `lat`, `long` och `radius` som query-parametrar **ignoreras**, samma poster kommer tillbaka med och utan dem. All geografisk sökning måste ske i er egen databas.

Ett anrop ger max 100 poster. Hämta historik ett dygn i taget. Om ett dygn ger exakt 100 är det avkortat, dela då i sexstimmarsfönster. Vid de uppmätta volymerna händer det sällan.

### Stadens egen klassificering finns, men inte åt oss

Stadens söksida använder ett annat, internt API med stadens tvånivåklassificering på tre språk, till exempel `kymp.7 Liikenne- ja katusuunnittelu` och `kymp.10.5.3 Roskisten tyhjennys`, plus titel och gatuadress med husnummer.

Det API:et kräver autentisering och svarar 401. **Använd det inte och försök inte kringgå det.** Det står här bara så att ingen slösar tid på att leta efter något som inte är öppet, och för att staden ska kunna frågas om att ta med klassificeringen i Open311.

Tills dess klassificerar Lokalt själv. Se `02-byggordning.md` steg 4.

---

## 4. Kuulutukset: skrapning, senare

`https://paatokset.hel.fi/fi/kuulutukset-ja-ilmoitukset`

**731 kuulutukset och ilmoitukset.** Vanlig Drupal-vy, 32 rader per sida, ungefär 23 sidor. Ingen JSON-export, `?_format=json` svarar 406.

Tre relevanta ämnessidor:

- `/fi/kuulutukset-ja-ilmoitukset/kaava-asiat-ja-rakentaminen`
- `/fi/kuulutukset-ja-ilmoitukset/katu-ja-puistosuunnitelmat`
- `/fi/kuulutukset-ja-ilmoitukset/nahtavilla-olevat-suunnitelmat`

Ligger uppe i ungefär ett år, en del bara under nähtävilläolo-tiden.

**Bygg inte det här ännu.** Beslutsindexet ger samma värde utan skrapning. Kuulutukserna är ett komplement senare.

---

## 5. Vad som inte finns

- **Ahjo-rajapintan.** Nedlagd. Noll träffar på hri.fi, gamla dataset-adressen svarar 404. Elastic-proxyn ersätter den och är bättre.
- **Ägare per tomt.** Maanmittauslaitos, avgiftsbelagt, delvis skyddat. Behövs inte, frågan är ansvar och inte ägande.
- **Namn och e-post till förtroendevalda.** Ingen öppen källa. Handarbete.
- **Sju åttondelar av responsdatan.** Kräver avtal med staden.
