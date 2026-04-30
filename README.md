# Link Manager

A clean, fast-loading single-page link manager with auto-refresh and customizable info widgets. Built with Node.js + Express, Vanilla JS/CSS, and Google OAuth 2.0.

## Features

- 🔗 **Link Cards** — Responsive grid of bookmarked links with thumbnails, descriptions, and favorite toggles
- 📊 **Info Widgets** — Stock prices and news headlines displayed alongside your links
- 🔄 **Auto-Refresh** — Silently re-fetches data at a configurable interval (default: 5s)
- 🌗 **Dark / Light Mode** — Follows system preference, with a manual toggle
- 🔐 **Google OAuth 2.0** — Secure sign-in, no passwords

## Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** Vanilla JS + Vanilla CSS
- **Auth:** Google OAuth 2.0 via Passport.js
- **Data:** Hardcoded JSON (no database)

## Project Structure

```
link-manager/
├── public/
│   ├── index.html      # Dashboard shell
│   ├── login.html      # Sign-in page
│   ├── app.js          # Client-side logic
│   └── style.css       # Styles (dark/light, responsive grid)
├── server/
│   ├── server.js       # Express app, OAuth routes, API endpoints
│   ├── config.js       # Environment config
│   └── data/
│       ├── links.json  # Link card data
│       └── widgets.json # Widget data
├── .env                # Environment variables (not committed)
├── .gitignore
└── package.json
```

## Getting Started

### Prerequisites

- Node.js v18+
- A Google Cloud project with OAuth 2.0 credentials ([create one here](https://console.cloud.google.com/apis/credentials))

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the `.env` file and fill in your credentials:

```env
PORT=3000
REFRESH_INTERVAL=5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=any_random_secret_string
```

To get Google OAuth credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new **OAuth 2.0 Client ID** (Web application)
3. Add `http://localhost:3000/auth/google/callback` as an **Authorized redirect URI**
4. Copy the Client ID and Client Secret into `.env`

### 3. Start the server

```bash
node server/server.js
```

The app will be available at **http://localhost:3000**.

## Usage

### Signing In

Navigate to `http://localhost:3000` — you'll be redirected to the login page. Click **Sign in with Google** to authenticate.

### Dashboard

After signing in you'll see:

- **Link cards** — sorted by `order`. Click **Open →** to visit a link in a new tab. Click the ★ star to toggle a favorite (visual only).
- **Widgets** — stock prices and news headlines displayed in the same grid.
- **Auto-refresh indicator** — the header shows a countdown to the next silent data refresh.

### Theme Toggle

Click the sun/moon icon in the top-right header to switch between dark and light mode. Your preference is saved in `localStorage`.

### Sign Out

Click **Sign out** in the top-right header.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `REFRESH_INTERVAL` | `5000` | Auto-refresh interval in milliseconds |
| `GOOGLE_CLIENT_ID` | — | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | — | Google OAuth Client Secret |
| `SESSION_SECRET` | — | Secret used to sign session cookies |

## Customising Data

### Adding / editing links

Edit `server/data/links.json`. Each entry follows this shape:

```json
{
  "id": 1,
  "order": 1,
  "title": "GitHub",
  "description": "Code repository and version control",
  "image": "https://github.githubassets.com/favicons/favicon.png",
  "url": "https://github.com",
  "favorite": false
}
```

Restart the server after saving.

### Adding / editing widgets

Edit `server/data/widgets.json`. Supported types: `stock`, `news`. Widget `size` controls column span: `small` (1 col), `medium` (2 cols), `large` (4 cols).

Restart the server after saving.

## API Endpoints

All endpoints require authentication (redirect to `/login` if not signed in).

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/links` | Returns link cards sorted by `order` |
| `GET` | `/api/widgets` | Returns info widgets |
| `GET` | `/api/config` | Returns `{ refreshInterval }` |
| `GET` | `/api/user` | Returns signed-in user info |
| `GET` | `/auth/google` | Initiates Google OAuth flow |
| `GET` | `/auth/google/callback` | OAuth callback |
| `GET` | `/auth/logout` | Signs out and redirects to `/login` |
