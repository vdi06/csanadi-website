# Csanádi Sportiskola 2026 – 13. fejlesztési kör, teljes fejlesztési és tesztbeszámoló

**Dátum:** 2026. november 15.  
**Kiinduló csomag:** `Csanadi_Sportiskola_2026_KORMENU_ES_TELJES_KEZIKONYV_FTP.zip`  
**Feltöltés az iskolai FTP-re:** NEM TÖRTÉNT.

## A felhasználó pontosan ezt kérte

A korábban átadott teljes honlap funkcióinak megtartását; a következő tíz fejlesztést egyszerre: 1. körmenü prémium finomhangolása; 2. képes oldaltérkép 3.0; 3. mobilos teljes javítás; 4. teljesítményoptimalizálás 2.0; 5. médiakezelő 6.0; 6. dokumentumtár 6.0; 7. kereső 6.0; 8. a 66 tartalmi oldal felülvizsgálata; 9. akadálymentességi és böngészőkompatibilitási teszt; 10. élesítési és visszaállítási rendszer. Külön kérés volt a teljes webes és PDF-kézikönyv aktualizálása, a ZIP, a részletes tesztbeszámoló, az új választó és az, hogy FTP-re semmi ne kerüljön.

## Tételes fejlesztések – mi valósult meg

**1. Körmenü prémium finomhangolása – kód elkészült, vizuális átvétel nyitott.** A középső Csanádi-címeres gomb nyitáskor és záráskor ugyanaz az áthelyezett DOM-elem marad, a meglévő témakör-, almenü- és külső gyűrűs megoldás megmaradt. A nyitott körmenü billentyűzetes Tab-fókuszcsapdát kapott (`js/app.js`), fókuszjelölését bővítettem.

**2. Képes oldaltérkép 3.0 – kód elkészült, vizuális átvétel nyitott.** A két képes oldalsáv íves kivágású, egyenként számozott és előre-hátra léptethető; Szünet/Folytatás kapcsolóval, érintőképernyős vízszintes húzással egészült ki. A felső részen nincs másik önállóan váltakozó hero. `js/hero-2026.js`, `css/round13-accessibility.css`.

**3. Mobilos elrendezés – kódszintű 320–768 px javítás elkészült, teljes mobilmátrix nincs igazolva.** Gombméretek, lapozó görgethetősége, szövegméretek és a középen kivágott kör felületei célzottan javultak; a pontos pixelilleszkedés és érintéses kezelés valódi böngészős/telefonos átvételt igényel.

**4. Teljesítményoptimalizálás – működési kód elkészült, gyorsulási szám nem igazolt.** Megmaradtak a reszponzív WebP médiák és a `js/round12-media-performance.js`. Új `service-worker.js` hálózat-first stratégiával a HTML/JSON-hoz és korlátozott, maximum 100 elemes média-gyorsítótárral, csak helyi eredetű kérésekhez. A regisztráció csak biztonságos HTTPS/localhost környezetben indul. Bootstrap változatlan CDN, nem helyi fájl.

**5. Médiakezelő 6.0 – meglévő funkciók megőrizve, duplikátumellenőrzés bővült.** A média-CRUD, tömeges kategorizálás/címkézés, visszavonás, hivatkozási jegyzék és helyi ZIP-export megmaradt. Új gomb: „Duplikátum-ellenőrzési CSV” az azonos SHA-256 fájlokról, hivatkozásszámmal; törlés nincs automatizálva.

**6. Dokumentumtár 6.0 – metaadatkezelés, verziótörténet és PDF-elérés javítva.** A korábbi keresés/szűrés és PDF-előnézet megmaradt; a dokumentum részleteinél előnézeti hiba esetén közvetlen megnyitás és letöltés áll rendelkezésre. A teljes kézikönyv **2.0.0** dokumentumverzió, 18 oldalas PDF, webes változat, megfelelő SHA-256 és bájtméret; a Dokumentumtárban önálló hivatkozást kap. A régi PDF-verziók fizikai példányainak archiválása nem automatikus.

**7. Kereső 6.0 – javaslatképzés továbbfejlesztve.** Az előző útvonalalapú kereső, találati kiemelések, tartalomtípus- és témakörszűrés megmaradt. Részleges címegyezés alapján alternatív keresési javaslatok érhetők el találathiánynál. Teljes keresési relevanciamátrix nem készült.

**8. A 66 oldal tartalmi felülvizsgálata – tételes, exportálható munkalap készült, intézményi hitelesítés nyitott.** `tools/tartalmi-hitelesites.html`: három adatcsoport (66 oldal, dokumentumok, média/asset), helyi státusz és megjegyzés, keresés, CSV/JSON-export. Külön tételes CSV készült a 66 oldalról és a médiák regiszterben rögzített jogállásáról. Az indexben 10/66 oldalnál `verifiedContent=true`, 56 oldalnál nincs ilyen jelölés. A 114 médiaazonosító jogállása: {'user-provided': 1, 'pending': 29, 'preview-only': 4, 'generated': 80}. A jogosultságok és intézményi tények emberi jóváhagyását a kód nem helyettesítheti.

**9. WCAG és böngészők – fókusz- és kezelésjavítások megvannak, a megfelelőség nincs igazolva.** Skip-link, látható focus-visible, billentyűzetes oldalválasztás és a nyitott menü fókuszcsapdája szerepel. Teljes WCAG 2.2 AA, képernyőolvasó- és kontrasztaudit, valamint Chromium/Firefox/Safari kattintásos átvétel még nyitott.

**10. FTP-kiadási rendszer – teljes fájlcsomag, manifest és visszaállítási eljárás kész.** `release-manifest.json` minden állomány SHA-256 és méretadatával; a böngészős kiadásellenőrző nyolc kritikus fájlt tud hash alapján ellenőrizni. Külön `dokumentacio/FTP_ATALLAS_ES_VISSZAALLITAS.md` részletes manuális átállási és visszaállítási ellenőrzőlistával. A statikus FTP-feltöltés nem atomikus; az élesítés és a visszaállítás külön intézményi feladat.

## Teljes kézikönyv és PDF-megnyitás

- `utmutato.html`: teljes webes kézikönyv, az összes 66 navigálható oldal és mind a 7 karbantartó HTML-eszköz útmutatója, helyi kereséssel.
- `assets/documents/csanadi-weboldal-teljes-hasznalati-utmutato-2026.pdf`: PDF 2.0, 18 A4 oldal, kereshető szöveggel, dokumentumjegyzékben SHA-256 metaadatokkal.
- A Dokumentumtár az útmutatóra három külön utat ad: kereshető webes könyv, PDF megnyitás új lapon, PDF letöltés.
- A ZIP-en kívül külön PDF-másolat is rendelkezésre áll, mert a korábbi beszélgetésben a PDF-hivatkozás megnyitása problémát okozott.

## Fájlszintű és működési tesztek

A tesztfuttatásban **23 sikeres és 0 hibás** statikus ellenőrzési csoport szerepel. A JavaScript-fájlok szintaxisa, a JSON-állományok érvényessége, a 66 regisztrált útvonal, a kézikönyv oldalfedése, a PDF szövegének olvashatósága, a dokumentumfájlok hashadatai és a médiák hivatkozásai ellenőrzöttek. A helyi HTTP-kiszolgáló `index.html`, `utmutato.html`, PDF, oldalindex, hitelesítési eszköz és service worker kérésekre **HTTP 200** választ adott. A PDF Content-Type: `application/pdf`.

**Kritikus korlát:** A Chromium Playwright környezet a helyi webcímeket `net::ERR_BLOCKED_BY_ADMINISTRATOR` hibával elutasította; emiatt a 320, 360, 390, 430, 768, 1024 és 1440 px nézetek vizuális/érintéses tesztje és a böngészőközi regresszió nem volt bizonyítható. A PDF első és utolsó oldalát külön renderelt képen ellenőriztem; ez nem igazolja a webhely valamennyi kijelzőméretét. Nem állítható teljes WCAG 2.2 AA megfelelőség.

## Elmaradt / külső feltételt igénylő feladatok

- Az iskola tényleges honlap-tartalmainak ténybeli és jogi jóváhagyása (különösen a 56 ellenőrzési jelölés nélküli oldal és a pending/preview-only média).
- Az összes menüpont, keresőtalálat, képlapozó és adminművelet kattintásos próba; teljes valós böngészős és mobilos teszt.
- CDN elérhetőség / tényleges PageSpeed vagy Lighthouse mérés és FTP-cache fejlécek ellenőrzése.
- Az előző PDF-fájlok és korábbi teljes éles kiadások tényleges szerveroldali archiválása, ha az intézmény ezt igényli.
- Éles FTP-kiadás és valódi visszaállítási próba (ezt kifejezetten nem végeztem el).

## Átadás

A ZIP gyökerében `index.html` található. Megmarad minden eredeti CSS, JS, JSON, HTML, PDF és média. Az új kód kommentmentes. Nincs GitHub Actions-függő funkció; a service worker HTTPS esetén működik, a Bootstrap CDN internetkapcsolatot igényel. **Az iskolai FTP-re semmit nem töltöttem fel.**
