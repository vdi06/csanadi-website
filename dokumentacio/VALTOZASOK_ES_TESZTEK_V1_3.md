# Csanádi weboldal – v1.3.0, közös A+B+C+D fejlesztési és ellenőrzési jelentés

**Kiinduló verzió:** v1.2.0. **Kiadási elv:** egyetlen ZIP, statikus FTP- és GitHub Pages-kompatibilis fájlokkal. Az éles oldalra és az FTP-re semmit nem töltöttünk fel.

## A felhasználó négy együtt kért fejlesztési területe

| Terület | Elkészült | Nyitott rész |
|---|---|---|
| A – teljes vizuális finomhangolás | Az SPA és mind a kilenc önálló HTML-felület közös, új `css/quality-polish-v1.css` stílust kapott; fókuszjelzés, túlcsordulásvédelem, kisebb képernyők margói, gombállapotok, táblázatok és médiák mérethatárai. | Vizuális eszközteszt és pontos, oldalankénti képernyős korrekció. |
| B – tartalom és hivatkozások | 65 aloldalból álló automatikus audit, 193 belső útvonalhivatkozás és a régi domain ellenőrzése. A program 0 régi domaines hivatkozást és 0 hiányzó belső útvonalat jelzett. | 55 intézményi tartalom hitelesítése, a külső webcímek élő HTTP-ellenőrzése és médiafelhasználási jogok. |
| C – teljesítményoptimalizálás | A Bootstrap CDN-hez korai kapcsolatfelépítés (`preconnect` és `dns-prefetch`); verziózott stílusbetöltés, új gyorsítótár-verzió (`csanadi-r-v1.3.0`). A korábbi képek lusta betöltését és a Bootstrap fix CDN-verzióját megőriztük. | Valódi hálózati sebességmérés (Lighthouse, lassú mobilhálózat), JS/CSS-kötegelés mérés utáni mérlegelése. |
| D – 31 elfogadott aloldali szabály | Készült reprodukálható, 65 oldalas, 31 szabályos JSON-jegyzék; külön szerepelnek a forrásból igazolható, közösen megvalósított és nyitott státuszok. | Nem bizonyítható minden vizuális szabály böngészős teszt és az eredeti 31 kérdés teljes szövege nélkül. |

## Ellenőrzések

Az automatikus ellenőrzés `dokumentacio/AUTOMATIKUS_TESZT_V1_3.json` és az oldalankénti audit `dokumentacio/TELJES_AUDIT_V1_3.json` fájlban található.

- 95 JSON-fájl formátuma: sikeres.
- 50 JavaScript-szintaxisellenőrzés: sikeres.
- 65 regisztrált SPA-oldal belső útvonalai: a statikus ellenőrzés sikeres.
- Az új megközelítési oldal 41 vezérlőazonosítója: hiánytalan.
- 193, az oldalak JSON-szövegeiben talált belső útvonalhivatkozás: nem jelzett hiányzó célpontot.
- A régi `csanadi-bp.edu.hu` domainre mutató vizsgált URL: **0**.
- A 31 szabály korábbi státuszainak összesítése: `F=260`, `K=260`, `V=1241`, `N=199`, `H=55` (2015 cella). A `V` és `K` státusz nem jelent bizonyított megfelelést.
- **55 oldal** tartalma továbbra sem kapott szerkesztői hitelesítést. Ezt a program nem javította kitalált adatokkal.
- A v1.2.0 korábban újratervezett térképes oldal és a közös gombnyelv megmaradt.

## A kiadás ismert korlátai

1. **Nincs sikeres, tényleges böngészős vizuális teszt.** Emiatt nem állítható, hogy minden aloldal minden eszközön hibátlan. A CSS-változások alkalmazása műszakilag ellenőrizhető, vizuális eredménye külön megtekintendő.
2. **A tartalom igazságtartalma nem gépi kérdés.** Határidők, csengetési rend, felvételi adatok, tanári információk és történeti állítások intézményi jóváhagyást igényelnek.
3. **A 31 szabály teljessége nem igazolható a visszakereshető döntésszöveg hiányában.** A JSON-audit a rendelkezésre álló korábbi 31 oszlopos ellenőrzési vázlatot használja. Nem cseréljük „megfeleltre” a vizuálisan vizsgálandó mezőket.
4. **A külső szolgáltatások online elérhetősége és a médiák jogtisztasága** külön ellenőrzésre vár.
5. **Külső feltétel:** a Bootstrap 5.3.9 CSS/JS a verzióhoz kötött jsDelivr CDN-ről töltődik. A honlap saját kódja továbbra is statikus FTP-tárhelyen futtatható; a CDN hálózati elérhetőség szükséges a Bootstraphez.

## Kiadás és következő vizsgálat

Az új csomag megnevezése: **`csanadi website v1.3.0.zip`**. A `release-manifest.json` állomány a kiadás SHA-256 fájlazonosítóit tartalmazza. A következő ellenőrzésnél elsődleges az összes tipikus mobil-/asztali szélesség képernyős bejárása, majd a 55 tartalmi hitelesítési feladat és a 31 szabály eredeti szövegével történő tételes összevetés.
