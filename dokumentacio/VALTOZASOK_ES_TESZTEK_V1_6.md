# Csanádi weboldal — v1.6.0 átadási jegyzőkönyv

**Dátum:** 2026. november 16.  
**Kiinduló csomag:** `csanadi website v1.5.0.zip`  
**Új csomag:** `csanadi website v1.6.0.zip`  
**Fejlesztési döntés:** A+B+C+D együtt, a korábbi sorrend megtartásával.

## A) Élő honlap és működés ellenőrzése

- Megnyitottuk a GitHub Pages-en elérhető kezdőlapot és a térképes aloldalt.
- A ténylegesen betöltött JavaScript-URL **`script.js?v=1.2.0`**, vagyis az éles honlap nem a felhasználónál lévő v1.5.0 vagy az új v1.6.0 kiadás.
- Az éles térképes aloldalon a **Főmenü megnyitása** gomb kattintására nem jelent meg a menü a vizsgált állapotban; ez a korábbi verzió megmaradt hibája, **nem** az új v1.6.0 futási tesztjének eredménye.
- A v1.5.0 csomagban korábban javított aloldali menükezelés és kompakt fejléc megmaradt. A v1.6.0 vizuális és eszközös tesztjéhez **előbb a ZIP teljes feltöltése szükséges**.
- Éles oldal vagy FTP-tárhely módosítása **nem** történt.

## B) Mobilnézet, elrendezés és akadálymentesség

- A `tools/` mappa **13 karbantartó HTML-oldala** egységes, sötétkék–arany prémium megjelenítést kapott a `css/tools-unified-v1.css` és a közös `tools/tool-ui-2026.js` révén.
- A fejlécek, navigációs és műveleti gombok középre rendezve, egységesen legalább 44 px magasak; a fókusz körvonala billentyűzettel jól megkülönböztethető.
- A rácsok és navigációs csoportok keskeny kijelzőn egy oszlopba vagy több sorba törnek, a fő tartalmak vízszintesen középen maradnak. A hosszú olvasószövegek indokolt esetben balra zártak.
- A csökkentett mozgás beállítását a közös segédoldal-stílus is tiszteletben tartja.
- Új `v1.6.0` gyorsítótár-azonosítók kerültek a kezdőlap, az aloldali és segédprogram-szkriptek fontos belépési pontjaira.
- **Korlát:** az új ZIP valódi telefonos és képernyőolvasós auditja még hiányzik; a helyi Chromium a futtató környezet biztonsági korlátozása miatt nem indult el.

## C) A tools/ és assets/ média-/dokumentumkezelő javítása

Az előző csomagban meglévő importálás, metaadatszerkesztés, fájlcsere, törlésre jelölés, tömeges műveletek, felhasználási jegyzék, duplikátumriport, változás-/médiatár-ZIP-export és böngészőtől függő helyi mappamentés megmaradt. Ezeket a következőkkel egészítettük ki:

1. **Teljes fizikai assets-katalógus.** A v1.5.0 nyilvántartás 540 elemet tartalmazott; 88 fájl hiányzott belőle. Az új katalógus **628/628** állományt fed le, köztük **87 QR-kódot** és az egyébként kimaradt mobilképet. Egy meglévő fájlt sem töröltünk.
2. **Reszponzív képek kezelése.** Az `assets/media/web/responsive/` almappa **353 fájlja** immár elfogadott útvonal és kiválasztható célmappa a médiakezelőben; az ottani fájlok átnevezése és metaadatszerkesztése nem akad el az útvonalellenőrzésen.
3. **QR-mappa.** Az `assets/qr/` külön kiválasztható célmappa; a QR-kódok megjelennek a teljes állománylistában.
4. **Atomi űrlapvalidálás.** Hiányzó címnél, megfelelő jóváhagyás hiányában vagy kötelező képleírás nélkül a szerkesztő nem módosítja félkész állapotban a kiválasztott elemet.
5. **Közzétételi kapu.** Új nyilvános kép, grafika, videó vagy dokumentum publikálásához a szerkesztőnek külön jelölnie kell, hogy ellenőrizte a felhasználási jogosultságot és a kapcsolódó adatvédelmi követelményeket. Kép/grafika esetén alternatív szöveg is kell. Ez **nem helyettesíti** az intézményi engedélyek tényleges dokumentálását.
6. **Megismételhető katalógusellenőrző.** `node tools/reconcile-assets-catalog.js` csak ellenőriz; a `--write` kapcsolóval a nyilvántartás hiányzó elemei pótolhatók, alapértelmezetten közzététel nélkül.
7. **Regressziós próba.** `node tools/test-media-manager-v1-6.js` hét állapot- és validációs esetet sikeresen ellenőrzött.

Fontos: a böngészőben előkészített törlések **nem törlik automatikusan** a távoli FTP-n lévő fájlokat. A médiakezelő teljes médiatár-ZIP-je nem azonos a teljes honlap-kiadási ZIP-jével; utóbbi ez a külön átadott v1.6.0 csomag.

## D) Tartalmi, média- és hivatkozási ellenőrzés

- A központi `structure.json` alapján **65 regisztrált oldal** és 65 különböző útvonal áttekintése továbbra is sikeres; a korábbi 65×31 szabálymátrix megmaradt.
- Az automatikus hivatkozásvizsgálat **0 régi iskolai webhelyre mutató tényleges webes URL-célt** és **0 hiányzó helyi HTML-hivatkozást** jelzett a vizsgált körben.
- A médiaregiszterben **114 médiatétel** szerepel. Ezek közül a nyilvántartás szerint **29 engedélyezésre vár**, **4 csak előnézeti státuszú**; 80 generált, 1 felhasználó által rendelkezésre bocsátott tétel. Az állapotjelölések **nem bizonyítanak jogtisztaságot**.
- A katalógusban **146 képnél hiányzik a külön megadott alternatív szöveg**. Ezek egy része lehet dekoratív, de a hiányt tételesen ellenőrizni kell.
- A korábbi 31 szabálymátrixban **55 H jelű tartalmi hitelesítési teendő** maradt. Ezekhez az intézmény tényszerű jóváhagyása és szükség esetén forrásdokumentum kell.
- A meglévő képek és dokumentumok felhasználási jogát, a személyes adatok publikálhatóságát, valamint a QR-kódok tényleges cél-URL-jeit **nem állítottuk ellenőrzés nélkül igazoltnak**.

## Lefuttatott ellenőrzések

| Ellenőrzés | Eredmény |
|---|---|
| `node tools/test-release-v1-6.js` | 30/30 sikeres automatizált ellenőrzés |
| `node tools/test-media-manager-v1-6.js` | 7/7 sikeres állapot-/validációs ellenőrzés |
| `node tools/reconcile-assets-catalog.js` | 628 fizikai állomány = 628 katalógustétel, 0 hiány, 0 árva rekord |
| JSON-fájlok feldolgozhatósága | sikeres |
| JavaScript-szintaktikai ellenőrzés | sikeres |
| Bejegyzett SPA-útvonalak | 65/65 |
| Bootstrap | változatlanul verzióhoz kötött CDN, helyi másolat nélkül |
| Statikus FTP-kompatibilitás | szerveroldali kód vagy GitHub Actions-függés nélkül megtartva |
| Mobilos, több böngészős, képernyőolvasós vizuális audit | **még nem igazolt** |
| Valódi publikált v1.6.0 end-to-end böngészőteszt | **feltöltésig nem lehetséges** |

## Feltételek, nyitott feladatok

1. A v1.6.0 fájljait a GitHub `csanadi-website` repository **gyökerébe** kell feltölteni. A helyi ZIP átadása nem helyettesíti a publikálást.
2. Feltöltés után asztali és mobil nézetben ismét tesztelni kell az aloldali menünyitást, az összecsukódó fejlécet, a billentyűzetes navigációt és a segédoldalakat.
3. A média-/dokumentumkezelő exportjait egy valós, külön erre fenntartott helyi tesztmappán is végig kell próbálni importálás, szerkesztés, csere, törlés, visszavonás és újbóli betöltés sorrendben.
4. A 29+4 bizonytalan státuszú médiatétel, a képleírások, az intézményi tartalmi adatok és az engedélyek emberi ellenőrzése nyitott.
5. **Nem** indítottuk el az assets/ médiáinak későbbre ütemezett körülbelül hatszoros bővítését: ez külön fejlesztési kör marad.

Az új kiadás minden korábbi működő JSON-oldalt, médiafájlt, menüt és eszközt tartalmaz. Sem a GitHubot, sem az iskola FTP-tárhelyét nem módosítottuk.
