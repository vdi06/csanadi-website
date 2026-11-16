# Aloldalak és a 31 szabály – első műszaki ellenőrzés

Ellenőrzött, a structure.json-ban regisztrált oldalak: **65**. A mellékelt CSV mindegyik oldalhoz mind a 31 szabály külön státuszát tartalmazza.

## Jelölések

- **F** – forrásadatból igazolható alapfeltétel teljesül (nem vizuális bizonyíték).
- **K** – közös implementáció megtalálható; böngészőben még ellenőrizni kell.
- **V** – vizuális, viselkedési vagy tartalmi ellenőrzés szükséges.
- **N** – a vizsgált oldal forrásában nem azonosítható releváns tartalomtípus; nem végleges mentesség.
- **H** – forrásból látható hiány vagy hiba.

Státuszok száma: F=260, K=260, V=1241, N=199, H=55 (összesen 2015 értékelési mező).

## Ellenőrzés korlátai

Ez a kimutatás **nem bizonyítja, hogy mind a 31 szabály mind a 65 oldalon teljesül**. A korábbi 31 C változat részletes, eredeti szövege csak részben visszakereshető; a témák alapján készített ellenőrzési vázlat nem azonos az elfogadott teljes specifikációval. A böngészős vizuális tesztelés a környezetben nem volt végrehajtható. A K és V státuszok nyitott tesztfeladatok.

A 31. szabályhoz közös, aloldalakon görgetéskor kompakt fejléc készült. A régi domaines JSON-hivatkozások migrációja megtörtént, és a futó DOM-ban külön védelmi ellenőrzés is működik. A külső űrlapok, beágyazások, képgenerálás és az összes oldaltípus teljes vizuális újratervezése nem tekinthető lezártnak.
