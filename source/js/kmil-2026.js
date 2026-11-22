 
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
 // Valódi Bootstrap Tabs: külön tartalompanel, natív tabváltás és ARIA-kezelés.
 const controls=e('div','kmil-learning-tabs nav nav-pills');controls.id='kmil-learning-tabs';controls.setAttribute('role','tablist');controls.setAttribute('aria-label','Oktatási témakörök');
 const content=e('div','tab-content kmil-learning-panels');
 for(const [index,[topic,label]] of Object.entries(titles).entries()){
  const first=index===0,tabId='kmil-tab-'+topic,panelId='kmil-panel-'+topic;
  const b=e('button','kmil-learning-tab nav-link'+(first?' active':''),label);b.type='button';b.id=tabId;
  b.setAttribute('role','tab');b.setAttribute('data-bs-toggle','pill');b.setAttribute('data-bs-target','#'+panelId);
  b.setAttribute('aria-controls',panelId);b.setAttribute('aria-selected',String(first));controls.append(b);
  const panel=e('section','tab-pane fade'+(first?' show active':''));panel.id=panelId;
  panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tabId);panel.tabIndex=0;
  const grid=e('div','kmil-learning-grid');
  for(const [title,href,summary] of groups[topic]){const card=e('a','kmil-topic-card card');card.href=href;card.append(e('strong','',title),e('small','',summary),e('span','','Oldal megnyitása'));grid.append(card);}
  panel.append(grid);content.append(panel);
 }
 root.append(controls,content);return root;
}
export function enhanceHomeInterests(canvas){
 const filters=e('section','kmil-interest kmil-interest-hub');filters.setAttribute('aria-label','Témaválasztó központ');
 const intro=e('div','kmil-hub-intro');intro.append(e('span','kmil-hub-eyebrow','A TE CSANÁDID'),e('h2','','Indulj arra, ami érdekel!'),e('p','','Három világ, egy iskola. Válassz egy irányt: a hozzá tartozó tartalmak előre kerülnek, a többi továbbra is elérhető.'));
 const reset=e('button','kmil-hub-reset','Minden témakör megjelenítése');reset.type='button';intro.append(reset);filters.append(intro);
 const controls=e('div','kmil-interest-controls kmil-hub-cards');controls.setAttribute('role','group');controls.setAttribute('aria-label','Válassz témát');filters.append(controls);
 const preview=e('div','kmil-interest-preview');preview.setAttribute('role','status');preview.setAttribute('aria-live','polite');filters.append(preview);
 const options=[
  ['sport','SPORT','Sport','Versenyek, sportágak, eredmények és sporthírek','01','⚡'],
  ['study','TANULÁS','Tanulás','Felvételi, képzések, tanév és tanulási lehetőségek','02','✦'],
  ['community','KÖZÖSSÉG','Iskolai élet','Programok, közös pillanatok és az iskola mindennapjai','03','◈']
 ];
 const buttons=[];
 const folds=[...canvas.querySelectorAll(':scope > details.home-j-fold')];
 const initialOrder=new Map(folds.map((node,i)=>[node,i]));
 const groupName=node=>node.querySelector('summary strong')?.textContent||'';
 const suggestions={
  all:[['Felvételi','#/oktatas/felveteli'],['Sportágak','#/sport/sportagak'],['Iskolai hírek','#/hirek-es-esemenyek/hirek']],
  sport:[['Sportágak','#/sport/sportagak'],['Sporteredmények','#/sport'],['Sporthírek','#/hirek-es-esemenyek/hirek/sporthirek']],
  study:[['Képzéseink','#/oktatas/kepzeseink'],['Felvételi','#/oktatas/felveteli'],['Tanév és vizsgák','#/oktatas/tanevek/aktualis-tanev']],
  community:[['Iskolánk','#/iskolank'],['Ökoiskola','#/iskolank/oko-iskola'],['Események','#/hirek-es-esemenyek/esemenynaptar']]
 };
 const pick=(id)=>{
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.interest===id)));
  reset.setAttribute('aria-pressed',String(id==='all'));
  let priority;
  if(id==='sport')priority=['Sporteredmények és statisztikák','Sport és iskolai élet – képekben'];
  else if(id==='study')priority=['Fedezd fel az iskolát','Napi központ és interaktív információk'];
  else if(id==='community')priority=['Sport és iskolai élet – képekben','Fedezd fel az iskolát'];
  else priority=[];
  const ordered=[...folds].sort((a,b)=>{
   const ix=n=>{const i=priority.indexOf(groupName(n));return i<0?100+initialOrder.get(n):i;};return ix(a)-ix(b);
  });
  for(const node of ordered)canvas.append(node);
  if(id!=='all'){for(const node of folds)if(!node.hidden)node.open=priority[0]===groupName(node);}
  preview.replaceChildren();const head=e('div','kmil-hub-result-heading');head.append(e('span','kmil-hub-result-kicker',id==='all'?'FELFEDEZÉS':'NEKED AJÁNLJUK'),e('strong','',id==='all'?'Népszerű útvonalak':'Fedezd fel: '+titlesForInterest[id]));preview.append(head);
  const list=e('div','kmil-interest-links');for(const [label,route] of suggestions[id]){const a=e('a','',label+' →');a.href=route;list.append(a);}preview.append(list);
 };
 const titlesForInterest={sport:'Sport',study:'Tanulás',community:'Iskolai élet'};
 for(const [id,kicker,label,description,number,symbol] of options){const b=e('button','kmil-interest-button kmil-hub-card',undefined);b.type='button';b.dataset.interest=id;b.setAttribute('aria-pressed','false');b.append(e('span','kmil-hub-card-number',number),e('span','kmil-hub-card-symbol',symbol),e('span','kmil-hub-card-kicker',kicker),e('strong','',label),e('span','kmil-hub-card-description',description),e('span','kmil-hub-card-action','Felfedezem →'));b.addEventListener('click',()=>pick(id));controls.append(b);buttons.push(b);}
 reset.addEventListener('click',()=>pick('all'));
 const nav=canvas.querySelector('.home-j-navrail-unit');if(nav)nav.insertAdjacentElement('afterend',filters);else canvas.prepend(filters);
 pick('all');return filters;
}
