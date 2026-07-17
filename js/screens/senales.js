// Modo Señales: (a) explorar el catálogo oficial agrupado por categoría, y
// (b) un juego de reconocimiento (se muestra la señal, hay que elegir su
// nombre entre 4 opciones; los distractores salen de la misma categoría
// para que no se adivine por color/forma).
import { cargarSenales } from '../data.js';
import { shuffleArray } from '../shuffle.js';
import { escapeHtml } from '../util.js';
import { ICONS } from '../icons.js';
import { renderPreguntaPractica } from './practica.js';

let vista = 'menu'; // 'menu' | 'catalogo' | 'juego'
let sesionJuego = null; // { cola, indice, total, correctas }

export async function renderSenales(container, ctx) {
  const todas = await cargarSenales();
  if (vista === 'catalogo') {
    renderCatalogo(container, ctx, todas);
  } else if (vista === 'juego') {
    renderJuego(container, ctx, todas);
  } else {
    renderMenu(container, ctx, todas);
  }
}

function renderMenu(container, ctx, todas) {
  container.innerHTML = `
    <section class="tarjeta">
      <h2>${ICONS.senales} Señales de tránsito</h2>
      <p class="ayuda">Catálogo oficial con ${todas.length} señales.</p>
    </section>
    <nav aria-label="Modos de señales" class="menu-modos">
      <button type="button" class="boton-modo" id="btn-catalogo">
        <span class="boton-modo-titulo">Explorar catálogo</span>
        <span class="boton-modo-desc">Las ${todas.length} señales agrupadas por categoría</span>
      </button>
      <button type="button" class="boton-modo" id="btn-juego">
        <span class="boton-modo-titulo">Juego de reconocimiento</span>
        <span class="boton-modo-desc">Se muestra la señal, elegís el nombre correcto</span>
      </button>
    </nav>
  `;

  container.querySelector('#btn-catalogo').addEventListener('click', () => {
    vista = 'catalogo';
    renderSenales(container, ctx);
  });
  container.querySelector('#btn-juego').addEventListener('click', () => {
    vista = 'juego';
    sesionJuego = null;
    renderSenales(container, ctx);
  });
}

function renderCatalogo(container, ctx, todas) {
  const categorias = new Map();
  todas.forEach((s) => {
    if (!categorias.has(s.categoria)) categorias.set(s.categoria, []);
    categorias.get(s.categoria).push(s);
  });

  const secciones = [...categorias.entries()]
    .map(
      ([categoria, lista]) => `
      <section class="tarjeta">
        <h3>${escapeHtml(categoria)} <span class="ayuda">(${lista.length})</span></h3>
        <div class="grilla-senales">
          ${lista
            .map(
              (s) => `
            <figure class="senal-item">
              <img src="${escapeHtml(s.archivo)}" alt="${escapeHtml(s.nombre)}" loading="lazy" />
              <figcaption>${escapeHtml(s.nombre)}<span class="senal-codigo">${escapeHtml(s.codigo)}</span></figcaption>
            </figure>
          `
            )
            .join('')}
        </div>
      </section>
    `
    )
    .join('');

  container.innerHTML = `
    <button type="button" class="boton boton-secundario" id="btn-volver-menu">← Volver</button>
    ${secciones}
  `;

  container.querySelector('#btn-volver-menu').addEventListener('click', () => {
    vista = 'menu';
    renderSenales(container, ctx);
  });
}

/** Arma una ronda del juego: la señal a adivinar + 3 distractores del mismo
 * tipo de señal (misma categoría) cuando sea posible. */
function generarRonda(senal, todas) {
  // Deduplicamos por "nombre" (no solo por slug): el catálogo tiene variantes
  // de una misma señal con slugs distintos pero el mismo nombre (ej. "Cruz
  // de San Andrés" x2). Si un distractor tuviera el mismo nombre que la
  // señal a adivinar, la opción se repetiría en la lista.
  const nombresUsados = new Set([senal.nombre]);
  const distractores = [];

  const agregarDesde = (pool) => {
    for (const s of shuffleArray(pool)) {
      if (distractores.length >= 3) break;
      if (nombresUsados.has(s.nombre)) continue;
      distractores.push(s);
      nombresUsados.add(s.nombre);
    }
  };

  agregarDesde(todas.filter((s) => s.categoria === senal.categoria && s.slug !== senal.slug));
  if (distractores.length < 3) {
    agregarDesde(todas.filter((s) => s.slug !== senal.slug));
  }
  const candidatos = shuffleArray([senal, ...distractores]);
  const correcta = candidatos.findIndex((s) => s.slug === senal.slug);

  return {
    id: senal.slug,
    seccion: 'senales',
    eliminatoria: false,
    pregunta: '¿Qué señal es esta?',
    imagen: senal.archivo,
    opciones: candidatos.map((s) => s.nombre),
    correcta,
    explicacion: `Categoría: ${senal.categoria}. Código: ${senal.codigo}.`,
    fuente_cita: 'Catálogo oficial de señales de tránsito.',
  };
}

function renderJuego(container, ctx, todas) {
  if (!sesionJuego) {
    sesionJuego = { cola: shuffleArray(todas), indice: 0, total: todas.length, correctas: 0 };
  }

  if (sesionJuego.indice >= sesionJuego.cola.length) {
    renderResumenJuego(container, ctx);
    return;
  }

  const wrapper = document.createElement('div');
  container.innerHTML = '';
  container.appendChild(wrapper);

  const progreso = document.createElement('p');
  progreso.className = 'progreso-sesion';
  progreso.textContent = `Señal ${sesionJuego.indice + 1} de ${sesionJuego.total}`;
  wrapper.appendChild(progreso);

  const box = document.createElement('div');
  wrapper.appendChild(box);

  const senal = sesionJuego.cola[sesionJuego.indice];
  const ronda = generarRonda(senal, todas);

  renderPreguntaPractica(
    box,
    ronda,
    (esCorrecta) => {
      if (esCorrecta) sesionJuego.correctas += 1;
    },
    () => {
      sesionJuego.indice += 1;
      renderJuego(container, ctx, todas);
    }
  );
}

function renderResumenJuego(container, ctx) {
  const { correctas, total } = sesionJuego;
  container.innerHTML = `
    <section class="tarjeta resultado">
      <h2>Juego completo</h2>
      <p>Reconociste bien ${correctas} de ${total} señales.</p>
      <div class="acciones-resultado">
        <button type="button" class="boton boton-primario" id="btn-otra">Jugar de nuevo</button>
        <button type="button" class="boton boton-secundario" id="btn-catalogo">Explorar catálogo</button>
        <button type="button" class="boton boton-secundario" id="btn-inicio">Volver al inicio</button>
      </div>
    </section>
  `;

  container.querySelector('#btn-otra').addEventListener('click', () => {
    sesionJuego = null;
    renderSenales(container, ctx);
  });
  container.querySelector('#btn-catalogo').addEventListener('click', () => {
    sesionJuego = null;
    vista = 'catalogo';
    renderSenales(container, ctx);
  });
  container.querySelector('#btn-inicio').addEventListener('click', () => {
    sesionJuego = null;
    vista = 'menu';
    ctx.navigate('inicio');
  });
}

// Al salir de la pantalla por la nav, volvemos al menú y descartamos la
// sesión de juego en curso (mismo patrón que estudio/errores).
export function cleanup() {
  vista = 'menu';
  sesionJuego = null;
}
