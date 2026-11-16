# Csanádi weboldal v1.35.0 – teljes javítási kiadás (2/3)

A v1.34.0 teljes csomagjára épül, annak valamennyi funkciójával és javításával. A v1.33.0 eredeti tartalmából semmit nem távolítottunk el. Új felhasználói funkció nem készült.

| Tétel | Végrehajtott további javítás |
|---|---|
| A | Ha a megamenü a nyitott mobilmenüből indul, a visszatérő billentyűzetfókusz a látható főmenüindítóra kerül. |
| B | A megközelítési beágyazott oldal önálló megnyitáskor is újraellenőrzi a témaállapotot böngészőfókusz-visszatéréskor. |
| C | A túl hosszú vagy hibás alakú beágyazott szakaszadat elutasításra kerül még a válaszsorszám elfogadása előtt. |
| D | A mobil szakaszlistából eltűnt cél esetén az aktuális vagy első működő elem kapja vissza a fókuszt. |
| E | A mobil menünézet váltása csak látható, kapcsolódó célra fókuszál, és nem okoz kényszerített görgetést. |
| F | A megőrzött keresési állapotok legutóbbi használat szerinti sorrendben maradnak, elkerülve a gyakran visszatért útvonal idő előtti kiesését. |
| G | A dokumentumok verziószámának numerikus elemei korlátosak; a megtévesztő vezető nullák és a túl nagy számrészek visszautasításra kerülnek. |
| H | A galéria kapcsolatsebesség-változáskor megszünteti a már nem indokolt kép-előtöltéseket. |
| I | Nyitott, azonos feliratú összecsukható elemek az előfordulási sorrendjük alapján maradnak nyitva JSON-frissítés után. |
| J | A kiadási fájlleltárban a kötelező alapfájlok nem lehetnek üresek sem. |

## Ellenőrzési eljárás

- `node tools/test-corrections-v1-35.js`: 52 A–J célzott ellenőrzés.
- `node tools/run-full-regression-v1-35.js`: a teljes, 18 alprogramos regressziós tesztcsomag.
- A futási kimenetek, időmérések és sikertelen tesztek külön: `dokumentacio/TESZTNAPLO_V1_35.md`.
- A webes statikus kiszolgálás, a JSON-adatkapcsolatok, dokumentumok, média, témák, kereső, navigáció, fájlleltár és HTTP-végpontok ellenőrzése egyaránt a teljes vizsgálat része.

Az iOS Safari, Android Chrome és a publikált külső webhely valós felhasználói vizsgálata külön szükséges; a helyi tesztek nem igazolják fizikai eszközön a megfelelő működést. A külön időzített élő teszt korábbi eredménye nem áll rendelkezésre, így abból semmilyen adat nem került a honlapdiagnosztikába.
