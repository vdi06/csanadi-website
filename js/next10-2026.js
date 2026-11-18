import {setting} from './site-settings-2026.js';

const e=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x;};
const add=(parent,...children)=>{for(const child of children)if(child)parent.append(child);return parent;};
const LOCAL=new URL('../json/',import.meta.url);
const get=async path=>{const r=await fetch(new URL(path,LOCAL),{cache:'no-cache'});if(!r.ok)throw Error('JSON nem elérhető: '+path);return r.json();};
const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu-HU');
function makeMeta(attr,key,value){let node=document.head.querySelector(`meta[${attr}="${key}"]`);if(!node){node=e('meta');node.setAttribute(attr,key);document.head.append(node);}node.setAttribute('content',value);}
export function updatePageMeta(page,route){
 if(!page)return;
 const title=page.seo?.title||page.title||'Csanádi Árpád Sportiskola';
 const summary=String(page.seo?.description||page.summary||'Csanádi Árpád Sportiskola, Általános Iskola és Gimnázium').trim().slice(0,200);
 const fullTitle=title.endsWith('Csanádi Sportiskola')||title.endsWith('Csanádi Árpád Sportiskola')?title:title+' | Csanádi Árpád Sportiskola';
 document.title=fullTitle;
 // A statikus FTP-csomag egyetlen belépési pontja az index.html.
 // A hash-útvonalak külön indexelhető HTML-másolat nélkül jelennek meg.
 const seoCanonical=new URL('index.html',document.baseURI).href;
 makeMeta('name','description',summary);makeMeta('property','og:type','website');makeMeta('property','og:title',fullTitle);
 makeMeta('property','og:description',summary);makeMeta('property','og:url',seoCanonical);
 makeMeta('property','og:site_name','Csanádi Árpád Sportiskola');makeMeta('property','og:locale','hu_HU');
 makeMeta('property','og:image',new URL('assets/media/logo/csanadi-cimer-512.webp',document.baseURI).href);
 makeMeta('name','twitter:card','summary');makeMeta('name','twitter:title',fullTitle);
 makeMeta('name','twitter:description',summary);
 // A közzététel előtti noindex állapotot nem módosítjuk automatikusan.
  
 let canonical=document.head.querySelector('link[rel="canonical"]');if(!canonical){canonical=e('link');canonical.rel='canonical';document.head.append(canonical);}
 canonical.href=seoCanonical;
}
function section(kicker,title,lead,cls=''){
 const s=e('section','next10-section '+cls),head=e('header','next10-head');
 add(head,e('p','section-overline',kicker),e('h2','',title),e('p','',lead));return add(s,head);
}
export function renderHistoryTimeline(){
 const root=section('ISKOLATÖRTÉNET','Az iskola története idővonalon','Kizárólag az intézmény közzétett történetében szereplő, ellenőrzött mérföldkövek.','next10-timeline');
 const tools=e('div','next10-controls'),list=e('ol','next10-milestones'),state=e('p','next10-note','Idővonal betöltése…');
 const select=e('select');select.setAttribute('aria-label','Történeti időszak');
 for(const [value,label] of [['all','Minden korszak'],['before1980','1980 előtt'],['after1980','1980-tól']]){const o=e('option','',label);o.value=value;select.append(o);}
 tools.append(select);root.append(tools,list,state);
 get('adatok/iskolatorteneti-idovonal.json').then(data=>{
  const entries=Array.isArray(data.events)?data.events:[];
  const draw=()=>{list.replaceChildren();let visible=entries.filter(x=>select.value==='all'||(select.value==='before1980'?x.year<1980:x.year>=1980));
   for(const item of visible){const li=e('li','next10-milestone');const date=e('time','next10-year',item.year);date.dateTime=String(item.year);
    const content=e('div','next10-milestone-body');add(content,e('h3','',item.title),e('p','',item.description));
    if(item.url?.startsWith('#/')){const link=e('a','next10-official-link','Kapcsolódó iskolai tartalom');link.href=item.url;content.append(link);}
    li.append(date,content);list.append(li);}
   state.textContent=`${visible.length} történelmi mérföldkő. A dátumok az eredeti intézményi leírás alapján szerepelnek.`;
  };
  select.addEventListener('change',draw);draw();
 }).catch(()=>state.textContent='Az idővonal adatai nem érhetők el; a történeti szöveg továbbra is olvasható.');
 return root;
}
function svgEl(tag,attrs={}){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));return n;}
export function renderSportsStatisticsV3(){
 const root=section('KÖZZÉTETT SPORTEREDMÉNYEK','Sportági statisztikák és összehasonlítás','Csak a hivatalosan közzétett, ellenőrzött bejegyzések sportág szerinti darabszámát mutatjuk. Nem élő tanulói eredménylista.','next10-statistics');
 const choices=e('div','next10-viewmodes'),graph=e('div','next10-graph'),tableWrap=e('div','next10-table-wrap'),notice=e('p','next10-note','Ellenőrzött bejegyzések betöltése…');
 root.append(choices,graph,tableWrap,notice);let view='bar',rows=[];
 const buttons=[];
 for(const [mode,label] of [['bar','Oszlopdiagram'],['donut','Kördiagram'],['table','Adattáblázat']]){const btn=e('button','next10-mode',label);btn.type='button';btn.dataset.mode=mode;btn.setAttribute('aria-pressed','false');btn.addEventListener('click',()=>{view=mode;draw();});choices.append(btn);buttons.push(btn);}
 function draw(){for(const btn of buttons)btn.setAttribute('aria-pressed',String(btn.dataset.mode===view));graph.replaceChildren();tableWrap.replaceChildren();
  if(!rows.length){notice.textContent='Nincs közölhető, ellenőrzött sportági adat.';return;}
  notice.textContent=`${rows.length} sportág · ${rows.reduce((n,r)=>n+r.count,0)} ellenőrzött bejegyzés. Az összehasonlítás bejegyzésszámokon alapul.`;
  const table=e('table','next10-stat-table');table.append(add(e('thead'),add(e('tr'),e('th','','Sportág'),e('th','','Bejegyzés (db)'))));const tbody=e('tbody');for(const r of rows)tbody.append(add(e('tr'),e('td','',r.label),e('td','',r.count)));table.append(tbody);tableWrap.append(table);
  if(view==='table'){tableWrap.hidden=false;return;}tableWrap.hidden=true;
  const width=600,height=view==='bar'?Math.max(230,rows.length*40+42):310;const svg=svgEl('svg',{viewBox:`0 0 ${width} ${height}`,role:'img','aria-label':`Közzétett sporteredmények sportáganként – ${view==='bar'?'oszlopdiagram':'kördiagram'}`});
  const max=Math.max(...rows.map(x=>x.count),1);
  const mode=document.documentElement.dataset.theme==='dark'?'dark':'light';
  const colors=[setting('theme.'+mode+'Colors.sportYellow'),setting('theme.'+mode+'Colors.sportGreen'),...setting('theme.'+mode+'Colors.chartOtherColors')];
  if(view==='bar'){rows.forEach((r,i)=>{const y=i*40+16;const label=svgEl('text',{x:10,y:y+20,fill:'currentColor','font-size':13});label.textContent=r.label;svg.append(label);
   const bar=svgEl('rect',{x:174,y,width:(r.count/max)*345,height:25,rx:6,fill:colors[i%colors.length]});svg.append(bar);
   const amount=svgEl('text',{x:530,y:y+19,fill:'currentColor','font-size':14,'font-weight':'bold'});amount.textContent=r.count;svg.append(amount);});
  }else{const cx=210,cy=150,rad=104,inner=52,total=rows.reduce((n,r)=>n+r.count,0);let start=-Math.PI/2;
   rows.forEach((r,i)=>{const angle=(r.count/total)*2*Math.PI,end=start+angle;
    const pt=(a,rr)=>[cx+rr*Math.cos(a),cy+rr*Math.sin(a)],p1=pt(start,rad),p2=pt(end,rad),p3=pt(end,inner),p4=pt(start,inner);
    if(angle>=2*Math.PI-0.001){svg.append(svgEl('circle',{cx,cy,r:rad,fill:colors[i%colors.length]}));svg.append(svgEl('circle',{cx,cy,r:inner,fill:'var(--card)'}));}
    else {const d=`M ${p1.join(' ')} A ${rad} ${rad} 0 ${angle>Math.PI?1:0} 1 ${p2.join(' ')} L ${p3.join(' ')} A ${inner} ${inner} 0 ${angle>Math.PI?1:0} 0 ${p4.join(' ')} Z`;svg.append(svgEl('path',{d,fill:colors[i%colors.length]}));}start=end;
    const legend=svgEl('text',{x:365,y:38+i*28,'font-size':13,fill:'currentColor'});legend.textContent=`${r.label}: ${r.count}`;svg.append(legend);
   });
  }
  graph.append(svg);
 }
 get('adatok/sportsikerek.json').then(data=>{const counts=new Map();for(const item of data.items||[])if(item.verified===true&&item.status==='verified'&&item.category)counts.set(item.category,(counts.get(item.category)||0)+1);
  rows=[...counts].map(([label,count])=>({label,count})).sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label,'hu'));draw();
 }).catch(()=>notice.textContent='A sporteredmény-JSON most nem elérhető.');
 return root;
}
export function renderDocumentInsights(){
 const root=section('DOKUMENTUMTÁR 3.0','Dokumentumok változatai és áttekintése','Kategóriák, dokumentumverziók és kereshető tartalmi összefoglalók a helyi JSON-ból.','next10-doc-insights');
 const form=e('div','next10-controls'),search=e('input');search.type='search';search.placeholder='Keress a címekben és leírásokban…';search.setAttribute('aria-label','Dokumentumok keresése');const type=e('select');type.setAttribute('aria-label','Dokumentumkategória');
 const area=e('div','next10-docs'),count=e('p','next10-note','Dokumentumok betöltése…');form.append(search,type);root.append(form,area,count);let docs=[],categories=[];
 const paint=()=>{const q=norm(search.value);const matches=docs.filter(d=>(type.value==='all'||d.categoryId===type.value)&&norm([d.title,d.summary,...(d.tags||[])].join(' ')).includes(q));area.replaceChildren();count.textContent=`${matches.length} közzétett dokumentum; a helyi gyűjtemény segédleteket tartalmaz, nem teljes hivatalos irattár.`;
  for(const doc of matches){const card=e('article','next10-doc-item');add(card,e('h3','',doc.title),e('p','',doc.summary),e('small','',`Verzió: ${doc.version} · ${doc.versionHistory?.length||1} változat · ${doc.documentKind}`));
   const actions=e('div','next10-doc-actions');if(/^assets\/documents\/[a-z0-9-]+\.pdf$/.test(doc.filePath||'')){const link=e('a','','PDF megnyitása ↗');link.href=doc.filePath;link.target='_blank';link.rel='noopener noreferrer';actions.append(link);}
   const versions=e('details');versions.append(e('summary','','Verziók részletei'));const list=e('ul');for(const v of doc.versionHistory||[])list.append(e('li','',`${v.version} – ${v.date}: ${v.change}`));versions.append(list);card.append(actions,versions);area.append(card);}
  if(!matches.length)area.append(e('p','next10-note','Nincs a feltételeknek megfelelő dokumentum.'));
 };
 search.addEventListener('input',paint);type.addEventListener('change',paint);
 get('adatok/dokumentumok.json').then(data=>{docs=(data.documents||[]).filter(d=>d.status==='published');categories=data.categories||[];const all=e('option','','Minden kategória');all.value='all';type.append(all);
  for(const x of categories){const op=e('option','',x.label);op.value=x.id;type.append(op);}paint();
 }).catch(()=>count.textContent='A dokumentum-JSON nem érhető el.');
 return root;
}
export function enhanceNext10Route(node,root){
 if(!node || !root)return;
 const route=node.page?.schemaExtensions?.route;
 const article=root.querySelector('.content-tiles--editorial,.content-shell,.home-canvas')||root;
 if(route==='#/iskolank/tortenet'||route==='#/iskolank/hagyomanyok-es-elismeresek')article.prepend(renderHistoryTimeline());
 if(route==='#/sport/sporteredmenyek'||route==='#/sport/sportagak')article.prepend(renderSportsStatisticsV3());
 if(route==='#/informaciok/dokumentumtar')article.prepend(renderDocumentInsights());
 root.querySelectorAll('img:not([loading])').forEach(img=>{if(img.closest('#global-hero')||img.closest('.gate26'))return;img.loading='lazy';img.decoding='async';});
  
}
export function initNext10(){
  
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelector('.next10-active-highlight')?.classList.remove('next10-active-highlight');}});
}
