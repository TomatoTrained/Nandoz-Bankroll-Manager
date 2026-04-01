# Nandoz Bankroll Checker

This is a lightweight, single-page bankroll milestone tracker with a clean welcome screen.

## Pages

- `index.html`: Welcome screen (logo + Continue)
- `main.html`: The app (bankroll → level + stake, sidebar actions, manual bet log, notes)

## How to run

Open `index.html` in your browser.

If your browser blocks `localStorage` for local files, run a tiny local server instead (recommended). Easiest on Windows is using a “Live Server” extension (VS Code/Cursor), or Python if you have it installed:

```powershell
cd "c:\Users\joshu\Desktop\Nandoz Bankroll checker"
python -m http.server 5173
```

Then open `http://localhost:5173/`.

## Customize branding

- Replace `assets/logo.svg` with your real logo (keep the same filename).
- Replace `assets/user-icon.svg` with your preferred user icon (keep the same filename).

