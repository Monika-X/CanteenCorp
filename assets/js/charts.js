/* ============================================================
   CANTEENCORP — CHARTS JS
   Custom Canvas 2D charts (no external dependencies)
   ============================================================ */

'use strict';

const Charts = (() => {
  // ─── Color Palette ─────────────────────────────────────────
  const COLORS = {
    teal:       '#164E4A',
    tealLight:  '#1E6B65',
    copper:     '#B8794A',
    copperLight:'#D4956A',
    sage:       '#9CAF9A',
    champagne:  '#D6C29A',
    charcoal:   '#17191C',
    ivory:      '#F7F3EA',
    success:    '#22C55E',
    warning:    '#F59E0B',
    danger:     '#EF4444',
  };

  function getThemeColor(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }

  // ─── Utility: Rounded Rectangle ───────────────────────────
  function roundedRect(ctx, x, y, w, h, r) {
    if (h < 0) { y += h; h = -h; }
    if (h < r * 2) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ─── Bar Chart ─────────────────────────────────────────────
  function drawBar(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width  = rect.width * dpr;
      canvas.height = (data.height || 280) * dpr;
      canvas.style.width  = rect.width + 'px';
      canvas.style.height = (data.height || 280) + 'px';
      ctx.scale(dpr, dpr);
      render();
    }

    function render() {
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      const padding = { top: 20, right: 20, bottom: 40, left: 45 };
      const chartW = W - padding.left - padding.right;
      const chartH = H - padding.top - padding.bottom;

      ctx.clearRect(0, 0, W, H);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const textColor = isDark ? '#C8C2B4' : '#7A8089';
      const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

      const maxVal = Math.max(...data.datasets.flatMap(d => d.values), 0) * 1.15 || 100;
      const labels = data.labels || [];
      const barGroupW = chartW / labels.length;
      const datasetCount = data.datasets.length;
      const barW = Math.min((barGroupW / datasetCount) * 0.7, 40);

      // Grid lines
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      [0, 0.25, 0.5, 0.75, 1].forEach(frac => {
        const y = padding.top + chartH * (1 - frac);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(W - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.font = `400 11px Manrope, sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxVal * frac), padding.left - 8, y + 4);
      });

      // Bars
      data.datasets.forEach((dataset, di) => {
        const color = dataset.color || Object.values(COLORS)[di % 6];
        dataset.values.forEach((val, i) => {
          const barH = (val / maxVal) * chartH;
          const groupX = padding.left + i * barGroupW;
          const offsetX = (barGroupW - datasetCount * barW) / 2 + di * barW;
          const x = groupX + offsetX;
          const y = padding.top + chartH - barH;

          // Gradient fill
          const grad = ctx.createLinearGradient(x, y, x, y + barH);
          grad.addColorStop(0, color);
          grad.addColorStop(1, color + '55');
          ctx.fillStyle = grad;
          roundedRect(ctx, x, y, barW, barH, 4);
          ctx.fill();
        });
      });

      // X Labels
      ctx.fillStyle = textColor;
      ctx.font = `500 11px Manrope, sans-serif`;
      ctx.textAlign = 'center';
      labels.forEach((label, i) => {
        const x = padding.left + i * barGroupW + barGroupW / 2;
        ctx.fillText(label, x, H - 10);
      });
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    // Animate bars
    let progress = 0;
    function animate() {
      if (progress >= 1) return;
      progress = Math.min(progress + 0.04, 1);
      render();
      requestAnimationFrame(animate);
    }
    animate();

    return { render };
  }

  // ─── Line Chart ────────────────────────────────────────────
  function drawLine(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width  = rect.width * dpr;
      canvas.height = (data.height || 260) * dpr;
      canvas.style.width  = rect.width + 'px';
      canvas.style.height = (data.height || 260) + 'px';
      ctx.scale(dpr, dpr);
      render(1);
    }

    function render(p = 1) {
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      const pad = { top: 20, right: 20, bottom: 36, left: 45 };
      const cW = W - pad.left - pad.right;
      const cH = H - pad.top - pad.bottom;

      ctx.clearRect(0, 0, W, H);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const textColor = isDark ? '#C8C2B4' : '#7A8089';
      const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

      const allVals = data.datasets.flatMap(d => d.values);
      const maxVal = Math.max(...allVals, 0) * 1.15 || 100;
      const labels = data.labels || [];
      const n = labels.length;

      // Grid
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      [0, 0.25, 0.5, 0.75, 1].forEach(frac => {
        const y = pad.top + cH * (1 - frac);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(W - pad.right, y);
        ctx.stroke();
        ctx.fillStyle = textColor;
        ctx.font = '400 11px Manrope, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxVal * frac), pad.left - 8, y + 4);
      });

      data.datasets.forEach(dataset => {
        const color = dataset.color || COLORS.teal;
        const pts = dataset.values.map((val, i) => ({
          x: pad.left + (i / (n - 1)) * cW,
          y: pad.top + (1 - val / maxVal) * cH
        }));
        const visiblePts = pts.slice(0, Math.ceil(pts.length * p));

        // Area fill
        if (visiblePts.length > 1) {
          const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
          grad.addColorStop(0, color + '30');
          grad.addColorStop(1, color + '00');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(visiblePts[0].x, H - pad.bottom);
          visiblePts.forEach(pt => ctx.lineTo(pt.x, pt.y));
          ctx.lineTo(visiblePts[visiblePts.length - 1].x, H - pad.bottom);
          ctx.closePath();
          ctx.fill();
        }

        // Line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        visiblePts.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
        ctx.stroke();

        // Dots
        visiblePts.forEach(pt => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = isDark ? '#1E2127' : '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      });

      // X Labels
      ctx.fillStyle = textColor;
      ctx.font = '500 11px Manrope, sans-serif';
      ctx.textAlign = 'center';
      labels.forEach((label, i) => {
        const x = pad.left + (i / (n - 1)) * cW;
        ctx.fillText(label, x, H - 8);
      });
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    let progress = 0;
    function animate() {
      if (progress >= 1) return;
      progress = Math.min(progress + 0.05, 1);
      render(progress);
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ─── Donut Chart ───────────────────────────────────────────
  function drawDonut(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = data.size || 200;

    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 10;
    const innerR = outerR * 0.65;
    const total = data.segments.reduce((s, seg) => s + seg.value, 0);

    let startAngle = -Math.PI / 2;
    let progress = 0;

    function render(p) {
      ctx.clearRect(0, 0, size, size);

      let sa = -Math.PI / 2;
      data.segments.forEach(seg => {
        const angle = (seg.value / total) * Math.PI * 2 * p;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, outerR, sa, sa + angle);
        ctx.arc(cx, cy, innerR, sa + angle, sa, true);
        ctx.closePath();
        ctx.fillStyle = seg.color || COLORS.teal;
        ctx.fill();
        sa += angle;
      });
    }

    function animate() {
      if (progress >= 1) return;
      progress = Math.min(progress + 0.04, 1);
      render(progress);
      requestAnimationFrame(animate);
    }
    animate();

    return { render };
  }

  // ─── Horizontal Bar ────────────────────────────────────────
  function drawHBar(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const H = data.items.length * 44 + 20;
      canvas.width  = rect.width * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = rect.width + 'px';
      canvas.style.height = H + 'px';
      ctx.scale(dpr, dpr);
      render(1);
    }

    function render(p) {
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      ctx.clearRect(0, 0, W, H);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const textColor = isDark ? '#C8C2B4' : '#3D4148';
      const maxVal = Math.max(...data.items.map(i => i.value));
      const labelW = 120;
      const barAreaW = W - labelW - 60;

      data.items.forEach((item, i) => {
        const y = i * 44 + 10;
        const barW = (item.value / maxVal) * barAreaW * p;
        const color = item.color || COLORS.teal;

        // Label
        ctx.fillStyle = textColor;
        ctx.font = '500 12px Manrope, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(item.label, 0, y + 16);

        // Bar bg
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
        roundedRect(ctx, labelW, y + 6, barAreaW, 18, 4);
        ctx.fill();

        // Bar fill
        const grad = ctx.createLinearGradient(labelW, 0, labelW + barW, 0);
        grad.addColorStop(0, color);
        grad.addColorStop(1, color + 'AA');
        ctx.fillStyle = grad;
        roundedRect(ctx, labelW, y + 6, barW, 18, 4);
        ctx.fill();

        // Value
        ctx.fillStyle = textColor;
        ctx.textAlign = 'right';
        ctx.font = '600 12px Manrope, sans-serif';
        ctx.fillText(item.value + (data.suffix || ''), W, y + 16);
      });
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    let progress = 0;
    function animate() {
      if (progress >= 1) return;
      progress = Math.min(progress + 0.05, 1);
      render(progress);
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ─── Init All Charts on Page ──────────────────────────────
  function initAll() {
    document.querySelectorAll('[data-chart]').forEach(canvas => {
      const type = canvas.dataset.chart;
      const dataStr = canvas.dataset.chartData;
      if (!dataStr) return;
      try {
        const data = JSON.parse(dataStr);
        if (type === 'bar')    drawBar(canvas.id, data);
        if (type === 'line')   drawLine(canvas.id, data);
        if (type === 'donut')  drawDonut(canvas.id, data);
        if (type === 'hbar')   drawHBar(canvas.id, data);
      } catch(e) {
        console.warn('Chart data parse error:', e);
      }
    });
  }

  return { drawBar, drawLine, drawDonut, drawHBar, initAll };
})();

document.addEventListener('DOMContentLoaded', Charts.initAll);
window.CanteenCharts = Charts;
