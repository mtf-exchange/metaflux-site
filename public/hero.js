// The hero field: a plane of points, displaced by a few summed sines, drawn
// with raw WebGL2. No library. The <canvas> sits in .field on the home page;
// if WebGL is unavailable the CSS radial fallback underneath is all you see.
(() => {
  const canvas = document.querySelector('.field canvas');
  const gl = canvas && canvas.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: true });
  if (!gl) return;

  const vs = `#version 300 es
  in vec2 a;              // grid position, 0..1
  uniform float t;        // seconds
  uniform float dpr;
  uniform vec2 res;       // canvas pixels
  uniform vec2 mouse;     // -1..1, smoothed
  uniform float pulse;    // 0..1, the block-commit front sweeping left to right
  out float h;            // wave height, -1..1
  out float z;            // depth, 0 near .. 1 far
  out float g;            // pulse glow, 0..1
  float wave(vec2 p){
    return sin(p.x*5.0 + t*0.45)*0.55
         + sin(p.y*7.0 - t*0.35 + p.x*2.5)*0.30
         + sin((p.x + p.y)*11.0 + t*0.8)*0.15;
  }
  void main(){
    vec2 p = a;
    g = exp(-pow((p.x - pulse)*9.0, 2.0));
    h = wave(p) + g*0.35;
    z = p.y;
    // world: x spans the width, z recedes, y is the wave. The far edge is
    // lifted so the plane reads as a horizon rather than a floor.
    vec3 w = vec3((p.x - 0.5)*3.6 + mouse.x*0.10*(1.0 - p.y), h*0.09 - 0.22 + p.y*0.34 + mouse.y*0.03, p.y);
    float d = w.z*1.6 + 0.55;                    // perspective divisor
    vec2 s = vec2(w.x/(d*1.15), w.y/(d*0.55));
    s.x *= res.y/res.x;
    gl_Position = vec4(s, 0.0, 1.0);
    gl_PointSize = mix(3.6, 1.2, p.y)*dpr;
  }`;
  const fs = `#version 300 es
  precision mediump float;
  in float h; in float z; in float g;
  out vec4 o;
  void main(){
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.25, r);
    vec3 deep   = vec3(0.10, 0.36, 0.52);
    vec3 aurora = vec3(0.36, 0.81, 0.98);
    vec3 rose   = vec3(0.96, 0.66, 0.72);
    vec3 c = mix(deep, aurora, smoothstep(-0.6, 0.9, h));
    c = mix(c, rose, smoothstep(0.8, 1.3, h)*0.6);   // the brand's pink, only on the crests
    c = mix(c, vec3(1.0), g*0.5);                    // the front is white-hot
    a *= mix(0.95, 0.18, z) + g*0.4;                 // fade into the distance
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
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // 220 × 90 grid of points.
  const NX = 220, NY = 90, pts = new Float32Array(NX*NY*2);
  for (let j = 0, k = 0; j < NY; j++) for (let i = 0; i < NX; i++) { pts[k++] = i/(NX-1); pts[k++] = j/(NY-1); }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, pts, gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const uT = gl.getUniformLocation(prog, 't');
  const uDpr = gl.getUniformLocation(prog, 'dpr');
  const uRes = gl.getUniformLocation(prog, 'res');
  const uMouse = gl.getUniformLocation(prog, 'mouse');
  const uPulse = gl.getUniformLocation(prog, 'pulse');
  // Mouse parallax. Target is set on move, the drawn value eases toward it.
  const target = [0, 0], cur = [0, 0];
  addEventListener('pointermove', (e) => {
    target[0] = (e.clientX/innerWidth)*2 - 1;
    target[1] = 1 - (e.clientY/innerHeight)*2;
  }, { passive: true });
  const dpr = Math.min(devicePixelRatio || 1, 2);

  const resize = () => {
    const w = canvas.clientWidth*dpr | 0, h = canvas.clientHeight*dpr | 0;
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
    gl.uniform1f(uDpr, dpr);
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const frame = (ms) => {
    if (visible) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const t = ms/1000;
      cur[0] += (target[0] - cur[0])*0.04; cur[1] += (target[1] - cur[1])*0.04;
      gl.uniform2f(uMouse, cur[0], cur[1]);
      // One block every 4 s: the front eases across, then rests off-screen.
      const ph = (t % 4)/4;
      gl.uniform1f(uPulse, ph < 0.6 ? -0.15 + (ph/0.6)*1.3 : 2.0);
      gl.uniform1f(uT, t);
      gl.drawArrays(gl.POINTS, 0, NX*NY);
    }
    if (!still) requestAnimationFrame(frame);
  };
  frame(0);
})();
