# Contexto del proyecto para Codex

## Visión

Crear una aplicación web para enseñar investigación de mercados y técnicas estadísticas desde problemáticas gerenciales, no desde una lista de herramientas.

El estudiante debe aprender a recorrer esta secuencia:

```text
Problemática → decisión gerencial → información necesaria
→ selección y justificación de metodología → análisis
→ interpretación → recomendación → aplicación a un proyecto propio
```

La aplicación busca ser útil en cursos universitarios de investigación de mercados. Un docente debería poder utilizar casos guiados en clase y luego pedir a sus estudiantes que apliquen la metodología a datos propios.

## Dos módulos principales

### Educación y formación

- Entrada por problemáticas gerenciales.
- Casos empresariales guiados.
- Selección y evaluación de la metodología.
- Pretest y postest.
- Diagnóstico de datos.
- Resultados técnicos, interpretativos y gerenciales.
- Respuesta del estudiante, feedback opcional con IA y reporte.

### Análisis con datos propios

- Selección de metodología.
- Plantillas y datos demostrativos.
- Carga y validación de Excel/CSV.
- Configuración y análisis.
- Visualización, interpretación y exportación.

Los dos módulos deben compartir un único motor estadístico por metodología.

## Metodologías actuales

- CBC Conjoint.
- MaxDiff.
- Van Westendorp Price Sensitivity Meter.
- Van Westendorp + Newton-Miller-Smith.
- TURF.

La arquitectura debe permitir agregar nuevas técnicas multivariadas.

## Posible contribución académica

El proyecto nació como base para un artículo orientado a *Marketing Education Review*. La contribución no es simplemente una calculadora web: es un entorno de aprendizaje que operacionaliza una enseñanza centrada en problemas gerenciales y evalúa selección metodológica, ejecución, interpretación y transferencia a datos propios.

## Decisiones arquitectónicas

- Un solo repositorio.
- Vite como herramienta de desarrollo y compilación.
- GitHub Pages como alojamiento inicial.
- Un paquete por metodología.
- Idiomas separados mediante diccionarios, sin duplicar metodologías por idioma.
- Motores estadísticos puros, independientes del DOM.
- Adaptadores diferentes para Educación y Datos propios.
- API de OpenAI opcional bajo modalidad BYOK.
- La API key permanece solamente en memoria durante la pestaña.
- Nunca incluir claves privadas en GitHub.

## Estado actual

- Prototipo original preservado en `reference/`.
- HTML, CSS y JavaScript separados.
- Scripts separados para i18n, estado/casos, Educación, navegación, IA y metodologías.
- Servicio de IA extraído de Conjoint y nomenclatura OpenAI normalizada.
- Motores puros de Van Westendorp, MaxDiff, NMS y TURF implementados y conectados a la interfaz.
- MaxDiff incluye generación determinista de diseños, validación y normalización de respuestas en su motor compartido.
- El generador MaxDiff equilibra las apariciones de ítems entre tarjetas y versiones.
- Conjoint CBC usa estimación logit multinomial, simulación logit y elasticidad-precio arco cuando existen niveles numéricos de precio.
- Conjoint centraliza también generación reproducible del diseño, balance de niveles y perfiles únicos por tarea.
- La versión actual de Conjoint estima un MNL agregado. Hierarchical Bayes individual queda documentado como evolución futura, no como capacidad actual.
- Catorce pruebas automáticas aprobadas.
- Validación visual completada para los cinco módulos de cálculo y el flujo educativo de extremo a extremo; el reporte dinámico responde al cambio ES/EN.
- Compilación de producción validada.
- Flujo de GitHub Pages preparado.

Los scripts siguen siendo clásicos temporalmente porque el HTML heredado utiliza controladores como `onclick`. No convertirlos en módulos ES de golpe: primero deben sustituirse los controladores inline o exponerse adaptadores explícitos.

## Próximos pasos recomendados

1. En una versión futura, incorporar Conjoint HB individual con diagnóstico de convergencia y utilidades por encuestado.
2. Crear pruebas con resultados conocidos para cada motor.
3. Hacer que Educación y Datos propios consuman esos mismos motores.
4. Sustituir inserciones inseguras mediante `innerHTML` con datos del usuario.
5. Separar diccionarios español e inglés en archivos independientes.
6. Eliminar gradualmente eventos inline y convertir scripts a módulos ES.
7. Validar visualmente todos los flujos en navegador.
8. Crear documentación docente, actividades y rúbricas por metodología.

## Restricciones importantes

- Preservar la lógica pedagógica basada en problemáticas.
- No alterar resultados estadísticos sin pruebas de equivalencia.
- No duplicar motores entre Educación y Análisis.
- No almacenar la API key en localStorage, sessionStorage ni repositorio.
- Mantener compatibilidad con GitHub Pages mientras no exista presupuesto para backend.

## Comandos

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
```

## Archivos de orientación

- `README.md`: uso general.
- `PROJECT_CONTEXT.md`: visión, decisiones y estado del trabajo.
- `docs/ARCHITECTURE.md`: arquitectura técnica.
- `reference/kit_investigacion_mercados_v5.html`: prototipo original.
