# Csanádi Sportiskola 2026 – 20. kiadás: fejlesztési és tesztbeszámoló

**Dátum:** 2026. november 15.  
**A felhasználó utolsó letöltött kiadása:** a csatolt `csanadi-website(5).zip`, amelynek belső kiadási azonosítója `csanadi-r17-20261115`.  
**Közvetlen fejlesztési alap:** `Csanadi_Sportiskola_2026_19_TELJES_WEBOLDAL_FTP_ES_KEZIKONYV.zip`; a 18-as és 19-es módosításokat is hordozza.  
**Teljes átadandó kiadás:** `Csanadi_Sportiskola_2026_20_TELJES_WEBOLDAL_FTP_ES_KEZIKONYV.zip`.  
**Központi verzió:** `csanadi-r20-20261115`; webes/PDF-kézikönyv: **3.6.0**, 26 oldalas A4 PDF.  
**Közzététel:** sem iskolai FTP-, sem GitHub-feltöltés nem történt.

## 1. Mi volt a kérés?

Az összes előző működő funkció, oldal, média, dokumentum, a README.md, a háromikonos mobilmenü, a `mobile/` és `desktop/` elválasztás, a két sportos színtéma és a központi JSON-paraméterek megőrzésével **tíz új funkcionális fejlesztést** kértél. A fiktív MINTA diákhírek nem helyettesíthetők valódi diákhírekkel külön adatvédelmi és intézményi jóváhagyás nélkül. A nyilvános lábléc nem tartalmazhat szerkesztőlinket. A fájlméretek automatikusan bájt/KiB/MiB/GiB értékekben, az idők ms-ban jelenjenek meg. Külön webes és PDF-dokumentáció, teljes statikus ZIP, tesztjelentés és új működő fejlesztési választó jár a kiadáshoz.

**Állandó szabály:** a meglévő oldalak és funkciók rendszeres csiszolása **külön kötelező alapjavítás**, nem foglalhat helyet a következő tíz új választható funkció között. Ezt a 3. részben külön számoltuk el.

## 2. A tíz kiválasztott fejlesztés – megvalósítás és korlát

| # | Funkció | Ami bekerült a 20-as kiadásba | Fontos nyitott feltétel |
|---|---|---|---|
| 1 | Vizuális JSON-oldalszerkesztő | Új helyi `tools/fejlesztoi-munkakozpont-20.html`: cím, menünév, összefoglaló és Markdown-blokkok szerkesztése; élő, biztonságos szöveges előnézet; kötelező azonosító/útvonal/státusz ellenőrzés; fájlexport. | A speciális blokkok és médiák nem teljes WYSIWYG nézetben szerkeszthetők; a központi menüregiszter frissítése külön feladat. |
| 2 | Képoptimalizáló | Helyi, többképes konverzió böngészős Canvas API-val, 480/960/1440 px célméret, WebP és támogatott esetben AVIF, aránymegőrzés; méretlista, leltár-JSON és ZIP. | Az AVIF-kódolás, memória és képminőség böngészőfüggő; a tényleges képek felhasználási jogát külön kell ellenőrizni. |
| 3 | Hír-/eseménypublikálási folyamat | Tervezet, ellenőrzés, jóváhagyás, időzítés, visszavonás; jóváhagyó és időablak; külön **NEM NYILVÁNOS** munkanapló és külön ellenőrzött publikus JSON-export, közös hír-adatvédelmi validatorral. | A helyi jelölés nem intézményi engedély, automatikus FTP-publikálás nincs. |
| 4 | Keresés | Ékezet- és szinonimakezelés megtartása, a hosszabb cím-/címkeszavaknál legfeljebb egy karakteres elírástűrés, súlyozás, csak memóriában élő anonim darabszám-statisztika. | Nem tároljuk a keresőszavakat, nincs szerveroldali napló vagy teljes nyelvi modell. |
| 5 | Offline olvasás | `offline-olvaso.html`: publikált oldalak egyenként kijelölhető JSON-másolata, mentés/frissítés/törlés, becsült méret és böngészőkvóta, kiadáshoz kötött CacheStorage. | HTTPS/localhost és előzetes online letöltés szükséges. A teljes offline médiakészlet nem garantált. |
| 6 | Naptár | ICS-eseményexport UTC-vel, böngészős nyomtatás és külön mobilos napirend; a régi nap/hét/hónapnézet és szűrők megmaradtak. | Az eseményforrás jelenleg csak két hiteles tételt tartalmaz; a nyomtató és a böngésző megjelenése eltérhet. |
| 7 | Magyar–angol tájékoztatás | Központi `json/nyelvek.json` és részlegesen fordított kiemelt információk, nyelvváltás, fordítási státusz és a látogató helyi preferenciája. | **Nem teljes honlapfordítás**, az angol szöveg intézményi ellenőrzést igényel (`review_required`). |
| 8 | Akadálymentességi központ | A helyi fejlesztői munkaközpont a manifest HTML-jeit szerkezetileg vizsgálja: kép-alt, címke, név nélküli gomb, H1, duplikált ID és mindkét téma számított kontrasztja; JSON-riport. | A képernyőolvasó, billentyűzetes navigáció és WCAG AA emberi ellenőrzése külön szükséges. |
| 9 | Tartalomkapcsolati térkép | Az oldalindex és a **66 tényleges oldalfájl**, hírek, események és dokumentumok belső hivatkozásainak feltérképezése; SVG-ábra, hiányzó utak és duplikált rekordazonosítók, export. | A diagramon a konfigurált maximális csomópontszám látszik, a teljes lista a jelentésben van. |
| 10 | Két ZIP kiadáskezelő | Régi és új teljes ZIP32 helyi összehasonlítása fájlnév, CRC32 és méret alapján; új/módosult/törölt állományok, letölthető változásjelentés és visszaállító ZIP, külön újfájl-törlési jegyzékkel. | ZIP64/jelszavas ZIP nem támogatott; deflate-raw kitömörítéshez megfelelő böngésző kell. Nincs FTP-írás. |

## 3. Kötelező alapjavítások – nem a következő tíz opció részei

### A nálad lévő 17-es ZIP óta történt kiadásközi fejlesztések

**A 18-as kiadásban:** külön `mobile/` és `desktop/` mappák, a mobil körmenü/hagyományos menü váltó finomítása, a háromikones navigáció stabilizálása, központi paraméterbővítés, ZIP-/manifest-változások előnézete, PDF- és dokumentumgyorskereső, helyi hír- és médiaeszközök, fájlméret- és betöltésidiagnosztika, automatikus betöltési cache-frissítés.

**A 19-es kiadásban:** részletes ms és automatikus KiB/MiB/GiB teljesítményadatok, keskenyebb mobilmenü-stílusok, sporteredmény-szűréshez kapcsolt interaktív diagramok, billentyűzettel lapozható fotógaléria, nap/hét/hónap naptárrács, PDF-verziótörténet és közvetlen letöltés, zöld-sárga színátmenetek két témában, öt forrástípusból kapcsolódó tartalmak, duplikáció-/manifest-alapú honlapállapot-ellenőrzés és teljes FTP-kiadási minőségkapu.

**A 20-as kiadásban:** a fenti 2. fejezet mind a tíz új modulja, a kibővített webes/PDF-kézikönyv és a jelen teljes ZIP.

A csatolt 17-es csomag `csanadi-website/` almappás Git-forrásarchívum volt. A 20-as átadott ZIP közvetlenül a **webhely gyökerébe** kibontható, ezért nincs benne a fejlesztési `.git/` metaadat: a honlap működéséhez nem szükséges. A korábbi három mobil-CSS az új `mobile/` helyén bájtpontosan megmaradt.

1. A 19-es kiadásból a teljes honlap és az eredeti **66 oldal** átvétele; a nálad lévő r17 kiadás mindhárom, azóta `mobile/` alá rendezett korábbi mobil-CSS-e **bájtpontosan megmaradt**.
2. A **README.md** a 19-es verzióhoz képest bájtpontosan ugyanaz; az eredeti címeres mobilmenü **házikó – címer – nagyító**, körmenü/hagyományos mód és asztali képváltó megőrzése.
3. A meglévő naptár, sportdiagram, képgaléria, PDF-dokumentumtár, kereső, kapcsolódó tartalmak, állapot- és teljesítménydiagnosztika továbbfejlesztése egyben, nem újrakezdve.
4. Az eredeti világos/sötét **sportGreen** és **sportYellow** paletta követése az új nyelvi panelben, naptárban és fejlesztői felületen, csökkentett mozgás támogatásával.
5. **Nyilvános lábléc:** továbbra sincs szerkesztő- vagy külön kézikönyv-hivatkozás. **Adatvédelem:** a 8 névtelen MINTA sporthír változatlan, valódi diákhír nem került bele.
6. Belső JS/CSS `?v=` URL-ek 20-as verzióra váltása, központi `performance.cacheVersion` frissítése; az offline mentés külön verzióhoz kötött. A külső szolgáltatói cache viselkedése továbbra is külön ellenőrizendő.
7. A korábbi 212 központi paraméter megtartása és bővítése **231 levélmezőre**, kézzel duplán vezetett beállítási adatforrás nélkül.
8. A teljes webes/PDF-kézikönyv újragenerálása az aktuális 66 oldal, 13 eszköz és 231 paraméter szerint, dokumentumhash és teljes SHA-manifest frissítése.

## 4. Teljes csomagleltár

- **66** tartalmi JSON-oldal; **89** érvényes JSON-fájl; **53** JavaScript-fájl; **17** HTML-fájl, közülük **13** helyi karbantartói HTML-felület; **231** központi paraméter.
- `utmutato.html` – webes, kereshető **3.6-os** kézikönyv mind a 66 oldallal, 13 eszközzel és valamennyi paraméterrel.
- `assets/documents/csanadi-weboldal-teljes-hasznalati-utmutato-2026.pdf` – **26 oldal, A4**, kereshető szöveg, azonos verzió.
- `dokumentacio/KOZPONTI_JSON_PARAMETEREK.md` – aktuális paraméterjegyzék.
- `dokumentacio/FTP_ATALLAS_ES_VISSZAALLITAS.md` – élesítés és visszaállítás kiegészített leírása.
- `release-manifest.json` – a ZIP-ben található további **757** fájl név, pontos bájtméret és SHA-256 lenyomata; a ZIP teljes állományszáma **758**.

## 5. Ténylegesen elvégzett vizsgálatok

**Célzott automatikus ellenőrzések: 46/46 sikeres**, ebből 43 előzetes regressziós/szerkezeti ellenőrzés és 3 végső ZIP-integritási próba.

1. **Regresszió:** 66 oldal, eredeti README azonossága, mobil/desktop mappák, háromikonos mobilmenü, a nyilvános szerkesztőlinkek hiánya és MINTA sporthírek. A felhasználó által csatolt r17 ZIP **737 nem-Git fájljának** megléte vagy azonos tartalmú, tudatos új helye is külön ellenőrizve.
2. **Szintaxis:** mind a **89 JSON** parse-olható; mind az **53 JS** szintaktikailag érvényes Node.js `--check` szerint.
3. **HTML:** mind a **17 HTML** helyi `href`/`src` útvonala létező fájlra mutat, duplikált HTML-ID nincs; a 20-as munkaközpont összes JavaScriptből hivatkozott mezőazonosítója létezik.
4. **Funkcióbekötés:** szerkesztő, konvertálás, munkafolyamat, fuzzy kereső, offline CacheStorage, ICS/nyomtatás/mobil napirend, nyelvi JSON, akadálymentességi audit, teljes oldal-JSON kapcsolatvizsgálat és ZIP-különbség kódjának célzott statikus ellenőrzése.
5. **Tényleges ZIP-modulpróba:** az új böngésző-kompatibilis ZIP-olvasó a 19-es ZIP **749** állományát beolvasta, majd a `README.md` tömörített bejegyzésének adatait ténylegesen kibontotta és **CRC32-t ellenőrzött**.
6. **PDF:** A4-es, **26 oldalas**, kereshető; 3.6 és offline/ZIP szövegek megtalálhatók; az első oldalt képként megvizsgáltuk.
7. **Kiadás:** a teljes, **757** állományos SHA-256/byte manifest egyezik a munkamappával. A ZIP **758** fájlt tartalmaz, a teljes archívum CRC-próbája sikeres; a README és `json/config.json` bájtra egyeznek a forrással.

### Ami még NEM bizonyított böngészőben

A Playwright/Chromium indítás `socket() failed: Operation not permitted` környezeti hibával megállt, a helyi HTTP-próba is blokkolt. **Nem állítunk sikeres kattintásos böngésző- vagy valódi mobiltesztet.** Teszt-HTTPS környezetben külön szükséges: 320–768 px-es menü és panel, témaátváltás, teljes eseménynaptár, képszerkesztő és AVIF, offline mentés/frissítés, fordítások, ZIP-rollback, nyomtatás/PDF, billentyűzetes és képernyőolvasós akadálymentes használat. A sikeres szintaktikai és forrásszerkezeti ellenőrzés **önmagában nem teljes UI-teszt**.

## 6. Kiadás és külső feltételek

Az elkészült csomag **kizárólag statikus HTML/CSS/JS/JSON és média/dokumentum fájlokat** szolgáltató FTP-tárhelyre alkalmas; szerveroldali PHP/Node/GitHub Actions nincs. A Bootstrap 5.3.9 rögzített CDN-ről jön, helyi Bootstrap nincs. Külső CDN és választható diagramkiegészítések online kapcsolatot igényelhetnek. Az offline CacheStorage HTTPS/localhost mellett működik, de nem garantálja a még soha le nem töltött oldalak és külső médiák rendelkezésre állását.

Publikálás előtt az intézmény feladata minden valós hír, kép, sporteredmény, fordítás és dokumentum forrásának, aktualitásának és jogszerűségének ellenőrzése. A nem nyilvános munkanapló és tervezet nem kerülhet éles tárhelyre; a noindex nem hozzáférés-védelem. A teljes ZIP-helyreállítás kézi, külön jóváhagyást igénylő eljárás; a cache-verziózás nem kényszeríthet rá frissítést valamennyi offline készülékre.

**Nem történt iskolai FTP- vagy GitHub-feltöltés.** A következő fejlesztési körben az új tíz kiválasztható fejlesztés mellett a meglévő funkciók javítása mindig külön kötelező munkakör marad.
