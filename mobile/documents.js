import { element } from "../shared/js/dom.js?v=2.46";
import { checkedDocumentCenter, documentResults } from "../shared/js/document-data.js?v=2.46";
import { createDocumentReader } from "../shared/js/document-reader.js?v=2.46";
const el=element;
/** Önálló, érintéses mobil dokumentumközpont. Nincs asztali kártyák CSS-kicsinyítése. */
export function createMobileDocuments(config){
  const settings=checkedDocumentCenter(config);
  let category="all",status="all",query="",sort=settings.defaultSort,limit=settings.mobilePageSize;
  const section=el("section",{className:"mobile-document-center document-center",attributes:{"aria-label":"Mobil dokumentumközpont"}});
  const reader=createDocumentReader(section,"mobile");
  const search=el("input",{className:"document-center-search form-control",attributes:{type:"search",id:"mobile-document-search",autocomplete:"off",placeholder:settings.searchPlaceholder,"aria-label":"Dokumentum keresése"}});
  const catSelect=el("select",{className:"document-center-select form-select",attributes:{"aria-label":"Dokumentumkategória"}},
    ...settings.categories.map((c)=>el("option",{text:c.label,attributes:{value:c.id}})));
  const statusSelect=el("select",{className:"document-center-select form-select",attributes:{"aria-label":"Közzétételi állapot"}},
    el("option",{text:"Minden állapot",attributes:{value:"all"}}),
    el("option",{text:"Megtekinthető",attributes:{value:"available"}}),
    el("option",{text:"Feltöltésre vár",attributes:{value:"pending"}}));
  const sortSelect=el("select",{className:"document-center-select form-select",attributes:{"aria-label":"Rendezés"}},
    el("option",{text:"Cím szerint",attributes:{value:"title"}}),el("option",{text:"Legfrissebb",attributes:{value:"date"}}));
  const count=el("p",{className:"document-center-result",attributes:{role:"status","aria-live":"polite"}});
  const list=el("div",{className:"mobile-document-list"});
  const more=el("button",{className:"document-center-more btn",text:"További dokumentumok",attributes:{type:"button"}});
  function render(){
    const found=documentResults(config,{category,status,query,sort});
    count.textContent=`${Math.min(found.length,limit)} / ${found.length} dokumentum`;
    list.replaceChildren(...found.slice(0,limit).map((doc)=>{
      const ready=doc.status==="available";
      const card=el("article",{className:`document-card mobile-document-card ${ready?"document-card-ready":"document-card-pending"}`},
        el("div",{className:"document-card-top"},el("span",{className:"document-card-kind",text:doc.kind.toUpperCase()}),
          el("span",{className:"document-card-status",text:ready?"Megtekinthető":"Feltöltésre vár"})),
        el("h3",{text:doc.title}),el("p",{text:doc.summary}),
        el("small",{className:"document-card-category",text:settings.categories.find((c)=>c.id===doc.category)?.label||""}));
      if(ready){
        const btn=el("button",{className:"document-card-open btn",text:"Megtekintés a weboldalon",attributes:{type:"button"}});
        btn.addEventListener("click",()=>reader.open(doc,btn));card.append(btn);
      }else card.append(el("span",{className:"document-card-notice",text:"Még nincs feltöltve"}));
      return card;
    }));
    if(!found.length)list.append(el("p",{className:"document-center-empty",text:"Nincs ilyen dokumentum."}));
    more.hidden=found.length<=limit;
  }
  const reset=()=>{limit=settings.mobilePageSize;render();};
  catSelect.addEventListener("change",()=>{category=catSelect.value;reset();});
  statusSelect.addEventListener("change",()=>{status=statusSelect.value;reset();});
  sortSelect.addEventListener("change",()=>{sort=sortSelect.value;reset();});
  search.addEventListener("input",()=>{query=search.value;reset();});
  more.addEventListener("click",()=>{limit+=settings.mobilePageSize;render();});
  section.append(el("header",{className:"mobile-document-lead"},
    el("p",{className:"document-center-eyebrow",text:settings.eyebrow}),
    el("h2",{text:"Dokumentumtár"}),el("p",{text:settings.intro})),
    el("div",{className:"mobile-document-filters"},
      el("label",{className:"visually-hidden",text:"Dokumentum keresése",attributes:{for:"mobile-document-search"}}),
      search,el("div",{className:"mobile-document-filter-row"},catSelect,statusSelect),sortSelect),
    count,list,more);
  render();return {section,destroy(){reader.destroy();}};
}
