// NMS — Newton-Miller-Smith
// ══════════════════════════════════════════════════
function hNMDrop(e){e.preventDefault();const f=e.dataTransfer.files[0];if(f)prNMFile(f);}
function hNMFile(e){const f=e.target.files[0];if(f)prNMFile(f);}
function prNMFile(file){const r=new FileReader();r.onload=e=>{try{const wb=XLSX.read(e.target.result,{type:'binary'});S.nms.data=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);document.getElementById('nmfs').classList.remove('hid');document.getElementById('nmfst').textContent=`${file.name} — ${S.nms.data.length} encuestados.`;document.getElementById('nmab').disabled=false;}catch{alert('Error.');}};r.readAsBinaryString(file);}

function loadNMSDemo(){
  const N=120,r=rng(888);
  S.nms.data=Array.from({length:N},(_,i)=>{
    const ref=20+Math.floor(r()*30);
    const mb=Math.max(1,Math.round(ref*(0.3+r()*0.2)));
    const b=Math.round(ref*(0.6+r()*0.2));
    const c=Math.round(ref*(1.1+r()*0.3));
    const mc=Math.round(ref*(1.4+r()*0.4));
    const ib=Math.min(5,Math.max(1,Math.round(3+r()*2)));
    const ic=Math.min(5,Math.max(1,Math.round(2+r()*2)));
    return{id:i+1,muy_barato:mb,barato:Math.max(mb,b),caro:Math.max(b,c),muy_caro:Math.max(c,mc),intent_barato:ib,intent_caro:ic};
  });
  document.getElementById('nmfs').classList.remove('hid');
  document.getElementById('nmfst').textContent=`Datos demo — ${N} encuestados simulados.`;
  document.getElementById('nmab').disabled=false;
}

function analyzeNMS(){
  try{S.nms.res=computeNMS(S.nms.data,{minRows:10});}
  catch(error){if(error.code==='NMS_MIN_ROWS'){alert(`${error.validRows} ${t('calc.err.minrows')} 10.`);return;}throw error;}
  renderNMSResults();
  gNMS(3);
  genNMSAI();
}

function renderNMSResults(){
  const{PMC,PME,OPP,IPP,stats,valid,demand,revenue,maxDemand,maxRev}=S.nms.res;

  // PSM puntos
  document.getElementById('nms-pp').innerHTML=`
    <div class="pp-card" style="border-top:3px solid #c8430a"><div class="pp-label">PMC</div><div class="pp-val" style="color:#c8430a">${PMC.price.toFixed(1)}</div><div class="pp-desc">${t('calc.nms.pmc.desc')}</div></div>
    <div class="pp-card" style="border-top:3px solid #1a7a4a"><div class="pp-label">OPP</div><div class="pp-val" style="color:#1a7a4a">${OPP.price.toFixed(1)}</div><div class="pp-desc">${t('calc.nms.opp.desc')}</div></div>
    <div class="pp-card" style="border-top:3px solid #2563a8"><div class="pp-label">IPP</div><div class="pp-val" style="color:#2563a8">${IPP.price.toFixed(1)}</div><div class="pp-desc">${t('calc.nms.ipp.desc')}</div></div>
    <div class="pp-card" style="border-top:3px solid #7c3aed"><div class="pp-label">PME</div><div class="pp-val" style="color:#7c3aed">${PME.price.toFixed(1)}</div><div class="pp-desc">${t('calc.nms.pme.desc')}</div></div>`;

  // NMS optima
  document.getElementById('nms-optima').innerHTML=`
    <div class="pp-card" style="border-top:3px solid #1a7a4a;grid-column:1/3">
      <div class="pp-label">${t('calc.nms.maxtrial.label')}</div>
      <div class="pp-val" style="color:#1a7a4a">${maxDemand.price.toFixed(1)}</div>
      <div class="pp-desc">${t('calc.nms.maxtrial.desc')} (${maxDemand.demand_pct.toFixed(1)}${t('calc.nms.pctmarket')})</div>
    </div>
    <div class="pp-card" style="border-top:3px solid #7c3aed;grid-column:3/5">
      <div class="pp-label">${t('calc.nms.maxrev.label')}</div>
      <div class="pp-val" style="color:#7c3aed">${maxRev.price.toFixed(1)}</div>
      <div class="pp-desc">${t('calc.nms.maxrev.desc')} (${t('calc.nms.revindex')}: ${maxRev.rev.toFixed(0)})</div>
    </div>`;

  // PSM chart
  document.getElementById('nms-vw-legend').innerHTML=`
    <div class="vw-leg-item"><div class="vw-leg-dot" style="background:#d97706"></div>${t('calc.vw.legend.cheap')}</div>
    <div class="vw-leg-item"><div class="vw-leg-dot" style="background:#2563a8"></div>${t('calc.vw.legend.vcheap')}</div>
    <div class="vw-leg-item"><div class="vw-leg-dot" style="background:#1a7a4a"></div>${t('calc.vw.legend.exp')}</div>
    <div class="vw-leg-item"><div class="vw-leg-dot" style="background:#56cfcf"></div>${t('calc.vw.legend.vexp')}</div>`;
  drawVWChart('nms-vw-canvas',S.nms.res,{PMC,PME,OPP,IPP});

  // NMS curves
  drawNMSChart();

  // Stats
  const cols=['muy_barato','barato','caro','muy_caro'];
  const labels=[t('calc.vw.exp.vcheap'),t('calc.vw.exp.cheap'),t('calc.vw.exp.exp'),t('calc.vw.exp.vexp')];
  document.getElementById('nms-stats').innerHTML=`<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.8rem"><thead><tr style="background:var(--surface)"><th style="text-align:left;padding:.45rem .7rem;border-bottom:1px solid var(--border);font-size:.7rem;color:var(--ink3)">${t('calc.vw.stats.col.q')}</th><th style="text-align:center;padding:.45rem .7rem;border-bottom:1px solid var(--border);font-size:.7rem;color:var(--ink3)">${t('calc.vw.stats.col.mean')}</th><th style="text-align:center;padding:.45rem .7rem;border-bottom:1px solid var(--border);font-size:.7rem;color:var(--ink3)">${t('calc.vw.stats.col.med')}</th><th style="text-align:center;padding:.45rem .7rem;border-bottom:1px solid var(--border);font-size:.7rem;color:var(--ink3)">${t('calc.vw.stats.col.min')}</th><th style="text-align:center;padding:.45rem .7rem;border-bottom:1px solid var(--border);font-size:.7rem;color:var(--ink3)">${t('calc.vw.stats.col.max')}</th></tr></thead><tbody>${cols.map((k,i)=>`<tr style="border-bottom:1px solid var(--border)"><td style="padding:.42rem .7rem">${labels[i]}</td><td style="padding:.42rem .7rem;text-align:center;font-family:'Geist Mono',monospace">${stats[k].mean}</td><td style="padding:.42rem .7rem;text-align:center;font-family:'Geist Mono',monospace">${stats[k].median}</td><td style="padding:.42rem .7rem;text-align:center;font-family:'Geist Mono',monospace">${stats[k].min}</td><td style="padding:.42rem .7rem;text-align:center;font-family:'Geist Mono',monospace">${stats[k].max}</td></tr>`).join('')}</tbody></table></div>`;

  renderOutlierBlock('nms-outliers',valid,cols,labels);
}

function drawNMSChart(canvasId){
  canvasId=canvasId||'nms-canvas';
  const canvas=document.getElementById(canvasId);if(!canvas)return;
  const{demand,revenue,maxDemand,maxRev}=S.nms.res;
  const ctx=canvas.getContext('2d');
  const W=canvas.offsetWidth||700,H=canvas.offsetHeight||260;
  canvas.width=W;canvas.height=H;
  const pad={l:50,r:55,t:20,b:40};
  const prices=demand.map(d=>d.price);
  const minP=prices[0],maxP=prices[prices.length-1];
  const maxD=Math.max(...demand.map(d=>d.demand_pct));
  const maxR=Math.max(...revenue.map(r=>r.rev));
  const px=p=>pad.l+(p-minP)/(maxP-minP)*(W-pad.l-pad.r);
  const pyD=v=>H-pad.b-v/100*(H-pad.t-pad.b);
  const pyR=v=>H-pad.b-v/maxR*(H-pad.t-pad.b);
  ctx.clearRect(0,0,W,H);
  // Grid
  ctx.strokeStyle='#e2ddd4';ctx.lineWidth=1;
  for(let g=0;g<=100;g+=25){const y=pyD(g);ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();}
  // Axis labels left
  ctx.fillStyle='#8a8278';ctx.font='10px Geist, sans-serif';ctx.textAlign='right';
  for(let g=0;g<=100;g+=25){ctx.fillText(g+'%',pad.l-5,pyD(g)+4);}
  ctx.textAlign='center';
  const step=Math.max(1,Math.round((maxP-minP)/6));
  for(let p=Math.ceil(minP/step)*step;p<=maxP;p+=step){ctx.fillText(p,px(p),H-pad.b+16);}
  // Demand curve
  ctx.beginPath();ctx.strokeStyle='#1a7a4a';ctx.lineWidth=2.5;ctx.setLineDash([]);
  demand.forEach((d,i)=>{i===0?ctx.moveTo(px(d.price),pyD(d.demand_pct)):ctx.lineTo(px(d.price),pyD(d.demand_pct));});
  ctx.stroke();
  // Revenue curve (scaled)
  ctx.beginPath();ctx.strokeStyle='#7c3aed';ctx.lineWidth=2.5;ctx.setLineDash([5,4]);
  revenue.forEach((d,i)=>{i===0?ctx.moveTo(px(d.price),pyR(d.rev)):ctx.lineTo(px(d.price),pyR(d.rev));});
  ctx.stroke();ctx.setLineDash([]);
  // Mark max demand
  ctx.beginPath();ctx.fillStyle='#1a7a4a';ctx.arc(px(maxDemand.price),pyD(maxDemand.demand_pct),5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#1a7a4a';ctx.font='bold 10px Geist, sans-serif';ctx.textAlign='center';ctx.fillText(t('calc.nms.chart.maxtrial'),px(maxDemand.price),pyD(maxDemand.demand_pct)-12);
  ctx.fillText(maxDemand.price.toFixed(0),px(maxDemand.price),pyD(maxDemand.demand_pct)+18);
  // Mark max revenue
  ctx.beginPath();ctx.fillStyle='#7c3aed';ctx.arc(px(maxRev.price),pyR(maxRev.rev),5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#7c3aed';ctx.textAlign='center';ctx.fillText(t('calc.nms.chart.maxrev'),px(maxRev.price),pyR(maxRev.rev)-12);
  ctx.fillText(maxRev.price.toFixed(0),px(maxRev.price),pyR(maxRev.rev)+18);
  // Legend
  ctx.fillStyle='#1a7a4a';ctx.fillRect(W-pad.r-100,pad.t,20,3);ctx.fillStyle='#4a453f';ctx.font='10px Geist, sans-serif';ctx.textAlign='left';ctx.fillText(t('calc.nms.chart.demand'),W-pad.r-75,pad.t+6);
  ctx.strokeStyle='#7c3aed';ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(W-pad.r-100,pad.t+16);ctx.lineTo(W-pad.r-80,pad.t+16);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#4a453f';ctx.fillText(t('calc.nms.chart.revenue'),W-pad.r-75,pad.t+20);
}

async function genNMSAI(){
  const{PMC,PME,OPP,IPP,maxDemand,maxRev,valid}=S.nms.res;
  const prod=document.getElementById('nms-product')?.value||(_lang==='es'?'el producto':'the product');
  const prompt=_lang==='es'
    ?`Eres experto en pricing e investigación de mercados, especializado en Van Westendorp con extensión Newton-Miller-Smith (NMS). Estudio con ${valid.length} encuestados para: "${prod}". PSM: PMC=${PMC.price.toFixed(1)}, OPP=${OPP.price.toFixed(1)}, IPP=${IPP.price.toFixed(1)}, PME=${PME.price.toFixed(1)}. NMS: Precio máximo trial=${maxDemand.price.toFixed(1)} (${maxDemand.demand_pct.toFixed(1)}% compraría), Precio máximo revenue=${maxRev.price.toFixed(1)}. Redactá 3 párrafos breves (máx 85 palabras c/u) en español: 1. Qué revela el PSM sobre el rango aceptable. 2. Qué agregan las curvas NMS: cuándo priorizar volumen vs. revenue. 3. Recomendación estratégica considerando ambas metodologías. Sé concreto y contextualizado.`
    :`You are an expert in pricing and market research, specialized in Van Westendorp with the Newton-Miller-Smith (NMS) extension. Study with ${valid.length} respondents for: "${prod}". PSM: PMC=${PMC.price.toFixed(1)}, OPP=${OPP.price.toFixed(1)}, IPP=${IPP.price.toFixed(1)}, PME=${PME.price.toFixed(1)}. NMS: Maximum trial price=${maxDemand.price.toFixed(1)} (${maxDemand.demand_pct.toFixed(1)}% would buy), Maximum revenue price=${maxRev.price.toFixed(1)}. Write 3 brief paragraphs (max 85 words each) in English: 1. What the PSM reveals about the acceptable range. 2. What the NMS curves add: when to prioritize volume vs. revenue. 3. Strategic recommendation considering both methodologies. Be specific and contextualized.`;
  const result = await callAI(prompt, fallbackNMS);
  showAI('nmai', result);
}
function expNMS(){
  if(!S.nms.res)return;
  const{PMC,PME,OPP,IPP,stats,valid,demand,revenue,maxDemand,maxRev}=S.nms.res,wb=XLSX.utils.book_new();
  const pts=[[t('calc.vw.exp.col.pt'),t('calc.vw.exp.col.pr'),t('calc.vw.exp.col.desc')],
    ['PMC',PMC.price.toFixed(1),t('calc.nms.exp.pt1d')],
    ['OPP',OPP.price.toFixed(1),t('calc.nms.exp.pt2d')],
    ['IPP',IPP.price.toFixed(1),t('calc.nms.exp.pt3d')],
    ['PME',PME.price.toFixed(1),t('calc.nms.exp.pt4d')],
    [''],
    [`${t('calc.nms.chart.maxtrial')} (NMS)`,maxDemand.price.toFixed(1),t('calc.nms.exp.maxtriald')],
    [`${t('calc.nms.chart.maxrev')} (NMS)`,maxRev.price.toFixed(1),t('calc.nms.exp.maxrevd')]];
  const w1=XLSX.utils.aoa_to_sheet(pts);XLSX.utils.book_append_sheet(wb,w1,t('calc.nms.exp.sh1'));
  const drows=[[t('calc.nms.exp.col.pr'),t('calc.nms.exp.col.dem'),t('calc.nms.exp.col.rev')],...demand.map((d,i)=>[d.price,d.demand_pct.toFixed(1),revenue[i].rev.toFixed(1)])];
  const w2=XLSX.utils.aoa_to_sheet(drows);XLSX.utils.book_append_sheet(wb,w2,t('calc.nms.exp.sh2'));
  const aiT=document.getElementById('nmai')?.innerText||'';
  const w3=XLSX.utils.aoa_to_sheet([[`${t('calc.ai.title').toUpperCase()} — NMS`],[''],...aiT.split('\n').map(l=>[l])]);XLSX.utils.book_append_sheet(wb,w3,t('calc.nms.exp.sh3'));
  const drows2=[['id','muy_barato','barato','caro','muy_caro','intent_barato','intent_caro'],...valid.map(r=>[r.id||'',+r.muy_barato,+r.barato,+r.caro,+r.muy_caro,+r.intent_barato,+r.intent_caro])];
  const w4=XLSX.utils.aoa_to_sheet(drows2);XLSX.utils.book_append_sheet(wb,w4,t('calc.nms.exp.sh4'));
  XLSX.writeFile(wb,'resultados_nms.xlsx');
}

// ══════════════════════════════════════════════════
