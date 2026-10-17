// Bubble's site: the app's own scripted session (data/app.js, exported by the app) played on a live orb, with its
// toasts, a terminal showing what Claude is doing, and a timeline of every step. "Dock" shows it as the app's island.
(function () {
  const app = window.BUBBLE_APP, C = window.BubbleColors;
  const $ = id => document.getElementById(id);
  const PROJECT = 'auth-service';

  // ---- The story: a moment waiting for a prompt, then the app's scripted session.
  const beats = [{ state: 'idle', motion: 'generating', duration: 2.5, subagents: 0, detail: 'Waiting for a prompt' }, ...app.story];
  let at = 0;
  for (const b of beats) { b.start = at; at += b.duration; }
  const TOTAL = at;
  const beatAt = t => { let i = 0; beats.forEach((b, j) => { if (b.start <= t) i = j; }); return i; };

  const STATE_WORD = { idle: 'Idle', needs: 'Needs you', error: 'Failed', done: 'Done' };
  const SHORT = { generating: 'Thinking', read: 'Read', search: 'Search', edit: 'Edit', bash: 'Bash', web: 'Web', mcp: 'MCP', waiting: 'Subagents', compacting: 'Compact' };
  const wordFor = b => b.state === 'working' ? app.motions[b.motion].verb : STATE_WORD[b.state];
  const labelFor = b => b.state === 'working' ? SHORT[b.motion] : STATE_WORD[b.state] === 'Failed' ? 'Error' : STATE_WORD[b.state];
  const colorOf = s => (C[s] || C.working).css;

  // What the terminal shows for each step (the session the story tells: fixing a flaky auth test).
  const LINES = {
    read: [['⏺ Read(src/auth/session.ts)', '  ⎿ 212 lines'], ['⏺ Read(src/auth/provider.ts)', '  ⎿ 148 lines'], ['⏺ Read(test/auth.test.ts)', '  ⎿ 96 lines'], ['⏺ Read(package.json)', '  ⎿ 41 lines']],
    search: [['⏺ Grep("getSession")', '  ⎿ 14 matches in 6 files'], ['⏺ Glob("src/auth/**")', '  ⎿ 9 files']],
    edit: [['⏺ Update(src/auth/provider.ts)', '  ⎿ +12 −3'], ['⏺ Update(src/auth/session.ts)', '  ⎿ +4 −1']],
    bash: [['⏺ Bash(npm test -- auth)', '  ⎿ running…'], ['⏺ Bash(npm test -- auth)', '  ⎿ running…'], ['⏺ Bash(git push)', '  ⎿ fix/auth-session → origin']],
    web: [['⏺ Fetch(migration guide)', '  ⎿ 200 OK · 18 KB']],
    mcp: [['⏺ linear · update_issue(AUTH-212)', '  ⎿ moved to In Review']],
    waiting: [['⏺ Task × 3 in parallel', '  ⎿ tests · types · lint']],
    compacting: [['✻ Compacting conversation…']],
    generating: [['✻ Thinking…']],
  };
  const KIND = { p: 'var(--amber)', w: 'rgba(255,255,255,.88)', d: 'rgba(255,255,255,.42)', g: colorOf('done'), r: colorOf('error') };
  const used = {};
  beats.forEach((b, i) => {
    const out = [];
    if (b.endsPrevious === 'failed') out.push(['  ⎿ 2 failing · exit 1', 'r']);
    if (i === 0) { b.term = [['› ', 'p']]; return; }
    if (i === 1) out.push(['› fix the flaky auth test and ship it', 'p']);
    if (b.state === 'needs') out.push(['? Allow edit to auth.ts?', 'p'], ['  ❯ Yes   No', 'd']);
    else if (b.state === 'error') out.push([`✗ ${b.detail}`, 'r']);
    else if (b.state === 'done') out.push([`✓ Done in ${Math.round(TOTAL - beats[1].start)}s`, 'g']);
    else {
      const pool = LINES[b.motion], n = used[b.motion] = (used[b.motion] || 0) + 1;
      const pick = pool[(n - 1) % pool.length];
      pick.forEach((t, j) => out.push([t, j === 0 ? (b.motion === 'generating' || b.motion === 'compacting' ? 'd' : 'w') : (t.includes('+') ? 'g' : 'd')]));
    }
    b.term = out;
  });

  // ---- The orb (made here, after the app's palette is registered).
  const orb = document.createElement('orb-particles');
  for (const [k, v] of Object.entries({ state: 'idle', work: 'wave', outcome: 'success', palette: 'app', size: '520', interactive: 'true' })) orb.setAttribute(k, v);
  $('orbScale').appendChild(orb);
  const setOrb = (k, v) => { if (orb.getAttribute(k) !== String(v)) orb.setAttribute(k, String(v)); };

  // ---- Toasts, under the orb (or the island while docked).
  const orbToasts = new window.ToastStack($('toasts'));
  let island = null;
  const toast = (name, kind, text) => {
    const t = app.toasts[kind], life = kind === 'needs' || kind === 'error' ? 6500 : 4000;
    (view === 'dock' && island ? island.toasts : orbToasts).push(name, text || t.text, t.color, life);
  };
  const resetsIn = left => { const m = Math.round(72 * left / 100); return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`; };

  // ---- Playback.
  let t = 0, current = -1, fails = 0, ticks = 0, skills = 0, usage = 100, warnedLow = false, warnedCritical = false;
  function enter(i) {
    const b = beats[i], prev = current >= 0 ? beats[current] : null;
    if (i === 0) { fails = ticks = skills = 0; usage = 100; warnedLow = warnedCritical = false; }
    if (b.endsPrevious === 'done') { ticks++; island && island.kick(); }
    if (b.endsPrevious === 'failed') fails++;
    if (b.skill) skills++;
    // The app's toasts, on the same changes.
    const was = prev ? prev.state : 'idle';
    if (b.state === 'working' && (was === 'idle' || was === 'done')) toast(PROJECT, 'started');
    else if (b.state === 'working' && (was === 'needs' || was === 'error')) toast(PROJECT, 'resumed');
    else if (b.state !== was && (b.state === 'needs' || b.state === 'error')) toast(PROJECT, b.state);
    else if (b.state === 'done' && was !== 'done') toast(PROJECT, 'finished');
    if (b.resetsUsage) { usage = 100; toast('Usage', 'usageRefreshed', 'refreshed · 100% left'); }
    if (b.usageLeft != null) {
      usage = b.usageLeft;
      if (usage <= 10 && !warnedCritical) { warnedCritical = warnedLow = true; toast('Usage', 'usageCritical', `${usage}% left · resets ${resetsIn(usage)}`); }
      else if (usage <= 25 && !warnedLow) { warnedLow = true; toast('Usage', 'usageLow', `${usage}% left · resets ${resetsIn(usage)}`); }
    }
    if ((b.state === 'needs' || b.state === 'error' || b.state === 'done') && b.state !== was && window.BubbleSounds) window.BubbleSounds.play(b.state, 0, 300);
    setWord(wordFor(b), colorOf(b.state));
    current = i;
  }
  function seek(i) { orbToasts.clear(); island && island.toasts.clear(); current = -1; if (i === 0) enter(0); else { enter(0); for (let j = 1; j <= i; j++) enter(j); } t = beats[i].start + .01; }

  // ---- The big word, morphing letter by letter with a glitch (as in the design).
  const GL = '▓▒░█<>/\\_=+*#01:;';
  let prevWord = '', curWord = '', wordAt = 0, wordColor = '#fff', slots = [], wordRaf = 0;
  function setWord(w, color) {
    if (w === curWord) return;
    prevWord = curWord; curWord = w; wordAt = performance.now(); wordColor = color;
    const box = $('word'), nb = c => c === ' ' ? ' ' : c || '';
    box.textContent = ''; slots = [];
    for (let i = 0; i < Math.max(prevWord.length, curWord.length); i++) {
      const sl = document.createElement('span'), o = document.createElement('span'), c = document.createElement('span');
      sl.style.cssText = 'display:inline-grid;flex:none;height:.8em;justify-items:start;align-items:end';
      o.style.cssText = c.style.cssText = 'grid-area:1/1;will-change:transform,opacity';
      o.textContent = nb(prevWord[i]); c.textContent = nb(curWord[i]);
      sl.append(o, c); box.append(sl);
      slots.push({ sl, o, c, po: prevWord[i], pc: curWord[i], g: -1 });
    }
    cancelAnimationFrame(wordRaf);
    const step = () => { if (stepWord()) wordRaf = requestAnimationFrame(step); };
    step();
  }
  function stepWord() {
    const now = performance.now(), tt = (now - wordAt) / 1000, sd = Math.floor(now / 45);
    const rn = n => { const v = Math.sin(n * 12.9898 + sd * 78.233) * 43758.5453; return v - Math.floor(v); };
    let live = false;
    slots.forEach((S, ci) => {
      const { sl, o, c, po, pc } = S, p = Math.max(0, Math.min(1, (tt - ci * .03) / .5)), e = 1 - Math.pow(1 - p, 3), ip = 1 - e;
      if (po === pc || p >= 1) {
        if (!S.fin) {
          S.fin = 1; sl.style.width = pc ? 'calc(1ch - .05em)' : '0'; o.style.opacity = '0';
          c.textContent = pc === ' ' ? ' ' : pc || ''; c.style.transform = 'none'; c.style.opacity = '1'; c.style.color = '#f2f1f5'; c.style.textShadow = 'none';
        }
        return;
      }
      live = true;
      const scr = pc && pc !== ' ' && p < .6, gl = p < .7 && rn(ci * 3 + 9) > .6, dx = (ip * ip * .06 + (gl ? .03 : 0)).toFixed(3);
      sl.style.width = `calc(${((po ? ip : 0) + (pc ? e : 0)).toFixed(3)} * (1ch - .05em))`;
      o.style.transform = `translateY(${(-.3 * e).toFixed(3)}em)`; o.style.opacity = Math.max(0, 1 - p * 1.8).toFixed(3);
      if (scr) { if (S.g !== sd) { S.g = sd; c.textContent = GL[Math.floor(rn(ci * 7 + 1) * GL.length)]; } }
      else { const v = pc === ' ' ? ' ' : pc || ''; if (c.textContent !== v) c.textContent = v; }
      c.style.transform = `translate(${gl ? ((rn(ci + 77) - .5) * .08).toFixed(3) : 0}em,${(ip * .4).toFixed(3)}em)`;
      c.style.opacity = Math.min(1, .25 + e).toFixed(3); c.style.color = scr ? wordColor : '#f2f1f5';
      c.style.textShadow = `${dx}em 0 rgba(255,60,110,${(.85 * ip).toFixed(2)}), -${dx}em 0 rgba(60,220,255,${(.85 * ip).toFixed(2)})`;
    });
    return live;
  }

  // ---- The timeline's segments, one per step (back-to-back steps of the same kind share one).
  const groups = [];
  beats.forEach((b, i) => {
    const g = groups[groups.length - 1], key = b.state + ':' + (b.state === 'working' ? b.motion : '');
    if (g && g.key === key) { g.end = b.start + b.duration; } else groups.push({ key, first: i, start: b.start, end: b.start + b.duration, beat: b });
  });
  const segEls = groups.map(g => {
    const s = document.createElement('button');
    s.className = 'seg';
    s.style.width = ((g.end - g.start) / TOTAL * 100).toFixed(3) + '%';
    s.innerHTML = '<div class="seg-bar"><div class="seg-fill"></div></div><span class="seg-label"></span>';
    s.querySelector('.seg-label').textContent = labelFor(g.beat);
    s.querySelector('.seg-fill').style.background = colorOf(g.beat.state);
    s.addEventListener('click', () => seek(g.first));
    $('segs').appendChild(s);
    return s;
  });
  const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0') + '.' + Math.floor((s % 1) * 10);
  $('total').textContent = ' / ' + fmt(TOTAL);

  // ---- Orb or Dock.
  let view = 'orb', fly = null, flyCur = { dx: 0, dy: 0, k: 1 };
  const wrap = $('orbWrap'), layer = $('islandLayer');
  function base() { const r = wrap.getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width }; }
  function goal(B) {
    if (view !== 'dock' || !island) return { dx: 0, dy: 0, k: 1 };
    const s = island.orbSlot();
    return { dx: s.x - B.cx, dy: s.y - B.cy, k: app.island.orbSize / B.w };
  }
  function tickFly() {
    // Measured without our own transform, so the goal doesn't chase itself.
    const B = (() => { const tr = wrap.style.transform; wrap.style.transform = 'translate(-50%,-50%)'; const b = base(); wrap.style.transform = tr; return b; })();
    const g = goal(B);
    let c = g;
    if (fly) {
      const p = Math.min(1, (performance.now() - fly.t0) / fly.dur), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      c = { dx: fly.f.dx + (g.dx - fly.f.dx) * e, dy: fly.f.dy + (g.dy - fly.f.dy) * e, k: fly.f.k * Math.pow(g.k / fly.f.k, e) };
      if (p >= 1) fly = null;
    }
    flyCur = c;
    wrap.style.transform = `translate(-50%,-50%) translate(${c.dx.toFixed(1)}px,${c.dy.toFixed(1)}px) scale(${c.k.toFixed(4)})`;
    wrap.style.zIndex = view === 'dock' || fly ? 60 : 2;
    requestAnimationFrame(tickFly);
  }
  function setView(v) {
    if (v === view) return;
    fly = { f: flyCur, t0: performance.now(), dur: 620 };
    view = v;
    document.querySelectorAll('#modes button').forEach(b => b.classList.toggle('on', b.dataset.mode === v));
    if (v === 'dock') {
      if (!island) island = new window.Island(layer, app);
      layer.hidden = false; layer.style.opacity = 1;
      $('toasts').style.opacity = 0;
    } else {
      layer.style.opacity = 0;
      setTimeout(() => { if (view === 'orb') layer.hidden = true; }, 360);
      $('toasts').style.opacity = 1;
    }
  }
  document.querySelectorAll('#modes button').forEach(b => b.addEventListener('click', () => setView(b.dataset.mode)));

  // ---- Sound.
  let sound = false;
  $('sound').addEventListener('click', () => {
    sound = !sound;
    window.BubbleSounds && window.BubbleSounds.enable(sound);
    window.BubbleAmbient && (sound ? window.BubbleAmbient.start() : window.BubbleAmbient.stop());
    $('sound').textContent = sound ? 'Sound on' : 'Sound off';
  });

  // ---- Parallax.
  const root = $('root');
  let mraf = 0;
  root.addEventListener('mousemove', e => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    cancelAnimationFrame(mraf);
    mraf = requestAnimationFrame(() => { root.style.setProperty('--mx', x.toFixed(3)); root.style.setProperty('--my', y.toFixed(3)); });
  });

  // ---- Layout that depends on the window (the orb sits a little lower on phones).
  function place() {
    const mob = innerWidth < 640, k = .95;
    $('toasts').style.top = `calc(50% + ${Math.round(520 * k * .36) + (mob ? 34 : 0)}px)`;
  }
  addEventListener('resize', place);
  place();

  // ---- Render, about ten times a second (the orb, word and toasts animate on their own).
  function render() {
    const i = beatAt(t), b = beats[i], el = Math.max(0, t - b.start), now = performance.now();
    setOrb('state', b.state);
    setOrb('work', app.motions[b.motion].work);
    setOrb('elapsed', b.motion === 'bash' && b.state === 'working' ? el.toFixed(1) : '0');
    setOrb('subagents', b.subagents || 0);
    setOrb('fail', fails);
    setOrb('tick', ticks);
    setOrb('skill', skills);
    const col = colorOf(b.state);
    $('glow').style.background = `radial-gradient(40% 48% at 50% 40%, rgba(${(C[b.state] || C.working).rgb},${b.state === 'idle' ? .07 : .15}) 0%, rgba(4,4,9,0) 72%)`;
    for (const d of [$('dot'), $('wordDot')]) { d.style.background = col; d.style.boxShadow = `0 0 10px ${col}`; }
    $('detail').textContent = b.detail;
    $('motion').textContent = b.state === 'working' ? 'motion · ' + app.motions[b.motion].work : '';
    $('clock').textContent = fmt(t);

    // The terminal: every step so far, the current one typing out.
    const lines = [];
    for (let j = 0; j <= i; j++) beats[j].term.forEach(l => lines.push({ t: l[0], k: l[1], beat: j }));
    let budget = Math.floor(el * 70);
    const shown = lines.map(l => {
      if (l.beat !== i) return l;
      const n = Math.min(l.t.length, Math.max(0, budget)); budget -= l.t.length;
      return n === 0 && l.t.length > 0 ? null : { ...l, t: l.t.slice(0, n) };
    }).filter(Boolean).slice(-13);
    const blink = Math.floor(now / 530) % 2 === 0;
    $('term').replaceChildren(...shown.map((l, j) => {
      const d = document.createElement('div');
      d.textContent = l.t;
      d.style.color = KIND[l.k];
      d.style.opacity = Math.max(.2, 1 - (shown.length - 1 - j) * .08);
      if (j === shown.length - 1) { const c = document.createElement('span'); c.className = 'cursor'; c.textContent = '▍'; c.style.opacity = blink ? 1 : 0; d.appendChild(c); }
      return d;
    }));

    // The timeline.
    groups.forEach((g, j) => {
      const on = t >= g.start && t < g.end, played = t >= g.end, s = segEls[j];
      const fill = s.querySelector('.seg-fill');
      fill.style.width = (on ? (t - g.start) / (g.end - g.start) * 100 : played ? 100 : 0).toFixed(1) + '%';
      fill.style.boxShadow = on ? '0 0 10px ' + colorOf(g.beat.state) : 'none';
      s.querySelector('.seg-label').style.color = on ? '#fff' : played ? 'rgba(255,255,255,.42)' : 'rgba(255,255,255,.2)';
    });

    // The island: the same session, plus two more alongside it.
    if (island) island.update({
      state: b.state, label: b.detail, prompt: b.detail, project: PROJECT,
      usage: `${Math.round(usage)}% · ${resetsIn(usage)}`,
      sessions: [
        { name: PROJECT, state: b.state, msg: b.state === 'done' ? 'Completed' : b.detail, time: fmt(Math.max(0, t - beats[1].start)).slice(0, 5), tokens: Math.round(41 + t * 2.1) + '.' + (i % 10) + 'k' },
        { name: 'api-server', state: 'working', msg: 'Running tests', time: '04:12', tokens: '184k' },
        { name: 'docs-site', state: 'done', msg: 'Completed', time: '1h', tokens: '41.2k' },
      ],
    });
  }

  // ---- Start: the orb rises in, the rest fades up, and the story begins.
  root.classList.add('intro');
  wrap.style.top = `calc(50% + ${Math.round(innerHeight * .5 + 247)}px)`;
  setTimeout(() => { root.classList.remove('intro'); wrap.style.top = innerWidth < 640 ? 'calc(50% + 34px)' : '50%'; }, 350);
  enter(0);
  render();
  tickFly();
  let last = performance.now(), startAt = last + 300;
  setInterval(() => {
    const n = performance.now(), dt = Math.min(.25, (n - last) / 1000);
    last = n;
    if (n < startAt) return;
    t += dt;
    if (t >= TOTAL) { t = 0; current = -1; enter(0); }
    const i = beatAt(t);
    if (i !== current) { for (let j = current + 1; j <= i; j++) enter(j); }
    render();
  }, 100);
})();
