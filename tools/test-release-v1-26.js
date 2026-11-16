/* Csanádi v1.9 – statikus forrásvizsgálat, helyi interakció- és kiadási próba. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const checks={};
const warnings=[];
const set=(name,value)=>checks[name]=Boolean(value);

const files=[];
function walk(directory=''){
  for(const entry of fs.readdirSync(path.join(root,directory),{withFileTypes:true})){
    const rel=path.join(directory,entry.name);
    if(entry.isDirectory())walk(rel);
    else files.push(rel.split(path.sep).join('/'));
  }
}
walk();
const json=files.filter(p=>p.endsWith('.json'));
const javascript=files.filter(p=>p.endsWith('.js'));
const html=files.filter(p=>p.endsWith('.html'));
const jsonProblems=[],jsProblems=[],fileProblems=[];
for(const item of json){try{JSON.parse(read(item));}catch(e){jsonProblems.push(item+': '+e.message);}}
for(const item of javascript){
  try{cp.execFileSync('node',['--check',path.join(root,item)],{stdio:'pipe'});}
  catch(e){jsProblems.push(item+': '+(e.stderr?.toString()||e.message).slice(0,170));}
}
set('allJsonParses',jsonProblems.length===0);
set('allJavaScriptParses',jsProblems.length===0);

const structure=JSON.parse(read('json/structure.json'));
const records=[];
function visit(nodes){for(const n of nodes){
  const name='json/'+n.path;
  if(!fs.existsSync(path.join(root,name))){fileProblems.push(name);continue;}
  const p=JSON.parse(read(name));records.push({route:p.schemaExtensions?.route,page:p,path:name});
  if(n.children)visit(n.children);
}}
visit(structure.nodes);
const routes=new Set(records.map(r=>r.route).filter(Boolean));
set('all65RoutesRegistered',records.length===65&&routes.size===records.length);
set('allRegisteredPagesPublished',records.every(r=>r.page.lifecycle?.status==='published'&&Array.isArray(r.page.blocks)));
for(const r of records){
  const contents=JSON.stringify(r.page);
  for(const match of contents.matchAll(/#\/[a-z0-9/-]+/g)){
    if(match[0]!=='#/'&&!routes.has(match[0]))warnings.push(r.path+' nem létező útvonala: '+match[0]);
  }
}
set('allInternalPageLinksResolvable',!warnings.some(w=>w.includes('nem létező útvonala')));

let oldDomainUrls=0;
for(const file of files.filter(x=>/\.(?:html|js|json)$/i.test(x)&&!x.startsWith('dokumentacio/')&&!x.startsWith('tools/'))){
  const content=read(file);
  // A kézikönyvben szereplő jövőbeli FTP-konfiguráció puszta szöveg,
  // nem kattintható hivatkozás. HTML-ben kizárólag valódi src/href célokat mérünk.
  const realLinks=file.endsWith('.html')
    ? /\b(?:src|href)\s*=\s*["']https?:\/\/(?:www\.)?csanadi-bp\.edu\.hu(?=[/:?"']|$)/gi
    : /https?:\/\/(?:www\.)?csanadi-bp\.edu\.hu(?=[/:?\s"'<>]|$)/gi;
  oldDomainUrls+=[...content.matchAll(realLinks)].length;
}
set('noLegacySchoolWebsiteLinks',oldDomainUrls===0);
for(const file of html){
  const contents=read(file);
  for(const match of contents.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)){
    const url=match[1];
    if(/^(?:https?:|\/\/|mailto:|tel:|#|data:)/i.test(url))continue;
    const target=url.split(/[?#]/)[0];if(!target)continue;
    const resolved=path.resolve(root,path.dirname(file),target);
    if(!resolved.startsWith(root+path.sep)||!fs.existsSync(resolved))fileProblems.push(file+' → '+target);
  }
}
set('localHtmlAssetsAndLinksExist',fileProblems.length===0);

const pageHtml=read('index.html');const mapHtml=read('megkozelites-es-tanulas.html');
const mainJS=read('js/app.js');const subJS=read('js/subpages-v1.js');
const headerCSS=read('css/subpage-header-fix.css');const qualityCSS=read('css/quality-polish-v1.css');
const configuration=JSON.parse(read('json/config.json'));
set('versionedEntryPoints',pageHtml.includes('script.js?v=1.26.0')&&pageHtml.includes('subpage-header-fix.css?v=1.26.0')&&pageHtml.includes('quality-polish-v1.css?v=1.26.0')&&read('script.js').includes('app.js?v=1.26.0'));
set('versionedCache',configuration.performance?.cacheVersion==='csanadi-r-v1.26.0'&&pageHtml.includes('csanadi-r-v1.26.0'));
set('bootstrapCDNOnly',pageHtml.includes('cdn.jsdelivr.net/npm/bootstrap@5.3.9/')&&!files.some(p=>/(?:bootstrap\.min\.(?:css|js)|bootstrap\.bundle\.min\.js)$/.test(p)));
set('realSubpageMenuToggle',mainJS.includes("document.addEventListener('csanadi:menu-toggle',toggleSiteMap)")&&subJS.includes("document.dispatchEvent(new Event('csanadi:menu-toggle'))"));
set('compactSubpageMenuUsesCenteredSchoolLogo',subJS.includes('cs-subpage-menu-logo')&&subJS.includes('assets/media/logo/csanadi-cimer-512.webp')&&!subJS.includes('aria-hidden="true">☰')&&headerCSS.includes('left:50%!important;top:50%!important')&&headerCSS.includes('transform:translate(-50%,-50%)!important')&&headerCSS.includes('.cs-subpage-menu-label{display:none!important}'));
set('fullSubpageHeaderAlsoCentersLogo',headerCSS.includes('body.cs-inner-page #site-header .brand,')&&headerCSS.includes('body.cs-inner-page #site-header .header-tag,')&&headerCSS.includes('body.cs-inner-page #site-header .cs-subpage-menu-logo{display:block!important')&&subJS.includes('shouldCondenseSubpageHeader'));
set('mobileOnlyBottomEmblemVisible',headerCSS.includes('body.cs-inner-page:has(#ext26-mobile-nav) #site-header .cs-subpage-menu{display:none!important}')&&read('mobile/quick-nav.js').includes("document.dispatchEvent(new Event('csanadi:menu-toggle'))")&&read('mobile/quick-nav.js').includes('csanadi-cimer-512.webp')&&mainJS.includes("../mobile/quick-nav.js?v=1.26.0"));
set('subpageLogoDoesNotDuplicate',subJS.includes("if (document.getElementById('cs-subpage-menu')) return;"));
set('compactSubpageHeaderHidesRedundantText',headerCSS.includes('.brand{display:none!important}')&&headerCSS.includes('.header-kreta,')&&headerCSS.includes('.theme-label,'));
const rule31=JSON.parse(read('dokumentacio/SZABALYOK_31_ALOLDAL_V1_9.json'));
set('all31RulesHavePageBasedWorklist',rule31.pages===65&&rule31.criteria===31&&rule31.openItems===55&&rule31.open.every(x=>x.ruleNumber===28));
set('interactiveRule31WorklistAndJsonImport',read('tools/tartalmi-hitelesites.html').includes('value="criteria"')&&read('tools/tartalmi-hitelesites.html').includes('id="importjson"')&&read('tools/tartalmi-hitelesites.js').includes('SZABALYOK_31_ALOLDAL_V1_9.json')&&read('tools/tartalmi-hitelesites.js').includes("incoming.kind !== state.kind"));
set('newMediaPublicationRequiresEvidence',read('tools/media-manager-2026.js').includes('rightsEvidence')&&read('tools/media-manager-2026.js').includes('institutionallyApproved:false')&&read('tools/eszkoz-mediator.html').includes('id="mm-rights-reviewer"'));
set('mediaWorklistExportExists',read('tools/media-manager-2026.js').includes('function reviewWorklist()')&&read('tools/eszkoz-mediator.html').includes('id="mm-review-report"'));
set('mediaRightsFilterIncludesUnregisteredPublicAssets',read('tools/media-manager-2026.js').includes('function rightsNeedsReview(item)')&&read('tools/media-manager-2026.js').includes("!!item._publish&&!item._rightsStatus")&&read('tools/build-content-audit-v1-9.js').includes('rightsEditorConfirmedUnapproved'));
set('launcherPreservedAcrossNavigation',mainJS.includes("container.insertAdjacentElement('afterend',launcher)")&&mainJS.includes("homeHeroElement.querySelector('.csn26-visual-row')?.append(launcher)"));
set('compactHeaderAccessible',headerCSS.includes('position:sticky!important')&&headerCSS.includes('#site-header #search-open{display:grid!important')&&headerCSS.includes('.cs-header-condensed'));
set('emptyEmbeddedHeroHidden',headerCSS.includes('cs-embedded-arrival #global-hero:empty')&&headerCSS.includes('min-height:0!important'));
set('centeredCommonContent',qualityCSS.includes('.section-title')&&qualityCSS.includes('.section-actions')&&qualityCSS.includes('.cs-arrival-shell-heading'));
set('centeredMapExperience',qualityCSS.includes('body.arrival2 .arrival2-hero')&&qualityCSS.includes('body.arrival2 .arrival2-route-actions a')&&mapHtml.includes('quality-polish-v1.css?v=1.26.0'));
set('correctMapInteractionVersion',mapHtml.includes('round26-arrival.js?v=1.26.0'));
set('releaseBannerOnlyForNewerVersion',read('js/round13-network.js').includes('actuallyNewer(version,loadedVersion)'));
set('logoReturnsHome',pageHtml.includes('class="brand" href="#/"'));
const assetInventory=JSON.parse(read('json/assets-inventory.json'));
const physicalAssets=files.filter(p=>p.startsWith('assets/'));
const catalogued=new Set(assetInventory.items.map(item=>item.path));
set('all628AssetsCatalogued',physicalAssets.length===628&&assetInventory.items.length===628&&physicalAssets.every(p=>catalogued.has(p)));
const expansion=JSON.parse(read('dokumentacio/MEDIA_BOVITESI_KERET_V1_9.json'));
set('sixfoldExpansionOnlyPlanned',expansion.mode==='planning-only'&&expansion.multiplier===6&&expansion.originalFileCount===628&&expansion.derivativeImages===353&&expansion.existingQrGraphics===87&&expansion.uniqueBaselineEstimate===188&&expansion.indicativeTotalNew===940);
set('all87QRCodesManaged',assetInventory.items.filter(item=>item.path.startsWith('assets/qr/')).length===87&&read('tools/media-manager-2026.js').includes('graphics|documents|qr'));
set('responsiveAssetsEditable',read('tools/eszkoz-mediator.html').includes('value="assets/media/web/responsive"')&&read('tools/media-manager-2026.js').includes('web(?:\\/responsive)'));
set('newPublicMediaRequiresRightsReview',read('tools/media-manager-2026.js').includes('publish&&!item._wasPublished&&!rights')&&read('tools/media-manager-2026.js').includes('!item._rightsChecked')&&read('tools/eszkoz-mediator.html').includes('id="mm-rights-ok"'));
set('allToolsShareUnifiedTheme',files.filter(p=>p.startsWith('tools/')&&p.endsWith('.html')).every(p=>read(p).includes('tool-ui-2026.js?v=1.26.0'))&&read('tools/tool-ui-2026.js').includes('tools-unified-v1.css?v=1.26.0'));
const refsIndex=JSON.parse(read('json/assets-project-index.json'));
set('allJsonSourcesIndexed',refsIndex.jsonFiles.length===json.filter(p=>p.startsWith('json/')&&p!=='json/assets-project-index.json').length);
set('qrReferencesIndexed',refsIndex.jsonFiles.includes('json/adatok/qr-index-22.json')&&refsIndex.assetReferences['assets/qr/csanadi-qr-06b6013647d5dabb.svg']?.includes('json/adatok/qr-index-22.json'));
set('mediaReviewFiltersAndKeyboardSkip',read('tools/eszkoz-mediator.html').includes('id="mm-review"')&&read('tools/media-manager-2026.js').includes('needs-review')&&read('tools/tool-ui-2026.js').includes('Ugrás a segédprogram tartalmára'));
const qrIndex=JSON.parse(read('json/adatok/qr-index-22.json'));
const qrTargets=qrIndex.entries.flatMap(x=>Object.values(x.targets||{}));
set('qrTargetsAvoidOldSchoolWebsite',qrTargets.every(x=>!/^https?:\/\/(?:www\.)?csanadi-bp\.edu\.hu(?:\/|$)/i.test(x.url||'')));
set('qrSvgFilesExist',qrTargets.every(x=>catalogued.has(x.svg)));

// Saját, minimális DOM a pipák változáseseményének próbájához: a jelölőnégyzet
// nem cserélhető ki a change eseményen belül (különben mobilon újra elbillenhet).
class Element{
  constructor(tag){this.tag=tag;this.children=[];this.listeners={};this.checked=false;this.value='';this.textContent='';}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=[...children];}
  addEventListener(name,callback){this.listeners[name]=callback;}
  fire(name){this.listeners[name]?.({preventDefault(){}});}
}
const elements=new Map();
const storage=new Map();
const context=vm.createContext({
  document:{getElementById:id=>{if(!elements.has(id))elements.set(id,new Element('div'));return elements.get(id);},createElement:tag=>new Element(tag)},
  localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},
  confirm:()=>true,Math,Date,URL,console
});
const embeddedSource=read('js/round26-arrival.js').split('async function main()')[0];
vm.runInContext(embeddedSource,context);
const data=JSON.parse(read('json/adatok/megkozelites-fejlodes-26.json'));
const env=configuration.runtime.round26;
context.__taskData=data;context.__taskSettings=env;
vm.runInContext('data=__taskData;settings=__taskSettings;admissions();goals();',context);
const stepList=elements.get('r26-admission-steps');
const firstCheckbox=stepList.children[0].children[0].children[0];
firstCheckbox.checked=true;firstCheckbox.fire('change');
set('admissionCheckboxKeepsState',stepList.children[0].children[0].children[0]===firstCheckbox&&firstCheckbox.checked===true&&elements.get('r26-admission-status').textContent.startsWith('1 / '));
set('admissionCheckboxPersists',JSON.parse(storage.get('csanadi-r26-admission')).items.includes(data.admissionSteps[0].id));
elements.get('r26-admission-reset').fire('click');
set('admissionResetWorks',elements.get('r26-admission-status').textContent.startsWith('0 / '));
elements.get('r26-goal-category').value=data.goalCategories[0];
context.document.getElementById('r26-goal-title').value='Ellenőrző cél';
elements.get('r26-goal-form').fire('submit');
const goalList=elements.get('r26-goal-results');
set('addGoalWorks',goalList.children.length===1&&elements.get('r26-goal-status').textContent.includes('1 cél'));
const goalCheckbox=goalList.children[0].children[0].children[0];
goalCheckbox.checked=true;goalCheckbox.fire('change');
set('goalCheckboxKeepsState',goalList.children[0].children[0].children[0]===goalCheckbox&&goalCheckbox.checked&&elements.get('r26-goal-status').textContent.includes('1 teljesített'));

const statusCsv=read('dokumentacio/ALOLDALAK_31_SZABALY_ELLENORZES.csv').trim().split(/\r?\n/);
const count={F:0,K:0,V:0,N:0,H:0};
for(const line of statusCsv.slice(1)){
  const columns=[...line.matchAll(/"([^"]*)"(?:;|$)/g)].map(m=>m[1]);
  for(const result of columns.slice(5,36))if(result in count)count[result]++;
}
set('all31RuleCategoriesMapped',Object.values(count).reduce((a,b)=>a+b,0)===65*31);
const failures=Object.entries(checks).filter(([,passed])=>!passed).map(([name])=>name);
const report={version:'1.26.0',createdAt:new Date().toISOString(),pages:records.length,htmlFiles:html.length,jsonFiles:json.length,jsFiles:javascript.length,oldDomainUrls,criteriaStatuses:count,checks,failures,jsonProblems,jsProblems,fileProblems,warnings,limitations:[
  'A 31 korábbi C változat részletes szövege nem mind áll rendelkezésre; a meglévő 65×31 mátrix részben forrásalapú.',
  'A v1.26.0 helyi és automatizált vizsgálata nem egyenértékű a valódi mobilos, asztali, érintéses és vizuális böngészős ellenőrzéssel.',
  'A korábbi felhőböngészős teszt biztonsági korlátozás miatt nem érte el a helyi oldalt. Az új kiadást nem telepítettük, a valódi böngészős ellenőrzés eredményét külön kell jelezni.',
  'Az 55 nyitott minőségellenőrzési tétel, a médiák jogállása és a külső térképszolgáltatás elérhetősége külön intézményi ellenőrzést kíván.'
]};
fs.writeFileSync(path.join(root,'dokumentacio','AUDIT_V1_15.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({pages:records.length,html:html.length,json:json.length,javascript:javascript.length,checks:Object.keys(checks).length,passed:Object.keys(checks).length-failures.length,failures,oldDomainUrls,fileProblems:fileProblems.slice(0,12),statuses:count}));
if(failures.length)process.exitCode=1;
