import {buildReproductive} from './reproductive.js';
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import {organs} from './data.js';
import {SoftwareRenderer} from './software-renderer.js';

const V=(a)=>new THREE.Vector3(...a);
const C={bone:0xb8c3b7,heart:0xb3494c,artery:0xc95759,vein:0x527eae,lung:0xc17d88,nerve:0xcfb777,brain:0xc59f91,skin:0x82a5b4};
export function createAtlas(container,miniContainer,onPick,onHover){
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(34,1,.03,80);camera.position.set(.3,5.2,19.5);
 let renderer;const gpuCanvas=document.createElement('canvas');const gl=gpuCanvas.getContext('webgl2',{antialias:true,alpha:true});try{renderer=gl?new THREE.WebGLRenderer({canvas:gpuCanvas,context:gl,antialias:true,alpha:true}):new SoftwareRenderer();}catch{renderer=new SoftwareRenderer();}const soft=!!renderer.software;
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;container.appendChild(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,4.8,0);controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=true;controls.minDistance=1;controls.maxDistance=27;controls.maxPolarAngle=Math.PI*.91;controls.minPolarAngle=.12;controls.autoRotateSpeed=.6;
 const light=(s)=>{s.add(new THREE.HemisphereLight(0xc4e6f3,0x243437,2.05));const l=new THREE.DirectionalLight(0xffe5d5,3.6);l.position.set(-4,10,8);s.add(l);const r=new THREE.DirectionalLight(0x8fc8ed,2.7);r.position.set(5,6,-5);s.add(r);const f=new THREE.DirectionalLight(0xb2dfd4,.8);f.position.set(0,2,7);s.add(f)};light(scene);
 const root=new THREE.Group();scene.add(root);const groups={};const pickables=[];
 function material(color,extra={}) {return new THREE.MeshStandardMaterial({color,roughness:.48,metalness:.03,...extra});}
 function group(id){const g=new THREE.Group();g.name=id;g.userData.id=id;g.position.fromArray(organs[id].pos);groups[id]=g;root.add(g);return g;}
 function add(g,geometry,mat,pos=[0,0,0],rot){const m=new THREE.Mesh(geometry,mat);m.position.copy(V(pos).sub(g.position));if(rot)m.rotation.set(...rot);m.userData.id=g.name;g.add(m);pickables.push(m);return m;}
 function ell(g,pos,scale,color,extra={},rot){let geo=new THREE.SphereGeometry(1,soft?16:32,soft?12:22);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);let f=1+.013*Math.sin(x*13+y*8)*Math.sin(z*12-y*9);p.setXYZ(i,x*scale[0]*f,y*scale[1]*f,z*scale[2]*f)}geo.computeVertexNormals();return add(g,geo,material(color,extra),pos,rot)}
 function path(g,points,r,color,extra={},segments){const curve=new THREE.CatmullRomCurve3(points.map(p=>V(p).sub(g.position)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,soft?Math.min(segments||points.length*5,points.length>100?420:80):(segments||Math.max(12,points.length*7)),r,soft?5:8,false),material(color,extra));m.userData.id=g.name;g.add(m);pickables.push(m);return m;}
 function limb(g,pts,radii,color,extra={}){const curve=new THREE.CatmullRomCurve3(pts.map(p=>V(p).sub(g.position)));const n=soft?24:48,rad=soft?10:16,frames=curve.computeFrenetFrames(n,false),verts=[],normals=[],inds=[];for(let i=0;i<=n;i++){const t=i/n,p=curve.getPoint(t),ii=Math.min(radii.length-2,Math.floor(t*(radii.length-1))),f=t*(radii.length-1)-ii,r=THREE.MathUtils.lerp(radii[ii],radii[ii+1],f);for(let j=0;j<=rad;j++){const a=j/rad*Math.PI*2,normal=frames.normals[i].clone().multiplyScalar(Math.cos(a)).addScaledVector(frames.binormals[i],Math.sin(a));const v=p.clone().addScaledVector(normal,r);verts.push(v.x,v.y,v.z);normals.push(normal.x,normal.y,normal.z);if(i<n&&j<rad){const k=i*(rad+1)+j;inds.push(k,k+rad+1,k+1,k+rad+1,k+rad+2,k+1)}}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geo.setIndex(inds);const m=new THREE.Mesh(geo,material(color,extra));m.userData.id=g.name;g.add(m);pickables.push(m);return m;}
 Object.keys(organs).forEach(group);
 // Continuous, translucent body surface. Anatomical left is +X; anterior is +Z.
 const skin=groups.skin;const glass={transparent:true,opacity:.10,depthWrite:false,side:THREE.DoubleSide,roughness:.38,metalness:.12};
 const profile=[[3.82,.42,.32],[4,.75,.39],[4.3,.92,.45],[4.6,.89,.44],[4.95,.81,.39],[5.4,.80,.40],[5.8,.88,.46],[6.2,1,.51],[6.7,1.09,.55],[7.15,1.12,.53],[7.55,1.15,.46],[7.72,1.08,.39],[7.87,.69,.33],[8.03,.34,.29],[8.3,.28,.28],[8.5,.28,.28]];
 {const positions=[],idx=[],rings=soft?64:80,sides=soft?36:64;const width=null;for(let i=0;i<=rings;i++){let t=i/rings*(profile.length-1),n=Math.min(profile.length-2,Math.floor(t)),f=t-n;f=f*f*(3-2*f);let y=THREE.MathUtils.lerp(profile[n][0],profile[n+1][0],f),rx=THREE.MathUtils.lerp(profile[n][1],profile[n+1][1],f),rz=THREE.MathUtils.lerp(profile[n][2],profile[n+1][2],f);for(let j=0;j<=sides;j++){let a=j/sides*Math.PI*2;positions.push(Math.cos(a)*rx,y-7,Math.sin(a)*rz-.4);if(i<rings&&j<sides){let k=i*(sides+1)+j;idx.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1)}}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(idx);geo.computeVertexNormals();const m=new THREE.Mesh(geo,material(C.skin,glass));m.userData.id='skin';skin.add(m);pickables.push(m);}
 ell(skin,[0,9.1,0],[.50,.67,.46],C.skin,glass);ell(skin,[0,8.79,.11],[.35,.34,.33],C.skin,glass);ell(skin,[0,9.02,.437],[.10,.18,.13],C.skin,glass);
 for(const s of [-1,1]){
  ell(skin,[s*.49,9.05,-.01],[.09,.17,.07],C.skin,glass);
  limb(skin,[[s*1.03,7.64,0],[s*1.32,7.15,0],[s*1.65,6.38,.02],[s*1.84,5.68,.05],[s*2.02,4.98,.08]],[.3,.28,.21,.22,.13],C.skin,glass);
  ell(skin,[s*2.08,4.71,.08],[.18,.33,.1],C.skin,glass,[0,0,s*.1]);
  for(let f=0;f<4;f++){const x=s*(1.97+f*.075),len=.34-Math.abs(f-1.4)*.05;limb(skin,[[x,4.55,.09],[x+s*.035,4.40,.1],[x+s*.04,4.55-len,.08]],[.042,.035,.022],C.skin,glass)}
  limb(skin,[[s*1.95,4.85,.14],[s*1.81,4.67,.17],[s*1.82,4.55,.18]],[.06,.05,.027],C.skin,glass);
  limb(skin,[[s*.48,4.26,-.03],[s*.52,3.58,-.02],[s*.55,2.55,.04],[s*.54,2.13,.04],[s*.53,1.43,-.01],[s*.54,.53,.01]],[.39,.35,.22,.22,.24,.12],C.skin,glass);
  ell(skin,[s*.55,.26,.2],[.2,.19,.43],C.skin,glass);
 }
 // Brain hemispheres and cortical folds.
 const brain=groups.brain;
 for(const s of [-1,1]){
  ell(brain,[s*.205,9.23,-.01],[.245,.41,.345],C.brain,{roughness:.68});
  for(let l=0;l<14;l++){const phi=.25+l/13*2.56,pts=[];for(let j=0;j<=48;j++){const theta=j/48*Math.PI*2;const p=phi+.065*Math.sin(theta*6+l*1.3)+.035*Math.cos(theta*11+l);pts.push([s*.205+.249*Math.sin(p)*Math.cos(theta),9.23+.413*Math.cos(p),-.01+.35*Math.sin(p)*Math.sin(theta)])}path(brain,pts,.016,0xd7b1a1,{roughness:.7},100)}
  for(let l=0;l<7;l++){let pts=[];for(let j=0;j<=18;j++){const theta=.2+j/18*2.6,a=l/7*6.28+.10*Math.sin(j*1.5);pts.push([s*.205+.251*Math.sin(theta)*Math.cos(a),9.23+.414*Math.cos(theta),-.01+.352*Math.sin(theta)*Math.sin(a)])}path(brain,pts,.009,0x9d7e76,{roughness:.8},38)}
 }
 const cere=groups.cerebellum;for(const s of [-1,1]){ell(cere,[s*.15,8.84,-.24],[.20,.19,.21],0xae8f7f);for(let i=0;i<8;i++){let pts=[];const y=8.72+i*.031;for(let j=0;j<20;j++){const a=j/19*6.28;pts.push([s*.15+Math.cos(a)*.185,y+Math.sin(a)*.008,-.24+Math.sin(a)*.20])}path(cere,pts,.009,0xcfad96)}}
 ell(groups.pituitary,[0,8.92,.13],[.065,.055,.07],0xd8a2b1);
 for(const s of [-1,1]){ell(groups.eyes,[s*.205,9.12,.366],[.115,.115,.105],0xd5d7ca);ell(groups.eyes,[s*.205,9.12,.46],[.055,.055,.017],0x517a72);ell(groups.eyes,[s*.205,9.12,.475],[.027,.027,.012],0x101b1d)}
 ell(groups.tongue,[0,8.78,.3],[.18,.065,.17],0xbe747d);
 // Respiratory tract.
 ell(groups.larynx,[0,8.3,.19],[.13,.18,.115],0xbda5a0);
 path(groups.trachea,[[0,8.25,.19],[0,7.95,.17],[0,7.68,.10],[0,7.45,.08]],.095,0xbba59a);
 for(let i=0;i<13;i++){const y=8.17-i*.052,z=.18-(8.17-y)*.16,pts=[];for(let j=0;j<=18;j++){const a=.1+j/18*5.7;pts.push([Math.cos(a)*.1,y,z+Math.sin(a)*.1])}path(groups.trachea,pts,.014,0xd4c3ae)}
 for(const s of [-1,1]){
  const lung=groups.lungs,geo=new THREE.SphereGeometry(1,soft?20:40,soft?16:32),a=geo.attributes.position;
  for(let i=0;i<a.count;i++){let x=a.getX(i),y=a.getY(i),z=a.getZ(i);const width=.38*(1-.3*y);let px=s*.55+x*width,py=7.12+y*.84,pz=z*.36-.04; if(s===1&&x<0&&y<.05&&z>0){px+=.13*(-x)*Math.max(0,1-Math.abs(y+.3));pz-=.12*(-x)}py+=.08*x*s;a.setXYZ(i,px,py,pz)}geo.computeVertexNormals();const m=new THREE.Mesh(geo,material(C.lung,{roughness:.67}));m.position.sub(lung.position);m.userData.id='lungs';lung.add(m);pickables.push(m);
  path(lung,[[s*.29,7.51,.22],[s*.50,7.20,.31],[s*.78,6.99,.22]],.008,0x805963,{roughness:.8});
  if(s===-1)path(lung,[[-.25,7.14,.28],[-.52,7.09,.33],[-.85,7.06,.20]],.008,0x805963);
  path(groups.bronchi,[[0,7.46,.09],[s*.20,7.31,.03],[s*.43,7.18,-.06]],.068,0xc0b09a);
  for(let k=0;k<3;k++){path(groups.bronchi,[[s*.31,7.27,0],[s*.50,7.25+(k-1)*.34,-.06],[s*.67,7.3+(k-1)*.48,-.11]],.034,0xb5ab97)}
 }
 // Anatomical heart, offset to the body's left, with surface coronary vessels.
 const heart=groups.heart;
 const hg=new THREE.SphereGeometry(1,soft?20:40,soft?16:32),hp=hg.attributes.position;
 for(let i=0;i<hp.count;i++){let x=hp.getX(i),y=hp.getY(i),z=hp.getZ(i);const taper=.74+.27*y;hp.setXYZ(i,x*.36*taper-y*.11,y*.47,z*.27*taper)}hg.computeVertexNormals();const hm=add(heart,hg,material(C.heart,{roughness:.39}),[.21,6.91,.30],[0,0,-.19]);
 ell(heart,[.0,7.16,.26],[.20,.21,.17],0x9d484e);ell(heart,[.42,7.14,.24],[.15,.19,.17],0xb85c65);
 path(heart,[[.22,7.19,.27],[.12,7.44,.25],[.22,7.57,.11],[.40,7.45,-.03]],.105,C.artery);
 path(heart,[[.33,7.15,.42],[.37,7.39,.35],[.20,7.47,.20],[-.13,7.4,.09]],.079,C.vein);
 path(heart,[[-.09,7.13,.2],[-.13,7.38,.17],[-.13,7.59,.12]],.079,C.vein);
 const cor=groups.coronary;
 path(cor,[[.20,7.29,.48],[.24,7.12,.57],[.28,6.93,.57],[.36,6.67,.43]],.018,0xd49173);
 path(cor,[[.18,7.22,.48],[-.02,7.12,.47],[-.11,6.97,.39]],.017,0xd08e73);
 for(let i=0;i<4;i++){const y=7.17-i*.12;path(cor,[[.24,y,.56],[.34+i*.018,y-.08,.55-i*.015],[.42,y-.14,.40]],.008,0xd8a080);path(cor,[[.23,y,.55],[.11,y-.08,.53],[.03,y-.15,.43]],.008,0x7593b4)}
 // Digestive organs; spatially layered so the posterior organs can be isolated.
 const liver=groups.liver,lg=new THREE.SphereGeometry(1,soft?20:40,soft?14:26),lp=lg.attributes.position;
 for(let i=0;i<lp.count;i++){let x=lp.getX(i),y=lp.getY(i),z=lp.getZ(i);let thin=1-.45*Math.max(0,x);lp.setXYZ(i,x*.78-.10,y*.35*thin-x*.12,z*.36*thin)}lg.computeVertexNormals();add(liver,lg,material(0x92504b,{roughness:.43}),[-.23,6.10,.13]);
 path(liver,[[.02,6.38,.27],[-.09,6.16,.47],[-.14,5.88,.29]],.01,0x6f443d);
 const stomach=groups.stomach;limb(stomach,[[.36,6.21,.15],[.58,6.08,.19],[.67,5.87,.23],[.57,5.58,.25],[.34,5.51,.22],[.12,5.65,.12]],[.095,.23,.28,.23,.15,.08],0xc9958d,{roughness:.53});
 path(groups.esophagus,[[0,8.48,-.04],[0,8.03,-.02],[.02,7.4,-.16],[.07,6.65,-.19],[.33,6.25,.08]],.067,0xbf8a89);
 const panc=groups.pancreas;ell(panc,[.16,5.62,-.06],[.56,.13,.14],0xd5b080,{},[0,.05,-.10]);for(let i=0;i<14;i++)ell(panc,[-.33+i*.071,5.62+Math.sin(i*2)*.06,-.015],[.08,.075,.10],0xcfaa78,{roughness:.64});
 ell(groups.gallbladder,[-.43,5.81,.30],[.10,.17,.10],0x749368,{},[0,0,-.35]);path(groups.gallbladder,[[-.44,5.92,.27],[-.28,5.90,.13],[-.16,5.73,.11]],.025,0x87a16e);
 const bowel=groups.smallIntestine;const intestine=[];for(let i=0;i<140;i++){let t=i/139,x=.50*Math.sin(t*Math.PI*11)*(1-.16*t),y=5.44-t*.85+.055*Math.cos(t*Math.PI*22),z=.23+.06*Math.sin(t*Math.PI*9);intestine.push([x,y,z])}path(bowel,intestine,.085,0xd6a498,{roughness:.55},490);
 const colon=groups.largeIntestine;const colonPts=[[-.63,4.65,.20],[-.75,4.91,.22],[-.75,5.27,.23],[-.64,5.53,.25],[-.32,5.58,.28],[.05,5.49,.34],[.44,5.56,.28],[.73,5.43,.20],[.73,5.07,.19],[.63,4.74,.19],[.28,4.60,.21],[.08,4.40,.03]];path(colon,colonPts,.122,0xbc8f7c,{roughness:.65},180);
 const cc=new THREE.CatmullRomCurve3(colonPts.map(V));for(let i=0;i<37;i++){const p=cc.getPoint(i/36);ell(colon,[p.x,p.y,p.z],[.126,.13,.128],i%2?0xc29785:0xbc8f7d,{roughness:.67})}
 path(groups.rectum,[[.08,4.43,.03],[0,4.25,-.08],[0,3.96,-.11]],.105,0xa97a78);
 path(groups.appendix,[[-.66,4.7,.24],[-.72,4.54,.25],[-.60,4.46,.22]],.033,0xd2a394);
 // Renal and endocrine structures.
 for(const s of [-1,1]){
  const x=s*.62,y=s===-1?5.63:5.75,g=groups.kidneys,geo=new THREE.SphereGeometry(1,soft?18:32,soft?14:24),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){let a=p.getX(i),b=p.getY(i),c=p.getZ(i);const dent=(a*s<0?1-.40*Math.exp(-b*b*7):1);p.setXYZ(i,a*.22*dent,b*.34,c*.17)}geo.computeVertexNormals();add(g,geo,material(0x9f5c63,{roughness:.39}),[x,y,-.24],[0,0,s*-.15]);
  ell(groups.adrenals,[x,y+.35,-.23],[.14,.085,.09],0xd5b27a,{},[0,0,s*-.25]);
  path(groups.ureters,[[x-s*.10,y-.04,-.13],[s*.42,5.23,-.15],[s*.29,4.65,-.12],[s*.12,4.22,.10]],.028,0xd7bf98);
 }
 ell(groups.bladder,[0,4.17,.24],[.25,.25,.20],0xcda88e,{roughness:.48});
 path(groups.urethra,[[0,4,.23],[0,3.83,.22],[0,3.69,.26]],.037,0xc69d8e);
 for(const s of [-1,1]){ell(groups.thyroid,[s*.13,8.13,.27],[.105,.18,.08],0xc27e7a);ell(groups.thymus,[s*.09,7.53,.34],[.09,.21,.06],0xbba491)}
 ell(groups.thyroid,[0,8.12,.30],[.11,.055,.045],0xc27e7a);
 ell(groups.spleen,[.85,5.99,-.16],[.17,.28,.15],0x8d657b,{},[0,0,-.2]);
 // Muscular diaphragm dome.
 const dia=groups.diaphragm,dg=new THREE.SphereGeometry(1,soft?20:36,soft?10:16,0,Math.PI*2,0,Math.PI*.49);dg.scale(.95,.26,.46);add(dia,dg,material(0xb27a71,{side:THREE.DoubleSide,transparent:true,opacity:.67}),[0,6.25,-.02]);
 // Axial and appendicular skeleton.
 const boneExtra={transparent:true,opacity:.39,depthWrite:false,roughness:.75};
 ell(groups.skull,[0,9.17,-.025],[.49,.60,.445],C.bone,{...boneExtra,opacity:.11});
 path(groups.skull,[[-.35,8.95,.17],[-.30,8.68,.31],[0,8.58,.36],[.30,8.68,.31],[.35,8.95,.17]],.065,C.bone,boneExtra);
 for(const s of [-1,1])path(groups.skull,[[s*.32,9.32,.25],[s*.34,9.16,.33],[s*.25,9.02,.39],[s*.10,9.09,.4],[s*.11,9.26,.37]],.036,C.bone,boneExtra);
 for(let i=0;i<24;i++){let y=8.44-i*.166,z=-.34-.06*Math.sin(i/24*Math.PI*2),wide=.12+i*.003;ell(groups.spine,[0,y,z],[wide,.071,.13],C.bone,boneExtra);ell(groups.spine,[0,y,z-.15],[.045,.044,.13],C.bone,boneExtra);path(groups.spine,[[-wide-.04,y,z],[0,y,z-.07],[wide+.04,y,z]],.035,C.bone,boneExtra)}
 ell(groups.spine,[0,4.25,-.3],[.20,.32,.11],C.bone,boneExtra,[.2,0,0]);
 const ribs=groups.ribs;
 for(let i=0;i<12;i++){const y=7.72-i*.134,w=.61+Math.sin((i+1)/13*Math.PI)*.43,z=.40-(i>8?(i-8)*.035:0);for(const s of [-1,1]){let pts=[[s*.13,y,-.39],[s*w*.74,y+.04,-.34],[s*w,y-.10,-.03],[s*w*.83,y-.27,z*.74],[s*.31,y-.32,z]];if(i<9)pts.push([s*.07,y-.21,z+.015]);path(ribs,pts,.028,C.bone,boneExtra)}}
 limb(ribs,[[0,7.6,.42],[0,7.13,.49],[0,6.71,.43]],[.075,.058,.025],C.bone,boneExtra);
 for(const s of [-1,1]){path(ribs,[[s*.05,7.73,.31],[s*.44,7.77,.23],[s*.91,7.74,.11],[s*1.13,7.6,0]],.056,C.bone,boneExtra);
  ell(groups.pelvis,[s*.58,4.34,-.14],[.34,.44,.12],C.bone,boneExtra,[0,s*.48,s*-.27]);
  path(groups.pelvis,[[s*.71,4.31,-.04],[s*.58,3.92,.09],[s*.23,3.87,.22],[s*.03,4.10,.28],[s*.24,4.26,.24]],.075,C.bone,boneExtra);
  const g=groups.limbBones;
  const bone=(a,b,r)=>{path(g,[a,b],r,C.bone,boneExtra);ell(g,a,[r*1.55,r*1.4,r*1.55],C.bone,boneExtra);ell(g,b,[r*1.5,r*1.4,r*1.5],C.bone,boneExtra)};
  bone([s*1.12,7.54,0],[s*1.66,6.35,.02],.095);
  bone([s*1.69,6.29,.03],[s*2.04,5.03,.08],.052);bone([s*1.58,6.29,.01],[s*1.94,5.03,.04],.052);
  bone([s*.48,4.0,-.04],[s*.55,2.44,.02],.105);bone([s*.53,2.35,.02],[s*.54,.55,.02],.074);bone([s*.68,2.35,-.03],[s*.66,.59,-.02],.041);
  ell(g,[s*.54,2.37,.18],[.12,.14,.06],C.bone,boneExtra);
  for(let f=0;f<5;f++){const x=s*(1.92+f*.065);bone([s*2,4.99,.07],[x,4.57,.08],.022);bone([x,4.57,.08],[x+s*.03,4.24+Math.abs(f-2)*.05,.08],.019);bone([s*(.4+f*.068),.37,.06],[s*(.4+f*.068),.20,.55-Math.abs(f-1)*.05],.026)}
 }
 // Main arterial and venous pathways, with organ, head, arm and leg branches.
 for(const type of ['aorta','vena']){const g=groups[type],ar=type==='aorta',color=ar?C.artery:C.vein,dx=ar?.065:-.13,zz=ar?-.10:-.17,r=ar?.059:.065;
  path(g,[[dx,7.30,zz],[dx,6.8,zz],[dx,6.0,zz],[dx,5.35,zz],[dx,4.64,zz]],r,color,{roughness:.38});
  for(const s of [-1,1]){
   path(g,[[dx,7.43,zz],[s*.20+dx,7.96,zz],[s*.21+dx,8.54,zz],[s*.27,8.93,-.1]],r*.57,color);
   path(g,[[dx,7.52,zz],[s*.72,7.64,zz],[s*1.16,7.50,zz],[s*1.45,6.88,.02+zz],[s*1.66,6.30,.04+zz],[s*1.87,5.65,.06+zz],[s*2.02,4.95,.12+zz]],r*.60,color);
   for(let f=0;f<4;f++)path(g,[[s*2.02,4.98,.12+zz],[s*(1.97+f*.07),4.7,.14+zz],[s*(1.98+f*.08),4.29+Math.abs(f-1.5)*.06,.12+zz]],r*.15,color);
   path(g,[[dx,4.67,zz],[s*.41,4.22,zz],[s*.49,3.57,.09+zz],[s*.53,2.47,.11+zz],[s*.49,1.7,.09+zz],[s*.54,.57,.07+zz],[s*.55,.27,.43]],r*.72,color);
   path(g,[[s*.52,2.46,.1+zz],[s*.66,1.75,.02+zz],[s*.62,.64,.02+zz]],r*.33,color);
   path(g,[[dx,5.72,zz],[s*.29,5.71,zz],[s*.56,5.69,-.16]],r*.53,color);
   path(g,[[dx,6.15,zz],[s*.41,6.15,.04],[s*.68,6.25,.17]],r*.35,color);
   for(let k=0;k<3;k++){path(g,[[s*.48,3.95-k*.45,.1+zz],[s*(.67+.02*k),3.68-k*.46,.05+zz],[s*.64,3.40-k*.45,.04+zz]],r*.22,color);path(g,[[s*1.37,7.02-k*.32,.03+zz],[s*1.62,6.87-k*.3,.01+zz],[s*1.68,6.68-k*.32,.03+zz]],r*.19,color)}
   for(let b=0;b<4;b++){let yy=5.35-b*.2;path(g,[[dx,5.66,zz],[s*.23,yy,.1],[s*.54,yy-.13,.17]],r*.23,color)}
   for(let b=0;b<3;b++)path(g,[[s*.24,8.54,-.1],[s*(.31+b*.04),8.82+b*.22,-.16],[s*.20,9.15+b*.15,-.28]],r*.20,color);
  }
 }
 path(groups.aorta,[[.21,7.19,.27],[.13,7.47,.19],[.27,7.57,-.01],[.38,7.4,-.12],[.065,7.1,-.1]],.085,C.artery);
 // Slight lateral separation keeps the two schematic vessel paths distinguishable.
 groups.vena.position.x-=.09;
 // Spinal cord and selected peripheral nerves.
 path(groups.spinal,[[0,8.77,-.17],[0,8.35,-.37],[0,7.8,-.38],[0,6.75,-.39],[0,5.4,-.34]],.038,C.nerve);
 for(let i=0;i<8;i++)path(groups.spinal,[[0,5.43,-.34],[(i-3.5)*.026,5.08,-.33],[(i-3.5)*.035,4.69,-.29]],.008,C.nerve);
 for(const s of [-1,1]){
  for(let i=0;i<15;i++){const y=8.15-i*.20;path(groups.nerves,[[0,y,-.39],[s*.24,y-.08,-.32],[s*(y>7.7?.28:.67),y-.20,-.17]],.012,C.nerve)}
  path(groups.nerves,[[s*.16,7.84,-.31],[s*.88,7.66,-.12],[s*1.28,7.25,-.02],[s*1.64,6.34,.09],[s*1.93,5.33,.14],[s*2.07,4.63,.15]],.020,C.nerve);
  path(groups.nerves,[[s*.14,5.0,-.29],[s*.43,4.35,-.15],[s*.61,3.35,-.10],[s*.57,2.42,-.10],[s*.59,1.32,-.10],[s*.59,.36,.03]],.024,C.nerve);
 }
 // Lymph nodes and selected connecting paths.
 for(const s of [-1,1]){for(const [x,y,z] of [[.28,8.2,.02],[.29,8.4,.01],[.9,7.35,.04],[1,7.18,.03],[.48,4.34,.22],[.64,4.22,.17]]){for(let j=0;j<3;j++)ell(groups.lymphNodes,[s*(x+.045*Math.sin(j)),y+j*.075,z],[.04,.052,.035],0x7da184)}path(groups.lymphNodes,[[s*.5,4.25,-.03],[s*.35,5.3,-.15],[s*.3,6.4,-.15],[s*.85,7.35,-.03],[s*.27,8.2,-.05]],.014,0x7b9970)}
 // Selected major muscle groups; initially disabled to keep internal structures clear.
 for(const s of [-1,1]){const g=groups.muscles;ell(g,[s*.57,7.37,.4],[.51,.32,.13],0xaa6662,{roughness:.64},[0,0,s*.12]);ell(g,[s*1.38,7.03,.08],[.20,.48,.19],0xa96860,{roughness:.65},[0,0,s*.38]);ell(g,[s*.54,3.37,.08],[.27,.76,.23],0xb07167,{roughness:.64});ell(g,[s*.54,1.56,-.05],[.18,.52,.18],0xb3796c,{roughness:.65});for(let i=0;i<4;i++)ell(g,[s*.22,6.5-i*.36,.42],[.19,.16,.08],0xaa6b62,{roughness:.67});for(let j=0;j<7;j++)path(g,[[s*(.35+j*.045),4,.1],[s*(.36+j*.05),3.4,.28],[s*(.4+j*.038),2.8,.14]],.008,0xcb8d7e,{roughness:.7})}
 buildReproductive({groups,ell,path,limb,pickables});
 // Ground rings give the model a spatial reference without a heavy pedestal.
 for(const [r,opacity] of [[1.22,.19],[1.50,.1],[2.10,.045]]){const geo=new THREE.RingGeometry(r-.008,r,128);const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0x7fa9b6,transparent:true,opacity,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.01;scene.add(m)}
 const miniScene=new THREE.Scene();light(miniScene);const miniCamera=new THREE.PerspectiveCamera(33,1,.01,80);const miniRenderer=soft?new SoftwareRenderer():new THREE.WebGLRenderer({antialias:true,alpha:true});miniRenderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));miniRenderer.outputColorSpace=THREE.SRGBColorSpace;miniRenderer.toneMapping=THREE.ACESFilmicToneMapping;miniRenderer.toneMappingExposure=1.2;miniContainer.appendChild(miniRenderer.domElement);
 let miniObject=null,selected='heart',hovered=null,transition=null,skinOpacity=.12,isolated=false,anatomySex='male';
 const initialMat=new Map();for(const g of Object.values(groups))g.traverse(m=>{if(m.isMesh){initialMat.set(m,{opacity:m.material.opacity,transparent:m.material.transparent,depthWrite:m.material.depthWrite});}});
 function updateMini(id){if(miniObject){miniScene.remove(miniObject);miniObject.traverse(m=>{if(m.isMesh)m.material.dispose()})}const original=groups[id];miniObject=original.clone(true);miniObject.visible=true;miniObject.position.set(0,0,0);miniObject.traverse(m=>{if(m.isMesh){m.visible=!m.userData.obsolete&&(!m.userData.anatomySex||m.userData.anatomySex===anatomySex);m.material=m.material.clone();m.material.opacity=1;m.material.transparent=false;m.material.depthWrite=true;m.material.emissive.setHex(0);}});const box=new THREE.Box3().setFromObject(miniObject),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());miniObject.position.sub(center);miniScene.add(miniObject);const max=Math.max(size.y,size.x/(miniContainer.clientWidth/miniContainer.clientHeight),size.z);miniCamera.position.set(max*.16,max*.15,max*2.25);miniCamera.lookAt(0,0,0);}
 function setSelected(id){selected=id;for(const [key,g] of Object.entries(groups))g.traverse(m=>{if(m.isMesh)m.material.emissive.setHex(key===id?0x2b1912:0)});updateMini(id)}
 const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();let down=null;
 function intersect(event){const rect=renderer.domElement.getBoundingClientRect();mouse.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(mouse,camera);const hits=raycaster.intersectObjects(pickables.filter(m=>m.parent.visible&&m.visible&&(m.userData.id!=='skin'||isolated)),false);return hits.find(hit=>hit.object.material.opacity>.5)||hits.find(hit=>hit.object.material.opacity>.13);}
 renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};transition=null});
 renderer.domElement.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<6){const hit=intersect(e);if(hit)onPick(hit.object.userData.id)}down=null});
 renderer.domElement.addEventListener('pointermove',e=>{if(down)return;const hit=intersect(e);hovered=hit?.object.userData.id??null;renderer.domElement.style.cursor=hovered?'pointer':'grab';onHover(hovered,e)});
 renderer.domElement.addEventListener('pointerleave',()=>{onHover(null);down=null});
 function go(pos,target,duration=750){transition={start:performance.now(),from:camera.position.clone(),to:V(pos),tf:controls.target.clone(),tt:V(target),duration};controls.autoRotate=false;}
 function focus(id){const g=groups[id],box=new THREE.Box3().setFromObject(g),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());let d=Math.max(2.05,size.y*1.9,size.x/camera.aspect*1.9,size.z*2.5);d=Math.min(21,d);go([center.x+.2,center.y+.15,center.z+d],center.toArray())}
 function setVisibility(visible,only,cut=false,sex='male'){const changed=anatomySex!==sex;anatomySex=sex;isolated=!!only;for(const [id,g]of Object.entries(groups)){g.visible=visible.has(id);g.traverse(m=>{if(!m.isMesh)return;m.visible=!m.userData.obsolete&&(!m.userData.anatomySex||m.userData.anatomySex===sex)&&!(cut&&m.userData.cutawayFront);const initial=initialMat.get(m);m.material.opacity=id==='skin'?(only==='skin'?.8:skinOpacity):initial.opacity;m.material.transparent=id==='skin'||initial.transparent;m.material.depthWrite=id==='skin'?false:initial.depthWrite;});}if(changed&&selected==='urethra')updateMini(selected);}
 function setSkin(value){skinOpacity=value;groups.skin.traverse(m=>{if(m.isMesh)m.material.opacity=value})}
 function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();const mw=miniContainer.clientWidth,mh=miniContainer.clientHeight;miniRenderer.setSize(mw,mh);miniCamera.aspect=mw/mh;miniCamera.updateProjectionMatrix();if(selected)updateMini(selected)}
 const observer=new ResizeObserver(resize);observer.observe(container);observer.observe(miniContainer);resize();setSelected('heart');
 let frame=0;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function animate(t){requestAnimationFrame(animate);if(document.hidden)return;if(transition){const f=Math.min(1,(performance.now()-transition.start)/transition.duration),ease=1-Math.pow(1-f,3);camera.position.lerpVectors(transition.from,transition.to,ease);controls.target.lerpVectors(transition.tf,transition.tt,ease);if(f===1)transition=null}controls.update();if(!reduced){const beat=1+Math.max(0,Math.sin(t*.0075))**9*.018;groups.heart.scale.setScalar(beat);if(miniObject&&selected==='heart')miniObject.rotation.y=Math.sin(t*.00035)*.14;}renderer.render(scene,camera);if(frame++%2===0)miniRenderer.render(miniScene,miniCamera);}
 requestAnimationFrame(animate);
 return {groups,renderer,camera,controls,focus,focusReproductive(){go([.12,4.16,3.3],[0,4.04,.07]);},setSelected,setVisibility,setSkin,
  reset(){go([.3,5.2,Math.max(18.8,11/camera.aspect)],[0,4.8,0]);},
  view(v){let d=camera.position.distanceTo(controls.target);d=Math.max(16,d);const p=v==='back'?[0,5,-d]:v==='side'?[d,5,.05]:[.2,5,d];go(p,[0,4.8,0]);},
  zoom(n){const delta=camera.position.clone().sub(controls.target).multiplyScalar(n);delta.clampLength(1,27);camera.position.copy(controls.target.clone().add(delta));transition=null;},
  project(id){const p=V(organs[id].pos);p.project(camera);return {x:(p.x*.5+.5)*container.clientWidth,y:(-.5*p.y+.5)*container.clientHeight,visible:p.z>-1&&p.z<1&&Math.abs(p.x)<.88&&Math.abs(p.y)<.85};},
  labelState(){return {distance:camera.position.distanceTo(controls.target),front:camera.position.z>1};},
  hasMesh(id){return groups[id].children.length>0;}
 };
}
