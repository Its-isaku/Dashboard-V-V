//? <|----- Estado Global y Configuración -----|>

//* Estado global que almacena todas las métricas del dashboard
let metricsData = {
    automationRate: 0,
    codeCoverage: 0,
    defectDensity: 0,
    regressions: 0,
    resolutionTime: 0,
    testSuccess: 0,
    buildStability: 0,
    traceability: 0,
    reviewEffectiveness: 0,
    dre: 0
};

//* Pesos para el cálculo de efectividad según ISO 29110 y Unidad 1
const weights = {
    automationRate: 0.20,
    codeCoverage: 0.25,
    defectDensity: 0.20,
    regressions: 0.15,
    resolutionTime: 0.10,
    testSuccess: 0.15,
    buildStability: 0.10
};

//? <|----- Configuración de Métricas ISO 29110 -----|>

//* Configuración completa de métricas ISO 29110 con umbrales y descripciones
const metricsConfig = {
    //* Tasa de automatización de pruebas
    automationRate: {
        title: "Tasa de Automatización",
        unit: "%",
        description: "Porcentaje de pruebas automatizadas según SI.5",
        goodThreshold: 80,
        warningThreshold: 60,
        weight: weights.automationRate
    },
    //* Cobertura de código por pruebas
    codeCoverage: {
        title: "Cobertura de Código",
        unit: "%",
        description: "Porcentaje de código probado según SI.4.4",
        goodThreshold: 80,
        warningThreshold: 60,
        weight: weights.codeCoverage
    },
    //* Densidad de defectos por KLOC
    defectDensity: {
        title: "Densidad de Defectos",
        unit: "/KLOC",
        description: "Defectos por cada 1000 líneas según SI.5.5",
        goodThreshold: 2,
        warningThreshold: 5,
        invert: true, //* Métrica inversa: menor es mejor
        weight: weights.defectDensity
    },
    //* Tasa de regresiones detectadas
    regressions: {
        title: "Tasa de Regresiones",
        unit: "%",
        description: "Funcionalidades que fallaron según SI.5.6",
        goodThreshold: 5,
        warningThreshold: 10,
        invert: true, //* Métrica inversa: menor es mejor
        weight: weights.regressions
    },
    //* Tiempo promedio de resolución de defectos
    resolutionTime: {
        title: "Tiempo de Resolución",
        unit: " días",
        description: "Tiempo promedio para resolver defectos según PM.2.3",
        goodThreshold: 3,
        warningThreshold: 7,
        invert: true, //* Métrica inversa: menor es mejor
        weight: weights.resolutionTime
    },
    //* Tasa de éxito en pruebas
    testSuccess: {
        title: "Tasa de Éxito de Pruebas",
        unit: "%",
        description: "Porcentaje de pruebas exitosas según SI.5.5",
        goodThreshold: 90,
        warningThreshold: 75,
        weight: weights.testSuccess
    },
    //* Estabilidad de compilaciones
    buildStability: {
        title: "Estabilidad de Build",
        unit: "%",
        description: "Compilaciones exitosas según SI.4.4",
        goodThreshold: 95,
        warningThreshold: 85,
        weight: weights.buildStability
    },
    //* Trazabilidad de requisitos - métrica adicional sin peso
    traceability: {
        title: "Trazabilidad de Requisitos",
        unit: "%",
        description: "Requisitos trazables según SI.2.3-SI.6.3",
        goodThreshold: 95,
        warningThreshold: 80
    },
    //* Efectividad de revisiones de código
    reviewEffectiveness: {
        title: "Efectividad de Revisiones",
        unit: "%",
        description: "Defectos encontrados en revisiones según SI.3.5",
        goodThreshold: 30,
        warningThreshold: 15
    },
    //* Eficiencia de eliminación de defectos
    dre: {
        title: "DRE (Defect Removal)",
        unit: "%",
        description: "Defectos eliminados antes de entrega",
        goodThreshold: 90,
        warningThreshold: 70
    }
};

//? <|----- Configuración de Chart.js -----|>

//* Configuración global de Chart.js para el tema oscuro del dashboard
Chart.defaults.color = 'rgba(255, 255, 255, 0.6)';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
Chart.defaults.font.weight = 300;

//? <|----- Cálculo de Efectividad -----|>

//* 
//* Calcula la efectividad total del proceso V&V usando pesos ISO 29110
//* @returns {number} Efectividad total como porcentaje (0-100)
//*
function calculateEffectiveness() {
    let totalScore = 0;
    
    //* Cálculo ponderado según ISO 29110 y Unidad 1
    Object.keys(weights).forEach(metric => {
        const config = metricsConfig[metric];
        const value = metricsData[metric];
        let normalizedScore = 0;
        
        if (config.invert) {
            //* Para métricas inversas (menor es mejor)
            if (value <= config.goodThreshold) {
                normalizedScore = 100;
            } else if (value <= config.warningThreshold) {
                normalizedScore = 50 + 50 * ((config.warningThreshold - value) / (config.warningThreshold - config.goodThreshold));
            } else {
                normalizedScore = 50 * Math.max(0, 1 - (value - config.warningThreshold) / config.warningThreshold);
            }
        } else {
            //* Para métricas normales (mayor es mejor)
            if (value >= config.goodThreshold) {
                normalizedScore = 100;
            } else if (value >= config.warningThreshold) {
                normalizedScore = 50 + 50 * ((value - config.warningThreshold) / (config.goodThreshold - config.warningThreshold));
            } else {
                normalizedScore = 50 * (value / config.warningThreshold);
            }
        }
        
        totalScore += normalizedScore * weights[metric];
    });
    
    return Math.round(totalScore);
}

//*
//* Determina el estado y mensaje basado en el porcentaje de efectividad
//* @param {number} effectiveness - Porcentaje de efectividad (0-100)
//* @returns {object} Objeto con texto descriptivo y color asociado
//*
function getEffectivenessStatus(effectiveness) {
    if (effectiveness >= 90) return { text: "EXCELENTE - Sistema confiable para producción", color: "#27ae60" };
    if (effectiveness >= 75) return { text: "BUENO - Aceptable con monitoreo", color: "#3498db" };
    if (effectiveness >= 60) return { text: "REGULAR - Requiere mejoras antes del release", color: "#f39c12" };
    return { text: "DEFICIENTE - No apto para producción", color: "#e74c3c" };
}

//? <|----- Actualización de Display de Efectividad -----|>

//*
//* Actualiza la visualización de la gráfica circular de efectividad
//* Modifica el texto, porcentaje y animación del gauge SVG
//*
function updateEffectivenessDisplay() {
    const effectiveness = calculateEffectiveness();
    const status = getEffectivenessStatus(effectiveness);
    
    //* Actualizar texto del porcentaje y estado
    document.getElementById('effectivenessValue').textContent = effectiveness + '%';
    document.getElementById('effectivenessStatus').textContent = status.text;
    
    //* Actualizar gauge SVG con nueva circunferencia
    const circumference = 2 * Math.PI * 85;
    const offset = circumference * (effectiveness / 100);
    const gauge = document.getElementById('gaugeProgress');
    gauge.style.strokeDasharray = `${offset} ${circumference}`;
    
    //* Animación suave para la transición
    gauge.style.transition = 'stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)';
}

//? <|----- Simulación de Métricas -----|>

//*
//* Calcula métricas simuladas basadas en parámetros del proyecto
//* Utiliza factores de ISO 29110 para generar datos realistas
//*
function calculateMetrics() {
    //* Obtener parámetros del formulario
    const projectSize = parseInt(document.getElementById('projectSize').value);
    const teamSize = parseInt(document.getElementById('teamSize').value);
    const phase = document.getElementById('projectPhase').value;
    const sil = parseInt(document.getElementById('integritySIL').value);
    
    //* Factores de ajuste basados en ISO 29110
    const sizeFactor = projectSize > 100 ? 0.9 : 1.1; //* Proyectos grandes tienen más complejidad
    const teamFactor = teamSize > 10 ? 0.95 : 1.05; //* Equipos grandes tienen más coordinación
    const phaseFactor = {
        si1: 0.6,  //* Inicio del proyecto
        si2: 0.7,  //* Análisis
        si3: 0.8,  //* Diseño
        si4: 0.85, //* Implementación
        si5: 1.0,  //* Pruebas
        si6: 0.95  //* Cierre
    }[phase];
    const silFactor = {
        1: 1.1, //* Nivel bajo de integridad
        2: 1.0, //* Nivel medio
        3: 0.9, //* Nivel alto
        4: 0.8  //* Nivel crítico
    }[sil];
    
    //* Simular métricas aplicando factores de ajuste
    metricsData.automationRate = Math.min(100, (60 + Math.random() * 40) * teamFactor * phaseFactor);
    metricsData.codeCoverage = Math.min(100, (70 + Math.random() * 30) * sizeFactor * silFactor);
    metricsData.defectDensity = Math.max(0.1, (1 + Math.random() * 8) / sizeFactor / silFactor);
    metricsData.regressions = Math.max(0, (2 + Math.random() * 15) / teamFactor);
    metricsData.resolutionTime = Math.max(0.5, (2 + Math.random() * 10) / teamFactor);
    metricsData.testSuccess = Math.min(100, (80 + Math.random() * 20) * phaseFactor * silFactor);
    metricsData.buildStability = Math.min(100, (85 + Math.random() * 15) * teamFactor * phaseFactor);
    
    //* Métricas adicionales ISO 29110
    metricsData.traceability = Math.min(100, (70 + Math.random() * 30) * silFactor);
    metricsData.reviewEffectiveness = Math.min(50, (15 + Math.random() * 35) * teamFactor);
    metricsData.dre = Math.min(100, (75 + Math.random() * 25) * silFactor * phaseFactor);
    
    //* Actualizar todas las visualizaciones
    updateComplianceMetrics();
    renderMetrics();
    updateEffectivenessDisplay();
    saveMetrics();
}

//? <|----- Actualización de Métricas de Cumplimiento -----|>

//* Actualiza las métricas de cumplimiento ISO 29110 con animación
function updateComplianceMetrics() {
    //* Función para animar valores numéricos con transición suave
    const animateValue = (id, value) => {
        const element = document.getElementById(id);
        const start = parseInt(element.textContent);
        const end = Math.round(value);
        const duration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current + '%';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    };
    
    //* Actualizar valores de cumplimiento con animación
    animateValue('reqVerification', metricsData.traceability);
    animateValue('traceability', metricsData.traceability);
    animateValue('codeReviews', Math.min(100, metricsData.reviewEffectiveness * 2));
    animateValue('acceptanceTests', metricsData.testSuccess);
}

//? <|----- Evaluación de Estado de Salud -----|>

//* Determina el estado de una métrica según sus umbrales
function getHealthStatus(value, config) {
    if (config.invert) {
        //* Para métricas inversas (menor valor = mejor estado)
        if (value <= config.goodThreshold) return 'good';
        if (value <= config.warningThreshold) return 'warning';
        return 'critical';
    } else {
        //* Para métricas normales (mayor valor = mejor estado)
        if (value >= config.goodThreshold) return 'good';
        if (value >= config.warningThreshold) return 'warning';
        return 'critical';
    }
}

//? <|----- Generación de Tarjetas de Métricas -----|>

//* Crea el HTML para una tarjeta de métrica individual
function createMetricCard(metricKey, value, config) {
    const status = getHealthStatus(value, config);
    const fillClass = status === 'good' ? 'fill-good' : (status === 'critical' ? 'fill-critical' : 'fill-warning');
    //* Calcular porcentaje de llenado basado en tipo de métrica
    const fillPercent = config.invert ? 
        Math.max(0, 100 - (value / config.warningThreshold * 50)) : 
        Math.min(100, (value / config.goodThreshold) * 100);
    
    //* Agregar badge de peso si la métrica lo tiene
    const weightBadge = config.weight ? 
        `<span class="metric-weight">PESO: ${(config.weight * 100).toFixed(0)}%</span>` : '';
    
    return `
        <div class="metric-card">
            <div class="metric-header">
                <div class="metric-title">${config.title}</div>
                ${weightBadge}
            </div>
            <div class="metric-value">
                ${value.toFixed(1)}${config.unit}
            </div>
            <div class="metric-description">${config.description}</div>
            <div class="metric-bar">
                <div class="metric-fill ${fillClass}" style="width: ${fillPercent}%"></div>
            </div>
            <div class="chart-container">
                <canvas id="chart-${metricKey}"></canvas>
            </div>
        </div>
    `;
}

//? <|----- Renderizado de Métricas y Gráficos -----|>

//* Renderiza todas las tarjetas de métricas en el grid
function renderMetrics() {
    const grid = document.getElementById('metricsGrid');
    grid.innerHTML = '';
    
    //* Renderizar métricas principales con peso
    Object.keys(metricsData).forEach(key => {
        if (metricsConfig[key]) {
            const config = metricsConfig[key];
            const value = metricsData[key];
            grid.innerHTML += createMetricCard(key, value, config);
        }
    });
    
    //* Crear gráficos después de un pequeño delay para permitir rendering del DOM
    setTimeout(createCharts, 100);
}

//* Crea gráficos Chart.js para cada métrica
function createCharts() {
    Object.keys(metricsData).forEach(key => {
        const canvas = document.getElementById(`chart-${key}`);
        if (canvas && metricsConfig[key]) {
            const ctx = canvas.getContext('2d');
            const config = metricsConfig[key];
            const value = metricsData[key];
            
            //* Datos históricos simulados para tendencia
            const historicalData = generateHistoricalData(value, 12);
            
            //* Determinar colores según estado de salud de la métrica
            const status = getHealthStatus(value, config);
            
            let backgroundColor, borderColor;
            if (status === 'good') {
                backgroundColor = 'rgba(39, 174, 96, 0.2)';
                borderColor = 'rgba(39, 174, 96, 0.8)';
            } else if (status === 'warning') {
                backgroundColor = 'rgba(243, 156, 18, 0.2)';
                borderColor = 'rgba(243, 156, 18, 0.8)';
            } else {
                //* Estado crítico - rojo
                backgroundColor = 'rgba(231, 76, 60, 0.2)';
                borderColor = 'rgba(231, 76, 60, 0.8)';
            }
            
            //* Crear gráfico de línea con Chart.js
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
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleFont: { weight: 300 },
                            bodyFont: { weight: 300 },
                            padding: 12,
                            displayColors: false,
                            callbacks: {
                                label: (context) => `${context.parsed.y.toFixed(1)}${config.unit}`
                            }
                        }
                    },
                    scales: {
                        x: { 
                            display: true,
                                    grid: { 
                                        display: false,
                                        color: 'rgba(255, 255, 255, 0.05)'
                                    },
                                    ticks: {
                                        font: { size: 10, weight: 300 }
                                    }
                                },
                                y: { 
                                    display: false,
                                    grid: { 
                                        color: 'rgba(255, 255, 255, 0.05)'
                                    }
                                }
                            }
                        }
                    });
                }
            });
        }

//? <|----- Generación de Datos Históricos -----|>

//* Genera datos simulados para gráficos de tendencia
function generateHistoricalData(currentValue, points) {
    const data = [];
    let value = currentValue * (0.7 + Math.random() * 0.3);
    
    for (let i = 0; i < points; i++) {
        data.push(value);
        //* Variación aleatoria pequeña
        value += (Math.random() - 0.5) * (currentValue * 0.1);
        value = Math.max(0, value);
        //* Converger hacia el valor actual
        if (i === points - 2) {
            value = currentValue * 0.95;
        }
    }
    
    //* El último punto es el valor actual
    data[points - 1] = currentValue;
    return data;
}

//? <|----- Manejo de Modos de Entrada -----|>

//* Cambia entre modo simulación y manual
function toggleMode(mode, event) {
    //* Remover clase active de todos los botones
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (mode === 'manual') {
        openManualInput();
    }
}

//* Muestra el modal de entrada manual
function openManualInput() {
    document.getElementById('manualInputModal').style.display = 'flex';
}

//* Cierra el modal con animación
function closeManualInput() {
    const modal = document.getElementById('manualInputModal');
    modal.style.animation = 'fadeOut 0.3s';
    setTimeout(() => {
        modal.style.display = 'none';
        modal.style.animation = '';
    }, 300);
}

//? <|----- Procesamiento de Datos Manuales -----|>

//* Aplica datos ingresados manualmente al dashboard
function applyManualData() {
    //* Obtener valores del formulario con fallbacks
    const automatedTests = parseInt(document.getElementById('automatedTests').value) || 0;
    const totalTests = parseInt(document.getElementById('totalTests').value) || 1;
    const coveredLines = parseInt(document.getElementById('coveredLines').value) || 0;
    const totalLines = parseInt(document.getElementById('totalLines').value) || 1;
    const defectsFound = parseInt(document.getElementById('defectsFound').value) || 0;
    const regressions = parseInt(document.getElementById('regressions').value) || 0;
    const resolutionTime = parseFloat(document.getElementById('resolutionTime').value) || 0;
    const successfulTests = parseInt(document.getElementById('successfulTests').value) || 0;
    const successfulBuilds = parseInt(document.getElementById('successfulBuilds').value) || 0;
    const totalBuilds = parseInt(document.getElementById('totalBuilds').value) || 1;
    
    const projectSize = parseInt(document.getElementById('projectSize').value);
    
    //* Calcular métricas principales basadas en datos manuales
    metricsData.automationRate = (automatedTests / totalTests) * 100;
    metricsData.codeCoverage = (coveredLines / totalLines) * 100;
    metricsData.defectDensity = defectsFound / (projectSize || 1);
    metricsData.regressions = regressions;
    metricsData.resolutionTime = resolutionTime;
    metricsData.testSuccess = (successfulTests / totalTests) * 100;
    metricsData.buildStability = (successfulBuilds / totalBuilds) * 100;
    
    //* Estimar métricas adicionales ISO 29110
    metricsData.traceability = Math.min(100, metricsData.codeCoverage * 1.1);
    metricsData.reviewEffectiveness = Math.min(50, defectsFound * 0.3);
    metricsData.dre = Math.min(100, metricsData.testSuccess * 0.95);
    
    //* Actualizar todas las visualizaciones
    updateComplianceMetrics();
    renderMetrics();
    updateEffectivenessDisplay();
    saveMetrics();
    
    closeManualInput();
}

//? <|----- Persistencia de Datos -----|>

//* Guarda métricas en localStorage
function saveMetrics() {
    localStorage.setItem('vvMetrics', JSON.stringify(metricsData));
    localStorage.setItem('vvEffectiveness', calculateEffectiveness());
    localStorage.setItem('vvTimestamp', new Date().toISOString());
}

//* Carga métricas desde localStorage
function loadMetrics() {
    const saved = localStorage.getItem('vvMetrics');
    if (saved) {
        metricsData = JSON.parse(saved);
        renderMetrics();
        updateEffectivenessDisplay();
        updateComplianceMetrics();
    }
}

//? <|----- Inicialización y Event Listeners -----|>

//* Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    loadMetrics();
    
    //* Si no hay datos guardados, generar métricas iniciales
    if (!localStorage.getItem('vvMetrics')) {
        calculateMetrics();
    }
});

//* Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('manualInputModal');
    if (event.target === modal) {
        closeManualInput();
    }
}

//* Crear animación CSS para fadeOut
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);