# Feature Plan #04 — UI Overhaul: History Page, Chat Bubble, Settings & Auth Landing

> **Plan ID**: `04`  
> **Status**: 🔲 Not Started  
> **Created**: 2026-05-19  
> **Last Updated**: 2026-05-19  
> **Scope**: Client-side routing, match history page, floating chat bubble, settings page, authenticated landing differentiation  
> **Stack**: React 19 + TypeScript, React Router v7, Tailwind CSS 4.0, Framer Motion 12, Lucide React

---

## 1. Objective

Overhaul the Gomoku frontend UX with five interconnected changes:

| # | Feature | Summary |
|:---|:---|:---|
| A | **Match History Page** | New routed page (`/history`) displaying confrontation records as a scrollable list. Accessible from profile dropdown. Includes back-navigation button. |
| B | **Floating Chat Bubble** | Migrate chat from `GameDrawer` tabs into a bottom-right floating circle bubble. Semi-transparent, responsive, with red notification badge + unread count. Drawer keeps only Move History. |
| C | **Settings Page** | New routed page (`/settings`) for profile editing (name + avatar). Replaces the inline edit currently in `ProfileModal`. |
| D | **Authenticated Landing** | Differentiated entry: anonymous users see current `InformationScreen`; authenticated users auto-navigate to `/history` on app load (no more shared screen). |
| E | **Sticky Header** | Preserved across all routed pages. Header remains `sticky top-0 z-50` with backdrop-blur on small screens during scroll. |

### What's Preserved (Zero Regression)
- All WebSocket game logic untouched
- Game board, turn timer, timeout warning unchanged
- Anonymous play flow identical for non-authenticated users
- Auth modal (login/signup) unchanged
- Backend API endpoints unchanged — purely frontend restructuring

---

## 2. Database Schema

**No database changes required.** This is a frontend-only feature plan. All data is consumed from existing endpoints:

| Endpoint | Data Used |
|:---|:---|
| `GET /api/user/profile` | `confrontations[]`, `fullName`, `avatar`, `username` |
| `PUT /api/user/profile` | Update `fullName`, `avatar` |
| `GET /api/user/stats` | `totalWins`, `totalLosses`, `totalMatches`, `winRate` |

---

## 3. Backend Architecture

**No backend changes required.** All necessary REST endpoints already exist.

---

## 4. Frontend Architecture

### 4.1 New Dependency

| Package | Version | Purpose |
|:---|:---|:---|
| `react-router-dom` | `^7.x` | Client-side routing for `/`, `/history`, `/settings` |

Install: `npm install react-router-dom`

### 4.2 Route Map

| Route | Component | Auth Required | Description |
|:---|:---|:---|:---|
| `/` | `App` (game page) | No | Current game flow — anonymous see `InformationScreen`, joined see `MainGame` |
| `/history` | `MatchHistoryPage` | Yes (redirect to `/` if not) | Full-page confrontation records + stats dashboard |
| `/settings` | `SettingsPage` | Yes (redirect to `/` if not) | Profile editor (name + avatar) |

### 4.3 File Structure (new files)

```
frontend/src/
├── main.tsx                    # MODIFY: Add BrowserRouter + Routes
├── App.tsx                     # MODIFY: Remove ProfileModal, add chat bubble state, auth redirect logic
├── types.ts                    # MODIFY: Add UserStatsDTO interface
├── api/
│   └── authApi.ts              # MODIFY: Add getStats() method
├── pages/
│   ├── MatchHistoryPage.tsx    # CREATE: Full-page match history with stats
│   └── SettingsPage.tsx        # CREATE: Full-page profile editor
├── components/
│   ├── Header.tsx              # MODIFY: Add navigation links for auth users
│   ├── GameDrawer.tsx          # MODIFY: Remove chat tab, keep only Move History
│   ├── ChatBubble.tsx          # CREATE: Floating chat bubble with notification badge
│   ├── UserDropdown.tsx        # MODIFY: Route links instead of modal opens
│   ├── ProfileModal.tsx        # DELETE: Replaced by SettingsPage + MatchHistoryPage
│   └── ChatPanel.tsx           # MODIFY: Minor — always inline mode inside ChatBubble
└── context/
    └── AuthContext.tsx          # UNCHANGED
```

### 4.4 TypeScript Interfaces (`types.ts` — additions)

```typescript
export interface UserStatsDTO {
  totalWins: number;
  totalLosses: number;
  totalMatches: number;
  winRate: number;
}
```

### 4.5 API Layer (`authApi.ts` — addition)

```typescript
getStats: async (token: string): Promise<UserStatsDTO> => {
  const response = await fetch(`${API_BASE}/api/user/stats`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
},
```

---

## 5. UI/UX Specification

### 5.1 Feature A: Match History Page (`/history`)

#### Layout
```
┌─────────────────────────────────────────┐
│ [Header - sticky]                       │
├─────────────────────────────────────────┤
│ ← Back to Arena          [Settings ⚙]  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  📊 Your Battle Statistics      │    │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │    │
│  │  │Wins│ │Loss│ │Matc│ │Win%│  │    │
│  │  │ 12 │ │  5 │ │ 17 │ │70.6│  │    │
│  │  └────┘ └────┘ └────┘ └────┘  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ⚔ Confrontation Records               │
│  ┌─────────────────────────────────┐    │
│  │ [Avatar] OpponentName    3W-1L  │    │
│  │ [Avatar] OpponentName    0W-5L  │    │
│  │ [👤]    Anonymous Players 8W-2L │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

#### Component: `MatchHistoryPage.tsx`
- **Back button**: Top-left `← Back to Arena` using `useNavigate()` → navigates to `/`
- **Settings link**: Top-right gear icon → navigates to `/settings`
- **Stats Cards**: 4 glass-card stat tiles fetched from `GET /api/user/stats`
  - Total Wins (green accent)
  - Total Losses (red accent)
  - Total Matches (blue accent)
  - Win Rate % (gradient amber-to-green based on percentage)
- **Confrontation Records List**: Scrollable list of opponent cards from `GET /api/user/profile` → `confrontations[]`
  - Each card shows: opponent avatar (or initial), full name, @username, W-L record
  - Color-coded: green text if wins > losses, red if losses > wins, neutral if equal
  - Anonymous row shows ghost icon + "Anonymous Players" label
- **Empty State**: Trophy icon + "No battle records yet" message
- **Auth Guard**: If `!isAuthenticated`, redirect to `/` immediately via `useEffect`
- **Animations**: Staggered fade-in for each record card (`delay: idx * 0.05`)

#### Responsive Behavior
- **Mobile (< 640px)**: Stats cards in 2×2 grid, full-width record cards
- **Tablet (640-1024px)**: Stats cards in single row, records in single column
- **Desktop (> 1024px)**: Centered max-w-2xl container

### 5.2 Feature B: Floating Chat Bubble

#### Component: `ChatBubble.tsx`

```
┌──────────────────────────────────┐
│                                  │
│         [Game Board]             │
│                                  │
│                                  │
│                    ┌──────────┐  │
│                    │ Chat     │  │
│                    │ Panel    │  │ ← Expanded panel (300px wide, max 420px tall)
│                    │ ...      │  │
│                    │ [input]  │  │
│                    └──────────┘  │
│                         [💬 3]  │ ← Floating bubble (56px circle) with badge
└──────────────────────────────────┘
```

#### Behavior
- **Default State**: Collapsed — shows a 56px circle button at `bottom-6 right-6` with `MessageSquare` icon
- **Notification Badge**: Red circle (18px) at top-right of bubble showing unread message count
  - Count resets to 0 when chat is opened
  - Only counts messages from other users (not own messages)
  - Badge hidden when count is 0
- **Expanded State**: Click opens a chat panel above the bubble
  - Panel: 320px wide × max 420px tall, glass-card styling, rounded-2xl
  - Semi-transparent: `bg-glass-bg/90 backdrop-blur-2xl`
  - Close button (X) at top-right of panel header
  - Contains full `ChatPanel` in inline mode
- **Animation**: Spring-based open/close with `AnimatePresence`
- **Responsive (< 640px)**: Panel expands to `calc(100vw - 2rem)` width, positioned `bottom-20 right-4`
- **Z-Index**: `z-[55]` — above game board but below modals and timeout warning
- **Visibility**: Only shown when `isJoined === true` (in-game only)

#### Notification Logic (in `App.tsx`)
```typescript
const [unreadCount, setUnreadCount] = useState(0);
const [isChatOpen, setIsChatOpen] = useState(false);

// In handleMessage CHAT case:
if (!isChatOpen && message.sender !== username) {
  setUnreadCount(prev => prev + 1);
}

// When opening chat:
const openChat = () => { setIsChatOpen(true); setUnreadCount(0); };
```

### 5.3 Feature C: Settings Page (`/settings`)

#### Layout
```
┌─────────────────────────────────────────┐
│ [Header - sticky]                       │
├─────────────────────────────────────────┤
│ ← Back                                 │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │         [Avatar Circle]         │    │
│  │         📷 Change Photo         │    │
│  │                                 │    │
│  │  Full Name: [____________]      │    │
│  │  Username:  @username (readonly)│    │
│  │                                 │    │
│  │  [💾 Save Changes]             │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Account Information                    │
│  ┌─────────────────────────────────┐    │
│  │  Member since: May 2026         │    │
│  │  [🚪 Log Out]                   │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

#### Component: `SettingsPage.tsx`
- Migrates profile editing logic from current `ProfileModal.tsx`
- **Avatar**: Large circle (128px) with camera overlay for upload, same 500KB limit
- **Full Name**: Editable input field
- **Username**: Read-only display with `@` prefix
- **Save Button**: Loading state with spinner, calls `updateProfile()`
- **Account Section**: Member info + prominent Log Out button (red accent)
- **Back Button**: Top-left `← Back` → navigates to `/history`
- **Auth Guard**: Redirect to `/` if not authenticated
- **Success Feedback**: Brief green toast/banner on successful save

### 5.4 Feature D: Authenticated Landing

#### Flow
```
User opens app at / 
  → isAuthenticated? 
    → Yes → Navigate to /history
    → No  → Show InformationScreen
      → User logs in? 
        → Yes → Navigate to /history
        → No  → Continue anonymous play
```

#### Implementation
- In `App.tsx`, add a `useEffect` that checks `isAuthenticated` on mount:
  ```typescript
  useEffect(() => {
    if (isAuthenticated && !isJoined) {
      navigate('/history');
    }
  }, [isAuthenticated]);
  ```
- After successful login in `AuthModal`, navigate to `/history`
- The `/` route remains the game page — authenticated users can still navigate back to play
- `InformationScreen` remains unchanged for anonymous users

### 5.5 Feature E: Sticky Header (Maintained)

- Header component already has `sticky top-0 z-50` — no change needed
- **New requirement**: Header must render on ALL routed pages (`/`, `/history`, `/settings`)
- On `/history` and `/settings` pages, the header shows:
  - Theme toggle (always)
  - User identity section with dropdown (authenticated)
  - No game-specific controls (scores, timer, drawer toggle, exit) since `isJoined` is false

### 5.6 GameDrawer Rework

#### Current State (2 tabs)
- Tab 1: Move History (`HistorySection`)
- Tab 2: Chat (`ChatPanel` inline)

#### New State (simplified)
- **Remove tab system entirely** — drawer now shows only Move History
- Keep drawer header with `HistoryIcon` + "Game History" title + close button
- Keep footer with room ID
- Chat is fully handled by `ChatBubble` — no duplication
- **Overall drawer structure (open/close toggle, animation, responsive sizing) unchanged**

---

## 6. Integration Points

### 6.1 Router Setup (`main.tsx`)

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/history" element={<MatchHistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
```

### 6.2 Shared Header Across Pages

Since `Header` currently receives many game-state props, on `/history` and `/settings` pages we render Header with `isJoined={false}` which naturally hides game-specific controls (scores, timer, drawer toggle, exit). Only theme toggle and user identity section remain visible.

### 6.3 Theme State Persistence

**Problem**: `isDarkMode` state lives in `App.tsx`. When navigating to `/history` or `/settings`, theme state is lost.

**Solution**: Use `localStorage` for theme persistence in each page:
```typescript
const [isDarkMode, setIsDarkMode] = useState(() => {
  return localStorage.getItem('gomoku_theme') !== 'light';
});

useEffect(() => {
  localStorage.setItem('gomoku_theme', isDarkMode ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', isDarkMode);
}, [isDarkMode]);
```

### 6.4 WebSocket Isolation

- WebSocket connection **only** lives in `App.tsx` (the game page at `/`)
- `/history` and `/settings` pages do NOT establish WebSocket connections
- Navigating away from `/` disconnects the WebSocket (component unmounts)
- This is intentional — game state is ephemeral and room-scoped

### 6.5 UserDropdown Navigation Updates

| Icon | Label | Current Action | New Action |
|:---|:---|:---|:---|
| `User` | Profile & Records | `onOpenProfile()` → ProfileModal | `navigate('/history')` |
| `Settings` | Settings | Placeholder (no-op) | `navigate('/settings')` |
| `LogOut` | Log Out | `auth.logout()` | `auth.logout()` + `navigate('/')` |

---

## 7. Docker Deployment

**No Docker changes required.** Frontend-only change.

> **Note**: For production with client-side routing, ensure the static file server has a fallback to `index.html`. Vercel handles this automatically. For Nginx, add:
> ```nginx
> location / {
>   try_files $uri $uri/ /index.html;
> }
> ```

---

## 8. Constraints & Rules

| # | Rule |
|:---|:---|
| 1 | Anonymous play MUST continue to work identically (zero regression) |
| 2 | WebSocket protocol unchanged — chat messages still flow through existing STOMP topics |
| 3 | All type imports use `import type` syntax (`verbatimModuleSyntax`) |
| 4 | No backend changes in this plan |
| 5 | Chat bubble notification count resets on open, does NOT persist across navigations |
| 6 | `/history` and `/settings` routes MUST redirect to `/` if user is not authenticated |
| 7 | Header MUST remain `sticky top-0 z-50` on ALL pages, including during scroll on small screens |
| 8 | Theme preference MUST persist across route navigations via `localStorage` |
| 9 | Existing `ProfileModal.tsx` is DELETED after migration — no dead code |
| 10 | GameDrawer overall structure (toggle, animation, responsive) stays the same — only internal tabs change |
| 11 | Avatar upload limit: 500KB (validated on frontend), inherited from existing logic |
| 12 | Chat bubble z-index (`z-[55]`) must be below timeout warning (`z-[100]`) and modals (`z-[100]`) |
| 13 | `?room=xxx` URL parameter must continue to work on the `/` route for room sharing |

---

## 9. Execution Phases

### Phase 1: Routing Foundation
1. Install `react-router-dom` v7
2. Modify `main.tsx` — wrap app in `BrowserRouter`, define `Routes`
3. Add theme persistence to `localStorage`
4. Add `UserStatsDTO` interface to `types.ts`
5. Add `getStats()` method to `authApi.ts`

### Phase 2: Match History Page
1. Create `pages/MatchHistoryPage.tsx` with stats cards + confrontation list
2. Implement auth guard (redirect if not authenticated)
3. Implement back navigation button
4. Wire up data fetching from existing endpoints
5. Style responsive layout
6. Add staggered entry animations

### Phase 3: Settings Page
1. Create `pages/SettingsPage.tsx` — migrate edit logic from `ProfileModal.tsx`
2. Implement avatar upload with 500KB validation
3. Add save with loading state + success feedback
4. Add account info section with logout button
5. Add auth guard + back navigation

### Phase 4: Chat Bubble
1. Create `components/ChatBubble.tsx` — floating circle with expand/collapse
2. Add unread count state to `App.tsx`
3. Integrate `ChatPanel` inline inside bubble's expanded panel
4. Style notification badge
5. Test responsive behavior on mobile
6. Remove chat tab from `GameDrawer.tsx`

### Phase 5: GameDrawer Simplification
1. Remove tab toggle system from `GameDrawer.tsx`
2. Remove `ChatPanel` import and rendering
3. Keep drawer header, `HistorySection`, and footer
4. Clean up unused props

### Phase 6: Authenticated Landing & Navigation
1. Modify `App.tsx` — add redirect for authenticated users to `/history`
2. Modify `UserDropdown.tsx` — replace modal opens with `navigate()` calls
3. Delete `ProfileModal.tsx`
4. Remove `showProfileModal` state from `App.tsx`
5. Update `Header.tsx` props

### Phase 7: Polish & Responsive
1. Verify sticky header on all pages during scroll on small screens
2. Verify chat bubble doesn't overlap game controls
3. Verify theme toggle works across routes
4. Verify `?room=xxx` URL parameter still works
5. Fix TypeScript build errors

---

## 10. File Modification Summary

### Frontend — CREATE (3 files)

| File | Purpose |
|:---|:---|
| `pages/MatchHistoryPage.tsx` | Full-page match history with stats + confrontation records |
| `pages/SettingsPage.tsx` | Full-page profile editor (name, avatar) + account management |
| `components/ChatBubble.tsx` | Floating chat circle with notification badge |

### Frontend — MODIFY (7 files)

| File | Change |
|:---|:---|
| `main.tsx` | Add `react-router-dom`, `BrowserRouter`, `Routes` with 3 routes |
| `App.tsx` | Remove `ProfileModal`, add chat bubble + unread state, add auth redirect, theme to localStorage |
| `types.ts` | Add `UserStatsDTO` interface |
| `api/authApi.ts` | Add `getStats(token)` method |
| `components/GameDrawer.tsx` | Remove chat tab, simplify to history-only |
| `components/UserDropdown.tsx` | Replace modal opens with `navigate()` calls |
| `components/Header.tsx` | Remove `onOpenProfile` prop, adjust for non-game pages |

### Frontend — DELETE (1 file)

| File | Reason |
|:---|:---|
| `components/ProfileModal.tsx` | Replaced by `SettingsPage` + `MatchHistoryPage` |

---

## 11. Visual Design Tokens

### Chat Bubble
| Property | Value |
|:---|:---|
| Bubble size | `56px` circle |
| Bubble position | `fixed bottom-6 right-6` |
| Bubble bg | `bg-blue-600 hover:bg-blue-500` |
| Bubble shadow | `shadow-xl shadow-blue-500/30` |
| Badge size | `18px` circle |
| Badge color | `bg-red-500 text-white` |
| Badge font | `text-[10px] font-black` |
| Panel width | `320px` (desktop), `calc(100vw - 2rem)` (mobile) |
| Panel max-height | `420px` |
| Panel bg | `bg-glass-bg/90 backdrop-blur-2xl` |

### Stats Cards (Match History Page)
| Stat | Accent Color | Icon |
|:---|:---|:---|
| Total Wins | `green-500` | `Trophy` |
| Total Losses | `red-500` | `TrendingDown` |
| Total Matches | `blue-500` | `Swords` |
| Win Rate | `amber-500` → `green-500` gradient | `Percent` |

### Page Layout
| Property | Value |
|:---|:---|
| Container | `max-w-2xl mx-auto px-4 py-8` |
| Back button | `text-content-muted hover:text-content` with `ArrowLeft` icon |
| Section spacing | `space-y-8` |
| Card styling | `glass-card rounded-2xl p-6` |
