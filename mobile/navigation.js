/** Mobil navigáció: egyetlen közös faépítő a korábbi és az új harmonikamenühöz. */
export function renderMobileTree(container,roots,{dom,navLink,titleOf,hrefOf,pageChildren,currentRoute},variant='header'){
 container.replaceChildren();
 const overlay=variant==='overlay';
 for(const root of roots){
  const rootRoute=hrefOf(root);
  const active=currentRoute===rootRoute||currentRoute?.startsWith(rootRoute+'/');
  const group=dom('details',{class:overlay?'csn18-mobile-list-root':'mobile-root'});
  group.open=!!active;
  group.append(dom('summary',{},titleOf(root)));
  const contents=overlay?dom('div',{class:'csn18-mobile-list-children'}):group;
  const overview=navLink(root);
  overview.className=overlay?'csn18-mobile-list-overview':'mobile-overview';
  overview.textContent='Témakör áttekintése';contents.append(overview);
  for(const child of pageChildren(root)){
   const third=pageChildren(child);
   if(third.length){
    const nested=dom('details',{class:overlay?'csn18-mobile-list-nested':'mobile-sub'});
    nested.open=!!(currentRoute&&(currentRoute===hrefOf(child)||currentRoute.startsWith(hrefOf(child)+'/')));
    nested.append(dom('summary',{},titleOf(child)));
    const childOverview=navLink(child);
    if(overlay)childOverview.className='csn18-mobile-list-overview';
    childOverview.textContent=overlay?'Áttekintés':'Áttekintés: '+titleOf(child);
    nested.append(childOverview);
    for(const leaf of third)nested.append(navLink(leaf));
    contents.append(nested);
   }else contents.append(navLink(child));
  }
  if(overlay)group.append(contents);
  else group.addEventListener('toggle',()=>{
   if(group.open)for(const other of container.querySelectorAll('details.mobile-root'))if(other!==group)other.open=false;
  });
  container.append(group);
 }
 for(const anchor of container.querySelectorAll('a')){
  if(anchor.getAttribute('href')===currentRoute){
   if(overlay)anchor.setAttribute('aria-current','page');
   else anchor.classList.add('active');
  }
 }
}

/** A nézetváltó állapota a készüléken megmarad, központi JSON-alapbeállítással. */
export function createMobileMenuSwitcher({overlay,modeBar,list,orbitButton,listButton,defaultMode,renderList,orbitFocus}){
 let mode=null;
 const viewport=matchMedia('(max-width: 768px)');
 function preference(){
  try{const saved=localStorage.getItem('csanadi-mobile-menu-mode');if(saved==='orbit'||saved==='list')return saved;}catch{}
  return defaultMode();
 }
 function apply(next,focus=false){
  mode=next==='list'?'list':'orbit';
  modeBar.hidden=!viewport.matches;
  const showList=viewport.matches&&mode==='list';
  overlay.classList.toggle('csn18-mode-list',showList);
  list.hidden=!showList;
  orbitButton.setAttribute('aria-pressed',String(!showList));
  listButton.setAttribute('aria-pressed',String(showList));
  if(showList)renderList();
  if(focus)(showList?list.querySelector('summary'):orbitFocus())?.focus();
 }
 for(const [button,value] of [[orbitButton,'orbit'],[listButton,'list']])button.addEventListener('click',()=>{
  try{localStorage.setItem('csanadi-mobile-menu-mode',value);}catch{}
  apply(value,true);
 });
 viewport.addEventListener?.('change',()=>{if(!overlay.hidden)apply(mode||preference());});
 return {apply,preference,getMode:()=>mode};
}
