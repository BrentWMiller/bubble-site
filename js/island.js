// The app's island, docked under the top of the screen: a black pill that shows what's happening, widens when a
// session needs you, fails or finishes, and opens into every session on hover. Its sizes come from the app
// (data/app.js); the page's own orb flies into its slot.
(function () {
  class Island {
    constructor(layer, app) {
      this.layer = layer;
      this.app = app;
      this.hover = false;
      this.view = { state: 'idle', label: '', prompt: '', sub: '', sessions: [] };
      this.kicks = [];
      layer.innerHTML =
        '<div class="island-toasts"></div>' +
        '<div class="island"><div class="island-edge"></div><canvas width="760" height="680"></canvas>' +
        '<div class="island-innerS"></div><div class="island-inner"></div>' +
        '<div class="island-bar"><div class="island-orb"></div><span class="island-text"></span><div class="island-pips"></div></div>' +
        '<div class="island-prompt"><span class="msg"></span><span class="sub"></span></div>' +
        '<div class="island-list"></div></div>';
      this.el = layer.querySelector('.island');
      this.q = s => this.el.querySelector(s);
      this.canvas = this.q('canvas');
      this.toasts = new window.ToastStack(layer.querySelector('.island-toasts'));
      this.el.style.borderRadius = `0 0 ${app.island.cornerRadius}px ${app.island.cornerRadius}px`;
      this.el.addEventListener('mouseenter', () => { this.hover = true; this.layout(); });
      this.el.addEventListener('mouseleave', () => { this.hover = false; this.layout(); });
      const loop = t => { this.draw(t / 1000); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }

    /// What it shows: the lead session's state, its status line, a permission/error prompt, and every session.
    update(view) {
      this.view = view;
      this.layout();
    }

    /// A tool finishing brightens the wave for a moment.
    kick() { this.kicks.push(performance.now() / 1000); }

    get mode() {
      const s = this.view.state;
      return this.hover ? 'hover' : s === 'needs' || s === 'error' || s === 'done' ? s : 'rest';
    }

    size() {
      const I = this.app.island, m = this.mode;
      if (m === 'hover') return [I.hoverWidth, I.barHeight + 2 + this.view.sessions.length * I.rowHeight + 34 + 10];
      if (m === 'needs' || m === 'error') return [I.needsWidth, I.needsHeight];
      if (m === 'done') return [I.doneWidth, I.doneHeight];
      return [I.restWidth, I.restHeight];
    }

    /// Where the orb sits, in page coordinates (the bar's first 28pt slot).
    orbSlot() {
      const r = this.el.getBoundingClientRect(), [w] = this.size();
      return { x: innerWidth / 2 - w / 2 + 10 + this.app.island.orbSize / 2, y: r.top + 8 + this.app.island.orbSize / 2 };
    }

    layout() {
      const v = this.view, m = this.mode, [w, h] = this.size(), C = window.BubbleColors;
      this.el.style.width = w + 'px';
      this.el.style.height = h + 'px';
      this.el.style.marginLeft = -w / 2 + 'px';
      const text = this.q('.island-text');
      text.textContent = m === 'needs' ? `${v.project} needs you` : m === 'error' ? `${v.project} hit an error`
        : m === 'done' ? 'All sessions complete' : m === 'hover' ? 'Sessions' : v.label;
      text.style.color = m === 'needs' || m === 'error' || m === 'done' ? C[v.state].css : '#fff';
      this.q('.island-pips').innerHTML = '';
      for (const s of v.sessions) {
        const d = document.createElement('div');
        d.style.background = C[s.state].css;
        if (s.state === 'needs' || s.state === 'error') d.style.boxShadow = `0 0 6px ${C[s.state].css}`;
        this.q('.island-pips').appendChild(d);
      }
      this.q('.island-pips').style.display = m === 'hover' ? 'none' : 'flex';
      const prompt = this.q('.island-prompt');
      prompt.style.opacity = m === 'needs' || m === 'error' ? 1 : 0;
      prompt.querySelector('.msg').textContent = v.prompt;
      prompt.querySelector('.msg').style.color = C[v.state].css;
      prompt.querySelector('.sub').textContent = v.project;
      const list = this.q('.island-list');
      list.style.opacity = m === 'hover' ? 1 : 0;
      list.replaceChildren(...v.sessions.map(s => {
        const row = document.createElement('div');
        row.className = 'island-row';
        const cells = [['rdot', ''], ['rname', s.name], ['rtime', s.time], ['', ''], ['rmsg', s.msg], ['rtok', s.tokens]];
        for (const [cls, t] of cells) { const c = document.createElement(cls === 'rdot' ? 'div' : 'span'); c.className = cls; c.textContent = t; row.appendChild(c); }
        row.querySelector('.rdot').style.cssText = `background:${C[s.state].css};box-shadow:0 0 8px ${C[s.state].css}`;
        row.querySelector('.rmsg').style.color = C[s.state].css;
        return row;
      }), (() => {
        const f = document.createElement('div');
        f.className = 'island-foot';
        f.innerHTML = '<span><span style="color:rgba(255,255,255,.7)">Today</span> · 3h 41m · 6 sessions</span><span></span>';
        f.lastChild.textContent = v.usage;
        return f;
      })());
      this.layer.querySelector('.island-toasts').style.top = (h + 12) + 'px';
    }

    /// The glow, as the app draws it: a rolling dot wave and a dotted inner glow from the orb, an edge light, a rim.
    draw(now) {
      const el = this.el, st = this.view.state, col = (window.BubbleColors[st] || window.BubbleColors.working).rgb;
      const fast = st === 'needs' || st === 'error', b = .5 + .5 * Math.sin(now * (fast ? 4.2 : 1.7));
      this.kicks = this.kicks.filter(p => now - p < .6);
      const kick = Math.min(1, this.kicks.reduce((a, p) => a + Math.exp(-(now - p) * 7), 0));
      const k = (st === 'idle' ? .45 : fast ? 1.35 : 1) * (1 + .5 * kick);
      const oz = this.app.island.orbSize, ox = 10 + oz / 2, oy = 8 + oz / 2;

      const x = this.canvas.getContext('2d');
      x.setTransform(2, 0, 0, 2, 0, 0);
      x.clearRect(0, 0, 380, 340);
      const W = el.clientWidth, H = el.clientHeight;
      const amp = (st === 'idle' ? .45 : 1) * (1 + .6 * kick), spd = st === 'idle' ? .5 : fast ? 1.6 : 1.1, tt = now * spd;
      const R0 = Math.max(W * .9, 160);
      for (let gx = 2; gx < W; gx += 4) for (let gy = 2; gy < H; gy += 4) {
        const d0 = Math.hypot(gx - ox, gy - oy), an = Math.atan2(gy - oy, gx - ox);
        if (d0 < oz / 2 + 1) continue;
        const warp = Math.sin(an * 3 + tt * .45) * .55 + Math.sin(gx * .019 - gy * .043 + tt * .35) * .7;
        const w1 = Math.sin(d0 * .085 - tt * 2.3 + warp), w2 = Math.sin(d0 * .045 - tt * 1.2 + an * 2 + warp * .5);
        const patch = .5 + .5 * (.5 + .5 * Math.sin(an * 2.3 + tt * .3) * Math.sin(d0 * .03 - tt * .2));
        const born = Math.min(1, (d0 - oz / 2 - 1) / 16);
        const crest = (Math.pow(.5 + .5 * w1, 2.6) * .9 + Math.pow(.5 + .5 * w2, 3) * .3) * patch * born;
        const push = crest * 1.8 + Math.sin(d0 * .06 - tt * 1.6) * .5;
        const fall = Math.max(0, 1 - (d0 + push) / R0);
        if (fall <= 0) continue;
        const a = Math.min(1, fall * fall * (.1 + crest * amp) * (.7 + .3 * b));
        if (a < .02) continue;
        x.fillStyle = `rgba(${col},${a.toFixed(3)})`;
        x.beginPath();
        x.arc(gx + Math.cos(an) * push, gy + Math.sin(an) * push, .55 + crest * .5, 0, 6.2832);
        x.fill();
      }

      const r = 1 + .12 * b + .1 * kick, inner = this.q('.island-inner'), innerS = this.q('.island-innerS');
      for (const g of [inner, innerS]) { g.style.left = (ox - 220) + 'px'; g.style.top = (oy - 220) + 'px'; }
      inner.style.background = `radial-gradient(circle at 50% 50%, rgba(${col},.7) 0%, rgba(${col},.38) ${(9 * r).toFixed(1)}%, rgba(${col},.12) ${(22 * r).toFixed(1)}%, rgba(${col},.03) ${(36 * r).toFixed(1)}%, transparent ${(50 * r).toFixed(1)}%)`;
      inner.style.opacity = Math.min(1, (.45 + .25 * b) * k).toFixed(3);
      innerS.style.background = `radial-gradient(circle at 50% 50%, rgba(${col},.35) 0%, rgba(${col},.1) ${(14 * r).toFixed(1)}%, transparent ${(36 * r).toFixed(1)}%)`;
      innerS.style.opacity = Math.min(1, (.5 + .3 * b) * k).toFixed(3);
      el.style.boxShadow = `inset 0 0 0 1px rgba(${col},${(.06 + .04 * b).toFixed(3)}), 0 10px 30px rgba(0,0,0,.55)`;
      this.q('.island-edge').style.background = `linear-gradient(90deg, rgba(${col},${(.55 + .25 * b).toFixed(3)}) 0, rgba(${col},${(.5 + .2 * b).toFixed(3)}) 1.5px, rgba(${col},${(.22 + .12 * b).toFixed(3)}) 3px, rgba(${col},.06) 12px, transparent 26px)`;
    }
  }

  window.Island = Island;
})();
