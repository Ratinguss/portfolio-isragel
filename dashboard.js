// Sales Analytics Dashboard
class SalesDashboard {
    constructor() {
        this.charts = {
            line: null,
            funnel: null,
            traffic: null
        };
        this.currentData = null;
        this.init();
    }

    init() {
        // Modal controls
        const dashboardCard = document.getElementById('sales-dashboard-card');
        const modal = document.getElementById('dashboard-modal');
        const closeBtn = document.getElementById('close-dashboard');
        const uploadInput = document.getElementById('csv-upload');
        const resetBtn = document.getElementById('reset-data');

        // Open modal
        dashboardCard.addEventListener('click', () => {
            modal.classList.add('active');
            if (!this.currentData) {
                this.loadDemoData();
            }
        });

        // Close modal
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        // File upload
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileUpload(file);
            }
        });

        // Reset button
        resetBtn.addEventListener('click', () => {
            this.resetToDemo();
        });

        // Try to load data from localStorage
        this.loadFromStorage();
    }

    showLoading(show) {
        const loadingState = document.getElementById('loading-state');
        const kpiCards = document.querySelector('.kpi-cards');
        const charts = document.querySelector('.dashboard-charts');
        loadingState.style.display = show ? 'block' : 'none';
        if (kpiCards) kpiCards.style.display = show ? 'none' : 'grid';
        if (charts) charts.style.display = show ? 'none' : 'grid';
    }

    showError(message) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    handleFileUpload(file) {
        if (!file.name.endsWith('.csv')) {
            this.showError('Please upload a valid CSV file');
            return;
        }

        const fileNameSpan = document.getElementById('file-name');
        fileNameSpan.textContent = `📄 ${file.name}`;
        
        this.showLoading(true);

        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    this.showError('Error parsing CSV file. Please check the file format.');
                    this.showLoading(false);
                    return;
                }

                if (results.data.length === 0) {
                    this.showError('CSV file is empty');
                    this.showLoading(false);
                    return;
                }

                this.currentData = results.data;
                this.saveToStorage(this.currentData, file.name);
                this.processAndRenderData(this.currentData);
                this.showLoading(false);
            },
            error: (error) => {
                this.showError('Failed to parse CSV file: ' + error.message);
                this.showLoading(false);
            }
        });
    }

    processAndRenderData(data) {
        const columns = Object.keys(data[0]);
        const columnTypes = this.detectColumnTypes(data, columns);
        
        // Find suitable columns for charts
        const dateColumn = columns.find(col => columnTypes[col] === 'date');
        const numericColumns = columns.filter(col => columnTypes[col] === 'number');
        const categoryColumns = columns.filter(col => columnTypes[col] === 'category');

        // Generate charts based on available data
        this.generateLineChart(data, dateColumn, numericColumns);
        this.generateFunnelChart();
        this.generateTrafficChart();
    }

    detectColumnTypes(data, columns) {
        const types = {};
        
        columns.forEach(col => {
            const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== '');
            
            if (values.length === 0) {
                types[col] = 'unknown';
                return;
            }

            // Check if date
            const dateCount = values.filter(v => {
                if (typeof v === 'string') {
                    const datePatterns = [
                        /^\d{4}-\d{2}-\d{2}$/,
                        /^\d{2}\/\d{2}\/\d{4}$/,
                        /^\d{2}-\d{2}-\d{4}$/,
                        /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i
                    ];
                    return datePatterns.some(pattern => pattern.test(v)) || !isNaN(Date.parse(v));
                }
                return false;
            }).length;

            if (dateCount / values.length > 0.7) {
                types[col] = 'date';
                return;
            }

            // Check if numeric
            const numericCount = values.filter(v => typeof v === 'number' || !isNaN(parseFloat(v))).length;
            if (numericCount / values.length > 0.7) {
                types[col] = 'number';
                return;
            }

            // Default to category
            types[col] = 'category';
        });

        return types;
    }

    generateLineChart(data, dateColumn, numericColumns) {
        const ctx = document.getElementById('line-chart');
        
        if (this.charts.line) {
            this.charts.line.destroy();
        }

        let labels = [];
        let datasets = [];

        if (dateColumn && numericColumns.length > 0) {
            // Sort by date
            const sortedData = [...data].sort((a, b) => {
                const dateA = new Date(a[dateColumn]);
                const dateB = new Date(b[dateColumn]);
                return dateA - dateB;
            });

            labels = sortedData.map(row => {
                const date = new Date(row[dateColumn]);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });

            // Use first numeric column
            const valueColumn = numericColumns[0];
            datasets = [{
                label: valueColumn,
                data: sortedData.map(row => parseFloat(row[valueColumn]) || 0),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }];
        } else if (numericColumns.length > 0) {
            // Use index as x-axis if no date column
            labels = data.map((_, i) => `Entry ${i + 1}`);
            const valueColumn = numericColumns[0];
            datasets = [{
                label: valueColumn,
                data: data.map(row => parseFloat(row[valueColumn]) || 0),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }];
        } else {
            // Fallback: count entries
            labels = ['Data Points'];
            datasets = [{
                label: 'Count',
                data: [data.length],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)'
            }];
        }

        this.charts.line = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#f1f5f9',
                        borderColor: 'rgba(99, 102, 241, 0.5)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8', font: { size: 11 } },
                        grid: { color: 'rgba(255, 255, 255, 0.05)', display: false }
                    },
                    y: {
                        ticks: { color: '#94a3b8', font: { size: 11 } },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    }
                }
            }
        });
    }

    generateFunnelChart() {
        const ctx = document.getElementById('funnel-chart');
        
        if (this.charts.funnel) {
            this.charts.funnel.destroy();
        }

        // Funnel data
        const labels = ['Visitors', 'Added to Cart', 'Checkout', 'Purchased'];
        const data = [45000, 6750, 2250, 1440];
        const percentages = ['100%', '15%', '5%', '3.2%'];

        this.charts.funnel = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.map((label, i) => `${label} (${percentages[i]})`),
                datasets: [{
                    label: 'Users',
                    data: data,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.9)',
                        'rgba(99, 102, 241, 0.7)',
                        'rgba(99, 102, 241, 0.5)',
                        'rgba(99, 102, 241, 0.3)'
                    ],
                    borderColor: '#6366f1',
                    borderWidth: 0,
                    barThickness: 40
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#f1f5f9',
                        borderColor: 'rgba(99, 102, 241, 0.5)',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.x.toLocaleString()} users`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 11 },
                            callback: function(value) {
                                return value >= 1000 ? (value/1000).toFixed(1) + 'K' : value;
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    y: {
                        ticks: { color: '#94a3b8', font: { size: 11 } },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    generateTrafficChart() {
        const ctx = document.getElementById('traffic-chart');
        
        if (this.charts.traffic) {
            this.charts.traffic.destroy();
        }

        const labels = ['Direct', 'Organic Search', 'Paid Ads', 'Social Media', 'Email', 'Referral'];
        const data = [35, 28, 18, 12, 5, 2];

        this.charts.traffic = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(59, 130, 246, 0.8)'
                    ],
                    borderColor: '#1e293b',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { 
                            color: '#f1f5f9',
                            font: { size: 11 },
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#f1f5f9',
                        borderColor: 'rgba(99, 102, 241, 0.5)',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderProductsTable() {
        const products = [
            { rank: 1, name: 'Premium Wireless Headphones', units: 245, revenue: 12250, trend: 'up' },
            { rank: 2, name: 'Smart Watch Pro', units: 189, revenue: 9450, trend: 'up' },
            { rank: 3, name: 'Bluetooth Speaker', units: 156, revenue: 4680, trend: 'stable' },
            { rank: 4, name: 'USB-C Hub', units: 142, revenue: 2840, trend: 'up' },
            { rank: 5, name: 'Wireless Charger', units: 138, revenue: 2760, trend: 'down' },
            { rank: 6, name: 'Phone Case Premium', units: 125, revenue: 1875, trend: 'stable' },
            { rank: 7, name: 'Screen Protector Pack', units: 118, revenue: 590, trend: 'up' },
            { rank: 8, name: 'Laptop Stand', units: 98, revenue: 2940, trend: 'up' },
            { rank: 9, name: 'Webcam HD', units: 87, revenue: 3480, trend: 'stable' },
            { rank: 10, name: 'Microphone Kit', units: 76, revenue: 3040, trend: 'up' }
        ];

        const tbody = document.getElementById('products-tbody');
        tbody.innerHTML = '';

        products.forEach(product => {
            const row = document.createElement('tr');
            
            let trendIcon = '';
            let trendClass = '';
            if (product.trend === 'up') {
                trendIcon = '↑';
                trendClass = 'trend-up';
            } else if (product.trend === 'down') {
                trendIcon = '↓';
                trendClass = 'trend-down';
            } else {
                trendIcon = '→';
                trendClass = 'trend-stable';
            }

            row.innerHTML = `
                <td class="rank">${product.rank}</td>
                <td class="product-name">${product.name}</td>
                <td>${product.units}</td>
                <td>$${product.revenue.toLocaleString()}</td>
                <td><span class="trend-icon ${trendClass}">${trendIcon}</span></td>
            `;
            
            tbody.appendChild(row);
        });
    }

    loadDemoData() {
        const demoData = [
            { date: 'Mon', revenue: 15200 },
            { date: 'Tue', revenue: 18400 },
            { date: 'Wed', revenue: 16800 },
            { date: 'Thu', revenue: 22100 },
            { date: 'Fri', revenue: 19500 },
            { date: 'Sat', revenue: 17250 },
            { date: 'Sun', revenue: 18200 }
        ];

        const fileNameSpan = document.getElementById('file-name');
        fileNameSpan.textContent = '📊 Demo Data Loaded';

        this.currentData = demoData;
        this.renderDemoCharts();
        this.renderProductsTable();
    }

    renderDemoCharts() {
        const demoData = [
            { date: 'Mon', revenue: 15200 },
            { date: 'Tue', revenue: 18400 },
            { date: 'Wed', revenue: 16800 },
            { date: 'Thu', revenue: 22100 },
            { date: 'Fri', revenue: 19500 },
            { date: 'Sat', revenue: 17250 },
            { date: 'Sun', revenue: 18200 }
        ];

        // Sales Trend Chart
        const ctxLine = document.getElementById('line-chart');
        if (this.charts.line) {
            this.charts.line.destroy();
        }

        this.charts.line = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: demoData.map(d => d.date),
                datasets: [{
                    label: 'Revenue',
                    data: demoData.map(d => d.revenue),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#f1f5f9',
                        borderColor: 'rgba(99, 102, 241, 0.5)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Revenue: $${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8', font: { size: 11 } },
                        grid: { color: 'rgba(255, 255, 255, 0.05)', display: false }
                    },
                    y: {
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 11 },
                            callback: function(value) {
                                return '$' + (value/1000).toFixed(0) + 'K';
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    }
                }
            }
        });

        // Generate other charts
        this.generateFunnelChart();
        this.generateTrafficChart();
    }

    resetToDemo() {
        localStorage.removeItem('dashboardData');
        localStorage.removeItem('dashboardFileName');
        
        const uploadInput = document.getElementById('csv-upload');
        uploadInput.value = '';

        this.loadDemoData();
    }

    saveToStorage(data, fileName) {
        try {
            localStorage.setItem('dashboardData', JSON.stringify(data));
            localStorage.setItem('dashboardFileName', fileName);
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    }

    loadFromStorage() {
        try {
            const savedData = localStorage.getItem('dashboardData');
            const savedFileName = localStorage.getItem('dashboardFileName');
            
            if (savedData) {
                this.currentData = JSON.parse(savedData);
                const fileNameSpan = document.getElementById('file-name');
                fileNameSpan.textContent = savedFileName ? `📄 ${savedFileName}` : '📊 Saved Data';
            }
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SalesDashboard();
});
