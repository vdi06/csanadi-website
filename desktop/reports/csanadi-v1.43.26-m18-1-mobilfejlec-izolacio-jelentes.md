# Csanádi weboldal v1.43.26 – mobilos fejléc második javítása

**Dátum:** 2026. november 20.  
**Állapot:** új helyi előnézet, külön jóváhagyásra vár.  
**Megőrzött kiindulási alap:** jóváhagyott v1.43.25, érintetlenül.  
**Közzététel:** sem FTP-, sem GitHub-feltöltés nem történt.

## Felhasználói hibajelentés

Az előző iPhone-képen a fejléc közösségi linkjei, címere, mottója és KRÉTA-eleme egymásra csúszott. A felhasználó megerősítette, hogy **a GitHubon és a v1.43.25 ZIP helyi tesztelésekor is hibás** a mobilos fejléc. Emiatt az előző egyszerű elrendezési módosítás nem tekinthető lezárt megoldásnak.

## A forrásban feltárt technikai ütközés

- A régebbi közös CSS-ekben a fejléc `.brand-row` eleme több helyen `display:flex!important` deklarációt kap, amely a régi asztali/szimmetrikus fejlécet mobilon is megjelenítheti. Más közös CSS-ek állapotfüggő osztályokat használnak.
- A v1.43.25 mobilos modul már külön mobilfejlécet épít és a régi `.brand-row` elrejtésére is tartalmaz szabályt, de ez önmagában nem minden lehetséges stílusütközés ellen védett.
- Az új és a régi fejléc egyidejű láthatósága megfelel a beküldött hibakép jellegének. **Valódi Safari DOM/CSS-inspektori mérés nélkül az ok nem tekinthető teljesen bizonyítottnak.**

## A v1.43.26-ban végrehajtott célzott javítás

1. A mobil CSS 768 px-ig két, azonos ID-val megnövelt specifitású szabállyal rejti el az eredeti fejlécsort és a hozzá tartozó két navigációt.
2. A mobil fejlécmodul az eredeti `.brand-row` inline `display` értékét, prioritását és `aria-hidden` állapotát a módosítás előtt megőrzi.
3. Telefonos nézetben **inline `display:none!important`** érvényes a régi fejlécre, és a duplikált felületet a képernyőolvasó elől is elrejti. Ez erősebb a közös szerzői CSS `!important` szabályainál.
   A régi elem `style` és `aria-hidden` változását célzott megfigyelő is követi, hogy egy később futó régi fejlécmodul ne tudja visszakapcsolni.
4. 769 px-től az eredeti inline `display` és `aria-hidden` állapot **maradéktalanul visszaáll**; a külön mobilos fejléc az eddigi működés szerint leválik.
5. A v1.43.25-ből megtartott, szimmetrikus 2–2 ikonos sor és a külön középre helyezett KRÉTA változatlanul működik.
6. Az asztali CSS/JS, a tartalmi JSON, a média, az eredeti asztali képváltó és az aloldalak adatai nem változtak; a közös belépési pontok csak a kiadási azonosítókban térnek el.

## Ellenőrzési eredmények és korlátok

| Kapu | Ellenőrzés | Állapot |
|---|---|---|
| M18.1–A | A régi `display:flex!important` szabály azonosítása, erősebb mobil elrejtés | **PASS** – forrásvizsgálat |
| M18.1–B | Valódi DOM-szerkezetet modellező próba: mobilon régi sor inline rejtve, desktopra váltás után eredeti `display` és ARIA visszaáll | **PASS** – DOM-szimuláció |
| M18.1–C | 9 mobil szélesség, két-két ikon és külön KRÉTA sor szimmetriája | **PASS** – statikus geometriai teszt |
| M18.1–D | Korábbi mobilos interakciók, dupla hero-védelem, 78 oldal, JSON és fájlhivatkozások | **PASS** – automatizált regresszió |
| Kiadásbiztonság | Teljes ZIP, 1333 fájl SHA-256 ellenőrzése, 26/26 regresszió visszabontás után, a v1.43.25 ellenőrzése | **PASS** – automatizált |
| Valós telefon | iPhone Safari, Android Chrome, tényleges pixelrender és érintési próbák | **NYITOTT** – ebben a környezetben nem volt elérhető |

Az automatizált ellenőrzés **nem igazolhatja**, hogy minden iPhone-on megszűnt a vizuális hiba. Az átvételhez az új ZIP-et valós telefonon, HTTP/HTTPS-alapú helyi vagy tesztkiszolgálón kell megnyitni.

**Kiadási mérleg:** 1333 fájl teljes SHA-256 leltára egyezik; a 26/26 automatikus ellenőrzés a ZIP külön visszabontása után is sikeres. További 82 JavaScript és 27 teszt-/építőszkript szintaxisa hibamentes. A v1.43.25 korábbi 1331 fájlos kiadása változatlan és ellenőrizhető. A valós, interaktív telefonos/asztali látványteszt továbbra is nyitott.

## Kézi átvételi ellenőrzőlista

1. iPhone Safari és Android Chrome álló/fekvő módban: a fejlécben egyszerre csak **egy** iskolanév/ikon-/címercsoport látszik.
2. 320, 360, 375, 390, 430, 600 és 768 CSS px: a Facebook, Instagram, KRÉTA, keresés, téma és a címer nem ér össze, a képre nem lógnak feliratok.
3. Görgetéskor a fejléc összecsukódik; a gombok elérhetőek és a menü a címerrel nyílik meg.
4. 768 → 769 → 768 px váltás: a mobilfejléc eltűnik, az eredeti desktop fejléc visszatér, majd a mobil újra bekapcsol; semmilyen duplikált vezérlő nem marad.
5. Mindkét színtéma, billentyűzetes fókusz, képernyőolvasó és legalább 200%-os betűméret.
6. A GitHubon megnyitott oldalra a csomag **nem kerül fel automatikusan**; az ottani hiba közzététel nélkül nem változhat.

## Külön végső jóváhagyási pont

- **A:** Jóváhagyom a v1.43.26 célzott mobilos fejlécjavítást a nyitott valós telefonos teszt tudomásulvételével. Közzététel nincs.
- **B:** Előbb valódi iPhone/Android tesztet kérek, és csak azután döntök.
- **C:** A mobilos fejléc továbbra is hibás; képernyőképpel és a megnyitott teszt URL-jével folytatjuk a hibakeresést.
