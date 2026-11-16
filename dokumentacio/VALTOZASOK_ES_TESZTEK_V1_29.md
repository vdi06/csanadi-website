# Csanádi v1.29.0 – második teljes A–J javítási kör

**Alap:** a kész és teljes v1.28.0 forrás. A korábbi A–J módosítások, 65 tartalmi oldal, 628 médiaállomány, tools/ kezelők és összes korábbi napló megmaradt.

- **A – Mobilmenü:** ha mobilon gépelés közben a virtuális billentyűzet jelentősen csökkenti a használható képernyőt, a szakaszsáv átmenetileg eltűnik, hogy ne takarja a mezőt. A fókuszváltások és a viewport mérete újraszámoltatják a láthatóságot.
- **B – Szakaszhorgonyok:** a rejtett, valóban nem renderelt célpontok nem okozhatnak hibás görgetési ugrást.
- **C – Összecsukható részek:** egy következő kattintás vagy oldalváltás érvényteleníti a korábbi, még függőben lévő pozíció-visszaállítási képkockát.
- **D – Megközelítés:** a térképes iframe régi `message` eseményfigyelőjét a SPA-aloldal elhagyásakor eltávolítjuk; nem marad felesleges, korábbi nézetre mutató kezelő.
- **E – Témavisszaállítás:** a változtatott témakezelő és diagnosztikai modulok friss verzióparaméterrel töltődnek, így böngésző-gyorsítótárból sem érkezik a régi, hibás működés.
- **F – Stabil azonosítók:** egyedi címes szakasznál a szövegtörzs átírása már nem változtatja meg a szakaszazonosítót; azonos című több szakasznál továbbra is van megkülönböztetés.
- **G – JSON-tartalomfrissítés:** a szakaszonkénti kontextusazonosítás megmaradt, a tartalmilag változó, de címe szerint azonos szakaszokat pontosabban követi a navigáció.
- **H – Billentyűzet/fókusz:** az asztali szakaszmenü külső kattintásra történő bezárása nem lopja vissza a fókuszt a menüindítóra.
- **I – Galéria:** a bezárás és a lap háttérbe helyezése már a függőben lévő képbetöltési hivatkozásokat is felszabadítja, nem csak a JavaScript-gyorsítótárat üríti.
- **J – Diagnosztika:** ha a fájlmanifest első lekérése elbukott, a meglévő panel következő megnyitásakor újrapróbálja az ellenőrzést.

## Külön azonosított hiba: böngésző-gyorsítótár

Az első kör után végzett ellenőrzés feltárta, hogy néhány módosított JS- és CSS-modul importja régi, v1.27-es vagy v1.24-es gyorsítótár-azonosítót használt. Javítva a mobil szakaszmenü CSS-énél, a szakaszmenü JavaScriptjénél, a teljesítménydiagnosztikánál és a kézikönyv témamoduljánál. A v1.28.0 forrás hivatkozásait utólag is kijavítottuk, mielőtt a v1.29.0 teljes csomagot lezártuk.

## Ellenőrzés

- A kibővített, mostani körre vonatkozó teszt: **49/49 sikeres**, beleértve a virtuális billentyűzet szimulációját és a stabil szakaszazonosító tényleges futtatását.
- Korábbi mobil szakaszmenü-regresszió: **48/48 sikeres**.
- Teljes regressziós napló: `TESZTNAPLO_V1_29.md`; az első kör hibajavításait és a 15 teljes tesztprogramot ismét vizsgálja.
- A helyi grafikus Chromium a korábban tapasztalt engedélykorlát miatt külön, nem igazolt tesztterület. A statikus FTP-kiszolgálás követelménye változatlan.
