package com.gomoku.game.model;

public enum SymbolEffect {
    FIRE_PHOENIX("WINS_20", 20, "Requires 20 Wins"),
    DRAGON_LIGHTNING("WINS_30", 30, "Requires 30 Wins"),
    HEART_FLUTTER("WINS_40", 40, "Requires 40 Wins"),
    CHERRY_BLOSSOM("WINS_50", 50, "Requires 50 Wins"),
    NATURE_LEAF("WINS_60", 60, "Requires 60 Wins"),
    VIBRANT_FIRE("WINS_70", 70, "Requires 70 Wins"),
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
