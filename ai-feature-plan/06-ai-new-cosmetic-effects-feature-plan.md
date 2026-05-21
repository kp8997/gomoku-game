# Feature Plan #06 — New Cosmetic Effects (Heart Flutter, Nature Leaf, Vibrant Fire)

> **Plan ID**: `06`  
> **Status**: 🔲 Not Started  
> **Created**: 2026-05-20  
> **Last Updated**: 2026-05-20  
> **Scope**: Add 3 new unlockable symbol cosmetic effects for the 40, 60, and 70 win milestones  
> **Stack**: Java (Spring Boot), React 19, TypeScript, Tailwind CSS 4.0, CSS Animations

---

## 1. Objective

Extend the existing Achievement System (Plan #05) with three new premium symbol cosmetic effects, each tied to a new win milestone. This increases the cosmetic progression ladder from 4 effects to 7.

| Effect | Enum Key | Unlock | Theme |
|:---|:---|:---|:---|
| 💚 **Heart Flutter** | `HEART_FLUTTER` | 40 wins | Flying hearts — Green for X, Yellow for O |
| 🍃 **Nature Leaf** | `NATURE_LEAF` | 60 wins | Floating leaves with soft nature aura |
| 🔥 **Vibrant Fire** | `VIBRANT_FIRE` | 70 wins | Vivid fire ring + sunshine (spinning rays for X, pulsing glow for O) |

### Full Effect Progression (After Change)

| Order | Effect | Milestone |
|:---|:---|:---|
| 1 | `FIRE_PHOENIX` | 20 wins |
| 2 | `DRAGON_LIGHTNING` | 30 wins |
| 3 | **`HEART_FLUTTER`** | **40 wins** ← NEW |
| 4 | `CHERRY_BLOSSOM` | 50 wins |
| 5 | **`NATURE_LEAF`** | **60 wins** ← NEW |
| 6 | **`VIBRANT_FIRE`** | **70 wins** ← NEW |
| 7 | `DARK_SLASH` | 100 wins |

### Backward Compatibility
- All 4 existing effects (`FIRE_PHOENIX`, `DRAGON_LIGHTNING`, `CHERRY_BLOSSOM`, `DARK_SLASH`) remain unchanged.
- Existing `user_achievements` and `user_equipped_effects` table structures remain untouched.
- The `isEffectUnlocked()` logic in `AchievementService.java` already handles dynamic `SymbolEffect` enum lookups — new enum values are auto-supported.

---

## 2. Database Schema

No structural schema changes required. The existing tables support string-based keys:

- **`user_achievements.achievement_key`**: Will store `WINS_40`, `WINS_60`, `WINS_70` (auto-synced by `AchievementService.syncBadges()`).
- **`user_equipped_effects.effect_key`**: Will store `HEART_FLUTTER`, `NATURE_LEAF`, or `VIBRANT_FIRE`.

### seed.sql Update

Add `'WINS_40'`, `'WINS_60'`, `'WINS_70'` to the admin seeding array so local testing works on fresh volumes:

```sql
-- Current v_keys array additions:
'WINS_40', 'WINS_60', 'WINS_70'
-- Insert between existing 'WINS_30' and 'WINS_50', and after 'WINS_50'
```

---

## 3. Backend Architecture

### 3.1 SymbolEffect Enum — `SymbolEffect.java`

Insert 3 new enum constants in milestone order (between existing values):

```java
public enum SymbolEffect {
    FIRE_PHOENIX("WINS_20", 20, "Requires 20 Wins"),
    DRAGON_LIGHTNING("WINS_30", 30, "Requires 30 Wins"),
    HEART_FLUTTER("WINS_40", 40, "Requires 40 Wins"),       // NEW
    CHERRY_BLOSSOM("WINS_50", 50, "Requires 50 Wins"),
    NATURE_LEAF("WINS_60", 60, "Requires 60 Wins"),         // NEW
    VIBRANT_FIRE("WINS_70", 70, "Requires 70 Wins"),        // NEW
    DARK_SLASH("WINS_100", 100, "Requires 100 Wins");
    // ... constructor and getters unchanged
}
```

### 3.2 AchievementService — `AchievementService.java`

Add `40`, `60`, `70` to the `WIN_MILESTONES` static array so `syncBadges()` auto-creates the achievement keys:

```java
// Before:
private static final int[] WIN_MILESTONES = {10, 20, 30, 50, 100, 150, 200, 250, 300, 400, 500, 750, 1000};

// After:
private static final int[] WIN_MILESTONES = {10, 20, 30, 40, 50, 60, 70, 100, 150, 200, 250, 300, 400, 500, 750, 1000};
```

**No other backend changes needed.** The `buildResponse()` method iterates `SymbolEffect.values()` dynamically, so new enum values automatically appear in the `AchievementResponse.effects` list. The `isEffectUnlocked()` method uses `SymbolEffect.valueOf(effectKey)` which will resolve the new keys. WebSocket `symbolEffects` broadcasting is already username-based and enum-agnostic.

---

## 4. Frontend Architecture

### 4.1 TypeScript Types — `types.ts`

Extend the `EffectType` union:

```typescript
// Before:
export type EffectType = 'FIRE_PHOENIX' | 'DRAGON_LIGHTNING' | 'CHERRY_BLOSSOM' | 'DARK_SLASH' | null;

// After:
export type EffectType = 'FIRE_PHOENIX' | 'DRAGON_LIGHTNING' | 'HEART_FLUTTER' | 'CHERRY_BLOSSOM' | 'NATURE_LEAF' | 'VIBRANT_FIRE' | 'DARK_SLASH' | null;
```

### 4.2 SymbolRenderer — `SymbolRenderer.tsx`

Add 3 new lazy imports and switch cases. Pattern matches existing components:

```tsx
const HeartFlutterEffect = React.lazy(() => import('../effects/HeartFlutterEffect'));
const NatureLeafEffect = React.lazy(() => import('../effects/NatureLeafEffect'));
const VibrantFireEffect = React.lazy(() => import('../effects/VibrantFireEffect'));

// Inside switch:
case 'HEART_FLUTTER':
  EffectComponent = HeartFlutterEffect;
  break;
case 'NATURE_LEAF':
  EffectComponent = NatureLeafEffect;
  break;
case 'VIBRANT_FIRE':
  EffectComponent = VibrantFireEffect;
  break;
```

### 4.3 New Effect Components

All follow the established pattern: `interface Props { symbol: string }`, import `./effects.css`, use `relative flex items-center justify-center w-full h-full` container, max 5 particles, CSS-only animations.

---

## 5. UI/UX Specification

### 5.1 💚 Heart Flutter Effect (`HeartFlutterEffect.tsx`)

**Theme**: Romantic/nature love — flying heart particles.

| Symbol | Text Color | Glow | Heart Color |
|:---|:---|:---|:---|
| **X** | `text-green-500 dark:text-green-400` | `drop-shadow(0 0 6px #22c55e)` | `bg-green-400` / `bg-green-300` |
| **O** | `text-yellow-500 dark:text-yellow-400` | `drop-shadow(0 0 6px #eab308)` | `bg-yellow-400` / `bg-yellow-300` |

**Layers**:
1. **Soft Aura Glow** — Radial pulse behind symbol (`bg-green-400` / `bg-yellow-400`, `opacity-25`, `blur-md`, `animate-pulse`)
2. **5 Flying Heart Particles** — CSS heart shapes using `clip-path: path(...)` or `::before`/`::after` pseudo-elements. Float upward with gentle horizontal sway.
3. **Core Symbol** — Bold text with color + glow.

**CSS Keyframes**:
```css
@keyframes heart-float {
  0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
  15%  { opacity: 1; }
  50%  { transform: translateY(-10px) translateX(4px) scale(1.1); opacity: 0.8; }
  85%  { opacity: 0.3; }
  100% { transform: translateY(-18px) translateX(-3px) scale(0.6); opacity: 0; }
}
```
- 5 staggered instances: `heart-float-1` through `heart-float-5` with varying durations (1.8s–3.5s) and delays (0s–1.5s).

**Heart Shape CSS** (inline `clip-path` on each particle div):
```css
clip-path: path('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
```
Scaled to `w-3 h-3` particle size.

---

### 5.2 🍃 Nature Leaf Effect (`NatureLeafEffect.tsx`)

**Theme**: Gentle forest/nature — floating leaves and soft light.

| Symbol | Text Color | Glow | Leaf Color |
|:---|:---|:---|:---|
| **X** | `text-emerald-600 dark:text-emerald-400` | `drop-shadow(0 0 6px #059669)` | `bg-emerald-400` / `bg-lime-400` |
| **O** | `text-amber-700 dark:text-amber-400` | `drop-shadow(0 0 6px #d97706)` | `bg-amber-400` / `bg-yellow-600` |

**Layers**:
1. **Nature Aura** — Soft radial gradient (`bg-gradient-radial from-lime-200/30 to-transparent`), subtle scale-breathing animation.
2. **5 Leaf Particles** — Elliptical shapes with leaf-like `border-radius` (`rounded-[50%_0_50%_0]`), drifting diagonally with rotation. Uses varied sizes and opacities.
3. **Core Symbol** — Forest/earth tones with text glow.

**CSS Keyframes**:
```css
@keyframes leaf-drift {
  0%   { transform: translate(0, -5px) rotate(0deg) scale(1); opacity: 0; }
  15%  { opacity: 0.9; }
  50%  { transform: translate(8px, 8px) rotate(90deg) scale(0.9); }
  85%  { opacity: 0.4; }
  100% { transform: translate(14px, 18px) rotate(180deg) scale(0.5); opacity: 0; }
}

@keyframes nature-breathe {
  0%, 100% { transform: scale(1); opacity: 0.2; }
  50%      { transform: scale(1.15); opacity: 0.35; }
}
```
- 5 staggered leaf instances with durations 2.5s–4.5s.

---

### 5.3 🔥 Vibrant Fire Effect (`VibrantFireEffect.tsx`)

**Theme**: Intense, vivid fire with sunshine — the most visually dramatic effect.

| Symbol | Text Color | Glow | Fire Color | Sunshine |
|:---|:---|:---|:---|:---|
| **X** | `text-orange-500 dark:text-orange-300` | `drop-shadow(0 0 8px #f97316)` | `bg-red-500` / `bg-orange-400` | **2 spinning rays** |
| **O** | `text-red-500 dark:text-red-400` | `drop-shadow(0 0 8px #ef4444)` | `bg-red-600` / `bg-orange-500` | **Pulsing glow** |

**Layers**:
1. **Sunshine Background** — Different per symbol:
   - **X: 2 Spinning Rays** — Two thin, elongated gradient bars (`w-[200%] h-[3px]`) centered on the symbol, rotating continuously at different speeds (`rotate 4s linear infinite` and `rotate 6s linear infinite reverse`). Color: `bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent`.
   - **O: Pulsing Glow** — Concentric radial gradient circle that smoothly pulses in opacity and scale. `radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)`. Animated with `sunshine-pulse 2.5s ease-in-out infinite`.
2. **Fire Ring** — 4 flame particles positioned around the symbol (top, right, bottom-left, bottom-right). Each uses a teardrop-like shape (`rounded-[50%_50%_50%_0] rotate-45`) with `flicker` animation at varied speeds.
3. **Core Symbol** — Bold text with warm glow and `animate-flicker` for subtle intensity.

**CSS Keyframes**:
```css
@keyframes sunshine-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes sunshine-pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50%      { transform: scale(1.3); opacity: 0.55; }
}

@keyframes fire-flicker {
  0%, 100% { transform: scaleY(1) rotate(45deg); opacity: 0.8; }
  25%      { transform: scaleY(1.2) rotate(47deg); opacity: 0.6; }
  50%      { transform: scaleY(0.9) rotate(43deg); opacity: 1; }
  75%      { transform: scaleY(1.15) rotate(46deg); opacity: 0.7; }
}

@keyframes fire-dance {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
  33%      { transform: translateY(-3px) scale(1.1); opacity: 0.9; }
  66%      { transform: translateY(-1px) scale(0.95); opacity: 0.6; }
}
```

---

### 5.4 Performance Rules (Inherited from Plan #05)

- **CSS-only animations** — No JS `requestAnimationFrame` on the board grid.
- **Max 5 particle elements** per cell — Hard cap to prevent lag on 20×20 board (400 cells worst case).
- **Lazy-loaded** via `React.lazy()` + `Suspense` — Only the equipped effect module is imported.
- **No external assets** — All shapes rendered with CSS (`clip-path`, `border-radius`, gradients).

### 5.5 Theme Compatibility

All new effects must have distinct light/dark mode color tokens:
- **Light mode**: Slightly muted particle colors, lower glow opacity.
- **Dark mode**: Full vibrant colors with pronounced glow shadows.

---

## 6. Integration Points

- **Re-uses existing pipeline**: The backend `SymbolEffect` enum auto-iterates on `SymbolEffect.values()` in `buildResponse()`. New values appear in the Achievement Panel without additional controller or service changes.
- **WebSocket broadcasting**: `GameMessage.symbolEffects` already sends `username → effectKey` as a string. No message schema changes needed.
- **EffectCard.tsx**: Already renders previews via `SymbolRenderer` — new effects will automatically appear in the Achievement Panel's effect grid.
- **SymbolRenderer.tsx**: Only file needing explicit switch-case registration of new effect keys.

---

## 7. Docker Deployment

**MANDATORY REBUILDS** after code changes:

```bash
# After SymbolEffect.java & AchievementService.java changes:
docker compose up --build -d backend

# After frontend component changes:
docker compose up --build -d frontend
```

No new volumes, env vars, or Docker config changes required.

---

## 8. Constraints & Rules

1. **No modification** to existing 4 effects (`FIRE_PHOENIX`, `DRAGON_LIGHTNING`, `CHERRY_BLOSSOM`, `DARK_SLASH`).
2. **CSS class name uniqueness** — All new keyframes prefixed with effect name (`heart-float-*`, `leaf-drift-*`, `sunshine-*`, `fire-flicker-*`, `fire-dance-*`).
3. **Max 5 particles per cell** — All 3 new components must respect this hard cap.
4. **No JS animation loops** — CSS `animation` property only.
5. **seed.sql must include** `WINS_40`, `WINS_60`, `WINS_70` for local testing.
6. **Enum ordering** — Insert new enum values in milestone order (ascending by `requiredWins`).
7. **Heart Flutter colors** — Green for X, Yellow for O (confirmed by user).
8. **Vibrant Fire sunshine** — 2 spinning rays for X, pulsing glow for O (confirmed by user).

---

## 9. Execution Phases

### Phase 1: Backend Updates
1. Update `SymbolEffect.java` — Add 3 new enum constants in milestone order.
2. Update `AchievementService.java` — Add `40`, `60`, `70` to `WIN_MILESTONES`.
3. Update `seed.sql` — Add `WINS_40`, `WINS_60`, `WINS_70` to admin seeding array.

### Phase 2: Frontend Types & Renderer
4. Update `types.ts` — Extend `EffectType` union with 3 new keys.
5. Update `SymbolRenderer.tsx` — Add lazy imports and switch cases.

### Phase 3: CSS Animations
6. Append to `effects.css` — Add all new `@keyframes` and animation utility classes for Heart Flutter, Nature Leaf, and Vibrant Fire.

### Phase 4: Effect Components
7. Create `HeartFlutterEffect.tsx` — Green/Yellow flying hearts.
8. Create `NatureLeafEffect.tsx` — Floating leaves with nature aura.
9. Create `VibrantFireEffect.tsx` — Fire ring + sunshine (rays/pulse).

### Phase 5: Deployment & Validation
10. Rebuild backend container.
11. Rebuild frontend container.
12. Run `seed.sql` to ensure new keys are seeded for admin.
13. Equip each new effect via admin account and verify rendering on the board for both X and O symbols.

---

## 10. File Modification Summary

### Files to MODIFY

| File Path | Change |
|:---|:---|
| `backend/src/main/java/com/gomoku/game/model/SymbolEffect.java` | Add `HEART_FLUTTER`, `NATURE_LEAF`, `VIBRANT_FIRE` enum constants |
| `backend/src/main/java/com/gomoku/game/service/AchievementService.java` | Add `40`, `60`, `70` to `WIN_MILESTONES` array |
| `seed.sql` | Add `'WINS_40'`, `'WINS_60'`, `'WINS_70'` to `v_keys` array |
| `frontend/src/types.ts` | Extend `EffectType` union type |
| `frontend/src/components/achievements/SymbolRenderer.tsx` | Add 3 new lazy imports + switch cases |
| `frontend/src/components/effects/effects.css` | Append ~60 lines of new keyframes + utility classes |

### Files to CREATE

| File Path | Purpose |
|:---|:---|
| `frontend/src/components/effects/HeartFlutterEffect.tsx` | Heart Flutter cosmetic component |
| `frontend/src/components/effects/NatureLeafEffect.tsx` | Nature Leaf cosmetic component |
| `frontend/src/components/effects/VibrantFireEffect.tsx` | Vibrant Fire cosmetic component |

### Files to UPDATE (Post-Implementation)

| File Path | Purpose |
|:---|:---|
| `ai-state-persistent.md` | Record new milestones + effects in Historical Decisions Log |
| `ai-context-snapshot.md` | Update session snapshot with new SymbolEffect enum state |
