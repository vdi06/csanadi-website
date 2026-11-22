# Csanádi 1.47 – JSON-szerkesztés és minőségellenőrzés

Az `index.html` és az `offline.html` továbbra is csak minimális, üres törzsű indítófájl. A megjelenő oldalkeret, a menü, a kereső, a lábléc, a metaadatok és az offline felület a `json/site-shell.json`, illetve a `json/offline-shell.json` fájlban szerkeszthető. A 79 aloldal a `json/pages/` mappában található.

## Új 1.47-es ellenőrzés

A weboldal a teljes oldalkeret JSON-ját **még a renderelés előtt ellenőrzi**. Hiányzó `app` elem, ismétlődő HTML-azonosító, tiltott HTML-tag, veszélyes URL vagy hibás struktúra esetén biztonságos hibaoldalt mutat. A hibaoldalon JSON-ból feliratozott **Újrapróbálkozás** gomb található.

A kiadás előtti teljes adatellenőrző a következő parancs:

```bash
node tools/validate-json-project-v147.mjs
```

Ellenőrzi:

- a két JSON-oldalkeretet és azok függőségeit;
- a 79 oldal egyedi azonosítóját, címét, útvonalát és az indexszel való egyezését;
- a legfeljebb háromszintű menü minden céloldalát;
- az oldalblokkok azonosítóinak globális egyediségét;
- a menü- és keresőindex frissességét, a hibás linkeket;
- a szerkesztőségi forrásellenőrzés állapotát.

Géppel feldolgozható ellenőrzési jelentés újragenerálása:

```bash
node tools/validate-json-project-v147.mjs --write-report
```

A friss jelentés útvonala: `reports/csanadi-1.47-json-audit.json`. A `requiresContentReview` lista megmutatja, mely oldalak további szerkesztőségi forrásellenőrzést igényelnek. Egy nem igazolt oldal **nem feltétlenül hibás**, de publikálás előtt ellenőrizendő.

## Gyors JSON-hibapéldák

| Hiba | Mit javíts? |
| --- | --- |
| `DUPLICATE_BLOCK_ID` | Két eltérő tartalmi blokk ne kapja ugyanazt a `block:` azonosítót |
| `MISSING_PAGE` | A menüben vagy indexben felsorolt oldal JSON-ja hiányzik |
| `ROUTE_MISMATCH` | A lap saját `schemaExtensions.route` mezője és az index útvonala egyezzen |
| `STALE_SEARCH_BLOCKS` | Az index blokkmásolata nem egyezik az oldal aktuális blokkjaival |
| `INVALID_SHELL` | Tiltott elem, attribútum, link vagy hiányzó kötelező mező van a JSON-oldalkeretben |

## CDN és offline működés

A `json/site-shell.json` fájl `network` részében állítható:

```json
"network": {
  "cdnScriptTimeoutMs": 4000,
  "localScriptTimeoutMs": 6500
}
```

Offline állapotban a Bootstrap CDN-szkriptet a weboldal nem várja meg. A Bootstrap továbbra is **kizárólag a verzióhoz kötött CDN-ről töltődik**, a ZIP-ben nincs helyi Bootstrap-példány. Az esetleg hiányzó Bootstrap-funkciókat a saját nézők és az oldal működése csak a meglévő tartalékkezelés mértékéig tudja helyettesíteni.

## Kiadásellenőrzés

```bash
node tools/verify-v147-json-shell.mjs
node tools/verify-v147-runtime.mjs
node tools/validate-json-project-v147.mjs
node tools/verify-v147-release.mjs
```

A böngészős megnyitáshoz HTTP(S)-kiszolgáló szükséges; `file://` használata a JSON-lekérések miatt nem támogatott. Élesítés előtt a felületet valós mobilkészülékeken és asztali böngészőben is végig kell járni. Az 1.45 és 1.46 korábbi ZIP-csomagok változatlanul megmaradnak.
