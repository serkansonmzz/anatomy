import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../dist/vendor/three.module.js';
import {organs,reproductiveInteriors,tours} from '../dist/data.js';
test('63 structures, sex-specific reproductive coverage, valid relationships',()=>{
 assert.equal(Object.keys(organs).length,63);
 for(const [sex,count] of [['male',12],['female',10]])assert.equal(Object.values(organs).filter(o=>o.system==='reproductive'&&o.sex===sex).length,count);
 for(const o of Object.values(organs)){assert.ok(o.pos.every(Number.isFinite));for(const id of o.related)assert.ok(organs[id],id);}
 for(const id of reproductiveInteriors)assert.equal(organs[id].system,'reproductive');
 for(const t of tours)assert.ok(organs[t.id]);
});
test('Every reproductive structure has selectable finite geometry and cutaway shells',async()=>{
 const source=(await readFile(new URL('../dist/reproductive.js',import.meta.url),'utf8')).replace("'three'",JSON.stringify(new URL('../dist/vendor/three.module.js',import.meta.url).href));
 const {buildReproductive}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const groups=Object.fromEntries(Object.keys(organs).map(id=>{const g=new THREE.Group();g.name=id;g.position.fromArray(organs[id].pos);return [id,g]})),pickables=[];
 function mesh(g,geo,c){const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:c}));m.userData.id=g.name;g.add(m);pickables.push(m);return m;}
 function ell(g,p,s,c,e={},rot){const m=mesh(g,new THREE.SphereGeometry(1,16,12).scale(...s),c);m.position.fromArray(p).sub(g.position);if(rot)m.rotation.set(...rot);return m;}
 function path(g,p,r,c){return mesh(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p.map(v=>new THREE.Vector3(...v).sub(g.position))),Math.max(20,p.length*2),r,6,false),c)}
 buildReproductive({groups,pickables,ell,path,limb:(g,p,r,c)=>path(g,p,r[0],c)});
 for(const o of Object.values(organs).filter(o=>o.system==='reproductive')){assert.ok(groups[o.id].children.length,o.id);for(const m of groups[o.id].children){assert.equal(m.userData.id,o.id);assert.ok(m.geometry.index.count>0);assert.ok([...m.geometry.attributes.position.array].every(Number.isFinite));}}
 for(const id of ['testes','scrotum','penis','prostate','uterus','myometrium','cervix','ovaries','vulva'])assert.ok(groups[id].children.some(m=>m.userData.cutawayFront),id);
 assert.deepEqual(groups.urethra.children.map(m=>m.userData.anatomySex).sort(),['female','male']);
});
