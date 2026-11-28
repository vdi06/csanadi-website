import {element as el} from '../shared/js/dom.js?v=2.84';
import {checkedAdmissions,admissionMilestones,milestoneStatus,statusLabel,admissionDateLabel,nextAdmissionMilestone,budapestToday} from '../shared/js/admission-data.js?v=2.84';
const href=(id)=>`#/oldal/${id}`;
const link=(label,id)=>el('a',{className:'admission-link',text:label,attributes:{href:href(id)}});
export function createDesktopAdmissionLinks(config){
  checkedAdmissions(config);
  return el('nav',{className:'admission-crosslinks',attributes:{'aria-label':'Felvételi kapcsolódó oldalak'}},
    link('Felvételi áttekintő','admission-guide'),link('Országos határidők','admission-deadlines'),
    link('1. osztály','admission-primary'),link('9. évfolyam','admission-secondary'),
    link('Dokumentumok','admission-documents'));
}
/** Önálló asztali felvételi műszerfal; a mobilos elrendezés külön modulban van. */
export function createDesktopAdmissions(config,pageId){
  const data=checkedAdmissions(config);
  const preset=pageId==='admission-primary'?'primary':pageId==='admission-secondary'?'secondary':'all';
  let program=preset,query='',filter='all';
  const root=el('section',{className:'admission-center desktop-admission-center',attributes:{'aria-label':'Felvételi központ – országosan ellenőrzött határidők'}});
  const heading=el('div',{className:'admission-hero'},
    el('p',{className:'admission-kicker',text:'FELVÉTELI KÖZPONT · 2027/2028'}),
    el('h2',{text:pageId==='admission-deadlines'?'Jelentkezési határidők':'Tervezd meg a felvételi lépéseit'}),
    el('p',{text:data.intro}),
    el('p',{className:'admission-checked',text:`Forrásellenőrzés: ${data.checkedAt} · Országos és KIFIR-ben közölt helyi adatok.`}));
  const warning=el('p',{className:'admission-warning',text:data.notice});
  const tabs=el('div',{className:'admission-program-tabs',attributes:{role:'group','aria-label':'Felvételi eljárás kiválasztása'}});
  for(const [id,label] of [['all','Mindkét eljárás'],...data.programs.map(x=>[x.id,x.label])]){
    const btn=el('button',{className:'admission-tab',text:label,attributes:{type:'button','data-program':id,'aria-pressed':String(id===program)}});
    btn.addEventListener('click',()=>{program=id;render();});tabs.append(btn);
  }
  const summary=el('div',{className:'admission-stats'});
  const searchId='desktop-admission-search';
  const search=el('input',{className:'admission-input form-control',attributes:{id:searchId,type:'search',autocomplete:'off',placeholder:'Határidő keresése…'}});
  const select=el('select',{className:'admission-select form-select',attributes:{'aria-label':'Határidők állapota'}},
    ...[['all','Összes határidő'],['upcoming','Csak az előttünk állók'],['soon','30 napon belül'],['active','Aktuális'],['expired','Lejártak']].map(([value,label])=>el('option',{text:label,attributes:{value}})));
  const count=el('p',{className:'admission-results',attributes:{role:'status','aria-live':'polite'}});
  const timeline=el('ol',{className:'admission-desktop-timeline'});
  const steps=el('div',{className:'admission-steps'});
  const pending=el('section',{className:'admission-pending'},el('h3',{text:'Helyi egyeztetésre vár'}),
    el('ul',{},...data.schoolPending.map(x=>el('li',{text:x}))));
  const sources=el('div',{className:'admission-sources'},el('h3',{text:'Ellenőrizhető források'}),
    ...data.sources.map(s=>el('a',{text:s.title,attributes:{href:s.url,target:'_blank',rel:'noopener noreferrer'}})));
  const toolbar=el('div',{className:'admission-toolbar'},
    el('label',{text:'Keresés',attributes:{for:searchId}}),search,select);
  search.addEventListener('input',()=>{query=search.value;renderList();});
  select.addEventListener('change',()=>{filter=select.value;renderList();});
  function renderList(){
    const today=budapestToday();
    const list=admissionMilestones(config,{program,status:filter,query,today});
    count.textContent=`${list.length} forrásjelölt időpont · ${today} (budapesti idő szerint)`;
    timeline.replaceChildren(...list.map(m=>{
      const state=milestoneStatus(m,today);
      return el('li',{className:`admission-event state-${state}`},
        el('div',{className:'admission-event-date'},el('time',{text:admissionDateLabel(m),attributes:{dateTime:m.start}}),
          el('span',{className:`admission-status state-${state}`,text:statusLabel[state]})),
        el('div',{className:'admission-event-body'},
          el('span',{className:'admission-event-program',text:data.programs.find(p=>p.id===m.program)?.label}),
          el('h3',{text:m.title}),el('p',{text:m.detail}),link('Kapcsolódó felvételi oldal',m.link)));
    }));
    if(!list.length)timeline.append(el('li',{className:'admission-empty',text:'Nincs a keresésnek és a szűrőknek megfelelő határidő.'}));
  }
  function renderSteps(){
    const selected=program==='all'?data.programs:data.programs.filter(p=>p.id===program);
    steps.replaceChildren(...selected.map(p=>el('section',{className:'admission-steps-card'},
      el('h3',{text:`${p.label} – ellenőrző lépések`}),el('p',{text:p.summary}),
      el('ol',{},...data.steps[p.id].map(s=>el('li',{},el('strong',{text:s.title}),
        el('p',{text:s.detail}),link('Részletek',s.pageId)))))));
  }
  function render(){
    tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.program===program)));
    const next=nextAdmissionMilestone(config,program);
    const today=budapestToday();
    const valid=admissionMilestones(config,{program,today});
    summary.replaceChildren(
      el('div',{className:'admission-stat'},el('span',{text:'Következő időpont'}),el('strong',{text:next?admissionDateLabel(next):'A listában nincs további dátum'})),
      el('div',{className:'admission-stat'},el('span',{text:'Forrásjelölt dátumok'}),el('strong',{text:String(valid.length)})),
      el('div',{className:'admission-stat'},el('span',{text:'Mai állapot'}),el('strong',{text:today})));
    renderList();renderSteps();
  }
  root.append(heading,warning,tabs,summary,el('div',{className:'admission-desktop-layout'},
    el('div',{className:'admission-desktop-main'},toolbar,count,timeline),
    el('aside',{className:'admission-desktop-aside'},steps,pending,sources,createDesktopAdmissionLinks(config))));
  let expanded=[];root.dataset.adaptiveState='admission';root.adaptiveSnapshot=()=>({program,query,filter,expanded});root.adaptiveRestore=s=>{program=s.program;query=s.query;filter=s.filter;expanded=s.expanded||[];search.value=query;select.value=filter;render();};render();return {section:root,destroy(){root.replaceChildren();}};
}
