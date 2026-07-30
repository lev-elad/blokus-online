# Blokus

A web version of the board game **Blokus** — built as a **Blokus Duo** (2-player) game you
play by placing pieces on a shared board. Local hotseat play works today; online multiplayer
and a bot opponent are planned (see the roadmap).

- **14×14 board**, one colour per player, two start cells near the centre.
- Each player owns the **21 polyominoes** of size 1–5 (89 squares in total).
- Every new piece must touch one of your own pieces **corner-to-corner** and **never edge-to-edge**;
  your first piece must cover your start cell.
- Scoring: −1 per leftover square, **+15** for placing all 21 pieces, **+5** more if your last
  piece was the single square. Highest score wins.

## How to play

1. Click a piece in your tray to select it.
2. Rotate / flip it with the on-screen buttons or the keyboard:
   - <kbd>R</kbd> rotate right · <kbd>E</kbd> rotate left · <kbd>F</kbd> flip · <kbd>Esc</kbd> deselect
3. Move over the board — a live preview shows **green** where the move is legal and **red** where it isn't.
4. Click to drop the piece. Play alternates until neither player can move.

## Getting started

```bash
npm install      # install all workspaces
npm run dev      # start the client at http://localhost:5173
```

Other scripts (run from the repo root):

```bash
npm test         # run the engine's unit tests (vitest)
npm run typecheck   # type-check every workspace
npm run build    # production build of the client
npm run lint     # lint
```

## Project structure

This is an npm-workspaces monorepo. The game rules live in a **pure, framework-agnostic engine**
that the browser uses today and the server will reuse as the authoritative referee for online play.

```
blokus-online/
├── packages/engine/   @blokus/engine — pieces, board, rules, scoring (no React/Node deps)
├── client/            React + Vite + TypeScript UI
└── server/            Node stub — becomes the Socket.IO game server in the online phase
```

- **`packages/engine`** — the single source of truth for the rules. Pieces and their orientations,
  placement validation (corner-touch / no-edge-touch / first-move start cell), legal-move
  enumeration, immutable game state with turn/pass/end handling, and scoring. Fully unit-tested.
- **`client`** — a [Zustand](https://github.com/pmndrs/zustand) store wraps the engine; components
  render the board, tray, controls, scoreboard, and end-game modal.

## Roadmap

- [x] **M1** — Game engine (rules + scoring), fully tested
- [x] **M2** — Local 2-player hotseat with drag-to-place UI
- [ ] **M3** — Online 2-player over Socket.IO (server validates every move; MongoDB when persistence is needed)
- [ ] **M4** — Optional bot opponent

## Tech

React 19 · TypeScript · Vite · Zustand · Vitest · Node (server, later) · MongoDB (later)
