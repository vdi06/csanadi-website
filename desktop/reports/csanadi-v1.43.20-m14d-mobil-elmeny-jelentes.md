# Csanádi weboldal — v1.43.20 / M14/D mobilos élményfinomítás

**Kiadás állapota:** helyi, jóváhagyásra váró teljes ZIP-előnézet  
**Dátum:** 2026. november 20.  
**Kiindulópont:** jóváhagyott v1.43.19 / M13/D  
**Hatókör:** kizárólag mobil (legfeljebb 768 CSS-pixel széles nézet).  
**Közzététel:** nem történt FTP-, GitHub- vagy egyéb éles közzététel.

## M14.1 — Mobilszövegek és frissítési értesítés

- A naptári események, tanári adatok, dokumentumok, galériák, hírek és keresőtalálatok kártyáinak minimális szélességét feloldottuk a mobilos stílusban. A túl hosszú, nem tördelhető részletek is sort törhetnek, nem szélesítik meg az oldalt.
- A szűrők és lapozóvezérlők elemeinél a címkék több sorba kerülhetnek; a szabály a mobilnézet CSS-ében van, asztali stílus nem módosult.
- A frissítési értesítés `hidden` állapotát a mobilos megjelenés kifejezetten tiszteletben tartja; a panel nem ragad látható állapotban pusztán egy `display` felülírás miatt. A korábbi PWA-frissítési logika és kézi elutasítás viselkedése változatlan.
- Az értesítés vízszintesen középre kerül, szélessége legfeljebb 520 px, magassága legfeljebb a képernyő 45%-a vagy 320 px. Figyelembe veszi az alsó biztonsági sávot; belül görgethető, és nem takarja a teljes menüt, amikor az nyitva van.

**Ellenőrzési kapu:** mobil CSS és frissítési logika forrásellenőrzés; szövegillesztési regresszió sikeres. A tényleges megjelenés egyedi böngésző- és nagyítási beállítások mellett további eszközös ellenőrzést igényel.

## M14.2 — Mélyebb menüszintek és fókusz

- Az M3/D-ből származó, nulláról írt mobilmenü mindhárom szintje megmaradt.
- Visszalépéskor a fókusz az előző szinten *az imént megnyitott menüpontra* tér vissza, amennyiben az megtalálható; ha nem, a meglévő biztonságos fókuszcél marad.
- Megmaradt a bal nyíllal és Backspace-szel történő visszalépés, az `aria-current` jelölés, a kompakt/rácsos nézet és a közvetlen aloldal-link.

**Ellenőrzési kapu:** automatizált mobil menü-DOM teszt, köztük 1→2→3 szint, visszalépés és fókusz: sikeres.

## M14.3 — Érintések, képek és akadálymentes alapok

- A kezdőlap filmes képváltójában `touchcancel` esetén törlődik a félbeszakadt gesztus. Ez megakadályozza a hibásan továbbvitt érintésállapot miatti képléptetést.
- A filmes felületen és a saját galéria érintési felületén a függőleges oldalgörgetés engedélyezett, miközben a vízszintes lapozógesztus megmarad.
- Az értesítés gombjai legalább 44 CSS-pixel magasak, több sorba rendeződhetnek, és látható billentyűzetfókuszt kapnak.
- A frissítési értesítés világos/sötét témára külön háttér-, előtér- és gombszíneket kapott. A korábban bevezetett mobilos fókuszjelölés és csökkentett mozgás logika megmaradt.

**Ellenőrzési kapu:** képváltó DOM-teszt, megszakított érintés, saját kép-/dokumentumnéző DOM-próbája, téma- és fókuszszabályok forráskapuja: sikeres. Valódi érintőkijelzős teszt még nyitott.

## M14.4 — Szakaszos regresszió, átadás és visszaállítás

### Megőrzött működés

- Az M1/D–M13/D mobilos irányok és a v1.43.19 meglévő funkciói megmaradtak.
- Az asztali kinézet, asztali JS/CSS, képek, iskolai tartalom és oldaladatok változatlanok. A közös belépési pontokban kizárólag a verzióhoz kapcsolódó fájlnevek és cache-jelölések változtak; ezeket a korábbi kiadás lenyomataival ellenőrzi a kiadáskapu.
- A teljes csomag tartalmazza a weboldal forrásait, a mobilos modulokat, a dokumentum- és képnéző meglévő elemeit, a tartalmakat, a leltárt, a teszteket és ezt a jelentést. Nem csak egy részleges javítócsomag.
- A service worker és a cache azonosítója `1.43.20` / `csanadi-r-v1.43.20`; új mobilmodul-fájlnevek `v1-43-20` végződésűek.

### Automatikus ellenőrzési kapuk

1. Új mobilfejléc és rejtett régi menü; menü fókusz és három szint.
2. Filmes kezdőkép, nyilak, érintés és mozgáskorlátozás.
3. Mobilminőség, lazy média, a desktop elkülönítése.
4. **12 méretű** statikus reszponzív mátrix, köztük a **768 px** határ és minimum **44 px** vezérlők.
5. **78 regisztrált oldal**, **254 tartalmi blokk**, 6 első-, 38 második- és 34 harmadik szintű oldal.
6. Hosszú címek és szövegek forrásellenőrzése.
7. Saját Bootstrap kép-/dokumentumnéző és szűrés DOM-próbája.
8. **Új M14:** frissítési értesítés, szövegtördelés, menü-fókusz, megszakított érintés, világos/sötét témák.
9. Verzió, teljes fájlméret- és SHA-256 leltár, közös asztali belépési pontok változatlansága.
10. A ZIP kicsomagolhatósága és külön könyvtárban megismételt ellenőrzések.

### Valós eszközön nyitott ellenőrzések

- iPhone/Safari és Android/Chrome tényleges, görgetéses és nagyított nézetei.
- Képernyőolvasós próbák: VoiceOver, TalkBack, NVDA/egyéb kombinációk.
- Valódi PDF-megjelenítés különböző dokumentumokkal és nagyított oldalakkal.
- Core Web Vitals, hálózati lassítás és tényleges offline/PWA-frissítési kör.
- A korábbi helyi Chromium indítás `Operation not permitted` jogosultsági hibát adott; ezt a környezet korlátjaként kezeljük. A statikus és DOM-próbák **nem helyettesítik** a valódi telefonos végigjárást.

### Visszaállítás

Az elfogadott **v1.43.19** teljes ZIP sértetlen kiindulópont marad. A v1.43.20 önálló ZIP; kicsomagolásakor a tesztparancsok újból végrehajthatók. Az esetleges visszaállítás a v1.43.19 ZIP külön kibontásával lehetséges; éles szerverre nem került kiadás, ezért szerveroldali visszavonásra most nincs szükség.

## Külön végső jóváhagyási pont

**A — Jóváhagyom a v1.43.20 / M14/D kiadást** a dokumentált valós eszközös ellenőrzési korlátokkal; a következő szakasz előkészíthető, fejlesztés nélkül.

**B — Előbb valós telefonon kipróbálom.** A kapott észrevételek alapján célzott korrekció kérhető.

**C — Módosítást kérek.** A jelenlegi kiadás marad előnézet, közzététel nélkül.
