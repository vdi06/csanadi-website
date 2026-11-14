/* Friss, forrásmegjelöléssel ellátott sportcímek a GitHub Actions által készített JSON-ból. */
const SOURCE=new URL('../json/adatok/napi-sporthirek.json',import.meta.url);
const make=(tag,cls='',text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node;};
function checkedNews(payload){
 if(payload?.schemaVersion!=='1.0.0'||payload?.collectionId!=='collection:napi-sporthirek'||!Array.isArray(payload.items))throw Error('Hibás sporthír-index.');
 return payload.items.filter(x=>typeof x?.title==='string'&&x.title.length>=6&&x.title.length<=220&&typeof x.url==='string'&&/^https:\/\/(www\.)?nemzetisport\.hu\//.test(x.url)&&!Number.isNaN(Date.parse(x.publishedAt)));
}
export function renderDailySportsNews(mode='home'){
 const section=make('section','daily-sports-news section-wrap');const container=make('div','container-xxl');
 const h=make('div','daily-sports-head');h.append(make('div','section-overline','MAGYAR ÉS NEMZETKÖZI SPORT'),make('h2','section-title','Napi sporthírek'));
 const all=make('a','daily-sports-more','Sporthírközpont →');all.href='#/hirek-es-esemenyek/hirek/sporthirek';h.append(all);container.append(h);
 const note=make('p','daily-sports-intro','A sportvilág friss címei külön jelennek meg a Csanádi diákjainak ellenőrzött eredményeitől.');container.append(note);
 const grid=make('div','daily-sports-cards');container.append(grid);section.append(container);
 function load(){fetch(SOURCE,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Hírek nem elérhetők');return r.json();}).then(x=>{
   if(!section.isConnected)return;grid.replaceChildren();const items=checkedNews(x).slice(0,mode==='full'?18:6);
   if(!items.length){grid.append(make('p','daily-sports-empty','A napi sporthírek frissítése folyamatban van. A Csanádi eredményeit az iskola eredménytárában találod.'));return;}
   for(const item of items){const card=make('article','daily-sports-card');const header=make('p','daily-sports-meta',item.category||'Sporthír');const title=make('h3','',item.title);
    const date=make('time','daily-sports-date',new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'short',day:'numeric',timeZone:'Europe/Budapest'}).format(new Date(item.publishedAt)));
    const link=make('a','daily-sports-link','Cikk megnyitása a forrásnál ↗');link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';
    card.append(header,title,date,link);grid.append(card);
   }
   const stamp=make('p','daily-sports-stamp',`Hírforrás: ${x.source||'Nemzeti Sport Online'} · utolsó adatfrissítés: ${x.updatedAt?new Intl.DateTimeFormat('hu-HU',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Budapest'}).format(new Date(x.updatedAt)):'még nincs adat'}`);grid.after(stamp);
  }).catch(()=>{if(section.isConnected)grid.replaceChildren(make('p','daily-sports-empty','A sporthírfolyam jelenleg nem érhető el.'));});}
 load();const interval=setInterval(()=>{if(!section.isConnected){clearInterval(interval);return;}if(!document.hidden)load();},5*60*1000);
 return section;
}
