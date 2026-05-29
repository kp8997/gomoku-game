package com.gomoku.game.model;

public enum SymbolSkin {
    CAT_PAW(20, "Cat Paw", "Unlock at 20 Wins"),
    KITTY_FACE(30, "Kitty Face", "Unlock at 30 Wins"),
    BUBBLE_TEA(40, "Bubble Tea", "Unlock at 40 Wins"),
    STAR_CHARM(50, "Star Charm", "Unlock at 50 Wins"),
    HEART_BOW(60, "Heart Bow", "Unlock at 60 Wins"),
    LOTUS(70, "Lotus", "Unlock at 70 Wins"),
    MOON_BUNNY(80, "Moon Bunny", "Unlock at 80 Wins"),
    LUCKY_CAT(90, "Lucky Cat", "Unlock at 90 Wins"),
    KING_GEORGE(100, "King George", "Unlock at 100 Wins"),
    PINK_LOOPY(110, "Pink Loopy", "Unlock at 110 Wins");

    private final int requiredWins;
    private final String displayName;
    private final String requirementLabel;

    SymbolSkin(int requiredWins, String displayName, String requirementLabel) {
        this.requiredWins = requiredWins;
        this.displayName = displayName;
        this.requirementLabel = requirementLabel;
    }

    public int getRequiredWins() {
        return requiredWins;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getRequirementLabel() {
        return requirementLabel;
    }
}
