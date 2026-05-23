# Session Snapshot: Docker Deployment Fix & WebSocket TaskScheduler [2026-05-24]

## 1. Architectural Decisions & Changes

### Docker Compose Modernization
- **Removed Obsolete `version` Attribute**: Deleted `version: '3.8'` from `docker-compose.yml`. Modern Docker Compose ignores this field and emits a deprecation warning. The compose spec no longer requires a version declaration.

### WebSocket TaskScheduler Fix (Critical Startup Crash)
- **Root Cause**: Backend container (`gomoku-backend`) was in a crash loop (`Restarting (1)` status). The Spring Boot application failed to start with:
  ```
  java.lang.IllegalArgumentException: Heartbeat values configured but no TaskScheduler provided
  ```
- **Problem Location**: `WebSocketConfig.java` — `configureMessageBroker()` called `setHeartbeatValue(new long[]{10000, 10000})` without providing a `TaskScheduler`, which Spring's `SimpleBrokerMessageHandler` requires when heartbeats are enabled.
- **Fix**: Injected a `ThreadPoolTaskScheduler` (pool size 1, thread prefix `wss-heartbeat-thread-`) directly into the broker configuration via `.setTaskScheduler(te)`.
- **Impact**: Backend now starts cleanly. All three containers (`gomoku-postgres`, `gomoku-backend`, `gomoku-frontend`) running healthy.

### TypeScript Build Fix
- **Unused Variable**: Removed `const isX = symbol === 'X'` from `HeartFlutterEffect.tsx` (line 9) which caused `error TS6133` during `tsc -b && vite build` inside the Docker frontend build stage.

## 2. Established Constraints
- **Ref-Based STOMP Callbacks**: All state accessed inside STOMP `onMessage` must use `useRef` to avoid stale closures.
- **Heartbeat Keep-Alive**: Backend and frontend must both have heartbeats enabled (10s/10s). Backend **must** provide a `TaskScheduler` when heartbeats are configured.
- **Timer Pause on Disconnect**: `pausedAt` must be set on disconnect and cleared on reconnect. `turnStartTime` must be shifted forward by the paused duration.
- **First-Move Exemption**: No timer fires until a player has made at least one move in the match.
- **Docker Rebuild Rule**: Any code change in `backend/` or `frontend/` requires `docker-compose up --build -d` to take effect in containers.
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

### Config
| File | Change |
|:---|:---|
| `docker-compose.yml` | Removed obsolete `version: '3.8'` attribute |

### Backend
| File | Change |
|:---|:---|
| `WebSocketConfig.java` | Added `ThreadPoolTaskScheduler` for STOMP heartbeat execution |

### Frontend
| File | Change |
|:---|:---|
| `HeartFlutterEffect.tsx` | Removed unused `isX` variable (TS6133 build error fix) |

## 4. Current System State
- **Git**: Clean working tree, pushed to `origin/master` at commit `9db1138`.
- **Docker**: All 3 containers running (`gomoku-postgres` healthy, `gomoku-backend` up, `gomoku-frontend` up).
- **Ports**: Backend `:8888`, Frontend `:9999`, PostgreSQL `:5434`.
- **Backend Health**: Verified via `curl -v http://localhost:8888/api/auth/login -X POST` → HTTP 400 (expected without credentials).

## 5. Next Step Logic
- **E2E Visual Verification**: Test all 10 effects in dual-tab mode at `http://localhost:9999`. Verify cell rendering, winning line animations, and achievement panel display.
- **Effect Preview Grid**: Consider adding a dedicated preview/gallery page where users can see all effects animated side-by-side before equipping.
- **Spectator Arena**: Establish observer routes allowing late joiners to spectate full arenas as passive spectators.
- **Production Deployment**: Push Docker changes to Oracle Cloud via existing GitHub Actions CI/CD pipeline.
