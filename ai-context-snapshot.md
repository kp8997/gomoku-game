```markdown
# Session Snapshot: Gomoku Optimization & Stability [2026-05-14]

## 1. Architectural Core
- **Source of Truth**: The Java backend (GameController) manages the authoritative game state, turn timers (ScheduledExecutorService), and room sessions.
- **State Sync**: Frontend (React) synchronizes with `turnStartTime` (ms) and `turnDuration` (60s) for predictive local timer rendering.
- **Turn Logic**: Explicit `turnSymbol` ('X' or 'O') is used to drive UI coloring and validation, decoupling turn state from history length to prevent race conditions.
- **Identity Management**: Anonymous sessions with randomly generated usernames. Names are persisted in memory on the backend per room but never in `localStorage` on the frontend.

## 2. Established Constraints & Patterns
- **Responsive Header**: 
  - **Mobile (<425px)**: Ultra-compact. Scores show 'X: 0', 'O: 0'. Timer labels hidden.
  - **Tablet (768px - 1024px)**: Names abbreviated to initials (e.g., "Swift Dragon" -> "SD"). Horizontal layout.
  - **Desktop (>1024px)**: Full names ("Player X" or custom username).
- **Single Mode**: 
  - Labels strictly "Player X" and "Player O".
  - Victory as either symbol counts as a local "Win" for the user.
- **Design System**: Tailwind 4.0 with glassmorphism (backdrop-blur, glass-bg). Fixed input focus bugs where light mode inputs turned dark on focus.

## 3. Critical Fixes & Logic Refinement
- **Header Synchronization**: Initializing `scores` with 0 for every joined player ensures names appear in the header immediately, even before any wins.
- **Join Sequence**: `JOIN` message now sets `GameMode` before `addSession` to prevent placeholder "Player X/O" names from leaking into Multiplayer rooms.
- **Timeout Win**: Artificial delays removed for timeout victories; 3.5s delay preserved for 5-in-a-row to allow line animation.
- **Move Deduplication**: Frontend filters duplicate WebSocket `MOVE` messages to prevent double-processing.

## 4. Current State (Git: master)
- **Frontend**: Fully optimized for iPhone 12 Pro (390px) and Tablet (768px). All header controls (Drawer, Scores, Timer, Theme, Exit) fit adequately.
- **Backend**: Robust room lifecycle and timer management.
- **Deployment**: Docker-compose production ready.

## 5. Next Step Logic
- **UI Consistency**: Ensure all modals (Winner, Exit) respect the same responsive abbreviation patterns as the header.
- **Feature Expansion**: Consider implementing "Draw" requests or "Undo" functionality (Single Mode only).
- **Performance**: Monitor WebSocket heartbeat overhead on low-bandwidth mobile connections.
```
