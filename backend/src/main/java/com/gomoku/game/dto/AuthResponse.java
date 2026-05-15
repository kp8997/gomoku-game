package com.gomoku.game.dto;

public class AuthResponse {
    private String token;
    private String username;
    private String fullName;
    private String avatar;

    public AuthResponse() {}

    public AuthResponse(String token, String username, String fullName, String avatar) {
        this.token = token;
        this.username = username;
        this.fullName = fullName;
        this.avatar = avatar;
    }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public static class AuthResponseBuilder {
        private String token;
        private String username;
        private String fullName;
        private String avatar;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder username(String username) { this.username = username; return this; }
        public AuthResponseBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public AuthResponseBuilder avatar(String avatar) { this.avatar = avatar; return this; }
        public AuthResponse build() { return new AuthResponse(token, username, fullName, avatar); }
    }
}
