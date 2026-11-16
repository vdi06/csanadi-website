/* Fejléccímer és menü – eseményes, hálózatmentes DOM-integrációs regresszió. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const raw = fs.readFileSync(path.join(__dirname, '../js/subpages-v1.js'), 'utf8');
const start = raw.indexOf('export function shouldCondenseSubpageHeader');
const end = raw.indexOf('export function createSubpageHero', start);
assert(start > 0 && end > start);
const code = raw.slice(0, end).replaceAll('export function ', 'function ');
class Classes {
  constructor(...values) { this.values = new Set(values); }
  contains(name) { return this.values.has(name); }
  toggle(name, add) { if (add) this.values.add(name); else this.values.delete(name); }
}
class Node {
  constructor(name) { this.name = name; this.attributes = {}; this.listeners = new Map(); this.children = []; this.hidden = false; this.nodeType = 1; this.dataset = {}; }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  getAttribute(key) { return this.attributes[key] || null; }
  addEventListener(type, handler) { this.listeners.set(type, handler); }
  insertBefore(node) { this.children.unshift(node); }
  append(...nodes) { this.children.push(...nodes); }
  querySelector(selector) { const id = selector.match(/^\[data-nav-id="([a-z]+)"\]$/)?.[1]; return this.children.find(child => child.dataset?.navId === id) || null; }
  querySelectorAll() { return []; }
  click() { this.listeners.get('click')?.(); }
}
const listeners = new Map();
const menuActions = new Node('actions');
const header = new Node('header');
header.querySelector = selector => selector === '.header-actions' ? menuActions : null;
let heroBottom = 450;
const hero = new Node('hero');
hero.offsetHeight = 250;
hero.getBoundingClientRect = () => ({ bottom: heroBottom });
const overlay = new Node('overlay');
overlay.hidden = true;
const body = new Node('body');
body.classList = new Classes('cs-inner-page');
const nodes = new Map([['site-header', header], ['global-hero', hero], ['site-map-overlay', overlay]]);
const document = {
  body,
  createElement: name => new Node(name),
  getElementById: id => id === 'cs-subpage-menu' ? menuActions.children.find(node => node.id === id) || null : nodes.get(id) || null,
  querySelectorAll: () => [],
  addEventListener: (name, fn) => listeners.set(name, fn),
  dispatchEvent: event => { listeners.get(event.type)?.(event); },
  nodeType: 9
};
let observedOverlay;
const window = { scrollY: 0, addEventListener: (name, fn) => listeners.set('window:' + name, fn) };
const ctx = vm.createContext({
  document, window, location: { href: 'https://example.test/', hash: '#/oktatas/felveteli' },
  URL, Event: class { constructor(type) { this.type = type; } }, MutationObserver: class {
    constructor(cb) { this.cb = cb; }
    observe(target) { if (target === overlay) observedOverlay = this; }
  }, requestAnimationFrame: callback => callback(), console
});
vm.runInContext(code + '\ninitSubpageEnhancements();', ctx);
let passed = 0;
function check(label, fn) { fn(); passed++; console.log('OK', label); }
const menu = menuActions.children[0];
check('Középen kapcsoló címer: egyetlen, valódi button elem', () => {
  assert.equal(menu.name, 'button');
  assert.equal(menu.id, 'cs-subpage-menu');
  assert.match(menu.innerHTML, /csanadi-cimer-512\.webp/);
  assert.equal(menu.getAttribute('aria-controls'), 'site-map-overlay');
  assert.equal(menu.getAttribute('aria-expanded'), 'false');
});
check('Kezdeti aloldali fejléc a látható hero miatt teljes', () => {
  assert.equal(body.classList.contains('cs-header-condensed'), false);
});
check('Címerkattintás ugyanazt a menü-eseményt küldi', () => {
  let toggles = 0;
  listeners.set('csanadi:menu-toggle', () => { toggles++; });
  menu.click();
  assert.equal(toggles, 1);
});
check('Menü megnyitása és bezárása az aria-expanded állapothoz kötött', () => {
  overlay.hidden = false; observedOverlay.cb();
  assert.equal(menu.getAttribute('aria-expanded'), 'true');
  assert.equal(menu.getAttribute('aria-label'), 'Főmenü bezárása');
  overlay.hidden = true; observedOverlay.cb();
  assert.equal(menu.getAttribute('aria-expanded'), 'false');
});
check('Lefelé gördülve csak a hero eltűnése után kompakt', () => {
  window.scrollY = 300;
  listeners.get('window:scroll')();
  assert.equal(body.classList.contains('cs-header-condensed'), false);
  heroBottom = -1;
  listeners.get('window:scroll')();
  assert.equal(body.classList.contains('cs-header-condensed'), true);
});
check('A hero 20 pixeles holtsávjában megmarad a kompakt mód', () => {
  heroBottom = 20; listeners.get('window:scroll')();
  assert.equal(body.classList.contains('cs-header-condensed'), true);
});
check('Felfelé gördülve 50 pixeles visszatérésnél újra teljes', () => {
  heroBottom = 50; listeners.get('window:scroll')();
  assert.equal(body.classList.contains('cs-header-condensed'), false);
});
check('Hero nélküli oldalon is működik a kompakt váltás', () => {
  hero.offsetHeight = 0;
  window.scrollY = 130; listeners.get('window:scroll')();
  assert.equal(body.classList.contains('cs-header-condensed'), true);
  window.scrollY = 50; listeners.get('window:scroll')();
  assert.equal(body.classList.contains('cs-header-condensed'), false);
});
check('SPA-újrainicializálás nem másolja a középső menügombot', () => {
  vm.runInContext('initSubpageEnhancements()', ctx);
  assert.equal(menuActions.children.length, 1);
});
const style = fs.readFileSync(path.join(__dirname, '../css/subpage-header-fix.css'), 'utf8');
check('A címer teljes és kompakt fejlécnél is tényleg középre kerül', () => {
  assert.match(style, /body\.cs-inner-page #site-header \.cs-subpage-menu\{\s*position:absolute!important;left:50%!important;top:50%!important/);
  assert.match(style, /body\.cs-inner-page\.cs-header-condensed #site-header \.cs-subpage-menu\{\s*position:absolute!important;left:50%!important;top:50%!important/);
  assert.match(style, /\.brand,\s*body\.cs-inner-page #site-header \.header-tag,\s*body\.cs-inner-page #site-header \.cs-subpage-menu-label\{display:none!important\}/);
});
check('Mobilon csak az alsó címer látszik, tartalék felső gombbal', () => {
  assert.match(style, /@media\(max-width:768px\)\{[\s\S]*:has\(#ext26-mobile-nav\) #site-header \.cs-subpage-menu\{display:none!important\}/);
  assert.match(fs.readFileSync(path.join(__dirname, '../css/round17-single-mobile-gradient.css'), 'utf8'),
    /#ext26-mobile-nav\{display:grid!important;position:fixed!important;[\s\S]*bottom:0!important/);
});
check('Alsó mobilcímer a menüt a rejtett kezdőlapi orbit-gomb nélkül is nyitja', () => {
  const mobileSource = fs.readFileSync(path.join(__dirname, '../mobile/quick-nav.js'), 'utf8')
    .replace(/^import .*;\r?\n/m, '')
    .replace('export function initMobileQuickNav', 'function initMobileQuickNav');
  const mobileNodes = new Map([['site-map-overlay', overlay]]);
  const mobileDocument = {
    body: new Node('body'),
    createElementNS: (ns, name) => new Node(name),
    getElementById: id => mobileNodes.get(id) || null,
    dispatchEvent: event => { listeners.get(event.type)?.(event); }
  };
  const mobileContext = vm.createContext({
    document: mobileDocument, window, location: { hash: '#/oktatas/felveteli' },
    Event: class { constructor(type) { this.type = type; } },
    MutationObserver: class { observe() {} },
    el: (name, className) => { const node = new Node(name); node.className = className; return node; },
    append: (parent, ...children) => parent.append(...children)
  });
  vm.runInContext(mobileSource + '\ninitMobileQuickNav()', mobileContext);
  const nav = mobileDocument.body.children[0];
  assert.equal(nav.id, 'ext26-mobile-nav');
  assert.equal(nav.children.length, 3);
  const bottomMenu = nav.children[1];
  assert.equal(bottomMenu.dataset.navId, 'menu');
  assert.match(bottomMenu.children[0].src, /csanadi-cimer-512\.webp/);
  let calls = 0;
  listeners.set('csanadi:menu-toggle', () => { calls++; });
  bottomMenu.click();
  assert.equal(calls, 1);
});
console.log(JSON.stringify({passed, failed: 0, method: 'DOM-esemény szimuláció + CSS-forrásvizsgálat, nem pixeles böngészős ellenőrzés'}));
