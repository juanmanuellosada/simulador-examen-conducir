## 1. Tokens de color, tipografía y espaciado (`css/styles.css`)

- [x] 1.1 Reemplazar los valores del bloque `:root` (tema claro) por la paleta Data-Dense Dashboard: `--color-bg: #F8FAFC`, `--color-text: #020617`, `--color-primary: #0F172A`, `--color-primary-contraste: #FFFFFF`, `--color-secondary: #334155`, `--color-accent: #0369A1`, `--color-border: #E2E8F0`, superficie/muted `#E8ECF1`, manteniendo `--color-correcta`/`--color-incorrecta`/`--color-eliminatoria` como los únicos portadores de verde/rojo/ámbar.
- [x] 1.2 Reescribir el tema oscuro: quitar el bloque `@media (prefers-color-scheme: dark) { :root { ... } }` actual y reemplazarlo por `:root[data-theme="oscuro"] { ... }` con una paleta oscura adaptada (no invertida) del Data-Dense Dashboard, más un bloque `@media (prefers-color-scheme: dark) { :root:not([data-theme="claro"]) { ... } }` que aplique los mismos valores cuando no hay preferencia forzada a claro.
- [x] 1.3 Agregar tokens de espaciado en base 4/8px (ej. `--espacio-1: 4px` … `--espacio-6: 24px`) y aplicarlos donde el CSS use valores de padding/margin arbitrarios cercanos.
- [x] 1.4 Agregar `@font-face` para Lexend apuntando a `assets/fonts/lexend-latin.woff2` y `assets/fonts/lexend-latin-ext.woff2` (rutas relativas), con `font-display: swap` y `unicode-range` correctos para latin/latin-ext; actualizar `font-family` del `body` al stack `Lexend, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- [x] 1.5 Aplicar `font-variant-numeric: tabular-nums` a `.cronometro` y a los valores numéricos de estadísticas (`.stat-fila` o el selector que corresponda).
- [x] 1.6 Confirmar `prefers-reduced-motion` respetado (auditar transiciones existentes; limitarlas a `transform`/`opacity`, 150–300ms) y que los estados de foco (`:focus-visible`) sigan siendo visibles con la paleta nueva.
- [x] 1.7 Reforzar (sin duplicar solo-color) el tratamiento visual de `.badge-eliminatoria`/`.pregunta-practica-eliminatoria`/`.aviso-eliminatoria` con la paleta ámbar reservada.

## 2. Theme switcher

- [x] 2.1 Agregar a `js/storage.js` `cargarTema()`/`guardarTema(valor)` siguiendo el patrón try/catch + allowlist (`['claro','oscuro','sistema']`) + fallback silencioso ya usado en el resto del archivo, con clave `sim_examen_tema_v1`.
- [x] 2.2 Agregar en `<head>` de `index.html` un script inline síncrono (antes del `<link rel="stylesheet">`) que lea la preferencia de tema de localStorage y setee `document.documentElement.dataset.theme` antes del primer paint, evitando FOUC.
- [x] 2.3 Construir el control de tema (3 estados: Claro/Oscuro/Sistema) — visible, operable por teclado, con `aria` indicando la opción activa — y cablearlo para leer/escribir con `cargarTema`/`guardarTema` y actualizar `document.documentElement.dataset.theme` en caliente.
- [x] 2.4 Verificar que "Sistema" no setea el atributo `data-theme` (o lo limpia), dejando que el `@media (prefers-color-scheme)` decida.

## 3. Set de íconos

- [x] 3.1 Reescribir `js/icons.js` con un set estilo Lucide: `stroke-width="1.5"` consistente en todos, `viewBox="0 0 24 24"`, `stroke="currentColor"`, `fill="none"`, `stroke-linecap/linejoin="round"`. Mantener las claves existentes (`inicio`, `examen`, `estudio`, `errores`, `estadisticas`, `senales`, `advertencia`, `reloj`, `correcto`) y agregar `incorrecto`, `sol`, `luna`, `monitor`.
- [x] 3.2 Definir tokens de tamaño de ícono en CSS (`--icono-sm: 18px`, `--icono-md: 24px`) y aplicarlos vía la clase `.icono` en vez de tamaños arbitrarios.
- [x] 3.3 Eliminar los SVGs hardcodeados del nav inferior en `index.html`; poblar esos botones desde `ICONS` en `js/app.js` (o script de init) al cargar la app, para que exista una sola fuente de verdad.
- [x] 3.4 Reemplazar el `::before { content: "✗" }` de `.opcion-incorrecta` por el ícono `ICONS.incorrecto` + texto, igual patrón que `.opcion-correcta`/`ICONS.correcto`.
- [x] 3.5 Confirmar que todos los íconos junto a texto llevan `aria-hidden="true"`.

## 4. Diálogos de confirmación propios

- [x] 4.1 Crear `js/dialogo.js` exportando `confirmar({ titulo, mensaje, textoConfirmar, textoCancelar, peligro })` que crea/reutiliza un `<dialog>`, lo abre con `.showModal()`, ubica el foco inicial en el botón cancelar, y devuelve una `Promise<boolean>` (true en confirmar, false en cancelar o en el evento `cancel` de ESC).
- [x] 4.2 Estilar el `<dialog>` y su `::backdrop` en `css/styles.css`: alineado al design system (navy/ámbar/rojo, Lexend, radios/sombras coherentes), scrim 40–60% negro que funcione en ambos temas, botones ≥44px, acción destructiva (`peligro: true`) con `--color-destructivo` separada visualmente del botón cancelar, animación de entrada 150–300ms solo `transform`/`opacity` respetando `prefers-reduced-motion`.
- [x] 4.3 Asociar `aria-labelledby` (título) y `aria-describedby` (mensaje) en el `<dialog>`.
- [x] 4.4 Reemplazar `window.confirm(...)` en `js/screens/estadisticas.js:104` (reset de progreso) por `await confirmar({ ..., peligro: true })`, convirtiendo el listener a `async` si hace falta.
- [x] 4.5 Reemplazar los dos `window.confirm(...)` en `js/screens/examen.js:272` y `:277` (sin contestar / confirmar entrega) por `await confirmar(...)` dentro del listener `async` ya existente.

## 5. Verificación

- [x] 5.1 `node --check` sobre todos los `.js` modificados/nuevos.
- [x] 5.2 `node tests/shuffle.test.mjs` sigue pasando sin cambios.
- [x] 5.3 Grep de rutas absolutas/recursos externos (`http://`, `https://`, `src="/`, `href="/`) — debe dar vacío en código ejecutable.
- [x] 5.4 Grep de `window.confirm`, `window.alert`, `window.prompt` en `js/**/*.js` — debe dar vacío.
- [x] 5.5 Script standalone (Node, sin dependencias) que calcule ratio de contraste WCAG para todos los pares fg/bg reales de la app, en ambos temas; documentar tabla de resultados.
- [x] 5.6 Levantar el server local y sacar screenshots con Brave headless: home, señales, estadísticas, y el diálogo de confirmación abierto — en tema claro y en tema oscuro. Revisarlos con la herramienta de lectura de imágenes.
- [x] 5.7 Confirmar visualmente que Lexend carga (no cae a fallback del sistema) y que el header/nav no queda cortado en ningún screenshot.
- [ ] 5.8 Si el tiempo lo permite, ejercitar el flujo completo de examen en el navegador headless (ahora que `window.confirm` ya no lo bloquea): iniciar examen, responder, entregar, ver resultado. NO VERIFICADO: automatizar clicks en modo `--screenshot` puro de Brave headless requiere CDP/Puppeteer, no disponible en este entorno; queda pendiente de una pasada manual o con herramientas de automatización de browser.

## 6. Aviso de zona de riesgo (75%–90%) en el resultado del examen

- [x] 6.1 En `js/screens/examen.js`, calcular `enZonaDeRiesgo` (aprobó por puntaje, sin eliminatorias falladas, porcentaje < 90) dentro de la lógica de resultado existente.
- [x] 6.2 Renderizar el callout ámbar (clase `.aviso-conflicto` reutilizada) solo cuando `enZonaDeRiesgo` es verdadero, con el mensaje: aprobó según el 75% oficial provincial, el cuadernillo municipal dice 90%, no está confirmado cuál aplica el municipio, recomendación de apuntar a 90%+.
- [x] 6.3 Confirmar que el aviso NO aparece con porcentaje ≥90% ni con examen reprobado (por puntaje o por eliminatoria) — la reprobación por eliminatoria mantiene prioridad de mensaje.
- [x] 6.4 Agregar texto de ayuda breve junto al input de umbral en el formulario de inicio del examen: "75% = norma provincial oficial · 90% = lo que dice el cuadernillo municipal". `UMBRAL_DEFAULT` sigue en 0.75.

## 7. Filtro de estudio por fuente + estadísticas por fuente

- [x] 7.1 En `js/screens/estudio.js`, agregar en la pantalla de selección 3 botones de filtro por fuente ("Cuadernillo de mi municipio", "Banco oficial provincial", "Manual del Conductor") además del filtro por sección existente, con conteos calculados de `todas.filter(p => p.fuente === clave).length` (nunca hardcodeados).
- [x] 7.2 Agregar nota breve junto a "Cuadernillo de mi municipio" explicando que el examen se rinde en papel, que el cuadernillo se devuelve al rendir (sugiere que el examen podría salir de ahí), y que es una inferencia no confirmada.
- [x] 7.3 En `js/screens/estadisticas.js`, agregar una sección de desglose por fuente reutilizando el helper `agregarPor('fuente', todas, estado.preguntas)` ya existente, mostrando `fuente_label` como nombre.
- [x] 7.4 Confirmar que no se introduce ninguna cita al "cuadernillo_municipal" como respaldo normativo en `fuente_cita` ni en ningún texto de explicación — su único uso es como etiqueta de filtro/procedencia.
- [x] 7.5 `node --check` sobre los archivos tocados en los grupos 6 y 7, y confirmar que `node tests/shuffle.test.mjs` sigue pasando.
- [x] 7.6 Screenshot en Brave headless de: resultado de examen en zona de riesgo (ej. 78% con umbral 75%), pantalla de selección de estudio con los 3 filtros por fuente, y estadísticas con el desglose por fuente — revisarlos con la herramienta de lectura de imágenes, en al menos un tema.

## 8. Corrección: separar `--color-primary` (texto) de `--color-primary-superficie` (fondo)

- [x] 8.1 Agregar tokens nuevos `--color-primary-superficie` / `--color-sobre-primary-superficie` en `:root` (claro: navy/blanco) y en `:root[data-theme="oscuro"]`/el bloque `@media` de oscuro (un tono NO saturado, distinguible de `--color-surface`, con texto claro encima).
- [x] 8.2 Migrar a `--color-primary-superficie`/`--color-sobre-primary-superficie` todos los usos de `--color-primary` como FONDO de superficie grande: header, skip-link, botón primario (y cualquier otro que aplique). Dejar `--color-primary` sin cambios donde se usa como texto/acento/borde (ej. label del nav activo).
- [x] 8.3 Rehacer la tabla de contraste WCAG para los pares nuevos, en ambos temas (texto normal ≥4.5:1).
- [x] 8.4 Screenshot del header en ambos temas — confirmar que en oscuro no queda texto oscuro sobre fondo saturado, y que el nav activo sigue legible (ahí primary sigue como texto brillante).
