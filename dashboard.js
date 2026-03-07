// Sales Dashboard - Simple Version
class SalesDashboard {
    constructor() {
        this.currentData = null;
        this.charts = {};
        this.init();
    }

    init() {
        console.log('SalesDashboard initializing...');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // CSV Upload
        const uploadInput = document.getElementById('csv-upload');
        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    console.log('File selected:', file.name);
                    this.handleFileUpload(file);
                }
            });
        }
        
        // Modal close
        const closeBtn = document.getElementById('close-dashboard');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const modal = document.getElementById('dashboard-modal');
                if (modal) modal.classList.remove('active');
            });
        }
    }

    handleFileUpload(file) {
        console.log('Processing file:', file.name);
        
        if (!file.name.endsWith('.csv')) {
            alert('Please upload a CSV file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target.result;
            console.log('CSV loaded, parsing...');
            this.parseCSV(csv);
        };
        reader.readAsText(file);
    }

    parseCSV(csv) {
        const lines = csv.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
            alert('CSV file is empty');
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((h, idx) => {
                row[h] = values[idx] || '';
            });
            data.push(row);
        }

        console.log('Parsed data:', data.length, 'rows');
        this.currentData = data;
        this.renderData();
    }

    renderData() {
        if (!this.currentData || this.currentData.length === 0) return;
        
        console.log('Rendering data...');
        
        // Update KPIs
        this.updateKPIs();
        
        // Update charts
        this.updateCharts();
        
        // Update table
        this.updateTable();
    }

    updateKPIs() {
        const data = this.currentData;
        
        // Find numeric columns
        const numericCols = Object.keys(data[0]).filter(k => !isNaN(parseFloat(data[0][k])));
        
        // Calculate totals
        const totals = {};
        numericCols.forEach(col => {
            totals[col] = data.reduce((sum, row) => sum + (parseFloat(row[col]) || 0), 0);
        });
        
        // Find revenue/sales column
        const revCol = numericCols.find(c => c.toLowerCase().includes('revenue') || c.toLowerCase().includes('sales') || c.toLowerCase().includes('total'));
        
        if (revCol) {
            const el = document.getElementById('total-revenue');
            if (el) el.textContent = '$' + totals[revCol].toLocaleString();
        }
    }

    updateCharts() {
        console.log('Updating charts...');
        // Charts will be rendered if Chart.js is loaded
    }

    updateTable() {
        const data = this.currentData;
        const tbody = document.getElementById('products-tbody');
        if (!tbody) return;
        
        // Get product and revenue columns
        const cols = Object.keys(data[0]);
        const nameCol = cols.find(c => c.toLowerCase().includes('product') || c.toLowerCase().includes('item'));
        const revCol = cols.find(c => c.toLowerCase().includes('revenue') || c.toLowerCase().includes('sales'));
        
        if (!nameCol || !revCol) {
            tbody.innerHTML = '<tr><td colspan="4">No product data found in CSV</td></tr>';
            return;
        }
        
        // Aggregate by product
        const products = {};
        data.forEach(row => {
            const name = row[nameCol] || 'Unknown';
            const rev = parseFloat(row[revCol]) || 0;
            if (!products[name]) products[name] = 0;
            products[name] += rev;
        });
        
        // Sort and get top 10
        const top = Object.entries(products)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        tbody.innerHTML = top.map(([name, rev], i) => 
            `<tr><td>${i+1}</td><td>${name}</td><td>$${rev.toLocaleString()}</td><td>↑</td></tr>`
        ).join('');
    }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.salesDashboard = new SalesDashboard();
});
