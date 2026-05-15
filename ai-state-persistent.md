
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

| ID | Feature | Status | File |
|:---|:---|:---|:---|
| 01 | Authentication, Profile & Confrontation Records | ✅ Implemented | `ai-feature-plan/01-ai-auth-feature-plan.md` |
| 02 | PostgreSQL Migration | ✅ Implemented | `ai-feature-plan/02-ai-postgresql-migration-feature-plan.md` |


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
├── WebSocketConfig.java        # STOMP broker config (/topic, /app)
├── GameMessage.java            # Message schema + inner classes (Move, ChatMessage, enums)
├── GameController.java         # Game logic, room management, timer, win detection, confrontation recording
├── model/
│   ├── User.java               # JPA entity (manual builder, no Lombok)
│   └── ConfrontationRecord.java # JPA entity (canonical pair)
├── repository/
│   ├── UserRepository.java
│   └── ConfrontationRepository.java
├── dto/
│   ├── SignupRequest.java
│   ├── LoginRequest.java
│   ├── AuthResponse.java
│   ├── ProfileUpdateRequest.java
│   ├── UserProfileResponse.java
│   └── ConfrontationDTO.java
├── service/
│   ├── AuthService.java        # Signup validation, login, token gen
│   ├── UserService.java        # Profile CRUD
│   └── ConfrontationService.java # H2H record/query
├── security/
│   ├── SecurityConfig.java     # HTTP security filter chain
│   ├── JwtTokenProvider.java   # JWT creation & validation
│   └── JwtAuthenticationFilter.java # OncePerRequestFilter
└── controller/
    ├── AuthController.java     # POST /api/auth/signup, /api/auth/login
    └── UserController.java     # GET/PUT /api/user/profile

frontend/src/
├── App.tsx                     # Root: state management, WebSocket, routing, auth integration
├── index.css                   # Design system: tokens, dark mode, glassmorphism
├── main.tsx                    # Entry point, wrapped in AuthProvider
├── types.ts                    # TypeScript interfaces (Move, ChatMessage, GameMessage, auth types)
├── api/
│   └── authApi.ts              # fetch wrappers for auth & profile endpoints
├── context/
│   └── AuthContext.tsx          # React Context for auth state (user, token, login/logout)
└── components/
    ├── Header.tsx              # Scores, timer, drawer toggle, theme, exit, auth identity (sticky)
    ├── InformationScreen.tsx   # Pre-game: name, mode select, join/copy, login prompt
    ├── MainGame.tsx            # Board grid, winning line SVG, winner popup
    ├── GameDrawer.tsx          # Side panel: tabs for History & Chat
    ├── ChatPanel.tsx           # Real-time chat with inline/standalone modes
    ├── HistorySection.tsx      # Move history list
    ├── TurnTimer.tsx           # Circular SVG countdown timer
    ├── TimeoutWarning.tsx      # Global timeout warning overlay
    ├── AuthModal.tsx           # Login/Signup modal (tabbed, glassmorphism)
    ├── UserDropdown.tsx        # User menu dropdown (auth-only, click-outside)
    └── ProfileModal.tsx        # Profile editor + confrontation records
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
1. **Client**: Sends `JOIN` with `gameId`, `sender` (random name), and requested `mode`.
2. **Backend**:
   - Sets `GameRoom.mode` **before** `addSession` to prevent "Player X/O" name leak into Multiplayer.
   - `addSession`: Registers sessionId; **Initializes scores to 0** if missing → names appear in UI immediately.
   - For `SINGLE` mode: ensures `"Player X"` and `"Player O"` keys exist in `scores`.
   - For `MULTIPLE` mode: score key = actual username.
3. **Broadcast**: Sends `JOIN` response (full state) to all subscribers of `/topic/game/{room}`.
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
| `activeSessions` | `HashSet<String>` | WebSocket session IDs |
| `scores` | `HashMap<String, Integer>` | Persists across rounds, cleared when room empties |
| `lastPlayer` | `String` | For consecutive-move prevention |
| `mode` | `GameMode` | Set on first JOIN |
| `turnStartTime` | `long` | 0 at start/reset |

### Key Methods
- `getPlayerSymbol(username)`: Index 0→"X", Index 1→"O", else null.
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
