// ══════════════════════════════════════════════════
// MOTOR DE IA — OPENAI BYOK + FALLBACK AUTOMÁTICO
// ══════════════════════════════════════════════════
let _openAIKey = '';

function onKeyInput(){
  const v = document.getElementById('openai-key').value.trim();
  const badge = document.getElementById('api-status-badge');
  if(v.length > 10){
    badge.textContent = 'Key ingresada — guardá para activar';
    badge.className = 'api-status api-empty';
  } else {
    badge.textContent = 'Sin key — se usará análisis automático';
    badge.className = 'api-status api-empty';
  }
}

function saveKey(){
  const v = document.getElementById('openai-key').value.trim();
  const badge = document.getElementById('api-status-badge');
  if(!v || v.length < 10){ alert('Ingresá una API key válida.'); return; }
  _openAIKey = v;
  badge.textContent = '✓ Key guardada — hacé clic en "Probar conexión"';
  badge.className = 'api-status api-empty';
  badge.style.cssText = '';
}

async function testKey(){
  const badge = document.getElementById('api-status-badge');
  if(!_openAIKey){
    const v = document.getElementById('openai-key').value.trim();
    if(!v){ alert('Primero ingresá tu API key y hacé clic en Guardar.'); return; }
    _openAIKey = v;
  }
  badge.textContent = '⟳ Probando conexión con OpenAI…';
  badge.className = 'api-status api-empty';
  badge.style.cssText = '';
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {'Content-Type':'application/json', 'Authorization':'Bearer '+_openAIKey},
      body: JSON.stringify({model:'gpt-4o-mini', max_tokens:5, messages:[{role:'user',content:'ok'}]})
    });
    const d = await res.json();
    if(d.error){
      badge.textContent = '✗ ' + d.error.message;
      badge.style.cssText = 'background:#2d0a0a;border:1px solid #7f1d1d;color:#f87171;font-family:Geist Mono,monospace;font-size:.6rem;padding:.22rem .55rem;border-radius:3px;white-space:normal;max-width:520px;';
    } else if(d.choices?.[0]?.message?.content){
      badge.textContent = '✓ Key activa — GPT-4o-mini habilitado';
      badge.className = 'api-status api-ok';
      badge.style.cssText = '';
    } else {
      badge.textContent = '⚠ Respuesta inesperada. Revisá la key.';
      badge.style.cssText = 'background:#1c1307;border:1px solid #92400e;color:#fbbf24;font-family:Geist Mono,monospace;font-size:.6rem;padding:.22rem .55rem;border-radius:3px;';
    }
  } catch(e){
    badge.textContent = '✗ Error de red: ' + e.message;
    badge.style.cssText = 'background:#2d0a0a;border:1px solid #7f1d1d;color:#f87171;font-family:Geist Mono,monospace;font-size:.6rem;padding:.22rem .55rem;border-radius:3px;';
  }
}

// Motor central — OpenAI GPT-4o-mini + fallback automático por reglas
async function callAI(prompt, fallbackFn) {
  if(!_openAIKey) return {ok:false, text: fallbackFn()};

  const setBadge = (txt, cls='', css='') => {
    const b = document.getElementById('api-status-badge');
    if(!b) return;
    b.textContent = txt;
    b.className = 'api-status' + (cls ? ' '+cls : '');
    b.style.cssText = css;
  };

  setBadge('⟳ Consultando GPT-4o-mini…', 'api-empty');
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {'Content-Type':'application/json', 'Authorization':'Bearer '+_openAIKey},
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 900,
        temperature: 0.75,
        messages: [{role:'user', content: prompt}]
      })
    });
    const d = await res.json();

    if(d.error){
      setBadge('✗ ' + d.error.message, '', 'background:#2d0a0a;border:1px solid #7f1d1d;color:#f87171;font-family:Geist Mono,monospace;font-size:.6rem;padding:.22rem .55rem;border-radius:3px;white-space:normal;max-width:520px;');
      return {ok:false, text: fallbackFn()};
    }

    const text = d.choices?.[0]?.message?.content?.trim();
    if(text){
      setBadge('✓ Key activa — GPT-4o-mini habilitado', 'api-ok');
      return {ok:true, text};
    }

    setBadge('⚠ Respuesta vacía. Usando análisis automático.', '', 'background:#1c1307;border:1px solid #92400e;color:#fbbf24;font-family:Geist Mono,monospace;font-size:.6rem;padding:.22rem .55rem;border-radius:3px;');
    return {ok:false, text: fallbackFn()};

  } catch(e) {
    setBadge('✗ Error de red: '+e.message, '', 'background:#2d0a0a;border:1px solid #7f1d1d;color:#f87171;font-family:Geist Mono,monospace;font-size:.6rem;padding:.22rem .55rem;border-radius:3px;');
    return {ok:false, text: fallbackFn()};
  }
}

function showAI(elId, result) {
  const el = document.getElementById(elId);
  if(!el) return;
  const tag = result.ok
    ? '<span style="font-family:\'Geist Mono\',monospace;font-size:.58rem;background:#052e16;border:1px solid #166534;color:#4ade80;padding:.12rem .4rem;border-radius:3px;margin-right:.5rem;vertical-align:middle">✦ GPT</span>'
      : '<span style="font-family:\'Geist Mono\',monospace;font-size:.58rem;background:#1c1917;border:1px solid #3a3530;color:#a09888;padding:.12rem .4rem;border-radius:3px;margin-right:.5rem;vertical-align:middle" title="Análisis generado automáticamente por reglas. Ingresa una API key de OpenAI para conclusiones enriquecidas con IA.">⚙ AUTO</span>';
  el.innerHTML = `<div class="aitxt">${tag}${result.text}</div>`;
}

// ── FALLBACKS AUTOMÁTICOS POR MÓDULO ──────────────

function fallbackCBC() {
  const{utils,imp}=S.c.res, attrs=S.c.attrs;
  const srt=[...attrs].sort((a,b)=>imp[b.name]-imp[a.name]);
  const top=srt[0], sec=srt[1]||{name:'',levels:[]};
  const topBest=top.levels.reduce((b,l)=>utils[top.name][l]>utils[top.name][b]?l:b, top.levels[0]);
  const topWorst=top.levels.reduce((b,l)=>utils[top.name][l]<utils[top.name][b]?l:b, top.levels[0]);
  return _lang==='es'
    ?`El análisis revela que <strong>${top.name}</strong> es el atributo que más influye en la decisión de compra (${imp[top.name].toFixed(1)}%), siendo el nivel "<em>${topBest}</em>" el más valorado y "<em>${topWorst}</em>" el que genera mayor rechazo. Esto indica que los consumidores priorizan este factor por encima del resto al momento de elegir.\n\n${sec.name?`El atributo <strong>${sec.name}</strong> ocupa el segundo lugar en importancia (${imp[sec.name].toFixed(1)}%), lo que sugiere que también representa un criterio relevante en la evaluación del producto. Los atributos con menor peso relativo pueden ser vistos como diferenciadores secundarios o de soporte en la propuesta de valor.`:'Los atributos restantes complementan la propuesta de valor sin ser determinantes en la elección final.'}\n\nEstrategicamente, se recomienda priorizar el posicionamiento del producto en torno a <strong>${top.name}</strong>, asegurando que el nivel "<em>${topBest}</em>" sea destacado en la comunicación y en el diseño de la oferta. Minimizar las configuraciones asociadas al nivel "<em>${topWorst}</em>" contribuiría a mejorar la preferencia general del producto.`
    :`The analysis reveals that <strong>${top.name}</strong> is the attribute with the greatest influence on the purchase decision (${imp[top.name].toFixed(1)}%), with the level "<em>${topBest}</em>" being the most valued and "<em>${topWorst}</em>" generating the most rejection. This indicates that consumers prioritize this factor above all others when choosing.\n\n${sec.name?`The attribute <strong>${sec.name}</strong> ranks second in importance (${imp[sec.name].toFixed(1)}%), suggesting it is also a relevant criterion in evaluating the product. Attributes with lower relative weight can be seen as secondary or supporting differentiators in the value proposition.`:'The remaining attributes complement the value proposition without being decisive in the final choice.'}\n\nStrategically, it is recommended to prioritize product positioning around <strong>${top.name}</strong>, ensuring the level "<em>${topBest}</em>" is highlighted in communication and offer design. Minimizing configurations associated with the level "<em>${topWorst}</em>" would help improve the product's overall preference.`;
}

function fallbackMaxDiff() {
  const{ranked}=S.m.res;
  const top3=ranked.slice(0,3).map(r=>r.it).join(', ');
  const bot3=ranked.slice(-3).map(r=>r.it).join(', ');
  const mid=ranked.filter(r=>r.score>=30&&r.score<60).map(r=>r.it).slice(0,2).join(_lang==='es'?' y ':' and ');
  return _lang==='es'
    ?`El ranking MaxDiff revela que los consumidores asignan mayor importancia a <strong>${top3}</strong>, lo que indica que estos aspectos son determinantes en la evaluación del producto o servicio. Su presencia sólida en la propuesta de valor es clave para conectar con las prioridades reales del segmento encuestado.\n\n${mid?`Los ítems de importancia media como <strong>${mid}</strong> no deben descartarse; representan diferenciadores secundarios que pueden inclinar la decisión cuando los atributos principales están parejos entre competidores.`:''} Los ítems con menor puntaje (<strong>${bot3}</strong>) generan escaso impacto en la decisión, por lo que su inclusión en la comunicación debe ser selectiva y solo como argumento de soporte.\n\nSe recomienda estructurar la propuesta de valor alrededor de los ítems de alta importancia, incorporándolos explícitamente en los mensajes clave de marketing. La segmentación posterior con los puntajes individuales podría revelar grupos con perfiles de preferencia distintos, abriendo oportunidades de personalización.`
    :`The MaxDiff ranking reveals that consumers place greater importance on <strong>${top3}</strong>, indicating that these aspects are decisive in evaluating the product or service. Their solid presence in the value proposition is key to connecting with the segment's real priorities.\n\n${mid?`Mid-importance items such as <strong>${mid}</strong> should not be dismissed; they represent secondary differentiators that can tip the decision when the main attributes are evenly matched among competitors.`:''} The lowest-scoring items (<strong>${bot3}</strong>) have little impact on the decision, so their inclusion in communication should be selective and used only as supporting arguments.\n\nIt is recommended to structure the value proposition around the high-importance items, explicitly incorporating them into key marketing messages. Further segmentation using individual scores could reveal groups with distinct preference profiles, opening opportunities for personalization.`;
}

function fallbackVW() {
  const{PMC,PME,OPP,IPP}=S.vw.res;
  const prod=document.getElementById('vw-product')?.value||(_lang==='es'?'el producto':'the product');
  const rango=(PME.price-PMC.price).toFixed(1);
  return _lang==='es'
    ?`El análisis Van Westendorp para <strong>${prod}</strong> define un rango de precios psicológicamente aceptable entre <strong>${PMC.price.toFixed(1)}</strong> y <strong>${PME.price.toFixed(1)}</strong>, con una amplitud de ${rango} unidades monetarias. Por debajo del límite inferior, la percepción de baja calidad puede perjudicar la imagen del producto; por encima del superior, la mayoría de consumidores rechazaría la compra.\n\nEl precio óptimo estimado se ubica en <strong>${OPP.price.toFixed(1)}</strong>, punto donde se minimiza simultáneamente el rechazo por precio excesivo y por precio demasiado bajo. El precio de indiferencia —en torno a <strong>${IPP.price.toFixed(1)}</strong>— marca el umbral donde las percepciones de "barato" y "caro" se equilibran, constituyendo una referencia útil para estrategias de anclaje de precio.\n\nPara el lanzamiento, se recomienda posicionarse entre el precio óptimo y el de indiferencia, comunicando activamente los atributos de calidad que justifiquen el nivel de precio elegido. Un precio cercano al OPP maximiza la aceptación, mientras que acercarse al IPP puede ser adecuado si se busca proyectar una imagen de mayor valor.`
    :`The Van Westendorp analysis for <strong>${prod}</strong> defines a psychologically acceptable price range between <strong>${PMC.price.toFixed(1)}</strong> and <strong>${PME.price.toFixed(1)}</strong>, with a span of ${rango} monetary units. Below the lower limit, the perception of low quality can harm the product's image; above the upper limit, most consumers would reject the purchase.\n\nThe estimated optimal price is <strong>${OPP.price.toFixed(1)}</strong>, the point that simultaneously minimizes rejection from prices that are too high and too low. The indifference price —around <strong>${IPP.price.toFixed(1)}</strong>— marks the threshold where perceptions of "cheap" and "expensive" balance out, providing a useful reference for price-anchoring strategies.\n\nFor launch, it is recommended to position between the optimal price and the indifference price, actively communicating the quality attributes that justify the chosen price level. A price close to the OPP maximizes acceptance, while moving closer to the IPP may be appropriate if the goal is to project a higher-value image.`;
}

function fallbackNMS() {
  const{PMC,PME,OPP,maxDemand,maxRev}=S.nms.res;
  const prod=document.getElementById('nms-product')?.value||(_lang==='es'?'el producto':'the product');
  return _lang==='es'
    ?`El PSM para <strong>${prod}</strong> establece un rango aceptable entre ${PMC.price.toFixed(1)} y ${PME.price.toFixed(1)}, con precio óptimo en ${OPP.price.toFixed(1)}. La extensión Newton-Miller-Smith complementa este análisis conectando las percepciones de precio con la intención de compra declarada, ofreciendo una aproximación a la curva de demanda real del mercado.\n\nEl precio de máximo trial —<strong>${maxDemand.price.toFixed(1)}</strong>— maximiza el porcentaje de consumidores dispuestos a comprar (${maxDemand.demand_pct.toFixed(1)}%), siendo ideal para estrategias de penetración o lanzamiento donde el volumen y el reconocimiento de marca son prioritarios. El precio de máximo revenue —<strong>${maxRev.price.toFixed(1)}</strong>— optimiza los ingresos estimados y es preferible cuando la rentabilidad por unidad es el objetivo principal.\n\nLa elección entre ambos puntos depende del momento estratégico: en fases de introducción, priorizar el trial; en fases de madurez o con estructura de costos fija, orientarse al revenue máximo. Se recomienda evaluar ambos escenarios con los datos reales de costo marginal para obtener la recomendación de precio final.`
    :`The PSM for <strong>${prod}</strong> establishes an acceptable range between ${PMC.price.toFixed(1)} and ${PME.price.toFixed(1)}, with an optimal price of ${OPP.price.toFixed(1)}. The Newton-Miller-Smith extension complements this analysis by connecting price perceptions with stated purchase intent, providing an approximation of the market's actual demand curve.\n\nThe maximum trial price —<strong>${maxDemand.price.toFixed(1)}</strong>— maximizes the percentage of consumers willing to buy (${maxDemand.demand_pct.toFixed(1)}%), making it ideal for penetration or launch strategies where volume and brand recognition are the priority. The maximum revenue price —<strong>${maxRev.price.toFixed(1)}</strong>— optimizes estimated revenue and is preferable when per-unit profitability is the main objective.\n\nThe choice between the two depends on the strategic moment: in introduction phases, prioritize trial; in maturity phases or with a fixed cost structure, aim for maximum revenue. It is recommended to evaluate both scenarios with actual marginal cost data to arrive at the final price recommendation.`;
}

// ── FUNCIONES genXXAI ─────────────────────────────

async function genCAI(){
  const{utils,imp}=S.c.res,attrs=S.c.attrs,n=S.c.data.length;
  const srt=[...attrs].sort((a,b)=>imp[b.name]-imp[a.name]);
  const isum=srt.map(a=>`${a.name}: ${imp[a.name].toFixed(1)}%`).join(', ');
  const top=srt[0],tl=top.levels.map(l=>({l,u:utils[top.name][l]})).sort((a,b)=>b.u-a.u);
  const prompt=_lang==='es'
    ?`Eres experto en investigación de mercados y análisis conjunto CBC. Estudio CBC con ${n} encuestados. Atributos: ${attrs.map(a=>a.name).join(', ')}. IMPORTANCIAS (100%): ${isum}. Atributo dominante: ${top.name} (${imp[top.name].toFixed(1)}%) — nivel preferido: "${tl[0].l}", rechazado: "${tl[tl.length-1].l}". Redactá 3 párrafos breves (máx 80 palabras c/u) en español, tono profesional para estudiantes de marketing: 1. Atributo dominante e implicación estratégica. 2. Insights de atributos secundarios y trade-offs. 3. Recomendación concreta de producto o pricing. No uses listas. No repitas números exactos.`
    :`You are an expert in market research and CBC conjoint analysis. CBC study with ${n} respondents. Attributes: ${attrs.map(a=>a.name).join(', ')}. IMPORTANCE (100%): ${isum}. Dominant attribute: ${top.name} (${imp[top.name].toFixed(1)}%) — preferred level: "${tl[0].l}", rejected: "${tl[tl.length-1].l}". Write 3 brief paragraphs (max 80 words each) in English, professional tone for marketing students: 1. Dominant attribute and strategic implication. 2. Insights on secondary attributes and trade-offs. 3. Concrete product or pricing recommendation. Do not use lists. Do not repeat exact numbers.`;
  const result = await callAI(prompt, fallbackCBC);
  showAI('cai', result);
}

async function genMAI(){
  const{ranked}=S.m.res,items=S.m.items,n=S.m.data.length;
  const top3=ranked.slice(0,3).map(r=>`${r.it} (${r.score.toFixed(0)})`).join(', ');
  const bot3=ranked.slice(-3).map(r=>`${r.it} (${r.score.toFixed(0)})`).join(', ');
  const prompt=_lang==='es'
    ?`Eres experto en investigación de mercados y BWS. MaxDiff con ${n} encuestados, ${items.length} ítems. Top 3: ${top3}. Menos importantes: ${bot3}. Redactá 3 párrafos breves (máx 80 palabras c/u) en español: 1. Qué revela el ranking sobre prioridades del consumidor. 2. Implicaciones de ítems medios/bajos. 3. Recomendación estratégica para propuesta de valor. No repitas números exactos.`
    :`You are an expert in market research and BWS. MaxDiff study with ${n} respondents, ${items.length} items. Top 3: ${top3}. Least important: ${bot3}. Write 3 brief paragraphs (max 80 words each) in English: 1. What the ranking reveals about consumer priorities. 2. Implications of mid/low items. 3. Strategic recommendation for the value proposition. Do not repeat exact numbers.`;
  const result = await callAI(prompt, fallbackMaxDiff);
  showAI('mai', result);
}

function buildCScript(){
  const attrs=S.c.attrs;
  const {imp,utils}=S.c.res;
  const priceAttr=S.c.priceAttr||attrs[0].name;

  // Nombres limpios para R (solo letras, números y _)
  const rName=s=>s.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ]/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,'');

  const attrList=attrs.map(a=>`  "${a.name}" = c(${a.levels.map(l=>`"${l}"`).join(', ')})`).join(',\n');

  const utilBlock=attrs.map(a=>{
    const sorted=[...a.levels].sort((x,y)=>utils[a.name][y]-utils[a.name][x]);
    return `  # ${a.name}\n`+sorted.map(l=>`  #   "${l}": ${utils[a.name][l].toFixed(4)}`).join('\n');
  }).join('\n');

  const impBlock=[...attrs].sort((a,b)=>imp[b.name]-imp[a.name])
    .map(a=>`  # ${a.name}: ${imp[a.name].toFixed(1)}%`).join('\n');

  const sc=
`# ══════════════════════════════════════════════════════════════
# CBC CONJOINT — Script completo
# Kit de Investigación de Mercados v3.0
# Autor: Hugo Cornejo Villena
# Modelo: Logit Multinomial (Choice-Based Conjoint)
# ══════════════════════════════════════════════════════════════

# ── 1. PAQUETES ───────────────────────────────────────────────
if(!require("mlogit"))    install.packages("mlogit")
if(!require("tidyverse")) install.packages("tidyverse")
if(!require("AlgDesign")) install.packages("AlgDesign")
if(!require("readxl"))    install.packages("readxl")
library(mlogit); library(tidyverse); library(AlgDesign); library(readxl)

# ── 2. ATRIBUTOS Y NIVELES ────────────────────────────────────
atributos <- list(
${attrList}
)
cat("Perfiles en factorial completo:", prod(sapply(atributos, length)), "\\n")

# ── 3. RESULTADOS DEL ANÁLISIS (calculados por el app) ────────
# Importancias relativas (suman 100%):
${impBlock}

# Utilidades parciales (part-worths):
${utilBlock}

# ── 4. CARGAR DATOS ───────────────────────────────────────────
# Columnas: id_encuestado | version | tarea_1 ... tarea_15
# Valores: 1-4 = opción elegida, 0 = Ninguno
datos <- read_excel("plantilla_cbc_conjoint.xlsx", sheet = "Respuestas")
cat("Encuestados:", nrow(datos), "| Versiones:", paste(unique(datos$version), collapse=", "), "\\n")

# ── 5. CARGAR DISEÑO ──────────────────────────────────────────
diseno_v1 <- read_excel("plantilla_cbc_conjoint.xlsx", sheet = "Diseño_V1")
# Si hay más versiones, cargar y combinar:
# diseno_v2 <- read_excel("plantilla_cbc_conjoint.xlsx", sheet = "Diseño_V2")
# diseno    <- bind_rows(diseno_v1, diseno_v2)

# ── 6. CONVERTIR A FORMATO LONG ───────────────────────────────
TAREAS <- 15
PRODS  <- 4

datos_long <- datos |>
  pivot_longer(
    cols      = starts_with("tarea_"),
    names_to  = "tarea_str",
    values_to = "eleccion"
  ) |>
  mutate(tarea_num = as.integer(str_extract(tarea_str, "\\\\d+"))) |>
  crossing(alt = 1:PRODS) |>
  mutate(
    elegido = as.integer(eleccion == alt),
    chid    = (id_encuestado - 1) * TAREAS + tarea_num
  )

# ── 7. AGREGAR ATRIBUTOS DEL DISEÑO ──────────────────────────
# Join: cada tarea × alternativa recibe los niveles de atributo
# Ajustar las columnas del join según el Excel exportado
datos_modelo <- datos_long |>
  left_join(
    diseno_v1 |>
      rename(tarea_num = TAREA, alt_num = OPCIÓN) |>
      mutate(alt = as.integer(str_extract(alt_num, "\\\\d+"))),
    by = c("tarea_num", "alt")
  )

# ── 8. MODELO LOGIT MULTINOMIAL ───────────────────────────────
datos_mlogit <- mlogit.data(
  datos_modelo,
  choice   = "elegido",
  shape    = "long",
  alt.var  = "alt",
  chid.var = "chid"
)

# Fórmula con todos los atributos como predictores
formula_m <- as.formula(
  paste("elegido ~", paste(names(atributos), collapse = " + "), "- 1")
)

modelo_cbc <- mlogit(formula_m, data = datos_mlogit)
summary(modelo_cbc)

# ── 9. IMPORTANCIAS RELATIVAS (suman exactamente 100%) ────────
coefs <- coef(modelo_cbc)

rangos <- sapply(names(atributos), function(a) {
  cs <- coefs[grepl(a, names(coefs), fixed = TRUE)]
  if(length(cs) == 0) return(0)
  max(cs) - min(c(cs, 0))
})

importancias      <- round(rangos / sum(rangos) * 100, 1)
# Ajuste del último atributo para suma exacta
importancias[length(importancias)] <- 100 - sum(importancias[-length(importancias)])

cat("\\nIMPORTANCIAS (suman 100%):\\n")
print(sort(importancias, decreasing = TRUE))

# ── 10. UTILIDADES PARCIALES ──────────────────────────────────
cat("\\nUTILIDADES PARCIALES (part-worths):\\n")
print(round(coefs, 4))

# ── 11. SIMULADOR DE MARKET SHARE ─────────────────────────────
# Función logit (Independence of Irrelevant Alternatives)
market_share <- function(utils_vector) {
  exp_u <- exp(utils_vector)
  round(exp_u / sum(exp_u) * 100, 2)
}

# Ejemplo: definir 3 perfiles + "Ninguno" (utilidad = 0)
# Sumar las utilidades de los niveles elegidos para cada perfil
# u_perfil_A <- coefs["nivel1_attr1"] + coefs["nivel2_attr2"] + ...
# shares <- market_share(c(u_perfil_A, u_perfil_B, 0))
# print(shares)

# ── 12. ELASTICIDAD DE PRECIO ─────────────────────────────────
attr_precio <- "${priceAttr}"
niveles_precio <- atributos[[attr_precio]]

# Para cada nivel de precio, calcular share manteniendo lo demás fijo
# u_base <- suma de utilidades de atributos NO-precio en su nivel elegido
# elasticidad <- sapply(niveles_precio, function(precio_lv) {
#   u_precio <- coefs[grep(precio_lv, names(coefs), fixed=TRUE)]
#   if(length(u_precio)==0) u_precio <- 0
#   market_share(c(u_base + u_precio, 0))[1]
# })
# data.frame(nivel = niveles_precio, share = elasticidad)

# ── 13. VISUALIZACIÓN ─────────────────────────────────────────
library(ggplot2)

# Gráfico de importancias
imp_df <- data.frame(
  atributo    = names(importancias),
  importancia = importancias
) |> arrange(desc(importancia))

ggplot(imp_df, aes(x = importancia, y = reorder(atributo, importancia), fill = atributo)) +
  geom_col(show.legend = FALSE) +
  geom_text(aes(label = paste0(importancia, "%")), hjust = -0.1, size = 3.5) +
  scale_x_continuous(limits = c(0, max(imp_df$importancia) * 1.18)) +
  labs(
    title    = "Importancia relativa de atributos — CBC Conjoint",
    subtitle = "Los porcentajes suman 100%",
    x = "Importancia (%)", y = ""
  ) +
  theme_minimal(14) +
  theme(panel.grid.major.y = element_blank())

# ── REFERENCIAS ───────────────────────────────────────────────
# Orme, B.K. (2010). Getting Started with Conjoint Analysis.
# Train, K. (2009). Discrete Choice Methods with Simulation. Cambridge UP.
# Louviere, J.J. et al. (2000). Stated Choice Methods. Cambridge UP.
`;
  document.getElementById('csp').textContent=sc;
  window._cs=sc;
}
function expC(){const{utils,imp}=S.c.res,attrs=S.c.attrs,wb=XLSX.utils.book_new();const ir=[[t('calc.cbc.exp.col.attr'),t('calc.cbc.exp.col.imp')],...[...attrs].sort((a,b)=>imp[b.name]-imp[a.name]).map(a=>[a.name,imp[a.name].toFixed(1)]),[t('calc.md.total'),Object.values(imp).reduce((s,v)=>s+v,0).toFixed(1)]];const wi=XLSX.utils.aoa_to_sheet(ir);XLSX.utils.book_append_sheet(wb,wi,t('calc.cbc.exp.sheet.imp'));const ur=[[t('calc.cbc.exp.col.attr'),t('calc.cbc.exp.col.level'),t('calc.cbc.exp.col.util')]];attrs.forEach(a=>{const s=[...a.levels].sort((x,y)=>utils[a.name][y]-utils[a.name][x]);s.forEach(l=>ur.push([a.name,l,utils[a.name][l].toFixed(4)]));ur.push(['','','']);});const wu=XLSX.utils.aoa_to_sheet(ur);XLSX.utils.book_append_sheet(wb,wu,t('calc.cbc.exp.sheet.util'));XLSX.writeFile(wb,'resultados_cbc_conjoint.xlsx');}
