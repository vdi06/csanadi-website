import {sha256} from '../tools/editor-core.js?v=1.51';
import {validateReleaseManifest} from '../tools/release-policy-v1-42-26.js?v=1.51';

const table=new Uint32Array(256);
for(let i=0;i<256;i++){let value=i;for(let bit=0;bit<8;bit++)value=value&1?0xedb88320^(value>>>1):value>>>1;table[i]=value>>>0;}
const read32=(view,offset)=>view.getUint32(offset,true);
const read16=(view,offset)=>view.getUint16(offset,true);
const text=new TextDecoder('utf-8',{fatal:true});
export function zipCRC32(bytes){let crc=0xffffffff;for(const byte of bytes)crc=table[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
const validPath=name=>typeof name==='string'&&name.length<255&&!name.startsWith('/')&&!name.includes('\\')&&!name.split('/').some(part=>!part||part==='.'||part==='..')&&(/^(assets|css|desktop|js|json|mobile|tools|reports)\/[a-zA-Z0-9_./\-\u00c0-\u017f]+$/.test(name)||/^(index\.html|offline\.html|release-manifest\.json|robots\.txt|script\.js|service-worker\.js|sitemap\.xml)$/.test(name));

async function extractCompressed(bytes,method){
 if(method===0)return bytes;
 if(method!==8)throw Error('A ZIP nem támogatott tömörítést tartalmaz.');
 if(typeof DecompressionStream==='undefined')throw Error('A böngésző nem támogatja a Deflate ZIP visszaolvasását. A natív szerkesztő ZIP-je tömörítés nélkül is ellenőrizhető.');
 let stream;try{stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));}
 catch{throw Error('A Deflate ZIP visszaolvasása ezen a böngészőn nem érhető el.');}
 try{return new Uint8Array(await new Response(stream).arrayBuffer());}
 catch{throw Error('A ZIP tömörített adatai sérültek.');}
}

export async function readVerifiedZip(blob,{expectedRelease=null,retainFiles=false,onProgress=()=>{}}={}){
 if(!blob||blob.size>400*1024*1024)throw Error('A ZIP túl nagy vagy hiányzik.');
 const bytes=new Uint8Array(await blob.arrayBuffer()),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 let end=-1;for(let offset=bytes.length-22;offset>=Math.max(0,bytes.length-65557);offset--)if(read32(view,offset)===0x06054b50){end=offset;break;}
 if(end<0||end+22>bytes.length)throw Error('A ZIP központi könyvtára hiányzik.');
 const entriesCount=read16(view,end+10),directorySize=read32(view,end+12),directoryOffset=read32(view,end+16);
 if(entriesCount>6000||directoryOffset+directorySize>end||read16(view,end+4)!==0||read16(view,end+6)!==0)throw Error('Nem támogatott ZIP formátum vagy sérült könyvtár.');
 let offset=directoryOffset,total=0;const files=new Map();
 for(let index=0;index<entriesCount;index++){
  if(offset+46>bytes.length||read32(view,offset)!==0x02014b50)throw Error('Hibás ZIP könyvtári rekord.');
  const flags=read16(view,offset+8),method=read16(view,offset+10),crc=read32(view,offset+16),packed=read32(view,offset+20),size=read32(view,offset+24);
  const nameLength=read16(view,offset+28),extraLength=read16(view,offset+30),commentLength=read16(view,offset+32),localOffset=read32(view,offset+42);
  if(flags&1||size>150*1024*1024||packed>150*1024*1024||offset+46+nameLength+extraLength+commentLength>bytes.length)throw Error('Nem támogatott vagy sérült ZIP-fájl.');
  const name=text.decode(bytes.subarray(offset+46,offset+46+nameLength));
  offset+=46+nameLength+extraLength+commentLength;
  if(name.endsWith('/')){if(name.includes('..')||name.startsWith('/'))throw Error('Veszélyes könyvtárbejegyzés.');continue;}
  if(!validPath(name)||files.has(name))throw Error('Hibás vagy duplikált ZIP-útvonal: '+name);
  if(localOffset+30>bytes.length||read32(view,localOffset)!==0x04034b50)throw Error('Hiányzó ZIP-fájlfejléc: '+name);
  const dataOffset=localOffset+30+read16(view,localOffset+26)+read16(view,localOffset+28);
  if(dataOffset+packed>bytes.length)throw Error('Csonka ZIP-adat: '+name);
  const content=await extractCompressed(bytes.subarray(dataOffset,dataOffset+packed),method);
  if(content.length!==size||zipCRC32(content)!==crc)throw Error('CRC vagy fájlméret eltérés: '+name);
  total+=content.length;if(total>450*1024*1024)throw Error('A ZIP túl sok kicsomagolt adatot tartalmaz.');
  files.set(name,content);
  if(index%35===0)onProgress(index+1,entriesCount);
 }
 if(offset!==directoryOffset+directorySize||!files.has('release-manifest.json'))throw Error('A ZIP kiadási manifestje vagy a könyvtár vége hibás.');
 let manifest;try{manifest=JSON.parse(text.decode(files.get('release-manifest.json')));}catch{throw Error('A kiadási manifest JSON-ja hibás.');}
 if(expectedRelease&&manifest.release!==expectedRelease)throw Error('A ZIP kiadásazonosítója eltér a várttól.');
 const structural=validateReleaseManifest(manifest,files);if(structural.length)throw Error(structural.slice(0,3).join(' · '));
 for(const [name,meta] of Object.entries(manifest.files)){
  const content=files.get(name);
  if(content.length!==meta.sizeBytes||await sha256(content)!==meta.sha256)throw Error('SHA-256 vagy méreteltérés: '+name);
 }
 const version=manifest.release.replace('csanadi-website-','');
 const config=JSON.parse(text.decode(files.get('json/config.json')||new Uint8Array()));
 if(config.performance?.cacheVersion!=='csanadi-r-v'+version)throw Error('A konfiguráció és a ZIP verziója eltér.');
 const worker=text.decode(files.get('service-worker.js')||new Uint8Array());
 if(!worker.includes("const RELEASE_ID='"+version+"'"))throw Error('A service worker verziója eltér.');
 return {ok:true,release:manifest.release,count:files.size,manifest,bytesVerified:total,files:retainFiles?files:undefined};
}
