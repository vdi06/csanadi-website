# 1.53 – tételes forráskód- és felületvizsgálat

**Állapot:** helyben javított és kódszintű ellenőrzésre előkészített kiadás. Nem közzétett végleges webhely.

## Konkrétan megtalált és javított problémák

| Érintett elem | Forráskódban azonosított ok | 1.53-es javítás |
| --- | --- | --- |
| Mobil nyitó | A régi képváltó 9 diaállapotot, lapozógombokat és automatikus váltást állított elő; az 1.52-es fix bejárati fotó még mindig nagy helyet foglalt. | Külön `static-hero-v152.js`: egyetlen, JSON-vezérelt **középre igazított címer**, cím, leírás és link; nincs fotó vagy képváltó. |
| Mobil üres magasság | A régi `#global-hero:empty` akár 247–555 px magas üres helyfoglalót is létrehozott. | Mobilon `display:none`, `min-height:0`; a címeres résznek nincs képarányos, nagy képhelyfoglalója. |
| Mobil/asztali tartalomkeveredés | Ugyanaz a kezdőlapfüggvény készítette az asztali kirakatot és lenyíló sorokat mobilon is. | A generált mobil alkalmazás külön `renderMobileHomePage()` ágra vált, a tartalomsorrend a `runtime.mobileHome` JSON-ban van. |
| Négy sportkép láthatatlansága | A négy kép rétegsorrendje negatív `z-index`-et használt; a régi görgetésfigyelő tartalomláthatóságot is vezérelt. | Pozitív, tételes festési sorrend kép 0 / fátyol 1 / szöveg 2 / keret 3; a kártyák nem kerülnek 0 opacitású várakozásba. |
| Kezdőlapi zsúfoltság | Külön asztali kirakat, ismétlődő gyorslinkek és négy 100%-os lenyíló csoport egymás alatt. | A három kirakat-linket nem duplázza a gyorslista; a gyorslista 6 link + keresés, 4 oszlop és 12 px rés; a 4 lenyíló csoport kétoszlopos 2×2 elrendezésben, 16–18 px közökkel. |
| Hiányzó „Oldal tetejére” | A `round29-home.js` asztali szakasznavigátora kizárólag tartalmi hivatkozásokat adott a listához. | Első, teljes szöveges „Oldal tetejére” gomb, billentyűzetes fókusz és csökkentett mozgás tiszteletben tartása. Felirata `config.json`-ból jön. |
| Belső térközök | A régi CSS egyes konténereken eltérő gap/margin deklarációkat helyezett egymásra. | Külön, utoljára betöltött `v152-spacing-contract.css`: a tartalom- és kártyaszülőkön 12–30 px tényleges rácsrések, egymást követő szakaszok között külön margó és belső padding. |
| Megosztott fájlok | `mobile/assets`, `desktop/assets` és közös JSON-adatok korábban platformonként duplikálódtak. | Futásidejű `shared/assets` + `shared/json`, mindkét ágból ugyanaz a 940 közös fájl. |
| Ikonok, képek, PDF-ek | Egyes modulok közvetlen `assets/...` URL-t írtak a DOM-ba, mely a közös mappa létrehozása után hibás lett volna. | URL-adapter a média, PDF-megtekintő, galériák, címer, kapcsolódó képek, szerkesztő és más adatmodulok számára. |
| PDF-kézikönyv mérete | A dokumentumregiszter 145 833 bájtot tartalmazott, a valódi PDF 219 786 bájt. | JSON-méret javítva; a regiszterbeli SHA-256 már egyezett a fájllal. |
| Diagnosztika | Régi háromrészes verzióregex és platformmappás manifest-feltevés. | Kétrészes 1.53-verzió és gyökérmanifest, megosztott fájlútvonalak ellenőrzése. |
| Kapu, címer | Korábban külön kérés volt a címer mögötti ovális eltávolítása és a kapukontúr 3D-sítése. | A forrásban ellenőrizve: áttetsző, keret nélküli címer; négy kitöltetlen aranykontúr-réteg a kapun. |

## Két felület – konkrét DOM és elhelyezkedés

### Telefon

- A fejléc egy középre rendezett, háromoszlopos CSS-grid: bal oldalon 3 vezérlő, középen címer, jobb oldalon 2 vezérlő. A két szélső oszlop `minmax(0,1fr)` és azonos szélességű; a címer 58–62 px. A 320–650 px szélességekre ellenőrzött számítás szerint az ikoncellák legalább 24 px szélesek, az interaktív gombok célterülete külön legalább 44 px.
- Egyetlen fix címer a `site.crestImagePath` JSON-beállításból, `width:clamp(100px,28vw,134px)`, `object-fit:contain`, `background:transparent`, `border-radius:0`. A külső szülő flex-oszlop, `align-items:center`, `justify-content:center`, 12–18 px térköz; a belső szövegoszlopnak 10 px `gap` és explicit `text-align:center` van. Sem 4:3-as fotó, sem képes helyfoglaló nincs.
- A mobil főtartalom saját `.cs-mobile-home` oszlop, 20 px `row-gap`, 12 px oldalsó tér; a kártyák kis telefonon 1, legalább 520 px-en 2 oszlopban rendeződnek.
- Az asztali hero, az asztali 10-elemes gyorselérési sor és a 4 asztali lenyíló blokk **nem jön létre** a mobil kezdőlapon.

### Asztali

- A fejléc középső címerhelye két szimmetrikus, `1fr` szélességű oldallal; a cselekvésgombok szükség esetén törhetnek, és saját szülőjükön van középre rendezés.
- A képkirakat 4 médiakártyát jelenít meg (egy nagy és három kisebb); a kép tényleges DOM-eleme `picture > img`, a közös médiaregiszterből. A kirakat alatt 3 témalink van.
- A JSON-gyorslista 6 oldalhivatkozás és 1 kereső, legalább 1021 px-en négyoszlopos rács, `gap:12px`. A négy lenyíló témacsoport 2×2 rács, 16 px vízszintes és 18 px függőleges köz. A szülő `.home-canvas` valódi 12 oszlopból áll, a lenyíló elem 6 oszlopot foglal.
- A szakasznavigátor első eleme „Oldal tetejére”; utána következnek az elérhető tartalmi részek.

### Belső oldalak

- 79 oldal, 507 rekurzívan ellenőrzött JSON-blokk; 6 gyökérmenü-csoport. A tartalom egy `article-flow` blokkban épül fel, a szakaszok `h2` címet, egymástól elkülönített 16–26 px közötti margót/paddinget kapnak; a kapcsolódó tartalom, galéria, dokumentumok és külön szolgáltatások az adott JSON-útvonalból indulnak.
- A táblázatok vízszintesen görgethető burkolóba kerülnek, a képek nem lépik túl a szülő szélességét. A kapcsolódó kártyarács és képgaléria külön 12–20 px közt hagy helyet.

## Ellenőrzések és korlátok

| Ellenőrzés | Eredmény |
| --- | --- |
| 79 oldal rekurzív JSON-feldolgozása | 507 blokk; 0 statikus szerkezeti vagy hivatkozási jelzés |
| 1.53 mobil kezdőlap DOM-futtatás | 1 címer, 1 főcím, 1 link; 0 képváltó, 0 nagyméretű fotó és 0 lapozógomb. Az asztali hero kódja külön marad. |
| Közös médiák és dokumentumok | 656 egyedi, JSON-ban regisztrált állomány bájtméret, SHA-256 és formátum ellenőrzése |
| Közös JSON | 112 fájl helyes szintaxisú és bájtra egyezik a forrással |
| A két ág közti fizikai fájlszétválasztás | Mobil és desktop saját kód; egyik ágban sincs assets-másolat, csak saját shell-JSON |
| Importgráf | 109 modulkapcsolat, másik platformból nincs import |
| CSS URL- és oldalváz-hivatkozások | 154 CSS, 120 helyi URL, 0 hiányzó fájl (a fájlkészlet adott pillanatában) |
| CSS statikus szintaxis | Mobil: 33 lap, 6128 szabály. Desktop: 31 lap, 5848 szabály. 0 feldolgozási jelzés |
| Elrendezési deklarációk felülírása | Mobil: 431, asztali: 430 azonos kulcsú layout-felülírás leltározva. Ezek **nem** azonosak 431/430 tényleges hibával. Részletek a gépi JSON-jelentésben. |
| Valódi iPhone és Android | Nem végzett teszt |
| Chromium interaktív teszt | A helyi böngészőindítás a futtatókörnyezetben „socket() Operation not permitted” hibával megszakadt; nem állítunk sikeres vizuális tesztet. |

**Fontos:** a statikus kódelemzés tételesen ellenőrzi a deklarált elrendezést, importokat és fájlokat, de nem helyettesíti a böngészőben mért végleges CSS-cascade-et és a tényleges készülékes megtekintést. A Bootstrap CDN teljes külső CSS-e szintén nem része a helyi CSS-lexikai vizsgálatnak.

## Újrafuttatás

`node tools/run-audit-v152.mjs`

Közzétételre sem FTP-n, sem GitHubon nem került sor. Az 1.51-es kiadás külön megőrzött változat; az 1.53 csak a kért ellenőrzések után tekinthető kiadási jelöltnek.
