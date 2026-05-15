```markdown
# Session Snapshot: Authentication & Security Hardening [2026-05-16]

## 1. Architectural Decisions & Decisions
- **Persistence**: Switched from stateless anonymous sessions to persistent SQLite-backed user accounts. Named volume `gomoku-db` ensures data survives container rebuilds.
- **Security**: Implemented JWT-based stateless authentication. All `/api/user/**` endpoints require a Bearer token.
- **Validation Sync**: Rigid synchronization of regex-based password validation (min 8 chars, 1+ letter, 1+ number, 1+ special) and username length (min 3 chars) across React (`AuthModal.tsx`) and Spring Boot (`AuthService.java`).
- **UI Identity Logic**:
  - Anonymous players on `InformationScreen`: Identity section hidden.
  - Anonymous players in-game: Static "Hi, [Name]" display (non-interactive).
  - Authenticated players: "Hi, [FullName]" button with `UserDropdown` and click-outside closure.
- **Header**: Refactored to `sticky top-0` with `z-50` to maintain global controls (timer, theme, exit) during vertical scroll on mobile/small viewports.

## 2. Established Constraints
- **Lombok Avoidance**: Explicit manual getters/setters/builders in Java to prevent JDK 21 reflection/build conflicts.
- **Type Safety**: Enforced `import type` in TypeScript to comply with `verbatimModuleSyntax`.
- **Stateless Backend**: Game state remains in memory (GameRoom); user records/H2H stats persisted to SQLite.
- **Backward Compatibility**: Anonymous play must remain fully functional and unhindered by the auth system.

## 3. Core Logic & Variable Mappings
- **Password Regex**: `/[!@#$%^&*(),.?":{}|<>]/.test(password)` (special character requirement).
- **Sticky Layout**: Header uses `sticky top-0`, content wrapper uses `flex-1`.
- **Dropdown State**: `isDropdownOpen` managed in `Header.tsx`, scoped by `dropdownRef` for click-outside detection.

## 4. Next Step Logic
- **Profile Customization**: Enable avatar upload functionality with Base64 encoding and 500KB cap.
- **H2H Records**: Populate the `ProfileModal` with real-time head-to-head statistics fetched from the backend.
- **Leaderboard**: (Future) Consider a global ranking based on win/loss records.
```
