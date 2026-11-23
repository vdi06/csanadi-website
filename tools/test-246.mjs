/** 2.46 – prémium albumborítók, importkontroll és statikus SEO-oldalak ellenőrzése. */
import assert from 'node:assert/strict';
import {readFileSync,statSync,existsSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const text=p=>readFileSync(join(root,p),'utf8');
const cfg=JSON.parse(text('shared/data/site.json'));
assert.equal(cfg.release,'2.50');
const {checkedMediaCenter, premiumAlbumCards,mediaResults}=await import('../shared/js/media-data.js');
checkedMediaCenter(cfg);
const all=premiumAlbumCards(cfg);
const featured=premiumAlbumCards(cfg,{featuredOnly:true});
assert.equal(all.length,14);
assert.equal(featured.length,5);
assert.equal(premiumAlbumCards(cfg,{dimension:'sport'}).length,8);
assert.equal(premiumAlbumCards(cfg,{dimension:'schoolYear'}).length,2);
assert.equal(premiumAlbumCards(cfg,{dimension:'event'}).length,4);
for(const album of all){
  assert.ok(album.count>=1);
  assert.ok(album.cover.album[album.dimension]===album.id);
  assert.ok(album.coverSrc?.endsWith(`${album.dimension}-${album.id}.webp`));
  const source=join(root,album.coverSrc.slice(2));assert.ok(existsSync(source));
  assert.equal(readFileSync(source).subarray(8,12).toString(),'WEBP');
  assert.ok(statSync(source).size>1000);
  assert.ok(existsSync(join(root,album.sharePath.slice(2),'index.html')));
}
const wrong=structuredClone(cfg);
wrong.mediaCenter.albums.sport.find(x=>x.id==='atletika').coverId='digitalis';
assert.throws(()=>checkedMediaCenter(wrong),/albumborító-hivatkozás/);
const draft=structuredClone(cfg);
draft.mediaCenter.items.push({...structuredClone(draft.mediaCenter.items[0]),id:'uj-sportkep-001',
  publication:'draft',src:'./shared/assets/media/web/imported/uj-sportkep-001.webp',
  responsive:Object.fromEntries([400,800,1280].map(w=>[String(w),`./shared/assets/media/gallery/${w}/uj-sportkep-001.webp`]))});
assert.equal(checkedMediaCenter(draft).items.length,23);
assert.equal(mediaResults(draft,{}).length,22,'Piszkozat nem jelenhet meg');
draft.mediaCenter.items.at(-1).publication='published';draft.mediaCenter.items.at(-1).provenance='verified';
assert.throws(()=>checkedMediaCenter(draft),/jogellenőrzés/);
const menu=cfg.menu.items.flatMap(x=>x.children);
assert.equal(menu.length,49);
for(const item of menu){
 const doc=text(`share/page/${item.id}/index.html`);
 assert.ok(doc.includes('og:image')&&doc.includes('twitter:card'));
 assert.match(doc,/application\/ld\+json/);
 assert.match(doc,/<meta name="robots" content="noindex,follow,max-image-preview:large">/);
 assert.ok(doc.includes(`share/page/${item.id}/`));
 assert.ok(doc.includes('Megnyitás a Csanádi honlapon'));
 assert.ok(existsSync(join(root,`shared/assets/media/seo/page/${item.id}.jpg`)));
}
for(const a of all){
 const html=text(`share/album/${a.dimension}/${a.id}/index.html`);
 assert.ok(html.includes('ImageGallery'));
 assert.ok(html.includes('illusztráci'));
 assert.ok(html.includes(`album=${a.dimension}%3A${a.id}`));
 assert.ok(existsSync(join(root,`shared/assets/media/seo/album/${a.dimension}-${a.id}.jpg`)));
}
const seo=text('index.html');
assert.match(seo,/"noindex,follow"/);
assert.ok(seo.includes('og:title')&&seo.includes('twitter:card')&&seo.includes('application/ld+json'));
assert.ok(!seo.includes('shared/assets/bootstrap'));
const sitemap=text('sitemap.xml');
assert.equal(sitemap.match(/<url>/g).length,64);
assert.equal(new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1])).size,64);
assert.ok(text('robots.txt').includes('Sitemap:'));
for(const platform of ['desktop','mobile']){
 assert.ok(text(`${platform}/gallery.js`).includes('createPremiumAlbumShowcase'));
 assert.ok(!text(`${platform}/page.js`).includes('share/page/'),'Technikai előnézet nem lehet a látogatói oldalon');
 assert.ok(text(`${platform}/styles.css`).includes('premium-showcase'));
 assert.ok(!text('shared/js/gallery-ui.js').includes('media-premium-share'),'Albumból sem kerülhet ki technikai előnézeti link');
}
assert.ok(text('tools/import-media-batch.py').includes('save_webp'));
assert.ok(text('tools/generate-seo.py').includes('--public-base'));
console.log('2.46: 14 külön borító + 5 kiemelt album, 49 oldal-/14 albumelőnézet, 64 grafika, piszkozatvédettség – SIKERES');
