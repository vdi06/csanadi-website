# Csanádi v1.28.0 – első teljes A–J javítási kör

**Alap:** a v1.27.0 teljes forráskészlete. A 65 regisztrált oldal, 628 médiaállomány, meglévő szerkesztő- és segédoldalak változatlanul megmaradtak. Nincs új önálló felhasználói funkció.

- **A – Mobil méretezés:** ha a `visualViewport.height` nulla vagy hibás, a rendszer az ablakkal számol; csak valóban kirajzolt szakaszt jelöl aktívnak. A megjelenített fejléc magasságát CSS-változóként is frissíti.
- **B – Pontos ugrás:** gyors egymás utáni szakaszváltáskor az előző, késleltetett ugrás érvényét veszti; a közvetlen horgony is követi a tényleges fejlécméretet.
- **C – Összecsukható részek:** aloldalváltáskor törlődnek a megmaradt, késleltetett görgetési és nyitási rögzítések.
- **D – Megközelítési iframe:** a gyökérelem és a törzs méretváltozását is figyeli; nem csak a betűkészlet és a telefon nézetváltozását.
- **E – Téma:** ha az eszköz megtiltja a böngészőhelyi tároló olvasását, a korábban kézzel beállított téma megmarad az aktuális oldalon ahelyett, hogy automatikusra állna vissza; a főoldalon, az útmutatóban, a megközelítési oldalon és a segédoldalakon egységes elv érvényes.
- **F – Címazonosítók:** hosszú, azonos kezdetű címek sem ütköznek pusztán a cím rövidítése miatt; a szakasz szöveges környezetéből is képződik rövid azonosító.
- **G – JSON-frissítés:** ismétlődő címeknél a szakasz szöveges kontextusa alapján is visszaállítható az olvasási hely, ha a tartalom elé új szakasz kerül.
- **H – Felolvasás:** a mobilos szakaszmenü a kiválasztott elem sorszámát és a teljes elemszámot is közli; az aktív billentyűzetes fókusz a korábbi módon megmarad.
- **I – Galéria:** a háttérbe tett böngészőlap nem indít új kép-előtöltést, és a fölösleges gyorsítótárat elengedi.
- **J – Diagnosztika:** sérült százalékos URL-kódolású erőforrásnév esetén is megmarad az állapotkijelzés.

## Ellenőrzés

- Reprodukálható teljes futtató: **15/15 sikeres**.
- Kibővített jelenlegi hibajavítási teszt: **39/39 sikeres**, benne tényleges JavaScript-futásos, hibás `localStorage`- és URL-próbákkal.
- Mobil szakaszmenü teszt: **48/48 sikeres**.
- A helyi grafikus Chromium engedélyhibája miatt valódi vizuális böngészős végteszt nincs igazolva; a programozott ellenőrzések nem helyettesítik ezt.
- A statikus HTTP-futtató és a teljes leltár tételes kimenete a `TESZTNAPLO_V1_28.md` naplóban szerepel.

**Tesztprogramjavítás:** az új teljes regressziós futtató saját `TESZTNAPLO_V1_28.md` fájlba ír. A korábbi v1.27-es történeti tesztnapló az eredeti kiadásból változatlanul vissza lett állítva.
