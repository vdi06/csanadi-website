/** Új kétlépcsős verziószabály: 1.44; régi 1.43.33 frissíthető marad. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const base=path.resolve(import.meta.dirname,'..');
let code=fs.readFileSync(path.join(base,'js/round13-network.js'),'utf8');
code=code.replace(/\}\)\(\);\s*$/,
 'globalThis.__checkVersion={parseVersion,newer};})();');
const ctx={URL,location:{href:'https://example.invalid/'},
 document:{currentScript:{src:'https://example.invalid/js/round13-network.js?v=csanadi-r-v1.44'},readyState:'loading'},
 window:{addEventListener(){}}};
vm.runInNewContext(code,ctx,{filename:'round13-network.js'});
const {parseVersion,newer}=ctx.__checkVersion;
assert.deepEqual([...parseVersion('csanadi-r-v1.44').sem],[1,44,0]);
assert.deepEqual([...parseVersion('csanadi-r-v1.43.33').sem],[1,43,33]);
assert.equal(parseVersion('csanadi-r-v1.44.0.1'),null,'Negyedik számszegmens nem elfogadott');
assert.equal(newer('csanadi-r-v1.44','csanadi-r-v1.43.33'),true);
assert.equal(newer('csanadi-r-v1.43.33','csanadi-r-v1.44'),false);
assert.equal(newer('csanadi-r-v1.44','csanadi-r-v1.44'),false);
assert.equal(newer('csanadi-r-v1.45','csanadi-r-v1.44'),true);
assert.equal(newer('csanadi-r-v2.0','csanadi-r-v1.99.99'),true);
console.log('1.44 PASS – két tagú számozás és régi verzióról biztonságos átmenet');
