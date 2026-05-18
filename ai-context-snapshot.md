```markdown
# Session Snapshot: Match History & Liquibase Migration [2026-05-18]

## 1. Architectural Decisions & Changes
- **Database Migration Tool**: Introduced **Liquibase** as the single source of truth for database schema evolution, moving away from Hibernate `ddl-auto=update` to `validate`.
- **Match Tracking Redesign**: Modified the existing `confrontation_records` table rather than creating a new `match_records` table. This elegant design keeps everything additive and avoids schema bloat.
- **Anonymous Opponent Support**: Dropped the `NOT NULL` constraint on `user_b_id` in `confrontation_records`. An authenticated user playing against an anonymous opponent is now recorded with `user_a_id = authUser.id` and `user_b_id = NULL`.
- **Data Integrity**: Implemented a **PostgreSQL partial unique index** (`CREATE UNIQUE INDEX ... WHERE user_b_id IS NULL`) to ensure that each authenticated user has at most one cumulative anonymous stats tracking row. The JPA `@UniqueConstraint` was removed to prevent conflicts with this partial index.

## 2. Established Constraints
- **Lombok Avoidance**: Kept the codebase Lombok-free. Manually defined standard getters, setters, and builders for `UserStatsDTO`.
- **Schema Validation**: Hibernate is strictly configured to `validate`. Liquibase owns the schema.
- **Null Safety in JPQL**: Any JPQL query touching `userB` must explicitly handle `IS NULL` or use `LEFT JOIN FETCH` since `userB` is now fully nullable.

## 3. Core Logic & Variable Mappings
- **Win Rate Calculation**: `(Total Wins / (Total Wins + Total Losses)) * 100`. Available via `GET /api/user/stats`.
- **Auth vs Auth**: Tracks H2H record (`user_a_wins`, `user_b_wins`).
- **Auth vs Anon**: Tracks cumulative record against all anonymous players under a single row for the auth user.
- **Anon vs Anon**: Skipped entirely (no persistent identity).

## 4. Next Step Logic
- **Frontend Integration**: Consume the new `GET /api/user/stats` endpoint to display total wins, losses, matches, and win rate on the `ProfileModal` or a dedicated Leaderboard.
- **Data Display**: Ensure the UI handles "Anonymous Players" elegantly when listing match history.
```
