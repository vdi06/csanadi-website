// ZIP32 központi fájljegyzék; ZIP64 és titkosított állományok nem támogatottak.
const utf8=new TextDecoder('utf-8',{fatal:false});
const read32=(view,pos)=>view.getUint32(pos,true);
const read16=(view,pos)=>view.getUint16(pos,true);
export function readZip(buffer){
 const view=new DataView(buffer),size=buffer.byteLength;
 if(size<22)throw Error('A ZIP túl rövid.');
 let eocd=-1;for(let pos=size-22;pos>=Math.max(0,size-65557);pos--){if(read32(view,pos)===0x06054b50){eocd=pos;break;}}
 if(eocd<0)throw Error('A ZIP fájlzáró jegyzéke hiányzik.');
 const count=read16(view,eocd+10),directorySize=read32(view,eocd+12),directoryOffset=read32(view,eocd+16);
 if(count===65535||directoryOffset===0xffffffff)throw Error('A ZIP64 nem támogatott a helyi összehasonlítóban.');
 if(directoryOffset+directorySize>size)throw Error('Sérült ZIP-fájljegyzék.');
 let pos=directoryOffset;const items=new Map();
 for(let i=0;i<count;i++){
  if(pos+46>size||read32(view,pos)!==0x02014b50)throw Error('Érvénytelen központi ZIP-bejegyzés.');
  const flags=read16(view,pos+8),method=read16(view,pos+10),crc32=read32(view,pos+16),compressed=read32(view,pos+20),uncompressed=read32(view,pos+24);
  const nameLength=read16(view,pos+28),extraLength=read16(view,pos+30),commentLength=read16(view,pos+32),offset=read32(view,pos+42),end=pos+46+nameLength+extraLength+commentLength;
  if(end>size)throw Error('Csonka ZIP-fájlnév.');
  const name=utf8.decode(new Uint8Array(buffer,pos+46,nameLength));
  if(name&&!name.endsWith('/')){
   if(name.startsWith('/')||name.split('/').some(part=>!part||part==='.'||part==='..')||name.includes('\\')||/\x00/.test(name))throw Error('Nem biztonságos ZIP-útvonal: '+name);
   if(items.has(name))throw Error('Duplikált ZIP-útvonal: '+name);
   if(flags&1)throw Error('Jelszavas ZIP nem támogatott: '+name);
   if(method!==0&&method!==8)throw Error('Nem támogatott ZIP-tömörítés: '+name);
   items.set(name,{name,crc32,size:uncompressed,compressed,method,offset});
  }pos=end;
 }
 return items;
}
const crcTable=(()=>{const table=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let i=0;i<8;i++)c=c&1?(0xedb88320^(c>>>1)):c>>>1;table[n]=c>>>0;}return table;})();
function crc32(bytes){let c=0xffffffff;for(const byte of bytes)c=crcTable[(c^byte)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
export async function extractZipEntry(buffer,entry){
 const view=new DataView(buffer),pos=entry.offset;
 if(pos+30>buffer.byteLength||read32(view,pos)!==0x04034b50)throw Error('Hibás helyi ZIP-fejléc: '+entry.name);
 const dataOffset=pos+30+read16(view,pos+26)+read16(view,pos+28);
 if(dataOffset+entry.compressed>buffer.byteLength)throw Error('Csonka ZIP-tartalom: '+entry.name);
 const data=new Uint8Array(buffer,dataOffset,entry.compressed);
 let result;
 if(entry.method===0)result=new Uint8Array(data);
 else{
  if(typeof DecompressionStream==='undefined')throw Error('A böngésző nem támogatja a ZIP kitömörítést. Használj új Chromium, Firefox vagy Safari böngészőt.');
  try{const stream=new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));result=new Uint8Array(await new Response(stream).arrayBuffer());}
  catch(error){throw Error('A ZIP deflate-raw kitömörítése nem támogatott ebben a böngészőben: '+error.message);}
 }
 if(result.length!==entry.size||crc32(result)!==entry.crc32)throw Error('ZIP CRC32 vagy méreteltérés: '+entry.name);
 return result;
}
