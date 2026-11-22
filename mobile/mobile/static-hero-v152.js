/** Mobilnyitó: középre rendezett iskolacímer és JSON-adatok.
 * Nincs nagyméretű fotó, képváltó, időzítő, navigációs nyíl vagy helyfoglaló. */
import {setting} from '../js/site-settings-2026.js?v=1.53';
import {sharedAssetPath} from '../js/shared-paths-v152.js?v=1.53';
const el=(tag,cls,text)=>{
 const node=document.createElement(tag);if(cls)node.className=cls;
 if(text!==undefined)node.textContent=String(text);
 return node;
};
export function renderStaticMobileHero(block){
 const data=block?.data?.mobileStatic;
 if(!data||data.layout!=='crest')return null;
 const section=el('section','cs-mobile-static-hero');
 section.setAttribute('aria-label',String(data.eyebrow||data.title||'Iskolai kezdőlap'));
 const visual=el('div','cs-mobile-static-visual');
 const crestPath=sharedAssetPath(setting('site.crestImagePath'));
 if(typeof crestPath==='string'&&crestPath.startsWith('../shared/assets/media/')){
  const crest=el('img','cs-mobile-static-crest');
  crest.src=crestPath;
  crest.alt=String(data.crestAlt||'');
  crest.width=128;
  crest.height=128;
  crest.loading='eager';
  crest.decoding='async';
  visual.append(crest);
 }
 const content=el('div','cs-mobile-static-content');
 if(data.eyebrow)content.append(el('p','cs-mobile-static-eyebrow',data.eyebrow));
 if(data.title)content.append(el('h1','cs-mobile-static-heading',data.title));
 if(data.subtitle)content.append(el('p','cs-mobile-static-lead',data.subtitle));
 if(/^#\/[a-z0-9\-/]*$/.test(data.href||'')){
  const link=el('a','cs-mobile-static-cta',data.linkText||'Tovább');
  link.href=data.href;content.append(link);
 }
 section.append(visual,content);
 return section;
}
