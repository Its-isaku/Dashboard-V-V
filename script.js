// Datos simulados para las métricas
        let metricsData = {
            automationRate: 75,
            codeCoverage: 82,
            defectDensity: 2.3,
            regressions: 5,
            resolutionTime: 4.2,
            testSuccess: 89,
            buildStability: 94
        };

        // Configuración de las métricas con tema de jardinería
        const metricsConfig = {
            automationRate: {
                title: "Tasa de automatización",
                icon: "",
                unit: "%",
                description: "Porcentaje de pruebas automatizadas",
                goodThreshold: 80,
                warningThreshold: 60,
                gardenElement: ""
            },
            codeCoverage: {
                title: "Cobertura de código",
                icon: "",
                unit: "%",
                description: "Porcentaje de código cubierto por pruebas",
                goodThreshold: 80,
                warningThreshold: 60,
                gardenElement: ""
            },
            defectDensity: {
                title: "Densidad de defectos",
                icon: "",
                unit: "/KLOC",
                description: "Defectos por cada 1000 líneas de código",
                goodThreshold: 2,
                warningThreshold: 5,
                invert: true,
                gardenElement: ""
            },
            regressions: {
                title: "Regresiones",
                icon: "",
                unit: "casos",
                description: "Número de regresiones detectadas",
                goodThreshold: 3,
                warningThreshold: 8,
                invert: true,
                gardenElement: ""
            },
            resolutionTime: {
                title: "Tiempo de resolución de defectos",
                icon: "",
                unit: "días",
                description: "Tiempo promedio para resolver defectos",
                goodThreshold: 3,
                warningThreshold: 7,
                invert: true,
                gardenElement: ""
            },
            testSuccess: {
                title: "Tasa de éxito de pruebas",
                icon: "",
                unit: "%",
                description: "Porcentaje de pruebas exitosas",
                goodThreshold: 90,
                warningThreshold: 75,
                gardenElement: ""
            },
            buildStability: {
                title: "Estabilidad de compilaciones",
                icon: "",
                unit: "%",
                description: "Estabilidad de las compilaciones",
                goodThreshold: 95,
                warningThreshold: 85,
                gardenElement: ""
            }
        };

        function getHealthStatus(value, config) {
            if (config.invert) {
                if (value <= config.goodThreshold) return 'healthy';
                if (value <= config.warningThreshold) return 'warning';
                return 'critical';
            } else {
                if (value >= config.goodThreshold) return 'healthy';
                if (value >= config.warningThreshold) return 'warning';
                return 'critical';
            }
        }

        function getValueColor(value, config) {
            const status = getHealthStatus(value, config);
            switch (status) {
                case 'healthy': return 'automation-good';
                case 'warning': return 'automation-warning';
                case 'critical': return 'automation-bad';
            }
        }

        function createMetricCard(metricKey, value, config) {
            const status = getHealthStatus(value, config);
            const animation = status === 'healthy' ? 'growing' : (status === 'critical' ? 'withering' : '');
            
            return `
                <div class="metric-card ${animation}">
                    <div class="garden-elements">${config.gardenElement}</div>
                    <div class="metric-header">
                        <div class="metric-icon">${config.icon}</div>
                        <div class="metric-title">${config.title}</div>
                    </div>
                    <div class="metric-value ${getValueColor(value, config)}">
                        ${value.toFixed(1)}${config.unit}
                    </div>
                    <div class="metric-description">${config.description}</div>
                    <div class="health-indicator ${status}"></div>
                    <div class="chart-container">
                        <canvas id="chart-${metricKey}"></canvas>
                    </div>
                </div>
            `;
        }

        function renderMetrics() {
            const grid = document.getElementById('metricsGrid');
            grid.innerHTML = '';
            
            Object.keys(metricsData).forEach(key => {
                const config = metricsConfig[key];
                const value = metricsData[key];
                grid.innerHTML += createMetricCard(key, value, config);
            });
            
            // Crear gráficos después de un pequeño delay
            setTimeout(createCharts, 100);
        }

        function createCharts() {
            Object.keys(metricsData).forEach(key => {
                const canvas = document.getElementById(`chart-${key}`);
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    const config = metricsConfig[key];
                    const value = metricsData[key];
                    
                    // Datos simulados históricos
                    const historicalData = generateHistoricalData(value, 10);
                    
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: historicalData.map((_, i) => `Sem ${i + 1}`),
                            datasets: [{
                                data: historicalData,
                                borderColor: getHealthStatus(value, config) === 'healthy' ? '#4CAF50' : 
                                            getHealthStatus(value, config) === 'warning' ? '#FF9800' : '#F44336',
                                backgroundColor: getHealthStatus(value, config) === 'healthy' ? 'rgba(76, 175, 80, 0.1)' : 
                                               getHealthStatus(value, config) === 'warning' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                borderWidth: 2,
                                fill: true,
                                tension: 0.4
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
            }
            
            data[points - 1] = currentValue; // El último valor es el actual
            return data;
        }

        function generateRecommendations() {
            const recommendations = [];
            
            Object.keys(metricsData).forEach(key => {
                const config = metricsConfig[key];
                const value = metricsData[key];
                const status = getHealthStatus(value, config);
                
                if (status === 'critical') {
                    recommendations.push({
                        type: 'critical',
                        title: `🚨 ${config.title} necesita atención urgente`,
                        description: `El valor actual (${value.toFixed(1)}${config.unit}) está en zona crítica. Se recomienda acción inmediata.`
                    });
                } else if (status === 'warning') {
                    recommendations.push({
                        type: 'warning',
                        title: `⚠️ ${config.title} requiere mejoras`,
                        description: `El valor actual (${value.toFixed(1)}${config.unit}) puede mejorarse para optimizar la calidad.`
                    });
                }
            });
            
            if (recommendations.length === 0) {
                recommendations.push({
                    type: 'healthy',
                    title: '🌟 ¡Tu jardín está floreciendo!',
                    description: 'Todas las métricas están en rangos saludables. Continúa con las buenas prácticas.'
                });
            }
            
            const container = document.getElementById('recommendations');
            container.innerHTML = recommendations.map(rec => 
                `<div class="recommendation ${rec.type}">
                    <strong>${rec.title}</strong><br>
                    ${rec.description}
                </div>`
            ).join('');
        }

        function simulateNewData() {
            const projectSize = parseInt(document.getElementById('projectSize').value);
            const teamSize = parseInt(document.getElementById('teamSize').value);
            const phase = document.getElementById('projectPhase').value;
            const criticality = document.getElementById('criticalityLevel').value;
            
            // Factores que afectan las métricas
            const sizeFactor = projectSize > 100 ? 0.9 : 1.1;
            const teamFactor = teamSize > 10 ? 0.95 : 1.05;
            const phaseFactor = {
                planning: 0.7,
                development: 0.8,
                testing: 1.0,
                deployment: 0.9,
                maintenance: 0.85
            }[phase];
            const criticalityFactor = {
                low: 1.1,
                medium: 1.0,
                high: 0.9,
                critical: 0.8
            }[criticality];
            
            // Simular nuevos datos con variabilidad
            metricsData.automationRate = Math.max(0, Math.min(100, 
                (60 + Math.random() * 40) * teamFactor * phaseFactor));
            metricsData.codeCoverage = Math.max(0, Math.min(100, 
                (70 + Math.random() * 30) * sizeFactor * criticalityFactor));
            metricsData.defectDensity = Math.max(0.1, 
                (1 + Math.random() * 8) / sizeFactor / criticalityFactor);
            metricsData.regressions = Math.max(0, Math.round(
                (2 + Math.random() * 15) / teamFactor));
            metricsData.resolutionTime = Math.max(0.5, 
                (2 + Math.random() * 10) / teamFactor);
            metricsData.testSuccess = Math.max(0, Math.min(100, 
                (80 + Math.random() * 20) * phaseFactor * criticalityFactor));
            metricsData.buildStability = Math.max(0, Math.min(100, 
                (85 + Math.random() * 15) * teamFactor * phaseFactor));
            
            renderMetrics();
            generateRecommendations();
        }

        // Inicializar el dashboard
        document.addEventListener('DOMContentLoaded', function() {
            renderMetrics();
            generateRecommendations();
            
            // Simular datos cada 30 segundos para demostración
            setInterval(() => {
                if (Math.random() < 0.3) { // 30% de probabilidad
                    simulateNewData();
                }
            }, 30000);
        });