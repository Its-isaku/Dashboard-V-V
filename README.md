# Dashboard V&V - Sistema de Métricas de Calidad de Software


## Descripción

Dashboard de Verificación y Validación (V&V) es una aplicación web profesional diseñada para monitorear y analizar métricas de calidad de software siguiendo los estándares **ISO/IEC 29110**. La aplicación proporciona una interfaz intuitiva para visualizar la efectividad del proceso de verificación y validación, permitiendo a los usuarios tomar decisiones informadas basadas en datos de sus proyectos.

## Características Principales

### Métricas de Calidad
- **Tasa de Automatización de Pruebas**: Monitoreo del porcentaje de pruebas automatizadas (20% peso)
- **Cobertura de Código**: Seguimiento del código cubierto por pruebas (25% peso)
- **Densidad de Defectos**: Análisis de defectos por cada 1000 líneas de código (20% peso)
- **Tasa de Regresiones**: Control de casos de regresión detectados (15% peso)
- **Tiempo de Resolución de Defectos**: Medición del tiempo promedio para resolver defectos (10% peso)
- **Tasa de Éxito de Pruebas**: Porcentaje de pruebas exitosas (15% peso)
- **Estabilidad de Build**: Monitoreo de la estabilidad del build (10% peso)
- **Efectividad Total V&V**: Suma ponderada de todas las métricas anteriores
- **Trazabilidad de Requisitos**: Control de trazabilidad entre requisitos y pruebas
- **DRE (Defect Removal Efficiency)**: Eficiencia en la eliminación de defectos

### Visualización Avanzada
- **Gráfica Circular de Efectividad**: Muestra la efectividad total del proceso V&V
- **Gráficos Históricos**: Tendencias de cada métrica a lo largo del tiempo
- **Indicadores de Estado**: Código de colores para identificar rápidamente el estado de cada métrica
- **Interfaz Responsiva**: Adaptable a diferentes tamaños de pantalla

### Funcionalidades
- **Modo Simulación**: Genera datos automáticamente para demostración
- **Modo Datos Reales**: Permite ingreso manual de valores reales
- **Cálculo Automático**: Efectividad calculada según pesos ISO 29110
- **Estados Dinámicos**: Indicadores visuales basados en umbrales configurables

## Instalación y Uso

### Requisitos Previos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)

### Instalación Rápida

1. **Clonar o descargar el repositorio**
   ```bash
   git clone https://github.com/Its-isaku/Dashboard-V-V.git
   cd Dashboard-V-V
   ```

2. **Abrir la aplicación**
   - Abrir `index.html` directamente en el navegador, o
   - Usar un servidor local:

3. **Acceder a la aplicación**
   - Navegador directo: `file:///ruta/al/proyecto/index.html`
   - Servidor local: `http://localhost:8000`

## Guía de Uso

### 1. Vista General del Dashboard
Al abrir la aplicación, verás:
- **Header**: Título del dashboard y badge de cumplimiento ISO/IEC 29110
- **Panel de Efectividad**: Gráfica circular mostrando la efectividad total del proceso
- **Panel de Control**: Controles para configurar parámetros del proyecto

### 2. Configuración de Parámetros

#### Modo de Operación
- **Simulación**: Los datos se generan automáticamente basados en los parámetros configurados
- **Datos Reales**: Permite introducir valores reales manualmente

#### Parámetros del Proyecto
- **Tamaño del Proyecto**: Número de líneas de código (KLOC)
- **Tamaño del Equipo**: Número de desarrolladores
- **Fase del Proyecto**: Seleccionar entre SI.1 a SI.5 según ISO 29110
- **Nivel de Integridad**: Criticidad del sistema (1-4)

### 3. Interpretación de Métricas

#### Códigos de Color
- **Verde**: Métrica en rango óptimo
- **Amarillo**: Métrica requiere atención
- **Rojo**: Métrica en estado crítico

#### Umbrales por Métrica
| Métrica | Óptimo | Advertencia | Crítico |
|---------|--------|-------------|---------|
| Tasa de Automatización de Pruebas | ≥80% | 60-79% | <60% |
| Cobertura de Código | ≥80% | 60-79% | <60% |
| Densidad de Defectos | ≤2/KLOC | 2-5/KLOC | >5/KLOC |
| Tasa de Regresiones | ≤3 casos | 4-8 casos | >8 casos |
| Tiempo de Resolución de Defectos | ≤3 días | 4-7 días | >7 días |
| Tasa de Éxito de Pruebas | ≥90% | 75-89% | <75% |
| Estabilidad de Build | ≥95% | 85-94% | <85% |

### 4. Cálculo de Efectividad

La efectividad total se calcula usando pesos específicos según ISO 29110:
- Cobertura de Código: 25%
- Tasa de Automatización de Pruebas: 20%
- Densidad de Defectos: 20%
- Tasa de Regresiones: 15%
- Tasa de Éxito de Pruebas: 15%
- Tiempo de Resolución de Defectos: 10%
- Estabilidad de Build: 10%

## Estructura del Proyecto

```
Dashboard-V-V/
├── index.html          # Página principal
├── index.css           # Estilos de la aplicación
├── script.js           # Lógica de la aplicación
└── README.md           # Documentación
```

### Archivos Principales

- **`index.html`**: Estructura HTML del dashboard con elementos semánticos
- **`index.css`**: Estilos CSS con diseño responsivo y efectos modernos
- **`script.js`**: Lógica JavaScript para cálculos, simulaciones y manipulación del DOM

## Personalización

### Modificar Umbrales
Para ajustar los umbrales de las métricas, edita el objeto `metricsConfig` en `script.js`:

```javascript
const metricsConfig = {
    automationRate: {
        goodThreshold: 80,    // Cambiar umbral óptimo
        warningThreshold: 60, // Cambiar umbral de advertencia
        // ...
    }
};
```

### Modificar Pesos de Cálculo
Para ajustar los pesos en el cálculo de efectividad, modifica el objeto `weights` en `script.js`:

```javascript
const weights = {
    automationRate: 0.20,  // 20% - Tasa de Automatización de Pruebas
    codeCoverage: 0.25,    // 25% - Cobertura de Código
    defectDensity: 0.20,   // 20% - Densidad de Defectos
    regressions: 0.15,     // 15% - Tasa de Regresiones
    resolutionTime: 0.10,  // 10% - Tiempo de Resolución de Defectos
    testSuccess: 0.15,     // 15% - Tasa de Éxito de Pruebas
    buildStability: 0.10   // 10% - Estabilidad de Build
};
```

## Compatibilidad

### Navegadores Soportados
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Dispositivos
- **Móvil**: Optimizado para pantallas desde 320px
- **Tablet**: Diseño adaptativo para pantallas medianas
- **Desktop**: Experiencia completa en pantallas grandes


### Estándares de Código
- **HTML**: Semántico y accesible
- **CSS**: Metodología BEM para nombres de clases
- **JavaScript**: ES6+ con comentarios descriptivos
- **Responsive**: Mobile-first design

