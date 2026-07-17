import { renderInicio } from './screens/inicio.js';
import { renderExamen, cleanup as cleanupExamen } from './screens/examen.js';
import { renderEstudio, reiniciarSesionEstudio } from './screens/estudio.js';
import { renderErrores, reiniciarSesionErrores } from './screens/errores.js';
import { renderEstadisticas } from './screens/estadisticas.js';
import { renderSenales, cleanup as cleanupSenales } from './screens/senales.js';

const RUTAS = {
  inicio: renderInicio,
  examen: renderExamen,
  estudio: renderEstudio,
  errores: renderErrores,
  estadisticas: renderEstadisticas,
  senales: renderSenales,
};

const app = document.getElementById('app');
const botonesNav = document.querySelectorAll('[data-route]');

let rutaActual = null;

function cleanupRuta(ruta) {
  if (ruta === 'examen') cleanupExamen();
  if (ruta === 'estudio') reiniciarSesionEstudio();
  if (ruta === 'errores') reiniciarSesionErrores();
  if (ruta === 'senales') cleanupSenales();
}

function navigate(ruta) {
  if (!RUTAS[ruta]) ruta = 'inicio';
  location.hash = `#/${ruta}`;
}

async function renderRuta() {
  const hash = location.hash.replace(/^#\/?/, '') || 'inicio';
  const ruta = RUTAS[hash] ? hash : 'inicio';

  if (rutaActual && rutaActual !== ruta) cleanupRuta(rutaActual);
  rutaActual = ruta;

  botonesNav.forEach((btn) => {
    const activo = btn.dataset.route === ruta;
    btn.classList.toggle('activo', activo);
    btn.setAttribute('aria-current', activo ? 'page' : 'false');
  });

  try {
    await RUTAS[ruta](app, { navigate });
  } catch (err) {
    console.error(err);
    app.innerHTML = `
      <section class="tarjeta">
        <h2>Ocurrió un error</h2>
        <p>No se pudo cargar esta pantalla. Probá recargar la página.</p>
        <p class="ayuda">${err && err.message ? String(err.message) : ''}</p>
      </section>
    `;
  }

  // El foco va a <main> para que los lectores de pantalla anuncien el cambio de
  // pantalla. preventScroll evita que el navegador scrollee <main> a la vista, que
  // dejaba el encabezado cortado arriba al abrir la app en pantallas chicas.
  app.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

botonesNav.forEach((btn) => {
  btn.addEventListener('click', () => navigate(btn.dataset.route));
});

window.addEventListener('hashchange', renderRuta);
renderRuta();
