# Feature Plan #11 — WebSocket Performance Optimization

> **Plan ID**: `11`  
> **Status**: 🔲 Not Started  
> **Created**: 2026-08-09  
> **Last Updated**: 2026-08-09  
> **Scope**: Fix excessive heartbeat XHR traffic, eliminate duplicate MOVE broadcasts, merge redundant DB queries  
> **Stack**: Spring Boot (WebSocketConfig, GameController), React (App.tsx STOMP client)

---

## 1. Objective

Resolve the sluggish "Join Arena" experience and excessive idle network traffic caused by three compounding issues:

1. **STOMP heartbeats at 10s intervals** generate constant XHR traffic when SockJS falls back to XHR polling.
2. **`handleMove()` broadcasts every MOVE message twice**, doubling network traffic per move.
3. **`getRoomSymbolEffects()` and `getRoomSymbolSkins()` each make the same DB query independently**, doubling database load per event.

**Backward compatibility**: No protocol changes. The STOMP message schema remains identical. Frontend deduplication logic in `setHistory` already handles the duplicate MOVE case, so removing it is safe.

---

## 2. Root Cause Analysis

### 2A. The `\n` Payload Requests — STOMP Heartbeats Over XHR Polling

**What the user sees**: `xhr_send?t=...` requests with payload `["\n"]` every ~10 seconds, staying in "pending" state.

**Root cause**: These are STOMP heartbeat frames (a `\n` newline character = keepalive). SockJS is falling back to **XHR long-polling** instead of using a native WebSocket.

In XHR polling mode:
- Every heartbeat becomes a **separate HTTP POST** (`xhr_send`)
- The client keeps **long-polling GET requests** (`xhr?t=...`) open that stay "pending" until the server sends data
- At 10s intervals bidirectionally, this generates ~6 HTTP requests per minute while completely idle

### 2B. Deployment URL Architecture (Verified ✅)

The current connection architecture across deployments:

| Deployment | `VITE_WS_URL` | `VITE_API_URL` | Transport |
|:---|:---|:---|:---|
| **Docker (Oracle Cloud)** | `/ws-gomoku` (relative) | `/api` (relative) | Nginx proxies to `backend:8888` with `Upgrade` headers → **real WebSocket** ✅ |
| **Vercel** | `https://etymologies.duckdns.org/ws-gomoku` (Vercel env var) | `https://etymologies.duckdns.org` (Vercel env var) | Direct cross-origin to Oracle backend |
| **Local dev** | `http://localhost:8888/ws-gomoku` (`.env`) | `http://localhost:8888` (`.env`) | Direct to Spring Boot → **real WebSocket** ✅ |

**Vercel deployment analysis**: Since Vercel can't proxy WebSocket, pointing directly to the Oracle Cloud backend (`etymologies.duckdns.org`) is the **correct architecture**. The Oracle Cloud Nginx config already handles `Upgrade`/`Connection` headers properly (verified in the frontend Dockerfile). So SockJS *should* be able to upgrade to a real WebSocket when connecting directly — the XHR polling fallback observed may be caused by CORS preflight delays or browser transport negotiation. Either way, the direct connection is the right approach and no URL changes are needed.

**Key code paths**:
- `App.tsx:188`: `const backendUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8888/ws-gomoku'`
- `authApi.ts:3`: `const API_BASE = import.meta.env.VITE_API_URL === '/api' ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:8888')`
  - When Docker sets `VITE_API_URL=/api`, `API_BASE` becomes `''` → relative paths → Nginx proxy
  - When Vercel sets `VITE_API_URL=https://etymologies.duckdns.org`, `API_BASE` becomes the full URL → direct cross-origin
- `.env` file is gitignored (local dev only); Docker uses build args; Vercel uses its own env var panel

**Verdict**: No changes needed for the URL configuration. The architecture is sound.

### 2C. Duplicate MOVE Broadcast

In `GameController.java` `handleMove()`, the same MOVE message is broadcast **twice** via `convertAndSend`:
- **Line 227**: First broadcast with a preliminary `turnStartTime` (using `System.currentTimeMillis()`)
- **Line 260**: Second broadcast with the corrected `turnStartTime` after timer logic adjusts it on the room

Each broadcast also triggers 2 independent DB queries (`getRoomSymbolEffects` + `getRoomSymbolSkins`), resulting in **4 DB queries per move**.

### 2D. Redundant DB Calls for Effects & Skins

`getRoomSymbolEffects()` and `getRoomSymbolSkins()` both call `equippedEffectRepository.findByUser_UsernameIn(playerList)` independently — the **exact same JPA query** executed twice per event invocation.

---

## 3. Backend Architecture

### Dependencies
- No new dependencies

### Config Changes

#### `WebSocketConfig.java`
- Change heartbeat value from `{10000, 10000}` to `{25000, 25000}`

### File Structure Changes
- No new files

### Core Logic Changes

#### `GameController.java`

**Merge cosmetics into single helper**:
```java
private record RoomCosmetics(Map<String, String> effects, Map<String, String> skins) {}

private RoomCosmetics loadRoomCosmetics(GameRoom room) {
    Map<String, String> effects = new HashMap<>();
    Map<String, String> skins = new HashMap<>();
    List<String> playerList = new ArrayList<>(room.getPlayers());
    if (!playerList.isEmpty()) {
        List<UserEquippedEffect> equipped = equippedEffectRepository.findByUser_UsernameIn(playerList);
        for (UserEquippedEffect e : equipped) {
            effects.put(e.getUser().getUsername(), e.getEffectKey());
            if (e.getSymbolSkin() != null) {
                skins.put(e.getUser().getUsername(), e.getSymbolSkin());
            }
        }
    }
    return new RoomCosmetics(effects, skins);
}
```

**Eliminate duplicate MOVE broadcast**: Remove the first `convertAndSend` at line 227, perform timer logic first, then broadcast once with correct `turnStartTime`.

---

## 4. Frontend Architecture

### Modified Files

#### `App.tsx`
- Change `client.heartbeat.outgoing` from `10000` to `25000`
- Change `client.heartbeat.incoming` from `10000` to `25000`

### No TypeScript interface changes
### No state management changes
### No API layer changes

---

## 5. UI/UX Specification

No UI changes. This is a pure performance optimization.

---

## 6. Integration Points

- **WebSocket/STOMP**: Heartbeat interval change must be synchronized between backend (`WebSocketConfig.java`) and frontend (`App.tsx`). The STOMP spec negotiates the final interval as `max(client, server)`, so both sides must agree.
- **SockJS Transport**: No changes to SockJS configuration. The Vercel deployment correctly points directly to Oracle Cloud backend for WebSocket and API calls.
- **URL Configuration**: No changes needed. Docker uses relative paths via Nginx proxy; Vercel uses direct cross-origin to `etymologies.duckdns.org`; local dev uses `localhost:8888` from `.env`.

---

## 7. Docker Deployment

- **Backend rebuild required**: `docker compose up --build -d backend` (for WebSocketConfig and GameController changes)
- **Frontend rebuild required**: `docker compose up --build -d frontend` (for heartbeat interval change in App.tsx)
- No volume, env var, or config changes needed

---

## 8. Constraints & Rules

1. **STOMP heartbeat interval MUST match on both sides** — backend `setHeartbeatValue` and frontend `client.heartbeat.*` must use the same value (25000ms).
2. **The single MOVE broadcast MUST use the room's `turnStartTime`** after timer logic has updated it — never `System.currentTimeMillis()` directly.
3. **`loadRoomCosmetics()` MUST be called in all 4 locations** where the old pair was used: `joinGame`, `handleMove`, `startGame`, and (if applicable) any future event handlers.
4. **No changes to the STOMP message schema** — `GameMessage` fields remain identical.
5. **Frontend duplicate-move deduplication logic in `setHistory` MUST be preserved** as a safety net even though the duplicate broadcast is removed.
6. **URL configuration MUST NOT be changed** — Docker (relative paths via Nginx), Vercel (direct cross-origin), and local dev (localhost from `.env`) all work correctly as-is.

---

## 9. Execution Phases

### Phase 1: Code Implementation

#### Step 1.1 — Backend: Merge Cosmetics Query (GameController.java)
1. Add `RoomCosmetics` record and `loadRoomCosmetics()` helper method
2. Replace all `getRoomSymbolEffects()` + `getRoomSymbolSkins()` call pairs with single `loadRoomCosmetics()` call in `joinGame()`, `handleMove()`, and `startGame()`
3. Remove the now-unused `getRoomSymbolEffects()` and `getRoomSymbolSkins()` methods

#### Step 1.2 — Backend: Eliminate Duplicate MOVE Broadcast (GameController.java)
1. Remove the first `convertAndSend` call (line 227) and its preceding field setters (lines 221-226)
2. Ensure the remaining broadcast uses `room.getTurnStartTime()` for the corrected value

#### Step 1.3 — Backend: Reduce Heartbeat Interval (WebSocketConfig.java)
1. Change `setHeartbeatValue(new long[]{10000, 10000})` → `setHeartbeatValue(new long[]{25000, 25000})`

#### Step 1.4 — Frontend: Reduce Heartbeat Interval (App.tsx)
1. Change `client.heartbeat.outgoing = 10000` → `25000`
2. Change `client.heartbeat.incoming = 10000` → `25000`

#### Step 1.5 — Build Verification
1. Run `npm run build` to verify frontend compiles cleanly
2. Verify backend compiles with `./mvnw compile` (or equivalent)

---

### Phase 2: Automated Testing

#### Step 2.1 — Backend Unit Test: `loadRoomCosmetics()` merges effects and skins correctly
- Verify a single DB call returns both effect keys and skin keys
- Verify empty player list returns empty maps
- Verify players without equipped effects are not in the maps

#### Step 2.2 — Backend Unit Test: `handleMove()` broadcasts exactly once per move
- Mock `SimpMessagingTemplate` and verify `convertAndSend` for MOVE type is called **exactly once** per valid move (not twice)
- Verify the broadcast message contains the correct `turnStartTime` from the room (post-timer-logic), not `System.currentTimeMillis()`

#### Step 2.3 — Backend Unit Test: `handleMove()` timer logic correctness
- Verify that when the next player has already made a move, `startTurnTimer` is called
- Verify that when it's the next player's first move, timer is NOT started (`turnStartTime = 0`)
- Verify win detection still stops the timer and triggers WIN message

#### Step 2.4 — Frontend Build Regression Test
- `npm run build` completes without errors
- `npm run lint` passes

---

## 10. File Modification Summary

### Files to MODIFY

| File | Phase | Change |
|:---|:---|:---|
| `backend/.../GameController.java` | Phase 1 (1.1 + 1.2) | Add `RoomCosmetics` record + `loadRoomCosmetics()`. Remove duplicate MOVE broadcast. Replace all `getRoomSymbolEffects`/`getRoomSymbolSkins` call pairs. Remove old methods. |
| `backend/.../WebSocketConfig.java` | Phase 1 (1.3) | Change heartbeat from 10s to 25s |
| `frontend/src/App.tsx` | Phase 1 (1.4) | Change STOMP heartbeat from 10s to 25s |

### Files to CREATE

| File | Phase | Purpose |
|:---|:---|:---|
| `backend/src/test/java/.../GameControllerTest.java` | Phase 2 | Unit tests for merged cosmetics, single broadcast, and timer logic |

### Files to DELETE
None

---

## Cumulative Impact Summary

| Metric | Before | After | Improvement |
|:---|:---|:---|:---|
| Heartbeat XHR requests (per minute) | ~6 | ~2.4 | **60% reduction** |
| MOVE broadcasts per move | 2 | 1 | **50% reduction** |
| DB queries per MOVE | 4 | 1 | **75% reduction** |
| DB queries per JOIN | 2 | 1 | **50% reduction** |
| DB queries per START | 2 | 1 | **50% reduction** |
