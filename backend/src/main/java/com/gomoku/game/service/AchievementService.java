package com.gomoku.game.service;

import com.gomoku.game.dto.AchievementDTO;
import com.gomoku.game.dto.AchievementResponse;
import com.gomoku.game.dto.UserStatsDTO;
import com.gomoku.game.model.User;
import com.gomoku.game.model.UserAchievement;
import com.gomoku.game.model.UserEquippedEffect;
import com.gomoku.game.model.SymbolEffect;
import com.gomoku.game.model.SymbolSkin;
import com.gomoku.game.repository.UserAchievementRepository;
import com.gomoku.game.repository.UserEquippedEffectRepository;
import com.gomoku.game.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AchievementService {

    @Autowired
    private UserAchievementRepository achievementRepository;

    @Autowired
    private UserEquippedEffectRepository equippedEffectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConfrontationService confrontationService;

    private static final int[] WIN_RATE_THRESHOLDS = {50, 55, 60, 65, 75, 80, 85, 90, 95};
    private static final int[] MATCH_MILESTONES = {10, 20, 50, 100, 150, 200, 250, 300, 400, 500, 750, 1000};
    private static final int[] WIN_MILESTONES = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190};

    @Transactional
    public AchievementResponse getAchievements(Long userId) {
        UserStatsDTO stats = confrontationService.getUserStats(userId);
        
        // Ensure user actually has badges synced
        syncBadges(userId, stats);

        List<UserAchievement> unlockedAchievements = achievementRepository.findByUserId(userId);
        Set<String> unlockedKeys = unlockedAchievements.stream()
                .map(UserAchievement::getAchievementKey)
                .collect(Collectors.toSet());

        java.util.Optional<UserEquippedEffect> equippedOpt = equippedEffectRepository.findByUserId(userId);
        String equippedEffect = equippedOpt.map(UserEquippedEffect::getEffectKey).orElse(null);
        String equippedSkin = equippedOpt.map(UserEquippedEffect::getSymbolSkin).orElse(null);

        return buildResponse(unlockedKeys, unlockedAchievements, equippedEffect, stats.getTotalWins(), equippedSkin);
    }

    @Transactional
    public void equipEffect(Long userId, String effectKey) {
        if (effectKey == null) {
            unequipEffect(userId);
            return;
        }

        // Verify the user has unlocked the effect
        List<UserAchievement> unlocked = achievementRepository.findByUserId(userId);
        Set<String> unlockedKeys = unlocked.stream().map(UserAchievement::getAchievementKey).collect(Collectors.toSet());
        
        if (!isEffectUnlocked(effectKey, unlockedKeys)) {
            throw new RuntimeException("Effect is not unlocked");
        }

        UserEquippedEffect effect = equippedEffectRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElseThrow();
                    return new UserEquippedEffect(user, effectKey);
                });
        
        effect.setEffectKey(effectKey);
        effect.setSymbolSkin(null);
        equippedEffectRepository.save(effect);
    }

    @Transactional
    public void unequipEffect(Long userId) {
        equippedEffectRepository.findByUserId(userId)
                .ifPresent(equippedEffectRepository::delete);
    }

    @Transactional
    public void equipSkin(Long userId, String skinKey) {
        if (skinKey == null) {
            unequipSkin(userId);
            return;
        }

        // Verify the user has unlocked the skin
        try {
            SymbolSkin skin = SymbolSkin.valueOf(skinKey);
            UserStatsDTO stats = confrontationService.getUserStats(userId);
            List<UserAchievement> unlocked = achievementRepository.findByUserId(userId);
            Set<String> unlockedKeys = unlocked.stream().map(UserAchievement::getAchievementKey).collect(Collectors.toSet());
            
            boolean isUnlocked = stats.getTotalWins() >= skin.getRequiredWins() || 
                                 unlockedKeys.stream().anyMatch(k -> k.startsWith("WINS_") && Integer.parseInt(k.split("_")[1]) >= skin.getRequiredWins());
                                 
            if (!isUnlocked) {
                throw new RuntimeException("Skin is not unlocked");
            }
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid skin key: " + skinKey);
        }

        UserEquippedEffect equipped = equippedEffectRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElseThrow();
                    UserEquippedEffect newEquipped = new UserEquippedEffect(user, "NONE");
                    return newEquipped;
                });
        
        equipped.setSymbolSkin(skinKey);
        equipped.setEffectKey("NONE");
        equippedEffectRepository.save(equipped);
    }

    @Transactional
    public void unequipSkin(Long userId) {
        equippedEffectRepository.findByUserId(userId)
                .ifPresent(equipped -> {
                    equipped.setSymbolSkin(null);
                    equippedEffectRepository.save(equipped);
                });
    }

    private void syncBadges(Long userId, UserStatsDTO stats) {
        double wr = stats.getWinRate();
        for (int t : WIN_RATE_THRESHOLDS) {
            if (wr >= t && stats.getTotalMatches() >= 10) { // Require at least 10 matches for win rate badges to make sense
                tryUnlock(userId, "WIN_RATE_" + t);
            }
        }
        for (int m : MATCH_MILESTONES) {
            if (stats.getTotalMatches() >= m) tryUnlock(userId, "MATCHES_" + m);
        }
        for (int w : WIN_MILESTONES) {
            if (stats.getTotalWins() >= w) tryUnlock(userId, "WINS_" + w);
        }
    }

    private void tryUnlock(Long userId, String key) {
        if (!achievementRepository.existsByUserIdAndAchievementKey(userId, key)) {
            User user = userRepository.findById(userId).orElseThrow();
            achievementRepository.save(new UserAchievement(user, key));
        }
    }

    private boolean isEffectUnlocked(String effectKey, Set<String> unlockedKeys) {
        try {
            SymbolEffect effect = SymbolEffect.valueOf(effectKey);
            return unlockedKeys.contains(effect.getRequiredAchievementKey()) || 
                   unlockedKeys.stream().anyMatch(k -> k.startsWith("WINS_") && Integer.parseInt(k.split("_")[1]) >= effect.getRequiredWins());
        } catch (Exception e) {
            return false;
        }
    }

    private AchievementResponse buildResponse(Set<String> unlockedKeys, List<UserAchievement> unlockedAchievements, String equippedEffect, int totalWins, String equippedSkin) {
        List<AchievementDTO> winRateBadges = new ArrayList<>();
        List<AchievementDTO> matchBadges = new ArrayList<>();
        List<AchievementDTO> winBadges = new ArrayList<>();
        List<AchievementResponse.EffectDTO> effects = new ArrayList<>();
        List<AchievementResponse.SkinDTO> skins = new ArrayList<>();

        for (int t : WIN_RATE_THRESHOLDS) {
            String key = "WIN_RATE_" + t;
            winRateBadges.add(new AchievementDTO(key, "WIN_RATE", t + "% Win Rate", "Achieve a " + t + "% win rate (min 10 matches)", unlockedKeys.contains(key), getUnlockedAt(key, unlockedAchievements), t));
        }

        for (int m : MATCH_MILESTONES) {
            String key = "MATCHES_" + m;
            matchBadges.add(new AchievementDTO(key, "MATCHES", m + " Matches", "Play " + m + " matches", unlockedKeys.contains(key), getUnlockedAt(key, unlockedAchievements), m));
        }

        for (int w : WIN_MILESTONES) {
            String wKey = "WINS_" + w;
            winBadges.add(new AchievementDTO(wKey, "WINS", w + " Wins", "Win " + w + " matches", unlockedKeys.contains(wKey), getUnlockedAt(wKey, unlockedAchievements), w));
        }

        for (SymbolEffect effect : SymbolEffect.values()) {
            effects.add(new AchievementResponse.EffectDTO(effect.name(), isEffectUnlocked(effect.name(), unlockedKeys), effect.getRequirementLabel()));
        }

        for (SymbolSkin skin : SymbolSkin.values()) {
            boolean isUnlocked = totalWins >= skin.getRequiredWins() || 
                                 unlockedKeys.stream().anyMatch(k -> k.startsWith("WINS_") && Integer.parseInt(k.split("_")[1]) >= skin.getRequiredWins());
            skins.add(new AchievementResponse.SkinDTO(skin.name(), skin.getDisplayName(), isUnlocked, skin.getRequirementLabel()));
        }

        return new AchievementResponse(winRateBadges, matchBadges, winBadges, effects, equippedEffect, skins, equippedSkin);
    }

    private String getUnlockedAt(String key, List<UserAchievement> unlockedAchievements) {
        return unlockedAchievements.stream()
                .filter(a -> a.getAchievementKey().equals(key))
                .findFirst()
                .map(a -> a.getUnlockedAt() != null ? a.getUnlockedAt().toString() : null)
                .orElse(null);
    }
}
