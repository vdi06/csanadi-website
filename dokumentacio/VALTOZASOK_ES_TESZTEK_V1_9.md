# Csanádi Sportiskola – v1.9.0 fejlesztési és tesztbeszámoló

**Kiadás:** `csanadi website v1.9.0.zip` – teljes, statikus GitHub Pages / FTP-kompatibilis kiadási csomag  
**Kiindulás:** v1.8.0  
**Fejlesztési opciók:** A+B+C+D együtt, valamint a felhasználó legutóbbi mobilmenü-pontosítása  
**Tényállás:** helyben készített csomag. Sem GitHub-repositoryba, sem az iskola FTP-tárhelyére nem töltöttük fel.

## Kért és megvalósított változások

### A. A címeres főmenü és fejléc

- Az aloldalak fejlécében a `cs-subpage-menu` az eredeti iskolai címerrel nyitja a főmenüt, a teljes és a kompakt asztali fejlécben is vízszintesen középre igazítva.
- A `SPORT · TUDÁS · KÖZÖSSÉG` és a `Menü` felesleges kísérőszöveg nem foglal helyet a kompakt fejléc mellett.
- Az összecsukás továbbra is csak a nagy képes fejlécrész tényleges kigördülésekor történik; felfelé gördítve visszaáll, köztes helyzetekben nem villog.
- Az SPA-fejléc újrainicializálásakor a kód nem hoz létre második címeres menügombot.
- **Új mobileset:** 768 px-ig az alsó, rögzített navigációs sávban lévő iskolai címer nyitja a menüt; ha ez a sáv megjelent, a felső, duplikált címer el van rejtve. A mobilgomb közvetlenül a `csanadi:menu-toggle` eseményt küldi, így nem függ a vizuális kezdőlapi indítógomb pillanatnyi elhelyezkedésétől.
- Hibatűrés: ha a mobilos alsó sáv egyáltalán nem jön létre, a felső, középre tett címert nem rejtjük el; így nem marad menüvezérlő nélkül az oldal.

**Ellenőrzés:** `tools/test-subpage-header-v1-9.js` – 12/12 DOM-eseményes és CSS-forrásos ellenőrzés, beleértve az aria-állapotot, a gördítési holtsávokat, a mobil címer kattintását és az indítógomb hiányát.

### B. A 65 aloldal 31 szabályának tételes előkészítése

- Megmaradt a korábbi **65 × 31 = 2015** forrásalapú státusz és a **55 H** (hiányos) állapotú követelmény. A hiányok mind a 28., minőségellenőrzési szabályhoz kapcsolódnak.
- A `tools/tartalmi-hitelesites.html` új, negyedik adatkörében közvetlenül megnyitható a **31 szabály · 55 nyitott tétel** listája.
- Minden elemnél elkülönített munkastátusz, megjegyzés, ellenőrző személy, forrás/bizonyíték, jogalap és intézményi döntési azonosító rögzíthető. A hiányzó kötelező adatot tartalmazó „jóváhagyási adat rögzítve” státuszt a felület nem fogadja el.
- A munkalap CSV/JSON-ként exportálható; a JSON a megfelelő adatkörbe biztonságosan visszaolvasható. A nem létező kulcsokat és érvénytelen státuszokat nem vesszük át, a hiányos jóváhagyási adatok `review` állapotra kerülnek. A régi helyi munkajegyzetek tárolókulcsa nem változott.
- Telefonon a korábbi széles, vízszintesen görgetendő táblázat helyett egymás alá rendezett, az adott képernyőn elférő ellenőrzőkártyák jelennek meg.
- **Nem módosult** egyetlen oldal `verifiedContent` jelzője sem. Ez munkaeszköz, nem intézményi tanúsító rendszer.

**Ellenőrzés:** `tools/test-review-worklist-v1-9.js` – 7/7 interakciós és munkastátusz-regresszió, 55 tényleges JSON-forrástétellel; helyi mentés, export, szűrés, jogalap- és döntésellenőrzés, JSON-visszaolvasás.

### C. Média-jogállás és akadálymentesség

- A média- és dokumentumkezelő `Jogállás hiányos vagy jóváhagyásra vár` szűrője most már a **publikáltnak jelölt, de médiatári jogállás nélküli fájlokat is** felfedi. Korábban ezek kimaradhattak a szűrésből.
- Ellenőrzési sorba kerülnek a `pending`, `preview-only`, `unknown`, csak szerkesztői `editor-confirmed` és hiányzó jogállású közzétett elemek. Az új nyilvános fájloknál továbbra is kötelezőek a jog- és forrásbizonyítékok, az ellenőrző személy, valamint a képeknél az alternatív leírás.
- A `TARTALMI_MEDIA_AUDIT_V1_9.json/.csv` külön jelzi a szerkesztői, de intézményileg nem jóváhagyott tételeket; az alt-hiányos QR-kódok száma külön szerepel.
- A meglévő hiányok változatlanok: 29 `pending`, 4 `preview-only`, 35 közvetlen jogosultsági regiszter nélküli publikált eszköz és 233 hiányzó képleírás (ebből 87 QR-kód). Az összes, külön kategóriába is eshető audit-megállapítás száma 301. Ezek valós ellenőrző személy és engedélyek nélkül nem „javíthatók készre”.

**Ellenőrzés:** `tools/test-media-manager-v1-9.js` – 10/10, és `tools/test-media-export-v1-9.js` – 6/6; a meglévő 628 fájlon kipróbált helyi előkészítés, jogosultsági blokkolás, QR-útvonalcsere, JSON/ZIP-összeállítás, visszavonás.

### D. Körülbelül hatszoros médiabővítés – felelős előkészítés

- Létrejött a `tools/build-media-expansion-plan-v1-9.js` ismételhető leltártervező.
- A `dokumentacio/MEDIA_BOVITESI_KERET_V1_9.json/.csv` alapján jelenleg 147 nem reszponzív kép, 12 videó, 19 dokumentum és 10 QR-en kívüli grafika alkotja a **188 fájlos, csak útvonalak alapján becsült egyedi kiinduló kört**.
- A 6× irányszám 1128 egyedi tételt, elméletileg további 940 igazolt új tételt jelenthet; ez **nem jóváhagyott importterv**. A meglévő 353 reszponzív változatot és 87 QR-kódot kifejezetten kihagytuk a bővítendő egyedi kategóriákból.
- A `dokumentacio/MEDIA_BOVITESI_TERV_V1_9.md` rögzíti a kötelező sorrendet: előbb valódi böngészős CRUD-próba, 55 tartalmi bizonyíték tisztázása, média-jogok és alt lektorálása, majd kis jóváhagyott importcsomag; ezután lehet bármi nagyobbat kiadni.
- **Ebben a ZIP-ben nem bővült a médiaállomány**: a megőrzött fizikai és JSON-katalógusbeli `assets/` fájlok száma is 628.

## Átfogó tesztek és eredmények

| Ellenőrzés | Eredmény | Módszer |
|---|---:|---|
| Főkiadás teljes ellenőrzőprogramja | 46/46 | JSON/JS szintaxis, kapcsolatok, cache-verzió, belső útvonalak, tárolt sablonok és v1.9 feltételek |
| Aloldali címer és fejlécesemények | 12/12 | DOM-mock + eredeti forráslogika + CSS-szabályok |
| 55 hitelesítési munkatétel | 7/7 | DOM-mock, export/import és státuszfeltételek |
| Médiaűrlap és jogállás-szűrő | 10/10 | VM-es űrlap- és bejegyzés-szimuláció |
| Média-export és CRUD-útvonalak | 6/6 | Valós katalogizált JSON + hálózatmentes mock fetch |
| Fizikai assets–katalógus egyezése | 628/628 | Leltár-összevetés, 0 hiány és 0 árva rekord |
| Régi iskolai domainre mutató hivatkozások | 0 | HTML/JS/JSON hivatkozásellenőrzés |
| 65×31 forrásellenőrzési állapot | 2015/2015 | 260 F, 260 K, 1241 V, 199 N, 55 H |
| QR-kód állományok | 87/87 | Fájl- és hivatkozás-nyilvántartás |

## Nyitott kérdések és külső feltételek

1. **Valós böngészős, képpontszintű és érintéses tesztet nem tudtunk lefuttatni.** A lokálisan elérhető Chromium indítását a futtatási környezet nem engedte, a felhőböngészőnek pedig biztonsági okból nem volt engedélye hozzáférni a helyi HTTP-s tesztoldalhoz. A 12/12 fejlécteszt ezért valódi kódeseményeket, de nem tényleges képernyőrögzítést vizsgált.
2. A 55 hiányos tartalmi ellenőrzést az intézménynek valós forrásokkal és felelős ellenőrzővel kell lezárnia; a forrásértékek automatikusan nem változtak.
3. A médiahasználati jogok és a QR/fotó alt-minősítése intézményi döntést, esetenként engedélyt vagy adatvédelmi jogalapot igényel. A program nem tud jogokat szerezni és nem minősíti hitelesnek az önbevallást.
4. A hatszoros médiabővítéshez tényleges, jogszerűen használható egyedi forrásanyagokra, kapacitásmérésre és jóváhagyásra van szükség.
5. Az interaktív térkép élő szolgáltatási rendelkezésre állását és a teljes mobileszköz-skálát az új változat telepített tesztpéldányán kell ellenőrizni.
6. A Bootstrap 5.3.9 CSS/JS verzióhoz kötött CDN-ről töltődik. A projekt nem igényel PHP-t, Node.js-t, GitHub Actionst vagy más futó szervert a statikus publikáláshoz.

**Telepítés:** a teljes ZIP tartalmát a `csanadi-website` GitHub Pages repository vagy később a statikus FTP-tárhely gyökerébe lehet kicsomagolni. A ZIP tartalma önmagában nem hoz létre éles feltöltést.
