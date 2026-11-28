// Közös, korlátozott JSON szállítás a helyi adatkörökhöz.
export async function fetchJSON(url,{timeout=8000,maxBytes=4000000,refresh=false}={}){
 const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),timeout),start=performance.now();
 try{const response=await fetch(url,{signal:ctl.signal,...(refresh?{cache:'no-cache'}:{})});
 if(!response.ok)throw Error('HTTP '+response.status);
 const declared=Number(response.headers?.get?.('content-length'));if(declared>maxBytes)throw Error('Túl nagy JSON.');
 const text=await response.text(),bytes=new TextEncoder().encode(text).length;if(bytes>maxBytes)throw Error('Túl nagy JSON.');
 const data=JSON.parse(text,(key,value)=>{if(['__proto__','constructor','prototype'].includes(key))throw Error('Tiltott JSON-kulcs.');return value;});
 return {data,bytes,elapsed:performance.now()-start};
 }finally{clearTimeout(timer);}
}
