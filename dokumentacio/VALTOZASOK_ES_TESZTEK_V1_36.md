# Csanádi weboldal v1.36.0 – teljes javítási kiadás (3/3)

A v1.35.0 összes állományát és az előző két kiadás valamennyi javítását tartalmazza. A 63 eredetileg elvárt tartalmi oldalnál több, összesen 65 regisztrált JSON-oldal megmarad. Kizárólag meglévő funkciók megbízhatóságát javítottuk.

| Tétel | Végrehajtott további javítás |
|---|---|
| A | Mobilról asztali méretre váltáskor, ha a fókusz a bezáródó mobilmenüben volt, látható főmenüindítóra lép. |
| B | A szülőoldal is újraellenőrzi a rendszer-/kézi témaállapotot, amikor mobilon a dokumentum ismét láthatóvá válik. |
| C | Az iframe magasságváltozását követő szakaszugrás két elrendezési képkockát vár; a késői méretváltozás nem teheti pontatlanná az azonnali célt. |
| D | Az aktív mobilos szakasz felismerésének küszöbe figyelembe veszi a tényleges tapadó fejlécmagasságot. |
| E | A bezáródó PDF-dialógus eltűnt nyitógomb esetén egy látható dokumentumközponti vezérlőre lép vissza. |
| F | Előzményből visszahozott keresési szöveg levágja a kezdő és záró szóközöket, a szűrési állapot és találati mennyiség továbbra is megmarad. |
| G | A későn érkező iframe-hibajelzés nem módosítja a már bezárt PDF-előnézet szövegét. |
| H | Hálózati visszacsatlakozáskor a nyitott galéria meglévő képmegjelenítését újraellenőrzi és újrapróbálja. |
| I | A többször előforduló azonos azonosítókat nem tekinti egyedi egyezésnek a kinyitott szakaszok visszaállításakor; az azonos felirat sorrendjét használja. |
| J | A diagnosztika a későn lezáruló fájlleltár- és konfigurációkérést már a következő feldolgozási szakasz előtt megszakítja. |

## Végső ellenőrzés

- `node tools/test-corrections-v1-36.js`: 62 célzott A–J ellenőrzés.
- `node tools/run-full-regression-v1-36.js`: 18 részprogramos teljes regresszió, statikus HTTP-végpontokkal, JSON-validálással, dokumentumokkal és médiával.
- Részletes, alprogramonkénti napló: `dokumentacio/TESZTNAPLO_V1_36.md`.
- A kiadott ZIP külön `unzip -tq` épségellenőrzést kap.

Az automatikus, saját környezetben futó regresszió nem helyettesíti a valós iOS/Android-eszközökön és a ténylegesen publikált éles webhelyen végzett interaktív vizsgálatot. A külön napi 06:00-s élesoldali teszt még nem hozott ellenőrzött eredményt; a diagnosztika ezért nem közöl fiktív tesztet.
