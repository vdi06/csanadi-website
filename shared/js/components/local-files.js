export function downloadLocal(name,text,type='application/json;charset=utf-8'){
 const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
export function readLocalList(key,allowed,max){try{const data=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(data)?[...new Set(data.filter(x=>typeof x==='string'&&allowed.has(x)))].slice(0,max):[];}catch{return [];}}
export function saveLocalList(key,values){try{localStorage.setItem(key,JSON.stringify(values));return true;}catch{return false;}}
export async function importLocalJSON(file,max=65536){if(!file||file.size>max)throw Error('A fájl nem olvasható vagy túl nagy.');return JSON.parse(await file.text());}
