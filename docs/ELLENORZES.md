# Csanádi 2.05 – simább kapuzárás és két valódi főoldali sáv

**Nem publikált fejlesztési ZIP.** A 2.04-es kiadás és az 1.53-as referencia
változatlanul külön megmaradt.

## A kapu

- Megmaradt a 30-30 mobilos és asztali WebP-fázis: 9 eredeti fotó és
  21 interpolált köztes fázis minden felületen.
- Megmaradt a dekódolás előtti várakozás és a szomszédos képeknek a
  kijelzőfrissítéssel együtt számolt, folyamatos kompozitálása.
- A kapu arany, térhatású körvonala és hover/fókusz fényhatása változatlan.
- A nyitás legvégén a teljesen nyitott kapuképet **18 px-es elmosás** és
  **620 ms-os sötétbe áttűnés** takarja el fokozatosan. A céloldal ezzel
  megegyező háttérből lép elő 480 ms alatt. Mindez JSON-beállítás.
- A kihagyásgomb továbbra is azonnal a kezdőlapra lép; a mozgáscsökkentési
  beállítást tiszteletben tartjuk.

## A főoldal – kizárólag két aktív rész

1. **Felső menüsor:** a régi változatból visszavett kétsoros intézménynév,
   három hivatalos külső hivatkozás (Facebook, Instagram, KRÉTA), középre
   igazított címeres menügomb, működő keresés és sötét/világos váltó,
   valamint a „SPORT · TUDÁS · KÖZÖSSÉG” jelmondat. A Facebook és az
   Instagram ikonja önálló SVG, nem betűkészlettől függő jel.
2. **Alsó lábléc:** a régi `site-shell.json` szerinti intézménynév,
   cím és e-mail-cím, továbbá kizárólag a már működő két útvonalhoz vezető
   „Főoldal” és „Vissza a kapuhoz” hivatkozás.

A két sáv **teljesen külön mobilos és asztali CSS-elrendezésben** épül fel,
egyetlen adatvezérelt vezérlőlogikát és közös médiamappát használva.

Nincsenek még főoldali kártyák, hero, nagyméretű fotó, képváltó,
aloldalak, dokumentumok, mobilos alsó navigáció, régi menürendszer vagy
nem működő aloldal-hivatkozások. A főoldal `main` eleme szándékosan üres.

## Működő funkciók

- A címergomb megnyitja és bezárja a két aktív útvonal menüjét.
- A keresés kizárólag az aktív menüpontok, külső iskolai hivatkozások
  és az e-mail-elérhetőség között keres; nem állítja, hogy 63 aloldalt keres.
- A megjelenésváltó ténylegesen módosítja a főoldal színváltozóit;
  a kapu nyitóképernyőjét nem színezi át.
- A külső linkek új ablakban, biztonságos attribútumokkal nyílnak.
- A rejtett menü és keresés nem vesz részt a navigációban; Escape visszaadja
  a billentyűfókuszt a megfelelő gombnak.

## Ellenőrzés – 2026. november 22.

Az önálló teszt: `node tools/test.mjs` a kibontott mappában.

**Kódból és DOM-szimulációban sikeres:** 60 különböző WebP; JSON-verzió;
adatmentes HTML; kapuanimáció és látható képpár; a nyitás végének időzítése;
hibás kép melletti tartalék; csökkentett mozgás; mobil és asztali fejléc,
lábléc és üres középrész; menü, keresés, témaváltó; fókuszátadás;
platformváltás és egyetlen aktív platform-stíluslap.

**Kódból ellenőrzött CSS-geometria:** a kapu hét képernyőméreten középen
marad, a mobilos eszközsáv közepén fix szélességű a címer, balra 3, jobbra 2
azonos magasságú ikon; az asztali eszközsáv ugyanígy külön nagyobb méretezést
kap. A mobilos eszközsáv 280–767 px között nyolc szélességnél számolva
is elfér. A lábléc a rugalmas főoldali tér aljára igazodik.

**Még nem igazolt:** valódi böngészős megjelenés és animációminőség,
érintés iPhone-on és Androidon. A futtatókörnyezet megakadályozta a
Chromium elindítását. A kész ZIP emiatt felhasználói vizuális
jóváhagyást igényel, mielőtt élesítésre kerülhet.

GitHubra és FTP-re nem történt feltöltés.
