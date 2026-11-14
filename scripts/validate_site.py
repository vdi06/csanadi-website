#!/usr/bin/env python3
"""Kiadás előtt: betölthető JSON, belső útvonalak, képek, tanulói eredmények."""
from pathlib import Path
import json, re, sys, hashlib, datetime
ROOT=Path(__file__).resolve().parents[1]
errors=[]
def error(s):errors.append(s)
for p in (ROOT/'json').rglob('*.json'):
    try:json.loads(p.read_text(encoding='utf-8'))
    except Exception as exc:error(f'Hibás JSON: {p.relative_to(ROOT)} – {exc}')
structure=json.loads((ROOT/'json/structure.json').read_text(encoding='utf-8'))
paths=[]
def walk(nodes,depth=1):
    for item in nodes:
        if depth>3:error('Túl mély menü a structure.json-ban')
        path='json/'+item['path'];paths.append(path)
        if not (ROOT/path).is_file():error('Hiányzó oldal: '+path)
        walk(item.get('children',[]),depth+1)
walk(structure['nodes']);paths.append('json/oldalak/kezdolap.json')
if len(set(paths))!=len(paths):error('Ismétlődő oldalútvonal')
for path in paths:
    if not (ROOT/path).is_file():continue
    data=json.loads((ROOT/path).read_text(encoding='utf-8'))
    if data.get('lifecycle',{}).get('status')!='published':error('Nem publikált oldal a menüben: '+path)
for p in (ROOT/'json/adatok').rglob('*.json'):
    data=json.loads(p.read_text(encoding='utf-8'))
    if p.name=='kepgaleria.json':
        for item in data.get('items',[]):
            target=ROOT/item['src']
            if not target.is_file():error('Hiányzó galériakép: '+item['src'])
    if p.name=='tanuloi-sikerek.json':
        if data.get('featureDays')!=7:error('A hétnapos időablak nem teljesül')
        seen=set()
        for item in data.get('items',[]):
            if item.get('id') in seen:error('Ismétlődő tanulói siker: '+item['id'])
            seen.add(item.get('id'))
            demo=item.get('isDemo') is True
            if demo:
                if data.get('previewMode') is not True or not isinstance(item.get('demoDaysAgo'),int):
                    error('Bemutatóeredmény csak külön előnézeti jelöléssel szerepelhet: '+item.get('id','?'))
                if item.get('photoIsOfStudent') is True:
                    error('Bemutatókép nem jelölhető valódi tanulói portrénak: '+item.get('id','?'))
            elif item.get('approved') is not True or item.get('sourceVerified') is not True:
                error('Valódi tanulói eredményhez jóváhagyás és forrásellenőrzés szükséges: '+item.get('id','?'))
            if item.get('image') and (not (ROOT/item['image']).exists() or (not demo and (item.get('imageApproved') is not True or item.get('photoIsOfStudent') is not True))):
                error('Hiányzó/engedély nélküli diákkép: '+item.get('id','?'))
for item in json.loads((ROOT/'json/mediatar.json').read_text(encoding='utf-8'))['items']:
    path=item['original']['path']
    if not (ROOT/path).is_file():error('Hiányzó média: '+path)
for p in ('index.html','script.js','css/style.css','css/next-2026.css','css/orbit-2026.css','css/layout-2026.css','css/radial-2026.css','css/organized-2026.css','js/student-achievements.js','js/daily-sport-news.js'):
    if not (ROOT/p).is_file():error('Hiányzó programfájl: '+p)
for sheet in re.findall(r'href="(css/[^"]+\.css)(?:\?[^"]*)?"',(ROOT/'index.html').read_text(encoding='utf-8')):
    if not (ROOT/sheet).is_file():error('Hiányzó CSS-hivatkozás: '+sheet)
# D+F+G: a hírforrások, eseménydátumok, exportok és dokumentumfájlok kiadás előtti ellenőrzése.
known_routes=set()
for path in paths:
    if (ROOT/path).is_file():
        known_routes.add(json.loads((ROOT/path).read_text(encoding='utf-8')).get('schemaExtensions',{}).get('route'))
news=json.loads((ROOT/'json/adatok/hirek-hivatalos.json').read_text(encoding='utf-8'))
news_ids=set()
for entry in news.get('items',[]):
    source=entry.get('source','')
    if entry.get('id') in news_ids:error('Ismétlődő hír: '+str(entry.get('id')))
    news_ids.add(entry.get('id'))
    if entry.get('status')!='verified' or not re.fullmatch(r'https://csanadi-bp\.edu\.hu/[a-z0-9/.-]+',source):
        error('Ellenőrizetlen hír vagy hibás forrás: '+str(entry.get('id')))
    if entry.get('route') not in known_routes:error('A hír céloldala nem létezik: '+str(entry.get('id')))
    if entry.get('date'):
        try:datetime.date.fromisoformat(entry['date'])
        except ValueError:error('Hibás hírdátum: '+str(entry.get('id')))
for cover in ('sport-1600.webp','felveteli-1600.webp','oktatas-1600.webp','kozosseg-1600.webp','iskolank-1600.webp'):
    if not (ROOT/'assets/media/web'/cover).is_file():error('Hiányzó hírillusztráció: '+cover)
events=json.loads((ROOT/'json/adatok/esemenyek.json').read_text(encoding='utf-8'))
event_cats={x.get('id') for x in events.get('categories',[])}
event_ids=set()
for item in events.get('items',[]):
    ident=str(item.get('id'))
    if ident in event_ids:error('Ismétlődő esemény: '+ident)
    event_ids.add(ident)
    if item.get('categoryId') not in event_cats:error('Hibás eseménykategória: '+ident)
    if item.get('route') not in known_routes:error('Hiányzó eseményoldal: '+ident)
    if item.get('status')=='published':
        src=item.get('source',{})
        if src.get('verified') is not True or not re.fullmatch(r'https://csanadi-bp\.edu\.hu/[a-z0-9/.-]+',src.get('url','')):
            error('Esemény forrása nem ellenőrzött: '+ident)
        try:
            start=datetime.datetime.fromisoformat(item['startsAt'].replace('Z','+00:00'))
            if start.utcoffset() is None:raise ValueError('Nincs időzóna')
            if item.get('endsAt') and datetime.datetime.fromisoformat(item['endsAt'].replace('Z','+00:00'))<=start:raise ValueError('Vége korábbi, mint a kezdés')
        except (KeyError,ValueError,TypeError):error('Hibás eseményidő: '+ident)
documents=json.loads((ROOT/'json/adatok/dokumentumok.json').read_text(encoding='utf-8'))
for entry in documents.get('documents',[]):
    rel=entry.get('filePath')
    if entry.get('status')!='published' or not rel:continue
    candidate=ROOT/rel
    if not rel.startswith('assets/documents/') or not candidate.is_file():
        error('Hiányzó dokumentumfájl: '+str(entry.get('id')))
        continue
    raw=candidate.read_bytes()
    if len(raw)!=entry.get('fileSizeBytes'):error('Hibás dokumentumméret: '+str(entry.get('id')))
    if hashlib.sha256(raw).hexdigest()!=entry.get('sha256'):error('Hibás dokumentum-hash: '+str(entry.get('id')))
    for route in entry.get('relatedRoutes',[]):
        if route not in known_routes:error('Hiányzó dokumentumkapcsolat: '+route)
if errors:
    print('\n'.join('HIBA: '+s for s in errors));sys.exit(1)
print(f'OK: {len(paths)} regisztrált oldal, {len(list((ROOT/"json").rglob("*.json")))} JSON, médiaellenőrzés, hétnapos eredményséma')
