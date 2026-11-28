import {element as el} from '../dom.js?v=2.82';
export const ZOOM_LEVELS=Object.freeze([100,125,150,175,200]);
export function timelineZoom(value){const n=Number(value);return ZOOM_LEVELS.includes(n)?n:100;}
export function addTimelineControls(list,label,{minimum=170}={}){
 let zoom=100;list.tabIndex=0;list.setAttribute('aria-label',label+' – vízszintesen görgethető');list.classList.add('timeline-scroll-280');
 const status=el('span',{className:'timeline-status-280',attributes:{role:'status'},text:'100%'});
 const button=(text,name,fn)=>{const b=el('button',{className:'numbers-detail-button',text,attributes:{type:'button','aria-label':name}});b.addEventListener('click',fn);return b;};
 const scale=el('select',{attributes:{'aria-label':label+' nagyítása'}},...ZOOM_LEVELS.map(v=>el('option',{text:v+'%',attributes:{value:v}})));
 function apply(value){zoom=timelineZoom(value);scale.value=String(zoom);list.style.setProperty('--timeline-min',Math.round(minimum*zoom/100)+'px');status.textContent=zoom+'%';}
 function slide(direction){const item=list.firstElementChild,step=Math.max(list.clientWidth*.8,(item?.getBoundingClientRect().width||0)+16,100);list.scrollTo({left:Math.max(0,Math.min(list.scrollWidth-list.clientWidth,list.scrollLeft+direction*step)),behavior:'instant'});}
 scale.addEventListener('change',()=>apply(scale.value));list.addEventListener('keydown',e=>{if(e.target!==list)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();slide(e.key==='ArrowRight'?1:-1);}else if(e.key==='Home'||e.key==='End'){e.preventDefault();list.scrollLeft=e.key==='Home'?0:list.scrollWidth;}});
 const controls=el('div',{className:'timeline-tools-280'},button('‹','Korábbi események – '+label,()=>slide(-1)),el('label',{},el('span',{text:'Nagyítás'}),scale),status,button('›','Későbbi események – '+label,()=>slide(1)),button('Alaphelyzet','Idővonal nagyításának visszaállítása – '+label,()=>{apply(100);list.scrollLeft=0;}));
 apply(100);return {controls,list,getZoom:()=>zoom,setZoom:apply};
}
