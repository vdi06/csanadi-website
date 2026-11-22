/** 1.47: a CDN-kiesés nem tarthatja fogva az oldal indulását. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {safeJsonURL} from '../js/json-dom-v147.js';

const root=path.resolve(import.meta.dirname,'..');
const source=fs.readFileSync(path.join(root,'js/site-bootstrap-v147.js'),'utf8');
const functionSource=source.match(/async function loadOrderedScript\(definition,network=\{\}\)\{[\s\S]*?\n\}\n\nasync function start\(/)?.[0].replace(/\n\nasync function start\($/,'');
assert.ok(functionSource,'Nem található a verziózott szkriptbetöltő');
const timers=[],scripts=[],log=[];
const context={URL,location:{origin:'https://site.example'},navigator:{onLine:true},safeJsonURL,
 document:{baseURI:'https://site.example/',createElement(tag){
  assert.equal(tag,'script');return {remove(){this.removed=true}}},
  body:{append(node){scripts.push(node)}}},
 setTimeout(callback,time){timers.push({callback,time});return timers.length},
 clearTimeout(){},console:{warn(...parts){log.push(parts.join(' '))}}};
vm.runInNewContext(functionSource+'\nglobalThis.loadTest=loadOrderedScript;',context);

const remote=context.loadTest({src:'https://cdn.jsdelivr.net/npm/bootstrap@5.3.9/dist/js/bootstrap.bundle.min.js'},
 {cdnScriptTimeoutMs:1250});
assert.equal(timers.at(-1).time,1250);
assert.equal(scripts.length,1);
timers.at(-1).callback();
assert.equal(await remote,false);
assert.equal(scripts[0].removed,true,'A lejárt CDN-kérést el kell távolítani');
assert.ok(log.some(message=>message.includes('időtúllépés')));

const local=context.loadTest({src:'js/round12-media-performance.js?v=1.47'},
 {localScriptTimeoutMs:2700});
assert.equal(timers.at(-1).time,2700);
const last=scripts.at(-1);last.onload();
assert.equal(await local,true);assert.notEqual(last.removed,true);

context.navigator.onLine=false;
const before=scripts.length;
assert.equal(await context.loadTest({src:'https://cdn.jsdelivr.net/npm/bootstrap@5.3.9/dist/js/bootstrap.bundle.min.js'}),false);
assert.equal(scripts.length,before,'Offline a böngésző ne várakozzon a CDN-re');

let network=fs.readFileSync(path.join(root,'js/round13-network.js'),'utf8');
network=network.replace(/\}\)\(\);\s*$/,'globalThis.__version={loadedVersion,parseVersion,newer};})();');
const sandbox={URL,location:{href:'https://site.example/'},
 document:{currentScript:{src:'https://site.example/js/round13-network.js?v=csanadi-r-v1.47'},readyState:'loading'},
 window:{addEventListener(){}}};
vm.runInNewContext(network,sandbox);
const {loadedVersion,parseVersion,newer}=sandbox.__version;
assert.equal(loadedVersion,'csanadi-r-v1.47');
assert.deepEqual([...parseVersion(loadedVersion).sem],[1,47,0]);
assert.equal(newer('csanadi-r-v1.47','csanadi-r-v1.46'),true);
assert.equal(newer('csanadi-r-v1.47','csanadi-r-v1.43.33'),true);
console.log('1.47 FUTÁS PASS – CDN 1,25 mp limit, offline azonnali kihagyás, helyi szkript, frissítés');
