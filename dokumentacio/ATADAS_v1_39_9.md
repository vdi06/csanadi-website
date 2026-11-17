# Csanádi Árpád Sportiskola – v1.39.9 átadás és ellenőrzések

**Dátum:** 2026. november 17.  
**Alap:** a teljes v1.39.8 kiadás.  
**Választás:** **A+B+C+D** – helyi valódi Chrome-ellenőrzés és talált hiba javítása; tartalmi metaadatok célzott bővítése; médiatár új vektoros témái; kereső- és teljesítményfejlesztés.  
**Kiadás:** teljes, statikus FTP-kompatibilis ZIP, közzététel nélkül.

## 1. Elkészült fejlesztések

### A – Böngészős és hozzáférhetőségi próba

- A honlapot a teljes statikus állományból helyben kiszolgáltuk, és **valódi Chrome** böngészőben vizsgáltuk. Betöltődött a kezdőoldal és a „Nyílt napok” aloldal; a hash-alapú navigáció, a kereső, az Enter, a főmenü megnyitása és az Escape utáni fókuszvisszaállítás sikeres volt.
- A keresőben az „adatvédelem” kifejezésre **6 releváns találat** jelent meg. A keresőmező fókuszba kerülése és a párbeszédablak hozzáférhető megnevezése is ellenőrzött.
- A böngészőben felfedezett, beszédességet rontó **„Tartalom 3” szakaszfeliratot kijavítottuk**: a beágyazott címsorok is használhatók címforrásként, és a szakasznavigáció a célcímsorra tud fókuszálni. Az új név, „Gyakori kérdés”, Chrome-ban ellenőrizve.
- A tényleges próbák, környezet és korlátok részletes, tételes leírása: `dokumentacio/BONGESZOS_TESZT_V1_39_9.md`.

### B – 71 oldal tartalmi ellenőrzése

- A mélyebb szerkesztői audit ismét ellenőrizte mind a **71 JSON-oldalt**. **66 oldalon** egyedi, témához illeszkedő, tényszerűen óvatos metaadat-bővítés történt: **47 összefoglaló** és **66 SEO-leírás** javult.
- A leírásokhoz megfogalmazott mondatok nem tartalmaznak igazolatlan iskolai határidőt, létszámot vagy döntést. A módosított oldalak verziója, életciklus-revíziója és központi oldalindexe együtt frissült.
- Az automatikusan azonosított 113 előző szöveghossz-figyelmeztetésből **0 maradt**; a részletes audit **0 szerkezeti hibát** talált. A **23 kiemelt, időérzékeny vagy hivatalos intézményi oldal** külön kézi forrás- és hitelességellenőrzése továbbra is szükséges.
- Bizonyítékok: `dokumentacio/METAADAT_JAVITAS_V1_39_9.json`, `dokumentacio/TARTALMI_MINOSEG_V1_39_9.json` és `.csv`; reprodukálható műveletek: `tools/refine-editorial-metadata-v1-39-9.mjs`, `tools/audit-editorial-v1-39-9.mjs`.

### C – Új médiaillusztrációk, teljes katalógussal

- **20 további önálló, témaspecifikus vektoros grafika**, mindegyik három változatban (sötét, világos, kontúr): **60 új SVG-fájl**, a korábbi 60 mellé. Így **40 témacsalád és 120 SVG-változat** található az `assets/media/illustrations/` mappában.
- A 628 eredeti fájl megmaradt, a `json/assets-inventory.json` most **748** állományt regisztrál ellenőrizhető bájtmérettel és SHA-256-tal.
- A `json/mediatar.json` **154** globálisan egyedi médiaazonosítót tartalmaz (20 új témát is). Az új illusztrációk státusza **`pending`**: intézményi vizuális és jogi jóváhagyásra várnak; nem iskolai eseményfotók.
- A külön tervezett, nagyjából hatszoros **eredeti** médiaállomány-bővítés nem teljesült. A számítási keret még hozzávetőleg **940** új egyedi fájlt jelez, amelyhez jogtisztán átadott fényképek, videók, dokumentumok vagy grafikák szükségesek. A generátor és a részletes keret: `tools/build-editorial-graphics-v1-39-9.mjs`, `dokumentacio/MEDIA_BOVITESI_KERET_V1_9.json/.csv`.

### D – Kereső, találatértelmezés és teljesítmény

- A kereső a normalizált lekérdezéshez számolt és sorba rendezett találatokat **újrahasznosítja** a típus-/témaszűrés és lapozás közben. Új index betöltésekor a gyorsítótár érvénytelenítődik.
- A `sample` státuszú, kitalált teszthírek a találati listában egyértelmű **„Fiktív minta · Hír”** megjelölést kaptak és alacsonyabb súllyal szerepelnek. Ezzel az olvasó számára különválik a minta az intézményi hírtől.
- Újraépült a keresőindex a 71 oldal és a módosított metaadatok alapján; a cache/erőforrásverzió **1.39.9**.
- A változások kizárólag böngészőoldali JavaScriptet, CSS-/HTML-hivatkozásokat és statikus JSON-t érintenek; nem igényelnek GitHub Actions-, PHP- vagy szerveroldali Node.js-futást.

## 2. Ellenőrzések

| Vizsgálat | Sikeres eredmény |
|---|---:|
| A+B+C+D céltesztek | **18/18** |
| Korábbi B+C+D regresszió | **14/14** |
| Statikus oldal-/média-/JSON-integritás | **1068/1068** |
| Helyi HTTP-erőforrásvizsgálat | **1422/1422** |
| Keresőindex integritása | **74/74** |
| Korábbi tartalmi ellenőrzés | **16/16** |
| Aloldali sablonok és navigáció | **14/14** |
| Régebbi funkcionális regresszió | **7/7** |
| Offline és hibatűrési teszt | **22/22** |
| Médiakezelő | **11/11** |
| Reszponzív/akadálymentességi szerkezeti próbák | **8/8** |
| Modális fókusz és ARIA | **10/10** |
| HTML-szemantika | **17/17** |
| Témaszinkron | **12/12** |
| ZIP-motor | **5/5** |
| Valódi Chrome-navigáció, keresés, menü, billentyűzet | **sikeres a leírt próbákon** |
| A 60 új SVG bytes/hash/biztonsági tartalomellenőrzése | **60/60** |

Az ellenőrzési számok a futtatott konkrét programokra vonatkoznak; a teljes alkalmazás összes kézi felhasználói útvonalának végigpróbálását nem jelentik. A végleges ZIP és állományjegyzék ellenőrzése a kiadás lezárásakor készül.

## 3. Nyitott feladatok és külső feltételek

1. **Mobil és keresztböngészős próba:** a tényleges Chrome-próba nem egyenlő teljes mobilos Chrome/Firefox/Safari/Edge-átjárással. Valós keskeny nézet, érintés, képernyőolvasó (NVDA, VoiceOver, TalkBack), kézi 200–400%-os nagyítás, Lighthouse és teljes WCAG 2.2 AA megfelelés **nincs lezárva**.
2. **Hivatalos intézményi tartalmak:** **23** időérzékeny oldalnak kell forrás, dátum és felelős szerkesztő szerinti jóváhagyás; a 0 szöveghossz-figyelmeztetés **nem** igazolja a teljes oldalszöveg ténybeli helyességét.
3. **Médiatár jogállása:** a 154 kanonikus médiaszereplőből **69 `pending`**, **1 `user-provided`**, **80 `generated`** és **4 `preview-only`** státuszú. Ezek szerkesztői nyilvántartási címkék, önmagukban **nem bizonyítják a nyilvános közzététel jogszerűségét**. A 120 újonnan készült SVG-változat intézményi elfogadásra vár.
4. **Fotók és dokumentumok:** valódi, intézmény által jóváhagyott média nélkül a hatszoros egyedi bővítés nem végezhető el hitelesen.
5. **Közzététel:** nem történt GitHub-/FTP-feltöltés. A `noindex,nofollow` SEO-tiltás szándékosan megmaradt; hash-SPA korlátok éles indexeléskor mérlegelendők.
6. **Külső CDN:** a Bootstrap CSS/JS **5.3.9** verzióhoz kötött CDN-ről érkezik. Nincs helyi Bootstrap-kópia; az internet-/CDN-hozzáférés működési feltétel.

## 4. Telepítés, visszaállítás

- A ZIP gyökerében `index.html`, `style.css`, `script.js`, `js/`, `json/`, `assets/`, `tools/` és `dokumentacio/` található; a fájlokat kicsomagolva a GitHub teszt-repository gyökerébe vagy az FTP-tárhely megfelelő helyére lehet másolni.
- A böngészőben futó szerkesztő és médiaexportálás **nem módosítja közvetlenül a szerveren az FTP-fájlokat**. Az elkészített állományok publikálása külön jóváhagyási/feltöltési feladat.
- A **v1.39.8 teljes ZIP** őrizendő meg helyreállítási példányként. Az új verzió csak az intézményi ellenőrzések után kapjon éles kiadási jóváhagyást.
- A `release-manifest.json` minden kiadási fájl SHA-256 lenyomatát tartalmazza a manifest önmagán kívül; a `tools/verify-release-manifest-v1-39-0.js` ellenőrzi.

**Összegzés:** a v1.39.9 A+B+C+D csomagja helyi Chrome-ellenőrzéssel, azonosított hozzáférhetőségi szöveghiba javításával, 66 oldal metaadat-bővítésével, 60 új SVG-vel és keresőgyorsítással készült el. Az engedélyezési, intézményi tényhitelesítési és teljes eszköz-/képernyőolvasós tesztkörök továbbra is külön feladatok.
