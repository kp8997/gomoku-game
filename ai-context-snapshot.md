# Session Snapshot: Symbol Effects Toggle [2026-05-29]

## 1. Architectural Decisions & Changes

### Symbol Effects Toggle (UserDropdown & MainGame)
- **Problem**: Users could not turn off cosmetic symbol effects if they found them distracting or performance-intensive.
- **Solution**: Added an `effectsEnabled` state (maintained in the application context/state) and propagated it to `UserDropdown` and `MainGame`.
- **Implementation**: 
  - Created a custom `TogglePill` component for iOS-style boolean switches inside the dropdown menu.
  - Added a "Preferences" section to `UserDropdown` to easily toggle "Dark Mode" and "Symbol Effects".
  - Updated `MainGame` to evaluate `effectsEnabled`; if false, the user's own symbol effects evaluate to `undefined` and are not rendered, gracefully falling back to default symbols.

## 2. Established Constraints
- **Effect Toggling Rules**: Disabling effects only applies to the *user's own client rendering*; other clients still experience the effects based on their own local settings. The winning line remains colored as usual.
- **Ref-Based STOMP Callbacks**: All state accessed inside STOMP `onMessage` must use `useRef` to avoid stale closures.
- **PRODUCTION DATA CONSTRAINT**: Any database schema changes, seeded data changes, or enum mapping changes MUST be accompanied by a Liquibase migration script (or explicit data transformation logic).

## 3. Files Modified This Session
### Frontend
| File | Change |
|:---|:---|
| `App.tsx` | Added `effectsEnabled` state and handler logic |
| `Header.tsx` | Passed effect toggle props to `UserDropdown` |
| `MainGame.tsx` | Conditionally apply `symbolEffects` based on `effectsEnabled` state |
| `UserDropdown.tsx` | Added iOS-style toggle switches for user preferences |

## 4. Current System State
- **Git**: Branch `master`, commit `85f5e39` (add turn off effect for note symbol).
- **Features**: Cosmetic symbol effects can now be toggled locally on a per-client basis.

## 5. Next Step Logic
- **Testing**: Verify that toggling effects during an active match cleanly unmounts the particle effects immediately.
- **E2E Visual Verification**: Test all 18 effects in dual-tab mode to ensure the toggle state is perfectly isolated per-client and that winning lines still function correctly.
- **Persistence**: Ensure the user's toggle preferences (dark mode, effects) persist effectively via `localStorage` or backend sync on subsequent visits.
