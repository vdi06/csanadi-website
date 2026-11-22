# Csanádi 2.12 – a régi többgyűrűs asztali menü visszaépítése

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
  js/edit-mode.js            – közös kétállású szerkesztési mód
  js/shell.js                – közös ikonok, keresőadatok és lábléc
  js/gate.js                 – a változatlan, 30 fázisos kapu
  css/base.css               – közös, újrafelhasználható alapstílusok
  assets/...                 – a közös címer és kapuképek
mobile/
  app.js, header.js          – önálló mobilos fejléc és összerakás
  menu.js                    – saját harmonikamenü
  styles.css                 – kizárólag mobilos elrendezés
desktop/
  app.js, header.js          – önálló asztali fejléc és összerakás
  menu.js                    – saját, két koncentrikus gyűrűs menü
  styles.css                 – kizárólag asztali elrendezés
```

## A menü

- **Asztal:** az 1.53-as `source/js/app.js`, `source/css/compass-2026.css`
  és `source/css/next10-2026.css` kódok alapján a címer körül a hat
  főmenüpont **belső gyűrűben** található. A választott főmenü almenüi a
  **második, külső gyűrűben** jelennek meg. Háromszintű ágaknál a harmadik
  szint külön, a választott almenühöz tartozó panelben jelenik meg.
  Nem maradt meg a hibás, kör alatti állandó almenütáblázat.
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

A jobb oldali harmadik gomb kétállású szerkesztőkapcsoló. Alapesetben
`⚙`, szerkesztő módban `✓`. Az első kattintás egy **lebegő státuszfejlécet**
mutat, a második (pipa) elfogadja a változatlan állapotot, majd kilép.
Sem felugró beállításablak, sem második pipa, sem korai drag-and-drop vezérlő
nem jelenik meg. A három színmódot továbbra is a külön témagomb kapcsolja.
Az automatikus témagomb szimbóluma ismét `◐`, külön türkiz háttérrel és
`A` jelöléssel; ezért nem keverhető össze a beállítások `⚙` ikonjával.

A későbbi, sorrendmódosító/hozzáadó/korlátozottan törlő műveletek
**most még nincsenek bekapcsolva**. Az új rendszer stabil JSON
azonosítókat használ majd. A mobilmenü és mindkét kereső újratervezésére
választható változatokat egyeztetünk a felhasználóval; ezeket nem építettük
be előzetes döntés nélkül.

## Jövőbeli asztali kezdőlap – most nem része a kiadásnak

Az 1.53-as megoldás referenciájával később teljes méretű fotó és
görgethető tartalom jön. Induláskor a címer a nagy kép közepén van,
és csak lefelé görgetéskor kerül át a fejlécbe. Ezt a menümodult
függetlenül tartjuk a jövőbeli kép-/görgetéslogikától.

A kezdőlap fő tartalmi része jelenleg szándékosan üres. Nincs képváltó,
galéria, hero, nem jóváhagyott aloldal vagy próbanavigáció.
A lábléc `Tájékoztatás` oszlopának legalsó sora a JSON-ból
automatikusan megjelenő `Verzió: 2.12`.

## Tesztek és korlát

A kibontott mappában futtatható: `node tools/test.mjs`.
Az automatizált teszt ellenőrzi a JSON-sémát, az egyetlen HTML-t,
a 60 kapuképet, a külön fejléc- és menümodulokat, a körmenü kiválasztását,
a háromszintű mobilharmonikát, a fókuszt/ESC-et, a szerkesztési módváltást,
a színmódokat és a több képernyőméretre vonatkozó CSS-geometriát.

**Korlát:** a környezet blokkolja a Chromium elindítását. A tényleges
mobilos és asztali vizuális megjelenést – különösen az iOS elmosást,
a hosszú menücímek tördelését és a későbbi animációkat – éles böngészőben
még meg kell nézni. A kódteszt nem helyettesíti ezt.

Sem GitHubra, sem FTP-re nem töltöttem fel semmit.
