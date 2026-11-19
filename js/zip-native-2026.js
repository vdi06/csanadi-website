'use strict';
const table = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
  table[n] = c >>> 0;
}
const encoder = new TextEncoder();
function crc32(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) c = table[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function littleHeader(size) {
  const buf = new ArrayBuffer(size);
  return {buf, view:new DataView(buf)};
}
function dateBits(now) {
  const year = Math.max(1980, now.getFullYear());
  return {time:((now.getHours() & 31) << 11) | ((now.getMinutes() & 63) << 5) | ((now.getSeconds() / 2) & 31),date:(((year - 1980) & 127) << 9) | (((now.getMonth() + 1) & 15) << 5) | (now.getDate() & 31)};
}
export async function createZip(entries, progress = () => {}) {
  const sorted = [...entries.entries()].sort(([a],[b]) => a.localeCompare(b));
  if (sorted.length > 6000) throw Error('Túl sok fájl a csomagban.');
  const sections = [], central = [];
  let offset = 0;
  const moment = dateBits(new Date());
  for (let i = 0; i < sorted.length; i++) {
    const [name, data] = sorted[i];
    if (!/^[a-zA-Z0-9_./\-\u00c0-\u017f]+$/.test(name) || name.startsWith('/') || name.split('/').some(part=>!part||part==='.'||part==='..') || !/^(assets|json|css|js|tools|mobile|desktop|dokumentacio)\//.test(name) && !/^(index\.html|script\.js|service-worker\.js|offline\.html|README\.md|release-manifest\.json|robots\.txt|sitemap\.xml)$/.test(name)) throw Error('Nem megfelelő ZIP-útvonal: ' + name);
    const bytes = data instanceof Uint8Array ? data : data instanceof Blob ? new Uint8Array(await data.arrayBuffer()) : encoder.encode(String(data));
    if (bytes.length > 150 * 1024 * 1024) throw Error('A fájl meghaladja a ZIP számára engedélyezett méretet: ' + name);
    const filename = encoder.encode(name), checksum = crc32(bytes);
    const local = littleHeader(30);
    let v = local.view;
    v.setUint32(0,0x04034b50,true); v.setUint16(4,20,true);v.setUint16(6,0x0800,true);v.setUint16(8,0,true);
    v.setUint16(10,moment.time,true);v.setUint16(12,moment.date,true);
    v.setUint32(14,checksum,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);
    v.setUint16(26,filename.length,true);v.setUint16(28,0,true);
    sections.push(local.buf,filename,bytes);
    const dir = littleHeader(46); v=dir.view;
    v.setUint32(0,0x02014b50,true);v.setUint16(4,20,true);v.setUint16(6,20,true);v.setUint16(8,0x0800,true);
    v.setUint16(10,0,true);v.setUint16(12,moment.time,true);v.setUint16(14,moment.date,true);
    v.setUint32(16,checksum,true);v.setUint32(20,bytes.length,true);v.setUint32(24,bytes.length,true);
    v.setUint16(28,filename.length,true);v.setUint16(30,0,true);v.setUint16(32,0,true);
    v.setUint16(34,0,true);v.setUint16(36,0,true);v.setUint32(38,0,true);v.setUint32(42,offset,true);
    central.push(dir.buf,filename);
    offset+=30+filename.length+bytes.length;
    progress(i+1,sorted.length,name);
  }
  const centralLength = central.reduce((sum,part)=>sum+part.byteLength,0);
  const footer=littleHeader(22);const v=footer.view;
  v.setUint32(0,0x06054b50,true);v.setUint16(4,0,true);v.setUint16(6,0,true);
  v.setUint16(8,sorted.length,true);v.setUint16(10,sorted.length,true);
  v.setUint32(12,centralLength,true);v.setUint32(16,offset,true);v.setUint16(20,0,true);
  return new Blob([...sections,...central,footer.buf],{type:'application/zip'});
}
export function downloadBlob(blob,name) {
  const url=URL.createObjectURL(blob),anchor=document.createElement('a');
  anchor.href=url;anchor.download=name;document.body.append(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),15000);
}
