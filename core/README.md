# Core Architecture

`core/` concentra el runtime en piezas pequeñas para facilitar mantenimiento.

- `vnode/`: tipos y contratos del VNode.
- `ui/`: API de alto nivel (`ui.div`, `ui.if`, `ui.for`, `ui.dynamic`).
- `runtime/`: normalización de nodos, renderizado y mount.
- `reactivity/`: señales y suscripciones.
- `index.js`: punto de entrada público del core.

## Regla práctica para crecer

1. Si un archivo mezcla **API + implementación DOM**, separarlo entre `ui/` y `runtime/`.
2. Si una función no toca `document`, moverla fuera de `runtime/`.
3. Todo helper reutilizable debe vivir en `core/` y exponerse desde `core/index.js` solo si es API pública.
4. Mantener ejemplos/experimentos fuera de `core/` (por ejemplo en `main.js` o `examples/`).
