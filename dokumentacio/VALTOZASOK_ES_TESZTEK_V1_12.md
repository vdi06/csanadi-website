# Csanádi weboldal – háromlépcsős v1.12.0 fejlesztési és tesztbeszámoló

**Kiindulás:** teljes `csanadi website v1.9.0.zip`.

**Egymásra épülés:** v1.9.0 → v1.10.0 → v1.11.0 → v1.12.0. A v1.10 és v1.11 azonos tartalmú, önálló teljes munkapéldányként elkészült és külön tesztelésen ment át; a végső átadandó csomag a v1.12.0 összesített állapotát tartalmazza.

**Korlát:** a meglévő funkciók javítása és hatékonyabbá tétele volt a cél. Nem került be új, a felhasználó által nem kért nyilvános modul vagy funkció. Az iskola FTP-szerverére és a GitHub-tárhelyre nem történt feltöltés.

## 1. lépcső – v1.10.0: hibakezelés és frissítések

- A kiadási frissítés gomb az újratöltés előtt megjegyzi az adott kiadásra vonatkozó lezárást, így ugyanarra a verzióra nem ragad vissza az értesítés, még akkor sem, ha egy korábbi, gyorsítótárazott oldal újratöltődött.
- Az átmenetileg hibás oldal-JSON után helyben működő újrapróbálkozás jelenik meg. Nem szükséges az egész weboldalt újratölteni.
- A menüstruktúra és a nyitott oldal két egymástól független, átfedést kizáró frissítést kapott: ismétlődő időzített lekérdezések nem kezdhetnek azonos adatforráson egyszerre új műveletet.
- Egy korábban megnyitott aloldal késve beérkező JSON-válasza nem írhatja felül az időközben másik oldalra navigáló látogató aktuális tartalmát.
- A visszavont, nem publikált vagy eltérő azonosítójú oldal-JSON nem kerülhet élő tartalomként a képernyőre automatikus frissítéskor.
- A meglévő strukturált kereső, belső SPA-útvonalak, vissza/előre navigáció és tartalomépítő rendszer megmaradt.

**Teszt:** 46/46 teljes kiadásellenőrzés; 8/8 új hibakezelési és verzióértesítési teszt, utóbbiban valós JavaScript végrehajtás szimulált böngészőobjektumokkal.

## 2. lépcső – v1.11.0: mobilos fejléc és navigáció

- Legfeljebb 768 képpontos nézetben, ha a rögzített alsó navigáció létrejött, a felső fejlécben nincs második iskolai címer – a kezdőlapon sem, az aloldalakon sem.
- Az alsó mobilos címer középen marad és a meglévő főmenüt nyitja. Ha az alsó sáv nem tud létrejönni, a felső tartalék menüvezérlő megmaradhat.
- A felső keresőduplikátum is eltűnik, ha az alsó keresőgomb működőképes. Az alsó gomb továbbra is ugyanazt a keresőt nyitja.
- Az alsó menü és kereső gombok `aria-controls`, `aria-expanded` és beszédes megnyitás/bezárás feliratai a tényleges állapottal szinkronban vannak. A menügomb nem tűnik folyamatosan aktívnak bezárt menünél.
- Az asztali címeres fejléc, a gördítéskor összecsukódó mód és a morzsamenü korábbi javításai változatlanul megmaradtak.
- A fejléc KRÉTA-hivatkozása már a JSON-konfiguráció betöltése előtt is az abban szereplő intézményi KRÉTA-címre mutat, nem a kezdőoldalra.

**Teszt:** 46/46 kiadásellenőrzés; 9/9 új mobilos navigációs esemény- és CSS-forrásellenőrzés; 12/12 korábbi fejlécregresszió.

## 3. lépcső – v1.12.0: hálózati hatékonyság és offline megtartás

- A service worker most először az online választ szerzi be, és a gyorsítótár hibája vagy kvótatúllépése nem alakítja át a már megérkezett jó választ hibává.
- Az offline olvasási központ felhasználói mentései állandó nevű tárba kerülnek. A korábbi kiadásokból származó `-offline` tárak olvasott fájljait az aktiválás migrálja.
- Ha a migrálás egy fájlnál kvótahiba miatt nem sikerül, a régi offline tárat nem törli automatikusan. Az új tárolóban már meglevő mentéseket nem írja felül.
- Az egyszerre indított JSON-frissítési kérések ugyanarra az erőforrásra megosztják a folyamatban lévő kérést. A valóban friss következő ellenőrzés továbbra is új HTTP-kérést végez.
- A módosult JavaScript-állományok cache-azonosítója frissült. Az alkalmazás továbbra is központi `json/config.json`-ból működik, Bootstrap csak verzióhoz kötött CDN-ről töltődik be.

**Teszt:** 46/46 teljes kiadásellenőrzés; 8/8 új cache/online/offline/JSON teszt; az első két lépcső 8/8 és 9/9 célzott tesztje változatlanul sikeres.

## Korábban bejelentett hibák – állapot

| Korábbi jelzés | Jelenlegi állapot és teszt |
|---|---|
| Aloldalon hibásan eltűnő menü, nehéz visszajutás | A teljes és kompakt fejlécből ugyanaz a központi menü nyílik; a belső SPA-navigáció, morzsamenü és vissza/előre funkció megmaradt. 12/12 fejlécteszt. |
| A címer ne hamburgerikon legyen, vízszintesen középen | Asztali aloldalon középső címer, mobilon középső alsó címer. 12/12 + 9/9 forrás- és eseményteszt. |
| Mobilon ne legyen fent és lent is logó | A teljes honlap mobilos fejlécében az alsó sáv elkészülte után nem jelenik meg felső duplikátum. 9/9 teszt. |
| Beragadó „Elérhető a honlap új verziója” felirat | Frissítési kísérlet és későbbre halasztás során egyszeri értesítés; a régi verzióra ismételt figyelmeztetés megszűnik az adott böngészőmunkamenetben. 8/8 teszt. |
| Régi Csanádi oldalra mutató hivatkozások | Automatikus kiadásellenőrzésben 0 régi domaines hivatkozás; a régi linkeket kezelő meglévő aloldali védelem megmaradt. |
| Térképes és megközelítési aloldal | A korábban újratervezett külön oldal és beágyazott nézet, saját témaszínek, helyi útvonalvezérlők, külső térképhez hozzájárulás és középre rendezett blokkok megmaradtak. A térkép tényleges külső szolgáltatása nem volt élő böngészőben kipróbálható. |
| Gombok eltérő arculata | Az egyesített meglévő gombstílusok és az eszközoldalak vizsgálatai megmaradtak; teljes vizuális pixeles ellenőrzés még szükséges. |
| Csengetési rend és tartalom hitelessége | A régi domainre nincs automatikusan azonosított link. Az intézményileg ellenőrizendő időpontokat nem minősítettük hitelesnek bizonyíték nélkül. |

## Végső tesztek – v1.12.0

| Teszt | Eredmény | Módszer |
|---|---:|---|
| Teljes kiadásellenőrzés | 46/46 | JSON-hivatkozások, útvonalak, verziók, szerkezet, szabálymátrix, régi linkek |
| 1. lépcsős regressziók | 8/8 | Valós frissítésjelző-vezérlés szimulált DOM-mal, hibakezelési kódellenőrzés |
| 2. lépcsős mobilregressziók | 9/9 | DOM-eseményszimuláció, CSS- és hozzáférhetőségi attribútumok |
| 3. lépcsős hálózati regressziók | 8/8 | Service worker szimuláció, offline mentés betöltése, JSON-ígéretek, hibás tárhely-kvóta |
| Korábbi fejlécmenü | 12/12 | Kattintás, nyitás, bezárás, görgetés, duplikátumvédelem |
| Hitelesítési munkalap | 7/7 | 55 rekord, szűrés, export/import és hitelesítési kapuk |
| Média-szerkesztési működés | 10/10 | Felvétel, jogosultsági korlát, felülvizsgálati szűrők |
| Média-JSON és ZIP-export | 6/6 | Katalógus és szimulált állomány-letöltés |
| Összesen célzott és kiadási ellenőrzés | **106/106** | Átfedő tárgyú tesztek is szerepelnek; nem teljes böngészős lefedettség |
| Fizikai média és katalógus | 628/628 | Hiányzó és árva fájl 0 |
| Régi iskolai oldalra mutató link | 0 | Forrás- és útvonalellenőrzés |
| 31-szabályos aloldalellenőrzési mátrix | 2015/2015 | 65 oldal, 55 nyitott minőségellenőrzési tétel |

Az összes JavaScript-fájl a helyi szintaktikai ellenőrzésen átment. A teljes ZIP-et külön tömörítési és fájllista-ellenőrzésnek kell alávetni az átadás előtt.

## Amit nem tekintünk lezártnak

1. A Chromium helyi indítása operációsrendszer-szintű foglalattiltás miatt meghiúsult (`socket() failed: Operation not permitted`). A felhőböngésző korábban szintén nem kaphatott hozzáférést a helyi tesztoldalhoz. **Valódi mobilos/asztali kattintás-, képpont-, képernyőolvasó- és érintéses tesztet ezért nem állítunk sikeresnek.**
2. A teljes honlap valamennyi interakcióját a több száz állomány miatt automatizáltan sem lehetett bizonyítani; a 106 ellenőrzés csak a megnevezett regressziókra és forrásintegritásra vonatkozik.
3. Az 55 nyitott 31-szabályos minőségellenőrzési tételhez intézményi forrás és felelős ellenőrző szükséges. A `verifiedContent` jelölőket nem írtuk át.
4. A médiák felhasználási jogállása, hiányzó alt-leírásai, diákadatok és a térkép élő szolgáltatásának elérése intézményi/éles tesztet igényel. A 628 fizikai médiafájl változatlan maradt; hatszoros bővítéshez nem kaptunk hitelesített új forrásokat.
5. A Bootstrap CDN, a KRÉTA és a térképes külső oldal csak megfelelő hálózati eléréssel működik. A honlap saját oldalmotorja továbbra is statikus HTML/JS/CSS/JSON, külön PHP, Node.js vagy GitHub Actions nélkül.
6. A `noindex,nofollow` fejlesztői keresőrobot-beállítás megmaradt. Ezt csak későbbi, külön jóváhagyott élesítéskor szabad feloldani.

## Javasolt következő javítások – kizárólag meglévő funkciókhoz

- A végső ZIP telepített tesztpéldányán a meglévő menük, galériák, keresők, térkép és eszközoldalak végigkattintása különböző mobileszközökön és asztali méretekben.
- A meglévő aloldali tartalom és csengetési rend 55 nyitott ellenőrzési tételének intézményi források alapján lezárása.
- A meglévő médiatár jogállásainak és szöveges képleírásainak rendezése, új médiumok automatikus hozzáadása nélkül.
- A jelenlegi gyorsítótárazási és offline mentési funkciók kvóta- és hálózatvesztési próbája tényleges böngészőn.

**Telepítési szabály:** a `csanadi-website` GitHub Pages repository vagy később a statikus FTP-tárhely gyökerébe a ZIP gyökérfájljait kell kicsomagolni. Éles feltöltés és közzététel nem történt.
