# Csanádi weboldal 1.53 – külön felületek, egy közös adattár

2026. november 22. – fejlesztői kiadás, publikálás nélkül.

## Könyvtárszerkezet

```text
index.html                       üres törzsű, közös belépési pont
js/platform-router-v149.js      telefon/asztali választás és újraindítás váltáskor
mobile/
  index.html                    üres törzs, JSON-alapú indítás
  json/site-shell.json          kizárólag a mobil saját DOM-váza
  mobile/static-hero-v152.js    egyetlen, középre rendezett címeres mobilnyitó
  mobile/home-page-v152.js      önálló, JSON sorrendű mobil kezdőlap
  mobile/*.css                  mobil fejléc, menü, nyitó, kezdőlap
  css/, js/, tools/             csak a mobil ág futási kódjai
desktop/
  index.html                    üres törzs, JSON-alapú indítás
  json/site-shell.json          kizárólag az asztali saját DOM-váza
  desktop/, css/, js/, tools/    csak az asztali ág futási kódjai
shared/
  assets/                       KÖZÖS képek, emblémák, PDF-ek, grafika, videók
  json/                         KÖZÖS adatok: 79 oldal, konfiguráció, galériák, dokumentumok
source/                          szerkeszthető, visszaépíthető kanonikus források
tools/run-audit-v152.mjs        teljes forrásellenőrzés és két platform generálása
reports/                        részletes CSS- és 79-oldalas JSON-auditleltár
```

## Amit a böngésző ténylegesen használ

- A gyökér `index.html` nem tartalmaz iskolai tartalmat és látható HTML-vázat. A router egyszer választ platformot. A választás a 768 CSS-pixeles határ és az érintős/hover nélküli mutató alapján történik; kijelzőosztály-váltáskor újratöltés választja szét a futtatókörnyezetet.
- A mobil ág saját `mobile/js/app.js` fájljában a kezdőlap kizárólag a `mobile/home-page-v152.js` renderelőt hívja. Az asztali `homePage()` és az asztali lenyíló/gyorsnavigációs blokkok mobilon nem épülnek fel.
- A mobil nyitó a kezdőoldal JSON `mobileStatic` objektumából szöveget és hivatkozást, a közös `config.json` `site.crestImagePath` beállításából az iskolacímert készíti el. A címer középre igazított, 100–134 px méretű, mögötte nincs ovális vagy keret. Nincs nagyméretű nyitófotó, diaidőzítő, számláló, nyíl vagy lapozó.
- Az asztali kezdőlap külön képkirakatot, három témalinket, JSON-vezérelt gyorseléréseket, négy lenyitható témacsoportot és szakasznavigátort használ. A navigátorban az „Oldal tetejére” vezérlő is szerepel.
- A `shared/assets` és `shared/json` egyetlen, platformfüggetlen **futásidejű** példány. A 19 PDF, a galéria és a közös konfiguráció ugyanarról az URL-ről töltődik mindkét ágon. Egyedül a platformfüggő `site-shell.json` maradt külön.
- A két `source/` mappában őrzött kanonikus szerkesztési forrás a reprodukálható ZIP-építéshez szükséges; ezek nem a két felület által betöltött másolatok. FTP-re a gyökér, `mobile/`, `desktop/`, `shared/` és a gyökér `js/` futási állományai elegendők; a teljes fejlesztői ZIP `source/`-t is tartalmaz az újrageneráláshoz.

## Útvonal- és adatkezelés

Az adatokban a dokumentum- és képútvonal továbbra is ellenőrizhető `assets/...` forma, míg az elemek megjelenítése a közös `../shared/assets/...` fájlra oldódik fel. Az oldaladatok és beállítások a közös `../shared/json/...` könyvtárból érkeznek. Ez megőrzi az eddigi azonosítók és hivatkozások jelentését.

A megjelenítést továbbra is a JavaScript generálja; a HTML-fájlok nem tartalmaznak statikus oldalszöveget, navigációs elemeket vagy tartalmi kártyákat. A teljes tartalom **még nem kizárólag JSON**: egyes régebbi JavaScript-modulokban maradtak alapértelmezett feliratok és demonstrációs elemek. A mobil címeres nyitó címe, leírása és gombja, a két kezdőlap sorrendje és a megújított asztali gyorsnavigáció már JSON-ból vezérelt.

## Megismételhető ellenőrzés

```bash
node tools/run-audit-v152.mjs
```

Ez újragenerálja a `shared/`, `mobile/`, `desktop/` ágakat, ellenőrzi az importokat, a 79 oldal 507 blokkját, a közös média/PDF fájlok bájtjait, az összes helyi CSS- és JSON-vázhivatkozást, a layout szerződéseket és a JavaScript-szintaxist. Nem helyettesíti a valódi iOS/Android- vagy működő Chromium-alapú vizuális vizsgálatot.
