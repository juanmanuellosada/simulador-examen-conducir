## Context

App estática (HTML/CSS/JS puro, sin build, sin framework, sin CDN) desplegada en un subdirectorio de GitHub Pages, por lo que toda ruta debe ser relativa. Único archivo CSS (`css/styles.css`, 653 líneas), único HTML (`index.html`, shell de una SPA con router por hash), y un único set de íconos (`js/icons.js`, 10 SVGs inline). El tema oscuro actual es solo `@media (prefers-color-scheme: dark)` re-declarando el mismo bloque `:root` — no hay `data-theme` ni preferencia persistida. Todo el color pasa por 15 custom properties CSS consumidas con `var(--color-*)`; no hay hex/rgb sueltos fuera del bloque `:root`. Las clases de estado (`opcion-correcta`, `badge-eliminatoria`, etc.) ya están desacopladas de la lógica JS — los screens solo hacen `classList.add`/interpolan `ICONS.x`, así que redefinir tokens y set de íconos no debería tocar la lógica de negocio.

## Goals / Non-Goals

**Goals:**
- Un color = un significado: navy/azul para interfaz, verde solo para correcta, rojo solo para incorrecta, ámbar solo para eliminatoria/conflicto.
- Theme switcher de 3 estados persistente, sin FOUC, accesible.
- Set de íconos coherente estilo Lucide, sin duplicación de fuente de verdad.
- Contraste WCAG AA verificado con script, en ambos temas, para los pares fg/bg reales.
- Cero regresiones funcionales: examen, estudio, errores, señales, estadísticas, shuffle test.

**Non-Goals:**
- No se re-decide el design system (ya viene dado por el usuario).
- No se agregan frameworks, build step, ni dependencias externas.
- No se cambia el schema de `data/preguntas.json` ni `data/senales.json`.
- No se gamifica la UI (nada de confeti/mascotas/animaciones lúdicas).

## Decisions

**1. Mantener los nombres de las CSS custom properties existentes donde sea posible, cambiando solo sus valores.**
`--color-primary`, `--color-correcta`, `--color-incorrecta`, `--color-eliminatoria`, etc. ya están bien nombradas semánticamente y se usan de forma consistente en todo `styles.css`. Redefinir sus *valores* (navy en vez de verde para `--color-primary`) evita tocar cada selector que las consume. Se agregan tokens nuevos donde falten: `--color-secondary`, `--color-accent` (CTA), `--color-muted`, espaciado (`--espacio-1` .. `--espacio-6` en base 4/8px), tamaños de ícono (`--icono-sm: 18px`, `--icono-md: 24px`).
Alternativa descartada: renombrar todo a un esquema nuevo (`--surface-1`, etc.) — más "correcto" en abstracto pero aumenta el diff sin necesidad y viola la regla de cambios quirúrgicos.

**2. Estrategia de tema: `data-theme` en `<html>` + `@media` como fallback de "sistema".**
Reglas CSS pasan de `@media (prefers-color-scheme: dark) { :root { ... } }` a tres bloques: `:root` (claro, default), `:root[data-theme="oscuro"]` (fuerza oscuro), y `@media (prefers-color-scheme: dark) { :root:not([data-theme="claro"]) { ... } }` (oscuro automático solo si el usuario no forzó claro explícitamente). Esto cumple "el atributo le gana al media query en ambos sentidos": si `data-theme="claro"` está seteado, el media query oscuro no aplica (por el `:not`); si `data-theme="oscuro"` está seteado, gana el selector de atributo por especificidad/orden. Cuando no hay `data-theme` (o vale "sistema", que no se setea como atributo), manda el media query.
Persistencia: `localStorage`, clave `sim_examen_tema_v1`, mismo patrón que el resto de `storage.js` (try/catch, validación contra allowlist `['claro','oscuro','sistema']`, fallback silencioso a `'sistema'`).
Anti-FOUC: script inline síncrono en `<head>`, antes del `<link rel="stylesheet">`, que lee `localStorage` directamente (no puede esperar a que cargue `storage.js` como módulo) y setea `document.documentElement.dataset.theme` antes del primer paint. Es un duplicado mínimo y deliberado de la lógica de lectura (no de escritura) — inevitable para evitar el flash sin bloquear con un módulo ES.

**3. Set de íconos: reemplazar `js/icons.js` completo + eliminar duplicación en `index.html`.**
Hoy el nav de `index.html` tiene SVGs hardcodeados que duplican (con drift) los de `js/icons.js`. Para garantizar "un solo set, un solo lenguaje visual" sin mantenimiento manual en dos lugares, el nav pasa a poblarse en `js/app.js` (o inline al final de `index.html`) leyendo `ICONS` al iniciar, igual que ya hacen los screens. Se agregan los íconos que faltan: `incorrecto` (hoy es un `::before { content: "✗" }` de texto — se reemplaza por ícono + texto para consistencia con `correcto`), `sol`, `luna`, `monitor` (para el switcher). Todos con `stroke-width="1.5"`, `viewBox="0 0 24 24"`, `stroke="currentColor"`, `fill="none"`, `stroke-linecap/linejoin="round"`, `aria-hidden="true"` cuando van junto a texto.
Alternativa descartada: dejar el nav de `index.html` con SVGs hardcodeados pero "actualizados a mano" — se descarta porque es exactamente la causa de la duplicación/drift actual.

**4. Preguntas eliminatorias: ícono + texto, nunca solo color.**
El badge `badge-eliminatoria` ya usa `${ICONS.advertencia} Eliminatoria` (ícono + texto) — se mantiene el patrón, solo se actualiza el ícono y el color (ámbar, reservado exclusivamente para esto y para el aviso de conflicto de fuentes). El borde 2px de `.pregunta-practica-eliminatoria` se mantiene como refuerzo no-cromático adicional.

**5. Verificación de contraste: script Node standalone, no dependencia nueva.**
Un script en `/tmp` (scratchpad, no se commitea al repo) que implementa la fórmula de contraste relativo WCAG (sin librerías) y calcula el ratio de cada par fg/bg definido en los tokens finales, para ambos temas. Se corre una vez como parte de la verificación, no queda como artefacto del proyecto.

**6. Diálogos de confirmación: `<dialog>` nativo + helper único `js/dialogo.js`.**
Se reemplazan los 3 `window.confirm()` (`estadisticas.js:104`, `examen.js:272`, `examen.js:277`) por un único helper `confirmar({ titulo, mensaje, textoConfirmar, textoCancelar, peligro })` que crea (o reutiliza) un `<dialog>` en el DOM, lo abre con `.showModal()` y devuelve una `Promise<boolean>`. Se elige `<dialog>` nativo en vez de un modal armado con `div`s porque da gratis focus trap, cierre con ESC, `::backdrop` e inertización del fondo — reimplementar eso a mano en una app sin librerías es trabajo extra con alto riesgo de quedar peor en accesibilidad.
Los dos call sites en `examen.js` ya están dentro de un listener `async`, así que `await confirmar(...)` reemplaza directamente la lectura síncrona de `window.confirm`. El call site en `estadisticas.js` (`click` listener síncrono) pasa a `async` para poder hacer `await`.
Foco inicial en "Cancelar": al llamar `.showModal()`, se setea el foco explícitamente en el botón cancelar (en vez de depender del autofoco del primer elemento enfocable) para que un Enter accidental no dispare la acción destructiva.
Cierre con ESC: comportamiento nativo de `<dialog>` (evento `cancel`) — se engancha ese evento para resolver la promesa en `false`, sin lógica adicional.
Efecto colateral positivo mencionado por el usuario: `window.confirm()` bloquea la automatización de navegador (headless), así que este cambio también destraba poder probar el flujo de entrega de examen end-to-end en Brave headless.
Alternativa descartada: modal con `div` + `role="dialog"` + trap de foco manual — se descarta por reimplementar a mano algo que `<dialog>` ya resuelve nativamente y con mejor soporte de accesibilidad por defecto.

**7. Aviso de zona de riesgo: dato calculado en el resultado, no un segundo umbral.**
No se agrega un "umbral secundario" configurable: se calcula en `calcularResultado` (o donde se arme el objeto de resultado en `examen.js`) una condición derivada `enZonaDeRiesgo = aprobado && !r.eliminatoriasFalladas.length && porcentaje < 90` (aprobó por puntaje, sin fallar eliminatorias, y por debajo de 90%). Se renderiza reutilizando la clase `.aviso-conflicto` ya existente (mismo lenguaje visual ámbar que el aviso de conflicto entre fuentes), sin CSS nuevo. El umbral configurable (`UMBRAL_DEFAULT = 0.75`) no cambia — el 90% es un valor fijo de comparación, no un input de usuario, porque es solo informativo.
Alternativa descartada: dejar que el usuario configure también un "umbral de riesgo" — se descarta por sobre-ingeniería; el 90% es un dato fijo (lo que dice el cuadernillo municipal), no algo que el usuario deba tunear.

**8. Filtro de estudio por fuente: mismo patrón que el filtro por sección existente, sin abstraer prematuramente.**
`estudio.js` ya genera botones dinámicamente iterando secciones (`[...new Set(todas.map(p => p.seccion))]`). Se agrega un bloque análogo iterando un array fijo de 3 fuentes conocidas (`['cuadernillo_municipal', 'pba_oficial', 'manual']`, con label legible y texto de ayuda solo en la primera), filtrando `todas.filter(p => p.fuente === clave)` y mostrando `.length` en el botón — mismo mecanismo que ya usa el conteo por sección, así que los conteos salen de los datos sin código nuevo de agregación.
Estadísticas por fuente: `estadisticas.js` ya tiene un helper genérico `agregarPor(clave, todas, progresoPreguntas)` usado para `tema` y `seccion`. Se reutiliza tal cual con `agregarPor('fuente', ...)` — no hace falta lógica nueva, solo una sección más en el render usando `fuente_label` (ya presente en los datos) en vez del código crudo de `fuente` para el nombre mostrado.
Alternativa descartada: generar el filtro por fuente dinámicamente igual que por sección (`[...new Set(todas.map(p => p.fuente))]`) — se prefiere la lista fija porque el orden y las 3 etiquetas importan pedagógicamente (cuadernillo primero, con su nota aclaratoria), y porque son exactamente 3 valores conocidos y estables en el schema de datos.

**9. Corrección post-verificación: separar `--color-primary` (texto/acento) de `--color-primary-superficie` (fondo).**
La primera implementación reutilizó `--color-primary` tanto para texto/acento sobre fondo oscuro (nav activo — ahí necesita ser brillante, `#38bdf8` en oscuro) como para fondo de superficies grandes (header, skip-link, botón primario) — ahí ser brillante obliga a texto oscuro encima, reproduciendo exactamente el patrón que motivó este rediseño (texto casi-negro sobre color saturado), solo que en celeste en vez de verde. Se separan dos tokens: `--color-primary` se queda solo para texto/acentos/bordes (brillante en oscuro, navy en claro); `--color-primary-superficie` + `--color-sobre-primary-superficie` nuevos, para cuando primary hace de fondo — navy/blanco en claro, y en oscuro un tono NO saturado (evitando además que se confunda con `--color-surface`) con texto claro encima. Se migran a los tokens nuevos todos los usos de fondo (header, skip-link, botón primario); el nav activo (texto/acento) sigue usando `--color-primary` sin cambios.

## Risks / Trade-offs

- [El script anti-FOUC duplica lógica de lectura de `localStorage` fuera de `storage.js`] → Mitigación: mantenerlo mínimo (una lectura, un `dataset.theme = valor`), documentado con comentario que apunte a `storage.js` como fuente de verdad para escritura/validación completa.
- [Cambiar el nav de `index.html` para poblarse por JS en vez de HTML estático] → Mitigación: si JS falla en cargar, el nav queda sin íconos pero los `<button>` con su texto siguen siendo funcionales (navegación no depende de los SVGs); es una degradación aceptable ya inherente a que toda la app depende de JS.
- [Redefinir `--color-primary` de verde a navy puede romper contraste en combinaciones no previstas] → Mitigación: script de contraste cubre todos los pares fg/bg reales antes de dar por cerrado el cambio.
- [Renombrar clases de tema en español (`claro`/`oscuro`/`sistema`) en vez de inglés] → Se mantiene consistencia con el resto del codebase (100% en español) en vez de mezclar idiomas.

## Migration Plan

No aplica rollback especial: es un cambio de un solo commit sobre CSS/JS/HTML sin migración de datos. Si algo se ve mal, revertir el commit restaura el estado anterior sin efectos secundarios (no hay cambios de schema ni de localStorage keys existentes — solo se agrega una key nueva `sim_examen_tema_v1`, que si no existe cae a `'sistema'` sin romper nada).
