(function () {
  const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
  const BELL = [[1, 1, 1], [2.0, .32, .55], [3.01, .1, .32], [4.17, .04, .18]];
  const GLASS = [[1, 1, 1], [2.76, .14, .4], [5.4, .04, .18]];
  const WOOD = [[1, 1, 1], [3.93, .22, .18], [9.2, .05, .06]];
  let A = null;
  function ctx() {
    if (A) return A;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    const c = new AC();
    const dry = c.createGain(), wet = c.createGain(), conv = c.createConvolver(), bus = c.createGain();
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6000; lp.Q.value = .5;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3; comp.knee.value = 12;
    const master = c.createGain(); master.gain.value = .9; wet.gain.value = .2;
    dry.connect(bus); wet.connect(conv); conv.connect(bus); bus.connect(lp); lp.connect(comp); comp.connect(master); master.connect(c.destination);
    const sr = c.sampleRate, pre = Math.floor(sr * .018), len = Math.floor(sr * 1.6) + pre, ir = c.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); let y = 0; for (let i = pre; i < len; i++) { const k = (i - pre) / (len - pre), al = .2 + .75 * k; y += (1 - al) * ((Math.random() * 2 - 1) - y); d[i] = y * Math.pow(1 - k, 2.2) * 1.6; } }
    conv.buffer = ir;
    const nb = c.createBuffer(1, sr * 2, sr), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    A = { ctx: c, dry, wet, noise: nb, master };
    return A;
  }
  function voice(t, f, o = {}) {
    let { v = .1, d = 1.4, pan = 0, partials = BELL, a = .006, wet = 1, det = 4, f2 = null, ft = .1, type = 'sine' } = o;
    const p = A.ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan));
    const send = A.ctx.createGain(); send.gain.value = wet;
    p.connect(A.dry); p.connect(send); send.connect(A.wet);
    partials.forEach(([r, amp, dm]) => [-det, det].forEach(dc => {
      const osc = A.ctx.createOscillator(), g = A.ctx.createGain();
      osc.type = type; osc.frequency.setValueAtTime(f * r, t); osc.detune.value = dc;
      if (f2) osc.frequency.exponentialRampToValueAtTime(f2 * r, t + ft);
      const pk = v * amp * .5, dd = d * dm;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pk, t + a); g.gain.setTargetAtTime(0, t + a, dd / 4.5);
      osc.connect(g); g.connect(p); osc.start(t); osc.stop(t + a + dd * 1.3 + .05);
    }));
  }
  function air(t, o = {}) {
    let { v = .05, a = .3, hold = 0, d = .6, f = 600, f2 = null, type = 'lowpass', q = .7, pan = 0, pan2 = null } = o;
    const src = A.ctx.createBufferSource(); src.buffer = A.noise;
    const fl = A.ctx.createBiquadFilter(); fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f, t);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + a + hold + d * .5);
    const g = A.ctx.createGain(), p = A.ctx.createStereoPanner(); p.pan.setValueAtTime(pan, t);
    if (pan2 != null) p.pan.linearRampToValueAtTime(pan2, t + a + d * .6);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.setValueAtTime(v, t + a + hold); g.gain.setTargetAtTime(0, t + a + hold, d / 4);
    src.connect(fl); fl.connect(g); g.connect(p); p.connect(A.dry); p.connect(A.wet);
    src.start(t); src.stop(t + a + hold + d * 1.3);
  }
  const R = .42;
  const S = {
    glass: t => { t += R; voice(t, NOTE(76), { v: .16, d: 2, pan: -.18, partials: GLASS }); voice(t + .1, NOTE(83), { v: .13, d: 2.2, pan: .18, partials: GLASS }); },
    arp: t => { t += R; [72, 76, 79, 83, 88].forEach((n, i) => voice(t + i * .065, NOTE(n), { v: .1 * (1 - i * .08), d: 1.3 + i * .15, pan: -.5 + i * .25, partials: BELL })); },
    bloom: t => {
      air(t, { v: .05, a: .4, d: .15, f: 350, f2: 2400, type: 'bandpass', q: .9 });
      voice(t + R, 110, { f2: 52, ft: .3, v: .34, d: .7, partials: [[1, 1, 1], [2, .25, .5]], wet: .25, det: 0 });
      [84, 88, 91, 95, 96, 100].forEach((n, i) => voice(t + R + .05 + i * .045, NOTE(n), { v: .03, d: .9, pan: (i % 2 ? .4 : -.4), partials: GLASS }));
    },
    marimba: t => { t += R; [[67, 0, -.25], [72, .085, 0], [79, .17, .25]].forEach(([n, d, pan]) => voice(t + d, NOTE(n), { v: .2, d: .9, a: .002, partials: WOOD, pan, det: 0, wet: .6 })); },
    shimmer: t => { t += R; voice(t, NOTE(72), { v: .06, d: 2.4, partials: BELL }); const ch = [84, 88, 91, 95, 98, 100, 103]; for (let i = 0; i < 12; i++) voice(t + i * .03, NOTE(ch[(i * 3) % ch.length]), { v: .022, d: 1.4 + (i % 3) * .3, pan: Math.sin(i * 1.7) * .6, partials: GLASS, det: 7 }); },
    knock: t => { [0, .16].forEach((d, i) => { voice(t + d, 150, { f2: 78, ft: .07, v: .38, d: .22, a: .002, partials: [[1, 1, 1], [2.3, .2, .3]], wet: .15, det: 0, pan: i ? .06 : -.06 }); air(t + d, { v: .03, a: .002, d: .06, f: 380, type: 'bandpass', q: 3 }); }); },
    question: t => { voice(t, NOTE(74), { v: .13, d: 1.1, pan: -.15 }); voice(t + .15, NOTE(77), { v: .13, d: 1.4, pan: .15 }); },
    breath: t => { air(t, { v: .06, a: .45, hold: .1, d: 1, f: 420, f2: 1000, q: .5 }); voice(t + .15, NOTE(67), { v: .025, a: .35, d: 1.2, partials: [[1, 1, 1]] }); },
    error: t => { voice(t, NOTE(69), { f2: NOTE(66), ft: .1, v: .12, d: .5, type: 'triangle', partials: [[1, 1, 1]], det: 3 }); voice(t + .14, NOTE(65), { f2: NOTE(61), ft: .12, v: .12, d: .7, type: 'triangle', partials: [[1, 1, 1]], det: 3 }); }
  };
  const EVENT = { done: 'bloom', needs: 'question', error: 'error' };
  const last = {};
  window.BubbleSounds = {
    enabled: false,
    enable(on) { this.enabled = on; if (on) { const a = ctx(); if (a && a.ctx.state === 'suspended') a.ctx.resume(); } },
    play(name, arg, gap = 60) {
      name = EVENT[name] || name;
      if (!this.enabled || !S[name]) return;
      const now = performance.now(); if (last[name] && now - last[name] < gap) return; last[name] = now;
      const a = ctx(); if (!a) return; if (a.ctx.state === 'suspended') a.ctx.resume();
      S[name](a.ctx.currentTime + .02, arg);
    }
  };
})();
