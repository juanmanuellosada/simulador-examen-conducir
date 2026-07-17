## ADDED Requirements

### Requirement: Filtro de estudio por fuente de la pregunta
El sistema SHALL ofrecer, en la pantalla de selección del modo Estudio, la opción de iniciar una sesión filtrada por fuente de la pregunta, además del filtro por sección ya existente: "Cuadernillo de mi municipio", "Banco oficial provincial", "Manual del Conductor".

#### Scenario: Selección de filtro por cuadernillo municipal
- **WHEN** el usuario elige la opción de estudiar por "Cuadernillo de mi municipio"
- **THEN** la sesión de estudio incluye únicamente preguntas con `fuente == "cuadernillo_municipal"`

#### Scenario: Selección de filtro por banco oficial provincial
- **WHEN** el usuario elige la opción de estudiar por "Banco oficial provincial"
- **THEN** la sesión de estudio incluye únicamente preguntas con `fuente == "pba_oficial"`

#### Scenario: Selección de filtro por Manual del Conductor
- **WHEN** el usuario elige la opción de estudiar por "Manual del Conductor"
- **THEN** la sesión de estudio incluye únicamente preguntas con `fuente == "manual"`

### Requirement: Conteos derivados de los datos
El sistema SHALL mostrar, junto a cada opción de filtro por fuente, la cantidad real de preguntas de esa fuente, calculada a partir de los datos cargados, nunca hardcodeada.

#### Scenario: Cambia la cantidad de preguntas de una fuente
- **WHEN** `data/preguntas.json` tiene una cantidad distinta de preguntas con `fuente == "cuadernillo_municipal"` a la actual
- **THEN** la opción de filtro muestra el nuevo número sin requerir cambios de código

### Requirement: Nota aclaratoria sobre el filtro de cuadernillo municipal
El sistema SHALL mostrar, junto a la opción de filtro "Cuadernillo de mi municipio", una nota breve explicando que el examen se rinde en papel, que el cuadernillo debe devolverse al rendir (lo que sugiere que el examen podría salir de ese material), y que esto es una inferencia razonable, no un hecho confirmado.

#### Scenario: Pantalla de selección de estudio
- **WHEN** se renderiza la pantalla de selección del modo Estudio
- **THEN** la opción de "Cuadernillo de mi municipio" incluye el texto aclaratorio de que es una inferencia no confirmada

### Requirement: El cuadernillo municipal no se usa como cita normativa
El sistema SHALL usar la fuente "cuadernillo_municipal" únicamente como etiqueta de procedencia y criterio de filtro, nunca como respaldo normativo de por qué una respuesta es correcta.

#### Scenario: Explicación de una pregunta del cuadernillo municipal
- **WHEN** se muestra la explicación de una pregunta cuya `fuente` es "cuadernillo_municipal"
- **THEN** el texto de `fuente_cita` (si existe) no cita al cuadernillo municipal como respaldo normativo

### Requirement: Desglose de estadísticas por fuente
El sistema SHALL mostrar, en la pantalla de Estadísticas, el porcentaje de acierto desglosado por fuente de la pregunta, con el mismo patrón visual que el desglose existente por tema.

#### Scenario: Usuario respondió preguntas de más de una fuente
- **WHEN** el usuario tiene intentos registrados en preguntas de al menos una fuente
- **THEN** la pantalla de Estadísticas muestra una sección con el % de acierto por fuente, incluyendo las que tienen intentos registrados
