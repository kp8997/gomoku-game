package com.gomoku.game.dto;

import java.util.List;

public class AchievementResponse {
    private List<AchievementDTO> winRateBadges;
    private List<AchievementDTO> matchBadges;
    private List<AchievementDTO> winBadges;
    private List<EffectDTO> effects;
    private String equippedEffect;

    public AchievementResponse() {}

    public AchievementResponse(List<AchievementDTO> winRateBadges, List<AchievementDTO> matchBadges, List<AchievementDTO> winBadges, List<EffectDTO> effects, String equippedEffect) {
        this.winRateBadges = winRateBadges;
        this.matchBadges = matchBadges;
        this.winBadges = winBadges;
        this.effects = effects;
        this.equippedEffect = equippedEffect;
    }

    public List<AchievementDTO> getWinRateBadges() { return winRateBadges; }
    public void setWinRateBadges(List<AchievementDTO> winRateBadges) { this.winRateBadges = winRateBadges; }
    public List<AchievementDTO> getMatchBadges() { return matchBadges; }
    public void setMatchBadges(List<AchievementDTO> matchBadges) { this.matchBadges = matchBadges; }
    public List<AchievementDTO> getWinBadges() { return winBadges; }
    public void setWinBadges(List<AchievementDTO> winBadges) { this.winBadges = winBadges; }
    public List<EffectDTO> getEffects() { return effects; }
    public void setEffects(List<EffectDTO> effects) { this.effects = effects; }
    public String getEquippedEffect() { return equippedEffect; }
    public void setEquippedEffect(String equippedEffect) { this.equippedEffect = equippedEffect; }

    public static class EffectDTO {
        private String key;
        private boolean unlocked;
        private String requirementLabel;

        public EffectDTO() {}

        public EffectDTO(String key, boolean unlocked, String requirementLabel) {
            this.key = key;
            this.unlocked = unlocked;
            this.requirementLabel = requirementLabel;
        }

        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }
        public boolean isUnlocked() { return unlocked; }
        public void setUnlocked(boolean unlocked) { this.unlocked = unlocked; }
        public String getRequirementLabel() { return requirementLabel; }
        public void setRequirementLabel(String requirementLabel) { this.requirementLabel = requirementLabel; }
    }
}
