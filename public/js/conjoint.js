// CBC CONJOINT (igual que v2.1, resumido)
// ══════════════════════════════════════════════════
function loadCEx(){S.c.attrs=[{name:'Tasa de interés anual (TEA)',levels:['12% anual','18% anual','24% anual']},{name:'% de dinero devuelto en compras',levels:['Sin devolución','1% de devolución','2% de devolución','3% de devolución']},{name:'Costo de membresía anual',levels:['S/ 0 al año','S/ 50 al año','S/ 120 al año']},{name:'Cobertura de uso',levels:['Solo uso local','Uso a nivel nacional','Uso nacional e internacional']},{name:'Beneficio principal de la tarjeta',levels:['Acumulación de millas','Descuentos en restaurantes','Seguro de viaje','Acceso a salas VIP en aeropuertos']}];renderCA();}
function addCAttr(){if(S.c.attrs.length>=6){alert(t('calc.cbc.err.max6'));return;}S.c.attrs.push({name:'',levels:['','']});renderCA();}
function rmCA(i){S.c.attrs.splice(i,1);renderCA();}
function addCL(ai){if(S.c.attrs[ai].levels.length>=5){alert(t('calc.cbc.err.max5lv'));return;}S.c.attrs[ai].levels.push('');renderCA();}
function rmCL(ai,li){if(S.c.attrs[ai].levels.length<=2){alert(t('calc.cbc.err.min2lv'));return;}S.c.attrs[ai].levels.splice(li,1);renderCA();}
function renderCA(){const c=document.getElementById('cbc-ac');c.innerHTML='';S.c.attrs.forEach((a,ai)=>{const d=document.createElement('div');d.className='ab';d.innerHTML=`<div class="ah"><div class="an">${ai+1}</div><input class="ai2" type="text" placeholder="${t('calc.cbc.attrname.ph')}" value="${a.name}" oninput="S.c.attrs[${ai}].name=this.value"><button class="brm" onclick="rmCA(${ai})">✕</button></div><div class="lrow">${a.levels.map((l,li)=>`<div class="lc"><input type="text" placeholder="${t('calc.cbc.level.ph')} ${li+1}" value="${l}" oninput="S.c.attrs[${ai}].levels[${li}]=this.value"><button class="rml" onclick="rmCL(${ai},${li})">✕</button></div>`).join('')}${a.levels.length<5?`<button class="bal" onclick="addCL(${ai})">＋</button>`:''}</div>`;c.appendChild(d);});const btn=document.getElementById('btn-aa');if(btn)btn.style.display=S.c.attrs.length>=6?'none':'';}
function setCVer(n,el){S.c.vers=n;document.querySelectorAll('#mod-conjoint .vp .pill').forEach(p=>p.classList.remove('act'));el.classList.add('act');}
function genCDesign(){try{const generated=createCBCDesign(S.c.attrs,{tasks:15,alternatives:4,versions:S.c.vers});S.c.attrs=generated.attributes;S.c.design=generated.designs;}catch(error){const msg=error.message.includes('at least two')?t('calc.cbc.err.min2attr'):error.message.includes('name')?t('calc.cbc.err.noname'):error.message;alert(msg);return;}S.c.cv=0;S.c.cp=0;renderCVS();renderCC();gCS(2);}
function renderCVS(){const sel=document.getElementById('cbc-vs');sel.innerHTML='';for(let v=0;v<S.c.vers;v++){const p=document.createElement('div');p.className='pill'+(v===0?' act':'');p.textContent=t('calc.version')+' '+(v+1);const vv=v;p.onclick=()=>{S.c.cv=vv;S.c.cp=0;document.querySelectorAll('#cbc-vs .pill').forEach(x=>x.classList.remove('act'));p.classList.add('act');renderCC();};sel.appendChild(p);}}
function renderCC(){const v=S.c.cv,cp=S.c.cp,task=S.c.design[v][cp],attrs=S.c.attrs;document.getElementById('cpi').textContent=`${t('calc.cbc.task')} ${cp+1} ${t('calc.cbc.of15')}`;document.getElementById('cprev').disabled=cp===0;document.getElementById('cnext').disabled=cp===14;document.getElementById('cbc-cd').innerHTML=`<div class="tc"><div class="tch">${t('calc.cbc.task').toUpperCase()} ${cp+1} — ${t('calc.cbc.choosewhich')} <span class="tcv">V${v+1}</span></div><div class="po">${task.map((prod,pi)=>`<div class="popt"><div class="pol" style="color:${PCOLS[pi]}">${t('calc.cbc.option')} ${pi+1}</div><div class="poa">${attrs.map(a=>`<span>${a.name}:</span> ${prod[a.name]}<br>`).join('')}</div></div>`).join('')}<div class="no">☐ ${t('calc.cbc.nonelabel')}</div></div></div>`;}
function chCP(d){S.c.cp=Math.max(0,Math.min(14,S.c.cp+d));renderCC();}
function dlCTpl(){const wb=XLSX.utils.book_new(),T=15,V=S.c.vers,attrs=S.c.attrs;const wi=XLSX.utils.aoa_to_sheet([['INSTRUCCIONES CBC Conjoint'],[''],['Cada fila = 1 encuestado. version: '+(Array.from({length:V},(_,i)=>i+1).join(' o '))+'. tarea_1 a tarea_15: 1-4 o 0 (Ninguno).']]);wi['!cols']=[{wch:80}];XLSX.utils.book_append_sheet(wb,wi,'Instrucciones');const tc=Array.from({length:T},(_,i)=>'tarea_'+(i+1)),hd=['id_encuestado','version',...tc];const wr=XLSX.utils.aoa_to_sheet([hd,...Array.from({length:5},(_,i)=>[i+1,(i%V)+1,...Array(T).fill('')])]);wr['!cols']=hd.map((_,i)=>({wch:i<2?15:9}));XLSX.utils.book_append_sheet(wb,wr,'Respuestas');for(let v=0;v<V;v++){const rows=[['TAREA','OPCIÓN',...attrs.map(a=>a.name)]];S.c.design[v].forEach((task,ti)=>{task.forEach((prod,pi)=>rows.push([ti+1,'Opción '+(pi+1),...attrs.map(a=>prod[a.name])]));rows.push([ti+1,'Ninguno',...attrs.map(()=>'—')]);});const wd=XLSX.utils.aoa_to_sheet(rows);wd['!cols']=[{wch:8},{wch:10},...attrs.map(()=>({wch:22}))];XLSX.utils.book_append_sheet(wb,wd,'Diseño_V'+(v+1));}XLSX.writeFile(wb,'plantilla_cbc_conjoint.xlsx');}
function hCDrop(e){e.preventDefault();const f=e.dataTransfer.files[0];if(f)prCFile(f);}
function hCFile(e){const f=e.target.files[0];if(f)prCFile(f);}
function prCFile(file){const r=new FileReader();r.onload=e=>{try{const wb=XLSX.read(e.target.result,{type:'binary'});S.c.data=XLSX.utils.sheet_to_json(wb.Sheets['Respuestas']||wb.Sheets[wb.SheetNames[0]]);document.getElementById('cfs').classList.remove('hid');document.getElementById('cfst').textContent=`${file.name} — ${S.c.data.length} encuestados.`;document.getElementById('cab').disabled=false;}catch{alert('Error al leer.');}};r.readAsBinaryString(file);}
function loadCDemo(){
  const T=15,P=4,N=80,attrs=S.c.attrs;
  const r=rng(2025);

  // ── Detectar atributo de precio (misma lógica que detectPriceAttr) ──
  const kwP=/precio|tasa|costo|tarifa|fee|rate|cost|membres|annual|cuota|valor|s\//i;
  const priceIdx=Math.max(0,attrs.findIndex(a=>kwP.test(a.name)));

  // ── Asignar utilidades verdaderas por nivel ──
  // Precio: decreciente, centrado, rango fijo 2.4
  //   → primer nivel = más barato = mayor utilidad
  // Otros: orden aleatorio con seed fijo, rango entre 0.6 y 1.2, centrado
  const tU={};
  attrs.forEach((a,ai)=>{
    tU[a.name]={};
    const k=a.levels.length;
    if(ai===priceIdx){
      a.levels.forEach((l,i)=>{tU[a.name][l]=1.2-(2.4/Math.max(k-1,1))*i;});
    }else{
      // Asignar rango y orden aleatorio (reproducible)
      const order=a.levels.map((_,i)=>({i,v:r()})).sort((x,y)=>y.v-x.v);
      const range=0.6+r()*0.6;
      order.forEach((item,rank)=>{
        tU[a.name][a.levels[item.i]]=range/2-(range/Math.max(k-1,1))*rank;
      });
      // Centrar (garantiza que la suma de utilidades del atributo sea 0)
      const avg=a.levels.reduce((s,l)=>s+tU[a.name][l],0)/k;
      a.levels.forEach(l=>{tU[a.name][l]-=avg;});
    }
  });

  // ── Generar elecciones con ruido Gumbel (escala 1.0) ──
  // Modelo: encuestado i en tarea t elige alternativa j* = argmax(V_j + ε_j)
  // donde V_j = suma de utilidades parciales y ε_j ~ Gumbel(0,1)
  const sc=1.0;
  const gumbel=()=>-Math.log(-Math.log(Math.max(r(),1e-10)));

  S.c.data=Array.from({length:N},(_,i)=>{
    const row={id_encuestado:i+1,version:(i%S.c.vers)+1};
    const v=Math.min(i%S.c.vers,S.c.design.length-1);
    for(let t=0;t<T;t++){
      const task=S.c.design[v][t];
      // Utilidades determinísticas de cada producto
      const detU=task.map(prod=>attrs.reduce((s,a)=>s+(tU[a.name][prod[a.name]]||0),0));
      // Agregar Ninguno (utilidad base = 0) y aplicar ruido Gumbel
      const noisy=[...detU,0].map(u=>u+sc*gumbel());
      const ch=noisy.indexOf(Math.max(...noisy));
      row['tarea_'+(t+1)]=ch===P?0:ch+1;  // 0=Ninguno, 1-4=opción
    }
    return row;
  });

  document.getElementById('cfs').classList.remove('hid');
  document.getElementById('cfst').textContent=`Datos demo — ${N} encuestados simulados.`;
  document.getElementById('cab').disabled=false;
}
function analyzeC(){try{S.c.res=estimateCBC(S.c.attrs,S.c.design,S.c.data);}catch(error){alert(_lang==='es'?`No fue posible estimar el CBC: ${error.message}`:`CBC estimation failed: ${error.message}`);return;}detectPriceAttr();renderCRes();initSim();initElast();buildCScript();gCS(4);genCAI();}
function detectPriceAttr(){const attrs=S.c.attrs;S.c.priceAttr=detectCBCPriceAttribute(attrs);const numeric=attrs.filter(a=>new Set(a.levels.map(parseCBCPriceLevel).filter(Number.isFinite)).size>=2);const sel=document.getElementById('price-attr-sel');sel.innerHTML='';const empty=document.createElement('option');empty.value='';empty.textContent=_lang==='es'?'Sin atributo de precio':'No price attribute';sel.appendChild(empty);numeric.forEach(a=>{const o=document.createElement('option');o.value=a.name;o.textContent=a.name;if(a.name===S.c.priceAttr)o.selected=true;sel.appendChild(o);});sel.disabled=numeric.length===0;const nt=document.getElementById('pd-notice'),tx=document.getElementById('pd-text');if(S.c.priceAttr){tx.innerHTML=`${t('calc.cbc.detected')} <strong>${S.c.priceAttr}</strong>. ${t('calc.cbc.detected.note')}`;nt.className='nt nts';}else{tx.innerHTML=t('calc.cbc.notdetected');nt.className='nt ntw';}}
function onPAC(){S.c.priceAttr=document.getElementById('price-attr-sel').value;initElast();updateSim();}
function renderCRes(){const{utils,imp}=S.c.res,attrs=S.c.attrs;const ic=document.getElementById('cbc-ic');ic.innerHTML='';[...attrs].sort((a,b)=>imp[b.name]-imp[a.name]).forEach((attr,i)=>{const p=imp[attr.name];const row=document.createElement('div');row.className='rbr';row.innerHTML=`<div class="rl2">${attr.name}</div><div class="rbw"><div class="rbf" style="width:${p}%;background:${COLS[i%COLS.length]}">${p>8?p.toFixed(1)+'%':''}</div></div><div class="rv">${p.toFixed(1)}%</div>`;ic.appendChild(row);});const tr=document.createElement('div');tr.className='rbr';tr.innerHTML=`<div class="rl2" style="font-weight:600;color:var(--ink)">${t('calc.md.total')}</div><div class="rbw"><div class="rbf" style="width:100%;background:#1a1714">100%</div></div><div class="rv" style="font-weight:600">100%</div>`;ic.appendChild(tr);const uc=document.getElementById('cbc-uc');uc.innerHTML='';attrs.forEach((attr,ai)=>{const sec=document.createElement('div');sec.className='isec';sec.innerHTML=`<div class="ititle">${attr.name}</div>`;const us=attr.levels.map(l=>utils[attr.name][l]),mn=Math.min(...us),rn=Math.max(...us)-mn||1;attr.levels.forEach(l=>{const u=utils[attr.name][l],p=(u-mn)/rn*100;const row=document.createElement('div');row.className='rbr';row.innerHTML=`<div class="rl2" style="font-size:.73rem">${l}</div><div class="rbw"><div class="rbf" style="width:${Math.max(2,p)}%;background:${COLS[ai%COLS.length]}">${p>15?u.toFixed(2):''}</div></div><div class="rv">${u.toFixed(2)}</div>`;sec.appendChild(row);});uc.appendChild(sec);});}
function calcShare(profiles){return simulateCBCShare(S.c.attrs,S.c.res.utils,profiles);}
function initSim(){
  const attrs=S.c.attrs;
  if(S.c.simN===undefined)S.c.simN=2;
  const n=S.c.simN;

  // Preservar selecciones actuales antes de re-renderizar
  const saved=Array.from({length:4},(_,p)=>{
    const prof={};
    attrs.forEach((a,ai)=>{
      const sel=document.getElementById(`sp-${p}-${ai}`);
      prof[a.name]=sel?sel.value:a.levels[0];
    });
    return prof;
  });

  // Actualizar grid
  const g=document.getElementById('sim-prods');
  g.innerHTML='';
  g.style.gridTemplateColumns=`repeat(${n},1fr)`;

  const pn=['A','B','C','D'].map(l=>`${t('calc.cbc.productword')} ${l}`);
  for(let p=0;p<n;p++){
    const div=document.createElement('div');
    div.className='sim-prod';
    const sl=attrs.map((a,ai)=>{
      const cur=saved[p][a.name]||a.levels[0];
      const opts=a.levels.map(l=>`<option${l===cur?' selected':''}>${l}</option>`).join('');
      return `<div class="fg"><label>${a.name}</label><select id="sp-${p}-${ai}" onchange="updateSim()">${opts}</select></div>`;
    }).join('');
    div.innerHTML=`<div class="sim-prod-head" style="background:${PCOLS[p]}">${pn[p]}<span style="opacity:.7;font-size:.58rem">${t('calc.cbc.productword')} ${p+1}</span></div><div class="sim-prod-body">${sl}</div><div class="sim-share-row"><div class="sim-share-label">Share</div><div class="sim-share-bar"><div class="sim-share-fill" id="sbar-${p}" style="background:${PCOLS[p]};width:20%"></div></div><div class="sim-share-val" id="sval-${p}">—</div></div>`;
    g.appendChild(div);
  }

  // Actualizar controles
  const btnRm=document.getElementById('sim-btn-rm');
  const btnAdd=document.getElementById('sim-btn-add');
  const badge=document.getElementById('sim-ctrl-badge');
  if(btnRm)btnRm.disabled=n<=1;
  if(btnAdd)btnAdd.disabled=n>=4;
  if(badge)badge.textContent=n===1?t('calc.cbc.prodcount.singular'):`${n} ${t('calc.cbc.prodcount.pluralword')}`;

  updateSim();
}
function addSimProd(){if(!S.c.res||S.c.simN>=4)return;S.c.simN++;initSim();}
function rmSimProd(){if(!S.c.res||S.c.simN<=1)return;S.c.simN--;initSim();}
function updateSim(){if(!S.c.res)return;const attrs=S.c.attrs,n=S.c.simN||2;const profiles=Array.from({length:n},(_,p)=>{const prof={};attrs.forEach((a,ai)=>{const sel=document.getElementById(`sp-${p}-${ai}`);if(sel)prof[a.name]=sel.value;});return prof;});const sh=calcShare([...profiles,null]);for(let p=0;p<n;p++){const s=sh[p].toFixed(1);document.getElementById('sbar-'+p).style.width=Math.max(2,sh[p])+'%';document.getElementById('sbar-'+p).textContent=sh[p]>8?s+'%':'';document.getElementById('sval-'+p).textContent=s+'%';}const ns=sh[n].toFixed(1);document.getElementById('sbar-none').style.width=Math.max(2,sh[n])+'%';document.getElementById('sval-none').textContent=ns+'%';}
function initElast(){const attrs=S.c.attrs,pa=S.c.priceAttr;const cfg=document.getElementById('elast-cfg');cfg.innerHTML='';if(!pa){renderElast();return;}attrs.filter(a=>a.name!==pa).forEach(a=>{const div=document.createElement('div');div.className='fg';div.innerHTML=`<label>${a.name}</label><select id="eb-${a.name.replace(/[^\w]/g,'_')}" onchange="renderElast()">${a.levels.map((l,i)=>`<option ${i===0?'selected':''}>${l}</option>`).join('')}</select>`;cfg.appendChild(div);});renderElast();}
function renderElast(){if(!S.c.res)return;const attrs=S.c.attrs,pa=S.c.priceAttr,container=document.getElementById('elast-curve'),ins=document.getElementById('elast-ins-txt');if(!pa){container.innerHTML=`<div class="nt ntw"><span class="ni">ℹ</span><span>${_lang==='es'?'La elasticidad no aplica hasta seleccionar un atributo con al menos dos niveles de precio numéricos.':'Elasticity is unavailable until an attribute with at least two numeric price levels is selected.'}</span></div>`;ins.textContent=_lang==='es'?'El modelo CBC general continúa siendo válido sin atributo de precio.':'The general CBC model remains valid without a price attribute.';return;}const base={};attrs.filter(a=>a.name!==pa).forEach(a=>{const sel=document.getElementById('eb-'+a.name.replace(/[^\w]/g,'_'));base[a.name]=sel?sel.value:a.levels[0];});const result=computeCBCPriceElasticity(attrs,S.c.res.utils,pa,base);if(!result.applicable){S.c.priceAttr=null;renderElast();return;}const mx=Math.max(...result.points.map(point=>point.share))||1,gc=['#1a7a4a','#2563a8','#7c3aed','#c8430a','#d97706'];container.innerHTML='';result.points.forEach((point,i)=>{const elasticity=point.elasticity;const row=document.createElement('div');row.className='elast-row';row.innerHTML=`<div class="elast-label">${point.level}</div><div class="elast-bar"><div class="elast-fill" style="width:${point.share/mx*100}%;background:${gc[Math.min(i,gc.length-1)]}">${point.share>5?point.share.toFixed(1)+'%':''}</div></div><div class="elast-val">${point.share.toFixed(1)}%</div><div class="elast-delta" style="color:${elasticity===null?'var(--ink3)':Math.abs(elasticity)>1?'var(--r)':'var(--g)'}">${elasticity===null?'—':'ε '+elasticity.toFixed(2)}</div>`;container.appendChild(row);});const elasticities=result.points.map(point=>point.elasticity).filter(Number.isFinite);const average=elasticities.length?elasticities.reduce((sum,value)=>sum+value,0)/elasticities.length:null;ins.innerHTML=average===null?(_lang==='es'?'No hay intervalos suficientes para estimar elasticidad.':'There are not enough intervals to estimate elasticity.'):`${_lang==='es'?'Elasticidad arco promedio':'Average arc elasticity'}: <strong>ε = ${average.toFixed(2)}</strong>. ${Math.abs(average)>1?(_lang==='es'?'Demanda elástica: el share cambia proporcionalmente más que el precio.':'Elastic demand: share changes proportionally more than price.'):(_lang==='es'?'Demanda inelástica: el share cambia proporcionalmente menos que el precio.':'Inelastic demand: share changes proportionally less than price.')}`;S.c.res.elasticity=result;}
// ══════════════════════════════════════════════════
