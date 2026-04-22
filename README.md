# Pokédeck — Pokemon TCG deck lab

Full-stack workspace for building Pokemon TCG decks, pulling lists from the live card database and meta sources, and (in progress) running automated play experiments to reason about deck strength and format health.

## What’s in the repo

| Area | Role |
|------|------|
| [frontend/](frontend/) | React + Vite app: card search, deck builder, saved decks, meta/import flows |
| [backend/](backend/) | FastAPI API: Pokemon TCG API proxy with optional Redis cache, deck CRUD, meta deck helpers |

See each folder’s README for install and run commands.

## App design

The UI is built around a **library + workspace** split:

- **Left column** — discovery and reuse: **Card Library** (search and add to the active deck), **My Saved Decks**, and **Find & Import Decks** (meta lists and imports). Loading a deck fills the builder without losing the ability to tweak card-by-card.
- **Right column** — **Active Deck**: a focused strip for the list you are editing (counts, drag-and-drop ordering, stats). The layout keeps “where do I get cards?” separate from “what am I building right now?”
- **Header** — global actions including **Start Simulation** / **Watch** placeholders for LangGraph-style match replay once the play loop is wired up.

Data flows through TanStack Query and a dev **proxy** (`/api` → backend on port 8000) so the browser always hits same-origin URLs.

## Research direction: agents for matchups and balance

The longer-term goal is to use **software agents** as repeatable opponents and teammates in a simplified (or rules-faithful) play environment:

- **Deck A vs deck B** — pit meta lists, imported tournament decks, or fully custom lists against each other many times with fixed or sampled policies.
- **“What makes a deck good?”** — aggregate outcomes (win rate, prize trade, setup consistency, bad matchups) instead of one-off human intuition.
- **Format imbalance** — if the same archetype wins across a wide grid of opponents and policies, that becomes evidence of a structural advantage; agents make it cheaper to stress-test before and after hypothetical bans or rule tweaks.

The agent is not a replacement for human high-level play; it is a **scalable stress test** and logging surface so experiments are reproducible and comparable.

## Planned: graph neural networks (GNN) on card synergy

After enough agent trials produce structured logs (decks, card co-occurrence, in-game roles, outcomes), the plan is to add **GNN-based models** that operate on a graph whose nodes are cards (and possibly card types or tags) and whose edges reflect co-play and interaction signals from those trials. The aim is to learn whether **certain combinations of cards tend to succeed together** in the simulator, complementing raw win rates with relational structure. That layer would feed back into suggestions, anomaly detection (combinations that look strong in sim but weak in practice, or the reverse), and richer balance discussion.

## Status

Core builder and API paths are usable; **simulation, agent endpoints, and GNN work are roadmap items** and will grow alongside logged match data from the play environment.
