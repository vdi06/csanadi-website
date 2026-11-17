# Csanádi Árpád Sportiskola – v1.39.8 átadási és tesztjegyzőkönyv

**Dátum:** 2026. november 17.  
**Alap:** a teljes v1.39.7 kiadás  
**Választás:** **B + C + D** – mélyebb tartalmi és szerkesztői ellenőrzés, médiatár bővítése, kereső és JSON-tartalomkezelés fejlesztése.  
**Átadás:** teljes, statikus FTP-kompatibilis ZIP, nyilvános feltöltés nélkül.

## 1. Elkészült munkák

### B – 71 oldal mélyebb minőségi ellenőrzése és célzott javítás

- A `tools/audit-editorial-v1-39-8.mjs` mind a **71** oldalt külön minőségi szempontok szerint ellenőrzi: cím, összefoglaló és SEO-leírás hossza; kereshető szöveg, belső linkek, médiaazonosítók, publikációs státusz, ismétlődő blokkazonosítók és időérzékeny témák szerkesztői forrásigénye.
- A részletes, géppel feldolgozható eredmény a `dokumentacio/TARTALMI_MINOSEG_V1_39_8.json`, a szerkesztői feladatlista a `dokumentacio/TARTALMI_MINOSEG_V1_39_8.csv` fájlban található.
- A mélyebb vizsgálat **128 globálisan ütköző blokkazonosító-előfordulást** talált. A `tools/migrate-global-block-ids-v1-39-8.mjs` **62 oldalon** biztonságosan egyedi azonosítókat adott nekik. A változások tételes naplója: `dokumentacio/BLOKK_AZONOSITO_MIGRACIO_V1_39_8.json`. **459 egyedi blokkazonosító maradt, nulla globális ütközéssel.** Az oldalazonosítók, útvonalak és szövegek nem változtak; a megváltozott oldalakon a tartalmi revízió eggyel nőtt, az oldalindex életciklus-adataival együtt.
- A tartalmi audit **0 szerkezeti hibát**, de **113 szerkesztői figyelmeztetést** mutat: 47 rövid oldalszintű összefoglaló és 66 rövid SEO-leírás. Ezen felül **23 oldalon** javasolt külön kézi forrás-/érvényességellenőrzés. Ezek **nem bizonyított tényhibák**; automatikus, forrás nélküli iskolai tartalomátírás nem történt.

### C – Médiatár ellenőrzött bővítése

- **20 különböző sport-, tanulási és közösségi témához** összesen **60 önálló SVG-fájl** készült: sötét, világos és kontúros változatok. Saját, sematikus, méretezhető vektorillusztrációk; **nem valódi iskolai fényképek**.
- Az `assets/media/illustrations/` mappában levő grafikák fájlmérete és SHA-256 lenyomata bekerült a `json/assets-inventory.json` teljes nyilvántartásba. A **628** korábbi állomány megmaradt, az összes nyilvántartott állomány **688**.
- A `json/mediatar.json` **20 új, globálisan egyedi `media:tematika-*` azonosítót** kapott, három változattal és alt-/címadatokkal. A regisztrált médiaazonosítók száma **134**.
- Az új vektorképeket a meglevő média-/dokumentumkezelő is felismeri, az ellenőrzési és exportfolyamatok a bővített állománylistát használhatják.
- A generátor: `tools/build-editorial-graphics-v1-39-8.mjs`. A 60 SVG szerkesztői státusza **intézményi jóváhagyásra váró**; éles, hivatalos iskolai felhasználásuk előtt vizuális és jogi jóváhagyás szükséges.
- A korábbi hatszoros, **egyedi** kép-/videó-/dokumentum-/grafikaállomány-bővítés **nem teljesült**: annak tervezési kerete további **940** jóváhagyott, egyedi tételt jelöl viszonyításként. A 60 új SVG 20 különböző illusztráció három megjelenési változata, nem 60 eredeti fotó vagy hivatalos dokumentum. A frissített keret a `dokumentacio/MEDIA_BOVITESI_KERET_V1_9.json` és `.csv` fájlokban olvasható.

### D – Kereső és tartalomkezelés

- Az idézőjelezett magyar kifejezések (például `"nyílt nap"`) egyetlen keresési egységként kezelhetők. A keresés legfeljebb nyolc egységet, összesen 160 karaktert dolgoz fel, a bemenetet normalizálja és az ismétléseket eltávolítja.
- Új, ékezetfüggetlen és kétirányú szinonimapárok segítik a nyílt nap, gimnázium, csengetési rend, étkezés, tanév és könyvtár témák megtalálását.
- A gépelés utáni keresés 90 ms késleltetést kapott, hogy a DOM ne rajzolódjon újra minden gyors leütésre. Enter lenyomásakor a függő keresés azonnal elkészül; a törlés és a javaslatválasztás a várakozó időzítőt is megszünteti.
- A találatlista hozzáférhető neve minden kereséskor helyesen frissül, üres kereséskor az alapértelmezett megnevezés visszaáll. A korábbi magyar elgépelés-keresés megmaradt, a feldolgozott cím-/címkeszavak ismétlődéseit kiszűrjük.
- A globális blokkazonosító-migráció további JSON-adatintegritási javítás: a változó oldalak tartalmi revízióját az oldalindexszel együtt kezeli.

## 2. Tényleges teszteredmények

| Teszt | Eredmény |
|---|---:|
| Új B+C+D céltesztek, 60 SVG hash/biztonság/jogállás, idézőjeles keresés, migráció és audit | **14/14** |
| Korábbi v1.39.7 hibakezelési/SEO-/médiatesztek | **22/22** |
| A 71 oldal, JSON-ok és 688 média alapintegritása | **1008/1008** |
| Helyi HTTP-kiszolgálás: 71 oldal, 688 média és egyéb erőforrások | **1360/1360** |
| Nyolc oldalsablon és útvonalhálózat | **14/14** |
| Régi v1.39.1 funkcionális regresszió | **7/7** |
| Média-/dokumentumkezelő | **11/11** |
| Mobil/asztali statikus hozzáférhetőség | **8/8** |
| Főmenü modális és fókuszszimuláció | **10/10** |
| HTML-szemantikai ellenőrzés | **17/17** |
| Korábbi tartalomtesztek | **16/16** |
| Keresőindex | **74/74** |
| Világos/sötét témaszinkron | **12/12** |
| ZIP-kezelő motor | **5/5** |
| A 60 SVG XML-szerkezete | **60/60** |
| Blokkazonosító-migráció második futtatása | **változás nélkül** |

A régi regressziós programokban még előforduló v1.39.7 cache-azonosító és 628-as alapdarabszám elvárások a v1.39.8 kiadáshoz igazodtak. A korábbi 628 állomány továbbra is szerepel a katalógusban; új állományokat tettünk hozzá.

**A végleges fájlonkénti manifest és a ZIP ellenőrzése a csomagoláskor készült**; az eredményét a kiadási `release-manifest.json` és a hozzá tartozó ellenőrző program rögzíti.

## 3. Mi maradt nyitott?

- **Valódi böngészős teszt:** nincs sikeresen lezárt teljes kör. A honlap még nincs engedélyezett teszt-URL-en, a korábbi helyi böngésző-hozzáférést a környezet biztonsági szabályzata elutasította. Nem történt megkerülési kísérlet.
- **Nem igazolt:** Chrome/Edge/Firefox/Safari valós eszközös megjelenés, érintés és billentyűzet valódi fókuszpróbája, NVDA/VoiceOver/TalkBack, Lighthouse és mobilhálózati teljesítmény, WCAG 2.2 AA teljes megfelelőség.
- **Tartalmi hitelesség:** a 113 minőségi jelzés és 23 kiemelt szerkesztői ellenőrzés intézményi feldolgozást kíván. Hivatalos felvételi, vizsga-, tanév- és kapcsolattartási tények automatikus kiegészítése nem történt.
- **Médiajogok:** a regisztrált 134 médiából 49 `pending`, 1 `user-provided` és 84 nem a jelenlegi két kategóriába sorolt. A nem igazolt és jóváhagyásra váró anyagok **nem tekinthetők automatikusan éles közzétételre engedélyezettnek**. Az új grafikai fájlok is intézményi vizuális elfogadást igényelnek.
- **Hatszoros mennyiségi bővítés:** nem állítjuk, hogy a korábban tervezett körülbelül hatszoros, egyedi médiaanyag-bővítés megvalósult. Ehhez valódi, jóváhagyott forrásfájlok és személyiségi/jogi hozzájárulások szükségesek.
- **SEO:** a fejlesztői `noindex,nofollow` beállítás megmaradt. A hash-SPA keresőmotoros indexelési korlátja fennáll.

## 4. Telepítés, külső feltételek, visszaállítás

1. A ZIP teljes statikus weboldal. A kicsomagolt **tartalma** tölthető a `csanadi-website` teszt-repository gyökerébe vagy később az iskola FTP-tárhelyére. PHP, szerveroldali Node.js, adatbázis, GitHub Actions és GitHub Pages-specifikus háttérfolyamat nem szükséges.
2. Bootstrap 5.3.9 kizárólag verzióhoz kötött CDN-ről töltődik; a megjelenítéshez a látogatónál aktív CDN-elérés szükséges. A csomag nem tartalmaz helyi Bootstrap-másolatot.
3. A böngészős szerkesztők helyben dolgoznak, **nem írnak vissza közvetlenül az FTP-re**. Minden tartalmat és médiát külön intézményi jóváhagyási és FTP-kiadási lépés után kell publikálni.
4. A korábbi v1.39.7 ZIP-et visszaállítási példányként őrizd meg. Feltöltés után következzen valódi mobilos/asztali, billentyűzetes, képernyőolvasós és médiamegjelenítési próba.
5. A nyilvános indexelés engedélyezése kizárólag az élesítési döntés után történjen meg.

## 5. Összesített státusz

**Elkészült:** 71 oldalas mélyebb minőségellenőrzés és CSV-feladatlista; 128 ütköző blokkazonosító javítása 62 oldalon; 20 új témájú, három megjelenésű SVG-család (**60 fájl**), teljes média-/hash-nyilvántartással; az idézőjeles, ékezetes kereső fejlesztése; a B+C+D cél- és regressziós tesztek; teljes ZIP-átadás.

**Nem elkészült:** hatos szorzójú eredeti fotó-/videó-/dokumentumbővítés, intézményi tény- és jogi jóváhagyás, valódi böngészős/akadálymentességi tanúsítás és nyilvános feltöltés.
