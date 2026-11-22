/** 1.47: üres HTML-ek, JSON-váz, biztonsági és sémahibák regressziója. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {validateJsonShell} from '../js/json-validator-v147.js';
import {safeJsonURL,jsonNode} from '../js/json-dom-v147.js';

const root=path.resolve(import.meta.dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const site=JSON.parse(read('json/site-shell.json'));
const offline=JSON.parse(read('json/offline-shell.json'));
for(const [name,entry] of [['index.html','site'],['offline.html','offline']]){
 const html=read(name);
 assert.match(html,/<body>\s*<\/body>/i);
 assert.doesNotMatch(html,/<(?:style|link|header|nav|main|footer|h1|a|p)\b/i);
 assert.match(html,new RegExp(`js/${entry}-bootstrap-v147\\.js\\?v=1\\.47`));
}
assert.equal(validateJsonShell(site,{kind:'site'}).valid,true);
assert.equal(validateJsonShell(offline,{kind:'offline'}).valid,true);
const count=validateJsonShell(site,{kind:'site'}).nodes;
assert.equal(count,124);
assert.equal(site.body.length,12);
assert.equal(site.assets.stylesheets.length,31);
assert.equal(site.assets.entryModule,'script.js?v=1.47');
assert.equal(site.network.cdnScriptTimeoutMs,4000);
for(const item of [...site.assets.stylesheets,...site.assets.scripts,
 ...offline.assets.stylesheets]){
 const address=item.href||item.src;
 assert.equal(safeJsonURL(address),true,address);
 if(!/^https?:\/\//.test(address))assert.ok(fs.existsSync(path.join(root,address.split('?')[0])),address);
}
const invalid=structuredClone(site);
invalid.body[0].attrs.onclick='alert(1)';
assert.equal(validateJsonShell(invalid,{kind:'site'}).valid,false);
delete invalid.body[0].attrs.onclick;
invalid.body[0].attrs.href='javascript:alert(1)';
assert.equal(validateJsonShell(invalid,{kind:'site'}).valid,false);
delete invalid.body[0].attrs.href;
invalid.body.push({tag:'script',attrs:{},children:[]});
assert.equal(validateJsonShell(invalid,{kind:'site'}).valid,false);
invalid.body.pop();
invalid.body.push({tag:'div',attrs:{id:'app'},children:[]});
assert.equal(validateJsonShell(invalid,{kind:'site'}).valid,false);
assert.equal(safeJsonURL('java\\script:alert(1)'),false);
assert.equal(safeJsonURL('javascript:\nalert(1)'),false);
assert.equal(safeJsonURL('#/kapcsolat'),true);
globalThis.document={createElement(tag){return {tagName:tag.toUpperCase(),setAttribute(){},append(){},dataset:{}}}};
assert.equal(jsonNode({tag:'script',attrs:{src:'x.js'},children:[]}),null);
assert.match(read('service-worker.js'),/RELEASE_ID='1\.47'/);
assert.match(read('service-worker.js'),/json-validator-v147\.js/);
assert.equal(JSON.parse(read('json/config.json')).performance.cacheVersion,'csanadi-r-v1.47');
console.log('1.47 JSON PASS – 124 felületelem, minimális HTML, hibás és veszélyes adatok blokkolása');
