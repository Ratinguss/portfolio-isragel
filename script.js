// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        navbar.style.padding = '0.75rem 0';
    } else {
        navbar.style.background = 'rgba(15, 23, 42, 0.8)';
        navbar.style.padding = '1rem 0';
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply initial styles and observe elements
document.querySelectorAll('.stat-card, .skill-category, .timeline-item, .portfolio-card, .education-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

// Contact form handling
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you for your message! I will get back to you soon.');
    contactForm.reset();
});

// Active navigation link based on scroll position
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector('.nav-link[href="#' + sectionId + '"]');
        
        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink.style.color = '#ffffff';
            } else {
                navLink.style.color = '';
            }
        }
    });
});

// Typing effect for hero role
const heroRole = document.querySelector('.hero-role');
const roles = ['AI Automation Specialist', 'Data Analyst', 'Workflow Developer', 'LLM Integrator'];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeRole() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
        heroRole.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
    } else {
        heroRole.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
    }
    
    if (!isDeleting && charIndex === currentRole.length) {
        setTimeout(() => isDeleting = true, 2000);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
    }
    
    const typingSpeed = isDeleting ? 50 : 100;
    setTimeout(typeRole, typingSpeed);
}

setTimeout(typeRole, 3000);

window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

/* ============================================
   Sales Analytics Dashboard
   ============================================ */

// Demo data to show when no file is uploaded
const demoData = {
    salesByMonth: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        values: [45000, 52000, 48000, 61000, 58000, 67000, 71000, 69000, 74000, 78000, 82000, 89000]
    },
    productCategories: {
        labels: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'],
        values: [35, 25, 20, 12, 8]
    },
    topProducts: {
        labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
        values: [28500, 24300, 21800, 19200, 16400]
    }
};

// Modal elements
const modal = document.getElementById('dashboardModal');
const closeModalBtn = document.getElementById('closeModal');
const salesDashboardCard = document.getElementById('salesDashboardCard');
const dashboardTrigger = document.querySelector('.dashboard-trigger');
const uploadArea = document.getElementById('uploadArea');
const csvFileInput = document.getElementById('csvFileInput');
const browseBtn = document.getElementById('browseBtn');
const resetBtn = document.getElementById('resetBtn');
const chartsContainer = document.getElementById('chartsContainer');
const dataSourceBadge = document.getElementById('dataSource');
const loadingIndicator = document.getElementById('loadingIndicator');

// Chart instances
let chartInstances = [];

// Open modal
function openDashboard() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Load data from localStorage or use demo data
    const savedData = localStorage.getItem('dashboardData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            renderDashboard(data, 'User Data');
        } catch (e) {
            renderDashboard(demoData, 'Demo Data');
        }
    } else {
        renderDashboard(demoData, 'Demo Data');
    }
}

// Close modal
function closeDashboard() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Event listeners for modal
if (salesDashboardCard) {
    salesDashboardCard.addEventListener('click', openDashboard);
}
if (dashboardTrigger) {
    dashboardTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        openDashboard();
    });
}
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeDashboard);
}
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeDashboard();
        }
    });
}

// Browse button
if (browseBtn) {
    browseBtn.addEventListener('click', () => {
        csvFileInput.click();
    });
}

// File upload
if (csvFileInput) {
    csvFileInput.addEventListener('change', handleFileUpload);
}

// Drag and drop
if (uploadArea) {
    uploadArea.addEventListener('click', () => {
        csvFileInput.click();
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            processCSVFile(file);
        } else {
            alert('Please upload a valid CSV file.');
        }
    });
}

// Reset button
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        localStorage.removeItem('dashboardData');
        csvFileInput.value = '';
        renderDashboard(demoData, 'Demo Data');
    });
}

// Handle file upload
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        processCSVFile(file);
    }
}

// Process CSV file
function processCSVFile(file) {
    loadingIndicator.style.display = 'block';
    
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            loadingIndicator.style.display = 'none';
            
            if (results.data && results.data.length > 0) {
                const processedData = analyzeAndProcessData(results.data, results.meta.fields);
                
                // Save to localStorage
                localStorage.setItem('dashboardData', JSON.stringify(processedData));
                
                // Render dashboard
                renderDashboard(processedData, 'User Data');
            } else {
                alert('No data found in the CSV file.');
            }
        },
        error: function(error) {
            loadingIndicator.style.display = 'none';
            alert('Error parsing CSV file: ' + error.message);
        }
    });
}

// Analyze and process data to detect types and generate charts
function analyzeAndProcessData(data, fields) {
    const processedData = {};
    
    // Detect column types
    const columnTypes = detectColumnTypes(data, fields);
    
    // Find date/time columns
    const dateColumns = fields.filter(field => columnTypes[field] === 'date');
    
    // Find numeric columns
    const numericColumns = fields.filter(field => columnTypes[field] === 'number');
    
    // Find categorical columns
    const categoricalColumns = fields.filter(field => columnTypes[field] === 'category');
    
    // Generate time series chart if we have date and numeric columns
    if (dateColumns.length > 0 && numericColumns.length > 0) {
        const dateCol = dateColumns[0];
        const valueCol = numericColumns[0];
        
        const sorted = data.sort((a, b) => new Date(a[dateCol]) - new Date(b[dateCol]));
        
        processedData.timeSeries = {
            labels: sorted.map(row => formatDate(row[dateCol])),
            values: sorted.map(row => row[valueCol] || 0),
            title: `${valueCol} over time`
        };
    }
    
    // Generate bar chart for categorical data
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
        const catCol = categoricalColumns[0];
        const valueCol = numericColumns[0];
        
        const aggregated = aggregateByCategory(data, catCol, valueCol);
        
        processedData.categoryComparison = {
            labels: Object.keys(aggregated),
            values: Object.values(aggregated),
            title: `${valueCol} by ${catCol}`
        };
    }
    
    // Generate pie chart for distribution
    if (categoricalColumns.length > 0) {
        const catCol = categoricalColumns[0];
        const distribution = getDistribution(data, catCol);
        
        processedData.distribution = {
            labels: Object.keys(distribution),
            values: Object.values(distribution),
            title: `Distribution of ${catCol}`
        };
    }
    
    // If no suitable data detected, create summary statistics
    if (Object.keys(processedData).length === 0 && numericColumns.length > 0) {
        // Create a simple bar chart of numeric columns' averages
        const averages = {};
        numericColumns.forEach(col => {
            const sum = data.reduce((acc, row) => acc + (row[col] || 0), 0);
            averages[col] = sum / data.length;
        });
        
        processedData.numericSummary = {
            labels: Object.keys(averages),
            values: Object.values(averages),
            title: 'Average Values'
        };
    }
    
    return processedData;
}

// Detect column types
function detectColumnTypes(data, fields) {
    const types = {};
    
    fields.forEach(field => {
        const values = data.map(row => row[field]).filter(v => v != null);
        
        if (values.length === 0) {
            types[field] = 'unknown';
            return;
        }
        
        // Check if it's a date
        const dateCount = values.filter(v => isValidDate(v)).length;
        if (dateCount / values.length > 0.5) {
            types[field] = 'date';
            return;
        }
        
        // Check if it's a number
        const numberCount = values.filter(v => typeof v === 'number' || !isNaN(parseFloat(v))).length;
        if (numberCount / values.length > 0.8) {
            types[field] = 'number';
            return;
        }
        
        // Check if it's categorical (limited unique values)
        const uniqueValues = new Set(values);
        if (uniqueValues.size < values.length * 0.5 && uniqueValues.size < 20) {
            types[field] = 'category';
            return;
        }
        
        types[field] = 'text';
    });
    
    return types;
}

// Check if value is a valid date
function isValidDate(value) {
    if (typeof value === 'string' || value instanceof Date) {
        const date = new Date(value);
        return !isNaN(date.getTime());
    }
    return false;
}

// Format date for display
function formatDate(value) {
    const date = new Date(value);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Aggregate data by category
function aggregateByCategory(data, categoryField, valueField) {
    const aggregated = {};
    
    data.forEach(row => {
        const category = row[categoryField];
        const value = parseFloat(row[valueField]) || 0;
        
        if (category) {
            aggregated[category] = (aggregated[category] || 0) + value;
        }
    });
    
    return aggregated;
}

// Get distribution of categorical data
function getDistribution(data, field) {
    const distribution = {};
    
    data.forEach(row => {
        const value = row[field];
        if (value) {
            distribution[value] = (distribution[value] || 0) + 1;
        }
    });
    
    return distribution;
}

// Render dashboard with charts
function renderDashboard(data, source) {
    // Update data source badge
    if (dataSourceBadge) {
        dataSourceBadge.innerHTML = `<i class="fas fa-database"></i><span>${source}</span>`;
    }
    
    // Clear existing charts
    chartInstances.forEach(chart => chart.destroy());
    chartInstances = [];
    chartsContainer.innerHTML = '';
    
    // Render charts based on data structure
    if (data.salesByMonth || data.timeSeries) {
        const chartData = data.salesByMonth || data.timeSeries;
        createLineChart('Sales Over Time', chartData.labels, chartData.values, chartData.title || 'Sales Over Time');
    }
    
    if (data.topProducts || data.categoryComparison) {
        const chartData = data.topProducts || data.categoryComparison;
        createBarChart('Top Performers', chartData.labels, chartData.values, chartData.title || 'Top Performers');
    }
    
    if (data.productCategories || data.distribution) {
        const chartData = data.productCategories || data.distribution;
        createPieChart('Distribution', chartData.labels, chartData.values, chartData.title || 'Distribution');
    }
    
    if (data.numericSummary) {
        createBarChart('Summary Statistics', data.numericSummary.labels, data.numericSummary.values, data.numericSummary.title);
    }
}

// Create line chart
function createLineChart(id, labels, data, title) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chart-wrapper';
    wrapper.innerHTML = `
        <div class="chart-title">
            <i class="fas fa-chart-line"></i>
            <span>${title}</span>
        </div>
        <div class="chart-canvas">
            <canvas id="chart-${id.replace(/\s+/g, '-')}"></canvas>
        </div>
    `;
    chartsContainer.appendChild(wrapper);
    
    const ctx = document.getElementById(`chart-${id.replace(/\s+/g, '-')}`).getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgb(99, 102, 241)',
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
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    titleColor: '#fff',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
    
    chartInstances.push(chart);
}

// Create bar chart
function createBarChart(id, labels, data, title) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chart-wrapper';
    wrapper.innerHTML = `
        <div class="chart-title">
            <i class="fas fa-chart-bar"></i>
            <span>${title}</span>
        </div>
        <div class="chart-canvas">
            <canvas id="chart-${id.replace(/\s+/g, '-')}"></canvas>
        </div>
    `;
    chartsContainer.appendChild(wrapper);
    
    const ctx = document.getElementById(`chart-${id.replace(/\s+/g, '-')}`).getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
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
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    titleColor: '#fff',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(16, 185, 129, 0.5)',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
    
    chartInstances.push(chart);
}

// Create pie chart
function createPieChart(id, labels, data, title) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chart-wrapper';
    wrapper.innerHTML = `
        <div class="chart-title">
            <i class="fas fa-chart-pie"></i>
            <span>${title}</span>
        </div>
        <div class="chart-canvas">
            <canvas id="chart-${id.replace(/\s+/g, '-')}"></canvas>
        </div>
    `;
    chartsContainer.appendChild(wrapper);
    
    const ctx = document.getElementById(`chart-${id.replace(/\s+/g, '-')}`).getContext('2d');
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(168, 85, 247, 0.8)'
                ],
                borderColor: [
                    'rgb(99, 102, 241)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                    'rgb(168, 85, 247)'
                ],
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
                        color: '#94a3b8',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    titleColor: '#fff',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                    borderWidth: 1
                }
            }
        }
    });
    
    chartInstances.push(chart);
}