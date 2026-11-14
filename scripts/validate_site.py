#!/usr/bin/env python3
"""Kiadás előtt: betölthető JSON, belső útvonalak, képek, tanulói eredmények."""
from pathlib import Path
import json, re, sys
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
for p in ('index.html','script.js','style.css','next-2026.css','orbit-2026.css','radial-2026.css','js/student-achievements.js','js/daily-sport-news.js'):
    if not (ROOT/p).is_file():error('Hiányzó programfájl: '+p)
if errors:
    print('\n'.join('HIBA: '+s for s in errors));sys.exit(1)
print(f'OK: {len(paths)} regisztrált oldal, {len(list((ROOT/"json").rglob("*.json")))} JSON, médiaellenőrzés, hétnapos eredményséma')
