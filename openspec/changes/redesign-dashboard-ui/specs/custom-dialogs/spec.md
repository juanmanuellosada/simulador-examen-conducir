## ADDED Requirements

### Requirement: Diálogo de confirmación propio basado en `<dialog>`
El sistema SHALL reemplazar todo uso de `window.confirm()` por un diálogo propio construido sobre el elemento nativo `<dialog>` con `.showModal()`, estilado según el design system.

#### Scenario: Ningún confirm/alert/prompt nativo en el código
- **WHEN** se inspecciona el código fuente de la app (`js/**/*.js`)
- **THEN** no existe ninguna llamada a `window.confirm`, `window.alert` ni `window.prompt`

#### Scenario: Helper único reutilizado por las tres confirmaciones existentes
- **WHEN** se dispara una confirmación desde `estadisticas.js` (resetear progreso), o desde `examen.js` (entregar con preguntas sin contestar, o confirmar entrega)
- **THEN** las tres invocan la misma función exportada por `js/dialogo.js`, sin markup de modal duplicado por pantalla

### Requirement: La confirmación devuelve una Promise<boolean>
El sistema SHALL exponer el resultado de la confirmación como una `Promise<boolean>` que resuelve `true` si el usuario confirma y `false` si cancela o cierra el diálogo de cualquier forma (botón cancelar, ESC, click en backdrop si aplica).

#### Scenario: Usuario confirma
- **WHEN** el usuario hace click en el botón de confirmar
- **THEN** la promesa devuelta por el helper resuelve en `true`

#### Scenario: Usuario cancela con el botón
- **WHEN** el usuario hace click en el botón de cancelar
- **THEN** la promesa resuelve en `false`

#### Scenario: Usuario cierra con ESC
- **WHEN** el diálogo está abierto y el usuario presiona ESC
- **THEN** el diálogo se cierra y la promesa resuelve en `false`, igual que si hubiera cancelado

### Requirement: Foco inicial seguro en acciones destructivas o irreversibles
El sistema SHALL ubicar el foco inicial en el botón "Cancelar" al abrir el diálogo, no en el de confirmar, para evitar que una tecla Enter accidental dispare una acción destructiva.

#### Scenario: Apertura del diálogo de reset de progreso
- **WHEN** se abre el diálogo de confirmación para "Reiniciar todo mi progreso"
- **THEN** el foco inicial está en el botón de cancelar, no en el de confirmar

### Requirement: Estilo diferenciado para acciones destructivas
El sistema SHALL distinguir visualmente la acción destructiva (ej. resetear progreso) usando el color destructivo reservado, separada del botón de cancelar.

#### Scenario: Diálogo de reset de progreso
- **WHEN** se muestra el diálogo para resetear el progreso
- **THEN** el botón de confirmar usa el color destructivo (rojo) y está visualmente separado del botón de cancelar

### Requirement: Accesibilidad del diálogo
El sistema SHALL asociar el diálogo con su título y mensaje mediante `aria-labelledby` y `aria-describedby`, y respetar los tamaños mínimos de toque.

#### Scenario: Lector de pantalla enfoca el diálogo
- **WHEN** un lector de pantalla entra al diálogo abierto
- **THEN** anuncia el título (vía `aria-labelledby`) y el mensaje (vía `aria-describedby`)

#### Scenario: Tamaño de los botones
- **WHEN** se renderizan los botones de confirmar/cancelar
- **THEN** ambos tienen un área de toque de al menos 44px

### Requirement: Animación respetuosa de preferencias de movimiento
El sistema SHALL animar la entrada del diálogo (150–300ms, solo `transform`/`opacity`) y omitir o reducir la animación si el usuario tiene `prefers-reduced-motion` activado.

#### Scenario: Usuario con reduced motion
- **WHEN** el sistema operativo tiene `prefers-reduced-motion: reduce` activado
- **THEN** el diálogo aparece sin animación de transición perceptible
