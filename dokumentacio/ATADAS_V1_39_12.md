# Csanádi Sportiskola – v1.39.12 kiadási és ellenőrzési napló

Kiadás napja: 2026. november 17. A csomag a v1.39.11 teljes állománykészletére épül. Kizárólag statikus HTML/CSS/JavaScript/JSON, változatlanul verzióhoz kötött Bootstrap CDN, az iskola későbbi statikus FTP-tárhelyével kompatibilis kialakítás.

## Kért változtatások

- A: valódi böngészős tesztek folytatása, majd a telepített nyilvános URL ellenőrzése, amikor rendelkezésre áll.
- B: a nagy váltakozó képsor kigörgetése után ne keletkezzen külön második fejlécsor; csak az eredeti felső menüsor közepén maradjon az aktuális képet megnyitó egyetlen gomb. A felhasználó által jelzett villódzás és ugrás megszüntetése.
- C: billentyűzetes, szemantikai és reszponzív hozzáférhetőség ellenőrzése.
- D: 23 nyitott tartalmi prioritás és 69 függő médiajog helyi, bizonyítékhoz kötött munkafolyamatának finomítása.

## Megvalósult

1. A képváltó a normál dokumentumfolyamban marad, miközben az eredeti felső menüsor tapad a képernyő tetejéhez. A lap nem veszít több száz képpontot a képváltó programozott összecsukásakor.
2. A kis előnézet a meglévő `.brand-row` közepébe abszolút pozicionált, egyetlen `a.cs39-mini-preview` elem. Nincs második sáv, nincs kompakt lapozónyíl, „Főmenü” vagy „Vissza” duplikátum. Az eredeti menü gombjai megmaradnak.
3. A kiemelt rész átmenetéhez két eltérő, a képváltó látható alsó széléhez kötött küszöb tartozik (84/114 px), így gyors oda-vissza görgetéskor nem indul újra a váltás. A szemantikailag rejtett állapotban nem marad fókuszálható gomb, a fókusz átadása oda-vissza működik.
4. Keskeny képernyőn a középső elem kép-only változatú, a 320 px-es elrendezésben a KRÉTA és egyéb gombok átfedése megszűnt. A felhasználó korábbi kérése szerinti szögletes képélek és hézagmentes nagy lapozósáv megmaradtak.
5. A helyi hitelesítő munkalapon a hiányzó ellenőrző, bizonyíték, felhasználási engedély és intézményi döntés mezői külön jelzést kapnak. A 23 tartalmi és 69 médiajogi tétel együtt CSV-be exportálható, külön hiányos szűrővel. A felület nem ír az FTP-re, és nem ad automatikus intézményi jóváhagyást.
6. Az új v1.39.12 regressziós tesztek és korábbi kompatibilitási tesztek a fenti változást fedik le. A korábban rögzített 71 JSON-oldal, 748 assets-nyilvántartási állomány és a kapcsolódó hivatkozások megmaradtak.

## Igazolt ellenőrzések

- Valódi helyi Chromium böngészőben: asztali 1348 px tartalomszélesség, 320, 390 és 768 px mobil ellenőrző nézetek; váltásra az eredeti fejléc 59–70 px magas egyetlen sor marad, a középső link a márkasor középvonalán helyezkedik el; 320 px nézetben nem fed át KRÉTA-gombot. A képváltó a dokumentumban megtartja magasságát, természetesen kigördül. Lapozás és visszagörgetés után az állapot rendezett.
- A görgetés után a kompakt előnézetnek pontosan egy gyereke, nulla gombja és egy aktív linkszerepe van. Megnyitása a megfelelő sportos aloldalra navigált.
- Új v1.39.12 ellenőrzések: 12/12 UI-hozzáférhetőségi és 8/8 hitelesítő munkafolyamat-próba.
- Statikus helyi HTTP-fájlok és hivatkozások: 1427/1427 sikeres ellenőrzés; 71 oldal, 748 assets-fájl.
- Korábbi regressziók: 14/14 v1.39.11, 18/18 v1.39.9, 14/14 v1.39.8, 10/10 modal a11y, 17/17 HTML-szemantika, 14/14 oldalsablon, 8/8 reszponzív a11y, 16/16 tartalmi, 11/11 médiakezelő, 6/6 export, 7/7 munkalap, 74/74 keresőindex és 5/5 natív ZIP-motor ellenőrzés sikeres.

## Nyitott / külső feltételek

- Mivel a v1.39.12 még nincs nyilvánosan telepítve, külön nyilvános GitHub Pages/FTP URL-es hálózati vizsgálat nem történt. Ehhez a felhasználó később megadhatja a ténylegesen feltöltött, tesztelésre engedélyezett URL-t.
- A gépi és Chromium-alapú hozzáférhetőségi vizsgálatok nem helyettesítik a valós NVDA, JAWS, VoiceOver és fizikai telefonon végzett felhasználói próbákat.
- A 23 prioritás és 69 médiajogi tétel intézményi jóváhagyása, valamint az igazoló okiratok nem kerültek megszerzésre. A helyi listákba írt megjegyzések önmagukban nem jelentik ezek jóváhagyását.
- A böngészőautomatizálást saját Chromium-indítással végző régi helyi teszt a futtatási környezet böngészőindítási korlátja miatt nem indult; ehelyett a már futó valódi Chromium-felületen ellenőriztük az elrendezést és görgetést.
- A csomagot nem tettük közzé és a meglévő nyilvános honlapot nem módosítottuk. A keresőrobotok számára `noindex,nofollow` maradt.

## Átadási ellenőrzés

A `release-manifest.json` minden mellékelt kiadási fájl méretét és SHA-256 lenyomatát rögzíti. A teljes ZIP-t a `csanadi-website` GitHub-repository megfelelő gyökerébe történő későbbi feltöltéshez lehet kicsomagolni; a működéshez a Bootstrap verziózott CDN-elérhetősége szükséges.
