# Session Snapshot: Security Hardening & 403 Fix [2026-05-25]

## 1. Architectural Decisions & Changes

### CORS Preflight Fix (SecurityConfig.java)
- **Root Cause**: `GET /api/user/stats` returning `403 Forbidden` for authenticated users. The browser's CORS preflight `OPTIONS` request (which carries no `Authorization` header) was being rejected by Spring Security's `AuthorizationFilter` before reaching the `CorsFilter`.
- **Fix**: Added `requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()` as the **first** rule in the `authorizeHttpRequests` chain, ensuring all preflight requests pass through to the CORS filter.
- **Import**: Added `org.springframework.http.HttpMethod`.

### Authenticated Fetch Interceptor (authApi.ts)
- **Problem**: When a JWT token expired, rotated, or became invalid (e.g. after a backend redeployment with a different secret), all `/api/user/**` endpoints returned `403`. The frontend would get stuck in error loops with stale tokens in `localStorage`.
- **Solution**: Introduced a central `authenticatedFetch(url, options, token)` wrapper that:
  1. Sets the `Authorization: Bearer <token>` header on every request.
  2. Intercepts `401` and `403` responses.
  3. Clears `gomoku_token` and `gomoku_user` from `localStorage`.
  4. Redirects to `/` (landing page) unless already there.
  5. Throws `'Session expired. Please log in again.'`.
- **Impact**: All authenticated API methods (`getProfile`, `updateProfile`, `getStats`, `getAchievements`, `equipEffect`, `unequipEffect`) now route through `authenticatedFetch` instead of raw `fetch`.

### Null-Safety Hardening (ConfrontationService.java)
- **`getUserStats()`**: Added null guards for `record`, `getUserAWins()`, `getUserBWins()`, and `getUserA()` to prevent `NullPointerException` from auto-unboxing nullable `Integer` fields.
- **`getConfrontationsForUser()`**: Added `Objects::nonNull` stream filter and safe fallback defaults for opponent display when `userA` or `userB` is null.

### AchievementService.java Bug Fix
- **`isEffectUnlocked()`**: Changed `catch (IllegalArgumentException e)` to `catch (Exception e)` to handle `NumberFormatException` from malformed achievement keys like `"WINS_"` (no numeric suffix).
- **`getUnlockedAt()`**: Added `a.getUnlockedAt() != null` null check before calling `.toString()` to prevent NPE on achievements with null timestamps.

### Test File Cleanup
- **Deleted**: `Test.java`, `Test.class`, `test_achievements.js` — scratch files used during debugging the achievement 403 issue. Removed from workspace root.

## 2. Established Constraints
- **Ref-Based STOMP Callbacks**: All state accessed inside STOMP `onMessage` must use `useRef` to avoid stale closures.
- **Heartbeat Keep-Alive**: Backend and frontend must both have heartbeats enabled (10s/10s). Backend **must** provide a `TaskScheduler` when heartbeats are configured.
- **Timer Pause on Disconnect**: `pausedAt` must be set on disconnect and cleared on reconnect. `turnStartTime` must be shifted forward by the paused duration.
- **First-Move Exemption**: No timer fires until a player has made at least one move in the match.
- **Docker Rebuild Rule**: Any code change in `backend/` or `frontend/` requires `docker compose up --build -d` to take effect in containers.
- **CORS Preflight Rule**: `OPTIONS` requests must always be `permitAll()` in the security filter chain. They carry no auth headers.
- **JWT Expiry Handling**: Frontend must intercept 401/403 on authenticated endpoints and auto-clear stale tokens + redirect to login.
- **PRODUCTION DATA CONSTRAINT**: Any database schema changes, seeded data changes, or enum mapping changes MUST be accompanied by a Liquibase migration script (or explicit data transformation logic).
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
| `SecurityConfig.java` | Added `HttpMethod.OPTIONS` permitAll rule for CORS preflight |
| `ConfrontationService.java` | Null-safety guards on `getUserStats()` and `getConfrontationsForUser()` |
| `AchievementService.java` | Broadened exception catch in `isEffectUnlocked()`, null-safe `getUnlockedAt()` |

### Frontend
| File | Change |
|:---|:---|
| `authApi.ts` | Introduced `authenticatedFetch` interceptor; all auth endpoints refactored to use it |

### Deleted
| File | Reason |
|:---|:---|
| `Test.java` | Debug scratch file |
| `Test.class` | Compiled debug artifact |
| `test_achievements.js` | Debug Node.js script |

## 4. Current System State
- **Git**: Clean working tree, pushed to `origin/master` at commit `05f61b7`.
- **Docker**: All 3 containers running (`gomoku-postgres` healthy, `gomoku-backend` up 4d, `gomoku-frontend` up 4d).
- **Ports**: Backend `:8888`, Frontend `:9999`, PostgreSQL `:5434`.
- **Effects**: 18 total cosmetic effects (`FIRE_PHOENIX` at 20 wins through `GALACTIC_SUPERNOVA` at 190 wins).
- **WIN_MILESTONES**: `{10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190}`.

## 5. Next Step Logic
- **E2E Visual Verification**: Test all 18 effects in dual-tab mode at `http://localhost:9999`. Verify cell rendering, winning line animations, and achievement panel display.
- **Effect Preview Grid**: Consider adding a dedicated preview/gallery page where users can see all effects animated side-by-side before equipping.
- **Spectator Arena**: Establish observer routes allowing late joiners to spectate full arenas as passive spectators.
- **Production Deployment**: Push Docker changes to Oracle Cloud via existing GitHub Actions CI/CD pipeline.
- **Online Matchmaking**: Future feature to allow random public matchmaking.
