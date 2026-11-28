import {optionalData} from "./data/optional-data.js?v=2.83";
import {validatePersonalData} from "./personal-data.js?v=2.83";
import { element as el } from './dom.js?v=2.83';
import { openContentDialog, closeContentDialog } from './content-expansion.js?v=2.83';
import { menuPageHref } from './menu-data.js?v=2.83';
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu-HU');
export function bindSiteHelp(config,toggle,beforeOpen){
 const data=config.home.help;
 function open(){beforeOpen?.();if(openContentDialog({title:data.title,trigger:toggle,large:true,initialFocus:'.site-help input',restore:()=>toggle.setAttribute('aria-expanded','false'),views:[()=>lazyHelp(config,data)]}))toggle.setAttribute('aria-expanded','true');}
 toggle.addEventListener('click',open);return()=>{toggle.removeEventListener('click',open);if(toggle.getAttribute('aria-expanded')==='true')closeContentDialog();};
}
function helpView(data){
 const input=el('input',{className:'personal-widget-input',attributes:{type:'search','aria-label':'Keresés a használati útmutatóban',placeholder:'Pl. menü, galéria, widget…',autocomplete:'off'}});
 const category=el('select',{className:'personal-widget-input',attributes:{'aria-label':'Súgótéma kiválasztása'}},el('option',{text:'Minden témakör',attributes:{value:''}}),...data.categories.map(c=>el('option',{text:c,attributes:{value:c}})));
 const count=el('p',{className:'personal-widget-status',attributes:{role:'status','aria-live':'polite'}}),list=el('div',{className:'site-help-list'});
 const root=el('div',{className:'site-help'},el('p',{text:data.intro}),el('div',{className:'site-help-filters'},input,category),count,list);
 function render(){const words=norm(input.value).split(/\s+/).filter(Boolean);const items=data.topics.filter(t=>(!category.value||category.value===t.category)&&words.every(w=>norm([t.title,t.category,t.keywords,...t.steps].join(' ')).includes(w)));count.textContent=`${items.length} / ${data.topics.length} útmutató`;list.replaceChildren();for(const t of items){const details=el('details',{className:'site-help-topic'},el('summary',{},el('span',{className:'site-help-topic-title'},el('strong',{text:t.title}),el('small',{text:t.category}))),el('div',{className:'site-help-steps'},el('ol',{},...t.steps.map(s=>el('li',{text:s}))),t.page?el('a',{text:'Kapcsolódó oldal megnyitása ↗',attributes:{href:menuPageHref(t.page)}}):null));list.append(details);}if(!items.length)list.append(el('p',{text:'Nincs találat. Próbálj másik kifejezést vagy válassz másik témakört.'}));}
 input.addEventListener('input',render);category.addEventListener('change',render);render();return root;
}

function lazyHelp(config,data){
 if(Array.isArray(data.topics))return helpView(data);
 const root=el('div',{className:'site-help'});const status=el('p',{text:'A használati útmutató betöltése…',attributes:{role:'status'}});root.append(status);
 const load=()=>{root.replaceChildren(status);status.textContent='A használati útmutató betöltése…';optionalData(config,'help').then(record=>{const full={...data,topics:record.topics};if(record.topics.length!==data.topicCount)throw Error('Eltérő súgótémaszám');validatePersonalData({...config,home:{...config.home,help:full}});if(root.isConnected){root.replaceChildren(helpView(full));root.querySelector('input')?.focus();}}).catch(()=>{status.textContent='A súgó átmenetileg nem tölthető be.';const retry=el('button',{text:'Újrapróbálás',attributes:{type:'button'}});retry.addEventListener('click',load);root.append(retry);});};load();return root;
}
