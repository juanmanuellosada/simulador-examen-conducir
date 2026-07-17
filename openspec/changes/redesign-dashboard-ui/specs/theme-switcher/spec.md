## ADDED Requirements

### Requirement: Selección de tema con tres estados
El sistema SHALL ofrecer un control visible y accesible con tres opciones: Claro, Oscuro y Sistema (default: Sistema).

#### Scenario: Estado inicial sin preferencia guardada
- **WHEN** el usuario abre la app por primera vez (sin valor previo en localStorage)
- **THEN** el tema aplicado es "Sistema" (sigue `prefers-color-scheme` del SO) y el control muestra "Sistema" como opción activa

#### Scenario: Selección manual de Claro u Oscuro
- **WHEN** el usuario elige "Claro" u "Oscuro" en el control
- **THEN** la app aplica ese tema inmediatamente, independientemente de la preferencia del sistema operativo

### Requirement: Persistencia de la preferencia de tema
El sistema SHALL persistir la preferencia de tema en localStorage y reutilizarla en cargas futuras, siguiendo el mismo patrón de validación y manejo de corrupción que el resto de `js/storage.js`.

#### Scenario: Preferencia persiste entre recargas
- **WHEN** el usuario elige un tema y recarga la página
- **THEN** el tema elegido se restaura sin necesidad de volver a seleccionarlo

#### Scenario: Valor corrupto o inesperado en localStorage
- **WHEN** la clave de tema en localStorage contiene un valor que no es "claro", "oscuro" ni "sistema" (dato corrupto o de una versión anterior)
- **THEN** el sistema ignora el valor inválido y usa "Sistema" como fallback, sin lanzar errores visibles al usuario

### Requirement: El atributo de tema tiene prioridad sobre la preferencia del sistema operativo
El sistema SHALL hacer que `data-theme` en `<html>` gane siempre sobre `prefers-color-scheme`, en ambos sentidos.

#### Scenario: Tema Claro forzado con SO en modo oscuro
- **WHEN** el usuario elige "Claro" y el sistema operativo tiene el modo oscuro activado
- **THEN** la app se muestra en tema claro

#### Scenario: Tema Oscuro forzado con SO en modo claro
- **WHEN** el usuario elige "Oscuro" y el sistema operativo tiene el modo claro activado
- **THEN** la app se muestra en tema oscuro

### Requirement: Sin destello de tema incorrecto al cargar (anti-FOUC)
El sistema SHALL aplicar el tema persistido antes del primer paint de la página, sin destello visible del tema contrario.

#### Scenario: Carga de página con tema oscuro guardado
- **WHEN** el usuario tiene "Oscuro" guardado y recarga la página
- **THEN** la página nunca se pinta en tema claro ni siquiera brevemente antes de aplicar el oscuro

### Requirement: Accesibilidad del control de tema
El sistema SHALL hacer el control operable con teclado y comprensible con lector de pantalla, indicando cuál opción está activa.

#### Scenario: Navegación por teclado
- **WHEN** el usuario navega el control de tema solo con teclado (Tab/flechas/Enter o Space)
- **THEN** puede cambiar entre las tres opciones sin usar el mouse, y el foco es visible en todo momento

#### Scenario: Anuncio del estado activo
- **WHEN** un lector de pantalla enfoca el control de tema
- **THEN** anuncia cuál de las tres opciones está actualmente seleccionada (mediante atributos ARIA apropiados, ej. `aria-pressed`/`aria-checked`/`role` según el patrón elegido)
