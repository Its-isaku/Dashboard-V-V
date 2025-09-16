//? ===============================================
//?     DASHBOARD V&V - LÓGICA PRINCIPAL
//?     Sistema de Métricas de Calidad de Software
//?     ISO/IEC 29110 Compliant
//? ===============================================

//? Estado Global de Métricas
//* Objeto que mantiene los valores actuales de todas las métricas
let metricsData = {
    automationRate: 0,          //* Tasa de automatización de pruebas
    codeCoverage: 0,            //* Cobertura de código
    defectDensity: 0,           //* Densidad de defectos
    regressions: 0,             //* Número de regresiones
    resolutionTime: 0,          //* Tiempo de resolución de defectos
    testSuccess: 0,             //* Tasa de éxito de pruebas
    buildStability: 0,          //* Estabilidad de compilaciones
    traceability: 0,            //* Trazabilidad de requisitos
    reviewEffectiveness: 0,     //* Efectividad de revisiones
    dre: 0                      //* Defect Removal Efficiency
};

//? Pesos según ISO 29110
//* Configuración de pesos para el cálculo de efectividad total
const weights = {
    automationRate: 0.20,       //* 20% - Tasa de automatización de pruebas
    codeCoverage: 0.25,         //* 25% - Cobertura de código
    defectDensity: 0.20,        //* 20% - Densidad de defectos
    regressions: 0.15,          //* 15% - Tasa de regresiones
    resolutionTime: 0.10,       //* 10% - Tiempo de resolución
    testSuccess: 0.15,          //* 15% - Tasa de éxito de pruebas
    buildStability: 0.10        //* 10% - Estabilidad de build
};

//? Configuración de Métricas ISO 29110
//* Definición completa de cada métrica con umbrales y configuración
const metricsConfig = {
    automationRate: {
        title: "Tasa de Automatización",
        unit: "%",
        description: "Porcentaje de pruebas automatizadas según SI.5",
        goodThreshold: 80,
        warningThreshold: 60,
        weight: weights.automationRate
    },
    codeCoverage: {
        title: "Cobertura de Código",
        unit: "%",
        description: "Porcentaje de código probado según SI.4.4",
        goodThreshold: 80,
        warningThreshold: 60,
        weight: weights.codeCoverage
    },
    defectDensity: {
        title: "Densidad de Defectos",
        unit: "/KLOC",
        description: "Defectos por cada 1000 líneas según SI.5.5",
        goodThreshold: 2,
        warningThreshold: 5,
        invert: true,               //* Valor invertido: menor es mejor
        weight: weights.defectDensity
    },
    regressions: {
        title: "Tasa de Regresiones",
        unit: "casos",
        description: "Número de regresiones detectadas según SI.5.6",
        goodThreshold: 3,
        warningThreshold: 8,
        invert: true,               //* Valor invertido: menor es mejor
        weight: weights.regressions
    },
    resolutionTime: {
        title: "Tiempo de Resolución de Defectos",
        unit: "días",
        description: "Tiempo promedio para resolver defectos según SI.5.7",
        goodThreshold: 3,
        warningThreshold: 7,
        invert: true,               //* Valor invertido: menor es mejor
        weight: weights.resolutionTime
    },
    testSuccess: {
        title: "Tasa de Éxito de Pruebas",
        unit: "%",
        description: "Porcentaje de pruebas exitosas según SI.4.5",
        goodThreshold: 90,
        warningThreshold: 75,
        weight: weights.testSuccess
    },
    buildStability: {
        title: "Estabilidad de Build",
        unit: "%",
        description: "Estabilidad de las compilaciones según SI.3.3",
        goodThreshold: 95,
        warningThreshold: 85,
        weight: weights.buildStability
    },
    traceability: {
        title: "Trazabilidad de Requisitos",
        unit: "%",
        description: "Porcentaje de requisitos trazables",
        goodThreshold: 95,
        warningThreshold: 80,
        weight: 0
    },
    reviewEffectiveness: {
        title: "Efectividad de Revisiones",
        unit: "%",
        description: "Efectividad de las revisiones de código",
        goodThreshold: 85,
        warningThreshold: 70,
        weight: 0
    },
    dre: {
        title: "DRE (Defect Removal Efficiency)",
        unit: "%",
        description: "Eficiencia en la eliminación de defectos",
        goodThreshold: 90,
        warningThreshold: 75,
        weight: 0
    }
};

//? Funciones de Evaluación de Estado
//* Determina el estado de salud de una métrica basada en sus umbrales
function getHealthStatus(value, config) {
    if (config.invert) {
        //* Para métricas invertidas (menor es mejor)
        if (value <= config.goodThreshold) return 'good';
        if (value <= config.warningThreshold) return 'warning';
        return 'critical';
    } else {
        //* Para métricas normales (mayor es mejor)
        if (value >= config.goodThreshold) return 'good';
        if (value >= config.warningThreshold) return 'warning';
        return 'critical';
    }
}

//* Obtiene el color CSS basado en el estado de la métrica
function getValueColor(value, config) {
    const status = getHealthStatus(value, config);
    switch (status) {
        case 'good': return '#27ae60';
        case 'warning': return '#f39c12';
        case 'critical': return '#e74c3c';
        default: return '#bdc3c7';
    }
}

//? Cálculo de Efectividad Total
//* Calcula la efectividad total del proceso V&V usando pesos ponderados
function calculateEffectiveness() {
    let totalWeighted = 0;
    let totalWeight = 0;
    
    //* Itera sobre cada métrica con peso asignado
    for (const [key, weight] of Object.entries(weights)) {
        if (metricsData[key] !== undefined && weight > 0) {
            const config = metricsConfig[key];
            let normalizedValue = metricsData[key];
            
            //* Normaliza valores invertidos
            if (config.invert) {
                //* Para métricas invertidas, convierte a escala 0-100
                const maxBad = config.warningThreshold * 2;
                normalizedValue = Math.max(0, 100 - (metricsData[key] / maxBad) * 100);
            }
            
            totalWeighted += normalizedValue * weight;
            totalWeight += weight;
        }
    }
    
    //* Retorna la efectividad total como porcentaje
    return totalWeight > 0 ? Math.round(totalWeighted / totalWeight) : 0;
}

//* Determina el estado y mensaje de efectividad basado en el valor
function getEffectivenessStatus(effectiveness) {
    if (effectiveness >= 90) return { text: "EXCELENTE - Cumple completamente", color: "#27ae60" };
    if (effectiveness >= 75) return { text: "BUENO - Aceptable con monitoreo", color: "#3498db" };
    if (effectiveness >= 60) return { text: "REGULAR - Requiere mejoras", color: "#f39c12" };
    return { text: "DEFICIENTE - Acción correctiva urgente", color: "#e74c3c" };
}

//? Actualización de la Gráfica de Efectividad
//* Actualiza la gráfica circular SVG y los valores mostrados
function updateEffectivenessGauge() {
    const effectiveness = calculateEffectiveness();
    const status = getEffectivenessStatus(effectiveness);
    
    //* Actualiza el texto del valor y estado
    document.getElementById('effectivenessValue').textContent = effectiveness + '%';
    document.getElementById('effectivenessStatus').textContent = status.text;
    
    //* Actualiza la gráfica SVG circular
    const circumference = 2 * Math.PI * 85;
    const offset = circumference * (effectiveness / 100);
    const gauge = document.getElementById('gaugeProgress');
    gauge.style.strokeDasharray = `${offset} ${circumference}`;
    
    //* Añade animación suave
    gauge.style.transition = 'stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)';
}

//? Cálculo de Métricas Basado en Parámetros
//* Genera valores de métricas basados en la configuración del proyecto
function calculateMetrics() {
    const projectSize = parseInt(document.getElementById('projectSize').value);
    const teamSize = parseInt(document.getElementById('teamSize').value);
    const phase = document.getElementById('projectPhase').value;
    const sil = parseInt(document.getElementById('integritySIL').value);
    
    //* Factores de ajuste basados en ISO 29110
    const sizeFactor = projectSize > 100 ? 0.9 : 1.1;
    const teamFactor = teamSize > 10 ? 0.95 : 1.05;
    const phaseFactor = {
        si1: 0.6,    //* Inicio del proyecto
        si2: 0.7,    //* Planificación
        si3: 0.8,    //* Análisis
        si4: 0.85,   //* Diseño
        si5: 1.0,    //* Implementación
        si6: 0.9     //* Integración y pruebas
    }[phase];
    const silFactor = (5 - sil) * 0.1 + 0.8; //* Nivel de integridad de seguridad
    
    //* Cálculo de cada métrica con variabilidad realista
    metricsData.automationRate = Math.max(0, Math.min(100, 
        (60 + Math.random() * 35) * teamFactor * phaseFactor));
        
    metricsData.codeCoverage = Math.max(0, Math.min(100, 
        (65 + Math.random() * 30) * sizeFactor * silFactor));
        
    metricsData.defectDensity = Math.max(0.1, 
        (1 + Math.random() * 6) / sizeFactor / silFactor);
        
    metricsData.regressions = Math.max(0, Math.round(
        (2 + Math.random() * 12) / teamFactor));
        
    metricsData.resolutionTime = Math.max(0.5, 
        (2 + Math.random() * 8) / teamFactor);
        
    metricsData.testSuccess = Math.max(0, Math.min(100, 
        (75 + Math.random() * 24) * phaseFactor * silFactor));
        
    metricsData.buildStability = Math.max(0, Math.min(100, 
        (80 + Math.random() * 20) * teamFactor * phaseFactor));
        
    //* Métricas adicionales
    metricsData.traceability = Math.max(0, Math.min(100,
        (70 + Math.random() * 29) * silFactor));
        
    metricsData.reviewEffectiveness = Math.max(0, Math.min(100,
        (65 + Math.random() * 30) * teamFactor));
        
    metricsData.dre = Math.max(0, Math.min(100,
        (70 + Math.random() * 28) * silFactor * phaseFactor));
    
    //* Actualiza la interfaz
    renderMetrics();
    updateEffectivenessGauge();
}

//? Renderizado de Métricas
//* Crea y actualiza las tarjetas de métricas en el DOM
function renderMetrics() {
    const grid = document.getElementById('metricsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    //* Itera sobre cada métrica para crear su tarjeta
    Object.keys(metricsData).forEach(key => {
        const config = metricsConfig[key];
        const value = metricsData[key];
        if (!config) return;
        
        const status = getHealthStatus(value, config);
        const color = getValueColor(value, config);
        
        //* Crea el HTML de la tarjeta
        const card = document.createElement('div');
        card.className = 'metric-card';
        card.innerHTML = `
            <div class="metric-header">
                <div class="metric-title">${config.title}</div>
                <div class="metric-category">ISO 29110</div>
            </div>
            <div class="metric-value" style="color: ${color}">
                ${value.toFixed(1)}${config.unit}
            </div>
            <div class="metric-description">${config.description}</div>
            <div class="health-indicator ${status}"></div>
            <div class="chart-container">
                <canvas id="chart-${key}"></canvas>
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    //* Crea gráficos después de un pequeño delay para asegurar el DOM
    setTimeout(createCharts, 100);
}

//? Creación de Gráficos
//* Genera gráficos de tendencia histórica para cada métrica
function createCharts() {
    Object.keys(metricsData).forEach(key => {
        const canvas = document.getElementById(`chart-${key}`);
        if (canvas && metricsConfig[key]) {
            const ctx = canvas.getContext('2d');
            const config = metricsConfig[key];
            const value = metricsData[key];
            
            //* Genera datos históricos simulados
            const historicalData = generateHistoricalData(value, 12);
            
            const status = getHealthStatus(value, config);
            
            //* Define colores basados en el estado
            let backgroundColor, borderColor;
            if (status === 'good') {
                backgroundColor = 'rgba(39, 174, 96, 0.2)';
                borderColor = 'rgba(39, 174, 96, 0.8)';
            } else if (status === 'warning') {
                backgroundColor = 'rgba(243, 156, 18, 0.2)';
                borderColor = 'rgba(243, 156, 18, 0.8)';
            } else {
                backgroundColor = 'rgba(231, 76, 60, 0.2)';
                borderColor = 'rgba(231, 76, 60, 0.8)';
            }
            
            //* Crea el gráfico usando Chart.js
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                    datasets: [{
                        data: historicalData,
                        borderColor: borderColor,
                        backgroundColor: backgroundColor,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
        }
    });
}

//? Generación de Datos Históricos
//* Crea una serie temporal simulada basada en el valor actual
function generateHistoricalData(currentValue, points) {
    const data = [];
    let value = currentValue * (0.7 + Math.random() * 0.3);
    
    //* Genera puntos con variación realista
    for (let i = 0; i < points; i++) {
        data.push(Math.max(0, value));
        value += (Math.random() - 0.5) * (currentValue * 0.15);
        //* Tendencia gradual hacia el valor actual
        value = value * 0.95 + currentValue * 0.05;
    }
    
    //* Asegura que el último valor sea el actual
    data[points - 1] = currentValue;
    return data;
}

//? Manejo de Entrada Manual
//* Permite al usuario ingresar valores manuales para las métricas
function enableManualInput() {
    const container = document.getElementById('manualInputs');
    if (!container) return;
    
    container.innerHTML = '';
    
    //* Crea campos de entrada para cada métrica
    Object.keys(metricsConfig).forEach(key => {
        const config = metricsConfig[key];
        const inputGroup = document.createElement('div');
        inputGroup.className = 'control-group';
        inputGroup.innerHTML = `
            <label for="${key}">${config.title} (${config.unit})</label>
            <input type="number" 
                   id="${key}" 
                   value="${metricsData[key].toFixed(1)}"
                   step="0.1"
                   min="0"
                   onchange="updateMetricValue('${key}', this.value)">
        `;
        container.appendChild(inputGroup);
    });
}

//? Actualización de Valor Manual
//* Actualiza una métrica específica con un valor manual
function updateMetricValue(key, value) {
    metricsData[key] = parseFloat(value) || 0;
    renderMetrics();
    updateEffectivenessGauge();
}

//? Alternancia de Modo
//* Cambia entre modo simulación y entrada manual
function toggleMode(mode, event) {
    //* Actualiza botones activos
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const simulationControls = document.getElementById('simulationControls');
    const manualInputs = document.getElementById('manualInputs');
    
    if (mode === 'simulation') {
        //* Modo simulación: muestra controles de parámetros
        simulationControls.style.display = 'block';
        manualInputs.style.display = 'none';
    } else {
        //* Modo manual: muestra campos de entrada directa
        simulationControls.style.display = 'none';
        manualInputs.style.display = 'grid';
        enableManualInput();
    }
}

//? Inicialización del Dashboard
//* Configura el estado inicial y event listeners
document.addEventListener('DOMContentLoaded', function() {
    //* Calcula métricas iniciales
    calculateMetrics();
    
    //* Configura actualización automática en modo demo
    setInterval(() => {
        //* Solo actualiza automáticamente si está en modo simulación
        const isSimulationMode = document.querySelector('.mode-btn.active').textContent === 'Simulación';
        if (isSimulationMode && Math.random() < 0.2) { //* 20% probabilidad cada 30 segundos
            calculateMetrics();
        }
    }, 30000);
    
    //* Inicializa el modo manual
    enableManualInput();
    
    console.log('Dashboard V&V inicializado correctamente');
});

//? Funciones de Exportación (Futuras)
//* Placeholder para funcionalidades futuras de exportación
function exportToPDF() {
    //* TODO: Implementar exportación a PDF
    console.log('Exportación a PDF - Funcionalidad futura');
}

function exportToExcel() {
    //* TODO: Implementar exportación a Excel
    console.log('Exportación a Excel - Funcionalidad futura');
}

//? Funciones de Integración API (Futuras)
//* Placeholder para integraciones con herramientas externas
function connectToJira() {
    //* TODO: Integración con JIRA API
    console.log('Integración JIRA - Funcionalidad futura');
}

function connectToAzureDevOps() {
    //* TODO: Integración con Azure DevOps API
    console.log('Integración Azure DevOps - Funcionalidad futura');
}