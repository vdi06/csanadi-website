# Csanádi weboldal – v1.43.16 teljes mobilos újraépítés

**Állapot:** átadásra és külön megrendelői jóváhagyásra szánt, ZIP-ben ellenőrizhető fejlesztési előnézet  
**Dátum:** 2026. november 20.  
**Hatókör:** telefonos böngésző, legfeljebb 768 CSS-pixel szélességben.  
**Közzététel:** FTP-re, GitHubra vagy nyilvános webhelyre semmi nem került fel.

## 1. A feladat módosítása és a kiindulási pont

A megrendelő az előző, inkrementális Q1–Q4 hibajavítási feladatot felülírta: a teljes telefonos felületet a nulláról kell újraírni, a jóváhagyott M1/D–M10/D arculati és használati elképzelések alapján. A régi `mobile/` könyvtár tartalma nem lehet az új mobilfelület kiindulási kódja. Az asztali felületet meg kell tartani; a közös képek, intézményi tartalmak, JSON-rendszer, Bootstrap, kereső és nézők működése újra felhasználható.

Visszaállítási alap: a korábban jóváhagyott, teljes **v1.43.15** kiadás. A v1.43.15 régi mobil könyvtára **nem része** a v1.43.16 csomagnak. A fejlesztési munkakönyvtáron kívül megőrzött régi mobilállományok csak összehasonlításhoz és visszaállításhoz használhatók, az új kódban nincs rájuk import vagy másolat. A korábbi Q1–Q4 részleges javítási munkakönyvtára nem képezte az új kiadás alapját.

## 2. Az új mobilos rendszer – teljesen új implementáció

Az alábbi öt fájl újonnan készült, kizárólag az új változathoz:

| Új fájl | Feladat | Ellenőrizhető elvárás |
|---|---|---|
| `mobile/reboot-shell-v1-43-16.js` | Címerközpontú mobilos fejléc, Facebook/Instagram/KRÉTA, kereső, téma és gördülési folyamatjelző | Középső címer önálló menünyitó; a két szélen szimmetrikus gombterületek; megmaradó, tömörebb fejléc gördítés után |
| `mobile/reboot-menu-v1-43-16.js` | Saját, teljes képernyős telefonos menü | 1–2–3. szint, visszalépés, fókusz, közvetlen oldallink; nagyobb telefonon körkép, keskeny/kis kijelzőn kártyarács |
| `mobile/reboot-hero-v1-43-16.js` | Önálló mobilos képváltó és filmes nyitás | Bejárat az első dia, dekódolt kép után áttetsző arany kapu, kézi nyilak, ujjmozdulatos lapozás, automatikus váltás feltételekkel |
| `mobile/reboot-quality-v1-43-16.js` | Billentyűzet, képfogyasztás és gyenge készülék kezelése | Szűrősávok Home/End és nyílbillentyűi, fókuszmegőrzés, lazy képek, mobil adatforgalom-kímélés, desktopon eredeti videóállapot |
| `mobile/reboot-design-v1-43-16.css` | Az összes új telefonos megjelenés | Önálló színrendszer, igazítás, fejléc, menü, hero, kártyák, aloldalak, Bootstrap-nézők, kereső, hozzáférhetőség és töréspontok |

### 2.1 M1/D – új mobilos arculat

- Saját mélykék/arany színrendszer, adaptív világos és sötét változatokkal.
- A korábbi kérés szerint a hangsúlyos arany ajtó és kezelőfelületek **nagyon átlátszó** kitöltést kapnak: a dísz nem takarja a fotót.
- A tipográfia, a kártyák és a fő tartalmak vízszintesen középre rendezettek; a telefon méretéhez alkalmazkodó szélességekkel.

### 2.2 M2/D és M4/D – fejléc, görgetés

- Az intézmény neve több sorban, utána a háromrészes, középen címeres vezérlősáv.
- A bal oldalon az iskolai Facebook és megadott Instagram-profil **ellenőrzött közös JSON-forrásból**, plusz a KRÉTA hivatkozás; a jobb oldalon keresés és témaváltás.
- A régi, oldalt felbukkanó redundáns menüindító eltávolítva/elrejtve; csak a címer nyitja a mobilos főmenüt.
- A fejléc gördítéskor tömörebb lesz, de a középső címer és a kért gombok megmaradnak.
- Közel átlátszó háttér, finom elmosás; a sáv alján arany, középről növekvő olvasási folyamatjelző.
- A sáv a `safe-area-inset-top` értéket használja, például szenzorszigetes készülékeken.

### 2.3 M3/D – háromszintű teljes képernyős menü

- Külön mobil DOM-ág és eseménykezelés, nincs régi `mobile/` modulra támaszkodás.
- Főszint: 6 témakör, tágabb telefonon körkép, keskeny kijelzőn kétoszlopos kártyarács.
- Alszint: témakör alcikkei; harmadik szint: a tényleges cikkoldalak. A gyűjtőoldal külön megnyitható.
- Minden szinten működik a visszalépés és a rendszer bezárása; a fókusz visszatér az előző kezelőelemhez.
- A menü alatt nem jelenik meg a régi párhuzamos gyorsnavigáció.
- A menü adatai a közös oldalstruktúrából származnak, nem hardcode-olt másolatok.

### 2.4 M5/D és M7/D – kezdőlap, aloldalak

- Egyoszlopos, középre igazított mobilos kezdőlap, sporteredményekkel, hírekkel, gyorselérésekkel és a meglévő tartalmakkal.
- Telefonon a korábban desktopról örökölt, túl hosszú képsáv-magasság megszüntetve.
- Az aloldalak saját telefonos hierarchiát kapnak: képes/fokozatos fejléc, központi cím és leírás, több sorban tördelhető morzsamenü, egymás alatti kártyák.
- Széles táblázatok külön vízszintes görgetést kapnak, a főoldal nem csúszhat oldalra.
- A közös JSON-cikkek, naptáradatok, személyi/iskolai információk változatlanok.

### 2.5 M6/D – filmes kapu és képváltó

- Az új filmréteg a bejárati képpel kezd, utána a meglévő jóváhagyott médiakatalógus képeiből vált.
- A kép készenléte után, villanás nélkül jelenik meg a két, szinte átlátszó arany ajtószárny; egyenletes, filmszerű átmenettel nyílik.
- A diák manuálisan előre/hátra léptethetők, a fotón vízszintesen lapozhatók; képszámláló és előrehaladási csík segít.
- Az automatikus váltás szünetel rejtett lap, menü, érintés/fókusz, csökkentett mozgás és lassú/adatkorlátos hálózat esetén; külön szünet/folytatás gomb áll rendelkezésre.
- A desktop eredeti képváltója továbbra is külön működik. A régi desktop görgetési képkivágás változóinak frissítése mobilon le van tiltva.

### 2.6 M8/D–M10/D – Bootstrap, hozzáférhetőség, munkafolyamat

- Bootstrap gombok, lapok, kártyák, lapozók és űrlapok középre rendezett, ujjbarát telefonos megjelenése.
- A meglévő, saját Bootstrap-képek/PDF-nézők telefonon teljes képernyőt és külön görgethető tartalmi részt kapnak. A dokumentumokhoz nem készült új külső letöltő.
- A tematikus galéria, szűrők, kereső, meglévő cikk-/dokumentumfolyamat változatlan adatforrásokon marad.
- Legalább 44px-es érintési célméretek, látható billentyűzetes fókusz, Home/End és nyílbillentyűs szűrőnavigáció.
- Nagyobb betűméret az űrlapmezőkben a mobilos automatikus belenagyítás csökkentésére, virtuális billentyűzettől kitakart mezők igazítása.
- Csökkentett mozgás, erősebb kontraszt és kényszerített rendszerszínek módja.
- Adatforgalom-kímélő képek és videók, az elhagyott mobilos állapot desktopon nem szivároghat tovább.

## 3. Mire épültünk – és mire nem

**Változatlan közös erőforrások:** `assets/` (828 fájl), `css/` (66 fájl), `desktop/` (7 fájl), a tartalmi JSON-ok (110 fájl; a kiadás gyorsítótár-verzióját tároló `json/config.json` kivétel). A négy csoportnak a v1.43.15-höz képest rögzített, teljes tartalomra számolt SHA-256 lenyomata van.

**Csak bekötési szinten módosított közös fájlok:** `index.html`, `script.js`, `service-worker.js`, `js/app.js`, `js/hero-2026.js`, `js/blocks.js`, `js/home-v1-41.js`, illetve `json/config.json`. Az asztali CSS/JS állományok nem lettek lecserélve. Az új mobilkülönbséget médiafeltételek és külön modulok határolják.

**Nem használtuk újra:** a v1.43.15 régi mobilos CSS-/JS-fájljait és egykori mobiltesztjeit. A teljes új ZIP `mobile/` könyvtárában pontosan az öt felsorolt új állomány van.

## 4. Ellenőrzési kapuk

| Kapu | Automatizált ellenőrzés | Állapot |
|---|---|---|
| A – új fejléc | Címer középen, menüesemény, régi oldalsó menü eltávolítása, kereső/téma, két közös közösségi adat, scroll és media-váltás | Sikeres ál-DOM teszt |
| B – menü | Három egymásba ágyazott szint, saját kör-/rácsmodell, önálló oldallink, vissza, fókusz | Sikeres ál-DOM teszt |
| C – filmes hero | Első bejárati kép, körkörös lapozás, következő/előző, swipe, csökkentett mozgás, automatikus váltás feltétele | Sikeres ál-DOM teszt |
| D – használhatóság | Mobil/desktop elkülönítés, adatkorlát, lazy képek, videó visszaállás, billentyűzetes szűrők | Sikeres ál-DOM teszt |
| E – asztali változatlanság | `desktop/`, `css/`, `assets/` és tartalmi `json/` bájtpontos referenciahash-ellenőrzés | Kiadási teszt része |
| F – csomagintegritás | Minden fájl mérete/SHA-256, minden JSON parse, öt új mobilállomány, régi mobilimport tilalma, gyorsítótár-verzió | Kiadási teszt része |
| G – ZIP-visszaállítás | Teljes ZIP kicsomagolása külön helyre, próba újrafuttatása és `unzip -t` | Kiadáscsomag készítésekor futtatandó |

Tesztparancsok a ZIP gyökeréből:

```bash
node tools/verify-reboot-shell.mjs
node tools/verify-reboot-menu.mjs
node tools/verify-reboot-hero.mjs
node tools/verify-reboot-quality.mjs
node tools/verify-reboot-release.mjs
```

### 4.1 Valós eszközös ellenőrzés korlátja

Az automatizált futtatás **nem helyettesíti** a valódi iOS/Android Chrome/Safari/Firebase/emulátoros megjelenítést és képernyőolvasót. Ebben a munkakörnyezetben a helyi szerver elérését a böngészős hozzáférési korlát megakadályozta, ezért nem állítjuk, hogy ezek a valós vizuális tesztek megtörténtek. Különösen ellenőrizendő:

1. 320, 375, 390, 430, 768 CSS-pixel méret, fekvő mód és a szenzorsziget területe.
2. Körmenü érintési céljai, teljes harmadik szint és bezárás utáni fókusz.
3. Valós képletöltés mellett a kapu első betöltése és villanásmentessége.
4. Világos/sötét/automatikus téma valamennyi mobilos aloldalon és Bootstrap-nézőben.
5. iOS VoiceOver, Android TalkBack, külső billentyűzet, `prefers-reduced-motion`, `forced-colors`.
6. Offline/service-worker frissítés, korábbi verzióból átállás és gyenge hálózat.

Ezek a megrendelői végső jóváhagyás előtt nyitott, dokumentált vizuális/eszközös ellenőrzések.

## 5. Visszaállítás és hatókör

**Visszaállítás:** ha a v1.43.16 előnézet nem megfelelő, a korábban jóváhagyott teljes v1.43.15 ZIP érintetlen kiindulási pont. Az új v1.43.16 ZIP-ből külön kicsomagolásos állományintegritási próba is készül; az alkalmazás nem változtat meg élő szervert, nincs szükség távoli visszavonásra.

**Asztali védelem:** a kiadás nem módosította a desktop saját stílusait, JS-moduljait vagy médiaállományait. A közös SPA néhány importja megváltozott, ezért a desktop teljes, valódi böngészős regressziós próba továbbra is nyitott.

**Megkötés:** a megrendelő későbbi, újabb mobilos döntései külön jóváhagyási kapuban építhetők az új architektúrára; automatikus, jóváhagyás nélküli terjesztés nincs.

## 6. Külön végső jóváhagyás

A v1.43.16 **teljes mobilos újraépítési előnézet** kiadását jóváhagyhatod a dokumentált valós eszközös nyitott vizsgálatokkal együtt, vagy kérhetsz módosításokat / valódi telefonos vizuális áttekintést a végső elfogadás előtt. A jóváhagyás nem jelent FTP- vagy GitHub-közzétételi engedélyt.
