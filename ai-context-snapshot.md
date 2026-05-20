# Session Snapshot: Win Milestones Upgrade & Real-Time Cosmetic Sync [2026-05-20]

## 1. Architectural Decisions & Changes
- **Dynamic SymbolEffect Enum**: Created the `SymbolEffect` Java enum to replace hardcoded integer wins requirements for cosmetic effects. Mappings are explicitly defined as:
  - `FIRE_PHOENIX`: 20 wins (`WINS_20`)
  - `DRAGON_LIGHTNING`: 30 wins (`WINS_30`)
  - `CHERRY_BLOSSOM`: 50 wins (`WINS_50`)
  - `DARK_SLASH`: 100 wins (`WINS_100`)
- **WebSocket Cosmetics Syncing**: Resolved the sync issue where opponent visual cosmetics did not appear in real-time. The backend eagerly loads equipped effects (`equippedEffectRepository.findByUser_UsernameIn`) on all key game movements/room events (`JOIN`, `MOVE`, `START`) and attaches the compiled `symbolEffects` mapping (`username -> effectKey`) to the outgoing `GameMessage` STOMP payload.
- **Winning Line strike-through**: Updated the `<motion.line>` SVG overlay so that `winningEffect` is resolved using the winner's username: `symbolEffects[winner]`.
- **Avatar Persistence**: Profile avatars are uploaded as Base64 strings (limited to 500KB) and persisted in PostgreSQL using a `TEXT` column in the `users` table, allowing seamless stateless transfer.
- **WINS_30 Integration**: Added the `30` wins milestone to `AchievementService.WIN_MILESTONES` and updated `seed.sql` to cleanly populate `'WINS_30'` for admin accounts, avoiding achievement fetching errors.

## 2. Established Constraints
- **Symbol Effect Unlock Checks**: All dynamic effects must verify user unlock status via `SymbolEffect` enum mappings in `AchievementService.isEffectUnlocked`.
- **Eager Loading WebSocket Sessions**: Database fetches inside WebSocket handlers must eagerly resolve Lazy relationships (`JOIN FETCH e.user`) to avoid `LazyInitializationException` outside active HTTP transaction boundaries.
- **Move History Integrity**: The `history` array inside React states must remain fully synced and contain accurate `player` (username) fields, as it acts as the primary index for resolving coordinates to player-equipped visual effects.

## 3. Variable Mappings & Core Logic
- **`SymbolEffect`**: Enum containing `requiredAchievementKey`, `requiredWins`, and `requirementLabel`.
- **`GameMessage.symbolEffects`**: `Map<String, String>` mapping active player usernames in a room to their equipped cosmetic effect key.
- **`MainGame.tsx:effectKey`**: Evaluated as `history.find(m => m.row === r && m.col === c)?.player ? symbolEffects[move.player] : undefined`.
- **`User.avatar`**: JPA entity `@Column(name = "avatar", columnDefinition = "TEXT")` representing the Base64 image string.

## 4. Next Step Logic
- **E2E Visual Verification**: Run the application in dual-tab authenticated mode to verify real-time render animations for each unlocked symbol effect.
- **Typing Indicators**: Introduce real-time user typing indicators utilizing lightweight, transient WebSocket messages (`/app/game.typing`) inside the chat panel.
- **Spectator Arena**: Establish observer routes allowing late joiners to spectate full arenas as passive spectators without active board slot allocation.
