# Csanádi 2.21 – diákjaink sportsikerei és a nyitókép javítása

Ez a ZIP **nem publikált** fejlesztési kiadás. A 2.15-ös forráscsomagot
és a 2.16–2.20-as fejlesztéseket folytatja az eredeti 1.53-as képek és minden
elfogadott funkció megtartásával. A korábbi ZIP-ek változatlanul megmaradtak.

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
  A legalsó sor minden frissítés után a `Verzió: 2.21`,
  illetve a későbbi JSON-verzió.

## Frissítés böngészési adatok törlése nélkül

- A nyitó HTML a `shared/js/entry.js` és az alap CSS fájlt a JSON-ban
  szereplő kiadáshoz kötött URL-lel (`?v=2.21`) kéri le.
- Minden statikus JavaScript-modul-import ugyanilyen verziót kap a
  `node tools/stamp-release.mjs` kiadás-előkészítő lépésben. A két
  platformstílus is verziózott URL-lel töltődik be.
- Az oldal a közös JSON-t friss, gyorsítótárat kerülő lekéréssel olvassa.
  Új kiadás észlelésekor a 60 másodperces ellenőrzés az aktuális
  útvonal megtartásával, új verzióparaméterrel tölti újra a teljes oldalt.
- **Korlát:** a régi, már eltárolt 2.13-as kezdő HTML és programkód
  magától nem feltétlenül tudja alkalmazni az új mechanizmust; az új
  kiadás első elérése egyszer kérhet egy frissítést vagy `?v=2.21`
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
automatikusan megjelenő `Verzió: 2.21`.

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
