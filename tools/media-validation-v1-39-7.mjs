/* Új vagy cserélt médiák tartalomazonosító ellenőrzése a böngészőben. */
const KNOWN={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif',
 '.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.pdf':'application/pdf',
 '.doc':'application/msword','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 '.odt':'application/vnd.oasis.opendocument.text','.mp4':'video/mp4','.webm':'video/webm',
 '.mp3':'audio/mpeg','.wav':'audio/wav','.txt':'text/plain','.csv':'text/csv'};
const starts=(b,arr)=>arr.every((v,i)=>b[i]===v);
const ascii=(b,a,z)=>String.fromCharCode(...b.slice(a,z));
export function inspectMediaBytes(name,mime,bytes){
 const extension=String(name).toLowerCase().match(/\.[a-z0-9]+$/)?.[0];
 if(!extension||!KNOWN[extension])return 'A fájltípus nem engedélyezett.';
 if(mime&&mime!=='application/octet-stream'&&mime!==KNOWN[extension]&&
   !(extension==='.jpg'&&mime==='image/pjpeg'))return 'A böngésző által jelzett MIME-típus nem egyezik a kiterjesztéssel.';
 const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
 const signatures={
  '.png':()=>starts(b,[137,80,78,71,13,10,26,10]),
  '.jpg':()=>starts(b,[255,216,255]),'.jpeg':()=>starts(b,[255,216,255]),
  '.gif':()=>['GIF87a','GIF89a'].includes(ascii(b,0,6)),
  '.webp':()=>ascii(b,0,4)==='RIFF'&&ascii(b,8,12)==='WEBP',
  '.avif':()=>ascii(b,4,8)==='ftyp'&&['avif','avis','mif1'].includes(ascii(b,8,12)),
  '.pdf':()=>ascii(b,0,5)==='%PDF-',
  '.doc':()=>starts(b,[208,207,17,224,161,177,26,225]),
  '.docx':()=>starts(b,[80,75,3,4]),'.odt':()=>starts(b,[80,75,3,4]),
  '.mp4':()=>ascii(b,4,8)==='ftyp',
  '.webm':()=>starts(b,[26,69,223,163]),
  '.mp3':()=>ascii(b,0,3)==='ID3'||b[0]===255&&(b[1]&224)===224,
  '.wav':()=>ascii(b,0,4)==='RIFF'&&ascii(b,8,12)==='WAVE'
 };
 if(extension==='.svg'){
  const text=new TextDecoder('utf-8',{fatal:true}).decode(b).replace(/^\uFEFF/,'').trim();
  if(!/<svg(?:\s|>)/i.test(text)||/<(?:script|style|foreignObject|iframe|object|embed|image|use|feImage)\b|\bon[a-z]+\s*=|\bstyle\s*=|javascript\s*:|@import|url\s*\(|<!DOCTYPE|<!ENTITY|\bhref\s*=\s*["'](?:https?:|\/\/|data:)/i.test(text))
   return 'Az SVG nem megengedett aktív vagy külső tartalmat tartalmaz.';
  return null;
 }
 if(extension==='.txt'||extension==='.csv')return b.includes(0)?'A szövegfájl bináris adatot tartalmaz.':null;
 return signatures[extension]?.()?null:'A fájl tartalma nem egyezik a kiterjesztésével.';
}
export async function validateBrowserMediaFile(file,maxBytes){
 if(!file||!Number.isSafeInteger(file.size)||file.size===0)throw Error('A fájl üres vagy érvénytelen.');
 if(file.size>maxBytes)throw Error('A fájl meghaladja a megengedett méretet.');
 const extension=String(file.name).toLowerCase().match(/\.[a-z0-9]+$/)?.[0];
 const bytes=new Uint8Array(await file.slice(0,extension==='.svg'?file.size:65536).arrayBuffer());
 const reason=inspectMediaBytes(file.name,file.type,bytes);
 if(reason)throw Error(reason);
 return true;
}
