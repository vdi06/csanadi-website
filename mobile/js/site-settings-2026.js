let settings=null;
const resolve=path=>String(path).split('.').reduce((value,key)=>value&&typeof value==='object'?value[key]:undefined,settings);
export function useSiteSettings(config){
 if(!config||typeof config!=='object'||!config.runtime||!config.search||!config.performance)throw new Error('Hiányzó központi honlapbeállítások a json/config.json fájlban.');
 settings=config;
 const root=document.documentElement;
 const css={
  '--csn14-cutout-mobile':config.runtime.hero.mobileCutoutRadiusPx+'px',
  '--csn14-cutout-small':config.runtime.hero.smallMobileCutoutRadiusPx+'px',
  '--csn14-cutout-desktop':config.runtime.hero.desktopCutoutRadiusPx+'px',
  '--csn14-cutout-tablet':config.runtime.hero.tabletCutoutRadiusPx+'px',
  '--csn14-touch-min':config.runtime.accessibility.targetMinimumPx+'px',
  '--cs-subpage-crest-main':config.runtime.navigation.subpageCrest.initialDiameterPx+'px',
  '--cs-subpage-crest-scrolled':(config.runtime.navigation.subpageCrest.initialDiameterPx*config.runtime.navigation.subpageCrest.scrolledScale)+'px',
  '--cs-site-content-width':config.runtime.layout.contentMaxWidthPx+'px',
  '--cs-site-gutter-min':config.runtime.layout.minPageGutterPx+'px',
  '--cs-site-gutter-max':config.runtime.layout.maxPageGutterPx+'px',
  '--csn14-focus-width':config.runtime.accessibility.focusOutlinePx+'px'
 };
 for(const mode of ['light','dark']){
  const palette=config.theme?.[mode+'Colors'];
  if(!palette||typeof palette!=='object')throw new Error('Hiányzó központi '+mode+' színpaletta.');
  for(const key of ['page','card','light','line','ink','muted','header','footer','nav','veil','sportGreen','sportYellow']){
   if(typeof palette[key]!=='string'||!palette[key])throw new Error('Érvénytelen színpaletta-beállítás: theme.'+mode+'Colors.'+key);
   css['--csn15-'+mode+'-'+key]=palette[key];
  }
 }
 for(const [name,value] of Object.entries(css))root.style.setProperty(name,value);
 root.dataset.paletteLoaded='true';
 const footer=document.querySelector('.footer-grid');
 const footerText=footer?.querySelector('p:not(.footer-brand)');
 if(footerText)footerText.textContent=[config.site.address,config.site.email,config.site.motto].filter(Boolean).join(' · ');
 const footerBrand=document.querySelector('.footer-brand');
 if(footerBrand){footerBrand.replaceChildren(document.createTextNode(config.site.shortName+' '));const year=document.createElement('span');year.textContent=String(config.site.footerYear);footerBrand.append(year);}
 const copyright=document.querySelector('.footer-bottom');
 if(copyright){const count=copyright.querySelector('#footer-page-count');copyright.replaceChildren(document.createTextNode('© '+config.site.footerYear+' '+config.site.name+' '));if(count)copyright.append(count);}
 const kreta=document.querySelector('.header-kreta');
 if(kreta&&/^https:\/\//.test(config.site.kretaUrl))kreta.href=config.site.kretaUrl;
}
export function setting(path){
 const value=resolve(path);
 if(value===undefined)throw new Error('Hiányzó központi beállítás: '+path);
 return value;
}
// A külön is tesztelhető UI-összetevők a beállítások betöltése előtt is
// létrehozhatók; a valódi indítófolyamat mindig előbb tölti a JSON-t.
export const optionalSetting=path=>resolve(path);
export function settingNumber(path){
 const value=setting(path);
 if(typeof value!=='number'||!Number.isFinite(value)||value<0)throw new Error('Érvénytelen numerikus honlapbeállítás: '+path);
 return value;
}
export function resolveConfiguredText(text){
 return String(text??'').replace(/\{\{(site\.[a-zA-Z]+|currentSchoolYear)\}\}/g,(_,path)=>{
  const value=setting(path);
  return Array.isArray(value)?value.map(String).join(' és '):String(value);
 });
}
export function isWithinConfiguredWindow(path,now=new Date()){
 const begin=setting(path+'.startsAt'),end=setting(path+'.endsAt');
 const parse=value=>value===null?null:typeof value==='string'&&Number.isFinite(Date.parse(value))?Date.parse(value):NaN;
 const from=parse(begin),to=parse(end);
 if(Number.isNaN(from)||Number.isNaN(to))throw new Error('Érvénytelen láthatósági dátum: '+path);
 return (from===null||now.getTime()>=from)&&(to===null||now.getTime()<=to);
}
