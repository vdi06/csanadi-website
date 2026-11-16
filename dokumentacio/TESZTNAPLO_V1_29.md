# Csanádi v1.29.0 – teljes regressziós tesztnapló

- Készült: 2026. november 16., hétfő 8:58:07 CET (Europe/Budapest).
- Vizsgálat tárgya: helyi v1.29.0 ZIP-kiadási forrás; nem az élő GitHub Pages állapota.
- Ellenőrző programok: 15/15 sikeres.
- A statikus HTTP-teszt és a böngészős ellenőrzés eredménye külön összesítésben szerepel; nem tekintjük automatikusan sikeresnek.

## test-release-v1-29.js

- Állapot: SIKERES.
- Futás: 21913 ms.

```text
{"pages":65,"html":23,"json":124,"javascript":204,"checks":46,"passed":46,"failures":[],"oldDomainUrls":0,"fileProblems":[],"statuses":{"F":260,"K":260,"V":1241,"N":199,"H":55}}
```

## test-mobile-sections-v1-29.js

- Állapot: SIKERES.
- Futás: 98 ms.

```text
{
  "version": "1.29.0",
  "total": 48,
  "passed": 48,
  "failed": []
}
```

## test-embedded-arrival-v1-29.js

- Állapot: SIKERES.
- Futás: 75 ms.

```text
{"version":"1.29.0","total":13,"passed":13,"failed":[]}
```

## test-theme-sync-v1-29.js

- Állapot: SIKERES.
- Futás: 96 ms.

```text
{"version":"1.29.0","total":12,"passed":12,"failed":[]}
```

## test-existing-features-v1-29.js

- Állapot: SIKERES.
- Futás: 173 ms.

```text
{
  "version": "1.29.0",
  "passed": 22,
  "total": 22,
  "failed": []
}
```

## test-mobile-tree-v1-29.js

- Állapot: SIKERES.
- Futás: 95 ms.

```text
{"version":"1.29.0","passed":8,"total":8,"failures":[]}
```

## test-current-hardening-v1-29.js

- Állapot: SIKERES.
- Futás: 103 ms.

```text
{"version":"1.29.0","total":49,"passed":49,"failed":[]}
```

## test-mobile-navigation-v1-11.js

- Állapot: SIKERES.
- Futás: 89 ms.

```text
OK Három meglévő alsó menüikonból pontosan a középső a címer
OK A felső logó sem a kezdőlapon, sem az aloldalakon nem duplikálódik
OK A mobilos felső és alsó keresés nem jelenik meg kétszer
OK Ha az alsó sáv hiányzik, a felső gomb megmaradhat tartaléknak
OK A menü és keresés helyes aria-controls hivatkozást kap
OK A címerrel a főmenü önállóan nyitható
OK Menünyitás és bezárás szövege az állapottal együtt változik
OK A keresés gomb megőrzi a korábbi kereső megnyitását
OK Az új CSS megfelelő mobilos cache-verzióval van bekötve
{"stage":"v1.24.0","passed":9,"total":9}
```

## test-regressions-v1-10.js

- Állapot: SIKERES.
- Futás: 111 ms.

```text
{"stage":"v1.10.0","passed":8,"total":8,"checks":["A sikertelen JSON betöltés újrapróbálható marad","A frissítési lekérdezések egymásra futását két külön őr akadályozza","Másik útvonalra érkező korábbi JSON válasz nem írja felül az aktuális oldalt","A hibás vagy visszavont oldal JSON-ja nem kerül be a megjelenített oldalba","Valóban újabb kiadásnál egyszeri frissítési értesítő jelenik meg","Frissítés gomb után az újratöltés először elmenti az értesítő lezárását","Ugyanaz az értesítés a sikertelen újratöltés után sem ragad be","Azonos kiadásra nem jelenik meg hamis frissítés"]}
```

## test-subpage-header-v1-9.js

- Állapot: SIKERES.
- Futás: 80 ms.

```text
OK Középen kapcsoló címer: egyetlen, valódi button elem
OK Kezdeti aloldali fejléc a látható hero miatt teljes
OK Címerkattintás ugyanazt a menü-eseményt küldi
OK Menü megnyitása és bezárása az aria-expanded állapothoz kötött
OK Lefelé gördülve csak a hero eltűnése után kompakt
OK A hero 20 pixeles holtsávjában megmarad a kompakt mód
OK Felfelé gördülve 50 pixeles visszatérésnél újra teljes
OK Hero nélküli oldalon is működik a kompakt váltás
OK SPA-újrainicializálás nem másolja a középső menügombot
OK A címer teljes és kompakt fejlécnél is tényleg középre kerül
OK Mobilon csak az alsó címer látszik, tartalék felső gombbal
OK Alsó mobilcímer a menüt a rejtett kezdőlapi orbit-gomb nélkül is nyitja
{"passed":12,"failed":0,"method":"DOM-esemény szimuláció + CSS-forrásvizsgálat, nem pixeles böngészős ellenőrzés"}
```

## test-review-worklist-v1-9.js

- Állapot: SIKERES.
- Futás: 91 ms.

```text
OK A 65×31 mátrixból pontosan 55 nyitott tétel szerepel
OK Forrásútvonal és szabályazonosító az első tételben
OK Jóváhagyási adat nem rögzíthető ellenőrző és bizonyíték nélkül
OK A három igazoló mező és a döntés azonosítója helyben tárolódik
OK JSON-export tartalmazza az összes munkatételt, intézményi flag módosítása nélkül
OK Keresés és munkastátusz-szűrés csökkenti a látható tételeket
OK Hiányos döntésű importot automatikusan felülvizsgálandóvá minősít
{"passed":7,"failed":0,"records":55,"httpWrites":0,"sourceVerifiedChanged":false}
```

## test-media-manager-v1-9.js

- Állapot: SIKERES.
- Futás: 122 ms.

```text
OK QR útvonal és biztonságos fájlnév
OK Hibás cím nem módosítja a szerkesztett adatot
OK Új közzététel nem lehetséges jogosultsági jóváhagyás nélkül
OK Új grafika nem tehető közzé alternatív szöveg nélkül
OK Új publikálás bizonyíték és ellenőrző nélkül megáll
OK Érvényes adatlap szerkesztése visszavonható állapottal
OK A közzététel futtatáskor is ellenőrzi a jogosultságot
OK Jogállás-szűrő felismeri a korábban kihagyott publikált regisztrálatlan médiát
OK A jogállás-szűrés a tényleges felülvizsgálati listában is megjeleníti a hiányokat
OK A katalógus minden fizikai assets fájlt lefed
{"passed":10,"failed":0,"catalog":628}
```

## test-media-export-v1-9.js

- Állapot: SIKERES.
- Futás: 11926 ms.

```text
OK 628 fájl és jogállás betöltése
OK Jogállás szűrő éles indexen
OK QR-kód átnevezése minden JSON-hivatkozásban
OK Új kép létrehozása és szerkesztői metaadat
OK Kiadási ZIP tartalmának előkészítése valódi JSON-okkal
OK Törlésre jelölés és tiszta, újrakészíthető kiadás
{"passed":6,"failed":0,"checks":{"628 fájl és jogállás betöltése":true,"Jogállás szűrő éles indexen":true,"QR-kód átnevezése minden JSON-hivatkozásban":true,"Új kép létrehozása és szerkesztői metaadat":true,"Kiadási ZIP tartalmának előkészítése valódi JSON-okkal":true,"Törlésre jelölés és tiszta, újrakészíthető kiadás":true}}
```

## test-static-http-v1-29.js

- Állapot: SIKERES.
- Futás: 2640 ms.

```text
{"version":"1.29.0","server":"http://127.0.0.1:8829/","pages":65,"assets":628,"otherStaticFiles":445,"samples":6,"checks":1146,"passed":1146,"failures":[]}
```

## reconcile-assets-catalog.js

- Állapot: SIKERES.
- Futás: 639 ms.

```text
{"physicalAssets":628,"indexedAssets":628,"previouslyMissing":0,"orphanedRecords":0,"unindexed":0,"integrityMismatches":0,"qrAssets":87,"jsonSources":94,"addedJsonSources":0,"written":false}
```

