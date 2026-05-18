package com.gomoku.game.repository;

import com.gomoku.game.model.UserEquippedEffect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserEquippedEffectRepository extends JpaRepository<UserEquippedEffect, Long> {
    Optional<UserEquippedEffect> findByUserId(Long userId);
    List<UserEquippedEffect> findByUser_UsernameIn(Collection<String> usernames);
}
