# Csanádi weboldal v1.34.0 – teljes javítási kiadás (1/3)

Kiindulás: a v1.33.0 teljes, eredeti ZIP-kiadása. Ez az A–J feladatok első, önállóan teljes verziója. Megmarad az összes korábbi JSON-oldal, média, eszköz és statikus FTP-kompatibilis működés. Új felhasználói funkció nem készült.

## A–J javítási tétellista

| Terület | Elvégzett javítás |
|---|---|
| A | A főmenü megnyitásakor az előző mobilfejléc-menü becsukódik; asztali méretre váltáskor a rejtett mobilmenü bezárul; a megamenü fókusza csak látható indítóra tér vissza. |
| B | A téma explicit törlését a rendszer-téma helyes visszaállítása követi, míg a tárolóhibák továbbra is megőrzik a memóriában tartott manuális választást. |
| C | A térképes iframe invalid magasságot küldő üzenete nem foglalja el a következő érvényes üzenetsorszámot. |
| D | A szakaszugrás a mobil vizuális nézet (soft keyboard) valódi magasságához igazodik. |
| E | A mobil szakaszpanel fókusza szükség esetén a látható szakaszmenü-indítóra tér vissza. |
| F | Hash útvonalváltásnál a bezáródó kereső nem helyezi vissza a fókuszt a régi oldalra. |
| G | A PDF-előnézet bezárása a konkrét dialog nyitáskori fókuszcélját használja, nem egy esetleg közben felülírt globális értéket. |
| H | Hálózati offline eseménynél a galéria megszünteti a függő kép-előtöltéseket. |
| I | Élő JSON-újrarajzolásnál a kinyitott `details` elemek stabil id/szakaszkörnyezet alapján újranyílnak. |
| J | A kiadási manifest várt sémaverziója kötelező a sikeres diagnosztikához. |

## Tesztelés és korlátok

- Futtatás: `node tools/run-full-regression-v1-34.js`.
- Célzott A–J ellenőrzés: `node tools/test-corrections-v1-34.js` – 42 célzott ellenőrzés.
- A programonkénti, tényleges kimenet és futási idő: `dokumentacio/TESZTNAPLO_V1_34.md`.
- Valódi iOS Safari és Android Chrome fizikai eszközön a javítások nem kerültek hitelesítésre; a helyi VM, forrás, JSON, dokumentum és HTTP tesztek nem helyettesítik ezeket.
- A külön napi 06:00-s teszt az éles weboldal ténylegesen publikált állapotát ellenőrzi; annak még nem készült el futási eredménye, így a honlapdiagnosztikába nem került automatikus teszteredmény.

## Megőrzés

Statikus HTML/CSS/JS/JSON és Bootstrap 5.3.9 kizárólag verzióhoz kötött CDN-ről. Nincs PHP/Node szerver- vagy GitHub Actions-kényszer a nyilvános oldalon, nincs automatikus élesítés, nincs média-hatszorozás.
