#!/usr/bin/env python3
"""2.46: valóban statikus, crawler-barát oldal- és albumelőnézetek + 1200×630 megosztási képek.

python tools/generate-seo.py [--check] [--public-base https://pelda.hu/]
A hash-routes nem SEO-végpontok. A megosztóoldalak külön index.html-ként olvashatók JS nélkül is.
"""
from pathlib import Path
from urllib.parse import urljoin,quote
from xml.sax.saxutils import escape as xml_escape
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageOps
import argparse,html,json,textwrap,re,os,io

ROOT=Path(__file__).resolve().parent.parent
CFG=json.loads((ROOT/'shared/data/site.json').read_text(encoding='utf8'))
NAV=CFG['menu']['items']
DIMENSIONS=('sport','schoolYear','event')
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
ALT_FONT='/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf'

def pick_font(size,bold=False):
    path=BOLD if bold else FONT
    return ImageFont.truetype(path if Path(path).is_file() else ALT_FONT,size)

def meta_text(value,limit=165):
    return ' '.join(str(value).split())[:limit].rstrip()

def attr(s):return html.escape(str(s),quote=True)

def picture(kind,slug,title,subtitle,cover=None,check=False):
    relative=f'shared/assets/media/seo/{kind}/{slug}.jpg' if kind!='home' else 'shared/assets/media/seo/csanadi-megosztas.jpg'
    output=ROOT/relative
    if check:
        with Image.open(output) as i: assert i.format=='JPEG' and i.size==(1200,630),relative
        return './'+relative
    output.parent.mkdir(parents=True,exist_ok=True)
    canvas=Image.new('RGB',(1200,630),(7,26,45))
    if cover:
        with Image.open(ROOT/cover.removeprefix('./')) as img:
            img=ImageOps.fit(img.convert('RGB'),(1200,630),Image.Resampling.LANCZOS)
            img=img.filter(ImageFilter.GaussianBlur(2.0))
            canvas.paste(img)
    shade=Image.new('RGBA',(1200,630),(0,0,0,0));d=ImageDraw.Draw(shade)
    for y in range(630):
        strength=.76 + .18*(y/630) if cover else .05
        if cover:d.line((0,y,1200,y),fill=(2,15,29,int(strength*255)))
    if not cover:
        for idx in range(13):
            x=800+idx*30
            d.line([(x,-90),(x-270,700)],fill=(227,184,101,8+idx*3),width=17)
        d.ellipse((930,-140,1420,390),outline=(220,173,87,80),width=10)
    canvas=Image.alpha_composite(canvas.convert('RGBA'),shade)
    d=ImageDraw.Draw(canvas)
    gold=(235,194,122,255);white=(250,247,239,255);grey=(204,218,227,255)
    d.rounded_rectangle((72,70,405,113),radius=20,fill=(10,35,55,235),outline=(235,194,122,170),width=2)
    d.text((91,82),'CSANÁDI SPORTISKOLA',font=pick_font(19,True),fill=gold)
    # Intézményi címer, nem generált fantázialogó.
    crest=ROOT/CFG['site']['crest'].removeprefix('./')
    with Image.open(crest) as logo:
        logo.thumbnail((135,135))
        if logo.mode!='RGBA':logo=logo.convert('RGBA')
        canvas.alpha_composite(logo,(1000,55))
    d=ImageDraw.Draw(canvas)
    words=title.split();lines=[];line=''
    for word in words:
        cand=(line+' '+word).strip()
        if d.textbbox((0,0),cand,font=pick_font(54,True))[2]>1030 and line:
            lines.append(line);line=word
        else:line=cand
    if line:lines.append(line)
    lines=lines[:3]
    y=245 if len(lines)<3 else 205
    for line in lines:
        d.text((70,y),line,font=pick_font(54,True),fill=white,stroke_width=1,stroke_fill=(4,16,32,255));y+=69
    d.line((72,548,335,548),fill=gold,width=5)
    d.text((72,562),meta_text(subtitle,67),font=pick_font(21),fill=grey)
    d.text((850,581),CFG['release']+' · ELŐNÉZET',font=pick_font(17,True),fill=gold)
    canvas.convert('RGB').save(output,format='JPEG',quality=86,optimize=True,subsampling=0)
    return './'+relative

def page_html(base,path,title,desc,image_url,local_image,heading,intro,body,app_link,graph,indexable):
    canonical=urljoin(base,path)
    robots='index,follow,max-image-preview:large' if indexable else 'noindex,follow,max-image-preview:large'
    structured=json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
    return f'''<!doctype html>
<html lang="hu"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{attr(title)}</title><meta name="description" content="{attr(desc)}">
<meta name="robots" content="{robots}"><meta name="color-scheme" content="light">
<link rel="canonical" href="{attr(canonical)}">
<meta property="og:locale" content="hu_HU"><meta property="og:type" content="website">
<meta property="og:site_name" content="Csanádi Sportiskola">
<meta property="og:title" content="{attr(title)}"><meta property="og:description" content="{attr(desc)}">
<meta property="og:url" content="{attr(canonical)}"><meta property="og:image" content="{attr(image_url)}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{attr(title)} – Csanádi Sportiskola előnézeti grafikája">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{attr(title)}">
<meta name="twitter:description" content="{attr(desc)}"><meta name="twitter:image" content="{attr(image_url)}">
<script type="application/ld+json">{structured}</script>
<style>
:root{{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color-scheme:dark;}}
*{{box-sizing:border-box}}body{{margin:0;background:#071b2f;color:#f8f1e6;min-height:100dvh}}
a{{color:#efd19b}}a:focus-visible{{outline:3px solid #e2ba6e;outline-offset:4px}}
header{{padding:20px max(20px,calc((100% - 960px)/2));border-bottom:1px solid #4b4c47;background:#0d243a}}
header a{{font-weight:900;text-decoration:none;letter-spacing:.05em}}
main{{max-width:960px;margin:0 auto;padding:32px 20px 65px}}.hero{{width:100%;height:auto;aspect-ratio:1200/630;object-fit:cover;border-radius:22px;box-shadow:0 16px 35px #0009}}
.eyebrow{{font-size:12px;font-weight:900;color:#e9bc76;letter-spacing:.12em;text-transform:uppercase;margin-top:30px}}
h1{{font-size:clamp(27px,5vw,43px);line-height:1.2;margin:.3em 0}}p{{line-height:1.65;color:#e2e9ee}}.action{{display:inline-block;min-height:50px;margin-top:14px;padding:13px 21px;color:#071b2f;background:linear-gradient(115deg,#ffdf9a,#d7ac61);text-decoration:none;font-weight:900;border-radius:14px}}
section{{margin-top:30px}}h2{{font-size:22px}}ul{{padding-left:22px;line-height:1.7}}li{{margin:.5em 0}}
.notice{{background:#112e46;border-left:4px solid #d7ac61;padding:13px 20px;border-radius:0 12px 12px 0;font-size:14px}}
footer{{background:#061522;padding:26px 20px;text-align:center;color:#c2ced7;font-size:13px}}
</style></head><body>
<header><a href="{attr(app_link)}">CSANÁDI SPORTISKOLA</a></header>
<main><img class="hero" src="{attr(local_image)}" alt="{attr(title)} előnézeti grafika" width="1200" height="630">
<p class="eyebrow">Weboldal- és megosztási előnézet</p><h1>{html.escape(heading)}</h1>
<p>{html.escape(intro)}</p><a class="action" href="{attr(app_link)}">Megnyitás a Csanádi honlapon</a>
{body}
<p class="notice">{html.escape(CFG['seo']['shareDisclaimer'])}</p></main>
<footer>{html.escape(CFG['site']['fullName'])} · {CFG['release']}</footer></body></html>
'''

def publish(output,source,check=False):
    if check:
        assert output.is_file() and output.read_text(encoding='utf8')==source,f'Elavult SEO-fájl: {output}'
    else:
        output.parent.mkdir(parents=True,exist_ok=True)
        output.write_text(source,encoding='utf8')

def generate(base,check):
    base=base.rstrip('/')+'/'
    if not base.startswith('https://') or not re.match(r'^https://[a-z0-9.-]+(?:/[a-zA-Z0-9_-]+)*/$',base):
        raise ValueError('A public-base legyen HTTPS-alapú teljes, gyökérre végződő URL, pl. https://domain.hu/')
    indexable=CFG['seo']['indexingApproved']
    pic=picture('home','','Csanádi Sportiskola','Képzés · Sport · Közösség',check=check)
    home_img=urljoin(base,pic.removeprefix('./'))
    # A kezdő index.html-ben a metaadat egyszeri, gépi generálású frissítése.
    index=ROOT/'index.html';index_source=index.read_text(encoding='utf8')
    seo_meta=f'''    <title>{attr(CFG['site']['fullName'])}</title>
    <meta name="description" content="{attr(CFG['seo']['defaultDescription'])}">
    <meta name="robots" content="{'index,follow' if indexable else 'noindex,follow'}">
    <link rel="canonical" href="{attr(base)}">
    <meta property="og:locale" content="hu_HU"><meta property="og:type" content="website">
    <meta property="og:site_name" content="Csanádi Sportiskola">
    <meta property="og:title" content="{attr(CFG['site']['fullName'])}">
    <meta property="og:description" content="{attr(CFG['seo']['defaultDescription'])}">
    <meta property="og:url" content="{attr(base)}">
    <meta property="og:image" content="{attr(home_img)}">
    <meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{attr(home_img)}">
    <script type="application/ld+json">{json.dumps({'@context':'https://schema.org','@type':'WebSite','name':CFG['site']['fullName'],'url':base},ensure_ascii=False).replace('<','\\u003c')}</script>'''
    if '<!-- SEO 2.46 BEGIN -->' not in index_source:
        index_source=index_source.replace('    <meta charset="utf-8">','    <meta charset="utf-8">\n    <!-- SEO 2.46 BEGIN -->\n'+seo_meta+'\n    <!-- SEO 2.46 END -->')
    else:
        start=index_source.index('    <!-- SEO 2.46 BEGIN -->')
        end=index_source.index('<!-- SEO 2.46 END -->',start)+len('<!-- SEO 2.46 END -->')
        index_source=index_source[:start]+'    <!-- SEO 2.46 BEGIN -->\n'+seo_meta+'\n    <!-- SEO 2.46 END -->'+index_source[end:]
    publish(index,index_source,check)
    site=CFG['site']['fullName'];counts={'page':0,'album':0}
    urls=[base]
    for group in NAV:
        for entry in group['children']:
            slug=entry['id'];data=CFG['pagePreview']['pages'][slug]
            title=f'{entry["label"]} – Csanádi Sportiskola'
            desc=meta_text(data['intro'],170)
            image=picture('page',slug,entry['label'],'Intézményi tájékoztatás · előnézet',check=check)
            image_url=urljoin(base,image.removeprefix('./'))
            rel=f'share/page/{slug}/';url=urljoin(base,rel);urls.append(url)
            href=f'../../../?v={CFG["release"]}#/oldal/{slug}'
            cards=data['items'][:3]
            body='<section><h2>Kapcsolódó témák</h2><ul>'+''.join(f'<li><strong>{html.escape(c["title"])}</strong> – {html.escape(meta_text(c["summary"],190))}</li>' for c in cards)+'</ul></section>'
            graph=[{'@type':'WebPage','@id':url,'url':url,'name':title,'description':desc,'inLanguage':'hu-HU','isPartOf':{'@type':'WebSite','url':base,'name':site},'image':image_url},
                   {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Főoldal','item':base},{'@type':'ListItem','position':2,'name':entry['label'],'item':url}]}]
            content=page_html(base,rel,title,desc,image_url,'../../../'+image.removeprefix('./'),entry['label'],data['intro'],body,href,graph,indexable)
            publish(ROOT/rel/'index.html',content,check);counts['page']+=1
    all_items=CFG['mediaCenter']['items']
    for dimension in DIMENSIONS:
        for group in CFG['mediaCenter']['albums'][dimension]:
            if not group.get('coverId') or group['id']=='all':continue
            slug=group['id'];photos=[i for i in all_items if i['album'][dimension]==slug and i.get('publication')!='draft']
            if not photos:continue
            cover=next((i for i in photos if i['id']==group['coverId']),None)
            if not cover:continue
            rel=f'share/album/{dimension}/{slug}/';url=urljoin(base,rel);urls.append(url)
            title=f'{group["label"]} – Képalbum | Csanádi Sportiskola'
            desc=meta_text(group['description']+f' {len(photos)} kép. A képek illusztrációk.',170)
            image=picture('album',f'{dimension}-{slug}',group['label'],f'{len(photos)} kép · illusztráció',cover['responsive']['1280'],check=check)
            image_url=urljoin(base,image.removeprefix('./'))
            href=f'../../../../?v={CFG["release"]}&amp;album={quote(dimension+":"+slug)}#/oldal/sports-gallery'
            # href attribútumát az escaping végzi; ne előre entitásosítsuk.
            href=href.replace('&amp;','&')
            body='<section><h2>A képalbum tartalma</h2><ul>'+''.join(f'<li>{html.escape(i["title"])} <small>– {"Illusztráció" if i["provenance"]=="illustration" else "Ellenőrzött kép"}</small></li>' for i in photos[:12])+'</ul></section>'
            graph=[{'@type':'CollectionPage','@id':url,'url':url,'name':title,'description':desc,'inLanguage':'hu-HU','image':image_url,'mainEntity':{'@id':url+'#gallery'}},
               {'@type':'ImageGallery','@id':url+'#gallery','name':group['label'],'associatedMedia':[{'@type':'ImageObject','name':i['title'],'caption':i['caption'],'contentUrl':urljoin(base,i['responsive']['1280'].removeprefix('./'))} for i in photos[:10]]},
               {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Főoldal','item':base},{'@type':'ListItem','position':2,'name':'Képgaléria','item':urljoin(base,'share/page/sports-gallery/')},{'@type':'ListItem','position':3,'name':group['label'],'item':url}]}]
            publish(ROOT/rel/'index.html',page_html(base,rel,title,desc,image_url,'../../../../'+image.removeprefix('./'),group['label'],group['description'],body,href,graph,indexable),check)
            counts['album']+=1
    sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{xml_escape(url)}</loc></url>\n' for url in urls)+'</urlset>\n'
    publish(ROOT/'sitemap.xml',sitemap,check)
    publish(ROOT/'robots.txt','User-agent: *\nAllow: /\nSitemap: '+urljoin(base,'sitemap.xml')+'\n',check)
    print(f'{CFG["release"]} SEO: {counts["page"]} önálló oldal + {counts["album"]} album, {len(urls)} sitemap-URL, {len(urls)} megosztási kép – '+('ellenőrizve' if check else 'generálva')+('. Indexelés engedélyezve.' if indexable else '. Tesztkiadás: noindex.'))

if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--check',action='store_true')
    ap.add_argument('--public-base',default=os.environ.get('CSANADI_PUBLIC_BASE',CFG['seo']['publicBase']))
    args=ap.parse_args()
    generate(args.public_base,args.check)
