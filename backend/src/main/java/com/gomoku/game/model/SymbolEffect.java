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
    ETHEREAL_FROST("WINS_120", 120, "Requires 120 Wins"),
    ABYSSAL_VOID("WINS_130", 130, "Requires 130 Wins"),
    GOLDEN_SOVEREIGN("WINS_140", 140, "Requires 140 Wins"),
    QUANTUM_GLITCH("WINS_150", 150, "Requires 150 Wins"),
    BLOOD_MOON("WINS_160", 160, "Requires 160 Wins"),
    RADIANT_SERAPH("WINS_170", 170, "Requires 170 Wins"),
    PRISMATIC_DIAMOND("WINS_180", 180, "Requires 180 Wins"),
    GALACTIC_SUPERNOVA("WINS_190", 190, "Requires 190 Wins");

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
