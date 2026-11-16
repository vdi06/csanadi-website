# Csanádi weboldal – médiatár-bővítés előkészítése

**Állapot:** terv, nem jóváhagyott fájlok kiadásának terve. A v1.8.0 csomag **nem** tartalmaz tömeges médiabővítést.

## Tényleges kiinduló állomány (2026. november 16.)

| Fizikai fájlcsoport | Jelenlegi darabszám | Értelmezés |
|---|---:|---|
| Képek | 500 | Ebből 353 reszponzív méretváltozat, nem mind önálló fotó |
| Videók | 12 | Helyi videófájlok; a jogállás külön ellenőrizendő |
| Dokumentumok | 19 | PDF és egyéb dokumentumok |
| Grafikák | 97 | Ebből 87 QR-kód; csak 10 egyéb grafika |
| **Összesen** | **628** | Katalógus és fizikai fájlállomány egyezése: 628/628 |

## Mit jelenthet a „kb. hatszoros bővítés”?

A hatszoros célt **nem** szabad automatikusan a fizikai fájlokra szorozni: egyetlen fotó több méretre optimalizálva 3–5 fájlt is jelenthet, a 87 QR-kód pedig nem új galériatartalom. Először egyedi, valóban közzétehető **tartalmi tételeket** kell számolni. A jóváhagyott darabszám ezután állítható be; a 6× cél csak irányszám.

## Javasolt munkasorrend

1. **Minőségkapu.** A 29 `pending` és 4 `preview-only` állapotú médiát, a 35 publikáltnak jelölt, de közvetlen médiatár-jogállás nélkül szereplő eszközt, valamint a 233 alt-hiányos kép/grafika esetét tételesen felülvizsgálni. A 87 QR-kód nagy részénél előbb azt vizsgáljuk, szükséges-e egyáltalán önálló alternatív szöveg.
2. **Tartalmi leltár.** Egyedi fotókat és variánsokat csoportosítani; már meglévő képek, videók, iratok és QR-kódok ismételt importját elkerülni.
3. **Jogosultság és adatok.** Minden új anyaghoz eredet, jogosult, licenc, hozzájárulási helyzet, téma, képaláírás és akadálymentes leírás rögzítendő. Személyes adatot tartalmazó tanulói képekhez külön intézményi eljárás kell.
4. **Médiaszerkezet.** Külön sportági, oktatási, közösségi és intézményi témacsoportokat kijelölni. Az elérési utak a meglévő `assets/media/`, `assets/graphics/`, `assets/documents/` kategóriákban maradjanak, és legyenek nyilvántartva a központi JSON-okban.
5. **Kis lépésekben importálás.** Kategóriánként korlátozott első sorozat készül, optimalizálva asztali/mobil felbontásokra. Minden sorozat után szerkezeti, méret-, képleírás-, forrás- és hivatkozásellenőrzés.
6. **Kiadás csak jóváhagyás után.** Ezt követheti a nagyobb darabszámú bővítés, de a tárhely-kapacitást, a videófájlok méretét és a betöltési időt előzetesen mérni kell.

## Szigorú határok

- A megvalósítás statikus FTP-tárhelyen is működjön, kizárólag verzióhoz kötött Bootstrap CDN-nel; GitHub Actions-függő folyamat nélkül.
- Eredeti iskolai logó és már működő tartalmak maradnak; meglévő fájlt nem törlünk pusztán duplikáció gyanúja miatt.
- Az új honlap semelyik linkje vagy QR-kódja nem irányíthat a régi `csanadi-bp.edu.hu` webhelyre.
- A bővítést csak a médiakezelő éles v1.8.0 böngészős próba, a jogosultsági hiányok rendezése és a kiadási kapu jóváhagyása után szabad indítani.

## v1.8.0 – konkrét előfeltételek a továbblépéshez

1. A médiakezelőből letölthető `csanadi_media_felulvizsgalati_munkalap.csv` intézményi ellenőrző mezőit tényleges személy, dokumentált jogalap és dátum alapján kell kitölteni. A munkalap önmagában **nem** teszi nyilvánossá az elemeket.
2. Az új publikáció előtt a szerkesztő űrlapja külön kéri a jogosult, licenc/engedély, bizonyítékazonosító és ellenőrző személy adatait; hiányosan a kiadási előkészítés is megáll. A nyilvántartásba kerülő `institutionallyApproved:false` jelzi, hogy a szerkesztői ellenőrzés önmagában nem hivatalos intézményi jóváhagyás.
3. A 87 QR-elem nem számít új fotótartalomnak. FTP-domainváltás esetén a cél URL-ek és a QR SVG-fájlok külön regenerálandók.
4. A 353 reszponzív képváltozatot forrásfotó-családokhoz kell kapcsolni. Hatékonyan az **egyedi, ténylegesen engedélyezett médiatételek** számát érdemes növelni, nem azonos képek véletlenszerű sokszorozását.
5. A bővítési csomag csak akkor indítható, ha a `tools/` admin és teljes `assets/` CRUD funkciók **valódi böngészős tesztje lezárult**, a 31 szabály releváns hibáiról állásfoglalás készült, és a jogosultsági kapu nem jelez tisztázatlan, nyilvánosságra szánt új fájlt.

**A v1.8.0-ban új, hatszoros állománybővítés továbbra sem történt.**
