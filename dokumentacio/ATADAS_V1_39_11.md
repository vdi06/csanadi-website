# Csanádi Sportiskola – v1.39.11 átadási és ellenőrzési jegyzőkönyv

Keltezés: 2026. november 17. · Cél: statikus HTTP(S)/FTP-tárhely és azonos fájlszerkezetű GitHub Pages.

## Kért fejlesztés

- A: tényleges Chromium-ellenőrzés asztali és 320/390/768 px széles reszponzív nézetben.
- B: a kezdőlap képsávjának fejléchez illesztése, a hézagmentes, szögletes képek és nyilak finomítása; lefelé görgetéskor csak a középső képes gomb maradjon látható.
- C: billentyűzetes és képernyőolvasó számára értelmezhető címkék, fókusz, állapotközlés.
- D: a 23 intézményi tartalmi ellenőrzés és a 69 nyitott médiajogi tétel külön munkalapon; jóváhagyásokat nem állítunk elő a forrásadatok helyett.

## Elkészült, ellenőrizhető változások

1. A három látható kezdőlapi bevezető sor megszűnt. A szemantikusan rejtett H1 maradt.
2. A nagy képsáv mindkét széle szögletes, a képek és a nyílsávok között nincs hézag. Mobilnézetben a nyílsáv szélessége 44 px.
3. A képsáv a fejléc része. Görgetésre gyorsan összecsukódik; a mini fejléc közepén egyetlen, kattintható, képet és címet tartalmazó gomb látszik. A korábbi mini előző/következő, külön menü és felugrás gomb rejtve marad. A normál főmenü ettől függetlenül elérhető.
4. A villódzást okozó görgetési geometria-változást külön összecsukási és visszanyitási küszöb kezeli: a képsáv bezárása nem kezdeményezhet azonnali visszanyitást.
5. A nagy képsáv csoportnevet, használati segítséget, kapcsolt vezérlőket, billentyűzetes balra/jobbra navigációt és képernyőolvasós pozícióközlést kapott. A becsukott, láthatatlan eredeti képsáv inert és aria-hidden, a fókusz szükség esetén a látható középső gombra kerül.
6. A `tools/tartalmi-hitelesites.html` új nézetei: **23 elsőbbségi tartalmi oldal** és **69 függő médiajog**. A hiányos bizonyítékú, ellenőrző nélküli, intézményi döntés nélküli vagy hiányos jogosultságú tételek nem kaphatnak kész jóváhagyási adatot. A munkajegyzetek a böngésző helyi tárhelyén maradnak, CSV/JSON exportálhatók. A szerveres forrás-JSON-t az eszköz nem módosítja.

## Böngészős ellenőrzés

Egy valós Chromium-motorral, HTTP-ről betöltött helyi előnézetben történt. A mobilméreteket a saját reszponzív ellenőrző oldal 320, 390 és 768 px-es beágyazott nézete adta; ez nem fizikai Android/iPhone-eszköz.

| Nézet | Megfigyelés | Eredmény |
| --- | --- | --- |
| Asztali, 1348 px | A két képes szárny egymás mellett, két nyílsáv hézagmentesen; előre lapozás | Sikeres |
| Telefon, 320 px beállítás | Tényleges belső ablak 316 px; 301 px dokumentumszélesség; egy kép, 44 px-es két szélső nyíl; nincs vízszintes túllógás | Sikeres |
| Telefon, 390 px beállítás | Tényleges belső ablak 386 px; 371 px dokumentumszélesség; nincs vízszintes túllógás | Sikeres |
| Tablet, 768 px beállítás | Tényleges belső ablak 764 px; 749 px dokumentumszélesség; nincs vízszintes túllógás, a nyílváltás működik | Sikeres |
| Billentyűzet | A fókuszálható képes linken a balra nyíl előző képre vált; élő bejelentés frissül | Sikeres |
| Görgetés | A fejléc egyszer csukódik be, később stabil marad, a tetejére görgetve újranyílik | Sikeres |
| Összecsukott 320/390/768 px | Egyetlen `cs39-mini-preview` látható; középpont-eltérés 0 px; vízszintes túllógás nincs | Sikeres |
| Középső gomb | A helyes `#/...` tartalmi útvonalat hordozza, a kép be van töltve, billentyűzettel fókuszálható | Sikeres |
| Helyi hitelesítő | 23/23 prioritás és 69/69 nyitott jogtétel betöltött; a munkalap nem adott automatikus jóváhagyást | Sikeres |

Az ellenőrző böngésző fejlesztői konzolja intézményi házirend miatt nem nyitható meg; a böngésző felületének és DOM-jának külön ellenőrzése így is megtörtént. A környezetben a külön indított Playwright Chromium-folyamat rendszerfoglalat-hibával nem indult, ezért helyette a már futó valódi böngészőn teszteltünk. A konzolból származó, bővítményes metaadatküldési üzenetek nem a weboldal kódjából származtak. Fizikai mobilos érintéses és egy valódi beszédszintetizátorral végzett képernyőolvasós teszt még nem történt.

## Automatikus tesztek

- Új `tools/test-all-four-v1-39-11.mjs`: **14/14**.
- Helyi statikus HTTP-vizsgálat: **1425/1425** forrás- és médiakérés (71 oldal, 748 nyilvántartott eszköz, 603 statikus fájl).
- Korábbi regressziók: v1.39.10 fejléc 7/7; v1.39.9 A+B+C+D 18/18; v1.39.8 B+C+D 14/14; akadálymentesség 8/8; v1.39.7 hálózati hibatűrés 22/22; modalitás 10/10; HTML-szemantika 17/17; v1.39.3 tartalmak 16/16; médiaeszközök 11/11; sablonrendszer 14/14; régi v1.39.1 kapu 7/7; kereső 74/74; ZIP-motor 5/5; statikus kiadási regisztráció 1068/1068; hitelesítési alapmunkalap 7/7.
- A régebbi tesztek rögzített `1.39.9`/`1.39.10` cache-elvárásait bővítettük, hogy a későbbi `1.39.11` verziót ne tekintsék hibának. A keresőindex tartalmi revíziója ettől függetlenül 1.39.9 marad.

## Megőrzött tartalom és külső feltételek

- **71 JSON-oldal**, **748 assets-leltári fájl**, **154 médiaazonosító**; tartalmi vagy jogi jóváhagyást nem állítottunk elő.
- **23 tartalmi oldal** továbbra is intézményi manuális felülvizsgálatot igényel.
- **69 médiatétel** felhasználási joga továbbra is függő. Ezeket éles közzététel előtt jogosult intézményi szereplőnek kell tisztáznia.
- A Bootstrap CSS/JS verzióhoz kötött külső CDN-ről töltődik; hálózati hozzáférés kell. Helyi Bootstrap-másolat nincs a csomagban.
- A segédeszközök böngészőben működnek, így az FTP-tárhelyen nem igényelnek PHP-t, Node.js-t vagy GitHub-specifikus szolgáltatást. A helyi státuszok végleges intézményi engedélyezése külön eljárás.
- A teljes körű, valós eszközös mobil-, VoiceOver/NVDA- és végleges publikus tárhelyen történő próbák nyitottak. Éles FTP-telepítés nem történt.

## Közzététel

A ZIP gyökérében az `index.html`, `script.js`, `css/`, `js/`, `json/`, `assets/` és a működéshez szükséges további fájlok szerepelnek. A csomag a `csanadi-website` repository gyökerébe vagy egy megfelelő statikus FTP-webgyökérbe másolható. Az intézményi jóváhagyások hiánya miatt az éles publikálás előtt külön tartalmi/jogi ellenőrzés szükséges.
