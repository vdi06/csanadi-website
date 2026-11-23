# 2.34 – Carousel-váltás és vezérlőfelület javítása

- **A végleges időzítés 30 másodperc:** a `shared/data/site.json` fájlban `home.calendar.autoplayMs = 30000`. A kézi fülek és a 18 másodperces olvasási türelmi idő megmaradtak. A korábbi 24 másodperc csak a 2.32/2.33 fejlesztési előzményekre vonatkozik.
- A sportsikerek és a tanévnaptár fölött **csak két, középre igazított választófül** maradt. A Carousel külön leállító/indító gombja és balra–jobbra mutató nyilai megszűntek.
- A gyári Bootstrap `carousel-indicators` osztályát eltávolítottuk az egyedi ARIA-tablist-ről. A korábbi osztály miatt a Bootstrap belső indikátorkezelője `null.classList` hibára futott, így sem a kézi, sem az automatikus átmenet nem fejeződött be.
- A panelváltás Bootstrap API-val és Bootstrap nélküli tartalékmódban is helyesen működik. Az alapértelmezett automatikus váltás továbbra is **30 000 ms**; kézi választás vagy naptári interakció után **18 000 ms** átmeneti olvasási idő van, tartós leállítás nincs.
- A billentyűzetes navigáció, a naptári nap hover/koppintás/Escape kezelés, a keresőből megnyitás, a láthatóságfigyelés és a csökkentett mozgás kímélete megmaradt.
- `node tools/test.mjs`: 49 × 2 oldalrender, kézi váltás, automatikus váltás interakció után, Bootstrap API, nincs felesleges vezérlő.
- Tényleges headless Chromium-próba: 1440 px asztal; 390 és 320 px mobil; Bootstrap 5.3.6 előtelepített helyi JS/CSS (csak tesztkörnyezet, **nem része a ZIP-nek**) és Bootstrap nélküli tartalék. A két fül kézi választása, automatikus váltás, naptári nap nyitása/bezárása, túlcsordulás és JS-hibák vizsgálata sikeres. Az eredeti **30 másodperces** váltást is igazoltuk böngészőóra előrepörgetésével.
- A kiadás Bootstrap **5.3.8-as CDN** hivatkozásai megmaradtak; a helyi böngészőpróba nem tekintendő a teljes, éles CDN-es honlap end-to-end vizsgálatának. Iskolai FTP-re és GitHub Pages-re nem történt feltöltés.

---

# Csanádi 2.32 – eseménynaptár és kezdőlapi Carousel

## A 2.32 újdonságai – 2026. november 23.

- **Két teljes kezdőlapi panel:** a meglévő hat sportsiker és a teljes tanév
  naptára a Bootstrap Carousel szerkezetét követő `carousel / carousel-inner /
  carousel-item` komponensben váltja egymást. A két, megnevezett fül,
  előző/következő vezérlő és szüneteltetés/indítás gomb kézzel is használható.
  Ez nem az archívumban használt lapozó (pagination).
- **Automatikus váltás:** alapesetben 24 másodpercenként történik; manuális
  panelválasztás után legalább 45 másodperces nyugalmi időt tart. Az egér
  rámutatása, a fókusz, a rejtett böngészőlap, a látható területen kívülre
  görgetés és a csökkentett mozgás beállítása akadályozhatja az önkéntelen
  továbblépést. Mobilos naptárérintésnél olvasásig megáll, a felhasználó
  a lejátszásgombbal újraindíthatja.
- **Valódi tanévi adatok:** a 2026/2027-es iskolai munkaterv és intézményi
  tájékoztatások alapján **88 dátummal rendelkező esemény** és **7 csak
  hónaphoz kötött program**. A 12 hónap 2026. szeptember–2027. augusztus,
  a meghirdetett tanítási programok főként júniusig tartanak. Nincs kitalált
  tanulói adat és a nem pontosított programokhoz nincs önkényes nap hozzárendelve.
- **Asztali naptár:** mind a 12 hónap önálló, automatikusan 3/2 oszlopba
  rendezett, középre igazított hónapkártyán látható; az eseményes napokra
  mutatva megnyílik a részletezés, az egér elmozdítására bezárul. Kattintás,
  billentyűzettel kiválasztás és Escape is használható.
- **Mobilnaptár:** külön `mobile/calendar.js`, nagy érintési felületek,
  mind a 12 hónapot felsoroló legördülő, előző/következő hónap,
  egyszeri koppintással nyíló és ismételt koppintással záródó részletezés.
- **Többnapos események:** a szünetek érintett napjai mind jelöltek.
  A hosszú vizsga- és mérési időszakok kezdete/vége, valamint havi
  időszakjelzése jelenik meg, nem kap minden nap hamis önálló időpontot.
  Az azonos naphoz tartozó események egyetlen részletező panelen sorakoznak.
- **Egyszeri adatkezelés:** minden új szöveg a `shared/data/site.json`
  `home.calendar` részében szerepel. A `newsRef` mező korábban közzétett
  intézményi hírek címét, összefoglalóját és részleteit újrahasználja;
  a duplikálást a `shared/js/calendar-data.js` kerüli el.
- **Keresés és közvetlen hivatkozás:** az új események és dátum nélkül
  közzétett havi programok automatikusan indexelődnek. A
  `#/kezdolap/esemeny/<id>` megnyitja a megfelelő naptári helyet.
- **Kód és ellenőrzés:** a közös dátumlogika, hónapmegjelenítő és Carousel
  vezérlő mellett önálló asztali/mobil naptármodul készült. A JSON validáció
  már betöltéskor kiszűri a hibás dátumokat, duplikált azonosítókat és
  hiányzó hírhivatkozásokat. A teszt ellenőrzi a 12 hónapot, a dátumok
  helyességét, az összetett napokat, szüneteket, automatikus/kézi váltást,
  kattintást, hoveres nyitást, keresést és 49×2 korábbi aloldalt.
- **Kiadás:** `release = 2.32`, a visszafelé kompatibilis adatstruktúra
  `schemaVersion = 2.30` maradt. Az összes import- és HTML cache-kulcs
  `tools/stamp-release.mjs` használatával frissült.
- **Korlát:** a helyi Chromium nem indítható ebben a környezetben, ezért a
  tényleges, képernyőképes 2.32 mobil/asztali ellenőrzés a publikálás
  előtt kézzel szükséges. A GitHub Pages élő oldalát nem módosítottuk.

### Naptáradat hozzáadása vagy módosítása

1. A `shared/data/site.json` `home.calendar.events` listájában
   egyéni `id`, ISO `date`, opcionális `endDate`, `title`, `time`,
   `summary`, `details` és kötelező `category` adható meg.
2. Már meglévő `publicNews` hírnél használj `newsRef` mezőt;
   ilyenkor a cím és részletek a hír egyetlen helyéről jönnek.
3. Ismeretlen nap esetén a `calendar.undated` listába kerüljön `id`,
   `month`, `title`, `summary`. **Ne találj ki dátumot.**
4. Új intézményi tények átvételekor az iskola nyilvános munkatervét,
   tájékoztatóit és hivatalos közleményeit használd; diákszemélyes adatot
   a naptárba ne rögzíts.
5. Kiadás előtt `node tools/stamp-release.mjs`, majd
   `node tools/test.mjs`. A ZIP teljes `csanadi-website-2.32`
   gyökérmappát tartalmazzon.

---

## Korábbi 2.31 – akadálymentesítési és logikai javítókiadás

## A 2.31 változásai – 2026. november 23.

- **Főtartalomra ugrás:** külön mobilos és asztali billentyűzetes ugrólink,
  a felirat egyetlen JSON-mezőből érkezik. Nem írja át a hash-alapú útvonalat.
- **Valódi modális kizárás:** a menü, kereső, sportsiker-részletező és
  lábléc-tájékoztató nyitva tartása alatt a háttér `inert`; bezáráskor
  az eredeti állapot és a fókusz helyreáll. A háttér görgetésblokkolása megmaradt.
- **Keresőoptimalizálás:** JSON-lenyomattal ellenőrzött tartalomindex-gyorsítótár,
  amely az ugyanazon objektumon belül módosított adatot is észreveszi;
  a keresési találatok ugyanazok. Mindkét keresőmező legfeljebb 120 karaktert fogad.
- **Képernyőolvasós javítások:** a tíz másodpercenként frissülő láblécállapot
  nem szólal meg folyamatosan; a kereső találati régiója címmel azonosított,
  és csak a találatszám élő státusz. A két szűrőtörlő gombnak eltérő
  akadálymentes neve van; a táblázatok megkapják témacsoportjuk nevét.
- **Mobil billentyűzetes fülek:** bal/jobb nyíl mellett Home és End is működik.
- **Érintési célok és olvashatóság:** láblécfülek, tájékoztatási gombok,
  mobilos kapukihagyás, iránytű-kezdőlap, keresőgombok és archívumszűrő-törlés
  legalább 44 px magas/széles célterületet kaptak; több apró felirat nagyobb.
- **Képek és automatikus váltás:** galériaképek méretadatot kaptak az elrendezés
  elmozdulásának csökkentéséhez. A kezdőlap képciklusa rejtett böngészőlapon
  vagy fókuszált nyitókép-vezérlőn nem léptet tovább. Két nyitóképfelirat JSON-ba került.
- **Kiadási kulcs:** a `site.json` `release` értéke **2.31**, míg az adatstruktúra
  `schemaVersion` értéke változatlanul **2.30**. A `stamp-release.mjs`
  frissítette a modulok és HTML erőforrásainak cache-kulcsait.
- **Regresszió:** a 49×2 oldalrenderelés, sportarchívum, fókusz, offline ág,
  animáció, keresés, téma, mobil és asztali külön fájlok továbbra is működnek.
  Az új `shared/js/modal.js` a modális elszigetelés közös segédmodulja.
- **Korlát:** a javított 2.31 helyi, tényleges böngészős képernyőtesztje
  a környezetben nem indult; az éles, korábbi 2.30-on több UI-funkciót ellenőriztünk.

## Korábbi 2.30-as kiadás története

# Csanádi 2.30 – 49 egyedi tartalomoldal és teljes hibajavítás

Ez a ZIP **nem publikált**, teljes fejlesztési csomag. A 2.29 összes
funkcióját megtartja. Az alábbi 2.29-es és korábbi szakaszok történeti
leírások, a háromkártyás sablon és `pagePreview.sections` **már nem az
aktuális működés**.

## A 2.30 középre igazítási javítása – 2026. november 23.

- **Mind a 49 aloldal közös szabályai:** a főcím, bevezető, változó számú
  kártya, témacsoport, alpont és legbelső részlet középre igazodik.
- **Asztali kártyák:** tördelhető, középre rendezett flexsorok; az utolsó
  egy vagy két kártya nem marad a bal oldalon. Az általános kártyák
  szélessége legfeljebb 570 px, a táblázatos, idővonalas és galériás
  széles kártyáké 1000 px. Köztes szélességnél külön 310 px-es alapméret.
- **Mobil:** egyoszlopos, középre helyezett kártyák, középre rendezett
  részletek. A telefonos csengetési időlista továbbra is két könnyen
  olvasható oszlopban marad, mindkét érték középre igazítva.
- **Komponensenként:** a számozott lépések és az idővonal csomópontjai
  a tartalom középvonalára kerültek; a harmonikák címei, jelvények,
  képgalériák, táblázatcellák és listák is középre igazodnak.
- **Kezdőlap és sportarchívum:** a sportsiker-szakasz címe, kártyáinak
  neve/eredménye, a szűrők állapotfeliratai és a részletező szövegek
  középre kerültek. A fejléc menügombjainak és a keresőmezőknek a
  megszokott, használható működése megmaradt.
- **Regresszió:** ismét lefutott a 49 × 2 oldalrenderelés és a teljes
  működési teszt. Új CSS-ellenőrzések védik a középre igazítást.
- **Vizuális tesztkorlát:** a headless Chromium indítását a környezet
  blokkolja, a megnyitott grafikus böngésző pedig nem érheti el a helyi
  kiszolgálót és a fájl-URL-t. Valódi képernyőképes teszt így nem
  készülhetett, amit a publikálás előtt pótolni kell.

## A 2.30 újdonságai

- **49 különálló oldal:** a hat főmenü 9 + 8 + 8 + 8 + 8 + 8
  végpontjának mindegyike saját `pagePreview.pages[azonosító]` JSON-objektumot
  kapott. Az oldalankénti kártyaszám, a témacsoportok, alpontok és részletek
  száma a valódi tartalomhoz igazodik; nincs háromkártyás megszorítás.
- **Tartalomtípushoz illő komponensek:** helyileg stílusozott,
  Bootstrap-kompatibilis kártyák, listacsoportok, lépéslisták,
  idővonalak, natív kinyitható harmonikák, táblázat, mobilos adatlista,
  figyelmeztető blokkok, jelvények és képgaléria. Külső CDN nélkül működnek.
- **Külön kód:** a `desktop/page.js` és a `mobile/page.js` önállóan
  építi meg az oldalakat, de ugyanazt az érvényesített JSON-t használja.
- **Közös adatok:** `site.fullName`, `site.principal`,
  `home.footer.address`, `.email`, `.phone` hivatkozásként újrahasznosíthatók;
  `publicNews` hírei több híroldalon egyetlen szerkesztési helyről jelennek meg.
  A közös kereső automatikusan indexeli az új oldalakat, a hírbejegyzéseket
  és a mélyen beágyazott részleteket is.
- **Közlésfegyelem:** csak nyilvános, intézményi témákból átvett
  tényszerű információt tettünk hozzá. Új tanulói neveket, képeket vagy
  személyes eredményeket nem gyűjtöttünk. A 2.29-ből örökölt 30
  sporteredmény-*mintaadatot* változatlanul megtartottuk a régi modul
  megőrzésére; ezek **nem minősülnek hitelesített iskolai eredményeknek**,
  közzététel előtt cserélendők, személyes adatokat csak jogosultsággal.
- **Nincs szakkör:** a korábbi `education-talent` menüazonosító mellett
  a megjelenő menünév „Tehetséggondozás”, az új tartalomban nem állítunk
  szakköri foglalkozásokat.
- **Archívum megtartása és javítása:** a `sports-results` oldalon a
  kereshető sportsiker-archívum mellett már a 2.30 saját tartalma is látható.
  A sportképes galéria nem jeleníti meg kétszer ugyanazt a képsorozatot.
- **Híridővonalak:** a nyilvános, dátummal ellátott hírek a témának
  megfelelő nézetben szerepelnek; a közelgő és lezárult események
  szétválasztása az időadatokból történik.

## Teljes hibajavítás és ellenőrzés

Indítás: `node tools/test.mjs`. Az automatizált teszt ellenőrzi a
menüszerkezetet, mind a 49 oldalt **két platformon (98 render)**,
a változó számú komponenseket, harmonikát, táblázatot, galériafájlokat,
közös JSON-hivatkozásokat, dinamikus keresést és a meglévő kapu-,
téma-, fejléc-, menü-, archívum- és tájékoztatási működést.
Lefuttatva: a kód- és viselkedéstesztek sikeresek. A környezet a
headless Chromium indítását megakadályozta; valós böngészőben és
telefonon a végső vizuális ellenőrzés még szükséges.

## Korábbi verziók megőrzött története

Az ezt követő szakaszok a 2.29-es és régebbi fejlesztések korabeli
állapotát írják le. Azok, amelyek „három kártyáról” vagy
`pagePreview.sections`-ről szólnak, kizárólag a régi kiadásokra igazak.

# Csanádi 2.29 – a világos nyitókép láthatóságának javítása (történet)

Ez a ZIP **nem publikált** fejlesztési kiadás. A 2.15-ös forráscsomagot
és a 2.16–2.28-as fejlesztéseket folytatja az elfogadott funkciók
megtartásával. A korábbi ZIP-ek változatlanul megmaradtak.

## A 2.29-es hibajavítás

- Világos témában a 2.28-as, teljes 160dvh-s nyitóképet
  egy fölötte lévő, átlátszatlan krémszínű háttér
  eltakarhatta. A réteg a szándék szerint csak finom
  fényt adjon a fotónak.
- A világos témához tartozó `.desktop-hero-after`
  háttér most **áttetsző arany fény**, így a fotó
  mindkét témában végig látható a következő tartalomig.
- A képek hárompercenkénti véletlenszerű váltását,
  a címer lassított görgetését, a témaváltót és
  az önálló mobilos megjelenítést nem változtattuk meg.
- A hiba ellen külön CSS-regressziós ellenőrzés készült.
- **Következő beszélgetésben:** mind a 49 almenühöz egyedi,
  témaspecifikus, valóban megjelenítendő tartalom készüljön.
  A hiteles iskolaadatokat ellenőrzött forrásból kell
  gyűjteni; tanári neveket, órarendet, felvételi
  dátumokat kitalálni nem szabad. Ez a tartalombővítés
  **nem része a 2.29-es hibajavításnak**.

## A 2.28-as fejlesztések

- **Asztali nyitókép:** a nagy címer eleinte lassabban indul felfelé
  (köbös, gyorsuló görgetési arány), és csak a nyitó szakasz ragadós
  részének legvégén ér a felső menügomb helyére. A fejléc címere
  csak ekkor veszi át a szerepét; visszagörgetéskor a folyamat megfordul.
  A fotó most a **teljes 160dvh magas nyitószakasz háttere**, nem
  zsugorodik a címer méretére, nem halványul el, és nem marad üres,
  egyszínű sáv a következő tartalom megjelenéséig. A mobilos nyitószakasz
  logikája változatlan.
- **Menüszerkezet:** továbbra is hat főcsoport, de mindegyik alatt
  **legalább nyolc közvetlen almenü** van: Iskolánk 9; Tanulás és
  képzés 8; Felvételi 8; Sport és eredmények 8; Hírek és programok 8;
  Iskolai tudnivalók 8. Összesen **49 valódi, megnyitható almenüvégpont**.
  A rövid, pontatlan címeket közérthetőbbekre cseréltük; a meglévő
  belső ID-k és a sporteredmény-archívum útvonala megmaradtak.
  Harmadik menüszint továbbra sincs. A JSON ellenőrzése
  visszautasítja a nyolcnál kevesebb almenüt tartalmazó csoportokat.
- **Aloldalak:** a korábbi háromsoros, egyszerű felsorolást minden
  még tartalomvázlatos aloldalon **Bootstrap-szerkezetű
  `card` / `card-body` / `card-title` kártyák** váltják.
  Mindegyik lapon három kártya, kártyánként két témacsoport,
  mindegyik alatt két alpont, alpontonként két részletező sor
  jelenik meg. Ezek **tervezett szövegek**, nem hitelesített iskolai
  információk; közzététel előtt az iskola saját tartalmára cserélendők.
  A Bootstrap osztálynevek helyi, testre szabott CSS-t kapnak,
  külső CDN vagy hálózati függés nélkül.
- **Külön platformstílus:** asztalon tágas háromhasábos
  arany–sötétkék/krém kártyák, a köztes szélességnél két hasáb;
  mobilon kompakt, egyhasábos, külön kialakított kártyák.
  Mindkettő követi a sötét/világos témát.
- **Egyetlen adatforrás:** a hat témacsoport teljes, többszintű
  kártyatartalma a `shared/data/site.json`
  `pagePreview.sections` mezőjében található. A kereső a kártyák
  **összes beágyazott szövegét** is keresi. A menü
  `menu.items` mezője az egyetlen név- és linkszerkesztési hely.
- **Ellenőrzés:** a Node-alapú regressziós tesztek sikeresek,
  az asztali böngészőben képernyőn igazolható, hogy a fotó
  az alatta induló sportsikerrészig kitart, a címer csak a
  görgetési szakasz végén jelenik meg a fejlécben, nyolc
  sportos almenü nyílik, az új aloldalon három
  kártya és 24 részletező sor látható; világos témában
  az új kártyák színei is átállnak. Valós telefonon
  további vizuális próba ajánlott.

## A 2.27-es javítás

- Az asztali nyitókép görgetése után a felső fejlécsorba kerülő **címeres
  menügomb háttérszíne** korábban sötétkéken maradt világos témában is.
  Oka: a tömörített fejlécgombra külön, rögzített kék radiális háttér volt
  megadva; ehhez nem tartozott világostéma-felülírás.
- Világos témában a gomb most világos krém–arany árnyalatot és hozzá illő
  arany szegélyt, finom árnyékot kap. Sötét témában a mélykék háttér és az
  arany szegély megmarad. Automatikus témánál is a tényleges rendszerbeállítást
  követi, mert ugyanaz a `data-theme` állapot irányítja.
- A gomb mérete, címerképe, megnyitási működése, görgetési animációja,
  a fejléc és az összes többi elfogadott funkció változatlan.
- A felhasználó kérése szerint a lábléc frissítésellenőrzésének időköze
  **60 helyett 10 másodperc** lett, kezdeti felirata rövidebb:
  **„Frissítés: 10 mp-enként”**. A JSON-ban a felirat valójában
  `"Frissítés: {seconds} mp-enként"` sablon, így a **10 csak egyszer**,
  a `refreshSeconds` értékében szerepel. A sikeres ellenőrzés utáni címke
  **„Ellenőrizve”**. Rejtett lapon nincs lekérés; a 10 másodperces
  ellenőrzés változatlan JSON-nál nem építi újra a tájékoztató gombokat.
  Ezt a teszt 20 másodpercre történő JSON-módosítással is ellenőrzi.
- Az **intézménynév egyetlen forrása** a `site.fullName`: ebből készül
  mindkét fejléc kétsoros felirata és a nyitókapu nagybetűs neve. Kivettük
  a korábbi `gateCaption`, `schoolLine1` és `schoolLine2` másolatokat.
- A sportsikerek kezdőlapi bevezetőjéből kikerült a külön beírt „hat” szám:
  a kiemelés darabszámát a valós JSON-elemek és a hatos megjelenítési logika
  szabja meg. Az Impresszum nem tárol külön cím- és e-mail-másolatot;
  ezek egyetlen forrása a `home.footer.address` és `home.footer.email`.
- A következő fejlesztések alapelve: **egy adatnak egy szerkesztési helye
  legyen**, az ettől függő feliratok és megjelenítések abból képződjenek.
  Nagy látogatottság esetén az ellenőrzés gyakorisága később JSON-ból
  módosítható, majd oldalújratöltéssel lép életbe.

## A 2.26-os javítás

- Az archívum keresése vagy szűrése után a **találati kártyák vízszintesen
  középre rendeződnek**. Ha csak egy eredmény van, az pontosan középen
  jelenik meg; két találat is középen áll. A több, de nem teljes sort alkotó
  eredményeket ugyanez a működés rendezi el.
- Asztalon megmarad a **háromoszlopos**, mobilon a **kétoszlopos** alapméret.
  Egyetlen találat sem nyúlik teljes képernyőszélességűre. A kezdőlap
  hat kiemelt kártyájának rácsát ez a javítás nem érinti.
- A mobilos, 350 px alatti keskeny képernyőkhöz, illetve a 768–950 px-es
  asztali átmeneti tartományhoz külön kártyaszélesség-tartalék tartozik.
  A CSS-szabályokat automatizált regressziós teszt is ellenőrzi.
- Élő asztali böngészőben az egyetlen „Nagy Lilla” keresési találat
  középpontja **0 px** eltérést mutatott a 1200 px széles archívrács
  középpontjához képest. A kártya 385 px körüli, tehát a normál
  háromoszlopos méretét megőrizte. Telefonon a CSS-tesztek sikeresek,
  valódi készülékes megjelenés-ellenőrzés még szükséges.

Az alábbi 2.25-ös részletes funkcióleírás továbbra is érvényes.

## A 2.25-ös fejlesztés

- A **Sportélet → Sporteredmények** archívum a korábban egyeztetett
  **A – Szűrhető sportgaléria** változatot kapta. Alaphelyzetben a 24
  korábbi sportsikerből oldalanként hat látható, asztalon tágas 3 × 2,
  mobilon kompakt 2 × 3 elrendezésben. A további eredményekhez
  asztalon számozott, mobilon egyszerű előző/következő lapozó tartozik.
- A kártyákon **név, sportág, eredmény, dátum** látszik. A képpel
  rendelkező és kép nélküli kártyák egységes méretűek; hiányzó vagy
  hibás fotó esetén krém–arany tipográfiai háttér jelenik meg.
- Az archívum önálló **keresője** névre, sportágra, eredményre és a
  JSON-ban szereplő szövegekre keres, ékezeteket, rokon értelmű
  szavakat és kisebb elgépeléseket is kezel. A sport- és évszűrő
  értékei a JSON-ból származnak; az évszűrő csak több év esetén
  jelenik meg. A sorrend legújabb/legrégebbi között váltható.
  A keresés és a szűrők együtt működnek, és módosításuk az első oldalra állít.
- **Keresés vagy szűrés esetén mind a 30 eredmény részt vesz**:
  a kezdőlapon kiemelt hat találatát „Kiemelt” címke jelzi.
  Üres találathoz saját állapot és szűrőtörlés tartozik.
- Asztalon a szűrés vezérlői közvetlenül látszanak; mobilon a kereső
  állandóan látható, a sportág/év/sorrend a **Szűrők** gombbal nyitható.
  A keresés, a rendezés és a megjelenített oldal állapota visszatéréskor
  megmarad.
- A lebegő részletezőben a **jelenlegi oldalon látható hat** között
  előző/következő navigáció működik. A háttér elmosódik és sötétedik;
  X, háttérkattintás és Escape bezárja az ablakot, a fókusz visszaáll.
  Közvetlen sporteredmény-hivatkozás esetén az adott részlet megnyílik,
  és a korábbi archívumszűrőket nem írja felül.
- Az adatforrás továbbra is a közös `shared/data/site.json`, a logika
  külön `desktop/successes.js` és `mobile/successes.js` modulban,
  saját stílusokkal valósul meg. A mintanevek és sporteredmények
  még **nem hiteles iskolai adatok**; publikálás előtt cserélni kell.

Az alábbi verziótörténeti szakaszok a korábbi kiadások állapotát
írják le; az aktuális működésben a fenti **2.29-es változások** is érvényesek.

## A 2.24-es fejlesztés

- A mobilos és az asztali kereső a **mindig aktuális, ellenőrzött JSON-ból**
  épít találatokat minden beíráskor: menüoldalak, külön oldalként megmaradt
  képzési témák, diákok nevei és eredményei, az archívum, húsz asztali
  képfelirat, mobilos témák, lábléc-tájékoztatások és elérhetőségek.
  Ékezet nélkül, JSON-ban megadott rokon értelmű szavakkal, hosszabb
  kifejezéseknél 1–2 karakteres elírással is kereshető. Az eredmények
  a megadott oldalt vagy a konkrét lebegő részletezőt nyitják meg.
- A JSON-ban **30 sportsiker** szerepel. Közülük a **dátum szerint legújabb
  hat** van a kezdőlapon (asztal: 3×2, mobil: 2×3); a régebbiek az
  **Sportélet → Sporteredmények** oldalon, archív kártyákkal és ugyanilyen
  lebegő részletezővel érhetők el. Egy régebbi név közvetlenül is kereshető.
  A **24 archív kártya** között két fotós és huszonkét elegáns kép nélküli
  állapot is szerepel. A nevek, dátumok és eredmények fiktív próbaadatok; az éles
  verzióban az iskolai adatokra cserélendők.
- A menü **legfeljebb két szintű**: hat főcsoport, azok alatt közvetlen
  almenük. Kikerült a harmadik panel mindkét felületből. Az egykori
  Képzéseink → három altéma nem veszett el: oldalcímek és kereshető
  hash-útvonalak maradtak, későbbi oldalon belüli választóhoz előkészítve.
  A választható megoldásokról a következő fejlesztési döntés születhet.
- A lábléc **Utolsó frissítés**, **Frissítések ellenőrizve** és **Verzió**
  sora egyaránt **középre igazított asztalon és telefonon**. A dátum,
  ellenőrzési idő és verzió továbbra is automatikusan frissül.
- A két platform önálló JS/CSS-kódja, a témaállapotok, a képkészlet, az
  elfogadott arany menügyűrű, a JSON-hiba esetén induló offline nézet és
  az automatikus újrapróbálkozás megmaradtak.

Az alábbi szakaszok történeti leírások; az azóta továbbfejlesztett
archívum többi működését a 2.25-ös szakasz rögzíti.

## A 2.23-as fejlesztés

- Az asztali kezdőképen a fejléc alatt megismételt **„CSANÁDI / SPORTISKOLA”**
  címblokkot és az alsó **„CSANÁDI SPORTISKOLA / Sport · Tudás · Közösség”**
  feliratot eltávolítottuk. A rögzített fejlécben a hivatalos iskolanév és a
  mottó továbbra is szerepel; ezeket a nagy fotó már nem írja ki újra.
- A görgetéskor előtűnő háttérréteg is felirat nélküli lett. A képes
  nyitó, a középső nagy címer és annak fejlécbe mozgása, az arany
  menügyűrű, a képlapozás, a 20 fotó és az alsó, kattintható hírsáv megmaradt.
  A keresőmotor számára és képernyőolvasóval továbbra is van egyetlen
  rejtett első szintű cím.
- A fejlécben már látható mottót a lábléc alján sem írjuk ki még egyszer.
  A Kapcsolat és Tájékoztatás felületek, betűgombok és adatok megmaradtak.
- Mobilon az első és az utolsó, három-három képet együtt mutató állapot
  eltérő, természetes feliratot kapott: **„Nézz körül nálunk”**,
  illetve **„Együtt tovább”**. A köztes sport, tudás, közösség
  állapotok, a külön mobilkód és az automatikus görgetéskövetés változatlanok.
- Mindezek a szövegek a **JSON-ból** tölthetők; a 2.23-as
  tesztek ellenőrzik, hogy nem kerül vissza a többszörös felirat.
- A mobilos lábléc **„Tájékoztatás”** füle alatt a frissítési állapot,
  az ellenőrzési szöveg és a verziószám ezentúl középre igazítva jelenik meg.
  Az asztali lábléc elrendezése ettől nem változik.

## A 2.22-es fejlesztés

- Az asztali teljes képes nyitás középső, **keret nélküli címergombja
  kétszer akkora** lett a 2.21-eshez képest, a „MENÜ” felirat pedig
  eltűnt. A kattintható címer ugyanúgy nyitja a körmenüt; görgetésre
  továbbra is a korábbi méretű felső fejléc-címerbe húzódik össze.
- A jobb felső képfelirat helyett az asztali **nyitókép alján végigfutó,
  TV-hírsáv jellegű teljes szélességű link** látható. A sávon
  „CSANÁDI HÍREK”, az aktuális diakép kategóriája, címe és „MEGNYITÁS”
  jelzése szerepel. A teljes sáv kattintható, a hozzá rendelt JSON-aloldalra
  vezet. A hosszabb cím egy sorban marad és szükség esetén levágódik.
  A sötét és világos téma külön változatot kapott.
- Az egykori „Mi kerül majd a kezdőlapra?” **átmeneti felsorolás**
  mindkét kezdőlapról és a közös JSON-ból kikerült. Asztalon a
  görgethető nagy nyitó után, mobilon a rövid képsáv után már közvetlenül
  a tényleges, hat kártyás sportsiker-szakasz következik.
- A felhasználó képernyőképén azonosított, **nagy kék és arany kört a fotóba
  eleve beépítve tartalmazó** `hero-music-new.webp` állományt kivettük
  a 2.22-es forrásból. Helyette új, kör és grafikus fedés nélküli,
  asztaliteniszes sportfotó (`hero-table-tennis-new.webp`) került be.
  Az asztali váltakozó képek száma továbbra is **20 különböző**.
  A régi kép a változatlan 2.21-es ZIP-ben visszakereshető.
- A két asztali menügyűrű között vékony **arany körvonal** marad,
  a főmenü és almenü külső, külön keretes panelje nélkül.
- A külön mobilos és asztali kód, a JSON-alapú tartalom, az offline
  tartalékoldal, az automatikus újrapróbálkozás és a korábban elfogadott
  többi működés megmaradt.

## A 2.21-es fejlesztés

- A kezdőlap új **Diákjaink sportsikerei** szakaszt kapott, pontosan hat,
  `shared/data/site.json` állományból betöltött bejegyzéssel. Az asztali
  kódban **3 × 2**, a külön mobilos kódban **2 × 3** kártyás rács jelenik meg.
- A kártya neveket, sportágat, eredményt, és négy esetben sportképet mutat.
  Két bejegyzéshez **nincs kép**; ezek szándékosan megtervezett arany–krém
  tipográfiai felületet kapnak, a részletezőablakban is. Ha egy kép
  betöltése sikertelen, ugyanez a tartalékmegjelenítés lép életbe.
- A kártya kattintásra **középre lebegő részletes nézetet** nyit: a
  háttér elsötétedik és elmosódik, a részletek az eseményt, dátumot,
  leírást és továbblépési hivatkozást tartalmazzák. Bezárás X-szel,
  háttérre kattintva vagy Esc billentyűvel, a fókusz visszakerül a kártyára.
- Az asztali nyitókép közepén a zavaró, túlméretezett **kerek címerkeret
  eltűnt**. A címer visszafogott, keret nélküli, „MENÜ” feliratos gombként
  továbbra is megnyitja a főmenüt, és görgetéskor a fejlécbe költöző
  menülogika változatlanul működik.
- A hat név, sporteredmény és dátum **ellenőrizetlen, fiktív próbatartalom**;
  a weboldalon nincs külön „minta” jelzés a fejlesztési előnézethez.
  **Publikálás előtt** a JSON-ban hiteles iskolai adatokra kell cserélni.
- Külön asztali és mobilos CSS/JS, a meglévő témák, JSON offline
  tartalékoldal és automatikus újrapróbálkozás megmaradtak.

## A 2.20-as javítás

- **Hiba oka:** a nagy nyitókép összehúzódása után a rögzített asztali
  fejléc `backdrop-filter` szűrője új, korlátozott pozicionálási környezetet
  hozott létre, mert a teljes képernyős körmenü a fejlécen belül volt.
  Így a mögötte lévő oldalt a takaróréteg nem sötétítette és nem mosta el
  teljes magasságban.
- **Javítás:** az asztali körmenü és kereső teljes képernyős takarórétege
  a fejléc közvetlen testvére, de továbbra is a témát hordozó asztali
  oldal része. A menü mögött minden görgetési állapotban ugyanaz a
  20 px-es elmosás, finom halványítás és 36%-os sötétítés működik.
  A gombok élesek, a menük körül nincs új keret.
- A világos és sötét fejléc régi színei a külön rétegekre is átkerültek.
  A külön mobilos kód, a JSON-tartalom, az offline oldal és a meglévő
  képek nem változtak.
- Új regressziós teszt vizsgálja a menü és kereső szülőelemét, valamint
  a görgetés után megnyitható körmenüt. A kód- és viselkedéstesztek
  sikeresek, a 2.20-as élő asztali előnézetben pedig igazoltuk, hogy a
  takaróréteg teljes mérete a képernyőé (`1363 × 936 px`), és a
  háttérszűrő aktív.

## A 2.19-es, kétkörös hibajavítás eredménye

**1. kör – navigáció és almenü:**

- Az asztali harmadik szintű almenü ugyanarra az aktív almenügombra
  kattintva már **összecsukódik**, és ismételt kattintásra újranyílik.
  Az `aria-expanded` állapota is helyes; másik főág választása továbbra is
  teljesen lecseréli a korábbit.
- A menüből másik oldalra navigálva a korábbi lap mély görgetési pozíciója
  nem öröklődik át: az új oldal **felülről indul**.

**2. kör – sérült képsor és billentyűzet:**

- Két vagy több egymás melletti sérült kapukép esetén az animáció
  **a legközelebbi elérhető képet tartja meg**. Nem ugrik vissza az első
  képkockára a nyitási folyamat közepén.
- A menük és keresők fókuszcsapdája a kívülről érkező **Shift+Tab**
  esetén most a helyes utolsó vezérlőre léptet, a sima Tab pedig az
  elsőre. A normál, körkörös billentyűzetes navigáció változatlan.

Mind a négy javításhoz regressziós teszt készült. A teljes kódteszt sikeres.
Az asztali nyitó és a körmenü élő előnézetében az almenü ki-/bekapcsolását,
a később megnyitott aloldal felülről indulását és az asztali megjelenést
külön is ellenőriztük. A mobilos tényleges képernyőméretű látvány
továbbra is külön jóváhagyandó.

## A 2.18-as módosítás hatóköre

- **Az asztali menü mögötti oldal jobban, de továbbra is felismerhetően
  elmosódik és sötétedik.** A menüháttér sötétítése `rgba(3,15,29,.23)` →
  `rgba(3,15,29,.36)`, az elmosás 13 → 20 px. Finom `saturate(.78)` és
  `brightness(.88)` háttérszűrés is társul hozzá.
- **Nincs külön keret a főmenü és az almenük mögött.** A két díszítő
  körvonalat eltávolítottuk a programkódból; a teljes menüszínpad háttere
  átlátszó. A harmadik szint panelje is keret és háttér nélkül maradt.
  Az egyedi kattintható gombok szegélye és a menücímer megmaradt.
- Az asztali nyitóképről **a `1/20` számlálót és a stop/szünet gombot
  eltávolítottuk**. A 20 kép hárompercenkénti automatikus, véletlen
  sorrendű váltása, a bal/jobb lapozás és a jobb felső információs
  kártya megmaradt.
- **A jobb felső asztali képfelirat mindig egy sorban marad.** A kártya
  a felirat hosszának megfelelően balra szélesedhet, a cím és a kategória
  nem tördelődik; keskenyebb asztali ablakban az identitásfelirattól
  lejjebb kerül, hogy ne takarják egymást.
- **A mobilos képsáv alól kivettük a mintegy 420–620 px magas üres
  görgetési pályát.** A 124–152 px magas képsáv normál tartalmi elemként
  foglal helyet, görgetés közben felül megtapad, és a kezdőlap felsorolása
  **közvetlenül alatta** kezdődik. A természetes oldalmozgásra öt
  képállapotban vált: együtt → Sport → Tudás → Közösség → együtt.
  Képei áttűnnek, a sorsolt kilenc fotó előre betöltődik. Nincs az alján
  **„Görgetési állapot” felirat, lépésszámláló vagy görgetési súgó**.
- **Kisebbek az alsó gombok:** asztali négy betűgomb 39-ről 32 px-re,
  mobilos betűgombok 31-ről 26 px-re, mobilos két fül 28-ról 25 px-re.
  A két platform stílusa továbbra is elkülönített, a gombok egyenletesen
  töltik ki a nekik jutó helyet.
- A keresők, fejlécmenük, JSON-tartalom, offline tartalékoldal, a 20
  asztali és 18 mobilos egyedi kép változatlan.

**Korlát:** a kódtesztek sikeresek, de a futtatókörnyezetben a
böngészős képernyőteszt továbbra sem használható. A mobilos megtapadás,
a jobb felső felirat és az elmosás végső vizuális megítélése valódi
telefonos és asztali böngészőben jóváhagyandó.

## A 2.17-es módosítás hatóköre

- A mobilos kezdőlap **öt egymás utáni görgetési állapotot** kapott:
  **Sport · Tudás · Közösség együtt → Sport → Tudás → Közösség → ismét együtt**.
  A sáv tényleges látható magassága kb. 130–158 képpont, és minden állapot
  ugyanabban a teljes szélességű, görgetésre reagáló felületen jelenik meg.
  A mobilos címeres főmenügomb változatlanul a felső fejlécben marad.
- Mindhárom témához **hat-hat önálló, új kép**, összesen **18 különálló WebP**
  készült. A témákhoz a betöltéskor véletlenszerűen kerül kiválasztásra három
  eltérő kép: egy az együtt induló, egy az önálló és egy az együtt záró állapothoz.
  Az együttállásban három képrészlet, a külön témáknál egy nagy képrészlet látszik.
  A JSON tartalmazza a képlistákat és a szövegeket, a logika kizárólag
  `mobile/story.js` fájlban él.
- Az asztali nyitó **görgetési animációját újraépítettük**: a nagy fotó és
  a címer a fejléc valódi címerpozíciójához tart, a fénykép köre simán
  szűkül. A korábbi kép teljes eltűnését megakadályozó rövid oldalhossz után
  most van egy teljes képernyőnyi, saját tartalmi folytatás, ezért a
  nyitófelület továbbgörgetve ténylegesen kimegy a látótérből.
- Az **alsó lefelé mutató nyilat eltávolítottuk** az asztali nyitóképről.
  A dia információs kártyája a bal alsó helyett a **jobb felső** sarokba került.
  A világos/sötét/automatikus téma az asztali hero és fejléc külön szín- és
  árnyékolási szabályait is vezérli.
- Mindkét kezdőlapon JSON-ból működő, **háromelemű ideiglenes felsorolás**
  mutatja, milyen tartalmak kerülnek majd oda. Asztalon a nyitókép után,
  mobilon a képes történet alatt található. A valódi iskolai oldalblokkok
  továbbra is későbbi fejlesztésre várnak.
- Az asztali **20 képes, 3 percenként váltó, óránként teljesen újrakevert**
  vetítés változatlan; a mobilos 18 új kép ettől teljesen független.

**Vizuális tesztkorlát:** a kódtesztek a struktúrát és állapotváltásokat
ellenőrzik, a korábbi futtató környezet a Chromium elindítását blokkolta.
Éles asztali és telefonos megjelenésben szükséges a végső jóváhagyás.

## A 2.16-os módosítás hatóköre

- Az **asztali lábléc** külső és belső térközeit, betűméreteit, valamint a
  négy aranyhatású gomb magasságát jelentősen csökkentettük: a korábbi
  magas tömb helyett nagyjából feleakkora, tömör, kétoszlopos sáv a cél.
- A **mobilos lábléc** két füle és 2×2-es betűgombjai megmaradtak, de
  keskenyebb szegélyekkel, 31 pixeles gombmagassággal, rövidebb sorokkal és
  jóval kisebb felső/alsó térrel; a cél a korábbi magasság harmada körüli sáv.
- Az 1.53-as asztali nyitóképsor eredeti **kilenc** képfájlját átemeltük,
  és a sportiskola világához illő **tizenegy** további képpel bővítettük.
  Mind a húsz kép önálló 16:9-es WebP állomány; külön feliratot a képekre
  nem helyezünk.
- A dia **180 000 ms**, vagyis **3 perc** után vált. A képek minden körben
  Fisher–Yates módszerrel új, véletlen sorrendbe kerülnek, a húsz kép egy
  körön belül pontosan egyszer jelenik meg, a körök határán sincs közvetlen
  ismétlés. Ez normál, nyitva tartott lapon egy **60 perces képkört** ad.
  Előre/hátra léptetés működik; a 2.16-os kézi szüneteltetés a 2.18-ban
  felhasználói kérésre kikerült.
- Asztalon a teljes képes nyitófelületen az **aranykeretes, nagy középső
  címer** nyitja a meglévő kétgyűrűs menüt; a fejléc középső menügombja
  induláskor rejtve van. Lefelé görgetve a teljes fotó kör alakban
  összezáródik, a nagy címer ugyanennek az átmenetnek a során a fejléc
  felé mozdul, ott megjelenik az eredeti menügomb. Visszagörgetve a nagy
  kép és címer visszaáll.
- **Mobilon nem jelenik meg** ez az asztali képsor vagy görgetési animáció.
  A mobilos címeres menügomb továbbra is mindig a felső ikonsorban van.
  A jóval alacsonyabb mobilos görgetési nyitóelem a 2.17-ben külön készült el.
- A 2.15-ös keresők, menük, JSON-hiba esetén megjelenő tartalék offline
  oldal és automatikus újrapróbálás változatlanul megmaradtak.

**Vizuális ellenőrzési korlát:** a környezet a Chromiumot blokkolja, ezért
az új összehúzódó képfelületet és a láblécek tényleges pixeles magasságát
külön élő böngészőben is ellenőrizni kell. A méretcél CSS-szabályokkal
megadott, nem mért képernyőfotós eredmény.

## A 2.15-ös módosítás hatóköre

- A négy tájékoztató gomb JSON-ban külön tárolt, **egyedi betűjelet** kapott:
  **I – Impresszum**, **D – Adatkezelési tájékoztató** (adatvédelem),
  **A – Akadálymentességi nyilatkozat**, **M – Működés**.
- Az utolsó gomb neve egyszerűen **Működés**. A korábbi stabil `hasznalat`
  adat-azonosító megmaradt.
- Az ikonok arany hatású, rétegzett gombstílust kaptak. Az **asztali** láblécben
  négy egyforma szélességű, a szabad magasságra nyúló oszlop,
  **mobilon** két egyforma szélességű oszlop és két egyforma magasságú sor van.
  A két külön platform CSS-e külön szabályozza a méreteket.
- A JSON-frissítés az ismétlődő vagy hibás betűjeleket elutasítja.
  A regressziós teszt az új feliratokat és elrendezési szerződéseket is ellenőrzi.
- Az asztali és mobilos Spotlight kereső külön, részletesebb üveghatású felületet
  kapott. A háttér mindkét képernyőn elmosva, de felismerhetően látható,
  ugyanígy a körmenük mögött is. A négy **valódi** elérhetőséghez gyorsválasztó,
  kategória, leírás és billentyűzetes találatfókusz került.
- Hibás, hiányzó vagy átmenetileg nem elérhető induló JSON esetén a program
  egy külön, minimalista offline tartalékoldalt mutat. Kézi újrapróbálás,
  5–30 másodperc között fokozatos automatikus ismétlés és `online` eseményre
  azonnali újrakérés működik. A normál alkalmazás a korábbi hash-útvonalon
  tér vissza, amint a szükséges adatok ismét betölthetők.
- A kapu, a menük, a keresők, a szerkesztőkapcsoló és az oldalvázlatok
  működő útvonalait és a korábbi tartalmi korlátokat megőriztük.

## Szerkezet

Az egyetlen HTML az `index.html`. Minden látható iskolai felirat,
menücím és beállítás a `shared/data/site.json` fájlból származik.

```text
index.html
shared/
  data/site.json             – közös tartalom, oldalvázlat és menühierarchia
  js/entry.js                – mobil/asztali modul, útvonal és frissítés
  js/menu-data.js            – kétszintű, egyedi azonosítós menüellenőrzés
  js/appearance.js           – automatikus, világos és sötét állapot
  js/focus.js                – közös billentyűzetes fókuszléptetés
  js/edit-mode.js            – közös kétállású szerkesztési mód
  js/shell.js                – közös ikonok és keresőmegjelenítés
  js/search-index.js         – az aktuális JSON teljes dinamikus keresőindexe
  js/successes-data.js       – a hat friss és a régebbi sportsikerek leválogatása
  js/footer.js               – betűikonos tájékoztatás, felugró ablak, JSON-frissítés
  js/offline.js              – minimális, JSON-független offline tartalékoldal
  js/gate.js                 – a változatlan, 30 fázisos kapu
  css/base.css               – közös, újrafelhasználható alapstílusok
  assets/...                 – a közös címer és kapuképek
mobile/
  app.js, header.js          – önálló mobilos fejléc és összerakás
  story.js                   – öt görgetési állapot és témánként 6 véletlen fotó
  successes.js               – mobilos sportsikerek és archív részletezők
  menu.js                    – a választott D jelű, íves mobilos iránytű
  page.js                    – saját mobilos, középre igazított oldalvázlat
  search.js                  – saját, teljes képernyős Spotlight kereső
  styles.css                 – kizárólag mobilos elrendezés
desktop/
  app.js, header.js          – önálló asztali fejléc és összerakás
  hero.js                    – újraépített teljes képes nyitó, 20 dia, görgetési pálya
  successes.js               – asztali sportsikerek és archív részletezők
  menu.js                    – saját, két szimmetrikus gyűrűs lebegő menü
  page.js                    – saját asztali, középre igazított oldalvázlat
  search.js                  – saját, lebegő Spotlight kereső
  styles.css                 – kizárólag asztali elrendezés
shared/assets/media/web/desktop-hero/ – húsz különálló, asztali WebP-nyitókép
shared/assets/media/web/mobile-story/ – tizennyolc különálló, mobilos WebP-kép
tools/stamp-release.mjs      – a JSON release alapján kiadási cache-kulcsok
```

## A menü

- **Asztal:** az 1.53-as `source/js/app.js`, `source/css/compass-2026.css`
  és `source/css/next10-2026.css` kódok alapján a címer körül a hat
  főmenüpont **belső gyűrűben** található. A választott főmenü almenüi a
  **második, külső gyűrűben** jelennek meg. Harmadik menüszint nincs.
  Mindkét gyűrűn a pontok azonos szögközökkel, szimmetrikusan oszlanak el.
  A kiválasztott főmenüpontra újra kattintva annak teljes almenügyűrűje
  összecsukódik. Másik főmenüpontra kattintva a régi ág
  bezárul, az új ág nyílik; a menü újranyitáskor üres kijelöléssel
  indul. A menü mögötti körvonalakat a 2.18-ban teljesen eltávolítottuk.
  Az előző verzió hibáját a kattintási rétegek okozták: a külső gyűrű
  átlátszó felülete elfogta a belső gombok eseményeit. Most a két
  gyűrű konténere nem fogja el a kattintásokat, csak a saját gombjai.
  A teljes menü mögött a weboldal továbbra is látszik, csak elmosva;
  **nincs külön menüablak-keret**. A középső címer bezárja a menüt,
  alatta önálló, tényleges `#/kezdolap` linkként működő házikó található.
- **Mobil:** a jóváhagyott **D – Mobilos iránytű** készült el. A címer alatt
  hat, ívesen elhelyezett főpont található. Keskeny telefonon a hat pont
  kétszéles, háromsoros íves kompozícióban jelenik meg. A második és
  **utolsó szint ugyanebben a menüfelületben**, két egyforma szélességű
  oszlopot alkotó, több soros rácsban nyílik meg. Az aktív főpontra
  ismét kattintva az adott ág bezárul; másik
  főpontra kattintva a korábbi ág lezárul, és az új nyílik. A
  **középső címer zár**, a hozzá kapcsolódó kis házikó a főoldalra visz.
- A címer mindkét fejlécben tényleges menügomb.
- A hat főcsoport és az almenük nevei az 1.53-as `structure.json`
  és oldal-JSON-ok alapján kerültek át **adatként**, nem régi programkódként.
- A menühierarchia végpontjai most **valódi, külön hash-útvonalakat**
  kapnak (`#/oldal/<azonosító>`). Minden oldal megnyílik, de csak
  címből és a JSON-ban leírt jövőbeli tartalmak **középre igazított
  háromelemű felsorolásából** áll. Még nincs közzétett aloldaltartalom.
- Az egyedi menüazonosítók és a **maximum két szint** ellenőrzés alatt állnak.

## Spotlight keresők

- **Asztal:** nagy, de a mögöttes weboldalból körben teret hagyó, lebegő
  üvegpanel; arany keret, áttetsző felület és finomabb háttérelmosás.
  Kiemelt cím, magyarázó szöveg, nagyméretű keresősáv, négy gyorsválasztó,
  kategorizált, leírással és számozással ellátott kétoszlopos találatkártyák,
  élő számláló és valódi törlésgomb.
- **Mobil:** a telefon teljes képernyős keresőjében is áttűnik az elmosott
  eredeti oldal. A megjelenés önálló, keskeny kijelzőre méretezett;
  a gyorsválasztók kéthasábosak, a találatkártyák egymás alattiak.
- Billentyűzetről a lefelé nyíl az első találatra lép; az `Escape` bezár.
  A kereső az összes aktuális JSON-tartalomból építi a találatokat;
  kezeli az ékezeteket, néhány rokon értelmű alakot és az 1–2 betűs
  elgépeléseket. Az üres kereső az elfogadott gyorshivatkozásokat mutatja.
- A valóban meglévő hash-oldalakat és sportsiker/tájékoztató részletezőket
  nyitja, a tartalom átírásakor új találati lista épül.
- A címkék és ikonok szintén a közös JSON-ból származnak.

## Offline tartalékoldal

A normál felület továbbra is az egyetlen `index.html` fájlból indul.
Ha a központi `site.json` első betöltése hibát ad, a felület nem marad üres:
a már betöltött közös CSS és `shared/js/offline.js` egy helyi tartalékoldalt
rajzol. A minimális vészhelyzeti feliratok szándékosan JSON-függetlenek,
mert az eredeti JSON éppen hibás vagy elérhetetlen lehet.

Az újrapróbálás 5, 10, 20, majd legfeljebb 30 másodpercenként történik,
és a böngésző `online` eseménye, illetve az újrapróbálás gomb is azonnali
ellenőrzést kér. Sikeres betöltés után az alkalmazás ugyanarra a hash-útvonalra
lép vissza. Ez **nem** teljes PWA-offline garancia: ha az első látogatáskor
maga a HTML, a JavaScript vagy a CSS sem érhető el, a tartalékoldalt sem lehet
megjeleníteni. A későbbi teljes offline működéshez külön cache-/service-worker
terv szükséges.

## Fejléc és beállítások

Mindkét felületen középen van az iskola kétsoros neve. Az ikonsor
szimmetrikus: balra Facebook, Instagram, KRÉTA; középen menüt nyitó címer;
jobbra Keresés, Megjelenés és Oldalbeállítások.

A jobb oldali harmadik gomb kétállású szerkesztőkapcsoló. Alapesetben
`⚙`, szerkesztő módban `✓`. Az első kattintás egy **lebegő státuszfejlécet**
mutat, a második (pipa) elfogadja a változatlan állapotot, majd kilép.
Sem felugró beállításablak, sem második pipa, sem korai drag-and-drop vezérlő
nem jelenik meg. A három színmódot továbbra is a külön témagomb kapcsolja.
Az automatikus témagomb szimbóluma ismét `◐`, külön türkiz háttérrel és
`A` jelöléssel; ezért nem keverhető össze a beállítások `⚙` ikonjával.

A későbbi, sorrendmódosító/hozzáadó/korlátozottan törlő műveletek
**most még nincsenek bekapcsolva**. Az új rendszer stabil JSON
azonosítókat használ majd. A módváltás továbbra sem nyit beállítási ablakot.

## A lábléc két oszlopa és az élő tájékoztatás

- Asztalon a `Kapcsolat` és a `Tájékoztatás` két **azonos magasságú**, egyenlő
  szélességű panel. A kapcsolatadatok felül, a már elfogadott mottó alul
  helyezkedik el. Mobilon **két egymás melletti fül** választja a két
  tartalmat: egyszerre csak egy panel látható, tehát nem követik egymást
  hosszú, egymás alatti tömbök. Alapból a `Tájékoztatás` nyílik meg,
  így a verziószám rögtön elérhető. A fülek billentyűzettel is válthatók.
- A `Tájékoztatás` oszlop négy **különböző betűjelű, egyenletesen nyújtott gombot** mutat.
  A gomb megnyomására külön, elhomályosított hátterű lebegő ablakban
  jelenik meg az adott szöveg, amely Escape-pel, X-szel vagy a háttérre
  kattintva zárható. A gombok teljes címe akadálymentes feliratként szerepel:
  **Impresszum**, **Adatkezelési tájékoztató**, **Akadálymentességi nyilatkozat**,
  **Működés**. A hivatalos jogi/megfelelőségi tartalmakhoz
  ellenőrizetlen állítást nem tettünk: a jelen állapot technikai ismertető.
- A `Utolsó frissítés` kizárólag a JSON `updatedAt` dátumát mutatja; **nem**
  állítja a böngésző aktuális idejét tartalmi frissítésnek.
- A látható böngészőlapon 10 másodpercenként újra lekérjük a közös
  `shared/data/site.json` fájlt. Érvényes új adatok esetén a négy szöveg,
  a frissítési dátum és a verzió oldalújratöltés nélkül frissül. A nyitott
  lebegő ablak megmarad, tartalma is frissül. Rejtett böngészőlapon nem kérdezünk le;
  visszatéréskor újra ellenőrzünk. Hibás JSON esetén a korábbi érvényes
  információ marad látható.
- A lábléc paneljeit és külső térközeit jelentősen csökkentettük.
  A legalsó sor minden frissítés után a `Verzió: 2.27`,
  illetve a későbbi JSON-verzió.

## Frissítés böngészési adatok törlése nélkül

- A nyitó HTML a `shared/js/entry.js` és az alap CSS fájlt a JSON-ban
  szereplő kiadáshoz kötött URL-lel (`?v=2.27`) kéri le.
- Minden statikus JavaScript-modul-import ugyanilyen verziót kap a
  `node tools/stamp-release.mjs` kiadás-előkészítő lépésben. A két
  platformstílus is verziózott URL-lel töltődik be.
- Az oldal a közös JSON-t friss, gyorsítótárat kerülő lekéréssel olvassa.
  Új kiadás észlelésekor a 10 másodperces ellenőrzés az aktuális
  útvonal megtartásával, új verzióparaméterrel tölti újra a teljes oldalt.
- **Korlát:** a régi, már eltárolt 2.13-as kezdő HTML és programkód
  magától nem feltétlenül tudja alkalmazni az új mechanizmust; az új
  kiadás első elérése egyszer kérhet egy frissítést vagy `?v=2.27`
  URL-t. A tárhely/CDN HTTP gyorsítótárazási szabályai külön is számítanak.

## A visszaállított asztali kezdőlap és a mobilos következő lépés

Az asztali teljes képes nyitó, a címer görgetésre fejlécbe kerülése és
visszatérése a 2.16 része. A képváltó adatai, a képek sorrendjétől független
valós aloldal-hivatkozások, valamint a 3 perces időköz a közös JSON-ból
érkeznek. Külön `desktop/hero.js` kezeli, ezért a mobilos fejléc/menü kódját
nem érinti.

**A 2.17-ben megvalósult mobilos fejlesztést a 2.18-ban átterveztük:**
a „Sport · Tudás · Közösség” tematikus sáv továbbra is öt képi állapotot
és három, hatképes véletlen képválasztót használ, de már nincs mögötte
külön üres görgetőpálya vagy állapotjelző. Ez nem az asztali nagy kép
másolata; a felső címeres menügomb nem kerül át máshová.

A menüvégpontok továbbra is csak minimális, jóváhagyott oldalvázlatokként
nyílnak meg, valós tartalmuk később épül be.
A lábléc `Tájékoztatás` oszlopának legalsó sora a JSON-ból
automatikusan megjelenő `Verzió: 2.27`.

## Tesztek és korlát

A kibontott mappában futtatható: `node tools/test.mjs`.
Az automatizált teszt ellenőrzi a JSON-sémát, az egyetlen HTML-t,
a 60 kapuképet, a külön fejléc-, menü- és keresőmodulokat,
a két asztali gyűrű egyenletes szögközeit, a főágak ki-/átkapcsolását,
a középső bezárógombot,
  a mobilos iránytű két szintjét és ki-/átkapcsolását, a működő
hash-aloldalakat, a Spotlight keresők törlését, a négy valódi
  gyorsválasztó találatait, a teljes JSON-keresést, elgépelést, szinonimákat,
  a hat friss és huszonnégy archív sportsikert, a keresési kategóriákat, a lefelé nyíllal
elérhető találatfókuszt és az áttetsző háttérrétegek CSS-követelményeit,
a fókuszt/ESC-et, a szerkesztési módváltást, a színmódokat, a mobilos
kétfüles láblécet és a
több képernyőméretre vonatkozó CSS-geometriát. A lábléc külön tesztje
ellenőrzi a JSON-frissítést, a hibás válasz elutasítását, a nyitott
lebegő ablak adatfrissítését, valamint a verzióhoz kötött újratöltést.
A hibás induló JSON-t követő tartalékoldal, a kézi újrapróbálás és
az eredeti útvonalra történő visszatérés is célzott tesztet kapott.

**Ellenőrzési megjegyzés:** a `tools/test.mjs` saját, lokális Chromium-indítása
ebben a környezetben nem elérhető. A 2.25-ös asztali archívumot azonban
külön, élő böngészős előnézetben megvizsgáltuk: induló hat kártya,
elgépeléssel is működő keresés a kiemelt hat között, „Kiemelt” jelölés,
lebegő részletező, szűrők törlése, második oldal és a második oldalra
történő visszatérés egyaránt működött. Az automatizált teszt mindkét
platformon vizsgálja az archívum szűrését, lapozását, részletezőjét,
közvetlen útvonalát és állapotmegőrzését. Valódi telefonon – különösen
iOS-en – a végleges elrendezés és a görgetés még külön is kipróbálandó.

Sem GitHubra, sem FTP-re nem töltöttem fel semmit.


## 2.33 – Bootstrap Carousel-integráció és naptári hibajavítás (2026.11.23.)

- A sportsikerek és a tanévi naptár váltását a Bootstrap 5.3.8 hivatalos CDN-es Carousel JavaScript végzi (`Carousel.getOrCreateInstance`, `to`, `slid.bs.carousel`); a saját vezérlő megőrzi a felhasználói szüneteltetést, a 24 másodperces ütemet és az akadálymentes fókuszkezelést.
- A Bootstrap CSS és a Bootstrap bundle JavaScript verzióhoz rögzített, SRI-integritásellenőrzött CDN-hivatkozással kerül betöltésre. Nem készül helyi Bootstrap-másolat. CDN-kimaradás esetén továbbra is működik az egyszerű panelváltó.
- A naptári nap asztalon rámutatás közben is bezárható ismételt kattintással. A mutató távozása továbbra is bezárja a részleteket; mobilon a második koppintás bezár.
- A Carousel a rejtett panelt `inert` és `aria-hidden` segítségével kizárja a billentyűzetes és segédtechnológiás használatból. Valódi Bootstrap-átmenet után szinkronizálja a lapfüleket és a keresőből nyíló eseményeket.
- A regressziós teszt aszinkron betöltésénél a platformmegjelenés tényleges állapotát várja (időkorláttal), nem egyetlen eseménykört.
- Önálló tesztet kapott a Bootstrap `.to()` és `slid.bs.carousel` eseménye, a példány felszabadítása, a CDN-tartalék, a desktop hover + második kattintás, valamint a CDN- és SRI-hivatkozások.
- Az iskolai menü- és eseményadatokat a javítás nem módosítja. Publikálás külön jóváhagyáshoz kötött.
