# Pokemon Deck Builder (Frontend)

React + TypeScript + Vite UI for searching Pokemon TCG cards, building and saving decks, importing lists, and browsing meta deck lists. It talks to the local FastAPI backend through a dev proxy.

## Requirements

- Node.js 18+ (or another runtime compatible with the Vite version in `package.json`)

## Install and run

From the `frontend` directory:

```bash
npm install
npm run dev
```

The app is served at [http://localhost:5173](http://localhost:5173).

## API proxy

`vite.config.ts` proxies requests from `/api` to `http://localhost:8000` and strips the `/api` prefix so the backend sees paths like `/cards` and `/decks`. Start the [backend README](../backend/README.md) API on port **8000** before using features that need the server.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck and production build to `dist/` |
| `npm run preview` | Preview the production build locally |

## Stack

React 18, TanStack Query, Axios, Tailwind CSS 4, Vite 5, `@dnd-kit` for drag-and-drop, Recharts for deck stats.
