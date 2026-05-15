package com.gomoku.game.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column(name = "avatar", columnDefinition = "TEXT")
    private String avatar; // Base64 encoded image string

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public User() {}

    public User(String username, String password, String fullName, String avatar) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.avatar = avatar;
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public static class UserBuilder {
        private String username;
        private String password;
        private String fullName;
        private String avatar;

        public UserBuilder username(String username) { this.username = username; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public UserBuilder avatar(String avatar) { this.avatar = avatar; return this; }
        public User build() { return new User(username, password, fullName, avatar); }
    }
}
