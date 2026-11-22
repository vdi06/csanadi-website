# Csanádi weboldal — v1.43.22 / M16/D mobilos stabilizálási jelentés

**Kiadás:** `csanadi-website-v1.43.22-m16-mobile-stabilization-preview`  
**Dátum:** 2026. november 20.  
**Állapot:** elkülönített, nem közzétett fejlesztési előnézet; végső jóváhagyásra vár.  
**Visszaállítási alap:** a jóváhagyott **v1.43.21** eredeti projektje és ZIP-kiadása változatlan.  
**Engedélyezett fejlesztési határ:** kizárólag a mobilos (legfeljebb 768 CSS px) megjelenés és viselkedés. Közös belépési pontokban csak kötelező kiadási verzió- és mobilmodul-fájlnév-hivatkozások cserélődtek.  
**Közzététel:** FTP: **nem történt**; GitHub: **nem történt**; egyéb éles publikálás: **nem történt**.

## A korábban jelzett asztali hiba

A felhasználó külön jelezte, hogy a v1.43.21 körüli módosítások után az **asztali elrendezés szétesett**, pedig nem volt engedélyezve asztali fejlesztés. A források összevetése konkrét, valószínű hibaforrást tárt fel:

1. A `mobile/reboot-design` stíluslap **csak 768 px-ig töltődött be**, miközben a közös alkalmazásindító a mobilfejlécet széles képernyőn is létrehozta és beszúrta a desktop fejlécbe.
2. A mobilos filmes nyitóelem ugyancsak asztali szélességen is bekerült a kezdőlap DOM-jába, így a mobil stíluslap hiányában önállóan láthatóvá válhatott.
3. A mobilfejléc a korábbi `#ext26-mobile-nav` elemet is eltávolította, ami indokolatlanul módosította a közös DOM-ot.

**M16.1 javítás:** a mobilfejléc csak a `(max-width: 768px)` feltétel teljesülésekor csatlakozik a fejlécbe; 769 px fölött leválik. A régi navigációs elemet nem törli. A mobil filmes blokk desktopon `hidden` állapotú, és szélességváltáskor ehhez igazodik. Ez a javítás **kizárólag a mobilmodulokban van**. A desktop CSS-t, desktop JS-t és asztali képállományokat nem változtattuk.

**Bizonyíték korlátja:** a hiba oka **forrásalapon megalapozott**, és a javítás **JS/DOM-szimulációval igazolt**. Valódi desktop Chromium-képernyőn a vizuális javulást nem lehetett ellenőrizni; ezért a hiba teljes, pixelszintű megszűnését **nem jelentjük bizonyítottnak**.

## M16.1 — Mobil/asztali elkülönítés és regresszió

**Elkészült:**

- Asztali induláskor a mobilfejléc nem szerepel a desktop fejléc gyermekei között.
- Mobilra váltáskor a mobilfejléc csatlakozik; visszaváltáskor lecsatlakozik.
- A korábbi navigációs DOM érintetlen; a mobilos görgetési CSS-változók asztalra váltva törlődnek.
- A filmes mobilnyitó desktopon elrejtve marad, mobilra váltva ismét hozzáférhető.
- Külön `verify-m16-desktop-boundary.mjs` DOM-kapu ellenőrzi a szélességváltásokat és a kódbeli határfeltételeket.

**Automatizált státusz:** **PASS**. **Valós 769/1024/1280/1440 px-es képernyőfotók:** **NYITOTT**.

## M16.2 — Mobilmenü, közvetlen oldalnyitás, fókusz

**Elkészült:**

- A közvetlen „Oldal megnyitása” hivatkozás saját útvonal-azonosítót kap, így a menü nem keveri össze a fő kártyagombbal.
- Mobilos átméretezés vagy a menükatalógus újragenerálása után az adott **közvetlen hivatkozás** visszakapja a fókuszt; a szokásos főmenüpont fókuszmegőrzése megmaradt.
- A korábbi három menüszint, visszalépés, `Home`/`End`, négyirányú billentyűzet, képváltó érintéskezelése, galéria és saját dokumentumnéző megmaradt.
- Külön `verify-m16-interactions.mjs` kapu futtatja a célzott és örökölt interakciós próbákat.

**Automatizált státusz:** **PASS**. **Fizikai érintés és Safari/Chrome kézi fókuszpróba:** **NYITOTT**.

## M16.3 — Mobilos hozzáférhetőség, tördelés, teljesítménybiztonság

**Elkészült:**

- Amikor a mobil fejléc görgetésre összecsukódik, a vizuálisan elrejtett iskola-megnevezés és mottó `aria-hidden="true"` jelölést kap, hogy ne kerüljön újra felolvasásra.
- Felgörgetve a címek ismét a képernyőolvasó számára is rendelkezésre állnak. Asztali szélességre váltva a mobilon keletkezett ARIA-jelölés megszűnik.
- A korábbi középre rendezett mobilos szövegtördelés, 320–768 px-es reszponzív mátrix, világos/sötét téma, vezérlőméretek, `prefers-reduced-motion`, videó-autoplay kímélése és 78 oldalas tartalmi lefedettség regressziós ellenőrzést kapott.
- Külön `verify-m16-a11y-performance.mjs` kapu készült.

**Automatizált státusz:** **PASS**. **Valódi VoiceOver/TalkBack, 200–400%-os zoom, WCAG 2.2 AA és Core Web Vitals:** **NYITOTT**. A tesztek nem szolgáltatnak mért LCP, INP, CLS vagy teljes akadálymentességi minősítést.

## M16.4 — Frissítés, kiadás, SHA-256 és visszaállítás

**Elkészült:**

- A kiadás és a hivatkozások verziója **v1.43.22**: mobilmodulok, kezdő HTML, belépési pontok, cache-verzió (`csanadi-r-v1.43.22`), service worker (`1.43.22`).
- A meglévő PWA-frissítési értesítés DOM-szimulációja ellenőrzi az **„Frissítés”** és **„Később”** gombot, az elfogadott/elhalasztott verziók megjegyzését, és a service worker kifejezett aktiválását.
- A `verify-m16-pwa-release.mjs` kapu a frissítő és desktop-határ próbákra épül.
- A `release-manifest.json` minden csomagolt fájl méretét és SHA-256 lenyomatát tartalmazza; az átfogó leltár az önellenőrző manifestfájlt magát értelemszerűen nem sorolja önmagába.
- A teljes ZIP külön könyvtárba történő kicsomagolása, SHA-256 visszaellenőrzése és a tesztek újbóli futtatása megtörtént: **1322 leltározott fájl, 19/19 sikeres teszt a kicsomagolt példányon**, a ZIP `unzip -tq` hibamentes.
- A jóváhagyott v1.43.21 nem kerül módosításra, és visszaállítási forrásként megmarad.

**Automatizált státusz:** a kiadási leltár, teljes ZIP, elkülönített visszaállítási próba és a kicsomagolt projekt 19 ellenőrzése **PASS**. **Valós eszközre telepített PWA offline/online cache-frissítése:** **NYITOTT**.

## Szakaszonkénti ellenőrzési kapuk

| Kapu | Mi lett automatikusan ellenőrizve? | Valós eszközös rész | Státusz |
|---|---|---|---|
| M16.1 | Desktopon hiányzó mobilfejléc, érintetlen régi navigáció, mobil/desktop oda-vissza váltás, rejtett filmes DOM | Desktop és mobil vizuális összevetés | **DOM PASS / vizuális nyitott** |
| M16.2 | Menüszint, fókusz, közvetlen oldallink, képlapozás, galéria és saját dokumentumnéző | Érintés, fókusz, tényleges PDF | **DOM PASS / eszközös nyitott** |
| M16.3 | ARIA állapot, 44 px-es célpontokra vonatkozó forráskapu, reszponzív CSS, témák, reduced-motion, tartalomlefedettség | Képernyőolvasó, WCAG, zoom és CWV | **DOM/statikus PASS / mérési nyitott** |
| M16.4 | Cache-verzió, frissítési panel és SW, SHA-256 leltár, ZIP és kicsomagolás | Telepített PWA és valódi offline ciklus | **Automatizált PASS / PWA nyitott** |

### A valódi böngészős teszt elérhetősége

Helyi HTTP-szervert indítottunk, és a Chromium felületét is megpróbáltuk használni. A gép elutasította a helyi TCP-csatlakozást (`ERR_CONNECTION_REFUSED`), a portvizsgálat pedig `Operation not permitted` jogosultsági hibát jelzett. Nem került sor a korlát megkerülésére. Fizikai iOS-/Android-telefon, Safari/Chrome mobileszközös teszt, VoiceOver/TalkBack és a telepített PWA teljes életciklusa nem volt ellenőrizhető. **A Node-alapú DOM- és statikus vizsgálat valós böngészős renderelésnek nem nevezhető.**

### Külön, valódi eszközös elfogadási minták

1. **Asztal:** 769, 1024, 1280 és 1440 px; kezdőlap képváltó, fejléc, keresés, téma, logómenü, aloldali görgetés. M16.1 kritikus; minden korábbi elrendezésnek változatlanul kell megjelennie.
2. **Telefon:** iOS Safari és Android Chrome; 320, 360, 375, 390, 412, 430 és 768 CSS px; portré/fekvő váltás, böngészős zoom és billentyűzet.
3. **Menü:** 1.→2.→3. szint, visszalépés, közvetlen oldalnyitás, hosszú nevek, gyors egymásutáni műveletek, billentyűzetes fókusz a forgatás/átméretezés előtt és után.
4. **Tartalom:** nyitófilm, képlapozó, hírek, naptár, dolgozói névsor, galéria (témaszűrés), PDF/Word dokumentumok saját nézője, keresés, sötét/világos témaváltás.
5. **Hozzáférhetőség:** VoiceOver/TalkBack, megfelelő elemnév és fókuszsorrend, lecsukódó fejléc felolvasása, csökkentett mozgás, minimum 200%-os nagyítás.
6. **PWA:** egy korábbi telepített verzióról frissítve „Később”/„Frissítés”, offline indulás, későbbi online visszatérés, hard reload.
7. **Mérés:** mobil és desktop CLS/LCP/INP valódi, reprodukálható böngészőmérése. Mért szám hiányában nincs teljesítmény-jóváhagyás.

## Állományvédelem, tartalom és visszaállítás

- A megőrzött v1.43.21 referencia mappája nem módosult; a v1.43.22 külön munkakönyvtárban és külön ZIP-ben készül.
- A `desktop/`, `css/`, `assets/` és a tartalmi `json/` állományok SHA-256 csoportlenyomatait a kiadási ellenőrző a v1.43.15 óta megőrzött referenciákkal hasonlítja össze; `json/config.json` csak cache-verziót változtat.
- A hét közös SPA/desktop állomány normalizált hash-e az eredeti referenciaértékekkel egyezik, ha az engedélyezett kiadási verzió-/mobilmodul-névcsere figyelmen kívül marad.
- A `mobile/` mappában kizárólag az öt aktuális újraépített `v1-43-22` modul marad; nem hozunk vissza korábbi mobilkódot.
- A ZIP másolatának elkülönített kibontása és újraellenőrzése **nem éles szerverre történő visszaállítás**. Szerveroldali művelet nem történt.

## Külön végső jóváhagyás

**A — Jóváhagyom a v1.43.22 M16/D kiadási előnézetet**, a dokumentált, nyitott valós eszközös és pixelszintű ellenőrzési pontok tudomásulvételével. További fejlesztési terv előkészíthető, de közzététel nincs.

**B — Előbb valódi telefonon és asztali böngészőben ellenőrzöm.** A jóváhagyás függőben marad.

**C — Javítást kérek.** A hibák megjelölése után újabb, célzott fejlesztési és ellenőrzési kör készül közzététel nélkül.
