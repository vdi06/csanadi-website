import {element as el} from '../shared/js/dom.js?v=2.64';
import {checkedAdmissions,admissionMilestones,milestoneStatus,statusLabel,admissionDateLabel,nextAdmissionMilestone,budapestToday} from '../shared/js/admission-data.js?v=2.64';
const href=(id)=>`#/oldal/${id}`;
const link=(name,id)=>el('a',{className:'admission-mobile-link',text:name,attributes:{href:href(id)}});
export function createMobileAdmissionLinks(config){
  checkedAdmissions(config);
  return el('nav',{className:'mobile-admission-shortcuts',attributes:{'aria-label':'Felvételi további oldalak'}},
    link('Áttekintés','admission-guide'),link('Határidők','admission-deadlines'),
    link('1. osztály','admission-primary'),link('9. évfolyam','admission-secondary'),link('Iratok','admission-documents'));
}
/** Önálló mobilos, kártyás és lenyitható felvételi felület, nem asztali rács összenyomása. */
export function createMobileAdmissions(config,pageId){
  const data=checkedAdmissions(config);
  let program=pageId==='admission-primary'?'primary':pageId==='admission-secondary'?'secondary':'all';
  let mode='upcoming',term='';
  const root=el('section',{className:'admission-center mobile-admission-center',attributes:{'aria-label':'Felvételi központ telefonon'}});
  const programSelect=el('select',{className:'mobile-admission-select',attributes:{'aria-label':'Felvételi eljárás'}},
    ...[['all','1. és 9. évfolyam'],...data.programs.map(p=>[p.id,p.label])].map(([v,l])=>el('option',{text:l,attributes:{value:v}})));
  programSelect.value=program;
  const modeToggle=el('div',{className:'mobile-admission-modes',attributes:{role:'group','aria-label':'Határidők szűrése'}},
    ...[['upcoming','Közelgők'],['all','Mind']].map(([v,l])=>el('button',{text:l,attributes:{type:'button','data-mode':v,'aria-pressed':String(v===mode)}})));
  const search=el('input',{className:'mobile-admission-search',attributes:{type:'search','aria-label':'Határidő keresése',placeholder:'Keress a határidőkben…'}});
  const next=el('div',{className:'mobile-admission-next',attributes:{'aria-live':'polite'}});
  const count=el('p',{className:'mobile-admission-count',attributes:{role:'status','aria-live':'polite'}});
  const list=el('div',{className:'mobile-admission-events'});
  const steps=el('div',{className:'mobile-admission-steps'});
  programSelect.addEventListener('change',()=>{program=programSelect.value;render();});
  modeToggle.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;render();}));
  search.addEventListener('input',()=>{term=search.value;renderEvents();});
  function renderEvents(){
    const today=budapestToday();
    const events=admissionMilestones(config,{program,status:mode,query:term,today});
    count.textContent=`${events.length} időpont · ${today}`;
    list.replaceChildren(...events.map(m=>{
      const status=milestoneStatus(m,today);
      return el('details',{className:`mobile-admission-event state-${status}`},
        el('summary',{},el('time',{className:'mobile-admission-date',text:admissionDateLabel(m),attributes:{dateTime:m.start}}),
          el('strong',{text:m.title}),el('span',{className:`admission-status state-${status}`,text:statusLabel[status]})),
        el('div',{className:'mobile-admission-details'},el('p',{text:m.detail}),
          el('p',{text:`Eljárás: ${data.programs.find(p=>p.id===m.program).label} · Forrás: országos rendelet.`}),
          link('Kapcsolódó részletek',m.link)));
    }));
    if(!events.length)list.append(el('p',{className:'admission-empty',text:'Nincs ilyen határidő. Válts szűrőt vagy módosítsd a keresést.'}));
  }
  function render(){
    modeToggle.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
    const upcoming=nextAdmissionMilestone(config,program);
    next.replaceChildren(el('small',{text:'Következő országos dátum'}),
      el('strong',{text:upcoming?upcoming.title:'Nincs további dátum'}),
      el('span',{text:upcoming?admissionDateLabel(upcoming):'A közzétett tanév időszaka lezárult'}));
    steps.replaceChildren(...(program==='all'?data.programs:data.programs.filter(p=>p.id===program)).map(p=>
      el('details',{className:'mobile-admission-process'},el('summary',{text:`${p.label} – jelentkezési lépések`}),
        el('ol',{},...data.steps[p.id].map(s=>el('li',{},
          el('strong',{text:s.title}),el('p',{text:s.detail}),link('Tovább',s.pageId)))))));
    renderEvents();
  }
  root.append(
    el('header',{className:'mobile-admission-head'},el('p',{className:'admission-kicker',text:'FELVÉTELI · 2027/2028'}),
      el('h2',{text:'Felvételi lépésről lépésre'}),el('p',{text:data.intro})),
    el('p',{className:'admission-warning',text:data.notice}),
    el('label',{className:'mobile-admission-label',text:'Eljárás',attributes:{for:'mobile-admission-program'}}),
    programSelect,next,modeToggle,search,count,list,steps,
    el('details',{className:'mobile-admission-sources'},el('summary',{text:'Ellenőrzött források és hiányzó helyi adatok'}),
      el('p',{text:`Forrásellenőrzés: ${data.checkedAt}`}),
      ...data.sources.map(s=>el('a',{text:s.title,attributes:{href:s.url,target:'_blank',rel:'noopener noreferrer'}})),
      el('ul',{},...data.schoolPending.map(s=>el('li',{text:s})))),
    createMobileAdmissionLinks(config));
  programSelect.id='mobile-admission-program';render();
  return {section:root,destroy(){root.replaceChildren();}};
}
