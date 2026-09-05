// The home page's one script: the WebGL sky under the hero, the live
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

  /* ── the sky ─────────────────────────────────────────────────────────── */
  // The Milky Way from the ground: a wide band of stars running corner to
  // corner, a brighter bulge toward the centre, dust lanes cutting the haze,
  // and a scatter of field stars around it. The sky drifts slowly along the
  // band, as it does over a night. Two additive passes: a wide soft one that
  // builds the haze, a tight one for the stars.
  const canvas = document.querySelector('.stream canvas');
  const gl = canvas && canvas.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: true });
  if (gl) {
    const vs = `#version 300 es
    in vec4 a;                       // u0, v (gaussian), seed, kind (0 band, 1 field)
    uniform float t, dpr, pass; uniform vec2 res, mouse;
    out float haze; out float warm; out float star; out float seed;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)))*43758.5453); }
    float vnoise(vec2 p){
      vec2 i = floor(p), f = fract(p); f = f*f*(3.0 - 2.0*f);
      return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
    }
    void main(){
      float drift = t*0.006;
      float u = mod(a.x + drift + 1.5, 3.0) - 1.5;              // along the band, wraps
      float bulge = exp(-pow((u - 0.25)*1.6, 2.0));            // the galactic centre, right of middle
      float width = 0.20 + 0.16*bulge;
      float v = a.y*width;                                     // across the band
      vec2 p = mix(vec2(u, v), vec2(a.x*2.6 - 1.3 + drift*0.3, a.y*1.1), a.w);
      // dust: dark lanes through the haze, denser near the plane
      float lane = vnoise(vec2(u*4.0 + 3.0, a.y*2.2)) * vnoise(vec2(u*9.0, a.y*4.0 + 7.0));
      float dust = smoothstep(0.22, 0.42, lane)*smoothstep(1.0, 0.2, abs(a.y));
      haze = (1.0 - a.w)*(0.35 + 0.65*bulge)*(1.0 - dust*0.85)*(1.0 - abs(a.y)*abs(a.y)*0.6);
      warm = bulge;
      seed = a.z;
      star = 1.0 - dust*0.5*(1.0 - a.w);
      // tilt the band across the frame
      float ang = 0.42 + mouse.y*0.01;
      vec2 q = vec2(p.x*cos(ang) - p.y*sin(ang), p.x*sin(ang) + p.y*cos(ang));
      q += mouse*vec2(0.02, 0.015)*(1.0 + a.w);
      q.x *= res.y/res.x*1.9;
      q.y *= 1.15;
      gl_Position = vec4(q, 0.0, 1.0);
      float big = step(0.93, a.z);
      float sz = (0.9 + fract(a.z*17.0)*1.6 + big*1.6)*dpr*(1.0 - a.w*0.3);
      gl_PointSize = pass < 0.5 ? res.y*0.10*(0.5 + fract(a.z*7.0)*0.7) : sz;
    }`;
    const fs = `#version 300 es
    precision highp float;
    in float haze; in float warm; in float star; in float seed;
    uniform float pass, t; out vec4 o;
    void main(){
      float d = length(gl_PointCoord - 0.5);
      vec3 cool = vec3(0.42, 0.78, 1.0), cream = vec3(1.0, 0.86, 0.80), rose = vec3(0.96, 0.66, 0.72);
      if (pass < 0.5) {
        vec3 c = mix(cool, mix(cream, rose, 0.45), warm*0.9);
        float a = exp(-d*d*14.0)*0.020*haze;
        o = vec4(c*a, a);
      } else {
        float tw = 0.7 + 0.3*sin(t*(1.0 + fract(seed*3.0)*2.0) + seed*80.0);
        vec3 c = mix(vec3(0.85, 0.93, 1.0), cream, step(0.72, fract(seed*11.0)));
        float a = smoothstep(0.5, 0.1, d)*tw*star*(0.5 + 0.5*fract(seed*29.0));
        o = vec4(c*a, a);
      }
    }`;
    const sh = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    // Deterministic pseudo-random so every visitor sees the same sky.
    let seed = 7; const rnd = () => (seed = (seed*16807) % 2147483647)/2147483647;
    const N = 16000, pts = new Float32Array(N*4);
    for (let i = 0; i < N; i++) {
      const field = i % 4 === 0 ? 1 : 0;
      const g = (rnd() + rnd() + rnd() + rnd())/2 - 1;       // roughly gaussian, -1..1
      pts[i*4] = field ? rnd() : rnd()*3.0 - 1.5;
      pts[i*4 + 1] = field ? rnd()*2 - 1 : g;
      pts[i*4 + 2] = rnd(); pts[i*4 + 3] = field;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, pts, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);     // additive: light adds up
    const U = (n) => gl.getUniformLocation(prog, n);
    const uT = U('t'), uDpr = U('dpr'), uRes = U('res'), uMouse = U('mouse'), uPass = U('pass');
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
        cur[0] += (target[0] - cur[0])*0.03; cur[1] += (target[1] - cur[1])*0.03;
        gl.uniform2f(uMouse, cur[0], cur[1]);
        gl.uniform1f(uT, ms/1000);
        gl.uniform1f(uPass, 0); gl.drawArrays(gl.POINTS, 0, N);
        gl.uniform1f(uPass, 1); gl.drawArrays(gl.POINTS, 0, N);
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
