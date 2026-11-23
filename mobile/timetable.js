import { element } from "../shared/js/dom.js?v=2.53";
import { checkedTimetable, currentBell, budapestClock } from "../shared/js/timetable-data.js?v=2.53";
const el=element;
/** Saját mobilos óralista: egy tanítási nap, nagy érintési célok, gyors napváltás. */
export function createMobileTimetable(config){
  const {config:settings,schedule}=checkedTimetable(config);
  const clock=budapestClock(),status=currentBell(config);
  let classId=settings.classes[0].id, dayId=clock.day||"mon";
  const picker=el("select",{className:"mobile-timetable-class",attributes:{"aria-label":"Bemutató órarend kiválasztása"}},
    ...settings.classes.map(c=>el("option",{text:c.label,attributes:{value:c.id}})));
  const days=el("div",{className:"mobile-timetable-days",attributes:{role:"group","aria-label":"Tanítási nap kiválasztása"}});
  const dayButtons=settings.days.map(day=>{
    const b=el("button",{className:"mobile-timetable-day",text:day.short,
      attributes:{type:"button","data-day":day.id,"aria-label":day.label,"aria-pressed":String(day.id===dayId)}});
    b.addEventListener("click",()=>{dayId=day.id;render();});days.append(b);return b;
  });
  const banner=el("p",{className:"timetable-demo-banner",attributes:{role:"note"}});
  const list=el("div",{className:"mobile-timetable-lessons"});
  function render(){
    const klass=settings.classes.find(c=>c.id===classId)||settings.classes[0];
    banner.textContent=`BEMUTATÓADAT – ${klass.description} Ez nem valós osztályórarend.`;
    dayButtons.forEach(b=>{const active=b.dataset.day===dayId;b.setAttribute("aria-pressed",String(active));b.classList.toggle("is-active",active);});
    list.replaceChildren(...schedule.map((row,i)=>el("article",{className:"mobile-timetable-lesson"},
      el("div",{className:"mobile-timetable-lesson-time"},el("strong",{text:row.title}),el("small",{text:`${row.from}–${row.to}`})),
      el("p",{text:klass.days[dayId][i]}))));
  }
  picker.addEventListener("change",()=>{classId=picker.value;render();});
  const bells=el("details",{className:"mobile-timetable-bells"},el("summary",{text:"Teljes csengetési rend (8 óra)"}),
    el("ol",{},...schedule.map(row=>el("li",{},el("strong",{text:row.title}),
      el("span",{text:`${row.from}–${row.to}`})))));
  const section=el("section",{className:"mobile-timetable-center",attributes:{"aria-label":settings.title}},
    el("div",{className:"mobile-timetable-head"},
      el("p",{className:"timetable-eyebrow",text:settings.eyebrow}),el("h2",{text:settings.title}),el("p",{text:settings.summary})),
    el("div",{className:"timetable-current-status"},el("strong",{text:"Mai csengetési állapot"}),el("span",{text:status.text})),
    bells,
    el("section",{className:"mobile-timetable-week"},el("h3",{text:"Órarend – bemutató adatok"}),picker,days,banner,list),
    el("p",{className:"timetable-source-note",text:settings.sourceNote}));
  render();return {section,destroy(){}};
}
