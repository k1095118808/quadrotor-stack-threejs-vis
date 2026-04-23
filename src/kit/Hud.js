import { hudAccents } from './theme.js';

// HUD panels are DOM elements, not Three.js objects. Append the returned .el
// to the stage container. All color values resolve through theme.hudAccents so
// nothing outside theme.js ever hard-codes a hex for the HUD.

// createPanel({ title, corner, color, items })
// items: [{ label, value, unit, key? }] — label is the Chinese string shown on
// the left; key is an optional stable identifier used by setValue(). When key
// is absent, label doubles as the key.
// Returns { el, setValue(key, value), dispose() }.
export function createPanel({
  title,
  corner = 'tl',
  color = 'white',
  items = [],
} = {}) {
  const accent = hudAccents[color] || hudAccents.white;

  const el = document.createElement('div');
  el.className = `hud-panel hud-corner-${corner}`;
  el.style.setProperty('--hud-accent', accent);

  if (title) {
    const titleEl = document.createElement('div');
    titleEl.className = 'hud-title';
    titleEl.textContent = title;
    el.appendChild(titleEl);
  }

  const valueNodes = new Map(); // key -> span.hud-value

  for (const item of items) {
    const row = document.createElement('div');
    row.className = 'hud-row';

    const labelEl = document.createElement('span');
    labelEl.className = 'hud-label';
    labelEl.textContent = item.label;

    const valueWrap = document.createElement('span');
    const valueEl = document.createElement('span');
    valueEl.className = 'hud-value';
    valueEl.textContent = String(item.value ?? '');
    valueWrap.appendChild(valueEl);

    if (item.unit) {
      const unitEl = document.createElement('span');
      unitEl.className = 'hud-unit';
      unitEl.textContent = item.unit;
      valueWrap.appendChild(unitEl);
    }

    row.appendChild(labelEl);
    row.appendChild(valueWrap);
    el.appendChild(row);

    const key = item.key ?? item.label;
    valueNodes.set(key, valueEl);
  }

  function setValue(key, value) {
    const node = valueNodes.get(key);
    if (node) node.textContent = String(value);
  }

  function dispose() {
    el.remove();
    valueNodes.clear();
  }

  return { el, setValue, dispose };
}

// createChart({ corner, title, yRange, color })
// Small scrolling sparkline on a <canvas>. push(v) writes into a ring buffer
// and repaints. yRange = [min, max] — values outside clamp to the edges.
// Returns { el, push(value), dispose() }.
export function createChart({
  corner = 'br',
  title,
  yRange = [0, 1],
  color = 'magenta',
  width = 220,
  height = 70,
  capacity = 240,
} = {}) {
  const accent = hudAccents[color] || hudAccents.magenta;

  const el = document.createElement('div');
  el.className = `hud-chart hud-corner-${corner}`;
  el.style.setProperty('--hud-accent', accent);

  if (title) {
    const titleEl = document.createElement('div');
    titleEl.className = 'hud-chart-title';
    titleEl.textContent = title;
    el.appendChild(titleEl);
  }

  const canvas = document.createElement('canvas');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  el.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const data = new Float32Array(capacity);
  let count = 0;

  function push(v) {
    data[count % capacity] = v;
    count++;
    render();
  }

  function render() {
    const [lo, hi] = yRange;
    const span = Math.max(1e-6, hi - lo);

    ctx.clearRect(0, 0, width, height);

    // Baseline grid at midpoint.
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    if (count === 0) return;

    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.25;
    ctx.beginPath();

    const n = Math.min(count, capacity);
    const start = count > capacity ? count - capacity : 0;
    for (let i = 0; i < n; i++) {
      const idx = (start + i) % capacity;
      const v = data[idx];
      const x = (i / Math.max(1, n - 1)) * width;
      const yNorm = clamp((v - lo) / span, 0, 1);
      const y = height - yNorm * height;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function dispose() {
    el.remove();
  }

  render();
  return { el, push, dispose };
}

function clamp(x, lo, hi) { return x < lo ? lo : x > hi ? hi : x; }
