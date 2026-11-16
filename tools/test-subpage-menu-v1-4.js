/* Az aloldali menü két fontos regresszióját statikusan ellenőrzi. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const app=read('js/app.js'),sub=read('js/subpages-v1.js'),css=read('css/subpage-header-fix.css'),html=read('index.html'),startup=read('script.js');
const checks={
 scriptSyntax:['js/app.js','js/subpages-v1.js','script.js'].every(p=>{try{cp.execFileSync('node',['--check',path.join(root,p)],{stdio:'pipe'});return true;}catch{return false;}}),
 launcherProtectedDuringHeroChange:app.includes('container.insertAdjacentElement(\'afterend\',launcher)'),
 launcherRestoredToHome:app.includes("homeHeroElement.querySelector('.csn26-visual-row')?.append(launcher)"),
 launcherRestoredAfterOverlay:app.includes("hero.insertAdjacentElement('afterend',launcher)"),
 menuDelegatesToWorkingTrigger:sub.includes("document.getElementById('orbit-open')?.click()"),
 ariaStateSynced:sub.includes("attributeFilter:['hidden']")&&sub.includes("menu.setAttribute('aria-expanded'"),
 headerSticky:css.includes('position:sticky!important'),
 searchVisibleOnSubpage:css.includes('#site-header #search-open{display:grid!important;visibility:visible!important'),
 menuVisibleOnSubpage:css.includes('#site-header .cs-subpage-menu{')&&css.includes('display:inline-flex!important'),
 duplicateMobileMenuHidden:css.includes('#site-header #mobile-menu-toggle{display:none!important'),
 newCssLoaded:html.includes('subpage-header-fix.css?v=1.4.0'),
 freshCodeLoaded:startup.includes("subpages-v1.js?v=1.4.0")&&html.includes('script.js?v=1.4.0'),
 cacheVersionMatches:JSON.parse(read('json/config.json')).performance.cacheVersion==='csanadi-r-v1.4.0'&&html.includes('round13-network.js?v=csanadi-r-v1.4.0')
};
const failures=Object.entries(checks).filter(([,success])=>!success).map(([name])=>name),report={version:'1.4.0',checkedAt:new Date().toISOString(),checks,passed:failures.length===0,failures,limitations:['A valós böngészős útvonalváltás és a reszponzív látvány ellenőrzése nem hajtható végre ebben a futtatási környezetben.']};
fs.writeFileSync(path.join(root,'dokumentacio','ALOLDALI_MENU_TESZT_V1_4.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));if(failures.length)process.exitCode=1;
