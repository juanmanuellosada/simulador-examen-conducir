// Helpers chicos compartidos entre pantallas.
import { ICONS } from './icons.js';

export function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Segundos -> "HH:MM:SS" (o "MM:SS" si dura menos de una hora). */
export function formatTiempo(segundosTotales) {
  const s = Math.max(0, Math.round(segundosTotales));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export const SECCIONES = {
  generales: 'Generales',
  senales: 'Señales',
  especificas: 'Específicas',
};

export function nombreSeccion(seccion) {
  return SECCIONES[seccion] || seccion;
}

/**
 * Bloque de "por qué" compartido entre estudio, errores, señales y la
 * revisión del examen: explicación (con reemplazo intencional si falta),
 * fuente citada, nota de respuesta derivada del Manual, y el aviso de
 * conflicto normativo cuando la fuente oficial no coincide con la ley vigente.
 */
export function renderBloqueFuente(pregunta) {
  const partes = [];

  if (pregunta.explicacion) {
    partes.push(
      `<p class="feedback-explicacion"><strong>Por qué:</strong> ${escapeHtml(pregunta.explicacion)}</p>`
    );
  } else {
    partes.push(
      `<p class="feedback-explicacion feedback-sin-explicacion">Todavía no hay una explicación redactada para esta pregunta. Consultá la fuente citada abajo.</p>`
    );
  }

  if (pregunta.fuente_cita) {
    const label = pregunta.fuente_label ? `${escapeHtml(pregunta.fuente_label)} — ` : '';
    partes.push(`<p class="feedback-fuente">Fuente: ${label}${escapeHtml(pregunta.fuente_cita)}</p>`);
  }

  if (pregunta.respuesta_derivada) {
    partes.push(
      `<p class="nota-derivada">${ICONS.info} Esta respuesta no está marcada en el cuestionario oficial: se dedujo del Manual del Conductor.</p>`
    );
  }

  if (pregunta.conflicto) {
    const c = pregunta.conflicto;
    const textoCorrecta = pregunta.opciones[pregunta.correcta];
    partes.push(`
      <div class="aviso-conflicto" role="note">
        <p class="aviso-conflicto-titulo">${ICONS.advertencia} Las fuentes oficiales se contradicen en este tema</p>
        <p><strong>Para aprobar el examen marcá:</strong> ${escapeHtml(textoCorrecta)}</p>
        <p><strong>Qué dice la ley vigente:</strong> ${escapeHtml(c.que_dice_la_ley)}</p>
        <p><strong>Recomendación:</strong> ${escapeHtml(c.recomendacion)}</p>
      </div>
    `);
  }

  return partes.join('');
}
