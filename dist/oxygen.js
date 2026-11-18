// Each scene uses its own anatomical scale. Motion traces the highlighted route.
const stages = [
 ['Nefes','Hava akciğerlere girer','Ağızdan veya burundan aldığın hava, soluk borusundan bronşlara ve daha ince hava yollarına geçer. Yolun sonunda hava ile dolan küçük keseler, yani alveoller vardır.','lungs'],
 ['Sağ kalp','Kan akciğere doğru yola çıkar','Aynı sırada, dokulardan dönen oksijeni az kan sağ kulakçığa gelir. Triküspit kapaktan sağ karıncığa geçer. Sağ karıncık kanı pulmoner kapaktan akciğer atardamarına pompalar.','heart'],
 ['Alveol','Oksijen alyuvara geçer','Alveoldeki oksijen ince duvarı geçerek kılcal damardaki kana yayılır. Oksijenin çoğu alyuvarın içindeki hemoglobine bağlanır. Karbondioksit ters yönde alveole geçer ve nefes verirken dışarı çıkar.','lungs'],
 ['Sol kalp','Oksijen taşıyan kan kalbe döner','Akciğer toplardamarları oksijence zengin kanı sol kulakçığa getirir. Kan mitral kapaktan sol karıncığa geçer. Sol karıncık kasılınca aort kapağından aorta çıkar.','heart'],
 ['Doku','Oksijen hücreye ulaşır','Aorttan çıkan kan, dallanan atardamarlarla doku kılcallarına ulaşır. Oksijen hemoglobinden ayrılır ve hücreye doğru yayılır. Alyuvar damarda kalır. Oksijeni azalan kan toplardamarlarla sağ kalbe döner.','aorta']
];
const chamberNames = ['Sağ kulakçık','Sağ karıncık','Sol kulakçık','Sol karıncık'];
const chamberNotes = ['Vücuttan dönen kanı alır.','Kanı akciğer atardamarına pompalar.','Akciğer toplardamarlarından kan alır.','Kalın kas duvarıyla kanı aorta pompalar.'];
const chamberShapes = [
 'M125 115 Q120 66 171 69 Q197 73 200 131 Q159 147 125 127Z',
 'M124 145 Q166 163 202 141 L251 241 Q168 226 134 193 Q115 169 124 145Z',
 'M217 127 Q205 71 252 74 Q287 70 296 118 Q263 141 217 127Z',
 'M217 145 Q265 159 298 132 Q319 175 267 242 Q241 205 217 145Z'
];
const textAt=(x,y,s)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle">'+s+'</text>';
const line=(d,color,w)=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"/>';
const blood=(d,rich)=>'<g><animateMotion dur="4s" repeatCount="indefinite" path="'+d+'"/><ellipse rx="9" ry="6" fill="'+(rich?'#ff7774':'#a74762')+'" stroke="#ffb3ae"/><ellipse rx="4" ry="2" fill="#762d47"/></g>';
const molecule=(d,label,color,delay=0)=>'<g><animateMotion dur="4s" begin="-'+delay+'s" repeatCount="indefinite" path="'+d+'"/><circle r="10" fill="'+color+'"/><text text-anchor="middle" y="3.5" style="fill:#17212a;font:bold 9px sans-serif">'+label+'</text></g>';
const svg=(body)=>'<svg class="oxy-art" viewBox="0 0 440 290" aria-label="Etkileşimli anatomik şema">'+body+'</svg>';
function airway(){
 const route='M66 45 Q110 45 152 66 Q209 80 220 108 L220 150 Q250 161 277 193 L299 208';
 return svg('<g fill="#603f52" stroke="#e69ba9" stroke-width="3"><path d="M202 80 Q190 61 154 98 Q107 140 110 221 Q111 245 148 233 L203 212Z"/><path d="M238 78 Q261 62 298 110 Q334 154 332 225 Q328 248 285 228 L242 207Z"/></g>'+line('M66 45 Q118 44 159 69 Q211 84 220 106 L220 150 M220 150 L165 176 L145 209 M165 176 L154 149 M220 150 L278 191 L300 208 M276 191 L292 155','#88cbbc',9)+[0,1.3,2.6].map(t=>molecule(route,'O₂','#91f0d6',t)).join('')+textAt(75,27,'Ağız / burun')+textAt(329,89,'Soluk borusu')+textAt(220,266,'Bronşlar → bronşçuklar → alveoller'));
}
function heartScene(left,quiz=false){
 const route=left?'M373 82 Q322 83 258 102 Q247 125 256 155 L266 197 Q294 166 293 86 Q291 39 325 42':'M104 44 Q111 93 156 101 Q170 125 166 159 L182 183 Q199 165 200 99 Q197 43 238 38';
 const vessels=line('M103 39 Q105 86 143 98 M194 155 L200 86 Q196 43 239 38','#855067',16)+line('M374 82 Q330 82 277 100 M280 159 L293 93 Q291 39 325 42','#b65d63',16);
 return svg(vessels+'<path fill="#713d4b" stroke="#d78691" stroke-width="3" d="M111 108 Q108 56 170 56 Q195 55 206 76 Q241 48 282 61 Q319 71 320 130 Q336 187 268 260 Q169 243 123 201 Q100 174 111 108Z"/>'+chamberShapes.map((d,i)=>'<path class="chamber" tabindex="0" role="button" data-part="'+i+'" aria-label="'+(quiz?'Bölge '+(i+1):chamberNames[i])+'" d="'+d+'" fill="'+(i<2?'#723c58':'#b45764')+'"/>').join('')+(quiz?'':line(route,left?'#ffd0a9':'#d2a1c6',2)+blood(route,left))+[[159,107],[164,177],[256,108],[266,177]].map(([x,y],i)=>textAt(x,y,quiz?String(i+1):['Sağ kulakçık','Sağ karıncık','Sol kulakçık','Sol karıncık'][i])).join('')+textAt(220,284,quiz?'Bir odacığa dokun':'Önden kesit · Kişinin sağı solda'));
}
function exchange(tissue){
 const cellY=tissue?68:205, sourceY=tissue?205:83;
 const top=tissue?'<ellipse cx="221" cy="68" rx="101" ry="43" fill="#44445b" stroke="#c3a9d3"/><ellipse cx="261" cy="62" rx="17" ry="12" fill="#89789e"/>':'<path d="M194 17 L194 45 C117 50 98 122 159 139 Q218 151 280 138 C341 119 320 53 246 45 L246 17" fill="#284d51" stroke="#90d5c8" stroke-width="4"/>';
 const oPath='M211 '+sourceY+' L211 '+cellY,coPath=tissue?'M249 90 L249 193':'M249 195 L249 98';
 return svg(top+textAt(219,tissue?60:73,tissue?'Doku hücresi':'Alveol havası')+'<path d="M35 161 Q220 148 405 161 L405 233 Q220 216 35 233Z" fill="#4f303e" stroke="#cf8392" stroke-width="3"/>'+'<g><animateTransform attributeName="transform" type="translate" values="48 205;211 205;211 205;392 205" keyTimes="0;.28;.72;1" dur="6s" repeatCount="indefinite"/><ellipse rx="22" ry="11" stroke="#fac1bb"><animate attributeName="fill" values="'+(tissue?'#ec706d;#ec706d;#933f5b;#933f5b':'#933f5b;#933f5b;#ec706d;#ec706d')+'" keyTimes="0;.28;.72;1" dur="6s" repeatCount="indefinite"/></ellipse><ellipse rx="9" ry="4" fill="#80354a"/></g>' +line(oPath,'#77b9a8',1)+('<g><animateTransform attributeName="transform" type="translate" values="'+(tissue?'48 205;211 205;211 68;211 68':'211 83;211 83;211 205;392 205')+'" keyTimes="0;.28;.72;1" dur="6s" repeatCount="indefinite"/><circle r="9" fill="#88ebc9"/><text text-anchor="middle" y="3" style="fill:#152521;font:bold 9px sans-serif">O₂</text></g>')+molecule(coPath,'CO₂','#edd298',1)+textAt(220,264,'Kılcal damar · Kan akışı →'));
}
export function installOxygen({openOrgan,share}){
 const dialog=document.querySelector('#oxygen-lesson'),q=s=>dialog.querySelector(s);
 let step=0,question=-1,paused=false,answered=false;
 const questions=[['Vücuttan dönen kan önce hangi odacığa gelir?',0],['Kanı akciğere hangi odacık pompalar?',1],['Akciğerden dönen kan önce nereye gelir?',2]];
 const render=()=>{
  const quiz=question>=0, [tag,title,desc]=stages[step];
  q('.oxy-count').textContent=quiz?'KENDİNİ SINA · '+(question+1)+' / 3':'OKSİJENİN YOLCULUĞU · '+(step+1)+' / 5';
  q('h2').textContent=quiz?questions[question][0]:title;
  q('.oxy-desc').textContent=quiz?'Kalp kesitindeki numaralı odacıklardan birini seç.':desc;
  q('.oxy-figure').innerHTML=quiz?heartScene(false,true):[airway,()=>heartScene(false),()=>exchange(false),()=>heartScene(true),()=>exchange(true)][step]();
  q('.oxy-note').textContent=quiz?'':step===1||step===3?'Bir odacığa dokunarak görevini incele.':step===2||step===4?'O₂ oksijen · CO₂ karbondioksit · Diskler alyuvarları gösterir.':'Yeşil işaretler havadaki oksijeni gösterir.';
  q('.oxy-steps').innerHTML=stages.map(([name],i)=>'<button type="button" data-stage="'+i+'" aria-pressed="'+(!quiz&&step===i)+'">'+name+'</button>').join('');
  q('.oxy-prev').disabled=!quiz&&step===0;q('.oxy-next').disabled=quiz&&!answered;
  q('.oxy-next').textContent=quiz?(question===2?'Dersi tamamla':'Sonraki soru'):step===4?'Kendini sına':'Sonraki adım';
  q('.oxy-organ').hidden=q('.oxy-pause').hidden=quiz;q('.oxy-organ').textContent=step===1||step===3?'Kalbi 3D atlasta gör':step===4?'Aortu 3D atlasta gör':'Akciğerleri 3D atlasta gör';
  const art=q('svg');if(paused||quiz)art.pauseAnimations();q('.oxy-pause').textContent=paused?'Hareketi başlat':'Hareketi durdur';
 };
 function open(index=0){step=index;question=-1;answered=false;paused=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!dialog.open)dialog.showModal();render();}
 dialog.addEventListener('click',e=>{
  const target=e.target.closest('button,[data-part]');if(!target)return;
  if(target.hasAttribute('data-stage'))return open(Number(target.dataset.stage));
  if(target.hasAttribute('data-part')){const i=Number(target.dataset.part);q('.oxy-note').textContent=chamberNames[i]+' · '+chamberNotes[i];if(question>=0){answered=i===questions[question][1];q('.oxy-note').textContent=(answered?'Doğru. ':'Tekrar dene. ')+q('.oxy-note').textContent;q('.oxy-next').disabled=!answered;}return}
  if(target.matches('.oxy-close'))dialog.close();
  if(target.matches('.oxy-prev')){if(question>=0){question--;answered=false;}else step--;render();}
  if(target.matches('.oxy-next')){if(question===2){open(0);q('.oxy-note').textContent='Ders tamamlandı · Üç odacık sorusunu yanıtladın.';return}if(step===4){question++;answered=false;}else step++;render();}
  if(target.matches('.oxy-pause')){paused=!paused;const art=q('svg');paused?art.pauseAnimations():art.unpauseAnimations();target.textContent=paused?'Hareketi başlat':'Hareketi durdur';}
  if(target.matches('.oxy-organ')){dialog.close();openOrgan(stages[step][3]);}
  if(target.matches('.oxy-share'))share('ders='+String(step+1));
 });
 dialog.addEventListener('keydown',e=>{e.stopPropagation();if(e.target.hasAttribute('data-part')&&['Enter',' '].includes(e.key)){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
 document.querySelector('#oxygen-start').onclick=()=>open();
 return open;
}
