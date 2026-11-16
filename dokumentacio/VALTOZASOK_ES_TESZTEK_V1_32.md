# Csanádi weboldal v1.32.0 – második, teljes javítási kiadás

Kiindulás: a teljes v1.31.0; a v1.30.0 öröklött teljes projektje, tartalma, médiái, eszközei és FTP-kompatibilis működése továbbra is része ennek a csomagnak. Nem új funkció, hanem a meglévő A–J működés második hibajavítási köre. A v1.31.0 külön ZIP-ként is megmarad.

## A–J javítási napló

| Pont | Már meglévő működés újabb pontosítása |
|---|---|
| A | Képernyőméret-váltásnál a láthatatlanná váló mobil menü fókusza a főmenü indítójára tér vissza. |
| B | Azonos eredetű térképes iframe és a szülő SPA között oda-vissza szinkronizálódik a már meglévő háromféle témaválasztás; kézi sötét beállítás megtartása. |
| C | Beágyazott térkép méret-/szakaszüzenetei növekvő sorszámot kapnak; a szülő figyelmen kívül hagyja a késő, rossz sorrendben beérkező és hibás sorszámú választ. A korábbi üzenetformátum kompatibilis marad. |
| D | Hosszú aloldal szakaszugrása figyelembe veszi a CSS `scroll-margin-top` beállítást is. |
| E | Dokumentumelőnézet bezárásakor csak látható, DOM-ban megmaradt kezelőszervre kerül vissza a fókusz. |
| F | A keresés megnyitásának eredeti SPA-útvonala rögzül, így Vissza/Előre eseménynél sem kerül téves oldalhoz a szűrési állapot. |
| G | A PDF-előnézet lezárása megszünteti a beágyazott fájlkérést, látható gombra állítja vissza a fókuszt; az előző kiadás számszerű verzióellenőrzése megmarad. |
| H | Régi kép-előtöltési esemény nem törölhet újabb, azonos URL-re indított előtöltést; a megszakított képek mindkét eseménykezelője felszabadul. |
| I | Élő JSON-újrarajzolás során a szakaszhelyreállítás nem írja felül az időközben kézzel történt görgetést vagy az útvonalváltást. |
| J | A manifestben az abszolút/elérési útból kitörő/vezérlőkarakteres vagy visszaperjeles fájlnevek, továbbá az érvénytelen összméret hibaként szerepelnek. |

## Tesztelés

- A `tools/run-full-regression-v1-32.js` futtatja a teljes örökölt és új regressziós tesztkészletet, különböző komponensekre, hibás adatokra, mobilra, dokumentumokra, HTTP-fájlokra, médiaeszközökre.
- Az új `tools/test-corrections-v1-32.js` 22 A–J célzott ellenőrzést végez; ebből 10 a második kiadás új hibavédelme.
- Minden program tényleges státusza, időtartama és teljes kimenete a `TESZTNAPLO_V1_32.md` fájlban található. A kezdeti eltérések javítása utáni legutolsó futás az irányadó.
- A tesztelt környezet helyi statikus forrás és helyi HTTP-szerver. Fizikai iOS Safari-/Android Chrome-eszközt, illetve éles webhelyet ez a teszt nem állít helyettesíthetőnek.
- A napi 06:00-kor ütemezett **élő weboldal** tesztje ettől független. Első futása 2026. november 17-én lesz; ezért tényleges automatikus élőteszt-eredmény nincs ebben a ZIP-ben.

## Kompatibilitás

- Statikus HTML/CSS/JS/JSON, natív JavaScript, hash-alapú útválasztás, FTP-tárhely.
- Bootstrap továbbra is csak verzióhoz kötött CDN-ről érkezik, nem mellékelünk helyi Bootstrap-fájlokat.
- A kiadás nem módosítja az éles GitHub Pages/FTP tárhelyet. Nem végez új médiaállomány-bővítést.
