# Feature Plan #07 — Cascade Delete on Users Table

> **Plan ID**: `07`  
> **Status**: 🔲 Not Started  
> **Created**: 2026-05-21  
> **Last Updated**: 2026-05-21  
> **Scope**: Implement ON DELETE CASCADE for all foreign key constraints referencing the users table via Liquibase.  
> **Stack**: Java (Spring Boot), Liquibase, PostgreSQL, Docker  

---

## 1. Objective

Ensure database referential integrity by automatically cascading deletions of a user to all dependent child records. If a user is deleted, all records in:
- `user_achievements`
- `user_equipped_effects`
- `confrontation_records` (both user_a and user_b relations)

must be automatically purged by the database. This prevents foreign key violations, maintains compatibility with the existing database state, ensures zero-downtime logins, and ensures seamless execution in both production and development environments.

---

## 2. Database Schema

### Target Foreign Key Constraints

We drop all potential variations of existing foreign key constraints on the target tables (to account for differences between Hibernate-generated and Liquibase-generated names in dev vs production) and recreate them with the standard names and `ON DELETE CASCADE`.

| Table Name | Column Name | Recreated Constraint Name | Action on Delete |
|:---|:---|:---|:---|
| `confrontation_records` | `user_a_id` | `fk_confrontation_user_a` | `CASCADE` |
| `confrontation_records` | `user_b_id` | `fk_confrontation_user_b` | `CASCADE` |
| `user_achievements` | `user_id` | `fk_achievement_user` | `CASCADE` |
| `user_equipped_effects` | `user_id` | `fk_equipped_user` | `CASCADE` |

---

## 3. Backend Architecture

### 3.1 Liquibase Master Changelog Update

Register the new changelog file in the main master file `db.changelog-master.yml`.

### 3.2 New Migration Script

Create `db/changelog/changes/03-cascade-delete-users.yml`. This script uses PostgreSQL-native `DROP CONSTRAINT IF EXISTS` queries in a `<sql>` block, followed by Liquibase `<addForeignKeyConstraint>` declarations to guarantee environment-agnostic execution safety.

---

## 4. Frontend Architecture

*N/A — This is a backend schema migration only. No frontend TypeScript types, components, or API endpoints require updates.*

---

## 5. UI/UX Specification

*N/A — Database schema optimization only.*

---

## 6. Integration Points

*N/A — Database schema optimization only.*

---

## 7. Docker Deployment

The migration runs automatically when the container restarts during the next deployment. 
- No new environment variables are needed.
- No changes to Docker volume mounts or config maps.

---

## 8. Constraints & Rules

1. **Environment Compatibility**: Must support dropping both Hibernate auto-generated names (`fk_confrontation_records_user_a_id`) and Liquibase baseline names (`fk_confrontation_user_a`).
2. **Postgres Specific**: Use PostgreSQL-native dialect features (`IF EXISTS`) for safe cleanup blocks.
3. **Data Preservation**: Existing data in the tables must not be modified or corrupted.
4. **Login Flow**: Ensure that the `users` table layout is untouched, maintaining full login capability.

---

## 9. Execution Phases

### Phase 1 — Database Migration
1. **Step 1**: Register migration in `db.changelog-master.yml`.
2. **Step 2**: Create the changeset `03-cascade-delete-users.yml` with safe drops and recreations.
3. **Step 3**: Rebuild and start the containers using `docker-compose up --build -d`.

### Phase 2 — Verification
1. **Step 1**: Run query to verify all `delete_rule` entries show `CASCADE`.
2. **Step 2**: Perform test deletion on a temp user to verify downstream cascade works.

---

## 10. File Modification Summary

### Files to CREATE

| File Name | Path | Purpose |
|:---|:---|:---|
| `03-cascade-delete-users.yml` | `backend/src/main/resources/db/changelog/changes/03-cascade-delete-users.yml` | Liquibase script to update foreign keys |

### Files to MODIFY

| File Name | Path | Purpose |
|:---|:---|:---|
| `db.changelog-master.yml` | `backend/src/main/resources/db/changelog/db.changelog-master.yml` | Reference the new migration script |
