# Kontext för Claude Code: Lokalt

Läs hela den här mappen innan du skriver kod. Tre filer, i den här ordningen:

1. `README.md`, den här filen. Vad produkten är och vilka regler som gäller.
2. `01-datakallor.md`. De fyra datakällorna, verifierade live 13.9.2026, med färdiga anrop.
3. `02-byggordning.md`. Vad som byggs, i vilken ordning, och när varje steg är klart.

Den äldre filen `byggspec-palautematchning.md` (9.9.2026) är delvis föråldrad. Där de två motsäger varandra gäller den här mappen. `02-byggordning.md` listar exakt vad som ändrats.

## Vad Lokalt är

Ett verktyg som hjälper en invånare i Helsingfors att få veta vad staden redan vet om hens problem, och att skicka rätt sak till rätt ställe.

Ingen inloggning. Ingen lagrad persondata. Lokalt skickar ingenting i användarens namn.

Tre språk: finska, svenska, engelska.

Stack: Next.js, Supabase, Vercel. Den som äger projektet kodar inte. Förklara i löptext vad du gör och varför, inte bara i kod.

## Produktens kärna

Invånaren skriver en mening och anger en plats. Lokalt svarar med vad staden redan vet:

1. **Är det här stadens ansvar?** Uppslag mot stadens kartdata.
2. **Finns det redan ett beslut?** Uppslag mot stadens beslutsindex.
3. **Behandlas det just nu?** Kommande möten i samma index.
4. **Har någon annan anmält samma sak?** Uppslag mot stadens publicerade responser.

Sedan, och först då, hjälper Lokalt användaren skicka rätt sak till rätt mottagare.

Allt detta bygger på öppna källor. Ingen API-nyckel, inget avtal med staden, ingen arbetstid från staden.

## Regler som inte får brytas

**Lokalt blockerar aldrig.** Oavsett vad datan säger ska användaren alltid kunna gå vidare och skicka sitt ärende. Knappen för det ska vara synlig och utan friktion. Om datan säger att en trottoar är fastighetsägarens ansvar och datan har fel, är det användaren som har rätt.

**Påstå aldrig mer än datan bär.** Den öppna responsdatan är ungefär en åttondel av all respons staden tar emot. Skriv därför aldrig "det här är inte anmält". Skriv "vi hittade ingen publicerad anmälan om det här". Samma princip gäller överallt: om ett fält är tomt i källan, skriv inte ut en etikett som låtsas att det inte är det.

**Översätt inte andras text.** Beskrivningarna i responsdatan är nästan alltid på finska, även när gränssnittet körs på svenska. Visa dem som de är. Etiketterna och rubrikerna bär språket.

**Ingen persondata.** Ingen inloggning, ingen IP, ingen e-post sparad. Om något steg verkar kräva det, stanna och fråga innan du bygger.

**Inga tankstreck i användartext.** Använd kolon, semikolon eller komma. Registret är samtalande, inte formellt.

## Språk och i18n

Alla nya strängar in i `src/lib/i18n.ts` på alla tre språk, enligt registret som redan finns i filen. Hitta aldrig på en sträng direkt i en komponent.
