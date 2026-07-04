// NAVEGACIÓN DE DOS NIVELES
// ══════════════════════════════════════════════════
let _appMode='edu'; // 'edu' | 'calc'

function setAppMode(mode){
  _appMode=mode;
  document.getElementById('modebtn-edu').classList.toggle('active',mode==='edu');
  document.getElementById('modebtn-calc').classList.toggle('active',mode==='calc');
  document.getElementById('mbar-calc').classList.toggle('hid',mode!=='calc');
  document.getElementById('api-bar-calc').classList.toggle('hid',mode!=='calc');
  document.querySelectorAll('.mod').forEach(p=>p.classList.remove('act'));
  if(mode==='edu'){
    document.getElementById('mod-edu').classList.add('act');
  } else {
    // Activar el módulo técnico que estuviera seleccionado (o CBC por defecto)
    const activeTab=document.querySelector('#mbar-calc .mbtn.active')||document.getElementById('tab-conjoint');
    const modId=activeTab.id.replace('tab-','');
    document.getElementById('mod-'+modId).classList.add('act');
  }
  window.scrollTo({top:0,behavior:'smooth'});
}

function goHome(){
  setAppMode('edu');
  resetEdu();
}

function toggleApiBar(){
  const cb=document.getElementById('api-toggle-cb');
  document.getElementById('api-bar-fields').classList.toggle('hid',!cb.checked);
}

function swMod(m,btn,cls){
  document.querySelectorAll('.mod').forEach(p=>p.classList.remove('act'));
  document.querySelectorAll('#mbar-calc .mbtn').forEach(b=>{b.classList.remove('active','cb','cg','cp2','ct');});
  document.getElementById('mod-'+m).classList.add('act');
  btn.classList.add('active');if(cls)btn.classList.add(cls);
}
function resetAll(){
  Object.assign(S,{c:{attrs:[],vers:1,design:[],cv:0,cp:0,data:null,res:null,priceAttr:null},m:{items:[],vers:1,design:[],cv:0,cp:0,data:null,res:null},vw:{data:null,res:null},nms:{data:null,res:null},turf:{data:null,items:[],res:null},
  edu:{active:false,step:1,problemId:null,caseId:'cafe',sessionCode:'',startTime:null,pretest:[null,null,null],postest:[null,null,null],pretestSubmitted:false,posttestSubmitted:false,response:{hallazgo:'',evidencia:'',recomendacion:'',limitaciones:'',siguiente:''},aiFeedback:'',survey:{utilidad:0,facilidad:0,aprendizaje:0,claridad:0,intencion:0,abierta1:'',abierta2:'',abierta3:''},analysisSnapshot:null}});
  document.querySelectorAll('.mod').forEach(p=>p.classList.remove('act'));
  document.querySelectorAll('#mbar-calc .mbtn').forEach(b=>b.classList.remove('active','cb','cg','cp2','ct'));
  document.getElementById('mod-conjoint').classList.add('act');
  document.getElementById('tab-conjoint').classList.add('active');
  loadCEx();loadMEx();
  gCS(1);gMS(1);gVW(1);gNMS(1);gTURF(1);
  ['cfs','mfs','vwfs','nmfs','turf-fs'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.add('hid');});
  ['cab','mab','vwab','nmab','turf-next1'].forEach(id=>{const el=document.getElementById(id);if(el)el.disabled=true;});
}
function resetMod(mod){
  if(mod==='conjoint'){S.c={attrs:[],vers:1,design:[],cv:0,cp:0,data:null,res:null,priceAttr:null,simN:2};loadCEx();gCS(1);document.getElementById('cfs')?.classList.add('hid');document.getElementById('cab').disabled=true;}
  if(mod==='maxdiff'){S.m={items:[],vers:1,design:[],cv:0,cp:0,data:null,res:null};loadMEx();gMS(1);document.getElementById('mfs')?.classList.add('hid');document.getElementById('mab').disabled=true;}
  if(mod==='vw'){S.vw={data:null,res:null};gVW(1);document.getElementById('vwfs')?.classList.add('hid');document.getElementById('vwab').disabled=true;}
  if(mod==='nms'){S.nms={data:null,res:null};gNMS(1);document.getElementById('nmfs')?.classList.add('hid');document.getElementById('nmab').disabled=true;}
  if(mod==='turf'){S.turf={data:null,items:[],res:null};gTURF(1);document.getElementById('turf-fs')?.classList.add('hid');document.getElementById('turf-next1').disabled=true;document.getElementById('turf-md-status').textContent='';}
}

// STEP NAVIGATION
function gCS(n){document.querySelectorAll('#mod-conjoint .sp').forEach(p=>p.classList.remove('act'));document.getElementById('cs'+n).classList.add('act');for(let i=1;i<=4;i++){const w=document.getElementById('cw'+i);w.classList.remove('act','dn');if(i<n)w.classList.add('dn');if(i===n)w.classList.add('act');}}
function gMS(n){document.querySelectorAll('#mod-maxdiff .sp').forEach(p=>p.classList.remove('act'));document.getElementById('ms'+n).classList.add('act');for(let i=1;i<=4;i++){const w=document.getElementById('mw'+i);w.classList.remove('act','dn');if(i<n)w.classList.add('dn');if(i===n)w.classList.add('act');}}
function gVW(n){document.querySelectorAll('#mod-vw .sp').forEach(p=>p.classList.remove('act'));document.getElementById('vs'+n).classList.add('act');for(let i=1;i<=3;i++){const w=document.getElementById('vw'+i);w.classList.remove('act','dn');if(i<n)w.classList.add('dn');if(i===n)w.classList.add('act');}}
function gNMS(n){document.querySelectorAll('#mod-nms .sp').forEach(p=>p.classList.remove('act'));document.getElementById('ns'+n).classList.add('act');for(let i=1;i<=3;i++){const w=document.getElementById('nw'+i);w.classList.remove('act','dn');if(i<n)w.classList.add('dn');if(i===n)w.classList.add('act');}}

// ══════════════════════════════════════════════════
