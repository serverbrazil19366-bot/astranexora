/* =====================================================
   ASTRA NEXORA — SEO REPORT DASHBOARD (sample data)
   Plain SVG charts, no libraries.
===================================================== */

(function () {

    /* -------------------------------------------------
       SAMPLE DATA — illustrative, not a real client
    ------------------------------------------------- */

    const months = ["Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26", "Apr 26",
                    "May 26", "Jun 26", "Jul 26", "Aug 26", "Sep 26", "Oct 26"];

    const data = {
        clicks:      [410, 455, 520, 590, 640, 720, 810, 880, 960, 1040, 1150, 1260],
        impressions: [12400, 13900, 15800, 17600, 19900, 22300, 25100, 27800, 30600, 33400, 37200, 41000],
        position:    [24.1, 22.6, 20.3, 18.7, 16.9, 15.2, 13.8, 12.6, 11.7, 10.9, 10.3, 9.8],
        calls:       [6, 7, 8, 9, 10, 12, 13, 15, 16, 18, 19, 21],
        whatsapp:    [4, 5, 5, 7, 8, 9, 11, 12, 14, 15, 17, 19],
        forms:       [2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 8],
        gbpCalls:    [14, 15, 17, 18, 20, 22, 24, 26, 27, 30, 32, 35],
        directions:  [22, 24, 25, 28, 30, 33, 35, 38, 40, 43, 46, 50],
        siteClicks:  [31, 34, 37, 41, 45, 49, 54, 58, 62, 67, 72, 78]
    };

    // Position 12 months ago, 6 months ago, 3 months ago, today
    const keywords = [
        { kw: "dental lab near me",          pos: 3,  was: { 3: 5,  6: 9,  12: 12 }, share: .19 },
        { kw: "dental lab near me",          pos: 4,  was: { 3: 6,  6: 10, 12: 15 }, share: .16 },
        { kw: "zirconia crowns near me",     pos: 5,  was: { 3: 8,  6: 13, 12: 19 }, share: .13 },
        { kw: "implant crown lab near me",   pos: 7,  was: { 3: 11, 6: 17, 12: 25 }, share: .08 },
        { kw: "emax crowns lab",             pos: 9,  was: { 3: 10, 6: 12, 12: 15 }, share: .05 },
        { kw: "digital dental lab india",    pos: 12, was: { 3: 18, 6: 24, 12: 33 }, share: .03 }
    ];

    const pages = [
        { path: "/", share: .34 },
        { path: "/zirconia-crowns", share: .21 },
        { path: "/implant-prosthetics", share: .15 },
        { path: "/products", share: .11 },
        { path: "/contact", share: .07 }
    ];

    const series = [
        { key: "calls", label: "Calls", color: "var(--series-1)" },
        { key: "whatsapp", label: "WhatsApp", color: "var(--series-2)" },
        { key: "forms", label: "Forms", color: "var(--series-3)" }
    ];

    const fmt = new Intl.NumberFormat("en-IN");
    const tooltip = document.getElementById("chartTooltip");
    const SVG = "http://www.w3.org/2000/svg";

    let range = 6;


    /* -------------------------------------------------
       HELPERS
    ------------------------------------------------- */

    const sliceRange = arr => arr.slice(arr.length - range);
    const sum = arr => arr.reduce((a, b) => a + b, 0);

    function el(tag, attrs, parent) {
        const node = document.createElementNS(SVG, tag);
        Object.entries(attrs || {}).forEach(([k, v]) => node.setAttribute(k, v));
        if (parent) parent.appendChild(node);
        return node;
    }

    function niceMax(value) {
        const pow = Math.pow(10, Math.floor(Math.log10(value)));
        const n = value / pow;
        const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
        return step * pow;
    }

    function showTooltip(x, y, title, rows) {
        tooltip.replaceChildren();
        const t = document.createElement("div");
        t.className = "tt-title";
        t.textContent = title;
        tooltip.appendChild(t);
        rows.forEach(r => {
            const row = document.createElement("div");
            row.className = "tt-row";
            const key = document.createElement("i");
            key.style.background = r.color;
            const val = document.createElement("strong");
            val.textContent = r.value;
            const label = document.createElement("span");
            label.textContent = r.label;
            row.append(key, val, label);
            tooltip.appendChild(row);
        });
        tooltip.style.left = Math.min(Math.max(x, 90), window.innerWidth - 90) + "px";
        tooltip.style.top = Math.max(y, 80) + "px";
        tooltip.classList.add("show");
    }

    function hideTooltip() {
        tooltip.classList.remove("show");
    }

    function frame(container) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        const m = { top: 24, right: w < 500 ? 34 : 50, bottom: 28, left: 40 };
        container.replaceChildren();
        const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, role: "img" }, container);
        return { svg, w, h, m, iw: w - m.left - m.right, ih: h - m.top - m.bottom };
    }

    function axes(f, max, labels, xAt) {
        const ticks = 4;
        for (let i = 0; i <= ticks; i++) {
            const v = max / ticks * i;
            const y = f.m.top + f.ih - f.ih * (v / max);
            el("line", { x1: f.m.left, x2: f.w - f.m.right, y1: y, y2: y, stroke: "var(--grid)", "stroke-width": i === 0 ? 1.5 : 1 }, f.svg);
            const t = el("text", { x: f.m.left - 8, y: y + 4, "text-anchor": "end" }, f.svg);
            t.textContent = fmt.format(Math.round(v));
        }
        const every = f.iw / labels.length < 46 ? 2 : 1;
        labels.forEach((label, i) => {
            if ((labels.length - 1 - i) % every) return;
            const t = el("text", { x: xAt(i), y: f.h - 6, "text-anchor": "middle" }, f.svg);
            t.textContent = label;
        });
    }


    /* -------------------------------------------------
       LINE + AREA: organic clicks (crosshair tooltip)
    ------------------------------------------------- */

    function drawClicks() {
        const box = document.querySelector('[data-chart="clicks"]');
        const values = sliceRange(data.clicks);
        const labels = sliceRange(months);
        const f = frame(box);
        f.svg.setAttribute("aria-label", `Organic clicks per month, from ${fmt.format(values[0])} to ${fmt.format(values[values.length - 1])}`);

        const max = niceMax(Math.max(...values) * 1.1);
        const xAt = i => f.m.left + (values.length === 1 ? f.iw / 2 : f.iw * i / (values.length - 1));
        const yAt = v => f.m.top + f.ih - f.ih * (v / max);

        axes(f, max, labels, xAt);

        const pts = values.map((v, i) => [xAt(i), yAt(v)]);
        const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
        const base = f.m.top + f.ih;

        el("path", { d: `${line} L ${pts[pts.length - 1][0]} ${base} L ${pts[0][0]} ${base} Z`, fill: "var(--series-1)", opacity: .1 }, f.svg);
        el("path", { d: line, fill: "none", stroke: "var(--series-1)", "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }, f.svg);

        const last = pts[pts.length - 1];
        el("circle", { cx: last[0], cy: last[1], r: 5, fill: "var(--series-1)", stroke: "var(--chart-surface)", "stroke-width": 2 }, f.svg);
        const label = el("text", { x: last[0], y: last[1] - 12, "text-anchor": "end", class: "direct-label" }, f.svg);
        label.textContent = fmt.format(values[values.length - 1]);

        // Crosshair
        const cross = el("line", { y1: f.m.top, y2: base, stroke: "var(--navy)", "stroke-width": 1, "stroke-dasharray": "3 3", opacity: 0 }, f.svg);
        const dot = el("circle", { r: 5, fill: "var(--series-1)", stroke: "var(--chart-surface)", "stroke-width": 2, opacity: 0 }, f.svg);
        const hit = el("rect", { x: f.m.left - 10, y: f.m.top, width: f.iw + 20, height: f.ih, fill: "transparent", tabindex: 0 }, f.svg);
        hit.setAttribute("aria-label", "Clicks chart. Use left and right arrow keys to read each month.");

        let focusIndex = values.length - 1;

        function at(i) {
            const [x, y] = pts[i];
            cross.setAttribute("x1", x);
            cross.setAttribute("x2", x);
            cross.setAttribute("opacity", .35);
            dot.setAttribute("cx", x);
            dot.setAttribute("cy", y);
            dot.setAttribute("opacity", 1);
            const r = f.svg.getBoundingClientRect();
            const scale = r.width / f.w;
            showTooltip(r.left + x * scale, r.top + y * scale, labels[i], [
                { color: "var(--series-1)", value: fmt.format(values[i]), label: "clicks" },
                { color: "transparent", value: fmt.format(sliceRange(data.impressions)[i]), label: "impressions" }
            ]);
        }

        function clear() {
            cross.setAttribute("opacity", 0);
            dot.setAttribute("opacity", 0);
            hideTooltip();
        }

        hit.addEventListener("pointermove", e => {
            const r = f.svg.getBoundingClientRect();
            const x = (e.clientX - r.left) * (f.w / r.width);
            let best = 0;
            pts.forEach((p, i) => { if (Math.abs(p[0] - x) < Math.abs(pts[best][0] - x)) best = i; });
            at(best);
        });
        hit.addEventListener("pointerleave", clear);
        hit.addEventListener("focus", () => at(focusIndex));
        hit.addEventListener("blur", clear);
        hit.addEventListener("keydown", e => {
            if (e.key === "ArrowLeft") focusIndex = Math.max(0, focusIndex - 1);
            else if (e.key === "ArrowRight") focusIndex = Math.min(values.length - 1, focusIndex + 1);
            else return;
            e.preventDefault();
            at(focusIndex);
        });

        // Table view
        const table = document.querySelector('[data-table="clicks"]');
        table.innerHTML = "<thead><tr><th scope=\"col\">Month</th><th class=\"num\" scope=\"col\">Clicks</th><th class=\"num\" scope=\"col\">Impressions</th><th class=\"num\" scope=\"col\">Avg. position</th></tr></thead>";
        const body = document.createElement("tbody");
        labels.forEach((m, i) => {
            const tr = document.createElement("tr");
            [m, fmt.format(values[i]), fmt.format(sliceRange(data.impressions)[i]), sliceRange(data.position)[i].toFixed(1)]
                .forEach((v, j) => {
                    const td = document.createElement(j ? "td" : "th");
                    if (!j) td.scope = "row";
                    if (j) td.className = "num";
                    td.textContent = v;
                    tr.appendChild(td);
                });
            body.appendChild(tr);
        });
        table.appendChild(body);
    }


    /* -------------------------------------------------
       STACKED BARS: enquiries by source
    ------------------------------------------------- */

    function drawLeads() {
        const box = document.querySelector('[data-chart="leads"]');
        const labels = sliceRange(months);
        const cols = series.map(s => sliceRange(data[s.key]));
        const totals = labels.map((_, i) => cols.reduce((a, c) => a + c[i], 0));
        const f = frame(box);
        f.svg.setAttribute("aria-label", `Enquiries from search per month, from ${totals[0]} to ${totals[totals.length - 1]}`);

        const max = niceMax(Math.max(...totals) * 1.12);
        const slot = f.iw / labels.length;
        const barW = Math.min(44, slot * .56);
        const xAt = i => f.m.left + slot * i + slot / 2;
        const hAt = v => f.ih * (v / max);
        const base = f.m.top + f.ih;

        axes(f, max, labels, xAt);

        labels.forEach((m, i) => {
            let y = base;
            series.forEach((s, si) => {
                const v = cols[si][i];
                const h = hAt(v);
                const isTop = si === series.length - 1;
                const x = xAt(i) - barW / 2;
                const bottom = si ? y - 2 : y; // 2px surface gap between segments
                const top = y - h;
                const r = isTop ? Math.min(4, (bottom - top) / 2) : 0; // rounded data-end
                const d = `M ${x} ${bottom} V ${top + r} Q ${x} ${top} ${x + r} ${top} ` +
                          `H ${x + barW - r} Q ${x + barW} ${top} ${x + barW} ${top + r} V ${bottom} Z`;
                const seg = el("path", { d, fill: s.color, class: "bar-seg", tabindex: 0 }, f.svg);
                seg.setAttribute("aria-label", `${m}: ${v} ${s.label}`);
                const show = () => {
                    const r = seg.getBoundingClientRect();
                    showTooltip(r.left + r.width / 2, r.top, m, [
                        { color: s.color, value: v, label: s.label },
                        { color: "transparent", value: totals[i], label: "total enquiries" }
                    ]);
                };
                seg.addEventListener("pointerenter", show);
                seg.addEventListener("focus", show);
                seg.addEventListener("pointerleave", hideTooltip);
                seg.addEventListener("blur", hideTooltip);
                y -= h;
            });
        });

        // Direct label on the latest total only
        const li = labels.length - 1;
        const label = el("text", { x: xAt(li), y: base - hAt(totals[li]) - 8, "text-anchor": "middle", class: "direct-label" }, f.svg);
        label.textContent = totals[li];

        // Table view
        const table = document.querySelector('[data-table="leads"]');
        table.innerHTML = "<thead><tr><th scope=\"col\">Month</th>" + series.map(s => `<th class="num" scope="col">${s.label}</th>`).join("") + "<th class=\"num\" scope=\"col\">Total</th></tr></thead>";
        const body = document.createElement("tbody");
        labels.forEach((m, i) => {
            const tr = document.createElement("tr");
            [m, ...cols.map(c => c[i]), totals[i]].forEach((v, j) => {
                const td = document.createElement(j ? "td" : "th");
                if (!j) td.scope = "row";
                if (j) td.className = "num";
                td.textContent = v;
                tr.appendChild(td);
            });
            body.appendChild(tr);
        });
        table.appendChild(body);
    }


    /* -------------------------------------------------
       KPI TILES
    ------------------------------------------------- */

    function pct(now, before) {
        return Math.round((now - before) / before * 100);
    }

    function drawKpis() {
        const c = sliceRange(data.clicks);
        const leads = series.map(s => sliceRange(data[s.key]));
        const leadMonths = c.map((_, i) => leads.reduce((a, l) => a + l[i], 0));
        const pos = sliceRange(data.position);
        const imp = sliceRange(data.impressions);
        const ctx = `first vs last month of the period`;

        const tiles = [
            { label: "Organic clicks", value: fmt.format(sum(c)), delta: `+${pct(c[c.length - 1], c[0])}%` },
            { label: "Enquiries from search", value: fmt.format(sum(leadMonths)), delta: `+${pct(leadMonths[leadMonths.length - 1], leadMonths[0])}%` },
            { label: "Average position", value: pos[pos.length - 1].toFixed(1), delta: `↑ ${(pos[0] - pos[pos.length - 1]).toFixed(1)} places` },
            { label: "Search impressions", value: fmt.format(sum(imp)), delta: `+${pct(imp[imp.length - 1], imp[0])}%` }
        ];

        const wrap = document.getElementById("kpis");
        wrap.replaceChildren();
        tiles.forEach(t => {
            const div = document.createElement("div");
            div.className = "kpi";
            div.innerHTML = `<div class="kpi-label"></div><div class="kpi-value"></div><div class="kpi-delta-row"><span class="kpi-delta up"></span></div>`;
            div.querySelector(".kpi-label").textContent = t.label;
            div.querySelector(".kpi-value").textContent = t.value;
            div.querySelector(".kpi-delta").textContent = t.delta;
            div.title = `Change: ${ctx}`;
            wrap.appendChild(div);
        });
    }


    /* -------------------------------------------------
       KEYWORDS, GBP, PAGES
    ------------------------------------------------- */

    function drawKeywords() {
        const total = sum(sliceRange(data.clicks));
        const body = document.querySelector("#keywordTable tbody");
        body.replaceChildren();
        keywords.forEach(k => {
            const tr = document.createElement("tr");
            const change = k.was[range] - k.pos;
            const cells = [
                k.kw,
                `<span class="pos-pill${k.pos <= 3 ? " top3" : ""}">${k.pos}</span>`,
                `<span class="change-up">↑ ${change}</span>`,
                fmt.format(Math.round(total * k.share))
            ];
            cells.forEach((v, j) => {
                const td = document.createElement("td");
                if (j) {
                    td.className = "num";
                    td.innerHTML = v;
                } else {
                    td.textContent = v;
                }
                tr.appendChild(td);
            });
            body.appendChild(tr);
        });
    }

    function drawGbp() {
        const items = [
            ["Calls", sum(sliceRange(data.gbpCalls))],
            ["Directions", sum(sliceRange(data.directions))],
            ["Website visits", sum(sliceRange(data.siteClicks))]
        ];
        const list = document.getElementById("gbpList");
        list.replaceChildren();
        items.forEach(([label, v]) => {
            const li = document.createElement("li");
            const strong = document.createElement("strong");
            strong.textContent = fmt.format(v);
            const span = document.createElement("span");
            span.textContent = label;
            li.append(strong, span);
            list.appendChild(li);
        });
    }

    function drawPages() {
        const total = sum(sliceRange(data.clicks));
        const top = pages[0].share;
        const list = document.getElementById("pageBars");
        list.replaceChildren();
        pages.forEach(p => {
            const li = document.createElement("li");
            const path = document.createElement("span");
            path.className = "page-path";
            path.textContent = p.path;
            const val = document.createElement("span");
            val.className = "page-value";
            val.textContent = fmt.format(Math.round(total * p.share));
            const track = document.createElement("span");
            track.className = "page-track";
            const fill = document.createElement("span");
            fill.className = "page-fill";
            fill.style.width = (p.share / top * 100) + "%";
            fill.style.display = "block";
            track.appendChild(fill);
            li.append(path, val, track);
            list.appendChild(li);
        });
    }


    /* -------------------------------------------------
       RANGE + RENDER
    ------------------------------------------------- */

    function render() {
        hideTooltip();
        drawKpis();
        drawClicks();
        drawLeads();
        drawKeywords();
        drawGbp();
        drawPages();
    }

    document.querySelectorAll("[data-range]").forEach(button => {
        button.addEventListener("click", () => {
            range = Number(button.dataset.range);
            document.querySelectorAll("[data-range]").forEach(b =>
                b.setAttribute("aria-pressed", String(b === button)));
            render();
        });
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { drawClicks(); drawLeads(); }, 150);
    });

    window.addEventListener("scroll", hideTooltip, { passive: true });

    render();

})();
