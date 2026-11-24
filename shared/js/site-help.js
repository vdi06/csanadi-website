import { element as el } from './dom.js?v=2.62';
import { openContentDialog, closeContentDialog } from './content-expansion.js?v=2.62';
import { menuPageHref } from './menu-data.js?v=2.62';
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu-HU');
export function bindSiteHelp(config,toggle,beforeOpen){
 const data=config.home.help;
 function open(){beforeOpen?.();if(openContentDialog({title:data.title,trigger:toggle,large:true,restore:()=>toggle.setAttribute('aria-expanded','false'),views:[()=>helpView(data)]}))toggle.setAttribute('aria-expanded','true');}
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
