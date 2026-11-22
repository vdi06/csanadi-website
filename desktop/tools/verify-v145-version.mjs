/** 1.45-es verzió: a két- és háromtagú elődökből azonosítható frissítés. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'..');
let source=fs.readFileSync(path.join(root,'js/round13-network.js'),'utf8');
source=source.replace(/\}\)\(\);\s*$/,'globalThis.__checkVersion={parseVersion,newer};})();');
const context={URL,location:{href:'https://example.invalid/'},
 document:{currentScript:{src:'https://example.invalid/js/round13-network.js?v=csanadi-r-v1.45'},readyState:'loading'},
 window:{addEventListener(){}}};
vm.runInNewContext(source,context,{filename:'round13-network.js'});
const {parseVersion,newer}=context.__checkVersion;
assert.deepEqual([...parseVersion('csanadi-r-v1.45').sem],[1,45,0]);
assert.deepEqual([...parseVersion('csanadi-r-v1.44').sem],[1,44,0]);
assert.deepEqual([...parseVersion('csanadi-r-v1.43.33').sem],[1,43,33]);
assert.equal(newer('csanadi-r-v1.45','csanadi-r-v1.44'),true);
assert.equal(newer('csanadi-r-v1.45','csanadi-r-v1.43.33'),true);
assert.equal(newer('csanadi-r-v1.44','csanadi-r-v1.45'),false);
assert.equal(newer('csanadi-r-v1.45','csanadi-r-v1.45'),false);
assert.equal(parseVersion('csanadi-r-v1.45.0.1'),null);
console.log('1.45 PASS – új és történeti verziók összehasonlítása');
