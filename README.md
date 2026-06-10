# hey, you :) 💌

A cute, playful single-page "will you go out with me?" experience, built in **React + TypeScript + Vite**. Three honest warm-up questions lead into the big ask — and the **"No" button slips away** from the cursor (and any tap), so the night can only end one way.

This is a faithful, pixel-for-pixel re-implementation of the `Date me.html` design prototype exported from [Claude Design](https://claude.ai/design).

## Features

- Soft blush gradient with **floating hearts** drifting up the background
- A tilted handwritten "note" card with sticker accents and doodle underlines
- **3-step build-up** (every answer leads forward) → the ask → a **confetti + hearts** finale
- The runaway **"No" / bad-answer buttons** that:
  - slip away from the cursor on hover, proximity, and any press attempt
  - bounce off the screen edges and stay full-size and visible
  - float _above_ the card (they portal to `<body>` to escape the card's clipping)
  - have a ~700 ms "settle" grace window so they never dart out from under your cursor right as you advance
- Replay button on the finale

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build locally
```

## Deploying to GitHub Pages (CI/CD)

This repo ships with a GitHub Actions workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) that builds the app and publishes it to GitHub Pages on every push to `main`.

**One-time setup:**

1. Push this project to a GitHub repository.
2. In the repo, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab). The site deploys to
   `https://<your-username>.github.io/<your-repo>/`.

### Base path

The Vite `base` is set to `'./'` (relative paths), so the build works on **any** GitHub Pages URL — including the `/<repo>/` subpath of a project page — without hard-coding the repository name.

If you instead deploy to a **custom domain** or a user/organization page served at the root (`https://<user>.github.io/`), build with:

```bash
VITE_BASE=/ npm run build
```

## Project structure

```
.
├─ .github/workflows/deploy.yml   # GitHub Pages CI/CD
├─ index.html                     # fonts + root mount
├─ vite.config.ts                 # base: './'
├─ public/.nojekyll               # let GitHub Pages serve assets as-is
└─ src/
   ├─ main.tsx                    # React entry
   ├─ index.css                   # the full design (ported verbatim)
   ├─ App.tsx                     # the six screens + flow
   └─ components/
      ├─ FloatingHearts.tsx       # drifting background hearts
      ├─ Confetti.tsx             # canvas confetti + hearts burst
      └─ EvasiveButton.tsx        # the un-catchable "No" button
```
