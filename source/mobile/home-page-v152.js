/** 1.53 – mobil kezdőlap: sem desktop kirakat, sem desktop gyorsnavigáció,
 * sem desktop lenyíló témasor nem épül fel. A sorrend a config.json-ban van. */
import {renderBlock,dom} from '../js/blocks.js?v=1.53';
import {setting} from '../js/site-settings-2026.js?v=1.53';
import {renderStudentAchievements} from '../js/student-achievements.js?v=1.53';
import {renderNewsTeasers} from '../js/news-2026.js?v=1.53';
import {renderDocumentQuickLinks} from '../js/documents.js?v=1.53';

export function renderMobileHomePage(node){
 const config=setting('runtime.mobileHome');
 const pages=new Map((node?.page?.blocks||[]).map(block=>[block.id,block]));
 const fragment=document.createDocumentFragment();
 const canvas=dom('div',{class:'cs-mobile-home'});
 const add=(element,role)=>{
  if(!element)return;
  const outer=dom('div',{class:'cs-mobile-home-unit cs-mobile-home-unit--'+role});
  outer.append(element);canvas.append(outer);
 };
 if(config.showStudentAchievements)add(renderStudentAchievements('home'),'achievements');
 if(config.showNews)add(renderNewsTeasers(),'news');
 for(const id of config.blocks||[]){
  const block=pages.get(id);
  if(!block||['hero','live-dashboard'].includes(block.type))continue;
  add(renderBlock(block),'content');
 }
 if(config.showDocuments)add(renderDocumentQuickLinks(),'documents');
 fragment.append(canvas);
 return fragment;
}
