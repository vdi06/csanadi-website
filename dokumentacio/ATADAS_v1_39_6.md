# Csanádi Árpád Sportiskola – v1.39.6 átadási és akadálymentességi ellenőrzési jegyzőkönyv

**Kiadás:** v1.39.6  
**Dátum:** 2026. november 17.  
**Alap:** a teljes v1.39.5 kiadás  
**Feladat:** a rendelkezésre álló böngészős környezetben a mobilos, asztali és akadálymentességi ellenőrzés lezárásának megkísérlése, a feltárt hibák javítása, teljes ZIP átadása, hozzáférési korlátok pontos dokumentálásával.

## 1. Elkészült javítások

| Terület | Konkrét változtatás | Fájl |
|---|---|---|
| Főmenü modális működése | A főmenü megnyitásakor a háttérben levő valamennyi felső szintű oldalrész inaktívvá (`inert`) válik, köztük a mobil alsó navigáció, a lebegő vezérlők, a fejléc, a fő tartalom és a lábléc. A látható főmenü továbbra is interaktív. | `js/app.js` |
| Korábbi állapot visszaállítása | Bezáráskor csak azoknak az elemeknek az inaktív állapota szűnik meg, amelyeket maga a főmenü állított be. A már korábban inaktív elemek változatlanok maradnak. Többszöri nyitás és bezárás után sem marad vissza tiltott háttér. | `js/app.js` |
| Egymásba nyíló párbeszédpanelek | A főmenü megnyitása bezárja a nyitott keresőt; a kereső megnyitása bezárja a főmenüt. | `js/app.js` |
| Fókusz helyreállítása | Keresőből a főmenüre, illetve főmenüből a keresőre váltáskor a bezárt, elrejtett panel vezérlője helyett az eredeti látható indítógomb lesz a fókusz visszaállításának célpontja. | `js/app.js` |
| Gyorsítótár/verziózás | A belépőfájl, az alkalmazásmodul és a tartalomgyorsítótár hivatkozása `v1.39.6` azonosítót kapott. A kiadási manifest és verzióellenőrzők az új alverzióhoz igazodnak. | `index.html`, `script.js`, `json/config.json`, `tools/*` |
| Új regressziós tesztek | A tényleges alkalmazásfüggvényekből vett főmenü-függvényeket elkülönített JavaScript-állapotszimulációban futtató tesztek készültek; a HTML-szemantikai teszt ellenőrzi a gombok hozzáférhető elnevezését. Egy böngészőben futtatható új tesztforrás a mobil alsó navigáció inaktív állapotát is vizsgálja. | `tools/test-modal-a11y-v1-39-6.mjs`, `tools/test-html-semantics-v1-39-5.py`, `tools/test-browser-responsive-v1-39-6.js` |

A **71 JSON-tartalmi oldal**, a **8 témaspecifikus sablon** és a **628 média-/dokumentumállomány** megmaradt. A médiakészlet hatszoros bővítése nem része ennek a kiadásnak.

## 2. Ténylegesen végrehajtott vizsgálatok

Az alábbi eredmények a v1.39.6 munkapéldányon futtatott ellenőrzések. A JavaScript-állapotszimulációk és statikus elemzések **nem azonosak** egy megnyitott weboldal valódi böngészős használatával.

| Teszt / ellenőrzési terület | Eredmény | Módszer |
|---|---:|---|
| Főmenü háttértiltása, megnyitás/bezárás, állapotmegőrzés, fókusz és keresőváltás | **10/10** | Node.js VM-ben futtatott alkalmazásfüggvények és forrásellenőrzés |
| Mobil/asztali navigáció, ARIA, kontrasztminták, akadálymentességi és reszponzív szabályok | **8/8** | DOM- és forrásállapot-ellenőrzés |
| HTML-fájlok szemantikai ellenőrzése, beleértve a gombok hozzáférhető nevét | **17/17** | Python strukturális ellenőrzés |
| Média- és dokumentumkezelő regresszió | **11/11** | Node.js |
| ZIP-kezelő rutinok | **5/5** | Node.js |
| A 71 tartalmi oldal és kapcsolatai | **16/16** | Node.js |
| Kiadási fájl-, oldal-, JSON- és médiaintegritás | **948/948** | Node.js |
| v1.39.1 funkcionális regresszió | **7/7** | Node.js |
| Nyolc oldalsablon, navigációs szerkezet | **14/14** | Node.js |
| Keresőindex | **74/74** | Node.js |
| Világos/sötét témaszinkronizáció | **12/12** | Node.js |
| Teljes helyi HTTP-kiszolgálás, útvonalak és fájlok | **1296/1296** | Helyi HTTP-kiszolgáló + Node.js lekérések |
| Végleges v1.39.6 SHA-256 kiadási manifest integritása | **1305/1305** | Fájlonkénti méret- és hash-ellenőrzés |
| Új böngészős tesztprogram JavaScript-szintaxisa | **sikeres** | `node --check`, böngésző indítása nélkül |

A kiadási manifest fájlonkénti ellenőrzése a teljes kiadási csomagra sikeres.

## 3. A valódi böngészős ellenőrzés pontos hozzáférési akadálya

**Nem sikerült valódi böngészőben megnyitni és végigtesztelni a weboldalt ezen a futtatási környezeten. A sikeres valódi böngészős próbák száma: 0.**

1. Az előző, v1.39.5-ös futtatási próbában a Playwright Chromium motorját az operációs rendszer `socket() failed: Operation not permitted (1)` hibával megszakította. A Firefox és WebKit Playwright binárisai ebben a környezetben nem álltak rendelkezésre.
2. A v1.39.6-os körben külön rendelkezésre álló felületi Chrome-böngészőn a helyi előnézeti cím (`http://127.0.0.1:4173/#/`) megnyitását a böngésző biztonsági/URL-hozzáférési szabályzata kifejezetten megtagadta: **„Browser Use rejected this action due to browser security policy”**, továbbá **„Cloud browser could not acquire authority to observe page content”**. Az üzenet a megkerülő hozzáférést más böngészőfelületen vagy közvetett eszközökkel is kifejezetten tiltotta.
3. A tiltást nem kerültük meg másik felülettel, közvetlen CDP-hozzáféréssel vagy automatizált böngészőparancsokkal. Az új `tools/test-browser-responsive-v1-39-6.js` fájl elkészült és szintaktikailag ellenőrizve lett, de **böngészőben nem futott**.

Ennek következtében az alábbi feladatokat nem jelöljük sikeresnek:

- valódi Chrome/Edge/Firefox/Safari mobilos és asztali megjelenítési ellenőrzés;
- tényleges érintéses, billentyűzetes és fókuszkezelési próba egy böngészőben;
- tényleges képernyőolvasós vizsgálat (NVDA, VoiceOver, TalkBack);
- pixelképes vizsgálat, vizuális regresszió és WCAG 2.2 AA megfelelőségi tanúsítás.

Az a tény, hogy a forrásszintű és állapotszimulációs tesztek sikeresek, **nem bizonyítja önmagában** a teljes mobilos és akadálymentességi megfelelést.

## 4. Futtatható böngészős ellenőrzési terv hozzáférhető környezetben

Egy olyan, engedélyezett tesztgépen, ahol a honlap HTTP/HTTPS-címen elérhető, a csomagban levő `tools/test-browser-responsive-v1-39-6.js` futtatható megfelelően telepített Playwright és Chromium mellett. Az automatikus vizsgálat mellett az alábbi **kézi** vizsgálatok szükségesek:

1. **320 × 568, 360 × 640, 390 × 844 és 430 × 932 CSS pixel:** felső menü, kinyíló főmenü, alsó háromgombos navigáció, kereső, görgetés, oldalirányú túlcsordulás.
2. **768, 820, 1280 és 1920 CSS pixel:** töréspontok, megamenü, címsorok, képek, sablonok, táblázatok és fájlválasztók.
3. **Tab, Shift+Tab, Enter, Space, Escape és Ctrl+K:** látható fókusz, fókuszcsapda, bezárás utáni visszatérés, háttérvezérlők elérhetetlensége nyitott dialógus mellett.
4. **200% és 400% nagyítás, betűnagyítás:** tartalomvesztés, egymásra csúszó vezérlők, rugalmas tördelés.
5. **Világos/sötét téma, nagy kontraszt, csökkentett mozgás:** láthatóság és kezelhetőség.
6. **NVDA + Firefox/Chrome, VoiceOver + Safari, TalkBack + Android Chrome:** címsorsorrend, navigációs régiók, dialógusnév, élő állapotok, gombnevek, keresési eredmények.
7. **FTP-tárhelyen:** `#/` útvonalak, `json/structure.json` és `json/config.json`, 71 oldal-JSON, 628 média, CDN-hálózat, fejléci és alsó mobilnavigáció, összes nyolc sablon és a `tools/` oldalak.

Amennyiben a felhasználó hozzáférhető, közzétett teszt-URL-t és az azon történő tesztelés engedélyét megadja, a fenti böngészős próba egy további alverzióban folytatható. Helyi böngészővel saját gépen is futtatható a csomagolt teszt, a telepített Playwright-függőség és Chromium mellett.

## 5. Telepítés, függőségek, visszaállítás

- A ZIP **teljes weboldalcsomag**, nem különbözeti frissítés: belépőoldal, saját JavaScript/CSS, hierarchikus `json/`, `assets/`, `mobile/`, `tools/`, ellenőrző programok és dokumentáció.
- A honlap statikus HTTP/FTP-tárhelyen működik; **nem igényel PHP-t, szerveroldali Node.js-t, GitHub Actions-t vagy GitHub Pages-specifikus automatizmust**.
- A Bootstrap **verzióhoz kötött külső CDN-linkekről** töltődik; a teljes megjelenéshez elérhető CDN és hálózati kapcsolat szükséges. Helyi Bootstrap-függőség nem került hozzáadásra.
- Az eszközök szerkesztési/letöltési műveletei nem töltenek vissza automatikusan az iskola FTP-tárhelyére; telepítés előtt szerveroldali mentés és az intézményi közzététel ellenőrzése szükséges.
- A korábbi v1.39.5 ZIP-et változatlanul meg kell őrizni, hogy szükség esetén visszaállítható legyen.
- Az `assets/` tartalom körülbelül hatszoros növelése külön későbbi fejlesztés, nem része a v1.39.6 munkának.

## 6. Összesített státusz

**Elkészült:** célzott modális akadálymentességi és fókuszjavítások; regressziós és statikus HTTP-tesztek; új, böngészőben később futtatható tesztforrás; v1.39.6 verziózott teljes kiadás.

**Nyitott és dokumentált akadály:** valódi böngészős, vizuális és képernyőolvasós tesztelés; a jelenlegi környezet biztonsági hozzáférési tiltása miatt nem zárható sikeresnek.

**Nem állítjuk:** hogy a honlap teljes WCAG 2.2 AA megfelelősége bizonyított, vagy hogy minden céleszközön vizuálisan ellenőrzött.
