package com.gomoku.game;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.context.event.EventListener;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class GameController {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, GameRoom> games = new ConcurrentHashMap<>();

    public GameController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/game.join")
    public void joinGame(@Payload GameMessage message, SimpMessageHeaderAccessor headerAccessor) {
        String gameId = message.getGameId();
        String sessionId = headerAccessor.getSessionId();
        
        headerAccessor.getSessionAttributes().put("username", message.getSender());
        headerAccessor.getSessionAttributes().put("gameId", gameId);
        headerAccessor.getSessionAttributes().put("sessionId", sessionId);

        GameRoom room = games.computeIfAbsent(gameId, id -> new GameRoom(id));
        
        // Check constraints
        int maxPlayers = (room.getMode() == GameMessage.GameMode.SINGLE) ? 1 : 2;
        if (room.getActiveSessionCount() >= maxPlayers) {
            message.setType(GameMessage.MessageType.ERROR);
            message.setContent("Room is full. " + (room.getMode() == GameMessage.GameMode.SINGLE ? "Single player" : "Multiplayer (max 2)") + " limit reached.");
            messagingTemplate.convertAndSendToUser(sessionId, "/topic/errors", message); // Use a private topic or just /topic/game/gameId with a flag
            // Actually, send it back to the specific topic but maybe just to the sender.
            // For simplicity, we'll send it to the room topic but the client will handle it.
            messagingTemplate.convertAndSend("/topic/game/" + gameId, message);
            return;
        }

        // If room was empty, reset it for a new match
        if (room.getActiveSessionCount() == 0) {
            room.reset();
            room.getScores().clear(); // Also clear scores for a fresh start
        }
        
        room.addSession(sessionId, message.getSender());
        if (message.getMode() != null) {
            room.setMode(message.getMode());
        }

        message.setType(GameMessage.MessageType.JOIN);
        message.setHistory(room.getHistory());
        message.setChatHistory(room.getChatHistory());
        message.setMode(room.getMode());
        message.setScores(room.getScores());
        message.setPlayerCount(room.getActiveSessionCount());
        messagingTemplate.convertAndSend("/topic/game/" + gameId, message);
        
        // Also broadcast a status update
        broadcastStatus(gameId);
    }

    @MessageMapping("/game.status")
    public void getRoomStatus(@Payload GameMessage message) {
        broadcastStatus(message.getGameId());
    }

    private void broadcastStatus(String gameId) {
        GameRoom room = games.get(gameId);
        GameMessage status = new GameMessage();
        status.setType(GameMessage.MessageType.ROOM_STATUS);
        status.setGameId(gameId);
        if (room != null) {
            status.setPlayerCount(room.getActiveSessionCount());
            status.setMode(room.getMode());
        } else {
            status.setPlayerCount(0);
        }
        messagingTemplate.convertAndSend("/topic/game/" + gameId, status);
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String gameId = (String) headerAccessor.getSessionAttributes().get("gameId");
        String sessionId = event.getSessionId();

        if (gameId != null) {
            GameRoom room = games.get(gameId);
            if (room != null) {
                room.removeSession(sessionId);
                broadcastStatus(gameId);
            }
        }
    }

    @MessageMapping("/game.move")
    public void handleMove(@Payload GameMessage message) {
        String gameId = message.getGameId();
        GameRoom room = games.get(gameId);
        
        if (room != null && room.isValidMove(message.getRow(), message.getCol())) {
            // Check turn if in MULTIPLE mode
            if (room.getMode() == GameMessage.GameMode.MULTIPLE) {
                if (message.getSender().equals(room.getLastPlayer())) {
                    return;
                }
            }

            String symbol = room.getNextSymbol();
            room.makeMove(message.getSender(), message.getRow(), message.getCol(), symbol);
            
            message.setType(GameMessage.MessageType.MOVE);
            message.setContent(symbol);
            messagingTemplate.convertAndSend("/topic/game/" + gameId, message);

            if (room.checkWin(message.getRow(), message.getCol())) {
                room.incrementScore(message.getSender());
                GameMessage winMessage = new GameMessage();
                winMessage.setType(GameMessage.MessageType.WIN);
                winMessage.setSender("SYSTEM");
                winMessage.setWinner(message.getSender());
                winMessage.setContent(message.getSender() + " wins!");
                winMessage.setScores(room.getScores());
                messagingTemplate.convertAndSend("/topic/game/" + gameId, winMessage);
                room.reset();
            }
        }
    }

    @MessageMapping("/game.start")
    public void startGame(@Payload GameMessage message) {
        String gameId = message.getGameId();
        GameRoom room = games.get(gameId);
        if (room != null) {
            room.reset();
            GameMessage startMessage = new GameMessage();
            startMessage.setType(GameMessage.MessageType.START);
            startMessage.setSender("SYSTEM");
            messagingTemplate.convertAndSend("/topic/game/" + gameId, startMessage);
        }
    }

    @MessageMapping("/game.chat")
    public void handleChat(@Payload GameMessage message) {
        String gameId = message.getGameId();
        GameRoom room = games.get(gameId);
        if (room != null) {
            room.addChatMessage(message.getSender(), message.getContent());
        }
        message.setType(GameMessage.MessageType.CHAT);
        message.setTimestamp(System.currentTimeMillis());
        messagingTemplate.convertAndSend("/topic/game/" + gameId, message);
    }

    private static class GameRoom {
        private final String id;
        private final String[][] board = new String[20][20];
        private final java.util.List<GameMessage.Move> history = new ArrayList<>();
        private final java.util.List<GameMessage.ChatMessage> chatHistory = new ArrayList<>();
        private final java.util.Set<String> players = new java.util.HashSet<>();
        private final java.util.Set<String> activeSessions = new java.util.HashSet<>();
        private final java.util.Map<String, Integer> scores = new java.util.HashMap<>();
        private String lastPlayer = null;
        private GameMessage.GameMode mode = GameMessage.GameMode.SINGLE; // Default

        public GameRoom(String id) {
            this.id = id;
        }

        public void addSession(String sessionId, String username) {
            activeSessions.add(sessionId);
            players.add(username);
        }

        public void removeSession(String sessionId) {
            activeSessions.remove(sessionId);
        }

        public int getActiveSessionCount() {
            return activeSessions.size();
        }

        public boolean isValidMove(int r, int c) {
            return r >= 0 && r < 20 && c >= 0 && c < 20 && board[r][c] == null;
        }

        public String getNextSymbol() {
            return (history.size() % 2 == 0) ? "X" : "O";
        }

        public void makeMove(String player, int r, int c, String symbol) {
            board[r][c] = symbol;
            history.add(new GameMessage.Move(player, r, c, symbol));
            lastPlayer = player;
        }

        public java.util.List<GameMessage.Move> getHistory() {
            return history;
        }

        public String getLastPlayer() {
            return lastPlayer;
        }

        public GameMessage.GameMode getMode() {
            return mode;
        }

        public void setMode(GameMessage.GameMode mode) {
            this.mode = mode;
        }

        public void incrementScore(String player) {
            scores.put(player, scores.getOrDefault(player, 0) + 1);
        }

        public java.util.Map<String, Integer> getScores() {
            return scores;
        }

        public boolean checkWin(int r, int c) {
            String s = board[r][c];
            return checkDir(r, c, 1, 0, s) + checkDir(r, c, -1, 0, s) >= 4 || // Horizontal
                   checkDir(r, c, 0, 1, s) + checkDir(r, c, 0, -1, s) >= 4 || // Vertical
                   checkDir(r, c, 1, 1, s) + checkDir(r, c, -1, -1, s) >= 4 || // Diagonal 1
                   checkDir(r, c, 1, -1, s) + checkDir(r, c, -1, 1, s) >= 4;   // Diagonal 2
        }

        private int checkDir(int r, int c, int dr, int dc, String s) {
            int count = 0;
            int nr = r + dr;
            int nc = c + dc;
            while (nr >= 0 && nr < 20 && nc >= 0 && nc < 20 && s.equals(board[nr][nc])) {
                count++;
                nr += dr;
                nc += dc;
            }
            return count;
        }

        public void reset() {
            for (int i = 0; i < 20; i++) {
                for (int j = 0; j < 20; j++) {
                    board[i][j] = null;
                }
            }
            history.clear();
            chatHistory.clear();
            lastPlayer = null;
        }

        public void addChatMessage(String sender, String content) {
            chatHistory.add(new GameMessage.ChatMessage(sender, content, System.currentTimeMillis()));
        }

        public java.util.List<GameMessage.ChatMessage> getChatHistory() {
            return chatHistory;
        }
    }
}
