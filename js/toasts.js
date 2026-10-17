// The app's toasts: a pill with the session's name and what happened, decoding in with a glitch and stacking
// newest on top (older ones tuck behind, smaller and blurred).
(function () {
  const GLYPHS = '▓▒░█<>/\\_=+*#01:;';
  const HIDDEN = '2px 2px,2px 2px,4px 4px', SHOWN = '320% 1000%,460% 1400%,4px 4px';

  class ToastStack {
    constructor(container, { slots = 3 } = {}) {
      this.el = container;
      this.slots = slots;
      this.items = [];
      this.key = 0;
      const loop = () => { this.render(); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }

    push(name, text, color, life = 4000) {
      const key = ++this.key, node = document.createElement('div');
      node.className = 'toast';
      node.innerHTML = '<div class="toast-pill"><div class="toast-scan"></div><div class="toast-flash"></div>' +
        '<div class="toast-dot"></div><span class="toast-name"></span><span class="toast-text"></span></div>';
      this.el.appendChild(node);
      const item = { key, name, text, color, born: performance.now(), show: false, node };
      this.items.push(item);
      // Oldest out when the stack is full.
      const live = this.items.filter(x => !x.gone);
      if (live.length > this.slots) this.hide(live[0]);
      requestAnimationFrame(() => requestAnimationFrame(() => { item.show = true; item.decodeAt = performance.now(); }));
      item.timer = setTimeout(() => this.hide(item), life);
    }

    hide(item) {
      if (item.gone) return;
      const live = this.order();
      item.lastK = Math.max(0, live.indexOf(item));
      item.show = false;
      item.gone = true;
      clearTimeout(item.timer);
      setTimeout(() => { item.node.remove(); this.items = this.items.filter(x => x !== item); }, 600);
    }

    clear() { this.items.slice().forEach(x => this.hide(x)); }

    order() { return this.items.filter(x => x.show).sort((a, b) => b.born - a.born); }

    render() {
      const now = performance.now(), live = this.order(), tick = Math.floor(now / 45);
      for (const x of this.items) {
        const on = x.show, r = on ? live.indexOf(x) : (x.lastK || 0);
        const p = x.decodeAt ? Math.min(1, (now - x.decodeAt) / 480) : 0, ip = 1 - p;
        const rn = n => { const v = Math.sin(n * 12.9898 + tick * 78.233 + x.key * 3.1) * 43758.5453; return v - Math.floor(v); };
        const decode = (str, off) => p >= 1 ? str : [...str].map((ch, i) => {
          if (ch === ' ') return ' ';
          const at = .1 + (i / Math.max(1, str.length)) * .55 + rn(i + off) * .1;
          return p >= at ? ch : GLYPHS[Math.floor(rn(i * 7 + off + 1) * GLYPHS.length)];
        }).join('');
        const glitch = p < .55 && rn(999) > .55, dx = (ip * ip * 3.2 + (glitch ? 1.5 : 0)).toFixed(2), sweep = p * 140 - 20;
        const ts = p < 1 ? `${dx}px 0 rgba(255,60,110,${(.85 * ip).toFixed(2)}), -${dx}px 0 rgba(60,220,255,${(.85 * ip).toFixed(2)})` : 'none';

        const n = x.node, pill = n.firstChild, [scan, flash, dot, name, text] = pill.children;
        n.style.top = (r * 7) + 'px';
        n.style.transform = `translateX(calc(-50% + ${on && glitch ? (rn(77) - .5) * 6 : 0}px)) translateY(${on ? 0 : -8}px) scale(${on ? 1 - r * .055 : .94})`;
        n.style.opacity = on ? (r > 2 ? 0 : 1 - r * .3) : 0;
        n.style.filter = `blur(${Math.min(r, 3) * 1.2}px)`;
        n.style.zIndex = on ? 20 - r : 5 - Math.min(r, 4);
        pill.style.maskSize = pill.style.webkitMaskSize = on ? SHOWN : HIDDEN;
        pill.style.transition = on ? 'mask-size .8s cubic-bezier(.25,.7,.3,1)' : 'mask-size .6s cubic-bezier(.6,0,.8,.5)';
        scan.style.background = `repeating-linear-gradient(0deg,rgba(255,255,255,.14) 0 1px,transparent 1px 3px),linear-gradient(90deg,transparent ${sweep - 18}%,rgba(255,255,255,.22) ${sweep}%,transparent ${sweep + 6}%)`;
        scan.style.opacity = on ? Math.max(0, ip * 1.1 - .1) : 0;
        flash.style.background = x.color;
        flash.style.opacity = on ? Math.pow(ip, 4) * .35 : 0;
        dot.style.background = x.color;
        dot.style.boxShadow = `0 0 6px ${x.color}`;
        dot.style.opacity = p < .4 ? (rn(31) > .5 ? 1 : .25) : 1;
        name.textContent = decode(x.name, 0);
        name.style.textShadow = ts;
        text.textContent = decode(x.text, 50);
        text.style.color = x.color;
        text.style.textShadow = ts;
      }
    }

    /// How tall the stack is now (for placing things under it).
    get height() { const n = this.order().length; return n ? 34 + Math.min(n - 1, 2) * 7 : 0; }
  }

  window.ToastStack = ToastStack;
})();
