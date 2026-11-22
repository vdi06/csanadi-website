# Csanádi 2.09 – asztali tesztnavigáció eltávolítása

Ez **nem publikált**, önállóan kipróbálható kiadás. A 2.08-as eredeti ZIP
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
| 3 külső ikon – címer – 2 művelet | Csak az intézménynév és a valódi fejlécvezérlők; nincs próbanavigáció |
| A címer egy teljes képernyős menüt nyit | A címer főoldali hivatkozás, nincs mobilmenü |
| Teljes képernyős mobilkereső | Középre helyezett, 94vw × 90dvh méretű lebegő kereső |
| Teljes képernyős áttetsző háttér, 22px blur | Lebegő panel mögött áttetsző háttér, 25px blur |

A mobilkereső a mobilmenü két útvonalát, a három külső hivatkozást
és a kapcsolat e-mail-címét kínálja. Az asztali keresőből a két
ideiglenes belső útvonalat kivettük; csak a tényleges külső
hivatkozások és a kapcsolat maradnak. Későbbi aloldalak nem jelennek meg.

## Megjelenésválasztó – három valós állapot

- **Automatikus (alapértelmezett):** `prefers-color-scheme` alapján
  világos/sötét; az operációs rendszer módváltását élőben is követi.
- **Világos:** kifejezetten világos paletta az oldal saját felületén.
- **Sötét:** kifejezetten sötét paletta.

A sorrend Automatikus → Világos → Sötét → Automatikus.
A kézi választást a böngésző helyi tárhelyén megőrzi, amennyiben az
elérhető; tiltott tárhelynél is működik az aktuális oldalon.
A kapunyitó kép színeit és aranykeretét nem módosítja.

Mindhárom üzemmódnak saját vizuális megjelenése van a témagombon:

| Mód | Ikon | Kis jel | A gomb saját arculata |
|---|---|---|---|
| Automatikus | Fogaskerék | A | Türkiz/kékeszöld szín és világos keret |
| Világos | Nap | V | Világos arany/krémszín és arany keret |
| Sötét | Hold | S | Mélykék/ibolya szín és halványlila keret |

Az ikonok és a kis jelzések a JSON `appearance.glyphs` és
`appearance.shortLabels` mezőiből származnak. Az ikon és a jelzés
együtt jelenik meg a gombon. A képernyőolvasó a teljes aktuális
üzemmódnevet kapja, a gomb felirataként és súgójaként is.

## Verziószám a Tájékoztatás oszlop alján

A lábléc utolsó sora mobilon és asztalon egyaránt a `Verzió: 2.09` felirat.
A felirat `Verzió` része a `home.footer.versionLabel`, a száma pedig a
`release` mezőből származik a `shared/data/site.json` fájlban. A verzió
következő kiadáskor ezért egyetlen központi JSON-adat átírásával frissül.
A különleges `footer-version` CSS-osztály egyúttal rögzíti a legalsó
elhelyezést; a két platformon ugyanaz a közös adat jelenik meg.

## Mi maradt még?

- Az eredeti kapu, 30 különböző mozgásfázis platformonként, 18px-es
  végső lágyítás és 620ms-os áttűnés.
- A kizárólag megengedett lábléc a régi kapcsolatadatokkal és két
  belső hivatkozással csak a mobilos nézetben. Asztalon a
  „Tájékoztatás” oszlopban kizárólag a verziószám szerepel.
- A főoldal `main` eleme szándékosan üres.

Nincs képváltó, hero, nagy fotó, kártya, galéria, más aloldal,
mobilos alsó navigáció vagy elavult modul.

## Kódellenőrzés

`node tools/test.mjs` a kibontott mappában:

- az egyetlen HTML és a platformfájlok pontos készlete;
- a 60 WebP és a JSON-séma;
- külön mobilos/asztali fejlécszerkezet és hiányzó keresztimportok;
- a JSON-ból érkező verziószám a Tájékoztatás oszlop utolsó sorában;
- mobilmenü, a felesleges asztali tesztnavigáció hiánya, külön kereső,
  Escape, fókusz;
- az ideiglenes asztali útvonalak hiánya a fejlécben, keresőben és láblécben;
- az automatikus, világos és sötét állapot, az OS-változás követése,
  a választás megőrzése és az eseménykezelők felszabadítása;
- a témagomb három eltérő ikonja, módjelzése, hozzáférhető felirata és
  saját módonkénti keret-/háttérstílusa;
- a kapuanimáció, hibás képkocka, kihagyás, útvonal és platformváltás;
- méret- és elhelyezésellenőrzések több kijelzőszélességnél.

**Fontos korlát:** ez a futtatókörnyezet a Chromiumot nem tudta
elindítani, ezért a tényleges mobilos és asztali megjelenést, az iOS
blur teljesítményét és az animáció vizuális minőségét az átadás után
még külön meg kell nézni. A kódteszt nem egyenértékű egy valódi
böngészős látványteszttel.

GitHubra és FTP-re semmi nem került feltöltésre.
