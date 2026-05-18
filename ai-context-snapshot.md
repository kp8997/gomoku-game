# Session Snapshot: Chat UX, Notifications & STOMP Room Management [2026-05-19]

## 1. Architectural Decisions & Changes
- **Chat Unread Tracker Fix**: Addressed a bug where `unreadCount` failed to increment after the chat was closed. Implemented an `onClose` callback in `ChatBubble.tsx` that cascades up to `App.tsx`, successfully resetting `isChatOpenRef.current = false`.
- **Web Audio Notification**: Built a `playNotificationSound()` function using the native Web Audio API (no external assets). Generates a clean 450Hz->350Hz descending sine wave (like a soft wooden tap/bubble pop) with an organic amplitude envelope to alert users of incoming messages cleanly and comfortably.
- **Message Overflow Resolution**: Prevented chat containers from breaking layout bounds when dealing with non-breaking gibberish/typos by applying the Tailwind `break-words` class to both the main chat bubble and the newly introduced chat preview popup.
- **Chat Preview Toast**: Added a glassmorphic preview popup near the chat bubble icon. It displays the latest incoming message when the chat is closed for 4 seconds, replacing existing previews dynamically if new messages arrive rapidly.
- **STOMP Room Disconnect Rework**: Redesigned the "Exit" button logic. Instead of just resetting React state, `App.tsx` now explicitly sends a STOMP `/app/game.leave` message. Added a new `@MessageMapping("/game.leave")` backend endpoint in `GameController.java` that removes the player from the room's `activeSessions`, accurately syncing player counts to lobby observers without severing their STOMP WebSocket connection.

## 2. Established Constraints
- **Docker Rebuild Rule**: Frontend and backend container rebuilds (`docker compose up --build -d <service>`) are mandatory after any source code change to ensure logic accurately applies to the containerized environment.
- **No External Audio Assets**: UI Sounds must use `window.AudioContext` to keep the application lightweight and standalone.

## 3. Variable Mappings & Core Logic
- **`isChatOpenRef`**: A `useRef<boolean>` in `App.tsx` that is rigorously synced with `ChatBubble`'s `isOpen` state to accurately calculate `unreadCount` increments exclusively for closed-state background messages.
- **`previewMessage` & `previewTimeoutRef`**: States within `ChatBubble.tsx` managing the lifespan (4000ms) of the incoming message preview toast.

## 4. Next Step Logic
- **Online Matchmaking & Room Listing**: Expand STOMP capabilities to broadcast a list of all active non-full rooms to the Informative Screen to allow global matchmaking and easy lobby browsing.
- **Typing Indicators**: Introduce `/app/game.typing` STOMP events to render typing indicator dots inside the `ChatBubble` preview toast.
