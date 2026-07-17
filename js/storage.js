// Persistencia en localStorage. Robusta ante datos corruptos o de una
// versión vieja: si algo no calza con lo esperado, se descarta y se
// arranca de cero en vez de romper la app.

const KEY_PROGRESO = 'sim_examen_progreso_v1';
const KEY_EXAMEN = 'sim_examen_en_curso_v1';
const KEY_TEMA = 'sim_examen_tema_v1';
const TEMAS_VALIDOS = ['claro', 'oscuro', 'sistema'];

function estadoInicial() {
  return {
    version: 1,
    preguntas: {}, // id -> { intentos, aciertos, rachaAciertos, falloAlgunaVez }
    racha: { ultimaFecha: null, actual: 0 },
  };
}

function esRegistroPreguntaValido(r) {
  return (
    r &&
    typeof r === 'object' &&
    typeof r.intentos === 'number' &&
    typeof r.aciertos === 'number' &&
    typeof r.rachaAciertos === 'number' &&
    typeof r.falloAlgunaVez === 'boolean'
  );
}

export function cargarProgreso() {
  try {
    const raw = localStorage.getItem(KEY_PROGRESO);
    if (!raw) return estadoInicial();
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      parsed.version !== 1 ||
      typeof parsed.preguntas !== 'object' ||
      parsed.preguntas === null
    ) {
      console.warn('[storage] progreso guardado inválido o de otra versión, reiniciando.');
      return estadoInicial();
    }
    const preguntas = {};
    for (const [id, registro] of Object.entries(parsed.preguntas)) {
      if (esRegistroPreguntaValido(registro)) preguntas[id] = registro;
    }
    const racha =
      parsed.racha && typeof parsed.racha === 'object'
        ? { ultimaFecha: parsed.racha.ultimaFecha ?? null, actual: Number(parsed.racha.actual) || 0 }
        : { ultimaFecha: null, actual: 0 };
    return { version: 1, preguntas, racha };
  } catch (e) {
    console.warn('[storage] no se pudo leer el progreso guardado, reiniciando.', e);
    return estadoInicial();
  }
}

export function guardarProgreso(estado) {
  try {
    localStorage.setItem(KEY_PROGRESO, JSON.stringify(estado));
  } catch (e) {
    console.warn('[storage] no se pudo guardar el progreso.', e);
  }
}

export function resetearProgreso() {
  try {
    localStorage.removeItem(KEY_PROGRESO);
  } catch (e) {
    /* noop */
  }
  return estadoInicial();
}

function fechaHoy() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function actualizarRacha(estado) {
  const hoy = fechaHoy();
  if (estado.racha.ultimaFecha === hoy) return; // ya contada hoy
  const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  estado.racha.actual = estado.racha.ultimaFecha === ayer ? estado.racha.actual + 1 : 1;
  estado.racha.ultimaFecha = hoy;
}

/** Registra la respuesta a una pregunta y persiste el progreso actualizado. */
export function registrarRespuesta(estado, id, esCorrecta) {
  const previo = estado.preguntas[id];
  const registro = esRegistroPreguntaValido(previo)
    ? previo
    : { intentos: 0, aciertos: 0, rachaAciertos: 0, falloAlgunaVez: false };
  registro.intentos += 1;
  if (esCorrecta) {
    registro.aciertos += 1;
    registro.rachaAciertos += 1;
  } else {
    registro.rachaAciertos = 0;
    registro.falloAlgunaVez = true;
  }
  estado.preguntas[id] = registro;
  actualizarRacha(estado);
  guardarProgreso(estado);
  return estado;
}

// --- Examen en curso ---

function esExamenValido(e) {
  return (
    e &&
    typeof e === 'object' &&
    e.version === 1 &&
    Array.isArray(e.preguntas) &&
    Array.isArray(e.respuestas) &&
    Array.isArray(e.marcadas) &&
    typeof e.startTime === 'number' &&
    typeof e.duracionSegundos === 'number' &&
    typeof e.umbralAprobacion === 'number' &&
    typeof e.cantidadPreguntas === 'number' &&
    typeof e.finalizado === 'boolean'
  );
}

export function cargarExamen() {
  try {
    const raw = localStorage.getItem(KEY_EXAMEN);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!esExamenValido(parsed)) {
      console.warn('[storage] examen guardado inválido o de otra versión, se descarta.');
      localStorage.removeItem(KEY_EXAMEN);
      return null;
    }
    return parsed;
  } catch (e) {
    console.warn('[storage] no se pudo leer el examen guardado, se descarta.', e);
    try {
      localStorage.removeItem(KEY_EXAMEN);
    } catch (_) {
      /* noop */
    }
    return null;
  }
}

export function guardarExamen(examen) {
  try {
    localStorage.setItem(KEY_EXAMEN, JSON.stringify(examen));
  } catch (e) {
    console.warn('[storage] no se pudo guardar el examen en curso.', e);
  }
}

export function borrarExamen() {
  try {
    localStorage.removeItem(KEY_EXAMEN);
  } catch (e) {
    /* noop */
  }
}

// --- Preferencia de tema (claro/oscuro/sistema) ---

export function cargarTema() {
  try {
    const raw = localStorage.getItem(KEY_TEMA);
    return TEMAS_VALIDOS.includes(raw) ? raw : 'sistema';
  } catch (e) {
    console.warn('[storage] no se pudo leer la preferencia de tema, uso "sistema".', e);
    return 'sistema';
  }
}

export function guardarTema(valor) {
  if (!TEMAS_VALIDOS.includes(valor)) return;
  try {
    localStorage.setItem(KEY_TEMA, valor);
  } catch (e) {
    console.warn('[storage] no se pudo guardar la preferencia de tema.', e);
  }
}
