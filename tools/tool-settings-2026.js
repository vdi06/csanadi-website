'use strict';
globalThis.csanadiToolSettings=fetch('../json/config.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw Error('A központi beállítások nem elérhetők.');return response.json();});
