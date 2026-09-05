// The home page's one script: the WebGL field behind the hero, the live
// markets (REST snapshot, then the `markets` WebSocket channel) feeding the
// asset row, and the scroll reveals. Raw WebGL2, raw
// fetch, raw WebSocket — no library.
(() => {
  const API = 'https://api.testnet.mtf.exchange';
  const APP = 'https://app.mtf.exchange/';
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── reveals ─────────────────────────────────────────────────────────── */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ── the stream ──────────────────────────────────────────────────────── */
  // A diagonal stream of points, bottom-left to top-right, the way a galaxy
  // arm reads: sparse, sizes mixed, drifting along the band. Each point
  // carries (u along the band, v across it, size, speed) and the vertex
  // shader does the rest.
  const canvas = document.querySelector('.stream canvas');
  const gl = canvas && canvas.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: true });
  if (gl) {
    const vs = `#version 300 es
    in vec4 a;                       // u, v, size, speed
    uniform float t, dpr; uniform vec2 res, mouse;
    out float fade; out float big;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)))*43758.5453); }
    float vnoise(vec2 p){
      vec2 i = floor(p), f = fract(p); f = f*f*(3.0 - 2.0*f);
      return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y)*2.0 - 1.0;
    }
    void main(){
      float u = fract(a.x + t*a.w*0.012);          // drift along the band, wraps
      float v = a.y;                               // -1..1 across the band
      // the spine: a gentle S from bottom-left to top-right
      vec2 c = vec2(mix(-1.25, 1.25, u), mix(-1.05, 0.85, u) + sin(u*3.1416)*0.18 - sin(u*6.2832)*0.06);
      vec2 n = normalize(vec2(-(1.9 + cos(u*3.1416)*0.56), 2.5));   // approximate normal
      float width = 0.22 + 0.16*sin(u*3.1416);     // thinner at the ends
      vec2 pos = c + n*v*width;
      pos += vec2(vnoise(vec2(u*6.0, a.z*7.0) + t*0.05), vnoise(vec2(a.z*5.0, u*6.0) - t*0.04))*0.03;
      pos.x += mouse.x*0.02; pos.y += mouse.y*0.015;
      pos.x *= res.y/res.x*1.6;                    // keep the band diagonal at any aspect
      gl_Position = vec4(pos, 0.0, 1.0);
      big = step(0.80, a.z);
      float size = mix(2.2, 5.5, a.z) + big*mix(5.0, 11.0, fract(a.z*37.0));
      gl_PointSize = size*dpr;
      fade = (1.0 - abs(v)*abs(v))*(0.7 + 0.3*sin(t*0.7 + a.z*40.0));
    }`;
    const fs = `#version 300 es
    precision mediump float;
    in float fade; in float big; out vec4 o;
    void main(){
      float r = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.32, r)*fade;
      vec3 c = mix(vec3(0.45, 0.85, 0.99), vec3(0.80, 0.95, 1.0), big*0.7);
      o = vec4(c*a, a);
    }`;
    const sh = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog); gl.useProgram(prog);
    // Deterministic pseudo-random so every visitor sees the same sky.
    let seed = 7; const rnd = () => (seed = (seed*16807) % 2147483647)/2147483647;
    const N = 720, pts = new Float32Array(N*4);
    for (let i = 0; i < N; i++) {
      const g = (rnd() + rnd() + rnd())/1.5 - 1;   // roughly gaussian across the band
      pts[i*4] = rnd(); pts[i*4 + 1] = g; pts[i*4 + 2] = rnd(); pts[i*4 + 3] = 0.6 + rnd();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, pts, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const U = (n) => gl.getUniformLocation(prog, n);
    const uT = U('t'), uDpr = U('dpr'), uRes = U('res'), uMouse = U('mouse');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const target = [0, 0], cur = [0, 0];
    addEventListener('pointermove', (e) => { target[0] = (e.clientX/innerWidth)*2 - 1; target[1] = 1 - (e.clientY/innerHeight)*2; }, { passive: true });
    const resize = () => {
      const w = canvas.clientWidth*dpr | 0, h = canvas.clientHeight*dpr | 0;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h); gl.uniform2f(uRes, w, h); gl.uniform1f(uDpr, dpr);
    };
    new ResizeObserver(resize).observe(canvas); resize();
    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
    const frame = (ms) => {
      if (visible) {
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        cur[0] += (target[0] - cur[0])*0.04; cur[1] += (target[1] - cur[1])*0.04;
        gl.uniform2f(uMouse, cur[0], cur[1]);
        gl.uniform1f(uT, ms/1000);
        gl.drawArrays(gl.POINTS, 0, N);
      }
      if (!still) requestAnimationFrame(frame);
    };
    frame(0);
  }

  /* ── markets ─────────────────────────────────────────────────────────── */
  const chips = document.querySelector('.assets');
  if (!chips) return;

  const px = (s) => { const n = +s; return n.toLocaleString('en-US', { minimumFractionDigits: n >= 1000 ? 1 : n >= 1 ? 2 : 4, maximumFractionDigits: n >= 1000 ? 1 : n >= 1 ? 2 : 4 }); };
  const pct = (s) => { const n = +s*100; return isNaN(n) ? '' : (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(2) + '%'; };
  const sign = (s) => s == null ? '' : +s >= 0 ? 'up' : 'down';
  const rows = new Map(); // coin -> { li, tl, last }

  const paint = (m) => {
    let r = rows.get(m.coin);
    if (!r) {
      r = { li: document.createElement('li'), last: null };
      r.li.dataset.c = m.coin.replace(/\/.*/, '').slice(0, 1); r.li.innerHTML = `<b>${m.coin}</b><span class="num price"></span><span class="num chg"></span>`;
      rows.set(m.coin, r); chips.appendChild(r.li);
    }
    {
      const el = r.li;
      const p = el.querySelector('.price'), c = el.querySelector('.chg');
      p.textContent = px(m.mark_px);
      c.textContent = pct(m.change_24h); c.className = 'num chg ' + sign(m.change_24h);
      if (r.last !== null && r.last !== m.mark_px) {
        p.classList.remove('tick-up', 'tick-down'); void p.offsetWidth;
        p.classList.add(+m.mark_px > +r.last ? 'tick-up' : 'tick-down');
      }
    }
    r.last = m.mark_px;
  };
  const apply = (data) => {
    const list = Array.isArray(data) ? data : data.perp || Object.values(data).find(Array.isArray) || [];
    list.filter((m) => m && m.coin && m.mark_px && !m.halted).forEach(paint);
  };

  const snapshot = () => fetch(API + '/info', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"type":"markets"}' })
    .then((r) => r.json()).then((j) => apply(j.data)).catch(() => {});
  snapshot();

  // Live: the `markets` channel pushes a frame whenever any row changes.
  // If the socket never comes up, poll instead.
  let poll = 0;
  const live = () => {
    let ws;
    try { ws = new WebSocket(API.replace('https', 'wss') + '/ws'); } catch { poll = setInterval(snapshot, 5000); return; }
    ws.onopen = () => { clearInterval(poll); ws.send(JSON.stringify({ method: 'subscribe', subscription: { type: 'markets' } })); };
    ws.onmessage = (e) => { try { const f = JSON.parse(e.data); if (f.channel === 'markets') apply(f.data); } catch {} };
    ws.onclose = () => { poll = setInterval(snapshot, 5000); setTimeout(live, 15000); };
    ws.onerror = () => ws.close();
  };
  live();
})();
