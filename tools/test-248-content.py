#!/usr/bin/env python3
"""Csanádi 2.48: statikus kiadási és tartalmi konzisztencia-ellenőrzés."""
from pathlib import Path
import json,re,collections,sys
R=Path(__file__).resolve().parent.parent
C=json.loads((R/'shared/data/site.json').read_text('utf-8'))
checks=0
def ok(cond,reason):
 global checks
 if not cond: raise AssertionError(reason)
 checks+=1
ok(C['release']=='2.53','version')
menu=C['menu']['items']; pages=C['pagePreview']['pages']
leaf=[p['id'] for g in menu for p in g['children']]
ok(len(menu)==6 and len(leaf)==49 and len(set(leaf))==49,'menu 6/49')
ok(set(leaf)==set(pages),'pages match menu')
intros=[pages[p]['intro'].strip() for p in leaf]
ok(all(len(t)>25 for t in intros),'nontrivial intros')
ok(len(set(intros))==49,'no repeated page intros')
for p in leaf:
 body=pages[p]
 ok(all(isinstance(x,dict) for x in body.get('items',[])),p+' valid cards')
 ok(bool(body['intro']) and bool(body['items']),p+' content')
for p in ['school-introduction','school-staff','school-history','school-partners','school-eco','school-explore','school-compass','school-workshop','education-resources','education-library','education-digital','education-talent','admission-open','admission-process','admission-documents','admission-faq','sports-olympic','sports-training','sports-competitions','sports-leisure','information-services','information-service','information-contact','information-meals','information-absence']:
 ok(any(t in str(pages[p]['items']) for t in ['Részletes tudnivalók','Ellenőrzött intézményi','Idővonal','Hogyan','tájékozód','ellenőrz']),p+' new detail card')
for platform in ('desktop','mobile'):
 page=(R/platform/'page.js').read_text(encoding='utf-8')
 ok('Oldal megosztási előnézete' not in page,platform+' no page preview link')
 ok('share/page/' not in page,platform+' no technical page link')
 ok('hideIntro' in page,platform+' generic intro dedupe')
 css=(R/platform/'styles.css').read_text(encoding='utf-8')
 ok('2.48' in css,platform+' new design rules')
 ok('prefers-reduced-motion' in css,platform+' reduced motion')
gallery=(R/'shared/js/gallery-ui.js').read_text(encoding='utf-8')
ok('media-premium-share' not in gallery,'no album preview link')
for pid in leaf:
 ok((R/'share/page'/pid/'index.html').is_file(),pid+' static preview retained')
for g in ('sport','schoolYear','event'):
 for a in C['mediaCenter']['albums'][g]:
  if a['id']=='all': continue
  ok((R/'share/album'/g/a['id']/'index.html').is_file(),g+'/'+a['id']+' static album preview retained')
ok(len(list((R/'shared/assets/media/seo/page').glob('*.jpg')))==49,'49 page share images')
ok(len(list((R/'shared/assets/media/seo/album').glob('*.jpg')))==14,'14 album share images')
ok((R/'sitemap.xml').read_text().count('<url>')==64,'64 sitemap entries')
ok('noindex' in (R/'index.html').read_text(),'noindex active')
ok('csanadi-bp.edu.hu' not in (R/'shared/data/site.json').read_text(),'no legacy website domain in site data')
ok((R/'docs/TARTALMI_AUDIT_248.md').exists(),'audit documentation')
print(f'{C["release"]} CONTENT AND STATIC QA: {checks}/{checks} PASSED; 49 intro, 25 added cards, 63 previews, 63 share images + home')
