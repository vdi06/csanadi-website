# Csanádi weboldal v1.43.28 – M18.3 iOS képváltó és mobilfejléc felülvizsgálat

**Állapot:** új, jóváhagyásra váró teljes előnézet; FTP/GitHub publikálás nem történt.

## Felhasználói visszajelzés

A 2026. november 20-i első iPhone-képernyőképen a KRÉTA még második sorban szerepelt, a második nyitókép helyén pedig nagyméretű sötét, üres felület látszott; ugyanakkor a képváltó számlálója és címkéje már a **02 / 09** diára váltott. A második, 21:29-es képen már megjelent az új, egysoros **K ikonos** v1.43.27 fejléc, de a kép területe változatlanul üres. Ez megerősíti, hogy a képhiba független a korábbi KRÉTA-fejléc elrendezésétől. A jelen ZIP önmagában nem jelenti, hogy a GitHubon megtörtént volna az új v1.43.28 kiadás közzététele.

## Azonosított képernyőelsötétülési versenyhelyzet

`mobile/reboot-hero-v1-43-27.js` korábban egyszerre használt **két egymásba ágyazott `requestAnimationFrame`-et** és egy tőlük független **740 ms-os `setTimeout`-ot**. Ha a böngésző az animáció képkockáját késlelteti, a timeout előbb az új képre állíthatja az `active` változót. A késve futó animáció ezután az új képre is rátehette az `is-leaving` osztályt, amely a mobil CSS-ben `opacity:0!important` – ez valóban megmagyarázhatja a kép nélküli második diát. A screenshot önmagában nem bizonyítja egyedüli okként ezt a versenyhelyzetet.

## Végrehajtott M18.3 javítás

1. A képváltás kezdetén `outgoing=active` rögzíti az elhagyott képet; a később változó `active` soha nem kaphat téves `is-leaving` osztályt.
2. A `finish()` csak **egyszer** hajtható végre. A nem kívánt animációs osztályok a bemutatott új képről mindig eltávolításra kerülnek.
3. Az áttűnés befejezésekor a `transitionend` esemény lezárja a régi kép eltávolítását; emellett 900 ms-os tartalék időzítő működik.
4. Ha egy mobilos Safari a `requestAnimationFrame`-et teljesen elhalasztja, 1500 ms után animáció nélkül megtörténik a biztos képváltás. Az ezután későn megérkező képkocka már nem módosítja a megjelenést.
5. A mobilos képterületnek egy 640 pixeles, helyben tárolt **bejárati tartalékképe** is van CSS háttérként. Ha hálózati/képfeldolgozási hiba miatt egy kép sem rajzolódna, a helyén legalább az iskolai bejárat látható marad.
6. A v1.43.27-ben már megjavított **egyetlen soros fejléc** változatlan: balra Facebook, Instagram és KRÉTA **K** ikon, középen címeres menü, jobbra keresés és témaváltó; a régi mobil/asztali fejléc-elemek görgetéskor is elrejtve.
7. Az asztali CSS/JS/media tartalom és az intézményi JSON-adatok változatlanok. A közös belépési pontok kizárólag a v1.43.28 cache-verziót és mobil fájlneveket kapják.

## Jóváhagyott B változat – a mobilos nyitókép helye

A felhasználó a B irányt választotta: **a filmes képváltó csak a mobilos kezdőlap nyitórészében szerepel**. Ez nem egy második, tapadó fejléc: a `.cs-mb-cinema` és a képváltó információs panelje a `#global-hero` normál dokumentumfolyamában marad; a görgetéssel együtt természetesen elhagyja a kijelzőt. A felső fejléc ezután is csak az egyetlen ikonsor.

- A főoldal tetején a képek, előző/következő nyilak, számláló, témakörlink és automatikus lejátszás kezelője együtt láthatók.
- A képes nyitórész alá görgetve nincs külön lebegő képváltó. A képváltó a nyitóképpel együtt felgördül.
- Az `IntersectionObserver` érzékeli, hogy a képváltó már nincs a képernyőn, és az automatikus lapozást szünetelteti. A képes részre visszatérve folytatódhat.
- Aloldalakon nem jön létre egy újabb filmes képváltó. A desktop képváltót és a desktop fejlécet nem módosítottuk.
- A `36px` utáni fejlécösszehúzódás **nem egyenlő** a teljes nyitókép görgetéssel történő elhagyásával: rövid görgetés után a képváltó még látszódhat a normál tartalomban. Ezt a működést a felhasználó B választása szerint őrizzük meg; nincs hirtelen tartalomeltüntetés és görgetési ugrás.

## Ellenőrzési kapuk

| Kapu | Ellenőrzés | Eredmény |
|---|---|---|
| M18.3/A | Késleltetett képkocka, előbb futó timeout, késői rAF; létező tartalékkép | Sikeres szimulált DOM- és fájlpróba |
| M18.3/B | Normál áttűnés és `transitionend`, később már hatástalan fallback | Sikeres szimulált DOM-próba |
| M18.3/B2 | B változat: kilépés a nyitórészből, automatikus képváltás szüneteltetése és visszatérés | Sikeres szimulált IntersectionObserver-próba |
| M18.3/C | Korábbi 9 mobilszélesség, ikon-KRÉTA és scroll izoláció | Sikeres strukturális/DOM ellenőrzés |
| M18.3/D | Asztali határ, JSON/SPA, régi modulok, teljes SHA leltár | Sikeres automatizált regresszió |
| M18.3/E | Teljes ZIP, visszabontás utáni ismételt ellenőrzés | Sikeres |
| M18.3/F | Kilenc kezdőlapos médiatétel és a hozzájuk tartozó 45 WebP-állomány valós dekódolása | Sikeres fájlpróba |
| Nyitott | Valós iOS Safari / Android Chrome, képi animáció megfigyelése és hálózati betöltés | **Még nem tesztelt** |

## Képes elrendezési bemutató

A `reports/csanadi-v1.43.28-m18-3-mobilos-elrendezes-bemutato.html` a mobilfejléc két állapotának **kódból készült szemléltetése**, nem valódi eszközös képernyőfelvétel.

## Visszaállíthatóság

- A v1.43.25, v1.43.26 és v1.43.27 korábbi mappái, teljes ZIP-csomagjai változatlanok.
- A v1.43.28 önállóan kicsomagolható, SHA-256 leltárral rendelkező statikus kiadás.
- Éles FTP/GitHub aktiválás **nem engedélyezett**, nem történt.
- **Végső jóváhagyás külön szükséges**, a valódi iPhone/Android megjelenés ellenőrzésének tudomásulvételével.
