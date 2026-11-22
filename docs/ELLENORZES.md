# Csanádi 2.17 – új mobilos képes történet és újraépített asztali nyitóoldal

Ez a ZIP **nem publikált** fejlesztési kiadás. A 2.15-ös forráscsomagot
és a 2.16-os fejlesztést folytatja az eredeti 1.53-as képek és minden korábbi
elfogadott funkció megtartásával. A korábbi ZIP-ek változatlanul megmaradtak.

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
  Előre/hátra léptetés és kézi szüneteltetés is működik.
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
  js/menu-data.js            – háromszintű, egyedi azonosítós menüellenőrzés
  js/appearance.js           – automatikus, világos és sötét állapot
  js/focus.js                – közös billentyűzetes fókuszléptetés
  js/edit-mode.js            – közös kétállású szerkesztési mód
  js/shell.js                – közös ikonok és keresőadatok
  js/footer.js               – betűikonos tájékoztatás, felugró ablak, JSON-frissítés
  js/offline.js              – minimális, JSON-független offline tartalékoldal
  js/gate.js                 – a változatlan, 30 fázisos kapu
  css/base.css               – közös, újrafelhasználható alapstílusok
  assets/...                 – a közös címer és kapuképek
mobile/
  app.js, header.js          – önálló mobilos fejléc és összerakás
  story.js                   – öt görgetési állapot és témánként 6 véletlen fotó
  menu.js                    – a választott D jelű, íves mobilos iránytű
  page.js                    – saját mobilos, középre igazított oldalvázlat
  search.js                  – saját, teljes képernyős Spotlight kereső
  styles.css                 – kizárólag mobilos elrendezés
desktop/
  app.js, header.js          – önálló asztali fejléc és összerakás
  hero.js                    – újraépített teljes képes nyitó, 20 dia, görgetési pálya
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
  **második, külső gyűrűben** jelennek meg. Háromszintű ágaknál a harmadik
  szint külön, a választott almenühöz tartozó panelben jelenik meg.
  Mindkét gyűrűn a pontok azonos szögközökkel, szimmetrikusan oszlanak el.
  A kiválasztott főmenüpontra újra kattintva annak teljes almenügyűrűje
  összecsukódik. Másik főmenüpontra kattintva a régi ág és annak harmadik
  szintje bezárul, az új ág nyílik; a menü újranyitáskor üres kijelöléssel
  indul. Az aktív második gyűrű vezetővonala is eltűnik összecsukáskor.
  Az előző verzió hibáját a kattintási rétegek okozták: a külső gyűrű
  átlátszó felülete elfogta a belső gombok eseményeit. Most a két
  gyűrű konténere nem fogja el a kattintásokat, csak a saját gombjai.
  A teljes menü mögött a weboldal továbbra is látszik, csak elmosva;
  **nincs külön menüablak-keret**. A középső címer bezárja a menüt,
  alatta önálló, tényleges `#/kezdolap` linkként működő házikó található.
- **Mobil:** a jóváhagyott **D – Mobilos iránytű** készült el. A címer alatt
  hat, ívesen elhelyezett főpont található. Keskeny telefonon a hat pont
  kétszéles, háromsoros íves kompozícióban jelenik meg. A második és
  harmadik szint **ugyanebben a menüfelületben**, két egyforma szélességű
  oszlopot alkotó, több soros rácsban nyílik meg. Az aktív főpontra vagy
  második szintű gombra ismét kattintva az adott ág bezárul; másik
  főpontra kattintva a korábbi ág lezárul, és az új nyílik. A
  **középső címer zár**, a hozzá kapcsolódó kis házikó a főoldalra visz.
- A címer mindkét fejlécben tényleges menügomb.
- A hat főcsoport és az almenük nevei az 1.53-as `structure.json`
  és oldal-JSON-ok alapján kerültek át **adatként**, nem régi programkódként.
- A menühierarchia végpontjai most **valódi, külön hash-útvonalakat**
  kapnak (`#/oldal/<azonosító>`). Minden oldal megnyílik, de csak
  címből és a JSON-ban leírt jövőbeli tartalmak **középre igazított
  háromelemű felsorolásából** áll. Még nincs közzétett aloldaltartalom.
- Az egyedi menüazonosítók és a maximum három szint ellenőrzés alatt állnak.

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
  A keresési szöveg az elérhetőségek neve és leírása alapján szűr.
- A keresők az élesnek jóváhagyott négy hivatkozás közül keresnek.
  Nem készítenek még meg nem létező aloldalakat vagy próbaeredményeket.
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
- A látható böngészőlapon 60 másodpercenként újra lekérjük a közös
  `shared/data/site.json` fájlt. Érvényes új adatok esetén a négy szöveg,
  a frissítési dátum és a verzió oldalújratöltés nélkül frissül. A nyitott
  lebegő ablak megmarad, tartalma is frissül. Rejtett böngészőlapon nem kérdezünk le;
  visszatéréskor újra ellenőrzünk. Hibás JSON esetén a korábbi érvényes
  információ marad látható.
- A lábléc paneljeit és külső térközeit jelentősen csökkentettük.
  A legalsó sor minden frissítés után a `Verzió: 2.17`,
  illetve a későbbi JSON-verzió.

## Frissítés böngészési adatok törlése nélkül

- A nyitó HTML a `shared/js/entry.js` és az alap CSS fájlt a JSON-ban
  szereplő kiadáshoz kötött URL-lel (`?v=2.17`) kéri le.
- Minden statikus JavaScript-modul-import ugyanilyen verziót kap a
  `node tools/stamp-release.mjs` kiadás-előkészítő lépésben. A két
  platformstílus is verziózott URL-lel töltődik be.
- Az oldal a közös JSON-t friss, gyorsítótárat kerülő lekéréssel olvassa.
  Új kiadás észlelésekor a 60 másodperces ellenőrzés az aktuális
  útvonal megtartásával, új verzióparaméterrel tölti újra a teljes oldalt.
- **Korlát:** a régi, már eltárolt 2.13-as kezdő HTML és programkód
  magától nem feltétlenül tudja alkalmazni az új mechanizmust; az új
  kiadás első elérése egyszer kérhet egy frissítést vagy `?v=2.17`
  URL-t. A tárhely/CDN HTTP gyorsítótárazási szabályai külön is számítanak.

## A visszaállított asztali kezdőlap és a mobilos következő lépés

Az asztali teljes képes nyitó, a címer görgetésre fejlécbe kerülése és
visszatérése a 2.16 része. A képváltó adatai, a képek sorrendjétől független
valós aloldal-hivatkozások, valamint a 3 perces időköz a közös JSON-ból
érkeznek. Külön `desktop/hero.js` kezeli, ezért a mobilos fejléc/menü kódját
nem érinti.

**A 2.17-ben megvalósult mobilos fejlesztés:** 130–158 pixel magas,
teljes szélességű „Sport · Tudás · Közösség” tematikus sáv,
öt görgetési állapottal és három, hatképes véletlen képválasztóval.
Ez nem az asztali nagy kép másolata; a felső címeres menügomb nem kerül
át máshová.

A menüvégpontok továbbra is csak minimális, jóváhagyott oldalvázlatokként
nyílnak meg, valós tartalmuk később épül be.
A lábléc `Tájékoztatás` oszlopának legalsó sora a JSON-ból
automatikusan megjelenő `Verzió: 2.17`.

## Tesztek és korlát

A kibontott mappában futtatható: `node tools/test.mjs`.
Az automatizált teszt ellenőrzi a JSON-sémát, az egyetlen HTML-t,
a 60 kapuképet, a külön fejléc-, menü- és keresőmodulokat,
a két asztali gyűrű egyenletes szögközeit, a főágak ki-/átkapcsolását,
a középső bezárógombot,
a mobilos iránytű három szintjét és ki-/átkapcsolását, a működő
hash-aloldalakat, a Spotlight keresők törlését, a négy valódi
gyorsválasztó találatait, a keresési kategóriákat, a lefelé nyíllal
elérhető találatfókuszt és az áttetsző háttérrétegek CSS-követelményeit,
a fókuszt/ESC-et, a szerkesztési módváltást, a színmódokat, a mobilos
kétfüles láblécet és a
több képernyőméretre vonatkozó CSS-geometriát. A lábléc külön tesztje
ellenőrzi a JSON-frissítést, a hibás válasz elutasítását, a nyitott
lebegő ablak adatfrissítését, valamint a verzióhoz kötött újratöltést.
A hibás induló JSON-t követő tartalékoldal, a kézi újrapróbálás és
az eredeti útvonalra történő visszatérés is célzott tesztet kapott.

**Korlát:** a környezet blokkolja a Chromium elindítását. A tényleges
mobilos és asztali vizuális megjelenést – különösen az iOS elmosást,
a hosszú menücímek tördelését és a későbbi animációkat – éles böngészőben
még meg kell nézni. A kódteszt nem helyettesíti ezt.

Sem GitHubra, sem FTP-re nem töltöttem fel semmit.
