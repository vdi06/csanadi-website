/* Local-only content preparation; no upload endpoint, account access or server-side writes. */
export const MEDIA_ID=/^media:[a-z0-9][a-z0-9-]{2,70}$/;
export const DOC_ID=/^document:[a-z0-9][a-z0-9-]{2,70}$/;
export const SEMVER=/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;
export const IMAGE_TYPES=new Set(['image/webp','image/png','image/jpeg']);
export const DOC_EXT={pdf:'application/pdf',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',txt:'text/plain'};
export const makeSlug=(s)=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,65);
export const deepCopy=x=>JSON.parse(JSON.stringify(x));
export function safePackagePath(s){return typeof s==='string'&&/^(?:assets|json|js|css|mobile|desktop|tools)\/[a-z0-9_./-]+$/.test(s)&&!s.split('/').some(x=>x===''||x==='.'||x==='..');}
export async function sha256(bytes){
 const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
 if(globalThis.crypto?.subtle){
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(n=>n.toString(16).padStart(2,'0')).join('');
 }
 // Pure JavaScript SHA-256 fallback for static HTTP hosting (WebCrypto may require HTTPS).
 const K=new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
 const H=new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]);
 const padded=new Uint8Array(Math.ceil((b.length+9)/64)*64);padded.set(b);padded[b.length]=128;
 const view=new DataView(padded.buffer),bitLen=BigInt(b.length)*8n;
 view.setUint32(padded.length-8,Number(bitLen>>32n)>>>0);view.setUint32(padded.length-4,Number(bitLen&0xffffffffn)>>>0);
 const ROT=(x,n)=>(x>>>n)|(x<<(32-n));const W=new Uint32Array(64);
 for(let off=0;off<padded.length;off+=64){
  for(let i=0;i<16;i++)W[i]=view.getUint32(off+i*4);
  for(let i=16;i<64;i++){
   const x=W[i-15],y=W[i-2];
   W[i]=(W[i-16]+(ROT(x,7)^ROT(x,18)^(x>>>3))+W[i-7]+(ROT(y,17)^ROT(y,19)^(y>>>10)))>>>0;
  }
  let [a,b1,c,d,e,f,g,h]=H;
  for(let i=0;i<64;i++){
   const T1=(h+(ROT(e,6)^ROT(e,11)^ROT(e,25))+((e&f)^(~e&g))+K[i]+W[i])>>>0;
   const T2=((ROT(a,2)^ROT(a,13)^ROT(a,22))+((a&b1)^(a&c)^(b1&c)))>>>0;
   h=g;g=f;f=e;e=(d+T1)>>>0;d=c;c=b1;b1=a;a=(T1+T2)>>>0;
  }
  H[0]=(H[0]+a)>>>0;H[1]=(H[1]+b1)>>>0;H[2]=(H[2]+c)>>>0;H[3]=(H[3]+d)>>>0;
  H[4]=(H[4]+e)>>>0;H[5]=(H[5]+f)>>>0;H[6]=(H[6]+g)>>>0;H[7]=(H[7]+h)>>>0;
 }
 return [...H].map(n=>n.toString(16).padStart(8,'0')).join('');
}
export function validateMediaRegistry(data){
 const problems=[];const ids=new Set();const paths=new Set();
 if(data?.schemaVersion!=='1.0.0'||!Array.isArray(data.items))return ['A médiatár szerkezete hibás.'];
 for(const item of data.items){
  if(!item||!MEDIA_ID.test(item.id||'')||ids.has(item.id))problems.push('Hibás vagy ismétlődő médiaazonosító: '+(item?.id||'?'));
  ids.add(item?.id);
  if(item?.kind!=='image')problems.push('Nem támogatott médiafajta: '+item?.id);
  if(!item?.alt||!item.alt.trim())problems.push('Hiányzó képleírás: '+item?.id);
  if(!item?.rights?.clearance||!item?.rights?.holder)problems.push('Hiányzó jogi metaadat: '+item?.id);
  for(const v of [item?.original,...(item?.variants||[])]){
   const webp=v&&/^assets\/media\/[a-z0-9/_-]+\.webp$/.test(v.path)&&v.mimeType==='image/webp'&&Number.isInteger(v.width)&&v.width>0&&Number.isInteger(v.height)&&v.height>0;
   const svg=v&&/^assets\/media\/[a-z0-9/_-]+\.svg$/.test(v.path)&&v.mimeType==='image/svg+xml';
   if(!v||!(webp||svg)||!safePackagePath(v.path)||!Number.isInteger(v.sizeBytes)||v.sizeBytes<1||!/^[a-f0-9]{64}$/.test(v.sha256||''))problems.push('Hibás médiafájl-metaadat: '+item?.id);
   else paths.add(v.path);
  }
 }
 return problems;
}
export function validateDocumentRegistry(data){
 const problems=[];
 if(data?.schemaVersion!=='1.0.0'||data.collectionId!=='collection:csanadi-public-documents'||!Array.isArray(data.categories)||!Array.isArray(data.documents))return ['A dokumentumtár szerkezete hibás.'];
 const cats=new Set(data.categories.map(c=>c.id)),ids=new Set();
 for(const d of data.documents){
  if(!DOC_ID.test(d.id||'')||ids.has(d.id))problems.push('Hibás/ismétlődő dokumentumazonosító: '+d.id);ids.add(d.id);
  if(String(d.title||'').trim().length<5||String(d.summary||'').trim().length<20)problems.push('Túl rövid cím vagy leírás: '+d.id);
  if(!cats.has(d.categoryId)||!['guide','form','policy','publication','other'].includes(d.documentKind)||!['published','archived','withdrawn'].includes(d.status))problems.push('Hibás kategória, fajta vagy állapot: '+d.id);
  if(!Array.isArray(d.tags)||!Array.isArray(d.keywords)||!Array.isArray(d.relatedRoutes)||!Array.isArray(d.versionHistory)||!d.versionHistory.length)problems.push('Hiányzó listamezők: '+d.id);
  if(!SEMVER.test(d.version||'')||!/^\d{4}-\d{2}-\d{2}$/.test(d.publishedAt||''))problems.push('Hibás verzió vagy dátum: '+d.id);
  const last=d.versionHistory?.at(-1);if(last?.version!==d.version)problems.push('A verziótörténet utolsó eleme eltér: '+d.id);
  if(d.status==='withdrawn'){
   if([d.filePath,d.fileName,d.fileSizeBytes,d.sha256].some(v=>v!==null))problems.push('Visszavont fájl még publikus: '+d.id);
  }else{
   const ext=d.filePath?.split('.').pop();
   if(!d.filePath||!/^assets\/documents\/[a-z0-9-]+\.(pdf|docx|txt)$/.test(d.filePath)||!safePackagePath(d.filePath)||d.filePath.split('/').at(-1)!==d.fileName||DOC_EXT[ext]!==d.mimeType||!(d.fileSizeBytes>0)||!/^[0-9a-f]{64}$/.test(d.sha256||''))problems.push('Hibás dokumentumfájl-metaadat: '+d.id);
  }
 }
 return problems;
}
export function parseReleaseStamp(date=new Date()){return [date.getUTCFullYear(),String(date.getUTCMonth()+1).padStart(2,'0'),String(date.getUTCDate()).padStart(2,'0'),'-',String(date.getUTCHours()).padStart(2,'0'),String(date.getUTCMinutes()).padStart(2,'0'),String(date.getUTCSeconds()).padStart(2,'0')].join('');}
export function formatMediaRecord({id,alt,caption,rights,original,variants,decorative=false}){
 return {id,kind:'image',original,variants,alt,caption,decorative,rights};
}
export function canDeleteMedia(id,records){
 const references=(records||[]).filter(([path,data])=>path!=='json/media-library.json'&&String(data).includes(id)).map(([path])=>path);
 return {allowed:references.length===0,references};
}
