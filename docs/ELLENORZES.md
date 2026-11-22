# Csanádi 2.06 – valóban külön mobilos és asztali fejléc

Ez **nem publikált**, önállóan kipróbálható kiadás. A 2.05-ös eredeti ZIP
változatlan marad.

## Egyetlen HTML, közös adatok, külön megjelenítők

Az egyetlen HTML az `index.html`, amely sem iskolai adatot, sem
oldaltartalmat nem tartalmaz. Csak az alkalmazásgyökér és a közös
belépési modul hivatkozása van benne.

```text
index.html
shared/
  data/site.json            – minden megjelenő szöveg, URL és módbeállítás
  js/entry.js               – platformválasztás és útvonal
  js/appearance.js          – három mód állapota, rendszerbeállítás figyelése
  js/shell.js               – kizárólag közös ikon/linkadatok és lábléc
  js/gate.js                – közös kapuanimáció
  css/base.css              – közös alapstílusok
  assets/...                – 60 WebP kapufázis és címer
mobile/
  app.js                    – csak mobilos oldalösszeállítás
  header.js                 – saját mobilfejléc, környezetfüggetlen menü és kereső
  styles.css                – mobilos elrendezés, teljes képernyős felületek
desktop/
  app.js                    – csak asztali oldalösszeállítás
  header.js                 – saját asztali fejléc és kereső
  styles.css                – asztali elrendezés és lebegő kereső
```

A `mobile/header.js` **nem importálja** az asztali fejlécet, és
a `desktop/header.js` sem importál mobilos fejléckódot. Nincs közös
fejlécépítő függvény, csak újrafelhasználható adat- és állapotsegéd.

## A két fejléc nem ugyanaz

| Mobil | Asztali |
|---|---|
| Középre rendezett kétsoros intézménynév | Balra rendezett intézménynév |
| 3 külső ikon – címer – 2 művelet | Külön felső, vízszintes főnavigáció |
| A címer egy teljes képernyős menüt nyit | A címer főoldali hivatkozás, nincs mobilmenü |
| Teljes képernyős mobilkereső | Középre helyezett, 94vw × 90dvh méretű lebegő kereső |
| Teljes képernyős áttetsző háttér, 22px blur | Lebegő panel mögött áttetsző háttér, 25px blur |

Mindkét kereső ténylegesen csak a már működő menüpontok, a három
külső hivatkozás és a kapcsolat e-mail-címe között keres. Későbbi
aloldalakat nem ígér és nem jelenít meg.

## Megjelenésválasztó – három valós állapot

- **Automatikus (alapértelmezett):** `prefers-color-scheme` alapján
  világos/sötét; az operációs rendszer módváltását élőben is követi.
- **Világos:** kifejezetten világos paletta az oldal saját felületén.
- **Sötét:** kifejezetten sötét paletta.

A sorrend Automatikus → Világos → Sötét → Automatikus.
A kézi választást a böngésző helyi tárhelyén megőrzi, amennyiben az
elérhető; tiltott tárhelynél is működik az aktuális oldalon.
A kapunyitó kép színeit és aranykeretét nem módosítja.

## Mi maradt még?

- Az eredeti kapu, 30 különböző mozgásfázis platformonként, 18px-es
  végső lágyítás és 620ms-os áttűnés.
- A kizárólag megengedett lábléc a régi kapcsolatadatokkal és két
  ténylegesen működő belső hivatkozással.
- A főoldal `main` eleme szándékosan üres.

Nincs képváltó, hero, nagy fotó, kártya, galéria, más aloldal,
mobilos alsó navigáció vagy elavult modul.

## Kódellenőrzés

`node tools/test.mjs` a kibontott mappában:

- az egyetlen HTML és a platformfájlok pontos készlete;
- a 60 WebP és a JSON-séma;
- külön mobilos/asztali fejlécszerkezet és hiányzó keresztimportok;
- mobilmenü, asztali főnavigáció, külön kereső, Escape, fókusz;
- az automatikus, világos és sötét állapot, az OS-változás követése,
  a választás megőrzése és az eseménykezelők felszabadítása;
- a kapuanimáció, hibás képkocka, kihagyás, útvonal és platformváltás;
- méret- és elhelyezésellenőrzések több kijelzőszélességnél.

**Fontos korlát:** ez a futtatókörnyezet a Chromiumot nem tudta
elindítani, ezért a tényleges mobilos és asztali megjelenést, az iOS
blur teljesítményét és az animáció vizuális minőségét az átadás után
még külön meg kell nézni. A kódteszt nem egyenértékű egy valódi
böngészős látványteszttel.

GitHubra és FTP-re semmi nem került feltöltésre.
