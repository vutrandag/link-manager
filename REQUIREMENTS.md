# Link Manager Web App — Full Product Requirement (v2.1)

## Overview

A clean, fast-loading single-page link manager with auto-refresh and customizable info widgets.
Built for simplicity and performance using a lightweight stack. Inspired by TV link manager style.

---

## Tech Stack

- **Backend:** Node.js (Express)
- **Frontend:** Vanilla JS + Vanilla CSS (no frameworks)
- **Auth:** Google OAuth 2.0
- **No database** — all data is hardcoded JSON served via API endpoints

---

## Project Structure

```
/link-manager
  /public
    index.html
    app.js
    style.css
  /server
    server.js
    config.js
    /data
      links.json
      widgets.json
  package.json
  .env
  .gitignore
  README.md
```

---

## API Endpoints

### `GET /api/links`

Returns an array of link card objects sorted by `order`.

**Response shape:**
```json
[
  {
    "id": 1,
    "order": 1,
    "title": "GitHub",
    "description": "Code repository",
    "image": "https://example.com/github.png",
    "url": "https://github.com",
    "favorite": false
  },
  {
    "id": 2,
    "order": 2,
    "title": "Figma",
    "description": "Design tool",
    "image": "https://example.com/figma.png",
    "url": "https://figma.com",
    "favorite": true
  }
]
```

### `GET /api/widgets`

Returns an array of info widget objects.

**Response shape:**
```json
[
  {
    "id": 1,
    "type": "stock",
    "size": "medium",
    "title": "Stock Prices",
    "data": [
      { "ticker": "AAPL", "price": 189.50, "change": "+1.2%" },
      { "ticker": "GOOGL", "price": 141.80, "change": "-0.5%" },
      { "ticker": "TSLA", "price": 242.10, "change": "+3.1%" }
    ]
  },
  {
    "id": 2,
    "type": "news",
    "size": "large",
    "title": "Daily News",
    "data": [
      { "headline": "AI reaches new milestone", "source": "TechCrunch", "url": "https://techcrunch.com" },
      { "headline": "Markets rally on Fed news", "source": "Reuters", "url": "https://reuters.com" },
      { "headline": "New framework released", "source": "Dev.to", "url": "https://dev.to" }
    ]
  }
]
```

---

## Features

### 1. Link Cards

- Displayed in a responsive grid, **sorted ascending by `order` field**
- Each card contains:
  - Thumbnail image
  - Order number badge (top-left corner)
  - Title and short description
  - CTA button — opens `url` in a new tab
  - Favorite toggle (star icon) — visual only, no persistence in v1

### 2. Info Widgets

- Displayed in the same grid as link cards
- Widget **types** (extensible):
  - `stock` — renders a list of ticker, price, and change percentage
  - `news` — renders a list of headlines with source and link
- Widget **size** controls column span in the grid:

  | Size | Column Span |
  |---|---|
  | `small` | 1 column |
  | `medium` | 2 columns |
  | `large` | 3–4 columns |

- Larger widgets display richer, more detailed content

### 3. Auto-Refresh

- Silently re-fetches `/api/links` and `/api/widgets` at a configurable interval
- Configured via `REFRESH_INTERVAL` in `config.js` (default: `5000` ms)
- Supported values: `3000` (3s) or `5000` (5s) — easily adjustable
- **No full page reload** — only the data layer updates in the background
- A subtle visual indicator in the header shows a countdown or pulse animation before the next refresh

### 4. Authentication

- Google OAuth 2.0 sign-in flow
- Unauthenticated users are redirected to a clean login page with a **"Sign in with Google"** button
- Authenticated users are redirected to the dashboard
- Session persisted via a simple server-side session cookie
- Sign-out button available in the header when authenticated

---

## UI / UX

### Layout

- Single home page — no routing required
- Unified responsive CSS grid for both link cards and info widgets
- Info widgets span multiple columns based on their `size` value
- Professional, minimal aesthetic — no clutter

### Theme

- Supports **Dark mode** and **Light mode**
- Defaults to system preference via `prefers-color-scheme` media query
- Manual toggle button in the header to override

### Responsive Breakpoints

| Breakpoint | Grid Columns |
|---|---|
| Mobile `< 600px` | 1 column |
| Tablet `600px – 1024px` | 2 columns |
| Desktop `> 1024px` | 4 columns |

### Header

- App name / logo (left)
- Refresh countdown indicator (center)
- Dark / Light mode toggle (right)
- User avatar + sign-out button (right, when authenticated)

---

## Configuration

All config lives in `config.js` and is loaded from `.env`:

```js
// server/config.js
module.exports = {
  PORT: process.env.PORT || 3000,
  REFRESH_INTERVAL: process.env.REFRESH_INTERVAL || 5000, // ms
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,
}
```

```env
# .env
PORT=3000
REFRESH_INTERVAL=5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
```

---

## Dependencies (suggested)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "passport": "^0.6.0",
    "passport-google-oauth20": "^2.0.0",
    "express-session": "^1.17.3",
    "dotenv": "^16.0.3"
  }
}
```

---

## Scaffold Checklist

Use this checklist when scaffolding from CLI:

- [ ] `npm init -y`
- [ ] Install dependencies listed above
- [ ] Create `/public/index.html` — single page shell
- [ ] Create `/public/style.css` — CSS variables for dark/light, grid layout, card styles
- [ ] Create `/public/app.js` — fetch links + widgets, render grid, auto-refresh loop, theme toggle
- [ ] Create `/server/config.js` — load env vars
- [ ] Create `/server/data/links.json` — hardcoded link card data (min. 6 items)
- [ ] Create `/server/data/widgets.json` — hardcoded widget data (1 stock, 1 news)
- [ ] Create `/server/server.js` — Express app, Google OAuth routes, API routes, static file serving
- [ ] Create `.env` — fill in Google OAuth credentials
- [ ] Create `.gitignore` — ignore `node_modules`, `.env`
- [ ] Test `/api/links` and `/api/widgets` return correct JSON
- [ ] Test Google OAuth login and session
- [ ] Test auto-refresh silently updates data
- [ ] Test dark/light mode toggle
- [ ] Test responsive layout on mobile, tablet, desktop

---

## Out of Scope (v1)

- No database or persistent storage
- No admin panel or link editing via UI
- No drag-and-drop reordering
- No real-time data via WebSocket or SSE
- No deployment configuration (Docker, CI/CD)
- No unit or integration tests

---

## Future Considerations

- Swap hardcoded JSON with real external API endpoints configurable via `.env`
- Persist favorites to `localStorage` or a database
- Add drag-and-drop reordering for link cards
- Add more widget types: weather, calendar, RSS feed, crypto prices
- Role-based access control (admin vs viewer)
- PWA support for offline access and home screen install