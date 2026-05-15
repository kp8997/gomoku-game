# 🎯 Authentication, Profile & Confrontation Records — Implementation Plan

> **Version**: 1.0 | **Date**: 2026-05-16  
> **Scope**: Login/Signup, User Profile, Win/Loss Confrontation Tracking  
> **Target**: Spring Boot Backend (SQLite) + React Frontend

---

## 1. Feature Overview

### 1.1 Authentication System
- **Signup**: Username (unique), password (hashed), full name, avatar (optional file upload)
- **Login**: Username + password → JWT token
- **Session**: JWT-based stateless auth; token stored in `localStorage`
- **Anonymous Fallback**: Unauthenticated users can still play with random generated names (existing behavior preserved)

### 1.2 User Profile
- Authenticated users can update **full name** and **avatar** from a profile section
- Avatar stored as Base64 string in SQLite (keeps deployment simple, no file server needed)
- Max avatar size: **500KB** (after encoding), enforced on both frontend and backend

### 1.3 Confrontation Records
- Track head-to-head (H2H) stats between **authenticated users only**
- Each completed Multiplayer match between two authenticated users creates/updates a confrontation record
- Stores: `user_a_id`, `user_b_id`, `user_a_wins`, `user_b_wins` (canonical pair, `user_a_id < user_b_id`)
- Anonymous players' games are **not** tracked

---

## 2. Database Schema (SQLite)

### 2.1 Why SQLite
- Zero-config, serverless, single-file DB — perfect for this scale
- No external DB container needed (simplifies Docker deployment)
- Spring Boot has first-class SQLite support via `spring-boot-starter-data-jpa` + `xerial/sqlite-jdbc`

### 2.2 Tables

```sql
-- Table: users
CREATE TABLE users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,          -- BCrypt hashed
    full_name   TEXT    NOT NULL,
    avatar      TEXT    DEFAULT NULL,      -- Base64 encoded image string (nullable)
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

### 3.1 New Dependencies (`pom.xml`)

```xml
<!-- JPA + Hibernate -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- SQLite JDBC Driver -->
<dependency>
    <groupId>org.xerial</groupId>
    <artifactId>sqlite-jdbc</artifactId>
    <version>3.45.3.0</version>
</dependency>

<!-- SQLite Hibernate Dialect -->
<dependency>
    <groupId>org.hibernate.orm</groupId>
    <artifactId>hibernate-community-dialects</artifactId>
</dependency>

<!-- Spring Security (for BCrypt + filter chain) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JWT (JSON Web Token) -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>
```

### 3.2 `application.properties` (New Entries)

```properties
# SQLite Configuration
spring.datasource.url=jdbc:sqlite:gomoku.db
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=update

# JWT
jwt.secret=<generate-a-secure-256-bit-key>
jwt.expiration-ms=86400000
```

### 3.3 New File Structure

```
backend/src/main/java/com/gomoku/game/
├── GomokuApplication.java          # (existing) No changes
├── WebSocketConfig.java            # (existing) No changes
├── GameMessage.java                # (existing) No changes
├── GameController.java             # (MODIFY) Add auth-aware win recording
│
├── model/
│   ├── User.java                   # JPA Entity
│   └── ConfrontationRecord.java    # JPA Entity
│
├── repository/
│   ├── UserRepository.java         # Spring Data JPA
│   └── ConfrontationRepository.java
│
├── dto/
│   ├── SignupRequest.java          # { username, password, fullName, avatar? }
│   ├── LoginRequest.java           # { username, password }
│   ├── AuthResponse.java           # { token, username, fullName, avatar }
│   ├── ProfileUpdateRequest.java   # { fullName?, avatar? }
│   └── UserProfileResponse.java    # { username, fullName, avatar, confrontations }
│
├── service/
│   ├── AuthService.java            # Signup, login, token generation
│   ├── UserService.java            # Profile CRUD
│   └── ConfrontationService.java   # Record & query H2H stats
│
├── security/
│   ├── SecurityConfig.java         # HTTP security filter chain
│   ├── JwtTokenProvider.java       # JWT creation & validation
│   └── JwtAuthenticationFilter.java # OncePerRequestFilter
│
└── controller/
    ├── AuthController.java         # POST /api/auth/signup, /api/auth/login
    └── UserController.java         # GET/PUT /api/user/profile, GET /api/user/confrontations
```

### 3.4 REST API Endpoints

| Method | Path | Auth | Request Body | Response | Description |
|--------|------|------|-------------|----------|-------------|
| `POST` | `/api/auth/signup` | No | `SignupRequest` | `AuthResponse` | Create account + return JWT |
| `POST` | `/api/auth/login` | No | `LoginRequest` | `AuthResponse` | Validate credentials + return JWT |
| `GET` | `/api/user/profile` | Yes | — | `UserProfileResponse` | Get current user's profile |
| `PUT` | `/api/user/profile` | Yes | `ProfileUpdateRequest` | `UserProfileResponse` | Update fullName/avatar |
| `GET` | `/api/user/confrontations` | Yes | — | `List<ConfrontationDTO>` | Get all H2H records for current user |

### 3.5 Security Configuration (`SecurityConfig.java`)

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/ws-gomoku/**").permitAll()     // WebSocket endpoint
                .requestMatchers("/topic/**").permitAll()          // STOMP broker
                // Protected endpoints
                .requestMatchers("/api/user/**").authenticated()
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

> [!IMPORTANT]
> **WebSocket and STOMP endpoints MUST remain public** — the existing game flow allows anonymous play. Auth is opt-in for profile/tracking features.

### 3.6 Confrontation Recording Logic (`GameController.java` Modification)

When a WIN event occurs in Multiplayer mode:

```java
// Inside the existing win-handling block in GameController:
private void recordConfrontation(GameRoom room, String winnerUsername) {
    if (room.getMode() != GameMode.MULTIPLE) return;
    
    List<String> players = new ArrayList<>(room.getPlayers());
    if (players.size() != 2) return;
    
    // Look up both players in DB — if either is not a registered user, skip
    Optional<User> user1 = userRepository.findByUsername(players.get(0));
    Optional<User> user2 = userRepository.findByUsername(players.get(1));
    
    if (user1.isEmpty() || user2.isEmpty()) return; // Anonymous match, don't track
    
    confrontationService.recordWin(user1.get().getId(), user2.get().getId(), 
        winnerUsername.equals(players.get(0)) ? user1.get().getId() : user2.get().getId());
}
```

---

## 4. Frontend Architecture

### 4.1 New Files

```
frontend/src/
├── types.ts                    # (MODIFY) Add auth-related interfaces
├── App.tsx                     # (MODIFY) Add auth state, conditional rendering
├── api/
│   └── authApi.ts              # Axios/fetch wrappers for auth & profile endpoints
├── context/
│   └── AuthContext.tsx          # React Context for auth state (user, token, login/logout)
├── components/
│   ├── Header.tsx              # (MODIFY) Username button + dropdown
│   ├── UserDropdown.tsx        # NEW: Dropdown menu (Profile, Settings, Logout)
│   ├── AuthModal.tsx           # NEW: Login/Signup modal (tabbed)
│   ├── ProfileModal.tsx        # NEW: Edit fullName & avatar
│   └── InformationScreen.tsx   # (MODIFY) Show login prompt + use auth username
```

### 4.2 New TypeScript Interfaces (`types.ts` Additions)

```typescript
// Auth
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

### 4.3 Auth Context (`AuthContext.tsx`)

```typescript
interface AuthState {
  user: AuthResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (req: LoginRequest) => Promise<void>;
  signup: (req: SignupRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { fullName?: string; avatar?: string }) => Promise<void>;
}
```

**Behavior:**
- On mount: check `localStorage` for existing JWT → validate → hydrate user state
- On login/signup: store JWT in `localStorage`, set user state
- On logout: clear `localStorage`, reset to anonymous mode (generate random name)
- Token sent as `Authorization: Bearer <token>` header on all `/api/user/**` requests

### 4.4 API Layer (`authApi.ts`)

```typescript
const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8888`;

export const authApi = {
  signup: (data: SignupRequest) => fetch(`${API_BASE}/api/auth/signup`, { ... }),
  login:  (data: LoginRequest)  => fetch(`${API_BASE}/api/auth/login`, { ... }),
  getProfile: (token: string)   => fetch(`${API_BASE}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } }),
  updateProfile: (token: string, data: ProfileUpdateRequest) => fetch(`${API_BASE}/api/user/profile`, { method: 'PUT', ... }),
  getConfrontations: (token: string) => fetch(`${API_BASE}/api/user/confrontations`, { ... }),
};
```

> [!NOTE]
> Uses the same backend host as the WebSocket connection. `VITE_API_URL` env var shares the same origin as `VITE_WS_URL`.

---

## 5. UI/UX Design Specification

### 5.1 Username Button & Dropdown (Header)

**Current State**: The header shows `"Hi, {username}"` as plain text.

**New Behavior**:
- Replace plain text with a **clickable button** displaying:
  - **Authenticated**: Avatar circle (or first-letter fallback) + Full Name (truncated)
  - **Anonymous**: `👤 {randomName}` (existing behavior, styled as button)
- Click toggles a **dropdown menu** anchored to the button

**Dropdown Items** (when authenticated):
| Icon | Label | Action |
|------|-------|--------|
| `User` | Profile | Opens `ProfileModal` |
| `Settings` | Settings | (Placeholder for future features) |
| `LogOut` | Logout | Calls `auth.logout()`, reverts to anonymous |

**Dropdown Items** (when anonymous):
| Icon | Label | Action |
|------|-------|--------|
| `LogIn` | Login / Sign Up | Opens `AuthModal` |

### 5.2 Auth Modal (`AuthModal.tsx`)

- **Glassmorphism modal** with backdrop blur (reuse `.glass-card` design token)
- **Two tabs**: Login | Sign Up (animated underline indicator)
- **Login Tab**:
  - Username input
  - Password input
  - Submit button with loading state
  - Error message display (wrong credentials)
- **Sign Up Tab**:
  - Username input (with live availability check — debounced)
  - Password input + confirm password
  - Full name input
  - Avatar upload (optional) — file picker with preview circle
  - Submit button with loading state
- **Animations**: `AnimatePresence` for tab switching, modal entry/exit via `framer-motion`

### 5.3 Profile Modal (`ProfileModal.tsx`)

- Displays current avatar (or letter fallback) in a large circle
- **Editable fields**: Full name, Avatar (upload new image)
- **Save** button → calls `PUT /api/user/profile`
- **Confrontation Records section** (below profile fields):
  - List of opponents with avatar, name, W/L record
  - Styled as compact cards with `glass-card` aesthetic

### 5.4 Visual Design Guidelines

- All modals use existing `.glass-card` + `backdrop-blur-2xl` system
- Input fields use `--color-input-bg` / `--color-input-focus` tokens
- Buttons follow existing blue (`--color-brand`) accent
- Avatar circles: `rounded-full overflow-hidden` with `object-cover`
- Dropdown: `absolute right-0 mt-2 w-56` with `glass-card`, `shadow-xl`, `z-[50]`
- Dropdown items: hover → `bg-white/10` transition
- Close on outside click (use `useRef` + `mousedown` event listener)
- Framer Motion for dropdown: `initial={{ opacity: 0, y: -10 }}` → `animate={{ opacity: 1, y: 0 }}`

---

## 6. Integration Points

### 6.1 WebSocket Identity Sync

When an authenticated user joins a game room:
- The `sender` field in the `JOIN` message uses the **authenticated username** (not a random name)
- This links the WebSocket session to the DB user, enabling confrontation tracking
- The `username` state in `App.tsx` is set from `auth.user.username` if authenticated

```typescript
// App.tsx (modified useEffect for username)
useEffect(() => {
  if (auth.isAuthenticated && auth.user) {
    setUsername(auth.user.username);
  } else {
    setUsername(generateRandomName());
  }
}, [auth.isAuthenticated]);
```

### 6.2 Win Event → Confrontation Recording

In `GameController.java`, after the existing win broadcast:

```
[Existing] → broadcastMessage(WIN, ...)
[NEW]      → recordConfrontation(room, winnerUsername)
```

The recording is **fire-and-forget** (async) — it must not block the WebSocket response.

### 6.3 Score Display Enhancement

- In-game scores remain unchanged (per-room, per-session as today)
- Confrontation records are a **separate, persistent** feature accessed via Profile
- They are NOT displayed during gameplay — only in the Profile modal

---

## 7. Execution Phases

### Phase 1: Backend Foundation
1. Add SQLite + JPA + Security + JWT dependencies to `pom.xml`
2. Configure `application.properties` for SQLite
3. Create `model/User.java` and `model/ConfrontationRecord.java` entities
4. Create `repository/` interfaces
5. Create `security/` package (JWT provider, filter, config)
6. Create `dto/` request/response classes
7. Create `service/AuthService.java` and `service/UserService.java`
8. Create `controller/AuthController.java` (signup + login endpoints)
9. Create `controller/UserController.java` (profile CRUD)
10. Test auth endpoints with curl/Postman

### Phase 2: Confrontation Service
1. Create `service/ConfrontationService.java`
2. Modify `GameController.java` to call `recordConfrontation()` on Multiplayer WIN
3. Add `GET /api/user/confrontations` endpoint
4. Test with two authenticated users completing a match

### Phase 3: Frontend Auth Infrastructure
1. Add `types.ts` auth interfaces
2. Create `api/authApi.ts`
3. Create `context/AuthContext.tsx`
4. Wrap `App` in `<AuthProvider>` in `main.tsx`
5. Modify `App.tsx` to use auth context for username

### Phase 4: Frontend UI Components
1. Create `AuthModal.tsx` (Login/Signup tabs)
2. Create `UserDropdown.tsx` (dropdown menu)
3. Create `ProfileModal.tsx` (edit profile + view confrontations)
4. Modify `Header.tsx` to replace name text with username button + dropdown
5. Modify `InformationScreen.tsx` to show login prompt for anonymous users

### Phase 5: Polish & Integration
1. Avatar upload with preview and validation
2. Responsive adjustments for auth modals on mobile
3. Error handling and loading states
4. Docker/deployment updates (SQLite file persistence via volume)

---

## 8. Docker Deployment Consideration

```yaml
# docker-compose.yml addition for SQLite persistence
services:
  backend:
    volumes:
      - gomoku-data:/app/data    # Mount SQLite DB file
    environment:
      SPRING_DATASOURCE_URL: jdbc:sqlite:/app/data/gomoku.db

volumes:
  gomoku-data:
```

> [!WARNING]
> SQLite file must be persisted via Docker volume. Without this, data is lost on container restart.

---

## 9. Key Constraints & Rules

1. **Backward Compatibility**: Anonymous play MUST continue to work exactly as before
2. **No Breaking Changes**: Existing WebSocket protocol remains unchanged; auth is additive
3. **Canonical Pair**: Confrontation records always store `user_a_id < user_b_id`
4. **Avatar Size**: Max 500KB Base64, validated on both sides
5. **Password**: Minimum 6 characters, BCrypt hashed (cost factor 10)
6. **Username**: 3-20 characters, alphanumeric + underscores only, case-insensitive unique
7. **JWT Expiry**: 24 hours, no refresh token (simplicity first)
8. **SQLite Thread Safety**: Use `spring.datasource.hikari.maximum-pool-size=1` (SQLite is single-writer)
9. **CORS**: Auth endpoints must allow same origins as WebSocket (`allowedOriginPatterns("*")`)

---

## 10. File Modification Summary

### Backend Files to CREATE
| File | Purpose |
|------|---------|
| `model/User.java` | JPA entity for users table |
| `model/ConfrontationRecord.java` | JPA entity for confrontation_records table |
| `repository/UserRepository.java` | Spring Data JPA interface |
| `repository/ConfrontationRepository.java` | Spring Data JPA interface |
| `dto/SignupRequest.java` | Signup request DTO |
| `dto/LoginRequest.java` | Login request DTO |
| `dto/AuthResponse.java` | Auth response DTO |
| `dto/ProfileUpdateRequest.java` | Profile update DTO |
| `dto/UserProfileResponse.java` | Profile response DTO |
| `service/AuthService.java` | Auth business logic |
| `service/UserService.java` | User profile business logic |
| `service/ConfrontationService.java` | H2H record business logic |
| `security/SecurityConfig.java` | Spring Security config |
| `security/JwtTokenProvider.java` | JWT utility class |
| `security/JwtAuthenticationFilter.java` | Request filter |
| `controller/AuthController.java` | Auth REST endpoints |
| `controller/UserController.java` | User REST endpoints |

### Backend Files to MODIFY
| File | Change |
|------|--------|
| `pom.xml` | Add 7 new dependencies |
| `application.properties` | Add SQLite + JWT config |
| `GameController.java` | Add `recordConfrontation()` call on WIN event |

### Frontend Files to CREATE
| File | Purpose |
|------|---------|
| `api/authApi.ts` | API client for auth/profile endpoints |
| `context/AuthContext.tsx` | Auth state management context |
| `components/AuthModal.tsx` | Login/Signup modal |
| `components/UserDropdown.tsx` | User menu dropdown |
| `components/ProfileModal.tsx` | Profile editor + confrontation list |

### Frontend Files to MODIFY
| File | Change |
|------|--------|
| `types.ts` | Add auth-related interfaces |
| `App.tsx` | Integrate AuthContext, conditional username |
| `main.tsx` | Wrap with AuthProvider |
| `Header.tsx` | Replace name text with dropdown button |
| `InformationScreen.tsx` | Add login prompt for anonymous users |
