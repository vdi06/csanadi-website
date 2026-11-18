import {validateEditorialRules} from '../js/search-recommendations-v1-40-9.js';
const $=id=>document.getElementById(id);
const source=$('editor-source'),target=$('editor-target'),list=$('editor-rules'),status=$('editor-status');
let entries=[],rules=[];
async function loadJSON(path){const result=await fetch('../json/'+path,{cache:'no-store'});if(!result.ok)throw Error(`HTTP ${result.status} · ${path}`);return result.json();}
function listed(){return entries.map(x=>({...x,sourceType:x.type,sourceId:x.id}));}
function toOption(item){const option=document.createElement('option');option.value=`${item.type}:${item.id}`;option.textContent=`${item.title} · ${item.type}`;return option;}
async function init(){
 try{
  const [pages,news,events,docs,curation]=await Promise.all([
   loadJSON('oldalindex.json'),loadJSON('adatok/hirek-hivatalos.json'),loadJSON('adatok/esemenyek.json'),
   loadJSON('adatok/dokumentumok.json'),loadJSON('adatok/ajanlasi-szabalyok-v1-40-10.json')]);
  entries=[...Object.values(pages.pages||{}).filter(p=>p.lifecycle?.status==='published').map(p=>({type:'page',id:p.id,title:p.title,href:p.schemaExtensions?.route})),
   ...(news.items||[]).filter(x=>x.status==='verified').map(x=>({type:'news',id:x.id,title:x.title,href:'#/hirek-es-esemenyek/hirek'})),
   ...(events.items||[]).filter(x=>x.status==='published'&&x.verified===true).map(x=>({type:'event',id:x.id,title:x.title,href:'#/hirek-es-esemenyek/esemenynaptar'})),
   ...(docs.documents||[]).filter(x=>x.status==='published').map(x=>({type:'document',id:x.id,title:x.title,href:x.filePath||'#/informaciok/dokumentumtar'}))]
   .filter(x=>x.id&&x.title&&x.href);
  for(const item of entries){source.add(toOption(item));target.add(toOption(item));}
  rules=Array.isArray(curation.rules)?curation.rules:[];render();
 }catch(error){status.textContent='Betöltési hiba: '+error.message;}
}
function render(){
 const checked=validateEditorialRules(rules,entries);list.replaceChildren();
 for(const [index,rule] of rules.entries()){
  const li=document.createElement('li');
  const label=document.createElement('span');label.textContent=`${rule.sourceType}:${rule.sourceId} → ${rule.targetType}:${rule.targetId} · ${rule.action==='boost'?'kiemelés '+rule.priority:'kizárás'}`;
  const button=document.createElement('button');button.type='button';button.textContent='Eltávolítás';button.addEventListener('click',()=>{rules.splice(index,1);render();});li.append(label,' ',button);list.append(li);
 }
 status.textContent=`${entries.length} közzétett tartalom · ${rules.length} szerkesztői tervezet · ${checked.problems.length} hiba. ${checked.problems.join('; ')}`;
 $('editor-export').disabled=rules.length===0||checked.problems.length>0;
}
$('editor-form').addEventListener('submit',event=>{
 event.preventDefault();const [sourceType,...sourceParts]=source.value.split(':'),[targetType,...targetParts]=target.value.split(':');
 const rule={sourceType,sourceId:sourceParts.join(':'),targetType,targetId:targetParts.join(':'),action:$('editor-action').value,priority:Number($('editor-priority').value),approved:$('editor-approval').checked};
 rules.push(rule);render();if($('editor-export').disabled)rules.pop();render();
});
$('editor-export').addEventListener('click',()=>{
 const value={schemaVersion:'1.0.0',release:'1.40.10',rules,publicationApprovalRecorded:false,uploadedToServer:false};
 const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');
 anchor.href=url;anchor.download='ajanlasi-szabalyok-v1-40-10.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
});
$('editor-import').addEventListener('change',async event=>{
 try{const file=event.target.files?.[0];if(!file)return;if(file.size>1024*1024)throw Error('Legfeljebb 1 MiB szabályjegyzék olvasható.');
  const imported=JSON.parse(await file.text());if(!Array.isArray(imported.rules))throw Error('Hiányzó szabálylista');
  const checked=validateEditorialRules(imported.rules,entries);if(checked.problems.length)throw Error(checked.problems.join('; '));
  rules=imported.rules;render();
 }catch(error){status.textContent='Importálási hiba: '+error.message;}
});
init();
