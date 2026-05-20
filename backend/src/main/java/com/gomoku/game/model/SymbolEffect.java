package com.gomoku.game.model;

public enum SymbolEffect {
    FIRE_PHOENIX("WINS_20", 20, "Requires 20 Wins"),
    DRAGON_LIGHTNING("WINS_30", 30, "Requires 30 Wins"),
    CHERRY_BLOSSOM("WINS_50", 50, "Requires 50 Wins"),
    DARK_SLASH("WINS_100", 100, "Requires 100 Wins");

    private final String requiredAchievementKey;
    private final int requiredWins;
    private final String requirementLabel;

    SymbolEffect(String requiredAchievementKey, int requiredWins, String requirementLabel) {
        this.requiredAchievementKey = requiredAchievementKey;
        this.requiredWins = requiredWins;
        this.requirementLabel = requirementLabel;
    }

    public String getRequiredAchievementKey() {
        return requiredAchievementKey;
    }

    public int getRequiredWins() {
        return requiredWins;
    }

    public String getRequirementLabel() {
        return requirementLabel;
    }
}
