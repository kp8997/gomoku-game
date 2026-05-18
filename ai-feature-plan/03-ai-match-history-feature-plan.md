# Feature Plan 03 — Match History & Liquibase Migration

> **Plan ID**: `03`  
> **Status**: 🔄 In Progress  
> **Created**: 2026-05-19  
> **Last Updated**: 2026-05-19  
> **Scope**: Introduce Liquibase for DB migration, modify `confrontation_records` to support anonymous matches, enable win rate calculation  
> **Stack**: Spring Boot 3.2.5, PostgreSQL 16, Liquibase, JPA/Hibernate

## 1. Objective

Modify the existing database schema and application logic to support tracking game results in two distinct multiplayer scenarios:
1. **Authenticated vs Authenticated**: Track wins/losses head-to-head (existing behavior, preserved).
2. **Authenticated vs Anonymous**: Track cumulative wins/losses of the authenticated user against *any* anonymous player.

To achieve this, we will:
- Introduce **Liquibase** to manage database schema migrations cleanly.
- Modify the `confrontation_records` table to make the `user_b_id` column **nullable** (`NULL` = anonymous opponent).
- Enforce a **PostgreSQL partial unique index** so each authenticated user has at most one anonymous stats row.
- Fix existing code that would **NPE** when `userB` is null.
- Expose a new `GET /api/user/stats` REST endpoint to retrieve overall win/loss stats and win rate.

## 2. Database Schema

### 2.1 Schema Changes

1. **Alter `confrontation_records`**: Drop `NOT NULL` on `user_b_id`.
2. **Add Partial Unique Index**: `CREATE UNIQUE INDEX idx_confrontation_user_a_anon ON confrontation_records (user_a_id) WHERE user_b_id IS NULL` — prevents duplicate anonymous rows per user.
3. **Remove JPA `@UniqueConstraint`**: The existing `@UniqueConstraint(columnNames = {"user_a_id", "user_b_id"})` on the entity must be removed. In PostgreSQL, a standard `UNIQUE(a, b)` treats two NULLs as distinct (allowing multiple anonymous rows), which would conflict with our partial index intent. We rely solely on the Liquibase-managed constraints.

### 2.2 Data Model After Migration

| Row Type | `user_a_id` | `user_b_id` | `user_a_wins` | `user_b_wins` | Meaning |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth vs Auth** | `min(id1, id2)` | `max(id1, id2)` | Wins for user_a | Wins for user_b | H2H record between two registered users |
| **Auth vs Anon** | `authUser.id` | `NULL` | Auth user's wins vs anonymous | Auth user's losses vs anonymous | Cumulative stats against all anonymous opponents |

### 2.3 Win Rate Derivation

For user `:userId`:
- **Total Wins** = SUM(`user_a_wins` where `user_a_id = :userId`) + SUM(`user_b_wins` where `user_b_id = :userId`)
- **Total Losses** = SUM(`user_b_wins` where `user_a_id = :userId`) + SUM(`user_a_wins` where `user_b_id = :userId`)
- **Win Rate** = `totalWins / (totalWins + totalLosses) * 100`

## 3. Liquibase Changelog Files

### 3.1 Directory Structure

```
backend/src/main/resources/
└── db/
    └── changelog/
        ├── db.changelog-master.xml
        └── changes/
            └── 01-init-schema.xml
```

### 3.2 `db.changelog-master.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
        xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.20.xsd">

    <include file="db/changelog/changes/01-init-schema.xml"/>

</databaseChangeLog>
```

### 3.3 `01-init-schema.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
        xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.20.xsd">

    <!-- ChangeSet 1: Baseline — create tables only if they don't exist yet -->
    <changeSet id="1-baseline-schema" author="gomoku">
        <preConditions onFail="MARK_RAN">
            <not><tableExists tableName="users"/></not>
        </preConditions>

        <createTable tableName="users">
            <column name="id" type="BIGSERIAL"><constraints primaryKey="true" nullable="false"/></column>
            <column name="username" type="VARCHAR(255)"><constraints unique="true" nullable="false"/></column>
            <column name="password" type="VARCHAR(255)"><constraints nullable="false"/></column>
            <column name="full_name" type="VARCHAR(255)"><constraints nullable="false"/></column>
            <column name="avatar" type="TEXT"/>
            <column name="created_at" type="TIMESTAMP(6)"><constraints nullable="false"/></column>
            <column name="updated_at" type="TIMESTAMP(6)"><constraints nullable="false"/></column>
        </createTable>

        <createTable tableName="confrontation_records">
            <column name="id" type="BIGSERIAL"><constraints primaryKey="true" nullable="false"/></column>
            <column name="user_a_id" type="BIGINT"><constraints nullable="false" foreignKeyName="fk_confrontation_user_a" referencedTableName="users" referencedColumnNames="id"/></column>
            <column name="user_b_id" type="BIGINT"><constraints nullable="false" foreignKeyName="fk_confrontation_user_b" referencedTableName="users" referencedColumnNames="id"/></column>
            <column name="user_a_wins" type="INTEGER" defaultValueNumeric="0"><constraints nullable="false"/></column>
            <column name="user_b_wins" type="INTEGER" defaultValueNumeric="0"><constraints nullable="false"/></column>
            <column name="updated_at" type="TIMESTAMP(6)"><constraints nullable="false"/></column>
        </createTable>

        <addUniqueConstraint tableName="confrontation_records" columnNames="user_a_id,user_b_id" constraintName="uq_confrontation_users"/>
    </changeSet>

    <!-- ChangeSet 2: Allow anonymous matchups (user_b_id nullable) -->
    <changeSet id="2-allow-anonymous-confrontations" author="gomoku">
        <dropNotNullConstraint tableName="confrontation_records" columnName="user_b_id" columnDataType="BIGINT"/>

        <!-- Partial unique index: only one anonymous row per user -->
        <sql dbms="postgresql">
            CREATE UNIQUE INDEX IF NOT EXISTS idx_confrontation_user_a_anon ON confrontation_records (user_a_id) WHERE user_b_id IS NULL;
        </sql>
    </changeSet>

</databaseChangeLog>
```

**Key design decisions:**
- Changeset 1 uses `<preConditions onFail="MARK_RAN">` to skip if tables already exist (safe for existing databases).
- Changeset 2 uses raw `<sql>` directly for the partial index — no redundant `<createIndex>` + drop cycle.

## 4. Backend Architecture

### 4.1 Dependencies (`pom.xml`)

Add:
```xml
<!-- Database Migration -->
<dependency>
    <groupId>org.liquibase</groupId>
    <artifactId>liquibase-core</artifactId>
</dependency>
```

### 4.2 Configuration (`application.properties`)

```properties
# Liquibase Configuration
spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.xml
spring.liquibase.enabled=true

# CRITICAL: Change from 'update' to 'validate'
# Liquibase now owns schema creation/migration. Hibernate only validates.
spring.jpa.hibernate.ddl-auto=validate
```

> **Why `validate` not `update`?** With both Liquibase and `ddl-auto=update` active, Hibernate would attempt to alter the schema at startup independently of Liquibase, causing conflicts (e.g., re-adding constraints Liquibase removed). `validate` ensures Hibernate only checks that entities match the DB schema without modifying it.

### 4.3 JPA Entity: `ConfrontationRecord.java`

Two changes:
1. **Remove `@UniqueConstraint`** from `@Table` — Liquibase owns the constraints now.
2. **Change `user_b_id` to `nullable = true`**.

```diff
 @Entity
-@Table(name = "confrontation_records", 
-       uniqueConstraints = {@UniqueConstraint(columnNames = {"user_a_id", "user_b_id"})})
+@Table(name = "confrontation_records")
 public class ConfrontationRecord {

     @ManyToOne(fetch = FetchType.LAZY)
-    @JoinColumn(name = "user_b_id", nullable = false)
+    @JoinColumn(name = "user_b_id", nullable = true)
     private User userB;
```

### 4.4 Repository: `ConfrontationRepository.java`

**Problem**: The existing `findAllByUserId` query (`c.userB.id = :userId`) does an implicit inner join on `userB`. When `userB IS NULL` (anonymous row), the row is excluded even if `userA.id` matches.

**Fix**: Use `LEFT JOIN FETCH` and handle null-safe comparison:

```java
@Query("SELECT c FROM ConfrontationRecord c LEFT JOIN FETCH c.userB WHERE c.userA.id = :userId OR (c.userB IS NOT NULL AND c.userB.id = :userId)")
List<ConfrontationRecord> findAllByUserId(@Param("userId") Long userId);

@Query("SELECT c FROM ConfrontationRecord c WHERE c.userA.id = :userId AND c.userB IS NULL")
Optional<ConfrontationRecord> findAnonymousRecordForUser(@Param("userId") Long userId);
```

### 4.5 Service: `ConfrontationService.java`

Full replacement of `recordWin()` + new `getUserStats()` + fix `getConfrontationsForUser()` for null-safety:

```java
@Transactional
public void recordWin(Long userId1, Long userId2, Long winnerId) {
    if (userId1 != null && userId2 != null) {
        // Case 1: Both authenticated — H2H record
        Long idA = Math.min(userId1, userId2);
        Long idB = Math.max(userId1, userId2);

        ConfrontationRecord record = confrontationRepository.findBetweenUsers(idA, idB)
                .orElseGet(() -> {
                    User userA = userRepository.findById(idA).orElseThrow();
                    User userB = userRepository.findById(idB).orElseThrow();
                    return ConfrontationRecord.builder()
                            .userA(userA).userB(userB)
                            .userAWins(0).userBWins(0).build();
                });

        if (winnerId.equals(idA)) {
            record.setUserAWins(record.getUserAWins() + 1);
        } else if (winnerId.equals(idB)) {
            record.setUserBWins(record.getUserBWins() + 1);
        }
        confrontationRepository.save(record);
    } else {
        // Case 2: Auth vs Anonymous
        Long authUserId = (userId1 != null) ? userId1 : userId2;

        ConfrontationRecord record = confrontationRepository.findAnonymousRecordForUser(authUserId)
                .orElseGet(() -> {
                    User userA = userRepository.findById(authUserId).orElseThrow();
                    return ConfrontationRecord.builder()
                            .userA(userA).userB(null)
                            .userAWins(0).userBWins(0).build();
                });

        if (winnerId != null && winnerId.equals(authUserId)) {
            record.setUserAWins(record.getUserAWins() + 1);
        } else {
            record.setUserBWins(record.getUserBWins() + 1);
        }
        confrontationRepository.save(record);
    }
}

public UserStatsDTO getUserStats(Long userId) {
    List<ConfrontationRecord> records = confrontationRepository.findAllByUserId(userId);

    int totalWins = 0, totalLosses = 0;

    for (ConfrontationRecord record : records) {
        if (record.getUserA().getId().equals(userId)) {
            totalWins += record.getUserAWins();
            totalLosses += record.getUserBWins();
        } else if (record.getUserB() != null && record.getUserB().getId().equals(userId)) {
            totalWins += record.getUserBWins();
            totalLosses += record.getUserAWins();
        }
    }

    int totalMatches = totalWins + totalLosses;
    double winRate = (totalMatches > 0)
        ? Math.round((double) totalWins / totalMatches * 1000.0) / 10.0
        : 0.0;

    return new UserStatsDTO(totalWins, totalLosses, totalMatches, winRate);
}
```

**Fix `getConfrontationsForUser()`** — handle anonymous row where `userB` is null:

```java
public List<ConfrontationDTO> getConfrontationsForUser(Long userId) {
    List<ConfrontationRecord> records = confrontationRepository.findAllByUserId(userId);

    return records.stream().map(record -> {
        int wins, losses;
        String opponentUsername, opponentFullName, opponentAvatar;

        if (record.getUserA().getId().equals(userId)) {
            wins = record.getUserAWins();
            losses = record.getUserBWins();
            if (record.getUserB() != null) {
                opponentUsername = record.getUserB().getUsername();
                opponentFullName = record.getUserB().getFullName();
                opponentAvatar = record.getUserB().getAvatar();
            } else {
                opponentUsername = "anonymous";
                opponentFullName = "Anonymous Players";
                opponentAvatar = null;
            }
        } else {
            opponentUsername = record.getUserA().getUsername();
            opponentFullName = record.getUserA().getFullName();
            opponentAvatar = record.getUserA().getAvatar();
            wins = record.getUserBWins();
            losses = record.getUserAWins();
        }

        return ConfrontationDTO.builder()
                .opponentUsername(opponentUsername)
                .opponentFullName(opponentFullName)
                .opponentAvatar(opponentAvatar)
                .wins(wins)
                .losses(losses)
                .build();
    }).collect(Collectors.toList());
}
```

### 4.6 New DTO: `UserStatsDTO.java`

```java
package com.gomoku.game.dto;

public class UserStatsDTO {
    private int totalWins;
    private int totalLosses;
    private int totalMatches;
    private double winRate;

    public UserStatsDTO() {}
    public UserStatsDTO(int totalWins, int totalLosses, int totalMatches, double winRate) {
        this.totalWins = totalWins;
        this.totalLosses = totalLosses;
        this.totalMatches = totalMatches;
        this.winRate = winRate;
    }

    // Getters/setters (no Lombok)
    public int getTotalWins() { return totalWins; }
    public void setTotalWins(int totalWins) { this.totalWins = totalWins; }
    public int getTotalLosses() { return totalLosses; }
    public void setTotalLosses(int totalLosses) { this.totalLosses = totalLosses; }
    public int getTotalMatches() { return totalMatches; }
    public void setTotalMatches(int totalMatches) { this.totalMatches = totalMatches; }
    public double getWinRate() { return winRate; }
    public void setWinRate(double winRate) { this.winRate = winRate; }
}
```

### 4.7 GameController: `recordConfrontation()` Update

```java
private void recordConfrontation(GameRoom room, String winnerUsername) {
    if (room.getMode() != GameMessage.GameMode.MULTIPLE) return;

    List<String> players = new ArrayList<>(room.getPlayers());
    if (players.size() != 2) return;

    var user1Opt = userRepository.findByUsername(players.get(0));
    var user2Opt = userRepository.findByUsername(players.get(1));

    if (user1Opt.isPresent() && user2Opt.isPresent()) {
        // Case 1: Both authenticated
        var user1 = user1Opt.get();
        var user2 = user2Opt.get();
        Long winnerId = winnerUsername.equals(user1.getUsername()) ? user1.getId() : user2.getId();
        confrontationService.recordWin(user1.getId(), user2.getId(), winnerId);
    } else if (user1Opt.isPresent() || user2Opt.isPresent()) {
        // Case 2: One authenticated, one anonymous
        var authUser = user1Opt.isPresent() ? user1Opt.get() : user2Opt.get();
        Long winnerId = winnerUsername.equals(authUser.getUsername()) ? authUser.getId() : null;
        confrontationService.recordWin(authUser.getId(), null, winnerId);
    }
    // Case 3: Both anonymous → skip (no persistent identity)
}
```

### 4.8 UserController: New Endpoint

Using the same `Authentication` pattern as existing endpoints for consistency:

```java
@GetMapping("/stats")
public ResponseEntity<UserStatsDTO> getUserStats(Authentication authentication) {
    String username = authentication.getName();
    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
    UserStatsDTO stats = confrontationService.getUserStats(user.getId());
    return ResponseEntity.ok(stats);
}
```

**Required new imports/autowire**: `ConfrontationService`, `UserRepository`, `UserStatsDTO`, `User`.

## 5. Constraints & Rules

1. **Liquibase owns schema** — `ddl-auto` must be `validate`, not `update`.
2. **No `@UniqueConstraint` on JPA entity** — Liquibase manages constraints; JPA only validates.
3. **Null-safe JPQL** — All queries touching `userB` must handle `IS NULL` correctly.
4. **Null-safe Java** — `getConfrontationsForUser()` must check `userB != null` before dereferencing.
5. **Partial unique index** — PostgreSQL-specific `<sql>` block in Liquibase, not portable.
6. **No Lombok** — manual getters/setters/builders.
7. **Win rate safety** — handle division by zero (0 matches = 0.0% rate).
8. **Single player excluded** — `recordConfrontation` only runs for `MULTIPLE` mode.

## 6. Execution Phases

### Phase 1: Dependencies & Configuration
1. Add `liquibase-core` to `pom.xml`.
2. Add `spring.liquibase.*` properties to `application.properties`.
3. Change `spring.jpa.hibernate.ddl-auto` from `update` to `validate`.

### Phase 2: Liquibase Changelog Files
1. Create `db/changelog/db.changelog-master.xml`.
2. Create `db/changelog/changes/01-init-schema.xml` (baseline + anonymous migration).

### Phase 3: JPA Entity & Repository
1. Remove `@UniqueConstraint` from `ConfrontationRecord.java`.
2. Change `user_b_id` `@JoinColumn` to `nullable = true`.
3. Add `findAnonymousRecordForUser` query to `ConfrontationRepository.java`.
4. Fix `findAllByUserId` query for null-safe `userB` handling.

### Phase 4: Service & DTO
1. Create `UserStatsDTO.java`.
2. Rewrite `recordWin()` in `ConfrontationService.java` for dual-case support.
3. Add `getUserStats()` to `ConfrontationService.java`.
4. Fix `getConfrontationsForUser()` to handle null `userB` (prevent NPE).

### Phase 5: Controller & API Endpoint
1. Rewrite `recordConfrontation()` in `GameController.java`.
2. Add `GET /api/user/stats` endpoint to `UserController.java`.

### Phase 6: Verification
1. Run application and verify Liquibase migrations execute cleanly.
2. Verify `user_b_id` is nullable and partial unique index exists.
3. Test both Auth vs Auth and Auth vs Anon match recording.

## 7. File Modification Summary

### Files to CREATE

| File | Purpose |
| :--- | :--- |
| `backend/src/main/resources/db/changelog/db.changelog-master.xml` | Liquibase master changelog |
| `backend/src/main/resources/db/changelog/changes/01-init-schema.xml` | Baseline + anonymous migration |
| `backend/src/main/java/com/gomoku/game/dto/UserStatsDTO.java` | Win/loss/rate response DTO |

### Files to MODIFY

| File | Change |
| :--- | :--- |
| `backend/pom.xml` | Add `liquibase-core` dependency |
| `backend/src/main/resources/application.properties` | Add Liquibase config, change `ddl-auto` to `validate` |
| `backend/src/main/java/com/gomoku/game/model/ConfrontationRecord.java` | Remove `@UniqueConstraint`, `user_b_id` nullable |
| `backend/src/main/java/com/gomoku/game/repository/ConfrontationRepository.java` | Add `findAnonymousRecordForUser`, fix `findAllByUserId` |
| `backend/src/main/java/com/gomoku/game/service/ConfrontationService.java` | Rewrite `recordWin()`, add `getUserStats()`, fix `getConfrontationsForUser()` |
| `backend/src/main/java/com/gomoku/game/GameController.java` | Rewrite `recordConfrontation()` |
| `backend/src/main/java/com/gomoku/game/controller/UserController.java` | Add `/stats` endpoint |
| `ai-state-persistent.md` | Record migration |
| `ai-context-snapshot.md` | Update session |
