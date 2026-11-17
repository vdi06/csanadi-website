// v1.39.2 – valódi, tartalomtípusonként eltérő DOM-szerkezetek.
// A tartalom az eredeti oldal-JSON-okból jön: nem írunk át intézményi adatot,
// nem gyártunk hírdátumot, eseményidőpontot vagy dokumentumot.

const create=(tag,className='',text)=>{
 const node=document.createElement(tag);
 if(className)node.className=className;
 if(text!==undefined)node.textContent=text;
 return node;
};
const kinds=new Set(['news','events','sport','documents','arrival','guide','information','school']);

export function pageTemplateKind(route=''){
 const parts=String(route).replace(/^#\/?/,'').split('/').filter(Boolean);
 const [main='']=parts;
 if(main==='hirek-es-esemenyek'){
  if(parts.includes('esemenynaptar')||parts.includes('iskolai-esemenyek')||parts.includes('sportesemenyek'))return 'events';
  return 'news';
 }
 if(main==='sport')return 'sport';
 if(parts.some(part=>/dokumentum|szabalyzat|nyomtatvany|kozzeteteli/.test(part)))return 'documents';
 if(parts.some(part=>/megkozelites|terkep/.test(part)))return 'arrival';
 if(main==='oktatas'||main==='tanulastamogatas')return 'guide';
 if(main==='informaciok'||main==='kapcsolat')return 'information';
 return 'school';
}

const labels={
 news:'HÍREK ÉS TÖRTÉNETEK',events:'ESEMÉNYEK ÉS PROGRAMOK',sport:'SPORT ÉS EREDMÉNYEK',
 documents:'DOKUMENTUMOK',arrival:'MEGKÖZELÍTÉS ÉS ÉRKEZÉS',guide:'TANULÁSI ÚTVONAL',
 information:'ISKOLAI INFORMÁCIÓK',school:'ISMERD MEG AZ ISKOLÁT'
};

function sectionTitle(section,index){
 // Egyes JSON-blokktípusok (például a GYIK-akkordion) a címet belső elemben adják.
 // A témaválasztó ugyanazt az értelmes feliratot használja, amit az olvasó lát.
 return section.querySelector(':scope > h2, h2, h3, summary, [data-section-heading]')?.textContent?.trim()||`Tartalom ${index+1}`;
}
function setSectionClasses(sections,kind){sections.forEach((section,i)=>{
 section.classList.add(`cs92-${kind}-part`);
 section.dataset.sectionPosition=String(i+1);
});}

function sectionNavigation(sections,kind){
 const nav=create('nav',`cs92-section-navigation cs92-section-navigation--${kind}`);
 nav.setAttribute('aria-label','Ugrás a tartalom témáihoz');
 nav.append(create('span','cs92-nav-kicker','TÉMAKÖRÖK'));
 const list=create('ol','cs92-nav-list');
 sections.forEach((section,i)=>{
  const item=create('li');
  const link=create('button','cs92-nav-jump',sectionTitle(section,i));
  link.type='button';
  link.setAttribute('aria-label',`${i+1}. témakör: ${sectionTitle(section,i)}`);
  link.addEventListener('click',()=>{
   section.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
   const heading=section.querySelector(':scope > h2, h2, h3, summary, [data-section-heading]');
   if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
  });
  item.append(link);list.append(item);
 });
 nav.append(list);return nav;
}

function group(className,nodes){const n=create('div',className);n.append(...nodes);return n;}

export function applyPageTemplate(article,route){
 const kind=pageTemplateKind(route);
 if(!kinds.has(kind))throw Error('Ismeretlen oldalsablon: '+kind);
 article.classList.add('cs92-article',`cs92-article--${kind}`);
 article.dataset.templateKind=kind;
 const sections=[...article.children].filter(node=>node.classList?.contains('article-section'));
 if(!sections.length)return kind;
 setSectionClasses(sections,kind);
 const header=create('div','cs92-article-intro');
 header.append(create('span','cs92-article-eyebrow',labels[kind]),create('span','cs92-article-count',`${sections.length} tartalmi egység`));
 article.replaceChildren(header);
 switch(kind){
  case 'news': {
   const lead=group('cs92-news-lead',sections.slice(0,1));
   const stream=group('cs92-news-stream',sections.slice(1));
   article.append(lead);
   if(stream.children.length)article.append(stream);
   break;
  }
  case 'sport': {
   article.append(group('cs92-sport-spotlight',sections.slice(0,1)));
   if(sections.length>1)article.append(group('cs92-sport-fields',sections.slice(1)));
   break;
  }
  case 'documents': {
   const layout=create('div','cs92-documents-layout');
   layout.append(sectionNavigation(sections,kind),group('cs92-documents-files',sections));
   article.append(layout);
   break;
  }
  case 'events': {
   article.append(group('cs92-events-timeline',sections));
   break;
  }
  case 'arrival': {
   article.append(group('cs92-arrival-lead',sections.slice(0,1)));
   if(sections.length>1)article.append(group('cs92-arrival-panels',sections.slice(1)));
   break;
  }
  case 'guide': {
   article.append(sectionNavigation(sections,kind),group('cs92-guide-steps',sections));
   break;
  }
  case 'information': {
   article.append(group('cs92-information-primary',sections.slice(0,1)));
   if(sections.length>1)article.append(group('cs92-information-grid',sections.slice(1)));
   break;
  }
  default: {
   article.append(group('cs92-school-feature',sections.slice(0,1)));
   if(sections.length>1)article.append(group('cs92-school-collection',sections.slice(1)));
  }
 }
 return kind;
}
