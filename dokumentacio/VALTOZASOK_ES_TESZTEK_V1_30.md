# Csanádi v1.30.0 – harmadik teljes A–J javítási kör

**Alap:** a teljes, már tesztelt v1.29.0 csomag. Ez a v1.27.0-ra épülő harmadik, önmagában teljes kiadás. A 65 JSON-oldal, valamennyi asset, a tools/ eszköztár, az útmutatók és a korábbi tesztnaplók megmaradtak.

1. **A – Mobilos szakaszmenü:** a billentyűzetet mutató viewport-ellenőrzés a szerkeszthető HTML-elemekre és a térképes iframe fókuszára is kiterjed.
2. **B – Szakaszugrás:** a görgetési célt a tényleges dokumentum-magassághoz igazítjuk; nem lehet a lap vége utánra túlgörgetni.
3. **C – Kinyitható szakaszok:** az eltárolt olvasási helyet csak akkor állítja vissza az oldal, ha a felhasználó időközben nem görgetett máshová.
4. **D – Térképes aloldal:** a beágyazott ablakból érkező méret- és szakaszüzeneteket kizárólag az aktuális, csatlakoztatott iframe-nél fogadjuk el; az aszinkron görgetési visszaállítás is útvonalat ellenőriz.
5. **E – Mobilos sötét téma:** ha a böngésző blokkolja az iframe localStorage-hozzáférését, a beágyazott, azonos eredetű aloldal a szülőoldal már kiválasztott témáját veszi át. A beágyazott oldal `theme-color` metaadata együtt változik a tényleges témával.
6. **F – Aloldali szakaszazonosítók:** azonos című részeknél már a szakasz első három bekezdését/listaelemét felhasználjuk az elkülönítéshez, így az azonos bevezetők sem okoznak fölösleges ütközést. Egyedi cím esetén az azonosító továbbra is változatlan marad szövegszerkesztéskor.
7. **G – Élő JSON-frissítés:** a görgetési helyhez tartozó címsor és szövegkörnyezet egyeztetése ékezet- és kisbetűfüggetlen lett.
8. **H – Akadálymentesség:** a mobil szakaszlista párbeszédablak `aria-labelledby` attribútuma tényleges szakaszlista-címre mutat.
9. **I – Galéria:** az előtöltési korlát miatt eldobott kép forrása és hibakezelője is felszabadul, így nem marad fölöslegesen futó háttérkérés.
10. **J – Diagnosztika:** párhuzamosan induló fájlmanifest-ellenőrzéseknél csak a legújabb kérés frissítheti a diagnosztikai kijelzőt; korábbi hiba vagy válasz nem írhatja felül.

## Vizsgálati alapelvek

- A 10 meglévő funkciócsoport mindhárom, egymásra épülő kiadásban javítást és célzott ellenőrzést kapott.
- A v1.30.0 célzott ellenőrzése **59 szakaszmenü-/diagnosztikai tesztből**, **48 régebbi mobilregresszióból**, **12 tématesztből**, valamint a párhuzamos diagnosztikai kérések **2 tényleges aszinkron forgatókönyvéből** áll.
- A teljes regressziós futás minden korábbi eszköztesztet, adatellenőrzést és a statikus HTTP-kiszolgálásban letöltött állományokat is ellenőrzi; részletes, valódi kimenete a `TESZTNAPLO_V1_30.md` fájlba kerül.
- A helyi, szigorú konténerengedély miatt teljes grafikus mobilböngészős interakció nem feltétlenül futtatható: ez nem minősül automatikusan sikeresnek. A statikus tesztelt állomány a telepítés előtt nem azonos az élő webhellyel.

**Kiadási feltétel:** kizárólag a teljes regresszió sikeres lezárása és a kiadási manifest újragenerálása után csomagolható ZIP.

## A böngészőben feltárt, örökölt dokumentumtári hiba

A tényleges helyi előnézet fejlesztői konzolja `Dokumentumtár: hibás verziótörténet` hibát jelzett. A gyökérok két régebbi kézikönyv-verzió leírása volt: a dokumentumtár jogosan legfeljebb 500 karaktert enged, a két rekord 517 és 502 karakteres volt. A két leírást rövidítettük, a fontos tartalom és a verziók megtartásával, a validációs határt változatlanul hagyva. Külön teljes adatkészletet vizsgáló regresszió került a tesztkörbe (`test-document-history-v1-30.js`).
