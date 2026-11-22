/** 1.51: kizárólag helyben működő, JSON-alapú fejléc-, menü- és láblécszerkesztő. */
import {jsonNode,safeJsonURL} from '../js/json-dom-v149.js?v=1.51';
import {validateJsonShell} from '../js/json-validator-v149.js?v=1.51';
import {downloadBlob} from '../js/zip-native-2026.js?v=1.51';

const ROOT=new URL('../',import.meta.url);
const clone=value=>JSON.parse(JSON.stringify(value));
const el=(tag,cls='',content)=>{
 const result=document.createElement(tag);if(cls)result.className=cls;
 if(content!==undefined)result.textContent=String(content);return result;
};
const sectionTitle={header:'Fejléc',menu:'Főmenü',footer:'Lábléc'};
export function shellNodeIndex(shell,section){
 const target={header:'site-header',menu:'site-map-overlay',footer:'site-footer'}[section];
 return (shell.body||[]).findIndex(node=>node.attrs?.id===target||
  node.attrs?.class?.split(/\s+/).includes(target));
}
/** A mezők teljes útvonalai szerepelnek a JSON-ban; nincs párhuzamos HTML-tartalom. */
export function enumerateShellFields(shell,section){
 const index=shellNodeIndex(shell,section);if(index<0)return [];
 const fields=[];
 const walk=(value,path,context='')=>{
  if(typeof value==='string'){
   if(value.trim())fields.push({path,label:context||'Szöveg',kind:'text',value});
   return;
  }
  if(!value||typeof value!=='object')return;
  const label=value.attrs?.['aria-label']||value.attrs?.id||value.attrs?.class?.split(' ')[0]||value.tag||context;
  for(const attr of ['href','aria-label','title','alt','placeholder']){
   if(typeof value.attrs?.[attr]==='string'&&value.attrs[attr].trim()){
    fields.push({path:[...path,'attrs',attr],label:`${label} · ${attr}`,kind:attr==='href'?'url':'attribute',value:value.attrs[attr]});
   }
  }
  for(const [i,child] of (value.children||[]).entries())walk(child,[...path,'children',i],label);
 };
 walk(shell.body[index],['body',index],sectionTitle[section]);
 return fields;
}
export function setShellField(shell,path,value){
 if(!Array.isArray(path)||path[0]!=='body')throw Error('Érvénytelen JSON-mezőútvonal.');
 if(path.at(-1)==='href'&&!safeJsonURL(value))throw Error('Nem biztonságos hivatkozás.');
 let cursor=shell;
 for(const part of path.slice(0,-1)){
  if(cursor==null||!(part in cursor))throw Error('Hiányzó JSON-mező.');
  cursor=cursor[part];
 }
 const key=path.at(-1);
 if(typeof cursor?.[key]!=='string')throw Error('Csak meglévő szöveges mező módosítható.');
 cursor[key]=String(value);
 return shell;
}
export function collectMenuEntries(structure,pageIndex){
 const result=[];
 const walk=(nodes,depth=0)=>{
  for(const item of [...nodes].sort((a,b)=>a.order-b.order)){
   const page=pageIndex.pages?.[item.path];
   result.push({path:item.path,depth,label:page?.menuLabel||page?.title||item.path,visible:item.menuVisible!==false});
   walk(item.children||[],depth+1);
  }
 };
 walk(structure.nodes||[]);return result;
}
export function moveMenuItem(structure,path,direction){
 const result=clone(structure),delta=Math.sign(direction);
 if(delta!==1&&delta!==-1)throw Error('Érvénytelen mozgatási irány.');
 const walk=nodes=>{
  const index=nodes.findIndex(item=>item.path===path);
  if(index>=0){
   const target=index+delta;
   if(target<0||target>=nodes.length)return false;
   [nodes[index],nodes[target]]=[nodes[target],nodes[index]];
   nodes.forEach((item,i)=>{item.order=i+1});
   return true;
  }
  return nodes.some(item=>walk(item.children||[]));
 };
 if(!walk(result.nodes||[]))return null;
 return result;
}

export function mountVisualJsonEditor(studio,parent){
 const main=el('div','cs-vjson');parent.append(main);
 const heading=el('div','cs-vjson-intro');heading.append(
  el('h3','','Vizuális JSON-szerkesztő'),
  el('p','','A fejléc, a menü és a lábléc szövegei és hivatkozásai közvetlenül a JSON-ból változnak. Az oldalak továbbra is az „Oldalak” lapon szerkeszthetők. A módosítások csak a helyi ZIP-munkapéldányban szerepelnek.'));
 main.append(heading);
 let draftShell=clone(studio.state.shell),draftStructure=clone(studio.state.structure);
 let section='header',selectedPath='',search='',previewTimer=null;
 const switcher=el('div','cs-vjson-switch');switcher.setAttribute('role','group');switcher.setAttribute('aria-label','Szerkesztendő terület');
 const layout=el('div','cs-vjson-layout'),fieldsPanel=el('section','cs-vjson-fields'),previewPanel=el('section','cs-vjson-preview');
 const notice=el('p','cs-vjson-status');notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');
 const feedback=(message,invalid=false)=>{notice.textContent=message;notice.classList.toggle('is-error',invalid);studio.status(message,invalid);};
 const actions=el('div','cs-vjson-actions');
 const control=(parent,label,value,handler,type='text')=>{
  const wrap=el('label','cs-vjson-field');wrap.append(el('span','',label));
  const input=el('input');input.type=type;input.value=value;
  input.addEventListener('input',()=>handler(input.value));wrap.append(input);parent.append(wrap);
  return input;
 };
 const button=(parent,label,handler,primary=false)=>{
  const item=el('button','cs-tool-button'+(primary?' cs-tool-primary':''),label);
  item.type='button';item.addEventListener('click',handler);parent.append(item);return item;
 };
 for(const [key,label] of Object.entries(sectionTitle)){
  const tab=el('button','cs-vjson-tab',label);tab.type='button';tab.dataset.section=key;
  tab.addEventListener('click',()=>{section=key;search='';render()});switcher.append(tab);
 }
 main.append(switcher,layout,actions,notice);layout.append(fieldsPanel,previewPanel);
 const previewShell=()=>{
  previewPanel.replaceChildren(el('h4','','Élő JSON-előnézet'));
  const result=validateJsonShell(draftShell,{kind:'site'});
  const summary=el('p','cs-vjson-mini',result.valid?
   'A JSON szerkezete megfelelő. A felület az alábbi mezőket tükrözi.':
   result.errors.slice(0,2).join(' · '));previewPanel.append(summary);
  const iframe=el('iframe','cs-vjson-frame');iframe.title=sectionTitle[section]+' – helyi előnézet';
  iframe.setAttribute('sandbox','allow-same-origin');previewPanel.append(iframe);
  const paint=()=>{
   const doc=iframe.contentDocument;if(!doc)return;
   doc.documentElement.lang='hu';doc.body.className='cs-home-header';
   doc.head.replaceChildren();
   for(const asset of draftShell.assets.stylesheets||[]){
    if(!asset.href||!safeJsonURL(asset.href))continue;
    const style=doc.createElement('link');style.rel='stylesheet';
    style.href=new URL(asset.href,ROOT).href;doc.head.append(style);
   }
   const source=draftShell.body[shellNodeIndex(draftShell,section)];
   const rendered=source?jsonNode(source,'html',doc):null;
   doc.body.replaceChildren(...(rendered?[rendered]:[]));
   doc.addEventListener('click',event=>{if(event.target.closest('a,button'))event.preventDefault();},true);
  };
  iframe.addEventListener('load',paint,{once:true});
  // about:blank a legtöbb böngészőben azonnal rendelkezésre áll.
  if(iframe.contentDocument?.readyState==='complete')paint();
 };
 const previewMenu=()=>{
  previewPanel.replaceChildren(el('h4','','Menüsorrend – élő előnézet'));
  const list=el('ol','cs-vjson-menu-list');
  for(const entry of collectMenuEntries(draftStructure,studio.state.pageIndex)){
   const row=el('li','',entry.label);row.style.paddingLeft=(entry.depth*18)+'px';
   if(entry.path===selectedPath)row.classList.add('is-active');
   if(!entry.visible)row.classList.add('is-hidden-menu');
   list.append(row);
  }
  previewPanel.append(list);
 };
 const renderShellFields=()=>{
  const all=enumerateShellFields(draftShell,section);
  fieldsPanel.replaceChildren(el('h4','',sectionTitle[section]+' – szerkeszthető mezők'));
  const filter=control(fieldsPanel,'Mező keresése',search,value=>{
   search=value;
   for(const row of list.children){
    row.hidden=!row.dataset.searchText?.includes(search.toLocaleLowerCase('hu'));
   }
  },'search');
  filter.setAttribute('aria-label','Szerkeszthető mezők szűrése');
  const list=el('div','cs-vjson-scroll');fieldsPanel.append(list);
  let count=0;
  for(const field of all){
   if(search&&!`${field.label} ${field.value}`.toLocaleLowerCase('hu').includes(search.toLocaleLowerCase('hu')))continue;
   count++;
   const input=control(list,field.label,field.value,value=>{
    try{
     setShellField(draftShell,field.path,value);
     input.parentElement.dataset.searchText=`${field.label} ${value}`.toLocaleLowerCase('hu');
     clearTimeout(previewTimer);previewTimer=setTimeout(previewShell,180);
     feedback('Az előnézet frissítése folyamatban. A módosítást a rögzítőgombbal veheted át.');
    }
    catch(error){feedback(error.message,true);}
   },field.kind==='url'?'url':'text');
   input.parentElement.dataset.searchText=`${field.label} ${field.value}`.toLocaleLowerCase('hu');
   input.dataset.jsonPath=JSON.stringify(field.path);
  }
  if(!count)list.append(el('p','','Nincs megfelelő mező.'));
  previewShell();
 };
 const renderMenuFields=()=>{
  fieldsPanel.replaceChildren(el('h4','','Főmenü – oldalak és sorrend'));
  const list=collectMenuEntries(draftStructure,studio.state.pageIndex);
  if(!list.some(item=>item.path===selectedPath))selectedPath=list[0]?.path||'';
  const label=el('label','cs-vjson-field');label.append(el('span','','Menüpont kiválasztása'));
  const select=el('select');for(const entry of list){
   const option=el('option','',`${'— '.repeat(entry.depth)}${entry.label}${entry.visible?'':' (rejtett)'}`);
   option.value=entry.path;select.append(option);
  }
  select.value=selectedPath;select.addEventListener('change',()=>{selectedPath=select.value;renderMenuFields()});label.append(select);fieldsPanel.append(label);
  const current=studio.state.pageIndex.pages[selectedPath];
  const edited=studio.pageDrafts.get('json/'+selectedPath);
  const menuLabel=control(fieldsPanel,'Menüfelirat',edited?.menuLabel||current?.menuLabel||'',()=>{});
  const row=el('div','cs-vjson-actions');
  button(row,'↑ Feljebb',()=>move(-1));button(row,'↓ Lejjebb',()=>move(1));fieldsPanel.append(row);
  button(fieldsPanel,'Menüfelirat mentése',async()=>{
   try{const result=await studio.stageMenuLabel(selectedPath,menuLabel.value);feedback('A menüfelirat oldaltervezetként mentve. ZIP-export előtt C3 jóváhagyás szükséges. '+result);renderMenuFields();}
   catch(error){feedback(error.message,true);}
  });
  fieldsPanel.append(el('p','cs-vjson-mini','A rejtett oldalak is megmaradnak. A feljebb/lejjebb művelet csak azonos menüszinten mozgat.'));
  previewMenu();
 };
 const move=direction=>{
  const next=moveMenuItem(draftStructure,selectedPath,direction);
  if(!next){feedback('Ezen a menüszinten már nincs tovább mozgatható hely.');return;}
  draftStructure=next;renderMenuFields();feedback('A menüsorrend előnézete megváltozott. A rögzítést külön végezd el.');
 };
 const renderActions=()=>{
  actions.replaceChildren();
  if(section==='menu')button(actions,'Menüsorrend rögzítése',()=>{
   try{studio.stageStructure(draftStructure);feedback('A menüsorrend rögzítve a helyi ZIP-munkapéldányba.');}
   catch(error){feedback(error.message,true);}
  },true);
  else button(actions,'Fejléc/lábléc JSON rögzítése',()=>{
   try{studio.stageShell(draftShell);feedback('Az oldalkeret JSON-módosításai rögzítve a helyi ZIP-munkapéldányba.');}
   catch(error){feedback(error.message,true);}
  },true);
  button(actions,'JSON letöltése',()=>{
   const data=section==='menu'?draftStructure:draftShell;
   const report=section==='menu'?null:validateJsonShell(data,{kind:'site'});
   if(report&&!report.valid){feedback(report.errors.slice(0,3).join(' · '),true);return;}
   downloadBlob(new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}),
    section==='menu'?'structure.json':'site-shell.json');
  });
  button(actions,'Szerkesztés visszaállítása',()=>{
   draftShell=clone(studio.state.shell);draftStructure=clone(studio.state.structure);
   render();feedback('A még nem rögzített mezőváltoztatások elvetve.');
  });
 };
 const render=()=>{
  for(const tab of switcher.children){tab.setAttribute('aria-pressed',String(tab.dataset.section===section));}
  clearTimeout(previewTimer);
  if(section==='menu')renderMenuFields();else renderShellFields();renderActions();
 };
 render();
}
