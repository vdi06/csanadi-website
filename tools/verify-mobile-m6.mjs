/** M6: adatforrás, csökkentett mozgás és automatikus váltás ellenőrzése. */
import assert from 'node:assert/strict';
import {mobileM6Slides,mobileM6ShouldPlay} from '../mobile/mobile-m6-film-v1-43-11.js';

const examples=[
 {mediaId:'media:sport',title:'Sport'},
 {mediaId:'media:bejarat',title:'Iskolai kapu'},
 {mediaId:'media:oktatas',title:'Tanulás'},
 {mediaId:'media:hianyzo',title:'Hibás kép'}
];
const slides=mobileM6Slides(examples,id=>id!=='media:hianyzo');
assert.equal(slides.length,3);
assert.equal(slides[0].mediaId,'media:bejarat');
assert.deepEqual(slides.slice(1).map(item=>item.title),['Sport','Tanulás']);
assert.equal(mobileM6ShouldPlay(),true);
for(const override of [{mobile:false},{wide:false},{reduced:true},{saveData:true},
 {visible:false},{hidden:true},{focused:true},{paused:true},{menuOpen:true}]){
 assert.equal(mobileM6ShouldPlay(override),false,JSON.stringify(override));
}
assert.deepEqual(mobileM6Slides(null,()=>true),[]);
console.log('M6 smoke test: 3/3 érvényes diakép, bejárati kezdőkép, 9 automatikus szüneteltetési feltétel OK');
