# Csanádi weboldal – v1.30.0 teljes kiadási és tesztbeszámoló

**Dátum:** 2026. november 16. (Europe/Budapest)  
**Kiindulás:** teljes v1.27.0 forráscsomag  
**Átadás:** három önállóan teljes, egymásra épülő ZIP; a v1.30.0 a végső kiadás  
**Korlát:** kizárólag meglévő funkciók javítása, új webhelyfunkció nélkül, statikus FTP-kompatibilitással.

## 1. Pontosan mi volt a feladat?

- Az A+B+C+D+E+F+G+H+I+J már meglévő funkciócsoport **mindegyikét három egymásra épülő teljes kiadásban** javítani.
- A korábbi hibákat, beleértve a mobilos témát, a térképes aloldal szakaszmenüjét, a váratlan görgetést és a régi „Lap tetejére” gombot, ellenőrizni.
- Minden kiadáshoz célzott regressziót, a végső kiadáshoz teljes rendszerellenőrzést, hibakeresést és tartós tesztnaplót készíteni.
- Megőrizni a statikus FTP-futtathatóságot, a korábbi `tools/` kezelőket és az `assets/` adatkészletet; az előzőleg előírt sorrendtől eltérő médiabővítést nem indítani.
- A végén letölthető teljes ZIP-et és részletes eredménybeszámolót átadni.

## 2. Három egymásra épülő, TELJES kiadás

| Funkció | v1.28.0 – első teljes kör | v1.29.0 – második teljes kör | v1.30.0 – harmadik teljes kör |
| --- | --- | --- | --- |
| A Mobilos menü | Valóban látható fejléc, hibás viewportérték kezelése | Billentyűzet alatti szakaszsáv elrejtése | Iframe-fókusz és szerkeszthető mezők kezelése |
| B Szakaszugrás | Elavult képkockás ugrás érvénytelenítése | Rejtett célpont figyelmen kívül hagyása | Tényleges görgetési tartományra korlátozás |
| C Olvasási hely | Oldalváltási állapot törlése | Késleltetett fold-visszagörgetés érvénytelenítése | Közben végzett kézi görgetés tiszteletben tartása |
| D Térképes aloldal | Iframe gyökér- és törzsméret megfigyelése | Elhagyott útvonal üzenetfigyelőjének eltávolítása | Csak aktív, kapcsolt iframe-üzenet és útvonalhoz tartozó görgetés fogadható el |
| E Sötét/világos téma | Memóriában megőrzött kézi témaválasztás | Friss JS/CSS-verzióhivatkozások | Tárolásblokkolásnál a szülő témájának átvétele, dinamikus mobil böngészőszín |
| F Szakaszazonosítók | Ütközésnek ellenálló, cím-alapú stabil azonosítók | Egyedi címnél a tartalomszerkesztés nem változtat ID-t | Azonos cím/bevezető esetén több bekezdés alapú megkülönböztetés |
| G Élő JSON-frissítés | Ismétlődő címsorok szövegkörnyezete | Konzisztens címkövetés a tartalmi változásoknál | Ékezet- és kisbetűfüggetlen olvasási hely |
| H Hozzáférhetőség | Szakaszszám felolvasása | Külső kattintás nem lopja vissza a fókuszt | Mobil szakaszpanel valódi címének ARIA-összekötése |
| I Galéria | Rejtett lap előtöltésének megszüntetése | Bezáráskor függő betöltések elengedése | Előtöltési korlátból kikerülő kép forrásának felszabadítása |
| J Diagnosztika | Hibás erőforrásnév biztonságos kezelése | Sikertelen manifest újbóli lekérése | Aszinkron versenyhelyzetből eredő elavult eredmény kizárása |

Minden szakaszban a *teljes* honlap forrására épült a következő, nem részleges patchekből újraépített kísérlet. A végső ZIP tartalmazza az előző két kör változásnaplóit és tesztnaplóit is.

## 3. A hibakeresés során külön feltárt hibák és javításaik

1. **v1.28 tesztfuttató:** az első naplófájl neve egy korábbi kiadáshoz tartozott. Helyreállítottuk az eredeti, megőrzendő előzményfájlt; a naplókat a megfelelő kiadásnévre irányítottuk.
2. **Elavult cache-paraméterek:** a régi JS/CSS-hivatkozások egy része v1.27-es és v1.24-es azonosítót használt. A három érintett kiadás aktív modulhivatkozásait a tényleges kiadási verzióhoz igazítottuk.
3. **Mobilos témakezelés:** tárolásblokkolás esetén a beágyazott útmutató korábban az operációs rendszer témájára eshetett vissza. Most azonos eredetű szülőoldalon kiválasztott témát is figyelembe veszi.
4. **Térképes iframe:** a régi oldalváltási üzenetfigyelő és egy késve érkező görgetési parancs már nem módosíthatja az új útvonal állapotát.
5. **Dokumentumtár – tényleges böngészőkonzol-hiba:** a kézikönyv két régebbi verzióleírása 517, illetve 502 karakteres volt az 500-as mezőkorlát mellett. Ezeket a tartalom megőrzésével rövidítettük. A `validateVersion` szigorú ellenőrzését nem enyhítettük. A helyi böngészőben ezután **19 dokumentumkártya töltődött be, dokumentumtári hiba nélkül**.
6. **Galéria:** a hatos előtöltési korlátból kieső képet a JavaScript-térképből való törlés mellett ténylegesen leállítjuk.
7. **Diagnosztika:** ha egy régebbi hálózati válasz később érkezik, az nem írja felül az újabb, érvényes mérés eredményét.

## 4. Reprodukálható automatizált ellenőrzések

| Teljes kiadás | Ellenőrző programok | Célzott új tesztek | Statikus HTTP-ellenőrzések | Eredmény |
| --- | ---: | ---: | ---: | --- |
| v1.28.0 | 15/15 | 39/39 | 1136/1136 | Sikeres |
| v1.29.0 | 15/15 | 49/49 | 1146/1146 | Sikeres |
| v1.30.0 | **17/17** | **59/59** | **1158/1158** | **Sikeres** |

A végső körben további **48/48 mobilregressziós**, **12/12 témaszinkron-teszt**, **2/2 tényleges aszinkron diagnosztikai versenyteszt** és a **19 dokumentum 35 verziótörténeti elemének** validálása is sikeres volt.

Az egyes tesztek pontos futásideje, saját kimenete és hibastátusza a következő naplókban található:

- `dokumentacio/TESZTNAPLO_V1_28.md`
- `dokumentacio/TESZTNAPLO_V1_29.md`
- `dokumentacio/TESZTNAPLO_V1_30.md`

Az ellenőrzés a kezdő HTML-től, a Bootstrap CDN-hivatkozáson, a kötelező JSON-szerkezeten, az összes publikált oldal-JSON-on, menün és hivatkozáson át a `tools/` adateszközeinek régebbi regressziójáig terjedt. A HTTP-tesztek a helyi statikus kiszolgáló tényleges válaszait vizsgálták.

## 5. Böngészőben ténylegesen elvégzett helyi próbák

- A v1.30.0 helyi előnézete betöltött; a **kapunyitás lejátszása és lezárása** után a kezdőlap használható volt.
- Az asztali főmenü kinyílt, az **Oktatás, felvételi** almenü és a **Felvételi** aloldal megnyílt.
- A `#/megkozelites-es-tanulas/terkep` útvonalon a beágyazott útmutató és a tíz korábban létező rész megjelent. A térkép külső betöltését hozzájárulás nélkül nem indítottuk.
- A **Sötét** megjelenítési mód az útvonalváltáson át megmaradt; a szülő DOM, valamint a beágyazott iframe DOM egyaránt `dark` állapotot mutatott.
- A régi **„Lap tetejére”** feliratú külön gombot a vizsgált oldalak DOM-jában nem találtuk; a mobilos szakaszmenü megléte ellenőrizhető volt.
- A lábléc **Honlapdiagnosztikája** valóban megnyílt, v1.30.0 verziót és fájlméretet jelenített meg.
- A dokumentumtár a hiba javítása után **19 kártyát**, üres hibajegyzéket és a sötét témát mutatta.
- A böngészőbővítmény saját metaadat-konzolhibái nem a honlapból származnak. Az örökölt dokumentumtári konzolhiba tényleges alkalmazáshiba volt, és javítottuk.

**Tesztkorlát:** a beágyazott előnézetben végzett interaktív próbák asztali böngészőre vonatkoztak. Fizikai iOS-/Android-eszközös, teljes vizuális WCAG-audit, valamennyi aloldalon végzett manuális bejárás, külső térképszolgáltató hozzájárulás utáni működése, illetve élő szerveres mindenútvonalas terhelésteszt **nem igazolt**. A szimulált mobilos és statikus vizsgálatok nem helyettesítik ezeket.

## 6. Megőrzés, üzemeltetési feltételek, kiadási korlátok

- **65 publikált oldal**, **628 fizikai média- és dokumentumállomány**, ezen belül **87 QR-állomány** maradt; a katalógus-egyeztetés nem talált hiányt, árvafájlt vagy hash-eltérést.
- A honlap továbbra is statikus HTML/CSS/JS/JSON projekt; működéséhez nem kell PHP, Node.js szerver, GitHub Actions vagy GitHub Pages-specifikus API.
- A Bootstrap 5.3.9 továbbra is verzióhoz kötött külső CDN-függőség, a csomag nem tartalmaz helyi Bootstrap-példányt.
- A külső hivatkozások és a hozzájáruláshoz kötött OpenStreetMap internetkapcsolatot igényelnek; az oldal többi statikus tartalma FTP-n kiszolgálható.
- A webhelyet **nem töltöttük fel** FTP-re vagy GitHub Pages-re. A ZIP a kiadásra előkészített, ellenőrzött teljes csomag, nem bizonyíték az aktuálisan publikált verzióra.
- A reggel 06:00-ra kért, külön ütemezett élőwebhely-teszt eredménye **csak akkor** kerülhet a honlapdiagnosztikába, ha tényleges friss napló áll rendelkezésre. A jelen kiadásba nem állítottunk elő vagy írtunk be képzelt élővizsgálati eredményt.
- A felhasználó által meghatározott sorrend szerint az eszköz- és médiakezelő működésének javítása megelőzi a külön igényelt, körülbelül hatszoros médiaállomány-bővítést; ilyen médiabővítés nem történt.

## 7. További tíz JAVÍTÁSI javaslat – új funkció nélkül

1. A főmenü és a mobil harmonikamenü törésponti méretváltozásainak részletes, többciklusú stabilitástesztje.
2. A kézzel választott sötét téma megőrzésének részletes iOS Safari–Android Chrome összehasonlítása.
3. A térképes iframe magasságüzeneteinek további kései-válasz és oldalváltási regressziója.
4. A hosszú aloldalak szakaszmenüjének pontos célpont- és fejléc-eltolási ellenőrzése.
5. Az összecsukható blokkok fókuszvisszaadásának és képernyőolvasós címezésének finomítása.
6. A meglévő kereső keresési/szűrési állapotának Vissza–Előre navigációs tesztelése.
7. A dokumentumtár verziótörténeteinek és PDF-előnézetének teljes adatséma-vizsgálata.
8. A galéria képelőtöltésének lassú hálózatos és bezárás utáni erőforrás-ellenőrzése.
9. Az élő JSON-frissítés azonos című szakaszainak megőrzési és ütközési tesztje.
10. A lábléci diagnosztika hibás, részleges és párhuzamos manifestválaszainak további ütközéstesztje.

## 8. Kiadási ellenőrzőpontok

**Teljes kiadási archívumok:** `csanadi_website_v1_28_0.zip` → `csanadi_website_v1_29_0.zip` → **`csanadi_website_v1_30_0.zip`**. Mindegyik önállóan teljes; nem három különbségi javítócsomag.

**Végső teljes forrás:** `csanadi_website_v1_30_0.zip` – `index.html`, `script.js`, `css/`, `js/`, `json/`, `assets/`, `tools/`, az összes korábbi és mostani `dokumentacio/` napló, valamint a SHA-256 ellenőrzőösszegeket tartalmazó `release-manifest.json`.

**Új funkciók:** 0. **Meglévő funkciók elhagyása:** 0 szándékos eltávolítás. **Kiadás telepítése:** a felhasználó feladata; ZIP teljes tartalmát a cél szerver publikus gyökerébe kell másolni.
