package com.gomoku.game.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "confrontation_records", 
       uniqueConstraints = {@UniqueConstraint(columnNames = {"user_a_id", "user_b_id"})})
public class ConfrontationRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_a_id", nullable = false)
    private User userA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_b_id", nullable = false)
    private User userB;

    @Column(name = "user_a_wins", nullable = false)
    private Integer userAWins = 0;

    @Column(name = "user_b_wins", nullable = false)
    private Integer userBWins = 0;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public ConfrontationRecord() {}

    public ConfrontationRecord(User userA, User userB, Integer userAWins, Integer userBWins) {
        this.userA = userA;
        this.userB = userB;
        this.userAWins = userAWins;
        this.userBWins = userBWins;
    }

    public static ConfrontationRecordBuilder builder() {
        return new ConfrontationRecordBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUserA() { return userA; }
    public void setUserA(User userA) { this.userA = userA; }
    public User getUserB() { return userB; }
    public void setUserB(User userB) { this.userB = userB; }
    public Integer getUserAWins() { return userAWins; }
    public void setUserAWins(Integer userAWins) { this.userAWins = userAWins; }
    public Integer getUserBWins() { return userBWins; }
    public void setUserBWins(Integer userBWins) { this.userBWins = userBWins; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public static class ConfrontationRecordBuilder {
        private User userA;
        private User userB;
        private Integer userAWins = 0;
        private Integer userBWins = 0;

        public ConfrontationRecordBuilder userA(User userA) { this.userA = userA; return this; }
        public ConfrontationRecordBuilder userB(User userB) { this.userB = userB; return this; }
        public ConfrontationRecordBuilder userAWins(Integer userAWins) { this.userAWins = userAWins; return this; }
        public ConfrontationRecordBuilder userBWins(Integer userBWins) { this.userBWins = userBWins; return this; }
        public ConfrontationRecord build() { return new ConfrontationRecord(userA, userB, userAWins, userBWins); }
    }
}
