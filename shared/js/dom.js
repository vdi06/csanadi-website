import { responsiveMediaAttributes } from "./responsive-media.js?v=2.84";
/** Kis DOM-építő: feliratok és útvonalak kizárólag JSON-adatokból érkeznek. */
export function element(tag, { className = "", text, attributes = {} } = {}, ...children) {
  const node = document.createElement(tag);
  const original=tag.toLowerCase()==="img"&&attributes.src;
  const adapted=original&&!attributes.srcset?responsiveMediaAttributes(original):null;
  if(adapted){attributes={...attributes,...adapted,loading:attributes.loading||"lazy"};node.addEventListener("error",()=>{if(node.hasAttribute("srcset")){node.removeAttribute("srcset");node.src=original;}},{once:true});}
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  for (const [key, value] of Object.entries(attributes).sort(([a],[b])=>Number(a==="src")-Number(b==="src"))) {
    if (value === undefined || value === null) continue;
    if (/^on/i.test(key) || ["srcdoc","ping"].includes(key.toLowerCase())) continue;
    if (["href","src","action","formaction","xlink:href"].includes(key.toLowerCase())) {
      const url=String(value).replace(/[\u0000-\u0020]/g,"");
      try {const parsed=new URL(url,document.baseURI);const schemes=key.toLowerCase()==='href'?['http:','https:','mailto:','tel:','blob:']:['http:','https:','blob:'];if(!schemes.includes(parsed.protocol)&&!url.startsWith('#'))continue;}catch{continue;}
    }
    if(key.toLowerCase()==='srcset' && String(value).split(',').some(candidate=>{const u=candidate.trim().split(/\s+/)[0];try{return !['http:','https:'].includes(new URL(u,document.baseURI).protocol);}catch{return true;}}))continue;
    node.setAttribute(key, String(value));
  }
  if(tag.toLowerCase()==="a" && node.getAttribute("target")==="_blank") {
    const rel=new Set((node.getAttribute("rel")||"").split(/\s+/).filter(Boolean));rel.add("noopener");rel.add("noreferrer");node.setAttribute("rel",[...rel].join(" "));
  }
  for (const child of children.flat()) {
    if (child !== undefined && child !== null) node.append(child);
  }
  return node;
}

export function crest(config, className = "school-crest") {
  return element("img", { className, attributes: {
    src: config.site.crest,
    alt: config.site.crestAlt,
    width: 512,
    height: 512,
    decoding: "async"
  } });
}

/** Az intézménynév egyetlen JSON-mezőből adja a kapu és a fejlécek feliratait. */
export function schoolDisplayNames(fullName) {
  const source = String(fullName || "");
  const [primary, ...rest] = source.split(",");
  return {
    line1:primary.trim().toLocaleUpperCase("hu-HU"),
    line2:rest.join(",").trim().toLocaleUpperCase("hu-HU"),
    caption:source.toLocaleUpperCase("hu-HU")
  };
}

