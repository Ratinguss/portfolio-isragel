// Sales Dashboard - Simple Version
class SalesDashboard {
    constructor() {
        this.currentData = null;
        this.charts = {};
        this.init();
    }

    init() {
        console.log("SalesDashboard initializing");
        this.setupEventListeners();
    }

    setupEventListeners() {
        var uploadInput = document.getElementById("csv-upload");
        if (uploadInput) {
            uploadInput.onchange = (e) => {
                var file = e.target.files[0];
                if (file) {
                    console.log("File selected", file.name);
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
        console.log("Processing file", file.name);
        
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
        var lines = csv.split("\n").filter(l => l.trim());
        if (lines.length < 2) {
            alert("CSV file is empty");
            return;
        }

        var headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
        var data = [];
        
        for (var i = 1; i < lines.length; i++) {
            var values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
            var row = {};
            headers.forEach((h, idx) => {
                row[h] = values[idx] || "";
            });
            data.push(row);
        }

        console.log("Parsed", data.length, "rows");
        this.currentData = data;
        this.renderData();
    }

    renderData() {
        if (!this.currentData || this.currentData.length === 0) return;
        
        console.log("Rendering data");
        this.updateKPIs();
        this.updateTable();
    }

    updateKPIs() {
        var data = this.currentData;
        
        var numericCols = Object.keys(data[0]).filter(k => !isNaN(parseFloat(data[0][k])));
        
        var totals = {};
        numericCols.forEach(col => {
            totals[col] = data.reduce((sum, row) => sum + (parseFloat(row[col]) || 0), 0);
        });
        
        var revCol = numericCols.find(c => c.toLowerCase().includes("revenue") || c.toLowerCase().includes("sales") || c.toLowerCase().includes("total"));
        
        if (revCol) {
            var el = document.getElementById("total-revenue");
            if (el) el.textContent = "$" + totals[revCol].toLocaleString();
        }
    }

    updateTable() {
        var data = this.currentData;
        var tbody = document.getElementById("products-tbody");
        if (!tbody) return;
        
        var cols = Object.keys(data[0]);
        var nameCol = cols.find(c => c.toLowerCase().includes("product") || c.toLowerCase().includes("item"));
        var revCol = cols.find(c => c.toLowerCase().includes("revenue") || c.toLowerCase().includes("sales"));
        
        if (!nameCol || !revCol) {
            tbody.innerHTML = "<tr><td colspan=4>No product data found</td></tr>";
            return;
        }
        
        var products = {};
        data.forEach(row => {
            var name = row[nameCol] || "Unknown";
            var rev = parseFloat(row[revCol]) || 0;
            if (!products[name]) products[name] = 0;
            products[name] += rev;
        });
        
        var top = Object.entries(products).sort((a, b) => b[1] - a[1]).slice(0, 10);
        
        tbody.innerHTML = top.map((item, i) => "<tr><td>" + (i+1) + "</td><td>" + item[0] + "</td><td>$" + item[1].toLocaleString() + "</td><td>up</td></tr>").join("");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    window.salesDashboard = new SalesDashboard();
});
