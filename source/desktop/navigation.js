/** Asztali megamenü: kizárólag a központi katalógusból épül fel. */
export function renderDesktopTree(container,roots,{dom,navLink,titleOf,hrefOf,pageChildren,currentRoute}){
 container.replaceChildren();
 for(const root of roots){
  const rootRoute=hrefOf(root);
  const active=currentRoute===rootRoute||currentRoute?.startsWith(rootRoute+'/');
  const children=pageChildren(root);
  const group=dom('details',{class:'nav-mega-root'+(active?' active':'')});
  const summary=dom('summary',{class:'nav-mega-button'});
  summary.append(dom('span',{},titleOf(root)),dom('span',{class:'nav-mega-caret','aria-hidden':'true'},'⌄'));
  group.append(summary);
  const pane=dom('div',{class:'nav-mega-panel'});
  const intro=dom('div',{class:'nav-mega-intro'});
  intro.append(dom('strong',{},root.page.title),dom('p',{},root.page.summary||''));
  const overview=navLink(root);
  overview.className='nav-mega-overview';overview.textContent='Témakör áttekintése →';
  intro.append(overview);pane.append(intro);
  const columns=dom('div',{class:'nav-mega-columns'});
  for(const child of children){
   const column=dom('div',{class:'nav-mega-column'});
   const link=navLink(child);link.className='nav-mega-heading';column.append(link);
   columns.append(column);
  }
  if(children.length)pane.append(columns);
  group.append(pane);
  group.addEventListener('toggle',()=>{
   if(group.open)for(const other of container.querySelectorAll('.nav-mega-root'))if(other!==group)other.open=false;
  });
  pane.addEventListener('click',event=>{if(event.target.closest('a[href]'))group.open=false;});
  container.append(group);
 }
}
