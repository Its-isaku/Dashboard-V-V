// Estado global de métricas
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

        // Pesos según ISO 29110 y Unidad 1
        const weights = {
            automationRate: 0.20,
            codeCoverage: 0.25,
            defectDensity: 0.20,
            regressions: 0.15,
            resolutionTime: 0.10,
            testSuccess: 0.15,
            buildStability: 0.10
        };

        // Configuración de métricas ISO 29110
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
                invert: true,
                weight: weights.defectDensity
            },
            regressions: {
                title: "Tasa de Regresiones",
                unit: "%",
                description: "Funcionalidades que fallaron según SI.5.6",
                goodThreshold: 5,
                warningThreshold: 10,
                invert: true,
                weight: weights.regressions
            },
            resolutionTime: {
                title: "Tiempo de Resolución",
                unit: " días",
                description: "Tiempo promedio para resolver defectos según PM.2.3",
                goodThreshold: 3,
                warningThreshold: 7,
                invert: true,
                weight: weights.resolutionTime
            },
            testSuccess: {
                title: "Tasa de Éxito de Pruebas",
                unit: "%",
                description: "Porcentaje de pruebas exitosas según SI.5.5",
                goodThreshold: 90,
                warningThreshold: 75,
                weight: weights.testSuccess
            },
            buildStability: {
                title: "Estabilidad de Build",
                unit: "%",
                description: "Compilaciones exitosas según SI.4.4",
                goodThreshold: 95,
                warningThreshold: 85,
                weight: weights.buildStability
            },
            traceability: {
                title: "Trazabilidad de Requisitos",
                unit: "%",
                description: "Requisitos trazables según SI.2.3-SI.6.3",
                goodThreshold: 95,
                warningThreshold: 80
            },
            reviewEffectiveness: {
                title: "Efectividad de Revisiones",
                unit: "%",
                description: "Defectos encontrados en revisiones según SI.3.5",
                goodThreshold: 30,
                warningThreshold: 15
            },
            dre: {
                title: "DRE (Defect Removal)",
                unit: "%",
                description: "Defectos eliminados antes de entrega",
                goodThreshold: 90,
                warningThreshold: 70
            }
        };

        // Configuración de Chart.js para tema oscuro
        Chart.defaults.color = 'rgba(255, 255, 255, 0.6)';
        Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
        Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        Chart.defaults.font.weight = 300;

        function calculateEffectiveness() {
            let totalScore = 0;
            
            // Cálculo ponderado según ISO 29110 y Unidad 1
            Object.keys(weights).forEach(metric => {
                const config = metricsConfig[metric];
                const value = metricsData[metric];
                let normalizedScore = 0;
                
                if (config.invert) {
                    // Para métricas inversas (menor es mejor)
                    if (value <= config.goodThreshold) {
                        normalizedScore = 100;
                    } else if (value <= config.warningThreshold) {
                        normalizedScore = 50 + 50 * ((config.warningThreshold - value) / (config.warningThreshold - config.goodThreshold));
                    } else {
                        normalizedScore = 50 * Math.max(0, 1 - (value - config.warningThreshold) / config.warningThreshold);
                    }
                } else {
                    // Para métricas normales (mayor es mejor)
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

        function getEffectivenessStatus(effectiveness) {
            if (effectiveness >= 90) return { text: "EXCELENTE - Sistema confiable para producción", color: "#27ae60" };
            if (effectiveness >= 75) return { text: "BUENO - Aceptable con monitoreo", color: "#3498db" };
            if (effectiveness >= 60) return { text: "REGULAR - Requiere mejoras antes del release", color: "#f39c12" };
            return { text: "DEFICIENTE - No apto para producción", color: "#e74c3c" };
        }

        function updateEffectivenessDisplay() {
            const effectiveness = calculateEffectiveness();
            const status = getEffectivenessStatus(effectiveness);
            
            // Actualizar texto
            document.getElementById('effectivenessValue').textContent = effectiveness + '%';
            document.getElementById('effectivenessStatus').textContent = status.text;
            
            // Actualizar gauge SVG
            const circumference = 2 * Math.PI * 85;
            const offset = circumference * (effectiveness / 100);
            const gauge = document.getElementById('gaugeProgress');
            gauge.style.strokeDasharray = `${offset} ${circumference}`;
            
            // Animación suave
            gauge.style.transition = 'stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)';
        }

        function calculateMetrics() {
            const projectSize = parseInt(document.getElementById('projectSize').value);
            const teamSize = parseInt(document.getElementById('teamSize').value);
            const phase = document.getElementById('projectPhase').value;
            const sil = parseInt(document.getElementById('integritySIL').value);
            
            // Factores basados en ISO 29110
            const sizeFactor = projectSize > 100 ? 0.9 : 1.1;
            const teamFactor = teamSize > 10 ? 0.95 : 1.05;
            const phaseFactor = {
                si1: 0.6,
                si2: 0.7,
                si3: 0.8,
                si4: 0.85,
                si5: 1.0,
                si6: 0.95
            }[phase];
            const silFactor = {
                1: 1.1,
                2: 1.0,
                3: 0.9,
                4: 0.8
            }[sil];
            
            // Simular métricas basadas en factores
            metricsData.automationRate = Math.min(100, (60 + Math.random() * 40) * teamFactor * phaseFactor);
            metricsData.codeCoverage = Math.min(100, (70 + Math.random() * 30) * sizeFactor * silFactor);
            metricsData.defectDensity = Math.max(0.1, (1 + Math.random() * 8) / sizeFactor / silFactor);
            metricsData.regressions = Math.max(0, (2 + Math.random() * 15) / teamFactor);
            metricsData.resolutionTime = Math.max(0.5, (2 + Math.random() * 10) / teamFactor);
            metricsData.testSuccess = Math.min(100, (80 + Math.random() * 20) * phaseFactor * silFactor);
            metricsData.buildStability = Math.min(100, (85 + Math.random() * 15) * teamFactor * phaseFactor);
            
            // Métricas adicionales ISO 29110
            metricsData.traceability = Math.min(100, (70 + Math.random() * 30) * silFactor);
            metricsData.reviewEffectiveness = Math.min(50, (15 + Math.random() * 35) * teamFactor);
            metricsData.dre = Math.min(100, (75 + Math.random() * 25) * silFactor * phaseFactor);
            
            // Actualizar todo
            updateComplianceMetrics();
            renderMetrics();
            updateEffectivenessDisplay();
            saveMetrics();
        }

        function updateComplianceMetrics() {
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
            
            animateValue('reqVerification', metricsData.traceability);
            animateValue('traceability', metricsData.traceability);
            animateValue('codeReviews', Math.min(100, metricsData.reviewEffectiveness * 2));
            animateValue('acceptanceTests', metricsData.testSuccess);
        }

        function getHealthStatus(value, config) {
            if (config.invert) {
                if (value <= config.goodThreshold) return 'good';
                if (value <= config.warningThreshold) return 'warning';
                return 'critical';
            } else {
                if (value >= config.goodThreshold) return 'good';
                if (value >= config.warningThreshold) return 'warning';
                return 'critical';
            }
        }

        function createMetricCard(metricKey, value, config) {
            const status = getHealthStatus(value, config);
            const fillClass = status === 'good' ? 'fill-good' : (status === 'critical' ? 'fill-critical' : 'fill-warning');
            const fillPercent = config.invert ? 
                Math.max(0, 100 - (value / config.warningThreshold * 50)) : 
                Math.min(100, (value / config.goodThreshold) * 100);
            
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

        function renderMetrics() {
            const grid = document.getElementById('metricsGrid');
            grid.innerHTML = '';
            
            // Renderizar métricas principales con peso
            Object.keys(metricsData).forEach(key => {
                if (metricsConfig[key]) {
                    const config = metricsConfig[key];
                    const value = metricsData[key];
                    grid.innerHTML += createMetricCard(key, value, config);
                }
            });
            
            // Crear gráficos después de un pequeño delay
            setTimeout(createCharts, 100);
        }

        function createCharts() {
            Object.keys(metricsData).forEach(key => {
                const canvas = document.getElementById(`chart-${key}`);
                if (canvas && metricsConfig[key]) {
                    const ctx = canvas.getContext('2d');
                    const config = metricsConfig[key];
                    const value = metricsData[key];
                    
                    // Datos históricos simulados
                    const historicalData = generateHistoricalData(value, 12);
                    
                    const status = getHealthStatus(value, config);
                    
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

        function generateHistoricalData(currentValue, points) {
            const data = [];
            let value = currentValue * (0.7 + Math.random() * 0.3);
            
            for (let i = 0; i < points; i++) {
                data.push(value);
                value += (Math.random() - 0.5) * (currentValue * 0.1);
                value = Math.max(0, value);
                if (i === points - 2) {
                    value = currentValue * 0.95;
                }
            }
            
            data[points - 1] = currentValue;
            return data;
        }

        function toggleMode(mode, event) {
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            if (mode === 'manual') {
                openManualInput();
            }
        }

        function openManualInput() {
            document.getElementById('manualInputModal').style.display = 'flex';
        }

        function closeManualInput() {
            const modal = document.getElementById('manualInputModal');
            modal.style.animation = 'fadeOut 0.3s';
            setTimeout(() => {
                modal.style.display = 'none';
                modal.style.animation = '';
            }, 300);
        }

        function applyManualData() {
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
            
            // Calcular métricas basadas en datos manuales
            metricsData.automationRate = (automatedTests / totalTests) * 100;
            metricsData.codeCoverage = (coveredLines / totalLines) * 100;
            metricsData.defectDensity = defectsFound / (projectSize || 1);
            metricsData.regressions = regressions;
            metricsData.resolutionTime = resolutionTime;
            metricsData.testSuccess = (successfulTests / totalTests) * 100;
            metricsData.buildStability = (successfulBuilds / totalBuilds) * 100;
            
            // Estimar métricas adicionales
            metricsData.traceability = Math.min(100, metricsData.codeCoverage * 1.1);
            metricsData.reviewEffectiveness = Math.min(50, defectsFound * 0.3);
            metricsData.dre = Math.min(100, metricsData.testSuccess * 0.95);
            
            // Actualizar displays
            updateComplianceMetrics();
            renderMetrics();
            updateEffectivenessDisplay();
            saveMetrics();
            
            closeManualInput();
        }

        function saveMetrics() {
            localStorage.setItem('vvMetrics', JSON.stringify(metricsData));
            localStorage.setItem('vvEffectiveness', calculateEffectiveness());
            localStorage.setItem('vvTimestamp', new Date().toISOString());
        }

        function loadMetrics() {
            const saved = localStorage.getItem('vvMetrics');
            if (saved) {
                metricsData = JSON.parse(saved);
                renderMetrics();
                updateEffectivenessDisplay();
                updateComplianceMetrics();
            }
        }

        // Inicialización
        document.addEventListener('DOMContentLoaded', function() {
            loadMetrics();
            
            // Si no hay datos guardados, calcular métricas iniciales
            if (!localStorage.getItem('vvMetrics')) {
                calculateMetrics();
            }
        });

        // Cerrar modal al hacer clic fuera
        window.onclick = function(event) {
            const modal = document.getElementById('manualInputModal');
            if (event.target === modal) {
                closeManualInput();
            }
        }

        // Animación para fadeOut
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);