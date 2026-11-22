# Csanádi weboldal v1.43.30 – asztali és mobilos felületi ellenőrzés

**Állapot:** fejlesztési előnézet; külön végső jóváhagyás szükséges.  
**Dátum:** 2026. november 20.  
**Alap:** v1.43.29; az eredeti csomag és mappa érintetlenül maradt.  
**Közzététel:** nem történt, FTP/GitHub nincs.

## 1. Igazolt hibák és javítások

| Felület | Talált hiba | v1.43.30 javítás | Ellenőrzés |
| --- | --- | --- | --- |
| Képgaléria, mobil és asztal | A kép megnyitása helyi/offline Chromiumban nem reagált, mert a Bootstrap JavaScript CDN-ről nem töltődött be. | Saját modális és képlapozó tartalék működés, bezárás, billentyűzetes Esc és fókuszkezelés. | Képre kattintás, előző/következő kép, bezárás: működik. |
| Helyi PDF-dokumentumok | A dokumentumtár néhány gombja a böngésző alapértelmezett PDF-nézőjébe navigált. | A dokumentumtár, a tanulási segédletek és a helytörténeti dokumentumok helyi PDF-linkjei a meglévő saját `openDocumentViewer` felületet használják. | Kétoldalas minta: oldalak megnyíltak és lapozhatók. |
| Csengetési rend | Egy Markdown-szerű, `|` karakterekkel írt táblázat nyers szövegként jelent meg. | A tartalomfeldolgozó helyi HTML-táblázattá alakítja a szabványos Markdown-táblázatot. | Valódi Chromiumban olvasható kezdési és befejezési időpontok. |
| Mobilos fejléc | Görgetés közben a háttértartalom áttűnt az ikonok alatt. | A gördített fejléc sötét és világos változatának háttere közel teljesen fedő. | Görgetett mobilos megjelenés ellenőrizve. |
| Mobilos kezdőlap | A régi, külön szerkesztőgomb még megjelent. | A korábbi „Elrendezés szerkesztése” vezérlő mobilon rejtett; közvetlen szerkesztési funkciót nem töröltünk. | Mobilos célzott CSS-ellenőrzés. |
| Dokumentumtár mobilon | A kétoszlopos dokumentumkártyák zsúfoltak voltak. | Mobilon egyoszlopos kártyasor és középre rendezett akciók. | Képernyőképes Chromium-ellenőrzés. |
| Tantestület mobilon | A keresőmező a függőleges flex-elrendezésben több száz pixel magas lett. | A kereső rögzített, 48 CSS-pixeles magasságot és automatikus flex-alapot kapott. | 250%-os Chromium-zoom mellett újratöltve, normál magasság ellenőrizve. |
| Galéria asztalon | A képkártyák méretei eltértek, különösen az utolsó sorban. | Három egyenletes asztali oszlop, azonos képarányú csempék. | Asztali screenshot: szabályos háromoszlopos rács. |

## 2. Belső automatikus ellenőrzések

- A teljes oldallista **78 oldalát** és **220 belső útvonalhivatkozását** gépi forrásellenőrzés vizsgálta. Ez nem jelenti azt, hogy mind a 78 oldalt egyenként manuálisan, pixelpontosan átnéztük.
- **106 JavaScript szintaxis**, **156 helyi import**, **74 CSS-erőforrás**, **597 média/PDF-fejléc**, **254 tartalmi blokk**.
- A mobilos és asztali DOM-, menü-, képnéző- és 768/769 pixeles elhatároló regressziós kapuk külön sikeresek.
- A teljes fájlhalmaz mérete és SHA-256 összege a csomag `release-manifest.json` fájljában szerepel. Az önálló v1.43.30-as ellenőrzőnek visszaállított ZIP-ből is futnia kell.
- A régi v1.43.29-es biztonsági ellenőrző szándékosan ahhoz a verzióazonosítóhoz és korábbi bájtlenyomatokhoz kötött, így az új kiadáson **nem használható változatlanul**. E helyett új, teljes SHA-256-os v1.43.30-as kiadásellenőrző készült. A megőrzött eredeti v1.43.29-en a teljes leltár és a M17.4 biztonsági ellenőrzése is **PASS** (1340 fájl).

## 3. Chromiumban elvégzett funkciópróbák

Asztali megjelenés: navigáció, fejléc, körmenü megnyitás és bezárás, galériacsempék, galéria-képnéző, képváltás, helyi PDF-néző, kétoldalas PDF lapozása, sportgaléria háromoszlopos rácsa. Mobilos megjelenés: címeres egysoros fejléc, kereső, témaválasztó, első és második menüszint, gördített fejléc, eseménynaptár hónap/lista váltása, dokumentumtár egyoszlopos nézete, PDF-néző, csengetési táblázat, tantestületi szűrés és keresőmagasság. Világos és sötét témához külön mobilos fejlécszabály marad.

## 4. Nyitott ellenőrzések és korlátok

1. **Valódi iPhone/Safari és Android/Chrome készüléken nem volt elérhető interaktív vizsgálat.** A mobilos próbák asztali Chromium böngészőn, nagyított vizuális töréspontokon történtek. A zoom nem emulál teljes körűen érintést, valódi fizikai kijelzőt és mobil böngészőmotort.
2. A közös Bootstrap JavaScript és CSS továbbra is részben CDN-alapú. A galéria és a saját PDF-néző a hiányzó Bootstrap JS ellenére működik, de a **teljes webhely valamennyi más Bootstrap-függő interakciójának internet nélküli működése nincs igazolva**.
3. A menü adataiban található harmadik szint egyes elemei publikálásra nem engedélyezettek (`menuVisible:false`). Az ellenőrzés nem változtatta meg ezek közzétételi állapotát.
4. A 78 aloldal gépi ellenőrzése megtörtént, de **nem történt mind a 78 oldal teljes kézi, két témás, minden töréspontos vizuális ellenőrzése**.
5. A „Fontos tájékoztatók” blokk minden meglátogatott aloldalon a tartalom fölött, mobilon több képernyőnyi helyet foglalhat. Ez meglévő tartalmi döntés; nem módosítottuk külön jóváhagyás nélkül.

## 5. Visszaállítás és jóváhagyás

- A kiadás teljes, FTP-kompatibilis fájlstruktúrával készül. A helyi v1.43.29 mappa megmarad visszaállítási pontként.
- A v1.43.30 **nem került közzétételre**. Külön végső jóváhagyás szükséges a következő fejlesztési vagy publikálási lépés előtt.
- Ajánlott jóváhagyás előtt a ZIP-et egy valódi iPhone-on és egy Android-telefonon, valamint egy széles asztali kijelzőn is kipróbálni.
