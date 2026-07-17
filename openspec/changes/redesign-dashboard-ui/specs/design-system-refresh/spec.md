## ADDED Requirements

### Requirement: Un color, un significado
El sistema SHALL usar navy/azul exclusivamente como color de interfaz (header, botones primarios, nav activo), verde exclusivamente para "respuesta correcta", rojo exclusivamente para "respuesta incorrecta", y ámbar exclusivamente para "pregunta eliminatoria" y para el aviso de conflicto entre fuentes.

#### Scenario: Botón primario y respuesta correcta no comparten color
- **WHEN** se inspeccionan los tokens de color usados por un botón primario y por el estado "opción correcta"
- **THEN** usan valores de color distintos (navy/azul vs. verde)

### Requirement: Contraste WCAG AA en ambos temas
El sistema SHALL cumplir un ratio de contraste de al menos 4.5:1 para texto normal y 3:1 para texto grande, para todos los pares de color texto/fondo usados realmente por la app, tanto en tema claro como en tema oscuro.

#### Scenario: Verificación automatizada de contraste
- **WHEN** se ejecuta el script de verificación de contraste sobre los tokens finales de ambos temas
- **THEN** todos los pares fg/bg de la app reportan un ratio que cumple el mínimo aplicable (4.5:1 texto normal, 3:1 texto grande)

### Requirement: Tipografía Lexend cargada localmente
El sistema SHALL cargar la tipografía Lexend desde los archivos locales del proyecto (sin CDN ni Google Fonts), con `font-display: swap` y los `unicode-range` de latin y latin-ext.

#### Scenario: Fuente carga sin red externa
- **WHEN** la app se sirve sin conexión a internet (solo los archivos del propio proyecto)
- **THEN** el texto se renderiza con Lexend, no con la fuente de fallback del sistema

### Requirement: Cifras tabulares en datos numéricos que cambian
El sistema SHALL usar `font-variant-numeric: tabular-nums` en el cronómetro del examen y en los valores numéricos de estadísticas, para que el layout no salte al cambiar los dígitos.

#### Scenario: Cronómetro corriendo
- **WHEN** el cronómetro del examen actualiza sus dígitos cada segundo
- **THEN** el ancho ocupado por el texto no cambia entre actualizaciones

### Requirement: Preguntas eliminatorias distinguibles sin depender del color
El sistema SHALL marcar las preguntas eliminatorias con ícono y texto explícito, no solo con un color distinto.

#### Scenario: Pregunta eliminatoria en modo estudio o examen
- **WHEN** se renderiza una pregunta cuyo campo `eliminatoria` es verdadero
- **THEN** se muestra un ícono de advertencia junto al texto "Eliminatoria", además de cualquier tratamiento cromático

### Requirement: Set de íconos coherente estilo Lucide
El sistema SHALL usar un único set de íconos con lenguaje visual consistente (mismo `stroke-width`, mismo `viewBox`, mismo estilo outline) en toda la app, sin mezclar con íconos de otro origen o estilo.

#### Scenario: Íconos del nav inferior coinciden con los del resto de la app
- **WHEN** se comparan los íconos del nav inferior (`index.html`) con los íconos usados dentro de las pantallas (`js/screens/*.js`)
- **THEN** provienen del mismo módulo `js/icons.js`, sin SVGs duplicados o divergentes hardcodeados en `index.html`

### Requirement: Totales de la home derivados de los datos
El sistema SHALL seguir calculando los totales mostrados en la pantalla de inicio a partir de la longitud real de los datos cargados (`preguntas.length`, `senales.length`), nunca hardcodeados.

#### Scenario: Cambia la cantidad de preguntas en el banco de datos
- **WHEN** el archivo `data/preguntas.json` tiene un número de preguntas distinto al actual
- **THEN** la pantalla de inicio muestra el nuevo número sin requerir cambios de código
