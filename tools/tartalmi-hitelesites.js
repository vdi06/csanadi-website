/* Intézményi jóváhagyást NEM végző, kizárólag helyi ellenőrző munkalap. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  // A korábbi helyi munkajegyzetek megőrzése a v1.8 → v1.9 átálláskor.
  const storageKey = 'csanadi-content-review-r13';
  const kinds = {
    pages: '../json/oldalindex.json',
    documents: '../json/adatok/dokumentumok.json',
    assets: '../json/assets-inventory.json',
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
  const quote = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  const clean = (value, limit) => String(value ?? '').trim().slice(0, limit);
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
  function current(row) {
    return state.changes[row.key] || { status: 'pending', note: '', reviewer: '', evidence: '', permission: '', decision: '' };
  }
  function change(row, key, value) {
    state.changes[row.key] = { ...current(row), [key]: value, date: new Date().toISOString() };
    save();
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
      if (state.kind === 'documents') state.rows = (data.documents || []).map(item => ({
        key: 'doc:' + item.id, title: item.title || item.id, path: item.filePath || '',
        description: item.summary || '', sourceStatus: 'official=' + String(item.official)
      }));
      if (state.kind === 'assets') state.rows = (data.items || []).map(item => ({
        key: 'asset:' + item.path, title: item.path.split('/').at(-1), path: item.path,
        description: (item.category || '') + ' ' + (item.tags || []).join(','),
        sourceStatus: item.sha256 ? 'SHA-256 nyilvántartva' : 'SHA-256 nélkül'
      }));
      if (state.kind === 'criteria') {
        if (data.pages !== 65 || data.criteria !== 31 || !Array.isArray(data.open)) throw Error('A 31 szabályos munkalap formátuma hibás.');
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
    input.addEventListener('change', () => change(row, property, input.value.trim()));
    return input;
  }
  function render() {
    const search = safe($('filter').value);
    const statusFilter = $('state').value;
    const tbody = $('items');
    tbody.replaceChildren();
    let shown = 0;
    for (const row of state.rows) {
      const item = current(row);
      if (statusFilter !== 'all' && item.status !== statusFilter) continue;
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
        if (select.value === 'approved' && (!previous.reviewer || !previous.evidence ||
          (state.kind === 'assets' && !previous.permission) ||
          (state.kind === 'criteria' && !previous.decision))) {
          select.value = previous.status || 'pending';
          $('status').textContent = 'A jóváhagyási ADAT rögzítéséhez ellenőrző, bizonyíték és a megfelelő jogi/intézményi döntés mezők szükségesek.';
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
        makeField(row, 'permission', state.kind === 'assets' ? 'Felhasználási jog, jogosult' : 'Jogalap / megjegyzés', 300),
        makeField(row, 'decision', 'Intézményi döntés azonosítója / megjegyzés', 300)
      ];
      const columnTitles = ['Állapot', 'Megjegyzés', 'Ellenőrző', 'Bizonyíték', 'Jogalap', 'Intézményi döntés'];
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
    for (const row of state.rows) counts[current(row).status || 'pending']++;
    $('summary').textContent = `Felülvizsgálandó: ${counts.pending} · Javítandó: ${counts.review} · Helyben ellenőrizve: ${counts.ready} · Jóváhagyási adat rögzítve: ${counts.approved}`;
  }
  function payload() { return state.rows.map(row => ({ ...row, ...current(row) })); }

  $('kind').addEventListener('change', load);
  $('filter').addEventListener('input', render);
  $('state').addEventListener('change', render);
  $('exportcsv').addEventListener('click', () => {
    const rows = [
      ['Kulcs', 'Cím', 'Útvonal', 'Forrásstátusz', 'Helyi munkastátusz', 'Megjegyzés', 'Ellenőrző', 'Bizonyíték', 'Jogalap', 'Intézményi döntés', 'Módosítva'],
      ...payload().map(row => [row.key, row.title, row.path, row.sourceStatus, row.status, row.note, row.reviewer, row.evidence, row.permission, row.decision, row.date || ''])
    ];
    download('csanadi_hitelesitesi_munkalap_' + state.kind + '.csv', '\ufeff' + rows.map(cols => cols.map(quote).join(';')).join('\r\n'), 'text/csv;charset=utf-8');
  });
  $('exportjson').addEventListener('click', () => download('csanadi_hitelesitesi_munkalap_' + state.kind + '.json',
    JSON.stringify({ schemaVersion: '1.1.0', kind: state.kind, generatedAt: new Date().toISOString(), records: payload() }, null, 2), 'application/json'));
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
          evidence: clean(row.evidence, 350), permission: clean(row.permission, 300),
          decision: clean(row.decision, 300), date: clean(row.date, 40)
        };
        if (entry.status === 'approved' && (!entry.reviewer || !entry.evidence ||
          (state.kind === 'assets' && !entry.permission) ||
          (state.kind === 'criteria' && !entry.decision))) entry.status = 'review';
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
