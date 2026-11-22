# Csanádi weboldal v1.43.19 – M13/D első mobilos szövegillesztési előnézet

**Dátum:** 2026. november 20.  
**Alap:** jóváhagyott v1.43.18 M12/D, teljes eredeti forrás és ZIP érintetlenül megőrizve.  
**Állapot:** fejlesztési ellenőrzési pont; **nem a teljes M13.1–M13.4 végleges kiadása**.  
**Hatókör:** kizárólag a 768 CSS-pixelig érvényes, korábban nulláról újraírt mobilos felület; a közös fájlokban csak verzióhivatkozások változtak.  
**Közzététel:** nincs FTP, GitHub vagy nyilvános élesítés.

## Mi készült el?

1. **M13.1 – szövegillesztés:** a telefonos iskola-címsor és mottó fix `max-height` / `overflow:hidden` levágása megszűnt a normál fejlécben. Az összecsukott, görgetés utáni fejléc szándékos rejtése megmaradt.
2. **M13.1 – hosszú tartalmak:** menücímek, kezdőlapi kártyák, aloldali címek, űrlapfeliratok, gombok, Bootstrap badge/accordion elemek, keresési eredmények és modalfejlécek mobilon több sorba törhetnek. A szövegre alkalmazott `nowrap` és ellipsis/line-clamp megjelenítés korlátozását célzottan felülírja az új CSS.
3. **M13.2 – fejléc együttműködés:** `ResizeObserver` elérhetősége esetén a késve betöltött linkek és a több sorba törő feliratok átméretezhetik a mobilfejlécet; a fix fejlécet figyelembe vevő görgetési eltolás újramérésre kerül.
4. **M13.3 – összetett tartalom:** a naptár, dokumentumnéző, galéria és adattáblák megőrzik a saját belső görgetésüket; a `pre` kódblokkokban a szóközök és programkód-sorok nem törnek helytelenül.
5. **M13.4 – regresszió:** az eredeti öt mobilmodul verziója v1.43.19; a régi mobilkód nincs visszaállítva, és az asztali logika a kiadási hash-ellenőrzésben változatlan.

## Ellenőrzési kapuk

| Kapu | Módszer | Eredmény |
|---|---|---|
| M13.1 szövegek | Új `tools/verify-m13-mobile-text.mjs` szabály- és oldalellenőrzés, 78 regisztrált aloldal | Megfelelt (forrásalapú) |
| M13.1 mérethatárok | 12 méretes statikus reszponzív mátrix, mobil 768 px-ig | Megfelelt (nem renderelt teszt) |
| M13.2 fejléc és menü | Fejléc, új `ResizeObserver`-es újramérés és háromszintű menü ál-DOM-tesztje | Megfelelt (szimulált DOM) |
| M13.3 képváltó és komponensek | Hero, dokumentum-/galéria-/naptár-szelektorok, 254 tartalmi blokk lefedettség | Megfelelt (forrás és szimuláció) |
| M13.4 minőség | Mobilos minőségi ál-DOM-próba, desktop elkülönítés | Megfelelt (forrás és szimuláció) |
| Valós böngészős megjelenés | Headless Chromium/Playwright indítása | **Nem sikerült – sandbox `socket() failed: Operation not permitted`** |
| Valódi iOS/Android eszköz, VoiceOver/TalkBack, Core Web Vitals | Nem volt elérhető | **Nyitott** |

### Kötelező futtatható próbák

```bash
node tools/verify-reboot-shell.mjs
node tools/verify-reboot-menu.mjs
node tools/verify-reboot-hero.mjs
node tools/verify-reboot-quality.mjs
node tools/verify-m11-mobile-matrix.mjs
node tools/verify-m12-content-coverage.mjs
node tools/verify-m13-mobile-text.mjs
node tools/verify-reboot-release.mjs
```

A teljes ZIP állománylistájának és SHA-256 lenyomatainak ellenőrzése, a kicsomagolás és az összes fenti teszt visszaállított példányból való megismétlése a csomagolási kapu része.

## Amit az előnézet még nem bizonyít

- A szövegek tényleges sor- és dobozmérete valós mobilos böngészőben továbbra sem igazolt.
- Az M13.1 teljes vizuális, világos/sötét, álló/fekvő készülékes kapuja még nyitott.
- Az M13.2 teljes interakciós és navigációs készülékes tesztje még nem készült el.
- Az M13.3 teljes dokumentum-, képnéző- és tartalmi készülékes ellenőrzése még nem készült el.
- Az M13.4 valódi képernyőolvasós, teljesítmény- és PWA-frissítési tesztje még nem készült el.

A v1.43.19 ezen pontja **nem végső kiadási jóváhagyásra** készül: a hátralévő M13 kapuk folytathatók. A v1.43.18 korábbi teljes ZIP a visszaállítási alap.
