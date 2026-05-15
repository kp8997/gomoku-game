package com.gomoku.game.dto;

public class ProfileUpdateRequest {
    private String fullName;
    private String avatar;

    public ProfileUpdateRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}
