# Csanádi weboldal – v1.43.15, M8/D–M10/D mobilfejlesztési jelentés

Kiadás-előkészítés: 2026. november 20.  
Kiinduló, jóváhagyott csomag: v1.43.12 (M6/D–M7/D).  
Kiadás státusza: **ellenőrzött fejlesztési előnézet; külön végső felhasználói jóváhagyásra vár**.  
Közzététel: **nem történt** (sem FTP, sem GitHub).

## 1. Hatókör, megőrzési szabályok

- Az új vizuális rétegek kizárólag `max-width: 768px` esetén érvényesülnek; a 365 px-es további finomhangolás szintén kizárólag telefonos.
- Az M9 és M10 JavaScript a képernyőméretet valós időben figyeli. Széles nézetben nem állít be új mobilos megjelenést vagy billentyűkezelést; a mobilhoz tartozó útvonaljelölést és az automatikus videóindítás módosítását visszaállítja.
- Az M1–M7 meglévő arculata, címeres menüje, kapunyitása, görgetése, képváltója és aloldali elrendezése megmaradt. Nem került be második mobilmenü vagy oldalra lebegő, duplikált körmenüindító.
- Az asztali oldalak megjelenési szabályait nem írtuk át. A közös alkalmazásban csak a kiadás- és gyorsítótár-azonosító változott.
- A dokumentumok meglévő saját nézője PDF.js-alapú és Bootstrap Modalban nyílik; a képek nézője Bootstrap Modal + Carousel, a keresett/témakörrel szűrt képekből áll össze. A meglévő funkciókat megtartottuk, nem vezettük vissza a böngésző saját nézőjét. A `.docx` formátum korábbi letöltési korlátja megmaradt.

## 2. M8/D – mobilos komponensek (v1.43.13 ellenőrzési kapu)

1. Bootstrap-űrlapok, szűrők, gombcsoportok, lapfülek, listák, riasztások, kártyák, harmonikák és lapozók középre rendezett, telefonon tördelhető megjelenése.
2. Az érintési vezérlők minimum 44×44 CSS-pixeles célmérete; legalább 16 px-es beviteli betűk a mobilböngésző akaratlan nagyításának csökkentésére.
3. A dokumentumtár mobilos szűrősora, keresőmezője, kártyái és oldalszámozása keskeny képernyőn is tördelődik.
4. A galéria témakörei és képcsempéi két oszlopba, videókártyái egy oszlopba rendeződnek; az eredeti szűrési és megosztási adatfolyam változatlan.
5. A saját PDF- és képnéző 768 px-ig teljes képernyős Bootstrap Modal: szélesebb, érinthető léptetés, ragadós PDF-eszköztár, kényelmes lapozás, biztonságos kijelzőszélek (`safe-area`) és fényes/sötét színek.
6. Csökkentett mozgás és kényszerített rendszerszínek esetén külön mobil szabályok.

**Ellenőrzés:** `node tools/verify-mobile-m8.mjs` – sikeres. A tényleges Bootstrap JS-konstruktor és a tematikusan szűrt képnéző forráskapcsolata ellenőrizve. Élő Modal/Carousel-böngészős interakció külön nyitott.

## 3. M9/D – akadálymentesség, teljesítmény, használhatóság (v1.43.14 kapu)

1. Mobilos fókuszkeret a fejlécen, keresőn, aloldali gombokon és saját nézőkben; érintési célméret és sortörés.
2. 16 px-es űrlapmezők, szélességkorlátozás, horizontális táblázatgörgetés, középre rendezett tartalom és tájolásfüggő fejlécfinomhangolás.
3. `prefers-reduced-motion`, `prefers-contrast: more` és `forced-colors: active` médiaigények kezelése; a címerek és az olvasható főtartalmak elérhetők maradnak.
4. A még nem prioritásos tartalmi képeken lusta betöltés és aszinkron dekódolás; a kiemelt, „eager” vagy magas prioritású képek elsőbbsége megmarad.
5. Adattakarékos vagy gyengébb készülékprofil esetén a nem kért automatikus videóindítás tiltása; a korlátozás megszűnésekor az eredeti attribútum visszaáll.
6. Háttérbe kerüléskor mobilon a lejátszott tartalmi videók szünetelnek. A PDF-vásznat és diagramvásznakat nem érinti tartalomkihagyás.
7. A figyelők csak egyszer regisztrálódnak; asztali nézetre váltva mobilos állapotosztályok eltűnnek.

**Ellenőrzés:** `node tools/verify-mobile-m9.mjs` – sikeres. Beállításprofilok, DOM-szimuláció, képek, videó, `visibilitychange`, mobil–asztali váltás ellenőrizve. Valódi készülékes teljesítménymérés, képernyőolvasó és kontrasztmérő használata még nyitott.

## 4. M10/D – mobilos interakciók és munkafolyamatok (v1.43.15 kapu)

1. A Bootstrap-alapú kereső a telefon teljes képernyőjét használja, a találatok önállóan görgethetők; a bezárógomb és a keresőmező nagyobb célfelületet kap.
2. Galéria-, sportág-, videólista- és dokumentumszűrők között körbeforduló nyílbillentyűs léptetés, valamint `Home` és `End` támogatás.
3. Ha a szűrő kiválasztása újrarajzolja a gombokat, a fókusz a megfelelő új gombon marad.
4. Az aktív belső menühivatkozást mobilon `aria-current="page"` jelöli; útvonalváltáskor frissül, asztali nézetre váltva a modul saját jelölése eltűnik.
5. Virtuális billentyűzet megjelenésekor csak az eltakart kereső- vagy űrlapmező gördül látható területre. Normál mezőknél nincs kényszerített oldalugrás.
6. A meglévő saját menü, kereső, néző, dokumentumtár és galéria maradt; külön konfigurációs panel nem jelent meg.

**Ellenőrzés:** `node tools/verify-mobile-m10.mjs` – sikeres. Billentyűs határhelyzetek, újrarajzolás utáni fókusz, virtuális billentyűzet-szimuláció, route-váltás, visszaváltás ellenőrizve. Valódi érintéses és képernyőolvasós próba még nyitott.

## 5. Regressziós, reszponzív, akadálymentességi és csomagpróbák

| Terület | Elvégzett ellenőrzés | Eredmény |
|---|---|---|
| M3 – háromszintű körmenü | Nyitás, visszalépés, fókusz, oldalra navigálás | Sikeres, Node-szimuláció |
| M4 – mobilos görgetés | 0/50/100%-os görgetés, fejléc, mobil–asztali váltás | Sikeres, Node-szimuláció |
| M6 – filmes kapu és képváltó | Állapotok, témalink, lapozás, egyszeri kapu, csökkentett mozgás | Sikeres, Node/ál-DOM |
| M7 – aloldalak | Mobilos elrendezés, egy oszlop, központozás, menü-szimmetria | Sikeres, statikus ellenőrzés |
| M8 – Bootstrap-komponensek | Mobilos CSS, natív Bootstrap Modal/Carousel használata, kép-szűrési lánc | Sikeres, statikus ellenőrzés |
| M9 – hozzáférhetőség/teljesítmény | Fókuszszabályok, készülékprofil, lusta képek, témaválasztás, visszaállítás | Sikeres, statikus és ál-DOM |
| M10 – folyamatok | Szűrőfókusz, billentyűzet, kereső, aktív útvonal, mobil–asztali visszaállítás | Sikeres, statikus és ál-DOM |
| Reszponzivitás | 365/768 px-es korlátok, CSS-médiahatárok, túlcsordulási védők | Forrásellenőrzés sikeres; élő renderpróba nyitott |
| Akadálymentesség | `focus-visible`, 44 px-es vezérlők, reduced-motion, forced-colors, `aria-current` | Forrás és szimuláció sikeres; TalkBack/VoiceOver/axe nyitott |
| Kliensoldali gyorsítótár | Új SW-verzió, egységes cacheVersion, új mobil fájlok precache-listája | Forrásellenőrzés sikeres; szolgáltatásmunkás valódi telepítési próba nyitott |
| Teljes ZIP | Fájlméret, SHA-256 manifest, ZIP-CRC és teljes kitömörítés | Kiadáscsomagoló ellenőrzés; részletek a csomagküldésnél |
| Visszaállítás | Teljes ZIP kitömörítése ideiglenes mappába; az összes M3–M10 ellenőrzés megismétlése | Kiadáscsomagoló ellenőrzés; részletek a csomagküldésnél |

### Böngészős ellenőrzés korlátja

A valódi helyi mobilwebhely felé a korábbi környezetben a böngészős elérés biztonsági korlátba ütközött. Az engedélyezett jelenlegi munkafolyamat nem biztosít ellenőrzött, bejelentkezés nélküli élő mobilrendes nézetet. Emiatt **nem állítjuk**, hogy a 320/360/375/390/428/576/768 px szélességeken tényleges Chrome/Safari-képernyőkép, érintéses swipe, virtuális billentyűzet, TalkBack/VoiceOver, axe, Lighthouse vagy online/offline szolgáltatásmunkás-próba már megtörtént. Ezek a felhasználói végső elfogadás előtti javasolt nyitott tesztek; az észlelt kockázatot a statikus és szimulációs ellenőrzés csökkenti, de nem zárja ki.

### Ismert, változatlan külső függőség

A Bootstrap 5.3.9 CSS/JS CDN-hivatkozással töltődik, a PDF.js és a dokumentum/képnéző alkalmazáskódja helyi. Hálózat nélkül a külső Bootstrap elérhetősége nem garantált; ezt a fejlesztés nem változtatta meg. FTP-/GitHub-közzététel nem történik a végső jóváhagyás nélkül.

## 6. Helyreállítási eljárás és jóváhagyás

1. Őrizd meg a már jóváhagyott v1.43.12 teljes ZIP-et változatlanul.
2. Az új v1.43.15 teljes ZIP egy új, külön mappába bontva ellenőrizhető; a szerver és az élő oldal közben változatlan.
3. Hiba vagy elutasítás esetén a v1.43.12 ZIP marad a visszaállítható referenciacsomag. Publikáció előtt nincs tényleges tárhely-visszaállításra szükség, mert a tárhelyet nem módosítottuk.
4. A végső kiadás külön, kifejezett felhasználói jóváhagyásra vár. Jóváhagyás **nem** jelent automatikus FTP- vagy GitHub-publikálási engedélyt.
