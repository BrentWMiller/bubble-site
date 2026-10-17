// One shared WebGL context per renderer kind; each element blits into its own 2D canvas.
window.OrbShared = window.OrbShared || function makeRenderer(setup) {
  const R = { els: new Set(), raf: 0, last: performance.now() };
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  function init() {
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true, preserveDrawingBuffer: true });
    if (!gl) return;
    R.gl = gl;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(o)); return o; };
    R.prog = (v, f) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(p); return p; };
    R.ctx = setup(gl, R);
  }
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); R.gl = null; });
  canvas.addEventListener('webglcontextrestored', () => init());
  init();
  const loop = (now) => {
    const dt = Math.min((now - R.last) / 1000, .05); R.last = now;
    const gl = R.gl;
    if (gl && !gl.isContextLost()) {
      let need = 0; R.els.forEach(el => need = Math.max(need, el.pw || 0));
      if (need > canvas.width) { canvas.width = canvas.height = need; }
      gl.enable(gl.SCISSOR_TEST);
      R.els.forEach(el => {
        if (!el.ctx2d || !el.pw) return;
        const pz = el.getAttribute('paused');
        if (pz != null && pz !== 'false' && el._shown) return;
        el._shown = true;
        el.step(dt, now);
        const w = el.pw;
        gl.viewport(0, 0, w, w); gl.scissor(0, 0, w, w);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        el.draw(gl, R.ctx, w);
        el.ctx2d.clearRect(0, 0, w, w);
        el.ctx2d.drawImage(canvas, 0, canvas.height - w, w, w, 0, 0, w, w);
      });
    }
    R.raf = R.els.size ? requestAnimationFrame(loop) : 0;
  };
  R.add = el => { R.els.add(el); if (!R.raf) { R.last = performance.now(); R.raf = requestAnimationFrame(loop); } };
  R.remove = el => R.els.delete(el);
  return R;
};

window.OrbBase = window.OrbBase || class extends HTMLElement {
  static get observedAttributes() { return ['state', 'palette', 'size']; }
  connectedCallback() {
    this.style.display = 'block';
    if (!this.c2) { this.c2 = document.createElement('canvas'); this.c2.style.display = 'block'; this.appendChild(this.c2); this.ctx2d = this.c2.getContext('2d'); }
    this.t0 = performance.now(); this.ph = Math.random() * 20; this.bounce = 0; this.bv = 0;
    this.resize(); this.applyTargets(true);
    this.renderer().add(this);
  }
  disconnectedCallback() { this.renderer().remove(this); }
  attributeChangedCallback(n, o, v) {
    if (!this.c2) return;
    if (n === 'size') this.resize();
    else { if (n === 'state' && v === 'needs' && o !== 'needs') { this.bounce = -.28; this.bv = 0; } this.applyTargets(false); }
  }
  resize() {
    const s = parseFloat(this.getAttribute('size')) || 200, d = Math.min(window.devicePixelRatio || 1, 2);
    this.px = s; this.dpr = d; this.pw = Math.round(s * d);
    this.c2.style.width = this.c2.style.height = this.style.width = this.style.height = s + 'px';
    this.c2.width = this.c2.height = this.pw;
  }
  applyTargets(snap) {
    const st = this.getAttribute('state') || 'idle', P = this.palettes(), pal = P[this.getAttribute('palette')] || P.claude, M = this.motion();
    this.tgt = JSON.parse(JSON.stringify({ ...(pal[st] || pal.idle), ...(M[st] || M.idle) }));
    if (snap || !this.cur) { this.cur = JSON.parse(JSON.stringify(this.tgt)); if (st === 'needs') this.bounce = -.28; }
  }
  stepCommon(dt) {
    const k = 1 - Math.pow(.02, dt), cur = this.cur, tg = this.tgt;
    for (const key in tg) {
      if (Array.isArray(tg[key])) for (let i = 0; i < 3; i++) cur[key][i] += (tg[key][i] - cur[key][i]) * k;
      else cur[key] += (tg[key] - cur[key]) * k;
    }
    this.bv += (-this.bounce * 220 - this.bv * 14) * dt; this.bounce += this.bv * dt;
  }
};
