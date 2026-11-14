#!/usr/bin/env python3
"""Nemzeti Sport RSS: kizárólag cím, dátum, kategória és a cikk linkje; nincs cikk- vagy képmásolat."""
import datetime as dt
from email.utils import parsedate_to_datetime
import json
from pathlib import Path
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'json/adatok/napi-sporthirek.json'
RSS='https://www.nemzetisport.hu/publicapi/hu/rss/nso/articles'
UTC=dt.timezone.utc

def text(node, key):
    el=node.find(key)
    return ''.join(el.itertext()).strip() if el is not None else ''

def build_feed(payload, now):
    root=ET.fromstring(payload)
    channel=root.find('channel')
    if channel is None: raise ValueError('Az RSS csatorna hibás.')
    items=[];seen=set()
    for node in channel.findall('item'):
        title=' '.join(text(node,'title').split())[:180]
        link=text(node,'link')
        host=urllib.parse.urlparse(link)
        if host.scheme!='https' or host.netloc not in ('nemzetisport.hu','www.nemzetisport.hu') or not title or link in seen:
            continue
        try:
            date=parsedate_to_datetime(text(node,'pubDate'))
            if date.tzinfo is None:date=date.replace(tzinfo=UTC)
            date=date.astimezone(UTC)
        except (TypeError,ValueError):
            continue
        if date>now+dt.timedelta(minutes=20) or (now-date)>dt.timedelta(hours=72):continue
        category=text(node,'category')[:55] or 'Sport'
        seen.add(link)
        items.append({'title':title,'url':link,'publishedAt':date.isoformat(timespec='seconds'),'category':category})
    items.sort(key=lambda x:x['publishedAt'],reverse=True)
    return items[:18]

def main():
    request=urllib.request.Request(RSS,headers={'User-Agent':'CsanadiSportiskola-2026-NewsIndexer/1.0 (+https://vdi06.github.io/csanadi-website/)','Accept':'application/rss+xml, application/xml, text/xml'})
    with urllib.request.urlopen(request,timeout=20) as response:
        data=response.read(2_100_001)
        if len(data)>2_100_000:raise ValueError('A hírfolyam túllépte a biztonságos méretet.')
    now=dt.datetime.now(UTC)
    new_items=build_feed(data,now)
    if not new_items:
        print('Nem érkezett ellenőrizhető, friss sporthír; korábbi adat megmarad.')
        return
    old=json.loads(OUT.read_text(encoding='utf-8'))
    if old.get('items')==new_items:
        print('Nem változott a hírfolyam.');return
    old.update({'schemaVersion':'1.0.0','collectionId':'collection:napi-sporthirek','source':'Nemzeti Sport Online RSS','updatedAt':now.isoformat(timespec='seconds'),'items':new_items})
    OUT.write_text(json.dumps(old,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(len(new_items),'friss hír került a JSON-ba.')
if __name__=='__main__':main()
