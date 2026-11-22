# Csanádi weboldal – v1.43.33 / M21/D mobilos finomítási jelentés

**Kiadás napja:** 2026. november 21.  
**Állapot:** helyi, kiadható ZIP; végső felhasználói jóváhagyásra vár.  
**Közzététel:** nem történt. Sem FTP-, sem GitHub-művelet nem történt.

## 1. Kérés és változási korlát

A v1.43.32 M20/D átadása után a felhasználó a következő mobilos javítások tényleges lefejlesztését kérte. A megkezdett M21/D finomítás kizárólag a telefonos viselkedést célozza. A korábbi, jóváhagyott v1.43.32 külön forrásmappában és teljes ZIP-ként változatlan.

- A tényleges működési javítások kizárólag a `mobile/` modulokban vannak.
- Az asztali CSS és a desktop-komponensek JavaScript-logikája nem változott.
- A közös `index.html`, `script.js`, `js/app.js`, `js/blocks.js`, `js/hero-2026.js`, `json/config.json` és `service-worker.js` csupán a **v1.43.33-as verzióazonosítókat és mobilmodulok cache/import URL-jeit** frissíti. Erre azért van szükség, hogy a régi, gyorsítótárban lévő mobilmodulok ne töltődjenek be újra.
- A JSON-tartalmak, a menühierarchia és az eredeti asztali nézet nem kaptak új funkciót.

## 2. Szakaszonkénti fejlesztés és ellenőrzés

| Kapu | Elvégzett munka | Ellenőrzés | Eredmény |
|---|---|---|---|
| M21.1 | A fejléc újraméri az eltolást a Safari címsorának/virtuális billentyűzetének változásakor is; hiányzó MutationObserver esetén is inicializálható marad | fejléc DOM-próba, viewport-mérés, asztali határ | Sikeres |
| M21.2 | Az első–harmadik szintű mobilmenü nem épül újra azonos szélességű, azonos elrendezési módú magasságváltozáskor; a fókusz és az aktuális menüszint megmarad | menüteszt, magasságváltás, billentyűzetes visszalépés | Sikeres |
| M21.3 | Hibás nyitókép 30 másodpercre kimarad, a következő kattintás másik képet próbál; később automatikusan ismét választható; a korábbi működő kép marad látható | rossz kép szimulációja, újrapróbálás, képlapozás, régi Safari-dekódolási próba | Sikeres |
| M21.4 | Későn hozzáadott iskolai tájékoztatók is a kompakt mobilpanelbe kerülnek; Escape/fókusz és desktop DOM-visszaállítás megőrzött | új közlemény beillesztése, panelnyitás, Escape, visszaváltás asztalra | Sikeres |

A `tools/verify-m21-gates.mjs` mind a négy kaput egy helyen ellenőrzi. Az új, célzott `tools/verify-m21-notices.mjs` a dinamikus tájékoztatópanel működését önállóan is próbálja.

## 3. Regresszió és valódi böngésző

- A 36 örökölt és új ellenőrzőszkript átfogó futtatásából **22 sikeres**, **14 sikertelen**. A sikertelenek közül 13 régi verzióazonosítókhoz vagy történeti kiadási leltárhoz rögzített ellenőrzés, illetve azok továbbhívása; egy a **headless Chromium** indításának környezeti blokkolása. Ezért ezt nem nevezzük teljes körű regressziós sikernek. Az új **M21.1–M21.4 célzott kapuk mind sikeresek**.
- Grafikus Chromiumban, helyi HTTP-kiszolgálóval ellenőrizve: asztali kezdőlap, 300%-os nagyítással közelített mobil CSS-méret, egy sorban maradó fejlécikonok, címerre nyíló mobilmenü, második menüszint, Escape-visszalépés, kezdőlap képváltója (02/09 → 03/09), dokumentumtár aloldal, összecsukott/kinyitott tájékoztató, asztali méretre visszaállított három eredeti kártya.
- A felhasználó korábbi képernyőképein tapasztalt iOS-specifikus viselkedések **nem tekinthetők mind lezártnak** pusztán nagyított asztali Chromiumban végzett ellenőrzéstől.
- Nincs hozzáférhető natív iPhone/Android készülék, fizikai képernyőolvasó, natív Safari, teljes hálózatvesztéses PWA-frissítés, és nincs mind a 78 aloldalra kiterjedő vizuális eszközmátrix. Ezek továbbra is **nyitott ellenőrzések**.
- A kódban végzett asztali elkülönítés statikusan és célzott DOM-próbával ellenőrzött, de egy ilyen ellenőrzés nem bizonyít minden asztali útvonal pixelpontos változatlanságát.

## 4. ZIP, SHA-256 leltár és visszaállítás

- A `release-manifest.json` a teljes fájllistát minden állomány bájtméretével és SHA-256 lenyomatával tartalmazza.
- A kiadási integritás- és kaputeszt: `node tools/verify-v14333-release.mjs`.
- A teljes ZIP `unzip -tq` integritásellenőrzése, külön mappába kicsomagolása, a visszaállított példányon futtatott kiadási teszt és a forrással történő `diff -qr` összehasonlítás az átadási eljárás része.
- A végleges ZIP SHA-256 lenyomata külön szerepel az átadási üzenetben, hogy ne keletkezzen önmagára hivatkozó fájllenyomat a ZIP belsejében.

## 5. Átadás és döntés

Ez az M21/D helyi, ellenőrizhető előnézeti kiadás. A következő szakasz csak külön döntés alapján kezdődjön. FTP-, GitHub- vagy bármilyen éles közzététel **nem engedélyezett és nem történt**.
