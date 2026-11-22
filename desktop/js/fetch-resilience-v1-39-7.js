/* FTP-kompatibilis, korlátozott JSON-újrapróbálkozás. Nem ír a szerverre. */
export class ContentFetchError extends Error {
 constructor(path,kind,message,{status=null,attempts=1}={}){
  super(`${message}: ${path}${status===null?'':` (HTTP ${status})`}`);
  this.name='ContentFetchError';this.path=path;this.kind=kind;this.status=status;this.attempts=attempts;
  this.transient=kind==='network'||kind==='timeout'||kind==='server';
 }
}
export async function fetchJSONResilient(url,{
 path=url,fetcher=globalThis.fetch,timeoutMs=9000,retryDelaysMs=[180,600],
 pause=ms=>new Promise(resolve=>setTimeout(resolve,ms))
}={}){
 if(typeof fetcher!=='function')throw new ContentFetchError(path,'network','A hálózati lekérés nem támogatott');
 let lastError;
 for(let attempt=0;attempt<=retryDelaysMs.length;attempt++){
  const controller=typeof AbortController==='function'?new AbortController():null;
  const timer=controller?setTimeout(()=>controller.abort(),timeoutMs):null;
  try{
   const response=await fetcher(url,{cache:'no-store',...(controller?{signal:controller.signal}:{})});
   if(!response.ok){
    const status=response.status;
    throw new ContentFetchError(path,status>=500||status===408||status===429?'server':'http','Nem érhető el a JSON',{
     status,attempts:attempt+1
    });
   }
   try{return await response.json();}
   catch(error){throw new ContentFetchError(path,error?.name==='AbortError'?'timeout':'parse',
    error?.name==='AbortError'?'Időtúllépés':'Érvénytelen JSON-adat',{attempts:attempt+1});}
  }catch(error){
   lastError=error instanceof ContentFetchError?error:
    new ContentFetchError(path,error?.name==='AbortError'?'timeout':'network',error?.name==='AbortError'?'Időtúllépés':'Hálózati hiba',{attempts:attempt+1});
   if(!lastError.transient||attempt===retryDelaysMs.length)throw lastError;
  }finally{if(timer!==null)clearTimeout(timer);}
  await pause(retryDelaysMs[attempt]);
 }
 throw lastError;
}
