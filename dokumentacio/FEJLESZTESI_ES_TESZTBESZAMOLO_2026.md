# Csanádi Sportiskola 2026 – 16. fejlesztési kör: részletes fejlesztési és tesztbeszámoló

**Dátum:** 2026. november 15.  
**Kötelező kiinduló állapot:** `Csanadi_Sportiskola_2026_15_TELJES_WEBOLDAL_FTP_ES_KEZIKONYV.zip`.  
**Átadási cél:** teljes, önmagában telepíthető, statikus FTP-kompatibilis csomag; a `README.md`, a 66 tartalmi oldal és a nyolc segédoldal változatlan elérhetőséggel.  
**Iskolai FTP:** semmit nem töltöttünk fel, nem történt élesítés.

## 1. Pontosan mit kért a felhasználó?

A felhasználó az előző kiadás fejlesztési választójának mind a **tíz** pontját kiválasztotta, a korábbi funkciók, README és a teljes honlap megőrzésével. Teljes, ténylegesen megnyitható és a dokumentumtárban elérhető webes és PDF-kézikönyvet, központi és duplikációmentes JSON-adatkezelést, tételes tesztjegyzéket, új választható fejlesztési kört és sértetlen FTP-ZIP-et kért. A korábbi, középső címeres körmenü, az ahhoz körívvel csatlakozó két képfelület, a mobilon függőlegesen elhelyezett képpanelek és az egészében kattintható eseménykártyák megtartandók.

A 16. körben külön színkérést pontosított: **világos témában a zöld és a sárga is világos**, a sötét témában viszont **mindkét sportos szín sötét, visszafogott és a kék arculattal harmonizáló** legyen. Lila egyik témában sem használható.

**További, kiadás előtt érkezett kötelező pontosítás:** a két kép **egyetlen, egyszerre váltó képpár**, nem különálló két körhinta. Asztalon kizárólag a bal kép külső bal szélén lévő előző és a jobb kép külső jobb szélén lévő következő nyíl lapoz; mobilon az előző nyíl a felső kép külső felső, a következő az alsó kép külső alsó részén van. A felső kép **alján**, az alsó kép **tetején** kell a gombhoz pontosan illeszkedő félkör-kivágás. Sem a képek alatt, sem fölött nincs széles navigációs sáv. Külön tartalommegnyitó gomb nincs: a képen lehet megnyitni a hivatkozást; egy kis, a képre helyezett számozott képpárválasztó megmarad. **Minden oldal és elem, beleértve a webes kézikönyvet és a nyolc szerkesztőeszközt is, kövesse a világos/sötét/automatikus témát.**

**A legújabb tartalmi és felületi kérések:** a korábban név szerint szereplő tanulókról szóló tényleges sporteredmény-híreket ideiglenesen vegyük le. Helyükre jelenjenek meg külön megjelölt, **fiktív, név nélküli** sporthírminták – valós verseny, helyezés, publikálási dátum és hivatalos forrásnak látszó hivatkozás nélkül. A honlap nyilvános **láblécéből** vegyük ki a „Honlap használati útmutatója” és a „Központi beállítások szerkesztője” közvetlen linket. A PDF és a webes kézikönyv fájlként megmarad; a PDF a korábban kért módon a dokumentumtárban továbbra is elérhető, az eszköz pedig közvetlen URL-en működik.

## 2. A tíz kiválasztott fejlesztési terület eredménye

| # | Fejlesztés | A 16. körben megvalósult | Korlát |
|---|---|---|---|
| 1 | Mobilos minőségjavítás | Új `css/round16-responsive.css` és `round16-paired-hero.css` szabályok 320–768 px között; felül és alul összefüggő képpár, a helyes oldalon kivágott félkör, külső felső és alsó nyíl. | Valódi eszközös/pixelpontos megjelenés külön jóváhagyandó. |
| 2 | Sportos színek 2.0 | A `json/config.json` egyetlen színforrásként kezeli a világos pasztell zöldet `#BFE8C9` és sárgát `#F6E5AA`, valamint a sötét tompított zöldet `#315F4A` és sárgát `#766236`. Az eseménycímkék, a képpár nyilai és a képpárválasztó jól látható színes felületek, a honlap és a szerkesztők közös palettából olvasnak. | A képfájlok képpontjait nem színeztük át. |
| 3 | Körmenü 3.0 és képes oldaltérkép | A nyílbillentyűs és Home/End léptetés mellé betűs menüpontkeresés került; az ismétlődő Tab-fókuszcsapda-kódot eltávolítottuk. A két kép egyetlen `showPair` vezérlővel együtt, egyetlen időzítőből lép, a teljes képfelület kattintható. A széles navigációs sáv és a külön Tovább gomb megszűnt. | Képernyőolvasós és valós mobilos fókuszteszt nyitott. |
| 4 | Eseményközpont 2.0 | A korábban egészben kattintható eseménykártyák megmaradtak; az eseménydátum a naptárkártyán szemantikus `time` elem és a kártya felolvasható címkéjében dátum/hely jelenik meg. | Az egyedi eseményadatok tényszerűsége továbbra is intézményi feladat. |
| 5 | JSON-beállításellenőrzés 2.0 | A paraméterszerkesztő a színek kontrasztját (legalább 4,5:1), a szinonimaszerkezetet és a diagnosztikai listaméretet is ellenőrzi. Exportálható `config.json`, szerveres visszaírás nincs. | A kontrasztvizsgálat a két új kiemelésre és a központi szövegszínre vonatkozik, nem teljes WCAG-tanúsítás. |
| 6 | Médiakezelő 6.0 | A meglévő szerkesztés, duplikátumkeresés, SHA-256 és hivatkozásvizsgálat maradt; a CSV-leltár most a hiányzó alternatív szövegeket, hash-eket, tartalmi hivatkozásokat és felülvizsgálandó leírásokat külön jelöli. | A jelzés nem bizonyít tényleges szerzői jogot vagy hibát; kézi ellenőrzés szükséges. |
| 7 | PDF/dokumentumtár 6.0 | A dokumentumtár előnézeti ablaka felismeri a PDF-megjelenítőt kifejezetten nélkülöző böngészőt, így megnyitási és letöltési alternatívát ajánl. Elkészült a **3.2-es, 20 oldalas PDF** és a teljes webes kézikönyv; utóbbi külön témaátkapcsolót kapott. | Safari/iOS PDF-megjelenítést éles eszközön még próbálni kell. |
| 8 | Kereső 6.0 | A kereső új, központi `search.synonyms` szabályokkal a pontos találatok után kisebb súlyú rokon kifejezéseket is találhat. | A teljes relevanciaértékeléshez valós keresőkifejezés-készlet szükséges. |
| 9 | Diagnosztika 2.0 | A korábbi teljes, manifestből számított fájlméret, darabszám és böngészős átvitel mellett FCP és a leglassabb helyi fájlok mért ideje is látszik, JSON-ból szabályozott listahosszal. | A böngésző Resource Timing API-ja nem mindig mér minden erőforrást; ez nem Lighthouse-pontszám. |
| 10 | FTP-kiadás 2.0 | A kiadásellenőrző a README, belépési pont, konfiguráció, oldalindex és PDF jelenlétét külön, visszaállítási készültségi feltételként vizsgálja. A teljes manifest és ZIP újraépül. | Korábbi ZIP nélkül nincs valódi rollback; FTP-feltöltést vagy élő szerveres próbát nem végeztünk. |

## 3. Az egyszeri központi adatforrás és a módosítható mezők

A globális, felhasználó által megadható értékek hiteles helye a **`json/config.json`**, jelenleg **190 levélparaméterrel**. Az értékeket a modulok `js/site-settings-2026.js` használatával kérik le; külön másolat nem szükséges az egyes felhasználási pontokon. A `tools/parameterek-szerkeszto.html` az aktuális JSON-t olvassa, a megváltoztatott fájlt helyben exportálja. Típust, dátumablakot, időintervallumot, keresési limitet és az új kiemelések kontrasztját ellenőrzi.

**Adatcsoportok:** intézményi név/cím/OM/vezetés/fenntartó/kapcsolat/KRÉTA; tanév; navigáció, struktúra, tartalomútvonalak; frissítési gyakoriság és hálózati korlát; két tematikus felületszín-paletta és sportdiagramszínek; keresési oldal- és találati limit, javaslatok, kiemelés, szinonimák; offline és média-cache; képek darabszámai, automatikus váltások, kezdő–záró időablakok, gyűrűs menü arányai és betűzési idő; dokumentumelőnézet, keresés, szűrés és változatok; összes megjelenítési darabszám; esemény-/hír-/sportfrissítés; tanulói eredmények; akadálymentes érintési és fókuszméretek; a diagnosztikai limit és a leglassabb fájlok kijelzési száma; helyi eszközök fájlimport-határai.

**Fontos különbség:** egy konkrét esemény kezdete és vége az adott esemény **egyetlen saját rekordjában** szerepel a `json/adatok/esemenyek.json` fájlban. Ugyanígy egy dokumentum saját időbélyege a dokumentumrekordban található; ezeket nem szabad globális beállításként másolni. A DOM-, CSS- és algoritmusműködés rögzített műszaki konstansai nem szerkeszthető intézményi üzleti adatok. A projekt minden jövőbeli változtatásánál a duplikált konfigurálható értékeket kerülni kell.

A **190 mező teljes, tényleges JSON-értékekkel és útvonalakkal ellátott felsorolása** a `dokumentacio/KOZPONTI_JSON_PARAMETEREK.md`, a `utmutato.html` 12. fejezete és a PDF 12. fejezete. Az új mezők: `search.synonyms.*`, `runtime.navigation.typeAheadResetMs`, `runtime.diagnostics.slowestResourceCount`.

## 4. Teljes használati dokumentáció

- **`utmutato.html`**: a 66 tartalmi oldal, a nyolc helyi eszköz, a 190 paraméter, az útvonalak, menük, képlapozók, kereső, dokumentumok, szerkesztők, kiadás és hibakezelés kereshető, közvetlen hivatkozásos útmutatója.
- A webes útmutató `js/guide-theme-2026.js`, a nyolc segédoldal `tools/tool-ui-2026.js` közös, böngészőben mentett témapreferenciát és központi `json/config.json` palettaszíneket használ. A két korábban önálló, rögzített világos színű eszköz is világos/sötét váltást kapott.
- **`assets/documents/csanadi-weboldal-teljes-hasznalati-utmutato-2026.pdf`**: nyomtatható, megnyitható, **20 oldalas 3.2-es** használati kézikönyv, DejaVu magyar karakterkészlettel.
- **`json/adatok/dokumentumok.json` és `json/assets-inventory.json`**: a PDF fizikai méretét és SHA-256 értékét a kiadás újraszámolja, a dokumentum verziója `3.2.0`.
- A PDF a honlap dokumentumtárában megnyitásra és letöltésre továbbra is elérhető; a webes útmutató közvetlen PDF-linkeket is tartalmaz.
- Az `index.html` nyilvános láblécében **nincs** külön kézikönyvlink és beállításszerkesztő-link. A Dokumentumtár menüpont marad; a szerkesztő a közzétételi munkafolyamatban külön, közvetlen URL-ről érhető el.

## 4/A. Diákhírek eltávolítása és fiktív sportbemutatók

Nyolc, korábban név szerint szereplő tanulóhoz kötött sporteredmény-rekordot kivezettünk a `json/adatok/hirek-hivatalos.json` forrásból. A rekordok **új, `minta:` kezdetű azonosítóval, `status: "sample"` jelöléssel** és kizárólag általános sportági, generált tartalommal szerepelnek; címük „MINTA – …” kezdetű. Személynevet, osztályt, kitalált pontos versenyhelyszínt, helyezést, dátumot vagy hivatalos forráslinket nem hordoznak. A `js/news-2026.js` a mintákon külön **FIKTÍV MINTA** jelvényt és „Nem valós hír” feliratot jelenít meg, és nem kínál „Eredeti iskolai közlemény” gombot. A kereső megtalálhatja a bemutató példákat, de a kapcsolódó hivatalos hírek ajánlórendszere kizárja a `sample` státuszt.

A `json/oldalak/hirek-es-esemenyek/hirek/sporthirek.json` és `json/oldalak/sport/sportolok.json` oldalakról a konkrét tanulói nevek és rájuk vonatkozó állítások kikerültek. A korábbi, már eleve név nélküli `json/adatok/tanuloi-sikerek.json` demókártyák megmaradtak. A történeti, felnőtt olimpikonok intézményi büszkeséglistája nem aktuális diákhír, ezért változatlan. **Valós személyekről szóló új diákhírek nem készültek; a későbbi éles közzététel külön jóváhagyást igényel.**

## 5. Ellenőrzési eljárás és ténylegesen bizonyított eredmények

Az átadáskor a `test16.py` teljes helyi ellenőrzése az alábbiakat vizsgálja: minden JSON szintaxisa, minden JavaScript szintaxisa a HTML-be ágyazott programokkal együtt, 66 oldal és 65 menüpont kapcsolatai, útvonalütközések, a 190 központi paraméter, a név szerinti diákhírek kizárását, a fiktív sporthírminták kötelező egyértelmű jelölését, a két nyilvános lábléchivatkozás eltávolítását, a hírlisták központi lapméretét, a két téma alap-kontrasztja és sportkiemelés-kontrasztja, a lila kódszínek hiánya, a CSS-konfiguráció bekötése, a szinkron képpár egyetlen időzítője, az összekötő mobilos félkörök, a külső nyilak és a külön tartalomgomb hiánya, a képpárválasztó, a körmenü betűs navigációja, a nyolc segédoldal és a webes kézikönyv témaváltása, kattintható események és időbélyeg, kereső szinonimái, PDF-tartalékút, médiaaudit, bővített diagnosztika, visszaállítási ellenőrzés, globális mezők duplikációtilalma, README, nyolc segédoldal, helyi HTML-linkek, PDF megnyithatósága és szöveglistája, dokumentumtári hash/méret, kommentmentesség, FTP-kompatibilis fájltípusok és a ZIP sértetlensége.

**A 16. kör tényleges eredménye: 47/47 automatikus forrás- és állományellenőrzés sikeres, 0 hiba** – a ZIP teljességi ellenőrzésével együtt 48 külön teszt. Ezek között **88 JSON**, **41 JavaScript**, **11 HTML** ellenőrzése és a manifestben szereplő **729 fájl** méretének és SHA-256 értékének újraszámítása volt. Mind a 66 oldal útvonala egyedi, a PDF 20 oldalas, a 190 paraméter a dokumentációban szerepel. A világos alappal kapcsolatos központi szövegkontraszt 5,99:1, a sötété 8,72:1. A négy sportos címkekombináció kontrasztja rendre 10,76:1, 11,53:1, 6,11:1 és 4,90:1. Az előző (15.) kiadás 28/28 eredményét nem tekintjük új böngészőtesztnek. A mostani futtatás külön `test16_results.json` naplóban szerepel. A manifest minden kiadott fájl méretét és hash-ét tartalmazza, saját magát kivéve. A ZIP összes tagját külön újraellenőrizzük.

### Amit nem igazolunk automatikusan

- A helyi Chromium futtatását a környezet `socket() failed: Operation not permitted` hibával blokkolta. A 320/360/390/430/768 px vizuális és tényleges érintéses próbát **nem állítjuk elvégzettnek**.
- Nincs végrehajtott Firefox-/Safari-/Android-/iOS-/VoiceOver-/NVDA- és teljes WCAG 2.2 AA audit.
- Nincs valós Lighthouse/PageSpeed-teszt, teljes offline hálózatlekapcsolási próba, élő FTP-teszt vagy visszaállítási művelet.
- Nincs minden intézményi dátumra, hírre, képre, médiára és PDF-re kiterjedő, felelős személy által aláírt hitelesítési és jogi jóváhagyás.
- A forrásellenőrzés nem egyenértékű a böngészőben minden képernyőszélességen kipróbált funkcionalitással.

## 6. Élesítési korlátok és visszaállítás

A honlap kizárólag statikus HTML-, CSS-, JavaScript-, JSON-, PDF- és médiaállományokat igényel; nincs PHP, Node.js vagy GitHub Actions függőség. A Bootstrap verzióhoz kötött, külső CDN-ről töltődik, ezért teljesen offline működés nem garantálható. A hash-alapú SPA SEO-korlátait a megőrzött `noindex,nofollow` fejlesztési jelölés nem oldja fel. Az aktuális intézményi tartalmakat és a médiák jogosultságát felelősöknek külön kell jóváhagyni.

A csomagot telepítés előtt HTTP(S)-es teszthelyre kell feltölteni és ellenőrizni. Visszaállításhoz a **korábbi teljes ZIP**, változatlan mappaszerkezet és a kiadási SHA-256 jegyzék megőrzendő. A helyi szerkesztőfelületek csak exportálnak, nem módosítják automatikusan a tárhelyet. A fejlesztés során az iskolai FTP-n **semmi nem változott**.

## 7. Az átadott állományok

1. `Csanadi_Sportiskola_2026_16_TELJES_WEBOLDAL_FTP_ES_KEZIKONYV.zip` – teljes honlap, mind a 66 oldal, az eredeti README, a teljes dokumentáció, a tools/ és minden média.
2. `Csanadi_Sportiskola_2026_TELJES_HASZNALATI_UTMUTATO_3_2.pdf` – a PDF külön is letölthető.
3. `Csanadi_Sportiskola_2026_16_RESZLETES_TESZTBESZAMOLO.md` – ez a jelentés külön példányban.
4. `Csanadi_Sportiskola_2026_KOZPONTI_JSON_PARAMETEREK.md` – a globális JSON mind a 190 paramétere.

Az átadáshoz új, több elemet egyszerre kiválasztó fejlesztési választó is tartozik. Az ott felajánlott jövőbeli lehetőségek nem részei automatikusan ennek a kiadásnak.
