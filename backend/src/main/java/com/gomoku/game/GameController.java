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
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Controller
public class GameController {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, GameRoom> games = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);
    private final Map<String, ScheduledFuture<?>> gameTimers = new ConcurrentHashMap<>();
    private static final int TURN_DURATION_SECONDS = 60;

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
            messagingTemplate.convertAndSendToUser(sessionId, "/topic/errors", message);
            messagingTemplate.convertAndSend("/topic/game/" + gameId, message);
            return;
        }

        if (room.getActiveSessionCount() == 0) {
            room.getScores().clear();
        }
        
        if (message.getMode() != null) {
            room.setMode(message.getMode());
        }
        room.addSession(sessionId, message.getSender());

        message.setType(GameMessage.MessageType.JOIN);
        message.setHistory(room.getHistory());
        message.setChatHistory(room.getChatHistory());
        message.setMode(room.getMode());
        message.setScores(room.getScores());
        message.setPlayerCount(room.getActiveSessionCount());
        message.setTurnStartTime(room.getTurnStartTime());
        message.setTurnDuration(TURN_DURATION_SECONDS);
        message.setPlayerSymbol(room.getPlayerSymbol(message.getSender()));
        messagingTemplate.convertAndSend("/topic/game/" + gameId, message);
        
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
                stopTurnTimer(gameId);
                broadcastStatus(gameId);
            }
        }
    }

    @MessageMapping("/game.move")
    public void handleMove(@Payload GameMessage message) {
        String gameId = message.getGameId();
        GameRoom room = games.get(gameId);
        
        if (room != null && room.isValidMove(message.getRow(), message.getCol())) {
            if (room.getMode() == GameMessage.GameMode.MULTIPLE) {
                if (message.getSender().equals(room.getLastPlayer())) {
                    return;
                }
            }

            String symbol = room.getNextSymbol();
            room.makeMove(message.getSender(), message.getRow(), message.getCol(), symbol);
            
            message.setType(GameMessage.MessageType.MOVE);
            message.setContent(symbol);
            message.setTurnStartTime(System.currentTimeMillis());
            message.setTurnDuration(TURN_DURATION_SECONDS);
            messagingTemplate.convertAndSend("/topic/game/" + gameId, message);

            List<GameMessage.Move> winningLine = room.getWinningLine(message.getRow(), message.getCol());
            if (winningLine != null) {
                stopTurnTimer(gameId);
                String winnerKey = (room.getMode() == GameMessage.GameMode.SINGLE) ? ("Player " + symbol) : message.getSender();
                room.incrementScore(winnerKey);
                GameMessage winMessage = new GameMessage();
                winMessage.setType(GameMessage.MessageType.WIN);
                winMessage.setSender("SYSTEM");
                winMessage.setWinner(winnerKey);
                winMessage.setContent(winnerKey + " wins!");
                winMessage.setScores(room.getScores());
                winMessage.setWinningLine(winningLine);
                messagingTemplate.convertAndSend("/topic/game/" + gameId, winMessage);
                room.reset();
            } else {
                startTurnTimer(gameId);
            }
        }
    }

    @MessageMapping("/game.start")
    public void startGame(@Payload GameMessage message) {
        String gameId = message.getGameId();
        GameRoom room = games.get(gameId);
        if (room != null) {
            room.reset();
            stopTurnTimer(gameId);
            GameMessage startMessage = new GameMessage();
            startMessage.setType(GameMessage.MessageType.START);
            startMessage.setSender("SYSTEM");
            startMessage.setTurnStartTime(0); // Explicitly 0 at start
            startMessage.setTurnDuration(TURN_DURATION_SECONDS);
            messagingTemplate.convertAndSend("/topic/game/" + gameId, startMessage);
        }
    }

    private void startTurnTimer(String gameId) {
        stopTurnTimer(gameId);
        GameRoom room = games.get(gameId);
        if (room == null) return;

        ScheduledFuture<?> future = scheduler.schedule(() -> {
            handleTimeout(gameId);
        }, TURN_DURATION_SECONDS, TimeUnit.SECONDS);
        
        gameTimers.put(gameId, future);
        room.setTurnStartTime(System.currentTimeMillis());
    }

    private void stopTurnTimer(String gameId) {
        ScheduledFuture<?> future = gameTimers.remove(gameId);
        if (future != null) {
            future.cancel(false);
        }
    }

    private void handleTimeout(String gameId) {
        GameRoom room = games.get(gameId);
        if (room == null) return;

        String lastPlayer = room.getLastPlayer();
        String winner;
        String currentPlayer;

        List<String> playerList = new ArrayList<>(room.getPlayers());
        if (playerList.isEmpty()) return;

        if (room.getMode() == GameMessage.GameMode.SINGLE) {
            currentPlayer = (room.getHistory().size() % 2 == 0) ? "Player X" : "Player O";
            winner = (room.getHistory().size() % 2 == 0) ? "Player O" : "Player X";
        } else {
            if (playerList.size() < 2) return;
            if (lastPlayer == null) {
                currentPlayer = playerList.get(0); 
            } else {
                currentPlayer = playerList.get(0).equals(lastPlayer) ? playerList.get(1) : playerList.get(0);
            }
            winner = playerList.get(0).equals(currentPlayer) ? playerList.get(1) : playerList.get(0);
        }
        
        room.incrementScore(winner);
        GameMessage timeoutMessage = new GameMessage();
        timeoutMessage.setType(GameMessage.MessageType.WIN);
        timeoutMessage.setSender("SYSTEM");
        timeoutMessage.setWinner(winner);
        timeoutMessage.setContent(currentPlayer + " timed out! " + winner + " wins!");
        timeoutMessage.setScores(room.getScores());
        messagingTemplate.convertAndSend("/topic/game/" + gameId, timeoutMessage);
        room.reset();
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
        private final List<GameMessage.Move> history = new ArrayList<>();
        private final List<GameMessage.ChatMessage> chatHistory = new ArrayList<>();
        private final java.util.Set<String> players = new java.util.LinkedHashSet<>();
        private final java.util.Set<String> activeSessions = new java.util.HashSet<>();
        private final Map<String, Integer> scores = new HashMap<>();
        private String lastPlayer = null;
        private GameMessage.GameMode mode = GameMessage.GameMode.SINGLE;
        private long turnStartTime = 0;

        public GameRoom(String id) {
            this.id = id;
        }

        public void addSession(String sessionId, String username) {
            activeSessions.add(sessionId);
            players.add(username);
            
            // Initialize scores so names appear in header immediately
            if (mode == GameMessage.GameMode.SINGLE) {
                scores.putIfAbsent("Player X", 0);
                scores.putIfAbsent("Player O", 0);
            } else {
                scores.putIfAbsent(username, 0);
            }
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

        public List<GameMessage.Move> getHistory() {
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
            if (mode == GameMessage.GameMode.MULTIPLE) {
                if (scores.getOrDefault("Player X", 0) == 0) scores.remove("Player X");
                if (scores.getOrDefault("Player O", 0) == 0) scores.remove("Player O");
            }
        }

        public void incrementScore(String player) {
            scores.put(player, scores.getOrDefault(player, 0) + 1);
        }

        public Map<String, Integer> getScores() {
            return scores;
        }

        public java.util.Set<String> getPlayers() {
            return players;
        }

        public void setTurnStartTime(long time) {
            this.turnStartTime = time;
        }

        public long getTurnStartTime() {
            return turnStartTime;
        }

        public String getPlayerSymbol(String username) {
            List<String> playerList = new ArrayList<>(players);
            int index = playerList.indexOf(username);
            if (index == 0) return "X";
            if (index == 1) return "O";
            return null;
        }

        public List<GameMessage.Move> getWinningLine(int r, int c) {
            String s = board[r][c];
            int[][] dirs = {{1, 0}, {0, 1}, {1, 1}, {1, -1}};
            for (int[] dir : dirs) {
                List<GameMessage.Move> line = new ArrayList<>();
                line.add(new GameMessage.Move(lastPlayer, r, c, s));
                collectInDir(r, c, dir[0], dir[1], s, line);
                collectInDir(r, c, -dir[0], -dir[1], s, line);
                if (line.size() >= 5) return line;
            }
            return null;
        }

        private void collectInDir(int r, int c, int dr, int dc, String s, List<GameMessage.Move> line) {
            int nr = r + dr;
            int nc = c + dc;
            while (nr >= 0 && nr < 20 && nc >= 0 && nc < 20 && s.equals(board[nr][nc])) {
                line.add(new GameMessage.Move(null, nr, nc, s));
                nr += dr;
                nc += dc;
            }
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
            turnStartTime = 0;
        }

        public void addChatMessage(String sender, String content) {
            chatHistory.add(new GameMessage.ChatMessage(sender, content, System.currentTimeMillis()));
        }

        public List<GameMessage.ChatMessage> getChatHistory() {
            return chatHistory;
        }
    }
}
