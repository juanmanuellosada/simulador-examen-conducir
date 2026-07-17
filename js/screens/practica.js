// Componente compartido entre "Estudio por tema" y "Repaso de errores":
// muestra una pregunta, deja elegir una opción, y da feedback inmediato
// con la explicación y la fuente.
import { escapeHtml, nombreSeccion, renderBloqueFuente } from '../util.js';
import { ICONS } from '../icons.js';

/**
 * Renderiza una pregunta en modo práctica (con feedback inmediato).
 * @param {HTMLElement} container
 * @param {object} pregunta - ya con opciones barajadas (shuffleOpciones)
 * @param {(esCorrecta: boolean) => void} onRespondida - se llama una vez, al responder
 * @param {() => void} onSiguiente - se llama al pedir la siguiente pregunta
 */
export function renderPreguntaPractica(container, pregunta, onRespondida, onSiguiente) {
  const badgeEliminatoria = pregunta.eliminatoria
    ? `<span class="badge badge-eliminatoria">${ICONS.advertencia} Eliminatoria</span>`
    : '';
  const imagen = pregunta.imagen
    ? `<img class="pregunta-imagen" src="${escapeHtml(pregunta.imagen)}" alt="Señal de tránsito relacionada con la pregunta" loading="lazy" />`
    : '';

  container.innerHTML = `
    <article class="tarjeta pregunta-practica${pregunta.eliminatoria ? ' pregunta-practica-eliminatoria' : ''}">
      <div class="pregunta-meta">
        <span class="badge">${escapeHtml(nombreSeccion(pregunta.seccion))}</span>
        ${badgeEliminatoria}
      </div>
      ${imagen}
      <h2 class="pregunta-texto">${escapeHtml(pregunta.pregunta)}</h2>
      <div class="opciones" role="group" aria-label="Opciones de respuesta"></div>
      <div class="feedback" hidden></div>
    </article>
  `;

  const opcionesEl = container.querySelector('.opciones');
  const feedbackEl = container.querySelector('.feedback');
  let respondida = false;

  pregunta.opciones.forEach((texto, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opcion';
    btn.textContent = texto;
    btn.addEventListener('click', () => {
      if (respondida) return;
      respondida = true;
      const esCorrecta = idx === pregunta.correcta;

      [...opcionesEl.children].forEach((el, i) => {
        el.disabled = true;
        if (i === pregunta.correcta) el.classList.add('opcion-correcta');
        if (i === idx && !esCorrecta) el.classList.add('opcion-incorrecta');
      });

      feedbackEl.hidden = false;
      feedbackEl.className = `feedback ${esCorrecta ? 'feedback-ok' : 'feedback-error'}`;
      feedbackEl.innerHTML = `
        <p class="feedback-resultado">
          ${esCorrecta ? '✓ Correcto' : '✗ Incorrecto'}
        </p>
        ${renderBloqueFuente(pregunta)}
        <button type="button" class="boton boton-primario boton-siguiente">Siguiente pregunta →</button>
      `;
      feedbackEl.querySelector('.boton-siguiente').addEventListener('click', onSiguiente);
      feedbackEl.querySelector('.boton-siguiente').focus();

      onRespondida(esCorrecta);
    });
    opcionesEl.appendChild(btn);
  });
}
