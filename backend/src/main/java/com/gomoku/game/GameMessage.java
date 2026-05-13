package com.gomoku.game;

import java.util.List;

public class GameMessage {
    private MessageType type;
    private String content;
    private String sender;
    private int row;
    private int col;
    private String gameId;
    private GameMode mode;
    private List<Move> history;
    private List<ChatMessage> chatHistory;
    private String winner;
    private java.util.Map<String, Integer> scores;
    private int playerCount;
    private long timestamp;

    public static class ChatMessage {
        private String sender;
        private String content;
        private long timestamp;

        public ChatMessage() {}
        public ChatMessage(String sender, String content, long timestamp) {
            this.sender = sender;
            this.content = content;
            this.timestamp = timestamp;
        }

        public String getSender() { return sender; }
        public void setSender(String sender) { this.sender = sender; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }

    public enum MessageType {
        CHAT, JOIN, MOVE, LEAVE, START, WIN, ROOM_STATUS, ERROR
    }

    public enum GameMode {
        SINGLE, MULTIPLE
    }

    public static class Move {
        private String player;
        private int row;
        private int col;
        private String symbol;

        public Move() {}
        public Move(String player, int row, int col, String symbol) {
            this.player = player;
            this.row = row;
            this.col = col;
            this.symbol = symbol;
        }

        public String getPlayer() { return player; }
        public void setPlayer(String player) { this.player = player; }
        public int getRow() { return row; }
        public void setRow(int row) { this.row = row; }
        public int getCol() { return col; }
        public void setCol(int col) { this.col = col; }
        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }
    }

    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    public int getRow() { return row; }
    public void setRow(int row) { this.row = row; }
    public int getCol() { return col; }
    public void setCol(int col) { this.col = col; }
    public String getGameId() { return gameId; }
    public void setGameId(String gameId) { this.gameId = gameId; }
    public GameMode getMode() { return mode; }
    public void setMode(GameMode mode) { this.mode = mode; }
    public List<Move> getHistory() { return history; }
    public void setHistory(List<Move> history) { this.history = history; }
    public List<ChatMessage> getChatHistory() { return chatHistory; }
    public void setChatHistory(List<ChatMessage> chatHistory) { this.chatHistory = chatHistory; }
    public String getWinner() { return winner; }
    public void setWinner(String winner) { this.winner = winner; }
    public java.util.Map<String, Integer> getScores() { return scores; }
    public void setScores(java.util.Map<String, Integer> scores) { this.scores = scores; }
    public int getPlayerCount() { return playerCount; }
    public void setPlayerCount(int playerCount) { this.playerCount = playerCount; }
    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
}
