# Csanádi 1.46 – a JSON-alapú weboldal szerkesztése

A weboldal **HTML-fájljaiban nincs megjelenő szöveg, fejléc, menü, főtartalom vagy lábléc**. A `index.html` és az `offline.html` csak a böngésző által megkövetelt alapvázat, karakterkódolást, nézetbeállítást és egy JSON-betöltőt tartalmaz.

## Hol változtassak?

| Szerkesztendő rész | Fájl |
| --- | --- |
| Fejléc, menünyitók, lábléc, keresőfelület, felugró felületek, cím és metaadatok | `json/site-shell.json` |
| Offline képernyő szövege és gombjai | `json/offline-shell.json` |
| Oldalak sorrendje és navigációs menüfája | `json/structure.json` |
| A 79 aloldal és a kezdőlap tartalma | `json/pages/*.json` |
| Oldalcímek, útvonalak és ellenőrzési állapotok | `json/page-index.json` |
| Intézményi beállítások, verziózás és egyes felületadatok | `json/config.json` |
| Képek, variánsok és médiaazonosítók | `json/media-library.json` |

## A JSON-oldalkeret felépítése

- `document`: böngészőcím, nyelv, metaadatok, favicon és előkapcsolatok.
- `assets.stylesheets`: az oldal megjelenéséhez szükséges CSS-ek, sorrendben.
- `assets.scripts`: korábbi, továbbra is szükséges JavaScript-függőségek, sorrendben.
- `assets.entryModule`: a honlapot indító modul.
- `body`: az oldal HTML-elemeinek deklaratív, egymásba ágyazott leírása.
- `theme`, `gate`, `imagePreload`, `errors`: megjelenítési beállítások, nyitókép, kezdőkép-előtöltés és vészhelyzeti tájékoztatás.

Példa egy tartalmi elemre:

```json
{
  "tag": "a",
  "attrs": {"href": "#/kapcsolat", "class": "footer-link"},
  "children": ["Kapcsolat"]
}
```

A `tag` a kívánt böngészős elemet írja le; az `attrs` az engedélyezett tulajdonságokat, a `children` a benne lévő szöveget vagy további elemeket. A betöltő biztonsági okból nem enged tetszőleges szkriptet és eseménykódot a JSON-ba. A működési logika JavaScript, a grafikai szabályok CSS fájlokban maradnak; tartalmat ezekbe alaphelyzetben nem kell írni.

## Ellenőrzés módosítás után

```bash
node tools/verify-v146-json-shell.mjs
node tools/verify-v146-runtime.mjs
node tools/audit-v145-surfaces.mjs
```

Az oldalt **HTTP(S)-kiszolgálón** kell megnyitni. A `file://` megnyitás a JSON-lekérések miatt nem támogatott. FTP-n a kicsomagolt teljes mappaszerkezetet szükséges feltölteni. A `service-worker.js` a JSON-oldalkeretet is gyorsítótárazza, ha már betöltődött.

## Megőrzés

A jóváhagyott **1.45 érintetlen**. A régi, kizárólag bemutatási célú `reports/*.html` jelentés pontos forrása a `reports/csanadi-v1.43.28-m18-3-mobilos-elrendezes-archivum.json` állományban maradt meg. A csomagban nincs más, tartalommal kitöltött HTML-oldal.
