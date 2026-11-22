# Csanádi 2.03 – eredeti kapu, megtartott új arany keret

Ez a következő, külön ellenőrizhető újraépítési lépés. **Nem publikált kiadás.**

## Pontosan mi van benne?

- Egyetlen, tartalommentes `index.html`; JSON adatok és hash-alapú két állapot.
- A nyitókapu képsorozata, eredeti felirata, alsó sávja, kihagyásikonja és a
  címer arányai pontosan a felhasználó által csatolt 1.53-as ZIP-ből származnak.
- A kapu körvonalán **szándékosan a 2.02-es új arany, térhatású SVG-perem és
  az egér fölévitelekor látható fényhatás maradt**, a felhasználó külön kérésére.
- A címer a kapu fölött, **ovális háttér nélkül**, az eredeti pozícióban.
- A kapun az eredeti iskolanéven és a kihagyásikonon kívül nincs új felirat.
- A kapu maga kattintható. A nyitás végén ténylegesen megjelenik a `#/kezdolap`.
- Külön mobilos és asztali céloldal saját JS- és CSS-fájlból, kizárólag a
  középre tett címerrel, a korábbról ismert üdvözlőcímmel és a működő visszalépéssel.
- A kezdőlapon **nincs** nagy fotó, képcsere, automatikus animáció vagy további aloldal.
- A JSON szabályozza a szövegeket, időtartamokat, képútvonalakat és színeket.

## Mi nincs benne?

Fejléc, alsó sáv, menü, keresés, hírek, dokumentumok, galéria, más aloldalak,
régi CSS/JS modulok és választófelület. Az előző kiadásokat külön megőriztük.

## Futtatás és ellenőrzés

A ZIP kibontása után statikus HTTP-szerverrel indítható, például
`python3 -m http.server 8000` a csomag mappájában.

`node tools/test.mjs` ellenőrzi:

1. a fájlok pontos készletét és minden képkocka WebP-formátumát;
2. a valódi mobilos és asztali DOM-kimenetet;
3. a kapukattintás → képkockaváltás → kezdőlap folyamatot és a régi kihagyásikont;
4. a visszautat, a dupla kattintás elleni védelmet és a mozgáscsökkentést;
5. a kép–aranykontúr igazítását és a koppintási célterületet hét képernyőméretnél;
6. ha a környezet lehetővé teszi, a tényleges Chromium-renderelést.

Élesítés előtt valódi mobilos és asztali böngészőteszt, valamint a kapu
vizuális jóváhagyása is szükséges.

## Eredmény – 2026. november 22.

- **Sikeres:** a 18 kép és a címer ellenőrzése, hiányzó vagy régi funkciófájlok kizárása.
- **Sikeres:** a kapu kilenckockás nyitása mobilon és asztalon, közvetlen navigáció,
  kihagyásikon, visszalépés, dupla kattintás védelme, mozgáscsökkentés.
- **Sikeres:** a tényleges közös belépési pont integrációs tesztje:
  kapu → egyetlen kezdőlap → kapu, fókuszátadás, platformváltás és CSS-csere.
- **Sikeres:** a kapukontúr és a kattintható terület képarányos geometriájának
  matematikai ellenőrzése hét kijelzőméretnél.
- **Sikeres:** az 1.53-as forrás-ZIP és a helyben megőrzött referencia CSS/kép
  SHA-256 azonosságának ellenőrzése a fejlesztés előtt.
- **Nem igazolt:** a tényleges képernyőn történő renderelés és a képváltások
  vizuális minősége. Az automatikus Chromiumot a futtatókörnyezet blokkolja;
  a külön natív böngésző nem éri el a helyi projektet.
- **Nem tesztelt:** valódi iPhone és Android, valamint a fájlok éles tárhelyen.

A kódos tesztek teljesítése **nem jelent végső vizuális jóváhagyást**.
