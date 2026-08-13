// Page backdrop — the share card's `contour` + `aurora` presets, ported.
//
// This is NOT a new piece of art. metaflux-web already solved this problem for
// the PnL share card (metaflux-web/src/lib/shareCard.ts), and the constraint
// there is the same one this page has: a composition that sits on the RIGHT
// because the LEFT half carries the type, veiled back down before any words go
// over it. So the geometry, the pass structure, the ring parameters, the ribbon
// table, the deterministic hash and the grain tile are all carried across as
// they are, and only three things change:
//
//   1. Colour. The card paints from `dir` (the trade's rise/fall colour) and
//      `accentSoft` (--color-accent-300). A landing page has no direction, so
//      `dir` becomes the rose voice and `accentSoft` stays accent-300 — the same
//      two-voice relationship, in the palette this page actually has. Both come
//      out of CSS custom properties, so the field re-inks if the palette moves.
//   2. Frame. The card is a fixed 1200x630. Here the same card-space composition
//      is scaled to cover the viewport, anchored so its focal point lands in the
//      empty right of the fold at any aspect.
//   3. Weight. WEIGHT below is under 1. A share card is looked at for a second;
//      this sits under body copy for minutes, and PRODUCT.md's fifth principle
//      is that spectacle reads as compensation.
//
// The card is static. This is not, and the difference is the whole architecture
// below: a full repaint of this field measures ~210ms at 2880x1800, so animating
// it by re-running the paint would run at five frames a second. Instead it is cut
// into three surfaces by how often each one actually changes:
//
//   base    washes + contour rings + motes   — the ground. Painted once per
//                                              viewport size. It does not move.
//   sky     the aurora ribbons and their rays — the only thing that moves, and
//                                              the only thing repainted per frame.
//   veil    the legibility veil + grain      — painted once, composited last.
//
// `sky` also renders at a THIRD of the display resolution and is scaled up on
// composite. It is soft low-frequency light with no edge finer than a ribbon, so
// the resample is invisible, and it cuts the per-frame rasterisation by ~9x. A
// frame is then three blits plus one low-res vector pass.
//
// The drift itself is slow enough that you never catch it moving — PRODUCT.md's
// anti-references rule out motion for its own sake, so the ribbons breathe on a
// ~50s cycle and nothing else in the field moves at all.

(() => {
  const cv = document.querySelector('.page-backdrop');
  if (!cv || !cv.getContext) return;

  // Card space. Every constant below is in these units, as in shareCard.ts.
  const W = 1200;
  const H = 630;
  const FIELD_X = W * 0.76;
  const FIELD_Y = H * 0.5;
  // Strength of the whole field, multiplying every wash, ring and ribbon alpha.
  // 0.62 was tuned when the ground was a mid-tone paper that swallowed it. On
  // pure white nothing is swallowed: at that weight the rose washes read as a
  // pink cloud competing with the headline. 0.26 keeps the blue → rose sweep
  // present as the paper's own breathing and lets the type win.
  const WEIGHT = 0.26;

  /** Deterministic 0…1 from an integer. `Math.random` would repaint differently
   *  on every resize, which on a background reads as the page flickering. */
  const hash = (n) => {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  /** Any token colour → the same colour at `a`. Handles #rgb, #rrggbb and rgb(). */
  const alpha = (color, a) => {
    const hex = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
      let h = hex[1];
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      const n = parseInt(h, 16);
      return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
    }
    const rgb = color.match(/(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)/);
    return rgb ? `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${a})` : color;
  };

  /** One soft radial light. */
  const wash = (ctx, x, y, r, color, a) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, alpha(color, a * WEIGHT));
    g.addColorStop(0.55, alpha(color, a * WEIGHT * 0.42));
    g.addColorStop(1, alpha(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };

  /** One closed contour, sampled from a wobbling radius. True concentric circles
   *  would read as a target, which is a louder and much more literal idea. */
  const wobbleRing = (ctx, cx, cy, radius, wobble, phase) => {
    const STEPS = 120;
    for (let i = 0; i <= STEPS; i++) {
      const th = (i / STEPS) * Math.PI * 2;
      const r =
        radius *
        (1 + wobble * Math.sin(3 * th + phase) + wobble * 0.55 * Math.sin(5 * th - phase * 1.7));
      const x = cx + r * Math.cos(th) * 1.06;
      const y = cy + r * Math.sin(th) * 0.92 - radius * 0.06 * Math.cos(th);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  /** `contour` — a topographic bloom. Each ring is a little more distorted and a
   *  little more turned than the last, so the field drifts instead of repeating. */
  const contour = (ctx, ink, soft) => {
    wash(ctx, FIELD_X, FIELD_Y - 40, 470, ink, 0.24);
    wash(ctx, W * 0.96, H * 0.92, 380, soft, 0.16);
    wash(ctx, W * 0.56, H * 0.06, 300, soft, 0.1);

    ctx.lineJoin = 'round';
    const RINGS = 16;
    for (let i = 0; i < RINGS; i++) {
      const k = i / (RINGS - 1);
      // Fade at both ends: the innermost ring shouldn't read as a bullseye and
      // the outermost shouldn't collide with the edge.
      const fade = Math.sin(Math.PI * (0.16 + 0.84 * k));
      ctx.strokeStyle = alpha(ink, 0.5 * fade * WEIGHT);
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      wobbleRing(ctx, FIELD_X, FIELD_Y, 44 + k * 310, 0.1 + k * 0.1, k * 1.9);
      ctx.stroke();
    }
  };

  const RIBBON_X0 = W * 0.16;
  const RIBBON_X1 = W * 1.16;

  /** One side of a ribbon. The half-thickness tapers to a point at both ends,
   *  which is what stops it reading as a stripe. */
  const ribbonEdge = (ctx, r, from, to, spread, sign) => {
    const step = from < to ? 12 : -12;
    const span = RIBBON_X1 - RIBBON_X0;
    for (let x = from; step > 0 ? x <= to : x >= to; x += step) {
      const t = (x - RIBBON_X0) / span;
      const y = H * r.y + Math.sin(t * r.freq * Math.PI + r.phase) * r.amp;
      const half = ((r.thick * spread) / 2) * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, t)));
      const py = y + sign * half;
      if (x === from && sign === -1) ctx.moveTo(x, py);
      else ctx.lineTo(x, py);
    }
  };

  /** Vertical rays through one curtain. Spacing and height come off `hash()`, so
   *  no two ribbons comb the same way and none reads as a ruled grid — that
   *  evenness is exactly what gives a generated field away. */
  const curtainRays = (ctx, r, seed, hue) => {
    const span = RIBBON_X1 - RIBBON_X0;
    ctx.lineCap = 'round';
    for (let i = 0; i * 11 < span; i++) {
      const j = hash(seed * 977 + i);
      const x = RIBBON_X0 + i * 11 + j * 7;
      const t = (x - RIBBON_X0) / span;
      // A ray where the sheet is still transparent is a scratch, not a ray.
      const reach = Math.sin(Math.PI * Math.min(1, t)) * (0.45 + 0.55 * hash(seed * 31 + i * 7));
      if (reach < 0.2) continue;
      const mid = H * r.y + Math.sin(t * r.freq * Math.PI + r.phase) * r.amp;
      const half = (r.thick / 2) * 1.5;
      // The ribbon's OWN hue, denser — a white ray would be a literal colour and
      // would vanish on the light grounds this system defaults to.
      const g = ctx.createLinearGradient(0, mid - half, 0, mid + half);
      g.addColorStop(0, alpha(hue, 0));
      g.addColorStop(0.45, alpha(hue, 0.1 * reach));
      g.addColorStop(1, alpha(hue, 0.3 * reach));
      ctx.strokeStyle = g;
      ctx.lineWidth = 0.8 + hash(seed * 13 + i) * 1.6;
      ctx.beginPath();
      ctx.moveTo(x, mid - half * reach);
      ctx.lineTo(x, mid + half * reach);
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
  };

  /** The star field the curtains hang in front of. What reads as "night sky" is
   *  the DENSITY, not any one star. */
  const motes = (ctx, ink, soft) => {
    for (let i = 0; i < 150; i++) {
      const x = W * (0.34 + 0.68 * hash(i * 3 + 1));
      const y = H * hash(i * 7 + 2);
      const big = hash(i * 17 + 5) > 0.86;
      const r = big ? 1.6 + hash(i * 11 + 3) * 1.6 : 0.5 + hash(i * 11 + 3) * 0.9;
      const a = (big ? 0.34 : 0.12) + hash(i * 5 + 4) * 0.26;
      ctx.fillStyle = alpha(i % 3 === 0 ? soft : ink, a * WEIGHT);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  /** `aurora` — luminous curtains raked across the field. FILLED bands between
   *  two offset sine curves, not stroked paths: a ribbon has a defined core and
   *  a tapered end, and that silhouette is the whole difference. Four passes plus
   *  a core rather than a blur filter, which costs a full-surface repaint. */
  const aurora = (ctx, ink, soft, t) => {
    // The two washes and the motes that used to open this function moved to the
    // ground: they do not drift, and re-painting them every frame would both cost
    // and — for the motes — make the stars swim with the curtains they are meant
    // to hang behind.

    // The card's table, with the phase advanced by time. Each ribbon drifts at
    // its own rate — a shared one makes the whole sky slide sideways as a sheet,
    // which is a banner scrolling, not a curtain moving. `y` bobs by a couple of
    // px on a slower cycle again, so the stack breathes rather than shears.
    const RIBBONS = [
      { y: 0.16, amp: 44, thick: 54, hue: soft, a: 0.18, phase: 2.2, freq: 3.4, rate: 0.129, bob: 5 },
      { y: 0.3, amp: 52, thick: 92, hue: ink, a: 0.32, phase: 0, freq: 2.6, rate: 0.097, bob: 7 },
      { y: 0.52, amp: 70, thick: 140, hue: soft, a: 0.24, phase: 1.4, freq: 2.1, rate: 0.074, bob: 9 },
      { y: 0.72, amp: 44, thick: 76, hue: ink, a: 0.22, phase: 2.7, freq: 3.1, rate: 0.113, bob: 6 },
      { y: 0.88, amp: 32, thick: 48, hue: ink, a: 0.14, phase: 4.1, freq: 3.8, rate: 0.143, bob: 4 }
    ].map((r) => ({
      ...r,
      phase: r.phase + t * r.rate,
      y: r.y + (Math.sin(t * r.rate * 0.55 + r.phase) * r.bob) / H
    }));

    ctx.save();
    // Rake the field, so the ribbons cut across it rather than sit level on it.
    ctx.translate(W / 2, H / 2);
    ctx.rotate((-19 * Math.PI) / 180);
    ctx.translate(-W / 2, -H / 2);

    RIBBONS.forEach((r, i) => {
      const g = ctx.createLinearGradient(RIBBON_X0, 0, RIBBON_X1, 0);
      g.addColorStop(0, alpha(r.hue, 0));
      g.addColorStop(0.3, alpha(r.hue, r.a * WEIGHT));
      g.addColorStop(0.72, alpha(r.hue, r.a * WEIGHT * 0.85));
      g.addColorStop(1, alpha(r.hue, 0));

      // Halo → shoulder → sheet → CORE. The last pass is a thin bright band down
      // the middle: an aurora is brightest along a narrow line inside the curtain,
      // and without it these are smooth hills with an outline.
      for (const [spread, weight] of [
        [2.6, 0.12],
        [1.9, 0.22],
        [1.35, 0.38],
        [1, 0.85],
        [0.42, 1]
      ]) {
        ctx.globalAlpha = weight;
        ctx.fillStyle = g;
        ctx.beginPath();
        ribbonEdge(ctx, r, RIBBON_X0, RIBBON_X1, spread, -1);
        ribbonEdge(ctx, r, RIBBON_X1, RIBBON_X0, spread, 1);
        ctx.closePath();
        ctx.fill();
      }

      // The rays, inside the ribbon only.
      ctx.save();
      ctx.beginPath();
      ribbonEdge(ctx, r, RIBBON_X0, RIBBON_X1, 1.2, -1);
      ribbonEdge(ctx, r, RIBBON_X1, RIBBON_X0, 1.2, 1);
      ctx.closePath();
      ctx.clip();
      curtainRays(ctx, r, i, r.hue);
      ctx.restore();

      ctx.globalAlpha = 1;
    });
    ctx.globalAlpha = 1;
    ctx.restore();
  };

  /** A fixed noise tile, built once. What keeps a smooth gradient from banding,
   *  and most of why the field reads as drawn rather than generated. */
  let grainTile = null;
  const grain = (ctx, a, w, h) => {
    if (!grainTile) {
      const N = 128;
      const tile = document.createElement('canvas');
      tile.width = tile.height = N;
      const tctx = tile.getContext('2d');
      if (!tctx) return;
      const img = tctx.createImageData(N, N);
      let s = 0x2f6e2b1;
      for (let i = 0; i < img.data.length; i += 4) {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        const v = 128 + ((s >> 16) & 127);
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      tctx.putImageData(img, 0, 0);
      grainTile = ctx.createPattern(tile, 'repeat');
    }
    if (!grainTile) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = grainTile;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  };

  /** The sky renders at a third of display resolution. Nothing in a ribbon has an
   *  edge that survives being a third of a pixel wide, so the upscale is free. */
  const SKY_SCALE = 1 / 3;
  const still = matchMedia('(prefers-reduced-motion: reduce)');

  const surf = (w, h) => {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    return c;
  };

  let base = null; // washes + rings + motes
  let veil = null; // legibility veil + grain
  let sky = null; // ribbons, re-rendered per frame
  let ctx = null;
  let vw = 0;
  let vh = 0;
  let dpr = 1;
  let place = null; // card-space → viewport transform, shared by base and sky
  let ink = '#b56476';
  let soft = '#87c9e5';

  /** Rebuild everything that only changes with the viewport size. */
  const build = () => {
    vw = Math.max(1, window.innerWidth);
    vh = Math.max(1, window.innerHeight);
    // Cap the backing store: a 3x DPR phone would otherwise allocate a surface
    // several times the size of anything it can show.
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(vw * dpr);
    cv.height = Math.round(vh * dpr);
    ctx = cv.getContext('2d');
    if (!ctx) return false;

    const cs = getComputedStyle(document.documentElement);
    ink = cs.getPropertyValue('--backdrop-ink').trim() || '#b56476';
    soft = cs.getPropertyValue('--backdrop-soft').trim() || '#87c9e5';
    const ground = cs.getPropertyValue('--bg').trim() || '#f0f3f7';

    // Card space → viewport, anchored on the composition's focal point rather
    // than on the frame: the rings must open into the empty right of the fold at
    // every aspect, and a plain `cover` would swing them off a tall phone.
    const s = Math.max(vw / W, vh / H) * 1.15;
    place = { s, tx: vw * 0.78 - FIELD_X * s, ty: vh * 0.42 - FIELD_Y * s };

    base = surf(vw * dpr, vh * dpr);
    const b = base.getContext('2d');
    b.setTransform(dpr, 0, 0, dpr, 0, 0);
    b.translate(place.tx, place.ty);
    b.scale(s, s);
    contour(b, ink, soft);
    // The aurora's own two sky washes — the slow lights the ribbons hang IN, so
    // that they are not floating on flat ground. Static, so they live here.
    wash(b, FIELD_X + 30, FIELD_Y - 70, 520, ink, 0.13);
    wash(b, W * 0.6, H * 0.95, 430, soft, 0.11);
    // Motes belong to the ground too: they are what the curtains hang in FRONT
    // of, so they must not drift with them.
    motes(b, ink, soft);

    sky = surf(vw * dpr * SKY_SCALE, vh * dpr * SKY_SCALE);

    veil = surf(vw * dpr, vh * dpr);
    const v = veil.getContext('2d');
    v.setTransform(dpr, 0, 0, dpr, 0, 0);
    // The veil is what makes decoration safe under type: it holds the left column
    // at full ground and lets the field through only as it travels right.
    const g = v.createLinearGradient(0, 0, vw, 0);
    g.addColorStop(0, alpha(ground, 1));
    g.addColorStop(0.38, alpha(ground, 0.8));
    g.addColorStop(1, alpha(ground, 0));
    v.fillStyle = g;
    v.fillRect(0, 0, vw, vh);
    grain(v, 0.035, vw, vh);
    return true;
  };

  /** One composite: ground, sky, veil. Three blits and one low-res vector pass. */
  const frame = (t) => {
    if (!ctx) return;
    const sctx = sky.getContext('2d');
    const ss = dpr * SKY_SCALE;
    sctx.setTransform(ss, 0, 0, ss, 0, 0);
    sctx.clearRect(0, 0, vw, vh);
    sctx.save();
    sctx.translate(place.tx, place.ty);
    sctx.scale(place.s, place.s);
    aurora(sctx, ink, soft, t);
    sctx.restore();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(base, 0, 0);
    ctx.drawImage(sky, 0, 0, cv.width, cv.height);
    ctx.drawImage(veil, 0, 0);
  };

  // ── the loop ────────────────────────────────────────────────────────────────
  // Capped at 30fps. The drift is on a ~50s cycle, so every second frame is a
  // frame nobody can distinguish from the one before it, and skipping it halves
  // the cost of the only thing on this page that costs anything per frame.
  const FPS = 30;
  let last = -1e9;
  let raf = 0;
  let t0 = 0;

  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    if (now - last < 1000 / FPS) return;
    last = now;
    if (!t0) t0 = now;
    frame((now - t0) / 1000);
  };

  const start = () => {
    if (raf || still.matches) return;
    raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const reset = () => {
    stop();
    if (!build()) return;
    // Always lay down one frame, so the field is right before the loop starts and
    // is the whole story when the loop never starts at all.
    frame(still.matches ? 0 : (performance.now() - t0) / 1000);
    if (!document.hidden) start();
  };

  reset();

  // A background tab still runs rAF in some browsers, and a backdrop nobody can
  // see is pure battery.
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  let rt = 0;
  addEventListener(
    'resize',
    () => {
      clearTimeout(rt);
      rt = setTimeout(reset, 180);
    },
    { passive: true }
  );
  // Honour a mid-session change of the motion preference in both directions.
  still.addEventListener('change', reset);
})();
