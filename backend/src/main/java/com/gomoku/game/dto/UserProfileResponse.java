package com.gomoku.game.dto;

import java.util.List;

public class UserProfileResponse {
    private String username;
    private String fullName;
    private String avatar;
    private List<ConfrontationDTO> confrontations;

    public UserProfileResponse() {}

    public UserProfileResponse(String username, String fullName, String avatar, List<ConfrontationDTO> confrontations) {
        this.username = username;
        this.fullName = fullName;
        this.avatar = avatar;
        this.confrontations = confrontations;
    }

    public static UserProfileResponseBuilder builder() {
        return new UserProfileResponseBuilder();
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public List<ConfrontationDTO> getConfrontations() { return confrontations; }
    public void setConfrontations(List<ConfrontationDTO> confrontations) { this.confrontations = confrontations; }

    public static class UserProfileResponseBuilder {
        private String username;
        private String fullName;
        private String avatar;
        private List<ConfrontationDTO> confrontations;

        public UserProfileResponseBuilder username(String username) { this.username = username; return this; }
        public UserProfileResponseBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public UserProfileResponseBuilder avatar(String avatar) { this.avatar = avatar; return this; }
        public UserProfileResponseBuilder confrontations(List<ConfrontationDTO> confrontations) { this.confrontations = confrontations; return this; }
        public UserProfileResponse build() { return new UserProfileResponse(username, fullName, avatar, confrontations); }
    }
}
