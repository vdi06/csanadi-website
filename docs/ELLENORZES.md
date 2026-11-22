# Csanádi – tiszta 2.00 alap, első lépés

Ez az első, szándékosan minimális újraépítés. **Nem publikált éles kiadás.**

## Mi van benne?

- Egy adatmentes `index.html` és egyetlen reszponzív belépési pont (`js/entry.js`).
- Önálló `mobile/app.js` és `mobile/styles.css`.
- Önálló `desktop/app.js` és `desktop/styles.css`.
- Közös, ellenőrzött címer, JSON-beállítás és néhány kicsi DOM-építő.
- Mobilon középen a címer, nincs mozgó kép és asztali DOM; a **Főoldal** hivatkozás működő célpontra mutat.
- Asztalon térhatású arany kapukeret és **Oldal tetejére** hivatkozás.

## Mi nincs benne?

Nincsenek aloldalak, dokumentumok, galériák, hírek, keresés, közösségi ikonok,
régi widgetek, képváltó, korábbi CSS/JavaScript modulok vagy választófelület.
Az előző kiadások és a félretett tartalmak a fejlesztői munkakörnyezetben megmaradtak,
de **nem részei ennek a ZIP-nek**. A funkcióválasztás kizárólag a beszélgetésben történik.

## Futtatás

Statikus HTTP-szerverrel (például `python3 -m http.server 8000`) megnyitható az `index.html`.
A böngészős tesztek futtatása: `node tools/test.mjs` (Chromium és Playwright kell).

## Első ellenőrzés – 2026. november 22.

- **Sikeres:** pontos fájlkészlet, JSON-formátum, címer SHA-256 ellenőrzése.
- **Sikeres:** a tényleges mobil- és asztali JavaScriptből előállított külön DOM-fák ellenőrzése.
- **Sikeres:** középre igazítás, térközök, arany keret és hivatkozási célok forráskódos vizsgálata.
- **Nem futott le:** Chromium-alapú geometriai és átméretezési teszt, mert a futtatókörnyezet
  blokkolta a böngésző indítását. Ez nem tekinthető sikeres böngészőtesztnek.
- **Nem tesztelt:** valódi iPhone és Android. Publikálás előtt ezek is szükségesek.

## Következő lépések

Egyetlen kiválasztott elem ellenőrzése és javítása minden fordulóban,
**párhuzamosan mobilon és asztalon**. Az újabb elem csak jóváhagyás után kerül
a kiadásba. Publikálás külön döntés alapján történhet.
