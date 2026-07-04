// MAXDIFF (igual que v2.1)
// ══════════════════════════════════════════════════
function loadMEx(){S.m.items=['Velocidad de entrega','Variedad de restaurantes','Precio del delivery','Seguimiento en tiempo real','Atención al cliente 24/7','Descuentos y promociones','Facilidad de uso de la app','Calidad de los alimentos','Opciones de pago','Reseñas verificadas de usuarios','Programa de puntos / fidelidad','Empaque ecológico'];renderMI();}
function addMI(){if(S.m.items.length>=30){alert(t('calc.md.err.max30'));return;}S.m.items.push('');renderMI();}
function rmMI(i){if(S.m.items.length<=5){alert(t('calc.md.err.min5'));return;}S.m.items.splice(i,1);renderMI();}
function renderMI(){const c=document.getElementById('md-ic');c.innerHTML='';S.m.items.forEach((it,i)=>{const r=document.createElement('div');r.style.cssText='display:flex;gap:.45rem;align-items:center;margin-bottom:.38rem';r.innerHTML=`<div style="width:26px;height:26px;background:var(--b);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Geist Mono',monospace;font-size:.68rem;flex-shrink:0">${i+1}</div><input type="text" value="${it}" placeholder="${t('calc.md.itemword')} ${i+1}" style="flex:1" oninput="S.m.items[${i}]=this.value"><button class="brm" onclick="rmMI(${i})">✕</button>`;c.appendChild(r);});}
function setMVer(n,el){S.m.vers=n;document.querySelectorAll('#mod-maxdiff .vp .pill').forEach(p=>p.classList.remove('act'));el.classList.add('act');}
function genMDesign(){const items=S.m.items,K=parseInt(document.getElementById('mips').value),V=S.m.vers;try{const generated=createMaxDiffDesign(items,{itemsPerSet:K,versions:V});S.m.items=generated.items;S.m.design=generated.designs;}catch(error){if(error.code==='MAXDIFF_ITEM_COUNT')alert(t('calc.md.err.min5'));else if(error.code==='MAXDIFF_EMPTY_ITEM')alert(t('calc.md.err.emptyitem'));else if(error.code==='MAXDIFF_DUPLICATE_ITEM')alert(_lang==='es'?'Los ítems no deben repetirse.':'Items must be unique.');else throw error;return;}S.m.cv=0;S.m.cp=0;renderMVS();renderMC();gMS(2);}
function renderMVS(){const sel=document.getElementById('md-vs');sel.innerHTML='';for(let v=0;v<S.m.vers;v++){const p=document.createElement('div');p.className='pill pb'+(v===0?' act':'');p.textContent=t('calc.version')+' '+(v+1);const vv=v;p.onclick=()=>{S.m.cv=vv;S.m.cp=0;document.querySelectorAll('#md-vs .pill').forEach(x=>x.classList.remove('act'));p.classList.add('act');renderMC();};sel.appendChild(p);}}
function renderMC(){const v=S.m.cv,cp=S.m.cp,d=S.m.design[v],ns=d.length,items=S.m.items;document.getElementById('mpi').textContent=`${t('calc.md.card')} ${cp+1} ${t('calc.md.of')} ${ns}`;document.getElementById('mprev').disabled=cp===0;document.getElementById('mnext').disabled=cp===ns-1;document.getElementById('md-cd').innerHTML=`<div class="mdc"><div class="mdh">${t('calc.md.card').toUpperCase()} ${cp+1} — ${t('calc.md.mostleast')} <span style="font-size:.58rem;opacity:.8">V${v+1}</span></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:.35rem;padding:.45rem .65rem;background:#f0f4fa;border-bottom:1px solid var(--border)"><div style="font-family:'Geist Mono',monospace;font-size:.58rem;color:var(--g)">✓ ${t('calc.md.most')}</div><div style="font-family:'Geist Mono',monospace;font-size:.58rem;color:var(--r);text-align:right">✕ ${t('calc.md.least')}</div></div><div class="mil">${d[cp].map(idx=>`<div class="mir"><span class="mix">${idx+1}</span><span>${items[idx]}</span><span class="mbl">${t('calc.md.chk.most')}</span><span class="mwl">${t('calc.md.chk.least')}</span></div>`).join('')}</div></div>`;}
function chMP(d){const ns=S.m.design[S.m.cv].length;S.m.cp=Math.max(0,Math.min(ns-1,S.m.cp+d));renderMC();}
function dlMTpl(){const wb=XLSX.utils.book_new(),V=S.m.vers,d=S.m.design,items=S.m.items,ns=d[0].length;const wi=XLSX.utils.aoa_to_sheet([['INSTRUCCIONES MaxDiff'],[''],['Cada fila = 1 encuestado. t[N]_mejor y t[N]_peor: número de ítem (1 a '+items.length+').'],[''],['ÍTEMS:',...items.map((it,i)=>['  '+(i+1)+'. '+it])]]);wi['!cols']=[{wch:80}];XLSX.utils.book_append_sheet(wb,wi,'Instrucciones');const tc=[];for(let t=1;t<=ns;t++){tc.push('t'+t+'_mejor','t'+t+'_peor');}const hd=['id_encuestado','version',...tc];const wr=XLSX.utils.aoa_to_sheet([hd,...Array.from({length:5},(_,i)=>[i+1,(i%V)+1,...Array(tc.length).fill('')])]);wr['!cols']=[{wch:14},{wch:9},...tc.map(()=>({wch:10}))];XLSX.utils.book_append_sheet(wb,wr,'Respuestas');for(let v=0;v<V;v++){const rows=[['TARJETA','POS','N° ÍTEM','ÍTEM']];d[v].forEach((set,ti)=>{set.forEach((idx,pos)=>rows.push([ti+1,pos+1,idx+1,items[idx]]));rows.push(['','','','']);});const wd=XLSX.utils.aoa_to_sheet(rows);wd['!cols']=[{wch:10},{wch:8},{wch:10},{wch:45}];XLSX.utils.book_append_sheet(wb,wd,'Diseño_V'+(v+1));}XLSX.writeFile(wb,'plantilla_maxdiff.xlsx');}
function hMDrop(e){e.preventDefault();const f=e.dataTransfer.files[0];if(f)prMFile(f);}
function hMFile(e){const f=e.target.files[0];if(f)prMFile(f);}
function prMFile(file){const r=new FileReader();r.onload=e=>{try{const wb=XLSX.read(e.target.result,{type:'binary'});S.m.data=XLSX.utils.sheet_to_json(wb.Sheets['Respuestas']||wb.Sheets[wb.SheetNames[0]]);document.getElementById('mfs').classList.remove('hid');document.getElementById('mfst').textContent=`${file.name} — ${S.m.data.length} encuestados.`;document.getElementById('mab').disabled=false;}catch{alert('Error.');}};r.readAsBinaryString(file);}
function loadMDemo(){const N=80,items=S.m.items,r=rng(555),tu=items.map((_,i)=>(items.length-i)*(0.8+r()*0.4));S.m.data=Array.from({length:N},(_,ei)=>{const row={id_encuestado:ei+1,version:(ei%S.m.vers)+1};S.m.design[ei%S.m.vers].forEach((set,t)=>{const us=set.map(idx=>tu[idx]*(0.7+r()*0.6));row['t'+(t+1)+'_mejor']=set[us.indexOf(Math.max(...us))]+1;row['t'+(t+1)+'_peor']=set[us.indexOf(Math.min(...us))]+1;});return row;});document.getElementById('mfs').classList.remove('hid');document.getElementById('mfst').textContent=`Datos demo — ${N} encuestados.`;document.getElementById('mab').disabled=false;}
function analyzeM(){
  S.m.res=computeMaxDiff(S.m.items,S.m.design,S.m.data);
  renderMRes();
  buildMScript();
  gMS(4);
  genMAI();
}

function buildMScript(){
  const items=S.m.items;
  const{ranked}=S.m.res;
  const ns=S.m.design[0].length;
  const itemsList=items.map((it,i)=>`  "${it}"  # ${i+1}`).join(',\n');
  const rankBlock=[...ranked].map(r=>`  # ${r.rank}. ${r.it}: ${r.score.toFixed(1)}%`).join('\n');

  const sc=
`# ══════════════════════════════════════════════════════════════
# MAXDIFF (Best-Worst Scaling) — Script completo
# Kit de Investigación de Mercados v3.0
# Autor: Hugo Cornejo Villena
# Métodos: conteo directo + logit multinomial + puntajes individuales
# ══════════════════════════════════════════════════════════════

# ── 1. PAQUETES ───────────────────────────────────────────────
if(!require("mlogit"))    install.packages("mlogit")
if(!require("tidyverse")) install.packages("tidyverse")
if(!require("readxl"))    install.packages("readxl")
library(mlogit); library(tidyverse); library(readxl)

# ── 2. ÍTEMS EVALUADOS ────────────────────────────────────────
items <- c(
${itemsList}
)
n_items <- length(items)
n_sets  <- ${ns}   # tarjetas por encuestado

# ── 3. RESULTADOS DEL APP (ranking de importancia) ────────────
# Porcentajes proporcionales — suman 100%:
${rankBlock}

# ── 4. CARGAR DATOS ───────────────────────────────────────────
# Columnas: id_encuestado | version | t1_mejor | t1_peor | t2_mejor | ...
# Valores: número de ítem (1 a n_items)
datos <- read_excel("plantilla_maxdiff.xlsx", sheet = "Respuestas")
cat("Encuestados:", nrow(datos), "\\n")

# ── 5. MÉTODO DE CONTEO AGREGADO ──────────────────────────────
mejor_vals <- unlist(datos[, grepl("_mejor", names(datos))])
peor_vals  <- unlist(datos[, grepl("_peor",  names(datos))])

freq_m <- tabulate(mejor_vals, nbins = n_items)
freq_p <- tabulate(peor_vals,  nbins = n_items)

puntaje_neto <- freq_m - freq_p

# Normalización proporcional (suma 100%)
puntaje_pos  <- puntaje_neto - min(puntaje_neto)
score_pct    <- round(puntaje_pos / sum(puntaje_pos) * 100, 1)
# Ajuste del último para suma exacta
score_pct[n_items] <- 100 - sum(score_pct[-n_items])

res_conteo <- data.frame(
  rank    = rank(-puntaje_neto),
  item    = items,
  n_mas   = freq_m,
  n_menos = freq_p,
  neto    = puntaje_neto,
  pct     = score_pct
) |> arrange(rank)

cat("\\nRANKING (conteo — % suman 100%):\\n")
print(res_conteo[, c("rank", "item", "pct", "neto")])

# ── 6. PUNTAJES INDIVIDUALES (para AFE, ACP, Cluster) ─────────
# Genera una matriz: 1 fila por encuestado × 1 columna por ítem
# Lista de columnas de respuesta
mejor_cols <- names(datos)[grepl("_mejor", names(datos))]
peor_cols  <- names(datos)[grepl("_peor",  names(datos))]

scores_individuales <- datos |>
  rowwise() |>
  mutate(
    scores = list({
      b <- tabulate(c_across(all_of(mejor_cols)), nbins = n_items)
      w <- tabulate(c_across(all_of(peor_cols)),  nbins = n_items)
      net <- b - w
      mn  <- min(net); mx <- max(net); rn <- mx - mn
      pos <- net - mn
      if(sum(pos) > 0) round(pos / sum(pos) * 100, 1) else rep(100/n_items, n_items)
    })
  ) |>
  ungroup()

# Expandir a formato wide
matriz_ind <- scores_individuales |>
  select(id_encuestado, version, scores) |>
  unnest_wider(scores, names_sep = "_item") |>
  setNames(c("id_encuestado", "version", paste0("pct_", items)))

cat("\\nMATRIZ INDIVIDUAL (primeras 3 filas):\\n")
print(head(matriz_ind, 3))

# Exportar para análisis externos
write.csv(matriz_ind, "scores_maxdiff_individual.csv", row.names = FALSE)

# ── 7. ANÁLISIS CLUSTER (segmentación) ────────────────────────
library(cluster)
vars_scores <- matriz_ind |> select(starts_with("pct_"))

# Distancia euclídea + método Ward
dist_mat    <- dist(scale(vars_scores))
dendrograma <- hclust(dist_mat, method = "ward.D2")
plot(dendrograma, main = "Dendrograma — Segmentación MaxDiff", cex = 0.7)

# Cortar en k segmentos (ajustar k según el dendrograma)
k <- 3
clusters <- cutree(dendrograma, k = k)
matriz_ind$segmento <- factor(clusters)

cat("\\nDistribución de segmentos (k =", k, "):\\n")
print(table(matriz_ind$segmento))

# Perfil promedio por segmento
perfil_seg <- matriz_ind |>
  group_by(segmento) |>
  summarise(across(starts_with("pct_"), mean, .names = "m_{.col}"))
print(perfil_seg)

# ── 8. ANÁLISIS DE COMPONENTES PRINCIPALES (ACP) ──────────────
pca <- prcomp(vars_scores, scale. = TRUE)
summary(pca)

scores_pca <- as.data.frame(pca$x[, 1:2])
scores_pca$segmento <- matriz_ind$segmento

library(ggplot2)
ggplot(scores_pca, aes(PC1, PC2, color = segmento)) +
  geom_point(alpha = 0.7, size = 2) +
  stat_ellipse(level = 0.8, linetype = 2) +
  labs(title = "ACP sobre puntajes MaxDiff individuales",
       subtitle = paste("k =", k, "segmentos")) +
  theme_minimal(14)

# ── 9. MODELO LOGIT MULTINOMIAL (utilidades latentes) ─────────
diseno <- read_excel("plantilla_maxdiff.xlsx", sheet = "Diseño_V1") |>
  filter(TARJETA != "")

resp_m <- datos |>
  pivot_longer(ends_with("_mejor"), names_to = "tar", values_to = "item_m") |>
  mutate(t = as.integer(str_extract(tar, "\\\\d+")))

resp_p <- datos |>
  pivot_longer(ends_with("_peor"), names_to = "tar", values_to = "item_p") |>
  mutate(t = as.integer(str_extract(tar, "\\\\d+")))

md_long <- resp_m |>
  select(id_encuestado, t, item_m) |>
  left_join(resp_p |> select(id_encuestado, t, item_p), by = c("id_encuestado", "t")) |>
  left_join(diseno |> rename(t = TARJETA), by = "t") |>
  group_by(id_encuestado, t) |>
  mutate(
    chid    = (id_encuestado - 1) * n_sets + t,
    elegido = as.integer(\`N° ÍTEM\` == item_m)
  ) |>
  ungroup()

md_mlogit <- mlogit.data(md_long, choice = "elegido", shape = "long",
                          alt.var = "N° ÍTEM", chid.var = "chid")
modelo_md <- mlogit(elegido ~ 0 | 1, data = md_mlogit)
summary(modelo_md)

u      <- coef(modelo_md)
u_pos  <- u - min(u)
u_pct  <- round(u_pos / sum(u_pos) * 100, 1)
u_pct[length(u_pct)] <- 100 - sum(u_pct[-length(u_pct)])

res_logit <- data.frame(
  item_num = as.integer(names(u_pct)),
  pct      = u_pct,
  utilidad = u
) |> mutate(item = items[item_num]) |>
  arrange(desc(pct)) |>
  mutate(rank = row_number())

cat("\\nRANKING LOGIT (% suman 100%):\\n")
print(res_logit[, c("rank", "item", "pct")])

# ── 10. VISUALIZACIÓN ─────────────────────────────────────────
res_logit |>
  mutate(item = fct_reorder(item, pct)) |>
  ggplot(aes(x = pct, y = item, fill = item)) +
  geom_col(show.legend = FALSE) +
  geom_text(aes(label = paste0(pct, "%")), hjust = -0.1, size = 3.5) +
  scale_x_continuous(limits = c(0, max(res_logit$pct) * 1.18)) +
  labs(title = "MaxDiff — Ranking de importancia",
       subtitle = "% proporcionales — suman 100% (logit multinomial)",
       x = "% Importancia", y = "") +
  theme_minimal(14) +
  theme(panel.grid.major.y = element_blank())

# ── REFERENCIAS ───────────────────────────────────────────────
# Finn & Louviere (1992). Journal of Public Policy & Marketing.
# Cohen (2003). Maximum difference scaling. Sawtooth Conf.
# Louviere et al. (2015). Best-Worst Scaling. Cambridge UP.
`;
  document.getElementById('msp').textContent=sc;
  window._ms=sc;
}
function renderMRes(){
  const{ranked}=S.m.res;
  const total=ranked.reduce((s,r)=>s+r.score,0);

  // Gráfico de barras con %
  const rc=document.getElementById('md-rc');rc.innerHTML='';
  // Zonas relativas: top tercio=verde, medio=azul, bajo=rojo
  const sorted=[...ranked].sort((a,b)=>b.score-a.score);
  const topThird=sorted[Math.floor(sorted.length/3)]?.score||0;
  const botThird=sorted[Math.floor(sorted.length*2/3)]?.score||100;
  const gc=s=>s>=topThird?'#1a7a4a':s>=botThird?'#2563a8':'#c8430a';

  ranked.forEach(r=>{
    const row=document.createElement('div');row.className='rbr';const col=gc(r.score);
    row.innerHTML=`<div class="rl2" style="width:185px;font-size:.75rem"><span style="font-family:'Geist Mono',monospace;color:var(--ink3);font-size:.62rem">#${r.rank} </span>${r.it}</div>
    <div class="rbw"><div class="rbf" style="width:${Math.max(0.5,r.score)}%;background:${col}">${r.score>4?r.score.toFixed(1)+'%':''}</div></div>
    <div class="rv">${r.score.toFixed(1)}%</div>`;
    rc.appendChild(row);
  });
  // Fila TOTAL
  const tr=document.createElement('div');tr.className='rbr';
  tr.innerHTML=`<div class="rl2" style="font-weight:600;color:var(--ink);width:185px">${t('calc.md.total')}</div>
    <div class="rbw"><div class="rbf" style="width:100%;background:#1a1714">100%</div></div>
    <div class="rv" style="font-weight:600">${total.toFixed(1)}%</div>`;
  rc.appendChild(tr);

  // Tabla estadísticas — columna renombrada a %
  const st=document.getElementById('md-st');
  const tbl=document.createElement('table');tbl.style.cssText='width:100%;border-collapse:collapse;font-size:.8rem';
  tbl.innerHTML=`<thead><tr style="background:var(--surface)">
    <th style="text-align:left;padding:.45rem .7rem;border-bottom:1px solid var(--border);font-size:.7rem;color:var(--ink3)">#</th>
    <th style="text-align:left;padding:.45rem .7rem;border-bottom:1px solid var(--border);font-size:.7rem;color:var(--ink3)">${t('calc.md.col.item')}</th>
    <th style="text-align:center;padding:.45rem .7rem;border-bottom:1px solid var(--border);font-size:.7rem;color:var(--g)">${t('calc.md.col.most')}</th>
    <th style="text-align:center;padding:.45rem .7rem;border-bottom:1px solid var(--border);font-size:.7rem;color:var(--r)">${t('calc.md.col.least')}</th>
    <th style="text-align:center;padding:.45rem .7rem;border-bottom:1px solid var(--border);font-size:.7rem;color:var(--ink3)">${t('calc.md.col.net')}</th>
    <th style="text-align:center;padding:.45rem .7rem;border-bottom:1px solid var(--border);font-size:.7rem;color:var(--ink3)">${t('calc.md.col.pctimp')}</th>
  </tr></thead><tbody>
  ${ranked.map(r=>`<tr style="border-bottom:1px solid var(--border)">
    <td style="padding:.42rem .7rem;font-family:'Geist Mono',monospace;font-size:.68rem;color:var(--ink3)">${r.rank}</td>
    <td style="padding:.42rem .7rem">${r.it}</td>
    <td style="padding:.42rem .7rem;text-align:center;color:var(--g);font-weight:500">${r.b}</td>
    <td style="padding:.42rem .7rem;text-align:center;color:var(--r)">${r.w}</td>
    <td style="padding:.42rem .7rem;text-align:center;font-family:'Geist Mono',monospace;color:${r.net>=0?'var(--g)':'var(--r)'}">${r.net>0?'+':''}${r.net}</td>
    <td style="padding:.42rem .7rem;text-align:center;font-family:'Geist Mono',monospace;font-weight:600">${r.score.toFixed(1)}%</td>
  </tr>`).join('')}
  <tr style="border-top:2px solid var(--border);background:var(--surface)">
    <td colspan="5" style="padding:.42rem .7rem;font-weight:600;color:var(--ink);font-size:.8rem">${t('calc.md.total')}</td>
    <td style="padding:.42rem .7rem;text-align:center;font-family:'Geist Mono',monospace;font-weight:700">${total.toFixed(1)}%</td>
  </tr>
  </tbody>`;
  st.innerHTML='';st.appendChild(tbl);
}
function expM(){const{ranked}=S.m.res,wb=XLSX.utils.book_new();const total=ranked.reduce((s,r)=>s+r.score,0);const rr=[[t('calc.md.exp.col.rank'),t('calc.md.exp.col.item'),t('calc.md.exp.col.most'),t('calc.md.exp.col.least'),t('calc.md.exp.col.net'),t('calc.md.exp.col.pct')],...ranked.map(r=>[r.rank,r.it,r.b,r.w,r.net,r.score.toFixed(1)]),['',t('calc.md.total'),'','','',total.toFixed(1)]];const wr=XLSX.utils.aoa_to_sheet(rr);XLSX.utils.book_append_sheet(wb,wr,t('calc.md.exp.sheet'));XLSX.writeFile(wb,'resultados_maxdiff.xlsx');}
function expMInd(){const{ranked,indivScores}=S.m.res,items=S.m.items,wb=XLSX.utils.book_new();const hd=['id_encuestado','version',...items.map((it,i)=>`score_${i+1}`)];const rows=indivScores.map(r=>[r.id,r.version,...r.norm]);const ws=XLSX.utils.aoa_to_sheet([hd,...rows]);XLSX.utils.book_append_sheet(wb,ws,t('calc.md.exp.sheet.ind'));const hd2=['id_encuestado','version',...items.map((it,i)=>`net_${i+1}`)];const rows2=indivScores.map(r=>[r.id,r.version,...r.net]);const ws2=XLSX.utils.aoa_to_sheet([hd2,...rows2]);XLSX.utils.book_append_sheet(wb,ws2,t('calc.md.exp.sheet.net'));const ref=[[t('calc.md.exp.ref.label')],[t('calc.md.exp.ref.desc')],...items.map((it,i)=>[`${i+1}. ${it}`])];const ws3=XLSX.utils.aoa_to_sheet(ref);XLSX.utils.book_append_sheet(wb,ws3,t('calc.md.exp.sheet.ref'));XLSX.writeFile(wb,'scores_maxdiff_individual.xlsx');}

// ══════════════════════════════════════════════════
// SCRIPT COPY/DOWNLOAD
// ══════════════════════════════════════════════════
function cpSc(mod){const sc=mod==='c'?window._cs:mod==='m'?window._ms:'';if(!sc)return;navigator.clipboard.writeText(sc).then(()=>{const btn=document.getElementById(mod==='c'?'ccpb':'mcpb');btn.textContent=t('calc.script.copied');btn.classList.add('ok');setTimeout(()=>{btn.textContent=t('calc.script.copy');btn.classList.remove('ok');},2500);});}
function dlSc(mod){const sc=mod==='c'?window._cs:window._ms,fn=mod==='c'?'script_cbc.R':'script_maxdiff.R';if(!sc)return;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([sc],{type:'text/plain'}));a.download=fn;a.click();}

// ══════════════════════════════════════════════════
