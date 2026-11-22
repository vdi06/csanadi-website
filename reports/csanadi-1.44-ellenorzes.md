# Csanádi weboldal – 1.44

**Kiadási állapot:** helyileg elkészült, végső megrendelői jóváhagyásra váró ZIP.  
**Dátum:** 2026. november 21.  
**Kiinduló, sértetlenül megőrzött kiadás:** v1.43.33 / M21/D.  
**Hatókör:** négy mobilos funkcionális javítás, egy közös verziókezelési hibamegelőzés és mobil–asztali átfogó ellenőrzés.  
**Közzététel:** FTP-re vagy GitHubra nem történt feltöltés.

## 1. Elfogadott célok és konkrét változások

| Kapu | Megvalósítás | Elfogadási feltétel |
|---|---|---|
| **M22.1 – Fejléc és közösségi ikonok** | A Facebook és Instagram ellenőrzött, közzétett iskolai URL-je az adatszolgáltatás megérkezéséig vagy kiesésekor is megjelenik; sikeres JSON-betöltéskor az ellenőrzött adatkészlet felülírja a tartalékot. A címergomb nyitott/csukott ARIA-állapota az első megjelenéskor és megnyitáskor is frissül, MutationObserver nélkül is. | Mindkét ikon látszik és elérhető a mobilfejlécben; a KRÉTA egyetlen `K` ikon; az asztali fejléc elemei érintetlenek. |
| **M22.2 – Mobil körmenü fókusza** | A második/harmadik szint „áttekintés” linkjének fókusza megmarad szélességváltáskor és menüadatok újratöltésekor. | A menüszint, az aktuális téma és a billentyűzet-fókusz nem ugrik el az áttekintésről. |
| **M22.3 – Filmes első kép helyreállítása** | A hibás vagy hiányzó első nyitóképről a mobilos képváltó a következő használható képre próbál továbblépni, nem hagyva üres első képernyőt; újabb betöltési hibánál az M21-es 30 másodperces kíméletes kihagyás megmarad. | Hibás első kép mellett a második kép felirata és tartalma elérhető; lapozógombok újra használhatók. |
| **M22.4 – Elérhető vezérlők és tájékoztatók** | A mobilos billentyűzetes szűrő- és fülváltás nem lép CSS által rejtett vagy inaktív vezérlőre. A programból bezáródó tájékoztató a rejtett törzsből a nyitógombra helyezi vissza a fókuszt. | Csak látható kontrollok szerepelnek a nyílbillentyűs körben; zárt panelben nem marad fókusz. |

## 2. Elkülönítés és megőrzés

- A jóváhagyott **v1.43.33** eredeti könyvtára és ZIP-je változatlan maradt. A kiinduló ZIP SHA-256 azonosítója: `67b62f81e5f64353cfb76ca2fef193ecee6904d660dde77453e8a1146b824a1d`.
- A változtatott működési modulok: `mobile/reboot-shell-v1-43-29.js`, `mobile/reboot-menu-v1-43-29.js`, `mobile/reboot-hero-v1-43-29.js`, `mobile/reboot-quality-v1-43-29.js`.
- **Nem változott** az `assets/`, `css/`, `desktop/` gyűjtemény, az asztali oldalmegjelenítési logika és az asztali CSS. A `js/app.js`, `js/blocks.js`, `js/hero-2026.js`, `script.js`, `index.html`, `service-worker.js`, `json/config.json` állományokban csak a `1.44`-re váltott hivatkozási verzió vagy gyorsítótár-azonosító változott. A **közös** `js/round13-network.js` verzióértelmezője mostantól a két tagú verziót is elfogadja, a korábbi háromtagú változatról történő frissítést megőrizve.
- A mobilos stíluslap továbbra is kizárólag `screen and (max-width: 768px)` médiával töltődik be; az új funkciók a mobilos modulokból indulnak. A desktopon megmaradnak a korábbi képek, navigáció és fejléc.
- Az asztali nézetben végzett böngészős ellenőrzés és a munkakönyvtárak összehasonlítása megerősítette az elkülönítést. Teljes fizikai eszközös garancia ebből nem következik.

## 3. Külön ellenőrzési kapuk

| Kapu | Automatizált vizsgálat | Eredmény |
|---|---|---|
| M22.1 | `verify-reboot-shell`, `verify-m18-header-layout`, `verify-m18-legacy-header-isolation`, offline tartalék / ARIA ellenőrzés | **PASS** |
| M22.2 | `verify-reboot-menu`, `verify-m17-desktop-hero-isolation`, áttekintéslink fókuszteszt | **PASS** |
| M22.3 | `verify-reboot-hero`, `verify-m18-mobile-image-race`, hibás első kép DOM-teszt | **PASS** |
| M22.4 | `verify-reboot-quality`, `verify-m21-notices`, M13/M12 és keresztplatform regressziók, rejtett vezérlő / bezárási fókusz | **PASS** |

Az összes célzott kapu az `node tools/verify-m22-gates.mjs` paranccsal ismételhető. A két tagú verzió tesztje `node tools/verify-v144-version.mjs`; a teljes fájl- és tartalomellenőrzés: `node tools/verify-v144-release.mjs`.

## 4. Böngészős és reszponzív próba

Valós Chromium grafikus böngészővel, helyi HTTP-kiszolgálón végzett vizuális vizsgálat:

- **Asztali kezdőlap:** desktop fejléc és eredeti asztali nyitókép megjelent.
- **Keskeny, mobil CSS-t aktiváló nézet:** Chromium 300%-os nagyításával közel 350 CSS-pixel széles megjelenítést kaptunk; az öt külső/kereső/témaváltó vezérlő és a címer egy sorban jelent meg, a KRÉTA felirata egyetlen ikonnal szerepelt.
- **Mobil menü:** címerből a navigáció megnyílt, az első és második menüszint elérhető volt; az áttekintés-hivatkozások fókusza DOM-teszttel igazolt.
- **Mobil aloldal:** „Iskolánk” tartalom betöltött, a „Fontos tájékoztatók” nyitható/csukható panelje működött, a görgetés után is a kompakt ikonos fejléc maradt látható; külön lebegő képváltó nem jelent meg.
- **Visszaváltás desktopra:** a 100%-os nagyítás visszaállítása után az asztali aloldal az eredeti fejlécével, tájékoztató kártyáival és tartalmi elrendezésével jelent meg.
- **Asztali dokumentumtár:** az `#/informaciok/dokumentumtar` oldal, kategória- és keresőfelület megjelent. A „Kosárlabda alapfogalmak” PDF a weboldal **saját dokumentumablakában** nyílt meg, a második lapra léptetés megtörtént; a felső bezáró gomb működött.
- **Mobil sportgaléria:** az `#/sport/sportgaleriak` oldal megjelent a kompakt, görgetésnél is látható fejléc alatt. Megjelentek az albumok, a képszűrő, a rendezés és a képkártyák. A „Kosárlabdacsarnok” kép a saját képnézőben nyílt meg, a jobbra léptetéskor **1/128 → 2/128** változott és a második kép ténylegesen megjelent. Az Escape bezárta a nézőt.
- **Asztali sportgaléria:** a 100%-os nagyításra visszatérve a háromoszlopos képkártyák és az asztali fejléc megjelent. A témaváltás minden aloldali kombinációját nem teszteltük, ezért nem állítjuk, hogy általánosan hibamentes.

**A Chromium nagyítása nem helyettesíti a valódi iPhone/Android böngészőt vagy az eszközméret-emulációt.** A Safari-, iOS PWA-, Android WebView- és lassú hálózatos fizikai vizsgálat továbbra is nyitott. A böngésző eredetileg `?preview=1` URL-lel korlátozta a linkek követését a tartalmi előnézeti mód miatt; ezt a próba közben normál `/#/iskolank` útvonalra váltva kiküszöböltük – ez nem a mobil menü hibája.

## 5. További regressziók és ismert korlátok

### Keresztplatformos, statikus teljeskörűségi vizsgálat

A `node tools/audit-v144-surfaces.mjs` újraellenőrzése **hiba nélkül** végződött:

| Ellenőrzési kör | Átvizsgált mennyiség | Megállapítás |
|---|---:|---|
| JSON-állományok szintaktikája | 111 | Mind feldolgozható |
| Menüoldal-bejegyzések | 78 | Hivatkozások ellenőrizve |
| Oldalindex-bejegyzések | 79 | Hivatkozások ellenőrizve |
| Médiaállományok | 819 | Meglévő állományok ellenőrizve |
| Médiára mutató adathivatkozások | 107 | Feloldás ellenőrizve |
| JavaScript-források és tesztek szintaxisa | 117 | Ellenőrzés sikeres |

Az `pages/home.json` természetesen az oldalak indexében szerepel, de a menüben nem: ez az ellenőrző egyetlen **figyelmeztetése**, nem törött hivatkozás. A statikus felülvizsgálat **nem** jelenti azt, hogy mind a 79 oldalt kézzel, minden gombját kipróbáltuk.

### Internetes szabványok alapján kiemelt hibakockázatok

- **320 CSS-pixeles szöveg- és tartalom-újratördelés**, valamint fókusz eltakarása görgetésnél: WCAG 2.2 1.4.10 és 2.4.11 szerint további fizikai eszközös ellenőrzést igényel. Forrás: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html és https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html.
- **Érintési célterület**: WCAG 2.2 2.5.8 alapján a sűrű ikonmenü valós készüléken mérést igényel. Forrás: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html.
- **Bootstrap-modális ablak és képváltó**: a fókusz visszaadását és az animáció/csökkentett mozgás összefüggéseit célzottan ellenőriztük ott, ahol volt automatizált próba; a képernyőolvasós folyamat nyitott. Forrás: https://getbootstrap.com/docs/5.3/components/modal/ és https://getbootstrap.com/docs/5.3/components/carousel/.
- **Első nyitókép és betöltés**: az első fontos kép késleltetett betöltése ronthatja az LCP-t; ezért a hibás kép miatti üres nyitórész külön helyreállítási védelmet kapott. Forrás: https://web.dev/articles/optimize-lcp.
- **Szolgáltatásmunkásból frissítés**: az új két tagú verzió feldolgozását célzott teszttel igazoltuk; több megnyitott lap és régi, tényleges mobileszközös offline cache együttállása továbbra is ellenőrizendő. Forrás: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers.

- A teljes régi tesztgyűjteményben még szerepelnek korábbi kiadási azonosítókat (1.43.29–1.43.33) rögzítő ellenőrzők, ezért a teljes, változatlan történeti készlet nem lesz minden eleme zöld egy új kiadásban. Az 1.44 dedikált M22-kapui és az új SHA-256 ellenőrző az irányadók.
- A végigfuttatott, 38 darabos történeti `verify*.mjs` gyűjteményben **23 sikeres és 15 hibás/inkompatibilis** eredmény született. A 15 között főként előző verziót rögzítő kiadási kapuk találhatók; egy a fej nélküli Chromium környezeti indítását igényli. Az új M22-kapu külön mind a négy célzott ellenőrzést teljesítette.
- A `verify-m20-browser.mjs` hagyományos headless Chromium indítása ezen a végrehajtói környezeten biztonsági `socket(): Operation not permitted` korlátba ütközik; ehelyett külön grafikus Chromium-ellenőrzés történt.
- A közösségi hivatkozások tartalékértékeit az ellenőrzött `json/data/social.json` alapján rögzítettük. A későbbi hivatalos URL-változtatásokkal együtt a tartalékokat is frissíteni kell.
- A nyitókép helyreállításának és a fókuszkezelésnek az automatizált DOM-próbája sikeres; tényleges offline/hibás mobil rádiós hálózaton és képernyőolvasóval még ellenőrizendő.
- Valós iPhone/Safari vagy Android/Chrome eszköz nem volt hozzákapcsolva a tesztkörnyezethez. Az egyes gombokra és témákra vonatkozó **teljes** mobil- és asztaligaranciát ezért nem állítjuk; a jelentés konkrétan megnevezi a kipróbált útvonalakat és a tesztekkel lefedett kódot.

## 6. Kiadás, visszaállítás, jóváhagyás

- A kiadás egy **teljes, önálló ZIP** a weboldal állományaival, a `release-manifest.json` SHA-256 leltárral és ezzel a jelentéssel.
- A ZIP visszaállítási próbájának módszere: külön kicsomagolt könyvtár, fájllista-egyezés, SHA-256 ellenőrzés, négy célzott kapu és a forráskönyvtárral bájtszintű összehasonlítás. A kiadás zárásakor mind a négy lépés eredményét külön ellenőriztük.
- A kiadás nem automatikusan jóváhagyott: a megrendelő **külön végső jóváhagyása szükséges** az 1.44 lezárásához. A fejlesztési következő szakaszra a jóváhagyás nem ad automatikus felhatalmazást, és közzétételi engedélyt sem jelent.
