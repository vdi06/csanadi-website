#!/usr/bin/env python3
"""2.46 – biztonságos, valódi tömeges médiaimport, automatikus WebP-variánsokkal.

Példa:
  python tools/import-media-batch.py --source /kepek --manifest /kepek/adatok.json --output /tmp/csanadi-import
A kimeneti könyvtár site.json + mediafájlok gyökérhez illesztett másolata; kézi jóváhagyás és újratesztelés kell.
Pillow kell a fejlesztői munkakörnyezetben, a közzétett honlaphoz nem.
"""
from argparse import ArgumentParser
from datetime import date
from hashlib import sha256
from pathlib import Path
from PIL import Image, ImageOps, UnidentifiedImageError
import json,re,sys,copy

ID=re.compile(r'^[a-z0-9-]{3,70}$')
ALLOWED={'.jpg','.jpeg','.png','.webp'}
MAX_BYTES=30*1024*1024
Image.MAX_IMAGE_PIXELS=45_000_000
ROOT=Path(__file__).resolve().parent.parent
VERSIONS=(400,800,1280)

class ImportErrorReport(Exception):pass

def text_required(value,key,limit=350):
    if not isinstance(value,str) or not value.strip() or len(value)>limit:
        raise ImportErrorReport(f'Hibás vagy hiányzó {key}.')
    return value.strip()

def validate_meta(meta,config,known):
    if not isinstance(meta,dict):raise ImportErrorReport('A listaelemek objektumok legyenek.')
    ident=meta.get('id')
    if not isinstance(ident,str) or not ID.fullmatch(ident) or ident in known:
        raise ImportErrorReport(f'Hiányzó, hibás vagy ismétlődő azonosító: {ident!r}')
    # Filename strictly basename: symlink/traversal/remote references cannot leak to source path.
    filename=text_required(meta.get('file'),'file',170)
    if Path(filename).name!=filename or '\\' in filename or '/' in filename or filename.startswith('.'):
        raise ImportErrorReport(f'Nem megengedett fájlnév: {filename}')
    if Path(filename).suffix.lower() not in ALLOWED:
        raise ImportErrorReport(f'Nem támogatott fájltípus: {filename}')
    for key in ('title','alt','caption'):text_required(meta.get(key),key)
    categories={i['id'] for i in config['mediaCenter']['categories']}-{ 'all'}
    if meta.get('category') not in categories:raise ImportErrorReport(f'Ismeretlen kategória: {ident}')
    hrefs={f'#/oldal/{c["id"]}' for group in config['menu']['items'] for c in group['children']}
    if meta.get('href') not in hrefs:raise ImportErrorReport(f'Ismeretlen kapcsolódó oldal: {ident}')
    album=meta.get('album')
    if not isinstance(album,dict):raise ImportErrorReport(f'Hiányzó album: {ident}')
    for dimension in ('sport','schoolYear','event'):
        allowed={i['id'] for i in config['mediaCenter']['albums'][dimension]}-{'all'}
        if album.get(dimension) not in allowed:raise ImportErrorReport(f'Hibás {dimension}: {ident}')
    publication=meta.get('publication','draft')
    provenance=meta.get('provenance','illustration')
    if publication not in ('draft','published') or provenance not in ('illustration','verified'):
        raise ImportErrorReport(f'Nem megengedett jóváhagyás/forrás: {ident}')
    if publication=='published' and provenance=='verified':
        text_required(meta.get('sourceNote'),'ellenőrzött forrás',500)
        if meta.get('rightsConfirmed') is not True:
            raise ImportErrorReport(f'A közzétett hiteles kép jogait / hozzájárulását ellenőrizni kell: {ident}')
    return ident,filename,publication,provenance

def convert_image(path):
    if path.stat().st_size>MAX_BYTES:raise ImportErrorReport(f'Túl nagy forráskép: {path.name}')
    try:
        with Image.open(path) as loaded:
            if getattr(loaded,'n_frames',1)!=1:raise ImportErrorReport(f'Animáció nem importálható: {path.name}')
            w,h=loaded.size
            if w<700 or h<360 or w*h>45_000_000:raise ImportErrorReport(f'Nem megfelelő képméret ({w}×{h}): {path.name}')
            loaded.load()
            image=ImageOps.exif_transpose(loaded)
            image=image.convert('RGBA' if image.mode in ('RGBA','LA') or ('transparency' in image.info) else 'RGB')
            return image
    except (UnidentifiedImageError,OSError,Image.DecompressionBombError) as err:
        raise ImportErrorReport(f'Sérült/veszélyes kép: {path.name}: {err}') from err

def save_webp(image,target,maxwidth,quality):
    target.parent.mkdir(parents=True,exist_ok=True)
    if maxwidth==0:
        ratio=min(1.0,2560/image.width)
        resized=image.resize((max(1,round(image.width*ratio)),max(1,round(image.height*ratio))),Image.Resampling.LANCZOS) if ratio<1 else image
    else:
        resized=image.resize((maxwidth,max(1,round(image.height*maxwidth/image.width))),Image.Resampling.LANCZOS)
    resized.save(target,'WEBP',quality=quality,method=5,exif=b'')
    with Image.open(target) as checked:
        assert checked.format=='WEBP' and checked.width==(maxwidth or resized.width)
    return target.stat().st_size

def run(source,manifest,output,dry_run=False):
    if not source.is_dir():raise ImportErrorReport('A képek forrásmappája nem található.')
    if not manifest.is_file():raise ImportErrorReport('A JSON-lista nem található.')
    config=json.loads((ROOT/'shared/data/site.json').read_text(encoding='utf-8'))
    specification=json.loads(manifest.read_text(encoding='utf-8'))
    uploads=specification.get('images')
    if not isinstance(uploads,list) or not 1<=len(uploads)<=200:
        raise ImportErrorReport('Az images lista 1–200 képet tartalmazhat.')
    if output==ROOT or output==source or output.is_relative_to(source) or source.is_relative_to(output):
        raise ImportErrorReport('A kimeneti mappa legyen külön, ne a forrás vagy a működő weboldal gyökere.')
    if output.exists() and any(output.iterdir()):
        raise ImportErrorReport('A kimeneti mappa nem üres: véletlen felülírás elkerülésére válassz újat.')
    originals={i['id'] for i in config['mediaCenter']['items']};seen=set(originals)
    records=[];loaded=[];hashes=set()
    for meta in uploads:
        ident,filename,publication,provenance=validate_meta(meta,config,seen)
        seen.add(ident)
        src=(source/filename).resolve()
        if not src.is_relative_to(source) or not src.is_file():
            raise ImportErrorReport(f'Hiányzó, mappán kívüli vagy hivatkozott fájl: {filename}')
        if src.stat().st_size>MAX_BYTES:raise ImportErrorReport(f'Túl nagy forráskép: {filename}')
        digest=sha256(src.read_bytes()).hexdigest()
        if digest in hashes:raise ImportErrorReport(f'Duplikált képtartalom: {filename}')
        hashes.add(digest)
        img=convert_image(src)
        record={key:meta[key] for key in ('id','title','alt','caption','category','href')}
        record.update({'src':f'./shared/assets/media/web/imported/{ident}.webp',
          'album':{k:meta['album'][k] for k in ('sport','schoolYear','event')},
          'provenance':provenance,'publication':publication,
          'responsive':{str(w):f'./shared/assets/media/gallery/{w}/{ident}.webp' for w in VERSIONS},
          'importHash':digest})
        if provenance=='verified' and publication=='published':
            record.update({'sourceNote':meta['sourceNote'].strip(),'rightsConfirmed':True,'verifiedAt':date.today().isoformat()})
        records.append(record);loaded.append((img,record,filename))
    if dry_run:
        print(f'BEOLVASHATÓ: {len(records)} új kép; {sum(r["publication"]=="draft" for r in records)} piszkozat, 0 fájl módosítva.')
        return
    output.mkdir(parents=True,exist_ok=True)
    total=0
    try:
        for image,record,filename in loaded:
            ident=record['id']
            dest=output/f'shared/assets/media/web/imported/{ident}.webp'
            total+=save_webp(image,dest,0,84)
            for w in VERSIONS:
                total+=save_webp(image,output/f'shared/assets/media/gallery/{w}/{ident}.webp',w,{400:73,800:76,1280:79}[w])
        config['mediaCenter']['items'].extend(records)
        (output/'shared/data').mkdir(parents=True,exist_ok=True)
        (output/'shared/data/site.json').write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        report={'release':config['release'],'imported':len(records),'draft':sum(r['publication']=='draft' for r in records),
                'approved':sum(r['publication']=='published' for r in records),'webp_files':len(records)*4,'total_bytes':total,
                'post_import':['A staging fájlok manuális átemelése a honlapgyökérbe',
                               'node tools/test.mjs && node tools/test-246.mjs',
                               'python tools/build-gallery-variants.py --check',
                               'python tools/generate-seo.py',
                               'Közzétételi jóváhagyás / képek jogai és adatvédelem ellenőrzése']}
        (output/'import-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    except Exception:
        # Írás közbeni hiba esetén a kimenet nem kiadási csomag; az operátor ellenőrzi/törli.
        raise
    print(f'{len(records)} képhez {len(records)*4} új WebP készült ({total:,} bájt), jóváhagyásra vár: {report["draft"]}. Kimenet: {output}')

if __name__=='__main__':
    a=ArgumentParser(description=__doc__)
    a.add_argument('--source',required=True,type=Path,help='Képek forrásmappája')
    a.add_argument('--manifest',required=True,type=Path,help='images tömböt tartalmazó JSON')
    a.add_argument('--output',required=True,type=Path,help='Külön, üres staging könyvtár')
    a.add_argument('--check',action='store_true',help='Csak adat- és képellenőrzés, írás nélkül')
    args=a.parse_args()
    try:run(args.source.expanduser().resolve(),args.manifest.expanduser().resolve(),args.output.expanduser().resolve(),args.check)
    except (ImportErrorReport,ValueError,KeyError,TypeError) as ex:
        print('MÉDIAIMPORT HIBA:',ex,file=sys.stderr);sys.exit(2)
