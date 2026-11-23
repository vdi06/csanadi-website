import { element } from "../shared/js/dom.js?v=2.48";
import { checkedDocumentCenter,documentResults } from "../shared/js/document-data.js?v=2.48";
import { createDocumentReader } from "../shared/js/document-reader.js?v=2.48";
const el=element;
/** Asztali dokumentumközpont: oldalsáv, többoszlopos rács, saját PDF/TXT-olvasó. */
export function createDesktopDocuments(config){
  const settings=checkedDocumentCenter(config);
  let category="all",status="all",query="",sort=settings.defaultSort,limit=settings.desktopPageSize;
  const section=el("section",{className:"desktop-document-center document-center",attributes:{"aria-label":"Hivatalos dokumentumok és dokumentumnézegető"}});
  const reader=createDocumentReader(section,"desktop");
  const intro=el("div",{className:"document-center-lead"},el("p",{className:"document-center-eyebrow",text:settings.eyebrow}),
    el("h2",{text:"Dokumentumok egy helyen"}),el("p",{text:settings.intro}));
  const search=el("input",{className:"document-center-search form-control",attributes:{type:"search",id:"desktop-document-search",autocomplete:"off",placeholder:settings.searchPlaceholder,"aria-label":"Dokumentum keresése"}});
  const statusFilter=el("select",{className:"document-center-select form-select",attributes:{"aria-label":"Közzétételi állapot"}},
    el("option",{text:"Összes állapot",attributes:{value:"all"}}),el("option",{text:"Megtekinthető",attributes:{value:"available"}}),el("option",{text:"Feltöltésre vár",attributes:{value:"pending"}}));
  const sortFilter=el("select",{className:"document-center-select form-select",attributes:{"aria-label":"Dokumentumok sorrendje"}},
    el("option",{text:"Cím szerint",attributes:{value:"title"}}),el("option",{text:"Legfrissebb fájl előre",attributes:{value:"date"}}));
  const count=el("p",{className:"document-center-result",attributes:{role:"status","aria-live":"polite"}});
  const catBox=el("nav",{className:"desktop-document-categories",attributes:{"aria-label":"Dokumentumkategóriák"}});
  const grid=el("div",{className:"desktop-document-grid"});
  const more=el("button",{className:"document-center-more btn",text:"További dokumentumok",attributes:{type:"button"}});
  for(const cat of settings.categories){
    const button=el("button",{className:"desktop-document-category",text:cat.label,attributes:{type:"button","data-category":cat.id,"aria-pressed":String(cat.id===category)}});
    button.addEventListener("click",()=>{category=cat.id;reset();});catBox.append(button);
  }
  const reset=()=>{limit=settings.desktopPageSize;render();};
  search.addEventListener("input",()=>{query=search.value;reset();});
  statusFilter.addEventListener("change",()=>{status=statusFilter.value;reset();});
  sortFilter.addEventListener("change",()=>{sort=sortFilter.value;reset();});
  more.addEventListener("click",()=>{limit+=settings.desktopPageSize;render();});
  function render(){
    const found=documentResults(config,{category,status,query,sort});
    catBox.querySelectorAll("button").forEach((button)=>button.setAttribute("aria-pressed",String(button.dataset.category===category)));
    count.textContent=`${Math.min(limit,found.length)} / ${found.length} dokumentum · ${found.filter((d)=>d.status==="available").length} megtekinthető`;
    grid.replaceChildren(...found.slice(0,limit).map((doc)=>{
      const ready=doc.status==="available";
      const card=el("article",{className:`document-card ${ready?"document-card-ready":"document-card-pending"}`},
        el("div",{className:"document-card-top"},el("span",{className:"document-card-kind",text:doc.kind.toUpperCase()}),
          el("span",{className:"document-card-status",text:ready?"Megtekinthető":"Feltöltésre vár"})),
        el("h3",{text:doc.title}),el("p",{text:doc.summary}),
        el("div",{className:"document-card-bottom"},
          el("span",{className:"document-card-category",text:settings.categories.find((c)=>c.id===doc.category)?.label||""})));
      if(ready){
        const button=el("button",{className:"document-card-open btn",text:"Megtekintés",attributes:{type:"button","aria-label":`${doc.title} megtekintése a dokumentumnézegetőben`}});
        button.addEventListener("click",()=>reader.open(doc,button));card.append(button);
      }else card.append(el("span",{className:"document-card-notice",text:"Hiteles fájl még nem érhető el"}));
      return card;
    }));
    if(!found.length)grid.append(el("p",{className:"document-center-empty",text:"Nincs megfelelő dokumentum. Módosítsd a szűrőket vagy a keresést."}));
    more.hidden=limit>=found.length;
  }
  section.append(intro,el("div",{className:"desktop-document-layout"},catBox,
    el("div",{className:"desktop-document-main"},el("div",{className:"desktop-document-toolbar"},
      el("label",{className:"visually-hidden",text:"Dokumentum keresése",attributes:{for:"desktop-document-search"}}),search,statusFilter,sortFilter),
      count,grid,more)));
  render();return {section,destroy(){reader.destroy();}};
}
