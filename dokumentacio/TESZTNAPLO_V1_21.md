# Csanádi weboldal – v1.19.0 → v1.21.0 tesztnapló

**Dátum:** 2026. november 16.  
**Kiindulás:** teljes v1.18.0 projekt.  
**Cél:** csak a meglévő A–J funkciók javítása és a korábban jelzett hibák megszüntetése.  
**Kiadás:** végső, teljes v1.21.0 statikus FTP-kompatibilis csomag.

## v1.19.0 – alapjavítás, teljes feladatscope

1. A külön felúszó **„Lap tetejére” gomb** létrehozása, eseményfigyelése és CSS-e megszűnt a teljes honlapon. A kezdőoldali oldalsó szakaszpanelből is eltűnt az önálló felgörgető gomb. A mobilos szakaszmenü saját „Eleje” művelete megmaradt.
2. A megközelítési/térképes, beágyazott iframe elküldi a tényleges szakaszok azonosítóját, címét és pozícióját. Ezekhez a közös mobilos szakaszmenü a szülőoldalon görgethető célpontokat rendel.
3. Az ismétlődő szakaszcímeket sorszámozott megkülönböztetés jelöli.
4. A normál aloldal szakaszainak változása figyelhető újraméretezés és DOM-módosulás után is.
5. A főmenü és a mobilos szakaszlista egymás megnyitásakor bezárulnak; a fókusz és a csökkentett mozgás korábbi szabályai megmaradnak.
6. A témaválasztás korai inicializálása nem kényszerít világos módot, ha a helyi tárolás nem olvasható. A beágyazott oldal és a szülőoldal témájának összhangja javult.

**Teszt:** általános forrás- és adatellenőrzés 46/46; meglévő funkciók 22/22; mobil menüfa 8/8; mobil szakaszmenü 27/27; helyi HTTP-hozzáférés 1061/1061; médiakatalógus 628/628 SHA-adat, eltérés nélkül.

## v1.20.0 – stabilitás és összefüggések

1. A beágyazott szakaszlista azonosítói ellenőrzöttek, duplikátumok és rossz adatok kizárásra kerülnek, a célpontok a tényleges függőleges pozíciójuk szerint rendeződnek.
2. Az oldalon belüli mélyhivatkozás a rögzített fejlécet figyelembe véve görget. A böngésző Vissza gombja a korábban mentett szakaszpozíciót is vissza tudja állítani.
3. A kézikönyv és a segédprogramok témavezérlője is követi a másik ablakban megváltoztatott tárolt preferenciát. Az „Automatikus” üzemmód a böngésző által jelentett operációsrendszer-beállítást használja.
4. A mobil szakaszsáv kis magasságú képernyőkhöz is illeszkedik, a csökkentett mozgás megmarad.

**Teszt:** általános forrás- és adatellenőrzés 46/46; meglévő funkciók 22/22; mobil menüfa 8/8; mobil szakaszmenü 30/30; valós JavaScript-függvényen végzett témaváltási szimuláció 11/11; helyi HTTP-hozzáférés 1067/1067; médiakatalógus 628/628 SHA-adat, eltérés nélkül.

## v1.21.0 – végső integráció, cache és ismételt ellenőrzés

1. A szakaszsávnál szükséges extra alsó helyet korábban felülíró CSS-prioritást javítottuk. Így a mobilos alsó navigáció és a szakaszsáv egyidejű jelenléte nem takarja el a tartalom végét.
2. A szakaszsáv a főmenü megnyitásakor nem fed rá annak felületére.
3. A mobilos böngésző színét jelző `theme-color` metaadat már a korai témaválasztással együtt frissül.
4. Az érintett JavaScript- és CSS-állományok új verziójelzést kaptak, így a böngészők nem tarthatják meg az elavult, felúszó gombot készítő kódot a régi URL-gyorsítótárból.
5. A korábbi kézikönyvi leírás pontosítva lett: önálló „Lap tetejére” gomb egyik oldalon sincs; a szakaszmenü csak az indokolt, kellően hosszú oldalakon jelenik meg.
6. Az iframe tényleges útvonalkezelése önállóan is ellenőrzésre került: a belső szakaszlista továbbítása, a navigáció, a visszaállítás, a mélyhivatkozás és a más forrásból érkező üzenetek elutasítása.

### Ismételt tesztelés

Azonos, végső v1.21.0 forráson **három teljes tesztismétlés** futott le. Egy-egy ismétlésben:

| Ellenőrzés | 1. kör | 2. kör | 3. kör |
|---|---:|---:|---:|
| Általános forrás, JSON, szintaxis, hivatkozások | 46/46 | 46/46 | 46/46 |
| Meglévő funkciók regressziói | 22/22 | 22/22 | 22/22 |
| Mobil menüfa | 8/8 | 8/8 | 8/8 |
| Mobil szakaszmenü, duplikátumok, iframe-integráció | 30/30 | 30/30 | 30/30 |
| Világos, sötét, automatikus téma | 11/11 | 11/11 | 11/11 |
| Beágyazott térképes útvonal-kezelés | 13/13 | 13/13 | 13/13 |
| **Összesen** | **130/130** | **130/130** | **130/130** |

**Külön, végső HTTP-teszt:** 1074/1074 ellenőrzés – 65 útvonal, 628 médiafájl és további statikus állományok.  
**Médiaellenőrzés:** 628 fizikai eszköz és 628 jegyzéktétel, 87 QR-fájl; hiányzó, többlet vagy eltérő ellenőrzőösszeg: **0**.  
**Megőrzési összevetés:** a v1.18.0 és v1.21.0 között 723 média-/JSON-állomány byte-szintű összehasonlítása; a teljes médiakészlet és a tartalmi JSON-ok változatlanok, csak a `json/config.json` tervezett kiadásazonosítója módosult.  
**Régebbi kompatibilitási tesztek:** 9/9 mobil navigáció, 8/8 korábbi hálózati regresszió, 12/12 aloldali fejléc, 7/7 hitelesítési munkalista, 10/10 médiakezelő és 6/6 médiaexport. A korábbi v1.10–v1.12 kiadásokhoz rögzített *release* tesztek 6 verziójelzés-ellenőrzése értelemszerűen már nem felel meg a v1.21.0 kiadásazonosítójának; a v1.21.0 saját kiadási tesztje 46/46 sikeres.

### A vizsgálatok határai

- A HTTP-, fájlintegritási, célzott JavaScript- és DOM-szimulációs ellenőrzések **nem jelentenek valódi mobileszközön végzett pixeles, érintéses vagy képernyőolvasós tesztet**. Az előző böngészőindítási kísérlet környezeti korlátozás miatt nem volt végrehajtható; a mostani körben sikeres éles böngészőtesztet nem állítunk.
- A külső OpenStreetMap és más távoli szolgáltatások aktuális rendelkezésre állása nem része a helyi HTTP-teszteknek. A térkép csak felhasználói jóváhagyásra töltődik be.
- Az „Automatikus” téma az adott készülék/böngésző `prefers-color-scheme` beállítását tükrözi. Ha a készülék világos megjelenést jelent, az automatikus mód helyesen világos lesz; kézi sötét beállításnak ezután is meg kell maradnia.
- A korábbi 65×31 tartalmi hitelesítési mátrix **55 nyitott tétele** változatlan intézményi vizsgálatot igényel. A feladat csak a meglévő funkciók javítására szólt.
- A honlap nem került feltöltésre sem a GitHub Pages, sem az iskola FTP-tárhelyére. A ZIP gyökeréből statikus tárhelyre másolható, a Bootstrap a rögzített CDN-ről töltődik be.

**Kimenet:** teljes `csanadi website v1.21.0.zip` kiadási csomag, a benne lévő `release-manifest.json` fájlhash-jegyzékkel és ezzel a tesztnaplóval.
