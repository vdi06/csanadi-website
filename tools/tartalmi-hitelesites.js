/* Intézményi jóváhagyást NEM végző, kizárólag helyi ellenőrző munkalap. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  // A korábbi helyi munkajegyzetek megőrzése a v1.8 → v1.9 átálláskor.
  const storageKey = 'csanadi-content-review-r13';
  const kinds = {
    pages: '../json/oldalindex.json',
    priority: '../dokumentacio/TARTALMI_MINOSEG_V1_39_9.json',
    documents: '../json/adatok/dokumentumok.json',
    assets: '../json/assets-inventory.json',
    mediaRights: '../json/mediatar.json',
    heroRights: '../dokumentacio/KEP_ES_MEDIA_JOGTISZTAZAS_V1_40_4.json',
    newsSources: '../json/adatok/hirek-hivatalos.json',
    criteria: '../dokumentacio/SZABALYOK_31_ALOLDAL_V1_9.json'
  };
  const statuses = ['pending', 'review', 'ready', 'approved'];
  const state = { rows: [], kind: 'pages', changes: {} };
  const text = (tag, value) => {
    const element = document.createElement(tag);
    element.textContent = String(value ?? '');
    return element;
  };
  const safe = value => String(value || '').toLocaleLowerCase('hu-HU').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // A munkalap szabad szövege CSV-olvasóban ne válhasson képletté.
  const quote = value => {
    const raw=String(value??'');
    const inert=/^[\s\uFEFF]*[=+\-@]/.test(raw)?"'"+raw:raw;
    return '"'+inert.replace(/"/g,'""')+'"';
  };
  const clean = (value, limit) => String(value ?? '').trim().slice(0, limit);
  const needsMediaApproval=item=>item.rights?.clearance!=='approved'||
    !item.rights?.evidence||!item.rights?.reviewer||!item.rights?.permission;
  function officialSourceUrl(value){
    try{const url=new URL(String(value||''));return url.protocol==='https:'&&url.hostname==='csanadi-bp.edu.hu'&&url.pathname!=='/';}
    catch{return false;}
  }
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (data && typeof data === 'object' && !Array.isArray(data)) state.changes = data;
  } catch { /* sérült helyi adatok esetén üres munkalappal indulunk */ }

  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state.changes)); }
    catch { $('status').textContent = 'A helyi mentés nem sikerült. Exportáld a JSON-munkalapot.'; }
  }
  function download(name, data, mime) {
    const url = URL.createObjectURL(new Blob([data], { type: mime }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }
  function missingApprovalFields(kind,entry) {
    const missing=[];
    if(!entry.reviewer)missing.push('ellenőrző');
    if(!entry.evidence)missing.push('forrás és dátum');
    if(kind==='newsSources'){
      if(!officialSourceUrl(entry.sourceUrl))missing.push('intézményi HTTPS-forráscím');
      if(!/\b\d{4}-\d{2}-\d{2}\b/.test(String(entry.evidence||'')))missing.push('ellenőrzés dátuma (ÉÉÉÉ-HH-NN)');
    }
    if(['assets','mediaRights','heroRights'].includes(kind)&&!entry.permission)missing.push('felhasználási jogosultság');
    if(!entry.decision)missing.push('intézményi döntés');
    return missing;
  }
  function currentFor(kind,row) {
    const entry=state.changes[row.key] || { status: 'pending', note: '', reviewer: '', evidence: '', sourceUrl:'',permission: '', decision: '' };
    return entry.status==='approved'&&missingApprovalFields(kind,entry).length?{...entry,status:'review'}:entry;
  }
  function current(row){return currentFor(state.kind,row);}
  function change(row, key, value) {
    state.changes[row.key] = { ...current(row), [key]: value, date: new Date().toISOString() };
    save();
  }
  function completeApproval(row, entry) {
    return missingApprovalFields(state.kind,entry).length===0;
  }
  async function load() {
    state.kind = $('kind').value;
    $('status').textContent = 'Az adatok betöltése…';
    try {
      const response = await fetch(kinds[state.kind], { cache: 'no-store' });
      if (!response.ok) throw Error('HTTP ' + response.status);
      const data = await response.json();
      if (state.kind === 'pages') state.rows = Object.entries(data.pages || {}).map(([path, item]) => ({
        key: 'page:' + path, title: item.title || path, path: 'json/' + path,
        description: item.summary || '',
        sourceStatus: item.schemaExtensions?.verifiedContent === true ? 'verifiedContent=true' : 'verifiedContent=false'
      }));
      if (state.kind === 'priority') {
        if (!Array.isArray(data.priorities) || data.priorities.length !== data.manualPriorityPages) throw Error('A kézi intézményi ellenőrzési lista nem egyezik a jelentéssel.');
        state.rows = data.priorities.map(item => ({
          key: 'page:' + item.file.replace(/^json\//, ''), title: item.title, path: item.file,
          route: item.route, description: (item.manualApproval || []).join(' '),
          sourceStatus: 'Intézményi jóváhagyás szükséges · ' + item.route
        }));
      }
      if (state.kind === 'documents') state.rows = (data.documents || []).map(item => ({
        key: 'doc:' + item.id, title: item.title || item.id, path: item.filePath || '',
        description: item.summary || '', sourceStatus: 'official=' + String(item.official)
      }));
      if (state.kind === 'assets') state.rows = (data.items || []).map(item => ({
        key: 'asset:' + item.path, title: item.path.split('/').at(-1), path: item.path,
        description: (item.category || '') + ' ' + (item.tags || []).join(','),
        sourceStatus: item.sha256 ? 'SHA-256 nyilvántartva' : 'SHA-256 nélkül'
      }));
      if (state.kind === 'mediaRights') state.rows = (data.items || []).filter(needsMediaApproval).map(item => ({
        key: 'media:' + item.id, title: item.id, path: item.original?.path || '',
        description: [item.alt, item.caption, item.rights?.license].filter(Boolean).join(' · '),
        sourceStatus: 'Nem igazolt intézményi jóváhagyás · ' + (item.rights?.clearance || 'ismeretlen') + ' · ' + (item.rights?.holder || 'Ismeretlen jogosult')
      }));
      if (state.kind === 'heroRights') state.rows = (data.heroItems || []).map(item => ({
        key: 'media:' + item.id, title: String(item.heroPosition).padStart(2,'0') + '. kép · ' + item.id,
        path: item.file || '', description: [item.title,item.classification,item.rightsNote].filter(Boolean).join(' · '),
        sourceStatus: 'Kezdőlap · ' + item.clearance + ' · nem igazolt intézményi jóváhagyás'
      }));
      if(state.kind==='newsSources')state.rows=(data.items||[]).filter(item=>item.status==='verified').map(item=>({
        key:'news:'+item.id,title:item.title||item.id,path:'json/adatok/hirek-hivatalos.json',
        description:item.summary||'',sourceStatus:'A verified jelölés NEM igazolás: a hír jelenleg csak helyi #/ útvonalat tartalmaz, hivatalos HTTPS-forrás nélkül.'
      }));
      if (state.kind === 'criteria') {
        if (!Number.isInteger(data.pages) || data.criteria !== 31 || !Array.isArray(data.open)) throw Error('A 31 szabályos munkalap formátuma hibás.');
        state.rows = data.open.map(item => ({
          key: 'rule:' + item.route + ':' + item.ruleNumber,
          title: item.title + ' – ' + item.ruleNumber + '. szabály',
          path: item.json,
          description: item.reason,
          sourceStatus: 'H · ' + item.rule + ' · ' + item.route,
          issue: item.reason,
          ruleNumber: item.ruleNumber,
          route: item.route
        }));
      }
      render();
    } catch (error) {
      state.rows = [];
      $('items').replaceChildren();
      $('summary').textContent = '';
      $('status').textContent = 'Nem sikerült betölteni a forrásadatokat: ' + error.message + '. HTTP(S)-kiszolgáló szükséges.';
    }
  }
  function makeField(row, property, placeholder, limit = 350) {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = limit;
    input.placeholder = placeholder;
    input.value = current(row)[property] || '';
    input.setAttribute('aria-label', row.title + ' – ' + placeholder);
    input.addEventListener('change', () => {
      change(row, property, input.value.trim());
      const hint=input.closest?.('tr')?.querySelector('.approval-requirements');
      if(hint)hint.textContent=approvalHint(state.kind,current(row));
      if($('state').value==='missing')render();else updateSummary();
    });
    return input;
  }
  function approvalHint(kind,item){
    const missing=missingApprovalFields(kind,item);
    return missing.length?'Hiányzó igazoló adatok: '+missing.join(', ')+'.':
      'A helyi mezők kitöltve; az intézményi jóváhagyás ettől még nem igazolt.';
  }
  function render() {
    const search = safe($('filter').value);
    const statusFilter = $('state').value;
    const tbody = $('items');
    tbody.replaceChildren();
    let shown = 0;
    for (const row of state.rows) {
      const item = current(row);
      if (statusFilter==='missing'){
        if(!missingApprovalFields(state.kind,item).length)continue;
      }else if (statusFilter !== 'all' && item.status !== statusFilter) continue;
      if (search && !safe([row.title, row.path, row.description, row.route, item.note].join(' ')).includes(search)) continue;
      shown++;
      const tr = document.createElement('tr');
      const info = document.createElement('td');
      info.dataset.label = 'Tétel';
      info.append(text('strong', row.title));
      if (row.description) {
        const summary = text('p', row.description.slice(0, 260));
        summary.className = 'help';
        info.append(summary);
      }
      const source = document.createElement('td');
      source.dataset.label = 'Forrás / hivatkozás';
      if (row.path.startsWith('json/') || row.path.startsWith('assets/')) {
        const link = text('a', row.path);
        link.href = '../' + row.path;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        source.append(link);
      } else source.append(text('span', row.path));
      source.append(text('p', row.sourceStatus));
      if(['priority','mediaRights','heroRights','newsSources'].includes(state.kind)){
        const hint=text('p',approvalHint(state.kind,item));
        hint.className='approval-requirements';source.append(hint);
      }
      tr.append(info, source);

      const select = document.createElement('select');
      select.setAttribute('aria-label', row.title + ' ellenőrzési állapota');
      for (const [value, title] of [
        ['pending', 'Felülvizsgálandó'], ['review', 'Javítandó'],
        ['ready', 'Helyben ellenőrizve'], ['approved', 'Jóváhagyási adat rögzítve']
      ]) {
        const option = text('option', title);
        option.value = value;
        select.append(option);
      }
      select.value = item.status || 'pending';
      select.addEventListener('change', () => {
        const previous = current(row);
        if (select.value === 'approved' && !completeApproval(row, previous)) {
          select.value = previous.status || 'pending';
          $('status').textContent = 'A jóváhagyási ADAT rögzítéséhez ellenőrző, bizonyíték, intézményi döntés és média esetén jogosultsági adat szükséges.';
          return;
        }
        change(row, 'status', select.value);
        updateSummary();
      });
      const controls = [
        select,
        makeField(row, 'note', 'Ellenőrzési megjegyzés'),
        makeField(row, 'reviewer', 'Ellenőrző neve', 120),
        makeField(row, 'evidence', 'Forrás és dátum'),
        makeField(row, 'permission', ['assets','mediaRights','heroRights'].includes(state.kind) ? 'Felhasználási jog, jogosult' : 'Jogalap / megjegyzés', 300),
        makeField(row, 'decision', 'Intézményi döntés azonosítója / megjegyzés', 300),
        state.kind==='newsSources'?makeField(row,'sourceUrl','Hivatalos HTTPS-forrás URL',350):text('span','–')
      ];
      const columnTitles = ['Állapot', 'Megjegyzés', 'Ellenőrző', 'Bizonyíték', 'Jogalap', 'Intézményi döntés', 'HTTPS-forrás'];
      for (const [index, control] of controls.entries()) {
        const td = document.createElement('td');
        td.dataset.label = columnTitles[index];
        td.append(control);
        tr.append(td);
      }
      tbody.append(tr);
    }
    $('status').textContent = shown + ' / ' + state.rows.length + ' tétel látható.';
    updateSummary();
  }
  function updateSummary() {
    const counts = { pending: 0, review: 0, ready: 0, approved: 0 };
    let complete=0;
    for (const row of state.rows){const item=current(row);counts[item.status || 'pending']++;if(!missingApprovalFields(state.kind,item).length)complete++;}
    $('summary').textContent = `Felülvizsgálandó: ${counts.pending} · Javítandó: ${counts.review} · Helyben ellenőrizve: ${counts.ready} · Jóváhagyási adat rögzítve: ${counts.approved} · Igazoló mezők kitöltve: ${complete}/${state.rows.length} (nem jelent hivatalos jóváhagyást)`;
  }
  function payload() { return state.rows.map(row => ({ ...row, ...current(row) })); }

  $('kind').addEventListener('change', load);
  $('filter').addEventListener('input', render);
  $('state').addEventListener('change', render);
  $('exportcsv').addEventListener('click', () => {
    const rows = [
      ['Kulcs', 'Cím', 'Útvonal', 'Forrásstátusz', 'Helyi munkastátusz', 'Megjegyzés', 'Ellenőrző', 'Bizonyíték', 'Hivatalos HTTPS-forrás', 'Jogalap', 'Intézményi döntés', 'Módosítva'],
      ...payload().map(row => [row.key, row.title, row.path, row.sourceStatus, row.status, row.note, row.reviewer, row.evidence, row.sourceUrl, row.permission, row.decision, row.date || ''])
    ];
    download('csanadi_hitelesitesi_munkalap_' + state.kind + '.csv', '\ufeff' + rows.map(cols => cols.map(quote).join(';')).join('\r\n'), 'text/csv;charset=utf-8');
  });
  $('exportjson').addEventListener('click', () => download('csanadi_hitelesitesi_munkalap_' + state.kind + '.json',
    JSON.stringify({ schemaVersion: '1.2.0', kind: state.kind, generatedAt: new Date().toISOString(), records: payload() }, null, 2), 'application/json'));
  $('exportfocus').addEventListener('click',async()=>{
    const button=$('exportfocus');button.disabled=true;
    $('status').textContent='A kiemelt oldalak és minden még nem igazolt média munkalapja készül…';
    try{
      const responses=await Promise.all([kinds.priority,kinds.mediaRights].map(url=>fetch(url,{cache:'no-store'})));
      if(responses.some(response=>!response.ok))throw Error('A forráslisták egyike nem érhető el.');
      const [report,library]=await Promise.all(responses.map(response=>response.json()));
      const priorities=report.priorities||[];
      const media=(library.items||[]).filter(needsMediaApproval);
      if(!Array.isArray(report.priorities)||!Array.isArray(library.items))throw Error('Hibás forráslisták.');
      const worklist=[
        ...priorities.map(item=>({kind:'priority',key:'page:'+item.file.replace(/^json\//,''),title:item.title,path:item.file})),
        ...media.map(item=>({kind:'mediaRights',key:'media:'+item.id,title:item.id,path:item.original?.path||''}))
      ];
      const rows=[['Adatkör','Kulcs','Cím','Forrásfájl','Helyi munkastátusz','Hiányzó igazoló adatok','Ellenőrző','Forrás és dátum','Jogalap','Intézményi döntés','Megjegyzés','Módosítva']];
      for(const item of worklist){
        const entry=currentFor(item.kind,item);
        rows.push([item.kind,item.key,item.title,item.path,entry.status||'pending',missingApprovalFields(item.kind,entry).join(', '),entry.reviewer,entry.evidence,entry.permission,entry.decision,entry.note,entry.date||'']);
      }
      download('csanadi_oldal_media_jogtisztazasi_lista_v1_40_5.csv','\ufeff'+rows.map(cells=>cells.map(quote).join(';')).join('\r\n'),'text/csv;charset=utf-8');
      $('status').textContent=worklist.length+' helyi ellenőrzési tétel exportálva. A fájl nem jelent intézményi engedélyezést.';
    }catch(error){$('status').textContent='Az összesített export nem sikerült: '+error.message;}
    finally{button.disabled=false;}
  });
  $('exportall').addEventListener('click',async()=>{
    const button=$('exportall');button.disabled=true;
    $('status').textContent='Az összes nyitott hitelesítési munkatétel összeállítása…';
    try{
      const responses=await Promise.all([kinds.priority,kinds.mediaRights,kinds.newsSources].map(url=>fetch(url,{cache:'no-store'})));
      if(responses.some(response=>!response.ok))throw Error('Legalább egy forrásadat nem érhető el.');
      const [report,library,news]=await Promise.all(responses.map(response=>response.json()));
      const priorities=report.priorities||[],media=(library.items||[]).filter(needsMediaApproval),newsItems=(news.items||[]).filter(item=>item.status==='verified');
      if(!Array.isArray(report.priorities)||!Array.isArray(library.items)||!Array.isArray(news.items))throw Error('Hibás forráslisták.');
      const worklist=[
        ...priorities.map(item=>({kind:'priority',key:'page:'+item.file.replace(/^json\//,''),title:item.title,path:item.file})),
        ...media.map(item=>({kind:'mediaRights',key:'media:'+item.id,title:item.id,path:item.original?.path||''})),
        ...newsItems.map(item=>({kind:'newsSources',key:'news:'+item.id,title:item.title,path:'json/adatok/hirek-hivatalos.json'}))
      ];
      const rows=[['Adatkör','Kulcs','Cím','Forrásfájl','Helyi munkastátusz','Hiányzó igazoló adatok','Ellenőrző','Forrás és dátum','Intézményi HTTPS-forrás','Jogalap','Intézményi döntés','Megjegyzés','Módosítva']];
      for(const item of worklist){
        const entry=currentFor(item.kind,item);
        rows.push([item.kind,item.key,item.title,item.path,entry.status||'pending',missingApprovalFields(item.kind,entry).join(', '),entry.reviewer,entry.evidence,entry.sourceUrl,entry.permission,entry.decision,entry.note,entry.date||'']);
      }
      download('csanadi_osszes_jovahagyasi_lista_v1_40_5.csv','\ufeff'+rows.map(cells=>cells.map(quote).join(';')).join('\r\n'),'text/csv;charset=utf-8');
      $('status').textContent=worklist.length+' tételes CSV kész. A helyi munkastátuszok és forráscímek nem jelentik az intézményi jóváhagyást.';
    }catch(error){$('status').textContent='Az összesített export nem sikerült: '+error.message;}
    finally{button.disabled=false;}
  });
  $('exportaudit').addEventListener('click',async()=>{
    const button=$('exportaudit');button.disabled=true;
    $('status').textContent='A három adatkör géppel feldolgozható audit-JSON-ja készül…';
    try{
      const responses=await Promise.all([kinds.priority,kinds.mediaRights,kinds.newsSources].map(url=>fetch(url,{cache:'no-store'})));
      if(responses.some(response=>!response.ok))throw Error('A három forráslista egyike nem érhető el.');
      const [priority,media,news]=await Promise.all(responses.map(response=>response.json()));
      const sourceRows=[
        ...(priority.priorities||[]).map(entry=>({kind:'priority',key:'page:'+entry.file.replace(/^json\//,''),title:entry.title,path:entry.file})),
        ...(media.items||[]).filter(needsMediaApproval).map(entry=>({kind:'mediaRights',key:'media:'+entry.id,title:entry.id,path:entry.original?.path||''})),
        ...(news.items||[]).filter(entry=>entry.status==='verified').map(entry=>({kind:'newsSources',key:'news:'+entry.id,title:entry.title,path:'json/adatok/hirek-hivatalos.json'}))
      ];
      if(!Array.isArray(priority.priorities)||!Array.isArray(media.items)||!Array.isArray(news.items))throw Error('Hibás vagy hiányos forráslista.');
      const counts={priority:{total:0,locallyComplete:0},mediaRights:{total:0,locallyComplete:0},newsSources:{total:0,locallyComplete:0}};
      const records=sourceRows.map(source=>{
        const current=currentFor(source.kind,source),missing=missingApprovalFields(source.kind,current),complete=!missing.length;
        counts[source.kind].total++;if(complete)counts[source.kind].locallyComplete++;
        return {...source,localStatus:current.status||'pending',localFieldsComplete:complete,
          missingEvidence:missing,reviewer:current.reviewer||'',evidence:current.evidence||'',
          sourceUrl:current.sourceUrl||'',permission:current.permission||'',decision:current.decision||'',
          note:current.note||'',updatedAt:current.date||''};
      });
      const report={schemaVersion:'1.0.0',type:'csanadi-local-content-audit',release:'1.40.5',
        generatedAt:new Date().toISOString(),institutionalApprovalVerified:false,ftpPublished:false,
        warning:'A helyi igazoló mezők kitöltése és az URL alakjának ellenőrzése NEM bizonyít valódi intézményi jóváhagyást vagy a forrás ténybeli helyességét.',counts,records};
      download('csanadi_helyi_audit_v1_40_5.json',JSON.stringify(report,null,2),'application/json');
      $('status').textContent=sourceRows.length+' tételes helyi audit-JSON exportálva. Közzététel és jóváhagyás nem történt.';
    }catch(error){$('status').textContent='Audit-JSON nem készült: '+error.message;}
    finally{button.disabled=false;}
  });
  $('importjson').addEventListener('change', async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw Error('A fájl túl nagy (maximum 2 MB).');
      const incoming = JSON.parse(await file.text());
      if (!incoming || incoming.kind !== state.kind || !Array.isArray(incoming.records)) throw Error('Nem a kiválasztott adatkör exportált JSON-munkalapja.');
      const allowed = new Set(state.rows.map(row => row.key));
      let accepted = 0;
      const changes = {};
      for (const row of incoming.records) {
        if (!row || !allowed.has(row.key) || !statuses.includes(row.status)) continue;
        const entry = {
          status: row.status, note: clean(row.note, 350), reviewer: clean(row.reviewer, 120),
          evidence: clean(row.evidence, 350),sourceUrl:clean(row.sourceUrl,350),permission: clean(row.permission, 300),
          decision: clean(row.decision, 300), date: clean(row.date, 40)
        };
        if (entry.status === 'approved' && !completeApproval(row, entry)) entry.status = 'review';
        changes[row.key] = entry;
        accepted++;
      }
      if (!accepted) throw Error('Nincs beolvasható, egyező kulcsú munkatétel.');
      if (!confirm(accepted + ' helyi munkatétel beolvasása és egyező kulcsú bejegyzések felülírása? Az FTP változatlan marad.')) return;
      Object.assign(state.changes, changes);
      save();
      render();
      $('status').textContent = accepted + ' helyi munkatétel beolvasva. Hivatalos igazolás vagy oldalpublikálás nem történt.';
    } catch (error) { $('status').textContent = 'JSON-import nem sikerült: ' + error.message; }
  });
  load();
})();
