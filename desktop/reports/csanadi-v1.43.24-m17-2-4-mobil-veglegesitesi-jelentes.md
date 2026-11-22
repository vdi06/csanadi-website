# Csanádi weboldal — v1.43.24 / M17.2–M17.4 mobilos véglegesítési jelentés

**Dátum:** 2026. november 20.  
**Állapot:** helyi fejlesztési előnézet, külön végső jóváhagyásra vár.  
**Megőrzött visszaállítási alap:** jóváhagyott **v1.43.23**, változatlanul.  
**Módosítási kör:** kizárólag mobilos CSS/JavaScript; közös belépési pontokban csak kiadási verzió- és mobilmodul-hivatkozások.  
**Közzététel:** sem FTP, sem GitHub, sem éles feltöltés nem történt.

## Összefoglaló

A v1.43.24 a jóváhagyott v1.43.23 M17.1 dupla nyitókép elleni szerkezeti javítását **megőrzi**, és a következő három külön ellenőrzési kaput valósítja meg:

1. **M17.2:** mobilos körmenü reszponzív magassághatára és ütközésmentesebb elrendezése, hosszú mobilos tartalom- és nézőfeliratok célzott tördelése.
2. **M17.3:** képbetöltési és dekódolási tulajdonságok desktopra visszaváltáskor történő helyreállítása, valamint menu, filmes hero, dokumentum- és galérianéző, téma, kereső/Bootstrap-modál, billentyűzet, reduced-motion, PWA-frissítés forrás- és DOM-regressziója.
3. **M17.4:** 1.43.24 verziózott teljes statikus csomag, minden fájl SHA-256 ellenőrzése, új kaputesztek, ZIP, elkülönített visszaállítási próba.

**Fontos tesztkorlát:** statikus és DOM-szimulációs tesztekből nem lehet valós renderelt mobilos vagy asztali látványt bizonyítottnak tekinteni. A valódi Chromium indítása ebben a környezetben ismét `socket() failed: Operation not permitted` hibával megállt. Fizikai iOS/Android, VoiceOver/TalkBack, tényleges PDF render, Core Web Vitals és telepített PWA frissítés ezért **NYITOTT**.

A meglévő böngészőn keresztüli helyi előnézetet a böngésző biztonsági szabályzata is blokkolta, így a külön kért **asztali és telefonos teljes megjelenési próba** szintén nyitott. A hozzáférési korlátot nem kerültük meg.

## M17.2 — Vizuális, reszponzív és szövegillesztési kapu

### A tényleges fejlesztés

- A hat főmenükártya két részből állhat: menünyitó kártya és közvetlen oldallink. A régi 375 px magas körpályán a jobb/bal oldali párok egymásra lóghattak.
- A körmenü 420–768 CSS px szélességen **csak legalább 760 px magas** kijelzőn kapcsol be; alacsonyabb képernyőn a meglévő rácsos módot használja.
- A magasabb képernyőn használt körpálya **420 px magas**, és a jobb/bal oldali kártyapárok függőleges pozíciói távolabb kerültek egymástól.
- A hosszú nevekhez és feliratokhoz a meglévő mobilos kártyákban, hírekben, dolgozói blokkokban, dokumentumokban, galériaelemekben és nézőfejlécekben célzott `overflow-wrap`, `min-width` és mobilos tördelési védelem került.
- Az asztali CSS, menü és képváltó változatlan.

### Ellenőrzés

- `verify-m17-responsive-visual.mjs`: **13 kijelző-/töréspont-kombináció**, 768/769 px-es határ, rövid kijelzős rács, magasabb kijelzős kör, konzervatív 145 px-es kártyamodellel ütközésvizsgálat.
- Korábbi `verify-m11-mobile-matrix.mjs`, `verify-m12-content-coverage.mjs`, `verify-m13-mobile-text.mjs`, `verify-m15-responsive.mjs` regressziók.
- A központi tartalomregiszter jelenlegi forrásellenőrzése: **78 oldal, 254 blokk**.

**Automatizált kapu:** **PASS**. A valós 320–768 px-es vizuális túlcsordulás-ellenőrzés, mindkét téma képernyőképes összevetése és 200%/400% nagyítás: **NYITOTT**. A geometriai modell nem valódi böngészős pixelszintű mérés.

## M17.3 — Használhatóság, akadálymentesség és erőforrás-visszaállítás

### A tényleges fejlesztés

- A mobilos minőségmodul korábban az oldal képeihez szükség szerint `loading="lazy"` és `decoding="async"` attribútumokat állított. Ezek desktopra váltva az eredeti elemen maradhattak.
- Az új változat csak az általa módosított képeket tartja nyilván, elmenti eredeti értékeiket, és **769 px-től visszaállítja** a korábbi képbetöltési/dekódolási állapotot.
- A később lecsatolt képeket kiveszi a saját nyilvántartásából, így nem tartja meg indokolatlanul a korábbi SPA-oldalak képeit.
- Nem változott az eredeti asztali képváltó, kereső, navigáció vagy tartalmi adatrendszer.

### Ellenőrzés

- `verify-reboot-quality.mjs`: mobilos lazy/async beállítás, adatforgalom-kímélő mód, videó-leállítás és visszaállítás, asztali `aria`/`tabindex` és képattribútumok helyreállítása.
- `verify-m17-interactions-a11y.mjs`: mobilmenü, filmes hero, háromszintű navigáció, saját dokumentum-/képgaléria-néző, fókusz, Escape, háttér `inert`, csökkentett mozgás és PWA értesítés automatikus regressziója.
- A korábbi M13–M16 fokozatok tesztjei megmaradtak.

**Automatizált kapu:** **PASS**. A valódi Safari/Chrome érintés, iOS/Android megjelenés, fizikai billentyűzet, VoiceOver/TalkBack, WCAG 2.2 AA audit, valós PDF-dokumentumok és LCP/INP/CLS mérés: **NYITOTT**. Nincs megalapozott állítás teljes WCAG-konformitásról vagy terepi teljesítményküszöb teljesítéséről.

## M17.4 — ZIP, teljes SHA-256 leltár, regresszió és visszaállítás

### A tényleges fejlesztés

- A mobilos modulok és kötelező import-/cache-verziók `v1.43.24` / `1.43.24` azonosítót kapnak.
- Új `verify-m17-release-safety.mjs` ellenőrzi a mobilos leltárt, a verziókat, a PWA-szervizmunkás azonosítóját, valamint az M17.1–M17.3 kaputesztek eredményét.
- A teljes `release-manifest.json` minden csomagolt fájlhoz méretet és SHA-256 lenyomatot tartalmaz. A manifest önmagát nem leltározza, hogy a fájlonkénti lenyomat ne legyen önhivatkozó.
- Az utólag kért **telefonos és asztali teljes felületellenőrzés** részeként külön `verify-m17-cross-platform-surfaces.mjs` vizsgálja a 78 aloldalt, az egyedi útvonalakat, mind a 111 tartalmi JSON-t, 5923 helyi fájlhivatkozást, valamint a 183 médiatétel 819 képi változatát. Minden hivatkozott helyi fájl létezik. E vizsgálat **forrásintegritási**, nem tényleges felhasználói interakciós vagy pixelszintű vizsgálat.
- A ZIP egy elkülönített könyvtárba kicsomagolva is kötelezően megfelel a teljes regressziós vizsgálatnak.
- A v1.43.23 referenciát a kiadás nem írja felül.

### Asztali és tartalmi fájlvédelem

- `desktop/`, `css/`, `assets/` és a tartalmi `json/` állományok referencia-ellenőrzése SHA-256 alapján történik; csak a `json/config.json` cache-verziója változhat.
- Az `index.html`, `script.js`, `service-worker.js`, `js/app.js`, `js/blocks.js`, `js/hero-2026.js` és `js/home-v1-41.js` közös SPA/desktop fájlok normalizált hash-ellenőrzése kiszűri a kötelező kiadási verzió-/modulnév-változáson túli módosítást.
- A `mobile/` könyvtárban kizárólag az öt aktuális `v1-43-24` modul maradhat.
- A dupla nyitókép elleni M17.1 `DocumentFragment`/komment-horgony szerkezeti védelemnek meg kell maradnia.
- Közös fejléc, desktop navigáció, hero, oldaltartalom, körmenü-overlay, Bootstrap, témaváltás és 768/769 px-es mobil–asztali határ külön forrásellenőrzést kapott. Az asztali alapfájlokon nincs funkcionális módosítás.
- A teljes felület JS-forrásállományainak **82 JavaScript és 25 Node-szkript** szintaktikai vizsgálata (`node --check`) sikeres. Ez nem igazolja a külső Bootstrap-CDN elérhetőségét vagy a böngészőbeli események tényleges lefutását.

**Automatizált kapu:** **PASS** — a teljes ZIP 1329 leltározott fájljának SHA-256 ellenőrzése sikeres; a csomag sértetlenségi tesztje sikeres; az elkülönített könyvtárba visszabontott csomagon mind a **24/24** automatizált ellenőrzőszkript lefutott. A megőrzött v1.43.23 csomag eredeti, 1324 fájlos leltárpróbája továbbra is sikeres. A valós böngészős és telepített offline/PWA-kiadásfrissítési teszt **NYITOTT**.

## Az ellenőrzési kapuk összesített státusza

| Szakasz | Automatizált kapu | Valós eszközös kapu | Közzététel |
|---|---|---|---|
| M17.2 | **PASS** – töréspont, tördelési szabály, körgeometria, tartalomregiszter | **NYITOTT** – tényleges képernyőképek | Nincs |
| M17.3 | **PASS** – DOM-interakció, képattribútumok visszaállítása, ARIA és PWA-szimuláció | **NYITOTT** – iOS/Android, képernyőolvasó, CWV/PDF | Nincs |
| M17.4 | **PASS** – 1329 SHA-256 fájl, teljes ZIP, 24/24 ellenőrzés visszabontás után, eredeti 1324 fájlos v1.43.23 megőrizve | **NYITOTT** – valós telepített PWA/Service Worker frissítés | Nincs |

## Javasolt valós eszközös ellenőrzési minta

1. iPhone Safari és Android Chrome, 320/360/375/390/412/430/600/768 CSS px és fekvő kijelző. Mindkét téma, rövid és hosszú feliratok.
2. 768 → 769 → 768 px váltás: nincs dupla fejléc, nincs dupla hero, a desktop képváltó változatlan.
3. Mobilmenü fő-, második és harmadik szint, közvetlen oldalnyitás, Escape, visszalépés, fókusz és képernyőforgatás.
4. Kezdőlap valamennyi kártyatípusa, hírek, naptár, dolgozók, sporteredmények, keresés, lapozás és galériaszűrés.
5. Képgaléria és tényleges dokumentum megnyitás, lapozás, nagyítás, bezárás, háttérgörgetés és fókuszvisszaállítás.
6. VoiceOver/TalkBack, billentyűzetes kezelés, 200%/400% nagyítás, reduced-motion, gyengébb eszköz/adatforgalom-kímélés.
7. Telepített korábbi PWA-ról új verzió: „Frissítés”, „Később”, offline/online váltás; Core Web Vitals terepi mérések csak megfelelő adatok esetén.

## Külön végső jóváhagyási döntések

**A — Jóváhagyom a v1.43.24 M17.2–M17.4 mobilos kiadást** a dokumentáltan nyitott valós böngészős, készülékes, hozzáférhetőségi és teljesítménymérési ellenőrzések tudomásulvételével. A következő fejlesztést csak előkészítjük; közzététel nincs.

**B — Előbb valós telefonon és asztali böngészőben ellenőrzöm.** A jóváhagyás függőben marad.

**C — Javítást kérek.** A további hibákat célzottan kell javítani, újabb regresszióval és közzététel nélkül.
