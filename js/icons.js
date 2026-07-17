// Íconos SVG inline, monocromáticos (heredan currentColor vía la clase
// "icono"). Set propio estilo Lucide: viewBox 24x24, stroke-width 1.5
// consistente, trazo redondeado, sin relleno.
// Todos son decorativos (aria-hidden): siempre van acompañados de texto.

function svg(inner) {
  return `<svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
}

export const ICONS = {
  inicio: svg('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-7h4v7h4a1 1 0 0 0 1-1V9.5"/>'),
  examen: svg('<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3.5A1.5 1.5 0 0 1 10.5 2h3A1.5 1.5 0 0 1 15 3.5V4"/><path d="m9 13 2 2 4-4.5"/>'),
  estudio: svg('<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11a1 1 0 0 1 1 1v15a1 1 0 0 0-1-1H5.5A1.5 1.5 0 0 1 4 17.5z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13a1 1 0 0 0-1 1v15a1 1 0 0 1 1-1h5.5a1.5 1.5 0 0 0 1.5-1.5z"/>'),
  errores: svg('<path d="M3 12a9 9 0 1 0 2.6-6.3L3 8"/><path d="M3 3v5h5"/>'),
  estadisticas: svg('<path d="M4 20V10"/><path d="M12 20V4"/><path d="M20 20v-7"/><path d="M2 20h20"/>'),
  senales: svg('<path d="M4 9h11l3 3-3 3H4z"/><path d="M4 21V4"/>'),
  advertencia: svg('<path d="M10.3 3.9 2 18a1 1 0 0 0 .9 1.5h18.2a1 1 0 0 0 .9-1.5L13.7 3.9a1 1 0 0 0-1.7 0Z"/><path d="M12 9.5v4"/><path d="M12 16.75h.01"/>'),
  reloj: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  correcto: svg('<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.5 2.5L16 9.5"/>'),
  incorrecto: svg('<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6"/><path d="m15 9-6 6"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 8h.01"/><path d="M11 11h1v5"/><path d="M10.5 16h3"/>'),
  sol: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/>'),
  luna: svg('<path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z"/>'),
  monitor: svg('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8"/><path d="M12 16v4"/>'),
};
