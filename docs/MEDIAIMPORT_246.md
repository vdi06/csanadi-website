# Csanádi 2.46 – tömeges médiabeolvasás

A `tools/import-media-batch.py` helyi, offline szerkesztői eszköz, nem webes feltöltés. Nincs jogosulatlan publikus szerverírás, CDN-függőség vagy adatbázis.

1. Másold a képeket egy mappába (JPG, PNG, WebP), képenként 700×360 px minimum és 30 MB maximum. Nyitható, egyképkockás képek szükségesek. A beküldött fájlnevek csak egyszerű, mappanév nélküli nevek lehetnek.
2. Készíts `images` tömböt tartalmazó JSON-fájlt a `tools/media-import-minta.json` alapján. Minden kép kapjon egyedi URL-biztos `id`-t, címet, tényszerű `alt` szöveget és leírást, kategóriát, három album-besorolást és érvényes oldalhivatkozást.
3. `python tools/import-media-batch.py --source /helyi/kepek --manifest /helyi/kepek/kepek.json --output /helyi/staging --check`
4. Ha az ellenőrzés rendben van, ugyanez `--check` nélkül. Ez eredeti WebP-t és 400/800/1280 px képeket készít, eltávolítja az EXIF-adatokat, és előkészíti a frissített `shared/data/site.json`-t.
5. **Az új képek alapértelmezésben piszkozatok**, így a nyilvános galériában nem jelennek meg. Hiteles és publikálható fotóhoz külön `provenance: "verified"`, `publication: "published"`, megfelelő `sourceNote` és `rightsConfirmed: true` kell. Különösen kiskorúakat ábrázoló fotóknál intézményi hozzájárulás, adatvédelmi és felhasználási jogi ellenőrzés szükséges.
6. Az ellenőrzött staging-fájlokat kézzel másold át az oldal fejlesztői munkakópiájába, futtasd az adat-/képteszteket, majd generáld újra a megosztási oldalakat: `python tools/generate-seo.py`.
7. Az átvételt és újratesztelést követően készíts teljes ZIP-et. A staging nem publikál automatikusan sem GitHub Pagesre, sem FTP-re.

Az import szándékosan leáll hibás név, nem engedélyezett fájltípus, sérült vagy túl nagy kép, ismeretlen kategória, hibás hivatkozás, hibás album és duplikált képtartalom esetén. A meglévő képeket nem írja át. A valós eseményfotót tilos illusztrációként, illetve a bemutatóanyagot valós fotóként feltüntetni.
