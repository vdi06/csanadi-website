/* V1.40.8: statikus, FTP-n is olvasható előnézeti HTML a 71 közzétett oldalhoz.
 * A forrásoldalak noindex irányelvét változatlanul tiszteletben tartjuk. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const config=JSON.parse(fs.readFileSync(path.join(root,'json/config.json'),'utf8'));
const base=new URL(config.site.baseUrl);
if(!/^https?:$/.test(base.protocol)||base.search||base.hash)throw Error('Érvénytelen nyilvános alap-URL');
if(!base.pathname.endsWith('/'))base.pathname+='/';
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const clean=value=>String(value??'').replace(/\{\{[^}]+\}\}/g,'').replace(/!?\[([^\]]+)\]\([^\n)]+\)/g,'$1').replace(/<[^>]+>/g,' ').replace(/[#*`_~|]/g,' ').replace(/\s+/g,' ').trim();
function paths(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?paths(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function pathFromRoute(route){
 if(typeof route!=='string'||!/^#\/[a-z0-9/-]*$/.test(route))throw Error('Érvénytelen oldalútvonal: '+route);
 const parts=route.slice(2).split('/').filter(Boolean);
 if(parts.some(p=>p==='.'||p==='..'))throw Error('Veszélyes URL');
 return parts.length?parts.join('/'):'kezdolap';
}
function renderPage(page,route,seoPath){
 const title=clean(page.seo?.title||page.title).slice(0,130);
 const description=clean(page.seo?.description||page.summary).slice(0,300);
 const fullTitle=title+' | Csanádi Sportiskola';
 const body=clean(page.searchText||page.summary).slice(0,13000);
 const paragraphs=body.match(/.{1,550}(?:[.!?](?=\s)|$)/gu)||[body];
 const canonical=new URL(seoPath,base).href;
 const rootUrl=new URL('index.html'+route,base).href;
 const indexable=/^index(?:,follow)?$/i.test(String(page.seo?.robots||'noindex'));
 const robots=indexable?'index,follow':'noindex,nofollow';
 const schema={'@context':'https://schema.org','@type':'WebPage',name:page.title||title,description,url:canonical,inLanguage:page.locale||'hu-HU',isPartOf:{'@type':'WebSite',name:config.site.name,url:base.href}};
 const jsonld=JSON.stringify(schema).replace(/</g,'\\u003c');
 return {indexable,html:`<!doctype html>\n<html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${esc(fullTitle)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="${robots}">\n<link rel="canonical" href="${esc(canonical)}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(fullTitle)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(canonical)}">\n<meta name="twitter:card" content="summary"><script type="application/ld+json">${jsonld}</script>\n<style>html{color-scheme:light}body{margin:0;background:#f8f5ed;color:#172c44;font:1.1rem/1.65 system-ui,sans-serif}header,main,footer{max-width:68rem;margin:auto;padding:1.2rem}header{border-bottom:3px solid #d7b66e}h1{font-size:clamp(1.7rem,4vw,2.8rem);line-height:1.15}article{max-width:68ch}a{color:#07588b}a:focus-visible{outline:3px solid #bc8428;outline-offset:3px}p{overflow-wrap:anywhere}.notice{padding:1rem;border-left:4px solid #d7b66e;background:#ece7db}footer{border-top:1px solid #d7b66e}</style></head>\n<body><header><a href="${esc(base.href)}">Csanádi Sportiskola – kezdőlap</a></header><main><article><h1>${esc(page.title||title)}</h1><p class="notice">Ez az oldal statikus, akadálymentesen olvasható szöveges változata. A teljes, interaktív oldal az alábbi hivatkozással érhető el.</p>\n<p><a href="${esc(rootUrl)}">Teljes oldal megnyitása az intézményi honlapon</a></p><p>${esc(description)}</p>${paragraphs.filter(Boolean).slice(0,32).map(s=>`<p>${esc(s)}</p>`).join('\n')}</article></main><footer><a href="${esc(rootUrl)}">Interaktív oldal megnyitása</a> · © Csanádi Sportiskola</footer></body></html>\n`};
}
const entries=[],seen=new Set();
for(const filename of paths(path.join(root,'json/oldalak')).filter(file=>file.endsWith('.json')).sort()){
 const page=JSON.parse(fs.readFileSync(filename,'utf8'));
 if(page.lifecycle?.status!=='published')continue;
 const route=page.schemaExtensions?.route;
 const slug=pathFromRoute(route);
 if(seen.has(slug))throw Error('Ütköző statikus útvonal: '+slug);
 seen.add(slug);
 const seoPath='seo/'+slug+'/index.html';
 const result=renderPage(page,route,seoPath);
 const dest=path.join(root,seoPath);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,result.html);
 entries.push({route,seoPath,indexable:result.indexable,title:page.title});
}
const visible=entries.filter(item=>item.indexable);
const urls=visible.map(item=>`  <url><loc>${esc(new URL(item.seoPath,base).href)}</loc></url>`);
fs.writeFileSync(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.join('\n')+'\n</urlset>\n');
fs.writeFileSync(path.join(root,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+new URL('sitemap.xml',base).href+'\n');
fs.writeFileSync(path.join(root,'dokumentacio/SEO_LEFEDES_V1_40_8.json'),JSON.stringify({release:'1.40.8',baseUrl:base.href,total:entries.length,indexable:visible.length,excludedNoindex:entries.length-visible.length,publicationAuthorized:false,entries},null,2)+'\n');
console.log(JSON.stringify({pages:entries.length,indexable:visible.length,excludedNoindex:entries.length-visible.length}));
