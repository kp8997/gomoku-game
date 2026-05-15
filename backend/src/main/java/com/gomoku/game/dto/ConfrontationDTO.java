package com.gomoku.game.dto;

public class ConfrontationDTO {
    private String opponentUsername;
    private String opponentFullName;
    private String opponentAvatar;
    private Integer wins;
    private Integer losses;

    public ConfrontationDTO() {}

    public ConfrontationDTO(String opponentUsername, String opponentFullName, String opponentAvatar, Integer wins, Integer losses) {
        this.opponentUsername = opponentUsername;
        this.opponentFullName = opponentFullName;
        this.opponentAvatar = opponentAvatar;
        this.wins = wins;
        this.losses = losses;
    }

    public static ConfrontationDTOBuilder builder() {
        return new ConfrontationDTOBuilder();
    }

    public String getOpponentUsername() { return opponentUsername; }
    public void setOpponentUsername(String opponentUsername) { this.opponentUsername = opponentUsername; }
    public String getOpponentFullName() { return opponentFullName; }
    public void setOpponentFullName(String opponentFullName) { this.opponentFullName = opponentFullName; }
    public String getOpponentAvatar() { return opponentAvatar; }
    public void setOpponentAvatar(String opponentAvatar) { this.opponentAvatar = opponentAvatar; }
    public Integer getWins() { return wins; }
    public void setWins(Integer wins) { this.wins = wins; }
    public Integer getLosses() { return losses; }
    public void setLosses(Integer losses) { this.losses = losses; }

    public static class ConfrontationDTOBuilder {
        private String opponentUsername;
        private String opponentFullName;
        private String opponentAvatar;
        private Integer wins;
        private Integer losses;

        public ConfrontationDTOBuilder opponentUsername(String opponentUsername) { this.opponentUsername = opponentUsername; return this; }
        public ConfrontationDTOBuilder opponentFullName(String opponentFullName) { this.opponentFullName = opponentFullName; return this; }
        public ConfrontationDTOBuilder opponentAvatar(String opponentAvatar) { this.opponentAvatar = opponentAvatar; return this; }
        public ConfrontationDTOBuilder wins(Integer wins) { this.wins = wins; return this; }
        public ConfrontationDTOBuilder losses(Integer losses) { this.losses = losses; return this; }
        public ConfrontationDTO build() { return new ConfrontationDTO(opponentUsername, opponentFullName, opponentAvatar, wins, losses); }
    }
}
