# Csanádi Sportiskola 2026 – 17. fejlesztési kör, teljes fejlesztési és tesztbeszámoló

**Dátum:** 2026. november 15.  
**Kiindulás:** `Csanadi_Sportiskola_2026_16_TELJES_WEBOLDAL_FTP_ES_KEZIKONYV.zip`.  
**Kiadás:** teljes statikus FTP-kompatibilis, önállóan kicsomagolható honlap, az eredeti `README.md` megtartásával.  
**Éles szerver:** sem az iskola FTP-jére, sem a GitHubra nem történt feltöltés vagy publikálás.

## 1. A felhasználó pontos kérései

Az előző fejlesztési választó **1+2+3+4+5+6+7+8+9+10** pontjának együttes megvalósítása a 16. kiadás összes meglévő funkcióját megőrizve. A 66 JSON-alapú tartalmi oldal, a központi címeres körmenü, a két szinkron kép, az események és dokumentumok működése, mind a korábbi nyolc karbantartói felület, a teljes README és a 16. kiadás fiktív diákhírei nem veszhetnek el. A nyilvános láblécből korábban kivett külön kézikönyv- és beállításszerkesztő-hivatkozások maradjanak távol.

Az előző kérések továbbra is érvényesek: **minden módosítható globális adat egyetlen `json/config.json` forrásban legyen**, a konkrét esemény vagy dokumentum saját dátuma pedig csak a saját rekordjában legyen; legyen rájuk szerkesztő, ne legyenek felesleges másolatok. A két téma minden felületen működjön; világos módhoz világos, pasztell sportzöld és sportsárga, sötét módhoz visszafogott, sötét sportzöld és sportsárga tartozzon. **Lila tilos.** Az asztali képpár egyetlen vezérléssel lapozzon, ne legyen külön lapozósáv és külön tartalomgomb; a teljes kártya legyen kattintható. A korábbi kétképes, félkörös mobilkoncepciót a felhasználó később egyképes mobilváltakozóra módosította.

A felhasználó ezt a kiadás készítése közben pontosította: **asztalon az irányító nyilak a teljes képfelületen kívül legyenek, és ne legyen képpárválasztó legördülő**. Telefonon az asztali képpár helyett **egyetlen váltakozó kép** legyen, egyesével, a külső két nyíllal; a nagy címeres gomb tűnjön el. Az alsó mobilos navigációban **pontosan három, felirat nélküli ikon** maradjon, ebben a sorrendben: Kezdőlap (házikó), Menü (iskolai címer), Keresés (nagyító). Asztalon a központi címeres menügomb alatt kicsi, külön kattintható **házikó ikon** vigyen a kezdőlapra. A kártyák és kiemelések hátterében a központi sportzöldből és sportsárgából képzett finom színátmenetek is jelenjenek meg. Az „Oldaltérkép” felirat eltűnjön, a hosszabb menüpontnevek legyenek rövidek és egyértelműek, a teljes oldalcímek változatlanok maradhatnak.

A jelen kör után frissüljenek a **webes és PDF-használati útmutatók** minden oldalról és karbantartó funkcióról, a PDF ténylegesen letölthető legyen a Dokumentumtárból. Legyen átlátható, részletes, az elvégzett munkát és a nem végrehajtott valós teszteket külön megnevező jelentés, új, **működő, több elemes fejlesztési választó**, valamint az összes fájlt tartalmazó letölthető ZIP.

## 2. A kiválasztott tíz fejlesztés tényleges teljesítése

| # | Vállalt terület | Megvalósított változtatás | Korlát / kézi teendő |
|---|---|---|---|
| 1 | Nyilvános és karbantartói felületek szétválasztása | Új `tools/index.html` karbantartói központ. A publikus láblécben továbbra sincs kézikönyv- vagy eszközlink; az adminoldalak `noindex,nofollow` metaadatot kapnak. | A statikus FTP nem tud bejelentkezést vagy jogosultságkezelést biztosítani; a közvetlen cím ismeretében a lap megnyitható. Bizalmas adat nem kerülhet a publikus csomagba. |
| 2 | Fiktív/hiteles hír közzétételi kapuja | Új közös `js/news-policy-2026.js`: a `sample` rekordnak `minta:` azonosító, a központi JSON-ban megadott `MINTA – ` címkezdet, üres dátum/link és személyadatmentesség kell. Hiteles bejegyzéshez engedélyezett intézményi HTTPS-forrás szükséges, tanulói sporthírhez dokumentált külön jóváhagyás. A hírolvasó és a minőségkapu ugyanazt a szabálymodult importálja. | A forrásból olvasott jóváhagyási jelző önmagában nem bizonyít valódi intézményi engedélyt. |
| 3 | Címeres főmenü és asztali képpárok | Asztalon a két képfelület továbbra is együtt, egyetlen időzítővel vált; a nyilak a két szélső kép külső oldalára, a tartalmon kívülre kerültek. A legördülő megszűnt. Az automatikus váltás szünetel, ha a képtartalom kikerül a képernyőről; kézi lapozáskor rövid képernyőolvasós visszajelzés van. Az „Oldaltérkép” felirat helyén csak a címer látható, alatta külön kezdőlap-házikó. | Valós készülékes, képpontonkénti ellenőrzés szükséges. |
| 4 | Akadálymentes vezérlés | `css/round17-visual-access.css` külön `forced-colors`, nagyobb kontraszt, fókuszkeret és csökkentett mozgás szabályokkal; a képpár vezérlői hozzáférhető neveket kapnak. | Nem teljes WCAG 2.2 AA tanúsítás; NVDA/VoiceOver-teszt külön kell. |
| 5 | Mobilos megjelenés | Legfeljebb 768 px szélességnél a korábbi kettéosztás és félkör megszűnt: egyetlen nagyméretű kép látható, és egyesével váltja egymást a teljes diasor. A nyilak a képen kívül állnak. A nagy címergomb a mobilkezdőlapról eltűnt; alul pontosan három, szöveg nélküli ikon szerepel: házikó, iskolai címer, nagyító. A középső címer ugyanazt a főmenüt nyitja meg, a gomboknak képernyőolvasós megnevezésük van. | Érintés, Safari/iOS, Android és kis kijelzők manuális próbája nyitott. |
| 6 | Központi JSON 3.0, duplikációellenőrzés | A `json/config.json` jelenleg **202** levélparamétert tartalmaz. Hír-közzététel, auditméret, teljesítménycélok, elvárt oldalszám és manifestminimum központi mezők lettek. A hosszabb menünevek 18 helyen az adott oldal egyszeri `menuLabel` forrásmezőjében rövidültek; a keresőcélú `oldalindex.json` generált mezői összhangba kerültek az oldalakkal. A meglévő paraméterszerkesztő validációja bővült. | A keresőindex a tartalmi forrásokból újraépítendő, ha később változnak a címkék; a műszaki konstansok nem globális szerkeszthető adatok. |
| 7 | Diagnosztika 3.0 | A korábbi manifestből számolt teljes bájtméret, állományszám, erőforrásátvitel és leglassabb fájlok mellé a legnagyobb betöltött erőforrások listája, a FCP, LCP és CLS becslése, valamint központi JSON-célküszöbök kerültek. | A böngésző Performance API-ja hiányos adatot is adhat; ez nem laboratóriumi PageSpeed vagy valós hálózati benchmark. |
| 8 | PDF és dokumentumtár | Friss webes `utmutato.html` és **3.3-as PDF-kézikönyv**: 66 oldal útvonala, tíz eszköz, az összes 202 központi paraméter, részletes napi használati és közzétételi lépések. A PDF a dokumentumtárban a korábbi, stabil fájlelérési úton marad; friss méret/hash/verzió szerepel a JSON-leltárban. | A beépített PDF-előnézet egyes mobilböngészőkben nem támogatott; közvetlen megnyitás és letöltés megmarad. |
| 9 | Média-, szerzői jogi és adatvédelmi ellenőrzés | Új `tools/minosegkapu.html`: médiák jogosultsági mezői, képleírások, fájlhash-ek, dokumentumkapcsolatok, oldalak, menü és hírstátuszok ellenőrzése. JSON/CSV jelentés exportálható; ez nem módosítja a fájlokat. Az egyes kártyák felülete központi zöld és sárga témaszínekből számított, sötét és világos módban eltérő erősségű színátmenetet is kapott. | A hiányzó jogok jelzése nem maga a beszerzett engedély; kézi intézményi döntést igényel. |
| 10 | FTP-kiadás 3.0 és visszaállási ellenőrzés | A `tools/ftp-kiadas-ellenorzo.js` a központi JSON-ból olvassa az elvárt oldal- és állományszámot; a README, a kézikönyv, az új minőségkapu és a hír-policy fájlja is a kötelező/kiemelt manifestellenőrzés része. A teljes új ZIP és SHA-256 manifest külön újragenerálódik. | Valódi FTP-telepítés és automatikus rollback nem történt; korábbi ZIP megőrzése szükséges. |

## 3. A központi adatforrások pontos határa

Az összes, globálisan konfigurálható darabszám, időtartam, dátumablak, keresési limit, képciklus, témaszín, lapozási beállítás, fájlkorlát, frissítési idő, böngészős teljesítménycél, hírközzétételi policy, navigációs limit és kiadási elvárás **egyszer** szerepel a `json/config.json` megfelelő mezőjében. Más modulok a `js/site-settings-2026.js` beállítás-olvasóját, illetve a különálló eszközöknél az aktuális JSON-fájlt használják. A `tools/parameterek-szerkeszto.html` nem közvetlenül az FTP-re ír: letölthető fájlt készít. Ugyanott lehet egy értéket módosítani, ahol definiálva van. A `dokumentacio/KOZPONTI_JSON_PARAMETEREK.md` minden ilyen JSON-útvonalat és aktuális értéket tételesen tartalmaz.

**Nem duplikálunk tételspecifikus adatokat**: egy esemény kezdő és záró dátuma a `json/adatok/esemenyek.json` adott rekordjához, egy dokumentum metaadata a `json/adatok/dokumentumok.json` rekordjához, egy mintahír saját címkéje a `json/adatok/hirek-hivatalos.json` rekordjához tartozik. A teljes, ellenőrzött fájllista a `release-manifest.json` állományban található; a manifest nem konfigurációs másolat, hanem kiadási pillanatkép és integritásigazolás.

**Új, konkrét központi mezők:** `privacy.requireExplicitApprovalForStudentNews`, `privacy.allowFictionalStudentSamples`, `runtime.news.sampleTitlePrefix`, `runtime.news.officialSourceHost`, `runtime.tools.auditMaximumIssues`, `runtime.tools.auditConcurrentRequests`, `runtime.diagnostics.largestResourceCount`, `runtime.diagnostics.targetLcpMs`, `runtime.diagnostics.targetCls`, `runtime.diagnostics.targetFcpMs`, `runtime.release.minimumManifestEntries`, `runtime.release.expectedPageCount`.

## 4. Megőrzött tartalmak és állományok

- A 66 tartalmi oldal és a hozzájuk tartozó menühierarchia, kereső, dokumentumtár, sportmodulok, eseménynaptár, körmenü és médiafájlok megmaradtak.
- A nyolc korábban meglévő karbantartói HTML-eszköz változatlan útvonalon működik; az új munkaközponttal és a minőségkapuval **tíz** karbantartói oldal van.
- A `README.md` változatlanul a ZIP gyökerében van.
- A nyolc, név nélküli, „MINTA –” jelzésű fiktív sporthír megmaradt, nincs hozzájuk hamis eredmény, dátum vagy hivatalos link. Az öt korábbi, intézményi forráshoz kötött nem-diák közlemény megmaradt.
- A nyilvános lábléc továbbra sem tartalmazza az `utmutato.html` és `tools/parameterek-szerkeszto.html` közvetlen linkjeit; a kézikönyv a Dokumentumtárból továbbra is használható.
- A rövidebb, egyértelműbb menücímkék a tartalmi oldalak `menuLabel` mezőjéből származnak. Példák: `Oktatás, felvételi`, `Hírek, programok`, `Tudnivalók`, `Céljaink`, `Iskolatörténet`, `Felvételi`, `1. osztályos beiratkozás`, `9. osztályos felvételi`, `Szolgálati dokumentumok`, `Aktuális tanév`, `Tananyagok`, `Könyvtár`, `Ügyintézés`. Az oldal tényleges címe és útvonala nem változott. A publikus kód és a Dokumentumtár ajánlója sem írja ki az eltávolított, hosszú menügomb-feliratot; a könyvtárban a valós tízes eszközszám jelenik meg.
- A Bootstrap továbbra is **verzióhoz kötött CDN-ről** töltődik, nem szerepel letöltött helyi Bootstrap a csomagban; a honlap tisztán statikus HTML/CSS/JS/JSON és médiák segítségével működik.

## 5. Ellenőrzés és eredmények

Az elkészült csomagot a helyi `test17.py` script külön ellenőrzi. Fő vizsgálatok: a JSON- és a JS-szintaxis valamennyi állománya; HTML-be írt scriptek; manifest állományhalmazának, bájtméretének és SHA-256 hashének teljes egyezése; 66 oldal és 65 menühivatkozás; központi konfiguráció 202 mezője; világos/sötét paletta kontrasztja és lila árnyalatok kizárása; mobilos egyképes váltakozó, külső nyilak és alsó Menü vezérlő; asztali szinkronlapozás, szüneteltetés és képernyőolvasós állapot; rövid menüszövegek és a publikus feliratok; eseménykártyák; fiktív diákhírek és policy; külön admin központ és minőségkapu; nyilvános lábléc; valamennyi tíz karbantartói témafunkció; teljesítménymérési bővítések; HTML-fájlhivatkozások; PDF olvashatósága, oldalszáma, dokumentumtári mérete és hash-e; README; statikus FTP-fájltípusok; ZIP sértetlensége.

**A forrás- és PDF-ellenőrzés eredménye: 66/66 sikeres vizsgálat.** A ZIP elkészítése után külön 67. ellenőrzés vizsgálja a ZIP-fájl sértetlenségét és tagjainak számát; így a teljes csomag eredménye **67/67**. A kiadásban **66 oldal, 65 menühivatkozás + kezdőlap, 88 JSON, 43 JavaScript, 13 HTML és 10 segédoldal** maradt. A manifestben az önmagát nem számító **736 állomány** minden mérete és SHA-256 ellenőrzőösszege egyezett a fizikai fájllal. A PDF **21 oldalas**, a központi JSON **202** módosítható mezőjét dokumentálja. Nem nevezünk sikeresnek ellenőrizetlen működést. A teljes ZIP-ben az összes automatikusan ellenőrzött állomány és a jelen jelentés helyet kap.

### Nem végrehajtott, ezért nyitott vizsgálatok

- Valós Chromium/Firefox/Safari/Android/iOS vizuális és érintéses teszt, beleértve a 320, 360, 390, 430, 768, 1024 és 1440 px nézeteket.
- NVDA, VoiceOver és átfogó WCAG 2.2 AA megfelelőségi tanúsítás.
- Élő internetkapcsolaton elvégzett, független Lighthouse/PageSpeed és hálózati cache-teszt.
- Valódi FTP feltöltés, tartalomélesítés vagy tényleges rollback.
- Személyesadat-kezelési, képhasználati és minden intézményi tényt megerősítő felelősi jóváhagyás.

Az automatikus forrás- és ZIP-ellenőrzés ezekkel a böngészős és intézményi vizsgálatokkal **nem egyenértékű**. A `noindex,nofollow` fejlesztési jelölés és a hash-SPA technikai SEO-korlátja változatlan. A karbantartó oldalak közvetlen URL-hez kötött elérése nem jogosultságkezelés.

## 6. Telepítés és visszaállítás, élesítés nélkül

1. Őrizd meg a korábbi, működő **16-os ZIP-et** változatlanul.
2. A 17-es ZIP-et teljes gyökerével, a mappaszerkezet megtartásával bontsd ki helyi/tesztkiszolgálóra.
3. A `tools/index.html` karbantartói munkaközpontból futtasd a `tools/minosegkapu.html` ellenőrzést, majd a `tools/ftp-kiadas-ellenorzo.html` vizsgálatot. Mindkettő exportálja a jelentést, a szerverre nem ír.
4. Próbáld ki az oldalt HTTP(S) tesztcímen. Az `index.html` egyszerű `file://` megnyitása a JSON-betöltés miatt nem támogatott.
5. Ellenőrizd külön a PDF-et a dokumentumtárban, a két témát, a mobilos lapozást, a médiák jogait és a noindex/SEO-állapotot.
6. FTP-aktiválást csak külön intézményi engedéllyel végezz. Ha hiba adódik, a megőrzött korábbi ZIP teljes állománykészletére kell visszatérni, megfelelő mentéssel és ellenőrzéssel.

## 7. Átadott állományok

1. `Csanadi_Sportiskola_2026_17_TELJES_WEBOLDAL_FTP_ES_KEZIKONYV.zip` – a teljes, statikus FTP-kompatibilis honlap, 66 tartalmi oldal, tíz adminfelület, teljes médiaszerkezet, README, webes és PDF-kézikönyv, JSON-konfiguráció, kiadási manifest és dokumentáció.
2. `Csanadi_Sportiskola_2026_TELJES_HASZNALATI_UTMUTATO_3_3.pdf` – a webhely dokumentumtárában is elérhető teljes PDF-kézikönyv külön letöltésben.
3. `Csanadi_Sportiskola_2026_17_RESZLETES_TESZTBESZAMOLO.md` – jelen részletes beszámoló külön fájlban.
4. `Csanadi_Sportiskola_2026_KOZPONTI_JSON_PARAMETEREK.md` – minden központi JSON-beállítás pontos útvonala és értéke.

Az átadás végén új, több kijelölést engedő, működő fejlesztési választó következik. Az újonnan javasolt lehetőségek **nem részei** ennek a kiadásnak.
