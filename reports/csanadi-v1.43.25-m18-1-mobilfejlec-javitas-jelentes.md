# Csanádi weboldal v1.43.25 – M18.1 mobilos fejlécjavítás

**Dátum:** 2026. november 20.  
**Állapot:** külön végső jóváhagyásra váró, helyi előnézet.  
**Kiindulási alap:** a jóváhagyott v1.43.24, változatlanul megőrizve.  
**Közzététel:** FTP, GitHub és éles oldal: **nem történt**.

## A jelzett hiba

A kapott iPhone-képernyőképen a fejléc ikon- és szövegcsoportjai egymásra csúsznak: a közösségi elemek, a KRÉTA, a mottó és más fejlécfeliratok is átfedik egymást, részben a nyitókép fölé lógnak. A képernyőképen a `vdio6.github.io` domain látható. Mivel a v1.43.24-et a korábbi kérésre nem tettük közzé, a kép a GitHub Pagesen látható kiadást mutatja, és önmagában nem bizonyít hibát a jóváhagyott ZIP-ben. Ettől függetlenül a v1.43.24 saját mobilfejlécének 320 px-es elrendezése is nagyon szűk volt: három bal oldali, legalább 44 px széles gomb próbált elférni a címer mellé.

## Tényleges javítás – kizárólag mobilnézet

1. A címer a mobilos fejléc első vezérlősorának **középső oszlopában** marad, menünyitó funkcióval.
2. A Facebook és Instagram két egyforma, minimum 44 px magas érintési célként a bal oldalon, a keresés és a témaváltás ugyanilyen módon a jobb oldalon jelenik meg. Mindkét oldal két azonos cellára oszlik.
3. A KRÉTA **külön, teljes szélességű, középre igazított második sorba** került, ezért nem tolhatja el a középső címert, és nem nyomhatja össze a közösségi ikonokat.
4. Az iskolanév és a mottó normál dokumentumfolyamban, középre igazítva szerepel; a fejléc magassága az elrendezést követi.
5. A régi, közös desktopfejléc és az esetleges régi mobilos navigáció továbbra is kizárólag mobil CSS-sel rejtve marad, és a saját mobilmodul a 769 px-es asztali szélességtől eltávolodik a DOM-ból.
6. A korábbi nyitóanimációhoz, képváltóhoz, menühierarchiához, aloldalakhoz, adatokhoz, asztali CSS-hez és asztali logikához nem történt funkcionális módosítás.

## Ellenőrzési kapuk

| Kapu | Elvégzett ellenőrzés | Eredmény |
|---|---|---|
| M18.1/A | Szimmetrikus mobilos ikonelrendezés modellezése 320, 344, 360, 375, 390, 412, 430, 600, 768 CSS px-en | **PASS** – forrás-/geometriateszt |
| M18.1/B | KRÉTA külön sorban; címer középen; gombok legalább 44 px magasak | **PASS** – forrás-/DOM-teszt |
| M18.1/C | Saját mobilfejléc bekapcsolás, görgetési magasság, asztalra visszaváltás, eredeti asztali DOM megtartása | **PASS** – szimulált DOM-teszt |
| M18.1/D | Korábbi M11–M17 regressziók, dupla hero-védelem, 78 aloldal, 111 JSON, 5923 helyi fájlhivatkozás | **PASS** – automatizált |
| Kiadás | Teljes ZIP, 1331 fájl SHA-256, 25/25 automatizált ellenőrzés és v1.43.24 érintetlensége | **PASS** – a ZIP külön visszabontása után is újraellenőrizve |
| Valós eszköz | iOS Safari / Android Chrome / asztali böngésző valós pixel-, érintés- és képernyőképtesztje | **NYITOTT** – ebben a környezetben nem volt végrehajtható |

## Kötelező kézi próba jóváhagyás előtt

- Nyisd meg a v1.43.25 helyi előnézetét telefonon, HTTP-kiszolgálóról (a JSON-betöltéshez a `file://` nem elegendő).
- 320/375/390/430/768 px-en nézd meg a fejlécet álló és fekvő helyzetben, valamint a 769 px-es asztali váltást.
- Ellenőrizd mindkét színtémát, a görgetés utáni kompakt fejlécet és a KRÉTA megnyitását.
- Nyisd a menüt a címerrel, próbáld a keresést és a témaváltót; a Facebook és Instagram külön megnyílása és a fókusz sorrendje is legyen helyes.
- Ellenőrizd, hogy a nyitókép nem fedődik le fejlécfeliratokkal és az eredeti asztali kialakítás nem változott.
- A GitHub Pagesen megjelenő régi hibát a csomag **önmagában nem tudja megszüntetni**, mert a közzététel nem engedélyezett; a helyi előnézet és a közzétett oldal verziója különbözhet.

**Kiadási eredmény:** 1331 fájl ellenőrzött SHA-256 lenyomattal; 25/25 sikeres automatizált ellenőrzés; további 82 JavaScript és 26 ellenőrző-/építőmodul szintaktikai vizsgálata sikeres. A v1.43.24 eredeti, 1329 fájlos leltára változatlanul és hibamentesen ellenőrizhető. A csomag egy tiszta könyvtárba kicsomagolva is megfelelt a regressziós teszteknek. Mindez nem jelenti a valós iOS/Android megjelenés igazolását.

## Végső jóváhagyási pont

**A:** Jóváhagyom a v1.43.25 M18.1 mobilos fejlécjavítást, a dokumentált nyitott valós böngészős és eszközös tesztekkel; közzététel továbbra sincs.  
**B:** Előbb valós iPhone/Android készüléken ellenőrzöm; a jóváhagyás függőben marad.  
**C:** További képernyőképet vagy hibajelentést küldök; újabb javítás szükséges.
