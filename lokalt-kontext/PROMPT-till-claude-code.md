# Prompten att klistra in i Claude Code

Lägg först mappen `claude-kontext/` i roten av Lokalt-projektet. Klistra sedan in det här.

---

Läs hela mappen `claude-kontext/` innan du gör något: `README.md`, sedan `01-datakallor.md`, sedan `02-byggordning.md`. Där de motsäger den äldre `byggspec-palautematchning.md` gäller `claude-kontext/`.

Jag kodar inte. Förklara i löptext vad du gör och varför, innan du gör det, och håll förklaringarna korta.

Börja inte koda direkt. Gör först det här, i tur och ordning:

1. Läs kodbasen och beskriv för mig hur den nuvarande appen är uppbyggd: vilka sidor som finns, hur klassificeraren och rutningen fungerar i dag, var utlänkarna till palautteet.hel.fi ligger, och hur i18n-filen är strukturerad. Högst femton rader.

2. Verifiera de två anrop som är märkta som oprövade i `01-datakallor.md`: geometrikolumnens namn för `cql_filter` mot WFS-lagret, via `DescribeFeatureType`. Gör ett riktigt anrop och visa mig resultatet.

3. Föreslå en plan för **steg 0 och steg 1** i `02-byggordning.md`, alltså platsväljaren och ansvarsskiktet. Bara de två. Visa mig vilka filer du skapar och vilka du ändrar, och vänta på mitt ja innan du skriver kod.

Regler som gäller genom hela arbetet:

- Lokalt blockerar aldrig. Knappen vidare till staden ska alltid vara synlig, oavsett vad datan säger.
- Påstå aldrig mer än datan bär. Aldrig "det här är inte anmält", bara "ingen publicerad anmälan hittades".
- Inga tankstreck i text som användaren ser.
- Alla nya strängar in i `src/lib/i18n.ts` på finska, svenska och engelska.
- Ingen inloggning och ingen persondata. Om ett steg verkar kräva det, stanna och fråga mig.
- Basadresser i miljövariabler, aldrig hårdkodade.
- Om en extern tjänst inte svarar ska resten av skärmen fungera utan den.

Bygg ett steg i taget. Visa mig att steget fungerar innan du går vidare till nästa.
