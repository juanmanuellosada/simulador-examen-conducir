// Utilidades de barajado. El punto crítico: al barajar las opciones de una
// pregunta hay que remapear el índice `correcta` para que siga apuntando a
// la opción correcta después del reorden. Ver tests/shuffle.test.mjs.

/** Fisher-Yates. Devuelve un array nuevo, no muta el original. */
export function shuffleArray(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Baraja las opciones de una pregunta y remapea el índice `correcta`.
 * No muta la pregunta original.
 */
export function shuffleOpciones(pregunta) {
  const ordenOriginal = pregunta.opciones.map((_, i) => i);
  const ordenNuevo = shuffleArray(ordenOriginal);
  const opciones = ordenNuevo.map((iOriginal) => pregunta.opciones[iOriginal]);
  const correcta = ordenNuevo.indexOf(pregunta.correcta);
  return { ...pregunta, opciones, correcta };
}

/** Baraja el orden de las preguntas y, dentro de cada una, sus opciones. */
export function prepararPreguntas(lista) {
  return shuffleArray(lista).map(shuffleOpciones);
}
