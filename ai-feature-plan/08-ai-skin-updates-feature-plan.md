# Feature Plan 08 — Skin Updates & Equip Exclusivity

> **Plan ID**: `08`  
> **Status**: 🔲 Not Started  
> **Created**: 2026-05-30  
> **Last Updated**: 2026-05-30  
> **Scope**: Increase skin sizes, merge King George and Pink Loopy into a single skin, remove Pink Loopy from the database, and enforce skin/effect equip exclusivity.  
> **Stack**: React, TypeScript, Spring Boot, Java, Liquibase

## 1. Objective
Make symbol skins larger and clearer on the board. Combine the `KING_GEORGE` and `PINK_LOOPY` skins into a single unlockable "King George & Loopy" skin that unlocks at 100 wins. Remove `PINK_LOOPY` entirely from the system. For this combined skin, player `X` will display as King George (using earthy brown colors) and player `O` will display as Pink Loopy. Fix the equip collision bug by enforcing exclusivity: when an effect is equipped, the skin is unequipped, and vice-versa.

## 2. Database Schema
- A Liquibase migration script (`06-merge-george-loopy.yaml`) will be created to:
  - Update any users who had `PINK_LOOPY` equipped in `user_equipped_effects` to have `KING_GEORGE` instead.
  - This ensures no orphaned data is left behind when the `PINK_LOOPY` enum is removed.

## 3. Backend Architecture
- **AchievementService.java**:
  - `equipSkin()`: Will set `effectKey = "NONE"` to clear any active effect when equipping a skin.
  - `equipEffect()`: Will set `symbolSkin = null` to clear any active skin when equipping an effect.
- **SymbolSkin.java**:
  - Remove `PINK_LOOPY` entirely.
  - Update `KING_GEORGE` to `KING_GEORGE(100, "George & Loopy", "Unlock at 100 Wins")`.

## 4. Frontend Architecture
- **SkinRenderer.tsx**:
  - Default size will increase from `24` to `36`.
  - Remove `PINK_LOOPY` from `SKIN_MAP`.
- **SymbolRenderer.tsx**:
  - Prop passed to `<SkinRenderer>` will increase from `22` to `36`.
- **KingGeorgeSkin.tsx** (will be renamed/refactored to **GeorgeAndLoopySkin.tsx**):
  - Refactored to act as a unified skin component: if `symbol === 'X'`, render King George (using brown colors). If `symbol === 'O'`, render Pink Loopy.
- **PinkLoopySkin.tsx**:
  - Delete this file entirely.

## 5. UI/UX Specification
- **Skin Size**: 36px (approx 50% larger).
- **Colors**: King George will be updated to earthy browns to differentiate from the board and other symbols.
- **Exclusivity**: Users can only have an effect OR a skin active, never both. This solves visual clutter and collision.

## 6. Integration Points
- Frontend `<SymbolRenderer>` fallback logic will naturally handle the exclusivity because the backend will only return either an `effectKey` or a `symbolSkin`, but never both simultaneously.

## 7. Docker Deployment
- No infrastructure changes. Standard `docker compose up --build -d backend frontend` rebuilds apply.

## 8. Constraints & Rules
1. **Exclusivity**: `effectKey` cannot be set to `null` in the database, it must be set to `"NONE"`. `symbolSkin` can be set to `null`.
2. **Data Integrity**: We MUST run a Liquibase migration to clean up `PINK_LOOPY` references in the database before deploying the backend, otherwise `valueOf()` will throw an exception if it encounters orphaned `PINK_LOOPY` data in the DB.

## 9. Execution Phases
1. **Database Phase**: Create Liquibase migration `06-merge-george-loopy.yaml`.
2. **Backend Phase**: Update `SymbolSkin.java` enum and `AchievementService.java` equip logic.
3. **Frontend Phase**: Refactor `KingGeorgeSkin.tsx` to handle both George and Loopy logic. Delete `PinkLoopySkin.tsx`. Update `SkinRenderer.tsx` and `SymbolRenderer.tsx`.
4. **Review & Test Phase**: Rebuild containers, equip the combined skin to verify X/O rendering, and test effect exclusivity.

## 10. File Modification Summary

| File | Action | Purpose |
|:---|:---|:---|
| `backend/src/main/resources/db/changelog/db.changelog-master.yaml` (or `.yml`) | MODIFY | Include new migration script |
| `backend/src/main/resources/db/changelog/changes/06-merge-george-loopy.yaml` | CREATE | Liquibase migration to replace PINK_LOOPY with KING_GEORGE |
| `backend/src/main/java/com/gomoku/game/model/SymbolSkin.java` | MODIFY | Update George label, remove Pink Loopy |
| `backend/src/main/java/com/gomoku/game/service/AchievementService.java` | MODIFY | Implement equip exclusivity logic |
| `frontend/src/components/skins/SkinRenderer.tsx` | MODIFY | Increase size to 36, remove Pink Loopy reference |
| `frontend/src/components/achievements/SymbolRenderer.tsx` | MODIFY | Increase passed size to 36 |
| `frontend/src/components/skins/KingGeorgeSkin.tsx` | MODIFY | Refactor to render George for X, Loopy for O |
| `frontend/src/components/skins/PinkLoopySkin.tsx` | DELETE | Removed from project |
