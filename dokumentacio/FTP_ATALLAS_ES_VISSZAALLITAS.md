# Csanádi Sportiskola 2026 – FTP-átállás és visszaállítás

## Kiadás – 2026. november 15.

A csomag teljes statikus honlap: az `index.html` a webgyökérbe kerül, a `css/`, `js/`, `json/`, `assets/`, `tools/`, `dokumentacio/` mappákkal, az `utmutato.html` és `service-worker.js` fájlokkal együtt. **Ezt a kiadást nem töltöttük fel az iskolai FTP-re.** A Bootstrap 5.3.9 továbbra is verzióhoz kötött CDN-ről töltődik be. Nincs PHP-, Node-, GitHub Actions- vagy adatbázis-követelmény.

## Élesítés előtti kötelező lépések

1. A jelenlegi iskolai FTP teljes webgyökér-tartalmáról készíts dátumozott, visszaállítható mentést; a mentés ne ugyanabban az éppen frissített könyvtárban legyen.
2. Ellenőrizd az összes intézményi adat, fotó, videó, sporteredmény és dokumentum jóváhagyását. A `tools/tartalmi-hitelesites.html` helyi felülvizsgálati munkalap státuszai nem számítanak intézményi jóváhagyásnak.
3. Bontsd ki a ZIP-et helyi munkamappába, és ellenőrizd, hogy a gyökérben megtalálható az `index.html`. Nézd meg a `release-manifest.json` fájlt is.
4. Indítsd el a `tools/ftp-kiadas-ellenorzo.html` oldalt HTTP(S)-szerverről; végezz teljes állományellenőrzést és hash-vizsgálatot, majd exportáld a CSV-jelentést.
5. Külön teszteld 320, 360, 390, 430, 768, 1024 és 1440 px szélességben a körmenüt, oldalsó képsávokat, keresőt és PDF-dokumentumtárat. A Chromium-, Firefox- és Safari-teszteket, billentyűzetes kezelést és WCAG 2.2 AA ellenőrzést rögzítsd.
6. Az átvételi tesztek és jóváhagyások után készíts kézi ütemezett feltöltési tervet. A fájlonkénti FTP-feltöltés nem atomikus, ezért közzététel közben átmenetileg eltérő verziók keveredhetnek. A legbiztonságosabb, ha a tárhelyen változatlanul megőrzött kiadási könyvtárak és külön aktiválási mechanizmus használhatók; ennek támogatását az FTP-szolgáltatónak kell igazolnia.
7. Csak a tényleges élesítés előtt, külön döntés alapján ellenőrizd a `noindex` fejléceket és a hivatalos közzétételi megfelelést. A hash-alapú SPA útvonalainak keresőmotoros indexelése korlátozott lehet.
8. Feltöltés után HTTP(S) URL-ről tesztelj: `index.html`, `utmutato.html`, Dokumentumtár, külön PDF, JSON-fájlok, média, mobilos menü, kereső, körmenü és az `assets/` alatti dokumentumok.

## Visszaállás hibás kiadás esetén

**20. kiadás – teljes ZIP-ek különbsége:** a `tools/fejlesztoi-munkakozpont-20.html` oldalon két teljes ZIP összevethető. A letölthető visszaállító ZIP a korábbi kiadásból helyreállítandó állományokat tartalmazza. A `dokumentacio/rollback20_torlendo.json` a kizárólag az új kiadásban lévő fájlokat sorolja fel, amelyeket külön, ellenőrzötten kell eltávolítani. A böngésző sem feltöltést, sem törlést nem hajt végre az FTP-n. A ZIP32, nem titkosított csomag és böngészős deflate-raw támogatás előfeltétel.

Az új cache-verzió `csanadi-r20-20261115`; a módosított JS/CSS hivatkozások verziózottak. A `offline-olvaso.html` csak HTTPS/localhost mellett tud kiválasztott, előzőleg letöltött oldaltartalmakat menteni a kiadáshoz kötött böngészőtárba. Éles váltás után az offline másolatokat és a szolgáltató HTTP-cache beállításait is ellenőrizd.

1. Azonnal állítsd le a hibás feltöltést, és azonosítsd az utolsó teljes, jóváhagyott mentést.
2. A mentett fájlokat az eredeti pontos elérési utakra helyezd vissza. Ha a szolgáltató verziózott kiadási könyvtárat és központi aktiválási mutatót biztosít, csak az igazoltan működő kiadásra mutass vissza.
3. A böngésző esetleges service worker gyorsítótárát frissítsd; a service worker verziója megváltozik új kiadáskor. Egyszerű böngészőfrissítés nem mindig törli az offline fájlokat.
4. Ellenőrizd újra a legfontosabb aloldalakat és letölthető PDF-eket HTTP(S)-en, és rögzítsd az incidens okát.
5. Ne tekints sikeres visszaállásnak egyetlen fájl visszamásolását, ha a teljes állományverziók összhangja nem igazolt.

## Technikai határok

A böngésző nem írhat vissza az FTP-re; a helyi CRUD- és hitelesítési segédoldalak csak exportálnak. A service worker csak biztonságos környezetben (HTTPS/localhost) érhető el; CDN-szkripteket nem helyettesít. A PDF-ek előnézetét a felhasználó böngészője határozza meg, ezért a közvetlen letöltés kötelező tartalék. A jelen csomag csak előkészítés, nem valós élesítési vagy intézményi jóváhagyási bizonyíték.
