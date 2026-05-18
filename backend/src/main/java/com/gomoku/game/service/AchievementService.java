package com.gomoku.game.service;

import com.gomoku.game.dto.AchievementDTO;
import com.gomoku.game.dto.AchievementResponse;
import com.gomoku.game.dto.UserStatsDTO;
import com.gomoku.game.model.User;
import com.gomoku.game.model.UserAchievement;
import com.gomoku.game.model.UserEquippedEffect;
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

    @Transactional
    public AchievementResponse getAchievements(Long userId) {
        UserStatsDTO stats = confrontationService.getUserStats(userId);
        
        // Ensure user actually has badges synced
        syncBadges(userId, stats);

        List<UserAchievement> unlockedAchievements = achievementRepository.findByUserId(userId);
        Set<String> unlockedKeys = unlockedAchievements.stream()
                .map(UserAchievement::getAchievementKey)
                .collect(Collectors.toSet());

        String equippedEffect = equippedEffectRepository.findByUserId(userId)
                .map(UserEquippedEffect::getEffectKey)
                .orElse(null);

        return buildResponse(unlockedKeys, unlockedAchievements, equippedEffect);
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
        equippedEffectRepository.save(effect);
    }

    @Transactional
    public void unequipEffect(Long userId) {
        equippedEffectRepository.findByUserId(userId)
                .ifPresent(equippedEffectRepository::delete);
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
        for (int w : MATCH_MILESTONES) {
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
        return switch (effectKey) {
            case "FIRE_PHOENIX" -> unlockedKeys.contains("WINS_50") || unlockedKeys.stream().anyMatch(k -> k.startsWith("WINS_") && Integer.parseInt(k.split("_")[1]) >= 50);
            case "DRAGON_LIGHTNING" -> unlockedKeys.contains("WINS_100") || unlockedKeys.stream().anyMatch(k -> k.startsWith("WINS_") && Integer.parseInt(k.split("_")[1]) >= 100);
            case "CHERRY_BLOSSOM" -> unlockedKeys.contains("WIN_RATE_65") || unlockedKeys.stream().anyMatch(k -> k.startsWith("WIN_RATE_") && Integer.parseInt(k.split("_")[2]) >= 65);
            case "DARK_SLASH" -> unlockedKeys.contains("WINS_200") || unlockedKeys.stream().anyMatch(k -> k.startsWith("WINS_") && Integer.parseInt(k.split("_")[1]) >= 200);
            default -> false;
        };
    }

    private AchievementResponse buildResponse(Set<String> unlockedKeys, List<UserAchievement> unlockedAchievements, String equippedEffect) {
        List<AchievementDTO> winRateBadges = new ArrayList<>();
        List<AchievementDTO> matchBadges = new ArrayList<>();
        List<AchievementDTO> winBadges = new ArrayList<>();
        List<AchievementResponse.EffectDTO> effects = new ArrayList<>();

        for (int t : WIN_RATE_THRESHOLDS) {
            String key = "WIN_RATE_" + t;
            winRateBadges.add(new AchievementDTO(key, "WIN_RATE", t + "% Win Rate", "Achieve a " + t + "% win rate (min 10 matches)", unlockedKeys.contains(key), getUnlockedAt(key, unlockedAchievements), t));
        }

        for (int m : MATCH_MILESTONES) {
            String key = "MATCHES_" + m;
            matchBadges.add(new AchievementDTO(key, "MATCHES", m + " Matches", "Play " + m + " matches", unlockedKeys.contains(key), getUnlockedAt(key, unlockedAchievements), m));
            
            String wKey = "WINS_" + m;
            winBadges.add(new AchievementDTO(wKey, "WINS", m + " Wins", "Win " + m + " matches", unlockedKeys.contains(wKey), getUnlockedAt(wKey, unlockedAchievements), m));
        }

        effects.add(new AchievementResponse.EffectDTO("FIRE_PHOENIX", isEffectUnlocked("FIRE_PHOENIX", unlockedKeys), "Requires 50 Wins"));
        effects.add(new AchievementResponse.EffectDTO("DRAGON_LIGHTNING", isEffectUnlocked("DRAGON_LIGHTNING", unlockedKeys), "Requires 100 Wins"));
        effects.add(new AchievementResponse.EffectDTO("CHERRY_BLOSSOM", isEffectUnlocked("CHERRY_BLOSSOM", unlockedKeys), "Requires 65% Win Rate"));
        effects.add(new AchievementResponse.EffectDTO("DARK_SLASH", isEffectUnlocked("DARK_SLASH", unlockedKeys), "Requires 200 Wins"));

        return new AchievementResponse(winRateBadges, matchBadges, winBadges, effects, equippedEffect);
    }

    private String getUnlockedAt(String key, List<UserAchievement> unlockedAchievements) {
        return unlockedAchievements.stream()
                .filter(a -> a.getAchievementKey().equals(key))
                .findFirst()
                .map(a -> a.getUnlockedAt().toString())
                .orElse(null);
    }
}
