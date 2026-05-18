package com.gomoku.game.repository;

import com.gomoku.game.model.UserEquippedEffect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserEquippedEffectRepository extends JpaRepository<UserEquippedEffect, Long> {
    Optional<UserEquippedEffect> findByUserId(Long userId);

    @Query("SELECT e FROM UserEquippedEffect e JOIN FETCH e.user WHERE e.user.username IN :usernames")
    List<UserEquippedEffect> findByUser_UsernameIn(@Param("usernames") Collection<String> usernames);
}
