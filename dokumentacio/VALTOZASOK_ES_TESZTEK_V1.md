# Csanádi weboldal – v1.0.0 fejlesztési és ellenőrzési jegyzék

Kiindulópont: a felhasználó által átadott `csanadi-website(8).zip`. Az élő GitHub Pages- és az iskolai FTP-tárhelyen semmilyen módosítás nem történt.

## Elkészült

1. Új, közös aloldali fejlécvezérlés (`js/subpages-v1.js`, `css/subpages-v1.css`): görgetésre kompakt fejléc, elérhető keresés és külön főmenü-gomb, mobilos méretcsökkentés. A kezdőoldalra nem alkalmazza a kompakt stílust.
2. Az üres aloldali bevezető bekezdés nem jelenik meg; olyan szakasz sem jelenik meg, amely csak címet tartalmaz, érdemi renderelt gyermek nélkül.
3. 193, régi iskolai domainre mutató JSON-előfordulás migrációja; öt nem egyértelmű esetnél a kattintható hivatkozás megszüntetése. A hivatkozások többsége új SPA-útvonalra került, egyes dokumentumok helyben elérhető fájlra mutatnak.
4. A JavaScriptben szereplő dokumentumtár-gyorslinkek és történeti hivatkozások átállítása új SPA-célokra.
5. Futásidejű védelmi réteg: a később hozzáadott, tiltott domainre mutató kattintható linkek is helyi célra irányítódnak, vagy megszűnnek.
6. A QR-gyűjtemény korábbi iskolai domainre mutató változatainak kiváltása a jelenlegi GitHub Pages-címre mutató QR-ekkel. A 87, már nem hivatkozott régi célú SVG QR-állományt eltávolítottuk az új kiadásból. A QR-ek új FTP-domainre állításakor külön újragenerálás szükséges.
7. 65 aloldal × 31 szabály = 2015 értékelési mezőt tartalmazó ellenőrzési CSV, külön jelmagyarázatos jelentéssel.

## Sikeres ellenőrzések

- Mind a 95 JSON-fájl érvényesen feldolgozható.
- Az érintett JavaScript-fájlok szintaktikai ellenőrzése sikeres.
- A JSON-okban nem maradt a tiltott domainre mutató abszolút URL.
- A `json/structure.json` alapján 65 regisztrált aloldalról készült forrásalapú ellenőrzés.

## Nyitott, nem igazolt követelmények

- Nem sikerült a böngészős, valódi képernyős ellenőrzés: a jelenlegi környezetben a Chromium indítása jogosultsági hibával leállt. Mobilos, táblagépes, asztali, világos/sötét témájú vizuális teszt **nem tekinthető elvégzettnek**.
- A 31 régebbi, C-változatú követelmény teljes, szó szerinti szövege csak részben visszakereshető. A témajegyzék szerinti 31 oszlopos CSV **nem bizonyít teljes megfelelést**.
- A 13 új pontosításból több – például az összes beágyazás adatvédelmi betöltése, minden űrlap célzott ellenőrzése, teljes kép- és dokumentumforrás-hitelesítés, valamint az összes aloldal vizuális újratervezése – további fejlesztést igényel.
- A jelenlegi médiakészlethez nem készült új generált illusztráció. Engedély van rá, de a szükségességet és a forráshitelességet oldaltípusonként még ellenőrizni kell.
- A korábbi forráshelyek új oldalakra irányítása önmagában nem igazolja az eredeti történeti állítások pontosságát; a tartalmi felülvizsgálat külön feladat.
- A QR-gyűjtemény az éppen működő GitHub Pages-címet használja; a későbbi intézményi FTP-telepítés előtt újra kell generálni a közzétett QR-célokat.

## Fájlok és telepítés

Az új csomag a weboldal működő gyökérfájljait tartalmazza. A ZIP tartalmát a GitHub Pages-repository gyökerébe kell másolni; semmit nem telepítettünk automatikusan. A `dokumentacio/ALOLDALAK_31_SZABALY_ELLENORZES.csv` oszlopai a 31 szabályt, sorai a 65 aloldalt képviselik. Az `F`, `K`, `V`, `N`, `H` jelöléseket az ugyanott lévő `ALOLDALAK_31_SZABALY_JELENTES.md` magyarázza.
