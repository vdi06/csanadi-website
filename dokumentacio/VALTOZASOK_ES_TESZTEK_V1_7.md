# Csanádi weboldal – v1.7.0 kiadási beszámoló

**Kiadás:** `csanadi website v1.7.0.zip`  
**Alap:** a korábban lezárt v1.6.0 teljes helyi csomag  
**Dátum:** 2026. november 16.  
**Terjesztés:** statikus HTML/CSS/JavaScript/JSON, GitHub Pages tesztkörnyezet és későbbi hagyományos FTP-tárhely; automatikus éles feltöltés nélkül.

## Mit kért a megrendelő?

A következő **A+B+C+D fejlesztési irányt együttesen** kell kezelni, a korábbi feladatok sorrendjének megtartásával. Elsődlegesen a `tools/` segédoldalak egységes, prémium megjelenését és az `assets/` állománykezelés valódi használhatóságát kell ellenőrizni és kiegészíteni. A médiatár közel hatszoros későbbi bővítését **csak ezek lezárása után**, jóváhagyott, ellenőrzött forrásokkal lehet elkezdeni.

## A – A jelenlegi állapot és a teljes kiadás ellenőrzése

- A **65 regisztrált SPA-aloldal** továbbra is betölthető, a szerkezet JSON-fájlokra hivatkozik.
- A kiadás a működő címen jelenleg **nem** látható: a megnyitott GitHub Pages-példány még `v1.2.0` szkriptet szolgáltatott, az új ZIP-et nem telepítettük. A régebbi éles oldal szemrevételezése nem tekinthető a v1.7.0 megjelenítési tesztjének.
- Megmaradt a legfeljebb háromszintű navigáció, a kompakt aloldalfejléc, a térképes megközelítés és a korábban jóváhagyott kezdőoldal.
- Az összes hivatkozott **helyi HTML-fájl és erőforrás** megtalálhatósága, a JSON-parszolás, a JavaScript-szintaxis és a regisztrált útvonalak helyi automatikus ellenőrzése sikeres.
- A vizsgált, ténylegesen működő URL-ek között **0** hivatkozás mutatott a tiltott `csanadi-bp.edu.hu` régi webhelyre. A QR-indexben egyetlen cél URL sem erre a domainre mutat.

## B – Segédoldalak, egységes stílus és hozzáférhetőség

- A korábban elkészült, **13 segédoldalt** lefedő egységes sötétkék–fehér–arany megjelenés és téma-váltás megmaradt.
- A közös betöltőszkript automatikusan elhelyezi a **„Ugrás a segédprogram tartalmára”** billentyűzetes elérési linket, amennyiben az oldalon van `main` elem.
- A navigáció aktuális elemét `aria-current="page"` jelöli, ahol van navigációs menü.
- A közös CSS kiegészült a fókusz és a billentyűzetes ugrás megjelenésével, az érintésbarát minimumokkal és az ellenőrzést igénylő médiák látható jelölésével.
- **Későbbi aloldali pontosítás:** a teljes fejlécben a menünyitó egyszerű **„Menü”** feliratú gomb, nem hamburgerikon. Lefelé görgetve a kompakt fejlécben a korábbi menüfelirat és az iskola neve eltűnik; **vízszintesen középen az eredeti iskolai címer lesz a kattintható menünyitó**. A keresés és a téma ikonja elérhető marad. A kezdőoldal saját indítógombja nem változott. A teljes aloldali fejlécben a bal oldali címer továbbra is a kezdőoldalra vezet; kompakt nézetben a középen álló címer a főmenüt nyitja meg, amelyből a kezdőoldal elérhető.
- A kapcsolódó CSS/JS erőforrások verzióparamétere `v1.7.0`-ra módosult, így a böngésző korábbi gyorsítótárából származó fájlok kevésbé keverednek az új kiadással.

## C – Teljes `assets/` kezelés, biztonsági kapuk és valós adatú próba

- A **628** fizikai állomány mind szerepel a médiaállomány-katalógusban: 500 kép, 12 videó, 19 dokumentum és 97 grafika, utóbbiból 87 QR-kód.
- Az adminfelületen új **„Ellenőrzés”** szűrő segíti a jogállás, a hiányzó alternatív szöveg és a hiányzó vagy hibás SHA-256 állományazonosító keresését.
- Az ellenőrizendő jogállású elemek figyelmeztetést kapnak a listában; a kiexportálható CSV-jegyzék tartalmazza a jogállás mezőt és az ellenőrzési megjegyzést.
- Az újonnan közzéteendő kép/grafika alternatív szöveget és **kifejezett szerkesztői jogellenőrzési nyilatkozatot** igényel. Ez csak munkafolyamat-ellenőrzés: nem igazol tényleges felhasználási jogosultságot.
- A korábban publikált média puszta metaadatszerkesztése nem regisztrál újabb, véletlenszerű galéria-bejegyzést.
- Kilépéskor a szerkesztő figyelmeztet az **exportálatlan változtatásokra**.
- A korábbi projektindexből **8 használatban lévő JSON-fájl hiányzott** (köztük a `qr-index-22.json`); ezek bekerültek a hivatkozás- és módosításkövetésbe. A 94 JSON-forrás együtt kezelhető. A projektindex saját fájlja szándékosan kimarad az önreferenciázás elkerülésére.
- Valós projekt-JSON-on alapuló helyi próbával ellenőriztük, hogy egy QR SVG átnevezése a QR-index kapcsolódó hivatkozásait is módosítja, valamint egy új médiatétel létrehozása, metaadatainak jóváhagyása, galériába vétele, törlésre jelölése és visszavonása következetes eredményt ad az előkészített ZIP-állománylistában.
- A ZIP-export és az engedélyezett böngészőben használható helyi mappafrissítés továbbra is **kliensoldali**; nincs PHP, Node-szerver vagy GitHub Actions-függőség. A valódi FTP-re törlés / feltöltés külön felhasználói művelet marad.

## D – Médiajogok, hiányok, a későbbi bővítés előkészítése

Létrejött két géppel feldolgozható auditfájl:

- `dokumentacio/TARTALMI_MEDIA_AUDIT_V1_7.json`
- `dokumentacio/TARTALMI_MEDIA_AUDIT_V1_7.csv`

| Megállapítás | Darab | Értelmezés |
|---|---:|---|
| Katalógusban szereplő assets-fájl | 628 | Mind fizikailag létezik |
| Médiatár rekord | 114 | Nem azonos az önálló fotók számával |
| `pending` jogállású média | 29 | Intézményi forrás- és jogosultságellenőrzést igényel |
| `preview-only` jogállású média | 4 | Nyilvános közzététel előtt külön döntés szükséges |
| Hiányzó alt-szövegű kép/grafika | 233 | A QR-kódok és dekoratív ábrák esetén szemantikai felülvizsgálat kell |
| Publikáltnak jelölt elem közvetlen médiatár-jogállás nélkül | 35 | Nem bizonyítja a jog hiányát; egyeztetendő adatminőségi tétel |
| Audit-lista összes sora | 301 | A kategóriák átfedhetnek; nem 301 egyedi médiatétel |

Külön készült a `dokumentacio/MEDIA_BOVITESI_TERV_V1_7.md`. A közel hatszoros médiaállomány-bővítés **még nem kezdődött meg**, új generált tanulói portré, valós személynek látszó eseményfotó vagy jogilag nem tisztázott anyag nem került automatikusan a webhelyre. A bővítés előtt a források, licenc- és adatvédelmi helyzet, alt-szövegek és a ténylegesen önálló médiatételek számának ellenőrzése kötelező.

## Teszteredmények

| Vizsgálat | Eredmény |
|---|---|
| Átfogó statikus kiadási ellenőrzés (`test-release-v1-7.js`) | **37/37 sikeres** |
| Médiakezelő regressziós teszt (`test-media-manager-v1-6.js`, a v1.7.0 kódra futtatva) | **7/7 sikeres** |
| Valós adatokkal lefuttatott exportelő-készítési próba (`test-media-export-v1-7.js`) | **6/6 sikeres** |
| Fizikai fájllista és médiakatalógus egyezése (`reconcile-assets-catalog.js`) | **628/628, hiány 0** |
| QR-átnevezés kapcsolódó JSON-hivatkozásokkal | **Sikeres** |
| JSON-fájlok beolvasása, JavaScript-szintaxis | **Sikeres** |
| Regisztrált SPA-útvonalak | **65/65** |
| Régi iskolai domainre mutató működő hivatkozások a vizsgált forrásokban | **0** |

A 31 korábbi megjelenési szabály 65 oldalas mátrixa megtalálható a `dokumentacio/ALOLDALAK_31_SZABALY_ELLENORZES.csv` fájlban. **55 `H` státusz** és a csak részben rendelkezésre álló korábbi részletszabályok miatt ez nem jelent teljes aloldalankénti, vizuálisan is igazolt megfelelőséget.

## Nyitott vagy külső feltételtől függő feladatok

1. **Élő böngészős v1.7.0 ellenőrzés:** a friss ZIP-et először tesztkörnyezetbe kell feltölteni, majd asztali és mobil nézetben kipróbálni a teljes/kompakt fejlécet, a **középre kerülő címerrel nyitható menüt**, a keresést, gombokat, térképet, fókuszt és a kilépésvédelmet. A rendelkezésre álló helyi böngészőmotor rendszerengedély miatt nem indult; ezért képernyőképes és valódi kattintásos v1.7 teszt nem igazolható.
2. **Médiák jogi/tartalmi jóváhagyása:** az auditban kiemelt 301 tétel intézményi döntéseket, illetve a források ellenőrzését kívánja. A rendszer nem adhat automatikusan felhasználási jogot.
3. **QR-célok FTP-domainváltáskor:** a jelenlegi QR-kódok a GitHub Pages tesztcímekre vezetnek; az intézményi FTP-re átálláskor a QR-képeket és a célcímeket újra kell generálni. A tiltott régi iskolai webhelyre most sem irányítanak.
4. **31 szabály tételes véglegesítés:** a meglévő mátrixban szereplő 55 hiány/eltérés (`H`), és az ismeretlen pontos előírások külön kézi auditot követelnek.
5. **A kb. hatszoros médiabővítés:** továbbra is későbbi, külön engedélyezendő kiadás; nem része a v1.7.0-nak.

**Megőrzött korlátok:** nincs háttérben futó szerver, adatbázis vagy GitHub Actions-függőség; a Bootstrap csak verzióhoz kötött CDN-ről töltődik; meglévő dokumentumok nem vesznek el; nincs FTP- vagy GitHub-feltöltés a ZIP elkészítésével.
