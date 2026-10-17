# Bubble — website

The site for [Bubble](https://github.com/BrentWMiller/claude-bubble), the macOS orb that shows what your Claude Code
sessions are doing.

It plays the app's own scripted session on a live particle orb. Switch to **Dock** to see it as the app's island.

## Run it

It's a static site with no build step:

```sh
python3 -m http.server 4517   # then open http://127.0.0.1:4517
```

## Staying in step with the app

`data/app.js` comes from the app. It holds the session the setup demo plays, the Claude colours, each motion's
name and words, the toasts' wording and colours, and the island's sizes. After changing any of those in the app,
refresh it:

```sh
scripts/sync-from-app.sh   # expects the app at ../claude-bubble (or set CLAUDE_BUBBLE_REPO)
```

The orb (`js/vendor/orbParticles.js`) and the sounds come from the original Bubble designs. The app's Metal orb was
ported from the same design.

## Share image and icon

`og.png` (1200×630, used for link previews) and `apple-touch-icon.png` are screenshots of `scripts/share/index.html`
and `scripts/share/icon.html`, which use the site's real orb and the app's colours. To remake them, serve the site
and capture those pages at 1200×630 and 180×180.
