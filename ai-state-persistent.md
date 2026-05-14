
# Schema & Logic Manifest [2026-05-14]

## 1. WebSocket Schema (GameMessage.java)
| Field | Type | Description |
| :--- | :--- | :--- |
| `type` | Enum | `CHAT`, `JOIN`, `MOVE`, `LEAVE`, `START`, `WIN`, `ROOM_STATUS`, `ERROR`, `TIMEOUT` |
| `mode` | Enum | `SINGLE`, `MULTIPLE` |
| `sender` | String | Username of the message originator |
| `history` | List<Move> | Chronological list of moves in the room |
| `scores` | Map<String, Int> | Keyed by Username (Multiple) or "Player X/O" (Single) |
| `turnStartTime`| long | Backend timestamp (ms) of current turn start |
| `turnDuration` | int | Authorized turn length in seconds (Current: 60) |
| `playerSymbol` | String | Assigned 'X' or 'O' for the specific session |

## 2. Core Logic & Protocol
### A. Join & Initialization Flow
1. **Client**: Sends `JOIN` with `gameId`, `sender` (random name), and requested `mode`.
2. **Backend**:
   - Sets `GameRoom.mode`.
   - `addSession`: Registers sessionId; **Initializes scores to 0** if missing to ensure name appears in UI.
   - For `SINGLE` mode, ensures "Player X" and "Player O" keys exist in `scores`.
3. **Broadcast**: Sends `JOIN` response (full state) to all subscribers of `/topic/game/{room}`.

### B. Turn & Time Management
- **Authority**: Backend `ScheduledExecutorService` manages the 60s timeout.
- **Sync**: Backend sends `turnStartTime` on every state change. Frontend uses `(Date.now() - turnStartTime) / 1000` for the local countdown.
- **Symbol Switch**: Explicit `turnSymbol` derived from `history.length % 2 === 0 ? 'X' : 'O'`.

### C. Win & Score Logic
- **Winning Line**: 5-in-a-row (horizontal, vertical, diagonal). Line coordinates sent in `winningLine`.
- **Timeout Win**: If `currentTime > turnStartTime + duration`, the *other* player is awarded a win.
- **Single Mode Stats**: Any win (X or O) increments local `stats.wins`.

## 3. Architectural Constraints
- **Responsiveness**: 
  - Names use initials (`getInitials`) below 1024px.
  - "Player X" abbreviated to "X" below 1024px in Single Mode.
- **Deduplication**: Frontend `App.tsx` checks `history` for existing row/col before processing `MOVE` messages to prevent UI flickering.
- **Theme**: `.dark` class applied to `document.documentElement`. Light mode focus state forced to `bg-white` for accessibility.


