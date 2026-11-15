const STORAGE='csanadi-r21-home-preferences';
const TAGS=[
 {id:'featured',label:'Kiemelt sportos tartalom',selector:'.home-unit--premium-showcase'},
 {id:'shortcuts',label:'Gyorsnavigáció',selector:'.home-j-navrail-unit'},
 {id:'school-news',label:'Iskolai hírek',selector:'.home-unit--school-news'},
 {id:'sport-news',label:'Sporthírek',selector:'.home-unit--sports-news'},
 {id:'daily',label:'Napi központ',selector:'.home-j-fold:nth-of-type(1)'},
 {id:'statistics',label:'Sporteredmények',selector:'.home-j-fold:nth-of-type(2)'},
 {id:'gallery',label:'Képek és közösség',selector:'.home-j-fold:nth-of-type(3)'},
 {id:'discover',label:'Fedezd fel az iskolát',selector:'.home-j-fold:nth-of-type(4)'}
];
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n;};
function read(){try{const value=JSON.parse(localStorage.getItem(STORAGE));return value&&typeof value==='object'&&!Array.isArray(value)?value:null;}catch{return null;}}
function save(value){try{localStorage.setItem(STORAGE,JSON.stringify(value));return true;}catch{return false;}}
export function enhancePersonalizedHome(canvas){
 const blocks=new Map();
 const folds=[...canvas.querySelectorAll(':scope > .home-j-fold')];
 for(const item of TAGS){const element=item.id==='daily'?folds[0]:item.id==='statistics'?folds[1]:item.id==='gallery'?folds[2]:item.id==='discover'?folds[3]:canvas.querySelector(item.selector);if(element)blocks.set(item.id,element);}
 let state=read();const all=[...blocks.keys()];
 if(!state||!Array.isArray(state.order)||!Array.isArray(state.visible))state={order:all,visible:all};
 state.order=[...new Set([...state.order.filter(x=>typeof x==='string'&&blocks.has(x)),...all])];
 state.visible=[...new Set(state.visible.filter(x=>typeof x==='string'&&blocks.has(x)))];
 const panel=el('details','csn21-personalizer');
 const summary=el('summary','','⚙ Kezdőlap beállítása · kedvenc kártyák és sorrend');
 const description=el('p','','A beállítás kizárólag ebben a böngészőben marad. A rejtett kártyák később újra bekapcsolhatók.');
 const rows=el('div','csn21-home-rows');const message=el('p','csn21-home-message','');message.setAttribute('role','status');message.setAttribute('aria-live','polite');
 panel.append(summary,description,rows,message);
 function render(){
  rows.replaceChildren();for(const id of state.order){const block=blocks.get(id);block.hidden=!state.visible.includes(id);canvas.append(block);}
  for(const [index,id] of state.order.entries()){
   const label=TAGS.find(x=>x.id===id)?.label||id,row=el('div','csn21-home-row'),check=el('input');row.dataset.cardId=id;check.type='checkbox';check.checked=state.visible.includes(id);check.id='csn21-card-'+id;
   check.addEventListener('change',()=>{state.visible=check.checked?[...state.visible,id]:state.visible.filter(x=>x!==id);const persisted=save(state);render();rows.querySelector('#'+check.id)?.focus();message.textContent=label+(check.checked?' megjelenítve.':' elrejtve.')+(persisted?'':' A böngésző nem engedte a mentést.');});
   const text=el('label','',label);text.htmlFor=check.id;row.append(check,text);
   const actions=el('div','csn21-card-actions');
   for(const [direction,title,delta] of [['up','Feljebb',-1],['down','Lejjebb',1]]){const button=el('button','',title);button.type='button';button.dataset.move=direction;button.disabled=index+delta<0||index+delta>=state.order.length;button.setAttribute('aria-label',label+' · '+title.toLowerCase());button.addEventListener('click',()=>{const copy=[...state.order];[copy[index],copy[index+delta]]=[copy[index+delta],copy[index]];state.order=copy;const persisted=save(state);render();const moved=rows.querySelector(`[data-card-id="${id}"]`);(moved?.querySelector(`[data-move="${direction}"]:not(:disabled)`)||moved?.querySelector('button:not(:disabled)')||moved?.querySelector('input'))?.focus();message.textContent=label+' sorrendje módosult.'+(persisted?'':' A böngésző nem engedte a mentést.');});actions.append(button);}
   row.append(actions);rows.append(row);
  }
 }
 const reset=el('button','csn21-home-reset','Alapértelmezett elrendezés');reset.type='button';reset.addEventListener('click',()=>{state={order:all,visible:all};try{localStorage.removeItem(STORAGE);}catch{}render();message.textContent='Az összes kártya ismét látható az eredeti sorrendben.';});panel.append(reset);
 canvas.prepend(panel);render();
}
