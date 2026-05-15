```markdown
# Session Snapshot: Gomoku Optimization & Stability [2026-05-16]

## 1. Architectural Core
- **Source of Truth**: Java backend (Spring Boot) manages authoritative game state, turn timers (ScheduledExecutorService), and room sessions.
- **State Sync**: React frontend synchronizes with `turnStartTime` (ms) and `turnDuration` (default 60s) for predictive circular timer rendering.
- **Turn Logic**: Explicit `turnSymbol` ('X' or 'O') derived from history length drives UI coloring, decoupling state from race conditions.
- **Identity Management**: Anonymous sessions with randomly generated usernames (ADJECTIVES × ANIMALS). No `localStorage` persistence.

## 2. Design System & UX
- **Theme Engine**: Tailwind 4.0 with CSS variables in `index.css`. Glassmorphism (backdrop-blur, glass-bg) applied globally via `.glass-card`.
- **Input Stability**: Centralized `--color-input-bg` and `--color-input-focus` tokens ensure consistent light/dark mode behavior on focus without utility conflicts.
- **Responsive Breakpoints**: 
  - **<425px**: Ultra-compact header. Scores as `X: 0`. Exit text hidden.
  - **768px - 1024px**: Initial-based names (e.g., "Swift Dragon" -> "SD").
  - **>1024px**: Full usernames and "20x20 Arena" badge.

## 3. Critical Logic Refinements (Current Session)
- **Timeout Logic**: `TimeoutWarning` visibility now strictly requires `startTime > 0`. Prevents the yellow/red vignette from appearing on the Information Screen due to stale or default state.
- **State Initialization**: Default `turnDuration` in `App.tsx` corrected to 60s to align with backend constants and prevent premature warning triggers.
- **Winning Effects**: SVG `<motion.line>` strike-through with path-length animation (0.8s) and symbol-matched glow effects.

## 4. Current State (Git: master)
- **Frontend**: Optimized for iPhone 12 Pro (390px) up to 4K Desktop. All header controls (Drawer, Scores, Timer, Theme, Exit) fit without overflow.
- **Backend**: Robust room lifecycle and 4-thread pool timer management.
- **Deployment**: Docker-compose ready; Nginx configured for WSS/SSL.

## 5. Next Step Logic
- **UI Consistency**: Review and update Winner/Exit modals to use initials abbreviation logic for mobile consistency.
- **Component Audit**: Scan other interactive components for hardcoded `dark:focus` utilities and migrate them to the new CSS token system.
- **UX Polish**: Implement "Draw" request capability for Multiplayer mode.
```
