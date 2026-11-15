/** Egységes, 1024-es váltású fájlméret-kijelzés a honlap minden felületén. */
const SIZE_UNITS=['bájt','KiB','MiB','GiB','TiB','PiB'];
export function formatBytes(value){
 if(value===null||value===undefined||!Number.isFinite(Number(value))||Number(value)<0)return '—';
 let amount=Number(value),unit=0;
 while(amount>=1024&&unit<SIZE_UNITS.length-1){amount/=1024;unit++;}
 return amount.toLocaleString('hu-HU',{maximumFractionDigits:unit?2:0})+' '+SIZE_UNITS[unit];
}
