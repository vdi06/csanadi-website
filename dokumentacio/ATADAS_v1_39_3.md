# Csanádi Sportiskola – v1.39.3 átadás

**Kiadás:** v1.39.3 · **Dátum:** 2026. november 17. · **Fejlesztési választás:** A – Oldalak teljes tartalmi javítása.

## A kért feladat és az eredmény

A v1.39.2 teljes honlapja az alap. A feladat a **71 publikált oldal** szerkesztői átvilágítása, témához kötött tartalmi helyesbítése, az ismétlődések és félrevezető szövegek csökkentése, a források beazonosítása, majd az FTP-n használható teljes ZIP előállítása volt. **69 oldal szövege módosult; 2 meglévő, témaspecifikus digitális kultúra oldal alapos vizsgálat után szövegmódosítás nélkül maradt.** Az ellenőrzés minden oldalt érintett.

A tájékoztatást az intézmény nyilvános, elsődleges forrásaihoz kapcsoltuk, **nem** állítjuk, hogy az intézmény a 71 oldal minden mondatát hivatalosan jóváhagyta. Az átadott csomag tartalmazza a teljes, 71 soros auditot és a felhasználó számára olvasható oldalleltárt.

## Tételes módosítások

1. **71 oldalas tartalmi felülvizsgálat:** azonosítók, egyedi útvonalak, blokkstruktúra, hosszú szövegismétlődések, hivatkozások, keresőadatok, szerkesztői státusz.
2. **Helyesbített vagy bővített témaspecifikus tartalom:** intézményi bemutatkozás, történet, alapítvány, sportágak, csapatok, sportolók, edzők, tantestület, partnerségek, adatvédelem, álláskiírások, felvételi, vizsgák, közösségi szolgálat, tanévarchívum, könyvtár, dokumentumtár, szülői ügyintézés, ebédbefizetés, csengetési rend, hírek és a tanulástámogatás.
3. **56 új közvetlen elsődleges intézményi forráshivatkozás** került az oldalblokkokba. A forráslinkeket megkülönböztettük a belső navigációs célpontoktól.
4. **7 redundáns tartalmi szakasz eltávolítása**; az általános „Kapcsolódó hivatalos iskolai tájékoztatás” feliratok konkrét, témához illő elnevezést kaptak.
5. **Az évszámütközés pontos jelölése:** az iskola saját történeti oldalán 1887 és 1897 egyaránt felbukkan a kezdetek leírásánál. A v1.39.3 nem választ önkényesen közülük; az idővonalban egyik sem szerepel igazolt nyitóévként.
6. **Állások:** a korábbi, hiányt sugalló állapotleírás helyett a 2026. november 17-én megtekintett karbantartói és digitális kultúra szakos lehetőségek szerepelnek, kifejezett frissítési figyelmeztetéssel.
7. **Vizsgák:** az iskolai 2025-ös osztályozóvizsga-beosztás archívként jelenik meg. A 2026. őszi érettséginél az írásbeli és a novemberi szóbeli időpont elkülönül a jövőbeli vizsgáktól.
8. **Felvételi:** az első és kilencedik évfolyam eltérő eljárását, a dokumentumtípusokat és az aktuális időpontok ellenőrzésének szükségességét külön jelölik az oldalak.
9. **Sport és személyes adatok:** nem gyártottunk jelenlegi tanulói, edzői, csapat- vagy tantestületi névsort; az ilyen tartalom intézményi hozzájáruláshoz kötött.
10. **Dokumentumok:** az eredeti intézményi szabályzatok elváltak a honlap saját, nem hivatalos PDF-segédleteitől. A 3.14-es kézikönyv archív státuszát egyértelműsítettük.
11. **Cím és elérhetőség:** a gyakran előforduló intézményi cím az oldalblokkokban közös JSON-változón keresztül töltődik be, elkerülve az eltérő beírásokat.
12. **Tanulástámogatás:** a fókuszidőzítő, gondolatébresztő és helyi célkövető a valóban működő, önálló HTML-eszköz pontos részére vezető hivatkozást kapott. A korábbi hivatkozás hibás átirányításra futott.
13. **Kritikus forráslinkhiba javítása:** a régi, intézményi domainre mutató linkek szabályozott átírása korábban a külön megjelölt elsődleges forrásokat is eltüntette vagy belső oldalra cserélte. Most az ilyen, egyértelműen jelölt források kattinthatók és biztonságosan új lapon nyílnak meg. A régi, nem ellenőrzött linkekre vonatkozó szűrés fennmaradt.
14. **Keresőindex:** mind a 71 oldal keresőszövegét, metaadatait és szerkesztői státuszát újraszinkronizáltuk. A keresőindex verziója `1.39.3`.
15. **Verzió:** a cache-jelölés, a betöltött fő JS és a kiadási manifeszt elvárt verziója v1.39.3.

## Ellenőrzési státuszok (71 oldal)

| Státusz | Oldal | Jelentés |
|---|---:|---|
| Intézményi forrás vizsgálva | 38 | Nyilvános elsődleges anyaggal összevetett szerkesztői ellenőrzés. |
| Szerkesztői útmutatás | 12 | Tájékoztató tartalom, nem intézményi ténytanúsítvány. |
| Időérzékeny | 15 | Újraellenőrzendő hír, dátum, felvételi vagy állásinformáció. |
| Intézményi jóváhagyás szükséges | 6 | Aktuális névsor, csapat, edző, partnerek, archív anyagok egyes részei. |

## Megőrzött funkciók és FTP-kompatibilitás

- A v1.39.2 **8 különböző aloldalsablonja** és az akkor kialakított reszponzív menürendszer megmaradt.
- A `json/structure.json`, `json/config.json`, oldal-JSON-ok, központi médiakatalógus és minden eredeti médiaállomány a csomag része.
- Az SPA hash-alapú útvonalakat használ: statikus HTTP/HTTPS- és FTP-tárhelyen szerveroldali URL-átírás nélkül futtatható.
- A képek és dokumentumok helyi fájlok. A Bootstrap CDN és más engedélyezett külső linkek eléréséhez internet szükséges; a helyi adatokhoz és a saját JavaScript-funkciókhoz nincs GitHub Actions- vagy GitHub Pages-függés.
- A honlapot **nem** töltöttük fel éles FTP-tárhelyre. A ZIP tartalmát az iskolai tárhely gyökérkönyvtárába kell telepíteni, majd HTTP/HTTPS alatt ellenőrizni; a `file://` megnyitás nem megfelelő a JSON-letöltéshez.

## Tesztelés

Automatikus tesztek: `tools/test-content-v1-39-3.mjs` (tartalom, címkék, forráslinkek, eredeti HTML-eszközök és linkek), `tools/test-release-v1-39-0.js`, `tools/test-release-v1-39-1.js`, `tools/test-release-v1-39-2.mjs`, `tools/test-search-index-v1-39-1.js`, `tools/test-static-http-v1-39-0.js`, `tools/test-theme-sync-v1-37.js`, valamint a kiadási manifeszt ellenőrzése.

Böngészős kézi ellenőrzés: kezdőoldal betöltése; álláspályázati és történeti oldal; eredeti forráslink és az 1887/1897-es figyelmeztetés; a főmenü kinyitása és az Iskolánk almenü működése; tanulástámogatási linkek; az önálló `?embedded=1#modszerek` oldal helyi fókuszidőzítőjének és célkövetőjének látható betöltése. **Valódi fizikai telefonon és az iskola éles FTP-szerverén e körben nem történt teszt.** A megőrzött mobilviselkedést a v1.39.2 regressziós ellenőrzés védi.

| Teszt | Siker / összes |
|---|---:|
| Tartalmi és forráslink-ellenőrzés (`test-content-v1-39-3.mjs`) | **16/16** |
| Teljes strukturális regresszió (`test-release-v1-39-0.js`) | **948/948** |
| v1.39.1 navigációs regresszió | **7/7** |
| v1.39.2 oldalsablon-regresszió | **14/14** |
| Keresőindex / szövegkeresés | **74/74** |
| Statikus HTTP, oldal- és médiaútvonalak | **1293/1293** |
| Szinkronizált színtéma | **12/12** |

**Összesen 2364/2364 sikeres részellenőrzés** a fenti hét automatikus tesztcsomagban. A kiadási hash-manifeszt ellenőrzése az archiválási lépés része.

## Nyitott tételek és külső feltételek

1. Az intézménynek kell tisztáznia az **1887/1897-es kezdőévet**.
2. A jelenlegi **pedagógus-, edző-, csapat-, tanuló- és partneradatokat** csak jóváhagyott, adatvédelmileg ellenőrzött névsorral szabad feltölteni.
3. A **nyílt napok, felvételi időpontok, állások, hírek és események** nyilvános elsődleges forrásai idővel változhatnak; egy 2026. november 17-i ellenőrzés nem valós idejű automatikus frissítés.
4. Egyes médiaelemek tematikus illusztrációk, nem a konkrét esemény hiteles fényképei.
5. Az időzítések, keresőindex-frissítések és tartalomközzétételek csak a korábban meghatározott FTP-kompatibilis működés keretében értelmezhetők; szerveroldali cron / GitHub-ütemezés hiányában nincs automatikus éles feltöltés.

## A csomag ellenőrzésének és folytatásának fájljai

| Fájl | Cél |
|---|---|
| `dokumentacio/TARTALMI_OLDALLELTAR_v1_39_3.md` | A 71 oldal olvasható, tételes leltára. |
| `json/adatok/tartalmi-audit-v1-39-3.json` | Strukturált ellenőrzési státusz, eredeti forrás, oldalszintű változás. |
| `tools/review-content-v1-39-3.mjs` | Az egyszeri szerkesztői változtatások dokumentált receptje; a már javított fájlokra nem futtatandó újból automatikusan. |
| `tools/build-content-inventory-v1-39-3.mjs` | A leltár újragenerálása az auditból. |
| `tools/test-content-v1-39-3.mjs` | Tartalmi és hivatkozási tesztcsomag. |
| `tools/build-search-index-v1-39-1.js` | Aktualizált oldalindex újraépítése. |

**Következő fejlesztési irányok:** B – szerkesztői jóváhagyó/forráskezelő munkafolyamat; C – sportolói és csapatprofilok hiteles adatfeltöltési előkészítése; D – mobilos, kézi akadálymentességi és teljesítményteszt; E – a tools/ és assets/ kezelők lezárása az eredeti sorrend szerint.
