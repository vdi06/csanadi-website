const ele=(tag,cls='',text)=>{const item=document.createElement(tag);if(cls)item.className=cls;if(text!==undefined)item.textContent=String(text);return item;};
const norm=text=>String(text||'').toLocaleLowerCase('hu-HU').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function saveText(filename,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const link=ele('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function csv(value){return '"'+String(value??'').replace(/"/g,'""')+'"';}
async function makeDocumentList(status){
 try{
  status.textContent='Dokumentumok előkészítése…';
  const response=await fetch(new URL('../json/adatok/dokumentumok.json',import.meta.url),{cache:'no-store'});
  if(!response.ok)throw Error('A dokumentum-JSON nem tölthető be.');
  const data=await response.json();
  const docs=(data.documents||[]).filter(item=>item.status==='published');
  const rows=['Cím;Kategória;Típus;Verzió;Fájlútvonal;Összefoglaló'];
  const cats=new Map((data.categories||[]).map(c=>[c.id,c.label]));
  for(const item of docs)rows.push([item.title,cats.get(item.categoryId)||item.categoryId||'',item.documentKind||'',item.version||'',item.filePath||'',item.summary||''].map(csv).join(';'));
  saveText('csanadi_dokumentumjegyzek.csv','\ufeff'+rows.join('\r\n'),'text/csv;charset=utf-8');
  status.textContent=`${docs.length} közzétett dokumentum jegyzéke letöltve.`;
 }catch(error){status.textContent=error.message;}
}
function enhancedDocuments(){
 const section=document.querySelector('#app .doc26-collections');
 if(!section||section.querySelector('.r10-doc-export'))return;
 const tools=ele('div','r10-doc-actions');
 const download=ele('button','r10-doc-export','Dokumentumjegyzék CSV letöltése');download.type='button';
 const status=ele('span','r10-doc-status','');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 download.addEventListener('click',()=>makeDocumentList(status));tools.append(download,status);
 const heading=section.querySelector('h2');if(heading)heading.after(tools);else section.prepend(tools);
}
function enhancedMedia(){
 const root=document.getElementById('app');if(!root)return;
 root.querySelectorAll('video').forEach(video=>{
  video.preload=video.autoplay?'metadata':'none';
  video.playsInline=true;
  video.setAttribute('playsinline','');
  if(!video.hasAttribute('aria-label')&&!video.hasAttribute('title')){
   const title=video.closest('.media26-video-card')?.querySelector('h3')?.textContent;
   if(title)video.setAttribute('aria-label',title);
  }
 });
 root.querySelectorAll('img').forEach(image=>{
  if(!image.hasAttribute('decoding'))image.decoding='async';
  if(!image.hasAttribute('loading'))image.loading='lazy';
 });
}
function enhanceMenus(){
 const overlay=document.getElementById('site-map-overlay');if(!overlay)return;
 overlay.addEventListener('keydown',event=>{
  const direction=event.key==='ArrowRight'||event.key==='ArrowDown'?1:event.key==='ArrowLeft'||event.key==='ArrowUp'?-1:0;
  if(!direction&&event.key!=='Home'&&event.key!=='End')return;
  const active=document.activeElement;
  if(!active?.matches('.csn26-outer-link,.compass26-choice-link,.csn26-third-link,.compass26-sub-link'))return;
  const scope=active.matches('.csn26-outer-link,.csn26-third-link')?'#csn26-outer-ring':active.matches('.compass26-choice-link')?'#site-map-categories':'#site-map-subtopics';
  const buttons=[...overlay.querySelectorAll(scope+' a[href]')].filter(button=>button.getClientRects().length>0);
  if(buttons.length<2)return;
  const index=buttons.indexOf(active);if(index<0)return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+direction+buttons.length)%buttons.length;
  buttons[next].focus();
 });
}
export function initRound10Enhancements(){
 enhanceMenus();
 document.addEventListener('csanadi:route-rendered',()=>{
  requestAnimationFrame(()=>{enhancedDocuments();enhancedMedia();});
 });
 const nav=document.getElementById('ext26-mobile-nav');
 if(nav)nav.setAttribute('aria-label','Mobilos gyorsnavigáció, öt választással');
}
