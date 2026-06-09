# Feature Plan #09 — Voice Chat (WebRTC)

> **Plan ID**: `09`  
> **Status**: 🔲 Not Started  
> **Created**: 2026-06-09  
> **Last Updated**: 2026-06-09  
> **Scope**: Real-time voice communication between two players in a game room  
> **Stack**: WebRTC (browser-native), STOMP/WebSocket (signaling), React (frontend controls)

---

## 1. Objective

Add real-time voice communication between two players sharing a game room. Two candidate architectures are evaluated below—**Option A (Auto-Connect)** and **Option B (Explicit Call)**—to determine which best fits the Gomoku game's UX, performance profile, and technical constraints.

### What is preserved (backward compatibility)
- Existing STOMP WebSocket infrastructure for game state and chat remains untouched.
- No database schema changes required (voice is purely ephemeral/real-time).
- Chat bubble functionality is unaffected.
- All existing UI/UX patterns (glassmorphism, design tokens, Framer Motion) are reused.

---

## 2. Technology: WebRTC (Both Options)

Both options use the same underlying technology: **WebRTC peer-to-peer audio**.

| Concern | Detail |
|:---|:---|
| **Protocol** | WebRTC `RTCPeerConnection` with audio-only `MediaStream` |
| **Signaling** | Reuse existing STOMP WebSocket (`/topic/game/{room}`) for SDP offer/answer/ICE exchange |
| **TURN/STUN** | Google public STUN (`stun:stun.l.google.com:19302`). Optional self-hosted TURN for NAT traversal |
| **Codec** | Opus (WebRTC default) — ~32kbps for voice |
| **No new server** | Peer-to-peer audio; backend only relays signaling messages, no media server needed |

---

## 3. Option A — Auto-Connect on Room Join

### How it works
1. When **both players** have joined the room (`playerCount === 2`), the WebRTC signaling handshake fires **automatically**.
2. The browser prompts for microphone permission immediately.
3. Once connected, a **mic toggle button** appears at the bottom of the screen (next to the chat bubble).
4. Audio streams are always established; the mic toggle mutes/unmutes the local `MediaStreamTrack`.

### UI Layout
```
┌──────────────────────────────────────────┐
│  Game Board                              │
│                                          │
│                                          │
│                                          │
│                                          │
└──────────────────────────────────────────┘
          [🎤 Mic]  [💬 Chat]    ← bottom-right, side by side
```

- **Mic Button**: 56×56px rounded-full, same style as ChatBubble (`bg-blue-600`, `shadow-xl shadow-blue-500/30`).
  - Default state: Mic ON (unmuted) — solid blue with `Mic` icon.
  - Toggled OFF: `bg-red-500` with `MicOff` icon + strike-through animation.
- Positioned `right-[5rem]` (left of chat bubble), or stacked with `gap-3`.

### Signaling Flow (STOMP messages)
```
Player A joins → waits
Player B joins → playerCount === 2
  → Player A creates RTCPeerConnection
  → Player A calls getUserMedia({ audio: true })
  → Player A creates SDP offer → sends via STOMP type: "VOICE_OFFER"
  → Player B receives offer → creates answer → sends "VOICE_ANSWER"
  → ICE candidates exchanged via "VOICE_ICE"
  → P2P audio connection established
```

### Performance Benchmark

| Metric | Value | Impact |
|:---|:---|:---|
| **CPU (idle, connected)** | ~1-3% per peer | Negligible on modern devices |
| **CPU (active audio)** | ~3-5% per peer | Low; Opus codec is lightweight |
| **Bandwidth** | ~32kbps bidirectional (Opus) | Negligible vs. game STOMP traffic (~1-5kbps) |
| **RAM** | ~5-15MB for WebRTC stack | Minimal additional footprint |
| **Latency** | 50-150ms (P2P, same region) | Imperceptible for voice |
| **Connection setup** | 1-3 seconds (ICE + DTLS) | Happens once at room join |
| **Page load impact** | +~200ms (getUserMedia prompt) | Browser permission dialog blocks briefly |
| **Battery (mobile)** | Moderate continuous drain | Audio encoding runs constantly even when muted at track level |

### Pros
| # | Advantage |
|:---|:---|
| 1 | **Zero-friction UX** — voice "just works" when both players are present |
| 2 | **Simple mental model** — no call/accept ceremony; like entering a Discord voice channel |
| 3 | **Less frontend state** — no call modal, no ringing state machine, no timeout logic |
| 4 | **Faster implementation** — fewer components, fewer STOMP message types |

### Cons
| # | Disadvantage |
|:---|:---|
| 1 | **Forced mic permission prompt** — every room join triggers browser dialog, even if user doesn't want voice. This is **disruptive** and can feel invasive |
| 2 | **Privacy concern** — users may not expect audio streaming upon joining a board game |
| 3 | **Performance on low-end devices** — WebRTC audio encoding runs continuously even when muted (mute only silences the track, the encoder still processes silence frames) |
| 4 | **No consent from the other party** — Player B has no choice; their mic permission is also requested immediately |
| 5 | **Mobile battery drain** — continuous audio pipeline eats battery even when neither player is talking |
| 6 | **Noise/awkwardness** — accidental background noise from unmuted mics is a poor default |
| 7 | **Anonymous users** — forcing voice on anonymous casual players is a UX mismatch |

---

## 4. Option B — Explicit Call Button with Accept/Decline (Recommended ✅)

### How it works
1. A **call button** (🎙️ `Phone` icon) appears next to the chat bubble when `playerCount === 2`.
2. When Player A clicks the call button:
   - Player A sees a "Calling..." state with a cancel option.
   - Player B sees an **incoming call popup** (toast/modal) with **Accept** and **Decline** buttons.
3. If Player B **accepts**:
   - Both browsers request mic permission.
   - WebRTC handshake completes.
   - The call button transforms into a **control bar**: `[🎤 Mic Toggle]` + `[📞 Hang Up]`.
4. If Player B **declines**: Player A sees "Call declined" feedback. No WebRTC connection.
5. Either player can **hang up** at any time, cleanly tearing down the peer connection.

### UI Layout

**Before call:**
```
          [📞 Call]  [💬 Chat]    ← bottom-right, side by side
```

**Incoming call popup (Player B):**
```
  ┌─────────────────────────────────────────┐
  │  📞  "SwiftDragon" is calling...        │
  │                                         │
  │     [✅ Accept]     [❌ Decline]         │
  └─────────────────────────────────────────┘
          ↑ glassmorphism card, animated entry
```

**During call (both players):**
```
          [🎤 Mic]  [📞↓ Hang Up]  [💬 Chat]    ← bottom-right
```

### Button Styling (Consistent with ChatBubble)

| Button | Size | Default BG | Hover BG | Shadow | Icon |
|:---|:---|:---|:---|:---|:---|
| **Call** | 56×56 `rounded-full` | `bg-green-600` | `bg-green-500` | `shadow-xl shadow-green-500/30` | `Phone` (lucide) |
| **Mic On** | 48×48 `rounded-full` | `bg-blue-600` | `bg-blue-500` | `shadow-lg shadow-blue-500/30` | `Mic` (lucide) |
| **Mic Off** | 48×48 `rounded-full` | `bg-red-500` | `bg-red-400` | `shadow-lg shadow-red-500/30` | `MicOff` (lucide) |
| **Hang Up** | 48×48 `rounded-full` | `bg-red-600` | `bg-red-500` | `shadow-lg shadow-red-500/30` | `PhoneOff` (lucide) |
| **Chat** | 56×56 `rounded-full` | `bg-blue-600` | `bg-blue-500` | `shadow-xl shadow-blue-500/30` | `MessageSquare` |

All buttons use `whileHover={{ scale: 1.08 }}` and `whileTap={{ scale: 0.94 }}` Framer Motion springs, identical to the ChatBubble.

### Incoming Call Popup Styling
- `glass-card` with `backdrop-blur-2xl`, `border border-glass-border`.
- Animated via `AnimatePresence` + `motion.div` with spring entry (`scale: 0.9 → 1`, `opacity: 0 → 1`).
- Pulsing green ring animation around the caller avatar/icon.
- Auto-dismiss after **30 seconds** (treated as decline).

### Signaling Flow (STOMP messages)

| Type | Direction | Payload |
|:---|:---|:---|
| `VOICE_CALL_REQUEST` | Caller → Room | `{ sender, gameId }` |
| `VOICE_CALL_RESPONSE` | Callee → Room | `{ sender, gameId, accepted: boolean }` |
| `VOICE_OFFER` | Caller → Room | `{ sender, sdp }` |
| `VOICE_ANSWER` | Callee → Room | `{ sender, sdp }` |
| `VOICE_ICE` | Both → Room | `{ sender, candidate }` |
| `VOICE_HANG_UP` | Either → Room | `{ sender, gameId }` |

### Call State Machine

```
IDLE ──[click call]──► CALLING ──[accepted]──► CONNECTING ──[ICE done]──► IN_CALL
  ▲                      │                                                   │
  │                [declined/timeout]                                  [hang up]
  │                      │                                                   │
  └──────────────────────┘◄──────────────────────────────────────────────────┘
```

### Performance Benchmark

| Metric | Value | Impact |
|:---|:---|:---|
| **CPU (idle, no call)** | 0% | **Zero overhead** when voice not in use |
| **CPU (in call, active)** | ~3-5% per peer | Same as Option A during active call |
| **Bandwidth (no call)** | 0 bps | **Zero** until call accepted |
| **Bandwidth (in call)** | ~32kbps bidirectional | Same as Option A |
| **RAM (no call)** | 0 MB extra | No WebRTC objects allocated |
| **RAM (in call)** | ~5-15MB | Same as Option A |
| **Page load impact** | 0ms | **No mic prompt on load** |
| **Battery (no call)** | No impact | Audio pipeline not started |
| **Battery (in call)** | Same as Option A | Encoder active only during call |
| **Connection setup** | 1-3s after accept | Same, but user-initiated |

### Pros
| # | Advantage |
|:---|:---|
| 1 | **Consent-first UX** — neither player is forced into voice; fully opt-in |
| 2 | **Zero performance cost when unused** — no WebRTC objects, no mic access, no CPU/battery drain until a call is explicitly started |
| 3 | **Privacy-respecting** — mic permission only requested when user actively chooses to call/accept |
| 4 | **Clean hang-up flow** — either player can end the call; resources are fully freed |
| 5 | **Mobile-friendly** — no unnecessary battery drain for players who only want to play the game |
| 6 | **Familiar mental model** — mirrors phone/Discord/FaceTime call UX that all users understand |
| 7 | **Graceful degradation** — if one player declines or has no mic, the game works perfectly fine |
| 8 | **Anonymous-safe** — casual anonymous players aren't confronted with unexpected voice requests |

### Cons
| # | Disadvantage |
|:---|:---|
| 1 | **More frontend complexity** — call state machine, incoming call modal, timeout logic |
| 2 | **Extra STOMP message types** — `VOICE_CALL_REQUEST`, `VOICE_CALL_RESPONSE`, `VOICE_HANG_UP` |
| 3 | **Slight friction** — requires 2 clicks (call + accept) before voice starts |
| 4 | **Potential for ignored calls** — if Player B is focused on the game, they might miss the popup |

---

## 5. Head-to-Head Comparison

| Dimension | Option A (Auto-Connect) | Option B (Explicit Call) ✅ |
|:---|:---|:---|
| **UX Friction** | None (auto) | Low (2 clicks) |
| **User Consent** | ❌ No choice | ✅ Full consent |
| **Privacy** | ❌ Mic prompted on join | ✅ Mic only on call |
| **Performance (idle)** | ⚠️ Always-on WebRTC overhead | ✅ Zero overhead |
| **Performance (active)** | Same | Same |
| **Battery Impact** | ⚠️ Constant drain | ✅ Only during calls |
| **Page Load** | ⚠️ +200ms (mic prompt) | ✅ No impact |
| **Implementation Effort** | ~2-3 days | ~3-5 days |
| **Maintenance** | Lower | Moderate |
| **Mobile UX** | ⚠️ Poor (forced mic) | ✅ Good (opt-in) |
| **Anonymous Users** | ❌ Intrusive | ✅ Non-intrusive |
| **Industry Standard** | Discord-style (voice channels) | Phone/FaceTime-style |
| **Failure Recovery** | Complex (auto-retry?) | Simple (just call again) |

---

## 6. Recommendation: Option B (Explicit Call) ✅

**Option B is strongly recommended** for the following reasons:

1. **Performance**: Zero overhead when voice is not in use. This is critical because most game sessions may not use voice at all. Option A incurs CPU, bandwidth, and battery costs from the moment both players join.

2. **User Experience**: A board game is fundamentally a visual/strategic experience. Forcing voice communication on every room join is a UX mismatch. The call button approach lets voice be an enhancement, not a requirement.

3. **Privacy & Consent**: Modern web standards and user expectations demand explicit consent for microphone access. Auto-requesting mic on room join will likely cause users to deny the permission and potentially distrust the application.

4. **Mobile Battery**: For players on phones/tablets, continuous WebRTC audio encoding (even when muted) drains battery noticeably. Option B eliminates this entirely when voice isn't used.

5. **Consistent UI Pattern**: The call button + mic toggle + hang up buttons naturally extend the existing floating button pattern established by `ChatBubble.tsx`, creating a cohesive bottom-right control cluster.

> [!IMPORTANT]
> The additional implementation complexity of Option B (~1-2 extra days) is a worthwhile investment for a significantly better user experience and zero-cost idle performance.

---

## 7. Proposed Implementation (Option B)

### Backend Architecture

#### GameMessage.java Changes
- Add new `MessageType` enum values: `VOICE_CALL_REQUEST`, `VOICE_CALL_RESPONSE`, `VOICE_OFFER`, `VOICE_ANSWER`, `VOICE_ICE`, `VOICE_HANG_UP`
- Add fields: `sdp` (String), `iceCandidate` (String), `accepted` (Boolean)

#### GameController.java Changes
- Add STOMP endpoint: `@MessageMapping("/game.voiceSignal")`
- Handler simply rebroadcasts signaling messages to `/topic/game/{room}` (no server-side processing needed — it's peer-to-peer)

### Frontend Architecture

#### New Files
| File | Purpose |
|:---|:---|
| `components/VoiceCallButton.tsx` | Call initiation button (Phone icon, consistent with ChatBubble style) |
| `components/VoiceControls.tsx` | In-call controls: Mic toggle + Hang up buttons |
| `components/IncomingCallPopup.tsx` | Accept/Decline glassmorphism popup |
| `hooks/useWebRTC.ts` | WebRTC peer connection management, ICE handling, media stream lifecycle |

#### Modified Files
| File | Change |
|:---|:---|
| `App.tsx` | Add voice call state, STOMP handlers for voice message types, render VoiceCallButton/Controls |
| `types.ts` | Add voice-related types to `GameMessage` and `MessageType` union |

### UI/UX Specification
- All voice buttons positioned in a horizontal cluster at `fixed bottom-6 right-4 sm:right-6` alongside the existing ChatBubble.
- Layout order (left to right): `[Mic Toggle]` → `[Hang Up]` → `[Call/Chat]` — only visible controls rendered based on call state.
- Incoming call popup renders as a `fixed` overlay with `z-[56]` (above chat bubble's `z-[55]`).
- Audio feedback: a subtle 440Hz→520Hz ascending tone on incoming call (matching existing chat notification pattern).

### Database Schema
- **None required**. Voice chat is purely ephemeral — no persistence needed.

### Docker Deployment
- No changes needed. WebRTC is browser-to-browser; the backend only relays small signaling messages over the existing STOMP connection.

---

## 8. Constraints & Rules

1. **No media server**: All audio is peer-to-peer via WebRTC. The backend ONLY relays signaling (SDP/ICE) via STOMP.
2. **Audio-only**: No video. `getUserMedia({ audio: true, video: false })`.
3. **Multiplayer-only**: Voice call button only appears when `gameMode === 'MULTIPLE'` and `playerCount === 2`.
4. **Mic permission on-demand**: `getUserMedia` is only called when the user initiates or accepts a call.
5. **Clean teardown**: `RTCPeerConnection.close()` and `MediaStream.getTracks().forEach(t => t.stop())` on hang up, room leave, or disconnect.
6. **STOMP ref pattern**: All voice-related STOMP handlers must use `useRef` to avoid stale closures (per architectural rule #1 in Section 28 of manifest).
7. **Button styling**: Must match ChatBubble's `w-14 h-14 rounded-full shadow-xl` pattern exactly.
8. **Call timeout**: Incoming call popup auto-dismisses after 30 seconds (treated as decline).
9. **No new dependencies**: WebRTC is browser-native; no npm packages required.

---

## 9. Execution Phases

### Phase 1 — Backend Signaling (1-2 hours)
1. Extend `MessageType` enum with voice signaling types
2. Add `sdp`, `iceCandidate`, `accepted` fields to `GameMessage.java`
3. Add `@MessageMapping("/game.voiceSignal")` handler in `GameController.java`
4. Rebuild backend: `docker compose up --build -d backend`

### Phase 2 — Frontend WebRTC Hook (2-3 hours)
1. Create `useWebRTC.ts` custom hook
2. Implement `RTCPeerConnection` lifecycle (create, offer, answer, ICE, close)
3. Implement `getUserMedia` with error handling
4. Wire STOMP send/receive for signaling messages

### Phase 3 — Frontend UI Components (2-3 hours)
1. Create `VoiceCallButton.tsx` (call initiation)
2. Create `IncomingCallPopup.tsx` (accept/decline)
3. Create `VoiceControls.tsx` (mic toggle + hang up)
4. Integrate into `App.tsx` with state management

### Phase 4 — Polish & Testing (1-2 hours)
1. Add Framer Motion animations matching ChatBubble
2. Test cross-browser (Chrome, Firefox, Safari)
3. Test mobile responsiveness
4. Test disconnect/reconnect scenarios
5. Rebuild frontend: `docker compose up --build -d frontend`

---

## 10. File Modification Summary

### Files to CREATE
| File | Purpose |
|:---|:---|
| `frontend/src/hooks/useWebRTC.ts` | WebRTC peer connection hook |
| `frontend/src/components/VoiceCallButton.tsx` | Call initiation button |
| `frontend/src/components/VoiceControls.tsx` | In-call mic toggle + hang up |
| `frontend/src/components/IncomingCallPopup.tsx` | Incoming call accept/decline popup |

### Files to MODIFY
| File | Change |
|:---|:---|
| `backend/.../GameMessage.java` | Add voice message types + signaling fields |
| `backend/.../GameController.java` | Add voice signal relay endpoint |
| `frontend/src/App.tsx` | Voice call state, STOMP handlers, render voice UI |
| `frontend/src/types.ts` | Add voice types to interfaces |
