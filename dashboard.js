// Sales Analytics Dashboard
class SalesDashboard {
    constructor() {
        this.charts = {
            line: null,
            bar: null,
            pie: null
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
        const charts = document.querySelector('.dashboard-charts');
        loadingState.style.display = show ? 'block' : 'none';
        charts.style.display = show ? 'none' : 'grid';
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
        this.generateBarChart(data, categoryColumns, numericColumns);
        this.generatePieChart(data, categoryColumns, numericColumns);
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
                fill: true
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
                fill: true
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
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: { color: '#f1f5f9' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    y: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    }
                }
            }
        });
    }

    generateBarChart(data, categoryColumns, numericColumns) {
        const ctx = document.getElementById('bar-chart');
        
        if (this.charts.bar) {
            this.charts.bar.destroy();
        }

        let labels = [];
        let chartData = [];

        if (categoryColumns.length > 0 && numericColumns.length > 0) {
            const categoryCol = categoryColumns[0];
            const valueCol = numericColumns[0];

            // Aggregate data by category
            const aggregated = {};
            data.forEach(row => {
                const category = row[categoryCol];
                const value = parseFloat(row[valueCol]) || 0;
                if (category) {
                    aggregated[category] = (aggregated[category] || 0) + value;
                }
            });

            labels = Object.keys(aggregated).slice(0, 10); // Limit to top 10
            chartData = labels.map(label => aggregated[label]);
        } else if (categoryColumns.length > 0) {
            // Count occurrences of categories
            const categoryCol = categoryColumns[0];
            const counts = {};
            data.forEach(row => {
                const category = row[categoryCol];
                if (category) {
                    counts[category] = (counts[category] || 0) + 1;
                }
            });

            labels = Object.keys(counts).slice(0, 10);
            chartData = labels.map(label => counts[label]);
        } else {
            // Fallback
            labels = ['Total'];
            chartData = [data.length];
        }

        this.charts.bar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Value',
                    data: chartData,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                        'rgba(168, 85, 247, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: { color: '#f1f5f9' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    y: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    }
                }
            }
        });
    }

    generatePieChart(data, categoryColumns, numericColumns) {
        const ctx = document.getElementById('pie-chart');
        
        if (this.charts.pie) {
            this.charts.pie.destroy();
        }

        let labels = [];
        let chartData = [];

        if (categoryColumns.length > 0 && numericColumns.length > 0) {
            const categoryCol = categoryColumns[0];
            const valueCol = numericColumns[0];

            // Aggregate data by category
            const aggregated = {};
            data.forEach(row => {
                const category = row[categoryCol];
                const value = parseFloat(row[valueCol]) || 0;
                if (category) {
                    aggregated[category] = (aggregated[category] || 0) + value;
                }
            });

            // Get top 6 categories
            const sorted = Object.entries(aggregated)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6);

            labels = sorted.map(([label]) => label);
            chartData = sorted.map(([, value]) => value);
        } else if (categoryColumns.length > 0) {
            // Count occurrences
            const categoryCol = categoryColumns[0];
            const counts = {};
            data.forEach(row => {
                const category = row[categoryCol];
                if (category) {
                    counts[category] = (counts[category] || 0) + 1;
                }
            });

            const sorted = Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6);

            labels = sorted.map(([label]) => label);
            chartData = sorted.map(([, value]) => value);
        } else {
            // Fallback
            labels = ['Total'];
            chartData = [data.length];
        }

        this.charts.pie = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data: chartData,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)'
                    ],
                    borderColor: '#1e293b',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#f1f5f9' }
                    }
                }
            }
        });
    }

    loadDemoData() {
        const demoData = [
            { date: '2024-01-01', category: 'Electronics', product: 'Laptop', revenue: 1200, quantity: 2 },
            { date: '2024-01-05', category: 'Clothing', product: 'T-Shirt', revenue: 150, quantity: 5 },
            { date: '2024-01-10', category: 'Electronics', product: 'Phone', revenue: 800, quantity: 1 },
            { date: '2024-01-15', category: 'Books', product: 'Novel', revenue: 45, quantity: 3 },
            { date: '2024-01-20', category: 'Clothing', product: 'Jeans', revenue: 280, quantity: 4 },
            { date: '2024-01-25', category: 'Electronics', product: 'Tablet', revenue: 600, quantity: 1 },
            { date: '2024-02-01', category: 'Books', product: 'Textbook', revenue: 120, quantity: 2 },
            { date: '2024-02-05', category: 'Clothing', product: 'Jacket', revenue: 350, quantity: 2 },
            { date: '2024-02-10', category: 'Electronics', product: 'Headphones', revenue: 180, quantity: 3 },
            { date: '2024-02-15', category: 'Books', product: 'Magazine', revenue: 25, quantity: 5 },
            { date: '2024-02-20', category: 'Electronics', product: 'Smart Watch', revenue: 450, quantity: 1 },
            { date: '2024-02-25', category: 'Clothing', product: 'Shoes', revenue: 220, quantity: 2 },
            { date: '2024-03-01', category: 'Electronics', product: 'Camera', revenue: 900, quantity: 1 },
            { date: '2024-03-05', category: 'Books', product: 'Cookbook', revenue: 35, quantity: 2 },
            { date: '2024-03-10', category: 'Clothing', product: 'Dress', revenue: 180, quantity: 3 }
        ];

        const fileNameSpan = document.getElementById('file-name');
        fileNameSpan.textContent = '📊 Demo Data Loaded';

        this.currentData = demoData;
        this.processAndRenderData(demoData);
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
