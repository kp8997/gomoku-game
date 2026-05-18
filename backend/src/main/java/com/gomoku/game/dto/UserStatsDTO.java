package com.gomoku.game.dto;

public class UserStatsDTO {
    private int totalWins;
    private int totalLosses;
    private int totalMatches;
    private double winRate;

    public UserStatsDTO() {}

    public UserStatsDTO(int totalWins, int totalLosses, int totalMatches, double winRate) {
        this.totalWins = totalWins;
        this.totalLosses = totalLosses;
        this.totalMatches = totalMatches;
        this.winRate = winRate;
    }

    public int getTotalWins() { return totalWins; }
    public void setTotalWins(int totalWins) { this.totalWins = totalWins; }
    public int getTotalLosses() { return totalLosses; }
    public void setTotalLosses(int totalLosses) { this.totalLosses = totalLosses; }
    public int getTotalMatches() { return totalMatches; }
    public void setTotalMatches(int totalMatches) { this.totalMatches = totalMatches; }
    public double getWinRate() { return winRate; }
    public void setWinRate(double winRate) { this.winRate = winRate; }
}
