// TURF ANALYSIS
// ══════════════════════════════════════════════════

function gTURF(n){
  document.querySelectorAll('#mod-turf .sp').forEach(p=>p.classList.remove('act'));
  document.getElementById('ts'+n).classList.add('act');
  for(let i=1;i<=3;i++){const w=document.getElementById('tw'+i);w.classList.remove('act','dn');if(i<n)w.classList.add('dn');if(i===n)w.classList.add('act');}
}

function onTURFTypeChange(){
  const t=document.getElementById('turf-type').value;
  document.getElementById('turf-threshold-cfg').classList.toggle('hid',t!=='threshold');
  document.getElementById('turf-weighted-cfg').classList.toggle('hid',t!=='weighted');
}

// ── FILE HANDLING ──────────────────────────────────
function hTURFDrop(e){e.preventDefault();const f=e.dataTransfer.files[0];if(f)prTURFFile(f);}
function hTURFFile(e){const f=e.target.files[0];if(f)prTURFFile(f);}
function prTURFFile(file){
  const r=new FileReader();
  r.onload=e=>{
    try{
      let data;
      if(file.name.endsWith('.csv')){
        data=parseCSV(e.target.result);
      } else {
        const wb=XLSX.read(e.target.result,{type:'binary'});
        data=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      }
      setTURFData(data,file.name);
    }catch(err){alert(t('calc.turf.err.readfile')+' '+err.message);}
  };
  if(file.name.endsWith('.csv'))r.readAsText(file);
  else r.readAsBinaryString(file);
}

function parseCSV(text){
  const lines=text.trim().split('\n');
  const headers=lines[0].split(',').map(h=>h.trim().replace(/^"|"$/g,''));
  return lines.slice(1).map(line=>{
    const vals=line.split(',').map(v=>v.trim().replace(/^"|"$/g,''));
    const row={};headers.forEach((h,i)=>row[h]=vals[i]||'');
    return row;
  });
}

function setTURFData(data,fname){
  if(!data||data.length<2){alert(t('calc.turf.err.minrows'));return;}
  const cols=Object.keys(data[0]);
  // Primera columna = ID, resto = ítems
  const items=cols.slice(1);
  if(items.length<2){alert(t('calc.turf.err.min2items'));return;}
  // Convertir valores a números
  const matrix=data.map(row=>({id:row[cols[0]],values:items.map(it=>parseFloat(row[it])||0)}));
  S.turf.data=matrix;
  S.turf.items=items;
  document.getElementById('turf-fs').classList.remove('hid');
  document.getElementById('turf-fst').textContent=`${fname||'Archivo cargado'} — ${matrix.length} encuestados · ${items.length} ítems`;
  document.getElementById('turf-next1').disabled=false;
}

// ── IMPORT FROM MAXDIFF ────────────────────────────
function loadFromMaxDiff(){
  const st=document.getElementById('turf-md-status');
  if(!S.m.res||!S.m.res.indivScores){
    st.textContent=t('calc.turf.md.status.norun');
    st.style.color='var(--r)';return;
  }
  const items=S.m.items;
  const scores=S.m.res.indivScores;

  // Usar puntajes NETOS (best - worst) sin normalizar
  // Son valores centrados en cero: positivo = preferido, negativo = no preferido
  // Esto es lo correcto para TURF weighted por probabilidad (Orme 2025)
  const matrix=scores.map(row=>({id:row.id,values:row.net}));
  S.turf.data=matrix;
  S.turf.items=items;

  // Configurar automáticamente para MaxDiff
  document.getElementById('turf-type').value='weighted';
  onTURFTypeChange();
  // Usar MaxDiff no anclado con umbral 0.6 (más discriminativo para datos MaxDiff)
  document.getElementById('turf-anchor-type').value='standard';
  document.getElementById('turf-items-per-set').value=
    S.m.design[0]?.[0]?.length||4;
  document.getElementById('turf-prob-threshold').value='0.6';

  st.textContent=`✓ ${scores.length} ${t('calc.turf.md.status.imported')} · ${items.length} ${t('calc.turf.md.status.importedtail')}`;
  st.style.color='var(--g)';
  document.getElementById('turf-next1').disabled=false;
  document.getElementById('turf-fs').classList.remove('hid');
  document.getElementById('turf-fst').textContent=
    `${t('calc.turf.md.imported.filetext')} ${scores.length} ${t('calc.turf.summary.respondents')} · ${items.length} ${t('calc.turf.summary.items')} · ${t('calc.turf.type.weightedword')}`;
}

// ── DEMO DATA ──────────────────────────────────────
function loadTURFDemo(){
  const items=['Velocidad de entrega','Variedad restaurantes','Precio delivery','Seguimiento tiempo real','Atención 24/7','Descuentos y promos','Facilidad de uso','Calidad alimentos','Opciones de pago','Reseñas verificadas','Programa de puntos','Empaque ecológico'];
  const N=80,r=rng(321);
  const nItems=items.length;

  // Popularidad base de cada ítem (% que lo elegiría individualmente)
  // Realista: ningún ítem alcanza a todos, hay variación significativa
  const basePop=[0.65,0.58,0.70,0.45,0.40,0.62,0.72,0.55,0.50,0.38,0.35,0.28];

  // Crear 3 segmentos latentes con preferencias distintas
  const segments=[
    {size:0.40, weights:[0.9,0.5,0.6,0.7,0.3,0.5,0.8,0.6,0.5,0.3,0.2,0.2]}, // orientados a velocidad
    {size:0.35, weights:[0.4,0.7,0.9,0.3,0.5,0.8,0.6,0.7,0.6,0.5,0.4,0.3]}, // orientados a precio
    {size:0.25, weights:[0.5,0.6,0.4,0.5,0.7,0.5,0.7,0.8,0.6,0.7,0.6,0.5]}  // orientados a calidad
  ];

  const matrix=Array.from({length:N},(_,i)=>{
    // Asignar segmento
    const segRand=r();
    let seg=segments[0];
    let cum=0;
    for(const s of segments){cum+=s.size;if(segRand<cum){seg=s;break;}}
    // Cada encuestado elige ~3-5 ítems según su segmento
    const values=seg.weights.map(w=>r()<w*0.7?1:0); // *0.7 para reducir densidad
    return{id:i+1,values};
  });

  S.turf.data=matrix;S.turf.items=items;
  document.getElementById('turf-fs').classList.remove('hid');
  document.getElementById('turf-fst').textContent=`Datos demo — ${N} encuestados · ${items.length} ítems (binario, 3 segmentos latentes)`;
  document.getElementById('turf-next1').disabled=false;
}

// ── MAIN TURF CALCULATION ──────────────────────────
function runTURF(){
  const{data,items}=S.turf;
  if(!data){alert(t('calc.turf.err.noloaddata'));return;}

  const type=document.getElementById('turf-type').value;
  const kmax=parseInt(document.getElementById('turf-kmax').value);
  const topN=parseInt(document.getElementById('turf-top-n').value);
  const optimizeBy=document.getElementById('turf-optimize-by').value;
  const threshold=parseFloat(document.getElementById('turf-threshold-val').value)||0.5;
  const anchored=document.getElementById('turf-anchor-type').value==='anchored';
  const a=parseInt(document.getElementById('turf-items-per-set').value)||4;
  const probThreshold=parseFloat(document.getElementById('turf-prob-threshold').value)||0.3;
  const N=data.length;
  const nItems=items.length;

  // Actualizar resumen de datos
  document.getElementById('turf-data-summary').textContent=
    `${N} ${t('calc.turf.summary.respondents')} · ${nItems} ${t('calc.turf.summary.items')} · ${t('calc.turf.summary.type')} ${type==='binary'?t('calc.turf.type.binaryword'):type==='threshold'?t('calc.turf.type.thresholdword')+threshold+')':t('calc.turf.type.weightedword')}`;

  S.turf.res=computeTURF(data,items,{type,kmax,topN,optimizeBy,threshold,anchored,itemsPerSet:a,probabilityThreshold:probThreshold});
  renderTURFResults();
  gTURF(3);
  genTURFAI();
  // Lanzar Shapley en background (no bloquea la UI)
  setTimeout(()=>runShapley(),200);
}

// ── RENDER RESULTS ─────────────────────────────────
function renderTURFResults(){
  const{topResults,bestByK,overlap,N}=S.turf.res;
  const items=S.turf.items;
  const best=bestByK[bestByK.length-1]?.best;

  // Portafolio óptimo destacado
  const optDiv=document.getElementById('turf-optimal-display');
  const optPortfolio=best?.combo.map(j=>items[j])||[];
  optDiv.innerHTML=`
    <div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1rem">
      ${optPortfolio.map((it,i)=>`<div class="turf-item-tag"><span class="turf-rank-badge">${i+1}</span>${it}</div>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem">
      <div style="text-align:center;background:var(--tl);border-radius:6px;padding:.75rem">
        <div style="font-family:'Geist Mono',monospace;font-size:1.4rem;font-weight:700;color:var(--t)">${best?.reachPct.toFixed(1)}%</div>
        <div style="font-size:.72rem;color:var(--ink3);margin-top:.2rem">Reach</div>
      </div>
      <div style="text-align:center;background:var(--surface);border-radius:6px;padding:.75rem">
        <div style="font-family:'Geist Mono',monospace;font-size:1.4rem;font-weight:700;color:var(--ink)">${best?.reach}</div>
        <div style="font-size:.72rem;color:var(--ink3);margin-top:.2rem">${t('calc.turf.reached.label')}</div>
      </div>
      <div style="text-align:center;background:var(--surface);border-radius:6px;padding:.75rem">
        <div style="font-family:'Geist Mono',monospace;font-size:1.4rem;font-weight:700;color:var(--ink)">${best?.avgFreq.toFixed(2)}</div>
        <div style="font-size:.72rem;color:var(--ink3);margin-top:.2rem">${t('calc.turf.avgfreq.label')}</div>
      </div>
    </div>`;

  // Curva marginal
  const mc=document.getElementById('turf-marginal-curve');mc.innerHTML='';
  const maxR=Math.max(...bestByK.map(b=>b.best.reachPct));
  let prevR=0;
  bestByK.forEach(({k,best})=>{
    const delta=best.reachPct-prevR;
    const row=document.createElement('div');row.className='marginal-bar';
    row.innerHTML=`<div class="marginal-label">k = ${k} ${k>1?t('calc.turf.itemword.plural'):t('calc.turf.itemword.singular')}</div>
      <div class="marginal-track"><div class="marginal-fill" style="width:${best.reachPct/maxR*100}%">${best.reachPct>8?best.reachPct.toFixed(1)+'%':''}</div></div>
      <div class="marginal-val">${best.reachPct.toFixed(1)}%</div>
      <div class="marginal-delta">${k>1?'+'+delta.toFixed(1)+'%':'—'}</div>`;
    mc.appendChild(row);
    prevR=best.reachPct;
  });

  // Ranking tabla
  const rt=document.getElementById('turf-ranking-table');
  const hdr=`<table style="border-collapse:collapse;font-size:.76rem;width:100%">
    <thead><tr style="background:var(--surface)">
      <th style="padding:.4rem .6rem;border:1px solid var(--border);font-size:.68rem;color:var(--ink3);text-align:center">#</th>
      <th style="padding:.4rem .6rem;border:1px solid var(--border);font-size:.68rem;color:var(--ink3);text-align:left">${t('calc.turf.col.portfolio')}</th>
      <th style="padding:.4rem .6rem;border:1px solid var(--border);font-size:.68rem;color:var(--ink3);text-align:center">k</th>
      <th style="padding:.4rem .6rem;border:1px solid var(--border);font-size:.68rem;color:var(--ink3);text-align:center">Reach</th>
      <th style="padding:.4rem .6rem;border:1px solid var(--border);font-size:.68rem;color:var(--ink3);text-align:center">Reach %</th>
      <th style="padding:.4rem .6rem;border:1px solid var(--border);font-size:.68rem;color:var(--ink3);text-align:center">Frequency</th>
      <th style="padding:.4rem .6rem;border:1px solid var(--border);font-size:.68rem;color:var(--ink3);text-align:center">Avg. Freq.</th>
    </tr></thead><tbody>
    ${topResults.map((r,idx)=>`<tr class="${idx===0?'turf-portfolio-highlight':''}">
      <td style="padding:.38rem .6rem;border:1px solid var(--border);text-align:center;font-family:'Geist Mono',monospace;font-size:.68rem;color:${idx===0?'var(--t)':'var(--ink3)'}">${idx+1}</td>
      <td style="padding:.38rem .6rem;border:1px solid var(--border);font-size:.75rem">${r.combo.map(j=>`<span style="display:inline-block;background:var(--tl);color:var(--t);border-radius:3px;padding:.1rem .35rem;margin:.1rem;font-size:.7rem">${items[j]}</span>`).join('')}</td>
      <td style="padding:.38rem .6rem;border:1px solid var(--border);text-align:center;font-family:'Geist Mono',monospace">${r.k}</td>
      <td style="padding:.38rem .6rem;border:1px solid var(--border);text-align:center;font-family:'Geist Mono',monospace">${r.reach}</td>
      <td style="padding:.38rem .6rem;border:1px solid var(--border);text-align:center;font-family:'Geist Mono',monospace;font-weight:600">${r.reachPct.toFixed(1)}%</td>
      <td style="padding:.38rem .6rem;border:1px solid var(--border);text-align:center;font-family:'Geist Mono',monospace">${r.freq}</td>
      <td style="padding:.38rem .6rem;border:1px solid var(--border);text-align:center;font-family:'Geist Mono',monospace">${r.avgFreq.toFixed(2)}</td>
    </tr>`).join('')}
    </tbody></table>`;
  rt.innerHTML=hdr;

  // Matriz de solapamiento
  const om=document.getElementById('turf-overlap-matrix');
  // Solo mostrar si hay ≤ 12 ítems para que sea legible
  if(items.length<=12){
    const shortNames=items.map(it=>it.length>12?it.substring(0,12)+'…':it);
    let tbl=`<table style="border-collapse:collapse;font-size:.68rem"><thead><tr>
      <th style="padding:.3rem .45rem;border:1px solid var(--border);background:var(--surface)"></th>
      ${shortNames.map(n=>`<th style="padding:.3rem .45rem;border:1px solid var(--border);background:var(--surface);text-align:center;max-width:70px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${items[shortNames.indexOf(n)]}">${n}</th>`).join('')}
    </tr></thead><tbody>`;
    items.forEach((it,i)=>{
      tbl+=`<tr><td style="padding:.3rem .45rem;border:1px solid var(--border);background:var(--surface);font-size:.68rem;white-space:nowrap">${shortNames[i]}</td>`;
      items.forEach((_,j)=>{
        const v=overlap[i][j];
        const bg=i===j?'#f5f2eb':v>50?'#fecaca':v>25?'#fef3c7':'#d1fae5';
        tbl+=`<td style="padding:.3rem .45rem;border:1px solid var(--border);background:${bg};text-align:center;font-family:'Geist Mono',monospace">${i===j?'—':v+'%'}</td>`;
      });
      tbl+='</tr>';
    });
    tbl+='</tbody></table>';
    om.innerHTML=tbl;
  } else {
    om.innerHTML=`<div class="nt nti"><span class="ni">ℹ</span><span>${t('calc.turf.overlap.toomany.prefix')} ${items.length} ${t('calc.turf.overlap.toomany.suffix')}</span></div>`;
  }
}

// ── TURF AI ────────────────────────────────────────
async function genTURFAI(){
  const{topResults,bestByK,N}=S.turf.res;
  const items=S.turf.items;
  const best=bestByK[bestByK.length-1]?.best;
  const optPortfolio=best?.combo.map(j=>items[j]).join(', ');
  const type=document.getElementById('turf-type').value;
  const k=best?.k||'?';

  const prompt=_lang==='es'
    ?`Eres experto en investigación de mercados y análisis TURF con Shapley Values. Estudio con ${N} encuestados evaluando ${items.length} ítems. Tipo: ${type==='binary'?'binario clásico':type==='threshold'?'por umbral':'ponderado por probabilidad (MaxDiff)'}. Portafolio óptimo (k=${k}): ${optPortfolio}. Reach: ${best?.reachPct.toFixed(1)}% (${best?.reach}/${N} encuestados). Frecuencia promedio: ${best?.avgFreq.toFixed(2)}. Curva marginal: ${bestByK.map(b=>`k=${b.k}: ${b.best.reachPct.toFixed(1)}%`).join(', ')}. Redactá 3 párrafos breves (máx 80 palabras c/u) en español: 1. Por qué este portafolio maximiza el alcance y qué significa estratégicamente. 2. Qué revela la curva marginal sobre el punto óptimo de tamaño del portafolio. 3. Cómo usar estos resultados junto con los Shapley Values para tomar decisiones de producto, comunicación o distribución. Sé concreto y orientado a la acción.`
    :`You are an expert in market research and TURF analysis with Shapley Values. Study with ${N} respondents evaluating ${items.length} items. Type: ${type==='binary'?'classic binary':type==='threshold'?'by threshold':'probability-weighted (MaxDiff)'}. Optimal portfolio (k=${k}): ${optPortfolio}. Reach: ${best?.reachPct.toFixed(1)}% (${best?.reach}/${N} respondents). Average frequency: ${best?.avgFreq.toFixed(2)}. Marginal curve: ${bestByK.map(b=>`k=${b.k}: ${b.best.reachPct.toFixed(1)}%`).join(', ')}. Write 3 brief paragraphs (max 80 words each) in English: 1. Why this portfolio maximizes reach and what it means strategically. 2. What the marginal curve reveals about the optimal portfolio size. 3. How to use these results together with the Shapley Values to make product, communication, or distribution decisions. Be concrete and action-oriented.`;

  const result=await callAI(prompt,()=>{
    return _lang==='es'
      ?`El portafolio óptimo de <strong>${k} ítems</strong> (${optPortfolio}) maximiza el alcance no duplicado porque cada ítem incorporado llega a consumidores que los anteriores no cubren. Con un reach de ${best?.reachPct.toFixed(1)}%, esta combinación representa la cobertura más eficiente posible del mercado estudiado.\n\nLa curva de ganancia marginal muestra cómo cada ítem adicional aporta incrementos decrecientes al reach total. El punto de quiebre indica dónde agregar más ítems deja de ser rentable — una guía clave para decisiones de portafolio con presupuesto limitado.\n\nLos Shapley Values complementan este análisis identificando qué ítem del portafolio es más indispensable y cuáles tienen alta redundancia con otros. Esta información permite no solo definir el portafolio óptimo, sino también priorizar inversiones de desarrollo, comunicación y distribución según la contribución real de cada elemento al alcance total.`
      :`The optimal portfolio of <strong>${k} items</strong> (${optPortfolio}) maximizes non-duplicated reach because each added item reaches consumers not covered by the previous ones. With a reach of ${best?.reachPct.toFixed(1)}%, this combination represents the most efficient possible coverage of the market studied.\n\nThe marginal gain curve shows how each additional item contributes decreasing increments to total reach. The breakpoint indicates where adding more items stops being worthwhile — a key guide for portfolio decisions under a limited budget.\n\nThe Shapley Values complement this analysis by identifying which portfolio item is most indispensable and which have high redundancy with others. This information not only helps define the optimal portfolio but also prioritize development, communication, and distribution investments based on each element's real contribution to total reach.`;
  });
  showAI('turfai',result);
}

// ── TURF EXPORT ────────────────────────────────────
function expTURF(){
  if(!S.turf.res)return;
  const{topResults,bestByK,overlap,N}=S.turf.res;
  const items=S.turf.items;
  const wb=XLSX.utils.book_new();

  // Portafolios óptimos por k
  const optRows=[[t('calc.turf.exp.col.k'),t('calc.turf.exp.col.optimal'),t('calc.turf.exp.col.reach'),t('calc.turf.exp.col.reachpct'),t('calc.turf.exp.col.freq'),t('calc.turf.exp.col.avgfreq')]];
  bestByK.forEach(({k,best})=>{
    optRows.push([k,best.combo.map(j=>items[j]).join(' + '),best.reach,best.reachPct.toFixed(1)+'%',best.freq,best.avgFreq.toFixed(2)]);
  });
  const w1=XLSX.utils.aoa_to_sheet(optRows);w1['!cols']=[{wch:4},{wch:60},{wch:8},{wch:10},{wch:12},{wch:14}];
  XLSX.utils.book_append_sheet(wb,w1,t('calc.turf.exp.sheet.optimal'));

  // Top ranking
  const rankRows=[[t('calc.turf.exp.col.rank'),t('calc.turf.col.portfolio'),t('calc.turf.exp.col.k'),t('calc.turf.exp.col.reach'),t('calc.turf.exp.col.reachpct'),t('calc.turf.exp.col.freq'),t('calc.turf.exp.col.avgfreq')]];
  topResults.forEach((r,i)=>{
    rankRows.push([i+1,r.combo.map(j=>items[j]).join(' + '),r.k,r.reach,r.reachPct.toFixed(1)+'%',r.freq,r.avgFreq.toFixed(2)]);
  });
  const w2=XLSX.utils.aoa_to_sheet(rankRows);w2['!cols']=[{wch:4},{wch:60},{wch:4},{wch:8},{wch:10},{wch:12},{wch:14}];
  XLSX.utils.book_append_sheet(wb,w2,t('calc.turf.exp.sheet.ranking'));

  // Solapamiento
  const overlapRows=[[t('calc.turf.exp.col.item'),...items],...items.map((it,i)=>[it,...items.map((_,j)=>i===j?'—':overlap[i][j]+'%')])];
  const w3=XLSX.utils.aoa_to_sheet(overlapRows);
  XLSX.utils.book_append_sheet(wb,w3,t('calc.turf.exp.sheet.overlap'));

  // Shapley portafolio
  if(S.turf.res.shapleyPortfolio){
    const spRows=[[t('calc.turf.exp.col.item'),t('calc.turf.exp.shapley.col.pp'),t('calc.turf.exp.shapley.col.rel'),t('calc.turf.exp.shapley.col.interp')]];
    S.turf.res.shapleyPortfolio.forEach(r=>{
      spRows.push([r.name,r.shPct.toFixed(2),r.shRel.toFixed(1)+'%',r.shRel>=33?t('calc.turf.exp.shapley.high'):r.shRel>=15?t('calc.turf.exp.shapley.med'):t('calc.turf.exp.shapley.low')]);
    });
    spRows.push(['','','','']);
    spRows.push([`${t('calc.turf.exp.shapley.ref')} Orme, B. (2025). Understanding Item Contribution in TURF Analysis. Sawtooth Software.`,'','','']);
    const ws=XLSX.utils.aoa_to_sheet(spRows);ws['!cols']=[{wch:35},{wch:18},{wch:18},{wch:35}];
    XLSX.utils.book_append_sheet(wb,ws,t('calc.turf.exp.sheet.shapleyport'));
  }

  // Shapley generalizado
  if(S.turf.res.shapleyGeneral){
    const sgRows=[[t('calc.turf.exp.sg.col.rank'),t('calc.turf.exp.col.item'),t('calc.turf.exp.sg.col.pct'),t('calc.turf.exp.sg.col.score'),t('calc.turf.exp.sg.col.class')]];
    S.turf.res.shapleyGeneral.forEach((r,i)=>{
      const clasif=r.status==='above'?t('calc.turf.exp.sg.unique'):r.status==='below'?t('calc.turf.exp.sg.redundant'):t('calc.turf.exp.sg.neutral');
      sgRows.push([i+1,r.it,r.pct.toFixed(1)+'%',r.score.toFixed(1)+'%',clasif]);
    });
    sgRows.push(['',t('calc.md.total'),S.turf.res.shapleyGeneral.reduce((s,r)=>s+r.pct,0).toFixed(1)+'%','','']);
    sgRows.push(['','','','','']);
    sgRows.push([`${t('calc.turf.exp.shapley.ref')} Orme, B. (2025). Understanding Item Contribution in TURF Analysis. Sawtooth Software.`,'','','','']);
    const ws2=XLSX.utils.aoa_to_sheet(sgRows);ws2['!cols']=[{wch:6},{wch:35},{wch:14},{wch:16},{wch:30}];
    XLSX.utils.book_append_sheet(wb,ws2,t('calc.turf.exp.sheet.shapleygen'));
  }

  // Conclusiones IA
  const aiT=document.getElementById('turfai')?.innerText||'';
  const w4=XLSX.utils.aoa_to_sheet([[`${t('calc.ai.title').toUpperCase()} — TURF Analysis`],[''],...aiT.split('\n').map(l=>[l])]);
  w4['!cols']=[{wch:100}];XLSX.utils.book_append_sheet(wb,w4,'Conclusiones IA');

  XLSX.writeFile(wb,'resultados_turf_shapley.xlsx');
}

// ══════════════════════════════════════════════════
// SHAPLEY VALUES — TURF ANALYSIS
// Ref: Orme, B. (2025). Understanding Item Contribution in TURF Analysis.
//      Sawtooth Software Research Paper Series.
// ══════════════════════════════════════════════════

// ── RENDER SHAPLEY PORTFOLIO ──────────────────────
function renderShapleyPortfolio(portfolio, shapleyVals, reachPct, items, exact){
  const loading=document.getElementById('shapley-portfolio-loading');
  const result=document.getElementById('shapley-portfolio-result');
  loading.classList.add('hid');result.classList.remove('hid');

  const k=portfolio.length;
  const totalShapley=shapleyVals.reduce((a,b)=>a+b,0)||1;
  // Normalizar a % del reach total del portafolio
  const shapleyPct=shapleyVals.map(s=>s/totalShapley*reachPct);
  // También como % relativo entre sí (suma 100%)
  const shapleyRel=shapleyVals.map(s=>s/totalShapley*100);

  const colors=['#c8430a','#2563a8','#1a7a4a','#8b5cf6','#d97706','#ec4899'];
  const maxS=Math.max(...shapleyPct)||1;

  let html=`<div class="nt" style="background:var(--tl);color:var(--t);border:1px solid #fde68a;margin-bottom:.9rem">
    <span class="ni">${exact?'✓':'≈'}</span>
    <span>${exact?`${t('calc.turf.shapley.exactall')} ${k<=8?t('calc.turf.shapley.allof')+' '+Math.round(Array.from({length:k},(_,i)=>i+1).reduce((a,b)=>a*b,1))+' '+t('calc.turf.shapley.permutations'):t('calc.turf.shapley.exactperms')}.`:t('calc.turf.shapley.sampled')}</span>
  </div>
  <div style="margin-bottom:1rem">`;

  // Ordenar por shapley desc para visualización
  const sorted=[...portfolio.map((idx,i)=>({idx,name:items[idx],shPct:shapleyPct[i],shRel:shapleyRel[i]}))]
    .sort((a,b)=>b.shPct-a.shPct);

  sorted.forEach((item,i)=>{
    html+=`<div class="shapley-bar-row">
      <div class="shapley-label" title="${item.name}">${item.name}</div>
      <div class="shapley-track"><div class="shapley-fill" style="width:${item.shPct/reachPct*100}%;background:${colors[i%colors.length]}">${item.shPct>3?item.shPct.toFixed(1)+'%':''}</div></div>
      <div class="shapley-val">${item.shPct.toFixed(1)}%</div>
      <div class="shapley-val" style="color:var(--ink3);font-size:.68rem">(${item.shRel.toFixed(1)}%)</div>
    </div>`;
  });

  // Total
  html+=`<div class="shapley-bar-row" style="margin-top:.5rem;padding-top:.5rem;border-top:1px solid var(--border)">
    <div class="shapley-label" style="font-weight:600;color:var(--ink)">${t('calc.turf.shapley.reachtotal')}</div>
    <div class="shapley-track"><div class="shapley-fill" style="width:100%;background:#1a1714">${reachPct.toFixed(1)}%</div></div>
    <div class="shapley-val" style="font-weight:600">${reachPct.toFixed(1)}%</div>
    <div class="shapley-val" style="color:var(--ink3);font-size:.68rem">(100%)</div>
  </div>`;
  html+='</div>';

  // Insight sobre el ítem más y menos indispensable
  const topItem=sorted[0],botItem=sorted[sorted.length-1];
  html+=`<div class="shapley-insight">
    <strong>${topItem.name}</strong> ${t('calc.turf.shapley.top.suffix')} ${topItem.shPct.toFixed(1)} ${t('calc.turf.shapley.top.pp')} 
    <strong>${botItem.name}</strong> ${t('calc.turf.shapley.bot.suffix')} (${botItem.shPct.toFixed(1)}%) ${t('calc.turf.shapley.bot.tail')}
  </div>`;

  result.innerHTML=html;
  S.turf.res.shapleyPortfolio=sorted;
}

// ── RENDER SHAPLEY GENERAL ────────────────────────
function renderShapleyGeneral(pct, avgScores, items){
  const loading=document.getElementById('shapley-general-loading');
  const result=document.getElementById('shapley-general-result');
  const scatterWrap=document.getElementById('shapley-scatter-wrap');
  loading.classList.add('hid');result.classList.remove('hid');scatterWrap.classList.remove('hid');

  const nItems=items.length;
  // Ordenar por pct desc
  const ranked=items.map((it,i)=>({it,idx:i,pct:pct[i],score:avgScores[i]}))
    .sort((a,b)=>b.pct-a.pct);

  // Calcular regresión lineal simple para la línea de tendencia del scatter
  const xs=ranked.map(r=>r.score),ys=ranked.map(r=>r.pct);
  const n=xs.length,mx=xs.reduce((a,b)=>a+b,0)/n,my=ys.reduce((a,b)=>a+b,0)/n;
  const slope=xs.reduce((s,x,i)=>s+(x-mx)*(ys[i]-my),0)/xs.reduce((s,x)=>s+(x-mx)**2,0)||0;
  const intercept=my-slope*mx;
  const trend=x=>slope*x+intercept;

  // Clasificar: arriba/abajo de la tendencia
  ranked.forEach(r=>{
    const expected=trend(r.score);
    r.status=r.pct>expected+1?'above':r.pct<expected-1?'below':'neutral';
  });

  // Colores por status
  const gc=s=>s==='above'?'#1a7a4a':s==='below'?'#c8430a':'#8a8278';

  // Gráfico de barras con badge
  let html='<div style="margin-bottom:.75rem">';
  ranked.forEach((r,i)=>{
    const badge=r.status==='above'?t('calc.turf.badge.unique'):r.status==='below'?t('calc.turf.badge.redundant'):t('calc.turf.badge.neutral');
    const bc=r.status==='above'?'sb-above':r.status==='below'?'sb-below':'sb-neutral';
    html+=`<div class="shapley-bar-row">
      <div class="shapley-label" title="${r.it}"><span style="font-family:'Geist Mono',monospace;font-size:.6rem;color:var(--ink3)">#${i+1} </span>${r.it}</div>
      <div class="shapley-track"><div class="shapley-fill" style="width:${Math.max(0.5,r.pct)}%;background:${gc(r.status)}">${r.pct>3?r.pct.toFixed(1)+'%':''}</div></div>
      <div class="shapley-val">${r.pct.toFixed(1)}%</div>
      <div class="shapley-badge ${bc}">${badge}</div>
    </div>`;
  });
  // Total
  const total=ranked.reduce((s,r)=>s+r.pct,0);
  html+=`<div class="shapley-bar-row" style="margin-top:.5rem;padding-top:.5rem;border-top:1px solid var(--border)">
    <div class="shapley-label" style="font-weight:600;color:var(--ink)">${t('calc.md.total')}</div>
    <div class="shapley-track"><div class="shapley-fill" style="width:100%;background:#1a1714">100%</div></div>
    <div class="shapley-val" style="font-weight:600">${total.toFixed(1)}%</div>
    <div class="shapley-badge" style="width:60px"></div>
  </div></div>`;

  // Leyenda
  const above=ranked.filter(r=>r.status==='above').map(r=>r.it);
  const below=ranked.filter(r=>r.status==='below').map(r=>r.it);
  if(above.length)html+=`<div class="shapley-insight" style="border-color:var(--g);color:var(--g)">${t('calc.turf.legend.unique.prefix')} ${above.join(', ')}${t('calc.turf.legend.unique.suffix')}</div>`;
  if(below.length)html+=`<div class="shapley-insight" style="border-color:var(--r);color:var(--r);margin-top:.35rem">${t('calc.turf.legend.redundant.prefix')} ${below.join(', ')}${t('calc.turf.legend.redundant.suffix')}</div>`;

  result.innerHTML=html;
  S.turf.res.shapleyGeneral=ranked;

  // Scatter plot canvas
  setTimeout(()=>drawShapleyScatter(ranked,trend,slope,intercept),100);
}

// ── SCATTER PLOT SHAPLEY vs SCORE ─────────────────
function drawShapleyScatter(ranked,trend,slope,intercept){
  const canvas=document.getElementById('shapley-scatter-canvas');
  if(!canvas)return;
  const W=canvas.offsetWidth||700,H=320;
  canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  const pad={l:48,r:24,t:24,b:48};

  const xs=ranked.map(r=>r.score),ys=ranked.map(r=>r.pct);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=0,maxY=Math.max(...ys)*1.15;
  const px=x=>pad.l+(x-minX)/(maxX-minX||1)*(W-pad.l-pad.r);
  const py=y=>H-pad.b-y/(maxY||1)*(H-pad.t-pad.b);

  // Grid
  ctx.strokeStyle='#e2ddd4';ctx.lineWidth=1;
  for(let g=0;g<=4;g++){
    const y=H-pad.b-g/4*(H-pad.t-pad.b);
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();
    ctx.fillStyle='#8a8278';ctx.font='10px Geist, sans-serif';ctx.textAlign='right';
    ctx.fillText((maxY/4*g).toFixed(1)+'%',pad.l-5,y+4);
  }
  ctx.textAlign='center';ctx.fillStyle='#8a8278';ctx.font='10px Geist, sans-serif';
  [0,0.25,0.5,0.75,1].forEach(t=>{
    const x=pad.l+t*(W-pad.l-pad.r);
    const val=minX+t*(maxX-minX);
    ctx.fillText(val.toFixed(1),x,H-pad.b+18);
  });

  // Línea de tendencia
  const x0=minX,x1=maxX;
  ctx.beginPath();ctx.strokeStyle='#c8c0b0';ctx.lineWidth=1.5;ctx.setLineDash([6,4]);
  ctx.moveTo(px(x0),py(Math.max(0,trend(x0))));
  ctx.lineTo(px(x1),py(Math.max(0,trend(x1))));
  ctx.stroke();ctx.setLineDash([]);

  // Puntos
  ranked.forEach(r=>{
    const col=r.status==='above'?'#1a7a4a':r.status==='below'?'#c8430a':'#8a8278';
    const x=px(r.score),y=py(r.pct);
    ctx.beginPath();ctx.fillStyle=col;ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.arc(x,y,5,0,Math.PI*2);ctx.stroke();
    // Label si tiene status notable
    if(r.status!=='neutral'){
      ctx.fillStyle=col;ctx.font='bold 10px Geist, sans-serif';ctx.textAlign='center';
      const label=r.it.length>14?r.it.substring(0,14)+'…':r.it;
      ctx.fillText(label,x,y+(r.status==='above'?-10:18));
    }
  });

  // Axis labels
  ctx.fillStyle='#8a8278';ctx.font='11px Geist, sans-serif';ctx.textAlign='center';
  ctx.fillText(t('calc.turf.axis.score'),W/2,H-2);
  ctx.save();ctx.translate(12,H/2);ctx.rotate(-Math.PI/2);ctx.fillText(t('calc.turf.axis.shapley'),0,0);ctx.restore();

  // Leyenda
  [[{col:'#1a7a4a',lbl:t('calc.turf.scatterlegend.unique')},{col:'#c8430a',lbl:t('calc.turf.badge.redundant')},{col:'#8a8278',lbl:t('calc.turf.badge.neutral')}]].flat().forEach(({col,lbl},i)=>{
    ctx.beginPath();ctx.fillStyle=col;ctx.arc(pad.l+10,pad.t+8+i*16,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#4a453f';ctx.font='10px Geist, sans-serif';ctx.textAlign='left';ctx.fillText(lbl,pad.l+18,pad.t+12+i*16);
  });
}

// ── MASTER RUNNER ─────────────────────────────────
// Se llama después de renderTURFResults()
async function runShapley(){
  const{topResults,bestByK}=S.turf.res;
  const{data,items}=S.turf;
  const type=document.getElementById('turf-type').value;
  const threshold=parseFloat(document.getElementById('turf-threshold-val').value)||0.5;
  const anchored=document.getElementById('turf-anchor-type').value==='anchored';
  const a=parseInt(document.getElementById('turf-items-per-set').value)||4;
  const probThreshold=parseFloat(document.getElementById('turf-prob-threshold').value)||0.3;
  const N=data.length;
  const nItems=items.length;

  // Función de reach reutilizable (usa índices globales de ítems)
  const getReach=combo=>{
    if(type==='binary')return calcReachBinary(data,combo)/N*100;
    if(type==='threshold')return calcReachThreshold(data,combo,threshold)/N*100;
    return calcReachWeighted(data,combo,a,anchored,probThreshold)/N*100;
  };

  // ─── SHAPLEY TIPO 1: Portafolio óptimo ───────────
  const bestPortfolio=bestByK[bestByK.length-1]?.best;
  if(bestPortfolio){
    const reachPct=bestPortfolio.reachPct;
    // Usar setTimeout para no bloquear el render
    await new Promise(r=>setTimeout(r,50));
    const{shapley,exact,permCount}=calcShapleyPortfolio(data,bestPortfolio.combo,
      combo=>getReach(combo));
    renderShapleyPortfolio(bestPortfolio.combo,shapley,reachPct,items,exact);
  }

  // ─── SHAPLEY TIPO 2: Generalizado ────────────────
  await new Promise(r=>setTimeout(r,50));
  // Score promedio por ítem (% de veces que es elegido/alcanzado individualmente)
  const avgScores=items.map((_,i)=>getReach([i]));
  const{pct}=calcShapleyGeneral(data,nItems,getReach,avgScores);
  renderShapleyGeneral(pct,avgScores,items);
}

// ══════════════════════════════════════════════════
