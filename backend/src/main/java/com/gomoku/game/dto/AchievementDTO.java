package com.gomoku.game.dto;

public class AchievementDTO {
    private String key;
    private String category;
    private String label;
    private String description;
    private boolean unlocked;
    private String unlockedAt;
    private int threshold;

    public AchievementDTO() {}

    public AchievementDTO(String key, String category, String label, String description, boolean unlocked, String unlockedAt, int threshold) {
        this.key = key;
        this.category = category;
        this.label = label;
        this.description = description;
        this.unlocked = unlocked;
        this.unlockedAt = unlockedAt;
        this.threshold = threshold;
    }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isUnlocked() { return unlocked; }
    public void setUnlocked(boolean unlocked) { this.unlocked = unlocked; }
    public String getUnlockedAt() { return unlockedAt; }
    public void setUnlockedAt(String unlockedAt) { this.unlockedAt = unlockedAt; }
    public int getThreshold() { return threshold; }
    public void setThreshold(int threshold) { this.threshold = threshold; }
}
