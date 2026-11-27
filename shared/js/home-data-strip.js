import { element as el } from './dom.js?v=2.71';
import { openContentDialog } from './content-expansion.js?v=2.71';

// Every number is derived from the current JSON, never from a decorative sample.
export function homeDataMetrics(config) {
 const docs=config.documentCenter.items;
 const sports=config.home.sportSuccesses.items.filter(x=>x.verified===true);
 const years=[...new Set(sports.map(x=>x.date.slice(0,4)))].sort();
 return {documents:{available:docs.filter(x=>x.status==='available'&&x.file).length,total:docs.length},
  collections:[{id:'news',value:config.publicNews.length},{id:'events',value:config.home.calendar.events.length},{id:'media',value:config.mediaCenter.items.filter(x=>x.publication!=='draft').length}],
  sports:{total:sports.length,years:years.map(year=>({year,value:sports.filter(x=>x.date.startsWith(year+'-')).length})),items:sports}};
}
const svg=(tag,attrs={},children=[])=>{const node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));node.append(...children);return node;};
function ring(available,total){const fraction=total?available/total:0;return svg('svg',{viewBox:'0 0 80 60',class:'home-data-ring','aria-hidden':'true',focusable:'false'},[
 svg('circle',{cx:40,cy:30,r:23,fill:'none',stroke:'currentColor','stroke-opacity':.15,'stroke-width':6}),
 svg('circle',{cx:40,cy:30,r:23,fill:'none',stroke:'var(--strip-gold)','stroke-width':6,'stroke-linecap':'round',pathLength:100,'stroke-dasharray':`${fraction*100} 100`,transform:'rotate(-90 40 30)'})]);}
function bars(items,labels){const max=Math.max(1,...items.map(x=>x.value));return el('span',{className:'home-data-bars',attributes:{'aria-hidden':'true'}},...items.map(x=>el('span',{className:'home-data-bar'},el('span',{className:'home-data-bar-name',text:labels[x.id]}),el('span',{className:'home-data-bar-track'},el('span',{className:'home-data-bar-fill',attributes:{style:`--fill:${x.value/max*100}%`}})),el('span',{className:'home-data-bar-number',text:x.value}))));}
function yearBars(years){const rows=years.slice(-3),max=Math.max(1,...rows.map(x=>x.value));return el('span',{className:'home-data-years',attributes:{'aria-hidden':'true'}},...rows.map(x=>el('span',{className:'home-data-year'},el('span',{className:'home-data-year-value',text:x.value}),el('span',{className:'home-data-year-track'},el('span',{className:'home-data-year-fill',attributes:{style:`--fill:${x.value/max*100}%`}})),el('span',{className:'home-data-year-label',text:x.year}))));}
export function createHomeDataStrip(config,platform){
 const settings=config.home.dataStrip;if(!settings?.enabled)return null;
 const m=homeDataMetrics(config),labels=settings.labels;
 const titleId=`${platform}-home-data-title`;
 const section=el('section',{className:`home-data-strip home-data-strip-${platform}`,attributes:{'aria-labelledby':titleId,'data-home-data-strip':platform}},el('h2',{text:settings.title,attributes:{id:titleId}}));
 const row=el('div',{className:'home-data-row'});
 function add(id,graphic,value,summary,detail){
  const def=settings.cards[id];const button=el('button',{className:'home-data-card',attributes:{type:'button','aria-haspopup':'dialog','data-metric':id,'aria-label':`${def.title}: ${summary}. ${labels.details}`}},
   el('span',{className:'home-data-graphic'},graphic),el('strong',{className:'home-data-value',text:value}),el('span',{className:'home-data-label',text:def.title}));
  button.addEventListener('click',()=>openContentDialog({title:def.title,trigger:button,views:[()=>el('div',{className:'home-data-detail'},el('p',{className:'content-kicker',text:settings.detailKicker}),el('p',{text:def.note}),detail(),el('a',{className:'content-action recommendation-visit',text:labels.open,attributes:{href:'#/oldal/'+def.page}}))]}));row.append(button);
 }
 const docs=m.documents;
 add('documents',ring(docs.available,docs.total),`${docs.available}/${docs.total}`,`${docs.available} elérhető dokumentum a(z) ${docs.total} tételből`,()=>el('dl',{className:'home-data-detail-list'},el('dt',{text:labels.available}),el('dd',{text:docs.available}),el('dt',{text:labels.pending}),el('dd',{text:docs.total-docs.available})));
 const sum=m.collections.reduce((a,x)=>a+x.value,0);
 add('collections',bars(m.collections,labels.short),sum, m.collections.map(x=>`${labels[x.id]}: ${x.value}`).join(', '),()=>el('dl',{className:'home-data-detail-list'},...m.collections.flatMap(x=>[el('dt',{text:labels[x.id]}),el('dd',{text:x.value})])));
 add('sports',yearBars(m.sports.years),m.sports.total,`${m.sports.total} forrással jelölt eredmény`,()=>el('ul',{className:'home-data-result-list'},...m.sports.items.map(x=>el('li',{text:`${x.date.slice(0,4)} · ${x.sport} · ${x.result} – ${x.competition}`}))));
 section.append(row);return section;
}
