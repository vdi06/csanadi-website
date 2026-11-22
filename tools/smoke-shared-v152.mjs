/** Futtatás: node tools/smoke-shared-v152.mjs (előtte helyi HTTP-kiszolgáló a 8765-ös porton). */
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root=path.resolve(import.meta.dirname,'..');
const base=process.env.CSANADI_SMOKE_URL||'http://127.0.0.1:8765/';
const pages=JSON.parse(fs.readFileSync(path.join(root,'source/json/page-index.json'),'utf8')).pages;
const routes=[...new Set(Object.values(pages).map(x=>x.schemaExtensions?.route).filter(Boolean))];
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const result=[];
for(const platform of ['mobile','desktop']){
 const context=await browser.newContext(platform==='mobile'?{
  viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2
 }:{viewport:{width:1365,height:900},isMobile:false,hasTouch:false});
 const page=await context.newPage();
 const missing=[],runtimeErrors=[];
 page.on('response',r=>{if(r.status()===404&&r.url().startsWith(base))missing.push(r.url().slice(base.length));});
 page.on('pageerror',error=>runtimeErrors.push(String(error.message).slice(0,250)));
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(3200);
 const chosen=await page.evaluate(()=>document.querySelector('base')?.href||'');
 const first=await page.evaluate(()=>({title:document.title,app:!!document.querySelector('#app'),imgs:[...document.images].length,broken:[...document.images].filter(x=>x.complete&&!x.naturalWidth&&!x.hidden).slice(0,8).map(x=>x.src)}));
 let visited=0,overflow=0;
 for(const route of routes){
  await page.evaluate(h=>location.hash=h,route);
  await page.waitForTimeout(70);
  const info=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>window.innerWidth+2}));
  if(info.overflow)overflow++;
  visited++;
 }
 result.push({platform,chosen,first,visited,overflow,missing:[...new Set(missing)],runtimeErrors:[...new Set(runtimeErrors)]});
 await context.close();
}
await browser.close();
const out=path.join(root,'reports/runtime-smoke-v152.json');
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
for(const item of result)console.log(JSON.stringify({platform:item.platform,chosen:item.chosen,visited:item.visited,overflow:item.overflow,missing:item.missing.slice(0,18),errors:item.runtimeErrors.slice(0,8),first:item.first}));
if(result.some(x=>x.missing.length||x.runtimeErrors.length))process.exitCode=1;
