# 😐 Don't Laugh Challenge

A browser-based "Don't Laugh" challenge game using real-time face detection.
The webcam watches your face — if you smile/laugh too much, you lose!

## How It Works

- **face-api.js** (built on TensorFlow.js) runs entirely in your browser
- It detects your face and measures `happy` expression score (0–1)
- If your score goes above **70%** during a round → YOU LOSE
- All processing is **local** — no video is sent to any server

## Project Structure

```
dont-laugh-challenge/
├── index.html       ← Main app (open this in browser)
├── app.js           ← Game logic + face detection
└── README.md        ← This file
```

## How to Run

### Option A: Simple (just open the file)
> ⚠️ Some browsers block webcam when opening local files directly.

Open `index.html` in Chrome/Firefox. You may need to allow camera permissions.

### Option B: Local server (recommended)

**With Python (easiest):**
```bash
cd dont-laugh-challenge
python3 -m http.server 8080
# Open: http://localhost:8080
```

**With Node.js:**
```bash
npx serve .
# or
npx http-server . -p 8080
```

**With VS Code:**
Install the "Live Server" extension → right-click `index.html` → "Open with Live Server"

## Adding Your Own Memes

1. Click **"+ Upload"** or drop an image in the upload area
2. Your image appears in the sample grid
3. Select it and start a challenge!

## Technologies Used

| Tool | Purpose |
|------|---------|
| face-api.js | Face + emotion detection (free, open source) |
| TensorFlow.js | ML backend (runs in browser) |
| Vanilla JS | Game logic |
| HTML/CSS | UI — no frameworks |

## Customization

In `app.js`, you can tweak:
```js
laughThreshold: 0.70,      // Lower = harder (e.g. 0.50)
challengeDuration: 10000,  // ms per round (10s default)
```

## No Server Needed!

Everything runs in the browser. The only internet connection needed is to
load face-api.js models from jsDelivr CDN on first load.

After that, you can host this for FREE on:
- GitHub Pages
- Netlify (drag & drop)
- Vercel

## Privacy

✅ No video is ever uploaded or stored.
✅ All AI processing runs locally in your browser.
