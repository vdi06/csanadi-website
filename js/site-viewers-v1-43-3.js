// Csanádi 1.43.3 – helyi PDF-renderelés és tematikus Bootstrap-képnéző.
// PDF.js 5.7.284 (Apache-2.0) a ZIP-ben, hálózati PDF-szolgáltatás nélkül.
const ROOT = new URL('../', import.meta.url);
const PDF_LIB = new URL('./vendor/pdfjs/pdf.min.js', import.meta.url);
const PDF_WORKER = new URL('./vendor/pdfjs/pdf.worker.min.js', import.meta.url);
const PDF_CMAPS = new URL('./vendor/pdfjs/cmaps/', import.meta.url);
const PDF_FONTS = new URL('./vendor/pdfjs/standard_fonts/', import.meta.url);
const PDF_WASM = new URL('./vendor/pdfjs/wasm/', import.meta.url);
const allowedFile = /^assets\/documents\/[a-z0-9._-]+\.(?:pdf|txt|docx)$/;
const allowedImage = /^assets\/(?:media\/[a-z0-9/_-]+\.webp|graphics\/[a-z0-9_-]+\.svg)$/;
let pdfLibrary;
let serial = 0;

const el = (tag, css = '', value) => {
  const element = document.createElement(tag);
  if (css) element.className = css;
  if (value !== undefined) element.textContent = String(value);
  return element;
};
const add = (target, ...nodes) => { target.append(...nodes); return target; };
const button = (label, css = 'btn btn-outline-secondary') => {
  const element = el('button', css, label);
  element.type = 'button';
  return element;
};
function modalShell(label, contentClass, size = 'modal-xl') {
  if (!window.bootstrap?.Modal) throw new Error('A Bootstrap párbeszédablak nem érhető el.');
  const id = 'cs43-modal-title-' + ++serial;
  const root = el('div', 'modal fade cs43-viewer ' + contentClass);
  root.tabIndex = -1;
  root.setAttribute('aria-labelledby', id);
  root.setAttribute('aria-modal', 'true');
  const dialog = el('div', 'modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down ' + size);
  const content = el('div', 'modal-content');
  const header = el('div', 'modal-header');
  const title = el('h2', 'modal-title fs-5', label); title.id = id;
  const close = button('', 'btn-close'); close.dataset.bsDismiss = 'modal'; close.setAttribute('aria-label', 'Bezárás');
  add(header, title, close);
  const body = el('div', 'modal-body');
  const footer = el('div', 'modal-footer');
  add(content, header, body, footer); dialog.append(content); root.append(dialog);
  root.dataset.bsTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const themeObserver = new MutationObserver(() => {
    root.dataset.bsTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.body.append(root);
  const instance = new window.bootstrap.Modal(root, { backdrop: true, keyboard: true, focus: true });
  root.addEventListener('hidden.bs.modal', () => {
    themeObserver.disconnect(); instance.dispose(); root.remove();
  }, { once: true });
  return { root, header, body, footer, title, instance };
}

async function getPdfLibrary() {
  if (!pdfLibrary) {
    pdfLibrary = import(PDF_LIB.href).then(mod => {
      mod.GlobalWorkerOptions.workerSrc = PDF_WORKER.href;
      return mod;
    }).catch(error => { pdfLibrary = null; throw error; });
  }
  return pdfLibrary;
}

export function openDocumentViewer(doc, trigger = document.activeElement) {
  if (!doc || !allowedFile.test(doc.filePath || '')) return false;
  const { root, body, footer, instance } = modalShell(doc.title || 'Dokumentum', 'cs43-document-viewer');
  const fileUrl = new URL(doc.filePath, ROOT).href;
  const description = el('p', 'cs43-document-description', doc.summary || '');
  const badges = el('div', 'd-flex flex-wrap gap-2 mb-3');
  for (const text of [doc.documentKind || 'dokumentum', doc.status === 'published' ? 'Aktuális' : doc.status, 'v' + (doc.version || '1.0.0')]) {
    badges.append(el('span', 'badge rounded-pill text-bg-secondary', text));
  }
  const progress = el('div', 'alert alert-info mb-2 cs43-load-status', 'A dokumentum betöltése…');
  progress.setAttribute('role', 'status'); progress.setAttribute('aria-live', 'polite');
  const paper = el('div', 'cs43-paper');
  const canvas = el('canvas', 'cs43-pdf-canvas');
  const plain = el('pre', 'cs43-plain-document'); plain.hidden = true;
  add(paper, canvas, plain);
  const toolbar = el('div', 'cs43-pdf-toolbar d-flex flex-wrap align-items-center gap-2 mb-2');
  const previous = button('Előző oldal', 'btn btn-outline-secondary btn-sm');
  const next = button('Következő oldal', 'btn btn-outline-secondary btn-sm');
  const page = el('span', 'badge rounded-pill text-bg-secondary cs43-page-count', '– / –');
  const zoomOut = button('−', 'btn btn-outline-secondary btn-sm'); zoomOut.setAttribute('aria-label', 'Kicsinyítés');
  const zoomIn = button('+', 'btn btn-outline-secondary btn-sm'); zoomIn.setAttribute('aria-label', 'Nagyítás');
  const zoomLabel = el('span', 'cs43-zoom-label', 'Oldalszélesség');
  const fit = button('Szélességhez', 'btn btn-outline-secondary btn-sm');
  add(toolbar, previous, page, next, zoomOut, zoomLabel, zoomIn, fit);
  if (doc.mimeType !== 'application/pdf') toolbar.hidden = true;
  add(body, badges, description, toolbar, progress, paper);
  const download = el('a', 'btn btn-primary', 'Letöltés'); download.href = fileUrl;
  download.download = doc.fileName || 'dokumentum';
  const close = button('Bezárás', 'btn btn-outline-secondary'); close.dataset.bsDismiss = 'modal';
  add(footer, close, download);

  if (Array.isArray(doc.versionHistory) && doc.versionHistory.length) {
    const details = el('details', 'cs43-document-history mt-3');
    details.append(el('summary', 'fw-semibold', 'Verziótörténet és dokumentumadatok'));
    const list = el('ul', 'list-group list-group-flush mt-2');
    for (const version of doc.versionHistory) list.append(el('li', 'list-group-item', `${version.version} · ${version.date} – ${version.change}`));
    details.append(list); body.append(details);
  }

  let pdf = null, renderTask = null, loadingTask = null, disposed = false;
  let currentPage = 1, factor = 1, renderSerial = 0;
  function state() {
    previous.disabled = !pdf || currentPage <= 1;
    next.disabled = !pdf || currentPage >= pdf.numPages;
    page.textContent = pdf ? `${currentPage} / ${pdf.numPages}` : '– / –';
    zoomLabel.textContent = factor === 1 ? 'Oldalszélesség' : Math.round(factor * 100) + '%';
  }
  state();
  const report = (message, kind = 'info') => {
    progress.className = 'alert alert-' + kind + ' mb-2 cs43-load-status';
    progress.textContent = message;
    progress.hidden = !message;
  };
  async function render() {
    if (!pdf || disposed) return;
    const thisRender = ++renderSerial;
    if (renderTask) {
      const previousTask = renderTask;
      try { previousTask.cancel(); await previousTask.promise.catch(() => {}); } catch {}
    }
    if (disposed || thisRender !== renderSerial) return;
    state(); report('Az oldal megjelenítése…');
    try {
      const pdfPage = await pdf.getPage(currentPage);
      if (disposed || thisRender !== renderSerial) return;
      const native = pdfPage.getViewport({ scale: 1 });
      const availableWidth = Math.max(260, paper.clientWidth - 24);
      const scale = Math.min(3, Math.max(.2, availableWidth / native.width * factor));
      const view = pdfPage.getViewport({ scale });
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(view.width * pixelRatio);
      canvas.height = Math.ceil(view.height * pixelRatio);
      canvas.style.width = Math.ceil(view.width) + 'px';
      canvas.style.height = Math.ceil(view.height) + 'px';
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) throw Error('A rajzfelület nem érhető el.');
      renderTask = pdfPage.render({ canvasContext: ctx, viewport: view,
        transform: pixelRatio === 1 ? null : [pixelRatio, 0, 0, pixelRatio, 0, 0] });
      await renderTask.promise;
      if (thisRender === renderSerial && !disposed) { report(''); body.scrollTo({ top: 0 }); }
    } catch (error) {
      if (error?.name !== 'RenderingCancelledException' && !disposed && thisRender === renderSerial)
        report('Ezt az oldalt most nem sikerült megjeleníteni. A dokumentum letölthető.', 'warning');
    } finally { if (thisRender === renderSerial) renderTask = null; }
  }
  previous.addEventListener('click', () => { if (pdf && currentPage > 1) { currentPage--; render(); } });
  next.addEventListener('click', () => { if (pdf && currentPage < pdf.numPages) { currentPage++; render(); } });
  zoomOut.addEventListener('click', () => { factor = Math.max(.5, +(factor - .25).toFixed(2)); render(); });
  zoomIn.addEventListener('click', () => { factor = Math.min(3, +(factor + .25).toFixed(2)); render(); });
  fit.addEventListener('click', () => { factor = 1; render(); });
  root.addEventListener('keydown', event => {
    if (!pdf || event.target?.matches('input,textarea,select')) return;
    if (event.key === 'ArrowLeft' && currentPage > 1) { event.preventDefault(); previous.click(); }
    if (event.key === 'ArrowRight' && currentPage < pdf.numPages) { event.preventDefault(); next.click(); }
  });
  root.addEventListener('hidden.bs.modal', () => {
    disposed = true; renderSerial++;
    if (renderTask) { try { renderTask.cancel(); } catch {} }
    loadingTask?.destroy().catch(() => {});
    if (pdf && !loadingTask) pdf.destroy().catch(() => {});
    if (trigger?.isConnected && trigger.getClientRects?.().length) trigger.focus({ preventScroll: true });
  }, { once: true });
  root.addEventListener('shown.bs.modal', async () => {
    try {
      if (doc.mimeType === 'application/pdf') {
        const mod = await getPdfLibrary(); if (disposed) return;
        loadingTask = mod.getDocument({ url: fileUrl, cMapUrl: PDF_CMAPS.href,
          cMapPacked: true, standardFontDataUrl: PDF_FONTS.href, wasmUrl: PDF_WASM.href });
        pdf = await loadingTask.promise; if (!disposed) await render();
      } else if (doc.mimeType === 'text/plain') {
        const response = await fetch(fileUrl);
        if (!response.ok) throw Error('HTTP ' + response.status);
        const text = await response.text(); if (disposed) return;
        plain.textContent = text.slice(0, 200000); plain.hidden = false; canvas.hidden = true; report('');
      } else {
        canvas.hidden = true;
        report('A Word-dokumentum eredeti formázását a néző nem módosítja. Az állomány közvetlenül letölthető.', 'secondary');
      }
    } catch (error) {
      if (!disposed) report('A dokumentum nem tölthető be a megtekintőbe. Próbáld a Letöltés gombot. (' + (error?.message || 'Hiba') + ')', 'warning');
    }
  }, { once: true });
  instance.show();
  return true;
}

export function openImageViewer(items, index = 0, options = {}) {
  const safe = (Array.isArray(items) ? items : []).filter(item => item && allowedImage.test(item.src || ''));
  if (!safe.length) return false;
  const start = Math.max(0, Math.min(index, safe.length - 1));
  const { root, body, footer, instance } = modalShell(options.title || 'Tematikus képnézegető', 'cs43-image-viewer');
  const carouselId = 'cs43-carousel-' + serial;
  const carousel = el('div', 'carousel slide cs43-photo-carousel'); carousel.id = carouselId;
  const inner = el('div', 'carousel-inner');
  for (const [i, item] of safe.entries()) {
    const slide = el('div', 'carousel-item' + (i === start ? ' active' : ''));
    const image = el('img', 'd-block w-100 img-fluid cs43-gallery-image');
    image.src = item.src; image.alt = item.alt || item.title || 'Galériakép';
    image.decoding = 'async'; image.loading = i === start ? 'eager' : 'lazy';
    slide.append(image); inner.append(slide);
  }
  const previous = button('‹', 'carousel-control-prev cs43-gallery-prev');
  previous.dataset.bsTarget = '#' + carouselId; previous.dataset.bsSlide = 'prev';
  previous.setAttribute('aria-label', 'Előző kép');
  const next = button('›', 'carousel-control-next cs43-gallery-next');
  next.dataset.bsTarget = '#' + carouselId; next.dataset.bsSlide = 'next';
  next.setAttribute('aria-label', 'Következő kép');
  add(carousel, inner, previous, next);
  previous.hidden = safe.length === 1; next.hidden = safe.length === 1;
  const counter = el('span', 'badge text-bg-secondary', `${start + 1} / ${safe.length}`);
  const caption = el('p', 'cs43-gallery-caption mb-0');
  const current = () => {
    const active = [...inner.children].findIndex(slide => slide.classList.contains('active'));
    return Math.max(0, active);
  };
  const refresh = i => {
    const item = safe[i]; if (!item) return;
    caption.textContent = item.alt && item.alt !== item.title ? `${item.title} · ${item.alt}` : item.title || item.alt || '';
    counter.textContent = `${i + 1} / ${safe.length}`;
    options.onChange?.(item, i);
  };
  refresh(start);
  carousel.addEventListener('slid.bs.carousel', event => refresh(event.to ?? current()));
  body.append(carousel);
  const left = el('div', 'd-flex flex-wrap align-items-center gap-2 me-auto');
  add(left, counter, caption);
  const download = el('a', 'btn btn-outline-secondary', 'Kép letöltése');
  download.href = new URL(safe[start].src, ROOT).href;
  download.download = safe[start].src.split('/').at(-1);
  carousel.addEventListener('slid.bs.carousel', event => {
    const item = safe[event.to ?? current()];
    if (!item) return;
    download.href = new URL(item.src, ROOT).href;
    download.download = item.src.split('/').at(-1);
  });
  add(footer, left, download);
  let api;
  root.addEventListener('shown.bs.modal', () => {
    api = window.bootstrap.Carousel.getOrCreateInstance(carousel, { interval: false, touch: true, keyboard: true, wrap: true });
  }, { once: true });
  root.addEventListener('hidden.bs.modal', () => { api?.dispose(); options.onClose?.(); }, { once: true });
  instance.show();
  return true;
}
