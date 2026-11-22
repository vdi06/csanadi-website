# Csanádi weboldal v1.43.27 – M18.2 mobilos fejléc és görgetési izoláció

**Állapot:** jóváhagyásra váró előnézet; közzététel nem történt.

## Kért módosítások és azonosított kód

1. Görgetés után régi képváltó és más fejléc-elemek jelentek meg. A `js/release-v1-39-0.js` ténylegesen létrehozza az `#cs-compact-hero-controls` csoportot (`‹`, `Képek`, `›`), majd a régi `.header-actions` területhez illeszti. A `js/release-v1-39-1.js` külön `#cs39-mini-hero` címergombot és `#cs39-mobile-route` sávot is tart fenn. Korábbi mobilos CSS és M18.1 JS csak egyes régi elemeket zárt ki.
2. A v1.43.26 mobilfejléce `cs-mb-kreta-line` elemben új, második sorban teljes `KRÉTA` szöveget mutatott. Ez 44 pixel további függőleges helyet foglalt el.
3. Az asztali kódot tilos módosítani; a szerkesztett kód a `mobile/reboot-shell-v1-43-27.js` és `mobile/reboot-design-v1-43-27.css`. A közös belépési fájlok módosítása kizárólag az új cache-verzió és mobilmodul útvonalára korlátozódik.

## Megvalósított mobilos elemleltár

| Terület | Mobil elemek és programozott szerep | Oldal tetején | Görgetve |
|---|---|---|---|
| Fejléc cím | Iskola neve és típusa (`cs-mb-school-title`) | Két középre igazított sor | Összecsukva, képernyőolvasótól is elrejtve |
| Felső ikonsor bal | Facebook `f`, Instagram `◎`, KRÉTA **`K`** (`cs-mb-left`) | Egy sorban | Egy sorban |
| Középső címer | `cs-mb-menu`, eredeti címerkép, teljes mobilmenüt nyit | Középen | Középen |
| Felső ikonsor jobb | Keresés `⌕`, téma `◐/☾/☀` (`cs-mb-right`) | Egy sorban | Egy sorban |
| Fejléc jelmondat | SPORT · TUDÁS · KÖZÖSSÉG (`cs-mb-motto`) | Látható | Összecsukva |
| Olvasási sáv | Arany 2px progress jelző | 0%-ról indul | Görgetéssel nő |
| Régi asztali fejléc | `.brand-row`, asztali navigációk, kompakt fejléc és későn hozzáadott gyermekek | Nem jelennek meg | Nem jelennek meg |
| Régi képváltó | `#cs-compact-hero-controls` (`‹ Képek ›`) | Nem jelenik meg a fejlécben | Nem jelenik meg a fejlécben |
| Saját mobilos nyitókép | `.cs-mb-cinema`: kép, kapunyitó átmenet, cím és alcím | Megmarad a kezdőlap tartalmában | A tartalommal együtt természetesen kigördül |
| Saját mobilos képváltó | `.cs-mb-film-arrow`, képszámláló, képcsík, témakör megnyitása, lejátszás/szünet | A nyitókép alatt | Csak akkor látszik, ha a tartalom a képernyőn van; nem ragad a fejlécbe |
| Navigáció | `#cs-phone-wheel`, 1–3. szint, visszalépés, bezárás, gyorselérések | Középső címerrel nyitható | Ugyanígy |
| Aloldali elemek | JSON-oldalak, menü, dokumentum- és képelemek, mobil komponensek | A meglévő M1–M17 funkcionalitás | Változatlan tartalom |

### Egysoros méretezés

- 320–768 pixel között a fejléc háromoszlopos CSS Grid: **egyforma szélességű** bal/jobb rész, középen 58 vagy 62px-es címer.
- Bal oldalon három, jobb oldalon két belül elrendezett ikon. A keskeny telefonokon a gombok min. 44px *magasak*; a rendelkezésre álló szélességhez igazodnak, hogy a 320px széles kijelzőn se törjenek sorba.
- A KRÉTA olvasható neve és az externális link változatlan, a felületén csak „K” ikon szerepel.
- A 769px és szélesebb asztali állapotban a mobil shell lekapcsolódik, és minden régi fejlécgyermek eredeti display/ARIA állapota visszaáll.

## Végrehajtott ellenőrzések

- Saját mobilfejléc DOM: görgetés előtti/utáni állapot, valós két közösségi link JSON-ból, KRÉTA ikon, keresés, téma, címermenü esemény.
- Később dinamikusan hozzáadott régi `#cs-compact-hero-controls` elem rejtési próbája: `display:none!important`, `aria-hidden=true`; desktop-visszaállítás.
- Geometriai szélességszámítás 320, 344, 360, 375, 390, 412, 430, 600 és 768 px; 769px asztali határ.
- Összes korábbi automatizált release-, működési-, JSON-, biztonsági-, reszponzív- és desktop-határteszt.
- Teljes ZIP-állomány leltározása és SHA-256, visszabontás utáni ismételt ellenőrzés.

**Amit az automatizált próbák nem bizonyítanak:** valós iOS Safari / Android Chrome görgetés, pixelszintű kilógás, hálózati szolgáltatások működése, vizuális animációk. Ezek **külön nyitott valós eszközös átvételi pontok**; nem állítjuk, hogy elkészültek. A `mobilos-elrendezes-bemutato.html` szerkezeti szimuláció, nem telefonról mentett képernyőkép.

## Visszaállítás és kiadás

- Előző csomagok: v1.43.25 és v1.43.26 változatlanul megőrizve.
- A teljes v1.43.27 ZIP a statikus FTP/GitHub Pages tárhelyre telepíthető *előnézet*, nem került automatikusan közzétételre.
- Az új verzió csak külön felhasználói végső jóváhagyás után tekintendő elfogadottnak.
