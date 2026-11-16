# Csanádi weboldal – v1.1.0 fejlesztési jelentés

**Kiindulási csomag:** `csanadi website v1.0.0.zip` (a korábbi, feltöltött `(8)` változatból). Az élő GitHub Pages-re és az intézményi FTP-re nem történt feltöltés.

## A felhasználó mostani kérései

1. A 31 korábbi C-változatú aloldali szabály és a 13 új C-pontosítás teljesítésének folytatása.
2. Az „Iskolai megközelítés és tanulástámogatás” nézet „Vissza a kezdőlapra” gombjának eltávolítása.
3. Ugyanazon oldal tíz elemű, szakaszokra ugró navigációjának eltávolítása úgy, hogy a tíz tartalmi modul megmaradjon.
4. A csengetési rend oldalán a korábbi honlapra és az új oldal önmagára vezető hivatkozások megszüntetése.
5. A teljes honlapon minden régi intézményi domainre vezető és minden felesleges önhivatkozás kiszűrése.

## Ebben a kiadásban elkészült

- **Témához illő aloldali képváltó:** minden regisztrált aloldalhoz a saját képet választja, szükség esetén a hierarchia szülőoldalának képével. Ha nincs használható kép, a képváltó elmarad. A kezdőoldal eredeti képváltóját külön megőrzi.
- **Kompakt képváltó:** reszponzív magasság, kézi előre/hátra léptetés, mobilos ujjmozdulat, szüneteltetés, egérmutatós és fókuszos megállítás, csökkentett mozgás tiszteletben tartása. A képváltási idő és a legfeljebb felhasználható képek száma a `json/config.json` fájlban állítható.
- **Tartalomjelölés:** a tartalmi ellenőrzésre váró oldalak egyértelmű figyelmeztetést kapnak. Ez nem helyettesíti az intézményi adatok tényleges ellenőrzését.
- **SPA-görgetés:** az újonnan megnyitott aloldal felülről indul, a böngésző Előre/Vissza navigációja a korábbi görgetési pozíciót állíthatja vissza.
- **Megközelítési oldal:** a külön „Vissza a kezdőlapra” gomb és a tíz szakaszugró link eltávolítva. A tartalmi szakaszok és a főmenü megmaradtak.
- **Csengetési rend:** három felesleges önhivatkozás megszűnt, a tanítási időpontok megmaradtak.
- **Teljes oldalszintű önhivatkozás-szűrés:** 19 JSON-oldalból 31 felesleges Markdown-linket eltávolítottunk; futásidőben az aktuális SPA-oldalra visszamutató hivatkozások nem kattinthatók, más oldalra lépve újra elérhetők lesznek.
- **Régi QR-kódos ellenőrzés:** a segédoldal QR-validátora már nem fogad el korábbi intézményi domainre mutató QR-célt.
- **Kiadási gyorsítótár:** új verziószámot kapott, hogy az előző kiadás JavaScriptje és stílusai ne ragadjanak a korábbi verzióban.
- **Automatikus kiadásellenőrzés:** JSON-, belső útvonal-, médiakép-, dokumentum- és JavaScript-szintaktikai ellenőrzőprogram készült.

## Ellenőrzési eredmények

| Vizsgálat | Eredmény |
|---|---|
| 95 JSON-fájl formátuma | Sikeres |
| 65 regisztrált aloldal adatainak elérése | Sikeres, statikus fájlellenőrzés |
| 65/65 aloldali saját borítókép médiaazonosítója | Feloldható |
| 96 helyi dokumentumhivatkozás | Nincs hiányzó fájl |
| Régi domaines abszolút URL a JSON-ban | 0 |
| Hiányzó belső SPA-cél a tartalmi oldalakon | 0 |
| Ellenőrzött JavaScript-szintaxis | Sikeres |
| ZIP-fájl sértetlensége | Átadás előtt ellenőrzendő |

## Aloldalankénti 31 szabályos kimutatás

`ALOLDALAK_31_SZABALY_ELLENORZES.csv`: 65 sor, 31 szabályoszlop, további külön tartalom-hitelesítési oszloppal. Az F/K/V/N/H jelölések pontos jelentése az `ALOLDALAK_31_SZABALY_JELENTES.md` fájlban olvasható. 55 oldal `verifiedContent: false` jelölésű; ezek tényleges hitelesítése **nyitott**, nem tekinthető teljesítettnek.

## További nyitott feladatok és feltételek

- **Teljes böngészős vizuális ellenőrzés:** a helyi Chromium indulása jogosultsági hibába ütközött, a külön felhőböngésző pedig nem éri el a helyi tesztszervert. Nem állítjuk, hogy a fejléc, a képváltó és a mobilos elrendezés képernyőn hibátlan.
- **31 szabály teljes megfelelősége:** a korábbi C-változatok eredeti, részletes szövege csak részben áll rendelkezésre. Nem lenne valós a 65×31 cellára teljes megfelelést kijelenteni.
- **Tartalmi hitelesítés:** 55 oldal ellenőrzésre vár, egyes régi források új SPA-célra kerültek. Ez önmagában nem igazolja a történeti adatokat.
- **Új képek:** mind a 65 aloldalhoz létezik helyi borítókép, ezért e kiadásban nem generáltunk új, tényszerűnek tűnő intézményi képeket. A fotók eredete és vizuális megfelelősége további vizsgálatot igényel.
- **Külső szolgáltatások és űrlapok:** a meglévő kódban található beleegyezéses beágyazási megoldás, de minden szolgáltatás és űrlap teljes, valós böngészős ellenőrzése még nem történt meg.
- **QR-kódok:** a jelenlegi QR-célok a GitHub Pages-honlapra vezetnek. Az intézményi FTP-domainre történő későbbi kiadás előtt a QR-eket újra kell előállítani.

## Átadás

A v1.1.0 csomag statikus fájlokból áll, Bootstrap CSS/JS továbbra is verzióhoz kötött CDN-ről töltődik, nincs PHP- vagy Node.js-függőség a nyilvános honlapon. Az új kiadás ZIP-je a repository gyökerébe kicsomagolható; automatikus feltöltést nem végeztünk.
