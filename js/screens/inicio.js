import { cargarProgreso } from '../storage.js';
import { ICONS } from '../icons.js';
import { cargarPreguntas, cargarSenales } from '../data.js';

export async function renderInicio(container, { navigate }) {
  const estado = cargarProgreso();
  // Los totales se leen de los datos, no se escriben a mano: ya se habían
  // desincronizado una vez (decía 736 cuando el banco tenía 740).
  const [preguntas, senales] = await Promise.all([cargarPreguntas(), cargarSenales()]);
  const totalSenales = senales.length;
  const registros = Object.values(estado.preguntas);
  const intentos = registros.reduce((acc, r) => acc + r.intentos, 0);
  const aciertos = registros.reduce((acc, r) => acc + r.aciertos, 0);
  const porcentaje = intentos > 0 ? Math.round((aciertos / intentos) * 100) : null;
  const dominadas = registros.filter((r) => r.rachaAciertos >= 2).length;

  container.innerHTML = `
    <section aria-labelledby="titulo-resumen" class="tarjeta resumen">
      <h2 id="titulo-resumen">Tu progreso</h2>
      <div class="resumen-grid">
        <div class="resumen-item">
          <span class="resumen-valor">${estado.racha.actual}</span>
          <span class="resumen-etiqueta">día${estado.racha.actual === 1 ? '' : 's'} seguidos</span>
        </div>
        <div class="resumen-item">
          <span class="resumen-valor">${porcentaje === null ? '—' : porcentaje + '%'}</span>
          <span class="resumen-etiqueta">acierto general</span>
        </div>
        <div class="resumen-item">
          <span class="resumen-valor">${dominadas}</span>
          <span class="resumen-etiqueta">preguntas dominadas</span>
        </div>
      </div>
    </section>

    <nav aria-label="Modos de estudio" class="menu-modos">
      <button type="button" class="boton-modo" data-ir="examen">
        <span class="boton-modo-titulo">${ICONS.examen} Examen real</span>
        <span class="boton-modo-desc">40 preguntas, 2 horas, condiciones reales</span>
      </button>
      <button type="button" class="boton-modo" data-ir="estudio">
        <span class="boton-modo-titulo">${ICONS.estudio} Estudio por tema</span>
        <span class="boton-modo-desc">Sin cronómetro, con explicación al instante</span>
      </button>
      <button type="button" class="boton-modo" data-ir="errores">
        <span class="boton-modo-titulo">${ICONS.errores} Repaso de errores</span>
        <span class="boton-modo-desc">Las preguntas que más te cuestan</span>
      </button>
      <button type="button" class="boton-modo" data-ir="senales">
        <span class="boton-modo-titulo">${ICONS.senales} Señales de tránsito</span>
        <span class="boton-modo-desc">Catálogo oficial y juego de reconocimiento</span>
      </button>
      <button type="button" class="boton-modo" data-ir="estadisticas">
        <span class="boton-modo-titulo">${ICONS.estadisticas} Estadísticas</span>
        <span class="boton-modo-desc">Tu rendimiento por tema y sección</span>
      </button>
    </nav>

    <section class="tarjeta info-app">
      <h3>Sobre esta app</h3>
      <p class="ayuda">${preguntas.length} preguntas de fuentes oficiales (cuestionario DPPySV, Manual del Conductor y cuadernillos municipales) y ${totalSenales} señales oficiales. Cuando el examen y la ley vigente no coinciden, te lo marcamos en la revisión de cada pregunta.</p>
    </section>
  `;

  container.querySelectorAll('[data-ir]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.ir));
  });
}
