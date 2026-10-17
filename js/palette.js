// The app's own Claude theme (from data/app.js, exported by the app) as a palette the orb can use: "app".
(function () {
  const app = window.BUBBLE_APP;
  if (!app || !window.OrbPalettes) return;
  const P = {};
  for (const [state, c] of Object.entries(app.palette)) P[state] = { C1: c.C1, C2: c.C2, C3: c.C3, H: c.H };
  P.voice = P.working;
  window.OrbPalettes.app = P;

  // Hex and rgb strings for the page (glow, dots, pips) from the same colours.
  const rgb = c => c.map(v => Math.round(v * 255));
  window.BubbleColors = {};
  for (const [state, c] of Object.entries(app.palette)) {
    const [r, g, b] = rgb(c.swatch);
    window.BubbleColors[state] = { css: `rgb(${r},${g},${b})`, rgb: `${r},${g},${b}` };
  }
})();
