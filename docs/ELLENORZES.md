# Csanádi 2.14 – javított körmenü, aloldal-vázlatok és kompakt lábléc

Ez a ZIP **nem publikált** fejlesztési kiadás. Az előző, 2.13-as ZIP
változatlanul megmaradt; a 2.14-es a belőle külön elkészített új kiadás.

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
  js/gate.js                 – a változatlan, 30 fázisos kapu
  css/base.css               – közös, újrafelhasználható alapstílusok
  assets/...                 – a közös címer és kapuképek
mobile/
  app.js, header.js          – önálló mobilos fejléc és összerakás
  menu.js                    – a választott D jelű, íves mobilos iránytű
  page.js                    – saját mobilos, középre igazított oldalvázlat
  search.js                  – saját, teljes képernyős Spotlight kereső
  styles.css                 – kizárólag mobilos elrendezés
desktop/
  app.js, header.js          – önálló asztali fejléc és összerakás
  menu.js                    – saját, két szimmetrikus gyűrűs lebegő menü
  page.js                    – saját asztali, középre igazított oldalvázlat
  search.js                  – saját, lebegő Spotlight kereső
  styles.css                 – kizárólag asztali elrendezés
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

- **Asztal:** majdnem teljes képernyős, de lebegő, lekerekített
  üvegpanel, arany kerettel, rétegzett áttetsző háttérrel és 30 px-es
  háttérelmosással. Nagyméretű beviteli sáv, találatszámláló,
  kétoszlopos eredménykártyák és valódi törlésgomb.
- **Mobil:** a telefon teljes képernyőjét kitöltő, önálló, áttetsző és
  homályosított kereső; érintésre méretezett beviteli sáv, törlésgomb,
  találatszámláló és egymás alatti eredmények.
- A keresők az élesnek jóváhagyott négy hivatkozás közül keresnek.
  Nem készítenek még meg nem létező aloldalakat vagy próbaeredményeket.
- A címkék és ikonok szintén a közös JSON-ból származnak.

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
- A `Tájékoztatás` oszlop négy **egymás melletti kezdőbetűs ikont** mutat.
  A gomb megnyomására külön, elhomályosított hátterű lebegő ablakban
  jelenik meg az adott szöveg, amely Escape-pel, X-szel vagy a háttérre
  kattintva zárható. A gombok teljes címe akadálymentes feliratként szerepel:
  **Impresszum**, **Adatkezelési tájékoztató**, **Akadálymentességi nyilatkozat**,
  **A honlap használata**. A hivatalos jogi/megfelelőségi tartalmakhoz
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
  A legalsó sor minden frissítés után a `Verzió: 2.14`,
  illetve a későbbi JSON-verzió.

## Frissítés böngészési adatok törlése nélkül

- A nyitó HTML a `shared/js/entry.js` és az alap CSS fájlt a JSON-ban
  szereplő kiadáshoz kötött URL-lel (`?v=2.14`) kéri le.
- Minden statikus JavaScript-modul-import ugyanilyen verziót kap a
  `node tools/stamp-release.mjs` kiadás-előkészítő lépésben. A két
  platformstílus is verziózott URL-lel töltődik be.
- Az oldal a közös JSON-t friss, gyorsítótárat kerülő lekéréssel olvassa.
  Új kiadás észlelésekor a 60 másodperces ellenőrzés az aktuális
  útvonal megtartásával, új verzióparaméterrel tölti újra a teljes oldalt.
- **Korlát:** a régi, már eltárolt 2.13-as kezdő HTML és programkód
  magától nem feltétlenül tudja alkalmazni az új mechanizmust; az új
  kiadás első elérése egyszer kérhet egy frissítést vagy `?v=2.14`
  URL-t. A tárhely/CDN HTTP gyorsítótárazási szabályai külön is számítanak.

## Jövőbeli asztali kezdőlap – most nem része a kiadásnak

Az 1.53-as megoldás referenciájával később teljes méretű fotó és
görgethető tartalom jön. Induláskor a címer a nagy kép közepén van,
és csak lefelé görgetéskor kerül át a fejlécbe. Ezt a menümodult
függetlenül tartjuk a jövőbeli kép-/görgetéslogikától.

A kezdőlap fő tartalmi része továbbra is szándékosan üres. Nincs képváltó,
galéria vagy hero. A menüvégpontok minimális, jóváhagyott oldalvázlatként
megnyílnak, valós tartalmuk később épül be.
A lábléc `Tájékoztatás` oszlopának legalsó sora a JSON-ból
automatikusan megjelenő `Verzió: 2.14`.

## Tesztek és korlát

A kibontott mappában futtatható: `node tools/test.mjs`.
Az automatizált teszt ellenőrzi a JSON-sémát, az egyetlen HTML-t,
a 60 kapuképet, a külön fejléc-, menü- és keresőmodulokat,
a két asztali gyűrű egyenletes szögközeit, a főágak ki-/átkapcsolását,
a középső bezárógombot,
a mobilos iránytű három szintjét és ki-/átkapcsolását, a működő
hash-aloldalakat, a Spotlight keresők törlését,
a fókuszt/ESC-et, a szerkesztési módváltást, a színmódokat, a mobilos
kétfüles láblécet és a
több képernyőméretre vonatkozó CSS-geometriát. A lábléc külön tesztje
ellenőrzi a JSON-frissítést, a hibás válasz elutasítását, a nyitott
lebegő ablak adatfrissítését, valamint a verzióhoz kötött újratöltést.

**Korlát:** a környezet blokkolja a Chromium elindítását. A tényleges
mobilos és asztali vizuális megjelenést – különösen az iOS elmosást,
a hosszú menücímek tördelését és a későbbi animációkat – éles böngészőben
még meg kell nézni. A kódteszt nem helyettesíti ezt.

Sem GitHubra, sem FTP-re nem töltöttem fel semmit.
