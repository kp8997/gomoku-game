package com.gomoku.game.repository;

import com.gomoku.game.model.ConfrontationRecord;
import com.gomoku.game.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConfrontationRepository extends JpaRepository<ConfrontationRecord, Long> {
    
    @Query("SELECT c FROM ConfrontationRecord c WHERE (c.userA.id = :u1 AND c.userB.id = :u2) OR (c.userA.id = :u2 AND c.userB.id = :u1)")
    Optional<ConfrontationRecord> findBetweenUsers(@Param("u1") Long userId1, @Param("u2") Long userId2);

    @Query("SELECT c FROM ConfrontationRecord c WHERE c.userA.id = :userId OR c.userB.id = :userId")
    List<ConfrontationRecord> findAllByUserId(@Param("userId") Long userId);
}
