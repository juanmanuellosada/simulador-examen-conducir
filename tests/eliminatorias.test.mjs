// Test de desarrollo (no se despliega en GitHub Pages).
// Corre con: node tests/eliminatorias.test.mjs
//
// Verifica el muestreo estratificado del examen: con muestreo uniforme puro,
// un examen de 40 preguntas sobre un pool de 740 (24 eliminatorias) contiene
// en promedio ~1.3 eliminatorias y ~27% de las veces ninguna. Como errar UNA
// eliminatoria desaprueba el examen real, seleccionarPreguntasExamen debe
// garantizar un mínimo representativo en cada examen generado.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { seleccionarPreguntasExamen } from '../js/screens/examen.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const todas = JSON.parse(
  readFileSync(path.join(__dirname, '../data/preguntas.json'), 'utf8')
);

let fallos = 0;

// --- Con el pool real (740 preguntas, 24 eliminatorias), examen de 40 ---
const CANTIDAD = 40;
const MIN_ESPERADO = 4; // 10% de 40, el criterio elegido
const ITERACIONES = 500;

for (let i = 0; i < ITERACIONES; i++) {
  const preguntas = seleccionarPreguntasExamen(todas, CANTIDAD);

  // 1) cantidad correcta y sin duplicados
  if (preguntas.length !== CANTIDAD) {
    fallos++;
    console.error(`FALLO #${i}: se esperaban ${CANTIDAD} preguntas, hubo ${preguntas.length}`);
  }
  const idsUnicos = new Set(preguntas.map((p) => p.id));
  if (idsUnicos.size !== preguntas.length) {
    fallos++;
    console.error(`FALLO #${i}: hay preguntas duplicadas en el examen generado`);
  }

  // 2) mínimo de eliminatorias garantizado
  const cantidadEliminatorias = preguntas.filter((p) => p.eliminatoria).length;
  if (cantidadEliminatorias < MIN_ESPERADO) {
    fallos++;
    console.error(
      `FALLO #${i}: solo ${cantidadEliminatorias} eliminatorias, se esperaban al menos ${MIN_ESPERADO}`
    );
  }

  // 3) las eliminatorias no deben quedar agrupadas ni siempre al principio:
  // en 500 exámenes, la primera pregunta no debería ser eliminatoria en
  // (casi) todos los casos (con 40 preguntas y ~4-24 eliminatorias mezcladas
  // al azar, la proporción esperada de exámenes que arrancan con una
  // eliminatoria es baja pero no cero; se valida en agregado más abajo).
}

// 3b) en agregado: la posición de las eliminatorias dentro del examen debe
// variar (no siempre al principio). Se corren más iteraciones y se registra
// en qué mitad del examen (primera o segunda) cae la primera eliminatoria.
let primeraMitad = 0;
let segundaMitad = 0;
const ITER_POSICION = 300;
for (let i = 0; i < ITER_POSICION; i++) {
  const preguntas = seleccionarPreguntasExamen(todas, CANTIDAD);
  const idxPrimeraEliminatoria = preguntas.findIndex((p) => p.eliminatoria);
  if (idxPrimeraEliminatoria < CANTIDAD / 2) primeraMitad++;
  else segundaMitad++;
}
if (segundaMitad === 0) {
  fallos++;
  console.error(
    'FALLO: en todas las iteraciones la primera eliminatoria cayó en la primera mitad del examen — el orden no parece estar bien barajado'
  );
}

// --- Escala proporcionalmente con la cantidad de preguntas ---
const casos = [
  { cantidad: 10, minEsperado: 1 },
  { cantidad: 20, minEsperado: 2 },
  { cantidad: 100, minEsperado: 10 },
];
for (const { cantidad, minEsperado } of casos) {
  for (let i = 0; i < 100; i++) {
    const preguntas = seleccionarPreguntasExamen(todas, cantidad);
    const cantidadEliminatorias = preguntas.filter((p) => p.eliminatoria).length;
    if (preguntas.length !== cantidad) {
      fallos++;
      console.error(`FALLO cantidad=${cantidad}: se generaron ${preguntas.length} preguntas`);
    }
    if (cantidadEliminatorias < minEsperado) {
      fallos++;
      console.error(
        `FALLO cantidad=${cantidad}: solo ${cantidadEliminatorias} eliminatorias, se esperaban al menos ${minEsperado}`
      );
    }
  }
}

console.log(`Iteraciones (examen de ${CANTIDAD}): ${ITERACIONES}`);
console.log(`Fallos: ${fallos}`);
if (fallos === 0) {
  console.log('OK: seleccionarPreguntasExamen garantiza el mínimo de eliminatorias esperado.');
  process.exit(0);
} else {
  console.error(`FALLÓ el test de eliminatorias (${fallos} fallos).`);
  process.exit(1);
}
