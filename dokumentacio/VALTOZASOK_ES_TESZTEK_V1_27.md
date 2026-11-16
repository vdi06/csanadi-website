# v1.27.0 – teljes kiadás, harmadik, v1.26-ra épülő javítási kör

A kiadás változatlanul tartalmazza a v1.24.0 teljes projektjét, a v1.25.0 és a v1.26.0 valamennyi javítását, a 65 regisztrált JSON-oldalt és mind a 628 médiaállományt. Nem készült új önálló honlapfunkció.

- **A – Mobil szakaszmenü:** a fekvő mobilnézetre vonatkozó magasságkorlát érvényesítése a később beolvasott reszponzív szabályok mellett is; a bezárt mobil panel helyesen visszaadja a fókuszt.
- **B – Szakaszokra ugrás:** a meglévő szakaszhorgonyokhoz hozzáadott CSS `scroll-margin-top` megakadályozza, hogy a ragadós fejléc alá kerüljenek.
- **C – Részletek megnyitása:** megmaradt a v1.26-ban bevezetett 1200 ms-os elavulásellenőrzés; a régi részletnyitási események nem rángatják a görgetést.
- **D – Térképes beágyazás:** a térképes iframe a mobil `visualViewport` méretváltozásakor is újraméri saját magasságát, a korábbi betűbetöltés- és visszatérés-figyelés megtartásával.
- **E – Témakezelés:** a `tools/` segédoldalak és a meglévő kalauz a `pageshow` és `visibilitychange` eseményeknél újra érvényesítik a felhasználó által kézzel kiválasztott témát, hogy mobilon ne váltson vissza indokolatlanul világos módra.
- **F – Ismétlődő szakaszcímek:** az aloldali szakaszok a címsorból és az előfordulásból képzett, stabil és beszédes azonosítót kapnak; a kis- és nagybetűeltérések nem törik meg az azonosítást.
- **G – JSON-frissítés:** a stabil szakaszazonosítók tovább javítják az aktív elem és a fókusz helyes visszaállítását tartalomfrissítés után.
- **H – Billentyűzetes hozzáférés:** a mobil szakaszmenü elemeinek képernyőolvasó-felirata tartalmazza az elem sorszámát és a szakaszok számát; a korábbi nyílbillentyű- és fókuszjavítások érvényben maradtak.
- **I – Galéria és média:** a galéria bezárása felszabadítja az előtöltési gyorsítótárat; a nem automatikusan induló videók nem töltenek le fölösleges adatot a lejátszás előtt.
- **J – Diagnosztika:** a meglévő manifestellenőrzés a Bootstrap CDN-hez rögzített verzióbejegyzést is vizsgálja, és a böngésző vissza/előre gyorsítótárából visszatérve frissít.

## Teljes teszteredmény

- **15/15** regressziós tesztprogram sikeres; részletes napló: `TESZTNAPLO_V1_27.md`.
- **29/29** kifejezetten a jelenlegi javításokat fedő ellenőrzés, **48/48** mobil szakaszmenü-ellenőrzés, **12/12** témateszt.
- **1126/1126** statikus HTTP-lekérés sikeres, benne 65 regisztrált JSON-oldal és 628 médiaállomány.
- Médiaállomány-nyilvántartás: **628/628** egyező, **87** QR-eszköz; nincs hiányzó vagy árva tétel.
- A helyi Chromium böngésző az adott végrehajtási környezetben `socket() failed: Operation not permitted (1)` miatt nem indítható. Valódi grafikus böngészős, több eszközös végellenőrzést ezért **nem állítunk sikeresnek**; az ehhez készült tesztprogram megmaradt későbbi futtatásra.
- Nem került be GitHub Pages- vagy szerveroldali futtatási függőség. A működő projekt statikus FTP-tárhelyről kiszolgálható; a Bootstrap változatlanul verzióhoz kötött külső CDN-ről töltődik.

Az automatikus, élő honlapot vizsgáló napi 06:00-s teszt feladata külön működik. A ZIP-be kizárólag akkor kerül annak tényleges eredménye, ha a csomag összeállításáig valóban lefutott; a jelenlegi kiadás készítésekor nem állt rendelkezésre ilyen eredmény, így ilyen bejegyzést nem készítünk.
