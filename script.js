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

//? <|----- Sistema de Toast -----|>

//* Función principal para mostrar toast
function showToast(message, type = 'info', title = '', duration = 5000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    //* Crear elemento toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    //* Configurar iconos según tipo
    const icons = {
        error: '✕',
        success: '✓',
        warning: '⚠',
        info: 'ℹ'
    };

    //* Configurar títulos por defecto
    const defaultTitles = {
        error: 'Error',
        success: 'Éxito',
        warning: 'Advertencia',
        info: 'Información'
    };

    const toastTitle = title || defaultTitles[type] || 'Notificación';
    const toastIcon = icons[type] || 'ℹ';

    //* Construir HTML del toast
    toast.innerHTML = `
        <div class="toast-header">
            <div class="toast-icon">${toastIcon}</div>
            <h4 class="toast-title">${toastTitle}</h4>
        </div>
        <p class="toast-message">${message}</p>
        <button class="toast-close" onclick="closeToast(this.parentElement)">×</button>
        <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
    `;

    //* Agregar al contenedor
    container.appendChild(toast);

    //* Mostrar toast con animación
    setTimeout(() => toast.classList.add('show'), 10);

    //* Auto-cerrar después del tiempo especificado
    setTimeout(() => closeToast(toast), duration);

    return toast;
}

//* Función para cerrar toast
function closeToast(toast) {
    if (!toast || !toast.classList.contains('toast')) return;
    
    toast.classList.remove('show');
    toast.classList.add('hide');
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 400);
}

//* Función para cerrar todos los toasts
function closeAllToasts() {
    const toasts = document.querySelectorAll('.toast');
    toasts.forEach(toast => closeToast(toast));
}

//* Funciones de conveniencia para diferentes tipos de toast
function showError(message, title = 'Error') {
    return showToast(message, 'error', title, 6000);
}

function showSuccess(message, title = 'Éxito') {
    return showToast(message, 'success', title, 4000);
}

function showWarning(message, title = 'Advertencia') {
    return showToast(message, 'warning', title, 5000);
}

function showInfo(message, title = 'Información') {
    return showToast(message, 'info', title, 4000);
}

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

//? <|----- Verificación de inputs -----|>

// Función que obtiene min y max de los atributos HTML o valores por defecto
function getInputLimits(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return { min: 0, max: 1000000 }; // Fallback por defecto
    
    // Obtener min y max del HTML, con fallbacks inteligentes
    const min = parseInt(element.getAttribute('min')) || 0;
    let max = parseInt(element.getAttribute('max'));
    
    // Si no hay max definido, usar valores basados en los placeholders
    if (!max) {
        const placeholder = element.getAttribute('placeholder') || '';
        // Extraer número del placeholder (ej: "Ej: 150" -> 150)
        const placeholderNumber = placeholder.match(/\d+/);
        if (placeholderNumber) {
            const suggestedValue = parseInt(placeholderNumber[0]);
            // Usar un múltiplo del valor sugerido como máximo
            max = suggestedValue * 10;
        } else {
            // Valores por defecto basados en el tipo de campo
            max = elementId.includes('Lines') ? 1000000 : 
                  elementId.includes('Tests') ? 10000 : 
                  elementId.includes('Time') ? 365 : 1000;
        }
    }
    
    return { min, max };
}

function validateInput(value, min, max) {
    //* Normalizar el valor (eliminar espacios en blanco)
    const normalizedValue = typeof value === 'string' ? value.trim() : value;
    
    //* Verificar si está vacío o es null/undefined
    if (normalizedValue === '' || normalizedValue == null) {
        return {
            isValid: false,
            error: `El campo es requerido. Ingrese un valor entre ${min} y ${max}.`
        };
    }
    
    //* Convertir a número
    const numericValue = Number(normalizedValue);
    
    //* Verificar si es un número válido
    if (isNaN(numericValue) || !isFinite(numericValue)) {
        return {
            isValid: false,
            error: `Debe ingresar un número válido entre ${min} y ${max}.`
        };
    }
    
    //* Verificar rango
    if (numericValue < min || numericValue > max) {
        return {
            isValid: false,
            error: `El valor debe estar entre ${min} y ${max}. Valor ingresado: ${numericValue}`
        };
    }
    
    return {
        isValid: true,
        value: numericValue,
        error: null
    };
}

// Función helper para validar usando límites del HTML
function validateInputFromHTML(elementId) {
    const element = document.getElementById(elementId);
    const limits = getInputLimits(elementId);
    return validateInput(element.value, limits.min, limits.max);
}


//? <|----- Simulación de Métricas -----|>

function calculateMetrics() {
    //* Obtener y validar parámetros del formulario usando límites del HTML
    
    //* Validar tamaño del proyecto
    const projectSizeValidation = validateInputFromHTML('projectSize');
    if (!projectSizeValidation.isValid) {
        showError(projectSizeValidation.error, 'Error en Tamaño del Proyecto');
        return;
    }
    const projectSize = projectSizeValidation.value;

    //* Validar tamaño del equipo
    const teamSizeValidation = validateInputFromHTML('teamSize');
    if (!teamSizeValidation.isValid) {
        showError(teamSizeValidation.error, 'Error en Tamaño del Equipo');
        return;
    }
    const teamSize = teamSizeValidation.value;

    //* Validar fase del proyecto
    const phase = document.getElementById('projectPhase').value;
    if (phase == '' || phase == null) {
        showError('Por favor, seleccione una fase del proyecto válida.', 'Fase del Proyecto Requerida');
        return;
    }

    //* Validar nivel de integridad SIL
    const sil = parseInt(document.getElementById('integritySIL').value);
    if (isNaN(sil) || sil < 1 || sil > 4) {
        showError('Por favor, seleccione un nivel de integridad válido.', 'Nivel de Integridad Requerido');
        return;
    }

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
    
    //* Mostrar mensaje de éxito
    showSuccess('Métricas simuladas y dashboard actualizado correctamente.', 'Simulación Completada');
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
    //* Validar y obtener valores del formulario usando validateInput()
    
    // Validar pruebas automatizadas
    const automatedTestsValidation = validateInput(
        document.getElementById('automatedTests').value, 
        1, 
        150
    );
    if (!automatedTestsValidation.isValid) {
        showError(automatedTestsValidation.error, 'Error en Pruebas Automatizadas');
        return;
    }
    const automatedTests = automatedTestsValidation.value;

    // Validar total de pruebas
    const totalTestsValidation = validateInput(
        document.getElementById('totalTests').value, 
        1, 
        200
    );
    if (!totalTestsValidation.isValid) {
        showError(totalTestsValidation.error, 'Error en Total de Pruebas');
        return;
    }
    const totalTests = totalTestsValidation.value;

    // Validar líneas cubiertas
    const coveredLinesValidation = validateInput(
        document.getElementById('coveredLines').value, 
        1, 
        10000
    );
    if (!coveredLinesValidation.isValid) {
        showError(coveredLinesValidation.error, 'Error en Líneas Cubiertas');
        return;
    }
    const coveredLines = coveredLinesValidation.value;

    // Validar total de líneas
    const totalLinesValidation = validateInput(
        document.getElementById('totalLines').value, 
        1, 
        10000
    );
    if (!totalLinesValidation.isValid) {
        showError(totalLinesValidation.error, 'Error en Total de Líneas');
        return;
    }
    const totalLines = totalLinesValidation.value;

    // Validar defectos encontrados
    const defectsFoundValidation = validateInput(
        document.getElementById('defectsFound').value, 
        1, 
        1000
    );
    if (!defectsFoundValidation.isValid) {
        showError(defectsFoundValidation.error, 'Error en Defectos Encontrados');
        return;
    }
    const defectsFound = defectsFoundValidation.value;

    // Validar regresiones
    const regressionsValidation = validateInput(
        document.getElementById('regressions').value, 
        1, 
        100
    );
    if (!regressionsValidation.isValid) {
        showError(regressionsValidation.error, 'Error en Regresiones');
        return;
    }
    const regressions = regressionsValidation.value;

    // Validar tiempo de resolución
    const resolutionTimeValidation = validateInput(
        document.getElementById('resolutionTime').value, 
        1, 
        31
    );
    if (!resolutionTimeValidation.isValid) {
        showError(resolutionTimeValidation.error, 'Error en Tiempo de Resolución');
        return;
    }
    const resolutionTime = resolutionTimeValidation.value;

    // Validar pruebas exitosas
    const successfulTestsValidation = validateInput(
        document.getElementById('successfulTests').value, 
        1, 
        1000
    );
    if (!successfulTestsValidation.isValid) {
        showError(successfulTestsValidation.error, 'Error en Pruebas Exitosas');
        return;
    }
    const successfulTests = successfulTestsValidation.value;

    // Validar builds exitosos
    const successfulBuildsValidation = validateInput(
        document.getElementById('successfulBuilds').value, 
        1, 
        1000
    );
    if (!successfulBuildsValidation.isValid) {
        showError(successfulBuildsValidation.error, 'Error en Builds Exitosos');
        return;
    }
    const successfulBuilds = successfulBuildsValidation.value;

    // Validar total de builds
    const totalBuildsValidation = validateInput(
        document.getElementById('totalBuilds').value, 
        1, 
        1000
    );
    if (!totalBuildsValidation.isValid) {
        showError(totalBuildsValidation.error, 'Error en Total de Builds');
        return;
    }
    const totalBuilds = totalBuildsValidation.value;

    // Validar tamaño del proyecto
    const projectSizeValidation = validateInput(
        document.getElementById('projectSize').value, 
        1, 
        100
    );
    if (!projectSizeValidation.isValid) {
        showError(projectSizeValidation.error, 'Error en Tamaño del Proyecto');
        return;
    }
    const projectSize = projectSizeValidation.value;

    //* Validaciones lógicas adicionales
    if (automatedTests > totalTests) {
        showError('El número de pruebas automatizadas no puede ser mayor al total de pruebas.', 'Error de Validación');
        return;
    }

    if (coveredLines > totalLines) {
        showError('Las líneas cubiertas no pueden ser más que el total de líneas.', 'Error de Validación');
        return;
    }

    if (successfulTests > totalTests) {
        showError('Las pruebas exitosas no pueden ser más que el total de pruebas.', 'Error de Validación');
        return;
    }

    if (successfulBuilds > totalBuilds) {
        showError('Los builds exitosos no pueden ser más que el total de builds.', 'Error de Validación');
        return;
    }
    
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
    
    //* Mostrar mensaje de éxito
    showSuccess('Métricas calculadas y dashboard actualizado correctamente.', 'Cálculo Completado');
    
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
        
        //* Mostrar mensaje informativo
        const timestamp = localStorage.getItem('vvTimestamp');
        const timeStr = timestamp ? new Date(timestamp).toLocaleString('es-ES') : 'desconocida';
        showInfo(`Datos guardados cargados correctamente. Última actualización: ${timeStr}`, 'Datos Restaurados');
        
        return true;
    }
    return false;
}

//? <|----- Inicialización y Event Listeners -----|>

//* Función para prevenir caracteres no numéricos en inputs
function setupInputValidation() {
    //* Limpiar cualquier mensaje de error existente
    const existingErrors = document.querySelectorAll('.input-error');
    existingErrors.forEach(error => error.remove());
    
    //* Obtener todos los inputs de tipo number
    const numberInputs = document.querySelectorAll('input[type="number"]');
    
    numberInputs.forEach(input => {
        //* Prevenir la entrada de caracteres no deseados (e, E, +, -)
        input.addEventListener('keypress', function(e) {
            //* Permitir solo dígitos, punto decimal y teclas de control
            const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];
            const controlKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'];
            
            //* Si es una tecla de control, permitirla
            if (controlKeys.includes(e.key)) {
                return true;
            }
            
            //* Si no es un carácter permitido, prevenir la entrada
            if (!allowedKeys.includes(e.key)) {
                e.preventDefault();
                return false;
            }
            
            //* Validar que solo haya un punto decimal
            if (e.key === '.' && input.value.includes('.')) {
                e.preventDefault();
                return false;
            }
        });
        
        //* Prevenir pegar contenido no válido
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            let pastedText = (e.clipboardData || window.clipboardData).getData('text');
            
            //* Limpiar el texto pegado - solo números y un punto decimal
            pastedText = pastedText.replace(/[^0-9.]/g, '');
            
            //* Asegurar solo un punto decimal
            const parts = pastedText.split('.');
            if (parts.length > 2) {
                pastedText = parts[0] + '.' + parts.slice(1).join('');
            }
            
            //* Insertar el texto limpio
            if (pastedText && !isNaN(pastedText)) {
                input.value = pastedText;
                //* Disparar evento de cambio para validaciones adicionales
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        
        //* Validar entrada en tiempo real
        input.addEventListener('input', function(e) {
            let value = e.target.value;
            
            //* Remover caracteres no válidos que puedan haber pasado
            value = value.replace(/[^0-9.]/g, '');
            
            //* Asegurar solo un punto decimal
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            
            //* Actualizar el valor si cambió
            if (e.target.value !== value) {
                e.target.value = value;
            }
        });
        
        //* Validar cuando se pierde el foco
        input.addEventListener('blur', function(e) {
            const elementId = e.target.id;
            if (elementId) {
                const validation = validateInputFromHTML(elementId);
                
                //* Solo aplicar estilos visuales, sin mostrar texto de error
                if (!validation.isValid) {
                    //* Aplicar estilo de error al campo
                    e.target.classList.add('error');
                } else {
                    //* Remover estilo de error
                    e.target.classList.remove('error');
                }
                
                //* Remover cualquier mensaje de error previo si existe
                const errorElement = document.getElementById(elementId + '_error');
                if (errorElement) {
                    errorElement.remove();
                }
            }
        });
    });
}

//* Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    //* Configurar validación de inputs
    setupInputValidation();
    
    //* Intentar cargar datos guardados, si no hay, generar métricas iniciales
    if (!loadMetrics()) {
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