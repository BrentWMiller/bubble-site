// Subtle ethereal ambient bed: detuned pad, airy noise, slow filter drift, sparse digital pings.
(function () {
  let ctx, master, timer, nodes = [];
  const NOTES = [220, 277.18, 329.63, 415.3, 493.88, 659.25, 830.61];
  function build() {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -30; comp.ratio.value = 3;
    master.connect(comp); comp.connect(ctx.destination);
    const delay = ctx.createDelay(2), fb = ctx.createGain(), dlp = ctx.createBiquadFilter();
    delay.delayTime.value = .62; fb.gain.value = .55; dlp.type = 'lowpass'; dlp.frequency.value = 2400;
    delay.connect(dlp); dlp.connect(fb); fb.connect(delay); dlp.connect(master);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.Q.value = .7; lp.connect(master); lp.connect(delay);
    const lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.frequency.value = .045; lfoG.gain.value = 380; lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start();
    nodes.push(lfo);
    [[110, -.6], [110.4, .6], [164.81, -.3], [246.94, .3], [329.63, 0]].forEach(([f, p], i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), pn = ctx.createStereoPanner();
      o.type = i < 2 ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = (Math.random() - .5) * 8;
      g.gain.value = i < 2 ? .22 : .07; pn.pan.value = p;
      const tl = ctx.createOscillator(), tg = ctx.createGain(); tl.frequency.value = .03 + i * .017; tg.gain.value = g.gain.value * .6; tl.connect(tg); tg.connect(g.gain); tl.start();
      o.connect(g); g.connect(pn); pn.connect(lp); o.start(); nodes.push(o, tl);
    });
    const len = ctx.sampleRate * 3, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; }
    const ns = ctx.createBufferSource(), nf = ctx.createBiquadFilter(), ng = ctx.createGain();
    ns.buffer = buf; ns.loop = true; nf.type = 'bandpass'; nf.frequency.value = 3200; nf.Q.value = .6; ng.gain.value = .018;
    ns.connect(nf); nf.connect(ng); ng.connect(master); ns.start(); nodes.push(ns);
    const ping = () => {
      if (!ctx || !master) return;
      const t = ctx.currentTime, f = NOTES[Math.floor(Math.random() * NOTES.length)] * (Math.random() > .5 ? 2 : 1);
      const o = ctx.createOscillator(), g = ctx.createGain(), pn = ctx.createStereoPanner();
      o.type = 'sine'; o.frequency.value = f; pn.pan.value = (Math.random() - .5) * 1.4;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + 1.6);
      o.connect(g); g.connect(pn); pn.connect(delay); pn.connect(master); o.start(t); o.stop(t + 1.7);
      timer = setTimeout(ping, 2800 + Math.random() * 5200);
    };
    timer = setTimeout(ping, 2000);
  }
  window.BubbleAmbient = {
    start() {
      if (master) return;
      build(); ctx.resume && ctx.resume();
      const t = ctx.currentTime; master.gain.setValueAtTime(0, t); master.gain.linearRampToValueAtTime(.06, t + 4);
    },
    stop() {
      if (!master) return;
      const m = master, ns = nodes, t = ctx.currentTime; clearTimeout(timer); master = null; nodes = [];
      m.gain.cancelScheduledValues(t); m.gain.setValueAtTime(m.gain.value, t); m.gain.linearRampToValueAtTime(0, t + 1.2);
      setTimeout(() => { ns.forEach(n => { try { n.stop(); } catch (e) {} }); m.disconnect(); }, 1400);
    }
  };
})();
