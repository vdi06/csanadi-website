# Csanádi weboldal v1.38.1 – hibajavítás és tesztbeszámoló

Kiadás: 2026. november 16.  
Kiindulás: v1.38.0, a 6 főmenü / 28 almenü és a teljes statikus FTP-kompatibilis projekt megőrzésével.

## Megvalósított javítások

1. **Asztali almenü ütközése, 761–1099 CSS-képpont:** a kiválasztott főmenü almenüi most a kör alatt, a párbeszédablak görgethető részében, három oszlopban jelennek meg. Nem lebegnek rá más főmenüpontra. A célpanelre történő programozott görgetés a csökkentett mozgás beállítását tiszteletben tartja. A kör sugarát és magasságát a határértékekhez igazítottuk.
2. **Telefonos körmenü gombalakja és középpontja:** a közös gombstílus nem írhatja felül a telefonos körmenü elemeinek kör alakját. A középső, alapállapotban letiltott címergomb megtartja a pozícióját és az átlátszatlanságát.
3. **Csökkentett mozgás:** az általános animációcsökkentő szabály nem törli a körmenügombok geometriai elhelyezéséhez szükséges `transform` értéket. A körmenü saját animációit továbbra is letiltjuk ilyen beállítás mellett.
4. **Kisebb ikonfinomítás:** a telefonos almenük nyitási jelzése általánosan támogatott jobbra mutató nyíl.
5. **Verziókezelés és gyorsítótár:** az érintett CSS/JS-belépési pontok `1.38.1` verziójelzést kaptak. A release-manifest külön, teljes kiadási leltárt tartalmaz.

## Automatikus vizsgálatok

| Ellenőrzés | Eredmény |
|---|---:|
| v1.38.1 célzott szerkezeti, menü-, állapot- és CSS-tesztek | 35 / 35 sikeres |
| Önálló HTTP HEAD/GET ellenőrzés | 1196 / 1196 sikeres |
| Regisztrált tartalmi oldalak | 65, elérhetőség ellenőrizve |
| Médiaelemek a fájlleltárban | 628, elérhetőség ellenőrizve |
| Témaállapot regressziója | 12 / 12 sikeres |
| Korábbi alapfunkciók regressziója | 22 / 22 sikeres |
| Mobilos szakaszkezelés | 48 / 48 sikeres |
| Beágyazott tartalmak | 13 / 13 sikeres |
| Diagnosztika párhuzamos válaszai | 2 / 2 sikeres |
| Ellenálló-képességi ellenőrzések | 59 / 59 sikeres |
| Optimalizálási ellenőrzések | 9 / 9 sikeres |
| Dokumentumok és verziók | 19 dokumentum, 35 előzmény, sikeres |
| JavaScript szintaxis és JSON-szerkezet | Sikeres |

Az előző, v1.37-es, harmadik szintet elváró menütesztek nem szolgálhatnak a kétszintű navigáció elfogadási kritériumaként. Az aktuális v1.38.1 teszt külön ellenőrzi a harmadik menüszint hiányát.

## Valódi böngészőben elvégzett ellenőrzések

- **Chromium, kb. 1050 px szélesség:** aloldal betöltése, középső címerből menünyitás, Iskolánk hat almenüjének megnyitása. A hat link rendezett panelben látszott a kör alatt; az előző verzióban tapasztalt főmenü-átfedés megszűnt.
- **Chromium, telefonos CSS-töréspont kb. 525 px szélességen:** a hat fő gomb és a középső címer ténylegesen kör alakban jelent meg. A második szint három hivatkozása és a középső visszalépés megjelenítése működött.
- **Alapvető navigáció:** a korábbi vizsgálat igazolta az aloldalra lépést, a böngésző Vissza működését és a sötét téma frissítés utáni megtartását; a v1.38.1 regressziós tesztek ezekhez kapcsolódó funkciókat továbbra is ellenőrizték.

## Korlátok és nyitott ellenőrzések

- A telefonos CSS-nézetet Chromium nagyításával állítottuk elő. Valódi iPhone Safari és Android Chrome eszközön nem futott ellenőrzés.
- A csökkentett mozgás alatt végzett geometriai ellenőrzés forráskód- és tesztalapú; külön, valódi rendszerszintű beállítással végzett GUI-próba továbbra is indokolt.
- Képernyőolvasós felolvasás, minden billentyűzetes fókuszútvonal, lassú/offline mobilhálózat és külső tárhelyes éles ellenőrzés nem tekinthető teljesen lefedettnek.
- Sem az iskola FTP-tárhelyére, sem GitHub Pagesre nem történt közzététel. Új alkalmazásfunkciót nem vezettünk be.

## Kiadási megjegyzés

A v1.38.1 egy teljes projektcsomag, nem különbségi javítócsomag. Minden régi tartalmi oldal, segédoldal, média, JavaScript- és CSS-modul megmaradt, és az új verzió továbbra is statikus HTTP/FTP-kiszolgálásra alkalmas. A Bootstrap csak verziózott CDN-hivatkozással szerepel.
