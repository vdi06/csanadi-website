 
const SOURCE=new URL('../json/adatok/napi-sporthirek.json',import.meta.url);
const make=(tag,cls='',text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node;};
function checkedNews(payload){
 if(payload?.schemaVersion!=='1.0.0'||payload?.collectionId!=='collection:napi-sporthirek'||!Array.isArray(payload.items))throw Error('Hibás sporthír-index.');
 return payload.items.filter(x=>typeof x?.title==='string'&&x.title.length>=6&&x.title.length<=220&&typeof x.url==='string'&&/^https:\/\/(www\.)?nemzetisport\.hu\//.test(x.url)&&!Number.isNaN(Date.parse(x.publishedAt))&&Date.now()-Date.parse(x.publishedAt)>=0&&Date.now()-Date.parse(x.publishedAt)<=settingNumber('runtime.news.maximumAgeHours')*60*60*1000);
}
export function renderDailySportsNews(mode='home'){
 const section=make('section','daily-sports-news section-wrap');const container=make('div','container-xxl');
 const h=make('div','daily-sports-head');h.append(make('div','section-overline','MAGYAR ÉS NEMZETKÖZI SPORT'),make('h2','section-title','Napi sporthírek'));
 const all=make('a','daily-sports-more','Sporthírközpont →');all.href='#/hirek-es-esemenyek/hirek/sporthirek';h.append(all);container.append(h);
 const note=make('p','daily-sports-intro',`A sportvilág ellenőrzött, legfeljebb ${settingNumber('runtime.news.maximumAgeHours')} órás cikkei. A lista kizárólag az FTP-re feltöltött saját JSON-fájlból frissül. Nincs automatikus hírbegyűjtés és nincs külső futtatási szolgáltatás.`);container.append(note);
 const grid=make('div','daily-sports-cards');container.append(grid);section.append(container);
 function load(){fetch(SOURCE,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Hírek nem elérhetők');return r.json();}).then(x=>{
   if(!section.isConnected)return;grid.replaceChildren();const items=checkedNews(x).slice(0,mode==='full'?settingNumber('runtime.display.dailyNewsFull'):settingNumber('runtime.display.dailyNewsCompact'));
   if(!items.length){
      note.textContent=`Jelenleg nem szerepel friss, ${settingNumber('runtime.news.maximumAgeHours')} órán belüli bejegyzés a honlap saját sporthír-adatállományában. A hírek közzétételét a szerkesztő által feltöltött JSON biztosítja.`;
      const card=make('article','daily-sports-card daily-sports-empty-card');
      card.append(make('h3','','Jelenleg nincs friss helyi hírlista'));
      card.append(make('p','daily-sports-meta','Az aktuális hírek közvetlenül, az eredeti sportportálon tekinthetők meg.'));
      const link=make('a','daily-sports-link','Iskolai sporthírek →');
      link.href='#/hirek-es-esemenyek/hirek/sporthirek';
      card.append(link);grid.append(card);
      return;
    }
   for(const item of items){const card=make('article','daily-sports-card');const header=make('p','daily-sports-meta',item.category||'Sporthír');const title=make('h3','',item.title);
    const date=make('time','daily-sports-date',new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'short',day:'numeric',timeZone:setting('modules2026.clock.timezone')}).format(new Date(item.publishedAt)));
    const link=make('a','daily-sports-link','Teljes sporthír megnyitása ↗');link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';
    card.append(header,title,date,link);grid.append(card);
   }
   grid.nextElementSibling?.classList.contains('daily-sports-stamp')&&grid.nextElementSibling.remove();const stamp=make('p','daily-sports-stamp',`Utolsó frissítés: ${x.updatedAt?new Intl.DateTimeFormat('hu-HU',{dateStyle:'short',timeStyle:'short',timeZone:setting('modules2026.clock.timezone')}).format(new Date(x.updatedAt)):'még nincs adat'}`);grid.after(stamp);
  }).catch(()=>{if(!section.isConnected)return;grid.replaceChildren();const a=make('a','daily-sports-link','Iskolai sporthírek →');a.href='#/hirek-es-esemenyek/hirek/sporthirek';grid.append(make('p','daily-sports-empty','A helyi hírlista jelenleg nem érhető el.'),a);});}
 load();const interval=setInterval(()=>{if(!section.isConnected){clearInterval(interval);return;}if(!document.hidden)load();},settingNumber('runtime.timing.dailySportNewsRefreshMs'));
 return section;
}
import {setting,settingNumber} from './site-settings-2026.js';
