import { element } from "../shared/js/dom.js?v=2.72";
import { checkedTimetable, currentBell, budapestClock } from "../shared/js/timetable-data.js?v=2.72";
const el=element;
/** Asztali időrend: két blokk – hiteles csengetés és jól jelölt bemutató-órarend. */
export function createDesktopTimetable(config){
  const {config:settings,schedule}=checkedTimetable(config);
  const clock=budapestClock(); const status=currentBell(config);
  let selected=settings.classes[0].id;
  const heading=el("div",{className:"desktop-timetable-lead"},
    el("p",{className:"timetable-eyebrow",text:settings.eyebrow}),
    el("h2",{text:settings.title}),el("p",{text:settings.summary}));
  const timing=el("div",{className:"desktop-timetable-bells"},...schedule.map((row,i)=>{
    const current=status.type==="lesson"&&status.index===i;
    const next=i+1<schedule.length ? `${schedule[i+1].from} kezdésig szünet` : "A napi időrend utolsó tanórája";
    return el("article",{className:`desktop-timetable-bell${current?" is-current":""}`},
      el("span",{text:row.title}),el("strong",{text:`${row.from}–${row.to}`}),
      el("small",{text:next}));
  }));
  const picker=el("select",{className:"timetable-class-select",attributes:{"aria-label":"Bemutató órarend kiválasztása"}},
    ...settings.classes.map(c=>el("option",{text:c.label,attributes:{value:c.id}})));
  const grid=el("div",{className:"desktop-timetable-grid-wrap"});
  const example=el("p",{className:"timetable-demo-banner",attributes:{role:"note"}});
  function render(){
    const klass=settings.classes.find(c=>c.id===selected)||settings.classes[0];
    example.textContent=`BEMUTATÓADAT – ${klass.description} A táblázat nem tekinthető hiteles osztályórarendnek.`;
    grid.replaceChildren(el("table",{className:"desktop-timetable-table",attributes:{"aria-label":`${klass.label} – heti bemutatóórarend`}},
      el("thead",{},el("tr",{},el("th",{text:"Tanóra",attributes:{scope:"col"}}),
        ...settings.days.map(day=>el("th",{text:day.label,attributes:{scope:"col"}})))),
      el("tbody",{},...schedule.map((row,i)=>el("tr",{},
        el("th",{attributes:{scope:"row"}},el("strong",{text:row.title}),el("small",{text:`${row.from}–${row.to}`})),
        ...settings.days.map(day=>el("td",{className:day.id===clock.day?"is-today":"",text:klass.days[day.id][i]})))))));
  }
  picker.addEventListener("change",()=>{selected=picker.value;render();});
  const section=el("section",{className:"desktop-timetable-center",attributes:{"aria-label":settings.title}},
    heading,
    el("div",{className:"timetable-current-status",attributes:{role:"status"}},
      el("strong",{text:"Mai csengetési állapot"}),el("span",{text:status.text}),
      el("small",{text:"A szokásos csengetési idők alapján; rendkívüli napokon eltérhet."})),
    el("section",{className:"timetable-panel"},el("h3",{text:"Általános csengetési rend"}),timing,
      el("p",{className:"timetable-source-note",text:"Csengetési idők – helyben megjelenítve"})),
    el("section",{className:"timetable-panel"},
      el("div",{className:"desktop-timetable-pick"},el("h3",{text:"Heti órarend – bemutató nézet"}),picker),
      example,grid),el("p",{className:"timetable-source-note",text:settings.sourceNote}));
  let preservedDay=null;section.dataset.adaptiveState='timetable';section.adaptiveSnapshot=()=>({classId:selected,dayId:preservedDay});section.adaptiveRestore=s=>{if(settings.classes.some(c=>c.id===s.classId)){selected=s.classId;picker.value=selected;}preservedDay=s.dayId;render();};render();return {section,destroy(){}};
}
