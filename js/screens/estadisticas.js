import { cargarPreguntas } from '../data.js';
import { cargarProgreso, resetearProgreso, borrarExamen } from '../storage.js';
import { escapeHtml, nombreSeccion } from '../util.js';

function agregarPor(clave, todas, progresoPreguntas) {
  const grupos = new Map(); // clave -> { intentos, aciertos }
  todas.forEach((p) => {
    const registro = progresoPreguntas[p.id];
    if (!registro || registro.intentos === 0) return;
    const k = p[clave] ?? 'sin_clasificar';
    const acc = grupos.get(k) || { intentos: 0, aciertos: 0 };
    acc.intentos += registro.intentos;
    acc.aciertos += registro.aciertos;
    grupos.set(k, acc);
  });
  return [...grupos.entries()]
    .map(([nombre, v]) => ({ nombre, ...v, porcentaje: Math.round((v.aciertos / v.intentos) * 100) }))
    .sort((a, b) => b.porcentaje - a.porcentaje);
}

function barra(nombre, porcentaje, intentos, esFlojo) {
  return `
    <div class="stat-fila ${esFlojo ? 'stat-flojo' : ''}">
      <div class="stat-fila-cabecera">
        <span>${escapeHtml(nombre)}${esFlojo ? ' <span class=\"badge badge-flojo\">A reforzar</span>' : ''}</span>
        <span>${porcentaje}% (${intentos} resp.)</span>
      </div>
      <div class="barra" role="progressbar" aria-valuenow="${porcentaje}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHtml(nombre)}: ${porcentaje}% de acierto">
        <div class="barra-relleno" style="width:${porcentaje}%"></div>
      </div>
    </div>
  `;
}

export async function renderEstadisticas(container, ctx) {
  const todas = await cargarPreguntas();
  const estado = cargarProgreso();

  const porTema = agregarPor('tema', todas, estado.preguntas);
  const porSeccion = agregarPor('seccion', todas, estado.preguntas).map((s) => ({
    ...s,
    nombre: nombreSeccion(s.nombre),
  }));

  const temasFlojosIds = new Set(
    [...porTema]
      .sort((a, b) => a.porcentaje - b.porcentaje)
      .slice(0, 3)
      .filter((t) => t.intentos >= 2)
      .map((t) => t.nombre)
  );

  const eliminatoriasIds = new Set(todas.filter((p) => p.eliminatoria).map((p) => p.id));
  let intentosElim = 0;
  let aciertosElim = 0;
  Object.entries(estado.preguntas).forEach(([id, r]) => {
    if (eliminatoriasIds.has(id)) {
      intentosElim += r.intentos;
      aciertosElim += r.aciertos;
    }
  });
  const porcentajeElim = intentosElim > 0 ? Math.round((aciertosElim / intentosElim) * 100) : null;

  const sinDatos = porTema.length === 0;

  container.innerHTML = `
    <section class="tarjeta">
      <h2>Estadísticas</h2>
      ${sinDatos ? '<p>Todavía no respondiste preguntas. ¡Arrancá con el modo estudio!</p>' : ''}
    </section>

    ${
      !sinDatos
        ? `
    <section class="tarjeta" aria-labelledby="titulo-eliminatorias">
      <h3 id="titulo-eliminatorias">Preguntas eliminatorias</h3>
      <p class="ayuda">Estas son críticas: una sola mal en el examen real te reprueba, sin importar el puntaje.</p>
      ${
        porcentajeElim === null
          ? '<p>Todavía no respondiste preguntas eliminatorias.</p>'
          : barra('Acierto en eliminatorias', porcentajeElim, intentosElim, porcentajeElim < 100)
      }
    </section>

    <section class="tarjeta" aria-labelledby="titulo-secciones">
      <h3 id="titulo-secciones">Por sección</h3>
      ${porSeccion.map((s) => barra(s.nombre, s.porcentaje, s.intentos, false)).join('')}
    </section>

    <section class="tarjeta" aria-labelledby="titulo-temas">
      <h3 id="titulo-temas">Por tema</h3>
      ${porTema.map((t) => barra(t.nombre, t.porcentaje, t.intentos, temasFlojosIds.has(t.nombre))).join('')}
    </section>
    `
        : ''
    }

    <section class="tarjeta">
      <button type="button" class="boton boton-peligro" id="btn-reset">Reiniciar todo mi progreso</button>
    </section>
  `;

  container.querySelector('#btn-reset').addEventListener('click', () => {
    const ok = window.confirm(
      'Esto borra todo tu progreso, estadísticas y el examen en curso. ¿Confirmás?'
    );
    if (!ok) return;
    resetearProgreso();
    borrarExamen();
    renderEstadisticas(container, ctx);
  });
}
