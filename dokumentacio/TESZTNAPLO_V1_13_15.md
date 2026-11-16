# Csanádi weboldal – v1.13.0 → v1.14.0 → v1.15.0 tesztnapló

Dátum: 2026. november 16.  
Kiindulási alap: a teljes, sértetlen v1.12.0 ZIP.  
Feladat: kizárólag a meglévő A (navigáció), B (65 aloldal), C (médiatár és galériák), D (keresés és offline működés) funkciók javítása; három egymásra épülő, mind a négy területet érintő verzió.

## 0. Kiinduló állapot és reprodukálás

1. `unzip -tq 'csanadi website v1.12.0.zip'`: sikeres, nincs sérült ZIP-bejegyzés.
2. `node tools/test-release-v1-12.js`: **46/46**, 65 aloldal, 0 hiányzó helyi HTML-hivatkozás, 0 régi iskolai domainre irányuló hivatkozás.
3. Forrásvizsgálat: a globális `syncSelfLinks` aktív útvonalon eltávolította a `href` attribútumot. Ez a menü/iskolai címer visszakattinthatóságát ronthatta.
4. Galériavizsgálat: a fényképnézegető bezárása után a korábbi `galleryPhoto` paraméter a címsorban maradhatott, így újratöltés után ismét megnyithatta a képet.
5. Keresővizsgálat: a keresési cél normalizálása a szóköz karakter helyett a visszaperje + `s` karakterláncot kezelte.

## 1. v1.13.0 – teljes A+B+C+D kör

- **A:** az aktuális menü és címer hivatkozása megmarad; az `aria-current` jelzés oldalváltáskor átkerül; korábbi letiltott linkek helyreállnak.
- **B:** a hash útvonalat követő paraméter nem irányít hibásan a kezdőoldalra.
- **C:** a galéria bezárása a címsorban is törli az egyedi képmegosztási állapotot.
- **D:** a keresési cél normalizálása valóban összevonja a szóközöket.

Tesztparancsok és eredmények:

| Parancs a v1.13.0 gyökeréből | Eredmény |
| --- | --- |
| `node tools/test-existing-features-v1-13.js` | 12/12 sikeres |
| `node tools/test-release-v1-13.js` | 46/46 sikeres |
| A hét meglévő regressziós teszt (lent) | 60/60 sikeres |

Összesen **118/118**, 0 kimutatott kudarc. A 65×31-es tartalmi mátrixban 55 `H` státusz maradt; a teszt ezeket nem nyilvánította hitelesítettnek.

## 2. v1.14.0 – teljes A+B+C+D kör

- **A:** a mobilos fejléc-harmonikában az aktuális link képernyőolvasó számára is `aria-current="page"` jelzést kap.
- **B:** frissülő menüszerkezetnél a hozzá tartozó globális konfiguráció is újra érvénybe lép.
- **C:** a médiaalbum számlálója a választott kép- vagy videónézethez igazodik.
- **D:** részlegesen nem elérhető kiegészítő adatforrásnál a kereső kijelzi a hibát, miközben az alapoldalak találatai elérhetők maradnak.

| Parancs a v1.14.0 gyökeréből | Eredmény |
| --- | --- |
| `node tools/test-existing-features-v1-14.js` | 16/16 sikeres |
| `node tools/test-release-v1-14.js` | 46/46 sikeres |
| A hét meglévő regressziós teszt (lent) | 60/60 sikeres |

Összesen **122/122**, 0 kimutatott kudarc; a 65 oldal, a 628 médiafájl és a 55 nyitott intézményi tétel változatlanul megmaradt.

## 3. v1.15.0 – teljes A+B+C+D kör

- **A:** a mobilos főcsoportok valódi, egy főcsoportot nyitva tartó harmonikaként működnek mindkét meglévő menünézetben; a módosított JavaScript-modulok kiadásonként friss URL-verziót kapnak.
- **B:** az aktív aloldal tartalmi változását követően a keresőindex is újraépül, az oldal megjelenítése nem vár a kiegészítő adatokra.
- **C:** kép-előnézeti hálózati hiba esetén az eredeti kép betöltése próbálható; a fájlnyilvántartás SHA–256 és byte-méret integritásvizsgálata újra pontos.
- **D:** a hibás típusú média- és tartalomcímkék nem szakítják meg a teljes keresési index felépítését.

A mélyellenőrzés egy korábbi, ténylegesen fennálló eltérést is feltárt: `assets/documents/csanadi-weboldal-teljes-hasznalati-utmutato-2026.pdf` a nyilvántartásban **145833 byte** és más SHA–256 összeg volt, míg a meglévő fájl **219786 byte**. A fájlt nem módosítottuk; a nyilvántartást az újraszámolt mérethez és ellenőrzőösszeghez igazítottuk. A katalógus-ellenőrző ezután a jövőbeni eltéréseket is hibaként jelzi.

| Parancs a v1.15.0 gyökeréből | Eredmény |
| --- | --- |
| `node tools/test-existing-features-v1-15.js` | 22/22 sikeres, mind a 628 médiafájl hash-ellenőrzésével |
| `node tools/test-mobile-tree-v1-15.js` | 8/8 sikeres, DOM-eseményeket szimuláló navigációs teszt |
| `node tools/test-release-v1-15.js` | 46/46 sikeres |
| A hét meglévő regressziós teszt (lent) | 60/60 sikeres |
| `node tools/reconcile-assets-catalog.js` | 628/628 regisztrált fájl; 0 eltérő hash/méret, 0 hiányzó fájl |
| `node tools/test-static-http-v1-15.js` a vele egy folyamatcsoportban indított helyi statikus HTTP-szerveren | 1043/1043 sikeres: 65 aloldal GET, 628 médiatétel HEAD, 342 további statikus fájl HEAD, 6 minta GET, 2 belépési ellenőrzés |

A hét regressziós teszt pontos listája és egy-egy futásuk eredménye: `test-regressions-v1-10.js` **8/8**, `test-mobile-navigation-v1-11.js` **9/9**, `test-cache-resilience-v1-12.js` **8/8**, `test-subpage-header-v1-9.js` **12/12**, `test-review-worklist-v1-9.js` **7/7**, `test-media-manager-v1-9.js` **10/10**, `test-media-export-v1-9.js` **6/6**.

## 4. Hibakeresés, korlátok és követelmények

- A helyi statikus HTTP-próba nem éles FTP-feltöltés: **1043/1043** GET/HEAD ellenőrzéssel a csomag tényleges helyi kiszolgálását próbálta.
- A Playwright böngészőcsomaghoz tartozó saját Chrome-futtatható állomány nem volt telepítve. A rendszer Chromium-futtatása a környezetben elinduláskor megszűnt. Így valódi, képpont-alapú, érintéses, több eszközméretű böngészős tesztet **nem** állítunk sikeresnek; a DOM-eseménytesztek és HTTP-próbák ezt nem helyettesítik teljesen.
- A 65 oldal 31 pontos mátrixából 55 ellenőrzendő, intézményi igazolásra váró tétel nyitva marad. A médiák felhasználási jogosultságát vagy képleírásainak tartalmi helyességét hash-ellenőrzés önmagában nem bizonyítja.
- A CDN-ről betöltött, verzióhoz kötött Bootstrap 5.3.9 külső elérhetősége éles környezetben hálózatot igényel; helyi Bootstrap-másolat nem került a csomagba.
- A projekt minden publikus működéshez szükséges fájlt tartalmaz; nincs PHP-, Node.js-, GitHub Actions- vagy GitHub Pages-specifikus futtatási követelmény. A teszteszközök Node.js-t csak a fejlesztői ellenőrzéshez használják.
- Nincs éles feltöltés, új nyilvános funkció, tartalomkitalálás vagy tömeges médiabővítés.
