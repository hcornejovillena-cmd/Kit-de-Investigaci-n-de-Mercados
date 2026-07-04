# Market Research Learning Lab

Aplicación educativa para aprender metodologías de investigación de mercados desde problemas gerenciales y aplicarlas después a datos propios.

## Experiencias principales

- **Aprender:** problemática → caso → selección metodológica → análisis → interpretación → evaluación.
- **Analizar:** metodología → datos propios → validación → análisis → interpretación → exportación.

Ambas experiencias deben compartir un único motor estadístico por metodología.

## Desarrollo local

```bash
pnpm install
pnpm dev
```

## Verificación

```bash
pnpm test
pnpm build
```

## Estado de la migración

El prototipo original ya fue separado en HTML, CSS y JavaScript sin modificar su comportamiento. Idiomas, estado/casos, flujo educativo, navegación, IA, Conjoint, MaxDiff, Van Westendorp, NMS y TURF tienen archivos independientes en `public/js/`. Temporalmente se mantienen como scripts clásicos y ordenados para conservar los controladores HTML existentes mientras los motores se desacoplan del DOM.

Consulta [ARCHITECTURE.md](./docs/ARCHITECTURE.md) para conocer el diseño objetivo y las reglas de crecimiento.
