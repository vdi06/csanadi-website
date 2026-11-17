# Csanádi Sportiskola – v1.39.9 böngészős és akadálymentességi ellenőrzés

**Dátum:** 2026. november 17.  
**Tesztalap:** a teljes v1.39.9 statikus fájlállományból készült, helyben kiszolgált előnézet.  
**Tesztkörnyezet:** tényleges, automatizálható Chrome böngésző; helyi HTTP-előnézet a `127.0.0.1:4173` címen. Az előnézet nem nyilvános, nem helyettesíti az iskolai FTP-környezetben végzett éles próbát.

## Ténylegesen elvégzett Chrome-próbák

| Vizsgálat | Eredmény / megfigyelés |
|---|---|
| Kezdőoldal betöltése | Sikeres; fejléc, hero, fő tartalom és dinamikus kártyák megjelentek. |
| Aloldal közvetlen hash-útvonala | Sikeres; `#/oktatas/felveteli/nyilt-napok` címen a cím, H1 és tartalmi szakaszok betöltődtek. |
| Kereső megnyitása | Sikeres; a keresőmező azonnal fókuszt kapott, a dialógus címe hozzáférhető névhez kötött. |
| Keresés és navigálás | „nyílt nap” kifejezéssel, Enterrel az érintett aloldal megnyílt. |
| Új keresőkifejezés | Az „adatvédelem” beírása után 6 találat jelent meg; az adatvédelmi oldal és releváns tartalmak megtalálhatók. |
| Escape a keresőben | A kereső bezárult, a fókusz visszakerült a „Keresés megnyitása” gombra. |
| Főmenü megnyitása | A menü megjelent, első navigációs hivatkozás fókuszt kapott, `aria-expanded=true` állapottal. |
| Escape a főmenüben | A menü bezárult, a fókusz visszakerült a „Főmenü megnyitása” gombra. |
| Széles asztali nézet | Körülbelül 1363 px szélességnél nem volt vízszintes túlcsordulás. |
| Aloldali szakaszválasztó | A próbán feltárt általános „Tartalom 3” megnevezés helyett a javítás után a „Gyakori kérdés” címet mutatja. |
| Képek | A betöltött képek láthatók; a még meg nem nyitott lightbox üres képe nem hálózati hibás kép. A lazy-load képek egy része nem került görgetéssel ellenőrzésre. |

### Talált és javított hiba

Az aloldali tartalomnavigáció korábban csak a közvetlen címsorokat olvasta. Bizonyos beágyazott blokkoknál általános, kevéssé beszédes „Tartalom 3” felirat keletkezett. A `js/page-templates-v1-39-2.js` most az alblokkban lévő `h2`, `h3`, `summary`, illetve explicit szakaszcím segítségével is ad érthető nevet, és a címsor fókuszát az oldalon belüli navigáláskor kezeli. A változást Chrome-ban újraellenőriztük.

## A próbák határai

- **Nem igazolt** a valós mobiltelefonos 320–430 px viewport, az érintőképernyős interakció és a valós hálózati lassulás. A Chrome ablak zoompróbája nem változtatta érdemben a viewportot; ezt nem számítjuk mobiltesztnek. A meglévő mobilos/reszponzív *statikus* ellenőrzések külön sikeresek.
- **Nem futott** külön Firefox, Safari, Edge, NVDA, VoiceOver vagy TalkBack próba. Nem készült kézi képernyőolvasós átjárás, kézi kontraszt-/200–400%-os nagyítási audit vagy teljes WCAG 2.2 AA tanúsítás.
- **Nem állítható**, hogy valamennyi dinamikus blokk, 71 oldal, 748 médiaállomány és 17 különálló segédoldal minden interakcióját Chrome-ban egyenként bejártuk. Az automatikus JSON-/HTTP-/HTML-integritási próbák nagyobb lefedettségűek, de nem váltják ki a kézi akadálymentességi teszteket.
- A böngésző bővítményének egyik metaadatküldési jelzése nem a weboldalból eredő JavaScript-hibaként azonosítható. A teljes konzol-/hálózati erőforrásnapló minden oldalra kiterjedő minősítése nem történt meg.
- Az előnézet helyi és átmeneti; a fájlok feltöltését követően a célhelyen ismételt ellenőrzés szükséges.

## Automatikus kiegészítő ellenőrzések

- Mobil/reszponzív és hozzáférhetőségi szerkezeti teszt: **8/8**.
- Modális fókusz- és ARIA-teszt: **10/10**.
- 17 HTML-segédoldal szemantikai ellenőrzése: **17/17**.
- Az új A+B+C+D regressziós tesztek: **18/18**.

**Következtetés:** a Chrome-ban megvizsgált feladatok működtek és az észlelt szakaszcím-hiba javítva van. A mobilos, más böngészős és segítőtechnológiás teljes tesztkör nyitott; hozzá nem rendelhető „teljesen akadálymentes” állítás.
