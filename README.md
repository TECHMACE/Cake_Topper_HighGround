# Cake_Topper_HighGround

An early static-browser prototype for a text cake-topper preview and SVG download. This repository contains the original small HTML/CSS/JavaScript sample; the separate [Cake_Topper](https://github.com/TECHMACE/Cake_Topper) repository contains the more developed React/Vite application.

## Current status

Source reviewed October 20, 2026. This prototype is **not ready for production cutting**. Its render function calls `PointText.toPath()`, which is not provided by the Paper.js 0.12.18 version loaded by `index.html`. The included OpenType.js script is not yet used to load a font and convert glyphs into outlines. That conversion must be implemented before the preview/export workflow can work as intended.

The audit checked JavaScript and shell syntax and confirmed the missing Paper.js method against version 0.12.18. It did not validate a successful browser export or a physical cut. No application behavior was changed in this documentation update.

## Inspect the prototype locally

From this repository, with Python 3 installed:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open `http://127.0.0.1:8080` and stop the server with Ctrl-C. `bash run.sh 8080` is also available, using Python's default server binding. The page loads Paper.js and OpenType.js from a CDN, so those dependencies require network access; OpenType.js currently uses an unpinned `latest` URL.

## Files

- `index.html` — text input, download button, canvas and dependency scripts.
- `app.js` — intended text rendering and SVG export; contains the conversion issue above.
- `styles.css` — page and canvas layout.
- `run.sh` — optional Python HTTP-server wrapper, default port 8080.

There is no build system, automated test suite or packaged release in this repository. Keep its prototype source separate from the React application unless an explicit migration is undertaken.
