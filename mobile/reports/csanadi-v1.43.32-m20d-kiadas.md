# Csanádi weboldal – v1.43.32 / M20/D ellenőrzési és átadási jelentés

**Dátum:** 2026. november 21.  
**Státusz:** helyi fejlesztési kiadás; külön tulajdonosi jóváhagyásra vár.  
**Közzététel:** nem történt FTP-, GitHub- vagy más éles közzététel.

## Megőrzés, változási határ

- A jóváhagyott **v1.43.31** külön, érintetlen könyvtárban és eredeti teljes ZIP-ként megmarad. Az eredeti ZIP SHA-256 értéke:
  `6a32f18472a0e7a0f4cb27979f4b6d6e0b0485dfa44b9c0d88c678a96b809e5b`.
- A tényleges működési, CSS- és interakciós módosítások a **`mobile/`** könyvtárban történtek. Az asztali CSS, asztali navigáció, asztali képváltó és tartalmi JSON nem változott.
- A közös `index.html`, `script.js`, `js/app.js`, `js/blocks.js`, `js/hero-2026.js`, `service-worker.js` és `json/config.json` esetében kizárólag **verzióazonosító / cache-kulcs / import-URL** módosult, hogy a friss mobilos modul valóban betöltődjön, és ne jelenjen meg téves új-verzió értesítés. Nincs asztali komponens- vagy működési átírás.
- A kapcsolódó eszközök (`tools/`) és ez a jelentés (`reports/`) a ZIP részei.

## M20.1 – Mobilfejléc stabilizálása

**Változások:** a mobilfejléc görgetett állapotának egységes küszöbkezelése; a mobilböngésző címsorának, billentyűzetének és visszatérési állapotának kezelése `visualViewport.resize` és `pageshow` eseményekkel; a mobil ikonok jól látható fókuszkerete; korlátozott szélesség és biztonságos alsó távolság a görgetett fejléchez.

**Ellenőrzési kapu:** `verify-reboot-shell`, `verify-m18-header-layout`, `verify-m18-legacy-header-isolation`, `verify-m16-desktop-boundary` – **sikeres**. A `mobileHeaderScrolled` határértékei (0 / 36 / 37 px) külön is ellenőrzöttek.

## M20.2 – Mobilos filmes képváltó megbízhatósága

**Változások:** a `decode()` hívás időkorlátos, és a már feloldott időzítőt törli; a képcsere alatt `aria-busy` jelzi a folyamatot, amely a lezáráskor visszaáll; hiányzó `IntersectionObserver` mellett a görgetés és átméretezés is frissíti a láthatóságot. A hibás kép nem véglegesíti a képcserét, a lapozó később is használható.

**Ellenőrzési kapu:** `verify-reboot-hero`, `verify-m18-mobile-image-race`, `verify-m16-interactions` – **sikeres**. A teszt szimulálja azt is, amikor a dekódolás örökké függőben marad, és ellenőrzi a gombok felszabadulását.

## M20.3 – Mobilos aloldalak és akadálymentes panel

**Változások:** a `Fontos tájékoztatók` mobilos kinyitható részének fókuszmegőrzése töréspontváltáskor, Escape bezárás és fókusz-visszaadás belső vezérlőről; a régi böngészőkben hiányzó `MutationObserver` vagy `querySelector` tolerálása. 480 px-ig a további kapcsolódó listák és teljesítménykártyák egy oszlopba rendeződnek.

**Ellenőrzési kapu:** `verify-reboot-quality`, `verify-m13-mobile-text`, `verify-m13-viewer-dom`, `verify-m12-content-coverage`, `verify-m17-cross-platform-surfaces` – **sikeres**. A teljesen új M20 ellenőrzőkapu ugyanezeket és az Escape/fókusz szabályokat is ellenőrzi.

## M20.4 – Alacsony terhelés és frissítési egyezőség

**Változások:** `prefers-reduced-motion`, korlátozott adatkapcsolat vagy gyenge eszköz esetén csak telefonméreten a fejléc nagy felületű `backdrop-filter` effektusa lekapcsol. A három kiadási azonosító (`index.html` frissítésszkript, `json/config.json`, `service-worker.js`) egységesen **v1.43.32**; a mobilos modul teljes importlánca verziózott. Ez helyreteszi a korábban kimutatott v1.43.30-as frissítőazonosító és a v1.43.31-es konfiguráció közti téves eltérést.

**Ellenőrzési kapu:** `verify-m20-gates`, `verify-m16-desktop-boundary`, `verify-m17-desktop-hero-isolation` – **sikeres**. Éles, többverziós Service Worker aktiválási próba **nem** történt, ez nyitott.

## Átfogó regressziós és böngészős vizsgálat

- A kiadástól független örökölt statikus tesztek átfogó futtatásakor **33 ellenőrzőfájl közül 21 sikeres, 12 sikertelen**. A sikertelenek közül 11 történeti kiadási azonosítóhoz (`v1.43.29`, `v1.43.30`, `v1.43.31`) kötött elvárást vagy annak továbbhívását tartalmazta; egy (`verify-m20-browser`) az automatikus böngészőindítás környezeti tiltásán akadt el. Ezt nem számítjuk teljes körű hibamentes regressziós eredménynek. A **négy aktuális M20 kapu külön mind sikeres**.
- A `verify-m15-pwa-release` történeti szimuláció v1.43.30-at tekinti a „legújabb” kiadásnak, így a mostani v1.43.32-vel helyesen **nem** jelenít meg értesítést, de az eredeti 1.43.29-es összehasonlításra írt elvárása emiatt sikertelen. Ez tesztadat-elavulás, nem bizonyít új frissítéskezelési hibát.
- A grafikus Chromium helyi HTTP-oldalán **kézi ellenőrzés** történt: 300%-os böngészőnagyítással telefonméretű CSS nézet, egy soros fejlécikonok, görgetett fejléc, kezdőlapi képváltó következő gombja (03/09-ről 04/09-re lépett), dokumentumtár aloldal, a tájékoztatópanel megnyitása. A **100%-os asztali** dokumentumtáron a három eredeti tájékoztatókártya látszott, a mobilos kinyitható fejléc helyett.
- Az automatizált, headless Chromium-futtatást az operációs környezet megtagadta (`process_singleton_posix.cc: socket() failed: Operation not permitted`), ezért az opcionális `tools/verify-m20-browser.mjs` szkript nem teljesített automatikus futást. A grafikus böngészőben a fejlesztői eszközök is le vannak tiltva; a 300%-os zoom **nem egyenértékű** natív iPhone/Android emulációval.
- Valódi iOS/Android készülék, Safari/Chrome OS PWA-frissítés, forgatás, képernyőolvasó, minden aloldal és minden témaváltozat pixelpontos tesztje **nyitott**. Nincs olyan állítás, hogy ezeken a teszteken a kiadás már átment.

## Kiadási ZIP, SHA-256 és visszaállítás

- A `release-manifest.json` minden kiadott fájlt név, bájtméret és **SHA-256** szerint sorol fel; maga a leltár is a teljes ZIP-ben található.
- A reprodukálható ellenőrzés parancsa: `node tools/verify-v14332-release.mjs`. Ebben a teljes leltár és a négy aktuális kapu is ellenőrizhető.
- A teljes ZIP-integritás **hibamentes** volt (`unzip -tq`). A ZIP-et külön ideiglenes könyvtárba kicsomagolva a `verify-v14332-release.mjs` ismét **sikeres** lett, és a forrás valamint a visszaállított állományok `diff -qr` összehasonlítása **eltérést nem jelzett**. A ZIP saját SHA-256 lenyomatát az átadásnál külön közöljük (nem magában a ZIP-ben, hogy a beágyazott lenyomat ne legyen önhivatkozó).

## Döntési pont

A v1.43.32 M20/D kiadás az ellenőrzött helyi fejlesztési ZIP formájában adható át. **Külön tulajdonosi jóváhagyás szükséges** minden további fejlesztési szakasz vagy bármilyen közzététel előtt. A GitHub- és FTP-közzététel továbbra sem engedélyezett.
