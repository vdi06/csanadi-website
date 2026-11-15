# Csanádi Sportiskola 2026 – kezdőoldali jóváhagyások és a 29. kiadás állapota

2026. november 15. · A státuszok a forráskód ellenőrzésén alapulnak, nem valós készülékes teszten.

Jelölés: **Megvan** = kód vagy tartalom egyértelműen létezik. **Részleges** = csak az igény egy része készült el. **Nyitott** = nem igazolható vagy hiányzik.

| # | Jóváhagyott követelmény | Jelenlegi állapot | Következő teendő |
|---|---|---|---|
| 1 | Kapu animáció, a nyitott kapu mobilon is látható; fokozatos közeledés | **Megvan, vizuálisan nem tesztelt** | Valós mobilos ellenőrzés. A belépés kulcsikon, az újrajátszás külön kapuikon. |
| 2 | C jelű elegáns fejléc, mobilon KRÉTA; a felső dupla kereső/menü ne jelenjen meg | **Részleges** | A korábbi fejléc és R28 mobilos elrejtés megmaradt; konkrét C-variáns képi összevetése és töréspontpróba szükséges. |
| 3 | Kétképes hero, középen főmenüikon, a képek külső szélén teljes magasságú áttetsző lapozók | **Megvan, vizuálisan nem tesztelt** | R29 peremsávok; valódi fényképváltási és témateszt szükséges. |
| 4 | Dinamikus, látványos képváltó-animációk a meglévő képelrendezés megtartásával | **Részleges** | A kétképes és mobilos váltás működési kódja megmaradt, a jóváhagyott animáció végleges vizuális tesztje és finomítása hiányzik. |
| 5 | Asztali főmenü és mobil körmenü/csempék/hamburgeres váltás megőrzése | **Megvan a korábbi kódban** | Regressziós vizuális és billentyűzetes próba. |
| 6 | Harmadik szint B csempés panel; click/adaptive/replace/step/slide | **Nyitott** | Új paneles harmadik szint szükséges, a főmenü megváltoztatása nélkül. |
| 7 | Legfeljebb három menüszint; minden lenyíló csoport legalább két gyerekkel | **Nyitott** | A structure.json ellenőrzése és az egygyermekes csoportok biztonságos összevonása. |
| 8 | Kezdőlap beállítása – kedvenc kártyák és sorrend, helyi tárolás | **Megvan** | Különböző sorrendek és rejtett kártyák esetének tesztje. |
| 9 | Sportos főcsempe B, dynamic, mobil swipe, expand | **Részleges** | A négy sportkártya megvan; a swipe és helyben expand külön megvalósítandó. |
| 10 | Gyorselérések B, grid/inline, ikon és felirat | **Megvan** | Továbbiak gomb és kéthasábos mobil grid; pontos ikonok/sorrend ellenőrizendők. |
| 11 | Napi központ B: kezdetben zárt, click, page, dynamic | **Részleges** | A zárt csoport és animáció megvan; minden témacsempe külön oldalra vezetését még ellenőrizni kell. |
| 12 | Iskolai hírek B: pontosan 3, mobil stack, page, dynamic, rövid bevezető | **Részleges** | Jelenleg a központi beállítás szerinti hírmennyiség és rács van; a 1 nagy + 2 kicsi kompozíció és külön hír-adatlapok még nincsenek maradéktalanul megvalósítva. |
| 13 | Sporthírek B: 4, mobil stack, page, dynamic, sportági szűrés | **Részleges** | A jelenlegi sporthírlista külső sporthírhivatkozásokat is használ és nem az összes kért helyi oldalt; szűrés és 1+3 elrendezés hiányzik. |
| 14 | Sporteredmények B: zárt, grid, page, diagram onDemand, dynamic | **Részleges** | Zárt csoport és diagram-kibontás létezik; az egyes eredménycsempék külön oldalainak és mobil-gridjének ellenőrzése szükséges. |
| 15 | Galéria B: zárt, grid, page, dynamic, feliratok | **Részleges** | Zárt csoport és korábbi médiaelemek; minden csempe külön oldala és mobilrácsa még nincs igazolva. |
| 16 | Fedezd fel az iskolát B: zárt, grid, hub, dynamic, rövid leírás | **Részleges** | Zárt csoport és több meglévő blokk; külön gyűjtőoldalakhoz vezető következetes csemperendszer hiányzik. |
| 17 | Megközelítés B: térkép + 3 kártya egyező magasságban; mobil stack; térkép click; mindegyik mód | **Részleges** | Az előnézet, három kártya és click-to-open megvan; az egymás utáni látványos belépőanimáció és valós méretpróba hiányzik. |
| 18 | Megközelítési oldal a közös SPA-keretben, fejléc/menü megtartása | **Részleges** | A beágyazott változat kódja elkészült; valódi böngészős ellenőrzés szükséges. |
| 19 | Lábléc B minden korábbi hivatkozással, mobilos csoportok, soft animáció | **Részleges** | A linkek megmaradtak; a mobilos csoportnyitás még nem készült el. |
| 20 | Honlapdiagnosztika modális, zárva, szerelőikon, lábléc felett | **Megvan, viselkedése vizuálisan nem tesztelt** | Fókuszcsapda, Escape, tartalom megnyitásának browser-tesztje. |
| 21 | Csak a kezdőoldalon jobboldali drawer-szakasznavigátor, kattintásra bezár, külön top ikon nélkül | **Megvan** | Személyre szabott sorrend és szakaszkiemelés böngészős tesztje. |
| 22 | Világos/sötét/automatikus téma minden gombon és elemen | **Részleges, javítva** | A kezdőoldali és R26 térképes gombok konkrét sötét-szín hibája javítva. Más aloldalak és segédeszközök témáját tételesen ellenőrizni kell. |
| 23 | Csak szükséges JSON betöltése, oldalankénti részletes tartalom | **Részleges** | Az `oldalindex.json` metadata-útvonal megvan és az aloldalakat kattintáskor tölti a kliens; egyes kezdőoldali adatgyűjtők és összetett blokkok azonban még kezdetben betöltődhetnek. |

## Azonnali témakorrekció

- A kezdőoldal térképének „Interaktív térkép megnyitása” gombja világos módban már világos felületet, sötét szöveget és ellenőrizhető fókuszkeretet kap; sötét módban sötét, világos betűs változatot.
- A kezdőoldali megközelítési kártyák és a jobb oldali navigátor gombjai témát követnek.
- A külön megközelítési oldal R26 akciógombjai, űrlapgombjai és linkgombjai ugyanazt a témarendszert használják; önálló és SPA-ba ágyazott nézetben is.
- Nem módosítottuk az iskola sötétkék arculati fejlécét és a fényképes hero látványát. Ezek márkaelemek, nem véletlenül sötét módra ragadt vezérlők.

## Kiadási korlát

A CSS/JS/JSON-szintaktikai és ZIP-integritási vizsgálatok nem bizonyítják a valós kijelzőn látott témát, a kontrasztarányokat, a képernyőolvasós működést vagy a hiányzó interakciókat. Az ellenőrzéshez szükséges böngészőindítás az itteni környezetben korábban jogosultsági hibával megszakadt. Az éles weboldalt nem módosítottuk, az iskolai FTP-re nem töltöttünk fel semmit.
