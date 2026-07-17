// Íconos SVG inline, monocromáticos (heredan currentColor vía la clase
// "icono"). Reemplazan a los emojis usados antes como íconos de navegación
// y de botones: los emojis se ven distinto en cada dispositivo/SO.
// Todos son decorativos (aria-hidden): siempre van acompañados de texto.

function svg(inner) {
  return `<svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
}

export const ICONS = {
  inicio: svg('<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/>'),
  examen: svg('<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 12l2 2 4-4"/>'),
  estudio: svg('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 1 4 18.5V5.5z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v18h5.5a2.5 2.5 0 0 0 2.5-2.5V5.5z"/>'),
  errores: svg('<path d="M4 12a8 8 0 0 1 14.5-4.5M20 12a8 8 0 0 1-14.5 4.5"/><path d="M18.5 3v4.5H14"/><path d="M5.5 21v-4.5H10"/>'),
  estadisticas: svg('<path d="M4 20V10M11 20V4M18 20v-6"/><path d="M2 20h20"/>'),
  senales: svg('<path d="M12 3 2 20h20L12 3z"/><path d="M12 9.5v4"/><path d="M12 16.5h.01"/>'),
  advertencia: svg('<path d="M12 3 2 20h20L12 3z"/><path d="M12 9.5v4"/><path d="M12 16.5h.01"/>'),
  reloj: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  correcto: svg('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 8h.01"/><path d="M11 11h1v6"/>'),
};
