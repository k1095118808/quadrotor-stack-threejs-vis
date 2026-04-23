// Single source of truth for all visual tokens.
// Frozen after Phase 0 — do not change without a palette-level review.

export const theme = {
  colors: {
    bg:         0x07090d,
    grid:       0x1a3350,
    perception: 0x5dffb1, // green
    planning:   0x5dd3ff, // cyan
    control:    0xffb454, // amber
    executed:   0xff3366, // magenta — actual flown path / trail
    obstacle:   0x3a4354,
    waypoint:   0x5dd3ff,
  },
  fonts: {
    sans: '"Noto Sans SC", sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  hud: {
    bg:     'rgba(7,9,13,0.75)',
    border: '0.5px solid rgba(255,255,255,0.15)',
    radius: '6px',
    pad:    '8px 12px',
  },
};

// Named HUD accent colors → CSS strings. Used by Hud.js and CameraRig UI bits.
// Kept here so every HUD color in the deck resolves through theme.js.
export const hudAccents = {
  green:   '#5dffb1',
  cyan:    '#5dd3ff',
  amber:   '#ffb454',
  magenta: '#ff3366',
  white:   '#e8ecf2',
};

// Helper: convert a hex int color to a CSS string (for DOM styling).
export function hexToCss(hex) {
  return '#' + hex.toString(16).padStart(6, '0');
}
