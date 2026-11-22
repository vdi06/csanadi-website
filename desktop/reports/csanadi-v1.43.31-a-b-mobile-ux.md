# Csanádi weboldal v1.43.31 – A+B mobilos kiadási jelentés

Kiadási dátum: 2026. november 21.  
Állapot: **ellenőrzött előnézet – végső felhasználói jóváhagyásra vár**.  
Közzététel: **nem történt** (FTP/GitHub: tiltva).

## Bázis és hatókör

- Változatlan forrás: `csanadi-website-v1.43.30-full-desktop-mobile-audit.zip` (SHA-256: `985a27ea7e37a02618ce6200243485af99111d5fedf6e06b6e3e0cc357a4af4a`). A v1.43.30 eredeti mappáján nem módosítottunk.
- V1.43.31 kizárólag mobilnézeti működést módosít: `mobile/reboot-quality-v1-43-29.js`, `mobile/reboot-design-v1-43-29.css`.
- A közös `index.html`, `script.js`, `service-worker.js`, `json/config.json` kizárólag új mobilos erőforrás-verzióhoz, cache-frissítéshez szükséges kiadási hivatkozást/metadatot kapott. A közös asztali `css/`, `desktop/` és `js/` működési kód változatlan.

## A – Fontos tájékoztatók mobilos tömörítése

1. Legfeljebb 768 CSS-pixeles nézetben a nyelvi tájékoztató rövid, alapból zárt sávként indul.
2. A `Fontos tájékoztatók / Megnyitás` gomb `aria-expanded` és `aria-controls` állapotjelöléssel, jól látható fókuszkerettel rendelkezik; a nyitható belső rész rejtéséhez natív `hidden` attribútumot használ.
3. Megnyitva az eredeti magyar/angol váltó, a fejléc, a magyarázat és mindhárom információs kártya megmarad; a gomb `Bezárás` állapotúvá válik.
4. 769 CSS-pixeltől az eredeti háromkártyás asztali DOM visszaáll, a mobilos kapcsoló eltűnik.

**A ellenőrzési kapu:** PASS – forrásszintű állapot- és akadálymentességi ellenőrzés; valódi Chromiumban 300%-os zoomon a zárt és nyitott nézet látható és kattintható volt; 100%-on visszatért az eredeti három oszlopos tájékoztató. A magyar/angol váltó nyitott állapotban látszott. Natív VoiceOver/TalkBack próba nem állt rendelkezésre.

## B – Kapcsolódó tartalom telefonon

1. Legfeljebb 480 CSS-pixeles nézetben az `ext26-relation-grid` és az aloldali ajánló rácsának kártyái egyetlen teljes szélességű oszlopba kerülnek.
2. Minimum szélesség, tördelés és hézagok beállítása; 481 pixeltől a régi rács marad.
3. Asztali és tablet stílusfájl nem változott.

**B ellenőrzési kapu:** PASS – célzott mobilos CSS-rácsvizsgálat és Chromium 300%-os zoomon a dokumentumtár aloldali ajánlóinak egymás alatti, teljes szélességű megjelenése. A tényleges 320–480 px szélességű fizikai készülékek külön ellenőrzése nyitott.

## Regresszió és tesztelés

| Próba | Eredmény |
| --- | --- |
| JavaScript, helyi importok, CSS, médiák, 78 aloldal, 220 belső útvonal forrásauditja | PASS |
| Mobilos fejléc (scroll, címer, témaváltó és duplikációk), menü 1–3 szintje | PASS |
| Dokumentum-/képnéző, témaszűrés, lapozás, bezárás forrás-/DOM-próba | PASS |
| Telefon+asztal közös forrásintegritás | PASS |
| Chromium: zárt/nyitott tájékoztató, kártyák és asztali visszaváltás | PASS |
| V1.43.30 eredeti kiadás külön integritásellenőrzése | PASS |
| Teljes ZIP SHA-256 kiadási leltárral és kicsomagolási/visszaállítási próbával | PASS |

**Korlátok:** a 300%-os Chromium zoom a mobilos CSS-töréspont ellenőrzésére alkalmas, de nem egyenértékű egy natív iOS Safari vagy Android Chrome készüléktesztjével. Nem történt minden aloldalon egyenkénti pixelpontos, billentyűzetes és képernyőolvasós próba. A korábbi verzióból megmaradó, külön nem kért tartalmi és külső erőforrás-hibák nincsenek átírva.

## Átadás és elfogadás

- Teljes, minden forrásfájlt tartalmazó v1.43.31 ZIP és `release-manifest.json` SHA-256 leltár készült.
- Az eredeti v1.43.30 változatlanul megmarad, szükség esetén visszaállítható.
- **Végső jóváhagyás még szükséges.** Jóváhagyás nélkül sem FTP-re, sem GitHubra nem kerül semmi.
