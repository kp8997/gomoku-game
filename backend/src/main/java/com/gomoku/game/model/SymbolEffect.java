package com.gomoku.game.model;

public enum SymbolEffect {
    FIRE_PHOENIX("WINS_20", 20, "Requires 20 Wins"),
    DRAGON_LIGHTNING("WINS_30", 30, "Requires 30 Wins"),
    HEART_FLUTTER("WINS_40", 40, "Requires 40 Wins"),
    CHERRY_BLOSSOM("WINS_50", 50, "Requires 50 Wins"),
    NATURE_LEAF("WINS_60", 60, "Requires 60 Wins"),
    VIBRANT_FIRE("WINS_70", 70, "Requires 70 Wins"),
    OCEAN_SPLASH("WINS_80", 80, "Requires 80 Wins"),
    COSMIC_NEBULA("WINS_90", 90, "Requires 90 Wins"),
    DARK_SLASH("WINS_100", 100, "Requires 100 Wins"),
    AURORA_BOREALIS("WINS_110", 110, "Requires 110 Wins"),
    ETHEREAL_FROST("WINS_150", 150, "Requires 150 Wins"),
    ABYSSAL_VOID("WINS_200", 200, "Requires 200 Wins"),
    GOLDEN_SOVEREIGN("WINS_250", 250, "Requires 250 Wins"),
    QUANTUM_GLITCH("WINS_300", 300, "Requires 300 Wins"),
    BLOOD_MOON("WINS_400", 400, "Requires 400 Wins"),
    RADIANT_SERAPH("WINS_500", 500, "Requires 500 Wins"),
    PRISMATIC_DIAMOND("WINS_750", 750, "Requires 750 Wins"),
    GALACTIC_SUPERNOVA("WINS_1000", 1000, "Requires 1000 Wins");

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
