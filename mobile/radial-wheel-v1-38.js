/** Telefonra tervezett, kizárólag kétszintű, teljes kör alakú navigáció. */
export const PHONE_QUERY='(max-width: 700px), (max-height: 500px) and (max-width: 960px) and (pointer: coarse)';
const icons=['✦','◈','◆','★','▤','✧'];
const shortLabels=new Map([
 ['Hírek és események','Hírek'],['Információk','Infók'],
 ['Történetünk és büszkeségeink','Történet'],
 ['Partnereink és alapítványunk','Partnerek'],
 ['Céljaink és értékeink','Céljaink'],
 ['Tananyagok és segédletek','Tananyagok'],
 ['Mindennapi tudnivalók','Tudnivalók'],
 ['1. osztályos beiratkozás','1. osztály'],
 ['9. évfolyamos felvételi','9. évfolyam'],
 ['Felvételi határidők','Határidők'],
 ['Közösségi szolgálat','Közösségi'],
 ['Digitális kultúra','Digitális'],
 ['Sporteredmények','Eredmények']
]);
export function createPhoneRadial({container,title,description,overview,center,media=matchMedia(PHONE_QUERY),onChoose}){
 const ring=container.querySelector('.cs-phone-wheel-ring');
 let roots=[],childrenOf=()=>[],titleOf=()=>'',hrefOf=()=>'',activeRoot=null;
 function phone(){return media.matches;}
 function draw({focus=false}={}){
  if(!activeRoot||!roots.includes(activeRoot))activeRoot=null;
  const entries=activeRoot?childrenOf(activeRoot):roots;
  const count=entries.length;
  ring.replaceChildren();
  container.dataset.level=activeRoot?'2':'1';
  title.textContent=activeRoot?titleOf(activeRoot):'Hat főmenüpont';
  description.textContent=activeRoot?`${count} almenüpont • érintsd meg a megnyitáshoz`:'Válassz a kör mentén elhelyezkedő témakörök közül';
  overview.hidden=!activeRoot;
  if(activeRoot){overview.href=hrefOf(activeRoot);overview.textContent=titleOf(activeRoot)+' áttekintése →';}
  center.disabled=!activeRoot;
  center.setAttribute('aria-label',activeRoot?'Vissza a hat főmenüponthoz':'Csanádi – hat főmenüpont');
  center.querySelector('.cs-phone-wheel-center-label').textContent=activeRoot?'Vissza':'Főmenü';
  entries.forEach((entry,index)=>{
   const label=titleOf(entry);
   const node=document.createElement(activeRoot?'a':'button');
   node.className='cs-phone-wheel-item';
   if(activeRoot)node.href=hrefOf(entry);else node.type='button';
   node.style.setProperty('--angle',`${index*360/count}deg`);
   node.setAttribute('aria-label',label);
   node.title=label;
   const symbol=document.createElement('span');symbol.className='cs-phone-wheel-item-icon';
   symbol.setAttribute('aria-hidden','true');symbol.textContent=activeRoot?'→':icons[index%icons.length];
   const name=document.createElement('span');name.className='cs-phone-wheel-item-name';
   name.textContent=shortLabels.get(label)||label;
   node.append(symbol,name);
   if(!activeRoot)node.addEventListener('click',()=>{activeRoot=entry;draw({focus:true});});
   else node.addEventListener('click',()=>onChoose?.());
   ring.append(node);
  });
  if(focus)ring.querySelector('.cs-phone-wheel-item')?.focus({preventScroll:true});
 }
 center.addEventListener('click',()=>{if(activeRoot){activeRoot=null;draw({focus:true});}});
 function setCatalog(nextRoots,helpers){
  const previous=activeRoot?hrefOf(activeRoot):null;
  roots=nextRoots;
  childrenOf=helpers.childrenOf;titleOf=helpers.titleOf;hrefOf=helpers.hrefOf;
  activeRoot=roots.find(item=>hrefOf(item)===previous)||null;
  draw();
 }
 function reset(){activeRoot=null;draw();}
 function back(){if(!phone()||!activeRoot)return false;activeRoot=null;draw({focus:true});return true;}
 return {phone,setCatalog,reset,back,focus:()=>ring.querySelector('.cs-phone-wheel-item')?.focus({preventScroll:true}),getLevel:()=>activeRoot?2:1};
}
