// GLOBAL STATE
// ══════════════════════════════════════════════════
const S={c:{attrs:[],vers:1,design:[],cv:0,cp:0,data:null,res:null,priceAttr:null},m:{items:[],vers:1,design:[],cv:0,cp:0,data:null,res:null},vw:{data:null,res:null},nms:{data:null,res:null},turf:{data:null,items:[],res:null},
edu:{active:false,step:1,problemId:null,caseId:'cafe',sessionCode:'',startTime:null,pretest:[null,null,null],postest:[null,null,null],pretestSubmitted:false,posttestSubmitted:false,response:{hallazgo:'',evidencia:'',recomendacion:'',limitaciones:'',siguiente:''},aiFeedback:'',survey:{utilidad:0,facilidad:0,aprendizaje:0,claridad:0,intencion:0,abierta1:'',abierta2:'',abierta3:''},analysisSnapshot:null}};

// ══════════════════════════════════════════════════
// MODO APRENDIZAJE — DATOS DE CASOS
// ══════════════════════════════════════════════════
// ══════════════════════════════════════════════════
// MODO APRENDIZAJE — CATEGORÍAS DE PROBLEMA DE NEGOCIO
// Cada problema agrupa los casos que lo resuelven.
// ══════════════════════════════════════════════════
const EDU_PROBLEMS={
  precio:{
    id:'precio',
    icon:'💰',
    active:true,
    title:{es:'¿Cuánto debería costar?',en:'How much should it cost?'},
    short:{es:'Sensibilidad de Precios',en:'Price Sensitivity'},
    cardDesc:{es:'Identificar el rango de precios que el mercado percibe como psicológicamente aceptable.',en:'Identify the price range the market perceives as psychologically acceptable.'},
    p1:{es:'Fijar un precio es una de las decisiones más difíciles en marketing. Un precio muy bajo deja dinero sobre la mesa y genera dudas sobre la calidad del producto. Un precio muy alto aleja a los consumidores antes de que prueben lo que ofreces.',en:'Pricing is one of the hardest decisions in marketing. A price set too low leaves money on the table and raises doubts about quality. A price set too high pushes consumers away before they ever try what you offer.'},
    p2:{es:'La pregunta no es solo "¿qué precio maximiza ganancias?" — es, antes que nada, "¿qué rango de precios el mercado considera psicológicamente razonable?". Esa frontera existe en la mente del consumidor, no en una hoja de costos.',en:'The question isn\'t just "what price maximizes profit?" — it\'s, first and foremost, "what price range does the market consider psychologically reasonable?". That boundary lives in the consumer\'s mind, not on a cost sheet.'},
    question:{es:'¿Cómo identificarías ese rango de precios sin simplemente preguntar "¿cuánto pagarías?" — una pregunta que casi nadie responde con honestidad?',en:'How would you identify that price range without simply asking "how much would you pay?" — a question almost nobody answers honestly?'},
    solutionTitle:{es:'La solución que vas a aprender',en:"The solution you'll learn"},
    solutionBold:{es:'Sensibilidad de Precios',en:'Price Sensitivity'},
    solutionDesc:{es:'Existe una familia de técnicas de <strong>Sensibilidad de Precios</strong> diseñada exactamente para esto: en lugar de preguntar directamente cuánto pagaría alguien, se le pide que ubique distintos umbrales de percepción de precio. De esas respuestas emerge, matemáticamente, el rango aceptable — sin que el consumidor tenga que "adivinar" lo que el investigador quiere escuchar.',en:'There is a family of <strong>Price Sensitivity</strong> techniques designed exactly for this: instead of asking directly how much someone would pay, respondents are asked to locate different price-perception thresholds. From those answers, the acceptable range emerges mathematically — without the consumer having to "guess" what the researcher wants to hear.'}
  },
  atributos:{
    id:'atributos',
    icon:'⭐',
    active:true,
    title:{es:'¿Qué valora realmente mi cliente?',en:'What does my customer actually value?'},
    short:{es:'Atributos Más Valorados',en:'Most Valued Attributes'},
    cardDesc:{es:'Identificar qué características de un producto o servicio pesan más en la decisión del consumidor.',en:'Identify which product or service features matter most in the consumer\'s decision.'},
    p1:{es:'Cuando le preguntas directamente a alguien qué le importa, casi todo parece importante: precio, calidad, marca, servicio, ubicación. Las escalas de calificación tradicionales (del 1 al 5) tienden a inflar todo hacia el extremo positivo y no distinguen lo verdaderamente prioritario.',en:'When you ask someone directly what matters to them, almost everything sounds important: price, quality, brand, service, location. Traditional rating scales (1 to 5) tend to inflate everything toward the positive end and fail to distinguish what truly matters most.'},
    p2:{es:'El reto no es solo saber qué le gusta al cliente — es entender qué es indispensable, qué es secundario y qué realmente lo haría rechazar la oferta. Eso requiere forzar comparaciones, no calificaciones aisladas.',en:'The challenge isn\'t just knowing what the customer likes — it\'s understanding what is essential, what is secondary, and what would truly make them reject the offer. That requires forcing comparisons, not isolated ratings.'},
    question:{es:'¿Cómo distinguirías lo verdaderamente prioritario si, al preguntar directamente, la gente tiende a decir que todo le importa por igual?',en:'How would you distinguish what truly matters most if, when asked directly, people tend to say everything matters equally?'},
    solutionTitle:{es:'La solución que vas a aprender',en:"The solution you'll learn"},
    solutionBold:{es:'Best-Worst Scaling (MaxDiff)',en:'Best-Worst Scaling (MaxDiff)'},
    solutionDesc:{es:'La técnica de <strong>Best-Worst Scaling</strong> presenta subconjuntos de atributos y pide elegir el más y el menos importante en cada uno. Al repetir esto con distintas combinaciones, emerge un ranking de importancia relativa mucho más discriminante que cualquier escala de calificación directa.',en:'The <strong>Best-Worst Scaling</strong> technique presents subsets of attributes and asks the respondent to choose the most and least important in each. By repeating this across different combinations, a far more discriminating relative-importance ranking emerges than any direct rating scale could produce.'},
    altMethodsTitle:{es:'¿Por qué no usar Likert o un ranking simple?',en:'Why not use Likert or a simple ranking?'},
    altMethodsText:{
      es:'Son las dos alternativas más comunes, y ambas tienen problemas conocidos. Una escala Likert ("califica del 1 al 5 qué tan importante es cada atributo") sufre de <strong>compresión hacia el extremo positivo</strong>: sin ningún costo de oponerse, casi todo termina calificado 4 o 5, y el ranking resultante tiene poca capacidad de discriminar. Pedir que el encuestado <strong>ordene</strong> todos los atributos de mayor a menor parece resolver esto, pero falla por otra razón: ordenar con precisión 3 o 4 cosas es manejable, pero ordenar 10 o más excede la capacidad cognitiva real de la mayoría de personas — el orden se vuelve poco confiable, especialmente en el tramo medio de la lista. MaxDiff evita ambos problemas: en cada tarjeta solo pide identificar el mejor y el peor de un subconjunto pequeño (4-5 ítems), una tarea cognitivamente liviana, y repite esto con suficientes combinaciones para que emerja una jerarquía completa y estadísticamente confiable.',
      en:'These are the two most common alternatives, and both have well-known problems. A Likert scale ("rate from 1 to 5 how important each attribute is") suffers from <strong>compression toward the positive end</strong>: with no cost to disagreeing, almost everything ends up rated 4 or 5, and the resulting ranking has little discriminating power. Asking respondents to <strong>rank</strong> all attributes from most to least important seems to solve this, but fails for a different reason: ranking 3 or 4 things precisely is manageable, but ranking 10 or more exceeds most people\'s real cognitive capacity — the order becomes unreliable, especially in the middle of the list. MaxDiff avoids both problems: each card only asks for the best and worst of a small subset (4-5 items), a cognitively light task, and repeats this across enough combinations for a complete, statistically reliable hierarchy to emerge.'
    },
    turfDistinctionTitle:{es:'¿No es esto lo mismo que TURF?',en:'Isn\'t this the same as TURF?'},
    turfDistinctionText:{
      es:'No, aunque ambas técnicas trabajan con listas de ítems y es fácil confundirlas. <strong>MaxDiff mide importancia o preferencia relativa</strong>: responde "¿qué tan importante es cada cosa en comparación con las demás?" y produce un ranking. <strong>TURF mide alcance de mercado</strong>: responde "¿qué combinación de opciones cubre a la mayor cantidad de personas posible, sabiendo que cada persona solo necesita que UNA opción de esa combinación le funcione?" y produce un portafolio óptimo, no un ranking de importancia. Un ejemplo aclara la diferencia: MaxDiff te diría que "precio" es el criterio más importante al elegir un seguro; TURF te diría qué combinación de 3 planes de seguro, ofrecidos simultáneamente, captaría a la mayor cantidad de clientes distintos. Son preguntas de negocio distintas que requieren datos de entrada distintos.',
      en:'No, although both techniques work with lists of items and are easy to confuse. <strong>MaxDiff measures relative importance or preference</strong>: it answers "how important is each thing compared to the others?" and produces a ranking. <strong>TURF measures market reach</strong>: it answers "which combination of options covers the largest possible number of people, given that each person only needs ONE option in that combination to work for them?" and produces an optimal portfolio, not an importance ranking. An example clarifies the difference: MaxDiff would tell you "price" is the most important criterion when choosing insurance; TURF would tell you which combination of 3 insurance plans, offered simultaneously, would capture the largest number of distinct customers. These are different business questions requiring different input data.'
    }
  },
  diseno:{
    id:'diseno',
    icon:'🧩',
    active:true,
    title:{es:'¿Cómo diseño el producto ideal?',en:'How do I design the ideal product?'},
    short:{es:'Diseño Óptimo de Producto',en:'Optimal Product Design'},
    cardDesc:{es:'Determinar qué combinación de características debería tener un producto para maximizar su atractivo en el mercado.',en:'Determine which combination of features a product should have to maximize its appeal in the market.'},
    p1:{es:'Un producto no se elige por un solo atributo — se elige por la combinación completa de precio, características, marca y beneficios. Pero esa combinación tiene miles de variantes posibles, y preguntar "¿qué prefieres?" sobre cada una por separado es inviable.',en:'A product isn\'t chosen for a single attribute — it\'s chosen for the full combination of price, features, brand, and benefits. But that combination has thousands of possible variants, and asking "what do you prefer?" about each one separately is unworkable.'},
    p2:{es:'El problema real de diseño es: dado un conjunto de atributos y niveles posibles, ¿cuál combinación específica maximiza la probabilidad de elección del consumidor — y cuánto del valor percibido total aporta cada atributo?',en:'The real design problem is: given a set of possible attributes and levels, which specific combination maximizes the consumer\'s probability of choosing it — and how much of the total perceived value does each attribute contribute?'},
    question:{es:'¿Cómo descubrirías cuánto vale cada característica de tu producto si nunca se vende ni se compra por separado?',en:'How would you discover how much each feature of your product is worth if it\'s never sold or bought separately?'},
    solutionTitle:{es:'La solución que vas a aprender',en:"The solution you'll learn"},
    solutionBold:{es:'Choice-Based Conjoint (CBC)',en:'Choice-Based Conjoint (CBC)'},
    solutionDesc:{es:'El <strong>Choice-Based Conjoint</strong> muestra perfiles de producto completos —combinaciones realistas de atributos— y pide elegir entre ellos repetidamente. Del patrón de elecciones se descompone matemáticamente cuánto vale cada atributo y nivel, permitiendo simular la cuota de mercado de cualquier combinación nueva.',en:'<strong>Choice-Based Conjoint</strong> shows complete product profiles — realistic combinations of attributes — and asks respondents to choose between them repeatedly. From the pattern of choices, the value of each attribute and level is mathematically decomposed, allowing simulation of the market share of any new combination.'}
  },
  portafolio:{
    id:'portafolio',
    icon:'📦',
    active:true,
    title:{es:'¿Qué portafolio de productos maximiza mi cobertura de mercado?',en:'Which product portfolio maximizes my market coverage?'},
    short:{es:'Optimización de Portafolio (TURF)',en:'Portfolio Optimization (TURF)'},
    cardDesc:{es:'Identificar qué combinación de opciones (sabores, modelos, canales, variantes) cubre a la mayor cantidad de consumidores posible con el mínimo número de ítems.',en:'Identify which combination of options (flavors, models, channels, variants) covers the largest possible number of consumers with the fewest items.'},
    p1:{es:'Una empresa nunca puede ofrecer todas las variantes posibles de un producto: el espacio de anaquel es limitado, los costos de producción crecen con la variedad, y la complejidad operativa aumenta. La pregunta real no es "¿qué les gusta a los consumidores?" — es "¿qué combinación de X variantes llega al mayor número de compradores distintos?".',en:'A company can never offer every possible product variant: shelf space is limited, production costs grow with variety, and operational complexity increases. The real question isn\'t "what do consumers like?" — it\'s "which combination of X variants reaches the largest number of distinct buyers?"'},
    p2:{es:'El error común es seleccionar las variantes más populares individualmente. Pero la popularidad individual no garantiza la mayor cobertura combinada: dos variantes muy populares pueden tener los mismos consumidores (solapamiento alto), mientras que una variante menos popular puede añadir compradores completamente nuevos que ninguna otra variante capturaría.',en:'The common mistake is selecting the most individually popular variants. But individual popularity doesn\'t guarantee the greatest combined coverage: two very popular variants may share the same consumers (high overlap), while a less popular variant may add entirely new buyers that no other variant would capture.'},
    question:{es:'¿Cómo elegirías las 3 variantes de un producto para un supermercado, sabiendo que el espacio de anaquel solo permite 3, y que quieres dejar a la menor cantidad de clientes sin ninguna opción que comprarían?',en:'How would you choose the 3 variants of a product for a supermarket, knowing shelf space only allows 3, and you want to leave the fewest possible customers with no option they would buy?'},
    solutionTitle:{es:'La solución que vas a aprender',en:"The solution you'll learn"},
    solutionBold:{es:'TURF Analysis (Total Unduplicated Reach & Frequency)',en:'TURF Analysis (Total Unduplicated Reach & Frequency)'},
    solutionDesc:{es:'El análisis <strong>TURF</strong> evalúa sistemáticamente todas las combinaciones posibles de ítems y calcula, para cada combinación de tamaño k, qué porcentaje del mercado es alcanzado —es decir, tiene al menos una opción que compraría. La clave es el conteo <em>no duplicado</em>: un consumidor se cuenta una sola vez, sin importar cuántos ítems del portafolio estaría dispuesto a comprar. El resultado es el portafolio de k ítems con el mayor alcance total.',en:'<strong>TURF</strong> analysis systematically evaluates all possible item combinations and calculates, for each combination of size k, what percentage of the market is reached — meaning they have at least one option they would buy. The key is the <em>unduplicated</em> count: a consumer is counted only once, regardless of how many items in the portfolio they would be willing to buy. The result is the k-item portfolio with the greatest total reach.'},
    maxdiffDistinctionTitle:{es:'¿No es esto lo mismo que MaxDiff?',en:'Isn\'t this the same as MaxDiff?'},
    maxdiffDistinctionText:{
      es:'No, aunque ambas técnicas trabajan con listas de ítems. <strong>MaxDiff mide importancia relativa</strong>: responde "¿qué tan importante es cada cosa comparada con las demás?" y produce un ranking. <strong>TURF mide cobertura de mercado combinada</strong>: responde "¿qué combinación de ítems llega a más personas posible, donde cada persona solo necesita que UNA opción de la combinación le funcione?" y produce un portafolio óptimo. MaxDiff te diría qué sabor de yogurt les parece más importante a los consumidores; TURF te diría qué tres sabores, ofrecidos juntos en el mismo anaquel, dejarían a la menor cantidad de compradores sin ningún sabor que comprarían.',
      en:'No, although both techniques work with lists of items. <strong>MaxDiff measures relative importance</strong>: it answers "how important is each thing compared to the others?" and produces a ranking. <strong>TURF measures combined market coverage</strong>: it answers "which combination of items reaches the most people possible, where each person only needs ONE option in the combination to work for them?" and produces an optimal portfolio. MaxDiff would tell you which yogurt flavor consumers find most important; TURF would tell you which three flavors, offered together on the same shelf, would leave the fewest buyers with no flavor they would buy.'
    }
  }
};

// ══════════════════════════════════════════════════
const EDU_CASES={
  cafe:{
    id:'cafe',
    problemId:'precio',
    engine:'vw',
    modulo:{es:'Sensibilidad de Precios (Van Westendorp PSM)',en:'Price Sensitivity (Van Westendorp PSM)'},
    titulo:{es:'Café de especialidad en Lima',en:'Specialty coffee in Lima'},
    empresa:{es:'Tostadora Origen',en:'Origen Roasters'},
    sector:{es:'Alimentos y bebidas',en:'Food & beverage'},
    // Problema empresarial — orientado a la ACCIÓN
    problemaEmpresarial:{
      es:'La tostadora artesanal "Origen" va a lanzar su primera bolsa de café de especialidad (250g, grano entero, origen único) al mercado minorista en Lima Metropolitana. El equipo de gerencia necesita decidir, en las próximas dos semanas, a qué precio sacar el producto al mercado, qué precio de oferta usar en el canal digital de lanzamiento, y qué precio máximo podrían comunicar sin generar rechazo en redes sociales y packaging.',
      en:'The artisanal roaster "Origen" is launching its first bag of specialty coffee (250g, whole bean, single-origin) into the retail market in Metropolitan Lima. Management needs to decide, within the next two weeks, at what price to launch the product, what promotional price to use on the digital launch channel, and what maximum price they could communicate without triggering rejection on social media and packaging.'
    },
    // Problema de investigación — orientado a la INFORMACIÓN
    problemaInvestigacion:{
      es:'Para tomar esa decisión de precio, la empresa necesita conocer el rango de precios que el mercado meta percibe como psicológicamente aceptable: el punto en que el precio empieza a generar dudas de calidad por ser demasiado bajo, y el punto en que genera rechazo por ser demasiado alto. Esto requiere medir la percepción de precio directamente en consumidores reales del segmento objetivo, sin sesgar sus respuestas con un precio de referencia.',
      en:'To make that pricing decision, the company needs to know the price range the target market perceives as psychologically acceptable: the point where price starts raising quality doubts for being too low, and the point where it triggers rejection for being too high. This requires measuring price perception directly among real consumers in the target segment, without biasing their answers with a reference price.'
    },
    decision:{es:'Determinar el precio de lanzamiento, el precio de oferta para el canal digital y el precio máximo que podría comunicar sin generar rechazo.',en:'Determine the launch price, the promotional price for the digital channel, and the maximum price that could be communicated without triggering rejection.'},
    muestra:{es:'120 consumidores habituales de café (al menos 3 tazas por semana) residentes en Lima Metropolitana, reclutados en cafeterías de especialidad de Miraflores, Barranco y San Isidro.',en:'120 regular coffee consumers (at least 3 cups per week) residing in Metropolitan Lima, recruited at specialty cafés in Miraflores, Barranco, and San Isidro.'},
    entregable:{es:'Recomendación de precio de lanzamiento con justificación metodológica basada en los 4 puntos del PSM.',en:'Launch price recommendation with methodological justification based on the 4 PSM price points.'},
    producto:{es:'Café de especialidad Origen — 250g grano entero',en:'Origen specialty coffee — 250g whole bean'},
    // Generador de datos embebidos (seed fijo para reproducibilidad — independiente de idioma)
    genData:()=>{
      const N=120,r=rng(2024);
      return Array.from({length:N},(_,i)=>{
        // 3 segmentos latentes: premium (~30%), mid (~50%), price-sensitive (~20%)
        const seg=r()<0.3?'premium':r()<0.71?'mid':'basic';
        const ref=seg==='premium'?55+Math.floor(r()*20):seg==='mid'?35+Math.floor(r()*20):22+Math.floor(r()*12);
        const mb=Math.max(5,Math.round(ref*(0.28+r()*0.10)));
        const b=Math.max(mb+2,Math.round(ref*(0.58+r()*0.12)));
        const c=Math.max(b+3,Math.round(ref*(1.08+r()*0.18)));
        const mc=Math.max(c+5,Math.round(ref*(1.42+r()*0.22)));
        return{id:i+1,muy_barato:mb,barato:b,caro:c,muy_caro:mc};
      });
    }
  },
  cafe_nms:{
    id:'cafe_nms',
    problemId:'precio',
    engine:'nms',
    modulo:{es:'Sensibilidad de Precios + Newton-Miller-Smith (Trial vs. Revenue)',en:'Price Sensitivity + Newton-Miller-Smith (Trial vs. Revenue)'},
    titulo:{es:'Café Origen — Trial vs. Revenue',en:'Origen Coffee — Trial vs. Revenue'},
    empresa:{es:'Tostadora Origen',en:'Origen Roasters'},
    sector:{es:'Alimentos y bebidas',en:'Food & beverage'},
    problemaEmpresarial:{
      es:'Tostadora Origen ya validó con el PSM clásico que su café de especialidad tiene un rango de precios psicológicamente aceptable. Pero la gerencia ahora enfrenta una decisión más difícil: el objetivo del lanzamiento no está definido. ¿Debería priorizar conseguir la mayor cantidad de compradores posible para ganar presencia de mercado rápidamente, o debería fijar un precio más alto que capture más valor por unidad vendida, aunque eso signifique menos clientes iniciales? El precio percibido como "razonable" no necesariamente es el que más conviene desde el punto de vista comercial.',
      en:'Origen Roasters already validated with the classic PSM that its specialty coffee has a psychologically acceptable price range. But management now faces a harder decision: the goal of the launch isn\'t yet defined. Should they prioritize getting as many buyers as possible to gain market presence quickly, or should they set a higher price that captures more value per unit sold, even if that means fewer initial customers? The price perceived as "reasonable" isn\'t necessarily the one that makes the most commercial sense.'
    },
    problemaInvestigacion:{
      es:'El PSM por sí solo no puede responder esto: solo mide percepción de precio, no la probabilidad real de compra a cada nivel. Para estimar cuántos compradores y cuántos ingresos genera cada precio posible, es necesario agregar una medición directa de intención de compra en los precios de referencia de cada encuestado, y calibrar esas respuestas hacia probabilidades realistas. Solo así es posible construir curvas de demanda (trial) y de ingresos (revenue) que permitan comparar objetivos gerenciales distintos sobre los mismos datos de percepción de precio.',
      en:'The PSM alone cannot answer this: it only measures price perception, not the actual probability of purchase at each price level. To estimate how many buyers and how much revenue each possible price generates, a direct measurement of purchase intent at each respondent\'s reference prices must be added, and those responses calibrated into realistic probabilities. Only then is it possible to build demand (trial) and revenue curves that allow comparing different management objectives over the same price-perception data.'
    },
    decision:{es:'Decidir si el lanzamiento debe priorizar el precio de máximo trial (más compradores, mejor penetración) o el precio de máximo revenue (más ingresos por unidad, aunque con menos compradores), y justificar la elección según el objetivo estratégico del lanzamiento.',en:'Decide whether the launch should prioritize the maximum-trial price (more buyers, better penetration) or the maximum-revenue price (more revenue per unit, though with fewer buyers), and justify the choice based on the launch\'s strategic objective.'},
    muestra:{es:'Los mismos 120 consumidores habituales de café del estudio PSM, a quienes se les agregaron 2 preguntas adicionales de intención de compra en escala Likert (1 a 5) sobre los precios "barato" y "caro" que cada uno indicó.',en:'The same 120 regular coffee consumers from the PSM study, who were asked 2 additional Likert-scale (1 to 5) purchase-intent questions about the "cheap" and "expensive" prices each one indicated.'},
    entregable:{es:'Recomendación de precio de lanzamiento que explicite si se prioriza trial o revenue, con los valores de ambos precios óptimos y su justificación estratégica.',en:'Launch price recommendation that explicitly states whether trial or revenue is prioritized, with the values of both optimal prices and their strategic justification.'},
    producto:{es:'Café de especialidad Origen — 250g grano entero',en:'Origen specialty coffee — 250g whole bean'},
    // Mismo generador base que 'cafe' (PSM) + columnas de intención calibradas con RNG independiente (seed 9090)
    // Valores verificados: PMC=25.8, OPP=28.0, IPP=39.5, PME=42.3 (PSM clásico)
    // Precio máximo trial ≈ S/35 (34.8% del mercado) — Precio máximo revenue ≈ S/45 (idx 1358)
    // El gap de ~S/10 entre ambos ilustra con claridad el trade-off pedagógico central del caso.
    genData:()=>{
      const N=120,r=rng(2024);
      const base=Array.from({length:N},(_,i)=>{
        const seg=r()<0.3?'premium':r()<0.71?'mid':'basic';
        const ref=seg==='premium'?55+Math.floor(r()*20):seg==='mid'?35+Math.floor(r()*20):22+Math.floor(r()*12);
        const mb=Math.max(5,Math.round(ref*(0.28+r()*0.10)));
        const b=Math.max(mb+2,Math.round(ref*(0.58+r()*0.12)));
        const c=Math.max(b+3,Math.round(ref*(1.08+r()*0.18)));
        const mc=Math.max(c+5,Math.round(ref*(1.42+r()*0.22)));
        return{id:i+1,muy_barato:mb,barato:b,caro:c,muy_caro:mc};
      });
      const r2=rng(9090);
      return base.map(d=>{
        const ib=Math.min(5,Math.max(1,Math.round(4.1+(r2()-0.5)*2.0)));
        const ic=Math.min(5,Math.max(1,Math.round(2.6+(r2()-0.5)*2.0)));
        return{...d,intent_barato:ib,intent_caro:ic};
      });
    }
  },
  seguro_auto:{
    id:'seguro_auto',
    problemId:'atributos',
    engine:'maxdiff',
    modulo:{es:'Atributos Más Valorados (Best-Worst Scaling / MaxDiff)',en:'Most Valued Attributes (Best-Worst Scaling / MaxDiff)'},
    titulo:{es:'Seguro Vehicular — Criterios de Elección',en:'Auto Insurance — Choice Criteria'},
    empresa:{es:'Aseguradora Rumbo',en:'Rumbo Insurance'},
    sector:{es:'Seguros',en:'Insurance'},
    problemaEmpresarial:{
      es:'Aseguradora Rumbo está rediseñando su propuesta de valor para seguros vehiculares y necesita decidir en qué invertir primero: ¿reducir el precio de la prima, ampliar la red de talleres afiliados, acelerar la atención de siniestros, o fortalecer otro de los muchos beneficios posibles? El equipo de producto tiene una lista de 10 mejoras candidatas pero un presupuesto limitado, y necesita saber cuáles le importan de verdad al cliente antes de comprometer recursos.',
      en:'Rumbo Insurance is redesigning its value proposition for auto insurance and needs to decide what to invest in first: lowering the premium price, expanding the affiliated repair shop network, speeding up claims processing, or strengthening one of many other possible benefits. The product team has a list of 10 candidate improvements but a limited budget, and needs to know which ones customers actually care about before committing resources.'
    },
    problemaInvestigacion:{
      es:'Preguntar directamente "¿qué tan importante es cada beneficio?" en una escala del 1 al 5 no serviría: casi todo terminaría calificado como "muy importante", sin distinguir prioridades reales. Pedir que los encuestados ordenen los 10 criterios de mayor a menor tampoco es confiable: ordenar con precisión más de 4 o 5 ítems excede la capacidad cognitiva razonable de una persona. Se necesita un método que fuerce decisiones relativas en subconjuntos pequeños y, a partir de muchas repeticiones, permita reconstruir una jerarquía completa y estadísticamente sólida.',
      en:'Asking directly "how important is each benefit?" on a 1-to-5 scale wouldn\'t work: almost everything would end up rated "very important," without distinguishing real priorities. Asking respondents to rank all 10 criteria from most to least important isn\'t reliable either: ranking more than 4 or 5 items precisely exceeds a person\'s reasonable cognitive capacity. A method is needed that forces relative decisions within small subsets and, from many repetitions, reconstructs a complete and statistically sound hierarchy.'
    },
    decision:{es:'Determinar en qué orden de prioridad debería invertir Aseguradora Rumbo en mejorar su producto, identificando los 2 o 3 criterios que más influyen en la elección de un seguro vehicular.',en:'Determine in what priority order Rumbo Insurance should invest in improving its product, identifying the 2 or 3 criteria that most influence the choice of auto insurance.'},
    muestra:{es:'150 conductores que cuentan actualmente con seguro vehicular o están evaluando contratar uno, residentes en Lima Metropolitana, encuestados mediante tarjetas de comparación (Best-Worst Scaling).',en:'150 drivers who currently have auto insurance or are evaluating getting one, residing in Metropolitan Lima, surveyed using comparison cards (Best-Worst Scaling).'},
    entregable:{es:'Ranking de los 10 criterios de elección por importancia relativa (% de prioridad), con recomendación de en qué invertir primero.',en:'Ranking of the 10 choice criteria by relative importance (% priority), with a recommendation on what to invest in first.'},
    producto:{es:'Seguro vehicular todo riesgo — Aseguradora Rumbo',en:'Comprehensive auto insurance — Rumbo Insurance'},
    items:[
      {es:'Precio de la prima mensual',en:'Monthly premium price'},
      {es:'Cobertura ante todo riesgo',en:'Comprehensive coverage'},
      {es:'Deducible bajo',en:'Low deductible'},
      {es:'Amplitud de la red de talleres afiliados',en:'Breadth of the affiliated repair shop network'},
      {es:'Rapidez en la atención de siniestros',en:'Speed of claims processing'},
      {es:'Cobertura de auto de reemplazo',en:'Replacement car coverage'},
      {es:'Asistencia vial 24/7',en:'24/7 roadside assistance'},
      {es:'Reputación y solidez de la aseguradora',en:'Reputation and financial strength of the insurer'},
      {es:'Facilidad para hacer trámites por app',en:'Ease of handling procedures via app'},
      {es:'Descuento por buen historial de manejo',en:'Discount for a good driving record'}
    ],
    // Generador de datos embebidos (seed fijo para reproducibilidad)
    // Utilidades latentes diseñadas para un ranking claro: precio y cobertura lideran,
    // reputación y rapidez de siniestros en el medio, "facilidad de app" y "auto de
    // reemplazo" caen al fondo — ilustra cómo MaxDiff descarta beneficios que suenan
    // bien en abstracto pero no son decisivos en la elección real.
    genData:()=>{
      const targetUtility=[9.2,8.7,6.1,5.4,7.8,4.2,4.8,6.8,3.1,5.9];
      const N=10,K=4,Nresp=150;
      const r=rng(111);
      const ns=Math.max(8,Math.ceil(N*4/K));
      const design=buildMD(N,K,ns,r);
      const r2=rng(555);
      const data=Array.from({length:Nresp},(_,ei)=>{
        const row={id_encuestado:ei+1,version:1};
        design.forEach((set,t)=>{
          const us=set.map(idx=>targetUtility[idx]*(0.65+r2()*0.7));
          const bestIdx=us.indexOf(Math.max(...us));
          const worstIdx=us.indexOf(Math.min(...us));
          row['t'+(t+1)+'_mejor']=set[bestIdx]+1;
          row['t'+(t+1)+'_peor']=set[worstIdx]+1;
        });
        return row;
      });
      return{design:[design],data};
    }
  },
  yogurt_turf:{
    id:'yogurt_turf',
    problemId:'portafolio',
    engine:'turf',
    modulo:{es:'Optimización de Portafolio (TURF Analysis)',en:'Portfolio Optimization (TURF Analysis)'},
    titulo:{es:'Yogurt Griego — Portafolio de Sabores',en:'Greek Yogurt — Flavor Portfolio'},
    empresa:{es:'Lácteos Andina',en:'Andina Dairy'},
    sector:{es:'Alimentos y bebidas',en:'Food & beverage'},
    problemaEmpresarial:{
      es:'Lácteos Andina va a lanzar su línea de yogurt griego premium al canal retail (supermercados). Ha desarrollado 8 sabores, pero la categoría de yogurt premium tiene un espacio de anaquel limitado: los supermercados típicamente aceptan entre 3 y 4 referencias por marca. Lanzar los 8 sabores simultáneamente no es viable ni financieramente ni logísticamente. El equipo de marketing necesita decidir cuáles sabores incluir en el lanzamiento para maximizar el número de compradores potenciales que encuentren al menos un sabor que comprarían.',
      en:'Andina Dairy is launching its premium Greek yogurt line into the retail channel (supermarkets). It has developed 8 flavors, but the premium yogurt category has limited shelf space: supermarkets typically accept 3 to 4 SKUs per brand. Launching all 8 flavors simultaneously is neither financially nor logistically viable. The marketing team needs to decide which flavors to include at launch to maximize the number of potential buyers who find at least one flavor they would buy.'
    },
    problemaInvestigacion:{
      es:'Para tomar esa decisión, no basta con saber qué sabor es "el favorito" de los consumidores (eso es una pregunta de preferencia, no de cobertura). Se necesita saber, para cada posible combinación de 3 o 4 sabores, qué proporción del mercado objetivo quedaría cubierta — es decir, tendría al menos un sabor que compraría. Eso requiere medir la disposición de compra de cada consumidor para cada uno de los 8 sabores por separado (dato binario), y luego evaluar sistemáticamente qué combinaciones maximizan el alcance no duplicado.',
      en:'To make that decision, knowing which flavor is the consumer\'s "favorite" isn\'t enough (that\'s a preference question, not a coverage question). What\'s needed is knowing, for each possible combination of 3 or 4 flavors, what proportion of the target market would be covered — meaning they\'d have at least one flavor they would buy. That requires measuring each consumer\'s purchase intent for each of the 8 flavors separately (binary data), then systematically evaluating which combinations maximize unduplicated reach.'
    },
    decision:{es:'Seleccionar los 3 sabores de lanzamiento que maximicen el alcance de mercado (porcentaje del mercado objetivo con al menos un sabor que compraría), y justificar por qué esa combinación específica es mejor que elegir simplemente los 3 sabores más populares individualmente.',en:'Select the 3 launch flavors that maximize market reach (percentage of the target market with at least one flavor they would buy), and justify why that specific combination is better than simply choosing the 3 most individually popular flavors.'},
    muestra:{es:'120 consumidores de yogurt premium residentes en Lima Metropolitana, a quienes se les preguntó, para cada uno de los 8 sabores: "¿Comprarías este sabor de yogurt griego Andina si estuviera disponible en tu supermercado habitual?" (sí / no).',en:'120 premium yogurt consumers in Metropolitan Lima, who were asked for each of the 8 flavors: "Would you buy this Andina Greek yogurt flavor if it were available at your usual supermarket?" (yes / no).'},
    entregable:{es:'Portafolio recomendado de 3 sabores de lanzamiento con justificación TURF (alcance por sabor individual, alcance incremental de cada sabor en el portafolio, y comparación con el portafolio de los 3 más populares individualmente).',en:'Recommended launch portfolio of 3 flavors with TURF justification (individual flavor reach, incremental reach of each flavor in the portfolio, and comparison against the portfolio of the 3 most individually popular flavors).'},
    producto:{es:'Yogurt griego premium Andina — pote 150g',en:'Andina premium Greek yogurt — 150g jar'},
    items:[
      {es:'Fresa',en:'Strawberry'},
      {es:'Durazno',en:'Peach'},
      {es:'Vainilla',en:'Vanilla'},
      {es:'Arándanos (blueberry)',en:'Blueberry'},
      {es:'Maracuyá',en:'Passion fruit'},
      {es:'Mango',en:'Mango'},
      {es:'Chocolate',en:'Chocolate'},
      {es:'Natural (sin sabor)',en:'Natural (plain)'}
    ],
    // Generador de datos (seed fijo para reproducibilidad).
    // 3 segmentos latentes calibrados para que:
    //  - Arándanos lidere en popularidad individual (54%)
    //  - El portafolio óptimo k=3 sea Durazno + Arándanos + Natural
    //    (no los 3 más populares individualmente — eso es la lección pedagógica)
    //  - Natural entre al portafolio óptimo a pesar de su popularidad media
    //    porque cubre al segmento premium/saludable que nadie más cubre
    genData:()=>{
      const N=120;
      const segments=[
        {size:0.40,weights:[0.78,0.70,0.55,0.50,0.35,0.45,0.30,0.40]}, // sabores clásicos
        {size:0.35,weights:[0.30,0.25,0.45,0.75,0.65,0.70,0.20,0.35]}, // sabores exóticos
        {size:0.25,weights:[0.20,0.30,0.60,0.25,0.20,0.30,0.75,0.80]}  // premium/natural
      ];
      const r=rng(7777);
      const data=Array.from({length:N},(_,i)=>{
        const segRand=r();
        let seg=segments[0],cum=0;
        for(const s of segments){cum+=s.size;if(segRand<cum){seg=s;break;}}
        const values=seg.weights.map(w=>r()<w?1:0);
        return{id:i+1,values};
      });
      return data;
    }
  },
  plan_salud:{
    id:'plan_salud',
    problemId:'diseno',
    engine:'conjoint',
    modulo:{es:'Diseño de Producto (CBC Conjoint)',en:'Product Design (CBC Conjoint)'},
    titulo:{es:'Plan de Salud Prepagado en Lima',en:'Prepaid Health Plan in Lima'},
    empresa:{es:'Salud Directa',en:'Salud Directa'},
    sector:{es:'Salud / Seguros',en:'Health / Insurance'},
    problemaEmpresarial:{
      es:'Salud Directa va a lanzar su primer plan de salud prepagado al mercado masivo de Lima Metropolitana. La empresa puede diseñar distintas combinaciones de prima mensual, red de clínicas, tope de cobertura y telemedicina — pero no puede ofrecer simultáneamente el precio más bajo y todos los beneficios en su nivel máximo. El equipo directivo necesita decidir, en las próximas tres semanas, qué combinación específica de atributos lanzar al mercado para maximizar la probabilidad de elección del consumidor.',
      en:'Salud Directa is launching its first prepaid health plan into the mass market in Metropolitan Lima. The company can design different combinations of monthly premium, clinic network, coverage limit, and telemedicine — but cannot simultaneously offer the lowest price and all benefits at their maximum level. The management team needs to decide, within the next three weeks, which specific combination of attributes to bring to market to maximize the consumer\'s probability of choosing it.'
    },
    problemaInvestigacion:{
      es:'Para tomar esa decisión de diseño, no basta con preguntar "¿qué beneficio le importa más?". Un consumidor puede decir que la red de clínicas es "muy importante" y al mismo tiempo elegir un plan con red limitada si el precio es considerablemente menor. Se necesita medir cuánto vale realmente cada atributo — no en abstracto, sino en el contexto de elección frente a alternativas completas. Eso requiere mostrar a los encuestados perfiles de planes completos, pedirles que elijan entre ellos, y descomponer matemáticamente sus patrones de elección para estimar la utilidad marginal de cada nivel.',
      en:'To make that design decision, asking "what benefit matters most?" isn\'t enough. A consumer may say clinic network is "very important" while still choosing a plan with a limited network if the price is considerably lower. What\'s needed is measuring how much each attribute is truly worth — not in the abstract, but in the context of choosing between complete competing alternatives. This requires showing respondents complete plan profiles, asking them to choose between them, and mathematically decomposing their choice patterns to estimate the marginal utility of each level.'
    },
    decision:{es:'Determinar qué combinación de prima mensual, red de clínicas, tope de cobertura y telemedicina maximiza la probabilidad de elección del plan, e identificar qué atributo es el más importante para el consumidor.',en:'Determine which combination of monthly premium, clinic network, coverage limit, and telemedicine maximizes the plan\'s probability of being chosen, and identify which attribute matters most to the consumer.'},
    muestra:{es:'100 adultos de 25 a 55 años sin seguro de salud activo o con cobertura insatisfactoria, residentes en Lima Metropolitana, evaluados mediante tareas de elección entre perfiles de planes de salud (CBC).',en:'100 adults aged 25–55 without active health insurance or with unsatisfactory coverage, residing in Metropolitan Lima, evaluated through health plan profile choice tasks (CBC).'},
    entregable:{es:'Recomendación del plan óptimo de lanzamiento con justificación basada en utilidades parciales e importancias relativas, y estimación del share esperado frente a un competidor promedio.',en:'Recommendation of the optimal launch plan with justification based on partial utilities and relative importances, and estimated share against an average market competitor.'},
    producto:{es:'Plan de salud prepagado — Salud Directa',en:'Prepaid health plan — Salud Directa'},
    // genData(): diseño experimental (seed 3001) + elecciones logit (seed 1234)
    // Utilidades verdaderas diseñadas para jerarquía pedagógica clara:
    //   Prima mensual dominante (~40%), luego Red, Tope, Telemedicina
    //   Ninguno en ~16% — realista para seguros de salud
    genData:()=>{
      const T=15,P=4,N=100,V=2;
      const attrs=[
        {name:'Prima mensual',     levels:['S/ 80 al mes','S/ 120 al mes','S/ 180 al mes']},
        {name:'Red de clínicas',   levels:['Solo Lima','Lima + 5 ciudades','Cobertura nacional']},
        {name:'Tope de cobertura', levels:['S/ 50,000','S/ 100,000','S/ 200,000']},
        {name:'Telemedicina',      levels:['Sin telemedicina','Teleconsultas básicas','Telemedicina completa']}
      ];
      // Generar diseño (mismo algoritmo que genCDesign)
      const design=[];
      for(let v=0;v<V;v++){
        const rv=rng(3001+v*137);
        const tasks=[];
        for(let t=0;t<T;t++){
          const task=[];
          for(let p=0;p<P;p++){
            const prod={};
            attrs.forEach(a=>{prod[a.name]=a.levels[Math.floor(rv()*a.levels.length)];});
            task.push(prod);
          }
          tasks.push(task);
        }
        const sh=[...Array(T).keys()].sort(()=>rv()-0.5);
        design.push(sh.map(i=>tasks[i]));
      }
      // Utilidades verdaderas (centradas, rango: Prima 2.4, Red 1.4, Tope 1.0, Tel 0.75)
      const tU={
        'Prima mensual':     {'S/ 80 al mes':1.2,'S/ 120 al mes':0.0,'S/ 180 al mes':-1.2},
        'Red de clínicas':   {'Solo Lima':-0.7,'Lima + 5 ciudades':0.0,'Cobertura nacional':0.7},
        'Tope de cobertura': {'S/ 50,000':-0.5,'S/ 100,000':0.0,'S/ 200,000':0.5},
        'Telemedicina':      {'Sin telemedicina':-0.45,'Teleconsultas básicas':0.15,'Telemedicina completa':0.3}
      };
      // Elecciones con ruido Gumbel
      const r=rng(1234);
      const gb=()=>-Math.log(-Math.log(Math.max(r(),1e-10)));
      const data=Array.from({length:N},(_,i)=>{
        const row={id_encuestado:i+1,version:(i%V)+1};
        const v=Math.min(i%V,design.length-1);
        for(let t=0;t<T;t++){
          const task=design[v][t];
          const detU=task.map(prod=>attrs.reduce((s,a)=>s+(tU[a.name][prod[a.name]]||0),0));
          const noisy=[...detU,0].map(u=>u+gb());
          const ch=noisy.indexOf(Math.max(...noisy));
          row['tarea_'+(t+1)]=ch===P?0:ch+1;
        }
        return row;
      });
      return{attrs,design,data};
    }
  }
};

// Helper: lee un campo bilingüe del caso según el idioma activo
function ce(field){ return field[_lang]||field.es; }

// ══════════════════════════════════════════════════
// MODO APRENDIZAJE — PREGUNTAS DE EVALUACIÓN (BILINGÜE)
// ══════════════════════════════════════════════════
const EDU_QUESTIONS_BY_CASE={
cafe:{
es:[
  {
    num:'P1',texto:'El Precio Óptimo (OPP) en el Van Westendorp PSM se define como:',
    opciones:['El precio más mencionado como "justo" por los encuestados','El precio donde se igualan las curvas "muy barato" y "muy caro"','El precio que maximiza los ingresos estimados','El promedio entre el precio mínimo y máximo aceptable'],
    correcta:1,
    feedback_correcto:'Correcto. El OPP (Optimum Price Point) es la intersección de las curvas acumuladas de "muy barato" y "muy caro", donde el rechazo total por precio —tanto por ser excesivo como por parecer de baja calidad— se minimiza simultáneamente.',
    feedback_incorrecto:'El OPP es la intersección de las curvas "muy barato" y "muy caro". En ese punto, el porcentaje de personas que lo ven demasiado barato es igual al que lo ve demasiado caro, minimizando el rechazo total.'
  },
  {
    num:'P2',texto:'¿Por qué se excluyen del análisis los encuestados con respuestas inconsistentes (ej: muy_barato > caro)?',
    opciones:['Para reducir la muestra y acelerar el cálculo','Porque sus respuestas elevan artificialmente el precio óptimo','Porque violan la lógica de ordenamiento psicológico que sostiene el modelo','Porque no son consumidores del producto evaluado'],
    correcta:2,
    feedback_correcto:'Correcto. El PSM asume que un mismo individuo percibe: muy_barato ≤ barato ≤ caro ≤ muy_caro. Si no se cumple esta jerarquía, la persona no puede ubicarse coherentemente en las curvas acumuladas, y su inclusión distorsiona las intersecciones.',
    feedback_incorrecto:'La razón es metodológica: el PSM requiere que cada individuo tenga una jerarquía de precios coherente (muy_barato ≤ barato ≤ caro ≤ muy_caro). Sin esa consistencia, las curvas acumuladas perderían su interpretación probabilística.'
  },
  {
    num:'P3',texto:'Si el PMC es S/28 y el PME es S/52, ¿cuál de estas afirmaciones es correcta?',
    opciones:['Todo precio entre S/28 y S/52 es igualmente aceptable','S/28 y S/52 son los únicos precios que el mercado aceptaría','El rango aceptable va de S/28 a S/52, pero la aceptación varía dentro de ese rango','El precio de lanzamiento óptimo siempre es el punto medio (S/40)'],
    correcta:2,
    feedback_correcto:'Correcto. El rango PMC–PME define los límites de aceptación, pero no todos los precios dentro tienen la misma probabilidad de éxito. El OPP y el IPP, que están dentro de ese rango, son los puntos de menor resistencia psicológica.',
    feedback_incorrecto:'El rango PMC–PME es el espacio de precios psicológicamente aceptables, pero la aceptación no es uniforme: cerca del PMC hay riesgo de ser percibido como de baja calidad, y cerca del PME hay riesgo de rechazo por precio alto. El OPP y el IPP son los puntos de menor fricción.'
  }
],
en:[
  {
    num:'P1',texto:'The Optimum Price Point (OPP) in the Van Westendorp PSM is defined as:',
    opciones:['The price most often mentioned as "fair" by respondents','The price where the "too cheap" and "too expensive" curves intersect','The price that maximizes estimated revenue','The average between the minimum and maximum acceptable price'],
    correcta:1,
    feedback_correcto:'Correct. The OPP is the intersection of the cumulative "too cheap" and "too expensive" curves, where total rejection by price — whether for being excessive or for seeming low quality — is minimized simultaneously.',
    feedback_incorrecto:'The OPP is the intersection of the "too cheap" and "too expensive" curves. At that point, the percentage who see it as too cheap equals the percentage who see it as too expensive, minimizing total rejection.'
  },
  {
    num:'P2',texto:'Why are respondents with inconsistent answers (e.g., too_cheap > expensive) excluded from the analysis?',
    opciones:['To reduce the sample and speed up the calculation','Because their answers artificially raise the optimal price','Because they violate the psychological ordering logic the model relies on','Because they are not consumers of the evaluated product'],
    correcta:2,
    feedback_correcto:'Correct. The PSM assumes a single individual perceives: too_cheap ≤ cheap ≤ expensive ≤ too_expensive. If this hierarchy doesn\'t hold, the person can\'t be coherently placed on the cumulative curves, and including them distorts the intersections.',
    feedback_incorrecto:'The reason is methodological: the PSM requires each individual to have a coherent price hierarchy (too_cheap ≤ cheap ≤ expensive ≤ too_expensive). Without that consistency, the cumulative curves would lose their probabilistic interpretation.'
  },
  {
    num:'P3',texto:'If the PMC is $28 and the PME is $52, which of these statements is correct?',
    opciones:['Every price between $28 and $52 is equally acceptable','$28 and $52 are the only prices the market would accept','The acceptable range goes from $28 to $52, but acceptance varies within that range','The optimal launch price is always the midpoint ($40)'],
    correcta:2,
    feedback_correcto:'Correct. The PMC–PME range defines the acceptance limits, but not all prices within it have the same probability of success. The OPP and IPP, which fall inside that range, are the points of least psychological resistance.',
    feedback_incorrecto:'The PMC–PME range is the space of psychologically acceptable prices, but acceptance isn\'t uniform: near the PMC there\'s a risk of being perceived as low quality, and near the PME there\'s a risk of rejection for being too expensive. The OPP and IPP are the points of least friction.'
  }
]
},
cafe_nms:{
es:[
  {
    num:'P1',texto:'Las 2 preguntas adicionales de intención de compra del modelo NMS se aplican sobre:',
    opciones:['Un precio fijo, igual para todos los encuestados','Los precios "barato" y "caro" que cada encuestado indicó en el PSM','El precio promedio del mercado, calculado después del PSM','El precio más alto y el precio más bajo de toda la muestra'],
    correcta:1,
    feedback_correcto:'Correcto. Cada encuestado responde su intención de compra sobre SUS PROPIOS precios "barato" y "caro" indicados previamente — eso permite calibrar la probabilidad de compra de forma personalizada, no genérica.',
    feedback_incorrecto:'Las preguntas de intención se formulan sobre los precios que el propio encuestado ya indicó como "barato" y "caro" en las 4 preguntas del PSM clásico, no sobre un precio fijo o promedio del mercado.'
  },
  {
    num:'P2',texto:'¿Por qué el precio de máximo trial y el precio de máximo revenue pueden ser distintos?',
    opciones:['Porque son errores de cálculo que deberían coincidir','Porque revenue siempre es mayor que trial por definición matemática','Porque un precio más bajo puede atraer más compradores, pero un precio más alto puede generar más ingresos totales aunque venda menos unidades','Porque NMS calcula revenue con una muestra distinta a la de trial'],
    correcta:2,
    feedback_correcto:'Correcto. Ese es precisamente el aporte de NMS sobre el PSM clásico: maximizar el número de compradores (trial) y maximizar los ingresos totales (revenue = precio × demanda) son objetivos distintos que no necesariamente se logran al mismo precio.',
    feedback_incorrecto:'No es un error de cálculo: ambos objetivos son legítimos pero distintos. El precio de máximo trial maximiza cuántas personas comprarían; el precio de máximo revenue maximiza precio × demanda estimada, que puede ocurrir a un precio más alto con menos compradores.'
  },
  {
    num:'P3',texto:'Si el precio de máximo trial es S/35 y el de máximo revenue es S/45, ¿cuál es la interpretación gerencial correcta?',
    opciones:['S/45 es siempre la mejor opción porque genera más ingresos','S/35 es siempre la mejor opción porque atrae más clientes','La elección depende del objetivo estratégico: penetración rápida (S/35) vs. captura de valor (S/45), y debe complementarse con un análisis de margen','El precio correcto es el promedio entre ambos (S/40)'],
    correcta:2,
    feedback_correcto:'Correcto. NMS no dicta un único precio "correcto": ofrece dos alternativas válidas según el objetivo del lanzamiento. Además, revenue estimado no es lo mismo que utilidad — la decisión final debe considerar también costos y margen.',
    feedback_incorrecto:'Ninguno de los dos precios es automáticamente "mejor" — depende de si el objetivo gerencial prioriza penetración de mercado (más compradores) o captura de valor (más ingresos por unidad). Promediar ambos no tiene sustento metodológico.'
  }
],
en:[
  {
    num:'P1',texto:'The 2 additional purchase-intent questions in the NMS model are asked about:',
    opciones:['A single fixed price, the same for all respondents','The "cheap" and "expensive" prices each respondent indicated in the PSM','The market average price, calculated after the PSM','The highest and lowest prices in the entire sample'],
    correcta:1,
    feedback_correcto:'Correct. Each respondent answers their purchase intent about THEIR OWN "cheap" and "expensive" prices indicated earlier — this allows the purchase probability to be calibrated individually, not generically.',
    feedback_incorrecto:'The intent questions are asked about the prices the respondent themselves already indicated as "cheap" and "expensive" in the 4 classic PSM questions, not about a fixed or market-average price.'
  },
  {
    num:'P2',texto:'Why can the maximum-trial price and the maximum-revenue price be different?',
    opciones:['Because they are calculation errors that should match','Because revenue is always higher than trial by mathematical definition','Because a lower price can attract more buyers, while a higher price can generate more total revenue even while selling fewer units','Because NMS calculates revenue using a different sample than trial'],
    correcta:2,
    feedback_correcto:'Correct. That is precisely what NMS adds over the classic PSM: maximizing the number of buyers (trial) and maximizing total revenue (revenue = price × demand) are different objectives that don\'t necessarily occur at the same price.',
    feedback_incorrecto:'It is not a calculation error: both objectives are legitimate but different. The maximum-trial price maximizes how many people would buy; the maximum-revenue price maximizes price × estimated demand, which can occur at a higher price with fewer buyers.'
  },
  {
    num:'P3',texto:'If the maximum-trial price is $35 and the maximum-revenue price is $45, what is the correct managerial interpretation?',
    opciones:['$45 is always the best option because it generates more revenue','$35 is always the best option because it attracts more customers','The choice depends on the strategic objective: fast penetration ($35) vs. value capture ($45), and should be complemented with a margin analysis','The correct price is the average of both ($40)'],
    correcta:2,
    feedback_correcto:'Correct. NMS does not dictate a single "correct" price: it offers two valid alternatives depending on the launch objective. Also, estimated revenue is not the same as profit — the final decision must also account for costs and margin.',
    feedback_incorrecto:'Neither price is automatically "better" — it depends on whether the managerial objective prioritizes market penetration (more buyers) or value capture (more revenue per unit). Averaging both has no methodological basis.'
  }
]
},
seguro_auto:{
es:[
  {
    num:'P1',texto:'En cada tarjeta de MaxDiff, al encuestado se le pide:',
    opciones:['Calificar cada atributo del 1 al 5 según su importancia','Ordenar todos los atributos de mayor a menor importancia','Elegir el atributo más importante y el menos importante dentro de un subconjunto pequeño','Indicar si está de acuerdo o en desacuerdo con cada atributo'],
    correcta:2,
    feedback_correcto:'Correcto. MaxDiff (Best-Worst Scaling) muestra un subconjunto pequeño de atributos (típicamente 4 o 5) y pide elegir solo el mejor y el peor — una tarea cognitivamente liviana que se repite con distintas combinaciones.',
    feedback_incorrecto:'MaxDiff no usa escalas de calificación ni pide ordenar la lista completa — en cada tarjeta solo se elige el mejor y el peor de un subconjunto pequeño de atributos, repitiendo esto varias veces con combinaciones distintas.'
  },
  {
    num:'P2',texto:'¿Por qué una escala Likert (calificar del 1 al 5) es menos confiable que MaxDiff para priorizar atributos?',
    opciones:['Porque Likert requiere una muestra mucho más grande','Porque las personas tienden a calificar casi todo como importante (4 o 5), sin discriminar prioridades reales','Porque Likert solo puede usarse con menos de 5 atributos','Porque MaxDiff no requiere que el encuestado piense en los atributos'],
    correcta:1,
    feedback_correcto:'Correcto. Sin un costo real de oponerse, las escalas Likert sufren compresión hacia el extremo positivo: casi todo termina calificado alto, y el ranking resultante discrimina poco entre atributos. MaxDiff fuerza una decisión relativa que sí discrimina.',
    feedback_incorrecto:'El problema de Likert no es de tamaño de muestra ni de número de atributos — es que, al no exigir una comparación forzada, casi todo termina calificado como "importante", y el ranking resultante no distingue bien las prioridades reales.'
  },
  {
    num:'P3',texto:'¿Cuál es la diferencia central entre MaxDiff y TURF Analysis?',
    opciones:['MaxDiff usa más encuestados que TURF','MaxDiff mide importancia relativa de atributos; TURF mide qué combinación de opciones maximiza el alcance de mercado','Son la misma técnica con nombres distintos','TURF solo funciona con datos de precio, MaxDiff no'],
    correcta:1,
    feedback_correcto:'Correcto. MaxDiff responde "¿qué tan importante es cada cosa?" y produce un ranking. TURF responde "¿qué combinación de opciones cubre a más personas posible?" y produce un portafolio óptimo — son preguntas de negocio distintas.',
    feedback_incorrecto:'No es una diferencia de tamaño de muestra ni de tipo de dato: MaxDiff mide importancia relativa (ranking), mientras que TURF mide alcance de mercado combinando opciones (portafolio óptimo). Responden preguntas de negocio distintas.'
  }
],
en:[
  {
    num:'P1',texto:'On each MaxDiff card, the respondent is asked to:',
    opciones:['Rate each attribute from 1 to 5 based on importance','Rank all attributes from most to least important','Choose the most important and least important attribute within a small subset','Indicate whether they agree or disagree with each attribute'],
    correcta:2,
    feedback_correcto:'Correct. MaxDiff (Best-Worst Scaling) shows a small subset of attributes (typically 4 or 5) and asks the respondent to choose only the best and the worst — a cognitively light task repeated across different combinations.',
    feedback_incorrecto:'MaxDiff does not use rating scales or ask respondents to rank the full list — on each card, only the best and worst of a small attribute subset are chosen, repeated several times with different combinations.'
  },
  {
    num:'P2',texto:'Why is a Likert scale (rating 1 to 5) less reliable than MaxDiff for prioritizing attributes?',
    opciones:['Because Likert requires a much larger sample','Because people tend to rate almost everything as important (4 or 5), without discriminating real priorities','Because Likert can only be used with fewer than 5 attributes','Because MaxDiff does not require the respondent to think about the attributes'],
    correcta:1,
    feedback_correcto:'Correct. With no real cost to disagreeing, Likert scales suffer compression toward the positive end: almost everything ends up rated high, and the resulting ranking discriminates poorly between attributes. MaxDiff forces a relative decision that does discriminate.',
    feedback_incorrecto:'The problem with Likert isn\'t sample size or number of attributes — it\'s that, without requiring a forced comparison, almost everything ends up rated as "important," and the resulting ranking doesn\'t distinguish real priorities well.'
  },
  {
    num:'P3',texto:'What is the central difference between MaxDiff and TURF Analysis?',
    opciones:['MaxDiff uses more respondents than TURF','MaxDiff measures relative importance of attributes; TURF measures which combination of options maximizes market reach','They are the same technique with different names','TURF only works with price data, MaxDiff does not'],
    correcta:1,
    feedback_correcto:'Correct. MaxDiff answers "how important is each thing?" and produces a ranking. TURF answers "which combination of options covers the most people possible?" and produces an optimal portfolio — these are different business questions.',
    feedback_incorrecto:'It is not a difference in sample size or data type: MaxDiff measures relative importance (ranking), while TURF measures market reach by combining options (optimal portfolio). They answer different business questions.'
  }
]
},
yogurt_turf:{
es:[
  {
    num:'P1',texto:'En TURF Analysis, "alcance no duplicado" (unduplicated reach) significa:',
    opciones:['El porcentaje de encuestados que conocen todos los ítems del portafolio','El porcentaje de encuestados que comprarían al menos uno de los ítems del portafolio, contando a cada persona una sola vez','El promedio de ítems que compraría cada encuestado dentro del portafolio','El porcentaje de encuestados que comprarían todos los ítems del portafolio'],
    correcta:1,
    feedback_correcto:'Correcto. "No duplicado" es la clave de TURF: un encuestado se cuenta una sola vez aunque esté dispuesto a comprar múltiples ítems del portafolio. El objetivo es maximizar el número de personas cubiertas, no el número de ventas por persona.',
    feedback_incorrecto:'El alcance no duplicado no mide conocimiento ni disposición a comprar todo el portafolio. Un encuestado es "alcanzado" si compraría AL MENOS UNO de los ítems del portafolio — y se le cuenta solo una vez, aunque compraría varios.'
  },
  {
    num:'P2',texto:'¿Por qué seleccionar los 3 sabores más populares individualmente puede NO ser el portafolio óptimo?',
    opciones:['Porque los sabores más populares son los más caros de producir','Porque los consumidores de los sabores más populares pueden ser los mismos, dejando sin opción a otros segmentos del mercado','Porque TURF no considera la popularidad individual de los ítems','Porque el portafolio óptimo siempre incluye los ítems menos populares'],
    correcta:1,
    feedback_correcto:'Correcto. Este es el principio central de TURF: el solapamiento importa. Si los 3 sabores más populares son elegidos por las mismas personas, el alcance combinado puede ser menor que una combinación que incluya un sabor menos popular pero que cubra a consumidores que los otros sabores no alcanzan.',
    feedback_incorrecto:'No es una cuestión de costos ni de excluir sabores populares. El problema es el solapamiento: si los sabores más populares son elegidos por las mismas personas, añadir un sabor menos popular que cubra consumidores distintos puede aumentar más el alcance total.'
  },
  {
    num:'P3',texto:'Si el alcance incremental del tercer sabor en el portafolio óptimo es 11%, ¿cómo se interpreta?',
    opciones:['El tercer sabor es comprado por el 11% de todos los encuestados','El 11% de encuestados compraría exclusivamente ese tercer sabor y ningún otro del portafolio','El tercer sabor añade un 11% de encuestados que no habrían sido cubiertos por los dos primeros sabores del portafolio','El portafolio de 3 sabores alcanza a un 11% más que el portafolio de 2 sabores en total'],
    correcta:2,
    feedback_correcto:'Correcto. El alcance incremental mide cuántos consumidores ADICIONALES cubre cada sabor al añadirse al portafolio — es decir, cuántas personas que no habrían comprado ninguno de los sabores anteriores sí comprarían este nuevo sabor.',
    feedback_incorrecto:'El alcance incremental no es la popularidad individual del ítem, ni el porcentaje que lo compra exclusivamente. Mide los compradores nuevos que ese ítem añade al portafolio — personas que no habrían sido cubiertas por los ítems ya elegidos.'
  }
],
en:[
  {
    num:'P1',texto:'In TURF Analysis, "unduplicated reach" means:',
    opciones:['The percentage of respondents who are aware of all items in the portfolio','The percentage of respondents who would buy at least one item in the portfolio, counting each person only once','The average number of items each respondent would buy within the portfolio','The percentage of respondents who would buy all items in the portfolio'],
    correcta:1,
    feedback_correcto:'Correct. "Unduplicated" is the key to TURF: a respondent is counted only once even if they would be willing to buy multiple items in the portfolio. The goal is to maximize the number of people covered, not the number of sales per person.',
    feedback_incorrecto:'Unduplicated reach doesn\'t measure awareness or willingness to buy the entire portfolio. A respondent is "reached" if they would buy AT LEAST ONE item in the portfolio — and they\'re counted only once, even if they would buy several.'
  },
  {
    num:'P2',texto:'Why might selecting the 3 most individually popular flavors NOT be the optimal portfolio?',
    opciones:['Because the most popular flavors are the most expensive to produce','Because the consumers of the most popular flavors may be the same people, leaving other market segments with no option','Because TURF does not consider the individual popularity of items','Because the optimal portfolio always includes the least popular items'],
    correcta:1,
    feedback_correcto:'Correct. This is the central principle of TURF: overlap matters. If the 3 most popular flavors are chosen by the same people, the combined reach may be lower than a combination that includes a less popular flavor that covers consumers the other flavors don\'t reach.',
    feedback_incorrecto:'It\'s not a cost issue or about excluding popular flavors. The problem is overlap: if the most popular flavors are chosen by the same people, adding a less popular flavor that covers different consumers may increase total reach more.'
  },
  {
    num:'P3',texto:"If the incremental reach of the third flavor in the optimal portfolio is 11%, how is this interpreted?",
    opciones:['The third flavor is bought by 11% of all respondents','11% of respondents would buy exclusively that third flavor and none other in the portfolio','The third flavor adds 11% of respondents who would not have been covered by the first two flavors in the portfolio','The 3-flavor portfolio reaches 11% more in total than the 2-flavor portfolio'],
    correcta:2,
    feedback_correcto:'Correct. Incremental reach measures how many ADDITIONAL consumers each flavor covers when added to the portfolio — that is, how many people who would not have bought any of the previous flavors would buy this new one.',
    feedback_incorrecto:'Incremental reach is not the item\'s individual popularity, nor the percentage who buy it exclusively. It measures the new buyers that item adds to the portfolio — people who would not have been covered by the items already chosen.'
  }
]
},
  plan_salud:{
  es:[
    {num:'P1',
     texto:'¿Qué mide una utilidad parcial en un análisis CBC Conjoint?',
     opciones:['El precio que el consumidor pagaría por ese atributo','La contribución de ese nivel al valor percibido total del producto','La frecuencia con que ese nivel apareció en el diseño experimental','El porcentaje de encuestados que eligió ese nivel'],
     correcta:1,
     feedback_correcto:'Correcto. Las utilidades parciales (part-worth utilities) miden cuánto contribuye cada nivel de atributo al valor percibido total del producto. Son coeficientes del modelo logit, no precios ni frecuencias de elección.',
     feedback_incorrecto:'No exactamente. Las utilidades parciales miden la contribución de cada nivel al valor percibido total — son coeficientes del modelo logit. No tienen unidades monetarias ni equivalen a frecuencias de elección.'},
    {num:'P2',
     texto:'En este estudio, "Red de clínicas" tiene una importancia relativa de aproximadamente 25%. ¿Qué significa este dato?',
     opciones:['El 25% de los encuestados prefirió la cobertura nacional','La variación en la red de clínicas explica el 25% de la variación total en las elecciones','25 de cada 100 encuestados cambiarían de plan si la red cambia','El atributo "red" equivale al 25% del precio del plan'],
     correcta:1,
     feedback_correcto:'Correcto. La importancia relativa de un atributo mide qué proporción de la variación total en las elecciones explica ese atributo. Un 25% indica que la red de clínicas es el segundo factor más determinante en la decisión de compra.',
     feedback_incorrecto:'No exactamente. La importancia relativa mide cuánto del total de la variación en las elecciones explica ese atributo. Un 25% significa que la red de clínicas es el segundo factor más influyente, no que el 25% de personas prefirió la red más amplia.'},
    {num:'P3',
     texto:'El análisis muestra que "Prima mensual" domina (~40%) y "Telemedicina completa" tiene utilidad positiva moderada. ¿Qué herramienta usarías para decidir si conviene ofrecer telemedicina completa a un precio mayor?',
     opciones:['Comparar solo las utilidades individuales de cada nivel de telemedicina','Calcular el promedio de importancias de todos los atributos','El simulador de cuota de mercado: configurar dos planes y comparar el share estimado','Multiplicar la importancia del atributo por la utilidad del nivel más alto'],
     correcta:2,
     feedback_correcto:'Correcto. El simulador de cuota de mercado (modelo MNL) permite comparar configuraciones completas: podés enfrentar un plan con telemedicina completa a mayor precio contra otro sin telemedicina a menor precio, y ver cuál captura más mercado. Las utilidades individuales no son suficientes.',
     feedback_incorrecto:'La herramienta correcta es el simulador de cuota de mercado. Las utilidades individuales ayudan a entender el valor de cada nivel, pero la decisión de diseño requiere comparar configuraciones completas frente a la competencia — y para eso está el simulador MNL.'}
  ],
  en:[
    {num:'P1',
     texto:'What does a partial utility represent in a CBC Conjoint analysis?',
     opciones:['The price the consumer would pay for that attribute','The contribution of that level to the product\'s total perceived value','The frequency with which that level appeared in the experimental design','The percentage of respondents who chose that level'],
     correcta:1,
     feedback_correcto:'Correct. Partial utilities (part-worth utilities) measure how much each attribute level contributes to the total perceived value of the product. They are logit model coefficients — not prices or choice frequencies.',
     feedback_incorrecto:'Not quite. Partial utilities measure each level\'s contribution to the total perceived value — they are logit model coefficients. They carry no monetary units and do not equal choice frequencies.'},
    {num:'P2',
     texto:'In this study, "Clinic network" has a relative importance of approximately 25%. What does this mean?',
     opciones:['25% of respondents preferred the national clinic coverage','The variation in clinic network explains 25% of the total variation in choices','25 out of 100 respondents would switch plans if the network changes','The "network" attribute equals 25% of the plan price'],
     correcta:1,
     feedback_correcto:'Correct. Relative importance measures what proportion of the total variation in choices is explained by that attribute. 25% means clinic network is the second most influential factor in the purchase decision.',
     feedback_incorrecto:'Not quite. Relative importance measures how much of the total variation in choices that attribute explains. 25% means clinic network is the second most influential factor — not that 25% of people preferred the broader network.'},
    {num:'P3',
     texto:'The analysis shows "Monthly premium" dominates the importances (~40%) and "Full telemedicine" has a moderate positive utility. What tool would you use to decide whether it\'s worthwhile to offer full telemedicine at a higher price?',
     opciones:['Compare only the individual utilities of each telemedicine level','Calculate the average importance across all attributes','The market share simulator: configure two plans and compare the estimated shares','Multiply the attribute importance by the utility of the highest level'],
     correcta:2,
     feedback_correcto:'Correct. The market share simulator (MNL model) lets you compare complete configurations: you can pit a plan with full telemedicine at a higher price against one without telemedicine at a lower price, and see which captures more market. Individual utilities alone aren\'t enough.',
     feedback_incorrecto:'The right tool is the market share simulator. Individual utilities help understand the value of each level, but the design decision requires comparing complete configurations against the competition — and that\'s what the MNL simulator is for.'}
  ]
}
};
function EDU_Q(){
  const byCase=EDU_QUESTIONS_BY_CASE[S.edu.caseId]||EDU_QUESTIONS_BY_CASE.cafe;
  return byCase[_lang]||byCase.es;
}
// Alias retrocompatible — siempre apunta al idioma y caso activos en el momento del acceso
Object.defineProperty(window,'EDU_QUESTIONS',{get(){return EDU_Q();}});

// ══════════════════════════════════════════════════
