# Csanádi weboldal v1.43.17 – M11/D mobilos finomhangolás

**Kiadás:** v1.43.17, teljes ZIP, külön végső megrendelői jóváhagyásra váró előnézet  
**Dátum:** 2026. november 20.  
**Kiindulás:** jóváhagyott v1.43.16 teljes mobilos újraépítés  
**Hatókör:** kizárólag a külön újraírt mobilfelület (legfeljebb 768 CSS-pixel); a közös SPA-fájlokban csak kiadási verzióhivatkozások változtak.  
**Közzététel:** sem FTP, sem GitHub, sem más nyilvános közzététel nem történt.

## 1. Mit kért a megrendelő?

A v1.43.16 elfogadását követően a teljes **M11/D – M11.1–M11.4** fejlesztési és ellenőrzési terv megvalósítását, minden kapuban teszteléssel, kizárólag mobilos módosításokkal, a korábbi működő funkciók megőrzésével, teljes ZIP-pel, visszaállítási próbával és külön végső jóváhagyással. A korábban nulláról írt mobilkódra kell építeni; a régi mobilmappát tilos visszavenni. A jóváhagyott prémium sötétkék–arany arculat, a középső címer, a szimmetrikus fejléc, a háromszintű menü, a filmes, átlátszó kapu és az M1/D–M10/D követelmények érvényesek.

## 2. M11.1 – Reszponzív állapot és hibafeltárás

### Megvizsgált forráskód-problémák

1. A v1.43.16 menüjének JavaScriptes telefonlekérdezése **769–960 px szélességű**, alacsony, érintésvezérelt fekvő kijelzőkre is kiterjedt, miközben az új telefonos CSS csak 768 px-ig működött. Ez a menü és stílus közti valós ellentmondás volt.
2. Az új mobilos fejléc korábbi `max-height:60px` magassági korláttal jelenítette meg az intézmény nevét; nagyított betűkkel fennállt a levágás veszélye.
3. A kezdőlapi filmsáv auto-lejátszási időzítője a DOM-ból történő átmeneti eltávolításkor végleg megszűnt. A SPA viszont ugyanazt az elemet csatolja vissza az aloldalról a kezdőlapra való visszatéréskor.
4. A világos témában a fókuszjelölés korábbi világos arany színe kevésbé különült el a világos háttértől; a fejléctartó elemnek megmaradt a régi sötét háttérszíne.

### Reszponzív statikus mátrix

Új teszt: `tools/verify-m11-mobile-matrix.mjs`.

| Nézet (CSS px) | Elvárt mobilmenü | Ellenőrzés jellege |
|---|---|---|
| 320×568, 360×640, 375×812, 390×844, 412×915 | Kártyarács | Statikus méret-/töréspontpróba |
| 420×648 | Kártyarács | Magasságküszöb különválasztása |
| 420×650, 430×932, 768×1024 | Körmenü | Szélesség- és magasságküszöb együttes próbája |
| 768×480 | Kártyarács | Fekvő, alacsony kijelző |
| 769×1024, 900×420 | Asztali menürendszer | Mobil CSS/JS tartományának kizárása |

**Ellenőrizhető eredmény:** tizenkét statikus méretet tesztelő Node-próba, a CSS-határok és a 44 px-es alapcélméretek összevetésével. **A valós mobilböngészős képrenderelés nem volt elérhető**; nem tekinthető teljesített vizuális kapunak.

## 3. M11.2 – Fejléc és menü egységesítése

- A `PHONE_QUERY` most pontosan `(max-width: 768px)`, összhangban a mobil CSS importjának médiafeltételével.
- A menü központi `mobileViewportMode(width,height)` döntése a 420 px-es szélesség- és a 650 px-es magasságküszöböt követi. Keskeny vagy alacsony kijelzőn rácsot, tágabb álló mobilon körmenüt választ.
- Átméretezéskor a menü újrarajzol, de **nem veszti el a második vagy harmadik szint aktuális útvonalát**. Az eseménykezelés csak mobilon aktiválódik.
- A körmenü központi emblémájának elhelyezése már nem függ `:has()` CSS-szelektortól; a menü maga jelöli ki az aktív szintet.
- Az intézmény nevét megjelenítő fejléc magassági kerete 60 px-ről 140 px-re nőtt, miközben görgetés után a tömörített állapot továbbra is lecsukható.
- A világos és sötét fejlécet tartalmazó régi csomagolófelület nem kényszerít többé sötét hátteret a világos témára.
- A 359 px-nél keskenyebb felületek kisebb belső térközzel, de legalább 44 px érintési célokkal jelennek meg.

**M11.2 teszt:** `tools/verify-reboot-menu.mjs` – 1→2→3 szint, közvetlen link, visszalépés, fókusz és átméretezés utáni szintmegőrzés, valamint a 768 px-es desktop-határ. A meglévő új fejléc külön ál-DOM-próbája változatlanul sikeres.

## 4. M11.3 – Filmes nyitás és tartalmi finomítás

- A mobilos képváltó a SPA átmeneti DOM-lecsatolását most **szünetnek** kezeli. Amikor a látogató visszatér a kezdőlapra, ugyanaz az időzítő továbbléphet; az aloldalon nincs automatikus képváltás.
- A dia címe, összefoglalója, linkje és számlálója a fotó tényleges megjelenési átmenetének kezdetekor együtt frissül; nem vált szöveget az előző fénykép alatt.
- A képek közti áttűnés időzítése 720 ms, egyenletes, lágyabb görbével; az eltávolítás 740 ms után történik, hogy a képek ne villanjanak szét.
- A kapu 1,6 másodperces átmenettel nyílik, megtartva a majdnem teljesen átlátszó arany kitöltést és a dekódolt első kép feltételét.
- Csökkentett mozgásnál és adatforgalom-kímélésnél a kézi váltás azonnal történik; a `data-cs-mb-quiet` állapot a fölösleges áttűnéseket kikapcsolja.
- A tematikus mobilos kép-/PDF-néző és a közös Bootstrap-működés adatforrásai változatlanok, mobilon a szélességkorlátok egységesebbek.

**M11.3 teszt:** `tools/verify-reboot-hero.mjs` – kezdőkép, léptetés, swipe, csökkentett mozgás és új próba arra, hogy DOM-lecsatoláskor a timer áll, visszacsatoláskor pedig folytatja a váltást.

## 5. M11.4 – Akadálymentesség, teljesítmény, kiadás

- Világos témában sötétebb, jobban észrevehető fókuszkeret; sötét témában marad az arany fókuszjelölés.
- Középre igazított, telefonos `container`, `accordion`, Bootstrap `tab-content`, űrlapcsoport és modáltartalom-szélesség korlátozása a vízszintes kilógás kockázatának csökkentésére.
- A korábbi 44+ px-es gombméret, 16 px-es mobil űrlapbetűméret, reduced-motion, forced-colors, valamint a fényes/sötét témák megmaradtak.
- Mind az öt mobilos forrásfájl új, **v1.43.17** azonosítót kapott. A közös SPA-ban kizárólag verziózáshoz szükséges hivatkozások változtak; a tényleges desktop és tartalmi logika bájtpontosan ellenőrzött, miután a verziósztringeket normalizáltuk.
- A `service-worker.js`, `json/config.json`, az importok, valamint az oldal script-/CSS-URL-je egységesen v1.43.17 verziót mutat.
- Új teljes fájlmanifeszt és SHA-256 ellenőrzés, JavaScript-szintaktikai és JSON-próba, majd külön ZIP-kicsomagolásos visszaállítási ellenőrzés.

### Tesztparancsok

```bash
node tools/verify-reboot-shell.mjs
node tools/verify-reboot-menu.mjs
node tools/verify-reboot-hero.mjs
node tools/verify-reboot-quality.mjs
node tools/verify-m11-mobile-matrix.mjs
node tools/verify-reboot-release.mjs
```

Az automatikus kiadási ellenőrzés a v1.43.15 óta változatlan négy közös csoport teljes tartalmát igazolja: `desktop/` 7 fájl, `css/` 66 fájl, `assets/` 828 fájl és `json/` 110 tartalmi fájl. A v1.43.16-hoz képest további hét közös belépési pont változatlan programlogikáját ellenőrzi, kizárólag a kötelező `1.43.16→1.43.17` verziósztring-cserét figyelmen kívül hagyva.

## 6. Mi maradt nyitott?

| Terület | Státusz | Mi hiányzik? |
|---|---|---|
| Valós iPhone / Safari / Android Chrome | **Nyitott** | Az engedélyezett munkakörnyezetből a helyi oldal valódi képernyős elérése korlátozott. A statikus és ál-DOM-próba nem helyettesíti. |
| Képernyőolvasó (VoiceOver/TalkBack) | **Nyitott** | Valós segédtechnológiás ellenőrzés |
| Valós eszközön teljesítménymérés | **Nyitott** | LCP, memória, hálózat, vizuális animációsebesség mérése |
| Offline/PWA frissítés valódi mobileszközön | **Nyitott** | V1.43.16→v1.43.17 telepítési és frissítésmegjelenési teszt |
| CDN elérhetősége | **Külső feltétel** | A közös Bootstrap CDN hálózaton át töltődik be; statikus telepítéshez HTTP/HTTPS szükséges |

Ezeket sem a sikertelen, sem a hiányzó vizuális próbákat nem állítjuk sikeresnek. A belső Node/ál-DOM, verzió- és ZIP-ellenőrzések eredménye külön nyilvántartandó.

## 7. Visszaállítás, átadás és engedély

- A teljes, korábban jóváhagyott v1.43.16 ZIP változatlan állapotban megmaradt.
- A v1.43.17 külön munkapéldányból készült, nem írta felül a v1.43.16 forrását.
- A ZIP-ből külön könyvtárba való kicsomagolás után a teljes tesztcsomag futtatandó. Ez a csomag visszaállíthatóságának állományintegritási próbája, nem egy élő FTP-visszaállítás.
- Minden továbbfejlesztés kizárólag az új mobilos `mobile/` fájlokat és a szükséges verzióhivatkozásokat érintette.
- A kiadási csomag **nem jelent közzétételi engedélyt**. FTP vagy GitHub feltöltés továbbra sem történt.

## 8. Külön végső jóváhagyási pont

A megrendelő választhat: **(A)** elfogadja a v1.43.17 M11/D kiadást a dokumentált valós böngészős nyitott tesztekkel; **(B)** előbb valódi mobilos képi/animációs áttekintést kér; **(C)** a fejléc, menü vagy filmsáv egy további célzott javítását kéri. A végső jóváhagyás nem engedélyezi a weboldal FTP- vagy GitHub-közzétételét.
