# Csanádi weboldal v1.43.18 – M12/D mobilos használhatósági és vizuális véglegesítési előnézet

**Kiadás:** v1.43.18; teljes állománykészletet tartalmazó ZIP; megrendelői végső jóváhagyásra vár.  
**Keltezés:** 2026. november 20.  
**Kiindulás:** a megrendelő által jóváhagyott v1.43.17 M11/D kiadás külön, változatlanul megőrzött példánya.  
**Hatókör:** kizárólag a 768 CSS-pixel szélességig aktiválódó, saját újraírású mobilos felület. A közös belépőfájlokban csak a kiadási URL-/cache-/modulverzió változhat; az asztali logika, az adatok, a képek és az egyéb közös CSS változatlan.  
**Közzététel:** FTP-feltöltés, GitHub-módosítás és éles közzététel nem történt.

## Összefoglaló és az ellenőrzési kapuk

| Kapu | Elkészült változás | Elvégzett bizonyító próba | Állapot |
|---|---|---|---|
| **M12.1 – Mobilnavigáció** | A menü az aktuális aloldalt `aria-current="page"` jelöléssel látja el, a második/harmadik szintre belépéskor és visszalépéskor felülre görget, az új szint címe fókuszt kap. | Háromszintű menü ál-DOM-próbája, közvetlen oldallink, visszalépés és kompakt/rács mód | **Automatikus próba megfelelt** |
| **M12.2 – Filmes fejléc és képváltó** | A telefonos rögzített fejléc tényleges kompakt magasságához igazított horgony-/görgetési eltolás; egyetlen dia esetén nem aktívak az előre-hátra vezérlők. | Fejléc és hero külön ál-DOM-próbája, szünetelés/visszacsatolás, egyképes eset | **Automatikus próba megfelelt** |
| **M12.3 – Aloldalak és összetett tartalom** | Mobilos naptár, pedagógusnévsor, csengetési rend, dokumentumtár, galéria, keresési eredmény és széles adattáblák elrendezésének kiegészítése; tartalmi regiszter auditja. | **78** regisztrált oldal, **254** tartalmi blokk, három menüszint, kijelölt komponensstílusok | **Forrás-/struktúrapróba megfelelt** |
| **M12.4 – Akadálymentesség és kiadás** | A valóban vízszintesen görgethető naptár- és táblarégiók mobilon billentyűzettel fókuszálhatók és `role="region"` + magyar `aria-label` jelölést kapnak; asztali nézetre váltva a hozzáadott attribútumok visszaállnak. | Minőségi ál-DOM-próba és asztali elkülönítés; reszponzív mátrix; teljes SHA-/ZIP-visszaállítási teszt | **Automatikus és csomagpróba megfelelt; élő mobilteszt nyitott** |

Az eredmények **forrás-, szimulált DOM- és állományintegritási teszteket** jelölnek, nem teljes körű iPhone/Android böngészős vizuális elfogadást.

## M12.1 – Mobilmenü, tájékozódás és szintváltás

1. A telefonos menü belső oldallinkje a tényleges `location.hash` alapján megjelöli az éppen megnyitott oldalt. Ez hasznos a látó felhasználónak megjeleníthető állapothoz és a képernyőolvasós tájékozódáshoz.
2. Második vagy harmadik szint megnyitásakor, illetve visszalépéskor a menü belső görgetési pozíciója `0` lesz, így nem marad félúton egy korábban megtekintett hosszú lista.
3. A szintcím fókuszkezelése és a menübezárás meglévő logikája megmaradt. A kör/rács megjelenítés korábbi, magasság- és szélességalapú adaptív döntése változatlan.
4. A mobilmenü kizárólag a `(max-width: 768px)` tartományban aktiválódik. A korábban eltávolított szélső/floating asztali menügombot nem állítottuk vissza.

**Ellenőrzés:** `node tools/verify-reboot-menu.mjs`, különösen 1→2→3, direkt link, vissza, fókusz, `aria-current`, felülre görgetés, kompakt/kör nézet.

## M12.2 – Mobilfejléc, kezdőkép és a mozgás állapotai

1. A telefonos összecsukódó fejléc rögzített magassága valójában változhat az intézménynév és a kijelző miatt. A mobilos héj most a kompakt fejléc mért magasságát **72–240 px közé szorítva** teszi elérhetővé a `--cs-mb-sticky-offset` CSS-változóban. Csak állapotváltásnál/méretezéskor kell újramérni, nem minden görgetéses animációs képkockában.
2. A `scroll-padding-top` és az oldalcímek `scroll-margin-top` ehhez a változóhoz alkalmazkodnak. Így belső link vagy horgonycél nem bújik olyan könnyen a fix fejléc alá.
3. Asztali nézetre visszatéréskor a mobilos változó törlődik, nem írja felül a desktop görgetési szabályait.
4. Egyetlen rendelkezésre álló képnél a mobilos diaváltó mindkét nyílgombját letiltja; több képnél marad a swipe, a kézi léptetés, az automatikus időzítés és a mozgáscsökkentés.
5. A route-bejelentés a tényleges oldal `h1` címe alapján történik, és csak szükség esetén használja a technikai útvonalat.

**Ellenőrzés:** `node tools/verify-reboot-shell.mjs` és `node tools/verify-reboot-hero.mjs`. Nem változott a desktop nyitóanimációja, a kapu arany áttetszősége vagy a desktop képváltó.

## M12.3 – Összes regisztrált aloldal és meglévő komponens

A `json/structure.json` szerinti audit: **78 egyedileg regisztrált JSON-aloldal** (6 első szintű, 38 második szintű, 34 harmadik szintű menüpont) és **254 tartalmi blokk**. A vizsgálat nem azt állítja, hogy minden blokkot kézzel megnyitottunk mobilos böngészőben; azt ellenőrzi, hogy minden regisztrált oldal létezik, érvényes JSON, van címe és blokklistája.

A `mobile/reboot-design-v1-43-18.css` célzott szabályai:

- Naptár: vízszintesen görgethető táblarész, a 350 px-es belső rács megőrzésével; legalább 44 px magas naptári nap-vezérlők. 320 px-es készüléken a naptár **szándékosan belül görgethető**, nem zsugorodik olvashatatlanná.
- Pedagógusnévsor: a fejléc, a szűrők és a kártyák középre rendezett, mobileszközön is elférő kezelése.
- Csengetés és táblázatok: szélességkorlátozás, a széles adatlapoknál belső görgetés.
- Dokumentumtár: szűrők, kezelősáv és dokumentumkártyák mobilszélességhez igazítása; a már meglévő saját dokumentumnéző/PDF-eszköztár marad.
- Galériák: témához kötött képválogatás és a már meglévő saját mobilos Bootstrap-képnéző támogatása; az alapadatokat és a képfájlokat nem másoltuk vagy módosítottuk.
- Információs és keresési panelek: egyoszlopos, lehetőleg vízszintesen középre igazított megjelenés.

**Ellenőrzés:** `node tools/verify-m12-content-coverage.mjs`; a lényeges komponensszelektorokat és a naptár/PDF-néző kritikus szabályait is vizsgálja.

## M12.4 – Használhatóság, hozzáférés és regresszió

**Akadálymentesség.** A vízszintesen túlcsorduló régiók csak szükség esetén kapnak `tabindex="0"`, `role="region"` és magyar `aria-label` attribútumokat; a korábban a weboldal által beállított értékeket nem írja felül. A mobilmód elhagyásakor az eredeti attribútumok visszaállnak. A normál `prefers-reduced-motion`, kontrasztos fókusz és min. 44 px célméret-szabályok megmaradtak. **Valós VoiceOver/TalkBack és WCAG audit még nem történt.**

**Reszponzivitás.** A korábban jóváhagyott 12 profil statikus mátrixa változatlanul lefut: 320×568, 360×640, 375×812, 390×844, 412×915, 420×648, 420×650, 430×932, 768×1024, 768×480, 769×1024 és 900×420. A `768px` határ felett az új mobilos CSS és a mobilmenü nem aktiválódhat. Ezek a **kódparaméterek vizsgálatai**, nem pixelpontos telefonos képernyőképek.

**Desktopvédelem.** A kiadási próba megőrzi a v1.43.15-ös referencia-állományok ellenőrzött állapotát:

| Állománycsoport | Változatlan, SHA-256-tal ellenőrzött fájlok |
|---|---:|
| `desktop/` | 7 |
| `css/` | 66 |
| `assets/` | 828 |
| `json/`, kivéve `json/config.json` cache-verzió | 110 |

Emellett hét közös belépési pont programlogikáját ellenőrzi: `index.html`, `script.js`, `service-worker.js`, `js/app.js`, `js/blocks.js`, `js/hero-2026.js` és `js/home-v1-41.js`. A hash-összevetés **kizárólag** az aktuális modul-/URL-/cache-verziósztringeket normalizálja; így az esetleges tényleges desktoplogikai módosítás hibát okozna.

**Mobilos kiadás és cache.** Öt és csak öt `mobile/reboot-*` modul kerül a ZIP-be, mind `v1-43-18` jelöléssel. A `service-worker.js`, a `json/config.json`, az `index.html`, valamint a modulimportok ugyanarra a `1.43.18` kiadásra mutatnak. A legacy mobilkód nem került vissza.

### Ellenőrző parancsok

```bash
node tools/verify-reboot-menu.mjs
node tools/verify-reboot-shell.mjs
node tools/verify-reboot-hero.mjs
node tools/verify-reboot-quality.mjs
node tools/verify-m11-mobile-matrix.mjs
node tools/verify-m12-content-coverage.mjs
node tools/verify-reboot-release.mjs
```

Az összes fenti teszt a fejlesztői munkapéldányból és a külön ZIP-ből visszanyert példányból is lefuttatandó. A teljes ZIP tartalmazza az alkalmazást, az összes változatlan adatot/médiát, a `tools/` ellenőrző programokat, a korábbi jelentéseket, ezt a jelentést és a `release-manifest.json` SHA-256 állománylistát.

## Megmaradó nyitott, valós eszközös tesztek

| Vizsgálat | Állapot | Elfogadás előtt szükséges |
|---|---|---|
| iPhone Safari, több iOS-kijelző | **Nyitott** | Valós megjelenítés, görgetés, menü, naptár és PDF-néző |
| Android Chrome, különböző felbontások | **Nyitott** | Ugyanezek, álló/fekvő mód, gesztus és koppintás |
| VoiceOver és TalkBack | **Nyitott** | A valódi fókuszsorrend, átmenetek és görgethető régiók hangos kipróbálása |
| Filmes animáció és mért teljesítmény | **Nyitott** | Valódi képkockasebesség, hosszú oldal, gyenge hálózat, reduced-motion |
| PWA/service worker frissítése a telefonon | **Nyitott** | v1.43.17 → v1.43.18 upgrade és cache-érvényesülés egy telepített példányon |
| Bootstrap CDN és helyi `file://` megnyitás | **Külső feltétel** | Az alkalmazás helyes kiszolgálásához HTTP(S) és a külső függőségek elérése szükséges |

A rendelkezésre álló környezetből nem volt hitelesen elérhető helyi iOS/Android valódi megjelenítés. **Nem állítjuk**, hogy a nyitott ellenőrzések teljesültek; a kódteszt és az ál-DOM-próba nem képernyőfelvétel vagy valódi böngészőteszt.

## Visszaállítás és átadás

1. A jóváhagyott **v1.43.17** forrás és teljes ZIP külön megőrzött visszaállítási alap. Nem írtuk felül a korábbi kiadást.
2. A **v1.43.18** külön mappában fejlődött; a végső csomagot külön helyre lehet kicsomagolni, és ugyanazokkal a tesztekkel fájl- és programlogikai szinten ellenőrizni.
3. Ez a próbavisszaállítás a **ZIP teljességét és önellenőrzését** bizonyítja, nem élő webkiszolgáló visszaállítását, és nem bizonyítja, hogy egy telefonon a korábbi service worker azonnal eltűnik.
4. FTP, GitHub és nyilvános közzététel engedély hiányában nem történt.

## Külön végső jóváhagyási pont

**A)** A megrendelő jóváhagyja a v1.43.18 M12/D kiadást **a dokumentált nyitott élő mobilos tesztek tudomásulvételével**. Ez nem ad közzétételi engedélyt.  
**B)** Először valódi iPhone/Android és akadálymentességi tesztet kér, a jóváhagyást fenntartja.  
**C)** A jelentés valamelyik pontjára célzott javítást kér, és az új verzió előtt ismételt ellenőrzést ír elő.
