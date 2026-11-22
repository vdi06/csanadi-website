# Csanádi weboldal v1.43.19 – M13/D mobilos fejlesztési és ellenőrzési jelentés

**Dátum:** 2026. november 20.  
**Állapot:** teljes M13.1–M13.4 forrás- és regressziós fejlesztési előnézet; **külön megrendelői végső jóváhagyásra vár**.  
**Alap:** v1.43.18 M12/D jóváhagyott kiadás, valamint a v1.43.19 M13.1 elfogadott szövegillesztési előnézete. Mindkét kiadás eredeti ZIP-je megmaradt.  
**Hatókör:** kizárólag telefonos nézet (maximum 768 CSS-pixel); a közös HTML/JS/JSON konfigurációból csak kiadási verzióhivatkozások módosultak.  
**Közzététel:** sem FTP-, sem GitHub-feltöltés, sem nyilvános élesítés nem történt.

## Kért fejlesztések és a négy ellenőrzési kapu

| Szakasz | Elkészült, mobilra korlátozott fejlesztés | Bizonyító ellenőrzés | Státusz |
|---|---|---|---|
| **M13.1 – szöveg és megjelenés** | Fix magassággal levágott mobilos fejléc- és mottószöveg megszüntetése; hosszú menü-, kártya-, Bootstrap- és űrlapfeliratok több sorba törése. Dinamikus fejlécmagasság újramérése `ResizeObserver`-rel. | `verify-m13-mobile-text.mjs`, `verify-reboot-shell.mjs`, 12 méretes statikus mátrix | **Forrás/DOM OK; valós kijelző nyitott** |
| **M13.2 – navigáció** | Az aktuális menüoldal `aria-current` jelölésének valódi böngészőben előforduló abszolút URL/hash hibája javítva. Bal nyíl és Backspace egy szinttel visszalép a mobilmenüben; a desktop nem érintett. | Háromszintű DOM-navigációs próba, új útvonal- és billentyűzetes ellenőrzések | **Szimulált DOM OK** |
| **M13.3 – nézők és tartalom** | PDF-kezelősáv minimum 44px-es mobilos kezelőszervekkel, görgethető PDF-régió; képnéző magassága a telefonhoz igazodik, cím/letöltés középre rendezett; világos témájú képnéző kezelőrészek; a képnéző felirata képenként egy udvarias képernyőolvasós bejelentést kap. | Új `verify-m13-viewer-dom.mjs`: tematikus képválogatás, felirat, kézi letöltés-hivatkozás, mobilos Bootstrap érintés-/billentyűzetbeállítás, Word-állapot és bezárás; `verify-m13-mobile-interactions.mjs` | **DOM/forrás OK; valódi PDF render nyitott** |
| **M13.4 – minőség, kiadás** | Világos/sötét alapszínek kontrasztja statikusan ellenőrizve; PWA frissítés/cache-verzió és SW-aktiválási szabályok ellenőrzése; teljes archívum, asztali SHA-256 referencia, ZIP kicsomagolása utáni visszaállítási próba. | `verify-reboot-release.mjs`, `verify-m13-mobile-interactions.mjs`, összes regressziós teszt és ZIP integrity | **Forrás/ZIP OK; valós eszközös teljesítmény/PWA nyitott** |

## Konkrét mobilos változások

### Navigáció

- A böngésző a `HTMLAnchorElement.href` értékét abszolút URL-re alakítja. Az aktív aloldal megjelölése ezért a tényleges belső `#/...` útvonalat hasonlítja a `location.hash` értékéhez, és a kiválasztott témakör áttekintési linkjén is kezeli az `aria-current="page"` állapotot.
- Nyitott második/harmadik menüszintnél a **bal nyíl vagy Backspace** billentyű visszalép; a nyíl és Backspace esemény nem módosít desktopmenüt, és szerkeszthető mezőnél nem veszi át a Backspace műveletét.
- A már meglévő Escape, fókuszvisszaállás, modális fókusz és 1→2→3 szintű működés megmaradt.

### Saját multimédiás komponensek

- A galéria a saját Bootstrap Carousel-t használja; a témán kívüli média nem kerül a tematikus nézőbe. A mobilnézetben a képek `min-height:0` és rendelkezésre álló viewport-alapú magassági korlátot kapnak, hogy fekvő telefonon ne lógjanak a modálból.
- A képnéző láblécében a képaláírás és letöltés több sorba törhet; a kezelősáv vízszintesen középre igazított.
- A világos téma a képnéző fej-/láblécének háttér-, felirat- és bezáróikon-színeit is külön kezeli. A képfelület szándékosan sötét marad a fénykép megtekintésekor.
- A dokumentumnéző PDF-eszköztárának telefonos gombjai legalább 44px magasak; a széles PDF-oldal saját vízszintes görgetést használ, amely hozzáférhető régióként jelölhető.
- A mobilos `aria-live` csak a galériaképaláíráshoz kerül hozzá: nem jelenti be duplán a képet és a számlálót. Asztali nézetre váltva a hozzáadott attribútumok visszaállnak.
- A közös PDF.js és Bootstrap nézőlogika változatlan.

### A korábban jelzett szövegkilógás

Az elfogadott M13.1 előnézet minden szabálya része a végső munkapéldánynak: mobilfejléc-szöveg szabad törése, ellipsis/nowrap túlcsordulás felülírása, mobilos kártya- és komponensszélességek, újraszámolt sticky header offset, saját görgethető táblázatok/kódblokkok.

## Lefedettség és ellenőrzési mátrix

- **78** regisztrált JSON-aloldal: 6 első, 38 második, 34 harmadik menüszint.
- **254** tartalmi blokk.
- **12** statikus képernyőprofil: 320×568, 360×640, 375×812, 390×844, 412×915, 420×648, 420×650, 430×932, 768×480, 768×1024, 769×1024, 900×420.
- A fő szövegkontraszt-kombinációk számított értékei 4,5:1 felettiek a sötét és a világos témában. Ez **nem** helyettesíti az összes komponens valós WCAG 2.2 AA ellenőrzését.
- A `service-worker.js` `RELEASE_ID` és a `json/config.json` `performance.cacheVersion` azonos v1.43.19-es kiadást jelöl. A felugró frissítési értesítés meglévő, korábban javított logikáját nem változtattuk meg.

### Automatikus tesztek

```bash
node tools/verify-reboot-shell.mjs
node tools/verify-reboot-menu.mjs
node tools/verify-reboot-hero.mjs
node tools/verify-reboot-quality.mjs
node tools/verify-m11-mobile-matrix.mjs
node tools/verify-m12-content-coverage.mjs
node tools/verify-m13-mobile-text.mjs
node tools/verify-m13-mobile-interactions.mjs
node tools/verify-m13-viewer-dom.mjs
node tools/verify-reboot-release.mjs
```

A teljes ZIP-ből külön könyvtárba történő kicsomagolást követően a fenti tíz tesztet újra le kell futtatni. A `release-manifest.json` minden állomány SHA-256 lenyomatát tartalmazza.

### Desktop és adatmegőrzés

A kiadási védelem a v1.43.15-ből megőrzött **7 `desktop/`**, **66 `css/`**, **828 `assets/`** és **110 tartalmi `json/`** fájl lenyomatát ellenőrzi, valamint hét közös belépési pont változatlan programlogikáját a kötelező kiadási verziósztringek normalizálása után. A régi mobilmappa nem került vissza; csak az öt saját v1.43.19-es `mobile/reboot-*` modul szerepel.

## Valódi eszközön még nyitott ellenőrzések

| Vizsgálat | Állapot |
|---|---|
| iPhone Safari / Android Chrome képernyőképes, álló-fekvő megjelenítés | **Nyitott** |
| A menü gesztusai, valódi érintés és fókuszvisszaállás | **Nyitott** |
| A PDF.js tényleges dokumentumrenderelése és nagyítása mobilon | **Nyitott** |
| VoiceOver/TalkBack és teljes WCAG 2.2 AA audit | **Nyitott** |
| Valódi LCP, INP, CLS, animációsebesség, memória és gyenge hálózati mérés | **Nyitott** |
| V1.43.18→v1.43.19 PWA/service-worker tényleges telefonos frissítése | **Nyitott** |

A helyi Chromium/Playwright indítása `socket() failed: Operation not permitted` sandbox-jogosultsági hibával megállt. Ezt nem kerültük meg, és semmilyen böngészős megjelenést nem tüntetünk fel sikeresnek. A Bootstrap CDN elérhetősége és a HTTP(S)-kiszolgálás továbbra is külső feltétel.

## Visszaállítás és végső jóváhagyás

1. A v1.43.18 jóváhagyott ZIP és a v1.43.19 M13.1 előnézet külön, érintetlen alapként megmaradt.
2. A mostani ZIP-ből való külön kicsomagolás és újratesztelés a csomag teljességét igazolja, nem éles FTP-visszaállítást.
3. FTP-, GitHub-közzététel és telepítés nem történt.
4. A végső döntési lehetőségek: **A)** elfogadás a nyitott valódi eszközös próbák tudomásulvételével; **B)** előbb valós telefonos tesztek; **C)** célzott javítások.

Ez a jelentés tételesen megkülönbözteti a ténylegesen lefuttatott próbákat a nyitott vizsgálatoktól.
