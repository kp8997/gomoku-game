# 12 — AI Frontend Rendering Performance Feature Plan

## Problem Statement

After a Phase 1 backend investigation, the primary source of UI interaction lag was identified in the **frontend rendering pipeline**, not the backend. The 400-cell board re-renders on every state change (including 40 setState/sec from the TurnTimer), and there are no React memoization boundaries in place. This plan addresses the critical path.

---

## Phase 1: Critical Rendering Path

### 1.1 — Extract `BoardCell` as `React.memo` component

**File**: `frontend/src/components/MainGame.tsx`

Currently, each of the 400 board cells is rendered inline. Every timer tick or parent state change re-renders all 400 cells. Extracting `BoardCell` into a memoized component means only cells whose `cell`, `isLastMove`, or `isWinningCell` props change will re-render.

**Answers**: Cosmetics cannot change during gameplay (confirmed), board is fixed 20×20.

### 1.2 — Pre-compute `historyMap` and `winningSet` via `useMemo`

**File**: `frontend/src/components/MainGame.tsx`

Each render currently runs:
- `history.find(m => m.row === r && m.col === c)` — O(n) per cell = 400n comparisons per render
- `winningLine.some(m => m.row === r && m.col === c)` — O(5) per cell = 2000 comparisons per render

Replace with O(1) lookups via pre-computed `Map` and `Set`.

```typescript
const historyMap = useMemo(() => {
  const map = new Map<string, Move>();
  history.forEach(m => map.set(`${m.row}-${m.col}`, m));
  return map;
}, [history]);

const winningSet = useMemo(() => {
  return new Set(winningLine.map(m => `${m.row}-${m.col}`));
}, [winningLine]);
```

### 1.3 — Wrap `MainGame` in `React.memo`

**File**: `frontend/src/components/MainGame.tsx`

Since `MainGame` receives stable-reference props (board array, functions via useCallback), wrapping it in `React.memo` isolates it from Header/parent re-renders caused by TurnTimer ticks, voice call state changes, etc.

Props that change frequently (`board`, `history`, `winningLine`) will still cause targeted re-renders, but the memoized `BoardCell` children will filter down to only the affected cells.

### 1.4 — Reduce TurnTimer interval from 50ms to 250ms

**File**: `frontend/src/components/TurnTimer.tsx`

The timer displays whole seconds. Ticking 20×/sec (every 50ms) causes 40 setState/sec for no visual benefit. Reducing to 250ms (4×/sec) cuts that to 8 setState/sec — still smooth enough for a countdown display.

```diff
- const interval = setInterval(updateTimer, 50);
+ const interval = setInterval(updateTimer, 250);
```

### 1.5 — Guard TimeoutWarning interval to start only in last 16s

**File**: `frontend/src/components/TimeoutWarning.tsx`

The interval runs for the full 60-second turn, even though the warning is only visible at ≤15s. We add a lazy-start: compute elapsed once at setup time, and only begin the interval if we're within warning range (or calculate elapsed to determine the delay before starting).

---

## Files Modified

| File | Change |
|:---|:---|
| `frontend/src/components/MainGame.tsx` | Extract `BoardCell` memo, add `historyMap`/`winningSet` useMemo, wrap component in `React.memo` |
| `frontend/src/components/TurnTimer.tsx` | Reduce interval to 250ms |
| `frontend/src/components/TimeoutWarning.tsx` | Guard interval start to ≤16s remaining |

## Verification

- `npm run build` must pass
- Manual gameplay: no visual regression, timer still counts down smoothly
- Phase 2 (cosmetics removal from MOVE, board update optimization, lazy loading) will follow in a separate prompt
