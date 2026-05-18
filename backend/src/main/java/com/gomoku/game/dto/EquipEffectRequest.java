package com.gomoku.game.dto;

public class EquipEffectRequest {
    private String effectKey;

    public EquipEffectRequest() {}

    public EquipEffectRequest(String effectKey) {
        this.effectKey = effectKey;
    }

    public String getEffectKey() { return effectKey; }
    public void setEffectKey(String effectKey) { this.effectKey = effectKey; }
}
