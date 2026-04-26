#!/usr/bin/env node
// Playwright-based deterministic frame recorder.
//
// Walks tools/record/manifest.json, drives each animation frame-by-frame via
// the recorder shim, screenshots the #stage element, and pipes PNG bytes
// straight into ffmpeg for H.264 encoding.
//
// Usage:
//   npm run record                          # everything, defaults
//   npm run record -- --only=ch03           # filter by slug substring
//   npm run record -- --theme=dark          # one theme only
//   npm run record -- --fps=60 --duration=8
//   npm run record -- --workers=4
//   npm run record -- --no-vite             # use an already-running dev server
//
// Output: out/videos/<chXX-NN-slug>-<theme>[-<variant>].mp4

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import ffmpegPath from 'ffmpeg-static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const SHIM_SRC = fs.readFileSync(path.join(__dirname, 'recorder-shim.js'), 'utf8');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
const OUT_DIR = path.join(ROOT, 'out', 'videos');

// ---------- CLI parsing ----------
const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => {
      const [k, v] = a.replace(/^--/, '').split('=');
      return [k, v ?? true];
    })
);

const FPS       = Number(args.fps      ?? 30);
const DURATION  = Number(args.duration ?? 12);
const WIDTH     = Number(args.width    ?? 1920);
const HEIGHT    = Number(args.height   ?? 1080);
const WORKERS   = Number(args.workers  ?? 2);
const ONLY      = typeof args.only === 'string' ? args.only : null;
const THEMES    = (() => {
  const t = args.theme;
  if (!t || t === 'both' || t === true) return ['dark', 'light'];
  return [t];
})();
const NO_VITE   = args['no-vite'] === true;
const PORT      = Number(args.port ?? 5173);
const BASE_URL  = `http://localhost:${PORT}`;

// ---------- Build job list ----------
function chSlug(slug) {
  // ch01-overview/01-stack -> ch01-01-stack
  const [chDir, file] = slug.split('/');
  const chNum = chDir.match(/^ch(\d+)/)[1];
  return `ch${chNum}-${file}`;
}

const jobs = [];
for (const entry of MANIFEST) {
  if (ONLY && !entry.slug.includes(ONLY)) continue;
  const variants = entry.variants ?? [{ name: '', click: null }];
  for (const theme of THEMES) {
    for (const v of variants) {
      jobs.push({
        slug:     entry.slug,
        duration: entry.duration ?? DURATION,
        fps:      entry.fps      ?? FPS,
        theme,
        variantName: v.name || '',
        click:    v.click ?? null,
      });
    }
  }
}

if (jobs.length === 0) {
  console.error('No jobs match the filters.');
  process.exit(1);
}

// ---------- Vite server lifecycle ----------
async function waitForServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await new Promise((resolve) => {
      const req = http.get(url, (res) => { resolve(res.statusCode < 500); res.resume(); });
      req.on('error', () => resolve(false));
      req.setTimeout(1000, () => { req.destroy(); resolve(false); });
    });
    if (ok) return;
    await sleep(300);
  }
  throw new Error('Vite did not start in time at ' + url);
}

let viteProc = null;
async function startVite() {
  if (NO_VITE) {
    await waitForServer(BASE_URL).catch(e => {
      console.error('--no-vite was set but no server is reachable at', BASE_URL);
      throw e;
    });
    return;
  }
  console.log(`▶ starting vite on :${PORT}`);
  // shell:true so Windows resolves npx.cmd. cwd anchors the package.
  viteProc = spawn(
    'npx vite --port ' + PORT + ' --strictPort',
    { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'], shell: true }
  );
  await waitForServer(BASE_URL);
  console.log(`✓ vite ready`);
}
function stopVite() {
  if (!viteProc) return;
  // On Windows, kill() only signals the immediate child (cmd.exe). The
  // npx → node → vite grandchildren survive and keep port 5173 bound,
  // making the next run fail with `--strictPort`. Use taskkill /T to walk
  // the tree.
  try {
    if (process.platform === 'win32' && viteProc.pid) {
      spawn('taskkill', ['/PID', String(viteProc.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      viteProc.kill('SIGTERM');
    }
  } catch {}
  viteProc = null;
}

// ---------- Recording one job ----------
async function recordJob(browser, job) {
  const base = chSlug(job.slug);
  const outName = job.variantName
    ? `${base}-${job.theme}-${job.variantName}.mp4`
    : `${base}-${job.theme}.mp4`;
  const outFile = path.join(OUT_DIR, outName);

  const url = `${BASE_URL}/src/chapters/${job.slug}.html?theme=${job.theme}`;

  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    // Avoid scrollbars
    isMobile: false,
  });
  await context.addInitScript(SHIM_SRC);

  const page = await context.newPage();
  page.on('pageerror', (err) => console.error(`  [page error ${outName}]`, err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error(`  [console ${outName}]`, msg.text());
  });

  await page.goto(url, { waitUntil: 'load' });

  // Wait for the recorder shim and a canvas in #stage to exist.
  await page.waitForFunction(
    () => window.__recorder && document.querySelector('#stage canvas'),
    { timeout: 15_000 }
  );
  await page.evaluate((fps) => window.__recorder.setFps(fps), job.fps);

  // Optional click to set initial state. We dispatch the click WITHOUT
  // advancing the recorder clock — the click handler runs synchronously
  // (event listeners aren't gated by our rAF override) and writes its state
  // to module-level vars. The first recorded frame then sees that state.
  if (job.click) {
    try {
      await page.click(job.click, { timeout: 3000 });
    } catch (err) {
      throw new Error(`click("${job.click}") failed for ${job.slug}: ${err.message}`);
    }
    // Microtask flush so any Promise.then in the handler completes.
    await page.evaluate(() => Promise.resolve());
  }

  // Always step one priming frame so the loop's first rAF fires and the
  // scene reflects the click state before we screenshot frame 0.
  await page.evaluate(() => window.__recorder.step());

  const totalFrames = Math.ceil(job.duration * job.fps);

  // Spawn ffmpeg with stdin pipe.
  const ff = spawn(ffmpegPath, [
    '-y',
    '-loglevel', 'error',
    '-f', 'image2pipe',
    '-framerate', String(job.fps),
    '-i', '-',
    '-c:v', 'libx264',
    '-crf', '18',
    '-preset', 'medium',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    outFile,
  ], { stdio: ['pipe', 'ignore', 'pipe'] });
  let ffErr = '';
  ff.stderr.on('data', (d) => { ffErr += d.toString(); });

  const ffClosed = new Promise((resolve, reject) => {
    ff.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}: ${ffErr}`));
    });
    ff.on('error', reject);
  });

  const clip = { x: 0, y: 0, width: WIDTH, height: HEIGHT };
  const t0 = Date.now();

  for (let i = 0; i < totalFrames; i++) {
    await page.evaluate(() => window.__recorder.step());
    const buf = await page.screenshot({ type: 'png', clip });
    if (!ff.stdin.write(buf)) {
      await new Promise((res) => ff.stdin.once('drain', res));
    }
  }
  ff.stdin.end();

  await ffClosed;
  await context.close();

  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`  ✓ ${outName}  (${totalFrames}f, ${sec}s)`);
}

// ---------- Worker pool ----------
async function runPool(browser, jobs, concurrency) {
  let cursor = 0;
  const failures = [];
  const workers = Array.from({ length: concurrency }, async (_, w) => {
    while (true) {
      const idx = cursor++;
      if (idx >= jobs.length) return;
      const job = jobs[idx];
      const tag = `[w${w}] ${idx + 1}/${jobs.length} ${job.slug} ${job.theme}${job.variantName ? '/' + job.variantName : ''}`;
      console.log(tag);
      try {
        await recordJob(browser, job);
      } catch (err) {
        console.error(`  ✗ ${job.slug}/${job.theme}/${job.variantName}: ${err.message}`);
        failures.push({ job, err });
      }
    }
  });
  await Promise.all(workers);
  return failures;
}

// ---------- Main ----------
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  await startVite();

  const browser = await chromium.launch({
    args: [
      // Force a real GPU pipeline; without this, headless Chromium falls
      // back to SwiftShader and the WebGL render is significantly slower.
      '--use-gl=angle',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
    ],
  });

  console.log(`▶ ${jobs.length} clips, ${WORKERS} worker${WORKERS > 1 ? 's' : ''}, ${WIDTH}x${HEIGHT}@${FPS}fps default`);
  const started = Date.now();
  const failures = await runPool(browser, jobs, WORKERS);
  const elapsed = ((Date.now() - started) / 1000 / 60).toFixed(1);

  await browser.close();
  stopVite();

  if (failures.length) {
    console.error(`\n✗ ${failures.length}/${jobs.length} failed in ${elapsed} min`);
    process.exit(1);
  }
  console.log(`\n✓ ${jobs.length}/${jobs.length} done in ${elapsed} min → ${OUT_DIR}`);
  // Force exit: any lingering child handle (Playwright helper, Vite tree)
  // would otherwise keep the event loop alive and the npm wrapper hung.
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  stopVite();
  process.exit(1);
});
