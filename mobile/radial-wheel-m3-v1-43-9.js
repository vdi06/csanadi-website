/** M3/D: háromszintű, telefonon önálló körmenü / kompakt választó. */
export const PHONE_QUERY='(max-width: 768px), (max-height: 500px) and (max-width: 960px) and (pointer: coarse)';

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
 const stage=container.querySelector('.cs-phone-wheel-stage');
 const ring=container.querySelector('.cs-phone-wheel-ring');
 const centerLabel=center.querySelector('.cs-phone-wheel-center-label');
 const drawer=document.createElement('section');
 drawer.className='cs-m3-level';
 drawer.setAttribute('aria-label','Menü almenüpontjai');
 const backButton=document.createElement('button');
 backButton.type='button';backButton.className='cs-m3-back';backButton.textContent='← Vissza';
 const crumbs=document.createElement('p');crumbs.className='cs-m3-crumbs';
 const levelTitle=document.createElement('h4');levelTitle.className='cs-m3-title';
 const levelInfo=document.createElement('p');levelInfo.className='cs-m3-info';
 const levelLinks=document.createElement('nav');levelLinks.className='cs-m3-links';
 levelLinks.setAttribute('aria-label','Almenüpontok');
 drawer.append(backButton,crumbs,levelTitle,levelInfo,levelLinks);
 container.append(drawer);

 let roots=[],childrenOf=()=>[],titleOf=()=>'',hrefOf=()=>'',trail=[];
 function phone(){return media.matches;}
 function children(node){return childrenOf(node).filter(entry=>entry&&titleOf(entry)&&hrefOf(entry));}
 function goDeeper(entry){if(trail.length>=2)return;trail.push(entry);draw({focus:true});}
 function back(){if(!phone()||!trail.length)return false;trail.pop();draw({focus:true});return true;}
 backButton.addEventListener('click',back);
 center.addEventListener('click',back);

 function draw({focus=false}={}){
  if(trail.length&&(!roots.includes(trail[0])||trail.slice(1).some((node,index)=>!children(trail[index]).includes(node))))trail=[];
  const selected=trail.at(-1)||null;
  const level=trail.length+1;
  container.dataset.level=String(level);
  container.dataset.presentation=matchMedia('(max-width: 399px)').matches?'compact':'radial';
  const entries=selected?children(selected):roots;
  title.textContent=selected?titleOf(selected):'Válassz témakört';
  description.textContent=selected?'A kiválasztott témakör oldalai és további szintjei':'Hat fő témakör · érintsd meg a folytatáshoz';
  stage.hidden=Boolean(selected);
  drawer.hidden=!selected;
  overview.hidden=true;
  center.disabled=true;
  centerLabel.textContent='Főmenü';
  ring.replaceChildren();levelLinks.replaceChildren();

  if(!selected){
   roots.forEach((entry,index)=>{
    const node=document.createElement('button');node.type='button';
    node.className='cs-phone-wheel-item';node.style.setProperty('--angle',`${index*360/roots.length}deg`);
    node.setAttribute('aria-label',titleOf(entry));
    const icon=document.createElement('span');icon.className='cs-phone-wheel-item-icon';
    icon.setAttribute('aria-hidden','true');icon.textContent=icons[index%icons.length];
    const name=document.createElement('span');name.className='cs-phone-wheel-item-name';
    name.textContent=shortLabels.get(titleOf(entry))||titleOf(entry);
    node.append(icon,name);node.addEventListener('click',()=>goDeeper(entry));ring.append(node);
   });
   if(focus)ring.querySelector('button')?.focus({preventScroll:true});
   return;
  }

  crumbs.textContent=['Főmenü',...trail.map(titleOf)].join('  ›  ');
  levelTitle.textContent=titleOf(selected);
  levelInfo.textContent=`${entries.length} almenüpont · ${level}. szint / 3`;
  const self=document.createElement('a');self.className='cs-m3-overview';
  self.href=hrefOf(selected);self.textContent=`${titleOf(selected)} – oldal megnyitása`;
  self.addEventListener('click',()=>onChoose?.());levelLinks.append(self);
  entries.forEach(entry=>{
   const descendants=level<3?children(entry):[];
   if(descendants.length){
    const wrapper=document.createElement('div');wrapper.className='cs-m3-nested';
    const deeper=document.createElement('button');deeper.type='button';
    deeper.className='cs-m3-choice';
    deeper.setAttribute('aria-label',`${titleOf(entry)} – ${descendants.length} további almenüpont`);
    const label=document.createElement('span');label.textContent=titleOf(entry);
    const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');arrow.textContent='›';
    deeper.append(label,arrow);deeper.addEventListener('click',()=>goDeeper(entry));
    const direct=document.createElement('a');direct.className='cs-m3-direct';
    direct.href=hrefOf(entry);direct.textContent='Oldal megnyitása';
    direct.setAttribute('aria-label',`${titleOf(entry)} – oldal megnyitása`);
    direct.addEventListener('click',()=>onChoose?.());
    wrapper.append(deeper,direct);levelLinks.append(wrapper);
   }else{
    const link=document.createElement('a');link.className='cs-m3-choice';
    link.href=hrefOf(entry);
    const label=document.createElement('span');label.textContent=titleOf(entry);
    const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';
    link.append(label,arrow);link.addEventListener('click',()=>onChoose?.());levelLinks.append(link);
   }
  });
  if(focus)backButton.focus({preventScroll:true});
 }
 function setCatalog(nextRoots,helpers){
  const previous=trail.map(node=>hrefOf(node));
  roots=nextRoots.filter(entry=>entry&&helpers.titleOf(entry)&&helpers.hrefOf(entry));
  childrenOf=helpers.childrenOf;titleOf=helpers.titleOf;hrefOf=helpers.hrefOf;
  trail=[];
  let siblings=roots;
  for(const route of previous){const match=siblings.find(node=>hrefOf(node)===route);if(!match)break;trail.push(match);siblings=children(match);}
  draw();
 }
 function reset(){trail=[];draw();}
 function focus(){(trail.length?backButton:ring.querySelector('button'))?.focus({preventScroll:true});}
 return {phone,setCatalog,reset,back,focus,getLevel:()=>trail.length+1};
}
