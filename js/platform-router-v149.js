/** 1.53: az egyetlen nyilvános HTML-indítópont platformválasztója.
    Iskolai szöveget, menüt, képet, tartalmat nem tárol. */
// Nem a készülék nevét találgatjuk: a keskeny nézet VAGY az elsődlegesen
// érintős, egérhover nélküli kijelző ugyanazt a mobil futási ágat kapja.
// Így fekvő telefonon (768 CSS pixel felett) sem indulnak desktop modulok.
const MOBILE='(max-width: 768px), (pointer: coarse) and (hover: none)';
const query=matchMedia(MOBILE);
const platform=query.matches?'mobile':'desktop';
const origin=new URL('../',import.meta.url);
const branch=new URL(platform+'/',origin);
const base=document.createElement('base');base.href=branch.href;
document.head.prepend(base);
document.documentElement.dataset.csanadiPlatform=platform;
// A <base> a JSON/CSS/képek útvonalait a megfelelő mappába irányítja,
// viszont a #/ SPA-hivatkozásoknak a közös gyökércímen kell maradniuk.
document.addEventListener('click',event=>{
 if(event.defaultPrevented||event.button>0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const link=event.target?.closest?.('a[href]');
 if(!link||link.target&&link.target!=='_self')return;
 const href=link.getAttribute('href')||'';
 if(href==='#app'){
  event.preventDefault();document.getElementById('app')?.scrollIntoView();return;
 }
 if(!/^#\/[a-z0-9/\-]*$/i.test(href))return;
 event.preventDefault();
 if(location.hash!==href)location.hash=href;
},true);
// Másik képernyőosztályba lépve teljesen új futtatókörnyezet indul.
// Így nem keverednek a már betöltött mobil/asztali modulok és CSS-ek.
query.addEventListener?.('change',event=>{
 if((event.matches?'mobile':'desktop')!==platform)location.reload();
});
try{
 await import(new URL('js/site-bootstrap-v149.js?v=1.53',branch).href);
}catch(error){
 console.error('A kiválasztott JSON-vezérelt webhely nem indult:',error);
 const title=document.createElement('h1');title.textContent='A weboldal nem tölthető be';
 const description=document.createElement('p');
 description.textContent='Ellenőrizd a teljes mobil/ és desktop/ mappa feltöltését, majd próbáld újra.';
 const retry=document.createElement('button');retry.type='button';retry.textContent='Újrapróbálkozás';
 retry.addEventListener('click',()=>location.reload());
 document.body.replaceChildren(title,description,retry);
}
