const STORE=new URL('../json/adatok/dokumentumok.json',import.meta.url);
const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const fold=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function renderDocumentCollections(){
 const box=node('section','doc26-collections');box.setAttribute('aria-label','PDF-segédletgyűjtemény');
 const title=node('h2','','PDF-segédletek témakörök szerint');
 const text=node('p','','Az itt szereplő anyagok általános segédletek, nem intézményi szabályzatok.');
 const toolbar=node('div','doc26-toolbar');
 const search=node('input','doc26-search');search.type='search';search.placeholder='Cím, témakör, kulcsszó…';search.setAttribute('aria-label','PDF-segédletek keresése');
 const select=node('select','doc26-filter');select.setAttribute('aria-label','Dokumentum-témakör');const all=node('option','','Minden témakör');all.value='all';select.append(all);
 const result=node('p','doc26-count','Dokumentumok betöltése…');result.setAttribute('role','status');
 const grid=node('div','doc26-grid');const more=node('button','doc26-more','További segédletek mutatása');more.type='button';more.hidden=true;
 const manual=node('aside','doc26-manual-highlight');manual.setAttribute('aria-labelledby','doc26-manual-title');
 const manualTitle=node('h2','','A honlap teljes használati útmutatója');manualTitle.id='doc26-manual-title';
 const manualLead=node('p','','Részletes útmutató a 66 tartalmi oldalhoz, a főmenühöz, a keresőhöz, a médiákhoz és a 10 helyi karbantartó eszközhöz.');
 const manualActions=node('div','doc26-manual-actions');
 const manualWeb=node('a','','Kereshető webes útmutató megnyitása');manualWeb.href='utmutato.html';
 const manualPdf=node('a','','Teljes PDF-kézikönyv letöltése');manualPdf.href='assets/documents/csanadi-weboldal-teljes-hasznalati-utmutato-2026.pdf';manualPdf.download='csanadi-weboldal-teljes-hasznalati-utmutato-2026.pdf';
 manualActions.append(manualWeb,manualPdf);manual.append(manualTitle,manualLead,manualActions);
 toolbar.append(search,select);box.append(manual,title,text,toolbar,result,grid,more);
 let docs=[],categories=new Map(),limit=settingNumber('runtime.display.documentCollectionBatch');
 const display=()=>{
  if(!box.isConnected)return;
  const q=fold(search.value.trim()),cat=select.value;
  const items=docs.filter(d=>(cat==='all'||d.categoryId===cat)&&(!q||fold([d.title,d.summary,...(d.keywords||[])].join(' ')).includes(q)));
  grid.replaceChildren();for(const d of items.slice(0,limit)){
   const card=node('article','doc26-item');const label=node('span','doc26-label',categories.get(d.categoryId)||'Segédlet');const h=node('h3','',d.title);const desc=node('p','',d.summary||'');const actions=node('div','doc26-actions');
   const preview=node('a','','PDF megnyitása ↗');preview.href=d.filePath;preview.target='_blank';preview.rel='noopener noreferrer';const down=node('a','','Letöltés');down.href=d.filePath;down.download=d.fileName||'';
   actions.append(preview,down);card.append(label,h,desc,actions);grid.append(card);
  }
  result.textContent=`${items.length} megfelelő segédlet · ${Math.min(limit,items.length)} megjelenítve`;
  more.hidden=items.length<=limit;
 };
 search.addEventListener('input',()=>{limit=settingNumber('runtime.display.documentCollectionBatch');display();});select.addEventListener('change',()=>{limit=settingNumber('runtime.display.documentCollectionBatch');display();});more.addEventListener('click',()=>{limit+=settingNumber('runtime.display.documentCollectionBatch');display();});
 fetch(STORE,{cache:'no-cache'}).then(x=>{if(!x.ok)throw Error('Dokumentumok nem elérhetők');return x.json();}).then(data=>{
  for(const c of data.categories||[])categories.set(c.id,c.label);
  docs=(data.documents||[]).filter(x=>x.filePath&&x.filePath.toLowerCase().endsWith('.pdf')&&x.status==='published');
  [...new Set(docs.map(x=>x.categoryId))].sort((a,b)=>(categories.get(a)||a).localeCompare(categories.get(b)||b,'hu')).forEach(id=>{const option=node('option','',categories.get(id)||id);option.value=id;select.append(option);});
  display();
 }).catch(err=>{result.textContent='A dokumentumtár nem tölthető be: '+err.message;});
 return box;
}
import {settingNumber} from './site-settings-2026.js';
