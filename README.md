# Sarah Johnson — Digital Business Card

Premium, mobile-first digital business card for **Sarah Johnson**, Miami real estate agent. Tap to connect via WhatsApp, save a vCard, share a QR code, watch a YouTube introduction, and install as a PWA.

**Stack:** HTML5 · CSS3 · Vanilla JavaScript · PWA · No framework · No build step

---

## GitHub repository description (150 characters)

Use this as your **GitHub repo description** (exactly 150 characters):

```text
Sarah Johnson's Miami real estate digital card—save contact, WhatsApp, QR, YouTube intro & home-screen PWA. Premium gold UX, mobile-first.
```

---

## Live demo checklist

Before sharing the link, confirm on a real phone:

| Flow | Expected |
|------|----------|
| Portrait + play button | Opens video modal; YouTube plays after tap |
| Close video | Playback stops; reopen loads again |
| WhatsApp tile | Opens WhatsApp chat |
| Call icon (WhatsApp tile) | Opens phone dialer |
| Copy (email / WhatsApp) | Copies + screen reader feedback |
| Save / Share (title row) | vCard download / native share or copy link |
| QR button | Modal opens; download works if `assets/MYQR.png` exists |
| Add to Home Screen banner | Appears on supported browsers (HTTPS) |
| 320px width | No horizontal scroll; readable layout |

---

## Project structure

```text
├── index.html              # Entry point
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service worker (offline shell)
├── vercel.json             # Vercel headers & static config
├── robots.txt
├── sitemap.xml             # Update <loc> after deploy
├── data/
│   ├── card.json           # Owner data, video, share URL
│   └── labels.json         # EN / AR copy
├── styles/
│   ├── main.css
│   ├── modal.css
│   └── responsive.css
├── scripts/
│   ├── app.js
│   ├── video-handler.js
│   └── version-config.js   # Cache-busting versions
└── assets/
    ├── MYQR.png            # Required for QR feature (add before go-live)
    └── favicon-logo.svg
```

---

## Deploy to GitHub + Vercel

### 1. Create the GitHub repository

```bash
cd V0
git init
git add .
git commit -m "Initial commit: Sarah Johnson digital business card"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Import on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import your GitHub repository
3. **Framework Preset:** Other  
4. **Root Directory:** `.` (project root)  
5. **Build Command:** leave empty  
6. **Output Directory:** `.` (static files at root)  
7. Click **Deploy**

Vercel serves `index.html` at `/` over **HTTPS** (required for service worker, share API, and install prompt).

### 3. Post-deploy configuration (required)

After the first deploy, copy your live URL (e.g. `https://sarah-johnson-card.vercel.app`).

**A. `data/card.json`**

```json
"shareUrl": "https://YOUR-PROJECT.vercel.app"
```

**B. `sitemap.xml`**

Replace `YOUR-VERCEL-URL` in `<loc>` with your live URL.

**C. Optional custom domain**

Vercel → Project → **Settings** → **Domains** → add domain, then set `shareUrl` to that domain.

**D. QR code**

Add your scannable QR image at:

```text
assets/MYQR.png
```

Commit, push; Vercel redeploys automatically.

**E. Cache bust after content changes**

Increment versions in `scripts/version-config.js`:

- `CSS_VERSION` / `MODAL_CSS_VERSION` — CSS changes  
- `JS_VERSION` — `app.js` changes  
- `VIDEO_HANDLER_VERSION` — `video-handler.js` changes  
- `sw.js` — bump `CACHE_NAME` (e.g. `dbc-gm-v18`)

### 4. Verify production

1. Open live URL on **iPhone Safari** and **Android Chrome**
2. DevTools → **Network**: YouTube iframe loads **only after** opening the video modal
3. Install PWA → open from home screen → retest video + contacts
4. Hard refresh once after deploy (`Ctrl+Shift+R`) to pick up new service worker

---

## Local development

HTTPS features (service worker, install banner) need a local server, not `file://`:

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve -p 8080
```

Open `http://localhost:8080`

---

## Customize content

| What | Where |
|------|--------|
| Name, contacts, video URL | `data/card.json` |
| Modal copy, EN/AR, specialty chips | `data/labels.json` |
| Language (`en` / `ar`) | `card.json` → `"lang"` |
| Brand colors | `styles/main.css` → `:root` |
| YouTube embed | `card.json` → `showcaseVideo.embedUrl` or iframe `data-src` in `index.html` |

**YouTube embed format (recommended):**

```text
https://www.youtube.com/embed/VIDEO_ID?playsinline=1&rel=0&modestbranding=1
```

---

## Mobile & PWA notes

- **viewport-fit=cover** + safe-area padding for notched devices  
- **44px** minimum touch targets on actions  
- Video modal uses **`transform: none`** so iOS Safari renders YouTube correctly  
- iframe uses **`data-src` only** until modal opens (lazy load)  
- Canonical / Open Graph URLs set at runtime from `shareUrl` or current origin  

---

## Security & performance (Vercel)

`vercel.json` sets:

- `X-Content-Type-Options: nosniff`  
- `Referrer-Policy: strict-origin-when-cross-origin`  
- Short cache on `sw.js`; long cache on versioned `/styles/*` and `/scripts/*`  

---

## License & credits

**Project:** EOPeak Corporate Design  
**Engineering:** Eng. Eslam Osama Saad  

---

## Support

For deployment issues: confirm HTTPS, `shareUrl` in `card.json`, and `assets/MYQR.png` present. For stale assets, bump `version-config.js` and `CACHE_NAME` in `sw.js`, then redeploy.
