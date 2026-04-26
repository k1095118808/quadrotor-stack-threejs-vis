# Recording animations to video

Deterministic frame-by-frame capture of every animation in `src/chapters/`.
The recorder overrides `performance.now`, `Date.now`, and `requestAnimationFrame`
inside the page so each "frame" advances the clock by exactly `1/fps` seconds —
output is reproducible and unaffected by host CPU load. The full `#stage` is
screenshotted, so HUD panels and projected DOM labels are captured along with
the canvas.

## One-time setup

```bash
npm install
npx playwright install chromium
```

`ffmpeg` ships bundled via `ffmpeg-static` — no system install needed.

## Run

```bash
npm run record                        # everything (defaults below)
npm run record -- --only=ch03         # only slugs containing "ch03"
npm run record -- --theme=dark        # one theme only
npm run record -- --workers=4         # more parallelism
npm run record -- --fps=60            # smoother output, ~2× wall time
npm run record -- --duration=8        # shorter clips
npm run record -- --width=1280 --height=720
npm run record -- --no-vite           # use a dev server you've already started
```

Defaults: 30 fps, 12 s, 1920×1080, both themes, 2 workers.

Output lands in `out/videos/<chXX-NN-slug>-<theme>[-<variant>].mp4`. The driver
auto-starts Vite on port 5173, walks the manifest, and shuts the server down
when finished.

## Manifest

`tools/record/manifest.json` lists every animation. Per-entry overrides:

| field      | type     | default | meaning                                      |
|------------|----------|---------|----------------------------------------------|
| `slug`     | string   | —       | Path under `src/chapters/`, no `.html`       |
| `duration` | number   | 12      | Clip length in seconds                       |
| `fps`      | number   | 30      | Frames per second                            |
| `variants` | array    | one     | `{ name, click }` — emit one clip per entry  |

If `variants` is set, each entry produces its own clip; `click` is a CSS
selector clicked once *before* recording starts (state-setting, not stitched
playback). Omit `click` for the default state.

## Architecture

- `recorder-shim.js` — installed via `addInitScript` before any page code.
  Replaces the time/rAF APIs with versions backed by a fake clock; exposes
  `window.__recorder.{ setFps, step, now, queueLength }`.
- `record.mjs` — Playwright driver. Spawns Vite, launches Chromium with GPU
  acceleration (`--use-gl=angle`), opens each animation, calls
  `__recorder.step()` 360× for a 12 s/30 fps clip, screenshots `#stage`
  each tick, and pipes PNG bytes straight into a single ffmpeg process per
  clip (H.264, CRF 18, faststart).
- `manifest.json` — what to record.

## Performance notes

- Per-frame cost is dominated by Playwright's `page.screenshot()` over CDP
  (~50–80 ms at 1080p). The render itself is ~10–25 ms.
- `--workers=4` is roughly 3× faster than `--workers=1` on a desktop with a
  discrete GPU. Above 4 workers, GPU contention starts to dominate.
- For a quick visual sanity check, prefer `--only=<slug> --theme=dark`.
