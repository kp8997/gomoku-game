```markdown
# Session Snapshot: Lobby Dashboards & Unified Page Headers [2026-05-19]

## 1. Architectural Decisions & Changes
- **Redirect Loop Resolution**: Resolved the authenticated page redirect loop inside `App.tsx` by replacing the rigid effect with a `sessionStorage` flag (`hasRedirectedAuthLanding`), enabling authenticated players to navigate from `/history` or `/settings` to `/` (game arena) cleanly.
- **Unified Global Header**: Deprecated duplicated static `<header>` blocks in `MatchHistoryPage.tsx` and `SettingsPage.tsx` in favor of the global `<Header>` component. Updated `HeaderProps` to make game-specific variables (like timer and scores) optional.
- **Navigation Enhancements**: Integrated `backPath` and `backLabel` props inside the `<Header>` component to allow smooth navigations between `/settings`, `/history`, and the `/` game lobby arena.
- **Lobby Dashboard (`AuthInformationScreen`)**: Created and integrated a gorgeous glassmorphic pre-game lobby dashboard specifically for authenticated players on `/`. It displays profile details, glowing online indicators, a self-contained live Wins/Losses/Win Rate stats widget (fetched from `/api/user/stats`), and navigation shortcuts.

## 2. Established Constraints
- **TypeScript Strict Mode**: Strictly avoid unused variables or imports to prevent Rolldown/TSC build failures in the Docker pipeline.
- **Optional Header Props**: All game-specific parameters in the global `<Header>` are optional (`?`) to prevent mock data overhead when rendering headers on non-game dashboard pages.

## 3. Variable Mappings & Core Logic
- **`sessionStorage.getItem('hasRedirectedAuthLanding')`**: Boolean tracker that ensures the initial landing redirect to `/history` only fires once per browser session.
- **Self-Contained Fetching**: `AuthInformationScreen` directly handles fetch requests to `authApi.getStats(token)` inside a unified `useEffect` loop, preventing parent component re-renders.

## 4. Next Step Logic
- **Online Matchmaking**: Ready to integrate global multiplayer lobbies under the disabled "Online" network buttons when the backend matchmaking brokers are deployed.
- **Profile Customization Expansion**: Extend the base settings dashboard to allow custom themes or cursor effects for authenticated players.
```
