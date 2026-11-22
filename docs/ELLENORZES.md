# Csanádi 2.11 – önálló asztali körmenü és mobilos harmonikamenü

Ez a ZIP **nem publikált** fejlesztési kiadás. A 2.09-es kiadott ZIP
változatlan maradt. A 2.10-es, félbehagyott Kapcsolat-ikonos kísérlet
nem lett publikálva és nem ennek az új verziónak az alapja.

## Szerkezet

Az egyetlen HTML az `index.html`. Minden látható iskolai felirat,
menücím és beállítás a `shared/data/site.json` fájlból származik.

```text
index.html
shared/
  data/site.json             – közös tartalom és menühierarchia
  js/entry.js                – mobil/asztali modul kiválasztása
  js/menu-data.js            – háromszintű, egyedi azonosítós menüellenőrzés
  js/appearance.js           – automatikus, világos és sötét állapot
  js/focus.js                – közös billentyűzetes fókuszléptetés
  js/shell.js                – közös ikonok, keresőadatok és lábléc
  js/gate.js                 – a változatlan, 30 fázisos kapu
  css/base.css               – közös, újrafelhasználható alapstílusok
  assets/...                 – a közös címer és kapuképek
mobile/
  app.js, header.js          – önálló mobilos fejléc és összerakás
  menu.js, settings.js       – saját harmonika és beállítások
  styles.css                 – kizárólag mobilos elrendezés
desktop/
  app.js, header.js          – önálló asztali fejléc és összerakás
  menu.js, settings.js       – saját körmenü és lebegő beállítások
  styles.css                 – kizárólag asztali elrendezés
```

## A menü

- **Asztal:** a csatolt 1.53-as menü referencia alapján új, hat főcsoportot
  körben elhelyező felület, középen címerrel. A kijelölt főcsoport
  almenüi alul, rendezett többoszlopos panelben jelennek meg.
- **Mobil:** teljes képernyős, homályosított hátterű, legfeljebb három
  szintű harmonikamenü, nagy érintési célokkal.
- A címer mindkét fejlécben tényleges menügomb.
- A hat főcsoport és az almenük nevei az 1.53-as `structure.json`
  és oldal-JSON-ok alapján kerültek át **adatként**, nem régi programkódként.
- A még nem beépített aloldalak csupán szöveges menücímkék. A rendszer
  **nem állítja, hogy a céloldalaik működnek**, és nem készít ál-hivatkozást.
- Az egyedi menüazonosítók és a maximum három szint ellenőrzés alatt állnak.

## Fejléc és beállítások

Mindkét felületen középen van az iskola kétsoros neve. Az ikonsor
szimmetrikus: balra Facebook, Instagram, KRÉTA; középen menüt nyitó címer;
jobbra Keresés, Megjelenés és Oldalbeállítások.

A fogaskerék **valódi**, de szándékosan korlátozott beállítási felületet
nyit: a három már támogatott megjelenési mód közvetlenül kiválasztható.
Az automatikus témagomb szimbóluma ismét `◐`, külön türkiz háttérrel és
`A` jelöléssel; ezért nem keverhető össze a beállítások `⚙` ikonjával.

A későbbi, sorrendmódosító/hozzáadó/korlátozottan törlő szerkesztő
**most még nincs bekapcsolva**. Az új rendszer számára stabil JSON
azonosítókat használunk.

## Jövőbeli asztali kezdőlap – most nem része a kiadásnak

Az 1.53-as megoldás referenciájával később teljes méretű fotó és
görgethető tartalom jön. Induláskor a címer a nagy kép közepén van,
és csak lefelé görgetéskor kerül át a fejlécbe. Ezt a menümodult
függetlenül tartjuk a jövőbeli kép-/görgetéslogikától.

A kezdőlap fő tartalmi része jelenleg szándékosan üres. Nincs képváltó,
galéria, hero, nem jóváhagyott aloldal vagy próbanavigáció.
A lábléc `Tájékoztatás` oszlopának legalsó sora a JSON-ból
automatikusan megjelenő `Verzió: 2.11`.

## Tesztek és korlát

A kibontott mappában futtatható: `node tools/test.mjs`.
Az automatizált teszt ellenőrzi a JSON-sémát, az egyetlen HTML-t,
a 60 kapuképet, a külön fejléc- és menümodulokat, a körmenü kiválasztását,
a háromszintű mobilharmonikát, a fókuszt/ESC-et, a beállításokat,
a színmódokat és a több képernyőméretre vonatkozó CSS-geometriát.

**Korlát:** a környezet blokkolja a Chromium elindítását. A tényleges
mobilos és asztali vizuális megjelenést – különösen az iOS elmosást,
a hosszú menücímek tördelését és a későbbi animációkat – éles böngészőben
még meg kell nézni. A kódteszt nem helyettesíti ezt.

Sem GitHubra, sem FTP-re nem töltöttem fel semmit.
