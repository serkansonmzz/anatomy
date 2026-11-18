import {installOxygen} from './oxygen.js';
import {systems,organs,tours,reproductiveInteriors} from './data.js';
import {createAtlas} from './model.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const svg=id=>`<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
const icons={lungs:'<path d="M10 4v7c-2-6-4-5-6-1-2 4-3 9 1 9 2 0 4-2 5-3V4Zm4 0v7c2-6 4-5 6-1 2 4 3 9-1 9-2 0-4-2-5-3V4Z"/>',brain:'<path d="M12 5c-3-4-7-1-7 2-4 0-4 7-1 8-1 5 6 6 8 2 2 4 9 3 8-2 3-1 3-8-1-8 0-3-4-6-7-2Zm0 0v12M5 7l2 3m-3 5 4-1m11-7-2 3m3 5-4-1"/>',stomach:'<path d="M10 3v6c5-5 10-3 10 3 0 5-6 9-10 7-2-1-2-4-6-3v-3c4-1 5 2 7 1-4-2-4-7-4-11"/>',kidney:'<path d="M9 3C1 3 1 21 8 21c4 0 3-5 1-7-2-2-2-3 0-5 2-2 3-6 0-6Zm6 0c8 0 8 18 1 18-4 0-3-5-1-7 2-2 2-3 0-5-2-2-3-6 0-6Z"/>',bone:'<path d="m7 7 10 10c0 5 7 3 4 0 3-4-2-7-4-4L10 6C12 2 6 0 5 4 0 4 2 10 6 9Z"/>',nodes:'<circle cx="12" cy="4" r="2"/><circle cx="5" cy="14" r="2"/><circle cx="19" cy="14" r="2"/><circle cx="12" cy="21" r="2"/><path d="m11 6-5 6m7-6 5 6M6 16l4 4m8-4-4 4"/>',muscle:'<path d="M4 18C2 12 7 4 10 3l3 3-2 3-3-1-1 5c6-5 13-2 13 3 0 5-10 6-16 2Z"/>',skin:'<path d="M3 7c3-4 5 4 9 0s6 4 9 0M3 12c3-4 5 4 9 0s6 4 9 0M3 17c3-4 5 4 9 0s6 4 9 0"/>'};
let saved=[];try{saved=JSON.parse(localStorage.getItem('anatomy-saved')||'[]').filter(id=>organs[id]);}catch{}
const englishNames={
  "heart": "Heart",
  "brain": "Brain",
  "lungs": "Lungs",
  "liver": "Liver",
  "stomach": "Stomach",
  "smallIntestine": "Small intestine",
  "largeIntestine": "Large intestine",
  "kidneys": "Kidneys",
  "bladder": "Urinary bladder",
  "aorta": "Aorta",
  "vena": "Venae cavae",
  "coronary": "Coronary vessels",
  "trachea": "Trachea",
  "bronchi": "Bronchi",
  "larynx": "Larynx",
  "diaphragm": "Diaphragm",
  "esophagus": "Esophagus",
  "pancreas": "Pancreas",
  "gallbladder": "Gallbladder",
  "spleen": "Spleen",
  "thyroid": "Thyroid gland",
  "adrenals": "Adrenal glands",
  "pituitary": "Pituitary gland",
  "cerebellum": "Cerebellum",
  "spinal": "Spinal cord",
  "nerves": "Peripheral nerves",
  "eyes": "Eyes",
  "tongue": "Tongue",
  "rectum": "Rectum",
  "appendix": "Appendix",
  "ureters": "Ureters",
  "urethra": "Urethra",
  "thymus": "Thymus",
  "lymphNodes": "Lymph nodes",
  "skull": "Skull",
  "ribs": "Ribs",
  "spine": "Vertebral column",
  "pelvis": "Pelvis",
  "limbBones": "Limb bones",
  "muscles": "Muscles",
  "skin": "Skin",
  "testes": "Testes",
  "prostate": "Prostate",
  "uterus": "Uterus",
  "ovaries": "Ovaries",
  "epididymis": "Epididymis",
  "vasDeferens": "Vas deferens",
  "seminalVesicles": "Seminal vesicles",
  "ejaculatoryDucts": "Ejaculatory ducts",
  "bulbourethral": "Bulbourethral glands",
  "penis": "Penis",
  "scrotum": "Scrotum",
  "seminiferous": "Seminiferous tubules",
  "reteTestis": "Rete testis",
  "erectileTissue": "Erectile tissue",
  "uterineTubes": "Uterine tubes",
  "cervix": "Cervix",
  "vagina": "Vagina",
  "endometrium": "Endometrium",
  "myometrium": "Myometrium",
  "ovarianFollicles": "Ovarian follicles",
  "vulva": "Vulva",
  "clitoris": "Clitoris"
};
const defaultSystems=()=>new Set(systems.filter(s=>!['all','muscular','lymphatic'].includes(s.id)).map(s=>s.id));
const state={selected:'heart',sex:'male',enabled:defaultSystems(),category:'all',isolated:false,labels:true,savedOnly:false,tour:-1,cutaway:false};
let atlas,toastTimer;
function toast(t){$('#toast').textContent=t;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,2600)}
const available=o=>!o.sex||o.sex===state.sex;
const systemOf=id=>systems.find(s=>s.id===id);
function visibleIds(){return new Set(Object.values(organs).filter(o=>available(o)&&(!reproductiveInteriors.has(o.id)||state.cutaway)&&(state.isolated?o.id===state.selected:(state.enabled.has(o.system)||(state.category==='reproductive'&&o.id==='urethra')))).map(o=>o.id));}
function syncVisibility(){const ids=visibleIds();atlas?.setVisibility(ids,state.isolated?state.selected:null,state.cutaway,state.sex,state.heartCut&&state.selected==='heart');$('#visible-count').textContent=`${ids.size} yapı görünür`;$('#isolate-organ').innerHTML=svg('eye')+(state.isolated?' Tümünü göster':' Yalnız göster');$('#isolate-organ').classList.toggle('active',state.isolated);$('#isolate-organ').setAttribute('aria-pressed',String(state.isolated));$('#scene-title').textContent=state.isolated?organs[state.selected].name:state.category==='all'?'Tüm vücut':systemOf(state.category).name;renderSystems();syncReproductive();$('#heart-cut').hidden=state.selected!=='heart';$('#heart-cut').textContent=state.heartCut?'Kalp kesitini kapat':'Kalp kesitini aç';}
function renderSystems(){
 $('#systems').innerHTML=systems.map(s=>{let count=Object.values(organs).filter(o=>available(o)&&(s.id==='all'||o.system===s.id)).length;const on=s.id==='all'?state.enabled.size>0:state.enabled.has(s.id);const icon=icons[s.icon]?`<svg aria-hidden="true">${icons[s.icon]}</svg>`:svg(s.icon);return `<div class="system-row ${state.category===s.id?'selected':''} ${on?'':'off'}" style="--sys:${s.color}"><button class="system-main" data-system="${s.id}" aria-label="${s.name} sistemini incele"><span class="sys-icon">${icon}</span><span class="system-name">${s.name}</span><span class="system-number">${count}</span></button><button class="visibility-btn" data-toggle="${s.id}" aria-label="${s.name} ${on?'gizle':'göster'}" aria-pressed="${on}">${svg('eye')}</button></div>`}).join('');
 $('#structure-count').textContent=Object.values(organs).filter(available).length;
 $$('[data-system]').forEach(b=>b.onclick=()=>{const id=b.dataset.system;state.category=id;state.isolated=false;if(id==='all')state.enabled=defaultSystems();else{state.enabled=new Set([id,'integumentary']);if(id==='integumentary'){atlas?.setSkin(.36);$('#skin-opacity').value=36;$('#opacity-value').textContent='%36'}const o=Object.values(organs).find(o=>o.system===id&&available(o));if(o)select(o.id,false);}if(id==='reproductive')atlas?.focusReproductive();else atlas?.reset();syncVisibility();$('#sidebar').classList.remove('mobile-open')});
 $$('[data-toggle]').forEach(b=>b.onclick=()=>{const id=b.dataset.toggle;state.isolated=false;state.category='all';if(id==='all')state.enabled=state.enabled.size?new Set():new Set(systems.slice(1).map(s=>s.id));else if(state.enabled.has(id))state.enabled.delete(id);else state.enabled.add(id);syncVisibility()});
}
function bookmarkUI(){const yes=saved.includes(state.selected);$('#bookmark').classList.toggle('active',yes);$('#bookmark').setAttribute('aria-pressed',String(yes));$('#bookmark').setAttribute('aria-label',yes?'Kaydedilenlerden çıkar':'Organı kaydet');$('#saved-count').textContent=saved.length;}
function select(id,open=true){const o=organs[id];if(!o)return;if(o.sex&&o.sex!==state.sex)setSex(o.sex);if(reproductiveInteriors.has(id))state.cutaway=true;if(id!==state.selected){state.heartCut=false;document.querySelector('#heart-part').textContent='';}state.selected=id;state.enabled.add(o.system);atlas?.setSelected(id);$('#organ-name').textContent=o.name;$('#organ-latin').textContent=englishNames[id]+' · '+o.latin;$('#organ-description').textContent=o.description;$('#organ-location').textContent=o.location;$('#organ-fact').textContent=o.fact;$('#organ-functions').innerHTML=o.functions.map(f=>`<li>${f}</li>`).join('');const s=systemOf(o.system);$('#organ-system').textContent=s.name.toLocaleUpperCase('tr');$('#organ-system').style.cssText=`color:${s.color};background:${s.color}16;border-color:${s.color}38`;$('#organ-number').textContent=`${String(o.index).padStart(2,'0')} / ${Object.keys(organs).length}`;$('#related-list').innerHTML=o.related.map(id=>resultHTML(organs[id])).join('');$$('#related-list [data-organ]').forEach(b=>b.onclick=()=>select(b.dataset.organ));bookmarkUI();syncVisibility();if(open)$('#details').classList.add('mobile-open');}
function resultHTML(o){return `<button class="result-item" data-organ="${o.id}"><i class="dot" style="background:${systemOf(o.system).color}"></i><span><strong>${o.name}</strong><small>${o.latin}</small></span>${svg('chevron')}</button>`}
const norm=s=>s.toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
function renderSearch(){const q=norm($('#search').value.trim());const searching=!!q||state.savedOnly;$('#systems').hidden=searching;$('#results').hidden=!searching;$('#list-heading').textContent=state.savedOnly?'KAYDEDİLEN YAPILAR':q?'ARAMA SONUÇLARI':'VÜCUT SİSTEMLERİ';if(!searching){$('#system-count').textContent='11';return}const list=Object.values(organs).filter(o=>(state.savedOnly?saved.includes(o.id):true)&&(!q||norm(`${o.name} ${englishNames[o.id]} ${o.latin} ${systemOf(o.system).name}`).includes(q)));$('#system-count').textContent=list.length;$('#results').innerHTML=list.length?list.map(resultHTML).join(''):`<p class="empty-results">${state.savedOnly?'Henüz kaydettiğin bir yapı yok. Organ kartındaki yıldızla kendi keşif listeni oluştur.':'Bu aramada bir yapı bulunamadı. Türkçe veya Latince bir ad dene.'}</p>`;$$('#results [data-organ]').forEach(b=>b.onclick=()=>{select(b.dataset.organ);$('#sidebar').classList.remove('mobile-open');if(atlas&&state.isolated)atlas.focus(state.selected)});}
function setSex(sex){state.sex=sex;for(const s of ['male','female']){$(`#${s}-btn`).classList.toggle('active',sex===s);$(`#${s}-btn`).setAttribute('aria-pressed',String(sex===s))}if(!available(organs[state.selected])){state.selected=sex==='male'?'testes':'uterus';select(state.selected,false)}syncVisibility();renderSearch();if(state.category==='reproductive')atlas?.focusReproductive();}
function endTour(){state.tour=-1;$('#tour-bar').hidden=true;$('#tour-nav').classList.remove('active');$('#explore-nav').classList.add('active');state.isolated=false;state.category='all';state.enabled=defaultSystems();syncVisibility();atlas?.reset()}
function tourStep(n){if(n>=tours.length){endTour();toast('Keşif tamamlandı. Şimdi kendi rotanı çiz.');return}state.tour=n;state.savedOnly=false;$('#search').value='';renderSearch();const step=tours[n];state.isolated=true;select(step.id);$('#tour-bar').hidden=false;$('#tour-progress').textContent=`0${n+1} / 06`;$('#tour-title').textContent=step.title;$('#tour-text').textContent=step.text;$('#tour-prev').disabled=n===0;$('#tour-next').innerHTML=(n===5?'Tamamla':'Sonraki')+svg('arrow');atlas?.focus(step.id);$('#tour-nav').classList.add('active');$('#explore-nav').classList.remove('active');$('#saved-nav').classList.remove('active')}
function reset(){state.heartCut=false;$('#heart-part').textContent='';state.cutaway=false;endTour();state.isolated=false;state.category='all';state.enabled=defaultSystems();syncVisibility();atlas?.reset();$('#auto-rotate').classList.remove('active');$('#auto-rotate').setAttribute('aria-pressed','false');$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view==='front'));$('#orientation-name').textContent='ÖN GÖRÜNÜM';}
function syncReproductive(){const panel=$('#repro-panel');panel.hidden=state.category!=='reproductive'&&organs[state.selected].system!=='reproductive';$('#repro-structure').innerHTML=Object.values(organs).filter(o=>o.system==='reproductive'&&available(o)).map(o=>`<option value="${o.id}" ${o.id===state.selected?'selected':''}>${o.name}${reproductiveInteriors.has(o.id)?' · iç yapı':''}</option>`).join('');$('#cutaway').setAttribute('aria-pressed',String(state.cutaway));$('#cutaway').textContent=state.cutaway?'İç yapıları kapat':'İç yapıları aç';$('#cutaway-note').textContent=state.cutaway?'Şematik ön kesit · Ön duvarlar kaldırıldı.':'Organları ayrı ayrı seçerek keşfet.';}
function focusReproductive(){state.isolated=false;state.category='reproductive';state.enabled=new Set(['reproductive','integumentary']);syncVisibility();atlas?.focusReproductive();}
$('#repro-structure').onchange=e=>{select(e.target.value);switchTab(false);focusReproductive();};
$('#repro-focus').onclick=focusReproductive;
$('#cutaway').onclick=()=>{state.cutaway=!state.cutaway;if(!state.cutaway&&reproductiveInteriors.has(state.selected))select(state.sex==='male'?'testes':'uterus',false);syncVisibility();};
$('#search').addEventListener('input',renderSearch);
$('#bookmark').onclick=()=>{const index=saved.indexOf(state.selected);if(index===-1)saved.push(state.selected);else saved.splice(index,1);try{localStorage.setItem('anatomy-saved',JSON.stringify(saved));}catch{toast('Tarayıcı kaydetmeye izin vermiyor; bu oturumda korunacak.')}bookmarkUI();renderSearch()};
$('#saved-nav').onclick=()=>{state.savedOnly=true;$('#search').value='';$('#saved-nav').classList.add('active');$('#explore-nav').classList.remove('active');$('#tour-nav').classList.remove('active');renderSearch();$('#sidebar').classList.add('mobile-open')};
$('#explore-nav').onclick=()=>{state.savedOnly=false;$('#search').value='';renderSearch();$('#saved-nav').classList.remove('active');$('#explore-nav').classList.add('active');if(state.tour>=0)endTour()};
$('#male-btn').onclick=()=>setSex('male');$('#female-btn').onclick=()=>setSex('female');
$('#tab-overview').onclick=()=>switchTab(false);$('#tab-related').onclick=()=>switchTab(true);
function switchTab(related){$('#overview-content').hidden=related;$('#related-content').hidden=!related;$('#tab-overview').classList.toggle('active',!related);$('#tab-related').classList.toggle('active',related);$('#tab-overview').setAttribute('aria-selected',String(!related));$('#tab-related').setAttribute('aria-selected',String(related));}
$('#focus-organ').onclick=()=>atlas?.focus(state.selected);
$('#isolate-organ').onclick=()=>{state.isolated=!state.isolated;syncVisibility();if(state.isolated)atlas?.focus(state.selected);else atlas?.reset()};
$('#reset-view').onclick=reset;
$('#zoom-in').onclick=()=>atlas?.zoom(.8);$('#zoom-out').onclick=()=>atlas?.zoom(1.25);
$('#auto-rotate').onclick=()=>{if(!atlas)return;atlas.controls.autoRotate=!atlas.controls.autoRotate;$('#auto-rotate').classList.toggle('active',atlas.controls.autoRotate);$('#auto-rotate').setAttribute('aria-pressed',String(atlas.controls.autoRotate))};
$$('[data-view]').forEach(b=>b.onclick=()=>{atlas?.view(b.dataset.view);$$('[data-view]').forEach(v=>v.classList.toggle('active',v===b));$('#orientation-name').textContent={front:'ÖN GÖRÜNÜM',back:'ARKA GÖRÜNÜM',side:'YAN GÖRÜNÜM'}[b.dataset.view]});
$('#toggle-labels').onclick=()=>{state.labels=!state.labels;$('#toggle-labels').classList.toggle('active',state.labels);$('#toggle-labels').setAttribute('aria-pressed',String(state.labels));$('#labels').hidden=!state.labels};
$('#skin-opacity').oninput=e=>{const val=+e.target.value;atlas?.setSkin(val/100);$('#opacity-value').textContent=`%${val}`;if(val>0&&!state.enabled.has('integumentary')){state.enabled.add('integumentary');syncVisibility()}};
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('Bu tarayıcıda tam ekran kullanılamıyor.')}};
$('#start-tour').onclick=$('#tour-nav').onclick=()=>tourStep(0);$('#tour-next').onclick=()=>tourStep(state.tour+1);$('#tour-prev').onclick=()=>tourStep(Math.max(0,state.tour-1));$('#tour-close').onclick=endTour;
$('#about-btn').onclick=$('#source-btn').onclick=()=>$('#about-dialog').showModal();$('.dialog-close').onclick=()=>$('#about-dialog').close();$('#about-dialog').onclick=e=>{if(e.target===$('#about-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}};
$('#mobile-systems').onclick=()=>{$('#sidebar').classList.toggle('mobile-open');$('#details').classList.remove('mobile-open')};$('#detail-close').onclick=()=>$('#details').classList.remove('mobile-open');
document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea')||$('#about-dialog').open)return;if(e.key==='/'){e.preventDefault();$('#sidebar').classList.add('mobile-open');$('#search').focus()}if(e.key.toLowerCase()==='r')reset();if(e.key==='Escape'){$('#sidebar').classList.remove('mobile-open');$('#details').classList.remove('mobile-open');reset()}});
renderSystems();select('heart',false);bookmarkUI();
try{
 atlas=createAtlas($('#canvas-wrap'),$('#mini-canvas'),id=>{select(id);switchTab(false)},(id,event)=>{const label=$('#hover-label');label.hidden=!id;if(id){label.textContent=organs[id].name;const r=$('.viewer').getBoundingClientRect();label.style.left=Math.min(event.clientX-r.left+14,r.width-155)+'px';label.style.top=event.clientY-r.top-28+'px'}},name=>{$('#heart-part').textContent=name;toast(name)});
 syncVisibility();atlas.reset();$('#loading').hidden=true;
 const labelDefs=[['brain','left',-.27,0],['lungs','right',.75,0],['heart','right',.54,.27],['liver','left',-.74,0],['stomach','right',.56,.02],['smallIntestine','left',-.55,.08],['bladder','right',.31,0]];
 $('#labels').innerHTML=labelDefs.map(([id,side])=>`<button class="organ-label ${side==='left'?'label-left':''}" data-label="${id}" tabindex="-1"><span>${organs[id].name}</span></button>`).join('');
 $$('[data-label]').forEach(b=>b.onclick=()=>select(b.dataset.label));
 let last=0;
 function labels(t){requestAnimationFrame(labels);if(t-last<55||document.hidden||!state.labels)return;last=t;const ids=visibleIds(),ls=atlas.labelState(),width=$('.viewer').clientWidth;for(const [id,side,dx,dy]of labelDefs){const el=$(`[data-label="${id}"]`),p=atlas.project(id);el.hidden=!ids.has(id)||!p.visible||ls.distance<7||!ls.front||state.isolated;if(el.hidden)continue;const offset=Math.min(65,width*.10);let x=p.x+(side==='left'?-offset:offset),y=p.y+(id==='heart'?24:id==='stomach'?12:0);el.style.left=Math.max(90,Math.min(width-110,x))+'px';el.style.top=y+'px';el.classList.toggle('selected',id===state.selected)}}requestAnimationFrame(labels);
 // A small public status surface makes the render state inspectable without coupling UI to WebGL internals.
 window.anatomyStatus=()=>({structures:Object.keys(organs).length,mode:state.sex,visible:visibleIds().size,selected:state.selected,missingMeshes:Object.keys(organs).filter(id=>!atlas.hasMesh(id))});
}catch(error){console.error('Atlas initialization failed',error);$('#loading').hidden=true;$('#webgl-error').hidden=false;toast('3D başlatılamadı; organ bilgileri kullanılabilir.');}


function focusStudyOrgan(id, cut=false){
 state.category=organs[id].system;state.isolated=true;select(id,false);state.heartCut=cut;
 state.enabled=new Set([organs[id].system]);syncVisibility();atlas?.focus(id);
}
$('#heart-cut').onclick=()=>{const cut=!state.heartCut;focusStudyOrgan('heart',cut);$('#heart-part').textContent=cut?'Bir odacık veya kapak seç.':''};
async function shareView(fragment){
 const url=new URL(location.href);url.hash=fragment;
 try{await navigator.clipboard.writeText(url.href);toast('Bağlantı kopyalandı.');if($('#oxygen-lesson').open)$('#oxygen-lesson .oxy-note').textContent='Ders bağlantısı kopyalandı.';}
 catch{window.prompt('Bağlantıyı kopyala',url.href);}
}
const openLesson=installOxygen({openOrgan:id=>focusStudyOrgan(id,id==='heart'),share:shareView});
$('#share-atlas').onclick=()=>{if(!atlas)return;const params=new URLSearchParams({organ:state.selected,sex:state.sex,systems:[...state.enabled].join(','),category:state.category,isolated:+state.isolated,cut:+state.cutaway,heart:+!!state.heartCut,labels:+state.labels,skin:$('#skin-opacity').value,p:atlas.camera.position.toArray().join(','),t:atlas.controls.target.toArray().join(',')});shareView(params.toString());};
function restoreView(){
 const params=new URLSearchParams(location.hash.slice(1));
 if(/^[1-5]$/.test(params.get('ders')))return openLesson(Number(params.get('ders'))-1);
 const id=params.get('organ');if(!Object.hasOwn(organs,id)||!atlas)return;
 setSex(params.get('sex')==='female'?'female':'male');select(id,false);
 state.category=systems.some(s=>s.id===params.get('category'))?params.get('category'):'all';
 state.enabled=new Set((params.get('systems')||'').split(',').filter(k=>systems.some(s=>s.id===k)));state.isolated=params.get('isolated')==='1';state.cutaway=params.get('cut')==='1';state.heartCut=params.get('heart')==='1'&&id==='heart';
 const opacity=Number(params.get('skin'));if(Number.isFinite(opacity)&&opacity>=0&&opacity<=40){$('#skin-opacity').value=opacity;atlas.setSkin(opacity/100);$('#opacity-value').textContent='%'+opacity;}
 if(state.labels!==(params.get('labels')==='1'))$('#toggle-labels').click();syncVisibility();
 const vectors=['p','t'].map(k=>(params.get(k)||'').split(',').map(Number));
 if(vectors.every(v=>v.length===3&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<=100)))atlas.restoreCamera(...vectors);
}
restoreView();window.addEventListener('hashchange',restoreView);
