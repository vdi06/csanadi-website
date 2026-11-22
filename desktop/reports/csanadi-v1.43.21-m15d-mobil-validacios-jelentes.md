# Csanádi weboldal — v1.43.21 / M15/D mobilos validációs kiadás

**Dátum:** 2026. november 20.  
**Állapot:** helyi fejlesztési előnézet, külön végső jóváhagyásra vár.  
**Megőrzött visszaállítási alap:** jóváhagyott v1.43.20, változatlanul.  
**Hatókör:** kizárólag a 768 CSS-pixel alatti mobilmegjelenés és mobilos viselkedés; a közös belépési pontokban a kiadási verzió- és modulhivatkozások kötelező cseréje.  
**Közzététel:** nem történt FTP-, GitHub- vagy éles közzététel.

## A megrendelés és a tényleges teljesítés összefoglalása

A megrendelés M15.1–M15.4 egyenkénti fejlesztést, reszponzív és interakciós próbákat, akadálymentességi és teljesítményvizsgálatokat, PWA-frissítési ellenőrzéseket, teljes ZIP-et, visszaállítási próbát és külön végső jóváhagyást kért. A mobilos forráskód- és DOM-alapú fejlesztések és próbák megvalósultak. **A korábban nyitott valós iOS/Android-telefonos, képernyőolvasós, tényleges PDF-megjelenítési, Core Web Vitals és valós PWA-frissítési tesztek továbbra is nyitottak; nem állítjuk, hogy ezeket elvégeztük.**

## M15.1 — Reszponzív megjelenés

**Elvégzett fejlesztés:**

- A `mobile/reboot-design-v1-43-21.css` kizárólag mobilos media-szabályai tovább erősítik a naptár, tanári kártyák, hírek, dokumentumtár, galéria és keresőtalálatok szövegtördelését és horizontális középre rendezését.
- A szűrő- és lapozógombok rugalmasan törhetnek; széles táblázatok és a dokumentumnéző belső, feliratozható vízszintes görgetőterületet kapnak.
- 359 CSS-pixel alatt a képes galéria és albumrács egysávosra vált, hogy ne maradjanak túl keskeny kártyák.
- 500 CSS-pixel alatti képernyőmagasság esetére korlátozott menü- és dokumentumnéző magasságok, görgethető belső területek és kompakt frissítési panel készültek.
- A `mobile/reboot-quality-v1-43-21.js` oldaltájolás, virtuális billentyűzet/`visualViewport` változás és böngészős BFCache-visszatérés után is újraszámolja a mobilos hozzáférhetőségi segédállapotot.

**Sikeres ellenőrzés:** 8 M15-ös tervezett mobilméret (320, 360, 375, 390, 412, 430, 768 szélesség és rövid 768-as nézet), a 769 px desktop-határ, továbbá a korábbi 12-es statikus mátrix; **78 regisztrált oldal és 254 blokk** forrásregisztrációja ellenőrizve.

**Nyitott:** az összes oldal tényleges pixelszintű megjelenése és 200%/400% nagyításban való kézi ellenőrzése. Statikus tesztből nem állítható bizonyítottan, hogy valamennyi tartalom valós böngészőben kilógásmentes.

## M15.2 — Navigáció és érintés

**Elvégzett fejlesztés:**

- A háromszintű mobilmenü `Home` / `End` / `ArrowUp` / `ArrowDown` billentyűivel a látható menüpontok között navigálható. Az `ArrowLeft` és Backspace visszalépési logika megmaradt.
- Ablakátméretezés és élő katalógusfrissítés után a menüpont korábbi fókusza visszaáll, amennyiben az útvonal még látható.
- A filmes képváltó az eltérő érintésazonosítót, a többujjas mozdulatot és a megszakított érintést is kizárja a vízszintes lapozásból. A függőleges mozdulat nem vált képet.
- A korábbi saját Bootstrap-dokumentum- és galérianéző változatlan alapfunkciókkal marad.

**Sikeres ellenőrzés:** a `verify-reboot-menu.mjs`, `verify-reboot-hero.mjs`, `verify-m13-viewer-dom.mjs` frissített tesztjei és az új `verify-m15-interactions.mjs` DOM-forgatókönyvei.

**Nyitott:** tényleges ujjmozdulatok iOS/Safari és Android/Chrome alatt, böngésző-visszalépés minden mély menüútról, valódi megnyitott PDF-ek és galériák nagyítása.

## M15.3 — Akadálymentesség és teljesítmény

**Elvégzett fejlesztés:**

- Az automatikusan induló mobilos videókat immár nemcsak az adatforgalom-kímélő mód, hanem a `prefers-reduced-motion` beállítás is letiltja. A korábbi autoplay-attribútum kímélő mód megszűnésekor helyreáll.
- Megmaradt a 44 CSS-pixeles mobilos fő vezérlőcélpontokra törekvés, a külön világos/sötét színkészlet, a `focus-visible` körvonal, a galéria udvarias `aria-live` felirata és a scrollozható régiók billentyűzetes elérhetősége.
- A négy ellenőrzött alap- és frissítési gombszínpár statikus kontrasztszámítása elérte a 4,5:1 arányt.

**Sikeres ellenőrzés:** `verify-reboot-quality.mjs`, `verify-m13-mobile-interactions.mjs` és `verify-m15-a11y-performance.mjs` forrás- és DOM-próbái.

**Nyitott:** teljes WCAG 2.2 AA audit, VoiceOver/TalkBack, tényleges billentyűzet és nagyítás, Core Web Vitals LCP/INP/CLS-mérés. Mért eredmény hiányában egyetlen teljesítmény-küszöböt sem jelöltünk teljesítettnek.

## M15.4 — Frissítési folyamat és kiadásbiztonság

**Elvégzett fejlesztés és teszt:**

- A már meglévő, közös frissítési mechanizmushoz a mobilos kiadás újabb változatot, `1.43.21` service-worker azonosítót és `csanadi-r-v1.43.21` cache-jelölést kapott; a közös hálózati frissítő működése változatlan.
- Az új `verify-m15-pwa-release.mjs` a frissítési értesítést **végrehajtott JS/DOM-szimulációban** ellenőrzi: újabb verzió, „Később”, már elfogadott, korábban elhalasztott, „Frissítés” és azonos verzió. Külön Service Worker-szimuláció igazolja az explicit `ACTIVATE_UPDATE` aktiválást, és a külső eredetű, valamint nem-GET kérések kizárását.
- A korábbi 10 regressziós ellenőrzés és négy új M15 ellenőrzés, valamint a teljes SHA-256 kiadási ellenőrzés megmarad. A teljes új ZIP-et elkülönített könyvtárba kell kibontani és újra tesztelni.
- A v1.43.20 eredeti ZIP-fájlját a kiadás nem írja felül.

**Nyitott:** tényleges böngészőben telepített régi service worker, hálózati megszakítás, új workerre frissítés, valós offline indulás és a frissítési panel fizikai készülékes megjelenése. A szimuláció nem bizonyítja ezeket.

## Külön ellenőrzési kapuk és státuszuk

| Kapu | Automatizált rész | Valós eszközös rész | Összesített státusz |
|---|---|---|---|
| M15.1 | PASS – statikus reflow, 8+12 méret, 78 oldal/254 blokk | Nem ellenőrizhető itt | **Nyitott eszközös kapu** |
| M15.2 | PASS – menü, képváltó, saját néző DOM | Nem ellenőrizhető itt | **Nyitott eszközös kapu** |
| M15.3 | PASS – statikus ARIA, alapkontraszt, reduced-motion | WCAG audit és CWV-mérés hiányzik | **Nyitott mérési kapu** |
| M15.4 | PASS – frissítés DOM, SW üzenet/scope, kiadásellenőrzés | Valós PWA lifecycle hiányzik | **Nyitott PWA-kapu** |

### Valós tesztelés korlátja

A korábbi ellenőrzési körben a helyi Chromium indítása `Operation not permitted` jogosultsági hibával megállt. Nem történt jogosultsági korlát megkerülése. Fizikai iOS- és Android-készülékhez, valós képernyőolvasóhoz és élesnek megfelelő offline/PWA-környezethez ebben a fejlesztési körben nem volt igazolható hozzáférés. Ezért a valós eszközös próba **nem teljesült**, külön végrehajtandó. Ezt a kockázatot csak kifejezett felhasználói jóváhagyással lehet elfogadni.

### Javasolt kézi próbaminta

1. iPhone + Safari, Android + Chrome (tényleges készülék).
2. 320/360/375/390/412/430/768 CSS px méretek, portré és fekvő helyzet; a 768 fölötti fekvő esetek desktop-határként külön dokumentálandók.
3. Kezdőlap, mind a hat főmenü, legalább egy mélyebb almenü mindegyikből; összes 78 oldal automatizált route-ellenőrzése.
4. Keresés, naptár, dolgozói adatok, dokumentumtár, galéria, nyitófilmes lapozás és téma.
5. Dokumentum megnyitás, nagyítás, bezárás, visszatérés az eredeti oldalra.
6. Frissítési értesítés mindkét gombja, offline/online váltás, újranyitás és a régi cache-ről áttérés.
7. 200% szövegnagyítás, csökkentett mozgás, TalkBack/VoiceOver és fókuszsorrend.

## Asztali változatlanság és visszaállítás

- A `desktop/`, `css/`, `assets/` és tartalmi `json/` fájlcsoportok tartalmi lenyomatai a korábbi védett referenciaállapottal egyeznek; a konfigurációban csak a cache-verzió módosult.
- Az `index.html`, `script.js`, `service-worker.js`, `js/app.js`, `js/blocks.js`, `js/hero-2026.js` közös belépési pontok az engedélyezett verzió- és mobilfájlnév-cserék kivételével változatlanok; ellenőrzésük a kiadási teszt része.
- A mobilkönyvtárban kizárólag öt `v1-43-21` verziójú reboot modul szerepel, régi mobilmodul nem került vissza.
- A v1.43.21 saját ZIP-állományából történő külön kicsomagolási és automatikus ellenőrzési próba az átadás kötelező kapuja.
- A már jóváhagyott v1.43.20 ZIP külön elérhető és változatlan; ez a tényleges visszaállítási alap. Mivel nincs élesítés, nem történt szerveroldali visszaállítás.

## Külön végső jóváhagyás

**A – Jóváhagyom a v1.43.21 / M15/D előnézetet**, a négy dokumentáltan nyitott valós eszközös és mérési kapu tudomásulvételével. A következő szakasz csak előkészíthető, közzététel nincs.

**B – Valós telefonon tesztelem.** A fizikai próbákig a kiadás jóváhagyása függőben marad.

**C – Javítást kérek.** Az észrevételek alapján újabb ellenőrzési kör szükséges, közzététel nélkül.
