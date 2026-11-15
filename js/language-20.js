import {setting} from './site-settings-2026.js?v=csanadi-r29n-20261115';
export async function installLanguageHighlights(){
 if(!setting('runtime.display.bilingualPanelEnabled'))return;
 const url=new URL('../json/'+setting('content.languagesPath'),import.meta.url),response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error('Nem elérhető a központi nyelvi JSON.');const data=await response.json(),hero=document.getElementById('global-hero');if(!hero||!data.notices)return;
 const create=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el;};
 const panel=create('section','csn20-language-bar');panel.setAttribute('aria-label','Kiemelt, többnyelvű tájékoztatók');const controls=create('div','csn20-languages'),heading=create('h2'),scope=create('p'),cards=create('div','csn20-language-cards');controls.append(create('span','','Nyelv / Language:'));const buttons=new Map();for(const language of data.languages||[]){const button=create('button','',language.label);button.type='button';button.addEventListener('click',()=>switchTo(language.code));controls.append(button);buttons.set(language.code,button);}
 panel.append(controls,heading,scope,cards);hero.insertAdjacentElement('afterend',panel);
 let selected=setting('runtime.display.bilingualDefaultLanguage');try{const stored=localStorage.getItem('csanadi-info-language');if(buttons.has(stored))selected=stored;}catch{}
 function switchTo(language){if(!buttons.has(language))return;selected=language;try{localStorage.setItem('csanadi-info-language',language);}catch{}const content=data.notices[language];if(!content)return;heading.textContent=content.heading;scope.textContent=content.scope;cards.replaceChildren();for(const card of content.cards||[]){if(!/^#\/[a-z0-9/-]*$/.test(card.route))continue;const el=create('article'),title=create('h3','',card.title),desc=create('p','',card.text),link=create('a','',card.link);link.href=card.route;el.append(title,desc,link);cards.append(el);}buttons.forEach((button,code)=>{button.setAttribute('aria-pressed',String(code===selected));button.disabled=code===selected;});}
 switchTo(selected);
}
