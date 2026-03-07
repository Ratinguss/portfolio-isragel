// Sales Dashboard - Fixed Version
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

    renderData() {
        if (!this.currentData || this.currentData.length === 0) return;
        
        console.log("Rendering data...");
        this.updateKPIs();
        this.updateTable();
    }

    updateKPIs() {
        var data = this.currentData;
        var cols = Object.keys(data[0]);
        console.log("Columns:", cols);
        
        // Find revenue column (case insensitive)
        var revCol = cols.find(function(c) { 
            var lower = c.toLowerCase();
            return lower.includes("revenue") || lower.includes("sales") || lower.includes("total") || lower.includes("amount");
        });
        
        console.log("Revenue column:", revCol);
        
        if (revCol) {
            var total = 0;
            data.forEach(function(row) {
                var val = parseFloat(String(row[revCol]).replace(/[^0-9.-]/g, "")) || 0;
                total += val;
            });
            
            var el = document.getElementById("total-revenue");
            if (el) el.textContent = "$" + total.toLocaleString();
        }
    }

    updateTable() {
        var data = this.currentData;
        var tbody = document.getElementById("products-tbody");
        if (!tbody) {
            console.log("Table not found!");
            return;
        }
        
        var cols = Object.keys(data[0]);
        
        // Find product and revenue columns
        var nameCol = cols.find(function(c) { 
            var lower = c.toLowerCase();
            return lower.includes("product") || lower.includes("item") || lower.includes("name");
        });
        
        var revCol = cols.find(function(c) { 
            var lower = c.toLowerCase();
            return lower.includes("revenue") || lower.includes("sales") || lower.includes("total") || lower.includes("amount");
        });
        
        console.log("Name column:", nameCol, "Revenue column:", revCol);
        
        if (!nameCol || !revCol) {
            tbody.innerHTML = "<tr><td colspan=4>Columns not found! Check console.</td></tr>";
            console.log("Missing columns - name:", nameCol, "rev:", revCol);
            return;
        }
        
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
