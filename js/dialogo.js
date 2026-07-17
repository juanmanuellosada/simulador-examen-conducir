// Diálogo de confirmación propio sobre <dialog> nativo, en reemplazo de
// window.confirm(). El elemento nativo da gratis focus trap, cierre con
// ESC y ::backdrop — reimplementar eso a mano sería trabajo extra con
// riesgo de quedar peor en accesibilidad.

let dialogoEl = null;

function crearDialogo() {
  const dialog = document.createElement('dialog');
  dialog.className = 'dialogo-confirmacion';
  dialog.innerHTML = `
    <div class="dialogo-cuerpo">
      <h2 class="dialogo-titulo"></h2>
      <p class="dialogo-mensaje"></p>
    </div>
    <div class="dialogo-acciones">
      <button type="button" class="boton boton-secundario dialogo-cancelar"></button>
      <button type="button" class="boton dialogo-confirmar"></button>
    </div>
  `;
  document.body.appendChild(dialog);
  return dialog;
}

/**
 * Muestra un diálogo de confirmación y devuelve una Promise<boolean>: true
 * si el usuario confirma, false si cancela (botón, ESC, o cualquier cierre
 * que no sea confirmar). El foco inicial siempre va al botón "Cancelar"
 * para que un Enter accidental no dispare una acción irreversible.
 */
export function confirmar({
  titulo = '',
  mensaje = '',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  peligro = false,
} = {}) {
  if (!dialogoEl) dialogoEl = crearDialogo();
  const dialog = dialogoEl;

  const tituloEl = dialog.querySelector('.dialogo-titulo');
  const mensajeEl = dialog.querySelector('.dialogo-mensaje');
  const btnCancelar = dialog.querySelector('.dialogo-cancelar');
  const btnConfirmar = dialog.querySelector('.dialogo-confirmar');

  tituloEl.id = tituloEl.id || 'dialogo-titulo';
  mensajeEl.id = mensajeEl.id || 'dialogo-mensaje';
  tituloEl.textContent = titulo;
  mensajeEl.textContent = mensaje;
  dialog.setAttribute('aria-labelledby', tituloEl.id);
  dialog.setAttribute('aria-describedby', mensajeEl.id);

  btnCancelar.textContent = textoCancelar;
  btnConfirmar.textContent = textoConfirmar;
  btnConfirmar.className = `boton dialogo-confirmar ${peligro ? 'boton-peligro' : 'boton-primario'}`;

  return new Promise((resolve) => {
    let resultado = false;

    function onConfirmarClick() {
      resultado = true;
      dialog.close();
    }
    function onCancelarClick() {
      dialog.close();
    }
    // ESC dispara el evento nativo "cancel" y cierra el <dialog> solo;
    // no hace falta nada acá, "resultado" ya vale false.
    function onClose() {
      dialog.classList.remove('dialogo-visible');
      btnConfirmar.removeEventListener('click', onConfirmarClick);
      btnCancelar.removeEventListener('click', onCancelarClick);
      dialog.removeEventListener('close', onClose);
      resolve(resultado);
    }

    btnConfirmar.addEventListener('click', onConfirmarClick);
    btnCancelar.addEventListener('click', onCancelarClick);
    dialog.addEventListener('close', onClose);

    dialog.showModal();
    btnCancelar.focus();
    requestAnimationFrame(() => dialog.classList.add('dialogo-visible'));
  });
}
