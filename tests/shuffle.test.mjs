// Test de desarrollo (no se despliega en GitHub Pages).
// Corre con: node tests/shuffle.test.mjs
//
// Verifica el bug crítico de la app: después de barajar las opciones de una
// pregunta, el índice `correcta` remapeado debe seguir señalando el mismo
// texto que era correcto antes de barajar.

import { shuffleOpciones, shuffleArray } from '../js/shuffle.js';

const ITERACIONES = 20000;
let fallos = 0;

function preguntaAleatoria() {
  const cantidadOpciones = Math.random() < 0.4 ? 2 : 3; // mezcla vf / multiple
  const opciones = Array.from(
    { length: cantidadOpciones },
    (_, i) => `opcion_${i}`
  );
  const correcta = Math.floor(Math.random() * cantidadOpciones);
  return { id: 'x', opciones, correcta };
}

for (let i = 0; i < ITERACIONES; i++) {
  const original = preguntaAleatoria();
  const textoCorrectoOriginal = original.opciones[original.correcta];

  const barajada = shuffleOpciones(original);

  // 1) el índice remapeado debe seguir apuntando al mismo texto
  const textoCorrectoBarajado = barajada.opciones[barajada.correcta];
  if (textoCorrectoBarajado !== textoCorrectoOriginal) {
    fallos++;
    console.error(
      `FALLO #${i}: esperaba "${textoCorrectoOriginal}", obtuve "${textoCorrectoBarajado}"`,
      { original, barajada }
    );
  }

  // 2) el conjunto de opciones no debe cambiar, solo el orden
  const setOriginal = [...original.opciones].sort().join('|');
  const setBarajado = [...barajada.opciones].sort().join('|');
  if (setOriginal !== setBarajado) {
    fallos++;
    console.error(`FALLO #${i}: el conjunto de opciones cambió`, { original, barajada });
  }

  // 3) la pregunta original no debe mutar
  if (original.opciones[original.correcta] !== textoCorrectoOriginal) {
    fallos++;
    console.error(`FALLO #${i}: shuffleOpciones mutó la pregunta original`);
  }
}

// Test adicional: shuffleArray no debe mutar el array de entrada
{
  const arr = [1, 2, 3, 4, 5];
  const copia = [...arr];
  shuffleArray(arr);
  if (JSON.stringify(arr) !== JSON.stringify(copia)) {
    fallos++;
    console.error('FALLO: shuffleArray mutó el array original');
  }
}

console.log(`Iteraciones: ${ITERACIONES}`);
console.log(`Fallos: ${fallos}`);
if (fallos === 0) {
  console.log('OK: el índice "correcta" se remapea correctamente en todas las iteraciones.');
  process.exit(0);
} else {
  console.error(`FALLÓ el test de barajado (${fallos} fallos).`);
  process.exit(1);
}
