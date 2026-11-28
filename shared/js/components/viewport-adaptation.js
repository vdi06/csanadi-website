import {createCompanionNavigator} from './companion-navigator.js?v=2.84';
import {element as el} from '../dom.js?v=2.84';
export function viewportState({width,height,visualHeight,visualWidth,scale=1,editing=false,segments=[]}){
 const keyboard=editing&&Math.abs(scale-1)<.05&&height-visualHeight>=120&&visualHeight<height*.8;
 const split=Array.isArray(segments)&&segments.length===2&&segments.every(s=>Number.isFinite(s.width)&&Number.isFinite(s.height)&&s.width>0&&s.height>0);
 const horizontal=split&&Math.abs(segments[0].left-segments[1].left)>1;
 return {keyboard,visibleHeight:Math.max(1,Math.min(height,visualHeight||height)),visibleWidth:Math.max(1,Math.min(width,visualWidth||width)),segmented:split,segmentAxis:split?(horizontal?'horizontal':'vertical'):'none',segmentWidth:split?Math.min(...segments.map(s=>s.width)):width};
}
export function mountViewportAdaptation(root,config){
 const html=document.documentElement,v=window.visualViewport;let frame=0,compact=false,companion=null;
 function updateCompanion(state,segments){
  const main=root.querySelector('main');const pair=state.segmentAxis==='horizontal'?[...segments].sort((a,b)=>a.left-b.left):[];const right=pair[1];const usable=main&&right&&right.width>=220&&right.height>=160&&right.left>=0&&right.left+right.width<=innerWidth+2;
  if(!usable){companion?.remove();companion=null;return;}
  if(!companion){companion=el('aside',{className:'segment-companion',attributes:{'aria-label':'Második kijelzőpanel'}},el('h2',{text:'Gyorselérés'}),el('p',{text:'A fő tartalom az első kijelzőpanelen marad.'}),el('nav',{},...[["Kezdőlap","#/kezdolap"],["Órarend","#/oldal/information-timetable"],["Naptár","#/oldal/news-calendar"],["Dokumentumok","#/oldal/information-documents"],["Kapcsolat","#/oldal/information-contact"]].map(([text,href])=>el('a',{text,attributes:{href}}))));if(config&&!config.gateOnly)companion.append(createCompanionNavigator(config));root.append(companion);}
  companion.style.setProperty('--segment-left',Math.round(right.left)+'px');companion.style.setProperty('--segment-top',Math.round(Math.max(0,right.top||0))+'px');companion.style.setProperty('--segment-panel-width',Math.round(right.width)+'px');companion.style.setProperty('--segment-panel-height',Math.round(Math.min(right.height,state.visibleHeight))+'px');
 }
 function update(){frame=0;let segments=[];try{segments=Array.from(v?.segments||window.getWindowSegments?.()||[]);}catch{}
 const active=document.activeElement,editing=!!active?.matches('input:not([type=button]):not([type=checkbox]):not([type=radio]):not([type=file]),textarea,[contenteditable=true]');
 const state=viewportState({width:innerWidth,height:innerHeight,visualHeight:v?.height||innerHeight,visualWidth:v?.width||innerWidth,scale:v?.scale||1,editing,segments});
 html.dataset.virtualKeyboard=String(state.keyboard);html.dataset.viewportSegments=state.segmentAxis;html.dataset.fullscreen=String(!!document.fullscreenElement);updateCompanion(state,segments);
 html.style.setProperty('--visible-height',Math.round(state.visibleHeight)+'px');html.style.setProperty('--segment-width',Math.round(state.segmentWidth)+'px');
 // Use hysteresis, so a change in the header height cannot oscillate the state.
 if(scrollY>160)compact=true;else if(scrollY<72)compact=false;html.dataset.compactHeader=String(compact);
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update);}
 const listeners=[[window,'resize'],[window,'scroll'],[document,'focusin'],[document,'focusout'],[document,'fullscreenchange'],[window,'orientationchange']];if(v)listeners.push([v,'resize'],[v,'scroll']);for(const [target,event] of listeners)target.addEventListener(event,schedule,{passive:true});update();
 return ()=>{companion?.remove();delete html.dataset.fullscreen;if(frame)cancelAnimationFrame(frame);for(const [target,event] of listeners)target.removeEventListener(event,schedule);delete html.dataset.virtualKeyboard;delete html.dataset.viewportSegments;delete html.dataset.compactHeader;html.style.removeProperty('--visible-height');html.style.removeProperty('--segment-width');};
}
