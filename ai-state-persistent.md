
# Schema & Logic Manifest [2026-05-16]

## 0. AI Feature Plan Protocol

> **MANDATORY**: Before coding any new feature, create a detailed plan document first.

### Naming Convention
- **Format**: `{NN}-ai-{feature-name}-feature-plan.md`
- **Location**: `ai-feature-plan/` directory at project root
- **Numbering**: Sequential, zero-padded (`01`, `02`, `03`...)
- **Examples**: `01-ai-auth-feature-plan.md`, `02-ai-matchmaking-feature-plan.md`

### Required Sections (Template)

Every plan **must** include these sections in this exact order:

| # | Section | Purpose |
|:---|:---|:---|
| 1 | **Objective** | What the feature does, why, and what's preserved (backward compat) |
| 2 | **Database Schema** | Tables, columns, types, constraints, indexes, relationships |
| 3 | **Backend Architecture** | Dependencies, config, file structure, REST API endpoints, security, validation rules, core logic |
| 4 | **Frontend Architecture** | File structure, modified files, TypeScript interfaces, state management, validation rules, API layer |
| 5 | **UI/UX Specification** | Component behavior, conditional rendering, interaction details, design tokens |
| 6 | **Integration Points** | How the feature connects to existing systems (WebSocket, state sync, etc.) |
| 7 | **Docker Deployment** | Volume mounts, env vars, config changes needed for containerized deployment |
| 8 | **Constraints & Rules** | Numbered list of non-negotiable rules and constraints |
| 9 | **Execution Phases** | Ordered phases with numbered steps — backend first, then frontend, then polish |
| 10 | **File Modification Summary** | Tables listing every file to CREATE and every file to MODIFY with purpose/change |

### Header Format

```markdown
# Feature Plan #NN — Feature Title

> **Plan ID**: `NN`  
> **Status**: 🔲 Not Started | 🔄 In Progress | ✅ Implemented  
> **Created**: YYYY-MM-DD  
> **Last Updated**: YYYY-MM-DD  
> **Scope**: Brief scope description  
> **Stack**: Technologies involved
```

### Key Principles
1. **Clarity**: Any AI model (not just the one that wrote it) must be able to execute the plan without ambiguity.
2. **Precision**: Include exact file paths, exact interface shapes, exact SQL, exact validation regex.
3. **Consistency**: All plans follow the same section order, table formats, and code block styles.
4. **Completeness**: Every file that will be created or modified must be listed. No surprises during execution.
5. **Constraint-Driven**: Rules section captures all hard requirements upfront to prevent regressions.

### Docker Execution Rules
- **MANDATORY REBUILDS**: Whenever you modify any code inside the `backend/` or `frontend/` folders, you **MUST** rebuild and restart the corresponding container to ensure changes take effect:
  - For backend changes: `docker compose up --build -d backend`
  - For frontend changes: `docker compose up --build -d frontend`
  - To clean-build without cache: `docker compose build --no-cache <service> && docker compose up -d <service>`

| ID | Feature | Status | File |
|:---|:---|:---|:---|
| 01 | Authentication, Profile & Confrontation Records | ✅ Implemented | `ai-feature-plan/01-ai-auth-feature-plan.md` |
| 02 | PostgreSQL Migration | ✅ Implemented | `ai-feature-plan/02-ai-postgresql-migration-feature-plan.md` |
| 03 | Match History & Liquibase Migration | ✅ Implemented | `ai-feature-plan/03-ai-match-history-feature-plan.md` |
| 04 | UI Overhaul: History Page, Chat Bubble, Settings, Auth Landing | ✅ Implemented | `ai-feature-plan/04-ai-ui-overhaul-feature-plan.md` |
| 05 | Achievement System & Symbol Effects | ✅ Implemented | `ai-feature-plan/05-ai-achievement-system-feature-plan.md` |
| 06 | New Cosmetic Effects (Heart Flutter, Nature Leaf, Vibrant Fire) | ✅ Implemented | `ai-feature-plan/06-ai-new-cosmetic-effects-feature-plan.md` |
| 07 | Cascade Delete Users | ✅ Implemented | `ai-feature-plan/07-ai-cascade-delete-users-feature-plan.md` |


## 1. Project Architecture

### Stack
| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Backend** | Spring Boot (Java) | WebSocket via STOMP over SockJS, port `8888` |
| **Frontend** | React 19 + TypeScript | Vite 8, Tailwind CSS 4.0, Framer Motion 12 |
| **Icons** | Lucide React | `Moon`, `Sun`, `Layout`, `LogOut`, `User`, `RefreshCw`, `Copy`, `Check`, `History`, `MessageSquare`, `Send`, `X`, `Hash`, `Trophy` |
| **WebSocket** | SockJS + StompJS | Endpoint: `/ws-gomoku`, Topic: `/topic/game/{room}` |
| **Deployment** | Docker Compose | Backend `:8888`, Frontend `:9999`, PostgreSQL `:5434`, Network: `gomoku-network` |
| **CI/CD** | GitHub Actions | Auto-deploy to Oracle Cloud via SSH |
| **Hosting** | Oracle Cloud (Backend) + Vercel (Frontend) | Nginx reverse proxy with SSL for WSS |

### File Tree (Source of Truth)
```
backend/src/main/java/com/gomoku/game/
├── GomokuApplication.java      # Spring Boot entry point
├── WebSocketConfig.java        # STOMP broker config (/topic, /app), heartbeats (10s/10s), buffer (512KB)
├── GameMessage.java            # Message schema + inner classes (Move, ChatMessage, enums)
├── GameController.java         # Game logic, room management, timer, win detection, confrontation recording, disconnect pause
├── model/
│   ├── User.java               # JPA entity (manual builder, no Lombok)
│   ├── ConfrontationRecord.java # JPA entity (canonical pair)
│   ├── SymbolEffect.java       # Enum: 10 effects (FIRE_PHOENIX→AURORA_BOREALIS) with win requirements
│   ├── UserAchievement.java    # JPA entity (user_id, achievement_key, unlocked_at)
│   └── UserEquippedEffect.java # JPA entity (user_id, effect_key)
├── repository/
│   ├── UserRepository.java
│   ├── ConfrontationRepository.java
│   ├── UserAchievementRepository.java
│   └── UserEquippedEffectRepository.java
├── dto/
│   ├── SignupRequest.java
│   ├── LoginRequest.java
│   ├── AuthResponse.java
│   ├── ProfileUpdateRequest.java
│   ├── UserProfileResponse.java
│   ├── ConfrontationDTO.java
│   ├── AchievementDTO.java
│   ├── AchievementResponse.java # Includes EffectDTO inner class
│   └── UserStatsDTO.java
├── service/
│   ├── AuthService.java        # Signup validation, login, token gen
│   ├── UserService.java        # Profile CRUD
│   ├── ConfrontationService.java # H2H record/query + user stats
│   └── AchievementService.java # Badge sync, effect unlock checks, equip/unequip
├── security/
│   ├── SecurityConfig.java     # HTTP security filter chain
│   ├── JwtTokenProvider.java   # JWT creation & validation
│   └── JwtAuthenticationFilter.java # OncePerRequestFilter
└── controller/
    ├── AuthController.java     # POST /api/auth/signup, /api/auth/login
    ├── UserController.java     # GET/PUT /api/user/profile, GET /api/user/stats
    └── AchievementController.java # GET /api/achievements, POST equip/unequip

frontend/src/
├── App.tsx                     # Root: state management, WebSocket (refs for stale closure), routing, auth, chat
├── index.css                   # Design system: tokens, dark mode, glassmorphism
├── main.tsx                    # Entry point: BrowserRouter + Routes (/, /history, /settings) + AuthProvider
├── types.ts                    # TypeScript interfaces (Move, ChatMessage, GameMessage, auth types, EffectType, AchievementDTO)
├── api/
│   └── authApi.ts              # fetch wrappers for auth, profile, stats, achievements, effects
├── context/
│   └── AuthContext.tsx          # React Context for auth state (user, token, login/logout)
├── pages/
│   ├── MatchHistoryPage.tsx    # /history: stats dashboard + confrontation records (auth-guarded)
│   └── SettingsPage.tsx        # /settings: profile editor + account management (auth-guarded)
└── components/
    ├── Header.tsx              # Scores, timer, drawer toggle, theme, exit, auth identity (sticky)
    ├── InformationScreen.tsx   # Pre-game: name, mode select, join/copy, login prompt (anon only)
    ├── AuthInformationScreen.tsx # Pre-game lobby dashboard for authenticated users with quick stats
    ├── MainGame.tsx            # Board grid, winning line SVG (10 effect cases), winner popup, ChatBubble
    ├── GameDrawer.tsx          # Side panel: Move History only (chat removed)
    ├── ChatBubble.tsx          # Floating bottom-right chat bubble with notification badge
    ├── ChatPanel.tsx           # Real-time chat (used inline inside ChatBubble)
    ├── HistorySection.tsx      # Move history list
    ├── TurnTimer.tsx           # Circular SVG countdown timer (ref-based, pause on disconnect)
    ├── TimeoutWarning.tsx      # Global timeout warning overlay
    ├── AuthModal.tsx           # Login/Signup modal (tabbed, glassmorphism)
    ├── UserDropdown.tsx        # User menu dropdown (navigate to /history, /settings)
    ├── ProfileModal.tsx        # Profile editor modal
    ├── achievements/
    │   ├── AchievementPanel.tsx # Collapsible sections: Effects, Win Rate, Matches, Wins
    │   ├── BadgeCard.tsx       # Individual badge display card
    │   ├── EffectCard.tsx      # Effect preview card with equip/lock states
    │   └── SymbolRenderer.tsx  # Lazy-loaded effect component switch (10 effects)
    └── effects/
        ├── effects.css         # All keyframe animations for effects
        ├── FirePhoenixEffect.tsx
        ├── DragonLightningEffect.tsx
        ├── HeartFlutterEffect.tsx
        ├── CherryBlossomEffect.tsx
        ├── NatureLeafEffect.tsx
        ├── VibrantFireEffect.tsx
        ├── OceanSplashEffect.tsx
        ├── CosmicNebulaEffect.tsx
        ├── DarkSlashEffect.tsx
        └── AuroraBorealisEffect.tsx
```

## 2. WebSocket Schema (GameMessage.java)

### Enums
| Enum | Values |
| :--- | :--- |
| `MessageType` | `CHAT`, `JOIN`, `MOVE`, `LEAVE`, `START`, `WIN`, `ROOM_STATUS`, `ERROR`, `TIMEOUT` |
| `GameMode` | `SINGLE`, `MULTIPLE` |

### GameMessage Fields
| Field | Type | Description |
| :--- | :--- | :--- |
| `type` | `MessageType` | Message classification |
| `content` | `String` | Symbol for MOVE, text for CHAT/WIN |
| `sender` | `String` | Username of originator |
| `row` / `col` | `int` | Board coordinates (0-19) |
| `gameId` | `String` | Room identifier |
| `mode` | `GameMode` | `SINGLE` or `MULTIPLE` |
| `history` | `List<Move>` | Full chronological move list |
| `chatHistory` | `List<ChatMessage>` | Full chat log (sent on JOIN) |
| `winner` | `String` | Username or "Player X/O" |
| `scores` | `Map<String, Integer>` | Keyed by username (MULTIPLE) or "Player X/O" (SINGLE) |
| `playerCount` | `int` | Active sessions in room |
| `timestamp` | `long` | Message timestamp (ms) for CHAT |
| `winningLine` | `List<Move>` | 5+ coordinates of winning cells |
| `turnStartTime` | `long` | Backend timestamp (ms) of current turn start |
| `turnDuration` | `int` | Turn length in seconds (Current: **60**) |
| `playerSymbol` | `String` | Assigned `'X'` or `'O'` for the session |

### Inner Classes
| Class | Fields | Notes |
| :--- | :--- | :--- |
| `Move` | `player`, `row`, `col`, `symbol` | Used in `history` and `winningLine` |
| `ChatMessage` | `sender`, `content`, `timestamp` | Used in `chatHistory` |

## 3. Frontend TypeScript Interfaces (types.ts)

```typescript
Move       { player: string, row: number, col: number, symbol: string }
ChatMessage { sender: string, content: string, timestamp: number }
GameMessage { type, content?, sender?, row?, col?, gameId?, mode?, history?, chatHistory?,
              winner?, scores?, playerCount?, timestamp?, winningLine?,
              turnStartTime?, turnDuration?, playerSymbol? }
```

## 4. Core Logic & Protocol

### A. Join & Initialization Flow
1. **Client**: Sends `JOIN` with `gameId`, `sender` (random name or authenticated username), and requested `mode`.
2. **Backend**:
   - Sets `GameRoom.mode` **before** `addSession` to prevent "Player X/O" name leak into Multiplayer.
   - `addSession`: Registers `sessionId` to `username` mapping; **Initializes scores to 0** if missing → names appear in UI immediately.
   - For `SINGLE` mode: ensures `"Player X"` and `"Player O"` keys exist in `scores`.
   - For `MULTIPLE` mode: score key = actual username.
   - Eagerly loads user cosmetic effects (`JOIN FETCH e.user`) and broadcasts the mapping as `symbolEffects` (`username -> effectKey`).
3. **Broadcast**: Sends `JOIN` response (full state, including unread chat count and dynamic equipped cosmetics) to all subscribers of `/topic/game/{room}`.
4. **Room Status**: `broadcastStatus()` called after join to update occupancy for all clients.

### B. Turn & Time Management
- **Authority**: Backend `ScheduledExecutorService` (4-thread pool) manages the 60s timeout.
- **Constant**: `TURN_DURATION_SECONDS = 60`.
- **Sync**: Backend sends `turnStartTime` on every MOVE. Frontend uses `(Date.now() - turnStartTime) / 1000`.
- **Symbol Switch**: Explicit `turnSymbol` derived from `history.length % 2 === 0 ? 'X' : 'O'`.
- **Timer Start**: Only starts after a valid MOVE (not on game START). `turnStartTime = 0` at START.
- **Timer Stop**: On WIN, START, or session disconnect.

### C. Win & Score Logic
- **Winning Line**: 5-in-a-row (horizontal, vertical, diagonal). Checked via `getWinningLine()` using 4 directional scans from the last-placed cell.
- **Win Key**: Single Mode → `"Player X"` or `"Player O"`. Multiplayer → actual username.
- **Timeout Win**: If `currentTime > turnStartTime + duration`, the *other* player is awarded a win.
- **Single Mode Stats**: Any win (X or O) increments local `stats.wins`.
- **Winner Popup Delay**: Timeout wins show popup **immediately** (`delay=0`). 5-in-a-row wins wait **2500ms** for SVG line animation.

### D. Move Validation & Deduplication
- **Backend**: `isValidMove(r, c)` checks bounds (0-19) and cell emptiness.
- **Backend (MULTIPLE)**: Rejects if `sender === lastPlayer` (prevents consecutive moves).
- **Frontend**: `App.tsx` checks `history` for existing `row/col` before processing `MOVE` messages to prevent UI flickering.

### E. Room Occupancy & Mode Locking
- **Max Players**: SINGLE=1, MULTIPLE=2 (enforced in `joinGame`).
- **Mode Locking**: If `serverGameMode` is set, the UI toggle is disabled (`cursor-not-allowed`, `opacity-80`).
- **Room Full**: Displays amber warning banner with pulsing icon. Join button becomes `Arena Full` with dashed border.
- **New Room**: `createNewRoom()` generates random ID and does hard `window.location.href` refresh.

### F. Session Disconnect
- `SessionDisconnectEvent` triggers `removeSession(sessionId)`, `stopTurnTimer`, and `broadcastStatus`.
- Players set is `LinkedHashSet` (insertion-ordered) → first player = X, second = O.

## 5. App.tsx State Variables

| Variable | Type | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `username` | `string` | `''` | Randomly generated on mount |
| `isJoined` | `boolean` | `false` | Pre-game vs in-game view toggle |
| `board` | `(string\|null)[][]` | 20×20 nulls | Visual board state |
| `gameId` | `string` | `''` | From URL `?room=` or random |
| `gameMode` | `'SINGLE'\|'MULTIPLE'` | `'MULTIPLE'` | Selected game mode |
| `history` | `Move[]` | `[]` | Chronological move list |
| `winner` | `string\|null` | `null` | Winner name or null |
| `showDrawer` | `boolean` | `false` | Side panel visibility |
| `scores` | `Record<string, number>` | `{}` | Player→score mapping |
| `isDarkMode` | `boolean` | `true` | Theme state (default: dark) |
| `copied` | `boolean` | `false` | Clipboard feedback |
| `chatMessages` | `ChatMessage[]` | `[]` | Chat history |
| `winningLine` | `Move[]` | `[]` | Winning cell coordinates |
| `_stats` | `{wins, losses}` | `{0, 0}` | Local session stats |
| `turnStartTime` | `number` | `0` | Backend turn start (ms) |
| `turnDuration` | `number` | `60` | Turn duration (seconds), updated by backend |
| `mySymbol` | `string\|null` | `null` | Assigned 'X' or 'O' |
| `playerCount` | `number` | `0` | Active players in room |
| `turnSymbol` | `'X'\|'O'` | `'X'` | Current turn symbol |
| `serverGameMode` | `'SINGLE'\|'MULTIPLE'\|null` | `null` | Server-reported mode (locks UI) |
| `isRoomFull` | `boolean` | `false` | Blocks join button |
| `roomFullReason` | `string\|null` | `null` | Displayed in warning banner |
| `isAuthenticated` | `boolean` | `false` | Auth state from AuthContext |
| `user` | `AuthResponse\|null` | `null` | Logged-in user details |
| `showAuthModal` | `boolean` | `false` | Login/Signup modal toggle |
| `showProfileModal` | `boolean` | `false` | Profile editor modal toggle |

### Derived State
```typescript
isMyTurn = (gameMode === 'SINGLE' || (
  mySymbol ? turnSymbol === mySymbol : history.length === 0 || history[history.length-1].player !== username
)) && (gameMode === 'SINGLE' || playerCount >= 2);
```

## 6. Component Props Map

### Header
`isJoined`, `scores`, `showDrawer`, `setShowDrawer`, `isLightMode`, `setIsLightMode`, `isMyTurn`, `leaveGame`, `username`, `turnStartTime`, `turnDuration`, `isGameOver`, `gameMode`, `currentTurnSymbol`, `playerCount`

### InformationScreen
`username`, `setUsername`, `generateRandomName`, `gameId`, `gameMode`, `setGameMode`, `copied`, `copyToClipboard`, `connect`, `isRoomFull`, `roomFullReason`, `serverGameMode`, `createNewRoom`

### MainGame
`board`, `history`, `winner`, `gameId`, `showDrawer`, `setShowDrawer`, `isMyTurn`, `makeMove`, `resetGame`, `chatMessages`, `onSendMessage`, `username`, `winningLine`

### GameDrawer
`setShowDrawer`, `history`, `chatMessages`, `onSendMessage`, `username`, `gameId`

### TurnTimer
`startTime`, `duration`, `isMyTurn`, `isPaused?`, `gameMode`, `currentTurnSymbol`, `playerCount`

### TimeoutWarning
`startTime`, `duration`, `isMyTurn`, `isPaused`

### ChatPanel
`messages`, `onSendMessage`, `isOpen`, `setIsOpen`, `currentUser`, `isInline?`

### HistorySection
`history`

## 7. Design System (index.css)

### CSS Custom Properties
| Token | Light | Dark |
| :--- | :--- | :--- |
| `--color-surface` | `#f1f5f9` | `#131c2e` |
| `--color-content` | `#0f172a` | `rgba(255,255,255,0.92)` |
| `--color-content-muted` | `#334155` | `#94a3b8` |
| `--color-glass-bg` | `rgba(255,255,255,0.85)` | `rgba(15,23,42,0.6)` |
| `--color-glass-border` | `rgba(15,23,42,0.1)` | `rgba(255,255,255,0.1)` |
| `--color-board-grid` | `#64748b` | `#475569` |
| `--color-board-cell` | `#ffffff` | `#1e293b` |
| `--color-input-bg` | `rgba(15,23,42,0.05)` | `rgba(255,255,255,0.05)` |
| `--color-input-focus` | `#ffffff` | `#0f172a` |
| `--color-brand` | `#3b82f6` | — |
| `--color-accent` | `#ec4899` | — |

### Key Utility Classes
- `.glass-card`: `backdrop-blur-2xl border border-glass-border bg-glass-bg shadow-2xl`
- `.custom-scrollbar`: Thin 6px scrollbar with slate colors
- `.game-mode-switch`: iOS-style toggle (3.5em × 2em)
- `.dark` class: Applied to `document.documentElement` for theme switching

### Symbol Colors
| Symbol | Color | Glow |
| :--- | :--- | :--- |
| **X** | `text-blue-600` / `bg-blue-500` | `drop-shadow(0 0 10px rgba(37,99,235,0.5))` |
| **O** | `text-pink-600` / `bg-pink-500` | `drop-shadow(0 0 10px rgba(219,39,119,0.5))` |

## 8. Responsive Breakpoints & Rules

| Breakpoint | Target | Header Behavior |
| :--- | :--- | :--- |
| **<425px** | iPhone 12 Pro (390px) | Ultra-compact. Scores show `X: 0`, `O: 0`. Timer label hidden. Exit text hidden. |
| **425px-768px** | Large phones | Score labels visible. Timer shows `Remaining`. |
| **768px-1024px** | Tablet | Names abbreviated to initials via `getInitials()`. Horizontal layout. |
| **>1024px** | Desktop | Full names displayed. All labels visible. `20x20 Arena` badge shown. |

### Abbreviation Logic
- `getInitials(name)`: Splits on spaces, takes first char of each word, joins uppercase. `"Swift Dragon"` → `"SD"`.
- Single Mode: `"Player X"` → `"X"` below 1024px; full `"Player X"` at ≥1024px.
- Multiplayer: Full username at ≥1024px; initials below.

### GameDrawer Responsive
- Mobile: `fixed inset-y-0 left-0 w-[85vw]` with `z-[60]`.
- Desktop (lg): `relative` with `w-[360px]`.

## 9. TimeoutWarning Component

### Architecture
- **Global overlay** in `App.tsx`, outside the main game container.
- `pointer-events-none` + `z-[100]` → never interferes with game input.
- Uses **radial mask** to keep center (game board) fully clear.

### Thresholds & Visual Spec
| Phase | Time Left | Color | Blur (edges) | Vignette | Pulse Duration |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Warning** | ≤15s, >5s | Yellow `rgba(234,179,8,...)` | 3px | 120px @ 0.2 opacity | 2s |
| **Urgent** | ≤5s | Red `rgba(239,68,68,...)` | 5px | 180px @ 0.3 opacity | 0.8s |

### Radial Mask
```css
maskImage: radial-gradient(circle at center, transparent 35%, black 75%)
```
- Center 35% radius: fully transparent (board visible, no blur).
- 35%-75%: gradual transition.
- Beyond 75%: full effect applied.

### Urgent Edge Flash
- 4px border with `border-red-500/20`, pulsing opacity `[0, 0.1, 0]` every 0.4s.

## 10. WebSocket Configuration

```java
// WebSocketConfig.java
broker: /topic          // Simple in-memory broker
prefix: /app            // Client→server destination prefix
endpoint: /ws-gomoku    // SockJS endpoint, allowedOriginPatterns("*")
```

### Frontend Connection
```typescript
const backendUrl = import.meta.env.VITE_WS_URL || `http://${window.location.hostname}:8888/ws-gomoku`;
// Auto-reconnect on failure: setTimeout(connectToBackend, 5000)
```

## 11. Backend GameRoom (Inner Class)

| Field | Type | Notes |
| :--- | :--- | :--- |
| `board` | `String[20][20]` | `null` = empty |
| `history` | `List<Move>` | Cleared on `reset()` |
| `chatHistory` | `List<ChatMessage>` | Cleared on `reset()` |
| `players` | `LinkedHashSet<String>` | Insertion-ordered (X=first, O=second) |
| `sessionToUser` | `ConcurrentHashMap<String, String>` | Map of WebSocket `sessionId` to `username` |
| `playerSymbols` | `ConcurrentHashMap<String, String>` | Decoupled player-to-symbol (`username -> X/O`) mapping |
| `scores` | `HashMap<String, Integer>` | Persists across rounds, cleared when room empties |
| `lastPlayer` | `String` | For consecutive-move prevention |
| `mode` | `GameMode` | Set on first JOIN |
| `turnStartTime` | `long` | 0 at start/reset |

### Key Methods
- `addSession(sessionId, username)`: Associates a tab's session with a user. Tracks multi-tab access per user.
- `removeSession(sessionId)`: Disassociates session; only removes username from active room list when no other open tabs/sessions remain for them.
- `assignPlayerSymbol(username, symbol)`: Explicitly sets username's symbol inside `playerSymbols`.
- `getPlayerSymbol(username)`: Resolves from `playerSymbols` instead of linked set index to support decoupled first-move assignments.
- `getNextSymbol()`: `history.size() % 2 == 0 ? "X" : "O"`.
- `getWinningLine(r, c)`: 4-directional scan from placed cell, returns `List<Move>` if ≥5 found.
- `setMode(MULTIPLE)`: Cleans up "Player X"/"Player O" keys from scores if they have 0 value.

## 12. Docker Compose

```yaml
services:
  backend:  port 8888, context ./backend
  frontend: port 9999, context ./frontend, arg VITE_WS_URL
network: gomoku-network (bridge)
```

## 13. Historical Decisions Log

### Session: Building Real-Time Gomoku [2026-05-10]
- **Board Size**: Fixed at 20×20 (constant `BOARD_SIZE = 20`).
- **Turn Enforcement**: Multiplayer mode prevents consecutive moves by checking `lastPlayer`.
- **iOS-Style Toggle**: Custom CSS `.game-mode-switch` for mode selection.
- **Score Persistence**: Scores persist across rounds within the same room session.

### Session: Refining Gomoku Chat UI [2026-05-13]
- **GameDrawer Refactor**: Consolidated History and Chat into a single tabbed drawer component.
- **Drawer Animation**: Spring-based Framer Motion (`stiffness: 300, damping: 30`).
- **Layout Animation**: Uses `LayoutGroup` in MainGame for smooth board resize when drawer opens/closes.
- **Chat Inline Mode**: `ChatPanel` supports `isInline` prop for embedding inside GameDrawer vs standalone panel.

### Session: Implementing Real-Time Chat [2026-05-13]
- **Backend ChatMessage**: Added `timestamp` field (long, ms) to `GameMessage.ChatMessage`.
- **Chat History Sync**: Full `chatHistory` sent on JOIN for late joiners.
- **Frontend Type Alignment**: `ChatMessage` interface added to shared `types.ts`.

### Session: Cleaning Up Build Artifacts [2026-05-13]
- **`.gitignore`**: Added `backend/target/` to prevent `.jar` files from being tracked.

### Session: Updating Gomoku Favicon [2026-05-13]
- **Favicon**: Custom SVG/ICO reflecting game aesthetic.

### Session: Refining Winning Effects [2026-05-13]
- **SVG Strike-Through**: Replaced cell-based animation with single `<motion.line>` SVG overlay.
- **Line Animation**: `pathLength: 0 → 1` over 0.8s with `easeOut`.
- **Color Coding**: Line color matches winner symbol (blue for X, pink for O).
- **Drop Shadow**: `drop-shadow(0 0 10px ...)` on winning line for glow effect.

### Session: Simplifying User Identity [2026-05-13]
- **No localStorage**: All `localStorage` persistence removed. Fresh anonymous session every visit.
- **Random Names**: Generated from `ADJECTIVES × ANIMALS` arrays (18×18 = 324 combinations).
- **Stateless Entry**: No name collision logic; backend handles duplicate names organically.

### Session: Implementing Turn Timer [2026-05-13]
- **TurnTimer Component**: Circular SVG countdown with `strokeDasharray`/`strokeDashoffset`.
- **Timer Size**: 42×42px with 3px stroke.
- **Color Logic**: Waiting=Amber, Single=Blue(X)/Pink(O), Multi=Blue(your turn)/Yellow(opponent).
- **Responsive Label**: `Your Turn`/`Opponent`/`Player X`/`Waiting for Player` with AnimatePresence.

### Session: Optimizing Mobile Header [2026-05-13-14]
- **iPhone 12 Pro (390px)**: All header controls fit. Score dots reduced to 1.5×1.5.
- **Breakpoint Strategy**: `text-[8px]` at mobile, `sm:text-[10px]` at 640px, full at `lg`.
- **Input Focus Fix**: Light mode inputs forced to `focus:bg-white` to prevent dark background on focus.

### Session: Deploying Cloud Infrastructure [2026-05-10-13]
- **GitHub Actions**: SSH-based deployment pipeline for Oracle Cloud.
- **Nginx Config**: Reverse proxy for WebSocket (`Upgrade`, `Connection` headers).
- **SSL**: Let's Encrypt certificates for custom domain (WSS support).
- **Docker Port Mapping**: Backend 8888, Frontend 9999.

### Session: Authentication & Security Hardening [2026-05-16]
- **Architecture**: Introduced SQLite persistence with JWT-based stateless auth.
- **SQLite Volume**: Configured `gomoku-db` named volume in `docker-compose.yml` mapped to `/app/data` to ensure data persistence across container restarts.
- **Backend Validation**: `AuthService.validateSignup` enforces strict regex: `min 8 chars`, `1+ letter`, `1+ digit`, `1+ special`.
- **Frontend Validation**: `AuthModal.tsx` mirrors backend rules with real-time UI hints and regex enforcement.
- **Header Visibility Logic**:
  - **Anonymous + Info Screen**: User identity section hidden to keep landing page clean.
  - **Anonymous + In Game**: Static "Hi, [Name]" display to provide feedback without exposing account menus.
  - **Authenticated**: Full interactive identity section with dropdown.
- **Sticky Header**: Added `sticky top-0` and `z-50` to the header. Combined with `flex-1` on the content area to ensure the header stays fixed during overflow scrolling on small screens.
- **Dropdown UX**: Implemented `dropdownRef` with a global `mousedown` listener to close the `UserDropdown` when clicking anywhere outside the identity section.
- **Type-Only Imports**: Switched all type imports to `import type` to satisfy `verbatimModuleSyntax` and resolve build errors.

### Session: AI Feature Plan Protocol [2026-05-16]
- **Protocol**: Mandated the creation of standardized feature plans in `ai-feature-plan/` before any code modification.
- **Template**: Enforced a 10-section template (Objective → Schema → Architecture → UI/UX → Integration → Docker → Constraints → Phases → Summary) for cross-session and cross-model clarity.
- **Naming**: `{NN}-ai-{feature-name}-feature-plan.md`.

## 14. Authentication Variable Mappings
- **JWT Key**: `jwt.secret` in `application.properties`.
- **Auth Headers**: `Authorization: Bearer <token>`.
- **LocalStorage Keys**: `gomoku_token`, `gomoku_user`.
- **Password Regex**: `/[!@#$%^&*(),.?":{}|<>]/.test(password)`.
- **Avatar Limit**: 500KB (Base64 encoded).

## 15. UI Logic Refinements
- **Header Sticky**: `h-16 w-full sticky top-0 bg-[var(--glass-bg)] backdrop-blur-xl z-50`.
- **Click-Outside**: `dropdownRef.current && !dropdownRef.current.contains(event.target)`.
- **Identity Condition**: `(isJoined || isAuthenticated) && ...` wrapping the user section in `Header.tsx`.

### Session: TimeoutWarning Logic Correction [2026-05-14]
- **Bug**: Global `TimeoutWarning` overlay appeared on the pre-game information screen.
- **Root Cause**: The component lacked a `startTime > 0` check, and the initial `turnDuration` of 5s satisfied the `timeLeft <= 15s` condition immediately on mount.
- **Fix**: Added `startTime > 0` to the visibility condition.
- **Cleanup**: Updated default `turnDuration` in `App.tsx` to 60s to align with backend constants and manifest.

### Session: PostgreSQL Migration [2026-05-16]
- **Migration**: Swapped SQLite for PostgreSQL to support production-scale persistence.
- **Infrastructure**: Added `postgres:16-alpine` service to `docker-compose.yml` with healthchecks.
- **Credentials**: Configured dedicated account `admin-gomoku` for the `gomoku_db` database.
- **Connectivity**: Exposed PostgreSQL on external port `5434` as requested.
- **Configuration**: Updated backend `application.properties` with environment-variable-backed PostgreSQL connection string and dialect.

### Session: Match History & Liquibase Migration [2026-05-18]
- **Database Versioning**: Introduced **Liquibase** to manage all database schema evolution. Changed Spring Boot `spring.jpa.hibernate.ddl-auto` from `update` to `validate` to ensure Liquibase is the single source of truth.
- **Match Tracking Redesign**: Modified the `confrontation_records` table to support matches against anonymous users without requiring a new table.
  - Made `user_b_id` nullable.
  - Added a **PostgreSQL partial unique index** (`idx_confrontation_user_a_anon`) where `user_b_id IS NULL` to ensure at most one cumulative anonymous stats row per authenticated user.
  - Removed the JPA `@UniqueConstraint` on the entity to prevent conflicts with the partial index.
- **Logic Mapping**: 
  - **Auth vs Auth**: Recorded head-to-head between two registered users.
  - **Auth vs Anon**: Recorded as cumulative wins/losses for the authenticated user under the `user_b_id = NULL` row.
  - **Anon vs Anon**: Skipped entirely.
- **Win Rate Statistics**: Implemented `GET /api/user/stats` returning `UserStatsDTO` (Total Wins, Total Losses, Total Matches, Win Rate). Win rate is derived by aggregating both H2H rows and the anonymous stats row.
- **Null-Safe JPQL**: Upgraded `ConfrontationRepository` queries to use `LEFT JOIN FETCH` and explicit `IS NULL` checks since implicit inner joins drop anonymous rows.

### Session: UI Overhaul — Routes, Chat Bubble, History & Settings Pages [2026-05-19]
- **Client-Side Routing**: Added `react-router-dom` v7. Three routes: `/` (game), `/history` (match history), `/settings` (profile editor).
- **MatchHistoryPage** (`/history`): Auth-guarded page with 2×2/4-col stats grid (wins, losses, matches, win rate) + confrontation records list with win-rate progress bars.
- **SettingsPage** (`/settings`): Auth-guarded profile editor with avatar upload, success toast, readonly username, logout button.
- **ChatBubble**: Floating 56px circle at `bottom-6 right-6`, `z-[55]`. Expands above bubble to 320px panel. Red notification badge counts messages from others when chat is closed. `isChatOpenRef` in `App.tsx` tracks bubble state to prevent race conditions.
- **GameDrawer Simplified**: Removed tab toggle system and `ChatPanel`. Now shows only Move History with a move-count badge.
- **Authenticated Landing**: `App.tsx` `useEffect` redirects to `/history` when `isAuthenticated && !isJoined`. Anonymous users stay on `InformationScreen`.
- **UserDropdown Navigation**: Replaced `onOpenProfile()` modal + placeholder Settings with `navigate('/history')` and `navigate('/settings')`. Logout now navigates to `/`.
- **Theme Persistence**: `isDarkMode` stored in `localStorage` key `gomoku_theme` across all route navigations.
- **Header**: Removed `onOpenProfile` prop. `UserDropdown` now receives only `isOpen` + `onClose`.
- **ProfileModal Deleted**: Fully replaced by `SettingsPage` + `MatchHistoryPage`.
- **App.tsx State Additions**: `unreadCount` (number), `isChatOpenRef` (Ref\<boolean\>).

### Session: Lobby Dashboards & Unified Page Headers [2026-05-19]
- **Redirect Loop Resolution**: Resolved `App.tsx` redirect loop. Instead of instantly routing authenticated users to `/history` on every landing on `/`, added a `sessionStorage` flag `hasRedirectedAuthLanding` to only redirect them once per tab session.
- **Unified Global Header**: Deprecated custom `<header>` HTML in `MatchHistoryPage.tsx` and `SettingsPage.tsx`. Integrated the interactive global `<Header>` component across all routes by making game-specific props optional.
- **Navigation & Dropdowns**: Added `backPath` and `backLabel` props to `<Header>` to enable back navigation from `/history` and `/settings` cleanly to `/`. Enabled full `<UserDropdown>` interactivity across all routes.
- **AuthInformationScreen**: Built a premium lobby pre-game dashboard specifically for logged-in users on `/`. It displays user avatar, initials, glowing online badge, read-only identity detail link to settings, and self-contained stats widget displaying live Wins, Losses, and Win Rate.

### Session: Chat UX, Notifications & STOMP Room Management [2026-05-19]
- **Chat Unread Tracker**: Reconciled `App.tsx` `isChatOpenRef` with `ChatBubble.tsx` using an explicit `onClose` callback to correctly trace the unread state machine.
- **Native Web Audio API**: Replaced silent notifications with a native `AudioContext` 450Hz-350Hz sine wave "bubble pop" / "wood tap" for new chat messages.
- **Message Wrapping**: Forced `break-words` on all chat message elements to gracefully contain long consecutive character strings without overflowing the layout.
- **Chat Preview Toast**: Added an animated, auto-dismissing (4s) popup next to the closed chat bubble to preview new incoming STOMP chat messages.
- **STOMP Clean Exit**: Added `/game.leave` STOMP endpoint in `GameController.java`. The `leaveGame()` hook now fires this message to formally remove the player from `activeSessions` while keeping the socket open, enabling real-time `ROOM_STATUS` occupancy updates in the pre-game lobby.

### Session: Database Eager Loading & Room State Reset [2026-05-19]
- **Hibernate LazyInitializationException Fix**: Resolved `org.hibernate.LazyInitializationException` by adding an explicit JPQL `JOIN FETCH e.user` in `UserEquippedEffectRepository.findByUser_UsernameIn()` since WebSocket threads operate outside of active Spring JPA transaction sessions.
- **Stale Room State Cleansing**: Added comprehensive state-clearing actions to `leaveGame()` in `App.tsx` resetting `isRoomFull`, `roomFullReason`, `serverGameMode`, `playerCount`, and `mySymbol` so exiting players cleanly land on a fully functional landing page screen and can rejoin or start a new game instantly.

### Session: Multi-Tab Session Handshakes & Username-Bound Cosmetics [2026-05-19]
- **Multi-Tab Multi-Session Handshake**: Replaced `activeSessions` with `sessionToUser` ConcurrentHashMap to allow mapping a WebSocket `sessionId -> username`. This prevents anonymous/authenticated players from sharing states across tabs/browsers. When a player opens multiple tabs, they each get distinct session-to-username mappings. Only when all sessions for a username are closed does the player get removed from the active `players` list in the `GameRoom`.
- **Decoupled Symbols from Entrance Order**: Standardized symbol assignment so that symbols are assigned based on the active player who places the first move (gets "X") and second move (gets "O"), rather than entrance order. The symbol assignment is stored inside `playerSymbols` (username -> symbol) instead of hardcoding to players' linked set index.
- **Username-Bound Visual Effects**: Fully transitioned `symbolEffects` in the frontend from symbol-based mapping (`'X'`/`'O'`) to username-based mapping. The backend sends a room-level username-to-effect map `message.symbolEffects` compiled dynamically using eager JPA database fetches (`JOIN FETCH e.user`) of equipped user cosmetics. The frontend resolves rendering cosmetics by querying the `history` of placed moves: `move.player ? symbolEffects[move.player] : undefined`.
- **Winning Line Effects by Winner Username**: Upgraded the winning line strike-through animation so that it dynamically loads the winning player's cosmetic effect key using `symbolEffects[winner]` instead of `symbolEffects[winningSymbol]`.
- **Clean Lobby & Score Refresh**: Propagated live scores `message.scores` into standard lobby updates (`ROOM_STATUS` / `JOIN`), so scores and player cards update in real-time. Added proper turn constraints (`isMyTurn`) on `makeMove` on the client side.

### Session: Win Milestones Upgrade & Real-Time Cosmetic Sync [2026-05-20]
- **Dynamic SymbolEffect Enum**: Replaced the hardcoded integer-based win count checks for unlocking effects with a dynamic `SymbolEffect` enum (`FIRE_PHOENIX` at 20 wins, `DRAGON_LIGHTNING` at 30 wins, `CHERRY_BLOSSOM` at 50 wins, and `DARK_SLASH` at 100 wins). The service streams and filters achievements against this enum to dynamically compute unlocked statuses and render descriptions.
- **WebSocket Cosmetic Syncing**: Ensured player equipped effects are loaded eagerly (`findByUser_UsernameIn`) in the backend and broadcasted during every `JOIN`, `MOVE`, and `START` room event. The client-side state is updated on every Stomp payload, ensuring opponent visual cell-placements and winning strike-through lines reflect cosmetic upgrades in real-time.
- **Milestones Database Seeding**: Updated `WIN_MILESTONES` array in `AchievementService.java` to explicitly track the `30` win achievement, and updated the admin database initialization in `seed.sql` to include `'WINS_30'` in the conflict-safe set.
- **Avatar Storage & Uploads**: Verified that user profile avatars are uploaded as base64 encoded strings (constrained to 500KB) and persisted directly as `TEXT` within the PostgreSQL `users` table via `UserService.java`.

### Session: Timer Bug Fixes, Connection Keep-Alive & STOMP Heartbeats [2026-05-23]
- **Stale Closure Bug Fix**: Resolved a critical bug where `App.tsx` STOMP `onMessage` callback captured `username`, `mySymbol`, and `gameMode` from initial render values (always `''`, `null`, default). Introduced `usernameRef`, `mySymbolRef`, and `gameModeRef` synced via `useEffect` so the STOMP handler reads current values from refs instead of stale closure variables.
- **Orange Timer State Fix**: Direct consequence of the stale closure fix. `TurnTimer` correctly shows orange (`#f59e0b`) when `isMyTurn === false` now that `mySymbol` is accurately set on the first MOVE. Also reset `progress` to `1` when `startTime === 0` to prevent a stale progress arc from a previous round.
- **STOMP Heartbeats (Keep-Alive)**: Added bidirectional 10s heartbeats in `WebSocketConfig.java` via `setHeartbeatValue(new long[]{10000, 10000})`. Configured `setSendTimeLimit(20s)` and `setSendBufferSizeLimit(512KB)`. Frontend enables `client.heartbeat.outgoing = client.heartbeat.incoming = 10000`.
- **Auto-Reconnect on Disconnect**: Moved `SockJS` + `Stomp.over` creation **inside** `connectToBackend()` so reconnection creates a fresh socket. Added reconnect-on-any-disconnect with 3s delay.
- **Timer Pause on Player Disconnect**: Added `pausedAt` field to `GameRoom`. On disconnect, `stopTurnTimer` sets `pausedAt = System.currentTimeMillis()`. On reconnect when `canPlay == true`, backend calculates paused duration, shifts `turnStartTime` forward, and resumes `startTurnTimer` with accurately calculated remaining time. Frontend freezes timer via `isGameOver` prop when `playerCount < 2`.
- **First-Move Timer Grace**: Backend `handleMove` checks `nextPlayerHasMoved` (whether the next player has already made at least one move) before calling `startTurnTimer`. If it's a player's opening move, `turnStartTime(0)` is explicitly set and no scheduled timeout fires — giving unlimited time for the opening move.

### Session: Cosmetic Effects Expansion & Visual Polish [2026-05-23/24]
- **Heart Flutter Yellow Unification**: Changed the Heart Flutter effect to render yellow (`#eab308` / `#facc15`) for **both** X and O symbols instead of green/yellow split. Updated both `HeartFlutterEffect.tsx` (cell effect) and `MainGame.tsx` (winning line).
- **Dragon Lightning Enhancement**: Overhauled `DragonLightningEffect.tsx` with aggressive SVG lightning bolt arc paths, radial gradient aura using `mix-blend-screen`, and per-arc staggered animations with glowing drop-shadows. Added `animate-arc-1` through `animate-arc-4` and `animate-lightning-aura`/`animate-lightning-flash` CSS keyframes.
- **Nature Leaf Teal/Crimson Overhaul**: Replaced the emerald-green/amber palette (which overlapped with Heart Flutter's yellow) with a completely differentiated high-contrast dual palette — **Cool Teal** (`#0d9488`) for X and **Autumn Crimson** (`#be123c`) for O. Increased leaf particle count from 5 to 7, enlarged leaf sizes (up to 16px), and added individual glowing drop-shadows to leaf particles.
- **New Effect: Ocean Splash (80 Wins)**: Water-themed effect with pulsating `water-ripple` blurred background aura and floating organic teardrop-shaped water droplet particles (`border-radius: 50% 50% 50% 50% / 15% 15% 85% 85%`). X uses Deep Sapphire/Indigo (`#4f46e5`), O uses Bright Cyan/Turquoise (`#22d3ee`).
- **New Effect: Cosmic Nebula (90 Wins)**: Space-themed effect with rotating `nebula-pulse` hue-shifting aura and 4-pointed SVG vector star particles that twinkle with scale/rotate animations. X uses Deep Fuchsia (`#d946ef`), O uses Radiant Gold (`#eab308`).
- **New Effect: Aurora Borealis (110 Wins)**: Northern lights effect with `aurora-shift` hue-rotating gradient aura (`bg-gradient-to-tr`) and circular shimmer stardust particles. X uses Emerald/Cyan (`#10b981` + `#6ee7b7`), O uses Violet/Pink (`#d946ef` + `#f472b6`).
- **Backend Enum Expansion**: `SymbolEffect.java` now contains 10 effects: `FIRE_PHOENIX(20)`, `DRAGON_LIGHTNING(30)`, `HEART_FLUTTER(40)`, `CHERRY_BLOSSOM(50)`, `NATURE_LEAF(60)`, `VIBRANT_FIRE(70)`, `OCEAN_SPLASH(80)`, `COSMIC_NEBULA(90)`, `DARK_SLASH(100)`, `AURORA_BOREALIS(110)`.
- **WIN_MILESTONES**: Extended to `{10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 150, 200, 250, 300, 400, 500, 750, 1000}`.
- **seed.sql**: Admin seeding now includes `WINS_40` through `WINS_110`.
- **Dynamic Effects Count**: `AchievementPanel.tsx` total effects count changed from hardcoded `4` to `data.effects.length`.
- **Effect Component Architecture**: Each effect is a standalone `{EffectName}Effect.tsx` React component in `frontend/src/components/effects/`. All effects lazy-loaded via `React.lazy()` in `SymbolRenderer.tsx`. CSS animations defined in `effects.css` with namespaced keyframes.
- **Winning Line Architecture**: Each effect has a dedicated `case` block in `MainGame.tsx` rendering 3-layer SVG `<motion.line>` elements: blurred glow layer → core colored stroke → animated detail (dashes/dots).

## 16. SymbolEffect Enum Reference (Source of Truth)

| Enum Key | Achievement Key | Wins Required | Label |
|:---|:---|:---|:---|
| `FIRE_PHOENIX` | `WINS_20` | 20 | Requires 20 Wins |
| `DRAGON_LIGHTNING` | `WINS_30` | 30 | Requires 30 Wins |
| `HEART_FLUTTER` | `WINS_40` | 40 | Requires 40 Wins |
| `CHERRY_BLOSSOM` | `WINS_50` | 50 | Requires 50 Wins |
| `NATURE_LEAF` | `WINS_60` | 60 | Requires 60 Wins |
| `VIBRANT_FIRE` | `WINS_70` | 70 | Requires 70 Wins |
| `OCEAN_SPLASH` | `WINS_80` | 80 | Requires 80 Wins |
| `COSMIC_NEBULA` | `WINS_90` | 90 | Requires 90 Wins |
| `DARK_SLASH` | `WINS_100` | 100 | Requires 100 Wins |
| `AURORA_BOREALIS` | `WINS_110` | 110 | Requires 110 Wins |

## 17. Cosmetic Effect Color Palette Reference

| Effect | X Symbol Color | O Symbol Color | Particle Type |
|:---|:---|:---|:---|
| Fire Phoenix | Orange/Red | Orange/Red | Rising ember particles |
| Dragon Lightning | Cyan `#22d3ee` | Purple `#c084fc` | SVG lightning bolt arcs |
| Heart Flutter | Yellow `#eab308` | Yellow `#eab308` | Flying heart clip-path shapes |
| Cherry Blossom | Rose-300 `#fda4af` | Red-500 `#ef4444` | CSS petal shapes |
| Nature Leaf | Teal `#0d9488` | Crimson `#be123c` | Leaf shapes with glow (7 particles) |
| Vibrant Fire | Fire core + yellow dash | Fire core + white flame | Rotating sunshine + fire flicker |
| Ocean Splash | Indigo `#4f46e5` | Cyan `#0891b2` | Teardrop water droplets |
| Cosmic Nebula | Fuchsia `#d946ef` | Gold `#eab308` | 4-pointed SVG twinkling stars |
| Dark Slash | Indigo `#4f46e5` | Red `#dc2626` | Sharp line slash |
| Aurora Borealis | Emerald `#10b981` | Fuchsia `#d946ef` | Shimmer stardust + aurora shift |

## 18. Effect Component File Inventory

| Component File | CSS Keyframes | Animation Classes |
|:---|:---|:---|
| `FirePhoenixEffect.tsx` | `flicker`, `ember-rise` | `animate-flicker`, `animate-ember-{1-3}` |
| `DragonLightningEffect.tsx` | `lightning-aura`, `lightning-flash`, `arc-{1-4}` | `animate-lightning-aura`, `animate-lightning-flash`, `animate-arc-{1-4}` |
| `HeartFlutterEffect.tsx` | `heart-float-{1-5}`, `heart-aura-pulse` | `animate-heart-float-{1-5}`, `animate-heart-aura` |
| `CherryBlossomEffect.tsx` | `petal-{1-5}`, `bloom-pulse` | `animate-petal-{1-5}`, `animate-bloom-pulse` |
| `NatureLeafEffect.tsx` | `leaf-drift-{1-5}`, `nature-breathe` | `animate-leaf-drift-{1-5}`, `animate-nature-breathe` |
| `VibrantFireEffect.tsx` | `sunshine-spin`, `sunshine-pulse`, `fire-flicker`, `fire-dance`, `fire-vibrant-glow` | `animate-sunshine-{spin,pulse}`, `animate-fire-{flicker,dance,vibrant-glow}` |
| `OceanSplashEffect.tsx` | `water-ripple`, `droplet-float-{1-5}` | `animate-water-ripple`, `animate-droplet-{1-5}` |
| `CosmicNebulaEffect.tsx` | `nebula-pulse`, `star-twinkle-{1-5}` | `animate-nebula-pulse`, `animate-star-twinkle-{1-5}` |
| `DarkSlashEffect.tsx` | (inline Framer Motion) | (inline) |
| `AuroraBorealisEffect.tsx` | `aurora-shift`, `shimmer-dust` | `animate-aurora-shift`, `animate-shimmer-{1-5}` |

## 19. WebSocket Keep-Alive Configuration

| Parameter | Backend (`WebSocketConfig.java`) | Frontend (`App.tsx`) |
|:---|:---|:---|
| Heartbeat Outgoing | 10,000ms | 10,000ms |
| Heartbeat Incoming | 10,000ms | 10,000ms |
| Send Time Limit | 20,000ms | — |
| Send Buffer Size | 512KB | — |
| Reconnect Delay | — | 3,000ms |
| Fresh Socket on Reconnect | — | ✅ (`SockJS` + `Stomp.over` created inside `connectToBackend()`) |

## 20. Achievement Milestones Reference

| Category | Milestones Array |
|:---|:---|
| `WIN_RATE_THRESHOLDS` | `{50, 55, 60, 65, 75, 80, 85, 90, 95}` |
| `MATCH_MILESTONES` | `{10, 20, 50, 100, 150, 200, 250, 300, 400, 500, 750, 1000}` |
| `WIN_MILESTONES` | `{10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 150, 200, 250, 300, 400, 500, 750, 1000}` |

### seed.sql Admin Seeding Keys
```
WIN_RATE: 50, 55, 60, 65, 75, 80, 85, 90, 95
MATCHES:  10, 20, 50, 100, 150, 200, 250, 300, 400, 500, 750, 1000
WINS:     10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 150, 200, 250, 300, 400, 500, 750, 1000
```

## 21. Effect Registration Checklist

> **MANDATORY**: When adding a new cosmetic effect, ALL 8 steps must be completed:

| # | File | Action |
|:---|:---|:---|
| 1 | `backend/.../model/SymbolEffect.java` | Add enum constant with `WINS_N` key, required wins, and label |
| 2 | `backend/.../service/AchievementService.java` | Add `N` to `WIN_MILESTONES` array |
| 3 | `seed.sql` | Add `'WINS_N'` to admin seeding `v_keys` array |
| 4 | `frontend/src/types.ts` | Add key string to `EffectType` union type |
| 5 | `frontend/src/components/effects/effects.css` | Add `@keyframes` and `.animate-*` utility classes |
| 6 | `frontend/src/components/effects/{Name}Effect.tsx` | Create React component with `symbol` prop |
| 7 | `frontend/src/components/achievements/SymbolRenderer.tsx` | Add `React.lazy()` import + `case` in switch |
| 8 | `frontend/src/components/MainGame.tsx` | Add winning line `case` block (3-layer SVG motion.line) |


