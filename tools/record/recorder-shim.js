// Deterministic clock + rAF override for Playwright recording.
//
// Installed via `context.addInitScript()` so it runs BEFORE any module-level
// page code captures `performance.now()` or registers an animation callback.
//
// What it does:
//   - Replaces `performance.now`, `Date.now`, `requestAnimationFrame`, and
//     `cancelAnimationFrame` with versions backed by a fake clock.
//   - The fake clock starts at the real `performance.now()` value at install
//     time (so initial reads stay continuous with the real one) and only
//     advances when `window.__recorder.step()` is called.
//   - Every `step()` advances the clock by exactly `1000 / fps` ms and drains
//     all currently-queued rAF callbacks. New callbacks scheduled inside
//     those callbacks run on the NEXT step — preserves frame semantics.
//
// Why we override Date.now too: a couple of animations sample `Date.now()`
// instead of `performance.now()`. Anchoring it to the fake clock keeps both
// time sources monotonic and consistent.

(function installRecorderShim() {
  if (window.__recorder) return; // idempotent

  const realPerfNow = performance.now.bind(performance);
  const realDateNow = Date.now;

  const installedAt = realPerfNow();
  let fakeNow = installedAt;
  let frameMs = 1000 / 30;

  const dateAnchor = realDateNow();
  const perfAnchor = installedAt;

  // rAF queue. We don't share IDs with real rAF since we replace it entirely.
  let nextHandle = 1;
  const callbacks = new Map(); // handle -> fn
  let queue = [];              // ordered handles to run on next step

  performance.now = () => fakeNow;
  Date.now = () => Math.floor(dateAnchor + (fakeNow - perfAnchor));

  window.requestAnimationFrame = (fn) => {
    const h = nextHandle++;
    callbacks.set(h, fn);
    queue.push(h);
    return h;
  };
  window.cancelAnimationFrame = (h) => {
    callbacks.delete(h);
  };

  window.__recorder = {
    setFps(fps) {
      frameMs = 1000 / fps;
    },
    // Advance one frame: bump the clock, drain the rAF queue.
    // Callbacks that schedule new rAFs see them queued for the next step.
    step() {
      fakeNow += frameMs;
      const drain = queue;
      queue = [];
      for (const h of drain) {
        const fn = callbacks.get(h);
        if (!fn) continue;
        callbacks.delete(h);
        try {
          fn(fakeNow);
        } catch (err) {
          console.error('[recorder] rAF callback threw:', err);
        }
      }
    },
    now() { return fakeNow; },
    queueLength() { return queue.length; },
    // Diagnostic: did the page register any rAF? If still 0 after page load,
    // the animation file isn't using rAF or the shim was installed too late.
    pendingFrames() { return queue.length; },
  };
})();
