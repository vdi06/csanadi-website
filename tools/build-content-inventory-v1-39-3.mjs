import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const audit=read('json/adatok/tartalmi-audit-v1-39-3.json');
const statuses={
  'primary-source-checked':'Intézményi forrás vizsgálva',
  'editorial-guidance':'Szerkesztői útmutatás',
  'time-sensitive':'Időérzékeny – újraellenőrzendő',
  'institutional-approval-needed':'Intézményi jóváhagyás szükséges'
};
const escape=s=>String(s??'').replaceAll('|','\\|').replaceAll('\n',' ');
const lines=[
  '# Csanádi v1.39.3 – teljes tartalmi oldalleltár',
  '',
  'Ellenőrzés: **2026. november 17.** · Hatókör: **71/71 közzétett oldal**.',
  '',
  'A „forrás vizsgálva” státusz **nem azonos** az intézmény tartalmi jóváhagyásával. A JSON-ban a részletes státusz, az eredeti útvonal, a szerkesztési változás és a hivatkozott elsődleges forrás azonosítója is megtalálható.',
  '',
  '| # | Oldal és SPA-útvonal | Javítás | Tartalmi státusz | Ellenőrzött forrás |',
  '|---:|---|---|---|---|'
];
for(const [i,p] of audit.pages.entries()){
  lines.push(`| ${i+1} | ${escape(p.title)}<br>\`${p.route}\` | ${p.contentChanged?'Tartalom módosult':'Átvizsgálva; változatlan'} | ${statuses[p.reviewStatus]} | ${escape(audit.sources[p.sourceId]?.title||'Nincs közvetlen intézményi oldal')} |`);
}
lines.push('',
  '## Mely adatok igényelnek további munkát?',
  '',
  '- **Időérzékeny oldalak:** dátumok, nyílt napok, aktuális felvételi tájékoztatás, hírek és álláshirdetések a későbbiekben ismét ellenőrizendők.',
  '- **Intézményi jóváhagyás szükséges:** a jelenlegi tanulók, sportolók, edzők, csapatok, tantestület és partnerek személyes vagy naprakész nyilvántartásait nem állítottuk össze feltételezésekből.',
  '- **Történeti évszám:** a hivatalos történeti forrás 1887/1897-es eltérését az iskola feloldása nélkül nem tekintjük eldöntöttnek.',
  '- **Illusztrációk:** a tematikus bemutatóképek nem bizonyítékai tényleges iskolai eseményeknek; a képfeliratban ezt külön jelezzük.',
  '',
  '## Géppel feldolgozható megfelelés',
  '',
  '- `json/adatok/tartalmi-audit-v1-39-3.json`: egyedi azonosítók, státuszok és hivatalos forrásjegyzék.',
  '- `json/oldalindex.json`: 71 útvonal keresőadata és státusza.',
  '- `tools/test-content-v1-39-3.mjs`: automatikus tartalmi követelményvizsgálat.',
  '');
const file=path.join(root,'dokumentacio/TARTALMI_OLDALLELTAR_v1_39_3.md');
fs.writeFileSync(file,lines.join('\n'));
console.log(`Elkészült ${audit.pages.length} sor: ${file}`);
