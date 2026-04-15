# The High Ground

Browser-based cake topper generator for Cricut and laser workflows.

## Local run

```bash
./run.sh
```

Then open [http://localhost:8080](http://localhost:8080).

## Features

- Multi-line custom text with real vector outlines from `opentype.js`
- Fat display fonts plus a script option for topper styles
- Font size, line height, letter spacing, and curved layout controls
- Paper.js boolean welding for text, supports, icons, and optional frames
- Floating-island detection with auto-bridge support
- Optional support bar, 1 or 2 sticks, and flat / rounded / pointed tips
- Decorative drag-and-snap icons welded into the final export
- Physical size display in inches and millimeters with target width scaling
- Production-oriented SVG export as a single final `<path d="...">`

## Files

- `index.html` - app shell and controls
- `styles.css` - layout and visual styling
- `app.js` - vector generation, welding, preview, and export logic
- `run.sh` - one-command local server
- `setup_git_remote.sh` - helper script to set the Git remote
