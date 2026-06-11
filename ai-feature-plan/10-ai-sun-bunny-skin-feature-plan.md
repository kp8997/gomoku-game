# Feature Plan 10 — Sun Bunny Skin Replacement

> **Plan ID**: `10`
> **Status**: 🔲 Not Started
> **Created**: 2026-06-12
> **Last Updated**: 2026-06-12
> **Scope**: Replace the Lucky Cat skin with a new Sun Bunny skin that contrasts with Moon Bunny.
> **Stack**: React, TypeScript, Spring Boot, Java, Liquibase

## 1. Objective
Create a new "Sun Bunny" symbol skin that contrasts with the existing Moon Bunny skin. The sun should be placed at the bottom right and the bunny at the top left of the cell. This new skin will replace the "Lucky Cat" skin, which currently unlocks at 90 wins. All users who currently have the Lucky Cat skin equipped will be automatically migrated to the Sun Bunny skin.

## 2. Database Schema
- **Liquibase Migration Document**: `07-replace-lucky-cat-with-sun-bunny.yaml`
- **Target Table**: `user_equipped_effects`
- **Target Column**: `symbol_skin`
- **Migration Logic**: 
  - Execute SQL equivalent to: `UPDATE user_equipped_effects SET symbol_skin = 'SUN_BUNNY' WHERE symbol_skin = 'LUCKY_CAT';`
  - This ensures that when the Spring Boot backend boots up and maps the `SymbolSkin` Enum, it does not throw an `IllegalArgumentException` from encountering the deprecated `LUCKY_CAT` value.
- **Master Changelog**: Add the new migration reference into `db.changelog-master.yml`.

## 3. Backend Architecture
- **Enum Updates (`SymbolSkin.java`)**:
  - Remove the instance: `LUCKY_CAT(90, "Lucky Cat", "Unlock at 90 Wins")`.
  - Introduce the new instance: `SUN_BUNNY(90, "Sun Bunny", "Unlock at 90 Wins")`.
  - No changes are needed to the underlying HTTP API controllers or the WebSocket `GameController` as they dynamically utilize the active enum values.
- **Service Layer**: 
  - `AchievementService` automatically resolves unlocked effects and skins by analyzing the enum values and the user's `wins` count. Replacing the enum element is sufficient to propagate the change downstream to the `/api/achievements` endpoint.

## 4. Frontend Architecture
- **Component File Structure**: 
  - Create: `frontend/src/components/skins/SunBunnySkin.tsx`
  - Delete: `frontend/src/components/skins/LuckyCatSkin.tsx`
- **Skin Mapping Layer (`SkinRenderer.tsx`)**:
  - Update lazy loading imports to swap `LuckyCatSkin` with `SunBunnySkin`.
  - Update the `SKIN_MAP` constant to map the `SUN_BUNNY` key to the newly created component, and remove the `LUCKY_CAT` mapping.
- **SVG Construction (`SunBunnySkin.tsx`)**:
  - **Grid / Placement Details**: The SVG container will be based on a `viewBox="0 0 24 24"`.
  - **Bunny Element**: Drawn on the top-left quadrant (`cx~6, cy~6`). It will consist of two distinct elliptical ears pointing upwards and a small head path, mirroring the structure of `MoonBunnySkin`.
  - **Sun Element**: Drawn on the bottom-right quadrant (`cx~18, cy~18`). It will consist of a solid bright central circle surrounded by 8 evenly spaced triangular/line ray paths extending outwards.
- **Color Theme & Contrast**:
  - **X Player Theme**: Rich Red/Orange (`#ef4444`, `#f97316`)
  - **O Player Theme**: Brilliant Gold/Yellow (`#eab308`, `#fde047`)
  - **Visual Contrast**: Moon Bunny uses deep purples and pale oranges for the crescent moon and ears. Sun Bunny uses vibrant, fiery daylight tones to act as a thematic opposite. A drop shadow filter (`filter: drop-shadow(...)`) matching the primary color will be applied to the SVG parent to ensure it stands out on the game board.

## 5. UI/UX Specification
- **Design Elements**: Sun Bunny will feature warm, radiant colors to contrast with Moon Bunny's cooler night palette.
- **Placement**: Bunny element on the top left; Sun element on the bottom right.
- **Shadow/Glow**: Will include a subtle drop shadow to match existing aesthetics.

## 6. Integration Points
- Replaces the 90-win tier completely. The frontend unlock check and backend validation will naturally pick up the new enum.

## 7. Docker Deployment
- No infrastructure changes. Standard `docker compose up --build -d backend frontend` rebuilds apply.

## 8. Constraints & Rules
1. **Data Integrity**: We MUST run a Liquibase migration to clean up `LUCKY_CAT` references in the database before deploying the backend, otherwise `valueOf()` will throw an exception if it encounters orphaned `LUCKY_CAT` data in the DB.

## 9. Execution Phases
1. **Database Phase**: Create Liquibase migration `07-replace-lucky-cat-with-sun-bunny.yaml` and update `db.changelog-master.yml`.
2. **Backend Phase**: Update `SymbolSkin.java` enum to replace `LUCKY_CAT` with `SUN_BUNNY`.
3. **Frontend Phase**: Create `SunBunnySkin.tsx`, delete `LuckyCatSkin.tsx`, and update `SkinRenderer.tsx`.
4. **Review & Test Phase**: Rebuild containers and verify the visual representation.

## 10. File Modification Summary

| File | Action | Purpose |
|:---|:---|:---|
| `backend/src/main/resources/db/changelog/db.changelog-master.yml` | MODIFY | Include new migration script |
| `backend/src/main/resources/db/changelog/changes/07-replace-lucky-cat-with-sun-bunny.yaml` | CREATE | Liquibase migration to replace LUCKY_CAT with SUN_BUNNY |
| `backend/src/main/java/com/gomoku/game/model/SymbolSkin.java` | MODIFY | Remove Lucky Cat, add Sun Bunny |
| `frontend/src/components/skins/SunBunnySkin.tsx` | CREATE | Render the Sun Bunny skin |
| `frontend/src/components/skins/LuckyCatSkin.tsx` | DELETE | Removed from project |
| `frontend/src/components/skins/SkinRenderer.tsx` | MODIFY | Remove Lucky Cat reference, add Sun Bunny |
