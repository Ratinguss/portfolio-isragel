// Sales Dashboard - Fixed Aggregation
class SalesDashboard {
    constructor() {
        this.currentData = null;
        this.init();
    }

    init() {
        console.log("Dashboard init");
        var uploadInput = document.getElementById("csv-upload");
        if (uploadInput) {
            uploadInput.onchange = (e) => {
                var file = e.target.files[0];
                if (file) this.handleFileUpload(file);
            };
        }
    }

    handleFileUpload(file) {
        console.log("File:", file.name);
        var reader = new FileReader();
        reader.onload = (e) => this.parseCSV(e.target.result);
        reader.readAsText(file);
    }

    parseCSV(csv) {
        var lines = csv.trim().split("\n");
        if (lines.length < 2) return;
        
        var headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
        var data = [];
        
        for (var i = 1; i < lines.length; i++) {
            var values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
            var row = {};
            headers.forEach((h, idx) => row[h] = values[idx] || "");
            data.push(row);
        }

        console.log("Rows:", data.length, "Headers:", headers);
        this.currentData = data;
        this.render();
    }

    render() {
        if (!this.currentData) return;
        var data = this.currentData;
        var headers = Object.keys(data[0]);
        
        // Find columns
        var nameCol = headers.find(c => /product|item|name|sku/i.test(c));
        var revCol = headers.find(c => /revenue|sales|total|amount/i.test(c));
        var qtyCol = headers.find(c => /quantity|qty|units|orders/i.test(c));
        
        console.log("Name:", nameCol, "Revenue:", revCol, "Qty:", qtyCol);
        
        // Update KPIs
        if (revCol) {
            var totalRev = data.reduce((sum, r) => sum + (parseFloat(String(r[revCol]).replace(/[^0-9.-]/g, "")) || 0), 0);
            var el = document.getElementById("total-revenue");
            if (el) el.textContent = "$" + totalRev.toLocaleString();
        }
        
        if (qtyCol) {
            var totalQty = data.reduce((sum, r) => sum + (parseFloat(String(r[qtyCol]).replace(/[^0-9.-]/g, "")) || 0), 0);
            var els = document.querySelectorAll("[id*=order], [id*=count]");
            if (els[0]) els[0].textContent = totalQty.toLocaleString();
        }
        
        // Update Table
        var tbody = document.getElementById("products-tbody");
        if (!tbody) return;
        
        if (!nameCol || !revCol) {
            tbody.innerHTML = "<tr><td colspan='4'>Could not find Product + Revenue columns</td></tr>";
            return;
        }
        
        // Aggregate
        var agg = {};
        data.forEach(row => {
            var name = row[nameCol] || "Unknown";
            var rev = parseFloat(String(row[revCol]).replace(/[^0-9.-]/g, "")) || 0;
            if (!agg[name]) agg[name] = 0;
            agg[name] += rev;
        });
        
        var sorted = Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 10);
        
        tbody.innerHTML = sorted.map((item, i) => 
            "<tr><td>" + (i+1) + "</td><td>" + item[0] + "</td><td>$" + item[1].toLocaleString() + "</td><td>↑</td></tr>"
        ).join("");
        
        console.log("Rendered", sorted.length, "products");
    }
}

document.addEventListener("DOMContentLoaded", () => window.salesDashboard = new SalesDashboard());
