# Csanádi 2.04 – 30 képfázisos kapunyitás

Ez a 2.03-as, külön megőrzött tiszta alap következő, **nem publikált** kiadása.

## Pontosan mi változott?

- A korábbi **9 eredeti, a Csanádi homlokzatát ábrázoló képkockából**
  mozgáskövető közteskép-számítással **30 egymástól különböző képfázis** készült,
  külön 1600 × 900-as asztali és 800 × 450-es mobil WebP-sorozatban.
  Ez **nem 30 külön készített fénykép**: a 21 köztes állapot az eredeti
  képsorozatból számított kép. Az első és az utolsó kép pontosan az eredeti.
- A korábbi, egész képenként hirtelen váltó megoldást az **1.53-as verzió
  eredeti dekódolás-előtti várakozása és szomszédos képek folyamatos
  kompozitálása** váltotta fel. A CSS-ből kikerült a képkockák külön
  160 ms-os opacity-áttűnése, amely versenyzett a képcserével.
- A valódi fotókhoz illeszkedő, *finom* közeledő mozgás, címermozgás és
  felirathalványítás az eredeti 1.53-as animáció elvét követi.
- A 30. (teljesen nyitott) kapukép fokozatosan a közös sötét háttérbe úszik;
  a külön kezdőlap ebből a háttérből jelenik meg, ezért nincs közvetlen
  fotócsere a nyitás végén. Az időtartamok mind JSON-adatok.
- A korábban külön jóváhagyott arany, térhatású kapukörvonal és egérfény
  **változatlanul megmaradt**, csak a nyitás animációját korszerűsítettük.

## Mit tartalmaz a ZIP?

- A tartalmat nélkülöző közös `index.html`, egy közös kapumodul és JSON.
- Egy mobil és egy asztali megjelenítő, külön saját CSS-sel és JS-sel.
- A közös médiamappában 30 mobilos és 30 asztali WebP, valamint a címer.
- Pontosan két aktív állapot: a kapu és az egyetlen, címeres kezdőlap.
- A kapufelirat és az eredeti ⏭ kihagyásgomb; a kezdőlap visszalépő linkje.

**Nincs benne** külön fejléc, menü, dokumentumtár, galéria, további aloldal,
régi modul vagy külön választófelület. Sem FTP-re, sem GitHubra nem történt feltöltés.

## Újraellenőrzés

A ZIP gyökerében: `node tools/test.mjs`.

Az ellenőrzések:

1. Fájlok teljes és zárt készlete: nem kerülhet be véletlen régi aloldal.
2. Mind a 60 WebP fejléce és eltérő SHA-256-azonosítója.
3. A 30 fájl megfelelő mobilos/asztali útvonala és betöltési szerkezete.
4. Kapukattintás: **a 30 fotó dekódolásának befejezéséig** nem indul animáció.
5. A 15. és 16. képfázis között valódi, félátlátszó képpár jelenik meg;
   a többi képkocka ki van kapcsolva.
6. A záróképet az átmenet végéig megtartjuk; csak ezután vált útvonalat.
7. Kihagyásgomb, duplakattintás-védelem, mozgáscsökkentés, kezdőlap,
   visszalépés, fókuszátadás, breakpoint- és platform-CSS-váltás.
8. Kapugeometria hét különböző képernyőméreten, külön hover-körvonal.
9. Sérült fotó szimulálása: asztalon a mobilos változat a tartalék;
   mobilon a működő szomszédos képkocka marad látható.

## Eredmény – 2026. november 22.

- **Sikeres:** valamennyi felsorolt kód-, adat-, képfájl- és DOM-teszt.
- **Sikeres:** a sötét köztes háttér és az utolsó kép időzítésének tesztje.
- **Sikeres:** a szomszédos WebP-k mért legnagyobb normalizált
  képpont-eltérése asztalon 2,31%, mobilon 1,89% (RMSE). Ez képi
  folytonossági mérés, nem animációs látványteszt.
- **Képi mintavétellel ellenőrizve:** az interpolált nyitás köztes és utolsó
  képei, változatlan homlokzati geometria. Az egész animáció esztétikai
  minősége ebből még nem bizonyítható.
- **Nem igazolt:** a teljes animáció tényleges Chromium/Safari megjelenése,
  eszközteljesítménye és színátmenete. A futtatókörnyezet a Chromiumot
  blokkolta; valódi iPhone/Android sem volt elérhető.

A **2.04 is külön végső vizuális jóváhagyásra vár**; a kódtesztek
nem helyettesítik a telefonos és számítógépes megtekintést.
