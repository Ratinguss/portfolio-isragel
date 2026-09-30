// ── Nav scroll state ──────────────────────────────────
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Mobile menu ───────────────────────────────────────
const toggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.classList.toggle('open', open);
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
    });
});

// ── Active section highlight ──────────────────────────
const sections = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.nav-links a');

const highlight = () => {
    const y = window.scrollY + 120;
    let current = null;
    sections.forEach(s => { if (y >= s.offsetTop) current = s.id; });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
};
window.addEventListener('scroll', highlight, { passive: true });
highlight();

// ── Reveal on scroll ──────────────────────────────────
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduced) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
} else {
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

// ── CSV Dashboard demo ────────────────────────────────
(function () {
    const drop = document.getElementById('demoDrop');
    const body = document.getElementById('demoBody');
    const kpiRow = document.getElementById('kpiRow');
    const table = document.getElementById('demoTable');
    const input = document.getElementById('csvInput');
    const sampleBtn = document.getElementById('loadSample');
    if (!drop) return;

    let trendChart = null, catChart = null, rows = [], cols = [];

    // Sample ad-campaign dataset, generated once
    function sampleCSV() {
        const campaigns = ['UGC Hook A', 'UGC Hook B', 'Static Retarget', 'Broad Test', 'Lookalike 1%'];
        const rows = ['Date,Campaign,Impressions,Clicks,Spend,Revenue'];
        let d = new Date('2026-08-01');
        for (let i = 0; i < 60; i++) {
            campaigns.forEach((c, ci) => {
                const imp = 4000 + Math.round(Math.random() * 9000) + ci * 500;
                const clicks = Math.round(imp * (0.008 + Math.random() * 0.02));
                const spend = +(clicks * (0.4 + Math.random() * 0.8)).toFixed(2);
                const rev = +(spend * (0.6 + Math.random() * 2.4)).toFixed(2);
                rows.push([d.toISOString().slice(0, 10), c, imp, clicks, spend, rev].join(','));
            });
            d.setDate(d.getDate() + 1);
        }
        return rows.join('\n');
    }

    const num = v => {
        const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
        return isNaN(n) ? null : n;
    };
    const fmt = n => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
    const money = n => '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });

    function detect(columns, data) {
        const lower = columns.map(c => c.toLowerCase());
        const find = re => columns[lower.findIndex(c => re.test(c))];
        const dateCol = find(/date|day|time/) || columns.find(c => data.slice(0, 20).every(r => !isNaN(Date.parse(r[c]))));
        const numCols = columns.filter(c =>
            c !== dateCol && !/date|day|time|^id$|_id$|uuid/i.test(c)
            && data.slice(0, 30).every(r => r[c] === '' || num(r[c]) !== null)
            && data.some(r => num(r[c]) !== null));
        const catCol = columns.find(c => c !== dateCol && !numCols.includes(c)
            && new Set(data.map(r => r[c])).size <= Math.max(12, data.length / 4));
        return { dateCol, numCols: numCols.slice(0, 4), catCol };
    }

    function renderKPIs(data, { numCols }) {
        kpiRow.innerHTML = numCols.map(c => {
            const total = data.reduce((s, r) => s + (num(r[c]) || 0), 0);
            const isMoney = /revenue|spend|cost|price|amount|sales/i.test(c);
            return `<div class="kpi"><div class="kpi-label">${c}</div><div class="kpi-value">${isMoney ? money(total) : fmt(total)}</div></div>`;
        }).join('');
    }

    const chartOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#a1a1aa', boxWidth: 10, font: { size: 10 } } } },
        scales: {
            x: { ticks: { color: '#71717a', maxTicksLimit: 8, font: { size: 10 } }, grid: { color: '#232328' } },
            y: { ticks: { color: '#71717a', font: { size: 10 } }, grid: { color: '#232328' } }
        }
    };
    const ACCENT = '#a78bfa', GREEN = '#34d399';

    function renderCharts(data, { dateCol, numCols, catCol }) {
        if (trendChart) trendChart.destroy();
        if (catChart) catChart.destroy();
        const metric = numCols[0];

        if (dateCol && metric) {
            const byDate = {};
            data.forEach(r => { const k = String(r[dateCol]).slice(0, 10); byDate[k] = (byDate[k] || 0) + (num(r[metric]) || 0); });
            const keys = Object.keys(byDate).sort();
            trendChart = new Chart(document.getElementById('trendChart'), {
                type: 'line',
                data: { labels: keys, datasets: [{ label: metric + ' over time', data: keys.map(k => byDate[k]), borderColor: ACCENT, backgroundColor: 'rgba(167,139,250,0.12)', fill: true, tension: 0.3, pointRadius: 0 }] },
                options: chartOpts
            });
        } else {
            trendChart = new Chart(document.getElementById('trendChart'), {
                type: 'bar',
                data: { labels: numCols, datasets: [{ label: 'Totals', data: numCols.map(c => data.reduce((s, r) => s + (num(r[c]) || 0), 0)), backgroundColor: ACCENT }] },
                options: chartOpts
            });
        }

        if (catCol && metric) {
            const byCat = {};
            data.forEach(r => { byCat[r[catCol]] = (byCat[r[catCol]] || 0) + (num(r[metric]) || 0); });
            const top = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 8);
            catChart = new Chart(document.getElementById('catChart'), {
                type: 'bar',
                data: { labels: top.map(t => t[0]), datasets: [{ label: metric + ' by ' + catCol, data: top.map(t => t[1]), backgroundColor: GREEN }] },
                options: { ...chartOpts, indexAxis: 'y' }
            });
        }
    }

    function renderTable(data, columns, numericCols) {
        const max = 50;
        table.innerHTML = '<thead><tr>' + columns.map(c =>
            `<th data-col="${c}" class="${numericCols.includes(c) ? 'num' : ''}">${c} ↕</th>`).join('') + '</tr></thead><tbody>' +
            data.slice(0, max).map(r => '<tr>' + columns.map(c =>
                `<td class="${numericCols.includes(c) ? 'num' : ''}">${r[c] ?? ''}</td>`).join('') + '</tr>').join('') + '</tbody>';
        table.querySelectorAll('th').forEach(th => th.addEventListener('click', () => {
            const c = th.dataset.col, isNum = numericCols.includes(c);
            const sorted = [...rows].sort((a, b) => isNum ? (num(a[c]) || 0) - (num(b[c]) || 0) : String(a[c]).localeCompare(String(b[c])));
            if (th.dataset.dir === 'asc') { sorted.reverse(); th.dataset.dir = 'desc'; } else th.dataset.dir = 'asc';
            renderTable(sorted, columns, numericCols);
        }));
    }

    function loadData(data) {
        if (!data.length) return;
        rows = data; cols = Object.keys(data[0]);
        const det = detect(cols, data);
        drop.hidden = true; body.hidden = false;
        renderKPIs(data, det);
        renderCharts(data, det);
        renderTable(data, cols, det.numCols);
    }

    function parse(text) {
        Papa.parse(text, {
            header: true, skipEmptyLines: true,
            complete: res => loadData(res.data)
        });
    }

    sampleBtn.addEventListener('click', () => parse(sampleCSV()));
    input.addEventListener('change', e => e.target.files[0]?.text().then(parse));

    ['dragover', 'dragenter'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('dragging'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('dragging'); }));
    drop.addEventListener('drop', e => {
        const f = e.dataTransfer.files[0];
        if (f) f.text().then(parse);
    });
})();
