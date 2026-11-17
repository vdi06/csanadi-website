 
(()=>{
  'use strict';
  // Egységes megjelenés minden statikus karbantartó oldalon, külső függőség nélkül.
  document.documentElement.classList.add('cs-tools-modern');
  if(!document.querySelector('link[data-csanadi-tools-unified]')){
    const stylesheet=document.createElement('link');
    stylesheet.rel='stylesheet';
    stylesheet.href='../css/tools-unified-v1.css?v=1.39.5';
    stylesheet.dataset.csanadiToolsUnified='true';
    document.head.append(stylesheet);
  }
  // A három önálló, iframe-es tesztoldalon nincs <main>, ezért a tényleges
  // tesztterület legyen a kihagyható navigáció célpontja.
  const main=document.querySelector('main')||document.querySelector('.stage')||document.querySelector('.toolbar');
  if(main){
    if(!main.id)main.id='cs-tools-main';
    if(!main.hasAttribute('tabindex'))main.setAttribute('tabindex','-1');
    if(!document.querySelector('.cs-tools-skip')){
      const skip=document.createElement('a');
      skip.href='#'+main.id;
      skip.className='cs-tools-skip';
      skip.textContent='Ugrás a segédprogram tartalmára';
      document.body.insertBefore(skip,document.body.firstChild);
    }
  }
  const currentPage=location.pathname.split('/').pop();
  // Egyetlen, minden szerkesztőből elérhető navigáció; a különálló segédoldalak
  // a korábbi saját menüiket és szerkesztési folyamatukat is megtartják.
  const pages=[
    ['index.html','Munkaközpont'],
    ['kezdolap-elrendezes-tervezo.html','Kezdőlap tervezése'],
    ['eszkoz-mediator.html','Média és fájlok'],
    ['dokumentum-szerkeszto.html','Dokumentumadatok'],
    ['oldal-json-szerkeszto.html','Oldalszerkesztő'],
    ['minosegkapu.html','Minőségkapu'],
    ['ftp-kiadas-ellenorzo.html','FTP-kiadás']
  ];
  let header=document.querySelector('body > header');
  if(!header){
    // A korábbi, kizárólag sötét témájú útvonal- és mobilpróbák is elérhetők
    // ugyanabból a munkaközpontból, a belső teszthurok megváltoztatása nélkül.
    header=document.createElement('header');header.className='cs-tools-compact-head';
    const brand=document.createElement('a');brand.href='index.html';
    brand.textContent='CSANÁDI SPORTISKOLA · ELLENŐRZŐ ESZKÖZ';
    const theme=document.createElement('button');theme.type='button';theme.id='tool-theme-toggle';
    theme.textContent='◐ Megjelenés';
    header.append(brand,theme);document.body.insertBefore(header,document.body.firstChild);
  }
  if(header&&!document.querySelector('.cs-tools-global-nav')){
    const navigation=document.createElement('nav');
    navigation.className='cs-tools-global-nav';
    navigation.setAttribute('aria-label','Karbantartási eszközök gyorsnavigációja');
    const inner=document.createElement('div');inner.className='cs-tools-global-nav-inner';
    for(const [url,label] of pages){
      const link=document.createElement('a');link.href=url;link.textContent=label;
      if(url===currentPage)link.setAttribute('aria-current','page');
      inner.append(link);
    }
    navigation.append(inner);header.insertAdjacentElement('afterend',navigation);
  }
  for(const link of document.querySelectorAll('nav a[href]')){
    try{if(new URL(link.href,location.href).pathname.split('/').pop()===currentPage)link.setAttribute('aria-current','page');}catch{}
  }
  const button=document.getElementById('tool-theme-toggle');
  if(!button)return;
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  let selected='system';
  try{const value=localStorage.getItem('csanadi-theme');if(['system','light','dark'].includes(value))selected=value;}catch{}
  const resolve=()=>selected==='system'?(media.matches?'dark':'light'):selected;
  const labels={system:'Automatikus',light:'Világos',dark:'Sötét'};
  let palette=null;
  const applyPalette=()=>{
    if(!palette)return;
    const mode=resolve(),colors=palette.theme?.[mode+'Colors'];if(!colors)return;
    for(const key of ['page','card','light','line','ink','muted','header','footer','nav','sportGreen','sportYellow'])if(typeof colors[key]==='string')document.documentElement.style.setProperty('--'+(key==='sportGreen'?'sport-green':key==='sportYellow'?'sport-yellow':key),colors[key]);
  };
  const update=()=>{
    const theme=resolve();
    document.documentElement.dataset.theme=theme;
    document.documentElement.dataset.themePreference=selected;
    document.documentElement.setAttribute('data-bs-theme',theme);
    button.textContent='◐ '+labels[selected]+' mód';
    button.setAttribute('aria-label','Megjelenés: '+labels[selected]+'. Váltás a következő megjelenésre');
    button.title='Megjelenési mód váltása';
    applyPalette();
  };
  button.addEventListener('click',()=>{selected=selected==='system'?'light':selected==='light'?'dark':'system';try{localStorage.setItem('csanadi-theme',selected);}catch{}update();});
  const changed=()=>{if(selected==='system')update();};
  if(media.addEventListener)media.addEventListener('change',changed);else media.addListener?.(changed);
  window.addEventListener('storage',event=>{
    if(event.key!=='csanadi-theme'&&event.key!==null)return;
    selected=['system','light','dark'].includes(event.newValue)?event.newValue:'system';update();
  });
  const restore=()=>{try{const value=localStorage.getItem('csanadi-theme');selected=['system','light','dark'].includes(value)?value:'system';}catch{/* A memória szerinti kézi választás marad érvényben. */}update();};
  window.addEventListener('pageshow',restore);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)restore();});
  fetch('../json/config.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw new Error('HTTP '+response.status);return response.json();}).then(config=>{palette=config;applyPalette();}).catch(error=>console.warn('A központi színpaletta nem érhető el a segédoldalon:',error));
  update();
})();
