const make=(tag,cls='',label='')=>{const element=document.createElement(tag);if(cls)element.className=cls;if(label)element.textContent=label;return element;};
const root=new URL('../index.html',import.meta.url);
const allowedRoute=/^#\/[a-z0-9\-/]*$/;
const formats={desktop:1200,tablet:768,mobile:390};

function picker(label,choices,current){
 const element=make('label','cs25-picker');element.append(make('span','',label));
 const select=make('select');for(const [value,text] of choices){const option=make('option','',text);option.value=value;select.append(option);}
 select.value=current;element.append(select);return {element,select};
}

export function createLivePreview({route,title='Aloldal'}={}){
 if(!allowedRoute.test(route||''))throw Error('Az oldal előnézeti útvonala érvénytelen.');
 const host=make('section','cs25-preview');host.hidden=true;host.setAttribute('aria-label','Élő előnézet');
 const heading=make('h4','','Élő előnézet · '+title);
 const disclaimer=make('p','cs25-preview-note','A helyi munkapéldány ellenőrzése. Az előnézet nem közzététel és nem intézményi jóváhagyás; a hivatkozások itt nem navigálnak.');
 const device=picker('Eszköz',[['desktop','Asztali · 1200 px'],['tablet','Táblagép · 768 px'],['mobile','Mobil · 390 px']],'desktop');
 const theme=picker('Megjelenés',[['light','Világos'],['dark','Sötét']],'light');
 const source=picker('Tartalom',[['draft','Helyi tervezet / aktuális mezők'],['base','Kiadott alapállapot']],'draft');
 const reload=make('button','cs-tool-button','↻ Frissítés');reload.type='button';
 const controls=make('div','cs25-preview-controls');controls.append(device.element,theme.element,source.element,reload);
 const frameZone=make('div','cs25-preview-zone'),frame=make('iframe','cs25-preview-frame');
 frame.title=title+' előnézete';frame.setAttribute('loading','eager');frame.setAttribute('referrerpolicy','same-origin');
 const status=make('p','cs25-preview-status','Nyisd meg az előnézetet a megtekintéshez.');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 frameZone.append(frame);host.append(heading,disclaimer,controls,frameZone,status);
 let active=false,ready=false,latest=null,version=0;
 const sync=()=>{
  if(!active||!ready||source.select.value!=='draft'||!latest)return;
  frame.contentWindow?.postMessage({type:'csanadi-c3-preview-page',route,path:latest.path,page:latest.page},location.origin);
 };
 const refresh=()=>{
  if(!active)return;
  ready=false;version++;
  const url=new URL(root);url.searchParams.set('preview','1');url.searchParams.set('previewMode',source.select.value);url.searchParams.set('previewTheme',theme.select.value);url.searchParams.set('previewRefresh',String(version));url.hash=route;
  frame.src=url.href;
  status.textContent='Előnézet betöltése…';
 };
 const resize=()=>{
  frame.style.width=formats[device.select.value]+'px';
  frameZone.dataset.cs25Device=device.select.value;
  status.textContent=`${formats[device.select.value]} px szélesség · ${theme.select.value==='dark'?'sötét':'világos'} téma · ${source.select.value==='base'?'kiadott alap':'helyi tervezet'}`;
 };
 const onMessage=event=>{
  if(!active||event.origin!==location.origin||event.source!==frame.contentWindow)return;
  if(event.data?.type==='csanadi-c3-preview-ready'&&event.data.route===route){ready=true;resize();sync();}
  if(event.data?.type==='csanadi-c3-preview-applied')status.textContent='Az aktuális, nem mentett mezőértékek megjelentek az előnézetben.';
  if(event.data?.type==='csanadi-c3-preview-error')status.textContent='Előnézeti hiba: '+String(event.data.message||'Érvénytelen tervezet').slice(0,160);
 };
 window.addEventListener('message',onMessage);
 device.select.addEventListener('change',resize);
 for(const element of [theme.select,source.select])element.addEventListener('change',refresh);
 reload.addEventListener('click',refresh);
 resize();
 return {element:host,
  show(){active=true;host.hidden=false;resize();refresh();},
  hide(){active=false;host.hidden=true;ready=false;frame.removeAttribute('src');status.textContent='Az előnézet bezárva.';},
  updateDraft(path,page){latest={path,page};sync();},
  error(message){status.textContent='A módosítás nem előnézetezhető: '+String(message).slice(0,160);},
  destroy(){active=false;ready=false;window.removeEventListener('message',onMessage);frame.removeAttribute('src');host.remove();}
 };
}

export function openStandalonePreview({route,title='Aloldal'}={}){
 const dialog=make('dialog','cs25-preview-dialog');dialog.setAttribute('aria-label',title+' élő előnézete');
 const head=make('div','cs25-preview-dialog-head');head.append(make('strong','','C3 · Élő előnézet'));
 const close=make('button','cs-tool-button','Bezárás');close.type='button';head.append(close);
 const preview=createLivePreview({route,title});dialog.append(head,preview.element);
 document.body.append(dialog);dialog.addEventListener('close',()=>{preview.destroy();dialog.remove();},{once:true});
 close.addEventListener('click',()=>dialog.close());dialog.showModal();preview.show();return preview;
}
