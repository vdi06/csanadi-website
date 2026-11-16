# v1.33.0 – külön valódi Chromium-próba

- Dátum: 2026. november 16. (Europe/Budapest).
- Kísérlet: `python3 -m http.server 8795 --bind 127.0.0.1` után `node tools/test-browser-v1-33.js`, Playwright/Chromium, asztali és mobil méretet célzó 16 forgatókönyvvel.
- Eredmény: **NEM FUTTATHATÓ – KÖRNYEZETI BLOKKOLÁS**, nem a weboldal ellenőrzött sikere vagy hibája.
- Ok: a Chromium már indulás előtt leállt: `FATAL ... process_singleton_posix.cc:297: Check failed: . socket() failed: Operation not permitted (1)`; a kernel nem engedélyezte a szükséges socketműveletet. A böngészőtesztek nem indultak el, ezért 0/16 teljesített próba jelenthető.
- A helyi HTTP-alapú 1197 erőforrás-ellenőrzés, a 32 célzott és az összes 18 regressziós tesztprogram ettől függetlenül lefutott; ezeket a teljes tesztnapló rögzíti.
- Javasolt külső utóellenőrzés: iOS Safari és Android Chrome fizikai eszközön témaváltás, képernyőforgatás, térképes iframe, mobil szakaszmenü, PDF-előnézet, 3G hálózati lassítás; Chromium ismétlése engedélyezett böngészőkörnyezetben.
