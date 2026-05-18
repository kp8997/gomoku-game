# Feature Plan #05 — Achievement System

> **Plan ID**: `05`  
> **Status**: 🔲 Not Started  
> **Created**: 2026-05-19  
> **Last Updated**: 2026-05-19  
> **Scope**: Drawer rename, symbol effects system, win-rate badges, match/win milestone badges, backend API, frontend rendering  
> **Stack**: Spring Boot 3.2.5, PostgreSQL 16, Liquibase, React 19, TypeScript, Framer Motion 12, CSS Animations

---

## 1. Objective

Build a comprehensive **Achievement System** that rewards player progression and provides cosmetic customization:

1. **Rename** the GameDrawer header from "Game History" to **"Achievement"** and restructure it as the achievement hub.
2. **Symbol Effects** — 4 animated visual effects that replace the default plain-text `X` or `O` on the board:
   - 🔥 **Fire Phoenix** — Fiery aura with ember particles and phoenix wing silhouette
   - ⚡ **Dragon Lightning** — Electric crackling with dragon scale texture
   - 🌸 **Scarlet Cherry Blossom** — Floating petal particles with soft bloom glow
   - ⚔️ **Dark Slash** — Ink slash marks with dark energy wisps
3. **Win-Rate Badges** (9 tiers) — Majestic, prestigious shields awarded by win-rate percentage.
4. **Match Milestone Badges** (12 tiers) — Dandy, cavalier, energetic medals awarded by total matches played.
5. **Win Milestone Badges** (12 tiers) — Elegant, royal crowns awarded by total wins accumulated.

### Backward Compatibility
- Existing `confrontation_records`, `users` tables untouched.
- Stats derivation logic (`getUserStats`) reused — no duplication.
- Anonymous users see badges in read-only mode; only authenticated users unlock/equip.

---

## 2. Database Schema

### 2.1 New Tables

#### `user_achievements`
Tracks which badges/effects a user has unlocked. Populated server-side on stats query.

| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | `BIGSERIAL` | PK, NOT NULL | Auto ID |
| `user_id` | `BIGINT` | FK → `users.id`, NOT NULL | Owner |
| `achievement_key` | `VARCHAR(50)` | NOT NULL | Enum key (e.g. `WIN_RATE_50`, `MATCHES_100`, `WINS_250`) |
| `unlocked_at` | `TIMESTAMP(6)` | NOT NULL | When unlocked |

**Unique constraint**: `(user_id, achievement_key)` — one unlock per user per achievement.

#### `user_equipped_effects`
Stores the user's currently equipped symbol effect. One row per user max.

| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | `BIGSERIAL` | PK, NOT NULL | Auto ID |
| `user_id` | `BIGINT` | FK → `users.id`, UNIQUE, NOT NULL | Owner (1 row max) |
| `effect_key` | `VARCHAR(50)` | NOT NULL | Effect enum (e.g. `FIRE_PHOENIX`) |
| `updated_at` | `TIMESTAMP(6)` | NOT NULL | Last change |

### 2.2 Achievement Keys (Enum — Backend)

```
// Win Rate Badges (majestic)
WIN_RATE_50, WIN_RATE_55, WIN_RATE_60, WIN_RATE_65, WIN_RATE_75, WIN_RATE_80, WIN_RATE_85, WIN_RATE_90, WIN_RATE_95

// Match Milestone Badges (cavalier)  
MATCHES_10, MATCHES_20, MATCHES_50, MATCHES_100, MATCHES_150, MATCHES_200, MATCHES_250, MATCHES_300, MATCHES_400, MATCHES_500, MATCHES_750, MATCHES_1000

// Win Milestone Badges (royal)
WINS_10, WINS_20, WINS_50, WINS_100, WINS_150, WINS_200, WINS_250, WINS_300, WINS_400, WINS_500, WINS_750, WINS_1000

// Symbol Effects (unlockable)
FIRE_PHOENIX, DRAGON_LIGHTNING, CHERRY_BLOSSOM, DARK_SLASH
```

### 2.3 Effect Unlock Requirements

| Effect | Unlock Condition |
|:---|:---|
| `FIRE_PHOENIX` | `WINS_50` unlocked (50 wins) |
| `DRAGON_LIGHTNING` | `WINS_100` unlocked (100 wins) |
| `CHERRY_BLOSSOM` | `WIN_RATE_65` unlocked (65% win rate) |
| `DARK_SLASH` | `WINS_200` unlocked (200 wins) |

---

## 3. Backend Architecture

### 3.1 Liquibase Migration — `02-achievement-schema.xml`

```xml
<changeSet id="3-achievement-tables" author="gomoku">
    <createTable tableName="user_achievements">
        <column name="id" type="BIGSERIAL"><constraints primaryKey="true" nullable="false"/></column>
        <column name="user_id" type="BIGINT"><constraints nullable="false" foreignKeyName="fk_achievement_user" referencedTableName="users" referencedColumnNames="id"/></column>
        <column name="achievement_key" type="VARCHAR(50)"><constraints nullable="false"/></column>
        <column name="unlocked_at" type="TIMESTAMP(6)"><constraints nullable="false"/></column>
    </createTable>
    <addUniqueConstraint tableName="user_achievements" columnNames="user_id,achievement_key" constraintName="uq_user_achievement"/>
    <createIndex tableName="user_achievements" indexName="idx_achievement_user">
        <column name="user_id"/>
    </createIndex>

    <createTable tableName="user_equipped_effects">
        <column name="id" type="BIGSERIAL"><constraints primaryKey="true" nullable="false"/></column>
        <column name="user_id" type="BIGINT"><constraints nullable="false" unique="true" foreignKeyName="fk_equipped_user" referencedTableName="users" referencedColumnNames="id"/></column>
        <column name="effect_key" type="VARCHAR(50)"><constraints nullable="false"/></column>
        <column name="updated_at" type="TIMESTAMP(6)"><constraints nullable="false"/></column>
    </createTable>
</changeSet>
```

### 3.2 New Files

```
backend/src/main/java/com/gomoku/game/
├── model/
│   ├── UserAchievement.java          # JPA entity
│   └── UserEquippedEffect.java       # JPA entity
├── repository/
│   ├── UserAchievementRepository.java
│   └── UserEquippedEffectRepository.java
├── service/
│   └── AchievementService.java       # Sync + query logic
├── dto/
│   ├── AchievementDTO.java           # { key, unlocked, unlockedAt }
│   ├── AchievementResponse.java      # { badges[], effects[], equippedEffect }
│   └── EquipEffectRequest.java       # { effectKey }
└── controller/
    └── AchievementController.java    # REST endpoints
```

### 3.3 REST API Endpoints

| Method | Path | Auth | Description |
|:---|:---|:---|:---|
| `GET` | `/api/user/achievements` | Bearer | Returns all badges (locked+unlocked) + effects + equipped effect. Triggers sync. |
| `PUT` | `/api/user/achievements/equip` | Bearer | Equip a symbol effect. Body: `{ "effectKey": "FIRE_PHOENIX" }` |
| `PUT` | `/api/user/achievements/unequip` | Bearer | Unequip current effect (revert to default X/O) |

### 3.4 Core Service Logic — `AchievementService.java`

```java
@Transactional
public AchievementResponse getAchievements(Long userId) {
    // 1. Get current stats from ConfrontationService (reuse existing)
    UserStatsDTO stats = confrontationService.getUserStats(userId);
    
    // 2. Sync: check each threshold, insert if newly qualified
    syncBadges(userId, stats);
    
    // 3. Fetch all unlocked achievement keys
    Set<String> unlocked = achievementRepository.findByUserId(userId)
        .stream().map(UserAchievement::getAchievementKey).collect(toSet());
    
    // 4. Build full response with locked/unlocked state for every badge
    // 5. Include equipped effect
    return buildResponse(unlocked, stats, userId);
}

private void syncBadges(Long userId, UserStatsDTO stats) {
    // Win rate badges
    double wr = stats.getWinRate();
    int[] wrThresholds = {50, 55, 60, 65, 75, 80, 85, 90, 95};
    for (int t : wrThresholds) {
        if (wr >= t) tryUnlock(userId, "WIN_RATE_" + t);
    }
    // Match milestones
    int[] matchMilestones = {10, 20, 50, 100, 150, 200, 250, 300, 400, 500, 750, 1000};
    for (int m : matchMilestones) {
        if (stats.getTotalMatches() >= m) tryUnlock(userId, "MATCHES_" + m);
    }
    // Win milestones
    for (int w : matchMilestones) {
        if (stats.getTotalWins() >= w) tryUnlock(userId, "WINS_" + w);
    }
}
```

**Key design**: `syncBadges` is idempotent — uses `INSERT ... ON CONFLICT DO NOTHING` pattern (via check-then-insert with unique constraint guard). No redundant writes.

### 3.5 GameController Integration — Effect Broadcasting

When a player has an equipped effect, broadcast it in `JOIN` and `MOVE` messages so opponents see the animated symbols:

Add to `GameMessage.java`:
```java
private Map<String, String> symbolEffects; // "X" -> "FIRE_PHOENIX", "O" -> "DARK_SLASH"
```

On `JOIN` and `START`: populate `symbolEffects` by checking `UserEquippedEffectRepository` for the actual usernames assigned to X (first player) and O (second player).

---

## 4. Frontend Architecture

### 4.1 New Files

```
frontend/src/
├── components/
│   ├── achievements/
│   │   ├── AchievementPanel.tsx       # Main panel inside GameDrawer (3 sections)
│   │   ├── BadgeCard.tsx              # Individual badge renderer (locked/unlocked)
│   │   ├── EffectCard.tsx             # Effect selector card with preview
│   │   ├── EffectPreview.tsx          # Animated X/O preview for each effect
│   │   └── SymbolRenderer.tsx         # Replaces plain {cell} text with effect animation
│   └── effects/
│       ├── FirePhoenixEffect.tsx      # CSS + SVG fire/ember animation
│       ├── DragonLightningEffect.tsx   # Electric crackle animation
│       ├── CherryBlossomEffect.tsx    # Petal particle animation
│       └── DarkSlashEffect.tsx        # Ink slash animation
├── api/
│   └── authApi.ts                     # + getAchievements(), equipEffect(), unequipEffect()
└── types.ts                           # + AchievementDTO, AchievementResponse, EffectType
```

### 4.2 New TypeScript Interfaces

```typescript
export type EffectType = 'FIRE_PHOENIX' | 'DRAGON_LIGHTNING' | 'CHERRY_BLOSSOM' | 'DARK_SLASH' | null;

export interface AchievementDTO {
  key: string;
  category: 'WIN_RATE' | 'MATCHES' | 'WINS';
  label: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
  threshold: number;
}

export interface AchievementResponse {
  winRateBadges: AchievementDTO[];
  matchBadges: AchievementDTO[];
  winBadges: AchievementDTO[];
  effects: { key: EffectType; unlocked: boolean; requirementLabel: string }[];
  equippedEffect: EffectType;
}
```

### 4.3 GameMessage Extension

```typescript
// Add to GameMessage interface
symbolEffects?: Record<string, string>; // 'X' or 'O' → effectKey
```

### 4.4 SymbolRenderer Component — Board Integration

Replaces the plain `{cell}` text in `MainGame.tsx`:

```tsx
// Before (MainGame.tsx line 152):
{cell}

// After:
<SymbolRenderer symbol={cell} effectKey={symbolEffects?.[cell]} />
```

`SymbolRenderer` dynamically imports the correct effect component or falls back to plain text. It passes down the `symbol` ('X' or 'O') as a prop so the underlying effect component can adapt its color scheme appropriately.

---

## 5. UI/UX Specification

### 5.1 GameDrawer Restructure

The drawer becomes a **tabbed panel** with two tabs:
- **📜 History** — Existing move history (preserved as-is)
- **🏆 Achievement** — New achievement panel (3 collapsible sections)

Header text changes from "Game History" to **"Arena Panel"** with tab switching.

### 5.2 Achievement Panel — 3 Sections

Each section is a collapsible accordion with clear visual separation:

#### Section A: Symbol Effects (Top)
- Grid of 4 effect cards (2×2 on mobile, 4×1 on desktop)
- Each card shows: animated preview of X and O with the effect, name, lock/unlock status
- Equipped effect has glowing border + "EQUIPPED" badge
- Click to equip (if unlocked) or shows lock icon + requirement text
- **Design**: Glassmorphic cards with gradient borders matching effect theme

#### Section B: Win Rate Badges (Middle)
- Horizontal scrollable row on mobile, wrap grid on desktop
- 9 badges displayed as **shield/crest** shapes
- **Color palette** (majestic/prestigious):

| Tier | Threshold | Color Scheme | Metal |
|:---|:---|:---|:---|
| 1 | 50% | Deep Bronze + Warm Amber | Antique Bronze |
| 2 | 55% | Polished Copper + Rose Gold | Burnished Copper |
| 3 | 60% | Sterling Silver + Ice Blue | Silver |
| 4 | 65% | White Gold + Emerald | White Gold |
| 5 | 75% | Royal Gold + Ruby Red | Gold |
| 6 | 80% | Sapphire Blue + Gold Trim | Sapphire |
| 7 | 85% | Amethyst Purple + Platinum | Platinum |
| 8 | 90% | Obsidian Black + Gold Inlay | Obsidian |
| 9 | 95% | Iridescent Rainbow + Diamond | Diamond |

- Locked badges: Greyscale silhouette with subtle shimmer, threshold text visible
- Unlocked badges: Full color with metallic shine animation on hover

#### Section C: Match Milestone Badges
- Same layout as Win Rate section
- Badge shape: **Star/Medal** (energetic, cavalier)
- **Color palette** (dandy/energetic):

| Tier | Threshold | Color Scheme |
|:---|:---|:---|
| 1 | 10 | Lime Green + Electric Yellow |
| 2 | 20 | Tangerine Orange + Hot Pink |
| 3 | 50 | Cyan Blue + Neon Purple |
| 4 | 100 | Electric Violet + Magenta |
| 5 | 150 | Sunset Coral + Golden |
| 6 | 200 | Royal Teal + Aquamarine |
| 7 | 250 | Crimson Red + Burnt Orange |
| 8 | 300 | Deep Indigo + Electric Blue |
| 9 | 400 | Emerald + Chrome Silver |
| 10 | 500 | Ruby Red + Gold Leaf |
| 11 | 750 | Black Onyx + Neon Green |
| 12 | 1000 | Prismatic Holographic |

#### Section D: Win Milestone Badges
- Badge shape: **Crown/Laurel** (elegant, royal)
- **Color palette** (elegant/royal):

| Tier | Threshold | Color Scheme |
|:---|:---|:---|
| 1 | 10 | Pearl White + Soft Gold |
| 2 | 20 | Champagne + Ivory |
| 3 | 50 | Rose Gold + Blush Pink |
| 4 | 100 | Royal Blue + Silver |
| 5 | 150 | Deep Burgundy + Gold |
| 6 | 200 | Imperial Purple + Silver |
| 7 | 250 | Emerald Green + Gold Trim |
| 8 | 300 | Midnight Blue + Platinum |
| 9 | 400 | Black Diamond + Gold |
| 10 | 500 | Crimson + Royal Gold |
| 11 | 750 | Obsidian + Rose Gold |
| 12 | 1000 | Celestial White + Prismatic Gold |

### 5.3 Symbol Effect Visual Design

**Important Note on Adaptability**: Any unlocked effect can be equipped by any user. The visual effect dynamically adapts to match whether the user is playing as 'X' or 'O' in their current match (e.g. X variations lean toward blue/cool palettes, O variations lean toward pink/magenta palettes).

Each effect wraps the X/O character in a 32×40px (sm: 40×40px) container with layered CSS animations:

#### 🔥 Fire Phoenix
- **X**: Blue-white flame core, orange ember particles floating up, faint phoenix wing silhouette behind
- **O**: Same flame treatment but with pink-magenta core matching O's theme color
- **Animation**: `@keyframes flicker` (opacity oscillation), `@keyframes ember-rise` (translateY particles)
- **CSS**: `filter: drop-shadow(0 0 6px #ff6b00)`, radial-gradient background

#### ⚡ Dragon Lightning
- **X**: Electric blue crackling arcs around the letter, subtle dragon scale texture overlay
- **O**: Electric pink-purple variant
- **Animation**: `@keyframes lightning-flash` (random opacity spikes), `@keyframes arc-draw` (stroke-dashoffset SVG)
- **CSS**: `text-shadow: 0 0 8px #00d4ff, 0 0 16px #0088ff`

#### 🌸 Scarlet Cherry Blossom
- **X**: Soft scarlet-pink glow, 3-5 tiny petal shapes drifting around the letter
- **O**: Deeper crimson variant with more petals
- **Animation**: `@keyframes petal-drift` (translateX + translateY + rotate), `@keyframes bloom-pulse` (scale breathing)
- **CSS**: `filter: drop-shadow(0 0 8px rgba(220, 38, 38, 0.4))`

#### ⚔️ Dark Slash
- **X**: Dark purple-black energy wisps, diagonal slash marks across the letter
- **O**: Same treatment with circular slash arcs
- **Animation**: `@keyframes slash-draw` (clip-path reveal), `@keyframes dark-wisp` (opacity + blur oscillation)
- **CSS**: `text-shadow: 0 0 6px #1a0033`, `mix-blend-mode: screen` on wisps

### 5.4 Theme Compatibility

All badge colors have light/dark mode variants:
- **Light mode**: Badges use slightly muted versions with visible borders
- **Dark mode**: Badges use full vibrant colors with glow effects
- Section headers use `text-content` / `text-content-muted` tokens
- Locked badge overlay: `bg-black/60 dark:bg-black/70` with `backdrop-blur-sm`

### 5.5 Performance Rules

- Effects use **CSS animations only** (no JS `requestAnimationFrame` on the board)
- Particle count limited to **max 5 elements** per cell to prevent lag on 20×20 grid
- Effects are **lazy-loaded** via `React.lazy()` — only import the active effect component
- Badge images rendered as **pure CSS** (gradients + borders + pseudo-elements), no external assets
- Achievement data fetched **once** on drawer open, cached in React state until drawer closes

---

## 6. Integration Points

### 6.1 WebSocket — `symbolEffects` Field
- `GameMessage.symbolEffects` sent on `JOIN` and `START` messages
- Backend queries `user_equipped_effects` for the users playing as X and O
- Frontend stores in `App.tsx` state: `symbolEffects: Record<string, string>`
- Passed down to `MainGame` → `SymbolRenderer`

### 6.2 Stats Reuse
- `AchievementService` calls `ConfrontationService.getUserStats()` — no duplicate DB queries
- Badge sync runs on `GET /api/user/achievements` (lazy evaluation, not on every game end)

### 6.3 GameController Hook
- After `recordConfrontation()` in `handleWin()`: no additional calls needed
- Achievements sync lazily when user opens Achievement panel

---

## 7. Docker Deployment

### 7.1 Liquibase
- New changeset in `02-achievement-schema.xml` auto-runs on backend container start
- No new volumes or env vars required

### 7.2 Rebuild Commands
```bash
docker compose up --build -d backend    # After backend changes
docker compose up --build -d frontend   # After frontend changes
```

---

## 8. Constraints & Rules

1. **No Lombok** — All entities use manual builders/getters/setters.
2. **Liquibase owns schema** — `ddl-auto` remains `validate`.
3. **Lazy sync** — Badge unlocks are checked on achievement page load, not on every game action.
4. **CSS-only effects** — No JS animation loops on the board grid to prevent performance degradation.
5. **Max 5 particles per cell** — Hard cap to avoid rendering 2000+ elements on a full 20×20 board.
6. **Effect components lazy-loaded** — `React.lazy()` + `Suspense` for effect modules.
7. **Single equipped effect** — One effect per user, stored in `user_equipped_effects` (unique on `user_id`).
8. **Auth-gated writes** — Only authenticated users can equip effects. Anonymous see read-only locked badges.
9. **Idempotent sync** — `syncBadges()` uses unique constraint to prevent duplicate inserts.
10. **Theme-aware** — All badge/effect colors must have light and dark mode variants.
11. **Future-proof** — Achievement keys use string enum pattern, easily extensible with new milestones.

---

## 9. Execution Phases

### Phase 1: Database Migration
1. Create `backend/src/main/resources/db/changelog/changes/02-achievement-schema.xml`
2. Register in `db.changelog-master.xml`
3. Verify migration runs cleanly

### Phase 2: Backend Entities & Repositories
1. Create `UserAchievement.java` entity
2. Create `UserEquippedEffect.java` entity
3. Create `UserAchievementRepository.java`
4. Create `UserEquippedEffectRepository.java`

### Phase 3: Backend Service & DTOs
1. Create `AchievementDTO.java`
2. Create `AchievementResponse.java`
3. Create `EquipEffectRequest.java`
4. Create `AchievementService.java` (sync + query + equip logic)

### Phase 4: Backend Controller & WebSocket
1. Create `AchievementController.java` (3 endpoints)
2. Add `symbolEffects` field to `GameMessage.java`
3. Modify `GameController.java` → populate `symbolEffects` on JOIN/START

### Phase 5: Frontend Types & API
1. Extend `types.ts` with new interfaces
2. Add API methods to `authApi.ts`
3. Add `symbolEffects` to `GameMessage` interface

### Phase 6: Frontend Effect Components
1. Create `SymbolRenderer.tsx`
2. Create `FirePhoenixEffect.tsx`
3. Create `DragonLightningEffect.tsx`
4. Create `CherryBlossomEffect.tsx`
5. Create `DarkSlashEffect.tsx`

### Phase 7: Frontend Achievement UI
1. Create `AchievementPanel.tsx` (3 collapsible sections)
2. Create `BadgeCard.tsx` (reusable badge renderer)
3. Create `EffectCard.tsx` (effect selector with preview)
4. Create `EffectPreview.tsx` (animated X/O preview)

### Phase 8: Frontend Integration
1. Modify `GameDrawer.tsx` — Add tab system (History | Achievement), rename header
2. Modify `MainGame.tsx` — Replace `{cell}` with `<SymbolRenderer />`
3. Modify `App.tsx` — Add `symbolEffects` state, pass to MainGame
4. Add achievement CSS to `index.css` (keyframes, badge gradients)

### Phase 9: Polish & Test
1. Verify all 4 effects render correctly on both X and O
2. Test badge unlock flow (play games → check achievement panel)
3. Test equip/unequip flow
4. Verify dark/light mode badge appearance
5. Performance check: ensure 20×20 board with effects doesn't drop below 60fps
6. Responsive check: achievement panel on mobile (390px)

---

## 10. File Modification Summary

### Files to CREATE

| File | Purpose |
|:---|:---|
| `backend/.../db/changelog/changes/02-achievement-schema.xml` | Liquibase migration for achievement tables |
| `backend/.../model/UserAchievement.java` | JPA entity for unlocked achievements |
| `backend/.../model/UserEquippedEffect.java` | JPA entity for equipped effect |
| `backend/.../repository/UserAchievementRepository.java` | Data access for achievements |
| `backend/.../repository/UserEquippedEffectRepository.java` | Data access for equipped effects |
| `backend/.../dto/AchievementDTO.java` | Badge data transfer object |
| `backend/.../dto/AchievementResponse.java` | Full achievement response DTO |
| `backend/.../dto/EquipEffectRequest.java` | Equip request body DTO |
| `backend/.../service/AchievementService.java` | Core achievement logic |
| `backend/.../controller/AchievementController.java` | REST endpoints |
| `frontend/src/components/achievements/AchievementPanel.tsx` | Main achievement UI panel |
| `frontend/src/components/achievements/BadgeCard.tsx` | Individual badge renderer |
| `frontend/src/components/achievements/EffectCard.tsx` | Effect selector card |
| `frontend/src/components/achievements/EffectPreview.tsx` | Animated effect preview |
| `frontend/src/components/achievements/SymbolRenderer.tsx` | Board symbol with effect |
| `frontend/src/components/effects/FirePhoenixEffect.tsx` | Fire Phoenix CSS/SVG animation |
| `frontend/src/components/effects/DragonLightningEffect.tsx` | Dragon Lightning animation |
| `frontend/src/components/effects/CherryBlossomEffect.tsx` | Cherry Blossom animation |
| `frontend/src/components/effects/DarkSlashEffect.tsx` | Dark Slash animation |

### Files to MODIFY

| File | Change |
|:---|:---|
| `backend/.../db/changelog/db.changelog-master.xml` | Include `02-achievement-schema.xml` |
| `backend/.../GameMessage.java` | Add `symbolEffects` field |
| `backend/.../GameController.java` | Populate `symbolEffects` on JOIN/START |
| `frontend/src/types.ts` | Add `EffectType`, `AchievementDTO`, `AchievementResponse`, extend `GameMessage` |
| `frontend/src/api/authApi.ts` | Add `getAchievements()`, `equipEffect()`, `unequipEffect()` |
| `frontend/src/components/GameDrawer.tsx` | Add tab system (History / Achievement), rename header |
| `frontend/src/components/MainGame.tsx` | Replace `{cell}` with `<SymbolRenderer />` |
| `frontend/src/App.tsx` | Add `symbolEffects` state, pass to MainGame |
| `frontend/src/index.css` | Add effect keyframes + badge gradient classes |
| `ai-state-persistent.md` | Record achievement system decisions |
| `ai-context-snapshot.md` | Update session snapshot |
