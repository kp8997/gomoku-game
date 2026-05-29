package com.gomoku.game.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_equipped_effects")
public class UserEquippedEffect {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "effect_key", nullable = false, length = 50)
    private String effectKey;

    @Column(name = "symbol_skin", length = 50)
    private String symbolSkin;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public UserEquippedEffect() {}

    public UserEquippedEffect(User user, String effectKey) {
        this.user = user;
        this.effectKey = effectKey;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getEffectKey() { return effectKey; }
    public void setEffectKey(String effectKey) { this.effectKey = effectKey; }
    public String getSymbolSkin() { return symbolSkin; }
    public void setSymbolSkin(String symbolSkin) { this.symbolSkin = symbolSkin; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
