// MODO APRENDIZAJE — NAVEGACIÓN
// ══════════════════════════════════════════════════
function gEdu(n){
  S.edu.step=n;
  document.querySelectorAll('#mod-edu .sp').forEach(p=>p.classList.remove('act'));
  document.getElementById('es'+n).classList.add('act');
  for(let i=0;i<=8;i++){
    const w=document.getElementById('ew'+i);
    if(!w)continue;
    w.classList.remove('act','dn');
    if(i<n)w.classList.add('dn');
    if(i===n)w.classList.add('act');
  }
  if(n===0)renderProblemList();
  window.scrollTo({top:0,behavior:'smooth'});
}

// ══════════════════════════════════════════════════
// PASO 0 — SELECTOR DE CATEGORÍA DE PROBLEMA
// ══════════════════════════════════════════════════
function renderProblemList(){
  const list=document.getElementById('edu-problem-list');
  if(!list)return;
  list.innerHTML=Object.values(EDU_PROBLEMS).map(p=>{
    const locked=!p.active;
    return `<div class="meth-card${locked?'':' problem-active'}" style="${locked?'opacity:.5;cursor:default;':''}" ${locked?'':`onclick="selectEduProblem('${p.id}')"`}>
      <div class="meth-card-icon">${locked?'🔒':p.icon}</div>
      <div>
        <div class="meth-card-title">${locked?(_lang==='es'?'Próximamente — ':'Coming soon — '):''}${p.title[_lang]||p.title.es}</div>
        <div class="meth-card-desc">${p.cardDesc[_lang]||p.cardDesc.es}</div>
      </div>
    </div>`;
  }).join('');
}

function selectEduProblem(problemId){
  S.edu.problemId=problemId;
  renderProblemDetail();
  gEdu(1);
}

// ══════════════════════════════════════════════════
// PASO 1 — DETALLE DEL PROBLEMA + CASOS FILTRADOS
// ══════════════════════════════════════════════════
function renderProblemDetail(){
  const p=EDU_PROBLEMS[S.edu.problemId];
  const el=document.getElementById('edu-problem-detail');
  if(!p||!el)return;
  let altMethodsHtml='';
  if(p.altMethodsTitle){
    altMethodsHtml=`
    <div class="card">
      <div class="ct">${p.altMethodsTitle[_lang]||p.altMethodsTitle.es}</div>
      <p class="cs">${p.altMethodsText[_lang]||p.altMethodsText.es}</p>
    </div>`;
  }
  let turfHtml='';
  if(p.turfDistinctionTitle){
    turfHtml=`
    <div class="card" style="border-left:3px solid #d97706">
      <div class="ct">⚠️ ${p.turfDistinctionTitle[_lang]||p.turfDistinctionTitle.es}</div>
      <p class="cs">${p.turfDistinctionText[_lang]||p.turfDistinctionText.es}</p>
    </div>`;
  }
  if(p.maxdiffDistinctionTitle){
    turfHtml+=`
    <div class="card" style="border-left:3px solid #d97706">
      <div class="ct">⚠️ ${p.maxdiffDistinctionTitle[_lang]||p.maxdiffDistinctionTitle.es}</div>
      <p class="cs">${p.maxdiffDistinctionText[_lang]||p.maxdiffDistinctionText.es}</p>
    </div>`;
  }
  el.innerHTML=`
    <div class="card">
      <div class="problem-icon">${p.icon}</div>
      <div class="ct">${_lang==='es'?'El problema: ':'The problem: '}${p.title[_lang]||p.title.es}</div>
      <p class="cs">${p.p1[_lang]||p.p1.es}</p>
      <p class="cs">${p.p2[_lang]||p.p2.es}</p>
      <div class="nt nti"><span class="ni">🤔</span><span>${p.question[_lang]||p.question.es}</span></div>
    </div>
    <div class="card">
      <div class="ct">${p.solutionTitle[_lang]||p.solutionTitle.es}</div>
      <p class="cs">${p.solutionDesc[_lang]||p.solutionDesc.es}</p>
    </div>${altMethodsHtml}${turfHtml}`;
  renderEduCaseList();
}

function renderEduCaseList(){
  const container=document.getElementById('edu-case-list');
  if(!container)return;
  const matching=Object.values(EDU_CASES).filter(c=>c.problemId===S.edu.problemId);
  if(matching.length===0){
    container.innerHTML=`<div class="nt ntw"><span class="ni">⚠</span><span>${_lang==='es'?'Aún no hay casos disponibles para esta categoría. Vuelve pronto.':'No cases are available yet for this category. Check back soon.'}</span></div>`;
    document.getElementById('edu-case-start-btn').disabled=true;
    return;
  }
  container.innerHTML=matching.map((c,i)=>`
    <div class="meth-card${i===0?' selected':''}" id="case-card-${c.id}" onclick="selectEduCase('${c.id}')">
      <div class="meth-card-icon">${c.id==='cafe_nms'?'📈':'☕'}</div>
      <div>
        <div class="meth-card-title">${ce(c.titulo)} — ${ce(c.modulo)}</div>
        <div class="meth-card-desc">${ce(c.entregable)}</div>
      </div>
    </div>`).join('');
  S.edu.caseId=matching[0].id;
  document.getElementById('edu-case-start-btn').disabled=false;
}

function selectEduCase(id){
  S.edu.caseId=id;
  document.querySelectorAll('[id^=case-card-]').forEach(c=>c.classList.remove('selected'));
  const card=document.getElementById('case-card-'+id);
  if(card)card.classList.add('selected');
}

function startEduCase(){
  const cs=EDU_CASES[S.edu.caseId];
  if(!cs){alert(_lang==='es'?'Selecciona un caso.':'Select a case.');return;}
  S.edu.startTime=Date.now();
  S.edu.sessionCode=generateSessionCode(S.edu.caseId);
  // Inicializar estado
  S.edu.pretest=[null,null,null];
  S.edu.postest=[null,null,null];
  S.edu.pretestSubmitted=false;
  S.edu.posttestSubmitted=false;
  S.edu.response={hallazgo:'',evidencia:'',recomendacion:'',limitaciones:'',siguiente:''};
  S.edu.aiFeedback='';
  S.edu.survey={utilidad:0,facilidad:0,aprendizaje:0,claridad:0,intencion:0,abierta1:'',abierta2:'',abierta3:''};
  renderEduBrief(cs);
  // Pre-renderizar quiz para que esté listo
  setTimeout(()=>{
    renderQuiz('edu-pretest-qs',S.edu.pretest,'pre');
    renderPosttest();
  },50);
  gEdu(2);
}

function generateSessionCode(caseId){
  const d=new Date();
  const dd=String(d.getDate()).padStart(2,'0');
  const mm=String(d.getMonth()+1).padStart(2,'0');
  const yy=String(d.getFullYear()).slice(-2);
  const hh=String(d.getHours()).padStart(2,'0');
  const mn=String(d.getMinutes()).padStart(2,'0');
  const mod=caseId==='cafe'?'VW':'XX';
  const hash=Math.floor(Math.random()*9000)+1000;
  return `${mod}-${dd}${mm}${yy}-${hh}${mn}-${hash}`;
}

// ══════════════════════════════════════════════════
// PASO 2 — BRIEF Y SELECTOR METODOLÓGICO
// ══════════════════════════════════════════════════
function renderEduBrief(cs){
  let infoNeedText;
  if(cs.engine==='nms'){
    infoNeedText=_lang==='es'?'El rango de precios psicológicamente aceptable (vía las 4 preguntas del PSM), más la probabilidad de compra a cada nivel de precio (vía 2 preguntas adicionales de intención de compra), para poder estimar demanda e ingresos.':'The psychologically acceptable price range (via the 4 PSM questions), plus the purchase probability at each price level (via 2 additional purchase-intent questions), in order to estimate demand and revenue.';
  } else if(cs.engine==='maxdiff'){
    infoNeedText=_lang==='es'?'La importancia relativa de cada criterio de elección, medida a través de tarjetas de comparación donde el encuestado elige el más y el menos importante dentro de subconjuntos pequeños (Best-Worst Scaling).':'The relative importance of each choice criterion, measured through comparison cards where the respondent chooses the most and least important within small subsets (Best-Worst Scaling).';
  } else if(cs.engine==='turf'){
    infoNeedText=_lang==='es'?'La disposición de compra de cada consumidor para cada variante del producto por separado (dato binario: compraría / no compraría), necesaria para calcular el alcance no duplicado de cualquier combinación posible de variantes.':'Each consumer\'s purchase intent for each product variant separately (binary data: would buy / would not buy), needed to calculate the unduplicated reach of any possible combination of variants.';
  } else if(cs.engine==='conjoint'){
    infoNeedText=_lang==='es'?'Las elecciones entre perfiles de producto completos —combinaciones reales de atributos—, a partir de las cuales se estima la utilidad parcial de cada nivel y se simula la cuota de mercado de cualquier configuración nueva.':'Choices between complete product profiles — real combinations of attributes — from which the partial utility of each level is estimated and the market share of any new configuration can be simulated.';
  } else {
    infoNeedText=_lang==='es'?'El rango de precios psicológicamente aceptable, medido a través de las 4 preguntas del Price Sensitivity Meter.':'The psychologically acceptable price range, measured through the 4 Price Sensitivity Meter questions.';
  }
  document.getElementById('edu-brief-block').innerHTML=`
    <div class="edu-brief">
      <div class="edu-brief-label">${t('brief.label')} — ${ce(cs.titulo)}</div>
      <div class="edu-brief-row"><span class="edu-brief-key">${t('brief.company')}</span><span class="edu-brief-val">${ce(cs.empresa)} · ${ce(cs.sector)}</span></div>
    </div>
    <div class="edu-brief" style="border-left-color:#c8430a;margin-bottom:.65rem">
      <div class="edu-brief-label" style="color:#c8430a">🎯 ${t('brief.business.label')}</div>
      <div class="edu-brief-row"><span class="edu-brief-val">${ce(cs.problemaEmpresarial)}</span></div>
      <div class="edu-brief-row" style="margin-top:.3rem"><span class="edu-brief-key">${t('brief.action')}</span><span class="edu-brief-val">${ce(cs.decision)}</span></div>
    </div>
    <div class="edu-brief" style="margin-bottom:.65rem">
      <div class="edu-brief-label">🔍 ${t('brief.research.label')}</div>
      <div class="edu-brief-row"><span class="edu-brief-val">${ce(cs.problemaInvestigacion)}</span></div>
      <div class="edu-brief-row" style="margin-top:.3rem"><span class="edu-brief-key">${t('brief.infoneed')}</span><span class="edu-brief-val">${infoNeedText}</span></div>
    </div>
    <div class="edu-brief">
      <div class="edu-brief-row"><span class="edu-brief-key">${t('brief.sample')}</span><span class="edu-brief-val">${ce(cs.muestra)}</span></div>
      <div class="edu-brief-row"><span class="edu-brief-key">${t('brief.deliverable')}</span><span class="edu-brief-val">${ce(cs.entregable)}</span></div>
    </div>`;
}

function evalMeth(){
  const q1=document.getElementById('meth-q1').value;
  const q2=document.getElementById('meth-q2').value;
  const q3=document.getElementById('meth-q3').value;
  if(!q1||!q2||!q3){alert(_lang==='es'?'Responde las tres preguntas antes de evaluar.':'Answer all three questions before evaluating.');return;}
  const rec=document.getElementById('meth-rec');
  const txt=document.getElementById('meth-rec-text');
  const eng=eduEngine();
  let msg='';

  if(eng==='conjoint'){
    const isCorrect=q1==='producto'&&q2==='elecciones'&&q3==='share';
    if(_lang==='es'){
      if(isCorrect){
        msg=`<strong style="color:var(--g)">✓ Selección correcta: Diseño de Producto (CBC Conjoint)</strong><br><br>Las tres respuestas apuntan al análisis conjunto basado en elecciones: querés diseñar el producto ideal, tenés datos de elecciones entre perfiles de producto (el formato CBC), y buscás simular la cuota de mercado de distintas configuraciones. El CBC, desarrollado por Luce &amp; Tukey (1964) y adaptado al formato de elecciones discretas por McFadden (1974), es exactamente el instrumento diseñado para este tipo de decisión.`;
      } else {
        msg=`<strong style="color:#d97706">⚠ Revisemos tu selección</strong><br><br>`;
        if(q1!=='producto')msg+=`La decisión de la empresa es diseñar el producto ideal — elegir qué combinación de atributos maximiza la probabilidad de elección. Eso corresponde a la opción "Diseñar el producto ideal".<br>`;
        if(q2!=='elecciones')msg+=`Los datos disponibles son elecciones entre perfiles de producto completos (cada encuestado elige entre 4 planes en cada tarea). Eso son datos de "elecciones entre perfiles de producto".<br>`;
        if(q3!=='share')msg+=`El resultado que necesitás no es solo un ranking de preferencias — es poder simular qué cuota de mercado captura cada configuración posible frente a la competencia. Eso corresponde a "cuota de mercado simulada".<br>`;
        msg+=`<br>La técnica recomendada es <strong>Choice-Based Conjoint (CBC)</strong>, que estima utilidades parciales para descomponer el valor de cada atributo y nivel, y permite simular el share de cualquier configuración de producto.`;
      }
    } else {
      if(isCorrect){
        msg=`<strong style="color:var(--g)">✓ Correct selection: Product Design (CBC Conjoint)</strong><br><br>All three answers point to choice-based conjoint analysis: you want to design the ideal product, you have data on choices between product profiles (the CBC format), and you seek to simulate the market share of different configurations. CBC, developed by Luce &amp; Tukey (1964) and adapted to discrete choice by McFadden (1974), is precisely the instrument designed for this type of decision.`;
      } else {
        msg=`<strong style="color:#d97706">⚠ Let's review your selection</strong><br><br>`;
        if(q1!=='producto')msg+=`The company's decision is to design the ideal product — choosing which combination of attributes maximizes the probability of being chosen. That corresponds to "Design the ideal product."<br>`;
        if(q2!=='elecciones')msg+=`The available data consists of choices between complete product profiles (each respondent chooses among 4 plans in each task). That's "choices between product profiles."<br>`;
        if(q3!=='share')msg+=`The result you need isn't just a preference ranking — it's the ability to simulate what market share each possible configuration would capture against competition. That corresponds to "simulated market share."<br>`;
        msg+=`<br>The recommended technique is <strong>Choice-Based Conjoint (CBC)</strong>, which estimates partial utilities to decompose the value of each attribute and level, and allows simulating the share of any product configuration.`;
      }
    }
  } else if(eng==='vw'){
    // ── Caso VW puro: la salida esperada es el rango de precios
    const isCorrect=q1==='precio'&&q2==='precios_percibidos'&&q3==='rango_precios';
    if(_lang==='es'){
      if(isCorrect){
        msg=`<strong style="color:var(--g)">✓ Selección correcta: Sensibilidad de Precios (Van Westendorp PSM)</strong><br><br>Las tres respuestas apuntan al Price Sensitivity Meter: quieres fijar un precio, tienes datos de percepción de precio (las 4 preguntas PSM) y buscas el rango psicológico aceptable. Esta técnica, desarrollada por Peter van Westendorp (1976), es precisamente el instrumento diseñado para este tipo de decisión con este tipo de datos.`;
      } else {
        msg=`<strong style="color:#d97706">⚠ Revisemos tu selección</strong><br><br>`;
        if(q1!=='precio')msg+=`La decisión de la empresa es fijar el precio de lanzamiento, lo cual corresponde a la opción "Fijar o revisar el precio de un producto".<br>`;
        if(q2!=='precios_percibidos')msg+=`Los datos disponibles son las respuestas de los encuestados a las 4 preguntas de precio (muy barato, barato, caro, muy caro), que son precios percibidos.<br>`;
        if(q3!=='rango_precios')msg+=`El objetivo es conocer el rango de precios que el mercado percibe como aceptable, no importancias de atributos ni cuotas de mercado.<br>`;
        msg+=`<br>La técnica recomendada es <strong>Sensibilidad de Precios (Van Westendorp PSM)</strong>, que es exactamente el instrumento diseñado para transformar esas percepciones de precio en un rango estratégico accionable.`;
      }
    } else {
      if(isCorrect){
        msg=`<strong style="color:var(--g)">✓ Correct selection: Price Sensitivity (Van Westendorp PSM)</strong><br><br>All three answers point to the Price Sensitivity Meter: you want to set a price, you have price-perception data (the 4 PSM questions), and you're looking for the psychological acceptable range. This technique, developed by Peter van Westendorp (1976), is precisely the instrument designed for this type of decision with this type of data.`;
      } else {
        msg=`<strong style="color:#d97706">⚠ Let's review your selection</strong><br><br>`;
        if(q1!=='precio')msg+=`The company's decision is to set the launch price, which corresponds to "Set or review a product price."<br>`;
        if(q2!=='precios_percibidos')msg+=`The available data is respondents' answers to the 4 price questions (too cheap, cheap, expensive, too expensive), which are perceived prices.<br>`;
        if(q3!=='rango_precios')msg+=`The goal is to know the price range the market perceives as acceptable, not attribute importances or market shares.<br>`;
        msg+=`<br>The recommended technique is <strong>Price Sensitivity (Van Westendorp PSM)</strong>, which is exactly the instrument designed to turn those price perceptions into an actionable strategic range.`;
      }
    }
  } else if(eng==='nms'){
    // ── Caso NMS: la salida esperada es demanda e ingresos, no solo el rango
    const isCorrect=q1==='precio'&&q2==='precios_percibidos'&&q3==='demanda_ingresos';
    if(_lang==='es'){
      if(isCorrect){
        msg=`<strong style="color:var(--g)">✓ Selección correcta: Sensibilidad de Precios + Newton-Miller-Smith (NMS)</strong><br><br>Tu objetivo no es solo conocer el rango aceptable —eso ya lo resolvió el PSM clásico—, sino estimar cuántas personas comprarían y qué ingresos generaría cada precio posible. Eso requiere la extensión NMS, que agrega intención de compra al PSM para construir curvas de demanda y revenue.`;
      } else {
        msg=`<strong style="color:#d97706">⚠ Revisemos tu selección</strong><br><br>`;
        if(q1!=='precio')msg+=`La decisión de la empresa sigue siendo de precio, pero esta vez el objetivo es comparar dos posibles precios óptimos (trial vs. revenue), no solo fijar uno.<br>`;
        if(q2!=='precios_percibidos')msg+=`Los datos disponibles siguen siendo percepciones de precio, pero ahora incluyen también intención de compra en escala Likert.<br>`;
        if(q3!=='demanda_ingresos')msg+=`El resultado que necesitas no es solo el rango aceptable (eso ya lo tienes del PSM) — necesitas estimar demanda e ingresos por nivel de precio para poder comparar objetivos gerenciales.<br>`;
        msg+=`<br>La técnica recomendada es <strong>Sensibilidad de Precios + Newton-Miller-Smith (NMS)</strong>, que extiende el PSM clásico agregando 2 preguntas de intención de compra para estimar curvas de demanda y de ingresos.`;
      }
    } else {
      if(isCorrect){
        msg=`<strong style="color:var(--g)">✓ Correct selection: Price Sensitivity + Newton-Miller-Smith (NMS)</strong><br><br>Your goal isn't just knowing the acceptable range — the classic PSM already solved that — but estimating how many people would buy and what revenue each possible price would generate. That requires the NMS extension, which adds purchase intent to the PSM to build demand and revenue curves.`;
      } else {
        msg=`<strong style="color:#d97706">⚠ Let's review your selection</strong><br><br>`;
        if(q1!=='precio')msg+=`The company's decision is still about price, but this time the goal is to compare two possible optimal prices (trial vs. revenue), not just set one.<br>`;
        if(q2!=='precios_percibidos')msg+=`The available data is still price perceptions, but now it also includes purchase intent on a Likert scale.<br>`;
        if(q3!=='demanda_ingresos')msg+=`The result you need isn't just the acceptable range (you already have that from the PSM) — you need to estimate demand and revenue by price level to compare managerial objectives.<br>`;
        msg+=`<br>The recommended technique is <strong>Price Sensitivity + Newton-Miller-Smith (NMS)</strong>, which extends the classic PSM by adding 2 purchase-intent questions to estimate demand and revenue curves.`;
      }
    }
  } else if(eng==='maxdiff'){
    // ── Caso MaxDiff: la salida esperada es importancia relativa de criterios
    const isCorrect=q1==='preferencia'&&q2==='mejorpeor'&&q3==='importancias';
    if(_lang==='es'){
      if(isCorrect){
        msg=`<strong style="color:var(--g)">✓ Selección correcta: Best-Worst Scaling (MaxDiff)</strong><br><br>Las tres respuestas apuntan a MaxDiff: quieres identificar qué criterios pesan más en la decisión, tienes (o puedes recolectar) datos de elecciones mejor/peor en subconjuntos pequeños, y buscas un ranking de importancia relativa. Esta técnica, desarrollada por Louviere y Woodworth (1991), evita los sesgos de las escalas Likert y del ranking directo.`;
      } else {
        msg=`<strong style="color:#d97706">⚠ Revisemos tu selección</strong><br><br>`;
        if(q1!=='preferencia')msg+=`La decisión de la empresa es priorizar en qué invertir primero, lo cual corresponde a "Identificar atributos más valorados".<br>`;
        if(q2!=='mejorpeor')msg+=`Los datos necesarios son elecciones de mejor/peor criterio dentro de subconjuntos pequeños — no elecciones entre perfiles completos de producto ni datos binarios de uso.<br>`;
        if(q3!=='importancias')msg+=`El resultado esperado es un ranking de importancia relativa entre los criterios, no un rango de precios ni una cuota de mercado.<br>`;
        msg+=`<br>La técnica recomendada es <strong>Best-Worst Scaling (MaxDiff)</strong>, que es exactamente el instrumento diseñado para priorizar atributos sin los sesgos de Likert o del ranking directo.`;
      }
    } else {
      if(isCorrect){
        msg=`<strong style="color:var(--g)">✓ Correct selection: Best-Worst Scaling (MaxDiff)</strong><br><br>All three answers point to MaxDiff: you want to identify which criteria matter most in the decision, you have (or can collect) best/worst choice data within small subsets, and you're looking for a relative-importance ranking. This technique, developed by Louviere and Woodworth (1991), avoids the biases of Likert scales and direct ranking.`;
      } else {
        msg=`<strong style="color:#d97706">⚠ Let's review your selection</strong><br><br>`;
        if(q1!=='preferencia')msg+=`The company's decision is prioritizing what to invest in first, which corresponds to "Identify the most valued attributes."<br>`;
        if(q2!=='mejorpeor')msg+=`The data needed is best/worst criterion choices within small subsets — not choices between full product profiles or binary usage data.<br>`;
        if(q3!=='importancias')msg+=`The expected result is a relative-importance ranking among the criteria, not a price range or a market share.<br>`;
        msg+=`<br>The recommended technique is <strong>Best-Worst Scaling (MaxDiff)</strong>, which is exactly the instrument designed to prioritize attributes without the biases of Likert scales or direct ranking.`;
      }
    }
  } else if(eng==='turf'){
    // ── Caso TURF: optimización de portafolio, datos binarios, resultado = alcance máximo
    const isCorrect=q1==='portafolio'&&q2==='binaria'&&q3==='alcance';
    if(_lang==='es'){
      if(isCorrect){
        msg=`<strong style="color:var(--g)">✓ Selección correcta: TURF Analysis (Alcance y Frecuencia No Duplicados)</strong><br><br>Las tres respuestas apuntan a TURF: quieres optimizar un portafolio de productos, tienes datos binarios de disposición de compra (sí/no por variante), y buscas maximizar el alcance de mercado combinado. Esta técnica evalúa sistemáticamente todas las combinaciones posibles de k ítems y encuentra la que cubre a más consumidores distintos.`;
      } else {
        msg=`<strong style="color:#d97706">⚠ Revisemos tu selección</strong><br><br>`;
        if(q1!=='portafolio')msg+=`La decisión de la empresa es de portafolio: ¿qué variantes lanzar para llegar a más consumidores distintos? Corresponde a "Optimizar un portafolio de productos".<br>`;
        if(q2!=='binaria')msg+=`Los datos necesarios para TURF son binarios: para cada encuestado, ¿compraría (1) o no compraría (0) cada variante? No son rangos, ni elecciones entre perfiles completos.<br>`;
        if(q3!=='alcance')msg+=`El resultado esperado es el máximo alcance de mercado con k variantes — no importancias relativas (eso es MaxDiff) ni cuota de mercado (eso es Conjoint).<br>`;
        msg+=`<br>La técnica recomendada es <strong>TURF Analysis</strong>, que evalúa todas las combinaciones posibles de variantes y calcula el alcance de mercado no duplicado de cada una.`;
      }
    } else {
      if(isCorrect){
        msg=`<strong style="color:var(--g)">✓ Correct selection: TURF Analysis (Total Unduplicated Reach & Frequency)</strong><br><br>All three answers point to TURF: you want to optimize a product portfolio, you have binary purchase-intent data (yes/no per variant), and you're looking to maximize combined market reach. This technique systematically evaluates all possible k-item combinations and finds the one that covers the most distinct consumers.`;
      } else {
        msg=`<strong style="color:#d97706">⚠ Let's review your selection</strong><br><br>`;
        if(q1!=='portafolio')msg+=`The company's decision is a portfolio decision: which variants to launch to reach the most distinct consumers? This corresponds to "Optimize a product portfolio."<br>`;
        if(q2!=='binaria')msg+=`The data TURF needs is binary: for each respondent, would they buy (1) or not buy (0) each variant? Not ratings, nor choices between complete profiles.<br>`;
        if(q3!=='alcance')msg+=`The expected result is maximum market reach with k variants — not relative importances (that's MaxDiff) or market share (that's Conjoint).<br>`;
        msg+=`<br>The recommended technique is <strong>TURF Analysis</strong>, which evaluates all possible variant combinations and calculates the unduplicated market reach of each one.`;
      }
    }
  }
  txt.innerHTML=msg;
  rec.style.display='block';
  document.getElementById('edu-meth-next').disabled=false;
}

// ══════════════════════════════════════════════════
// PASO 3 — PRETEST
// ══════════════════════════════════════════════════
function renderQuiz(containerId,stateArr,prefix){
  const c=document.getElementById(containerId);
  c.innerHTML='';
  EDU_QUESTIONS.forEach((q,qi)=>{
    const div=document.createElement('div');
    div.className='quiz-q';
    div.innerHTML=`<div class="quiz-q-num">${q.num} de ${EDU_QUESTIONS.length}</div>
      <div class="quiz-q-text">${q.texto}</div>
      ${q.opciones.map((o,oi)=>`
        <div class="quiz-opt" id="${prefix}-opt-${qi}-${oi}" onclick="selectQuizOpt(${qi},${oi},'${prefix}',${JSON.stringify(stateArr).replace(/'/g,"\\'")})" >
          <input type="radio" name="${prefix}-q${qi}" value="${oi}"> ${o}
        </div>`).join('')}
      <div id="${prefix}-fb-${qi}" style="display:none"></div>`;
    c.appendChild(div);
  });
  updateQuizBtn(prefix,stateArr);
}

function selectQuizOpt(qi,oi,prefix,stateArr){
  const arr=prefix==='pre'?S.edu.pretest:S.edu.postest;
  if((prefix==='pre'&&S.edu.pretestSubmitted)||(prefix==='post'&&S.edu.posttestSubmitted))return;
  arr[qi]=oi;
  // Actualizar visual
  EDU_QUESTIONS[qi].opciones.forEach((_,j)=>{
    const el=document.getElementById(`${prefix}-opt-${qi}-${j}`);
    if(el)el.classList.toggle('selected',j===oi);
  });
  updateQuizBtn(prefix,arr);
}

function updateQuizBtn(prefix,arr){
  const allAnswered=arr.every(v=>v!==null);
  const btn=document.getElementById(prefix==='pre'?'edu-pretest-btn':'edu-postest-btn');
  if(btn)btn.disabled=!allAnswered;
}

function submitPretest(){
  S.edu.pretestSubmitted=true;
  document.getElementById('edu-pretest-btn').disabled=true;
  // Mostrar feedback por pregunta
  EDU_QUESTIONS.forEach((q,qi)=>{
    const sel=S.edu.pretest[qi];
    const isOk=sel===q.correcta;
    const optEl=document.getElementById(`pre-opt-${qi}-${sel}`);
    const corrEl=document.getElementById(`pre-opt-${qi}-${q.correcta}`);
    if(optEl)optEl.classList.add(isOk?'correct':'wrong');
    if(!isOk&&corrEl)corrEl.classList.add('correct');
    const fbEl=document.getElementById(`pre-fb-${qi}`);
    if(fbEl){fbEl.style.display='block';fbEl.className=`quiz-feedback ${isOk?'quiz-fb-correct':'quiz-fb-wrong'}`;fbEl.textContent=isOk?q.feedback_correcto:q.feedback_incorrecto;}
  });
  // Preparar datos del caso y avanzar
  const cs=EDU_CASES[S.edu.caseId];
  if(cs.engine==='maxdiff'){
    const{design,data}=cs.genData();
    S.m.items=cs.items.map(it=>ce(it));
    S.m.design=design;
    S.m.data=data;
  } else if(cs.engine==='turf'){
    const data=cs.genData();
    S.turf.items=cs.items.map(it=>ce(it));
    S.turf.data=data;
  } else if(cs.engine==='conjoint'){
    const gen=cs.genData();
    S.c.attrs=gen.attrs;
    S.c.design=gen.design;
    S.c.data=gen.data;
    S.c.vers=gen.design.length;
    S.c.res=null;
  } else {
    const generated=cs.genData();
    if(cs.engine==='nms'){ S.nms.data=generated; }
    else { S.vw.data=generated; }
  }
  gEdu(4);
  renderEduInstrument();
  renderEduDiag();
}

// ══════════════════════════════════════════════════
// PASO 4 — DIAGNÓSTICO DE DATOS
// ══════════════════════════════════════════════════
// ══════════════════════════════════════════════════
// DETECCIÓN DE VALORES ATÍPICOS — RANGO IQR
// Reutilizable en Modo Aprendizaje y Modo Cálculo
// ══════════════════════════════════════════════════
function quartile(sortedArr,q){
  const pos=(sortedArr.length-1)*q;
  const base=Math.floor(pos),rest=pos-base;
  if(sortedArr[base+1]!==undefined)return sortedArr[base]+rest*(sortedArr[base+1]-sortedArr[base]);
  return sortedArr[base];
}
function iqrBounds(values){
  const sorted=[...values].sort((a,b)=>a-b);
  const q1=quartile(sorted,0.25),q3=quartile(sorted,0.75);
  const iqr=q3-q1;
  return{q1,q3,iqr,lower:q1-1.5*iqr,upper:q3+1.5*iqr};
}
// Detecta outliers por campo en un array de registros. fields = ['muy_barato','barato',...]
// Devuelve {bounds:{campo:{q1,q3,lower,upper}}, outliers:[{id,field,value,lower,upper}]}
function detectOutliers(records,fields,idField='id'){
  const bounds={};
  fields.forEach(f=>{ bounds[f]=iqrBounds(records.map(r=>+r[f]).filter(v=>!isNaN(v))); });
  const outliers=[];
  records.forEach(r=>{
    fields.forEach(f=>{
      const v=+r[f];
      const b=bounds[f];
      if(!isNaN(v)&&(v<b.lower||v>b.upper)){
        outliers.push({id:r[idField],field:f,value:v,lower:Math.round(b.lower*10)/10,upper:Math.round(b.upper*10)/10});
      }
    });
  });
  return{bounds,outliers};
}

// Helper: determina si el caso activo usa el motor NMS (VW + intención de compra)
// Helper: devuelve el motor de análisis del caso activo ('vw' | 'nms' | 'maxdiff')
function eduEngine(){ const cs=EDU_CASES[S.edu.caseId]; return cs?cs.engine:'vw'; }
function eduIsNMS(){ return eduEngine()==='nms'; }
function eduIsMaxDiff(){ return eduEngine()==='maxdiff'; }
function eduIsTURF(){ return eduEngine()==='turf'; }
function eduIsConjoint(){ return eduEngine()==='conjoint'; }
// Helper: devuelve el array de datos cargado para el caso activo, según su motor
function eduData(){
  const eng=eduEngine();
  if(eng==='nms')return S.nms.data;
  if(eng==='maxdiff')return S.m.data;
  if(eng==='turf')return S.turf.data;
  if(eng==='conjoint')return S.c.data;
  return S.vw.data;
}

// ══════════════════════════════════════════════════
// PASO 4 (parte 1) — INSTRUMENTO: puente entre Pretest y Diagnóstico
// Muestra qué se le preguntó realmente a los encuestados de este caso,
// para que el salto "preguntas conceptuales → datos ya procesados" no sea abrupto.
// ══════════════════════════════════════════════════
function renderEduInstrument(){
  const eng=eduEngine();
  const cs=EDU_CASES[S.edu.caseId];
  const prod=ce(cs.producto);
  let collected='',tipsKey='';

  if(eng==='nms'){
    const N=S.nms.data.length;
    collected=_lang==='es'
      ?`A cada uno de los <strong>${N} encuestados</strong> se le mostró/nombró <strong>${prod}</strong> y se le hicieron estas 6 preguntas, en este orden exacto:<br><br>
      <strong>1-4 (PSM clásico):</strong> ¿A qué precio te parece tan barato que dudarías de la calidad? · ¿A qué precio te parece barato y una buena compra? · ¿A qué precio empieza a parecerte caro, aunque aún lo considerarías? · ¿A qué precio es tan caro que no lo comprarías?<br><br>
      <strong>5-6 (NMS, adicionales):</strong> Usando el precio "barato" que el propio encuestado indicó en la pregunta 2, se le preguntó qué tan probable era que lo comprara (escala 1-5). Lo mismo se repitió con el precio "caro" de la pregunta 3.`
      :`Each of the <strong>${N} respondents</strong> was shown/told about <strong>${prod}</strong> and asked these 6 questions, in this exact order:<br><br>
      <strong>1-4 (classic PSM):</strong> At what price does this seem so cheap you'd doubt its quality? · At what price does it seem cheap and a good deal? · At what price does it start to seem expensive, though you'd still consider it? · At what price is it so expensive you wouldn't buy it?<br><br>
      <strong>5-6 (NMS, additional):</strong> Using the "cheap" price that same respondent gave in question 2, they were asked how likely they'd be to buy it (1-5 scale). The same was repeated with the "expensive" price from question 3.`;
    tipsKey='edu.instr.nms.tips';
  } else if(eng==='maxdiff'){
    const N=S.m.data.length,items=S.m.items,M=items.length;
    const listHtml=items.map((it,i)=>`<span class="tm" style="display:inline-block;margin:.15rem .3rem .15rem 0">${i+1}. ${it}</span>`).join('');
    collected=_lang==='es'
      ?`A cada uno de los <strong>${N} encuestados</strong> se le mostraron varias tarjetas, cada una con 4 de estos <strong>${M} ítems</strong>:<br><br>${listHtml}<br><br>En cada tarjeta, debía elegir cuál le parecía <strong>MÁS</strong> importante y cuál <strong>MENOS</strong> importante. Nadie vio todas las combinaciones posibles — cada encuestado respondió solo un subconjunto de tarjetas.`
      :`Each of the <strong>${N} respondents</strong> was shown several cards, each with 4 of these <strong>${M} items</strong>:<br><br>${listHtml}<br><br>On each card, they had to choose which seemed <strong>MOST</strong> important and which <strong>LEAST</strong> important. No one saw every possible combination — each respondent answered only a subset of cards.`;
    tipsKey='edu.instr.maxdiff.tips';
  } else if(eng==='turf'){
    const N=S.turf.data.length,items=S.turf.items,M=items.length;
    const listHtml=items.map((it,i)=>`<span class="tm" style="display:inline-block;margin:.15rem .3rem .15rem 0">${i+1}. ${it}</span>`).join('');
    collected=_lang==='es'
      ?`A cada uno de los <strong>${N} encuestados</strong> se le preguntó, para cada uno de estos <strong>${M} ítems</strong>, si lo incluiría en su combinación ideal:<br><br>${listHtml}<br><br>La respuesta fue binaria: Sí (1) o No (0) para cada ítem, de forma independiente.`
      :`Each of the <strong>${N} respondents</strong> was asked, for each of these <strong>${M} items</strong>, whether they would include it in their ideal combination:<br><br>${listHtml}<br><br>The answer was binary: Yes (1) or No (0) for each item, independently.`;
    tipsKey='edu.instr.turf.tips';
  } else if(eng==='conjoint'){
    const N=S.c.data.length,attrs=S.c.attrs;
    const attrsHtml=attrs.map(a=>`<div style="margin-bottom:.4rem"><strong>${a.name}:</strong> ${a.levels.join(' · ')}</div>`).join('');
    collected=_lang==='es'
      ?`A cada uno de los <strong>${N} encuestados</strong> se le mostraron 15 tarjetas de elección. Cada tarjeta tenía 4 planes/perfiles completos, generados combinando estos atributos y niveles, más la opción "Ninguno":<br><br>${attrsHtml}<br><br>En cada tarjeta, el encuestado elegía un solo perfil (o "Ninguno") — nunca calificaba los atributos por separado.`
      :`Each of the <strong>${N} respondents</strong> was shown 15 choice cards. Each card had 4 complete plan profiles, generated by combining these attributes and levels, plus a "None" option:<br><br>${attrsHtml}<br><br>On each card, the respondent chose a single profile (or "None") — they never rated the attributes separately.`;
    tipsKey='edu.instr.conjoint.tips';
  } else {
    // VW (default)
    const N=S.vw.data.length;
    collected=_lang==='es'
      ?`A cada uno de los <strong>${N} encuestados</strong> se le mostró/nombró <strong>${prod}</strong> y se le hicieron estas 4 preguntas, en este orden exacto:<br><br>
      1. ¿A qué precio te parece <em>tan barato</em> que dudarías de la calidad?<br>
      2. ¿A qué precio te parece <em>barato</em> y una buena compra?<br>
      3. ¿A qué precio empieza a parecerte <em>caro</em>, aunque aún lo considerarías?<br>
      4. ¿A qué precio te parece <em>tan caro</em> que no lo comprarías?`
      :`Each of the <strong>${N} respondents</strong> was shown/told about <strong>${prod}</strong> and asked these 4 questions, in this exact order:<br><br>
      1. At what price does this seem <em>so cheap</em> you'd doubt its quality?<br>
      2. At what price does it seem <em>cheap</em> and a good deal?<br>
      3. At what price does it start to seem <em>expensive</em>, though you'd still consider it?<br>
      4. At what price does it seem <em>so expensive</em> you wouldn't buy it?`;
    tipsKey='edu.instr.vw.tips';
  }

  document.getElementById('edu-instrument-content').innerHTML=`
    <div class="ititle" style="margin-bottom:.5rem">${t('edu.instr.howcollected')}</div>
    <div class="nt nti"><span class="ni">📋</span><div>${collected}</div></div>
    <div class="ititle" style="margin:1rem 0 .5rem">${t('edu.instr.howapply')}</div>
    <div class="nt ntp"><span class="ni">💡</span><span>${t(tipsKey)}</span></div>
    <div class="nt ntw" style="margin-top:.75rem"><span class="ni">🎓</span><span>${t('edu.instr.bridge')}</span></div>`;
}

function renderEduDiag(){
  if(eduIsMaxDiff()){ renderEduDiagMaxDiff(); return; }
  if(eduIsTURF()){ renderEduDiagTURF(); return; }
  if(eduIsConjoint()){ renderEduDiagConjoint(); return; }
  const data=eduData();
  const N=data.length;
  const valid=data.filter(r=>{
    const mb=+r.muy_barato,b=+r.barato,c=+r.caro,mc=+r.muy_caro;
    const baseOk=mb>0&&b>0&&c>0&&mc>0&&mb<=b&&b<=c&&c<=mc;
    if(!eduIsNMS())return baseOk;
    const ib=+r.intent_barato,ic=+r.intent_caro;
    return baseOk&&ib>=1&&ib<=5&&ic>=1&&ic<=5;
  });
  const excluded=N-valid.length;
  const pctExcl=(excluded/N*100).toFixed(1);
  // Stats rápidas
  const mean_b=valid.reduce((s,r)=>s+(+r.barato),0)/valid.length;
  const mean_c=valid.reduce((s,r)=>s+(+r.caro),0)/valid.length;
  const minP=Math.min(...valid.map(r=>+r.muy_barato));
  const maxP=Math.max(...valid.map(r=>+r.muy_caro));
  const estadoClass=excluded/N>0.15?'diag-warn':'diag-ok';
  // Detección de outliers IQR sobre los registros válidos
  const{bounds,outliers}=detectOutliers(valid,['muy_barato','barato','caro','muy_caro']);
  const cs=EDU_CASES[S.edu.caseId];
  const fieldLabel={muy_barato:_lang==='es'?'muy barato':'too cheap',barato:_lang==='es'?'barato':'cheap',caro:_lang==='es'?'caro':'expensive',muy_caro:_lang==='es'?'muy caro':'too expensive'};

  let outlierTableHtml='';
  if(outliers.length>0){
    outlierTableHtml=`<div style="overflow-x:auto;margin-top:.65rem"><table style="width:100%;border-collapse:collapse;font-size:.78rem">
      <thead><tr style="background:var(--surface)"><th style="padding:.4rem .6rem;border:1px solid var(--border);font-size:.68rem;color:var(--ink3)">${t('diag.outlier.table.id')}</th><th style="padding:.4rem .6rem;border:1px solid var(--border);font-size:.68rem;color:var(--ink3)">${t('diag.outlier.table.field')}</th><th style="padding:.4rem .6rem;border:1px solid var(--border);font-size:.68rem;color:var(--ink3)">${t('diag.outlier.table.value')}</th><th style="padding:.4rem .6rem;border:1px solid var(--border);font-size:.68rem;color:var(--ink3)">${t('diag.outlier.table.range')}</th></tr></thead>
      <tbody>${outliers.slice(0,15).map(o=>`<tr><td style="padding:.4rem .6rem;border:1px solid var(--border);font-family:monospace">#${o.id}</td><td style="padding:.4rem .6rem;border:1px solid var(--border)">${fieldLabel[o.field]}</td><td style="padding:.4rem .6rem;border:1px solid var(--border);font-family:monospace;color:#9a3412">${o.value}</td><td style="padding:.4rem .6rem;border:1px solid var(--border);font-family:monospace;font-size:.72rem;color:var(--ink3)">[${o.lower}, ${o.upper}]</td></tr>`).join('')}</tbody>
    </table></div>${outliers.length>15?`<p style="font-size:.72rem;color:var(--ink3);margin-top:.4rem">${_lang==='es'?`Mostrando 15 de ${outliers.length} valores atípicos.`:`Showing 15 of ${outliers.length} outliers.`}</p>`:''}`;
  } else {
    outlierTableHtml=`<p style="font-size:.82rem;color:var(--ink3);margin-top:.5rem">${t('diag.outlier.none')}</p>`;
  }

  document.getElementById('edu-diag-content').innerHTML=`
    <div class="nt nts" style="margin-bottom:1rem"><span class="ni">✓</span><span><strong>${t('diag.loaded')}:</strong> ${N} ${_lang==='es'?'encuestados':'respondents'} — ${t('diag.case')} "${ce(cs.titulo)}"</span></div>
    <div class="ititle" style="margin-bottom:.65rem">${t('diag.quality')}</div>
    <div class="diag-stat diag-ok"><span class="diag-stat-icon">👥</span><span class="diag-stat-label">${t('diag.total')}</span><span class="diag-stat-val">${N}</span></div>
    <div class="diag-stat ${estadoClass}"><span class="diag-stat-icon">${excluded/N>0.15?'⚠':'✓'}</span><span class="diag-stat-label">${t('diag.valid')}</span><span class="diag-stat-val">${valid.length} (${(100-+pctExcl).toFixed(1)}%)</span></div>
    <div class="diag-stat ${excluded>0?'diag-warn':'diag-ok'}"><span class="diag-stat-icon">${excluded>0?'⚠':'✓'}</span><span class="diag-stat-label">${t('diag.excluded')}</span><span class="diag-stat-val">${excluded} (${pctExcl}%)</span></div>
    <div class="diag-stat ${outliers.length>0?'diag-warn':'diag-ok'}"><span class="diag-stat-icon">${outliers.length>0?'⚠':'✓'}</span><span class="diag-stat-label">${t('diag.outliers')}</span><span class="diag-stat-val">${outliers.length}</span></div>
    <div class="diag-stat diag-ok"><span class="diag-stat-icon">💰</span><span class="diag-stat-label">${t('diag.range')}</span><span class="diag-stat-val">S/${minP} – S/${maxP}</span></div>
    <div class="diag-stat diag-ok"><span class="diag-stat-icon">📊</span><span class="diag-stat-label">${t('diag.avgcheap')}</span><span class="diag-stat-val">S/${mean_b.toFixed(1)}</span></div>
    <div class="diag-stat diag-ok"><span class="diag-stat-icon">📊</span><span class="diag-stat-label">${t('diag.avgexp')}</span><span class="diag-stat-val">S/${mean_c.toFixed(1)}</span></div>
    <div style="margin-top:1rem">
      <div class="ititle" style="margin-bottom:.5rem">${t('diag.interp.title')}</div>
      <div class="nt nti"><span class="ni">ℹ</span><span>
        ${excluded===0?t('diag.noexcl'):
        (_lang==='es'?
          `Se excluyeron ${excluded} encuestado${excluded>1?'s':''} (${pctExcl}%) por no cumplir la jerarquía de precios requerida. ${excluded/N>0.15?'Este porcentaje es alto (>15%) y podría indicar que el instrumento fue difícil de responder o que las instrucciones no fueron claras.':'Este porcentaje es aceptable (<15%) y no compromete la validez del análisis.'}`:
          `${excluded} respondent${excluded>1?'s were':' was'} excluded (${pctExcl}%) for not meeting the required price hierarchy. ${excluded/N>0.15?'This percentage is high (>15%) and could indicate the instrument was hard to answer or the instructions were unclear.':'This percentage is acceptable (<15%) and does not compromise the validity of the analysis.'}`
        )}
      </span></div>
      <div class="nt ntw"><span class="ni">🎓</span><span><strong>${t('diag.why.title')}</strong> ${t('diag.why.text')}</span></div>
      <div class="ititle" style="margin:1rem 0 .5rem">${t('diag.outlier.title')}</div>
      <p style="font-size:.82rem;color:var(--ink3);line-height:1.55;margin-bottom:.5rem">${t('diag.outlier.text')}</p>
      ${outlierTableHtml}
    </div>`;
}

// Diagnóstico específico para el motor MaxDiff: consistencia best≠worst por tarjeta
// y cobertura de aparición de cada ítem en el diseño (en vez de outliers de precio).
function renderEduDiagMaxDiff(){
  const data=S.m.data,items=S.m.items,design=S.m.design[0];
  const N=data.length;
  const ns=design.length;
  // Validez: en cada tarjeta, mejor y peor deben ser distintos y pertenecer al set mostrado
  let validResp=0,inconsistentCards=0,totalCards=0;
  data.forEach(row=>{
    let rowOk=true;
    design.forEach((set,t)=>{
      totalCards++;
      const best=row['t'+(t+1)+'_mejor'],worst=row['t'+(t+1)+'_peor'];
      const setNums=set.map(i=>i+1);
      const valid=best&&worst&&best!==worst&&setNums.includes(best)&&setNums.includes(worst);
      if(!valid){inconsistentCards++;rowOk=false;}
    });
    if(rowOk)validResp++;
  });
  const excluded=N-validResp;
  const pctExcl=(excluded/N*100).toFixed(1);
  const pctCardsInconsist=(inconsistentCards/totalCards*100).toFixed(1);
  // Cobertura: cuántas veces aparece cada ítem en el diseño (debe ser razonablemente balanceado)
  const appearances=new Array(items.length).fill(0);
  design.forEach(set=>set.forEach(idx=>appearances[idx]++));
  const minApp=Math.min(...appearances),maxApp=Math.max(...appearances);
  const cs=EDU_CASES[S.edu.caseId];
  const estadoClass=excluded/N>0.15?'diag-warn':'diag-ok';

  document.getElementById('edu-diag-content').innerHTML=`
    <div class="nt nts" style="margin-bottom:1rem"><span class="ni">✓</span><span><strong>${t('diag.loaded')}:</strong> ${N} ${_lang==='es'?'encuestados':'respondents'} — ${t('diag.case')} "${ce(cs.titulo)}"</span></div>
    <div class="ititle" style="margin-bottom:.65rem">${t('diag.quality')}</div>
    <div class="diag-stat diag-ok"><span class="diag-stat-icon">👥</span><span class="diag-stat-label">${t('diag.total')}</span><span class="diag-stat-val">${N}</span></div>
    <div class="diag-stat ${estadoClass}"><span class="diag-stat-icon">${excluded/N>0.15?'⚠':'✓'}</span><span class="diag-stat-label">${_lang==='es'?'Encuestados con todas las tarjetas consistentes':'Respondents with all cards consistent'}</span><span class="diag-stat-val">${validResp} (${(100-+pctExcl).toFixed(1)}%)</span></div>
    <div class="diag-stat ${excluded>0?'diag-warn':'diag-ok'}"><span class="diag-stat-icon">${excluded>0?'⚠':'✓'}</span><span class="diag-stat-label">${_lang==='es'?'Encuestados con al menos una tarjeta inconsistente':'Respondents with at least one inconsistent card'}</span><span class="diag-stat-val">${excluded} (${pctExcl}%)</span></div>
    <div class="diag-stat diag-ok"><span class="diag-stat-icon">🃏</span><span class="diag-stat-label">${_lang==='es'?'Tarjetas evaluadas por encuestado':'Cards evaluated per respondent'}</span><span class="diag-stat-val">${ns}</span></div>
    <div class="diag-stat diag-ok"><span class="diag-stat-icon">📋</span><span class="diag-stat-label">${_lang==='es'?'Total de criterios evaluados':'Total criteria evaluated'}</span><span class="diag-stat-val">${items.length}</span></div>
    <div class="diag-stat diag-ok"><span class="diag-stat-icon">⚖️</span><span class="diag-stat-label">${_lang==='es'?'Apariciones por criterio (mín–máx)':'Appearances per criterion (min–max)'}</span><span class="diag-stat-val">${minApp}–${maxApp}</span></div>
    <div style="margin-top:1rem">
      <div class="ititle" style="margin-bottom:.5rem">${t('diag.interp.title')}</div>
      <div class="nt nti"><span class="ni">ℹ</span><span>
        ${excluded===0?
          (_lang==='es'?'Todos los encuestados respondieron de forma consistente: en cada tarjeta, eligieron un "mejor" y un "peor" distintos dentro de las opciones mostradas.':'All respondents answered consistently: on each card, they chose a distinct "best" and "worst" within the options shown.'):
          (_lang==='es'?
            `Se identificaron ${excluded} encuestado${excluded>1?'s':''} (${pctExcl}%) con al menos una tarjeta inconsistente (${pctCardsInconsist}% del total de tarjetas). Una tarjeta es inconsistente cuando el "mejor" y el "peor" elegidos son iguales o no pertenecen al subconjunto mostrado.`:
            `${excluded} respondent${excluded>1?'s were':' was'} identified (${pctExcl}%) with at least one inconsistent card (${pctCardsInconsist}% of all cards). A card is inconsistent when the chosen "best" and "worst" are the same or don't belong to the subset shown.`
          )}
      </span></div>
      <div class="nt ntw"><span class="ni">🎓</span><span><strong>${_lang==='es'?'¿Por qué revisamos la cobertura de aparición?':'Why do we check appearance coverage?'}</strong> ${_lang==='es'?'Para que el ranking final sea estadísticamente confiable, cada criterio debe aparecer un número similar de veces a lo largo del diseño de tarjetas. Una cobertura muy desigual (por ejemplo, un ítem que aparece muchas más veces que otro) puede sesgar su puntaje hacia arriba o hacia abajo sin reflejar su verdadera importancia.':'For the final ranking to be statistically reliable, each criterion must appear a similar number of times across the card design. Very uneven coverage (e.g., an item appearing far more often than another) can bias its score up or down without reflecting its true importance.'}</span></div>
    </div>`;
}

// ══════════════════════════════════════════════════
// PASO 5 — ANÁLISIS Y RESULTADOS POR CAPAS
// ══════════════════════════════════════════════════
function runEduAnalysis(){
  if(eduIsTURF()){
    runTURF();
    S.edu.analysisSnapshot=S.turf.res;
  } else if(eduIsMaxDiff()){
    analyzeM();
    S.edu.analysisSnapshot=S.m.res;
  } else if(eduIsNMS()){
    analyzeNMS();
    S.edu.analysisSnapshot=S.nms.res;
  } else if(eduIsConjoint()){
    analyzeC();
    S.edu.analysisSnapshot=S.c.res;
  } else {
    analyzeVW();
    S.edu.analysisSnapshot=S.vw.res;
  }
  renderEduResults();
  gEdu(5);
}

// ══════════════════════════════════════════════════
// RESULTADOS — MOTOR MAXDIFF (ranking de importancia)
// ══════════════════════════════════════════════════
// Diagnóstico específico para el motor TURF: validación binaria (0/1)
// y estadísticas básicas de popularidad individual por ítem.
function renderEduDiagTURF(){
  const data=S.turf.data,items=S.turf.items,N=data.length;
  // Validez: valores deben ser 0 o 1, y cada fila debe tener al menos un 1
  let valid=0,zeroRows=0;
  data.forEach(row=>{
    const anyBuy=row.values.some(v=>v===1);
    const validVals=row.values.every(v=>v===0||v===1);
    if(validVals&&anyBuy) valid++;
    else if(validVals&&!anyBuy) zeroRows++;
  });
  const excluded=N-valid;
  // Popularidad individual de cada ítem
  const pops=items.map((it,j)=>({it,pct:(data.filter(r=>r.values[j]===1).length/N*100)}));
  const avgItems=(data.reduce((s,r)=>s+r.values.reduce((a,b)=>a+b,0),0)/N).toFixed(1);
  const cs=EDU_CASES[S.edu.caseId];
  const estadoClass=excluded/N>0.10?'diag-warn':'diag-ok';
  document.getElementById('edu-diag-content').innerHTML=`
    <div class="nt nts" style="margin-bottom:1rem"><span class="ni">✓</span><span><strong>${t('diag.loaded')}:</strong> ${N} ${_lang==='es'?'encuestados':'respondents'} — ${t('diag.case')} "${ce(cs.titulo)}"</span></div>
    <div class="ititle" style="margin-bottom:.65rem">${t('diag.quality')}</div>
    <div class="diag-stat diag-ok"><span class="diag-stat-icon">👥</span><span class="diag-stat-label">${t('diag.total')}</span><span class="diag-stat-val">${N}</span></div>
    <div class="diag-stat ${estadoClass}"><span class="diag-stat-icon">${excluded>0?'⚠':'✓'}</span><span class="diag-stat-label">${_lang==='es'?'Respuestas válidas (al menos 1 sabor elegido)':'Valid responses (at least 1 flavor chosen)'}</span><span class="diag-stat-val">${valid} (${(valid/N*100).toFixed(1)}%)</span></div>
    <div class="diag-stat ${zeroRows>0?'diag-warn':'diag-ok'}"><span class="diag-stat-icon">${zeroRows>0?'⚠':'✓'}</span><span class="diag-stat-label">${_lang==='es'?'Encuestados que no eligieron ningún sabor':'Respondents who chose no flavor'}</span><span class="diag-stat-val">${zeroRows}</span></div>
    <div class="diag-stat diag-ok"><span class="diag-stat-icon">🛒</span><span class="diag-stat-label">${_lang==='es'?'Promedio de sabores elegidos por encuestado':'Average flavors chosen per respondent'}</span><span class="diag-stat-val">${avgItems}</span></div>
    <div class="diag-stat diag-ok"><span class="diag-stat-icon">🍓</span><span class="diag-stat-label">${_lang==='es'?'Sabor más popular individualmente':'Most individually popular flavor'}</span><span class="diag-stat-val">${pops.reduce((a,b)=>a.pct>b.pct?a:b).it} (${pops.reduce((a,b)=>a.pct>b.pct?a:b).pct.toFixed(0)}%)</span></div>
    <div style="margin-top:1rem">
      <div class="ititle" style="margin-bottom:.5rem">${_lang==='es'?'Popularidad individual de cada sabor':'Individual popularity of each flavor'}</div>
      ${pops.sort((a,b)=>b.pct-a.pct).map(p=>`<div class="diag-stat diag-ok" style="margin-bottom:.3rem"><span class="diag-stat-icon">🍶</span><span class="diag-stat-label">${p.it}</span><span class="diag-stat-val">${p.pct.toFixed(1)}%</span></div>`).join('')}
      <div class="nt ntw" style="margin-top:.75rem"><span class="ni">🎓</span><span><strong>${_lang==='es'?'¿Por qué mostramos la popularidad individual?':'Why do we show individual popularity?'}</strong> ${_lang==='es'?'Para que puedas comparar, al ver los resultados TURF, qué portafolio es el óptimo y en qué difiere de simplemente elegir los sabores más populares individualmente. Esa comparación es la lección central del caso.':'So that when you see the TURF results, you can compare what the optimal portfolio is and how it differs from simply choosing the most individually popular flavors. That comparison is the central lesson of this case.'}</span></div>
    </div>`;
}

// ══════════════════════════════════════════════════
// DIAGNÓSTICO CBC CONJOINT
// ══════════════════════════════════════════════════
function renderEduDiagConjoint(){
  const attrs=S.c.attrs,data=S.c.data,design=S.c.design;
  const N=data.length,T=15,P=4;
  const cs=EDU_CASES[S.edu.caseId];
  const isEs=_lang==='es';
  let ningunoCount=0;
  const posDist=[0,0,0,0];
  const totalChoices=N*T;
  data.forEach(row=>{
    const v=Math.min((row.version||1)-1,design.length-1);
    for(let t=1;t<=T;t++){
      const ch=row['tarea_'+t];
      if(ch===0)ningunoCount++;
      else if(ch>=1&&ch<=4)posDist[ch-1]++;
    }
  });
  const nPct=(ningunoCount/totalChoices*100).toFixed(1);
  const nWarn=ningunoCount/totalChoices>0.30;
  const posMax=Math.max(...posDist),posMin=Math.min(...posDist);
  const posWarn=(posMax-posMin)/totalChoices*100>8;
  document.getElementById('edu-diag-content').innerHTML=`
    <div class="nt nts" style="margin-bottom:1rem"><span class="ni">✓</span><span><strong>${t('diag.loaded')}:</strong> ${N} ${isEs?'encuestados':'respondents'} — ${t('diag.case')} "${ce(cs.titulo)}"</span></div>
    <div class="ititle" style="margin-bottom:.65rem">${t('diag.quality')}</div>
    <div class="diag-stat diag-ok"><span class="diag-stat-icon">👥</span><span class="diag-stat-label">${t('diag.total')}</span><span class="diag-stat-val">${N}</span></div>
    <div class="diag-stat diag-ok"><span class="diag-stat-icon">📋</span><span class="diag-stat-label">${isEs?'Tareas por encuestado':'Tasks per respondent'}</span><span class="diag-stat-val">${T}</span></div>
    <div class="diag-stat diag-ok"><span class="diag-stat-icon">🎯</span><span class="diag-stat-label">${isEs?'Opciones por tarea':'Options per task'}</span><span class="diag-stat-val">${P} ${isEs?'productos + Ninguno':'products + None'}</span></div>
    <div class="diag-stat diag-ok"><span class="diag-stat-icon">🔢</span><span class="diag-stat-label">${isEs?'Total de elecciones observadas':'Total observed choices'}</span><span class="diag-stat-val">${totalChoices}</span></div>
    <div class="diag-stat ${nWarn?'diag-warn':'diag-ok'}"><span class="diag-stat-icon">${nWarn?'⚠':'✓'}</span><span class="diag-stat-label">${isEs?'Frecuencia de "Ninguno"':'Frequency of "None"'}</span><span class="diag-stat-val">${ningunoCount} (${nPct}%)</span></div>
    <div class="diag-stat ${posWarn?'diag-warn':'diag-ok'}"><span class="diag-stat-icon">${posWarn?'⚠':'✓'}</span><span class="diag-stat-label">${isEs?'Balance por posición':'Position balance'}</span><span class="diag-stat-val">${posWarn?(isEs?'Desequilibrio detectado':'Imbalance detected'):(isEs?'Equilibrado':'Balanced')}</span></div>
    <div style="margin-top:1rem">
      <div class="ititle" style="margin-bottom:.5rem">${isEs?'Distribución de elecciones por posición':'Choice distribution by position'}</div>
      ${posDist.map((c,i)=>`<div class="diag-stat diag-ok" style="margin-bottom:.3rem"><span class="diag-stat-icon">📍</span><span class="diag-stat-label">${isEs?'Posición':'Position'} ${i+1}</span><span class="diag-stat-val">${c} (${(c/totalChoices*100).toFixed(1)}%)</span></div>`).join('')}
      <div class="nt nti" style="margin-top:.75rem"><span class="ni">🎓</span><span><strong>${isEs?'¿Por qué revisamos la distribución por posición?':'Why do we check the position distribution?'}</strong> ${isEs?'En un estudio CBC sin sesgo, la elección debería ser independiente de la posición del perfil en pantalla. Una distribución aproximadamente equilibrada entre las 4 posiciones confirma que el diseño experimental es sólido y que los resultados son confiables.':'In an unbiased CBC study, choices should be independent of the profile\'s position on screen. A roughly balanced distribution across the 4 positions confirms the experimental design is sound and that results are reliable.'}</span></div>
    </div>`;
}
// ══════════════════════════════════════════════════
// RESULTADOS CBC CONJOINT — 3 CAPAS
// ══════════════════════════════════════════════════
function renderEduResultsConjoint(){
  const res=S.edu.analysisSnapshot;
  if(!res)return;
  const{utils,imp}=res;
  const attrs=S.c.attrs;
  const cs=EDU_CASES[S.edu.caseId];
  const isEs=_lang==='es';
  // Ordenar atributos por importancia descendente
  const attrsOrd=[...attrs].sort((a,b)=>(imp[b.name]||0)-(imp[a.name]||0));
  // Configuración óptima: nivel con mayor utilidad por atributo
  const optCfg={};
  attrs.forEach(a=>{
    const levels=Object.entries(utils[a.name]||{}).sort((x,y)=>y[1]-x[1]);
    optCfg[a.name]=levels[0]?.[0]||a.levels[0];
  });
  // Configuración media: nivel intermedio
  const medCfg={};
  attrs.forEach(a=>{
    const levels=Object.entries(utils[a.name]||{}).sort((x,y)=>y[1]-x[1]);
    medCfg[a.name]=levels[Math.floor(levels.length/2)]?.[0]||a.levels[0];
  });
  // Plan económico: precio óptimo + todo lo demás en nivel mínimo
  const priceAttrName=S.c.priceAttr||attrs[0].name;
  const ecoP={};
  attrs.forEach(a=>{
    const byUtil=Object.entries(utils[a.name]||{}).sort((x,y)=>y[1]-x[1]);
    ecoP[a.name]=a.name===priceAttrName?byUtil[0]?.[0]:byUtil[byUtil.length-1]?.[0]||a.levels[0];
  });
  // Plan diferenciado: precio mínimo + mejores beneficios funcionales
  const difP={};
  attrs.forEach(a=>{
    const byUtil=Object.entries(utils[a.name]||{}).sort((x,y)=>y[1]-x[1]);
    difP[a.name]=a.name===priceAttrName?byUtil[byUtil.length-1]?.[0]:byUtil[0]?.[0]||a.levels[0];
  });
  // Calcular shares con modelo MNL
  const sh1=calcShare([optCfg,medCfg,null]);
  const sh2=calcShare([ecoP,difP,null]);
  // ── CAPA TÉCNICA ─────────────────────────────────
  const maxImp=Math.max(...attrsOrd.map(a=>imp[a.name]||0));
  let tecHtml=`
    <div class="ititle" style="margin-bottom:.65rem">${isEs?'Importancias relativas (% de la variación total en elecciones)':'Relative importances (% of total variation in choices)'}</div>
    ${attrsOrd.map((a,i)=>{
      const pct=imp[a.name]||0;
      const barW=Math.round(pct/maxImp*100);
      return `<div style="margin-bottom:.55rem">
        <div style="display:flex;justify-content:space-between;font-size:.75rem;margin-bottom:.2rem"><span style="font-weight:600">${a.name}</span><span style="font-family:'Geist Mono',monospace;font-weight:700;color:${COLS[i]}">${pct.toFixed(1)}%</span></div>
        <div style="background:var(--border);border-radius:3px;height:10px"><div style="background:${COLS[i]};width:${barW}%;height:10px;border-radius:3px"></div></div>
      </div>`;
    }).join('')}
    <div class="dvd" style="margin:1.1rem 0"></div>
    <div class="ititle" style="margin-bottom:.65rem">${isEs?'Utilidades parciales por atributo':'Partial utilities by attribute'}</div>
    ${attrsOrd.map((a,ai)=>{
      const levels=Object.entries(utils[a.name]||{}).sort((x,y)=>y[1]-x[1]);
      const maxU=Math.max(...levels.map(l=>Math.abs(l[1])));
      return `<div style="margin-bottom:1rem;padding:.6rem .75rem;background:var(--surface);border:1px solid var(--border);border-radius:6px;border-left:3px solid ${COLS[ai]}">
        <div style="font-size:.7rem;font-family:'Geist Mono',monospace;letter-spacing:.06em;color:${COLS[ai]};margin-bottom:.5rem;text-transform:uppercase">${a.name}</div>
        ${levels.map(([l,u])=>{
          const halfPct=maxU>0?Math.round(Math.abs(u)/maxU*100):0;
          const isPos=u>=0;
          const bar=`<div style="display:flex;width:116px;align-items:center;flex-shrink:0">
            <div style="width:57px;display:flex;justify-content:flex-end">
              ${!isPos?`<div style="width:${halfPct}%;height:8px;background:#c8430a;border-radius:2px 0 0 2px"></div>`:''}
            </div>
            <div style="width:2px;height:12px;background:var(--border);flex-shrink:0"></div>
            <div style="width:57px">
              ${isPos?`<div style="width:${halfPct}%;height:8px;background:#1a7a4a;border-radius:0 2px 2px 0"></div>`:''}
            </div>
          </div>`;
          return `<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem;font-size:.76rem">
            <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l}</span>
            ${bar}
            <span style="font-family:'Geist Mono',monospace;font-size:.7rem;color:${isPos?'#1a7a4a':'#c8430a'};width:48px;text-align:right">${u>=0?'+':''}${u.toFixed(3)}</span>
          </div>`;
        }).join('')}
      </div>`;
    }).join('')}`;
  document.getElementById('edu-results-tecnico').innerHTML=tecHtml;
  // ── CAPA INTERPRETATIVA ───────────────────────────
  const topAttr=attrsOrd[0];
  const topImp=imp[topAttr.name]||0;
  const secondAttr=attrsOrd[1];
  const optLevels=attrsOrd.map(a=>{
    const byUtil=Object.entries(utils[a.name]||{}).sort((x,y)=>y[1]-x[1]);
    return{attr:a.name,level:byUtil[0]?.[0],u:byUtil[0]?.[1]||0};
  });
  const totalOptU=optLevels.reduce((s,l)=>s+l.u,0);
  let interpHtml=`
    <div class="layer-interp-item" style="border-left-color:${COLS[0]}">
      <div class="layer-interp-label" style="color:${COLS[0]}">${isEs?`${topAttr.name} — atributo dominante (${topImp.toFixed(1)}%)`:`${topAttr.name} — dominant attribute (${topImp.toFixed(1)}%)`}</div>
      ${isEs?`Con una importancia relativa del ${topImp.toFixed(1)}%, <strong>${topAttr.name}</strong> es el atributo que más influye en la elección. Esto significa que la diferencia entre sus niveles (mejor vs peor) explica más del ${Math.round(topImp)}% de por qué los encuestados eligieron un plan sobre otro. En el diseño del producto, este es el atributo donde el error tiene mayor costo.`
      :`With a relative importance of ${topImp.toFixed(1)}%, <strong>${topAttr.name}</strong> is the attribute that most influences the choice. This means the difference between its levels (best vs worst) explains more than ${Math.round(topImp)}% of why respondents chose one plan over another. In product design, this is the attribute where getting it wrong costs the most.`}
    </div>
    <div class="layer-interp-item" style="border-left-color:${COLS[1]}">
      <div class="layer-interp-label" style="color:${COLS[1]}">${isEs?`${secondAttr.name} — segundo factor en importancia (${(imp[secondAttr.name]||0).toFixed(1)}%)`:`${secondAttr.name} — second most important factor (${(imp[secondAttr.name]||0).toFixed(1)}%)`}</div>
      ${isEs?`Los atributos distintos del precio explican en conjunto el ${(100-topImp).toFixed(0)}% restante de la variación en las elecciones. Esto indica que el consumidor no decide solo por precio — los beneficios funcionales importan. Un plan con precio competitivo pero sin beneficios puede perder frente a uno más caro con mejor propuesta funcional.`
      :`Attributes other than price together explain the remaining ${(100-topImp).toFixed(0)}% of the variation in choices. This means consumers don't decide on price alone — functional benefits matter. A competitively priced plan with no benefits may lose to a pricier one with a stronger functional proposition.`}
    </div>
    <div class="layer-interp-item">
      <div class="layer-interp-label">${isEs?'Configuración óptima — máxima utilidad percibida':'Optimal configuration — maximum perceived utility'}</div>
      ${optLevels.map(l=>`<div style="font-size:.78rem;margin-bottom:.2rem">▸ <strong>${l.attr}:</strong> ${l.level} <span style="font-family:'Geist Mono',monospace;color:#1a7a4a">(+${l.u>=0?'+':''}${l.u.toFixed(2)})</span></div>`).join('')}
      <div class="nt nti" style="margin-top:.6rem"><span class="ni">📌</span><span>${isEs?`Esta combinación tiene la utilidad total más alta del estudio (Σ = ${totalOptU.toFixed(2)}). Es el punto de referencia para la decisión de diseño — pero puede no ser financieramente viable si el precio más bajo no cubre costos. El simulador permite evaluar qué sucede al relajar alguno de los atributos.`:`This combination has the highest total utility in the study (Σ = ${totalOptU.toFixed(2)}). It is the reference point for the design decision — but may not be financially viable if the lowest price doesn't cover costs. The simulator lets you evaluate what happens when relaxing any of the attributes.`}</span></div>
    </div>`;
  document.getElementById('edu-results-interp').innerHTML=interpHtml;
  // ── CAPA GERENCIAL ────────────────────────────────
  const mgmtQ=isEs?'¿Qué plan de salud recomendarías que Salud Directa lance al mercado?':'Which health plan would you recommend Salud Directa bring to market?';
  const mgmtP=isEs?'Considerá: el atributo dominante fija el techo de aceptación, pero los atributos funcionales explican el 60% restante. Una configuración "óptima" que no es sostenible financieramente no es una recomendación — es un deseo. Una recomendación sólida especifica qué atributo conceder, por qué, y cómo eso se refleja en el share esperado.'
    :'Consider: the dominant attribute sets the ceiling of acceptance, but functional attributes explain the remaining 60%. An "optimal" configuration that isn\'t financially sustainable isn\'t a recommendation — it\'s a wish. A solid recommendation specifies which attribute to trade off, why, and how that reflects in the expected share.';
  const scLbl=isEs?['Plan Óptimo (todos los mejores niveles)','Competidor Promedio (niveles intermedios)','Ninguno']:['Optimal Plan (all best levels)','Average Competitor (middle levels)','None'];
  const sc2Lbl=isEs?['Plan Económico (menor precio, beneficios básicos)','Plan Diferenciado (mayor precio, mejores beneficios)','Ninguno']:['Economy Plan (lowest price, basic benefits)','Differentiated Plan (higher price, best benefits)','None'];
  const scColors=[COLS[0],COLS[1],'#8a8278'];
  const shareBar=(pct,col)=>`<div style="background:var(--border);border-radius:3px;height:12px;margin-top:.3rem"><div style="background:${col};width:${Math.max(2,pct)}%;height:12px;border-radius:3px"></div></div>`;
  let mgmtHtml=`
    <div class="nt ntw" style="margin-bottom:1rem"><span class="ni">🎯</span><span><strong>${isEs?'Antes de responder:':'Before answering:'}</strong> ${isEs?'Revisá los dos escenarios de simulación y pensá cuál configuración podría ofrecer Salud Directa de forma sostenible.':'Review both simulation scenarios and consider which configuration Salud Directa could sustainably offer.'}</span></div>
    <div class="layer-mgmt-q">${mgmtQ}</div>
    <p style="font-size:.84rem;color:var(--ink3);line-height:1.55;margin-bottom:1.1rem">${mgmtP}</p>
    <div class="ititle" style="margin-bottom:.6rem">${isEs?'Escenario 1 — Plan óptimo vs competidor promedio':'Scenario 1 — Optimal plan vs average competitor'}</div>
    <div style="margin-bottom:1.1rem">
      ${[sh1[0],sh1[1],sh1[2]].map((s,i)=>`
        <div style="margin-bottom:.55rem">
          <div style="display:flex;justify-content:space-between;font-size:.76rem"><span>${scLbl[i]}</span><span style="font-family:'Geist Mono',monospace;font-weight:700;color:${scColors[i]}">${s.toFixed(1)}%</span></div>
          ${shareBar(s,scColors[i])}
        </div>`).join('')}
      <div class="nt nti" style="margin-top:.5rem"><span class="ni">💡</span><span style="font-size:.76rem">${isEs?`El plan óptimo captura el ${sh1[0].toFixed(1)}% del mercado frente al ${sh1[1].toFixed(1)}% del competidor. ¿Es posible sostener ese precio con esos beneficios?`:`The optimal plan captures ${sh1[0].toFixed(1)}% of the market vs. ${sh1[1].toFixed(1)}% for the competitor. Is that price sustainable with those benefits?`}</span></div>
    </div>
    <div class="ititle" style="margin-bottom:.6rem">${isEs?'Escenario 2 — Plan económico vs plan diferenciado':'Scenario 2 — Economy plan vs differentiated plan'}</div>
    <div style="margin-bottom:1.1rem">
      ${[sh2[0],sh2[1],sh2[2]].map((s,i)=>`
        <div style="margin-bottom:.55rem">
          <div style="display:flex;justify-content:space-between;font-size:.76rem"><span>${sc2Lbl[i]}</span><span style="font-family:'Geist Mono',monospace;font-weight:700;color:${scColors[i]}">${s.toFixed(1)}%</span></div>
          ${shareBar(s,scColors[i])}
        </div>`).join('')}
      <div class="nt nti" style="margin-top:.5rem"><span class="ni">💡</span><span style="font-size:.76rem">${isEs?`El precio bajo con beneficios mínimos captura el ${sh2[0].toFixed(1)}% vs el ${sh2[1].toFixed(1)}% del plan más caro con mejores beneficios. Este escenario ilustra que el precio más bajo no siempre gana.`:`The low-price plan with minimal benefits captures ${sh2[0].toFixed(1)}% vs. ${sh2[1].toFixed(1)}% for the pricier plan with better benefits. This scenario illustrates that the lowest price doesn't always win.`}</span></div>
    </div>`;
  document.getElementById('edu-results-mgmt').innerHTML=mgmtHtml;
  renderResultsRecap();
}
// ── Resumen compacto para el paso de interpretación ──
function renderResultsRecapConjoint(){
  const res=S.edu.analysisSnapshot;
  const el=document.getElementById('edu-results-recap');
  if(!res||!el)return;
  const{utils,imp}=res;
  const attrs=S.c.attrs;
  const attrsOrd=[...attrs].sort((a,b)=>(imp[b.name]||0)-(imp[a.name]||0));
  const isEs=_lang==='es';
  let html=`<div style="grid-column:1/-1;font-family:'Geist Mono',monospace;font-size:.62rem;letter-spacing:.08em;color:var(--edu);text-transform:uppercase;margin-bottom:.2rem;">${t('recap.title')}</div>`;
  attrsOrd.forEach((a,i)=>{
    const byUtil=Object.entries(utils[a.name]||{}).sort((x,y)=>y[1]-x[1]);
    const bestLevel=byUtil[0]?.[0]||'—';
    html+=`<div class="pp-card" style="border-top:3px solid ${COLS[i]};padding:.55rem .5rem;grid-column:${i<2?'span 2':'span 2'}">
      <div class="pp-label" style="color:${COLS[i]}">${a.name}</div>
      <div class="pp-val" style="font-size:.82rem;color:${COLS[i]};margin:.2rem 0">${(imp[a.name]||0).toFixed(1)}%</div>
      <div style="font-size:.68rem;color:var(--ink3)">▸ ${bestLevel}</div>
    </div>`;
  });
  el.innerHTML=html;
}

function renderEduResultsMaxDiff(){
  const res=S.edu.analysisSnapshot;
  if(!res)return;
  const{ranked}=res;
  const cs=EDU_CASES[S.edu.caseId];
  const top3=ranked.slice(0,3);
  const bottom3=ranked.slice(-3);

  const L=_lang==='es'?{
    rankTitle:'Ranking de importancia relativa',
    rankDesc:'Cada criterio recibe un porcentaje proporcional a su importancia relativa. La suma de todos los criterios es exactamente 100%.',
    bestCount:'Veces elegido MEJOR',worstCount:'Veces elegido PEOR',netScore:'Puntaje neto',
    topTitle:'Los 3 criterios más decisivos',topDesc:'Estos son los criterios que, cuando aparecen en una tarjeta, el encuestado promedio elige consistentemente como el mejor frente a las demás opciones.',
    bottomTitle:'Los 3 criterios menos decisivos',bottomDesc:'Esto no significa que sean irrelevantes — significa que, frente a otros criterios en la misma tarjeta, casi siempre pierden. Invertir aquí primero tiene el menor retorno relativo.',
    mgmtWarn:'Lee el ranking completo antes de responder. La decisión gerencial no es "qué mejorar" en abstracto, sino en qué invertir primero con un presupuesto limitado.',
    mgmtQ:'Si Aseguradora Rumbo solo puede invertir en mejorar 2 de los 10 criterios este año, ¿en cuáles invertirías y por qué?',
    mgmtP:'Usa el ranking como evidencia. Considera también si los criterios top son cosas que la empresa puede mejorar razonablemente (precio, rapidez) versus cosas más estructurales (reputación, que toma años en construirse).',
    keyData:'Datos clave para tu decisión'
  }:{
    rankTitle:'Relative importance ranking',
    rankDesc:'Each criterion receives a percentage proportional to its relative importance. The sum of all criteria is exactly 100%.',
    bestCount:'Times chosen BEST',worstCount:'Times chosen WORST',netScore:'Net score',
    topTitle:'The 3 most decisive criteria',topDesc:'These are the criteria that, when they appear on a card, the average respondent consistently chooses as best over the other options.',
    bottomTitle:'The 3 least decisive criteria',bottomDesc:'This doesn\'t mean they\'re irrelevant — it means that, against other criteria on the same card, they almost always lose. Investing here first has the lowest relative return.',
    mgmtWarn:'Read the full ranking before answering. The managerial decision isn\'t "what to improve" in the abstract, but what to invest in first with a limited budget.',
    mgmtQ:'If Rumbo Insurance can only invest in improving 2 of the 10 criteria this year, which would you invest in and why?',
    mgmtP:'Use the ranking as evidence. Also consider whether the top criteria are things the company can reasonably improve (price, speed) versus more structural things (reputation, which takes years to build).',
    keyData:'Key data for your decision'
  };

  // ── CAPA TÉCNICA: tabla completa de ranking
  const rankRows=ranked.map(r=>`
    <tr><td style="padding:.5rem .7rem;border-bottom:1px solid var(--border);font-family:'Geist Mono',monospace;color:var(--ink3)">#${r.rank}</td>
    <td style="padding:.5rem .7rem;border-bottom:1px solid var(--border)">${r.it}</td>
    <td style="padding:.5rem .7rem;border-bottom:1px solid var(--border);text-align:center;font-family:'Geist Mono',monospace;color:var(--g)">${r.b}</td>
    <td style="padding:.5rem .7rem;border-bottom:1px solid var(--border);text-align:center;font-family:'Geist Mono',monospace;color:var(--r)">${r.w}</td>
    <td style="padding:.5rem .7rem;border-bottom:1px solid var(--border);text-align:center;font-family:'Geist Mono',monospace">${r.net}</td>
    <td style="padding:.5rem .7rem;border-bottom:1px solid var(--border);text-align:right;font-family:'Geist Mono',monospace;font-weight:600;color:var(--edu)">${r.score.toFixed(1)}%</td></tr>`).join('');
  document.getElementById('edu-results-tecnico').innerHTML=`
    <div class="ititle" style="margin-bottom:.4rem">${L.rankTitle}</div>
    <p class="cs">${L.rankDesc}</p>
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.84rem">
      <thead><tr style="background:var(--surface)"><th style="padding:.5rem .7rem;text-align:left;font-size:.7rem;color:var(--ink3)">#</th><th style="padding:.5rem .7rem;text-align:left;font-size:.7rem;color:var(--ink3)">${_lang==='es'?'Criterio':'Criterion'}</th><th style="padding:.5rem .7rem;text-align:center;font-size:.7rem;color:var(--ink3)">${L.bestCount}</th><th style="padding:.5rem .7rem;text-align:center;font-size:.7rem;color:var(--ink3)">${L.worstCount}</th><th style="padding:.5rem .7rem;text-align:center;font-size:.7rem;color:var(--ink3)">${L.netScore}</th><th style="padding:.5rem .7rem;text-align:right;font-size:.7rem;color:var(--ink3)">%</th></tr></thead>
      <tbody>${rankRows}</tbody></table></div>`;

  // ── CAPA INTERPRETATIVA
  document.getElementById('edu-results-interp').innerHTML=`
    <div class="layer-interp-item" style="border-left-color:#1a7a4a;background:var(--gl)">
      <div class="layer-interp-label" style="color:#1a7a4a">🏆 ${L.topTitle}</div>
      ${top3.map(r=>`<strong>${r.rank}. ${r.it}</strong> (${r.score.toFixed(1)}%)`).join(' · ')}
      <p style="margin-top:.5rem">${L.topDesc}</p>
    </div>
    <div class="layer-interp-item" style="border-left-color:#c8430a;background:var(--rl)">
      <div class="layer-interp-label" style="color:#c8430a">📉 ${L.bottomTitle}</div>
      ${bottom3.map(r=>`<strong>${r.rank}. ${r.it}</strong> (${r.score.toFixed(1)}%)`).join(' · ')}
      <p style="margin-top:.5rem">${L.bottomDesc}</p>
    </div>`;

  // ── CAPA GERENCIAL
  document.getElementById('edu-results-mgmt').innerHTML=`
    <div class="nt ntw" style="margin-bottom:1rem"><span class="ni">🎯</span><span><strong>${_lang==='es'?'Antes de responder:':'Before answering:'}</strong> ${L.mgmtWarn}</span></div>
    <div class="layer-mgmt-q">${L.mgmtQ}</div>
    <p style="font-size:.84rem;color:var(--ink3);line-height:1.55;margin-bottom:1rem">${L.mgmtP}</p>
    <div class="edu-brief" style="margin-bottom:0">
      <div class="edu-brief-label">${L.keyData}</div>
      ${top3.map((r,i)=>`<div class="edu-brief-row"><span class="edu-brief-key">${_lang==='es'?'Top':'Top'} ${i+1}</span><span class="edu-brief-val">${r.it} — ${r.score.toFixed(1)}%</span></div>`).join('')}
    </div>`;

  renderResultsRecap();
}

function renderResultsRecapMaxDiff(){
  const res=S.edu.analysisSnapshot;
  const el=document.getElementById('edu-results-recap');
  if(!res||!el)return;
  const top4=res.ranked.slice(0,4);
  const colors=['#c8430a','#1a7a4a','#2563a8','#7c3aed'];
  let html=`<div style="grid-column:1/-1;font-family:'Geist Mono',monospace;font-size:.62rem;letter-spacing:.08em;color:var(--edu);text-transform:uppercase;margin-bottom:.2rem;">${t('recap.title')}</div>`;
  top4.forEach((r,i)=>{
    html+=`<div class="pp-card" style="border-top:3px solid ${colors[i]};padding:.6rem .5rem;"><div class="pp-label">#${r.rank}</div><div class="pp-val" style="font-size:.95rem;color:${colors[i]};line-height:1.2">${r.score.toFixed(1)}%</div><div class="pp-desc" style="font-size:.66rem">${r.it}</div></div>`;
  });
  el.innerHTML=html;
}

function renderEduResultsTURF(){
  const res=S.edu.analysisSnapshot;
  if(!res)return;
  const{topResults,bestByK,N}=res;
  const items=S.turf.items;
  const cs=EDU_CASES[S.edu.caseId];
  // Popularidad individual de cada ítem para la comparación pedagógica
  const pops=items.map((it,j)=>({it,j,pct:(S.turf.data.filter(r=>r.values[j]===1).length/N*100)}));
  const popsSorted=[...pops].sort((a,b)=>b.pct-a.pct);
  // Portafolio óptimo de k=3 (el caso pedagógico central)
  const opt3=bestByK.find(b=>b.k===3);
  const opt3Items=opt3?opt3.best.combo:[0,1,2];
  const opt3Reach=opt3?opt3.best.reachPct:0;
  // "Portafolio naïve": los 3 más populares individualmente
  const naive3=popsSorted.slice(0,3).map(p=>p.j);
  const naiveReach=S.turf.data.filter(r=>naive3.some(j=>r.values[j]===1)).length/N*100;
  const naiveVsOpt=(opt3Reach-naiveReach).toFixed(1);

  const L=_lang==='es'?{
    portTitle:'Portafolio TURF óptimo por tamaño',portDesc:'Para cada tamaño de portafolio (k=1, 2, 3, 4...), TURF calcula la combinación de sabores que maximiza el alcance de mercado no duplicado.',
    kItems:'Sabores',kReach:'Alcance',kBest:'Portafolio óptimo',
    incTitle:'Alcance incremental en el portafolio k=3',incDesc:'Cuántos encuestados adicionales se cubren al agregar cada sabor al portafolio uno por uno, en el orden óptimo.',
    flavor:'Sabor',cumReach:'Alcance acumulado',addedBuyers:'Compradores nuevos agregados',
    compareTitle:'¿Y si elegíamos los 3 más populares?',optPortfolio:'Portafolio óptimo TURF',naivePortfolio:'Los 3 más populares individualmente',reach:'Alcance',diff:'Diferencia',
    compareNote:(d)=>d>0?`El portafolio TURF cubre ${d} pp más que elegir simplemente los 3 sabores más populares individualmente.`:`Los portafolios coinciden en este caso — los sabores más populares también son los que minimizan el solapamiento.`,
    mgmtQ:'¿Cuáles 3 sabores lanzarías al mercado — y cómo justificarías esa decisión a la gerencia?',mgmtP:'La respuesta rigurosa no es solo "los que más venden" — es la combinación que cubre a más consumidores distintos. Explica también qué pasa con Chocolate: ¿por qué no entra al portafolio óptimo a pesar de tener un 35% de popularidad individual?',
    keyData:'Datos clave para tu decisión'
  }:{
    portTitle:'Optimal TURF portfolio by size',portDesc:'For each portfolio size (k=1, 2, 3, 4...), TURF calculates the combination of flavors that maximizes unduplicated market reach.',
    kItems:'Flavors',kReach:'Reach',kBest:'Optimal portfolio',
    incTitle:'Incremental reach in the k=3 portfolio',incDesc:'How many additional respondents are covered by adding each flavor to the portfolio one at a time, in optimal order.',
    flavor:'Flavor',cumReach:'Cumulative reach',addedBuyers:'New buyers added',
    compareTitle:'What if we chose the 3 most popular?',optPortfolio:'Optimal TURF portfolio',naivePortfolio:'3 most individually popular',reach:'Reach',diff:'Difference',
    compareNote:(d)=>d>0?`The TURF portfolio covers ${d} pp more than simply choosing the 3 most individually popular flavors.`:`The portfolios coincide in this case — the most popular flavors also happen to minimize overlap.`,
    mgmtQ:'Which 3 flavors would you launch — and how would you justify that decision to management?',mgmtP:'The rigorous answer isn\'t just "the best sellers" — it\'s the combination that covers the most distinct consumers. Also explain what happens with Chocolate: why doesn\'t it enter the optimal portfolio despite having 35% individual popularity?',
    keyData:'Key data for your decision'
  };

  // ── CAPA TÉCNICA: tabla por k + gráfico de alcance
  const kRows=bestByK.map(b=>`<tr><td style="padding:.5rem .7rem;border-bottom:1px solid var(--border);font-family:monospace;color:var(--ink3)">k=${b.k}</td><td style="padding:.5rem .7rem;border-bottom:1px solid var(--border)">${b.best.combo.map(i=>items[i]).join(', ')}</td><td style="padding:.5rem .7rem;border-bottom:1px solid var(--border);text-align:right;font-family:monospace;font-weight:600;color:var(--edu)">${b.best.reachPct.toFixed(1)}%</td></tr>`).join('');
  document.getElementById('edu-results-tecnico').innerHTML=`
    <div class="ititle" style="margin-bottom:.4rem">${L.portTitle}</div>
    <p class="cs">${L.portDesc}</p>
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.84rem">
      <thead><tr style="background:var(--surface)"><th style="padding:.5rem .7rem;text-align:left;font-size:.7rem;color:var(--ink3)">k</th><th style="padding:.5rem .7rem;text-align:left;font-size:.7rem;color:var(--ink3)">${L.kBest}</th><th style="padding:.5rem .7rem;text-align:right;font-size:.7rem;color:var(--ink3)">${L.kReach}</th></tr></thead>
      <tbody>${kRows}</tbody></table></div>`;

  // ── CAPA INTERPRETATIVA: alcance incremental del portafolio k=3
  let cumReach=0, prevReach=0;
  const incRows=opt3Items.map((j,idx)=>{
    const tempPort=opt3Items.slice(0,idx+1);
    cumReach=S.turf.data.filter(r=>tempPort.some(jj=>r.values[jj]===1)).length/N*100;
    const added=cumReach-prevReach;
    prevReach=cumReach;
    return`<div class="layer-interp-item" style="border-left-color:${['#c8430a','#1a7a4a','#2563a8'][idx]}">
      <div class="layer-interp-label" style="color:${['#c8430a','#1a7a4a','#2563a8'][idx]}">${idx+1}. ${items[j]}</div>
      ${L.cumReach}: <strong>${cumReach.toFixed(1)}%</strong> · ${L.addedBuyers}: <strong>+${added.toFixed(1)} pp</strong>
    </div>`;
  });
  document.getElementById('edu-results-interp').innerHTML=`
    <div class="ititle" style="margin-bottom:.4rem">${L.incTitle}</div>
    <p class="cs">${L.incDesc}</p>
    ${incRows.join('')}
    <div class="dvd" style="margin:1.1rem 0"></div>
    <div class="ititle" style="margin-bottom:.4rem">${L.compareTitle}</div>
    <div class="pp-grid" style="grid-template-columns:1fr 1fr;gap:.65rem;margin:.75rem 0">
      <div class="pp-card" style="border-top:3px solid var(--edu)"><div class="pp-label">${L.optPortfolio}</div><div style="font-size:.82rem;font-weight:600;margin:.3rem 0">${opt3Items.map(j=>items[j]).join(' + ')}</div><div class="pp-val" style="color:var(--edu)">${opt3Reach.toFixed(1)}%</div></div>
      <div class="pp-card" style="border-top:3px solid var(--ink3)"><div class="pp-label">${L.naivePortfolio}</div><div style="font-size:.82rem;font-weight:600;margin:.3rem 0">${naive3.map(j=>items[j]).join(' + ')}</div><div class="pp-val" style="color:var(--ink3)">${naiveReach.toFixed(1)}%</div></div>
    </div>
    <div class="nt nti"><span class="ni">📌</span><span>${L.compareNote(+naiveVsOpt)}</span></div>`;

  // ── CAPA GERENCIAL
  document.getElementById('edu-results-mgmt').innerHTML=`
    <div class="nt ntw" style="margin-bottom:1rem"><span class="ni">🎯</span><span><strong>${_lang==='es'?'Antes de responder:':'Before answering:'}</strong> ${L.mgmtP}</span></div>
    <div class="layer-mgmt-q">${L.mgmtQ}</div>
    <div class="edu-brief" style="margin-top:1rem;margin-bottom:0">
      <div class="edu-brief-label">${L.keyData}</div>
      ${opt3Items.map((j,i)=>{
        const cumR=S.turf.data.filter(r=>opt3Items.slice(0,i+1).some(jj=>r.values[jj]===1)).length/N*100;
        const prevR=i>0?S.turf.data.filter(r=>opt3Items.slice(0,i).some(jj=>r.values[jj]===1)).length/N*100:0;
        return`<div class="edu-brief-row"><span class="edu-brief-key">${items[j]}</span><span class="edu-brief-val">${cumR.toFixed(1)}% ${_lang==='es'?'acumulado':'cumulative'} (+${(cumR-prevR).toFixed(1)} pp)</span></div>`;
      }).join('')}
      <div class="edu-brief-row"><span class="edu-brief-key">${L.naivePortfolio}</span><span class="edu-brief-val">${naive3?naive3.map(j=>items[j]).join(', '):''} → ${naiveReach.toFixed(1)}%</span></div>
    </div>`;

  renderResultsRecap();
}

function renderResultsRecapTURF(){
  const res=S.edu.analysisSnapshot;
  const el=document.getElementById('edu-results-recap');
  if(!res||!el)return;
  const{bestByK}=res,items=S.turf.items;
  const colors=['#c8430a','#1a7a4a','#2563a8','#7c3aed'];
  let html=`<div style="grid-column:1/-1;font-family:'Geist Mono',monospace;font-size:.62rem;letter-spacing:.08em;color:var(--edu);text-transform:uppercase;margin-bottom:.2rem;">${t('recap.title')}</div>`;
  bestByK.slice(0,4).forEach((b,i)=>{
    html+=`<div class="pp-card" style="border-top:3px solid ${colors[i]};padding:.6rem .5rem;"><div class="pp-label">k=${b.k}</div><div class="pp-val" style="font-size:1.1rem;color:${colors[i]}">${b.best.reachPct.toFixed(1)}%</div><div class="pp-desc" style="font-size:.65rem">${b.best.combo.slice(0,2).map(j=>items[j]).join(', ')}${b.best.combo.length>2?'…':''}</div></div>`;
  });
  el.innerHTML=html;
}

function renderEduResults(){
  if(eduIsTURF()){ renderEduResultsTURF(); return; }
  if(eduIsMaxDiff()){ renderEduResultsMaxDiff(); return; }
  if(eduIsConjoint()){ renderEduResultsConjoint(); return; }
  const res=S.edu.analysisSnapshot;
  if(!res)return;
  const isNMS=eduIsNMS();
  const{PMC,PME,OPP,IPP,valid,excluded,stats}=res;

  const L=_lang==='es'?{
    pmc:'Precio Mínimo Aceptable',opp:'Precio Óptimo',ipp:'Precio de Indiferencia',pme:'Precio Máximo Aceptable',
    leg:[{label:'Barato / buen precio',color:'#d97706'},{label:'Muy barato (duda calidad)',color:'#2563a8'},{label:'Caro (aún aceptable)',color:'#1a7a4a'},{label:'Muy caro (rechaza)',color:'#56cfcf'}],
    pmcDesc:p=>`Por debajo de S/${p}, el ${(100-PMC.pct).toFixed(0)}% de los encuestados comenzaría a dudar de la calidad del café. Este precio actúa como un piso psicológico: fijar un precio menor a este podría generar desconfianza, incluso si el costo lo permitiera.`,
    oppDesc:p=>`En S/${p}, el rechazo por precio demasiado bajo y el rechazo por precio demasiado alto se igualan al ${OPP.pct.toFixed(0)}%. Este es el punto de menor fricción total: el mercado acepta este precio sin cuestionar ni la calidad ni el valor cobrado.`,
    ippDesc:p=>`En S/${p}, la misma proporción de personas lo percibe como "barato" y como "caro" (${IPP.pct.toFixed(0)}% en ambas curvas). Por encima del OPP, este precio no genera ventaja de valor percibido, pero tampoco rechazo masivo.`,
    pmeDesc:p=>`S/${p} es el techo psicológico. A partir de este precio, la mayoría del mercado rechazaría el producto por considerarlo excesivamente caro. Comunicar un precio mayor a este —incluso como "precio tachado" en promociones— podría dañar la percepción de la marca.`,
    rangeNote:(a,b,c)=>`El rango estratégico de precios va de S/${a} a S/${b} (amplitud de S/${c}). Dentro de este rango, los precios entre OPP e IPP representan la zona de menor resistencia.`,
    mgmtWarnVW:'Lee los cuatro puntos de precio y el gráfico. Luego usa estos datos para fundamentar tu recomendación en el paso siguiente.',
    mgmtQVW:'¿A qué precio lanzarías el café de especialidad Origen al mercado minorista?',
    mgmtPVW:'Considera: el OPP minimiza el rechazo, el IPP está en la zona de tensión entre valor percibido bajo y alto, y el PME es el máximo que el mercado tolera. ¿Cuál es el precio correcto para un lanzamiento que busca posicionarse como premium accesible?',
    keyData:'Datos clave para tu decisión',acceptRange:'Rango aceptable',lowFriction:'Precio de menor fricción',tension:'Precio de tensión precio/valor',avgCheap:'Precio promedio "barato"',avgExp:'Precio promedio "caro"',validResp:'Encuestados válidos',of:'de',
    // NMS-specific
    nmsChartTitle:'Curvas de demanda (trial) e ingresos (revenue) — Extensión NMS',
    nmsChartDesc:'Demanda estimada (% que compraría) e ingresos estimados (precio × demanda) en función del precio, calibrados a partir de las respuestas de intención de compra.',
    maxTrialLabel:'✦ Precio de Máximo Trial',maxTrialDesc:pct=>`Maximiza el % de consumidores dispuestos a comprar (${pct}% del mercado estimado)`,
    maxRevLabel:'✦ Precio de Máximo Revenue',maxRevDesc:idx=>`Maximiza el ingreso estimado (índice revenue: ${idx})`,
    vwSaysTitle:'Lo que dice el PSM clásico (VW)',
    vwSaysText:opp=>`El precio óptimo perceptual (OPP) es S/${opp}: el punto donde el mercado no cuestiona ni la calidad ni el valor del producto. Pero el PSM solo mide percepción de precio — no estima cuántas personas comprarían realmente, ni cuánto ingreso generaría cada precio.`,
    nmsAddsTitle:'Lo que añade NMS',
    nmsAddsText:(trial,rev)=>`NMS responde una pregunta distinta: dado lo que el consumidor declara como barato/caro, ¿qué precio maximiza la probabilidad de compra (S/${trial}) y qué precio maximiza los ingresos esperados (S/${rev})? Ambos no tienen por qué coincidir.`,
    tradeoffNote:(trial,rev,gap)=>`El precio de máximo trial (S/${trial}) y el de máximo revenue (S/${rev}) difieren en S/${gap}. Un precio más bajo atrae más compradores; un precio más alto genera más ingresos por unidad, aunque venda menos. Ninguno de los dos es automáticamente "el correcto" — depende del objetivo del lanzamiento.`,
    marginWarning:'Importante: revenue estimado no es lo mismo que utilidad. Esta comparación no incluye costos ni margen — una decisión final de precio debe complementarse con un análisis de rentabilidad.',
    mgmtWarnNMS:'Lee la comparación entre el precio de máximo trial y el de máximo revenue. La decisión central de este caso es elegir un objetivo, no encontrar "el" precio óptimo.',
    mgmtQNMS:'¿Priorizarías el precio de máximo trial o el precio de máximo revenue para el lanzamiento de Origen — y por qué?',
    mgmtPNMS:'No existe una respuesta única correcta. Una recomendación rigurosa explicita el trade-off: si el objetivo es penetración y prueba inicial, el precio de máximo trial tiene sentido; si el objetivo es capturar valor en un producto premium, el precio de máximo revenue es más defendible — siempre validando margen y competencia.'
  }:{
    pmc:'Minimum Acceptable Price',opp:'Optimal Price',ipp:'Indifference Price',pme:'Maximum Acceptable Price',
    leg:[{label:'Cheap / good price',color:'#d97706'},{label:'Too cheap (quality doubt)',color:'#2563a8'},{label:'Expensive (still acceptable)',color:'#1a7a4a'},{label:'Too expensive (rejects)',color:'#56cfcf'}],
    pmcDesc:p=>`Below $${p}, ${(100-PMC.pct).toFixed(0)}% of respondents would start doubting the coffee's quality. This price acts as a psychological floor: setting a lower price could generate distrust, even if the cost structure allowed it.`,
    oppDesc:p=>`At $${p}, rejection from being too cheap and rejection from being too expensive are equal at ${OPP.pct.toFixed(0)}%. This is the point of least total friction: the market accepts this price without questioning quality or value charged.`,
    ippDesc:p=>`At $${p}, the same proportion of people perceive it as "cheap" and as "expensive" (${IPP.pct.toFixed(0)}% on both curves). Above the OPP, this price generates no perceived-value advantage, but no massive rejection either.`,
    pmeDesc:p=>`$${p} is the psychological ceiling. Above this price, most of the market would reject the product as excessively expensive. Communicating a higher price — even as a "struck-through price" in promotions — could damage brand perception.`,
    rangeNote:(a,b,c)=>`The strategic price range runs from $${a} to $${b} (a spread of $${c}). Within this range, prices between OPP and IPP represent the zone of least resistance.`,
    mgmtWarnVW:'Read the four price points and the chart. Then use this data to support your recommendation in the next step.',
    mgmtQVW:'At what price would you launch the Origen specialty coffee into the retail market?',
    mgmtPVW:'Consider: the OPP minimizes rejection, the IPP sits in the tension zone between low and high perceived value, and the PME is the maximum the market tolerates. What is the right price for a launch aiming to position as accessible premium?',
    keyData:'Key data for your decision',acceptRange:'Acceptable range',lowFriction:'Lowest-friction price',tension:'Price/value tension point',avgCheap:'Average "cheap" price',avgExp:'Average "expensive" price',validResp:'Valid respondents',of:'of',
    nmsChartTitle:'Demand (trial) and revenue curves — NMS Extension',
    nmsChartDesc:'Estimated demand (% who would buy) and estimated revenue (price × demand) as a function of price, calibrated from purchase-intent responses.',
    maxTrialLabel:'✦ Maximum Trial Price',maxTrialDesc:pct=>`Maximizes the % of consumers willing to buy (${pct}% of estimated market)`,
    maxRevLabel:'✦ Maximum Revenue Price',maxRevDesc:idx=>`Maximizes estimated revenue (revenue index: ${idx})`,
    vwSaysTitle:'What the classic PSM (VW) says',
    vwSaysText:opp=>`The perceptual optimal price (OPP) is $${opp}: the point where the market questions neither quality nor value. But the PSM only measures price perception — it doesn't estimate how many people would actually buy, or how much revenue each price would generate.`,
    nmsAddsTitle:'What NMS adds',
    nmsAddsText:(trial,rev)=>`NMS answers a different question: given what the consumer states as cheap/expensive, which price maximizes purchase probability ($${trial}) and which price maximizes expected revenue ($${rev})? The two don't have to coincide.`,
    tradeoffNote:(trial,rev,gap)=>`The maximum-trial price ($${trial}) and the maximum-revenue price ($${rev}) differ by $${gap}. A lower price attracts more buyers; a higher price generates more revenue per unit, though it sells less. Neither is automatically "the right one" — it depends on the launch's objective.`,
    marginWarning:'Important: estimated revenue is not the same as profit. This comparison doesn\'t include costs or margin — a final pricing decision should be complemented with a profitability analysis.',
    mgmtWarnNMS:'Read the comparison between the maximum-trial price and the maximum-revenue price. The core decision in this case is choosing an objective, not finding "the" optimal price.',
    mgmtQNMS:'Would you prioritize the maximum-trial price or the maximum-revenue price for the Origen launch — and why?',
    mgmtPNMS:'There is no single correct answer. A rigorous recommendation makes the trade-off explicit: if the objective is penetration and initial trial, the maximum-trial price makes sense; if the objective is capturing value in a premium product, the maximum-revenue price is more defensible — always validating margin and competition.'
  };

  // ── CAPA TÉCNICA
  let tecnicoHtml=`
    <div style="margin-bottom:.75rem">
      <div class="pp-grid">
        <div class="pp-card" style="border-top:3px solid #c8430a"><div class="pp-label">PMC</div><div class="pp-val" style="color:#c8430a">S/${PMC.price.toFixed(1)}</div><div class="pp-desc">${L.pmc}</div></div>
        <div class="pp-card" style="border-top:3px solid #1a7a4a"><div class="pp-label">OPP</div><div class="pp-val" style="color:#1a7a4a">S/${OPP.price.toFixed(1)}</div><div class="pp-desc">${L.opp}</div></div>
        <div class="pp-card" style="border-top:3px solid #2563a8"><div class="pp-label">IPP</div><div class="pp-val" style="color:#2563a8">S/${IPP.price.toFixed(1)}</div><div class="pp-desc">${L.ipp}</div></div>
        <div class="pp-card" style="border-top:3px solid #7c3aed"><div class="pp-label">PME</div><div class="pp-val" style="color:#7c3aed">S/${PME.price.toFixed(1)}</div><div class="pp-desc">${L.pme}</div></div>
      </div>
    </div>
    <div class="vw-legend" id="edu-vw-legend"></div>
    <div class="vw-chart-wrap"><canvas class="vw-canvas" id="edu-vw-canvas"></canvas></div>`;
  if(isNMS){
    const{maxDemand,maxRev}=res;
    tecnicoHtml+=`
    <div class="dvd" style="margin:1.25rem 0"></div>
    <div class="ititle" style="margin-bottom:.5rem">${L.nmsChartTitle}</div>
    <p class="cs">${L.nmsChartDesc}</p>
    <div class="pp-grid" style="margin-bottom:.9rem">
      <div class="pp-card" style="border-top:3px solid #1a7a4a;grid-column:1/3"><div class="pp-label">${L.maxTrialLabel}</div><div class="pp-val" style="color:#1a7a4a">S/${maxDemand.price.toFixed(1)}</div><div class="pp-desc">${L.maxTrialDesc(maxDemand.demand_pct.toFixed(1))}</div></div>
      <div class="pp-card" style="border-top:3px solid #7c3aed;grid-column:3/5"><div class="pp-label">${L.maxRevLabel}</div><div class="pp-val" style="color:#7c3aed">S/${maxRev.price.toFixed(1)}</div><div class="pp-desc">${L.maxRevDesc(maxRev.rev.toFixed(0))}</div></div>
    </div>
    <div class="nms-curve-wrap"><canvas class="nms-canvas" id="edu-nms-canvas"></canvas></div>`;
  }
  document.getElementById('edu-results-tecnico').innerHTML=tecnicoHtml;
  document.getElementById('edu-vw-legend').innerHTML=L.leg.map(l=>`<div class="vw-leg-item"><div class="vw-leg-dot" style="background:${l.color}"></div>${l.label}</div>`).join('');
  setTimeout(()=>{
    drawVWChart('edu-vw-canvas',res,{PMC,PME,OPP,IPP});
    if(isNMS)drawNMSChart('edu-nms-canvas');
  },100);

  // ── CAPA INTERPRETATIVA
  let interpHtml=`
    <div class="layer-interp-item"><div class="layer-interp-label">PMC = S/${PMC.price.toFixed(1)} — ${L.pmc}</div>${L.pmcDesc(PMC.price.toFixed(1))}</div>
    <div class="layer-interp-item"><div class="layer-interp-label">OPP = S/${OPP.price.toFixed(1)} — ${L.opp}</div>${L.oppDesc(OPP.price.toFixed(1))}</div>
    <div class="layer-interp-item"><div class="layer-interp-label">IPP = S/${IPP.price.toFixed(1)} — ${L.ipp}</div>${L.ippDesc(IPP.price.toFixed(1))}</div>
    <div class="layer-interp-item"><div class="layer-interp-label">PME = S/${PME.price.toFixed(1)} — ${L.pme}</div>${L.pmeDesc(PME.price.toFixed(1))}</div>
    <div class="nt nti"><span class="ni">📌</span><span>${L.rangeNote(PMC.price.toFixed(1),PME.price.toFixed(1),(PME.price-PMC.price).toFixed(1))}</span></div>`;
  if(isNMS){
    const{maxDemand,maxRev}=res;
    const gap=Math.abs(maxRev.price-maxDemand.price).toFixed(1);
    interpHtml+=`
    <div class="dvd" style="margin:1.25rem 0"></div>
    <div class="layer-interp-item" style="border-left-color:#1a7a4a;background:var(--gl)"><div class="layer-interp-label" style="color:#1a7a4a">${L.vwSaysTitle}</div>${L.vwSaysText(OPP.price.toFixed(1))}</div>
    <div class="layer-interp-item" style="border-left-color:#7c3aed;background:var(--pl)"><div class="layer-interp-label" style="color:#7c3aed">${L.nmsAddsTitle}</div>${L.nmsAddsText(maxDemand.price.toFixed(1),maxRev.price.toFixed(1))}</div>
    <div class="nt ntw"><span class="ni">⚖️</span><span>${L.tradeoffNote(maxDemand.price.toFixed(1),maxRev.price.toFixed(1),gap)}</span></div>
    <div class="nt nti"><span class="ni">📐</span><span>${L.marginWarning}</span></div>`;
  }
  document.getElementById('edu-results-interp').innerHTML=interpHtml;

  // ── CAPA GERENCIAL
  const mgmtQ=isNMS?L.mgmtQNMS:L.mgmtQVW;
  const mgmtP=isNMS?L.mgmtPNMS:L.mgmtPVW;
  const mgmtWarn=isNMS?L.mgmtWarnNMS:L.mgmtWarnVW;
  let mgmtHtml=`
    <div class="nt ntw" style="margin-bottom:1rem"><span class="ni">🎯</span><span><strong>${_lang==='es'?'Antes de responder:':'Before answering:'}</strong> ${mgmtWarn}</span></div>
    <div class="layer-mgmt-q">${mgmtQ}</div>
    <p style="font-size:.84rem;color:var(--ink3);line-height:1.55;margin-bottom:1rem">${mgmtP}</p>
    <div class="edu-brief" style="margin-bottom:0">
      <div class="edu-brief-label">${L.keyData}</div>
      <div class="edu-brief-row"><span class="edu-brief-key">${L.acceptRange}</span><span class="edu-brief-val">S/${PMC.price.toFixed(1)} – S/${PME.price.toFixed(1)}</span></div>
      <div class="edu-brief-row"><span class="edu-brief-key">${L.lowFriction}</span><span class="edu-brief-val">S/${OPP.price.toFixed(1)} (OPP)</span></div>
      <div class="edu-brief-row"><span class="edu-brief-key">${L.tension}</span><span class="edu-brief-val">S/${IPP.price.toFixed(1)} (IPP)</span></div>`;
  if(isNMS){
    const{maxDemand,maxRev}=res;
    mgmtHtml+=`
      <div class="edu-brief-row"><span class="edu-brief-key">${L.maxTrialLabel.replace('✦ ','')}</span><span class="edu-brief-val">S/${maxDemand.price.toFixed(1)} (${maxDemand.demand_pct.toFixed(1)}%)</span></div>
      <div class="edu-brief-row"><span class="edu-brief-key">${L.maxRevLabel.replace('✦ ','')}</span><span class="edu-brief-val">S/${maxRev.price.toFixed(1)} (idx ${maxRev.rev.toFixed(0)})</span></div>`;
  }
  mgmtHtml+=`
      <div class="edu-brief-row"><span class="edu-brief-key">${L.avgCheap}</span><span class="edu-brief-val">S/${stats.barato.mean}</span></div>
      <div class="edu-brief-row"><span class="edu-brief-key">${L.avgExp}</span><span class="edu-brief-val">S/${stats.caro.mean}</span></div>
      <div class="edu-brief-row"><span class="edu-brief-key">${L.validResp}</span><span class="edu-brief-val">${valid.length} ${L.of} ${valid.length+excluded}</span></div>
    </div>`;
  document.getElementById('edu-results-mgmt').innerHTML=mgmtHtml;

  renderResultsRecap();
}

// Resumen compacto de resultados — se muestra en el paso de Interpretación (punto 7)
// para que el estudiante no tenga que volver atrás a recordar los números.
function renderResultsRecap(){
  if(eduIsTURF()){ renderResultsRecapTURF(); return; }
  if(eduIsMaxDiff()){ renderResultsRecapMaxDiff(); return; }
  if(eduIsConjoint()){ renderResultsRecapConjoint(); return; }
  const res=S.edu.analysisSnapshot;
  const el=document.getElementById('edu-results-recap');
  if(!res||!el)return;
  const{PMC,PME,OPP,IPP}=res;
  let html=`
    <div style="grid-column:1/-1;font-family:'Geist Mono',monospace;font-size:.62rem;letter-spacing:.08em;color:var(--edu);text-transform:uppercase;margin-bottom:.2rem;">${t('recap.title')}</div>
    <div class="pp-card" style="border-top:3px solid #c8430a;padding:.6rem .5rem;"><div class="pp-label">PMC</div><div class="pp-val" style="font-size:1.1rem;color:#c8430a">S/${PMC.price.toFixed(1)}</div></div>
    <div class="pp-card" style="border-top:3px solid #1a7a4a;padding:.6rem .5rem;"><div class="pp-label">OPP</div><div class="pp-val" style="font-size:1.1rem;color:#1a7a4a">S/${OPP.price.toFixed(1)}</div></div>
    <div class="pp-card" style="border-top:3px solid #2563a8;padding:.6rem .5rem;"><div class="pp-label">IPP</div><div class="pp-val" style="font-size:1.1rem;color:#2563a8">S/${IPP.price.toFixed(1)}</div></div>
    <div class="pp-card" style="border-top:3px solid #7c3aed;padding:.6rem .5rem;"><div class="pp-label">PME</div><div class="pp-val" style="font-size:1.1rem;color:#7c3aed">S/${PME.price.toFixed(1)}</div></div>`;
  if(eduIsNMS()){
    const{maxDemand,maxRev}=res;
    html+=`
    <div class="pp-card" style="border-top:3px solid #1a7a4a;padding:.6rem .5rem;"><div class="pp-label">${_lang==='es'?'MÁX. TRIAL':'MAX TRIAL'}</div><div class="pp-val" style="font-size:1.1rem;color:#1a7a4a">S/${maxDemand.price.toFixed(1)}</div></div>
    <div class="pp-card" style="border-top:3px solid #7c3aed;padding:.6rem .5rem;"><div class="pp-label">${_lang==='es'?'MÁX. REVENUE':'MAX REVENUE'}</div><div class="pp-val" style="font-size:1.1rem;color:#7c3aed">S/${maxRev.price.toFixed(1)}</div></div>`;
  }
  el.innerHTML=html;
}

function switchLayer(id,btn){
  document.querySelectorAll('.layer-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.layer-content').forEach(c=>c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('layer-'+id).classList.add('active');
  // Re-dibujar canvas si es necesario (solo aplica a los motores de precio VW/NMS)
  if(id==='tecnico'&&S.edu.analysisSnapshot&&!eduIsMaxDiff()&&!eduIsTURF()){
    const res=S.edu.analysisSnapshot;
    setTimeout(()=>{
      drawVWChart('edu-vw-canvas',res,{PMC:res.PMC,PME:res.PME,OPP:res.OPP,IPP:res.IPP});
      if(eduIsNMS())drawNMSChart('edu-nms-canvas');
    },80);
  }
}

// ══════════════════════════════════════════════════
// PASO 6 — RESPUESTA DEL ESTUDIANTE + PROMPT IA
// ══════════════════════════════════════════════════
function checkRespComplete(){
  const fields=['resp-hallazgo','resp-evidencia','resp-recomendacion','resp-limitaciones','resp-siguiente'];
  const allFilled=fields.every(id=>document.getElementById(id).value.trim().length>10);
  document.getElementById('edu-copy-prompt-btn').disabled=!allFilled;
  document.getElementById('edu-resp-next').disabled=!allFilled;
}

function copyAIPrompt(){
  const res=S.edu.analysisSnapshot;
  const cs=EDU_CASES[S.edu.caseId];
  const h=document.getElementById('resp-hallazgo').value.trim();
  const e=document.getElementById('resp-evidencia').value.trim();
  const rc=document.getElementById('resp-recomendacion').value.trim();
  const l=document.getElementById('resp-limitaciones').value.trim();
  const s=document.getElementById('resp-siguiente').value.trim();
  S.edu.response={hallazgo:h,evidencia:e,recomendacion:rc,limitaciones:l,siguiente:s};
  const isNMS=eduIsNMS();
  const isMD=eduIsMaxDiff();
  const isTURF=eduIsTURF();
  const isCBC=eduIsConjoint();

  let resultsBlockEs,resultsBlockEn,sampleEs,sampleEn;
  if(isCBC){
    const{utils,imp}=res;
    const attrs=S.c.attrs;
    const attrsOrd=[...attrs].sort((a,b)=>(imp[b.name]||0)-(imp[a.name]||0));
    const N=S.c.data.length;
    sampleEs=`${N} encuestados`;sampleEn=`${N} respondents`;
    const impLines=attrsOrd.map(a=>`- ${a.name}: ${(imp[a.name]||0).toFixed(1)}%`).join('\n');
    const utilLines=attrsOrd.map(a=>{
      const lvls=Object.entries(utils[a.name]||{}).sort((x,y)=>y[1]-x[1]);
      return `  ${a.name}:\n${lvls.map(([l,u])=>`    ${l}: ${u>=0?'+':''}${u.toFixed(3)}`).join('\n')}`;
    }).join('\n');
    resultsBlockEs=`RESULTADOS DEL ANÁLISIS (CBC Conjoint):\n\nIMPORTANCIAS RELATIVAS:\n${impLines}\n\nUTILIDADES PARCIALES:\n${utilLines}`;
    resultsBlockEn=`ANALYSIS RESULTS (CBC Conjoint):\n\nRELATIVE IMPORTANCES:\n${impLines}\n\nPARTIAL UTILITIES:\n${utilLines}`;
  } else if(isTURF){
    const{bestByK,N}=res;
    const items=S.turf.items;
    const opt3=bestByK.find(b=>b.k===3);
    sampleEs=`${N} encuestados`;sampleEn=`${N} respondents`;
    resultsBlockEs=`RESULTADOS DEL ANÁLISIS (TURF — portafolio óptimo por tamaño de k):\n${bestByK.map(b=>`- k=${b.k}: ${b.best.combo.map(j=>items[j]).join(' + ')} → Alcance: ${b.best.reachPct.toFixed(1)}%`).join('\n')}\n\nPortafolio recomendado (k=3): ${opt3?opt3.best.combo.map(j=>items[j]).join(', '):'-'} → ${opt3?opt3.best.reachPct.toFixed(1):'?'}%`;
    resultsBlockEn=`ANALYSIS RESULTS (TURF — optimal portfolio by portfolio size k):\n${bestByK.map(b=>`- k=${b.k}: ${b.best.combo.map(j=>items[j]).join(' + ')} → Reach: ${b.best.reachPct.toFixed(1)}%`).join('\n')}\n\nRecommended portfolio (k=3): ${opt3?opt3.best.combo.map(j=>items[j]).join(', '):'-'} → ${opt3?opt3.best.reachPct.toFixed(1):'?'}%`;
  } else if(isMD){
    const top5=res.ranked.slice(0,5);
    sampleEs=`${res.indivScores.length} encuestados`;sampleEn=`${res.indivScores.length} respondents`;
    resultsBlockEs=`RESULTADOS DEL ANÁLISIS (ranking de importancia, top 5 de ${res.ranked.length} criterios):\n${top5.map(r=>`- #${r.rank} ${r.it}: ${r.score.toFixed(1)}%`).join('\n')}`;
    resultsBlockEn=`ANALYSIS RESULTS (importance ranking, top 5 of ${res.ranked.length} criteria):\n${top5.map(r=>`- #${r.rank} ${r.it}: ${r.score.toFixed(1)}%`).join('\n')}`;
  } else {
    sampleEs=`${res.valid.length} encuestados válidos`;sampleEn=`${res.valid.length} valid respondents`;
    const nmsLineEs=isNMS?`- Precio de Máximo Trial (NMS): S/${res.maxDemand.price.toFixed(1)} (${res.maxDemand.demand_pct.toFixed(1)}% del mercado)\n- Precio de Máximo Revenue (NMS): S/${res.maxRev.price.toFixed(1)} (índice revenue: ${res.maxRev.rev.toFixed(0)})\n`:'';
    const nmsLineEn=isNMS?`- Maximum Trial Price (NMS): $${res.maxDemand.price.toFixed(1)} (${res.maxDemand.demand_pct.toFixed(1)}% of market)\n- Maximum Revenue Price (NMS): $${res.maxRev.price.toFixed(1)} (revenue index: ${res.maxRev.rev.toFixed(0)})\n`:'';
    resultsBlockEs=`RESULTADOS DEL ANÁLISIS:\n- PMC (Precio Mínimo Aceptable): S/${res.PMC.price.toFixed(1)}\n- OPP (Precio Óptimo): S/${res.OPP.price.toFixed(1)}\n- IPP (Precio de Indiferencia): S/${res.IPP.price.toFixed(1)}\n- PME (Precio Máximo Aceptable): S/${res.PME.price.toFixed(1)}\n- Rango aceptable: S/${res.PMC.price.toFixed(1)} – S/${res.PME.price.toFixed(1)}\n${nmsLineEs}`;
    resultsBlockEn=`ANALYSIS RESULTS:\n- PMC (Minimum Acceptable Price): $${res.PMC.price.toFixed(1)}\n- OPP (Optimal Price): $${res.OPP.price.toFixed(1)}\n- IPP (Indifference Price): $${res.IPP.price.toFixed(1)}\n- PME (Maximum Acceptable Price): $${res.PME.price.toFixed(1)}\n- Acceptable range: $${res.PMC.price.toFixed(1)} – $${res.PME.price.toFixed(1)}\n${nmsLineEn}`;
  }

  const prompt=_lang==='es'?`Eres un docente de investigación de mercados evaluando el trabajo de un estudiante universitario.

CASO DE ESTUDIO: ${ce(cs.titulo)}
EMPRESA: ${ce(cs.empresa)}
TÉCNICA APLICADA: ${ce(cs.modulo)}
MUESTRA: ${sampleEs}

${resultsBlockEs}

RESPUESTA DEL ESTUDIANTE:

1. HALLAZGO PRINCIPAL:
${h}

2. EVIDENCIA DEL ANÁLISIS:
${e}

3. RECOMENDACIÓN GERENCIAL:
${rc}

4. LIMITACIONES IDENTIFICADAS:
${l}

5. PRÓXIMO PASO PROPUESTO:
${s}

Proporciona retroalimentación estructurada en tres secciones:
A) FORTALEZAS (máximo 3 puntos concretos): ¿Qué hizo bien el estudiante?
B) ASPECTOS A MEJORAR (máximo 3 puntos): ¿Qué falta o qué es impreciso?
C) PREGUNTA REFLEXIVA: Una sola pregunta que lleve al estudiante a pensar más profundo sobre el caso.

Sé específico con los números. Evalúa el rigor técnico, la claridad de la recomendación y la capacidad de identificar limitaciones metodológicas.`:`You are a market research instructor evaluating a university student's work.

CASE STUDY: ${ce(cs.titulo)}
COMPANY: ${ce(cs.empresa)}
TECHNIQUE APPLIED: ${ce(cs.modulo)}
SAMPLE: ${sampleEn}

${resultsBlockEn}

STUDENT'S RESPONSE:

1. MAIN FINDING:
${h}

2. SUPPORTING EVIDENCE:
${e}

3. MANAGERIAL RECOMMENDATION:
${rc}

4. IDENTIFIED LIMITATIONS:
${l}

5. PROPOSED NEXT STEP:
${s}

Provide structured feedback in three sections:
A) STRENGTHS (max 3 concrete points): What did the student do well?
B) AREAS TO IMPROVE (max 3 points): What is missing or imprecise?
C) REFLECTIVE QUESTION: One single question that leads the student to think more deeply about the case.

Be specific with the numbers. Evaluate technical rigor, clarity of the recommendation, and the ability to identify methodological limitations.`;
  navigator.clipboard.writeText(prompt).then(()=>{
    const btn=document.getElementById('edu-copy-prompt-btn');
    btn.textContent=_lang==='es'?'✓ Prompt copiado':'✓ Prompt copied';
    setTimeout(()=>{btn.innerHTML=`📋 <span data-i18n="edu.resp.copyprompt">${t('edu.resp.copyprompt')}</span>`;},2500);
  });
  document.getElementById('edu-prompt-text').textContent=prompt;
  document.getElementById('edu-prompt-preview').classList.remove('hid');
}

function saveRespAndContinue(){
  const h=document.getElementById('resp-hallazgo').value.trim();
  const e=document.getElementById('resp-evidencia').value.trim();
  const rc=document.getElementById('resp-recomendacion').value.trim();
  const l=document.getElementById('resp-limitaciones').value.trim();
  const s=document.getElementById('resp-siguiente').value.trim();
  S.edu.response={hallazgo:h,evidencia:e,recomendacion:rc,limitaciones:l,siguiente:s};
  S.edu.aiFeedback=document.getElementById('resp-ai-feedback')?.value||'';
  renderPosttest();
  gEdu(7);
}

// ══════════════════════════════════════════════════
// PASO 7 — POSTEST + ENCUESTA
// ══════════════════════════════════════════════════
function renderPosttest(){
  renderQuiz('edu-postest-qs',S.edu.postest,'post');
}

function submitPosttest(){
  S.edu.posttestSubmitted=true;
  document.getElementById('edu-postest-btn').classList.add('hid');
  // Mostrar feedback + comparación
  EDU_QUESTIONS.forEach((q,qi)=>{
    const sel=S.edu.postest[qi];
    const isOk=sel===q.correcta;
    const optEl=document.getElementById(`post-opt-${qi}-${sel}`);
    const corrEl=document.getElementById(`post-opt-${qi}-${q.correcta}`);
    if(optEl)optEl.classList.add(isOk?'correct':'wrong');
    if(!isOk&&corrEl)corrEl.classList.add('correct');
    const fbEl=document.getElementById(`post-fb-${qi}`);
    if(fbEl){fbEl.style.display='block';fbEl.className=`quiz-feedback ${isOk?'quiz-fb-correct':'quiz-fb-wrong'}`;fbEl.textContent=isOk?q.feedback_correcto:q.feedback_incorrecto;}
  });
  // Comparación pre/post
  const preScore=S.edu.pretest.filter((v,i)=>v===EDU_QUESTIONS[i].correcta).length;
  const postScore=S.edu.postest.filter((v,i)=>v===EDU_QUESTIONS[i].correcta).length;
  const gain=postScore-preScore;
  const gainClass=gain>0?'up':gain<0?'down':'same';
  const noChangeLabel=_lang==='es'?'= Sin cambio':'= No change';
  const gainLabel=gain>0?`+${gain} ↑`:(gain<0?`${gain} ↓`:noChangeLabel);
  const improvedLabel=_lang==='es'?'↑ Mejoró':'↑ Improved';
  const regressedLabel=_lang==='es'?'↓ Retrocedió':'↓ Regressed';
  const sameLabel=_lang==='es'?'= Igual':'= Same';
  const rows=EDU_QUESTIONS.map((q,i)=>{
    const pre=S.edu.pretest[i]===q.correcta?'✓':'✗';
    const post=S.edu.postest[i]===q.correcta?'✓':'✗';
    const g=S.edu.postest[i]===q.correcta&&S.edu.pretest[i]!==q.correcta?'up':
             S.edu.pretest[i]===q.correcta&&S.edu.postest[i]!==q.correcta?'down':'same';
    const gl=g==='up'?improvedLabel:g==='down'?regressedLabel:sameLabel;
    return `<tr><td style="padding:.5rem .75rem">${q.num}</td><td style="padding:.5rem .75rem;text-align:center">${pre}</td><td style="padding:.5rem .75rem;text-align:center">${post}</td><td style="padding:.5rem .75rem;text-align:center"><span class="prepost-gain ${g}">${gl}</span></td></tr>`;
  }).join('');
  const L=_lang==='es'?{pretest:'PRETEST',postest:'POSTEST',gain:'GANANCIA',q:'Pregunta',pre:'Pretest',post:'Postest',change:'Cambio'}:{pretest:'PRETEST',postest:'POSTTEST',gain:'GAIN',q:'Question',pre:'Pretest',post:'Posttest',change:'Change'};
  document.getElementById('edu-prepost-compare').classList.remove('hid');
  document.getElementById('edu-prepost-compare').innerHTML=`
    <div class="quiz-score">
      <div>
        <div style="display:flex;gap:2rem;margin-bottom:.35rem">
          <div><div style="font-size:.7rem;color:var(--ink3);margin-bottom:.15rem">${L.pretest}</div><div style="font-family:'Instrument Serif',serif;font-size:1.8rem;color:var(--ink)">${preScore}/3</div></div>
          <div><div style="font-size:.7rem;color:var(--ink3);margin-bottom:.15rem">${L.postest}</div><div style="font-family:'Instrument Serif',serif;font-size:1.8rem;color:var(--edu)">${postScore}/3</div></div>
          <div><div style="font-size:.7rem;color:var(--ink3);margin-bottom:.15rem">${L.gain}</div><div class="quiz-score-num"><span class="prepost-gain ${gainClass}" style="font-size:1.2rem;padding:.25rem .65rem">${gainLabel}</span></div></div>
        </div>
      </div>
    </div>
    <table class="prepost-table"><thead><tr><th>${L.q}</th><th>${L.pre}</th><th>${L.post}</th><th>${L.change}</th></tr></thead><tbody>${rows}</tbody></table>`;
  document.getElementById('edu-survey-btn').classList.remove('hid');
}

function showSurvey(){
  const card=document.getElementById('edu-survey-card');
  card.classList.remove('hid');
  renderSurvey();
  card.scrollIntoView({behavior:'smooth'});
}

function renderSurvey(){
  const items=_lang==='es'?[
    {id:'utilidad',label:'Esta herramienta fue útil para aprender sobre investigación de precios'},
    {id:'facilidad',label:'El flujo de trabajo fue fácil de seguir'},
    {id:'aprendizaje',label:'Aprendí cosas nuevas que podré aplicar en mi trabajo o estudios'},
    {id:'claridad',label:'Las explicaciones de los resultados fueron claras'},
    {id:'intencion',label:'Usaría esta herramienta nuevamente o la recomendaría a otros estudiantes'}
  ]:[
    {id:'utilidad',label:'This tool was useful for learning about pricing research'},
    {id:'facilidad',label:'The workflow was easy to follow'},
    {id:'aprendizaje',label:'I learned new things I can apply in my work or studies'},
    {id:'claridad',label:'The explanations of the results were clear'},
    {id:'intencion',label:'I would use this tool again or recommend it to other students'}
  ];
  const anchors=_lang==='es'?['Totalmente en desacuerdo','En desacuerdo','Neutral','De acuerdo','Totalmente de acuerdo']:['Strongly disagree','Disagree','Neutral','Agree','Strongly agree'];
  let html=`<div class="ititle" style="margin-bottom:.9rem">${_lang==='es'?'Escala de valoración (1–5)':'Rating scale (1–5)'}</div>`;
  items.forEach(item=>{
    html+=`<div class="likert-row">
      <div class="likert-label">${item.label}</div>
      <div class="likert-scale">
        ${[1,2,3,4,5].map(v=>`<div class="likert-opt"><input type="radio" name="lk-${item.id}" id="lk-${item.id}-${v}" value="${v}" onchange="S.edu.survey.${item.id}=${v}"><label for="lk-${item.id}-${v}">${v}</label></div>`).join('')}
      </div>
      <div class="likert-anchors"><span>${anchors[0]}</span><span>${anchors[4]}</span></div>
    </div>`;
  });
  if(_lang==='es'){
    html+=`<div class="dvd" style="margin:1.25rem 0"></div>
      <div class="ititle" style="margin-bottom:.75rem">Preguntas abiertas</div>
      <div class="resp-field"><label>¿Qué fue lo más valioso de esta experiencia de aprendizaje?</label><textarea id="survey-a1" placeholder="Escribe tu respuesta..." oninput="S.edu.survey.abierta1=this.value">${S.edu.survey.abierta1||''}</textarea></div>
      <div class="resp-field"><label>¿Qué mejorarías o qué te resultó confuso?</label><textarea id="survey-a2" placeholder="Escribe tu respuesta..." oninput="S.edu.survey.abierta2=this.value">${S.edu.survey.abierta2||''}</textarea></div>
      <div class="resp-field"><label>¿Cómo aplicarías la Sensibilidad de Precios en un proyecto real de tu contexto?</label><textarea id="survey-a3" placeholder="Escribe tu respuesta..." oninput="S.edu.survey.abierta3=this.value">${S.edu.survey.abierta3||''}</textarea></div>`;
  } else {
    html+=`<div class="dvd" style="margin:1.25rem 0"></div>
      <div class="ititle" style="margin-bottom:.75rem">Open-ended questions</div>
      <div class="resp-field"><label>What was the most valuable part of this learning experience?</label><textarea id="survey-a1" placeholder="Write your answer..." oninput="S.edu.survey.abierta1=this.value">${S.edu.survey.abierta1||''}</textarea></div>
      <div class="resp-field"><label>What would you improve, or what was confusing?</label><textarea id="survey-a2" placeholder="Write your answer..." oninput="S.edu.survey.abierta2=this.value">${S.edu.survey.abierta2||''}</textarea></div>
      <div class="resp-field"><label>How would you apply Price Sensitivity in a real project in your context?</label><textarea id="survey-a3" placeholder="Write your answer..." oninput="S.edu.survey.abierta3=this.value">${S.edu.survey.abierta3||''}</textarea></div>`;
  }
  document.getElementById('edu-survey-content').innerHTML=html;
}

function saveSurveyAndContinue(){
  renderReportSummary();
  gEdu(8);
  document.getElementById('edu-session-code').textContent=S.edu.sessionCode;
}

// ══════════════════════════════════════════════════
// PASO 8 — REPORTE Y EXPORTACIÓN
// ══════════════════════════════════════════════════
function renderReportSummary(){
  const res=S.edu.analysisSnapshot;
  const cs=EDU_CASES[S.edu.caseId];
  const preScore=S.edu.pretest.filter((v,i)=>v===EDU_QUESTIONS[i].correcta).length;
  const postScore=S.edu.postest.filter((v,i)=>v===EDU_QUESTIONS[i].correcta).length;
  const dur=Math.round((Date.now()-S.edu.startTime)/60000);
  const L=_lang==='es'?{case:'Caso',tech:'Técnica',eval:'Evaluación',pp:'Pretest → Postest',dur:'Duración',sess:'Tiempo de sesión',min:'min'}:{case:'Case',tech:'Technique',eval:'Evaluation',pp:'Pretest → Posttest',dur:'Duration',sess:'Session time',min:'min'};
  document.getElementById('edu-report-summary').innerHTML=`
    <div class="fr3" style="margin-bottom:1.1rem">
      <div class="pp-card"><div class="pp-label">${L.case}</div><div style="font-size:.9rem;font-weight:600;color:var(--edu);margin:.3rem 0">${ce(cs.titulo)}</div><div class="pp-desc">${L.tech}: ${ce(cs.modulo)}</div></div>
      <div class="pp-card"><div class="pp-label">${L.eval}</div><div style="font-family:'Instrument Serif',serif;font-size:1.5rem;color:var(--edu)">${preScore}/3 → ${postScore}/3</div><div class="pp-desc">${L.pp}</div></div>
      <div class="pp-card"><div class="pp-label">${L.dur}</div><div style="font-family:'Instrument Serif',serif;font-size:1.5rem;color:var(--edu)">${dur} ${L.min}</div><div class="pp-desc">${L.sess}</div></div>
    </div>`;
}

function downloadReport(){
  const res=S.edu.analysisSnapshot;
  const cs=EDU_CASES[S.edu.caseId];
  if(!res){alert(_lang==='es'?'Completa el análisis primero.':'Complete the analysis first.');return;}
  const preScore=S.edu.pretest.filter((v,i)=>v===EDU_QUESTIONS[i].correcta).length;
  const postScore=S.edu.postest.filter((v,i)=>v===EDU_QUESTIONS[i].correcta).length;
  const dur=Math.round((Date.now()-S.edu.startTime)/60000);
  const fecha=new Date().toLocaleDateString(_lang==='es'?'es-PE':'en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'});
  const okLabel=_lang==='es'?'✓ Correcto':'✓ Correct';
  const wrongLabel=_lang==='es'?'✗ Incorrecto':'✗ Incorrect';
  const qRows=EDU_QUESTIONS.map((q,i)=>`
    <tr><td style="padding:.5rem .75rem;border:1px solid #e2ddd4;font-size:.82rem">${q.num}</td>
    <td style="padding:.5rem .75rem;border:1px solid #e2ddd4;font-size:.82rem">${q.opciones[S.edu.pretest[i]]||'—'}</td>
    <td style="padding:.5rem .75rem;border:1px solid #e2ddd4;font-size:.82rem;color:${S.edu.pretest[i]===q.correcta?'#065f46':'#9a3412'}">${S.edu.pretest[i]===q.correcta?okLabel:wrongLabel}</td>
    <td style="padding:.5rem .75rem;border:1px solid #e2ddd4;font-size:.82rem">${q.opciones[S.edu.postest[i]]||'—'}</td>
    <td style="padding:.5rem .75rem;border:1px solid #e2ddd4;font-size:.82rem;color:${S.edu.postest[i]===q.correcta?'#065f46':'#9a3412'}">${S.edu.postest[i]===q.correcta?okLabel:wrongLabel}</td></tr>`).join('');
  const dimLabels=_lang==='es'?{utilidad:'Utilidad',facilidad:'Facilidad',aprendizaje:'Aprendizaje',claridad:'Claridad',intencion:'Intención de uso'}:{utilidad:'Usefulness',facilidad:'Ease of use',aprendizaje:'Learning',claridad:'Clarity',intencion:'Intent to use'};
  const surveyRows=['utilidad','facilidad','aprendizaje','claridad','intencion'].map(k=>`<tr><td style="padding:.4rem .75rem;border:1px solid #e2ddd4;font-size:.82rem">${dimLabels[k]}</td><td style="padding:.4rem .75rem;border:1px solid #e2ddd4;font-size:.82rem;text-align:center;font-family:monospace">${S.edu.survey[k]||'—'}/5</td></tr>`).join('');
  const fieldLabels=_lang==='es'?{hallazgo:'Hallazgo principal',evidencia:'Evidencia',recomendacion:'Recomendación gerencial',limitaciones:'Limitaciones',siguiente:'Próximo paso'}:{hallazgo:'Main finding',evidencia:'Evidence',recomendacion:'Managerial recommendation',limitaciones:'Limitations',siguiente:'Next step'};
  const notCompleted=_lang==='es'?'No completado':'Not completed';
  const htmlLangAttr=_lang==='es'?'es':'en';
  const title=_lang==='es'?`Reporte — ${ce(cs.titulo)}`:`Report — ${ce(cs.titulo)}`;
  const L=_lang==='es'?{
    reportTitle:'Reporte de Aprendizaje',generated:'Generado el',author:'Autor',
    sec1:'1. Información del caso',field:'Campo',detail:'Detalle',case:'Caso',company:'Empresa',technique:'Técnica',sample:'Muestra',validOf:'encuestados válidos de',duration:'Duración de sesión',min:'minutos',
    sec2:'2. Resultados del análisis',acceptRange:'Rango aceptable',
    sec3:'3. Evaluación — Pretest y Postest',q:'Pregunta',preAns:'Respuesta Pretest',result:'Resultado',postAns:'Respuesta Postest',
    pretest:'Pretest',postest:'Postest',gain:'Ganancia',point:'punto',
    sec4:'4. Interpretación y recomendación del estudiante',
    sec5ai:'5. Feedback de IA externa',
    secSurvey:'Encuesta de experiencia',dimension:'Dimensión',rating:'Valoración',
    valuable:'¿Qué fue lo más valioso?',improve:'¿Qué mejorarías?',apply:'Aplicación en contexto real',
    footerNote:'Este documento fue generado localmente en el navegador. No contiene datos en servidores externos.'
  }:{
    reportTitle:'Learning Report',generated:'Generated on',author:'Author',
    sec1:'1. Case information',field:'Field',detail:'Detail',case:'Case',company:'Company',technique:'Technique',sample:'Sample',validOf:'valid respondents of',duration:'Session duration',min:'minutes',
    sec2:'2. Analysis results',acceptRange:'Acceptable range',
    sec3:'3. Evaluation — Pretest and Posttest',q:'Question',preAns:'Pretest Answer',result:'Result',postAns:'Posttest Answer',
    pretest:'Pretest',postest:'Posttest',gain:'Gain',point:'point',
    sec4:'4. Student interpretation and recommendation',
    sec5ai:'5. External AI feedback',
    secSurvey:'Experience survey',dimension:'Dimension',rating:'Rating',
    valuable:'What was most valuable?',improve:'What would you improve?',apply:'Application in real context',
    footerNote:'This document was generated locally in the browser. It contains no data on external servers.'
  };
  const isNMS=eduIsNMS();
  const isMD=eduIsMaxDiff();
  const isTURF=eduIsTURF();
  const isCBC=eduIsConjoint();
  const nmsReportItems=isNMS?`
<div class="pp-item"><div class="pp-label">${_lang==='es'?'MÁX. TRIAL':'MAX TRIAL'}</div><div class="pp-val" style="color:#1a7a4a">S/${res.maxDemand.price.toFixed(1)}</div></div>
<div class="pp-item"><div class="pp-label">${_lang==='es'?'MÁX. REVENUE':'MAX REVENUE'}</div><div class="pp-val" style="color:#7c3aed">S/${res.maxRev.price.toFixed(1)}</div></div>`:'';
  let resultsSection,sampleLine,methodRef;
  if(isCBC){
    const{utils,imp}=res;
    const attrs=S.c.attrs;
    const attrsOrd=[...attrs].sort((a,b)=>(imp[b.name]||0)-(imp[a.name]||0));
    const N=S.c.data.length;
    sampleLine=`${N} ${_lang==='es'?'encuestados':'respondents'}`;
    methodRef='McFadden (1974) — Multinomial Logit / CBC Conjoint';
    const impRows=attrsOrd.map(a=>`<tr><td>${a.name}</td><td style="text-align:right;font-weight:bold">${(imp[a.name]||0).toFixed(1)}%</td></tr>`).join('');
    const utilRows=attrsOrd.map(a=>{
      const lvls=Object.entries(utils[a.name]||{}).sort((x,y)=>y[1]-x[1]);
      return lvls.map(([l,u])=>`<tr><td style="padding-left:1.5rem;color:#666">${a.name} — ${l}</td><td style="text-align:right;font-family:monospace;color:${u>=0?'#065f46':'#9a3412'}">${u>=0?'+':''}${u.toFixed(3)}</td></tr>`).join('');
    }).join('');
    resultsSection=`<table><thead><tr><th>${_lang==='es'?'Atributo':'Attribute'}</th><th>${_lang==='es'?'Importancia':'Importance'}</th></tr></thead><tbody>${impRows}</tbody></table>
<table style="margin-top:.75rem"><thead><tr><th>${_lang==='es'?'Nivel':'Level'}</th><th>${_lang==='es'?'Utilidad parcial':'Partial utility'}</th></tr></thead><tbody>${utilRows}</tbody></table>`;
  } else if(isTURF){
    const{bestByK,N}=res; const items=S.turf.items;
    resultsSection=`<table><thead><tr><th>k</th><th>${_lang==='es'?'Portafolio óptimo':'Optimal portfolio'}</th><th>${_lang==='es'?'Alcance':'Reach'}</th></tr></thead><tbody>${bestByK.map(b=>`<tr><td>${b.k}</td><td>${b.best.combo.map(j=>items[j]).join(', ')}</td><td style="text-align:right;font-weight:bold">${b.best.reachPct.toFixed(1)}%</td></tr>`).join('')}</tbody></table>`;
    sampleLine=`${N} ${_lang==='es'?'encuestados':'respondents'}`;
    methodRef='Donnelly &amp; Volpe (2005) — TURF Analysis';
  } else if(isMD){
    resultsSection=`<table><thead><tr><th>#</th><th>${_lang==='es'?'Criterio':'Criterion'}</th><th>${_lang==='es'?'Mejor':'Best'}</th><th>${_lang==='es'?'Peor':'Worst'}</th><th>%</th></tr></thead><tbody>${res.ranked.map(r=>`<tr><td>${r.rank}</td><td>${r.it}</td><td style="text-align:center">${r.b}</td><td style="text-align:center">${r.w}</td><td style="text-align:right;font-weight:bold">${r.score.toFixed(1)}%</td></tr>`).join('')}</tbody></table>`;
    sampleLine=`${res.indivScores.length} ${L.validOf.includes('válidos')?'encuestados':'respondents'}`;
    methodRef='Louviere &amp; Woodworth (1991) — Best-Worst Scaling';
  } else {
    resultsSection=`<div class="pp-row">
<div class="pp-item"><div class="pp-label">PMC</div><div class="pp-val" style="color:#c8430a">S/${res.PMC.price.toFixed(1)}</div></div>
<div class="pp-item"><div class="pp-label">OPP</div><div class="pp-val" style="color:#1a7a4a">S/${res.OPP.price.toFixed(1)}</div></div>
<div class="pp-item"><div class="pp-label">IPP</div><div class="pp-val" style="color:#2563a8">S/${res.IPP.price.toFixed(1)}</div></div>
<div class="pp-item"><div class="pp-label">PME</div><div class="pp-val" style="color:#7c3aed">S/${res.PME.price.toFixed(1)}</div></div>
<div class="pp-item"><div class="pp-label">${L.acceptRange}</div><div class="pp-val" style="font-size:1rem">S/${res.PMC.price.toFixed(1)}–S/${res.PME.price.toFixed(1)}</div></div>${nmsReportItems}
</div>`;
    sampleLine=`${res.valid.length} ${L.validOf} ${res.valid.length+res.excluded}`;
    methodRef='Van Westendorp (1976)';
  }
  const html=`<!DOCTYPE html><html lang="${htmlLangAttr}"><head><meta charset="UTF-8"><title>${title}</title>
<style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:0 2rem;color:#1a1714;line-height:1.6;}
h1{font-size:1.6rem;color:#3730a3;margin-bottom:.25rem;}h2{font-size:1.1rem;color:#3730a3;margin:1.5rem 0 .5rem;border-bottom:2px solid #eef2ff;padding-bottom:.35rem;}
.meta{font-size:.82rem;color:#8a8278;margin-bottom:1.5rem;}
.badge{display:inline-block;background:#eef2ff;color:#3730a3;border:1px solid #c7d2fe;border-radius:4px;padding:.2rem .65rem;font-family:monospace;font-size:.82rem;margin-bottom:1.25rem;}
.pp-row{display:flex;gap:1rem;margin:.75rem 0;flex-wrap:wrap;}
.pp-item{background:#f5f2eb;border-radius:6px;padding:.6rem .9rem;text-align:center;min-width:120px;}
.pp-label{font-family:monospace;font-size:.65rem;color:#8a8278;text-transform:uppercase;margin-bottom:.2rem;}
.pp-val{font-size:1.3rem;color:#1a1714;font-weight:bold;}
table{width:100%;border-collapse:collapse;font-size:.84rem;margin:.75rem 0;}
th{background:#f5f2eb;padding:.5rem .75rem;border:1px solid #e2ddd4;text-align:left;font-size:.78rem;color:#8a8278;}
.resp-block{background:#f5f2eb;border-left:3px solid #3730a3;padding:.75rem 1rem;margin:.5rem 0;border-radius:0 4px 4px 0;font-size:.88rem;}
.resp-key{font-family:monospace;font-size:.65rem;color:#3730a3;text-transform:uppercase;margin-bottom:.25rem;}
.footer{margin-top:3rem;padding-top:1rem;border-top:1px solid #e2ddd4;font-size:.75rem;color:#8a8278;text-align:center;}
@media print{body{margin:20px;}.no-print{display:none;}}</style></head>
<body>
<div style="display:flex;align-items:baseline;gap:1rem;margin-bottom:.25rem"><h1>${L.reportTitle}</h1><span style="font-size:.8rem;color:#8a8278;font-family:monospace">${t('app.title')} v5.0</span></div>
<div class="meta">${L.generated} ${fecha} · ${L.author}: Hugo Cornejo Villena, USMP</div>
<div class="badge">${S.edu.sessionCode}</div>
<h2>${L.sec1}</h2>
<table><tr><th>${L.field}</th><th>${L.detail}</th></tr>
<tr><td>${L.case}</td><td>${ce(cs.titulo)}</td></tr>
<tr><td>${L.company}</td><td>${ce(cs.empresa)}</td></tr>
<tr><td>${L.technique}</td><td>${ce(cs.modulo)}</td></tr>
<tr><td>${L.sample}</td><td>${sampleLine}</td></tr>
<tr><td>${L.duration}</td><td>${dur} ${L.min}</td></tr></table>
<h2>${L.sec2}</h2>
${resultsSection}
<h2>${L.sec3}</h2>
<table><thead><tr><th>${L.q}</th><th>${L.preAns}</th><th>${L.result}</th><th>${L.postAns}</th><th>${L.result}</th></tr></thead><tbody>${qRows}</tbody></table>
<p style="font-size:.84rem">${L.pretest}: <strong>${preScore}/3</strong> &nbsp;|&nbsp; ${L.postest}: <strong>${postScore}/3</strong> &nbsp;|&nbsp; ${L.gain}: <strong>${postScore-preScore>=0?'+':''}${postScore-preScore} ${L.point}${Math.abs(postScore-preScore)!==1?(_lang==='es'?'s':'s'):''}</strong></p>
<h2>${L.sec4}</h2>
${['hallazgo','evidencia','recomendacion','limitaciones','siguiente'].map((k,i)=>`<div class="resp-block"><div class="resp-key">${i+1}. ${fieldLabels[k]}</div>${S.edu.response[k]||`<em style="color:#8a8278">${notCompleted}</em>`}</div>`).join('')}
${S.edu.aiFeedback?`<h2>${L.sec5ai}</h2><div class="resp-block" style="border-color:#8a8278">${S.edu.aiFeedback.replace(/\n/g,'<br>')}</div>`:''}
<h2>${S.edu.aiFeedback?'6':'5'}. ${L.secSurvey}</h2>
<table><thead><tr><th>${L.dimension}</th><th>${L.rating}</th></tr></thead><tbody>${surveyRows}</tbody></table>
${S.edu.survey.abierta1?`<div class="resp-block" style="margin-top:.5rem"><div class="resp-key">${L.valuable}</div>${S.edu.survey.abierta1}</div>`:''}
${S.edu.survey.abierta2?`<div class="resp-block"><div class="resp-key">${L.improve}</div>${S.edu.survey.abierta2}</div>`:''}
${S.edu.survey.abierta3?`<div class="resp-block"><div class="resp-key">${L.apply}</div>${S.edu.survey.abierta3}</div>`:''}
<div class="footer">${t('app.title')} v5.0 · Hugo Cornejo Villena · Universidad de San Martín de Porres, Perú · ${methodRef}<br>${L.footerNote}</div>
</body></html>`;
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));
  a.download=`reporte_${S.edu.sessionCode}.html`;a.click();
}

function downloadCSV(){
  const res=S.edu.analysisSnapshot;
  if(!res){alert(_lang==='es'?'Completa el análisis primero.':'Complete the analysis first.');return;}
  const cs=EDU_CASES[S.edu.caseId];
  const isNMS=eduIsNMS();
  const isMD=eduIsMaxDiff();
  const isTURF=eduIsTURF();
  const isCBC=eduIsConjoint();
  const dur=Math.round((Date.now()-S.edu.startTime)/60000);
  const preScore=S.edu.pretest.filter((v,i)=>v===EDU_QUESTIONS[i].correcta).length;
  const postScore=S.edu.postest.filter((v,i)=>v===EDU_QUESTIONS[i].correcta).length;
  const esc=v=>'"'+String(v||'').replace(/"/g,'""')+'"';
  const hdr=['sesion_code','fecha','idioma','caso','modulo','n_validos','n_excluidos','PMC','OPP','IPP','PME','precio_max_trial','precio_max_revenue','top1_criterio','top1_pct','top2_criterio','top2_pct','top3_criterio','top3_pct','turf_opt3_sabor1','turf_opt3_sabor2','turf_opt3_sabor3','turf_opt3_reach',
    'pretest_p1','pretest_p2','pretest_p3','pretest_score',
    'postest_p1','postest_p2','postest_p3','postest_score','ganancia',
    'hallazgo','evidencia','recomendacion','limitaciones','siguiente','feedback_ia',
    'util','facil','aprendizaje','claridad','intencion','abierta1','abierta2','abierta3','tiempo_min'];
  let n_validos='',n_excluidos='',PMC='',OPP='',IPP='',PME='',maxTrial='',maxRev='';
  let top1c='',top1p='',top2c='',top2p='',top3c='',top3p='';
  let turf1='',turf2='',turf3='',turfReach='';
  if(isCBC){
    const{utils,imp}=res;
    const attrs=S.c.attrs;
    n_validos=S.c.data.length;
    const attrsOrd=[...attrs].sort((a,b)=>(imp[b.name]||0)-(imp[a.name]||0));
    top1c=attrsOrd[0]?.name;top1p=(imp[attrsOrd[0]?.name]||0).toFixed(1);
    top2c=attrsOrd[1]?.name;top2p=(imp[attrsOrd[1]?.name]||0).toFixed(1);
    top3c=attrsOrd[2]?.name;top3p=(imp[attrsOrd[2]?.name]||0).toFixed(1);
  } else if(isTURF){
    const{bestByK,N}=res; const items=S.turf.items;
    n_validos=N; n_excluidos='';
    const opt3=bestByK.find(b=>b.k===3);
    if(opt3){[turf1,turf2,turf3]=opt3.best.combo.map(j=>items[j]);turfReach=opt3.best.reachPct.toFixed(1);}
  } else if(isMD){
    n_validos=res.indivScores.length; n_excluidos='';
    const top3=res.ranked.slice(0,3);
    top1c=top3[0].it;top1p=top3[0].score.toFixed(1);
    top2c=top3[1].it;top2p=top3[1].score.toFixed(1);
    top3c=top3[2].it;top3p=top3[2].score.toFixed(1);
  } else {
    n_validos=res.valid.length;n_excluidos=res.excluded;
    PMC=res.PMC.price.toFixed(1);OPP=res.OPP.price.toFixed(1);IPP=res.IPP.price.toFixed(1);PME=res.PME.price.toFixed(1);
    if(isNMS){maxTrial=res.maxDemand.price.toFixed(1);maxRev=res.maxRev.price.toFixed(1);}
  }
  const vals=[
    S.edu.sessionCode,new Date().toISOString().slice(0,16),_lang,ce(cs.titulo),ce(cs.modulo),n_validos,n_excluidos,
    PMC,OPP,IPP,PME,maxTrial,maxRev,top1c,top1p,top2c,top2p,top3c,top3p,turf1,turf2,turf3,turfReach,
    S.edu.pretest[0],S.edu.pretest[1],S.edu.pretest[2],preScore,
    S.edu.postest[0],S.edu.postest[1],S.edu.postest[2],postScore,postScore-preScore,
    S.edu.response.hallazgo,S.edu.response.evidencia,S.edu.response.recomendacion,S.edu.response.limitaciones,S.edu.response.siguiente,S.edu.aiFeedback,
    S.edu.survey.utilidad,S.edu.survey.facilidad,S.edu.survey.aprendizaje,S.edu.survey.claridad,S.edu.survey.intencion,
    S.edu.survey.abierta1,S.edu.survey.abierta2,S.edu.survey.abierta3,dur
  ];
  const csv=hdr.join(',')+'\n'+vals.map(esc).join(',');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  a.download=`datos_${S.edu.sessionCode}.csv`;a.click();
}

function resetEdu(){
  S.edu={active:false,step:1,problemId:null,caseId:'cafe',sessionCode:'',startTime:null,pretest:[null,null,null],postest:[null,null,null],pretestSubmitted:false,posttestSubmitted:false,response:{hallazgo:'',evidencia:'',recomendacion:'',limitaciones:'',siguiente:''},aiFeedback:'',survey:{utilidad:0,facilidad:0,aprendizaje:0,claridad:0,intencion:0,abierta1:'',abierta2:'',abierta3:''},analysisSnapshot:null};
  // Limpiar campos
  ['resp-hallazgo','resp-evidencia','resp-recomendacion','resp-limitaciones','resp-siguiente','resp-ai-feedback'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('edu-prompt-preview')?.classList.add('hid');
  document.getElementById('edu-survey-card')?.classList.add('hid');
  document.getElementById('edu-prepost-compare')?.classList.add('hid');
  document.getElementById('edu-postest-btn')?.classList.remove('hid');
  document.getElementById('edu-survey-btn')?.classList.add('hid');
  document.getElementById('meth-rec').style.display='none';
  document.getElementById('edu-meth-next').disabled=true;
  gEdu(0);
}

// ══════════════════════════════════════════════════
const COLS=['#c8430a','#2563a8','#1a7a4a','#8b5cf6','#d97706','#ec4899'];
const PCOLS=['#c8430a','#2563a8','#1a7a4a','#8b5cf6'];
function rng(s){let x=s;return()=>{x=(x*1664525+1013904223)&0xffffffff;return(x>>>0)/0xffffffff;};}
function ev(e){e.preventDefault();}
function fmt(n){return typeof n==='number'?n.toFixed(2):n;}

// ══════════════════════════════════════════════════
