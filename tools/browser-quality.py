#!/usr/bin/env python3
"""2.45 Chromium QA, using Playwright's local request interception.

A GitHub Pages / live CDN E2E check is intentionally NOT claimed: this runner
serves the unmodified local JS/CSS/JSON/media with a virtual HTTPS file origin,
while using a no-CDN HTML wrapper. Requires: pip install playwright; chromium.
"""
from pathlib import Path
import json, mimetypes, sys, os
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(os.environ.get('CSANADI_QA_OUTPUT', str(ROOT.parent / 'csanadi-239-qa')))
OUT.mkdir(exist_ok=True)
config = json.loads((ROOT / 'shared/data/site.json').read_text())
release = config['release']
leaves = [child['id'] for group in config['menu']['items'] for child in group['children']]
assert len(leaves) == 49
issues = []
passes = 0
reports = []

def check(test, label):
    global passes
    if not test: raise AssertionError(label)
    passes += 1

def launch():
    return sync_playwright().start()

def serve(route):
    url = route.request.url
    sub = url.split('csanadi-local.test/',1)[-1].split('?',1)[0].split('#',1)[0]
    path = (ROOT / sub).resolve()
    if not path.is_relative_to(ROOT) or not path.is_file():
        route.fulfill(status=404,body='not found',headers={'access-control-allow-origin':'*'})
    else:
        route.fulfill(status=200,body=path.read_bytes(),headers={
            'content-type':mimetypes.guess_type(path.name)[0] or 'text/plain',
            'access-control-allow-origin':'*',
            'cache-control':'no-store'})

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
        args=['--no-sandbox','--disable-dev-shm-usage'])
    cases = [
        ('desktop-dark',1440,900,'dark','no-preference',True),
        ('desktop-light',1024,800,'light','reduce',False),
        ('mobile-dark',390,844,'dark','no-preference',True),
        ('mobile-light',320,700,'light','reduce',False),
    ]
    only_case=os.environ.get('CSANADI_ONLY_CASE','')
    if only_case:cases=[case for case in cases if case[0]==only_case]
    for name,width,height,theme,motion,all_pages in cases:
        platform='mobile' if width<768 else 'desktop'
        errors=[]
        ctx=browser.new_context(viewport={'width':width,'height':height},
            color_scheme=theme,reduced_motion=motion,
            is_mobile=platform=='mobile',has_touch=platform=='mobile')
        ctx.route('https://csanadi-local.test/**',serve)
        ctx.route('https://cdn.jsdelivr.net/**',lambda route:route.abort())
        page=ctx.new_page()
        page.on('pageerror',lambda err: errors.append(str(err)))
        try:
            page.goto('about:blank#/')
            wrapper=f'''<!doctype html><html lang="hu"><head><meta charset="utf-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <base href="https://csanadi-local.test/">
            <link rel="stylesheet" href="shared/css/base.css?v={release}"></head>
            <body><div id="app"></div><script type="module" src="shared/js/entry.js?v={release}"></script></body></html>'''
            page.set_content(wrapper)
            page.evaluate("document.addEventListener('click',e => {const a=e.target.closest?.('a[href^=\"#/\"]');if(a){e.preventDefault();e.stopImmediatePropagation();location.hash=a.getAttribute('href')}}, true)")
            page.locator('.home-carousel-tab').first.wait_for(timeout=15000)
            check(page.locator('.gate-screen,.gate-door-button').count()==0, f'{name}: gateway removed')
            check(page.locator(f'.{platform}-home').count()==1, f'{name}: homepage without gateway')
            check(page.evaluate('location.hash')=='#/kezdolap',f'{name}: legacy gate URL canonicalized')
            check(getattr(page, 'url', None) is not None, f'{name}: loaded without gate')
            check(page.locator('.home-carousel-tab').all_inner_texts()==
                ['Sportsikerek','Tanévi naptár','Hírek és közlemények'], f'{name}: tab data')
            check(page.locator('.home-carousel-tab[aria-selected="true"]').count()==1, f'{name}: selected tab')
            check(page.locator('.home-carousel-item[aria-hidden="false"]').count()==1, f'{name}: hidden panels')
            check(page.locator('.skip-to-content').count()==1,f'{name}: skip link')
            check(page.locator('.skip-to-content').evaluate('(el)=>getComputedStyle(el).opacity')=='0',
                  f'{name}: unfocused skip link is visually hidden')
            check(page.locator('main#content').count()==1,f'{name}: main landmark')
            page.get_by_role('tab',name='Hírek és közlemények').click(force=True)
            check(page.locator('.home-carousel-item.active .home-news-card').count()==4,f'{name}: news cards')
            check(page.locator('.home-carousel-item.active .home-news-story-link').count()==4,f'{name}: news detail')
            check(page.locator('.home-carousel-item.active .home-news-more').first.get_attribute('open') is None,
                  f'{name}: details closed by default')
            page.locator('.home-carousel-item.active .home-news-more summary').first.click(force=True)
            check(page.locator('.home-carousel-item.active .home-news-more').first.evaluate('(el)=>el.open'),
                  f'{name}: details opens')
            page.screenshot(path=str(OUT/f'{name}-news.png'))
            # Direct article and calendar navigation, with common JSON relationships.
            page.evaluate("location.hash='#/oldal/news-latest/hir/nyilt-napok-2026'")
            page.locator('.school-news-story.is-targeted').first.wait_for(timeout=10000)
            check(page.locator('.school-news-story.is-targeted details[open]').count()==1,f'{name}: story detail')
            check(page.locator('.school-news-navigation-link').count()==4,f'{name}: news nav')
            page.evaluate("location.hash='#/oldal/news-calendar'")
            page.locator('.school-calendar-section').first.wait_for(timeout=10000)
            check(page.locator('.calendar-view-tab').count()==(2 if platform=='mobile' else 3),
                  f'{name}: calendar views')
            check(page.locator('.school-calendar-popover:visible').count()==0,f'{name}: closed popover')
            if platform=='desktop':
                page.locator('[data-calendar-view="year"]').click(force=True)
                check(page.locator('.school-month').count()==12,f'{name}: twelve months')
                heights=page.locator('.school-month').evaluate_all(
                    '(els)=>els.map(el=>Math.round(el.getBoundingClientRect().height))')
                check(max(heights)-min(heights)<2,f'{name}: month heights equal {heights}')
                page.locator('[data-calendar-view="month"]').click(force=True)
            else:
                check(page.locator('[data-calendar-view="year"]').count()==0,
                      f'{name}: mobile no annual view')
            page.screenshot(path=str(OUT/f'{name}-calendar.png'))
            date_button=page.locator('.school-day.has-events').first
            date_button.focus()
            date_button.press('Enter')
            page.locator('.school-calendar-popover:visible').wait_for(timeout=4000)
            check(page.locator('.calendar-popover-close').evaluate('(el)=>el===document.activeElement'),
                  f'{name}: keyboard popover focus')
            popover_height_before=page.locator('.school-month').first.bounding_box()['height']
            page.keyboard.press('Escape')
            check(page.locator('.school-calendar-popover:visible').count()==0,
                  f'{name}: Escape close')
            check(date_button.evaluate('(el)=>el===document.activeElement'),
                  f'{name}: Escape focus return')
            check(abs(popover_height_before-page.locator('.school-month').first.bounding_box()['height'])<1,
                  f'{name}: no calendar layout jump')
            page.evaluate("location.hash='#/oldal/news-calendar/esemeny/sportnap'")
            page.locator('.school-calendar-popover:visible').wait_for(timeout=8000)
            check('2027' in page.locator('.calendar-popover-title').inner_text(),f'{name}: direct event')
            check(page.locator('body > .school-calendar-popover').count()==1,
                  f'{name}: floating overlay outside grid')
            check(page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'),
                  f'{name}: no horizontal overflow')
            page.screenshot(path=str(OUT/f'{name}-event.png'))
            page.locator('.calendar-popover-close').click(force=True)
            check(page.locator('.school-calendar-popover:visible').count()==0,f'{name}: close button')
            # The normal 49-page content generation from the same JSON sources.
            to_visit=leaves if all_pages else [group['children'][0]['id'] for group in config['menu']['items']]
            for leaf in to_visit:
                page.evaluate('(id)=>location.hash=`#/oldal/${id}`',leaf)
                page.locator('.'+platform+'-page-title').first.wait_for(timeout=5000)
                check(page.locator('main#content').count()==1,f'{name}/{leaf}: main')
                check(page.locator('main h1').count()==1,f'{name}/{leaf}: one h1')
                has_content = (page.locator('.'+platform+'-page-card').count()>0 or
                    page.locator('.school-news-page').count()>0 or
                    page.locator('.school-calendar-section').count()>0 or
                    page.locator('.'+platform+'-info-center').count()>0 or
                    page.locator('.'+platform+'-media-center').count()>0 or
                    page.locator('.'+platform+'-document-center').count()>0 or
                    page.locator('.'+platform+'-admission-center').count()>0 or
                    page.locator('.'+platform+'-feature-center').count()>0 or
                    page.locator('.'+platform+'-timetable-center').count()>0)
                check(has_content, f'{name}/{leaf}: content')
                check(page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'),
                      f'{name}/{leaf}: overflow')
            # 2.41 – országos felvételi határidők, önálló asztali és mobilos modul.
            for admission_id in ['admission-guide','admission-deadlines','admission-primary','admission-secondary']:
                page.evaluate('(id)=>location.hash=`#/oldal/${id}`',admission_id)
                admission=page.locator('.'+platform+'-admission-center')
                admission.wait_for(timeout=6000)
                check(admission.locator('.admission-warning').count()==1,f'{name}/{admission_id}: verified-source note')
                check(admission.locator('a[href^="#/oldal/admission-"]').count()>0,
                      f'{name}/{admission_id}: crosslinks')
                check(page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'),
                      f'{name}/{admission_id}: no horizontal overflow')
                if platform=='desktop':
                    check(admission.locator('.admission-event').count()==(1 if admission_id=='admission-primary' else 9 if admission_id=='admission-secondary' else 10),
                          f'{name}/{admission_id}: correct national milestones')
                    if admission_id=='admission-deadlines':
                        admission.locator('.admission-input').fill('irasbeli')
                        check(admission.locator('.admission-event').count()==4,
                              f'{name}: diacritic-insensitive admission search')
                        admission.locator('.admission-input').fill('')
                        admission.locator('.admission-select').select_option('soon')
                        check(admission.locator('.admission-event').count()>=1,f'{name}: 30d deadline filter')
                        admission.locator('.admission-select').select_option('all')
                else:
                    # Telefonon az alapnézet a lejárt időpontokat elrejti; a teljes lista kifejezetten választható.
                    admission.locator('.mobile-admission-modes button[data-mode="all"]').click(force=True)
                    check(admission.locator('.mobile-admission-event').count()==(1 if admission_id=='admission-primary' else 9 if admission_id=='admission-secondary' else 10),
                          f'{name}/{admission_id}: correct national milestones')
                    if admission_id=='admission-deadlines':
                        admission.locator('.mobile-admission-modes button[data-mode="all"]').click(force=True)
                        admission.locator('.mobile-admission-search').fill('irasbeli')
                        check(admission.locator('.mobile-admission-event').count()==4,
                              f'{name}: mobile admission search')
                        admission.locator('.mobile-admission-search').fill('')
                        admission.locator('.mobile-admission-event').first.locator('summary').click(force=True)
                        check(admission.locator('.mobile-admission-event[open]').count()==1,
                              f'{name}: touch-friendly admission detail')
                        admission.locator('.mobile-admission-event').first.locator('summary').click(force=True)
                        check(admission.locator('.mobile-admission-event[open]').count()==0,
                              f'{name}: admission detail closes')
                page.screenshot(path=str(OUT/f'{name}-{admission_id}.png'), animations='disabled')
            for admission_id in ['admission-open','admission-process','admission-documents','admission-faq']:
                page.evaluate('(id)=>location.hash=`#/oldal/${id}`',admission_id)
                page.locator('.'+platform+'-page-title').first.wait_for(timeout=5000)
                check(page.locator('.'+ ('mobile-admission-shortcuts' if platform=='mobile' else 'admission-crosslinks') ).count()==1,
                      f'{name}/{admission_id}: related admission navigation')
            # 2.39: két független platformmodul, valódi nézet és billentyűzettesztek.
            page.evaluate("location.hash='#/oldal/information-daily'")
            info=page.locator('.'+platform+'-info-center')
            info.wait_for(timeout=5000)
            shortcut_selector='.desktop-info-shortcut' if platform=='desktop' else '.mobile-info-shortcuts a'
            schedule_selector='.desktop-info-bell-grid li' if platform=='desktop' else '.mobile-info-bell-details li'
            check(info.locator(shortcut_selector).count()==8,f'{name}: 8 information links')
            if platform=='mobile':
                info.locator('details summary').click()
                check(info.locator('details[open]').count()==1,f'{name}: mobile bell accordion')
            check(info.locator(schedule_selector).count()==8,f'{name}: correct 8 lesson slots')
            check(info.locator('a[href^="#/oldal/news-calendar/esemeny/"]').count()==4,
                  f'{name}: 4 upcoming calendar links')
            check(info.locator('a[href*="/hir/"]').count()==3,
                  f'{name}: 3 JSON news links')
            check(page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'),
                  f'{name}: information no overflow')
            page.wait_for_timeout(550)  # az oldalnyitó CSS animáció befejezése
            page.evaluate('document.activeElement?.blur()')
            page.locator('.'+platform+'-info-center').screenshot(path=str(OUT/f'{name}-information.png'), animations='disabled')
            info.locator(shortcut_selector).first.click(force=True)
            page.wait_for_function("() => location.hash==='#/oldal/information-timetable' && document.querySelector('main h1')?.textContent?.trim()==='Órarend és csengetési rend'",timeout=7000)
            check(page.locator('main h1').inner_text()=='Órarend és csengetési rend',
                  f'{name}: information quicklink navigation')

            page.evaluate("location.hash='#/oldal/sports-gallery'")
            media=page.locator('.'+platform+'-media-center')
            media.wait_for(timeout=5000)
            filter_cls=f'.{platform}-media-filter'
            card_cls='.desktop-media-card' if platform=='desktop' else '.mobile-media-tile'
            search_cls=f'.{platform}-media-search'
            more_cls=f'.{platform}-media-more'
            count_initial=9 if platform=='desktop' else 6
            check(media.locator(filter_cls).count()==5,f'{name}: media category buttons')
            check(media.locator(card_cls).count()==count_initial,f'{name}: media initial lazy limit')
            check(media.locator(card_cls+' img').count()==count_initial,f'{name}: media lazy img')
            check(media.locator(card_cls+' img[loading="lazy"]').count()==count_initial,f'{name}: media lazy loading')
            check(media.locator(card_cls+' img').first.evaluate(
                '(img)=>img.getBoundingClientRect().width>150 && img.getBoundingClientRect().height>100'),
                f'{name}: visible thumbnail geometry')
            check(page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'),
                  f'{name}: media no overflow')
            # A screenshothoz a késleltetett képeket ugyanúgy láthatóvá tesszük,
            # ahogy egy ember görgetés közben megtekintené őket.
            image_nodes=media.locator(card_cls+' img')
            for j in range(image_nodes.count()):
                image_nodes.nth(j).scroll_into_view_if_needed(timeout=3000)
                image_nodes.nth(j).evaluate('(img)=>{img.loading="eager"}')
            page.wait_for_function(f"() => [...document.querySelectorAll('.{platform}-media-grid img')].every(img=>img.complete && img.naturalWidth>0)",timeout=10000)
            page.wait_for_timeout(550)
            media.screenshot(path=str(OUT/f'{name}-gallery.png'), animations='disabled')
            media.locator(filter_cls+'[data-category="sport"]').click(force=True)
            check(media.locator(filter_cls+'[data-category="sport"]').get_attribute('aria-pressed')=='true',
                  f'{name}: filter aria state')
            check(media.locator(card_cls).count()==min(8,count_initial),f'{name}: sport filtering')
            media.locator(search_cls).fill('röplabda')
            check(media.locator(card_cls).count()==1,f'{name}: accent-insensitive media search')
            media.locator(search_cls).fill('a-nem-letezo-kep')
            check(media.locator(card_cls).count()==0,f'{name}: media empty result')
            check(media.locator('.'+platform+'-media-empty').count()==1,f'{name}: media empty state')
            media.locator(search_cls).fill('')
            media.locator(filter_cls+'[data-category="all"]').click(force=True)
            first=media.locator(card_cls).first
            first.click(force=True)
            dlg=page.locator('.media-dialog[open]')
            check(dlg.count()==1,f'{name}: native modal open')
            check(dlg.get_attribute('aria-labelledby') is not None,f'{name}: modal title reference')
            check(dlg.locator('img').get_attribute('alt')!='',f'{name}: image alternative')
            check(dlg.locator('.media-dialog-counter').inner_text().startswith('1 /'),f'{name}: modal initial')
            page.keyboard.press('ArrowRight')
            check(dlg.locator('.media-dialog-counter').inner_text().startswith('2 /'),f'{name}: next image key')
            if platform=='mobile':
                # Szimulált natív érintés: jobbról balra lapozva a következő kép.
                page.evaluate("""() => {
                  const d=document.querySelector('.media-dialog-viewport');
                  const t=(x)=>new Touch({identifier:1,target:d,clientX:x,clientY:150});
                  d.dispatchEvent(new TouchEvent('touchstart',{touches:[t(270)],bubbles:true}));
                  d.dispatchEvent(new TouchEvent('touchend',{changedTouches:[t(90)],bubbles:true}));
                }""")
                check(dlg.locator('.media-dialog-counter').inner_text().startswith('3 /'),
                      f'{name}: touch swipe moves to next image')
            page.keyboard.press('Escape')
            check(page.locator('.media-dialog[open]').count()==0,f'{name}: native Escape closing')
            check(first.evaluate('(el)=>document.activeElement===el'),f'{name}: thumbnail focus restore')
            check(media.locator(more_cls).is_visible(),f'{name}: load more visible')
            media.locator(more_cls).click(force=True)
            check(media.locator(card_cls).count()==min(22,count_initial+6),f'{name}: load more images')
            check(page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'),
                  f'{name}: loaded media no overflow')
            check(not errors,f'{name}: new module JS errors {errors[:3]}')
            # 2.40: önálló asztali/mobil dokumentumközpont és OLDALON BELÜLI nézegető.
            page.evaluate("location.hash='#/oldal/information-documents'")
            documents=page.locator('.'+platform+'-document-center')
            documents.wait_for(timeout=6000)
            check(documents.locator('.document-card').count()==(8 if platform=='desktop' else 5),f'{name}: document initial pagination')
            check(page.locator('.document-reader').count()==1,f'{name}: embedded document reader')
            check(page.locator('.document-reader[open]').count()==0,f'{name}: document reader closed')
            check(page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'),f'{name}: documents no overflow')
            if platform=='desktop':
                check(documents.locator('.desktop-document-category').count()==7,f'{name}: 7 document categories')
                documents.locator('.desktop-document-category[data-category="education"]').click(force=True)
                check(documents.locator('.document-card').count()==2,f'{name}: education category')
                documents.locator('.desktop-document-category[data-category="all"]').click(force=True)
                statusSelect=documents.locator('select[aria-label="Közzétételi állapot"]')
            else:
                check(documents.locator('.mobile-document-filter-row select').count()==2,f'{name}: mobile dropdowns')
                documents.locator('select[aria-label="Dokumentumkategória"]').select_option('privacy')
                check(documents.locator('.document-card').count()==3,f'{name}: privacy category')
                documents.locator('select[aria-label="Dokumentumkategória"]').select_option('all')
                statusSelect=documents.locator('select[aria-label="Közzétételi állapot"]')
            statusSelect.select_option('available')
            check(documents.locator('.document-card').count()==(6 if platform=='desktop' else 5),f'{name}: available file filtering')
            statusSelect.select_option('all')
            docSearch=documents.locator('.document-center-search')
            docSearch.fill('pedagogiai')
            check(documents.locator('.document-card').count()==1,f'{name}: accent-insensitive document search')
            check(documents.locator('.document-card-open').count()==0,f'{name}: unavailable official PDF cannot open')
            docSearch.fill('teljesen-mas-kereses')
            check(documents.locator('.document-card').count()==0,f'{name}: document empty search')
            docSearch.fill('')
            # A teljes lista megnyitása után mindkét lokálisan mellékelt dokumentum látható.
            statusSelect.select_option('available')
            pdfCard=documents.locator('.document-card',has_text='A dokumentumközpont használata')
            pdfOpen=pdfCard.locator('.document-card-open')
            pdfOpen.click(force=True)
            dlg=page.locator('.document-reader[open]')
            dlg.wait_for(timeout=4000)
            check(dlg.locator('.document-reader-title').inner_text()=='A dokumentumközpont használata',f'{name}: PDF reader title')
            check(dlg.locator('.document-reader-page').inner_text()=='1. / 2. oldal',f'{name}: PDF first page')
            check(dlg.locator('.document-reader-preview').count()==1 or dlg.locator('.document-reader-canvas').count()==1,
                  f'{name}: actual inline PDF preview')
            check(dlg.locator('.document-reader-preview').first.evaluate('(img)=>img.naturalWidth>100') if dlg.locator('.document-reader-preview').count() else True,
                  f'{name}: PDF page thumbnail loaded')
            if dlg.locator('.document-reader-preview').count():
                page.wait_for_function("() => document.querySelector('.document-reader-preview')?.naturalWidth>100",timeout=5000)
            dlg.get_by_role('button',name='Következő dokumentumoldal').click(force=True)
            check(dlg.locator('.document-reader-page').inner_text()=='2. / 2. oldal',f'{name}: PDF page turns')
            dlg.get_by_role('button',name='Nagyítás').click(force=True)
            check(dlg.locator('.document-reader-zoom').inner_text()=='120%',f'{name}: PDF zoom')
            dlg.get_by_role('button',name='Szöveges nézet').click(force=True)
            dlg.locator('.document-reader-pdftext').wait_for(timeout=5000)
            check('dokumentumközpont' in dlg.locator('.document-reader-pdftext').inner_text().lower(),f'{name}: offline accessible PDF text')
            dlg.get_by_role('button',name='Szöveges nézet').click(force=True)
            if dlg.locator('.document-reader-preview').count():
                page.wait_for_function("() => document.querySelector('.document-reader-preview')?.naturalWidth>100",timeout=5000)
            check(len(ctx.pages)==1,f'{name}: PDF stays on same browser tab')
            page.screenshot(path=str(OUT/f'{name}-documents-pdf.png'))
            page.keyboard.press('Escape')
            check(dlg.count()==0,f'{name}: PDF Escape close')
            check(pdfOpen.evaluate('(e)=>e===document.activeElement'),f'{name}: PDF focus return')
            txtCard=documents.locator('.document-card',has_text='Dokumentumközzétételi ellenőrzőlista')
            txtCard.locator('.document-card-open').click(force=True)
            dlg.wait_for(timeout=4000)
            dlg.locator('.document-reader-text').wait_for(timeout=6000)
            check('NEM hivatalos' in dlg.locator('.document-reader-text').inner_text(),f'{name}: inline TXT read')
            check(len(ctx.pages)==1,f'{name}: TXT stays on same tab')
            page.keyboard.press('Escape')
            check(page.locator('.document-reader[open]').count()==0,f'{name}: TXT Escape close')
            check(page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'),f'{name}: document interaction overflow')
            documents.screenshot(path=str(OUT/f'{name}-documents.png'),animations='disabled')
            # A fejléc keresője minden aloldalon billentyűzettel elérhető,
            # képernyőolvasó számára élő találatszámmal és fókusz-visszaadással.
            toggle=page.locator('.'+platform+'-search-toggle')
            toggle.click(force=True)
            search=page.locator('.'+platform+'-search-input')
            search.wait_for(timeout=5000)
            check(search.evaluate('(el)=>document.activeElement===el'),f'{name}: search focus')
            search.fill('sportnap')
            check(page.locator('.'+platform+'-search-result').count()>0,f'{name}: search results')
            check(page.locator('.'+platform+'-search-count[aria-live="polite"]').count()==1,
                  f'{name}: live search counter')
            page.keyboard.press('Escape')
            check(page.locator('.'+platform+'-search-overlay').is_hidden(),
                  f'{name}: Escape search close')
            check(toggle.evaluate('(el)=>document.activeElement===el'),
                  f'{name}: focus restored to search opener')
            check(not errors,f'{name}: JS errors {errors[:3]}')
            reports.append({'case':name,'status':'PASS','errors':errors,'pages':len(to_visit)})
            print('PASS',name,'checked pages:',len(to_visit),'total checks:',passes,flush=True)
        except Exception as err:
            issues.append({'case':name,'error':str(err)[:900],'js':errors[:5]})
            reports.append({'case':name,'status':'FAIL','errors':errors})
            print('FAIL',name,repr(err),flush=True)
            try:page.screenshot(path=str(OUT/f'error-{name}.png'))
            except Exception:pass
        finally:
            ctx.close()
    # 30s timer and accessible pause in a real Chromium clock (no 30s wait).
    for name,reduce in ([] if os.environ.get('CSANADI_SKIP_CAROUSEL')=='1' else [('autoplay-desktop',False),('autoplay-reduced',True),('autoplay-mobile',False)]):
        mobile = name.endswith('mobile')
        ctx=browser.new_context(viewport={'width':390 if mobile else 1440,'height':900},
            is_mobile=mobile,has_touch=mobile,
            reduced_motion='reduce' if reduce else 'no-preference')
        ctx.route('https://csanadi-local.test/**',serve)
        ctx.route('https://cdn.jsdelivr.net/**',lambda route:route.abort())
        page=ctx.new_page()
        errors=[]
        page.on('pageerror',lambda err: errors.append(str(err)))
        try:
            page.goto('about:blank#/')
            page.clock.install()
            page.set_content('<!doctype html><html lang="hu"><head>'
              '<meta name="viewport" content="width=device-width,initial-scale=1">'
              '<base href="https://csanadi-local.test/">'
              '<link rel="stylesheet" href="shared/css/base.css?v='+release+'"></head>'
              '<body><div id="app"></div><script type="module" src="shared/js/entry.js?v='+release+'"></script></body></html>')
            tabs=page.locator('.home-carousel-tab')
            tabs.first.wait_for(timeout=10000)
            page.locator('.home-feature-carousel').scroll_into_view_if_needed()
            page.wait_for_timeout(220)
            page.mouse.move(0,0)
            def selected():return page.locator('.home-carousel-tab[aria-selected="true"]').inner_text()
            check(selected()=='Sportsikerek',f'{name}: begins on successes')
            page.clock.fast_forward(31000)
            page.wait_for_timeout(100)
            check(selected()==('Sportsikerek' if reduce else 'Tanévi naptár'),
                  f'{name}: 30-second or reduced-motion timer')
            if name=='autoplay-desktop':
                page.locator('.home-carousel-tab[aria-selected="true"]').hover(force=True)
                before=selected()
                page.clock.fast_forward(31000)
                page.wait_for_timeout(100)
                check(selected()==before,f'{name}: pointer hover must pause autoplay')
                page.mouse.move(0,0)
                page.clock.fast_forward(31000)
                page.wait_for_timeout(100)
                check(selected()=='Hírek és közlemények',f'{name}: resume after pointer leaves')
            check(not errors,f'{name}: JS errors {errors[:3]}')
            reports.append({'case':name,'status':'PASS','errors':errors,'pages':0})
            print('PASS',name,flush=True)
        except Exception as err:
            issues.append({'case':name,'error':str(err)[:900],'js':errors[:5]})
            reports.append({'case':name,'status':'FAIL','errors':errors})
            print('FAIL',name,repr(err),flush=True)
        finally:ctx.close()
    browser.close()
summary={'release':release,'passed_checks':passes,'test_cases':reports,'failures':issues,
         'note':'Helyi HTTPS virtuális útvonalra irányított eredeti fájlok; nem a publikált GitHub Pages és nem CDN E2E.'}
(OUT/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
print('SUMMARY:',passes,'checks,',len(issues),'failures',flush=True)
if issues:sys.exit(1)
