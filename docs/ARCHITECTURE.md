# Arquitectura objetivo

## Principio pedagógico

El módulo educativo comienza por una problemática gerencial. El módulo de análisis permite aplicar la metodología a datos propios. Ambos consumen el mismo motor estadístico.

```text
Problemática → selección de método ┐
                                  ├→ motor estadístico → interpretación
Datos propios → configuración ────┘
```

## Estructura prevista

```text
src/
├─ app/                 navegación y estado global
├─ education/           problemas, casos, evaluaciones y reportes
├─ analysis/            carga, configuración y exportación
├─ methodologies/       un paquete independiente por metodología
├─ shared/              Excel, gráficos, validación, seguridad e IA
├─ i18n/                diccionarios ES/EN
└─ styles/              estilos compartidos
```

## Contrato de una metodología

Cada metodología debe proporcionar:

- Un motor de cálculo sin dependencias del DOM.
- Validación y normalización de datos.
- Adaptador para el flujo educativo.
- Adaptador para el flujo con datos propios.
- Datos de demostración y plantilla.
- Traducciones.
- Pruebas con resultados conocidos.

## Reglas

1. No duplicar cálculos por idioma o módulo.
2. No insertar datos del usuario con `innerHTML` sin sanitización.
3. La API key BYOK permanece únicamente en memoria.
4. Los motores reciben datos y devuelven resultados; no manipulan la interfaz.
5. Cada nueva metodología debe incluir pruebas y documentación docente.

## Progreso de migración

- Separación física de HTML, CSS y JavaScript: completada.
- Idiomas, estado/casos, Educación, navegación e IA: separados.
- Servicio BYOK: clave en memoria y nomenclatura OpenAI normalizada.
- Motores puros compartidos de Van Westendorp, MaxDiff, NMS y TURF (incluido Shapley): completados y probados.
- MaxDiff centraliza además generación del diseño, validación de ítems y normalización de respuestas.
- Motor puro Conjoint CBC: diseño balanceado, estimación logit multinomial, simulación de share y elasticidad-precio arco completados y probados.

## Evolución prevista de Conjoint

- Versión actual: MNL agregado con utilidades e importancias para el promedio de la muestra.
- Versión futura: Hierarchical Bayes (HB) para distribuciones poblacionales, utilidades individuales, incertidumbre posterior y simulación por encuestado.
- La futura implementación HB deberá ejecutarse fuera del hilo principal —mediante Web Worker/WASM o un servicio opcional— e incluir diagnósticos de convergencia.
