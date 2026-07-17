# Simulador de examen teórico de conducir — Clase B

Simulador del examen teórico de conducir **clase B** para la **Provincia de Buenos
Aires** (partido de **Malvinas Argentinas**). HTML/CSS/JS puro: sin build, sin
frameworks, sin CDN. Se despliega tal cual en GitHub Pages y está pensado para
usarse desde el celular.

## El examen real

Datos verificados contra normativa provincial (no contra blogs, que suelen
repetir cifras falsas):

| | |
|---|---|
| Preguntas | **40** |
| Para aprobar | **75%** → 30 correctas, hasta **10 errores** |
| Tiempo | **2 horas** |
| Eliminatorias | **Sí**: una mal = reprobado, sin importar el puntaje |
| Si reprobás | 30 días de espera · 3 intentos por año |
| Formato | Multiple choice **y** Verdadero/Falso |

Turnos en Malvinas Argentinas: WhatsApp **+54 9 11 3126-2382** (sólo residentes).
El psicofísico se hace en el Depto. de Licencias (Rivadavia 85); el teórico y el
práctico, en el Predio Municipal (ex Batallón 601), de 8 a 12. Los estudios
médicos valen 30 días.

## Banco de preguntas

**740 preguntas**, de tres fuentes, cada una identificada dentro de la app:

| Fuente | Preguntas | Qué es |
|---|---|---|
| `pba_oficial` | 582 | Cuestionario oficial de la Dirección Provincial de Política y Seguridad Vial (act. 17/09/2025) |
| `cuadernillo_municipal` | 58 | Cuadernillo que entrega el Municipio de Malvinas Argentinas (2020) |
| `manual` | 100 | Derivadas del Manual del Conductor de PBA, cada una con cita textual |

Incluye **24 preguntas eliminatorias**, **209 con imagen** y **118 señales
oficiales** del catálogo de la ANSV con su código normativo (R 18, P 7, …).

Las respuestas del banco oficial se extrajeron leyendo el **color** del texto del
PDF (verde `#90c852` = correcta, rojo `#ee302e` = eliminatoria), porque el
documento no las marca de ninguna otra forma.

## ⚠️ Las fuentes oficiales se contradicen entre sí

Esto no es un bug de la app: **el cuestionario "oficial" de la Provincia es un
merge de dos bancos** (el bonaerense original y material heredado de CABA) que
nunca se reconciliaron, y encima ambos son anteriores a cambios de la ley. Hay
**15 preguntas marcadas** donde las fuentes no coinciden. En esos casos la app te
muestra qué responder para aprobar **y** qué dice la ley vigente.

Los dos casos que más importan:

- **Alcoholemia.** El examen espera **0,5 g/l** para auto particular y la marca
  como eliminatoria. Pero desde 2023 rige **alcohol cero** en PBA (Ley nacional
  27.714 y Ley provincial 15.402). **Hay una pregunta donde el 0,0 se ofrece como
  opción y el examen lo cuenta MAL**: es la respuesta correcta según la ley de
  hoy, pero te reprueba. En el examen: 0,5. En la calle: 0,0.
- **Velocidad precautoria en bocacalle sin semáforo.** Hay tres respuestas
  oficiales en circulación: 10 km/h (cuestionario provincial, eliminatoria),
  20 km/h (cuadernillo municipal) y 30 km/h (Ley 24.449 y Manual). Las opciones
  ofrecidas delatan de qué banco viene la pregunta.

**Conviene confirmar por WhatsApp con qué material se toma el examen** (el
cuadernillo municipal o el cuestionario provincial). Eso resuelve de raíz la
ambigüedad.

## Huecos conocidos

- **`pba_548`** (eliminatoria, elementos de seguridad pasiva) **no está incluida**:
  el cuestionario oficial no publica su respuesta y el Manual no permite deducirla
  sin ambigüedad. Se prefirió omitirla antes que inventar una respuesta en una
  pregunta que reprueba.
- **Explicaciones**: la mayoría de las preguntas todavía no tiene explicación
  redactada. En esos casos la app muestra la cita de la fuente para ir al material
  original. Las que sí la tienen llevan referencia normativa.
- **4 preguntas con imagen** quedaron sin ella y se excluyeron: no se pudo
  determinar con confianza a qué pregunta pertenecía cada imagen, y una imagen
  equivocada enseña la señal equivocada.

## Modos

- **Examen real** — 40 preguntas, cronómetro de 2 h que sobrevive a recargas,
  lógica de eliminatorias y revisión completa al final.
- **Estudio por tema** — sin cronómetro, con feedback inmediato.
- **Repaso de errores** — junta lo que fallaste; una pregunta sale de la lista
  recién tras acertarla 2 veces seguidas.
- **Señales de tránsito** — catálogo oficial por categoría + juego de
  reconocimiento (los distractores salen de la misma categoría).
- **Estadísticas** — acierto por tema y sección, con foco en las eliminatorias.

El progreso se guarda en `localStorage`. No hay servidor ni se envía nada a
ningún lado.

## Estructura

```
index.html
css/styles.css
js/            app.js, storage.js, shuffle.js, data.js, util.js, icons.js
js/screens/    inicio, examen, estudio, errores, senales, estadisticas, practica
data/          preguntas.json (740) · senales.json (118)
assets/senales/    118 señales oficiales (PNG)
assets/preguntas/  209 imágenes de preguntas del examen
tests/         shuffle.test.mjs
```

## Desarrollo

No hay build. Se sirve estático:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

Tests (requiere Node):

```bash
node tests/shuffle.test.mjs
```

Ese test verifica que, al barajar las opciones, el índice de la respuesta correcta
se remapee bien. Es el bug crítico de una app así: si se rompe, el simulador
enseña respuestas equivocadas sin que se note.

## Fuentes

- [Cuestionario oficial del examen teórico — DPPySV, Prov. Bs. As.](https://www.gba.gob.ar/static/seguridadvial/docs/cuestionario.pdf)
- [Manual del Conductor — Prov. Bs. As.](https://www.gba.gob.ar/static/seguridadvial/docs/manual_del_conductor.pdf)
- [Libro de Señales de Tránsito — ANSV](https://www.argentina.gob.ar/sites/default/files/ansv_licencias_libro_senales_de_transito.pdf)
- [Licencias de conducir — Prov. Bs. As.](https://www.gba.gob.ar/seguridadvial/licencias_de_conducir)
- [Licencia de conductor — Municipio de Malvinas Argentinas](https://www2.malvinasargentinas.gob.ar/apps/servicios/print/print.php?idf=299)
- Cuadernillo de exámenes teóricos del Municipio de Malvinas Argentinas (2020)
- Ley Nacional de Tránsito 24.449 · Ley 27.714 (alcohol cero) · Ley PBA 15.402
