# v1.26.0 – teljes kiadás, második, v1.25-re épülő kör

A v1.25 valamennyi A–J javítása megmaradt. A v1.26 tovább finomította a már létező szakaszmenü és a meglévő média-/témarendszer szélső eseteit:

- A: a mobil böngésző vizuális nézetének eltolásával számolt fejléc; elforgatásra, betűbetöltésre és fejlécméret-változásra ismételt ellenőrzés.
- B: összecsukott tartalomszakaszokra ugrás két képkockával későbbi, helyes célpozícióval.
- C: régebben rögzített details-nyitási esemény már nem okoz görgetési ugrást.
- D: a térképes iframe a betűtípusok betöltése és pageshow után is méretet küld.
- E: a rendszertéma régebbi Safari `addListener` eseménymódját is támogatjuk.
- F: a korábban bevezetett ismétlődő címszöveg- és kontextusazonosítás változatlanul működik.
- G: az újrarajzolt szakaszlistában az aktív elemhez is visszaállhat a fókusz.
- H: rövid aloldalnál a rejtett navigációból visszaadjuk a fókuszt; az alacsony kijelzőmagasságú mobil listamagassága pontosabb.
- I: 2G/slow-2G vagy offline kapcsolatnál nem indítunk galériás előtöltést.
- J: a diagnosztika a kötelező indító- és JSON-fájlok manifestbeli meglétét is ellenőrzi.

## Teljes teszteredmény

- **15/15** futtatóprogram sikeres (`TESZTNAPLO_V1_26.md`).
- Célzott, kiterjesztett teszt **21/21**; mobilos szakaszellenőrzés **46/46**.
- Statikus HTTP-ellenőrzés **1116/1116**, köztük 65 regisztrált oldal és 628 médiaállomány.
- Hibakeresés: az időszakos HTTP-próbakliens `undici` kapcsolatkezelési megakadását a kapott válaszok teljes kiolvasásával és két párhuzamos kérésre korlátozással javítottuk. Az újrafuttatás hibamentes.
- A helyi Chromium továbbra sem indítható az `Operation not permitted` korlátozás miatt; ezt nem pótoltuk kitalált böngészős eredménnyel.
- Minden korábbi projektfájl és funkció megmaradt; a statikus FTP-tárhely az egyetlen szükséges futtatókörnyezet, a Bootstrap CDN-kapcsolatot továbbra is igényli.
