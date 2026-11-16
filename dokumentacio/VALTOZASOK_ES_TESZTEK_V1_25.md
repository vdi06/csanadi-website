# v1.25.0 – teljes kiadás, első javítási kör

- Forrás: v1.24.0 teljes állománykészlete; 65 JSON-oldal és a teljes média-/dokumentumrendszer megőrzésével.
- A: mobil szakaszmenü a vizuális nézetmagasságot és a fekvő állapotot is kezeli.
- B: a szakaszra ugrás a kibontás után mér, asztali menünél is dinamikus fejléc-offsetet használ.
- C: részletek nyitásakor az előző, másik elemről maradt rögzítést törli.
- D: az iframe azonos magasságát nem írja vissza fölöslegesen.
- E: a térképes HTML párhuzamos témakezelője megszűnt; az egységes témavezetés maradt.
- F: ismétlődő szakaszcímek kis-/nagybetű-független összevonása.
- G: JSON-frissítéskor a címsor szövegéhez és előfordulási számához kötött olvasási pozíció.
- H: szakaszmenü nyílbillentyűzetes fókuszváltása nem görget véletlenül.
- I: galéria előtöltése legfeljebb hat megtartott képre korlátozva; hibánál újrapróbálható.
- J: a meglévő diagnosztika a hibás SHA-256-alakú manifesttételeket jelzi.

## Tesztelés és hibakeresés

- Teljes regressziós futtató: **15/15 sikeres** (`TESZTNAPLO_V1_25.md`).
- 12 célzott megerősítő ellenőrzés: **12/12**.
- Statikus HTTP-ellenőrzés: **1105/1105** sikeres.
- Hibakeresés: a megváltozott képelőtöltési korlát miatt az elavult tesztvárakozást javítottuk; a régebbi menütesztből eltávolítottuk a lejárt, v1.24-re rögzített CSS-URL-elvárást. A javított tesztek újrafuttatva sikeresek.
- A Chromium helyi indítása `Operation not permitted` hibával blokkolódott; böngészős sikerre nem hivatkozunk.
- Nincs új önálló honlapfunkció, nincs szerveroldali függőség; a ZIP gyökerébe közvetlenül kicsomagolható projekt továbbra is statikus FTP-kompatibilis.
