 
const SOURCE=new URL('../json/data/daily-sports-news.json',import.meta.url);
const make=(tag,cls='',text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node;};
function checkedNews(payload){
 if(payload?.schemaVersion!=='1.0.0'||payload?.collectionId!=='collection:napi-sporthirek'||!Array.isArray(payload.items))throw Error('Hibás sporthír-index.');
 return payload.items.filter(x=>typeof x?.title==='string'&&x.title.length>=6&&x.title.length<=220&&typeof x.url==='string'&&/^https:\/\/(www\.)?nemzetisport\.hu\//.test(x.url)&&!Number.isNaN(Date.parse(x.publishedAt))&&Date.now()-Date.parse(x.publishedAt)>=0&&Date.now()-Date.parse(x.publishedAt)<=settingNumber('runtime.news.maximumAgeHours')*60*60*1000);
}
export function renderDailySportsNews(mode='home'){
 const section=make('section','daily-sports-news section-wrap');const container=make('div','container-xxl');
 const h=make('div','daily-sports-head');h.append(make('div','section-overline','MAGYAR ÉS NEMZETKÖZI SPORT'),make('h2','section-title','Napi sporthírek'));
 if(mode!=='full'){
  const all=make('a','daily-sports-more','Sporthírközpont →');all.href='#/hirek-es-esemenyek/hirek/sporthirek';h.append(all);
 }
 container.append(h);
 const note=make('p','daily-sports-intro',`A sportvilág ellenőrzött, legfeljebb ${settingNumber('runtime.news.maximumAgeHours')} órás cikkei. A lista kizárólag az FTP-re feltöltött saját JSON-fájlból frissül. Nincs automatikus hírbegyűjtés és nincs külső futtatási szolgáltatás.`);const originalIntro=note.textContent;container.append(note);
 const grid=make('div','daily-sports-cards');container.append(grid);section.append(container);
 let latestRequest=0;
 function clearStamp(){if(grid.nextElementSibling?.classList.contains('daily-sports-stamp'))grid.nextElementSibling.remove();}
 function showEmpty(title,description){
   grid.replaceChildren();clearStamp();
   const card=make('article','daily-sports-card daily-sports-empty-card');
   card.append(make('h3','',title),make('p','daily-sports-meta',description));
   const link=make('a','daily-sports-link','Iskolai sporthírek →');link.href='#/hirek-es-esemenyek/hirek/sporthirek';card.append(link);grid.append(card);
 }
 function load(){const request=++latestRequest;fetch(SOURCE,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Hírek nem elérhetők');return r.json();}).then(x=>{
   if(!section.isConnected||request!==latestRequest)return;const items=checkedNews(x).slice(0,mode==='full'?settingNumber('runtime.display.dailyNewsFull'):settingNumber('runtime.display.dailyNewsCompact'));grid.replaceChildren();clearStamp();note.textContent=originalIntro;
   if(!items.length){
      note.textContent=`Jelenleg nem szerepel friss, ${settingNumber('runtime.news.maximumAgeHours')} órán belüli bejegyzés a honlap saját sporthír-adatállományában. A hírek közzétételét a szerkesztő által feltöltött JSON biztosítja.`;
      showEmpty('Jelenleg nincs friss helyi hírlista','Az aktuális hírek közvetlenül, az eredeti sportportálon tekinthetők meg.');
      return;
    }
   for(const item of items){const card=make('article','daily-sports-card');const header=make('p','daily-sports-meta',item.category||'Sporthír');const title=make('h3','',item.title);
    const date=make('time','daily-sports-date',new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'short',day:'numeric',timeZone:setting('modules2026.clock.timezone')}).format(new Date(item.publishedAt)));date.dateTime=new Date(item.publishedAt).toISOString();
    const link=make('a','daily-sports-link','Teljes sporthír megnyitása ↗');link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';
    card.append(header,title,date,link);grid.append(card);
   }
   const stamp=make('p','daily-sports-stamp',`Utolsó frissítés: ${x.updatedAt&&!Number.isNaN(Date.parse(x.updatedAt))?new Intl.DateTimeFormat('hu-HU',{dateStyle:'short',timeStyle:'short',timeZone:setting('modules2026.clock.timezone')}).format(new Date(x.updatedAt)):'még nincs adat'}`);grid.after(stamp);
  }).catch(()=>{if(!section.isConnected||request!==latestRequest)return;note.textContent='A helyi hírlista most nem tölthető be. Próbáld újra később; a többi honlaptartalom használható.';showEmpty('A helyi sporthírek nem érhetők el','A hírközpont továbbra is megnyitható, a hálózati hiba nem állítja le az oldalt.');});}
 load();const interval=setInterval(()=>{if(!section.isConnected){clearInterval(interval);return;}if(!document.hidden)load();},settingNumber('runtime.timing.dailySportNewsRefreshMs'));
 return section;
}
import {setting,settingNumber} from './site-settings-2026.js?v=1.45';
