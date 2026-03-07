// Sales Dashboard - Intelligent Auto-Detection Version
class SalesDashboard {
    constructor() {
        this.currentData = null;
        this.charts = {};
        this.init();
    }

    init() {
        console.log("Dashboard initializing");
        this.setupEventListeners();
    }

    setupEventListeners() {
        var uploadInput = document.getElementById("csv-upload");
        if (uploadInput) {
            uploadInput.onchange = (e) => {
                var file = e.target.files[0];
                if (file) {
                    console.log("File selected:", file.name);
                    this.handleFileUpload(file);
                }
            };
        }
        
        var closeBtn = document.getElementById("close-dashboard");
        if (closeBtn) {
            closeBtn.onclick = () => {
                var modal = document.getElementById("dashboard-modal");
                if (modal) modal.classList.remove("active");
            };
        }
    }

    handleFileUpload(file) {
        console.log("Processing:", file.name);
        
        if (file.name.indexOf(".csv") === -1) {
            alert("Please upload a CSV file");
            return;
        }

        var reader = new FileReader();
        reader.onload = (e) => {
            var csv = e.target.result;
            console.log("CSV loaded");
            this.parseCSV(csv);
        };
        reader.readAsText(file);
    }

    parseCSV(csv) {
        var lines = csv.split("\n").filter(function(l) { return l.trim(); });
        if (lines.length < 2) {
            alert("CSV file is empty");
            return;
        }

        var headers = lines[0].split(",").map(function(h) { return h.trim().replace(/"/g, ""); });
        var data = [];
        
        for (var i = 1; i < lines.length; i++) {
            var values = lines[i].split(",").map(function(v) { return v.trim().replace(/"/g, ""); });
            var row = {};
            headers.forEach(function(h, idx) {
                row[h] = values[idx] || "";
            });
            data.push(row);
        }

        console.log("Parsed:", data.length, "rows");
        console.log("Headers:", headers);
        this.currentData = data;
        this.renderData();
    }

    // Auto-detect column types
    detectColumnTypes(data) {
        var cols = Object.keys(data[0]);
        var result = {
            numeric: [],
            text: [],
            date: []
        };
        
        cols.forEach(function(col) {
            var isNumeric = true;
            var isDate = true;
            var sample = data.slice(0, 10).map(function(row) { return row[col]; });
            
            sample.forEach(function(val) {
                if (isNumeric && isNaN(parseFloat(String(val).replace(/[^0-9.-]/g, "")))) isNumeric = false;
                if (isDate && isNaN(Date.parse(val))) isDate = false;
            });
            
            if (isNumeric) result.numeric.push(col);
            else if (isDate) result.date.push(col);
            else result.text.push(col);
        });
        
        console.log("Column types:", result);
        return result;
    }

    // Find specific columns
    findColumn(data, keywords) {
        var cols = Object.keys(data[0]);
        return cols.find(function(c) {
            var lower = c.toLowerCase();
            return keywords.some(function(kw) { return lower.includes(kw); });
        });
    }

    renderData() {
        if (!this.currentData || this.currentData.length === 0) return;
        
        console.log("Rendering data...");
        
        var colTypes = this.detectColumnTypes(this.currentData);
        
        this.updateKPIs();
        this.autoGenerateCharts(colTypes);
        this.updateTable();
    }

    updateKPIs() {
        var data = this.currentData;
        
        // Find key metrics
        var revCol = this.findColumn(data, ["revenue", "sales", "total", "amount", "gross"]);
        var qtyCol = this.findColumn(data, ["quantity", "qty", "units", "orders", "count"]);
        
        console.log("Revenue column:", revCol, "Quantity column:", qtyCol);
        
        if (revCol) {
            var total = 0;
            data.forEach(function(row) {
                var val = parseFloat(String(row[revCol]).replace(/[^0-9.-]/g, "")) || 0;
                total += val;
            });
            var el = document.getElementById("total-revenue");
            if (el) el.textContent = "$" + total.toLocaleString();
        }
        
        if (qtyCol) {
            var total = 0;
            data.forEach(function(row) {
                var val = parseFloat(String(row[qtyCol]).replace(/[^0-9.-]/g, "")) || 0;
                total += val;
            });
            // Try to find orders count element
            var els = document.querySelectorAll("[id*=order], [id*=count], [id*=quantity]");
            if (els.length > 0) {
                els[0].textContent = total.toLocaleString();
            }
        }
    }

    autoGenerateCharts(colTypes) {
        var data = this.currentData;
        var self = this;
        
        // Try to find date column for timeline chart
        var dateCol = this.findColumn(data, ["date", "day", "month", "year", "time", "created"]);
        
        // Find numeric columns for charts
        var numericCols = colTypes.numeric.slice(0, 4); // Limit to 4
        
        console.log("Date column:", dateCol, "Numeric columns:", numericCols);
        
        // Create a simple bar chart using canvas if Chart.js available
        if (typeof Chart !== 'undefined' && numericCols.length > 0) {
            // Bar chart for first numeric column
            var labels = data.slice(0, 20).map(function(row, i) { return "Row " + (i+1); });
            var values = data.slice(0, 20).map(function(row) { 
                return parseFloat(String(row[numericCols[0]]).replace(/[^0-9.-]/g, "")) || 0; 
            });
            
            // Try to find or create canvas for bar chart
            var canvas = document.getElementById("revenue-chart");
            if (canvas) {
                if (this.charts.bar) this.charts.bar.destroy();
                this.charts.bar = new Chart(canvas, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: numericCols[0],
                            data: values,
                            backgroundColor: '#00d4ff'
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { display: false } }
                    }
                });
            }
        }
    }

    updateTable() {
        var data = this.currentData;
        var tbody = document.getElementById("products-tbody");
        if (!tbody) {
            console.log("Table not found!");
            return;
        }
        
        // Auto-detect product/name column
        var nameCol = this.findColumn(data, ["product", "item", "name", "sku", "title", "productname"]);
        var revCol = this.findColumn(data, ["revenue", "sales", "total", "amount", "gross"]);
        
        console.log("Table - Name column:", nameCol, "Revenue column:", revCol);
        
        if (!nameCol || !revCol) {
            // Show all columns as table
            var cols = Object.keys(data[0]);
            var sampleRows = data.slice(0, 10);
            var html = "";
            cols.forEach(function(col) {
                html += "<th>" + col + "</th>";
            });
            html = "<tr>" + html + "</tr>";
            sampleRows.forEach(function(row) {
                html += "<tr>";
                cols.forEach(function(col) {
                    html += "<td>" + row[col] + "</td>";
                });
                html += "</tr>";
            });
            tbody.innerHTML = html;
            return;
        }
        
        // Aggregate by product
        var products = {};
        data.forEach(function(row) {
            var name = row[nameCol] || "Unknown";
            var rev = parseFloat(String(row[revCol]).replace(/[^0-9.-]/g, "")) || 0;
            if (!products[name]) products[name] = 0;
            products[name] += rev;
        });
        
        var top = Object.entries(products).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 10);
        
        tbody.innerHTML = top.map(function(item, i) { 
            return "<tr><td>" + (i+1) + "</td><td>" + item[0] + "</td><td>$" + item[1].toLocaleString() + "</td><td>up</td></tr>";
        }).join("");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    window.salesDashboard = new SalesDashboard();
});
