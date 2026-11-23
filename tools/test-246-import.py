#!/usr/bin/env python3
"""Valós JPG/PNG-tömeges import, WebP-transzkódolás és hibás metaadatok kizárásának próbája."""
from PIL import Image
from pathlib import Path
import subprocess,tempfile,hashlib,json,sys
ROOT=Path(__file__).resolve().parent.parent
TOOL=ROOT/'tools/import-media-batch.py'
checks=0
with tempfile.TemporaryDirectory(prefix='csanadi246-') as temp:
 p=Path(temp);pics=p/'uploads';pics.mkdir()
 Image.new('RGB',(960,580),(24,92,142)).save(pics/'a.jpg','JPEG',quality=88)
 Image.new('RGB',(900,640),(198,112,62)).save(pics/'b.png','PNG')
 before={x.name:hashlib.sha256(x.read_bytes()).hexdigest() for x in pics.iterdir()}
 template={
  'title':'Iskolai sportillusztráció',
  'alt':'Sporttevékenységet szemléltető illusztráció',
  'caption':'Szerkesztői előkészítés alatt álló bemutatókép.',
  'category':'sport','href':'#/oldal/sports-gallery',
  'album':{'sport':'altalanos','schoolYear':'nincs','event':'nincs'},
  'publication':'draft','provenance':'illustration'
 }
 images=[dict(template,id='uj-kep-001',file='a.jpg'),
         dict(template,id='uj-kep-002',file='b.png',publication='published',provenance='verified',
              sourceNote='A felhasználási jog és a szükséges intézményi hozzájárulás manuálisan ellenőrizve.',rightsConfirmed=True)]
 man=p/'manifest.json';man.write_text(json.dumps({'images':images},ensure_ascii=False))
 out=p/'staging'
 def run(expect_ok=True,check=False):
  cmd=[sys.executable,str(TOOL),'--source',str(pics),'--manifest',str(man),'--output',str(out)]
  if check:cmd.append('--check')
  cp=subprocess.run(cmd,capture_output=True,text=True,timeout=55)
  if expect_ok:assert cp.returncode==0,(cp.stderr,cp.stdout)
  else:assert cp.returncode==2,(cp.stderr,cp.stdout)
  return cp
 run(check=True);checks+=1
 assert not out.exists();checks+=1
 run();checks+=1
 result=json.loads((out/'shared/data/site.json').read_text())
 assert len(result['mediaCenter']['items'])==24;checks+=1
 a,b=result['mediaCenter']['items'][-2:]
 assert a['publication']=='draft';checks+=1
 assert b['publication']=='published' and b['provenance']=='verified' and b['rightsConfirmed'];checks+=1
 assert len(b['importHash'])==64 and b['verifiedAt'];checks+=1
 for new in (a,b):
  for relative,w in [(new['src'],None)]+[(new['responsive'][str(w)],w) for w in (400,800,1280)]:
   file=out/relative.removeprefix('./')
   assert file.is_file();checks+=1
   with Image.open(file) as im: assert im.format=='WEBP' and (w is None or im.size[0]==w);checks+=1
 report=json.loads((out/'import-report.json').read_text())
 assert report['imported']==2 and report['webp_files']==8 and report['draft']==1;checks+=1
 assert all(hashlib.sha256((pics/name).read_bytes()).hexdigest()==value for name,value in before.items());checks+=1
 # Az eredeti staging nem írható felül csendben.
 run(expect_ok=False);checks+=1
 # Önálló rossz manifestek írás nélkül, az eredeti importált fájlok érintetlenek.
 for change in ('traversal','duplicate-id','invalid-album','rights','duplicate-photo','bad-file'):
  corrupted=json.loads(json.dumps(images))
  if change=='traversal':corrupted[0]['file']='../a.jpg'
  elif change=='duplicate-id':corrupted[1]['id']=corrupted[0]['id']
  elif change=='invalid-album':corrupted[0]['album']['event']='nincs-ilyen'
  elif change=='rights':corrupted[1]['rightsConfirmed']=False
  elif change=='duplicate-photo':corrupted[1]['file']='a.jpg'
  elif change=='bad-file':corrupted[0]['file']='missing.jpg'
  man.write_text(json.dumps({'images':corrupted},ensure_ascii=False))
  cp=run(expect_ok=False,check=True)
  assert 'HIBA:' in cp.stderr,cp.stderr;checks+=1
print(f'2.46 import: {checks}/{checks} sikeres fájl-, metaadat-, adatvédelmi és biztonsági ellenőrzés')
