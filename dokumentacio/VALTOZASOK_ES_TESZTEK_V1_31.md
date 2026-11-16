# Csanádi weboldal v1.31.0 – első teljes javítási kör

Kiindulás: a v1.30.0 teljes ZIP-csomagja. Ez a kiadás mind a tíz kiválasztott, már meglévő funkciót javítja; új szolgáltatás nem készült.

| Betű | Javítás | Ellenőrzés |
| --- | --- | --- |
| A | Mobil menüágak állapota ugyanazon útvonal újrarajzolásakor megmarad | Mobilfa-tesztek és célzott forrásellenőrzés |
| B | A szülőoldal kézi témaválasztása tárolóhiba esetén memóriában marad | Téma-szimuláció és helyi teszt |
| C | Iframe üzenettípus, szerkezet és görgetési offset szigorúbb ellenőrzése | Beágyazott regresszió |
| D | Szakaszugrás a dokumentum görgethető végére korlátozott | DOM-szimuláció |
| E | A rejtett szakaszpanelre már nem kerül vissza a billentyűzetes fókusz | Fókusz- és ARIA-ellenőrzés |
| F | A kereső aktuális lekérdezése, típusa, témaköre és találatszáma útvonalanként, memóriában visszaállítható | Állapot- és szűrővalidálás |
| G | Verziótörténet számszerű sorrendje és időrendje kötelező; előnézeti iframe bezáráskor kiürül | Dokumentumséma és negatívteszt |
| H | Lassú kapcsolat és adatforgalom-kímélés alatt nincs felesleges előtöltés; a kész képek felszabadulnak | Előtöltési feltételek és regresszió |
| I | Azonos című szakaszok megkülönböztetéséhez több bekezdés kontextusa kerül feldolgozásra | Szakasz- és frissítési tesztek |
| J | Hiányos, nem objektum vagy hibás méretű manifest nem fogadható el | Diagnosztikai verseny- és adatvizsgálat |

## Valós teszteredmények

- Teljes helyi regressziós programok: **18/18 sikeres**.
- Célzott új A–J ellenőrzések: **12/12 sikeres**.
- Mobilos szakaszregresszió: **48/48 sikeres**.
- Témaszinkron: **12/12 sikeres**.
- Aktuális védelmi szabályok: **59/59 sikeres**.
- Statikus HTTP-próbák: **1171/1171 sikeres**, 65 oldal és 628 médiatétel ellenőrzésével.
- A hibás eredményű első tesztfutás és az utána elvégzett javítások részletei: a teljes tesztnapló végső, sikeres újrafuttatásában; két tesztszimulációs eltérést és egy tématörlési várakozást egyeztettünk.

Részletes, időmért egyedi tesztnapló: `dokumentacio/TESZTNAPLO_V1_31.md`.

**Korlát:** a vizsgálat statikus helyi kiszolgálón, kódszintű ellenőrzésekkel és szimulált DOM-navigációval történt. Nem igazolja önmagában a valódi mobil Safari/Chrome minden viselkedését, a külső térképszolgáltatást és az éles szerver terhelését.
