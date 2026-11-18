import {planQaRemediation} from './qa-remediation-core-v1-40-10.mjs';
import {planSeoActivation} from './seo-consent-core-v1-40-10.mjs';
import {assessWebVitals} from './vitals-review-core-v1-40-10.mjs';
const $=id=>document.getElementById(id);
const results={qa:null,seo:null,vitals:null};
async function readFile(input,optional=false){
 const file=input.files?.[0];if(!file){if(optional)return null;throw Error('Válassz ki egy JSON-fájlt.');}
 if(file.size>5*1024*1024)throw Error('A fájl nem lehet nagyobb 5 MiB-nál.');return JSON.parse(await file.text());
}
const json=async path=>{const response=await fetch('../json/'+path,{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status+': '+path);return response.json();};
const message=(id,text)=>{$(id).textContent=text;};
function save(key,filename){
 const blob=new Blob([JSON.stringify(results[key],null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
$('qa-check').addEventListener('click',async()=>{
 results.qa=null;$('qa-save').disabled=true;
 try{const before=await readFile($('qa-before')),after=await readFile($('qa-after'),true);
  results.qa=planQaRemediation(before,after);$('qa-save').disabled=false;
  message('qa-status',`${results.qa.measurementCount} kiinduló mérés, ${results.qa.issues.length} nyitott tétel; valós akadálymentességi tanúsítás nincs.`);
 }catch(error){message('qa-status','Hiba: '+error.message);}
});
$('qa-save').addEventListener('click',()=>results.qa&&save('qa','csanadi_mobil_javitasi_terv_v1_40_10.json'));
$('seo-check').addEventListener('click',async()=>{
 results.seo=null;$('seo-save').disabled=true;
 try{
  const approvals=await readFile($('seo-approvals'),true),index=await json('oldalindex.json');
  const pages=await Promise.all(Object.keys(index.pages||{}).map(key=>json(key)));
  results.seo=planSeoActivation(pages,approvals?.approvals||[],{baseUrl:$('seo-domain').value,domainApproved:$('seo-domain-confirm').checked});
  $('seo-save').disabled=false;
  message('seo-status',`${results.seo.pages} oldalból ${results.seo.eligible} teljesen előkészített; indexelés nem történt. ${results.seo.issues.join('; ')}`);
 }catch(error){message('seo-status','Hiba: '+error.message);}
});
$('seo-save').addEventListener('click',()=>results.seo&&save('seo','csanadi_seo_engedelyezesi_elonezet_v1_40_10.json'));
$('vitals-check').addEventListener('click',async()=>{
 results.vitals=null;$('vitals-save').disabled=true;
 try{
  results.vitals=assessWebVitals(await readFile($('vitals-input')));$('vitals-save').disabled=false;
  message('vitals-status',`${results.vitals.measurementCount} mérés, ${results.vitals.rows.filter(x=>x.pass).length} célértékeken belül, ${results.vitals.issues.length} formátumhiba. Az eredmények forrásellenőrzése még szükséges.`);
 }catch(error){message('vitals-status','Hiba: '+error.message);}
});
$('vitals-save').addEventListener('click',()=>results.vitals&&save('vitals','csanadi_web_vitals_v1_40_10.json'));
