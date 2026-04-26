# Deployment guide

The deck is a vanilla Vite static site — no server, no API, no auth. Any
static host (GitHub Pages, Cloudflare Pages, Vercel, Netlify, an S3 bucket
behind CloudFront, an Nginx box) will serve it. This guide covers the
prerequisites you must do once, the build command, and the per-platform
recipes.

## 1. Preflight (already applied)

The repository is already configured for static deployment as of commit
where `vite.config.js` learned to glob every chapter HTML into the build
inputs and the light-theme logo moved to `public/assets/logo1.png`. The
loader in `src/kit/Environment.js` reads it via
`import.meta.env.BASE_URL + 'assets/logo1.png'`, so the same code works
both at the apex (`/`) and at a sub-path (`/repo-name/`) without further
edits.

If you ever add a new chapter, drop the HTML under `src/chapters/<chN>/`
— the glob picks it up automatically. If you ever reference a static
asset from JavaScript via a runtime string, put the file in `public/`
and read it as `import.meta.env.BASE_URL + 'subpath/file.ext'`.

## 2. Build and preview locally

```bash
npm install
npm run build      # output goes to dist/
npm run preview    # serves dist/ at http://localhost:4173 — verify before pushing
```

Click through every chapter card from `dist/` via `npm run preview`.
Particularly worth checking: light-theme floor watermark loads (logo
asset), no 404s in DevTools console, every chapter HTML resolves.

## 3. Per-platform recipes

### 3a. GitHub Pages (project pages)

Project pages serve at `https://<user>.github.io/<repo>/`, so the bundle
must be built with `base: '/<repo>/'`.

Add `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: VITE_BASE=/${{ github.event.repository.name }}/ npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - id: deploy
        uses: actions/deploy-pages@v4
```

Then in the repo: **Settings → Pages → Build and deployment → Source =
GitHub Actions**. Push to `main` and the workflow publishes.

If you map a custom domain (CNAME), set `VITE_BASE=/` and add a `CNAME`
file in `public/`.

### 3b. Cloudflare Pages

Connect the repo via the Cloudflare dashboard, set:

- **Build command:** `npm run build`
- **Build output:** `dist`
- **Environment variable:** `NODE_VERSION = 20`

That's it — no `base` change needed (Pages serves from the apex).
Cloudflare's CDN compresses Three.js (≈600 KB) to ~150 KB gzip, and
geo-distributes the static bundle.

### 3c. Vercel

```bash
npm i -g vercel
vercel --prod
```

The Vite preset is auto-detected. Or add a `vercel.json` if you want it
explicit:

```json
{ "buildCommand": "npm run build", "outputDirectory": "dist" }
```

### 3d. Netlify

`netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

Push the repo, point Netlify at it, done.

### 3e. Plain S3 / Nginx / any static host

```bash
npm run build
# upload dist/* to your origin
# ensure index.html is the directory index, .js served as application/javascript
# set Cache-Control: public, max-age=31536000, immutable on hashed assets
# set Cache-Control: public, max-age=0, must-revalidate on *.html
```

Vite emits per-asset content hashes, so HTML (no hash) should be
near-realtime while JS/CSS (hashed) can cache forever.

## 4. Deploying the videos (optional)

`out/videos/` is gitignored — if you want the recorded MP4s to ship with
the deck:

1. Drop the files you want to publish into `public/videos/`. Anything in
   `public/` is copied verbatim into `dist/`.
2. Reference them as `${import.meta.env.BASE_URL}videos/<file>.mp4`.

Be aware of size: a single 1080p/30 fps/12 s clip is ~2.5 MB; the full
54-clip set is ~135 MB. GitHub Pages enforces a 1 GB site limit and
~100 MB per file. Cloudflare Pages and Netlify are more generous (25–25
MB free-tier soft caps with bandwidth billing). For larger video archives,
host them on R2/S3 + CDN and link out.

## 5. Smoke test after deployment

Hit these URLs from a fresh browser session:

- `/` — gallery loads, all 19 cards visible, ☾/☀ toggle works.
- `/src/kit-demo.html` (or `/<base>/src/kit-demo.html`) — kit acceptance scene.
- One animation per chapter — pick `ch01-overview/01-stack`,
  `ch03-control/02-pid-step`, `ch07-swarm/01-reynolds`.
- `?theme=light` on any chapter — verify the watermark and logo clouds
  appear (this is the asset path that breaks if §1b was skipped).

DevTools Network tab should show zero 4xx/5xx. If you see a 404 on
`logo1.png`, redo §1b. If a chapter HTML 404s, redo §1a.

## 6. Updating

Push to `main`. The CI workflow rebuilds and republishes; static-only
sites have no migration story. Cache headers ensure clients pick up new
HTML on next load and lazily fetch the new hashed JS/CSS.
