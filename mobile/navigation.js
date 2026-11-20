/** Mobil navigáció: egyetlen közös faépítő a korábbi és az új harmonikamenühöz. */
export function renderMobileTree(container,roots,{dom,navLink,titleOf,hrefOf,pageChildren,currentRoute},variant='header'){
 const previousRoute=container.getAttribute('data-cs-navigation-route');
 const expanded=new Map([...container.querySelectorAll('details[data-nav-key]')].map(item=>[item.getAttribute('data-nav-key'),item.open]));
 container.replaceChildren();
 const overlay=variant==='overlay';
 for(const root of roots){
  const rootRoute=hrefOf(root);
  const active=currentRoute===rootRoute||currentRoute?.startsWith(rootRoute+'/');
  const group=dom('details',{class:overlay?'csn18-mobile-list-root':'mobile-root'});
  group.setAttribute('data-nav-key','root:'+rootRoute);
  group.open=!!active||(previousRoute===currentRoute&&expanded.get(group.getAttribute('data-nav-key'))===true);
  group.append(dom('summary',{},titleOf(root)));
  const contents=overlay?dom('div',{class:'csn18-mobile-list-children'}):group;
  const overview=navLink(root);
  overview.className=overlay?'csn18-mobile-list-overview':'mobile-overview';
  overview.textContent='Témakör áttekintése';contents.append(overview);
  for(const child of pageChildren(root))contents.append(navLink(child));
  if(overlay)group.append(contents);
  group.addEventListener('toggle',()=>{
   if(group.open)for(const other of container.querySelectorAll('details')){
    if(other!==group&&(other.classList.contains('mobile-root')||other.classList.contains('csn18-mobile-list-root')))other.open=false;
   }
  });
  container.append(group);
 }
 for(const anchor of container.querySelectorAll('a')){
  if(anchor.getAttribute('href')===currentRoute){
   anchor.setAttribute('aria-current','page');
   if(!overlay)anchor.classList.add('active');
  }
 }
 container.setAttribute('data-cs-navigation-route',currentRoute||'');
}

