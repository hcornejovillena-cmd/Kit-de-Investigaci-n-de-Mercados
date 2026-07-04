// VAN WESTENDORP PSM — ANÁLISIS
// ══════════════════════════════════════════════════
function hVWDrop(e){e.preventDefault();const f=e.dataTransfer.files[0];if(f)prVWFile(f);}
function hVWFile(e){const f=e.target.files[0];if(f)prVWFile(f);}
function prVWFile(file){const r=new FileReader();r.onload=e=>{try{const wb=XLSX.read(e.target.result,{type:'binary'});S.vw.data=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);document.getElementById('vwfs').classList.remove('hid');document.getElementById('vwfst').textContent=`${file.name} — ${S.vw.data.length} encuestados.`;document.getElementById('vwab').disabled=false;}catch{alert('Error.');}};r.readAsBinaryString(file);}

function loadVWDemo(){
  const N=120,r=rng(777);
  S.vw.data=Array.from({length:N},(_,i)=>{
    const ref=20+Math.floor(r()*30);
    return{id:i+1,muy_barato:Math.max(1,Math.round(ref*(0.3+r()*0.2))),barato:Math.round(ref*(0.6+r()*0.2)),caro:Math.round(ref*(1.1+r()*0.3)),muy_caro:Math.round(ref*(1.4+r()*0.4))};
  });
  document.getElementById('vwfs').classList.remove('hid');
  document.getElementById('vwfst').textContent=`Datos demo — ${N} encuestados simulados.`;
  document.getElementById('vwab').disabled=false;
}

function analyzeVW(){
  try{
    S.vw.res=computeVanWestendorp(S.vw.data);
  }catch(error){
    if(error.code==='VW_MIN_ROWS'){
      alert(`${error.validRows} ${t('calc.err.minrows')} 10.`);
      return;
    }
    throw error;
  }
  renderVWResults();
  gVW(3);
  genVWAI();
}

function renderVWResults(){
  const{PMC,PME,OPP,IPP,stats,valid,excluded}=S.vw.res;

  // Puntos de precio
  const ppg=document.getElementById('vw-pp');
  ppg.innerHTML=`
    <div class="pp-card" style="border-top:3px solid #c8430a">
      <div class="pp-label">${t('calc.vw.pmc')}</div>
      <div class="pp-val" style="color:#c8430a">${PMC.price.toFixed(1)}</div>
      <div class="pp-desc">${t('calc.vw.pmc.desc')}</div>
    </div>
    <div class="pp-card" style="border-top:3px solid #1a7a4a">
      <div class="pp-label">${t('calc.vw.opp')}</div>
      <div class="pp-val" style="color:#1a7a4a">${OPP.price.toFixed(1)}</div>
      <div class="pp-desc">${t('calc.vw.opp.desc')}</div>
    </div>
    <div class="pp-card" style="border-top:3px solid #2563a8">
      <div class="pp-label">${t('calc.vw.ipp')}</div>
      <div class="pp-val" style="color:#2563a8">${IPP.price.toFixed(1)}</div>
      <div class="pp-desc">${t('calc.vw.ipp.desc')}</div>
    </div>
    <div class="pp-card" style="border-top:3px solid #7c3aed">
      <div class="pp-label">${t('calc.vw.pme')}</div>
      <div class="pp-val" style="color:#7c3aed">${PME.price.toFixed(1)}</div>
      <div class="pp-desc">${t('calc.vw.pme.desc')}</div>
    </div>`;

  document.getElementById('vw-range-text').innerHTML=`${t('calc.vw.range')}: <strong>${PMC.price.toFixed(1)} — ${PME.price.toFixed(1)}</strong> · ${t('calc.vw.optrange')}: <strong>${OPP.price.toFixed(1)} — ${IPP.price.toFixed(1)}</strong> · ${t('calc.vw.valid')}: ${valid.length}${excluded>0?' ('+excluded+' '+t('calc.vw.excl')+')':''}`;

  // Leyenda
  const legendData=[
    {label:t('calc.vw.legend.cheap'),color:'#d97706'},
    {label:t('calc.vw.legend.vcheap'),color:'#2563a8'},
    {label:t('calc.vw.legend.exp'),color:'#1a7a4a'},
    {label:t('calc.vw.legend.vexp'),color:'#56cfcf'}
  ];
  document.getElementById('vw-legend').innerHTML=legendData.map(l=>`<div class="vw-leg-item"><div class="vw-leg-dot" style="background:${l.color}"></div>${l.label}</div>`).join('');

  // Canvas chart
  drawVWChart('vw-canvas',S.vw.res,{PMC,PME,OPP,IPP});

  // Stats
  const cols=['muy_barato','barato','caro','muy_caro'];
  const labels=[t('calc.vw.stats.vcheap'),t('calc.vw.stats.cheap'),t('calc.vw.stats.exp'),t('calc.vw.stats.vexp')];
  document.getElementById('vw-stats').innerHTML=`<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.8rem">
    <thead><tr style="background:var(--surface)"><th style="text-align:left;padding:.45rem .7rem;border-bottom:1px solid var(--border);font-size:.72rem;color:var(--ink3)">${t('calc.vw.stats.col.q')}</th><th style="text-align:center;padding:.45rem .7rem;border-bottom:1px solid var(--border);font-size:.72rem;color:var(--ink3)">${t('calc.vw.stats.col.mean')}</th><th style="text-align:center;padding:.45rem .7rem;border-bottom:1px solid var(--border);font-size:.72rem;color:var(--ink3)">${t('calc.vw.stats.col.med')}</th><th style="text-align:center;padding:.45rem .7rem;border-bottom:1px solid var(--border);font-size:.72rem;color:var(--ink3)">${t('calc.vw.stats.col.sd')}</th><th style="text-align:center;padding:.45rem .7rem;border-bottom:1px solid var(--border);font-size:.72rem;color:var(--ink3)">${t('calc.vw.stats.col.min')}</th><th style="text-align:center;padding:.45rem .7rem;border-bottom:1px solid var(--border);font-size:.72rem;color:var(--ink3)">${t('calc.vw.stats.col.max')}</th></tr></thead>
    <tbody>${cols.map((k,i)=>`<tr style="border-bottom:1px solid var(--border)"><td style="padding:.42rem .7rem">${labels[i]}</td><td style="padding:.42rem .7rem;text-align:center;font-family:'Geist Mono',monospace">${stats[k].mean}</td><td style="padding:.42rem .7rem;text-align:center;font-family:'Geist Mono',monospace">${stats[k].median}</td><td style="padding:.42rem .7rem;text-align:center;font-family:'Geist Mono',monospace">${stats[k].sd}</td><td style="padding:.42rem .7rem;text-align:center;font-family:'Geist Mono',monospace">${stats[k].min}</td><td style="padding:.42rem .7rem;text-align:center;font-family:'Geist Mono',monospace">${stats[k].max}</td></tr>`).join('')}
    </tbody></table></div>`;

  renderOutlierBlock('vw-outliers',valid,cols,labels);
}
function renderOutlierBlock(containerId,records,fields,fieldLabels){
  const el=document.getElementById(containerId);
  if(!el)return;
  const{outliers}=detectOutliers(records,fields);
  if(outliers.length===0){
    el.innerHTML=`<div class="nt nts"><span class="ni">✓</span><span>${t('calc.outlier.none')}</span></div>`;
    return;
  }
  const labelMap={};fields.forEach((f,i)=>labelMap[f]=fieldLabels?fieldLabels[i]:f);
  const n=outliers.length;
  el.innerHTML=`<div class="nt ntw" style="margin-bottom:.65rem"><span class="ni">⚠</span><span><strong>${n} ${_lang==='es'?'valor'+(n>1?'es':'')+' atípico'+(n>1?'s':''):n>1?'outliers':'outlier'} ${t('calc.outlier.found')}</strong></span></div>
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.78rem">
    <thead><tr style="background:var(--surface)"><th style="padding:.4rem .6rem;border:1px solid var(--border);font-size:.68rem;color:var(--ink3)">${t('calc.outlier.col.id')}</th><th style="padding:.4rem .6rem;border:1px solid var(--border);font-size:.68rem;color:var(--ink3)">${t('calc.outlier.col.field')}</th><th style="padding:.4rem .6rem;border:1px solid var(--border);font-size:.68rem;color:var(--ink3)">${t('calc.outlier.col.value')}</th><th style="padding:.4rem .6rem;border:1px solid var(--border);font-size:.68rem;color:var(--ink3)">${t('calc.outlier.col.range')}</th></tr></thead>
    <tbody>${outliers.slice(0,15).map(o=>`<tr><td style="padding:.4rem .6rem;border:1px solid var(--border);font-family:monospace">#${o.id}</td><td style="padding:.4rem .6rem;border:1px solid var(--border)">${labelMap[o.field]||o.field}</td><td style="padding:.4rem .6rem;border:1px solid var(--border);font-family:monospace;color:#9a3412">${o.value}</td><td style="padding:.4rem .6rem;border:1px solid var(--border);font-family:monospace;font-size:.72rem;color:var(--ink3)">[${o.lower}, ${o.upper}]</td></tr>`).join('')}</tbody>
    </table></div>${outliers.length>15?`<p style="font-size:.72rem;color:var(--ink3);margin-top:.4rem">${t('calc.outlier.more')} ${outliers.length} ${t('calc.outlier.more2')}</p>`:''}`;
}


function drawVWChart(canvasId,res,pts){
  const canvas=document.getElementById(canvasId);if(!canvas)return;
  const{prices,curve}=res;
  const ctx=canvas.getContext('2d');
  const W=canvas.offsetWidth||700,H=canvas.offsetHeight||320;
  canvas.width=W;canvas.height=H;
  const pad={l:48,r:20,t:24,b:52};
  const minP=prices[0],maxP=prices[prices.length-1];
  const px=p=>pad.l+(p-minP)/(maxP-minP)*(W-pad.l-pad.r);
  const py=pct=>H-pad.b-pct/100*(H-pad.t-pad.b);
  ctx.clearRect(0,0,W,H);
  // Grid
  ctx.strokeStyle='#e2ddd4';ctx.lineWidth=1;
  for(let g=0;g<=100;g+=25){const y=py(g);ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();}
  for(let g=0;g<=4;g++){const x=pad.l+g/4*(W-pad.l-pad.r);ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,H-pad.b);ctx.stroke();}
  // Labels
  ctx.fillStyle='#8a8278';ctx.font='11px Geist, sans-serif';ctx.textAlign='right';
  for(let g=0;g<=100;g+=25){ctx.fillText(g+'%',pad.l-5,py(g)+4);}
  ctx.textAlign='center';
  const step=Math.ceil((maxP-minP)/6);
  for(let p=Math.ceil(minP/step)*step;p<=maxP;p+=step){ctx.fillText(p,px(p),H-pad.b+16);}

  function drawCurve(key,color,dashed){
    ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=2.5;
    if(dashed){ctx.setLineDash([6,4]);}else{ctx.setLineDash([]);}
    let first=true;
    prices.forEach(p=>{const v=curve[p][key];if(first){ctx.moveTo(px(p),py(v));first=false;}else{ctx.lineTo(px(p),py(v));}});
    ctx.stroke();ctx.setLineDash([]);
  }
  drawCurve('ch','#d97706',false);   // Barato → baja de izq a der (naranja)
  drawCurve('tc','#2563a8',false);   // Muy barato → baja más rápido (azul)
  drawCurve('exp','#1a7a4a',false);  // Caro → sube de izq a der (verde)
  drawCurve('texp','#56cfcf',false); // Muy caro → sube más rápido (celeste)

  // Intersections — colors match reference image style
  const ptDefs=[
    {pt:pts.PMC,col:'#c8430a',lbl:'PMC'},   // Muy Barato ∩ Caro
    {pt:pts.OPP,col:'#1a7a4a',lbl:'OPP'},   // Muy Barato ∩ Muy Caro
    {pt:pts.IPP,col:'#d97706',lbl:'IPP'},   // Barato ∩ Caro
    {pt:pts.PME,col:'#7c3aed',lbl:'PME'}    // Barato ∩ Muy Caro
  ];
  ptDefs.forEach(({pt,col,lbl})=>{
    if(!pt||!pt.price)return;
    const x=px(pt.price),y=py(pt.pct);
    // Vertical dashed line
    ctx.beginPath();ctx.strokeStyle=col;ctx.lineWidth=1.2;ctx.setLineDash([4,3]);ctx.moveTo(x,pad.t);ctx.lineTo(x,H-pad.b);ctx.stroke();ctx.setLineDash([]);
    // Dot at intersection
    ctx.beginPath();ctx.fillStyle='#fff';ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.arc(x,y,6,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.fillStyle=col;ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();
    // Label above
    ctx.fillStyle=col;ctx.font='bold 11px Geist, sans-serif';ctx.textAlign='center';ctx.fillText(lbl,x,y-14);
    // Price below x-axis
    ctx.fillStyle='#1a1714';ctx.font='10px Geist Mono, monospace';ctx.fillText(pt.price.toFixed(1),x,H-pad.b+28);
  });
  // Rango aceptable shaded
  if(pts.PMC&&pts.PME){
    ctx.fillStyle='rgba(26,122,74,0.07)';
    ctx.fillRect(px(pts.PMC.price),pad.t,px(pts.PME.price)-px(pts.PMC.price),H-pad.t-pad.b);
  }
}

async function genVWAI(){
  const{PMC,PME,OPP,IPP,stats,valid}=S.vw.res;
  const prod=document.getElementById('vw-product')?.value||(_lang==='es'?'el producto':'the product');
  const prompt=_lang==='es'
    ?`Eres experto en investigación de mercados y pricing. Van Westendorp PSM con ${valid.length} encuestados para: "${prod}". PMC=${PMC.price.toFixed(1)}, OPP=${OPP.price.toFixed(1)}, IPP=${IPP.price.toFixed(1)}, PME=${PME.price.toFixed(1)}. Rango aceptable: ${PMC.price.toFixed(1)} a ${PME.price.toFixed(1)}. Precio promedio "barato": ${stats.barato.mean}. Precio promedio "caro": ${stats.caro.mean}. Redactá 3 párrafos breves (máx 80 palabras c/u) en español: 1. Qué revelan los precios clave sobre la percepción del consumidor. 2. Rango estratégico recomendado y por qué. 3. Implicancias para la estrategia de precios (lanzamiento, reposicionamiento, comunicación). Sé concreto y contextualizado.`
    :`You are an expert in market research and pricing. Van Westendorp PSM with ${valid.length} respondents for: "${prod}". PMC=${PMC.price.toFixed(1)}, OPP=${OPP.price.toFixed(1)}, IPP=${IPP.price.toFixed(1)}, PME=${PME.price.toFixed(1)}. Acceptable range: ${PMC.price.toFixed(1)} to ${PME.price.toFixed(1)}. Average "cheap" price: ${stats.barato.mean}. Average "expensive" price: ${stats.caro.mean}. Write 3 brief paragraphs (max 80 words each) in English: 1. What the key price points reveal about consumer perception. 2. Recommended strategic range and why. 3. Implications for pricing strategy (launch, repositioning, communication). Be specific and contextualized.`;
  const result = await callAI(prompt, fallbackVW);
  showAI('vwai', result);
}
function expVW(){
  if(!S.vw.res)return;
  const{PMC,PME,OPP,IPP,stats,valid}=S.vw.res,wb=XLSX.utils.book_new();
  const pts=[[t('calc.vw.exp.col.pt'),t('calc.vw.exp.col.pr'),t('calc.vw.exp.col.desc')],
    [t('calc.vw.exp.pt1'),PMC.price.toFixed(1),t('calc.vw.exp.pt1d')],
    [t('calc.vw.exp.pt2'),OPP.price.toFixed(1),t('calc.vw.exp.pt2d')],
    [t('calc.vw.exp.pt3'),IPP.price.toFixed(1),t('calc.vw.exp.pt3d')],
    [t('calc.vw.exp.pt4'),PME.price.toFixed(1),t('calc.vw.exp.pt4d')]];
  const w1=XLSX.utils.aoa_to_sheet(pts);XLSX.utils.book_append_sheet(wb,w1,t('calc.vw.exp.sh1'));
  const srows=[[t('calc.vw.exp.col.q'),t('calc.vw.exp.col.mean'),t('calc.vw.exp.col.med'),t('calc.vw.exp.col.sd'),t('calc.vw.exp.col.min'),t('calc.vw.exp.col.max')],
    [t('calc.vw.exp.vcheap'),stats.muy_barato.mean,stats.muy_barato.median,stats.muy_barato.sd,stats.muy_barato.min,stats.muy_barato.max],
    [t('calc.vw.exp.cheap'),stats.barato.mean,stats.barato.median,stats.barato.sd,stats.barato.min,stats.barato.max],
    [t('calc.vw.exp.exp'),stats.caro.mean,stats.caro.median,stats.caro.sd,stats.caro.min,stats.caro.max],
    [t('calc.vw.exp.vexp'),stats.muy_caro.mean,stats.muy_caro.median,stats.muy_caro.sd,stats.muy_caro.min,stats.muy_caro.max]];
  const w2=XLSX.utils.aoa_to_sheet(srows);XLSX.utils.book_append_sheet(wb,w2,t('calc.vw.exp.sh2'));
  const aiT=document.getElementById('vwai')?.innerText||'';
  const w3=XLSX.utils.aoa_to_sheet([[t('calc.ai.title')],[''],...aiT.split('\n').map(l=>[l])]);XLSX.utils.book_append_sheet(wb,w3,t('calc.vw.exp.sh3'));
  const drows=[['id','muy_barato','barato','caro','muy_caro'],...valid.map(r=>[r.id||'',+r.muy_barato,+r.barato,+r.caro,+r.muy_caro])];
  const w4=XLSX.utils.aoa_to_sheet(drows);XLSX.utils.book_append_sheet(wb,w4,t('calc.vw.exp.sh4'));
  XLSX.writeFile(wb,'resultados_van_westendorp.xlsx');
}

// ══════════════════════════════════════════════════
