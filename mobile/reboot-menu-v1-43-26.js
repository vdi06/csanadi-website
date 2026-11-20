/** Nulláról készült mobilos háromszintű menü; a desktop mega-/iránytűmenü nem módosul. */
// A teljes mobil UI kizárólag 768 px-ig van jelen, így a menü is pontosan
// ezt a határt használja. 769–960 px-es fekvő tablet nem kaphat fél menüt.
export const PHONE_QUERY='(max-width: 768px)';
export function mobileViewportMode(width,height){
 const w=Number(width),h=Number(height);
 if(!Number.isFinite(w)||w>768)return 'desktop';
 // M17.2: a közvetlen oldallinkekkel együtt a körkártyák magasabbak.
 // Rövid képernyőn rácsos nézetre váltunk a pozíciók ütközése helyett.
 return w>=420&&Number.isFinite(h)&&h>=760?'circle':'grid';
}
const make=(tag,cls='',label='')=>{
 const n=document.createElement(tag);if(cls)n.className=cls;
 if(label)n.textContent=label;return n;
};
const safeHref=href=>typeof href==='string'&&/^#\/[a-z0-9/\-]*$/i.test(href)?href:'#/';

export function createPhoneRadial({container,title,description,overview,center,
 media=matchMedia(PHONE_QUERY),onChoose}={}){
 if(!container)return null;
 // Az alap HTML a desktop menüvel közös. A telefonos lista a saját DOM-ját építi.
 const screen=make('section','cs-mb-menu-screen');
 screen.setAttribute('aria-label','Mobilos, háromszintű iskolai navigáció');
 const back=make('button','cs-mb-menu-back','← Visszalépés');back.type='button';
 const crumbs=make('p','cs-mb-menu-crumbs');
 const chosen=make('a','cs-mb-menu-overview','A témakör oldalának megnyitása');
 const grid=make('nav','cs-mb-menu-grid');grid.setAttribute('aria-label','Menüpontok');
 const centerpiece=make('div','cs-mb-menu-center');
 const crest=make('img');crest.src='assets/media/logo/csanadi-crest-512.webp';crest.alt='';
 const centerText=make('span','','CSANÁDI');centerpiece.append(crest,centerText);
 const orbit=make('div','cs-mb-menu-orbit');orbit.append(grid,centerpiece);
 screen.append(back,crumbs,chosen,orbit);container.append(screen);
 if(overview)overview.hidden=true;
 if(center)center.hidden=true;

 let roots=[],getChildren=()=>[],getTitle=()=>'',getHref=()=>'',trail=[];
 const current=()=>trail.at(-1)||null;
 const children=item=>getChildren(item).filter(node=>node&&getTitle(node)&&getHref(node));
 const isPhone=()=>Boolean(media.matches);
 const makeLink=(item,cls)=>{
  const a=make('a',cls,getTitle(item)),route=safeHref(getHref(item));
  a.href=route;
  a.dataset.csMbRoute=route;
  // A böngésző a.href tulajdonsága abszolút URL-t ad vissza; a route-ot
  // a hash sztringhez kell hasonlítani, hogy az aktív oldal jelölése működjön.
  if(route===(window.location?.hash||'#/'))a.setAttribute('aria-current','page');
  a.addEventListener('click',()=>onChoose?.());return a;
 };

 function render({focus=false,focusRoute='',focusRole='main'}={}){
  const selected=current(),level=trail.length+1;
  container.dataset.level=String(level);
  const width=Number(window.innerWidth),height=Number(window.innerHeight);
  const presentation=mobileViewportMode(width,height);
  container.dataset.presentation=presentation;
  orbit.dataset.level=String(level);
  const group=selected?children(selected):roots;
  title.textContent=selected?getTitle(selected):'Fedezd fel a Csanádit';
  description.textContent=level===1?'Hat témakör, egy közösség.':
   level===2?'Válassz az almenüpontokból.':'Válaszd ki a keresett oldalt.';
  back.hidden=level===1;
  crumbs.hidden=level===1;
  crumbs.textContent=['Főmenü',...trail.map(getTitle)].join(' / ');
  chosen.hidden=level===1;
  if(selected){chosen.href=safeHref(getHref(selected));
   chosen.textContent=getTitle(selected)+' – áttekintés';
   if(safeHref(getHref(selected))===(window.location?.hash||'#/'))
    chosen.setAttribute('aria-current','page');
   else chosen.removeAttribute('aria-current');}
  grid.replaceChildren();
  grid.dataset.level=String(level);
  centerpiece.hidden=level!==1;
  for(const [i,node] of group.entries()){
   const descendants=level<3?children(node):[];
   const card=make('div','cs-mb-menu-card');
   card.style.setProperty('--cs-mb-position',String(i));
   const number=make('span','cs-mb-menu-card-number',String(i+1).padStart(2,'0'));
   if(descendants.length){
    const btn=make('button','cs-mb-menu-card-main',getTitle(node));btn.type='button';
    btn.dataset.csMbRoute=safeHref(getHref(node));
    btn.setAttribute('aria-label',getTitle(node)+', '+descendants.length+' további menüpont');
    btn.append(number);
    btn.addEventListener('click',()=>{trail.push(node);render({focus:true});});
    card.append(btn);
    const direct=makeLink(node,'cs-mb-menu-card-direct');
    direct.textContent='Oldal megnyitása';card.append(direct);
   }else{
    const link=makeLink(node,'cs-mb-menu-card-main');
    link.dataset.csMbRoute=safeHref(getHref(node));link.append(number);card.append(link);
   }
   grid.append(card);
  }
  if(!group.length)grid.append(make('p','cs-mb-menu-empty','Nincs további menüpont.'));
  if(focus){
   // A korábban legörgetett harmadik szint helyett mindig a frissen
   // megnyílt szint tetején legyen a visszalépés és az első menüpont.
   container.scrollTop=0;
   const prior=focusRoute?[...grid.children].flatMap(card=>[...card.children])
    .find(item=>item?.dataset?.csMbRoute===focusRoute&&
     ((focusRole==='direct')===Boolean(item.className?.includes('cs-mb-menu-card-direct')))):null;
   (prior||(level>1?back:grid.querySelector('button,a[href]')))?.focus({preventScroll:true});
  }
 }
 function backOne(){if(!isPhone()||!trail.length)return false;
  const previous=trail.pop();render({focus:true,focusRoute:safeHref(getHref(previous))});return true;}
 back.addEventListener('click',backOne);
 screen.addEventListener('keydown',event=>{
  if(!isPhone()||event.altKey||event.ctrlKey||event.metaKey)return;
  // M15.2: a lapozás a frissen renderelt DOM-ban is determinisztikus;
  // az ArrowLeft továbbra is az előző menüszintet jelenti.
  if(['ArrowUp','ArrowDown','Home','End'].includes(event.key)){
   const nodes=[...grid.children].flatMap(card=>[...card.children])
    .filter(node=>['button','a'].includes(node.tagName?.toLowerCase?.()));
   const index=nodes.indexOf(event.target);
   if(index>=0&&nodes.length){
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?nodes.length-1:
     (index+(event.key==='ArrowDown'?1:-1)+nodes.length)%nodes.length;
    nodes[next]?.focus({preventScroll:true});return;
   }
  }
  if(!trail.length)return;
  if(event.key==='ArrowLeft'||(event.key==='Backspace'&&!event.target.closest?.('input,textarea,[contenteditable]'))){
   event.preventDefault();backOne();
  }
 });
 chosen.addEventListener('click',()=>onChoose?.());
 const activeItem=()=>[...grid.children].flatMap(card=>[...card.children])
  .find(node=>node===document.activeElement);
 const focusSnapshot=()=>{const node=activeItem();return {
  route:node?.dataset?.csMbRoute||'',
  role:node?.className?.includes('cs-mb-menu-card-direct')?'direct':'main',
  back:document.activeElement===back};};
 const renderKeepingFocus=()=>{const snapshot=focusSnapshot();
  render({focus:Boolean(snapshot.route||snapshot.back),focusRoute:snapshot.route,
   focusRole:snapshot.role});};
 const resize=()=>{if(isPhone())renderKeepingFocus();};
 window.addEventListener('resize',resize,{passive:true});
 media.addEventListener?.('change',resize);
 function setCatalog(nextRoots,{childrenOf,titleOf,hrefOf}){
  const {route:focusRoute,role:focusRole,back:focusBack}=focusSnapshot();
  const previous=trail.map(node=>getHref(node));
  roots=Array.isArray(nextRoots)?nextRoots.filter(Boolean):[];
  getChildren=childrenOf;getTitle=titleOf;getHref=hrefOf;
  trail=[];
  let collection=roots;
  for(const href of previous){
   const found=collection.find(node=>getHref(node)===href);if(!found)break;
   trail.push(found);collection=children(found);
  }
  render({focus:Boolean(focusRoute||focusBack),focusRoute,focusRole});
 }
 function reset(){trail=[];render();}
 function focus(){(trail.length?back:grid.querySelector('button,a[href]'))?.focus({preventScroll:true});}
 return {phone:isPhone,setCatalog,reset,back:backOne,focus,getLevel:()=>trail.length+1};
}

/** A közös app számára megmaradó, de a friss mobil menütől független rejtett fa. */
export function renderMobileTree(container,roots,{dom,navLink,titleOf,hrefOf,pageChildren,currentRoute}){
 if(!container)return;
 const fragment=document.createDocumentFragment();
 for(const item of roots){
  const group=dom('details',{});
  group.open=currentRoute===hrefOf(item)||currentRoute?.startsWith(hrefOf(item)+'/');
  group.append(dom('summary',{},titleOf(item)));
  group.append(navLink(item));
  for(const child of pageChildren(item))group.append(navLink(child));
  fragment.append(group);
 }
 container.replaceChildren(fragment);
}
