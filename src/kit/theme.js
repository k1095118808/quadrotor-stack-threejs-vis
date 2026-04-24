// Single source of truth for all visual tokens.
//
// Two palettes ship: the original dark scene (default) and a bright "paper"
// variant on true white. Palette *slot names* (perception / planning / control
// / executed / obstacle / waypoint / grid / bg) are identical across modes, so
// chapter code reads `theme.colors.planning` etc. without knowing which mode
// is active. Only the resolved RGB values and HUD chrome shift.
//
// Mode resolution happens once at module-load time from, in order:
//   1. ?theme=light|dark URL query param  (useful for direct links)
//   2. localStorage['vis-theme']          (remembered across pages)
//   3. 'dark'                             (default)
// Switching modes via setThemeMode() persists to localStorage and reloads —
// materials are baked at scene construction, so a reload is the simplest way
// to re-skin everything consistently.

const darkColors = {
  bg:         0x07090d,
  grid:       0x1a3350,
  perception: 0x5dffb1, // green
  planning:   0x5dd3ff, // cyan
  control:    0xffb454, // amber
  executed:   0xff3366, // magenta — actual flown path / trail
  obstacle:   0x3a4354,
  waypoint:   0x5dd3ff,
};

// Light-mode semantic colors are darker, more saturated siblings of the dark
// palette — the dark neons wash out against white. Keep hue intact so the
// audience's color memory carries across modes.
const lightColors = {
  bg:         0xffffff,
  grid:       0xcdd5e0,
  perception: 0x00a061, // green
  planning:   0x0f87b8, // cyan
  control:    0xc57600, // amber
  executed:   0xd9124d, // magenta
  obstacle:   0x8a94a6,
  waypoint:   0x0f87b8,
};

const darkHud = {
  bg:     'rgba(7,9,13,0.75)',
  border: '0.5px solid rgba(255,255,255,0.15)',
  radius: '6px',
  pad:    '8px 12px',
};
const lightHud = {
  bg:     'rgba(255,255,255,0.85)',
  border: '0.5px solid rgba(0,0,0,0.12)',
  radius: '6px',
  pad:    '8px 12px',
};

const darkHudAccents = {
  green:   '#5dffb1',
  cyan:    '#5dd3ff',
  amber:   '#ffb454',
  magenta: '#ff3366',
  white:   '#e8ecf2',
};
// In light mode the `white` slot carries the neutral text color — here it is
// a near-black so HUD text reads on the light panel background.
const lightHudAccents = {
  green:   '#00a061',
  cyan:    '#0f87b8',
  amber:   '#c57600',
  magenta: '#d9124d',
  white:   '#1a2332',
};

const STORAGE_KEY = 'vis-theme';

function resolveMode() {
  if (typeof location !== 'undefined') {
    const q = new URLSearchParams(location.search).get('theme');
    if (q === 'light' || q === 'dark') return q;
  }
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* storage blocked — fall through */ }
  }
  return 'dark';
}

const MODE = resolveMode();
const isLight = MODE === 'light';

export const theme = {
  mode: MODE,
  colors: isLight ? lightColors : darkColors,
  fonts: {
    sans: '"Noto Sans SC", sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  hud: isLight ? lightHud : darkHud,
};

// Named HUD accent colors → CSS strings. Used by Hud.js and CameraRig UI bits.
export const hudAccents = isLight ? lightHudAccents : darkHudAccents;

// Helper: convert a hex int color to a CSS string (for DOM styling).
export function hexToCss(hex) {
  return '#' + hex.toString(16).padStart(6, '0');
}

export function getThemeMode() { return MODE; }

// Persist + reload. Scene materials are built from theme at construction time,
// so hot-swapping would need every chapter to walk its object tree; a reload
// is the cheap, reliable alternative.
export function setThemeMode(mode) {
  if (mode !== 'light' && mode !== 'dark') return;
  try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* storage blocked */ }
  const url = new URL(location.href);
  url.searchParams.delete('theme'); // stale override would fight localStorage
  location.replace(url.toString());
}

// Apply the resolved mode to the document root on import. Downstream CSS keys
// off [data-theme="light"]; the --stage-bg var drives any inline
// background color chapters still have on html/body.
if (typeof document !== 'undefined' && document.documentElement) {
  document.documentElement.dataset.theme = MODE;
  document.documentElement.style.setProperty('--stage-bg', hexToCss(theme.colors.bg));
}

// Mount a tiny circular button (bottom-right by default) that flips the mode.
// Chapters call this once from their setup. Styling lives in hud.css.
export function mountThemeToggle(host) {
  if (typeof document === 'undefined') return null;
  const parent = host || document.body;
  const btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-label', isLight ? '切换到暗色主题' : '切换到明亮主题');
  btn.title = isLight ? '切换到暗色主题' : '切换到明亮主题';
  btn.textContent = isLight ? '☾' : '☀'; // ☾ for "go dark", ☀ for "go light"
  btn.addEventListener('click', () => {
    setThemeMode(isLight ? 'dark' : 'light');
  });
  parent.appendChild(btn);
  return btn;
}
