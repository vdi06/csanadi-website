export const fold=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu-HU');
export function highlightText(node,text,query){
 const value=String(text??''),terms=fold(query).split(/[^a-z0-9]+/).filter(Boolean).slice(0,12);if(!terms.length){node.textContent=value;return;}
 // Hungarian precomposed accents preserve UTF-16 indices after folding. For decomposed text, avoid unsafe index mapping.
 const folded=fold(value);if(folded.length!==value.length){node.textContent=value;return;}
 const spans=[];for(const term of terms){let i=0;while((i=folded.indexOf(term,i))>=0){spans.push([i,i+term.length]);i+=term.length;}}
 spans.sort((a,b)=>a[0]-b[0]);const merged=[];for(const span of spans){const prev=merged.at(-1);if(prev&&span[0]<=prev[1])prev[1]=Math.max(prev[1],span[1]);else merged.push(span);}
 node.replaceChildren();let pos=0;for(const [a,b] of merged){node.append(document.createTextNode(value.slice(pos,a)));const mark=document.createElement('mark');mark.className='search-highlight';mark.textContent=value.slice(a,b);node.append(mark);pos=b;}node.append(document.createTextNode(value.slice(pos)));
}