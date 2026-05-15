# Feature Plan #01 — Authentication, Profile & Confrontation Records

> **Plan ID**: `01`  
> **Status**: ✅ Implemented  
> **Created**: 2026-05-16  
> **Last Updated**: 2026-05-16  
> **Scope**: Login/Signup, User Profile, Win/Loss Confrontation Tracking  
> **Stack**: Spring Boot Backend (SQLite + JWT) + React Frontend (AuthContext)

---

## 1. Objective

Enable optional user authentication so that registered players can:
- **Log in / Sign up** with username, password, full name, and optional avatar.
- **Edit profile** (full name, avatar) from within the game UI.
- **Track head-to-head confrontation records** (win/loss) between authenticated users in Multiplayer mode.
- **Preserve anonymous play** — unauthenticated users continue to play with randomly generated names (zero regression).

---

## 2. Database Schema (SQLite)

### 2.1 Why SQLite
- Zero-config, serverless, single-file DB — no external DB container needed.
- Spring Boot has first-class SQLite support via `spring-boot-starter-data-jpa` + `xerial/sqlite-jdbc`.

### 2.2 Tables

```sql
-- Table: users
CREATE TABLE users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,          -- BCrypt hashed
    full_name   TEXT    NOT NULL,
    avatar      TEXT    DEFAULT NULL,      -- Base64 encoded image string (nullable, max ~500KB)
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Table: confrontation_records
-- Canonical pairing: user_a_id is always the SMALLER id
CREATE TABLE confrontation_records (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_a_id   INTEGER NOT NULL,
    user_b_id   INTEGER NOT NULL,
    user_a_wins INTEGER NOT NULL DEFAULT 0,
    user_b_wins INTEGER NOT NULL DEFAULT 0,
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_a_id) REFERENCES users(id),
    FOREIGN KEY (user_b_id) REFERENCES users(id),
    UNIQUE(user_a_id, user_b_id)
);

CREATE INDEX idx_confrontation_users ON confrontation_records(user_a_id, user_b_id);
```

### 2.3 Canonical Pair Logic
When recording a match result between User X (id=5) and User Y (id=3):
- `user_a_id = 3` (smaller), `user_b_id = 5` (larger)
- If User Y (id=3) won → increment `user_a_wins`
- If User X (id=5) won → increment `user_b_wins`

This ensures exactly **one row per unique pair**, regardless of who joined first.

---

## 3. Backend Architecture

### 3.1 Dependencies (`pom.xml` — additions)

| Dependency | Purpose |
|:---|:---|
| `spring-boot-starter-data-jpa` | JPA + Hibernate |
| `org.xerial:sqlite-jdbc:3.45.3.0` | SQLite JDBC driver |
| `org.hibernate.orm:hibernate-community-dialects` | SQLite Hibernate dialect |
| `spring-boot-starter-security` | BCrypt + filter chain |
| `io.jsonwebtoken:jjwt-api:0.12.5` | JWT creation/validation |
| `io.jsonwebtoken:jjwt-impl:0.12.5` (runtime) | JWT implementation |
| `io.jsonwebtoken:jjwt-jackson:0.12.5` (runtime) | JWT Jackson serialization |

### 3.2 Configuration (`application.properties` — additions)

```properties
# SQLite
spring.datasource.url=jdbc:sqlite:data/gomoku.db
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=update

# JWT
jwt.secret=<generate-a-secure-256-bit-key>
jwt.expiration-ms=86400000
```

### 3.3 File Structure (new files)

```
backend/src/main/java/com/gomoku/game/
├── model/
│   ├── User.java                   # JPA Entity (manual builder, no Lombok)
│   └── ConfrontationRecord.java    # JPA Entity (manual builder, no Lombok)
├── repository/
│   ├── UserRepository.java         # Spring Data JPA
│   └── ConfrontationRepository.java
├── dto/
│   ├── SignupRequest.java          # { username, password, fullName, avatar? }
│   ├── LoginRequest.java           # { username, password }
│   ├── AuthResponse.java           # { token, username, fullName, avatar }
│   ├── ProfileUpdateRequest.java   # { fullName?, avatar? }
│   ├── UserProfileResponse.java    # { username, fullName, avatar, confrontations }
│   └── ConfrontationDTO.java       # { opponentUsername, opponentFullName, opponentAvatar, wins, losses }
├── service/
│   ├── AuthService.java            # Signup (with validation), login, token generation
│   ├── UserService.java            # Profile CRUD
│   └── ConfrontationService.java   # Record & query H2H stats
├── security/
│   ├── SecurityConfig.java         # HTTP security filter chain
│   ├── JwtTokenProvider.java       # JWT creation & validation
│   └── JwtAuthenticationFilter.java # OncePerRequestFilter
└── controller/
    ├── AuthController.java         # POST /api/auth/signup, /api/auth/login
    └── UserController.java         # GET/PUT /api/user/profile
```

> **IMPORTANT**: No Lombok — all entities use manual getters/setters/builders due to JDK 21 compatibility issues.

### 3.4 REST API Endpoints

| Method | Path | Auth | Request Body | Response | Description |
|:---|:---|:---|:---|:---|:---|
| `POST` | `/api/auth/signup` | No | `SignupRequest` | `AuthResponse` | Create account + return JWT |
| `POST` | `/api/auth/login` | No | `LoginRequest` | `AuthResponse` | Validate credentials + return JWT |
| `GET` | `/api/user/profile` | Yes | — | `UserProfileResponse` | Get current user's profile + confrontation records |
| `PUT` | `/api/user/profile` | Yes | `ProfileUpdateRequest` | `UserProfileResponse` | Update fullName/avatar |

### 3.5 Security Configuration

- **Public endpoints**: `/api/auth/**`, `/ws-gomoku/**`, `/topic/**`
- **Protected endpoints**: `/api/user/**` (require valid JWT)
- **Session**: Stateless (no server-side sessions)
- **CORS**: Allow same origins as WebSocket (`allowedOriginPatterns("*")`)
- **Password encoder**: `BCryptPasswordEncoder`
- **Filter**: `JwtAuthenticationFilter` added before `UsernamePasswordAuthenticationFilter`

### 3.6 Validation Rules (Backend — AuthService.validateSignup)

| Field | Rule |
|:---|:---|
| Username | Min 3 characters, must not already exist |
| Password | Min 8 characters, must contain ≥1 letter + ≥1 digit + ≥1 special character (`!@#$%^&*(),.?":{}|<>`) |
| Full Name | Required, non-empty after trim |

### 3.7 Confrontation Recording Logic

Triggered in `GameController.java` on Multiplayer WIN event:
1. Get both players from the room.
2. Look up both usernames in `UserRepository`.
3. If **both** are registered users → call `ConfrontationService.recordWin()`.
4. If either is anonymous → skip (no tracking).
5. Fire-and-forget — must not block the WebSocket response.

---

## 4. Frontend Architecture

### 4.1 File Structure (new files)

```
frontend/src/
├── api/
│   └── authApi.ts              # fetch wrappers for auth & profile endpoints
├── context/
│   └── AuthContext.tsx          # React Context for auth state (user, token, login/logout)
└── components/
    ├── AuthModal.tsx            # Login/Signup modal (tabbed, glassmorphism)
    ├── UserDropdown.tsx         # Dropdown menu (Profile, Settings, Logout) — auth-only
    └── ProfileModal.tsx         # Edit fullName & avatar + confrontation records
```

### 4.2 Modified Files

| File | Change |
|:---|:---|
| `types.ts` | Add `SignupRequest`, `LoginRequest`, `AuthResponse`, `UserProfile`, `ConfrontationRecord` interfaces |
| `App.tsx` | Integrate `AuthContext`; sync username with auth state; add modal state |
| `main.tsx` | Wrap app in `<AuthProvider>` |
| `Header.tsx` | Replace static name with conditional identity section; dropdown for auth users only; sticky header |
| `InformationScreen.tsx` | Add "Log In" link for anonymous users |

### 4.3 TypeScript Interfaces (`types.ts` additions)

```typescript
interface SignupRequest {
  username: string;
  password: string;
  fullName: string;
  avatar?: string;  // Base64
}

interface LoginRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
  username: string;
  fullName: string;
  avatar: string | null;
}

interface UserProfile {
  username: string;
  fullName: string;
  avatar: string | null;
}

interface ConfrontationRecord {
  opponentUsername: string;
  opponentFullName: string;
  opponentAvatar: string | null;
  wins: number;
  losses: number;
}
```

### 4.4 AuthContext State Shape

```typescript
interface AuthState {
  user: AuthResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (req: LoginRequest) => Promise<void>;
  signup: (req: SignupRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { fullName?: string; avatar?: string }) => Promise<void>;
}
```

**Persistence**: Token + user stored in `localStorage` (`gomoku_token`, `gomoku_user`). On mount, check localStorage → hydrate state.

### 4.5 Validation Rules (Frontend — AuthModal.validateForm)

Must mirror backend rules exactly:

| Field | Rule |
|:---|:---|
| Username | Min 3 characters |
| Password | Min 8 characters, must contain ≥1 letter + ≥1 digit + ≥1 special character |
| Full Name | Required, non-empty |

UI hints displayed below inputs on the Sign Up tab.

### 4.6 API Layer (`authApi.ts`)

```typescript
const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8888`;

export const authApi = {
  signup: (data: SignupRequest) => fetch(`${API_BASE}/api/auth/signup`, { method: 'POST', ... }),
  login:  (data: LoginRequest)  => fetch(`${API_BASE}/api/auth/login`, { method: 'POST', ... }),
  getProfile: (token: string)   => fetch(`${API_BASE}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } }),
  updateProfile: (token: string, data) => fetch(`${API_BASE}/api/user/profile`, { method: 'PUT', ... }),
};
```

> Uses `import type` for all type imports to satisfy `verbatimModuleSyntax`.

---

## 5. UI/UX Specification

### 5.1 Header Identity Section

| State | Display | Interaction |
|:---|:---|:---|
| Anonymous + Not Joined | Hidden | — |
| Anonymous + In Game | Static "Hi, {randomName}" with user icon | No dropdown, no chevron |
| Authenticated (anywhere) | "Hi, {fullName}" with avatar + chevron | Click opens `UserDropdown` |

**Click-outside behavior**: Uses `useRef` + global `mousedown` listener to close dropdown when clicking outside the identity container.

### 5.2 UserDropdown (Authenticated Only)

| Icon | Label | Action |
|:---|:---|:---|
| `User` | Profile & Records | Opens `ProfileModal` |
| `Settings` | Settings | Placeholder (future) |
| `LogOut` | Log Out | Calls `auth.logout()`, reverts to anonymous |

### 5.3 AuthModal (Login/Signup Tabs)

- Glassmorphism modal using `.glass-card` design token.
- Animated tab indicator.
- **Login tab**: Username + Password fields, submit button with loading state.
- **Signup tab**: Avatar upload (optional, max 500KB), Full Name, Username (min 3 chars hint), Password (min 8 chars + letters/numbers/special hint), submit button.
- Error display in red banner.

### 5.4 ProfileModal

- Large avatar circle with camera overlay for upload.
- Editable Full Name field.
- Save button with loading state.
- Confrontation Records section: grid of opponent cards showing avatar, name, W/L stats.

### 5.5 InformationScreen

- "Already have an account? Log In" link shown for anonymous users.
- Clicking opens `AuthModal`.

### 5.6 Sticky Header

- `sticky top-0 z-50` with backdrop-blur for scroll-through transparency.

---

## 6. Integration Points

### 6.1 WebSocket Identity Sync

```typescript
// App.tsx — username derived from auth state
useEffect(() => {
  if (isAuthenticated && user) {
    setUsername(user.username);
  } else if (!username) {
    generateRandomName();
  }
}, [isAuthenticated, user]);
```

### 6.2 Win Event → Confrontation Recording

In `GameController.java`, after existing win broadcast:
```
[Existing] → broadcastMessage(WIN, ...)
[NEW]      → recordConfrontation(room, winnerUsername)
```

### 6.3 Score Display Separation

- In-game scores: per-room, per-session (unchanged).
- Confrontation records: persistent, accessed via Profile modal only.

---

## 7. Docker Deployment

```yaml
# docker-compose.yml — backend volume for SQLite persistence
services:
  backend:
    volumes:
      - gomoku-db:/app/data
volumes:
  gomoku-db:
```

Backend `application.properties` uses `jdbc:sqlite:data/gomoku.db` to write inside the mounted volume.

> **WARNING**: Without this volume, all user data is lost on container restart.

---

## 8. Constraints & Rules

| # | Rule |
|:---|:---|
| 1 | Anonymous play MUST continue to work exactly as before (zero regression) |
| 2 | Existing WebSocket protocol remains unchanged; auth is purely additive |
| 3 | Confrontation records always store `user_a_id < user_b_id` (canonical pair) |
| 4 | Avatar max size: 500KB Base64, validated on both frontend and backend |
| 5 | Password: min 8 chars, must have letters + numbers + special characters |
| 6 | Username: min 3 characters, unique (case-sensitive) |
| 7 | JWT expiry: 24 hours, no refresh token |
| 8 | No Lombok — all Java classes use manual getters/setters/builders (JDK 21 compat) |
| 9 | All frontend type imports use `import type` syntax (verbatimModuleSyntax) |
| 10 | CORS: auth endpoints allow same origins as WebSocket |

---

## 9. Execution Phases

### Phase 1: Backend Foundation
1. Add SQLite + JPA + Security + JWT dependencies to `pom.xml`
2. Configure `application.properties` for SQLite + JWT
3. Create `model/` entities (User, ConfrontationRecord) — manual builders
4. Create `repository/` interfaces
5. Create `security/` package (JWT provider, filter, config)
6. Create `dto/` request/response classes
7. Create `service/AuthService.java` (with validation) and `service/UserService.java`
8. Create `controller/AuthController.java` and `controller/UserController.java`

### Phase 2: Confrontation Service
1. Create `service/ConfrontationService.java`
2. Modify `GameController.java` — call `recordConfrontation()` on Multiplayer WIN
3. Wire confrontation data into `GET /api/user/profile` response

### Phase 3: Frontend Auth Infrastructure
1. Add TypeScript interfaces to `types.ts`
2. Create `api/authApi.ts`
3. Create `context/AuthContext.tsx`
4. Wrap `App` in `<AuthProvider>` in `main.tsx`
5. Modify `App.tsx` to sync username with auth state

### Phase 4: Frontend UI Components
1. Create `AuthModal.tsx` (Login/Signup with validation)
2. Create `UserDropdown.tsx` (auth-only dropdown)
3. Create `ProfileModal.tsx` (profile editor + confrontation list)
4. Modify `Header.tsx` — conditional identity section, sticky, click-outside
5. Modify `InformationScreen.tsx` — login prompt for anonymous users

### Phase 5: Polish & Docker
1. Frontend validation hints on signup form
2. Docker volume for SQLite persistence
3. Fix TypeScript build errors (`import type`, unused imports)
4. Responsive adjustments for auth modals

---

## 10. File Modification Summary

### Backend — CREATE (17 files)
| File | Purpose |
|:---|:---|
| `model/User.java` | JPA entity for users table |
| `model/ConfrontationRecord.java` | JPA entity for confrontation_records table |
| `repository/UserRepository.java` | Spring Data JPA interface |
| `repository/ConfrontationRepository.java` | Spring Data JPA interface |
| `dto/SignupRequest.java` | Signup request DTO |
| `dto/LoginRequest.java` | Login request DTO |
| `dto/AuthResponse.java` | Auth response DTO |
| `dto/ProfileUpdateRequest.java` | Profile update DTO |
| `dto/UserProfileResponse.java` | Profile response DTO |
| `dto/ConfrontationDTO.java` | Confrontation record DTO |
| `service/AuthService.java` | Auth business logic + validation |
| `service/UserService.java` | User profile business logic |
| `service/ConfrontationService.java` | H2H record business logic |
| `security/SecurityConfig.java` | Spring Security config |
| `security/JwtTokenProvider.java` | JWT utility class |
| `security/JwtAuthenticationFilter.java` | Request filter |
| `controller/AuthController.java` | Auth REST endpoints |
| `controller/UserController.java` | User REST endpoints |

### Backend — MODIFY (3 files)
| File | Change |
|:---|:---|
| `pom.xml` | Add 7 new dependencies |
| `application.properties` | Add SQLite + JWT config |
| `GameController.java` | Add `recordConfrontation()` call on WIN event |

### Frontend — CREATE (5 files)
| File | Purpose |
|:---|:---|
| `api/authApi.ts` | API client for auth/profile endpoints |
| `context/AuthContext.tsx` | Auth state management context |
| `components/AuthModal.tsx` | Login/Signup modal |
| `components/UserDropdown.tsx` | User menu dropdown (auth-only) |
| `components/ProfileModal.tsx` | Profile editor + confrontation list |

### Frontend — MODIFY (5 files)
| File | Change |
|:---|:---|
| `types.ts` | Add auth-related interfaces |
| `App.tsx` | Integrate AuthContext, conditional username, modal state |
| `main.tsx` | Wrap with `AuthProvider` |
| `Header.tsx` | Conditional identity section, sticky, click-outside, dropdown |
| `InformationScreen.tsx` | Login prompt for anonymous users |
