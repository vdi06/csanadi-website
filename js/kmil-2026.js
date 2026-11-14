/* K+M+I+L. DOM only: content is static, no tracking/cookies/sensitive storage. */
const e=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
const groups={
 felveteli:[
  ['Első évfolyam','#/oktatas/felveteli/elso-evfolyam','Tájékozódás az általános iskolai beiratkozáshoz'],
  ['Kilencedik évfolyam','#/oktatas/felveteli/kilencedik-evfolyam','Gimnáziumi jelentkezés'],
  ['Nyílt napok','#/oktatas/felveteli/nyilt-napok','Az intézmény közzétett tájékoztatói'],
  ['Felvételi határidők','#/oktatas/felveteli/felveteli-hataridok','Ellenőrizhető aktuális információk']],
 kepzes:[
  ['Általános iskolai képzés','#/oktatas/kepzeseink/altalanos-iskola','Iskolai alapozás és tanulás'],
  ['Gimnáziumi képzés','#/oktatas/kepzeseink/gimnazium','Középiskolai tanulmányok'],
  ['Sportiskolai nevelés','#/oktatas/kepzeseink/sportiskolai-neveles','Sport és tanulás összehangolása'],
  ['Digitális kultúra','#/oktatas/digitalis-kultura','Digitális tanulási tartalmak']],
 tanev:[
  ['Aktuális tanév','#/oktatas/tanevek/aktualis-tanev','Tanévre vonatkozó információk'],
  ['Korábbi tanévek','#/oktatas/tanevek/korabbi-tanevek','Korábbi tanévek anyagai'],
  ['Érettségi','#/oktatas/vizsgak/erettsegi','Vizsgával kapcsolatos tájékoztatás'],
  ['Osztályozóvizsgák','#/oktatas/vizsgak/osztalyozo-vizsgak','Szabályok és tudnivalók']],
 forrasok:[
  ['Tananyagok és jegyzetek','#/oktatas/tananyagok-es-jegyzetek','Tanulási segédletek'],
  ['Könyvtár','#/oktatas/konyvtar','Könyvtári lehetőségek'],
  ['Dokumentumtár','#/informaciok/dokumentumtar','Letölthető dokumentumok'],
  ['Kapcsolat','#/kapcsolat','Elérhetőségek']]
};
const titles={felveteli:'Felvételi',kepzes:'Képzéseink',tanev:'Tanév és vizsgák',forrasok:'Tanulási segítség'};
export function learningNavigator(){
 const root=e('section','kmil-learning');root.setAttribute('aria-label','Oktatási és felvételi útvonalak');
 root.append(e('h2','','Oktatás és felvételi – gyors útvonalak'),e('p','','Válassz egy témát, majd nyisd meg a hozzá kapcsolódó oldalt. A hivatalos dátumok mindig a megfelelő tájékoztató oldalakon szerepelnek.'));
 const controls=e('div','kmil-learning-tabs'),grid=e('div','kmil-learning-grid');grid.setAttribute('aria-live','polite');
 const buttons=[];
 const render=(selected)=>{grid.replaceChildren();buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.topic===selected)));
  for(const [title,href,summary] of groups[selected]){const card=e('a','kmil-topic-card');card.href=href;card.append(e('strong','',title),e('small','',summary),e('span','','Oldal megnyitása ↗'));grid.append(card);}
 };
 for(const [topic,label] of Object.entries(titles)){const b=e('button','kmil-learning-tab',label);b.type='button';b.dataset.topic=topic;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>render(topic));buttons.push(b);controls.append(b);}
 root.append(controls,grid);render('felveteli');return root;
}
export function enhanceHomeInterests(canvas){
 const filters=e('section','kmil-interest');filters.append(e('h2','','Melyik téma érdekel?'),e('p','','A kiválasztott témát előre rendezzük és kinyitjuk. A többi tartalom továbbra is elérhető marad.'));
 const controls=e('div','kmil-interest-controls');filters.append(controls);
 const options=[['all','Mindegyik'],['sport','Sport'],['study','Tanulás'],['community','Iskolai élet']];
 const buttons=[];
 const folds=[...canvas.querySelectorAll(':scope > details.home-j-fold')];
 const initialOrder=new Map(folds.map((node,i)=>[node,i]));
 const groupName=node=>node.querySelector('summary strong')?.textContent||'';
 const pick=(id)=>{
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.interest===id)));
  let priority;
  if(id==='sport')priority=['Sporteredmények és statisztikák','Sport és iskolai élet – képekben'];
  else if(id==='study')priority=['Fedezd fel az iskolát','Napi központ és interaktív információk'];
  else if(id==='community')priority=['Sport és iskolai élet – képekben','Fedezd fel az iskolát'];
  else priority=[];
  const ordered=[...folds].sort((a,b)=>{
   const ix=n=>{const i=priority.indexOf(groupName(n));return i<0?100+initialOrder.get(n):i;};return ix(a)-ix(b);
  });
  for(const node of ordered)canvas.append(node);
  // The user controls expanding/collapsing. A topic preset only opens the first relevant group.
  if(id!=='all'){for(const node of folds)node.open=priority[0]===groupName(node);}
 };
 for(const [id,label] of options){const b=e('button','kmil-interest-button',label);b.type='button';b.dataset.interest=id;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>pick(id));controls.append(b);buttons.push(b);}
 const nav=canvas.querySelector('.home-j-navrail-unit');if(nav)nav.insertAdjacentElement('afterend',filters);else canvas.prepend(filters);
 buttons[0].setAttribute('aria-pressed','true');return filters;
}
