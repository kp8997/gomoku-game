package com.gomoku.game.dto;

public class EquipSkinRequest {
    private String skinKey;

    public EquipSkinRequest() {}

    public EquipSkinRequest(String skinKey) {
        this.skinKey = skinKey;
    }

    public String getSkinKey() { return skinKey; }
    public void setSkinKey(String skinKey) { this.skinKey = skinKey; }
}
