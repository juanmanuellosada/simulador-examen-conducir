import { cargarPreguntas } from '../data.js';
import { cargarProgreso, registrarRespuesta } from '../storage.js';
import { prepararPreguntas } from '../shuffle.js';
import { renderPreguntaPractica } from './practica.js';
import { ICONS } from '../icons.js';

// Una pregunta sale del repaso de errores recién cuando se acierta 2 veces
// seguidas (rachaAciertos >= 2), no apenas se acierta una vez.
function idsEnRepaso(estado) {
  return Object.entries(estado.preguntas)
    .filter(([, r]) => r.falloAlgunaVez && r.rachaAciertos < 2)
    .map(([id]) => id);
}

let sesion = null; // { cola, indice, total }

export async function renderErrores(container, ctx) {
  const todas = await cargarPreguntas();
  const estado = cargarProgreso();
  const pendientesIds = new Set(idsEnRepaso(estado));

  if (pendientesIds.size === 0) {
    sesion = null;
    container.innerHTML = `
      <section class="tarjeta">
        <h2>Repaso de errores</h2>
        <p>${ICONS.correcto} No tenés preguntas pendientes de repaso. ¡Seguí así!</p>
        <p class="ayuda">Las preguntas que falles en cualquier modo van a aparecer acá hasta que las acertés dos veces seguidas.</p>
      </section>
    `;
    return;
  }

  if (!sesion) {
    const pendientes = todas.filter((p) => pendientesIds.has(p.id));
    sesion = { cola: prepararPreguntas(pendientes), indice: 0, total: pendientes.length };
  }

  renderPractica(container, ctx, pendientesIds.size);
}

function renderPractica(container, ctx, totalPendientesAlEmpezar) {
  if (sesion.indice >= sesion.cola.length) {
    container.innerHTML = `
      <section class="tarjeta resultado">
        <h2>Sesión de repaso completa</h2>
        <p>Repasaste ${sesion.total} pregunta${sesion.total === 1 ? '' : 's'}.</p>
        <div class="acciones-resultado">
          <button type="button" class="boton boton-primario" id="btn-otra">Ver si quedan pendientes</button>
          <button type="button" class="boton boton-secundario" id="btn-inicio">Volver al inicio</button>
        </div>
      </section>
    `;
    container.querySelector('#btn-otra').addEventListener('click', () => {
      sesion = null;
      renderErrores(container, ctx);
    });
    container.querySelector('#btn-inicio').addEventListener('click', () => {
      sesion = null;
      ctx.navigate('inicio');
    });
    return;
  }

  const wrapper = document.createElement('div');
  container.innerHTML = '';
  container.appendChild(wrapper);

  const progreso = document.createElement('p');
  progreso.className = 'progreso-sesion';
  progreso.textContent = `Repaso: pregunta ${sesion.indice + 1} de ${sesion.total} · quedan ${totalPendientesAlEmpezar} pendiente${totalPendientesAlEmpezar === 1 ? '' : 's'} en total`;
  wrapper.appendChild(progreso);

  const preguntaBox = document.createElement('div');
  wrapper.appendChild(preguntaBox);

  const pregunta = sesion.cola[sesion.indice];

  renderPreguntaPractica(
    preguntaBox,
    pregunta,
    (esCorrecta) => {
      const estado = cargarProgreso();
      registrarRespuesta(estado, pregunta.id, esCorrecta);
    },
    () => {
      sesion.indice += 1;
      renderPractica(container, ctx, totalPendientesAlEmpezar);
    }
  );
}

export function reiniciarSesionErrores() {
  sesion = null;
}
