## ADDED Requirements

### Requirement: Aviso de zona de riesgo entre umbral oficial y umbral municipal
El sistema SHALL mostrar un aviso destacado (estilo callout ámbar, igual al usado para el aviso de conflicto entre fuentes) en la pantalla de resultado del examen cuando el resultado aprueba por puntaje con un porcentaje mayor o igual al umbral configurado pero menor a 90%.

#### Scenario: Puntaje en zona de riesgo (aprueba por umbral configurado, por debajo de 90%)
- **WHEN** el examen se aprueba por puntaje (sin fallar eliminatorias) y el porcentaje obtenido es, por ejemplo, 78% con umbral configurado en 75%
- **THEN** se muestra un callout ámbar explicando que 75% es el umbral oficial verificado de la Provincia, que el cuadernillo del Municipio de Malvinas Argentinas menciona 90%, que no está confirmado cuál aplica el municipio al corregir, y recomendando apuntar a 90% o más

#### Scenario: Puntaje de 90% o más
- **WHEN** el porcentaje obtenido es 90% o superior
- **THEN** el callout de zona de riesgo NO se muestra (el resultado ya aprueba bajo ambos criterios)

#### Scenario: Examen reprobado por puntaje
- **WHEN** el porcentaje obtenido queda por debajo del umbral configurado
- **THEN** el callout de zona de riesgo NO se muestra

#### Scenario: Reprobado por eliminatoria tiene prioridad de mensaje
- **WHEN** el examen se aprueba por puntaje pero se falló alguna pregunta eliminatoria
- **THEN** se muestra el mensaje de reprobación por eliminatoria (ya existente) y NO el callout de zona de riesgo, sin importar el porcentaje

### Requirement: El umbral configurable no cambia
El sistema SHALL mantener el umbral de aprobación configurable desde el formulario del examen, con 75% como valor por defecto.

#### Scenario: Valor por defecto del umbral
- **WHEN** el usuario inicia un examen sin modificar el campo de umbral
- **THEN** el umbral aplicado es 75%

### Requirement: Texto de ayuda junto al input de umbral
El sistema SHALL mostrar, junto al campo de umbral en el formulario de inicio del examen, un texto breve aclarando que 75% es la norma provincial oficial y 90% es lo que indica el cuadernillo municipal.

#### Scenario: Formulario de inicio de examen
- **WHEN** se renderiza el formulario para iniciar un examen
- **THEN** el texto de ayuda junto al input de umbral menciona ambos números (75% oficial provincial, 90% cuadernillo municipal)
