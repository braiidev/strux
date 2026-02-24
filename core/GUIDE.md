# Strux Guide

Guía práctica para aprender y usar esta demo SPA con Strux.
Strux corre en frontend

## 1) Qué incluye este proyecto

- `core/`: runtime mínimo (vnode, render, señales y API `ui`).
- `index.html`: punto de entrada del sitio.
- `toolstyle.css`: utilidades reutilizables (layout, spacing, botones, etc.).
- `styles.css`: identidad visual específica de la app.
- `main.js`: SPA por hash con páginas `#index`, `#documentation`, `#aboutme`, `#test`.

## 2) Primer arranque

1. Ejecutá un servidor estático:
   - `python3 -m http.server 4173`
2. Abrí en el navegador:
   - `http://127.0.0.1:4173/#index`

## 3) Cómo está organizada la SPA

- Estado de ruta:
  - `route = signal(normalizeRoute(window.location.hash))`
- Router:
  - `RouterView()` retorna la vista según `route.value`.
- Navegación:
  - cambios por `window.location.hash` y listener `hashchange`.

## 4) Rutas disponibles

- `#index`: landing principal.
- `#documentation`: documentación **centrada en STRUX** y casos de uso reales.
- `#aboutme`: perfil del autor.
- `#test`: contador (incrementar/decrementar/resetear).

## 5) Conceptos esenciales de Strux

### Señales (estado reactivo)
```js
const count = signal(0)
count.value++
```

### Render declarativo
```js
mount(App(), document.getElementById('strux'))
```

### UI dinámica
```js
ui.p(() => count.value)
```

## 6) Paso a paso para aprender

1. **Leer `core/reactivity/signal.js`**: entender `get/set` y subscriptores.
2. **Leer `core/runtime/normalize.js`**: cómo se normalizan children y VNodes.
3. **Leer `core/runtime/render.js`**: cómo se monta y re-renderiza por señales.
4. **Leer `core/ui/factory.js`**: API `ui.*`, `ui.if`, `ui.for`, `ui.dynamic`.
5. **Explorar `main.js`**:
   - hash routing
   - snippets rotativos en `ui.pre`
   - página test con contador
6. **Modificar una ruta** (ej: `#aboutme`) para practicar.
7. **Crear una nueva ruta** (ej: `#playground`) y conectarla en `Nav()` + `RouterView()`.

## 7) Ejercicios recomendados

- Agregar búsqueda simple en `#documentation` para navegar mejor la guía de STRUX.
- Persistir `count` del `#test` en `localStorage`.
- Mostrar estado activo del nav también en mobile (menú colapsado).
- Agregar un ejemplo `fetch` real con loading/error usando `ui.dynamic`.

## 8) Checklist de validación rápida

- `node --experimental-default-type=module --check main.js`
- `node --experimental-default-type=module --check core/index.js`
- Navegar manualmente por:
  - `/#index`
  - `/#documentation`
  - `/#aboutme`
  - `/#test`

## 9) Ciclo de vida (inicio)

Para evitar fugas en STRUX (timers/listeners/fetch), este proyecto ya usa un ciclo de vida básico:

- `onCleanup(fn)`: registra tareas de limpieza.
- `destroyAppLifecycle()`: ejecuta todas las limpiezas al desmontar/reiniciar.
- `mount(...)` devuelve `unmount` y se registra también en cleanup.

Patrones aplicados:

- `clearInterval` para timers.
- `removeEventListener` para `hashchange`.
- `AbortController` para cancelar `fetch('./GUIDE.md')`.

