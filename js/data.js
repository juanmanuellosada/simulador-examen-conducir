// Carga (y cachea en memoria) el banco de preguntas desde data/preguntas.json.
// Ruta relativa a propósito: GitHub Pages sirve el proyecto desde un
// subdirectorio, así que no puede haber rutas que arranquen con "/".

let cache = null;

export async function cargarPreguntas() {
  if (cache) return cache;
  const res = await fetch('data/preguntas.json');
  if (!res.ok) {
    throw new Error(`No se pudo cargar data/preguntas.json (HTTP ${res.status})`);
  }
  const json = await res.json();
  if (!Array.isArray(json)) {
    throw new Error('data/preguntas.json no contiene un array de preguntas.');
  }
  cache = json;
  return cache;
}

let cacheSenales = null;

export async function cargarSenales() {
  if (cacheSenales) return cacheSenales;
  const res = await fetch('data/senales.json');
  if (!res.ok) {
    throw new Error(`No se pudo cargar data/senales.json (HTTP ${res.status})`);
  }
  const json = await res.json();
  if (!Array.isArray(json)) {
    throw new Error('data/senales.json no contiene un array de señales.');
  }
  cacheSenales = json;
  return cacheSenales;
}
