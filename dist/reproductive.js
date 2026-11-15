import * as THREE from 'three';
// Schematic educational geometry. +Z anterior, +X anatomical left.
export function buildReproductive({groups,ell,path,limb,pickables}) {
 const E=(id,p,s,c,rot)=>ell(groups[id],p,s,c,{},rot);
 const P=(id,p,r,c)=>path(groups[id],p,r,c);
 function split(m,threshold=0){const geo=m.geometry,idx=geo.index.array,pos=geo.attributes.position,front=[],back=[];for(let i=0;i<idx.length;i+=3){const tri=[idx[i],idx[i+1],idx[i+2]];(tri.reduce((s,j)=>s+pos.getZ(j),0)/3>threshold?front:back).push(...tri)}const fg=geo.clone();fg.setIndex(front);geo.setIndex(back);const fm=new THREE.Mesh(fg,m.material.clone());fm.position.copy(m.position);fm.rotation.copy(m.rotation);fm.userData={...m.userData,cutawayFront:true};fm.material.side=m.material.side=THREE.DoubleSide;m.parent.add(fm);pickables.push(fm);return m;}
 const S=(id,p,s,c,rot)=>split(E(id,p,s,c,rot));
 for(const s of [-1,1]){
  S('scrotum',[s*.12,3.68,.19],[.148,.206,.126],0xb88785);
  S('testes',[s*.12,3.70,.19],[.105,.15,.087],0xc8a5a4);
  for(let row=0;row<5;row++){const pts=[];for(let j=0;j<=60;j++){const t=j/60,a=t*10*Math.PI;pts.push([s*.12+(row-2)*.028+.011*Math.cos(a),3.59+t*.22,.19+.027*Math.sin(a)])}P('seminiferous',pts,.006,0xefce96)}
  P('reteTestis',[[s*.15,3.59,.12],[s*.16,3.70,.12],[s*.17,3.82,.12]],.012,0xf4dbaa);
  for(let j=0;j<5;j++)P('reteTestis',[[s*.10,3.61+j*.04,.18],[s*.16,3.61+j*.04,.12],[s*.205,3.80,.14]],.005,0xf4dbaa);
  const epi=[];for(let j=0;j<=70;j++){const t=j/70;epi.push([s*(.205+.014*Math.cos(t*28*Math.PI)),3.84-t*.28,.15+.014*Math.sin(t*28*Math.PI)])}P('epididymis',epi,.014,0xdac09a);E('epididymis',[s*.18,3.85,.15],[.045,.035,.04],0xdac09a);
  P('vasDeferens',[[s*.205,3.57,.14],[s*.28,3.9,.13],[s*.36,4.17,.1],[s*.34,4.48,.03],[s*.20,4.43,-.11],[s*.10,4.15,-.04]],.019,0xe0bfaa);
  for(let j=0;j<7;j++)E('seminalVesicles',[s*(.125+.025*Math.sin(j*2.2)),4.15+j*.027,-.065],[.05,.035,.043],0xc8a170);
  P('ejaculatoryDucts',[[s*.10,4.15,-.04],[s*.055,4.05,.045],[0,3.98,.15]],.012,0xe7d399);
  E('bulbourethral',[s*.075,3.85,.14],[.025,.025,.025],0xc4ab83);P('bulbourethral',[[s*.075,3.85,.14],[s*.04,3.81,.25],[0,3.80,.39]],.008,0xc4ab83);
  limb(groups.erectileTissue,[[s*.13,3.94,.27],[s*.045,3.82,.44],[s*.04,3.60,.46],[s*.035,3.37,.49]],[.034,.032,.030,.027],0xb2758e);
 }
 S('prostate',[0,3.98,.15],[.135,.103,.115],0xc48f93);
 S('penis',[0,3.60,.46],[.096,.27,.08],0xc49b94,[.12,0,0]);S('penis',[0,3.34,.49],[.10,.075,.083],0xd5a3a4);
 limb(groups.erectileTissue,[[0,3.86,.25],[0,3.78,.49],[0,3.6,.50],[0,3.34,.53]],[.042,.025,.024,.03],0xbb8db2,{transparent:true,opacity:.46});
 S('uterus',[0,4.38,-.01],[.22,.25,.145],0xc98191);
 S('myometrium',[0,4.38,-.01],[.192,.225,.126],0xa45572);
 P('endometrium',[[-.145,4.54,.025],[-.08,4.44,.07],[0,4.25,.025],[.08,4.44,.07],[.145,4.54,.025]],.025,0xf1c5b9);
 P('endometrium',[[-.145,4.54,.025],[0,4.55,.07],[.145,4.54,.025]],.024,0xf1c5b9);P('endometrium',[[0,4.26,.025],[0,4.19,.02]],.020,0xf1c5b9);
 S('cervix',[0,4.115,-.005],[.083,.10,.075],0xc994a6);const os=[];for(let j=0;j<=24;j++){const a=j/24*Math.PI*2;os.push([.034*Math.cos(a),4.03,.015+.025*Math.sin(a)])}P('cervix',os,.012,0xe3b4bc);
 const vg=P('vagina',[[0,4.11,-.005],[0,3.95,.005],[0,3.79,.09]],.070,0xc98599);split(vg,.005);
 for(let j=0;j<7;j++){const pts=[];for(let k=0;k<=12;k++){const a=Math.PI+k/12*Math.PI;pts.push([.06*Math.cos(a),3.82+j*.039,.035+.05*Math.sin(a)])}P('vagina',pts,.006,0xe0a5b2)}
 for(const s of [-1,1]){
  S('ovaries',[s*.40,4.43,-.02],[.10,.067,.064],0xdbadb2);
  for(let j=0;j<6;j++){const a=j/6*2*Math.PI,r=.012+j*.0025,p=[s*.40+.055*Math.cos(a),4.43+.032*Math.sin(a),.005];E('ovarianFollicles',p,[r,r,r],0xe5bc86);E('ovarianFollicles',[p[0],p[1],p[2]+r*.8],[.006,.006,.006],0xffe4b5)}
  P('uterineTubes',[[s*.17,4.53,-.01],[s*.29,4.59,-.02],[s*.48,4.60,-.03],[s*.54,4.53,-.025],[s*.51,4.47,-.01]],.023,0xca8c9d);
  for(let j=0;j<6;j++)P('uterineTubes',[[s*.51,4.47,-.01],[s*(.49+j*.009),4.44,.01],[s*(.46+j*.015),4.405-j*.003,.015]],.009,0xe3a4b2);
  S('vulva',[s*.061,3.755,.195],[.048,.14,.04],0xc18c94);P('vulva',[[s*.025,3.86,.23],[s*.038,3.76,.24],[s*.021,3.66,.21]],.012,0xda9ba6);
  P('clitoris',[[0,3.865,.265],[s*.06,3.92,.19],[s*.12,3.86,.10],[s*.15,3.77,.04]],.019,0xb986a3);
 }
 E('clitoris',[0,3.865,.265],[.024,.023,.023],0xd6a4b4);
 groups.urethra.children.forEach(m=>{m.userData.obsolete=true;m.visible=false});
 const male=P('urethra',[[0,4.10,.21],[0,3.98,.15],[0,3.85,.22],[0,3.78,.50],[0,3.59,.51],[0,3.31,.53]],.012,0xe8cc98);male.userData.anatomySex='male';
 const female=P('urethra',[[0,4.10,.21],[0,3.96,.21],[0,3.80,.26]],.019,0xe8cc98);female.userData.anatomySex='female';
}
