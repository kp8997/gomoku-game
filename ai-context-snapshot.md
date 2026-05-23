# Session Snapshot: Timer Bug Fixes, Connection Keep-Alive & Cosmetic Effects Expansion [2026-05-23/24]

## 1. Architectural Decisions & Changes

### Timer & Connection Infrastructure
- **Stale Closure Fix**: `App.tsx` STOMP callback captured `username`, `mySymbol`, `gameMode` from initial render (always `''`, `null`, default). Fixed by introducing `usernameRef`, `mySymbolRef`, `gameModeRef` that stay synced via `useEffect` — STOMP handler now reads from refs.
- **STOMP Heartbeats**: Configured bidirectional 10s heartbeats in `WebSocketConfig.java` (`setHeartbeatValue(new long[]{10000, 10000})`), 20s send time limit, 512KB buffer. Frontend mirrors with `client.heartbeat.outgoing/incoming = 10000`.
- **Auto-Reconnect**: `SockJS` + `Stomp.over` creation moved **inside** `connectToBackend()` to produce a fresh socket on reconnection. Reconnects on any disconnect with 3s delay.
- **Disconnect Timer Pause**: Backend `GameRoom` tracks `pausedAt` (ms). On disconnect, timer pauses; on reconnect when `canPlay == true`, elapsed paused duration shifts `turnStartTime` forward and timer resumes with accurate remaining time. Frontend sets `isGameOver={!!winner || (gameMode === 'MULTIPLE' && playerCount < 2)}`.
- **First-Move Timer Grace**: Backend `handleMove` checks `nextPlayerHasMoved` before calling `startTurnTimer`. If it's a player's opening move, `turnStartTime(0)` is set and no scheduled timeout fires — unlimited time for the first move.

### Cosmetic Effects System Expansion
- **SymbolEffect Enum (Current State)**: 10 effects with progressive win milestones:
  - `FIRE_PHOENIX` (20) → `DRAGON_LIGHTNING` (30) → `HEART_FLUTTER` (40) → `CHERRY_BLOSSOM` (50) → `NATURE_LEAF` (60) → `VIBRANT_FIRE` (70) → `OCEAN_SPLASH` (80) → `COSMIC_NEBULA` (90) → `DARK_SLASH` (100) → `AURORA_BOREALIS` (110)
- **WIN_MILESTONES Array**: `{10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 150, 200, 250, 300, 400, 500, 750, 1000}`
- **Frontend EffectType**: `'FIRE_PHOENIX' | 'DRAGON_LIGHTNING' | 'HEART_FLUTTER' | 'CHERRY_BLOSSOM' | 'NATURE_LEAF' | 'VIBRANT_FIRE' | 'OCEAN_SPLASH' | 'COSMIC_NEBULA' | 'DARK_SLASH' | 'AURORA_BOREALIS' | null`
- **AchievementPanel**: Total effects count now **dynamic** (`data.effects.length`) instead of hardcoded `4`.
- **SymbolRenderer**: All 10 effects lazy-loaded with `React.lazy()` and registered in switch-case.

### Effect Color Palettes (Source of Truth)
| Effect | X Color | O Color | Particle/Style |
|:---|:---|:---|:---|
| **Fire Phoenix** | Orange/Red | Orange/Red | Ember rise particles |
| **Dragon Lightning** | Cyan (`#22d3ee`) | Purple (`#c084fc`) | SVG lightning bolt arcs |
| **Heart Flutter** | Yellow (`#eab308`) | Yellow (`#eab308`) | Flying heart clip-path particles |
| **Cherry Blossom** | Rose-300 | Red-500 | CSS petal shapes |
| **Nature Leaf** | Teal (`#0d9488`) | Crimson (`#be123c`) | Leaf shapes with glowing drop-shadows, 7 particles |
| **Vibrant Fire** | Fire core + yellow dash | Fire core + white flame | Rotating sunshine + fire flicker |
| **Ocean Splash** | Indigo (`#4f46e5`) | Cyan (`#0891b2`) | Teardrop water droplets |
| **Cosmic Nebula** | Fuchsia (`#d946ef`) | Gold (`#eab308`) | 4-pointed SVG twinkling stars |
| **Dark Slash** | Indigo (`#4f46e5`) | Red (`#dc2626`) | Sharp line slash |
| **Aurora Borealis** | Emerald (`#10b981`) | Fuchsia (`#d946ef`) | Shifting gradient aura + shimmer dust |

### Winning Line Colors (MainGame.tsx SVG)
Each effect has a dedicated `case` block in the winning line switch rendering 3-layer SVG `<motion.line>` elements (blur glow → core stroke → dashed detail).

## 2. Established Constraints
- **Ref-Based STOMP Callbacks**: All state accessed inside STOMP `onMessage` must use `useRef` to avoid stale closures.
- **Heartbeat Keep-Alive**: Backend and frontend must both have heartbeats enabled (10s/10s) to prevent silent connection drops after 30-60s idle.
- **Timer Pause on Disconnect**: `pausedAt` must be set on disconnect and cleared on reconnect. `turnStartTime` must be shifted forward by the paused duration.
- **First-Move Exemption**: No timer fires until a player has made at least one move in the match.
- **Effect Registration Checklist** (for adding new effects):
  1. `SymbolEffect.java` — add enum value with `WINS_N` key
  2. `AchievementService.java` — add `N` to `WIN_MILESTONES`
  3. `seed.sql` — add `'WINS_N'` to admin seeding array
  4. `types.ts` — add key to `EffectType` union
  5. `effects.css` — add keyframe animations and utility classes
  6. `{EffectName}Effect.tsx` — create React component
  7. `SymbolRenderer.tsx` — lazy-load import + switch case
  8. `MainGame.tsx` — add winning line case block

## 3. Files Modified This Session

### Backend
| File | Change |
|:---|:---|
| `WebSocketConfig.java` | STOMP heartbeats (10s), send time limit (20s), buffer (512KB) |
| `GameController.java` | `pausedAt` disconnect logic, `nextPlayerHasMoved` first-move timer exemption |
| `SymbolEffect.java` | Added `HEART_FLUTTER`, `NATURE_LEAF`, `VIBRANT_FIRE`, `OCEAN_SPLASH`, `COSMIC_NEBULA`, `AURORA_BOREALIS` |
| `AchievementService.java` | WIN_MILESTONES now includes 40, 60, 70, 80, 90, 110 |

### Frontend
| File | Change |
|:---|:---|
| `App.tsx` | Refs for stale closure, STOMP heartbeats, auto-reconnect, disconnect pause |
| `TurnTimer.tsx` | Reset progress on `startTime === 0` |
| `types.ts` | Full 10-effect `EffectType` union |
| `AchievementPanel.tsx` | Dynamic total effects count |
| `SymbolRenderer.tsx` | All 10 effects lazy-loaded |
| `MainGame.tsx` | All 10 effect winning line cases |
| `HeartFlutterEffect.tsx` | Yellow for both X and O |
| `NatureLeafEffect.tsx` | Teal/Crimson overhaul, 7 leaves |
| `OceanSplashEffect.tsx` | [NEW] Water droplets + wave ripple |
| `CosmicNebulaEffect.tsx` | [NEW] SVG twinkling stars + nebula pulse |
| `AuroraBorealisEffect.tsx` | [NEW] Northern lights gradient + shimmer dust |
| `effects.css` | New keyframes: water-ripple, droplet-float, nebula-pulse, star-twinkle, aurora-shift, shimmer-dust |

### Database
| File | Change |
|:---|:---|
| `seed.sql` | Added `WINS_40` through `WINS_110` to admin seeding |

## 4. Next Step Logic
- **E2E Visual Verification**: Run `docker compose up --build -d frontend backend` and test all 10 effects in dual-tab mode. Verify cell rendering, winning line animations, and achievement panel display.
- **Dragon Lightning Enhancement Verification**: Confirm the aggressive SVG lightning arc rendering is visually satisfying in-game.
- **Effect Preview Grid**: Consider adding a dedicated preview/gallery page where users can see all effects animated side-by-side before equipping.
- **Typing Indicators**: Introduce real-time user typing indicators utilizing lightweight, transient WebSocket messages.
- **Spectator Arena**: Establish observer routes allowing late joiners to spectate full arenas as passive spectators.
