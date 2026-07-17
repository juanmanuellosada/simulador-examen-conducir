import { cargarPreguntas } from '../data.js';
import { cargarProgreso, registrarRespuesta, cargarExamen, guardarExamen, borrarExamen } from '../storage.js';
import { prepararPreguntas } from '../shuffle.js';
import { escapeHtml, formatTiempo, renderBloqueFuente } from '../util.js';
import { ICONS } from '../icons.js';
import { confirmar } from '../dialogo.js';

const CANTIDAD_DEFAULT = 40;
const UMBRAL_DEFAULT = 0.75;
const DURACION_SEGUNDOS = 7200; // 2 horas, fijo por normativa

// Estado de navegación interno (no persistido): a qué sub-vista mirar
// dentro del modo examen cuando ya hay un examen activo/finalizado.
let subvista = 'pregunta'; // 'pregunta' | 'revisar_antes_de_entregar' | 'revision_completa'
let intervaloId = null;

function limpiarIntervalo() {
  if (intervaloId !== null) {
    clearInterval(intervaloId);
    intervaloId = null;
  }
}

/** Llamado por el router al salir de la pantalla de examen. */
export function cleanup() {
  limpiarIntervalo();
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export async function renderExamen(container, ctx) {
  limpiarIntervalo();
  const examen = cargarExamen();

  if (!examen) {
    subvista = 'pregunta';
    await renderConfig(container, ctx);
    return;
  }

  if (!examen.finalizado) {
    const restante = examen.duracionSegundos - (Date.now() - examen.startTime) / 1000;
    if (restante <= 0) {
      await finalizarExamen(examen);
      renderResultado(container, ctx, examen);
      return;
    }
  }

  if (examen.finalizado) {
    if (subvista === 'revision_completa') {
      renderRevisionCompleta(container, ctx, examen);
    } else {
      renderResultado(container, ctx, examen);
    }
    return;
  }

  if (subvista === 'revisar_antes_de_entregar') {
    renderRevisarAntesDeEntregar(container, ctx, examen);
  } else {
    renderPregunta(container, ctx, examen);
  }
}

async function renderConfig(container, ctx) {
  const todas = await cargarPreguntas();
  const maxDisponible = todas.length;
  const cantidadSugerida = Math.min(CANTIDAD_DEFAULT, maxDisponible);

  container.innerHTML = `
    <section class="tarjeta">
      <h2>Examen real</h2>
      <p class="ayuda">Simula el examen oficial: preguntas al azar, cronómetro y condiciones reales de aprobación.</p>
      <form id="form-config-examen">
        <label class="campo">
          <span>Cantidad de preguntas</span>
          <input type="number" name="cantidad" min="1" max="${maxDisponible}" value="${cantidadSugerida}" required />
        </label>
        <label class="campo">
          <span>Umbral de aprobación (%)</span>
          <input type="number" name="umbral" min="1" max="100" value="${Math.round(UMBRAL_DEFAULT * 100)}" required />
        </label>
        <p class="ayuda">75% = norma provincial oficial · 90% = lo que dice el cuadernillo municipal</p>
        <p class="ayuda">Tiempo máximo: 2 horas. Además, todas las preguntas eliminatorias deben estar bien para aprobar.</p>
        <button type="submit" class="boton boton-primario boton-ancho">Comenzar examen</button>
      </form>
    </section>
  `;

  container.querySelector('#form-config-examen').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const form = new FormData(ev.target);
    const cantidad = clamp(parseInt(form.get('cantidad'), 10) || cantidadSugerida, 1, maxDisponible);
    const umbral = clamp(parseInt(form.get('umbral'), 10) || Math.round(UMBRAL_DEFAULT * 100), 1, 100) / 100;

    const preguntas = prepararPreguntas(todas).slice(0, cantidad);
    const examen = {
      version: 1,
      preguntas,
      respuestas: new Array(cantidad).fill(null),
      marcadas: new Array(cantidad).fill(false),
      startTime: Date.now(),
      duracionSegundos: DURACION_SEGUNDOS,
      umbralAprobacion: umbral,
      cantidadPreguntas: cantidad,
      finalizado: false,
      entregadoEn: null,
      registrado: false,
      indiceActual: 0,
    };
    guardarExamen(examen);
    subvista = 'pregunta';
    await renderExamen(container, ctx);
  });
}

function renderPregunta(container, ctx, examen) {
  const idx = examen.indiceActual;
  const pregunta = examen.preguntas[idx];
  const esUltima = idx === examen.preguntas.length - 1;
  const badgeEliminatoria = pregunta.eliminatoria
    ? `<span class="badge badge-eliminatoria">${ICONS.advertencia} Eliminatoria</span>`
    : '';
  const imagen = pregunta.imagen
    ? `<img class="pregunta-imagen" src="${escapeHtml(pregunta.imagen)}" alt="Señal de tránsito relacionada con la pregunta" loading="lazy" />`
    : '';

  container.innerHTML = `
    <div class="cronometro" id="cronometro" role="timer" aria-label="Tiempo restante"></div>
    <p class="progreso-sesion">Pregunta ${idx + 1} de ${examen.preguntas.length}</p>
    <article class="tarjeta pregunta-practica${pregunta.eliminatoria ? ' pregunta-practica-eliminatoria' : ''}">
      <div class="pregunta-meta">
        <span class="badge">${idx + 1}/${examen.preguntas.length}</span>
        ${badgeEliminatoria}
      </div>
      ${imagen}
      <h2 class="pregunta-texto">${escapeHtml(pregunta.pregunta)}</h2>
      <div class="opciones" role="group" aria-label="Opciones de respuesta"></div>
      <label class="marcar-revision">
        <input type="checkbox" id="chk-marcar" ${examen.marcadas[idx] ? 'checked' : ''} />
        Marcar para revisar
      </label>
    </article>
    <div class="acciones-examen">
      <button type="button" class="boton boton-secundario" id="btn-anterior" ${idx === 0 ? 'disabled' : ''}>← Anterior</button>
      <button type="button" class="boton boton-secundario" id="btn-resumen">Ver resumen / Entregar</button>
      <button type="button" class="boton boton-primario" id="btn-siguiente">${esUltima ? 'Ir a revisión →' : 'Siguiente →'}</button>
    </div>
  `;

  const opcionesEl = container.querySelector('.opciones');
  pregunta.opciones.forEach((texto, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opcion opcion-examen';
    btn.textContent = texto;
    btn.setAttribute('aria-pressed', String(examen.respuestas[idx] === i));
    if (examen.respuestas[idx] === i) btn.classList.add('opcion-seleccionada');
    btn.addEventListener('click', () => {
      examen.respuestas[idx] = i;
      guardarExamen(examen);
      [...opcionesEl.children].forEach((el, j) => {
        el.classList.toggle('opcion-seleccionada', j === i);
        el.setAttribute('aria-pressed', String(j === i));
      });
    });
    opcionesEl.appendChild(btn);
  });

  container.querySelector('#chk-marcar').addEventListener('change', (ev) => {
    examen.marcadas[idx] = ev.target.checked;
    guardarExamen(examen);
  });

  container.querySelector('#btn-anterior').addEventListener('click', () => {
    examen.indiceActual = Math.max(0, idx - 1);
    guardarExamen(examen);
    renderPregunta(container, ctx, examen);
  });

  container.querySelector('#btn-siguiente').addEventListener('click', () => {
    if (esUltima) {
      subvista = 'revisar_antes_de_entregar';
      renderRevisarAntesDeEntregar(container, ctx, examen);
    } else {
      examen.indiceActual = idx + 1;
      guardarExamen(examen);
      renderPregunta(container, ctx, examen);
    }
  });

  container.querySelector('#btn-resumen').addEventListener('click', () => {
    subvista = 'revisar_antes_de_entregar';
    renderRevisarAntesDeEntregar(container, ctx, examen);
  });

  iniciarCronometro(container, examen, ctx);
}

function iniciarCronometro(container, examen, ctx) {
  const el = container.querySelector('#cronometro');
  const tick = async () => {
    const restante = examen.duracionSegundos - (Date.now() - examen.startTime) / 1000;
    if (restante <= 0) {
      limpiarIntervalo();
      await finalizarExamen(examen);
      renderResultado(container, ctx, examen);
      return;
    }
    if (!el.isConnected) {
      limpiarIntervalo();
      return;
    }
    el.innerHTML = `${ICONS.reloj} Tiempo restante: ${formatTiempo(restante)}`;
    el.classList.toggle('cronometro-urgente', restante < 300);
  };
  tick();
  intervaloId = setInterval(tick, 1000);
}

function renderRevisarAntesDeEntregar(container, ctx, examen) {
  limpiarIntervalo();
  const sinContestar = examen.respuestas.filter((r) => r === null).length;

  const items = examen.preguntas
    .map((p, i) => {
      const estado = examen.respuestas[i] === null ? 'sin-contestar' : 'contestada';
      const marcada = examen.marcadas[i] ? ' marcada' : '';
      const etiqueta =
        (examen.respuestas[i] === null ? 'Sin contestar' : 'Contestada') +
        (examen.marcadas[i] ? ', marcada para revisar' : '');
      return `<button type="button" class="celda-revision ${estado}${marcada}" data-idx="${i}" aria-label="Pregunta ${i + 1}: ${etiqueta}">${i + 1}${examen.marcadas[i] ? ' ★' : ''}</button>`;
    })
    .join('');

  container.innerHTML = `
    <section class="tarjeta">
      <h2>Revisá antes de entregar</h2>
      <p class="ayuda">
        ${sinContestar > 0 ? `Tenés <strong>${sinContestar}</strong> pregunta${sinContestar === 1 ? '' : 's'} sin contestar.` : 'Contestaste todas las preguntas.'}
      </p>
      <div class="leyenda-revision">
        <span><span class="muestra contestada"></span> Contestada</span>
        <span><span class="muestra sin-contestar"></span> Sin contestar</span>
        <span><span class="muestra marcada"></span> ★ Marcada</span>
      </div>
      <div class="grilla-revision">${items}</div>
      <div class="acciones-examen">
        <button type="button" class="boton boton-secundario" id="btn-volver">Volver a las preguntas</button>
        <button type="button" class="boton boton-primario" id="btn-entregar">Entregar examen</button>
      </div>
    </section>
  `;

  container.querySelectorAll('.celda-revision').forEach((btn) => {
    btn.addEventListener('click', () => {
      examen.indiceActual = Number(btn.dataset.idx);
      guardarExamen(examen);
      subvista = 'pregunta';
      renderPregunta(container, ctx, examen);
    });
  });

  container.querySelector('#btn-volver').addEventListener('click', () => {
    subvista = 'pregunta';
    renderPregunta(container, ctx, examen);
  });

  container.querySelector('#btn-entregar').addEventListener('click', async () => {
    if (sinContestar > 0) {
      const ok = await confirmar({
        titulo: 'Preguntas sin contestar',
        mensaje: `Tenés ${sinContestar} pregunta${sinContestar === 1 ? '' : 's'} sin contestar. ¿Entregar igual?`,
        textoConfirmar: 'Entregar igual',
        textoCancelar: 'Volver',
      });
      if (!ok) return;
    } else {
      const ok = await confirmar({
        titulo: 'Confirmar entrega',
        mensaje: '¿Confirmás la entrega del examen?',
        textoConfirmar: 'Entregar examen',
        textoCancelar: 'Volver',
      });
      if (!ok) return;
    }
    await finalizarExamen(examen);
    renderResultado(container, ctx, examen);
  });
}

async function finalizarExamen(examen) {
  if (examen.finalizado) return;
  examen.finalizado = true;
  examen.entregadoEn = Date.now();

  if (!examen.registrado) {
    const estado = cargarProgreso();
    examen.preguntas.forEach((p, i) => {
      const esCorrecta = examen.respuestas[i] === p.correcta;
      registrarRespuesta(estado, p.id, esCorrecta);
    });
    examen.registrado = true;
  }

  guardarExamen(examen);
}

function calcularResultado(examen) {
  const correctas = examen.preguntas.filter((p, i) => examen.respuestas[i] === p.correcta).length;
  const total = examen.preguntas.length;
  const porcentaje = correctas / total;
  const aprobadoPorPuntaje = porcentaje >= examen.umbralAprobacion;
  const eliminatoriasFalladas = examen.preguntas
    .map((p, i) => ({ p, i }))
    .filter(({ p, i }) => p.eliminatoria && examen.respuestas[i] !== p.correcta);
  const aprobado = aprobadoPorPuntaje && eliminatoriasFalladas.length === 0;
  const enZonaDeRiesgo = aprobado && porcentaje < 0.9;
  return { correctas, total, porcentaje, aprobadoPorPuntaje, eliminatoriasFalladas, aprobado, enZonaDeRiesgo };
}

function renderResultado(container, ctx, examen) {
  limpiarIntervalo();
  const r = calcularResultado(examen);

  container.innerHTML = `
    <section class="tarjeta resultado ${r.aprobado ? 'resultado-aprobado' : 'resultado-reprobado'}">
      <h2>${r.aprobado ? '✓ APROBADO' : '✗ REPROBADO'}</h2>
      <p class="resultado-puntaje">${r.correctas} / ${r.total} correctas (${Math.round(r.porcentaje * 100)}%)</p>
      <p class="ayuda">Umbral requerido: ${Math.round(examen.umbralAprobacion * 100)}%</p>
      ${
        r.eliminatoriasFalladas.length > 0
          ? `
        <div class="aviso-eliminatoria">
          <p><strong>${ICONS.advertencia} Reprobaste por pregunta${r.eliminatoriasFalladas.length === 1 ? '' : 's'} eliminatoria${r.eliminatoriasFalladas.length === 1 ? '' : 's'}.</strong> Aunque el puntaje alcance, alguna eliminatoria estuvo mal:</p>
          <ul>
            ${r.eliminatoriasFalladas
              .map(({ p, i }) => `<li>Pregunta ${i + 1}: ${escapeHtml(p.pregunta)}</li>`)
              .join('')}
          </ul>
        </div>`
          : r.enZonaDeRiesgo
            ? `
        <div class="aviso-conflicto" role="note">
          <p class="aviso-conflicto-titulo">${ICONS.advertencia} Zona de riesgo: aprobaste, pero por debajo del 90%</p>
          <p>El 75% es el umbral oficial verificado de la Provincia de Buenos Aires. El cuadernillo del Municipio de Malvinas Argentinas menciona 90%. No está confirmado cuál aplica el municipio al corregir en la práctica.</p>
          <p><strong>Recomendación:</strong> apuntá a 90% o más para estar tranquilo con cualquiera de los dos criterios.</p>
        </div>`
            : ''
      }
      <div class="acciones-resultado">
        <button type="button" class="boton boton-primario" id="btn-revision">Ver revisión completa</button>
        <button type="button" class="boton boton-secundario" id="btn-otro">Hacer otro examen</button>
        <button type="button" class="boton boton-secundario" id="btn-inicio">Volver al inicio</button>
      </div>
    </section>
  `;

  container.querySelector('#btn-revision').addEventListener('click', () => {
    subvista = 'revision_completa';
    renderRevisionCompleta(container, ctx, examen);
  });
  container.querySelector('#btn-otro').addEventListener('click', () => {
    borrarExamen();
    subvista = 'pregunta';
    renderExamen(container, ctx);
  });
  container.querySelector('#btn-inicio').addEventListener('click', () => ctx.navigate('inicio'));
}

function renderRevisionCompleta(container, ctx, examen) {
  limpiarIntervalo();
  const filas = examen.preguntas
    .map((p, i) => {
      const respuestaIdx = examen.respuestas[i];
      const esCorrecta = respuestaIdx === p.correcta;
      const textoRespuesta = respuestaIdx === null ? '(sin contestar)' : p.opciones[respuestaIdx];
      const imagen = p.imagen
        ? `<img class="pregunta-imagen" src="${escapeHtml(p.imagen)}" alt="Señal de tránsito relacionada con la pregunta" loading="lazy" />`
        : '';
      return `
        <article class="tarjeta revision-item ${esCorrecta ? 'revision-ok' : 'revision-error'}">
          <div class="pregunta-meta">
            <span class="badge">Pregunta ${i + 1}</span>
            ${p.eliminatoria ? `<span class="badge badge-eliminatoria">${ICONS.advertencia} Eliminatoria</span>` : ''}
            <span class="badge ${esCorrecta ? 'badge-ok' : 'badge-error'}">${esCorrecta ? '✓ Correcta' : '✗ Incorrecta'}</span>
          </div>
          <h3 class="pregunta-texto">${escapeHtml(p.pregunta)}</h3>
          ${imagen}
          <p>Tu respuesta: ${escapeHtml(textoRespuesta)}</p>
          ${!esCorrecta ? `<p>Respuesta correcta: ${escapeHtml(p.opciones[p.correcta])}</p>` : ''}
          ${renderBloqueFuente(p)}
        </article>
      `;
    })
    .join('');

  container.innerHTML = `
    <section class="tarjeta">
      <h2>Revisión completa</h2>
      <button type="button" class="boton boton-secundario" id="btn-volver-resultado">← Volver al resultado</button>
    </section>
    ${filas}
  `;

  container.querySelector('#btn-volver-resultado').addEventListener('click', () => {
    subvista = 'pregunta';
    renderExamen(container, ctx);
  });
}
