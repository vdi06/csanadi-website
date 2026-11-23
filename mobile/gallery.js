import { element } from "../shared/js/dom.js?v=2.41";
import { checkedMediaCenter, mediaResults } from "../shared/js/media-data.js?v=2.41";
import { createGalleryDialog } from "../shared/js/gallery-dialog.js?v=2.41";
const el=element;
export function createMobileMedia(config) {
  const settings=checkedMediaCenter(config);
  let category="all",query="",limit=settings.mobileInitialCount;
  const section=el("section",{className:"mobile-media-center",attributes:{"aria-label":"Képgaléria és médiaközpont"}});
  const gallery=createGalleryDialog(section,"mobile");
  const search=el("input",{className:"mobile-media-search form-control",attributes:{type:"search",
    placeholder:settings.searchPlaceholder,"aria-label":settings.searchLabel}});
  const filters=el("div",{className:"mobile-media-filters",attributes:{role:"group","aria-label":"Képkategóriák"}});
  const grid=el("div",{className:"mobile-media-grid"});
  const status=el("p",{className:"mobile-media-count",attributes:{role:"status","aria-live":"polite"}});
  const more=el("button",{className:"mobile-media-more btn",attributes:{type:"button"},text:"További képek"});
  function render(){
    const results=mediaResults(config,{category,query}),shown=results.slice(0,limit);
    filters.querySelectorAll("button").forEach((b)=>b.setAttribute("aria-pressed",String(b.dataset.category===category)));
    grid.replaceChildren(...shown.map((item,i)=>{
      const button=el("button",{className:"mobile-media-tile",attributes:{type:"button","aria-label":`Kép megnyitása: ${item.title}`}},
        el("img",{attributes:{src:item.src,alt:item.alt,loading:"lazy",decoding:"async",width:1672,height:941}}),
        el("span",{className:"mobile-media-tile-text",text:item.title}));
      button.addEventListener("click",()=>gallery.show(results,i,button));return button;
    }));
    if(!results.length)grid.append(el("p",{className:"mobile-media-empty",text:"Nincs ilyen kép. Válassz másik kategóriát!"}));
    status.textContent=`${shown.length} / ${results.length} kép`;
    more.hidden=shown.length>=results.length;
  }
  function reset(){limit=settings.mobileInitialCount;render();}
  for(const cat of settings.categories){
    const button=el("button",{className:"mobile-media-filter",text:cat.label,attributes:{
      type:"button","data-category":cat.id,"aria-pressed":String(cat.id===category)}});
    button.addEventListener("click",()=>{category=cat.id;reset();filters.scrollIntoView?.({block:"nearest",behavior:"instant"});});filters.append(button);
  }
  search.addEventListener("input",()=>{query=search.value;reset();});
  more.addEventListener("click",()=>{limit+=settings.loadStep;render();});
  section.append(el("div",{className:"mobile-media-head"},
    el("p",{text:settings.eyebrow}),el("h2",{text:"Képek témák szerint"}),
    el("p",{text:settings.note})),search,filters,status,grid,more);
  render();return {section,destroy(){gallery.destroy();}};
}
