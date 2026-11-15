# Csanádi Sportiskola 2026 · 26. fejlesztési kör

**Kiadás:** `csanadi-sportiskola-2026-r26` · **Dátum:** 2026. november 15. · **Alapcsomag:** `Csanadi_Sportiskola_2026_25_TELJES_WEBOLDAL_FTP_ES_KEZIKONYV.zip`. Az iskolai FTP-re nem történt feltöltés.

## 1. A kérésed: mind a tíz új fejlesztési pont

| # | Kérés | Megvalósítás | Korlát / feltétel |
|---|---|---|---|
| 1 | Közlekedési és érkezési kalauz | `megkozelites-es-tanulas.html#terkep`: hivatalos cím, megállókörnyékek, érkezési tippek, BKK, három útvonalmód és külön gombbal betöltött OpenStreetMap; a főoldalon külön térképes gyorselérés. | A térképtű közelítő; pontos kapu nem hitelesített. A külső térképhez internet és külön kattintás kell. |
| 2 | Felvételi folyamatábra és lépéskövető | Öt összefüggő, kipipálható folyamatlépés; 60 napig helyi mentés, törlés. | Nem közöl ellenőrizetlen határidőt, nem ad be jelentkezést. |
| 3 | Tanulási cél- és szokáskövető | Kategória, rövid cél, teljesítés jelölése, törlés; legfeljebb 40 cél és 90 napos helyi lejárat. | Ne szerepeljenek személyes adatok a bejegyzésekben. |
| 4 | Sportolói fejlődési mérföldkövek | Öt sportág: labdarúgás, kézilabda, vívás, kajak-kenu, birkózás; kereső, sportszövetségi forráslinkek. | Általános tudnivalók, nem egyéni edzésterv vagy egészségügyi döntés. |
| 5 | Diákújság- és iskolarádió-archívum | Típus- és szövegszűrés; jóváhagyási, publikálási, jogengedélyezési kapu. | **0 igazolt, közzétehető lapszám/hanganyag**; nincs kitalált archívum. |
| 6 | Fogadóórák és kapcsolattartás | Hivatalos kapcsolati út, jóváhagyott fogadóórák listázását fogadó felület. | **0 igazolt 2026/27-es fogadóóra**, időpontot az iskolánál kell egyeztetni. |
| 7 | Tanulásmódszertani eszköztár | Három módszerkártya, helyi fókuszidő-mérő, aktív felidéző kérdéskártyák. | Az időmérő csak megnyitott lapon fut. |
| 8 | Akadálymentes megközelítés | Külön útmutató és ellenőrzött útvonalrekordokat fogadó megjelenítő. | **0 igazolt rámpa, lift, parkoló, bejárat**; tény nélküli ígéret nincs. |
| 9 | Környezettudatos iskolába járás | Önként megadott becsült távolság és heti napok alapján helyi úthosszszámítás, négy közlekedési mód összevetése. | Nem kér geolokációt, nem ad bizonyítatlan CO₂-értéket. |
| 10 | Nyilvános fejlesztési változásnapló | Kereshető és kiadásonként szűrhető, JSON-ból épített R23–R26 kiadásnapló. | Csak dokumentált bejegyzéseket jelenít meg; új hibajavítás-kategóriával bővíthető. |

### Térképhasználat

A **Csanádi Árpád Sportiskola, Általános Iskola és Gimnázium** hivatalosan közzétett címe **1143 Budapest, Őrnagy utca 5–7.**; forrás [Zugló Önkormányzata](https://www.zuglo.hu/altalanos-iskolak/7/). A főoldal statikus címkártyája nem tölt be külső adatforrást. A részletes oldal *Térkép betöltése* gombja kattintás után hoz létre egy OpenStreetMap iframe-et, amely az *Elrejtés* gombbal ténylegesen eltávolítható. Az útvonaltervezők új lapon nyílnak, a szolgáltatók saját adatvédelmi szabályaival. A megjelölt koordináta csak hozzávetőleges helyet jelent, **nem ellenőrzött belépési vagy akadálymentes pontot**. A térkép mellett a teljes cím, a szöveges érkezési tudnivalók és a BKK hivatalos menetrendjének linkje térkép nélkül is használható.

## 2. Külön elszámolt folyamatos hibajavítás és karbantartás

Ezek **nem számítanak a tíz új pont közé**:

1. A teljes R25 ZIP fájlkészletének megőrzése és az eredeti állományok eltűnésének ellenőrzése.
2. A 66 eredeti JSON-oldal és a `README.md` bájtra azonos megtartása.
3. A `mobile/` és `desktop/` elkülönítés és minden korábbi központ megőrzése.
4. A központi JSON korábbi paramétereinek, világos/sötét/automatikus témájának és adatvédelmi szabályainak megőrzése.
5. A cache-token `csanadi-r26-20261115` egységesítése, az offline előtöltési lista frissítése.
6. Az új központ elérése a kezdőlapról, a korábbi iránytűről és felfedezőközpontból, valamint a 3.12-es webes kézikönyvből.
7. A PDF-adatlap, SHA-256, fájlméret és a teljes `release-manifest.json` újragenerálása.
8. A meglévő Honlapdiagnosztika és a verziómegjelölések megőrzése. Az eddig jelzett, valós böngészőben magas CLS (~0,427) további mérésre vár; ennek megszűnését statikus teszt nem bizonyítja.

## 3. Adatvédelem, külső feltételek, FTP

- Az összes új szerkeszthető adat **helyben, a böngészőben** kezelhető; nincs geolokáció, saját szerverre küldött tanulási cél vagy felvételi állapot.
- A Google Maps útvonaltervező és az OpenStreetMap kizárólag külön felhasználói megnyitással hívódik meg. Külső hálózat hiányában a cím és a szöveges leírás továbbra is rendelkezésre áll.
- Diákújság, hanganyag, konkrét akadálymentes bejárat és fogadóóra **csak forrás- és jogosultságellenőrzés után** publikálható. A megfelelő üres adatlisták nem programhibát jelentenek.
- Az oldal statikus FTP-n működik; nincs PHP, Node.js vagy kizárólag GitHub Actions-függő szolgáltatás. Bootstrap 5.3.9 továbbra is verzióhoz kötött CDN, nem került helyi példány a csomagba.

## 4. Ellenőrzések és tesztkorlátok

A géppel olvasható, egyedi ellenőrzések eredménye a `dokumentacio/TESZTEREDMENY_2026_26.json` állományban lesz a kiadási ZIP-ben. A vizsgálatok kiterjednek az eredeti fájlkészlet és központi paraméterek megőrzésére, a 10 szakaszra és funkciókezelőre, az adatvédelmi kapukra, a gombnyomáshoz kötött iframe-re, a HTML-azonosítókra és relatív hivatkozásokra, a JSON- és JS-szintaxisra, a helyi HTTP-kiszolgálásra, a PDF-re és a ZIP CRC/SHA-manifestre.

**Fontos határ:** a helyi, statikus tesztek nem helyettesítik a tényleges Android/iOS, asztali böngésző, képernyőolvasó és akadálymentességi felhasználói vizsgálatot. Külső térképszolgáltatások elérhetőségét nem garantálják.

## 5. Teljes kiadás és nyitott tételek

- ZIP: `Csanadi_Sportiskola_2026_26_TELJES_WEBOLDAL_FTP_ES_KEZIKONYV.zip`, az FTP-re a **ZIP tartalmát** kellene később a megfelelő gyökérmappába kibontani (jelenleg semmi nincs feltöltve).
- Webes kézikönyv: `utmutato.html`; PDF: `assets/documents/csanadi-weboldal-teljes-hasznalati-utmutato-2026.pdf`, 3.12.0.
- Paraméterleltár: `dokumentacio/KOZPONTI_JSON_PARAMETEREK.md`, összesen **290** központi mező.
- JSON-adatok: `json/adatok/megkozelites-fejlodes-26.json`; központi beállítások: `json/config.json` `runtime.round26` (14 mező).
- **Nyitott tartalmi igények:** intézményileg jóváhagyott diákújság/hanganyag, fogadóóra és pontos akadálymentes bejáratok. Ezek műszaki felületei működnek, a valós intézményi adatokat nem lehet helyettesíteni kitalált példákkal.

**FTP-feltöltés: nem történt.**
