import { renderInicio } from './screens/inicio.js';
import { renderExamen, cleanup as cleanupExamen } from './screens/examen.js';
import { renderEstudio, reiniciarSesionEstudio } from './screens/estudio.js';
import { renderErrores, reiniciarSesionErrores } from './screens/errores.js';
import { renderEstadisticas } from './screens/estadisticas.js';
import { renderSenales, cleanup as cleanupSenales } from './screens/senales.js';
import { ICONS } from './icons.js';
import { cargarTema, guardarTema } from './storage.js';

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

// Una sola fuente de verdad para los íconos: el nav se puebla desde ICONS
// en vez de tener SVGs hardcodeados en index.html (evita que ambos diverjan).
botonesNav.forEach((btn) => {
  const icono = ICONS[btn.dataset.route];
  if (icono) btn.insertAdjacentHTML('afterbegin', icono);
});

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

// --- Theme switcher (Claro / Oscuro / Sistema) ---

const TEMA_OPCIONES = [
  { valor: 'claro', etiqueta: 'Claro', icono: 'sol' },
  { valor: 'oscuro', etiqueta: 'Oscuro', icono: 'luna' },
  { valor: 'sistema', etiqueta: 'Sistema', icono: 'monitor' },
];

function aplicarTema(valor) {
  if (valor === 'claro' || valor === 'oscuro') {
    document.documentElement.dataset.theme = valor;
  } else {
    delete document.documentElement.dataset.theme;
  }
}

function inicializarThemeSwitcher() {
  const slot = document.getElementById('theme-switcher-slot');
  if (!slot) return;
  const temaActual = cargarTema();
  aplicarTema(temaActual);

  slot.innerHTML = `
    <fieldset class="theme-switcher">
      <legend class="sr-only">Tema</legend>
      ${TEMA_OPCIONES.map(
        (op) => `
        <label class="theme-switcher-opcion">
          <input type="radio" name="tema" value="${op.valor}" ${op.valor === temaActual ? 'checked' : ''} />
          ${ICONS[op.icono]}
          <span>${op.etiqueta}</span>
        </label>`
      ).join('')}
    </fieldset>
  `;

  slot.querySelectorAll('input[name="tema"]').forEach((input) => {
    input.addEventListener('change', () => {
      guardarTema(input.value);
      aplicarTema(input.value);
    });
  });
}

inicializarThemeSwitcher();

window.addEventListener('hashchange', renderRuta);
renderRuta();
