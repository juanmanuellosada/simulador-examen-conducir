import { cargarPreguntas } from '../data.js';
import { cargarProgreso, registrarRespuesta } from '../storage.js';
import { prepararPreguntas } from '../shuffle.js';
import { nombreSeccion } from '../util.js';
import { renderPreguntaPractica } from './practica.js';

// Sesión en memoria (no persiste entre recargas; el modo estudio no lo requiere).
let sesion = null; // { cola: [pregunta...], indice, total, correctas }

export async function renderEstudio(container, ctx) {
  if (!sesion) {
    await renderSeleccion(container, ctx);
  } else {
    renderPractica(container, ctx);
  }
}

const FUENTES = [
  {
    clave: 'cuadernillo_municipal',
    label: 'Cuadernillo de mi municipio',
    nota:
      'El examen se rinde en papel y el cuadernillo debe devolverse al rendir, lo que sugiere que el examen podría salir de ese material — es una inferencia razonable, no un hecho confirmado.',
  },
  { clave: 'pba_oficial', label: 'Banco oficial provincial' },
  { clave: 'manual', label: 'Manual del Conductor' },
];

async function renderSeleccion(container, ctx) {
  const todas = await cargarPreguntas();
  const secciones = [...new Set(todas.map((p) => p.seccion))];

  container.innerHTML = `
    <section class="tarjeta">
      <h2>Estudio por tema</h2>
      <p>Elegí una sección para practicar sin cronómetro, con feedback inmediato.</p>
      <div class="lista-selección" id="lista-secciones"></div>
    </section>
    <section class="tarjeta">
      <h2>Estudio por fuente</h2>
      <p>Elegí de dónde salen las preguntas a practicar.</p>
      <div class="lista-selección" id="lista-fuentes"></div>
    </section>
  `;

  const lista = container.querySelector('#lista-secciones');

  const btnTodas = document.createElement('button');
  btnTodas.type = 'button';
  btnTodas.className = 'boton boton-secundario boton-ancho';
  btnTodas.textContent = `Todas las secciones (${todas.length} preguntas)`;
  btnTodas.addEventListener('click', () => iniciarSesion(todas, container, ctx));
  lista.appendChild(btnTodas);

  secciones.forEach((sec) => {
    const preguntasSeccion = todas.filter((p) => p.seccion === sec);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'boton boton-secundario boton-ancho';
    btn.textContent = `${nombreSeccion(sec)} (${preguntasSeccion.length})`;
    btn.addEventListener('click', () => iniciarSesion(preguntasSeccion, container, ctx));
    lista.appendChild(btn);
  });

  const listaFuentes = container.querySelector('#lista-fuentes');

  FUENTES.forEach(({ clave, label, nota }) => {
    const preguntasFuente = todas.filter((p) => p.fuente === clave);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'boton boton-secundario boton-ancho';
    btn.textContent = `${label} (${preguntasFuente.length})`;
    btn.addEventListener('click', () => iniciarSesion(preguntasFuente, container, ctx));
    listaFuentes.appendChild(btn);
    if (nota) {
      const p = document.createElement('p');
      p.className = 'ayuda';
      p.textContent = nota;
      listaFuentes.appendChild(p);
    }
  });
}

function iniciarSesion(preguntas, container, ctx) {
  sesion = {
    cola: prepararPreguntas(preguntas),
    indice: 0,
    total: preguntas.length,
    correctas: 0,
  };
  renderPractica(container, ctx);
}

function renderPractica(container, ctx) {
  if (sesion.indice >= sesion.cola.length) {
    renderResumenSesion(container, ctx);
    return;
  }

  const wrapper = document.createElement('div');
  container.innerHTML = '';
  container.appendChild(wrapper);

  const progreso = document.createElement('p');
  progreso.className = 'progreso-sesion';
  progreso.textContent = `Pregunta ${sesion.indice + 1} de ${sesion.total}`;
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
      if (esCorrecta) sesion.correctas += 1;
    },
    () => {
      sesion.indice += 1;
      renderPractica(container, ctx);
    }
  );
}

function renderResumenSesion(container, ctx) {
  const { correctas, total } = sesion;
  container.innerHTML = `
    <section class="tarjeta resultado">
      <h2>Sesión completa</h2>
      <p>Respondiste bien ${correctas} de ${total} preguntas.</p>
      <div class="acciones-resultado">
        <button type="button" class="boton boton-primario" id="btn-otra">Practicar otro tema</button>
        <button type="button" class="boton boton-secundario" id="btn-inicio">Volver al inicio</button>
      </div>
    </section>
  `;
  container.querySelector('#btn-otra').addEventListener('click', () => {
    sesion = null;
    renderEstudio(container, ctx);
  });
  container.querySelector('#btn-inicio').addEventListener('click', () => {
    sesion = null;
    ctx.navigate('inicio');
  });
}

// Al salir de la pantalla de estudio por la nav, reiniciamos la sesión
// para que la próxima vez arranque en la selección de tema.
export function reiniciarSesionEstudio() {
  sesion = null;
}
