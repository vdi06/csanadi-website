import {element} from './dom.js?v=2.62';
const NS='http://www.w3.org/2000/svg';
// Hét szegmens: felül, jobb felső, jobb alsó, alul, bal alsó, bal felső, közép.
const shapes=['0,0 13,0 16,3 13,6 3,6 0,3','14,5 17,2 20,5 20,18 17,21 14,18','14,25 17,22 20,25 20,38 17,41 14,38','0,40 3,37 13,37 16,40 13,43 3,43','0,25 3,22 6,25 6,38 3,41 0,38','0,5 3,2 6,5 6,18 3,21 0,18','0,21 3,18 13,18 16,21 13,24 3,24'];
export const digitSegments=Object.freeze(['012345','12','01643','01236','5612','05623','056423','012','0123456','012356']);
const formatters=new Map();
export function clockReading(now=new Date(),zone='Europe/Budapest'){
  if(!formatters.has(zone))formatters.set(zone,{
    time:new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}),
    date:new Intl.DateTimeFormat('hu-HU',{timeZone:zone,year:'numeric',month:'long',day:'numeric',weekday:'long'})});
  const f=formatters.get(zone); const parts=Object.fromEntries(f.time.formatToParts(now).map(p=>[p.type,p.value]));
  return {time:`${parts.hour}:${parts.minute}:${parts.second}`,date:f.date.format(now),iso:now.toISOString()};
}
function svgNode(tag,attrs={}){const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e;}
export function createHeaderClock(config){
  const settings=config.home.header.clock||{};const zone=settings.timeZone||'Europe/Budapest';
  const clock=element('div',{className:'school-header-clock',attributes:{title:settings.label||'Pontos idő Budapesten'}});
  const svg=svgNode('svg',{viewBox:'0 0 170 43','aria-hidden':'true',focusable:'false'}),digits=[];
  let x=0;
  for(const c of '00:00:00'){
    if(c===':'){svg.append(svgNode('circle',{cx:x+3,cy:15,r:2.3}),svgNode('circle',{cx:x+3,cy:30,r:2.3}));x+=10;continue;}
    const g=svgNode('g',{transform:`translate(${x} 0)`});const segments=shapes.map(points=>svgNode('polygon',{points,opacity:.09}));g.append(...segments);svg.append(g);digits.push(segments);x+=25;
  }
  const accessible=element('time',{className:'visually-hidden'});
  const dateLabel=element('span',{className:'school-clock-date',attributes:{'aria-hidden':'true'}});
  clock.append(svg,dateLabel,accessible);
  let timer=0,disposed=false,lastTime='',lastDate='';
  function tick(){
    if(disposed)return;
    clearTimeout(timer);const now=new Date(),reading=clockReading(now,zone);
    if(reading.time!==lastTime){
      const values=reading.time.replaceAll(':','');
      digits.forEach((group,i)=>{if(values[i]===lastTime.replaceAll(':','')[i])return;group.forEach((s,j)=>s.setAttribute('opacity',digitSegments[Number(values[i])].includes(String(j))?'1':'.09'));});
      clock.dataset.time=reading.time;lastTime=reading.time;
    }
    if(reading.date!==lastDate){dateLabel.textContent=reading.date;lastDate=reading.date;}
    // Nem élő régió: a felolvasó nem szakítja meg a böngészést minden másodpercben.
    accessible.dateTime=reading.iso;accessible.textContent=`${settings.label||'Budapesti idő'}: ${reading.date}, ${reading.time}`;
    if(!document.hidden)timer=setTimeout(tick,Math.max(20,1000-now.getMilliseconds()+5));
  }
  document.addEventListener('visibilitychange',tick);tick();
  return {node:clock,destroy(){disposed=true;clearTimeout(timer);document.removeEventListener('visibilitychange',tick);}};
}
// A mobil képsáv és a billentyűzetes görgetés a tényleges fejlécmagassághoz igazodik.
export function trackHeaderHeight(header,home){
  const root=document.documentElement;
  const update=()=>{if(!header.isConnected)return;const h=Math.ceil(header.getBoundingClientRect().height);home.style.setProperty('--school-header-height',`${h}px`);root.style.setProperty('--school-header-height',`${h}px`);};
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(update):null;observer?.observe(header);
  window.addEventListener('resize',update);const frame=requestAnimationFrame(update);
  return ()=>{observer?.disconnect();window.removeEventListener('resize',update);cancelAnimationFrame(frame);root.style.removeProperty('--school-header-height');};
}
