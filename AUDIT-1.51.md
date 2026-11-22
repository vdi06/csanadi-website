# Csanádi weboldal 1.51 – kódszintű felület- és működésaudit

**Dátum:** 2026. november 22.  
**Módszer:** a generátor, a DOM-építő JavaScript, a JSON-adatok, a betöltött CSS-szabályok, a töréspontok és az automatizált kódpróbák ellenőrzése. A képletek a deklarált CSS-ből számított, *várható* méretek; **nem böngészőben mért geometriák és nem képernyőképes szemrevételezések**.

## 1. Miből áll elő ténylegesen az oldal?

1. A gyökér `index.html` HTML-törzse üres. Nem tartalmaz iskolai címet, menüpontot, képet, hírt vagy láblécet.
2. A `js/platform-router-v149.js` az érintésre optimalizált, hover nélküli eszközöket vagy a legfeljebb 768 CSS-pixeles nézeteket a `mobile/` ágba; minden más esetet a `desktop/` ágba irányít. Ágváltáskor teljes újraindítás van.
3. A kiválasztott ág a saját `js/`, `json/`, `css/`, `assets/` és a `mobile/` vagy `desktop/` almappájából tölt. A relatív fájlutak a kiválasztott ág gyökerére mutatnak. A megosztott forrásfájlok a ZIP-ben két **külön fizikai példányban** szerepelnek; a két ág nem importál egymásból. Külső függőség a Bootstrap CDN.
4. A `json/site-shell.json` 12 gyökérszintű DOM-elemet ír elő: belépőkapu előtöltő, ugróhivatkozás, fejléc, menüpanel, főképernyő-képtér, menüindító, útvonalállapot, `#app`, oldalsó hivatkozás, lábléc, keresőpanel, üzenetpanel.
5. A `json/page-index.json` 79 oldalt regisztrál; a `json/structure.json` 6 fő menücsoportot ír le. A tartalomban 245 `section`, 12 `accordion`, valamint 1–1 `hero`, `sports-successes`, `live-dashboard`, `quick-links`, `home-editorial` blokk található. A kezdőoldal önmagában 8 JSON-blokkot és 9 képváltódiát tartalmaz.

**Fontos eltérés a teljes JSON-célhoz képest:** az oldal- és médiatartalom nagy része, valamint a fejléc vázlata JSON-alapú, de bizonyos UI-feliratok és kiegészítő kezdőlapi kártyák még JavaScriptben lévő szövegekből keletkeznek (`js/premium-home-2026.js`, `js/round29-home.js`, egyes modulok). Emiatt azt állítani, hogy *minden adat* kizárólag JSON-ban van, jelenleg hamis volna. A külön kapucímer és a mobil első festés tartalékképének útvonalát ebben a kiadásban kifejezetten áthelyeztem a központi JSON-ba.

## 2. Mobil: milyen elemek és miért ott jelennek meg?

| Elem | Létrejövő elemek száma/sorrendje | Kódban lévő igazítás, méret és köz | Keret és viselkedés |
|---|---|---|---|
| Felső iskolanév | 2 sor: főnév + alcím | `display:grid`, `justify-items:center`, gyermekeken `text-align:center`, két sor között **1 px** | Nincs külön szövegkeret. 36 px-nél hosszabb görgetésnél a két sor magassága és láthatósága 0 lesz. |
| Mobil eszköztár | **3** bal oldali ikon: Facebook, Instagram, KRÉTA; **1** középső címer; **2** jobb oldali ikon: keresés, megjelenési mód | Háromoszlopos `grid`: `1fr / 62px / 1fr`, 8 px rés; 419 px-ig `1fr / 58px / 1fr`, 4 px rés; 359 px-ig 3 px rés. Baloldalt `repeat(3,1fr)`, jobboldalt `repeat(2,1fr)`, a gyermekek között 3 px. A címer `grid-column:2`, `justify-self:center`. | Külső ikonok halvány arany keretes, lekerekített gombok, **legalább 44 px magasak**. A *fejlécben* a címer körül marad az arany kör: a „ne legyen ovális” kérés csak a **kapu feletti logóra** vonatkozott. |
| Mobil jelmondat | 1 sor, de törhet | `text-align:center`; betűköz `.15em` | Nincs keret. Görgetéskor a nagy iskolanévvel együtt eltűnik. |
| Olvasási csík | 1, 2 px magas csík | A fejléc aljára, `left:0; right:0; bottom:0`, a haladás `scaleX()` értékből | Nem fókuszálható, nem tolja le a tartalmat. |
| Mobil képterület | 1 nagy fotófelület + 1 fotófelirat | A saját `cs-mb-cinema` tartalma: `width:100%`, `max-width:680px`, `margin:0 auto`; fotó `aspect-ratio:4/3`, `max-height:50svh`; 419 px-ig `45svh`, `object-fit:cover`. A felirat `left:0;right:0;text-align:center`. | A képkeret az alkalmazás saját felülete. Az **asztali hero** ugyanekkor `display:none`, `height:0`, `min-height:0`, `margin:0`, `padding:0` – nem foglalhat külön üres sávot. |
| Kép alatti szövegek | Kategória + cím + összefoglaló = **3** szövegelem | `display:flex`, oszlopirány, `align-items:center`, `justify-content:center`, `gap:13px`, belső tér `23px 15px 30px`. Cím és leírás `margin:0 auto`, `text-align:center`; cím maximum 18 karakter széles (`18ch`), leírás 36ch. | Külön keret nélkül, kék háttéren. |
| Képváltó sor | **2** nyílgomb + **1** középső számláló és haladáscsík | `grid-template-columns:52px minmax(0,1fr) 52px`, `gap:10px`, `max-width:490px`, mindegyik nyíl **52×52 px minimum**. A középső számláló és 3 px csík közötti rés 8 px. | A nyilak enyhe arany keretet kapnak; a csíknak saját lekerekítése van. |
| Fotóhoz tartozó műveletek | **1** témakörnyitó hivatkozás + **1** szünet/folytatás gomb | Flex, vízszintesen középre, **10 px** rés; `flex-wrap:wrap` miatt keskeny helyen sorváltás; `min-height:48px`. | Lekerekített halvány keret. Csökkentett mozgás/adatkímélő profil esetén a lejátszásgomb rejtve van. |
| Mobil főmenü | 6 gyökércsoport, választás után 2. és 3. szint; minden alcsoporthoz közvetlen oldalnyitás | Külön `mobile/reboot-menu` DOM. Keskeny/magas kijelzőn egy- vagy kétoszlopos kártyarács; nagyobb és elég magas telefonon 6 elemből álló körkártyás nézet. Rövid, fekvő érintős telefonon **rács**. | Teljes képernyős fedőpanel; 0 keret a külső dialóguson; fókusz és Escape/visszalépés kezelve. |
| Fő tartalom | 8 kezdőlapi adatblokk + kiegészítő kártyák; aloldalak JSON-ból | A fő tartalmi keret `min(100% − 2×gutter,1160px)` és `margin-inline:auto`. Mobilon a felsorolt többoszlopos adatgridek **egyetlen `minmax(0,1fr)` oszlopra** váltanak. A részblokkok saját `gap` tulajdonságai ettől függetlenek. | A kártyák keretét mindig a saját CSS-ük dönti el; nem feltételeztem, hogy minden kártya azonos. |

### 2.1. Szélességszámítás – kódból, nem látott képből

A középső címer helyét a **két egyenlő oldalsó fr oszlop** garantálja, nem pusztán a `text-align:center`. A 320 px-es mobilnál a héj két 8 px-es oldalpaddigja, az 58 px-es címer és két 3 px-es rés után oldalanként `(320−16−58−6)/2 = 120 px` marad. A három bal oldali gomb oszlopszélessége a két 3 px-es belső rés után `(120−6)/3 = 38 px`, a két jobb gombé `(120−3)/2 = 58,5 px`. A gombmagasság külön **44 px**. Így a 320 px-es oszlopképletben nincs vízszintes túlcsordulás; valódi böngészőben a betűkészlet és a környező CSS hatását még ellenőrizni kell.

A 390 px-es álló telefonon: a héj 12–12 px paddigja mellett a központi 58 px-es mező és két 4 px-es köz után a két oldali mező `(390−24−58−8)/2 = 150 px`; egy bal oldali ikon 48 px oszlopot kap. A 390 px széles 4:3 kép számított magassága 292,5 px, amely a 45svh-korlát alá esik egy 844 px magas képernyőn. A filmes szövegrész **nem abszolút pozícióban lebeg** a kép fölött: normál dokumentumfolyamban követi.

### 2.2. Mobil görgetés és képváltás

- Görgetéskor csak a mobil fejléc ikon/menü sora marad tapadva; a film és a szöveges vezérlők a dokumentummal együtt távoznak. A régi asztali filmkonténer mobilon nulla magasságú és rejtett.
- A kilenc képből a bejárati kép kerül első helyre. A megjelenő dia címét/leírását és a műveletek szövegeit a `home.json` diaadatai és `mobileUi` mezői adják.
- Az első mobilkép `load/error` útját a DOM-ba illesztés **után is** újraellenőrzi. Sikertelen képnél következő elérhető diát keres. A JSON-vázban már első festéskor rendelkezésre áll a helyi tartalékkép útvonala; nem az első képváltó JS-függvény lefutásától függ.
- Egy lapozás nem tüntetheti el idő előtt az előző képet; csak sikeres következő kép után indul az áttűnés. A megszakadt/késői animációból is feloldja a gombokat. A görgetéssel látómezőből kikerült film automata lapozása szünetel.
- A `reveal-on-scroll` elemek mobilon CSS-ből is láthatók, tehát egy elmaradt IntersectionObserver-esemény nem hagyhat szándékosan üres kártyasávot.

## 3. Asztali: konkrét DOM- és CSS-szerződés

| Elem | Darabszám / szerkezet | Igazítás és térköz | Kód alapján várható működés |
|---|---|---|---|
| Iskolanév | Főnév + alcím, közös márkahely | `brand-row`: oszlopirányú flex, `align-items:center`, `justify-content:center`, `gap:8px`, padding `10px clamp(8px,2.2vw,28px)`. | Teljes iskolanév megmarad, nem mobilcím másolata. |
| Fő műveletsor | Bal oldali akciócsoport + **1** középső címer + jobb oldali akciócsoport | `grid-template-columns:minmax(0,1fr) clamp(76px,8.2vw,112px) minmax(0,1fr)`, rés `clamp(4px,1vw,16px)`, középső `justify-self:center`. Bal: `justify-content:flex-end`, jobb: `flex-start`. Az ikonok **flex-wrap:wrap** módon törnek. | A középső címer matematikailag középre kerül, az eltérő számú akció nem tolja el. A címer a menüindító. |
| Hat fő navigációs csoport | 6 `<details>` elem, cím + bővebb panel; első szintű alcsoportok **9, 7, 4, 4, 4, 10** | A navigáció mezői a saját asztali `desktop/navigation.js`-ben készülnek. Az egyik nyíló csoport bezárja a másikat. | Az alapadat a 6 gyökérből és kapcsolt utódokból álló JSON menükatalógus. |
| Kezdőlap képes nyitótere | 1 asztali képváltó, 9 dia | Saját `js/hero-2026.js`, eltér a teljes mobilfilmtől. A görgetési változók alapján a hero vágási sugara 170%-ról 0-ra csökken, miközben a fejlécet külön, rögzítetten a címer vezérli. | A teljesen eltűnt hero a természetes görgetési útján távozik; a `clip-path` nem jelent önmagában külön, új kártyát. Az előző sikeres kép megmarad sikertelen váltáskor. |
| Asztali kép automata váltása | 1 időzítő; 9 kép | A választott dia képeleme csak dekódolás után válik aktívvá; a `mouseenter`, fókusz, rejtett dokumentum, lassú hálózat, nyitott menü tiltja az automatikát. | Az időzítő aloldalra lépéskor nem szűnik meg végleg; visszatérve újra működhet. Az első hibás képnél másik képet keres. |
| Tartalmi oldalak és lábléc | 79 útvonal + a JSON váz lábléce | `--cs-content-limit` értéke 1160px; középre `margin-inline:auto`; címsorok és breadcrumbs `text-align:center`. Az olvasási szélesség korlátozott (`76ch`). | A menük, dokumentumlista és sportgaléria oldalai ugyanabból a katalógusból dolgoznak, mint mobilon; a CSS és a prezentáció külön ágon él. |

**Asztali fejlécből eredő korlát:** az 1fr-os oldalsávok belső műveletei a `flex-wrap:wrap` miatt több sorra törhetnek. Ez fenntartja a címer szimmetriáját, de nem garantál azonos *vizuális sormagasságot* a két oldalon minden felirathossz mellett. Ennek valós tipográfiai megítéléséhez böngészőmérés kell.

## 4. A kapu és a címer – a két külön kívánság

Az előtérben a belépőképernyő mindkét platformon megjelenhet. Kilenc fotókocka közti keveréssel animál, alapértelmezett időtartama **asztalon 2250 ms, telefonon 1750 ms**. A fotó követéséhez a kapu célterülete 16:9 `cover`-geometriából számított szélességet és magasságot kap, a `left:50%` középre helyezéssel.

- **A kapu fölötti címer:** `left:50%`, `transform:translate(-50%,-50%)`; `background:transparent`, `border:0`, `border-radius:0`, `box-shadow:none`. A világos téma külön szabálya is átlátszó és keret nélküli. Nincs mögötte sem arany ovális, sem más kör.
- **Maga a kapu:** egy ívelt SVG-sziluett (nem négyszögletes keret), négy *kitöltetlen* vonalréteg. A sötét, kissé eltolt `depth` az anyag mélysége; a 3,2 px-es meleg arany `contour` a fő perem; az 1,25 px-es világos `rim` a fémes fény; a vékony középillesztés `seam` az ajtószárnyakat jelzi. Egyetlen réteg sem tölti fel arany színnel a fotót. Hover/fókusz alatt visszafogott erősödés, nem folyamatos villódzás.
- **Átugrás:** a korábban egymásnak ellentmondó `z-index:14` és `z-index:9` deklarációkból egyértelmű `z-index:14` maradt. Az átugrás gomb a kép alatti sávról elérhető.
- **Fejléc címer:** a külön fejlécben levő címer arany körvonala **szándékosan megmaradt**. Ha ennek is el kell tűnnie, az külön tervezési döntés; a felhasználó kifejezetten a **kapu feletti** címer oválisát tiltotta.

## 5. Ellenőrzési és javítási eredmény

| Kódból ellenőrizhető állítás | Bizonyíték / állapot |
|---|---|
| Közös üres HTML-váz, két külön futási mappa | `verify-platform-v149.mjs` – sikeres importgráf- és mappahatár-ellenőrzés |
| 79 útvonal, 183 médiabejegyzés, 19 dokumentum és hivatkozások | `verify-regression-v151.mjs` – sikeres |
| 12 gyökér-vázelem, 6 menücsoport, 9 film, center/gap/border-szerződések | `verify-layout-contract-v151.mjs` – sikeres |
| Mobil 3+1+2 fejléc és billentyűvel kezelhető menü | `verify-reboot-shell.mjs`, `verify-reboot-menu.mjs` – sikeres a kódszintű DOM-próbákon |
| Mobil első kép hibája, nyilak, időzített lapozás és képi versenyhelyzet | `verify-reboot-hero.mjs`, célzott állapot- és forráspróbák; korai hiba utáni újraszerelés javítva |
| Asztali sikertelen képcsere után előző jó kép megmarad | `verify-v14329-desktop-hero-recovery.mjs` – sikeres |
| Ténylegesen futó iPhone Safari és Android Chrome | **Nem bizonyított**, készüléken még tesztelendő |
| Valós böngészőben minden elem pontos képernyőkoordinátája | **Nem bizonyított**; a fenti értékek CSS-ből számítottak |

**Korlát és következő lépés:** egyes `source/tools/verify-v14*` és `verify-m1*` történeti tesztek régi HTML-be írt elemeket, korábbi 768px-es kizárólagos töréspontot vagy korábban CSS-be égetett tartalékképet várnak. Ezek nem a jelenlegi kettéosztott 1.51 rendszer szerződései, és emiatt nem mind futnak sikeresen. A friss 1.51 kiadási, útvonal- és elrendezési tesztek sikeresek; a történeti tesztcsomagok teljes átvezetése továbbra is külön feladat. **Nem állítom, hogy a régi összes teszt sikeres.**

**Közzététel:** nem történt FTP-, GitHub- vagy éles webhelymódosítás. Az 1.50-es kiadás megmaradt; az 1.51-es új ZIP külön teljes telepítési csomag.
