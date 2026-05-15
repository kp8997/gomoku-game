```markdown
# Session Snapshot: PostgreSQL Migration [2026-05-16]

## 1. Architectural Decisions & Decisions
- **Persistence**: Fully migrated from SQLite to PostgreSQL. 
- **Infrastructure**: Added a dedicated `postgres` container to `docker-compose.yml` with a healthcheck-based dependency for the backend.
- **Port Mapping**: PostgreSQL is exposed on port `5434` (external) mapped to `5432` (internal) to resolve host conflicts or meet specific user requirements.
- **Security**: Configured a dedicated database user `admin-gomoku` with environment-variable-backed credentials.
- **Backend Sync**: Updated `pom.xml` to remove SQLite dependencies and add the official PostgreSQL driver. `application.properties` now uses `PostgreSQLDialect`.

## 2. Established Constraints
- **Lombok Avoidance**: Preserved manual getter/setter policy.
- **Port Constraint**: External PostgreSQL port must remain `5434`.
- **Database Consistency**: `spring.jpa.hibernate.ddl-auto` is set to `update` to maintain schema parity between SQLite and PostgreSQL during the transition.

## 3. Core Logic & Variable Mappings
- **DB_HOST**: `postgres` (internal Docker network).
- **DB_PORT**: `5432` (internal Docker network).
- **External Port**: `5434`.
- **User**: `admin-gomoku`.

## 4. Next Step Logic
- **Data Verification**: Ensure user accounts and confrontation records are correctly created in the new PostgreSQL environment.
- **Profile Customization**: Enable avatar upload functionality with Base64 encoding and 500KB cap.
- **Leaderboard**: (Future) Consider a global ranking based on win/loss records.
```
