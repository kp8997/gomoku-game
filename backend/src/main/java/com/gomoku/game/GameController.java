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
    private final com.gomoku.game.service.ConfrontationService confrontationService;
    private final com.gomoku.game.repository.UserRepository userRepository;
    private final com.gomoku.game.repository.UserEquippedEffectRepository equippedEffectRepository;
    private final Map<String, GameRoom> games = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);
    private final Map<String, ScheduledFuture<?>> gameTimers = new ConcurrentHashMap<>();
    private static final int TURN_DURATION_SECONDS = 60;

    public GameController(SimpMessagingTemplate messagingTemplate, 
                          com.gomoku.game.service.ConfrontationService confrontationService,
                          com.gomoku.game.repository.UserRepository userRepository,
                          com.gomoku.game.repository.UserEquippedEffectRepository equippedEffectRepository) {
        this.messagingTemplate = messagingTemplate;
        this.confrontationService = confrontationService;
        this.userRepository = userRepository;
        this.equippedEffectRepository = equippedEffectRepository;
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

        boolean canPlay = (room.getMode() == GameMessage.GameMode.SINGLE) ? room.getActiveSessionCount() >= 1 : room.getActiveSessionCount() >= 2;
        if (canPlay && room.getTurnStartTime() > 0 && room.getPausedAt() > 0) {
            long pausedDuration = System.currentTimeMillis() - room.getPausedAt();
            room.setTurnStartTime(room.getTurnStartTime() + pausedDuration);
            room.setPausedAt(0);
            long elapsed = System.currentTimeMillis() - room.getTurnStartTime();
            long remaining = Math.max(0, TURN_DURATION_SECONDS * 1000L - elapsed);
            startTurnTimer(gameId, remaining);
        }

        message.setType(GameMessage.MessageType.JOIN);
        message.setHistory(room.getHistory());
        message.setChatHistory(room.getChatHistory());
        message.setMode(room.getMode());
        message.setScores(room.getActiveScores());
        message.setPlayerCount(room.getActiveSessionCount());
        message.setTurnStartTime(room.getTurnStartTime());
        message.setTurnDuration(TURN_DURATION_SECONDS);
        message.setPlayerSymbol(room.getPlayerSymbol(message.getSender()));
        message.setSymbolEffects(getRoomSymbolEffects(room));
        messagingTemplate.convertAndSend("/topic/game/" + gameId, message);
        
        broadcastStatus(gameId);
    }

    private Map<String, String> getRoomSymbolEffects(GameRoom room) {
        Map<String, String> effects = new HashMap<>();
        List<String> playerList = new ArrayList<>(room.getPlayers());
        if (!playerList.isEmpty()) {
            List<com.gomoku.game.model.UserEquippedEffect> equipped = equippedEffectRepository.findByUser_UsernameIn(playerList);
            for (com.gomoku.game.model.UserEquippedEffect e : equipped) {
                effects.put(e.getUser().getUsername(), e.getEffectKey());
            }
        }
        return effects;
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
            status.setScores(room.getActiveScores());
        } else {
            status.setPlayerCount(0);
        }
        messagingTemplate.convertAndSend("/topic/game/" + gameId, status);
    }

    @MessageMapping("/game.leave")
    public void leaveGame(@Payload GameMessage message, SimpMessageHeaderAccessor headerAccessor) {
        String gameId = message.getGameId();
        String sessionId = headerAccessor.getSessionId();
        if (gameId != null) {
            GameRoom room = games.get(gameId);
            if (room != null) {
                room.removeSession(sessionId);
                stopTurnTimer(gameId);
                broadcastStatus(gameId);
            }
        }
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
            String symbol;
            if (room.getMode() == GameMessage.GameMode.MULTIPLE) {
                String sender = message.getSender();
                if (!room.getPlayers().contains(sender)) {
                    return; // Not an active player in this room
                }
                
                if (room.getHistory().isEmpty()) {
                    symbol = "X";
                    room.assignPlayerSymbol(sender, "X");
                    for (String p : room.getPlayers()) {
                        if (!p.equals(sender)) {
                            room.assignPlayerSymbol(p, "O");
                        }
                    }
                } else {
                    symbol = room.getPlayerSymbol(sender);
                    if (symbol == null) {
                        // Dynamically assign remaining symbol if player joined/re-joined late
                        String firstPlayer = room.getHistory().get(0).getPlayer();
                        if (sender.equals(firstPlayer)) {
                            symbol = "X";
                        } else {
                            symbol = "O";
                        }
                        room.assignPlayerSymbol(sender, symbol);
                    }
                    
                    String lastSymbol = room.getHistory().get(room.getHistory().size() - 1).getSymbol();
                    if (symbol.equals(lastSymbol)) {
                        return; // Not their turn
                    }
                }
            } else {
                symbol = room.getNextSymbol();
            }

            room.makeMove(message.getSender(), message.getRow(), message.getCol(), symbol);
            
            message.setType(GameMessage.MessageType.MOVE);
            message.setContent(symbol);
            message.setTurnStartTime(System.currentTimeMillis());
            message.setTurnDuration(TURN_DURATION_SECONDS);
            message.setSymbolEffects(getRoomSymbolEffects(room));
            messagingTemplate.convertAndSend("/topic/game/" + gameId, message);

            List<GameMessage.Move> winningLine = room.getWinningLine(message.getRow(), message.getCol());
            if (winningLine != null) {
                stopTurnTimer(gameId);
                room.setTurnStartTime(0);
                room.setPausedAt(0);
            } else {
                boolean nextPlayerHasMoved = false;
                String nextPlayerSymbol = symbol.equals("X") ? "O" : "X";
                for (GameMessage.Move m : room.getHistory()) {
                    if (m.getSymbol().equals(nextPlayerSymbol)) {
                        nextPlayerHasMoved = true;
                        break;
                    }
                }
                if (nextPlayerHasMoved) {
                    room.setTurnStartTime(System.currentTimeMillis());
                    room.setPausedAt(0);
                    startTurnTimer(gameId, TURN_DURATION_SECONDS * 1000L);
                } else {
                    stopTurnTimer(gameId);
                    room.setTurnStartTime(0);
                    room.setPausedAt(0);
                }
            }

            message.setType(GameMessage.MessageType.MOVE);
            message.setContent(symbol);
            message.setTurnStartTime(room.getTurnStartTime());
            message.setTurnDuration(TURN_DURATION_SECONDS);
            message.setSymbolEffects(getRoomSymbolEffects(room));
            messagingTemplate.convertAndSend("/topic/game/" + gameId, message);

            if (winningLine != null) {
                String winnerKey = (room.getMode() == GameMessage.GameMode.SINGLE) ? ("Player " + symbol) : message.getSender();
                room.incrementScore(winnerKey);
                GameMessage winMessage = new GameMessage();
                winMessage.setType(GameMessage.MessageType.WIN);
                winMessage.setSender("SYSTEM");
                winMessage.setWinner(winnerKey);
                winMessage.setContent(winnerKey + " wins!");
                winMessage.setScores(room.getActiveScores());
                winMessage.setWinningLine(winningLine);
                messagingTemplate.convertAndSend("/topic/game/" + gameId, winMessage);
                recordConfrontation(room, winnerKey);
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
            stopTurnTimer(gameId);
            GameMessage startMessage = new GameMessage();
            startMessage.setType(GameMessage.MessageType.START);
            startMessage.setSender("SYSTEM");
            startMessage.setTurnStartTime(0); // Explicitly 0 at start
            startMessage.setTurnDuration(TURN_DURATION_SECONDS);
            startMessage.setSymbolEffects(getRoomSymbolEffects(room));
            messagingTemplate.convertAndSend("/topic/game/" + gameId, startMessage);
        }
    }

    private void startTurnTimer(String gameId, long delayMs) {
        stopTurnTimer(gameId);
        GameRoom room = games.get(gameId);
        if (room == null) return;

        room.setPausedAt(0);
        ScheduledFuture<?> future = scheduler.schedule(() -> {
            handleTimeout(gameId);
        }, delayMs, TimeUnit.MILLISECONDS);
        
        gameTimers.put(gameId, future);
    }

    private void stopTurnTimer(String gameId) {
        ScheduledFuture<?> future = gameTimers.remove(gameId);
        if (future != null) {
            future.cancel(false);
            GameRoom room = games.get(gameId);
            if (room != null && room.getTurnStartTime() > 0 && room.getPausedAt() == 0) {
                room.setPausedAt(System.currentTimeMillis());
            }
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
        timeoutMessage.setScores(room.getActiveScores());
        messagingTemplate.convertAndSend("/topic/game/" + gameId, timeoutMessage);
        recordConfrontation(room, winner);
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

    private void recordConfrontation(GameRoom room, String winnerUsername) {
        if (room.getMode() != GameMessage.GameMode.MULTIPLE) return;
        
        List<String> players = new ArrayList<>(room.getPlayers());
        if (players.size() != 2) return;
        
        var user1Opt = userRepository.findByUsername(players.get(0));
        var user2Opt = userRepository.findByUsername(players.get(1));
        
        if (user1Opt.isPresent() && user2Opt.isPresent()) {
            // Case 1: Both authenticated
            var user1 = user1Opt.get();
            var user2 = user2Opt.get();
            Long winnerId = winnerUsername.equals(user1.getUsername()) ? user1.getId() : user2.getId();
            confrontationService.recordWin(user1.getId(), user2.getId(), winnerId);
        } else if (user1Opt.isPresent() || user2Opt.isPresent()) {
            // Case 2: One authenticated, one anonymous
            var authUser = user1Opt.isPresent() ? user1Opt.get() : user2Opt.get();
            Long winnerId = winnerUsername.equals(authUser.getUsername()) ? authUser.getId() : null;
            confrontationService.recordWin(authUser.getId(), null, winnerId);
        }
        // Case 3: Both anonymous -> skip (no persistent identity)
    }

    private static class GameRoom {
        private final String id;
        private final String[][] board = new String[20][20];
        private final List<GameMessage.Move> history = new ArrayList<>();
        private final List<GameMessage.ChatMessage> chatHistory = new ArrayList<>();
        private final java.util.Set<String> players = new java.util.LinkedHashSet<>();
        private final Map<String, String> sessionToUser = new java.util.concurrent.ConcurrentHashMap<>();
        private final Map<String, Integer> scores = new java.util.LinkedHashMap<>();
        private final Map<String, String> playerSymbols = new java.util.concurrent.ConcurrentHashMap<>();
        private String lastPlayer = null;
        private GameMessage.GameMode mode = GameMessage.GameMode.SINGLE;
        private long turnStartTime = 0;
        private long pausedAt = 0;

        public GameRoom(String id) {
            this.id = id;
        }

        public void addSession(String sessionId, String username) {
            sessionToUser.put(sessionId, username);
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
            String username = sessionToUser.remove(sessionId);
            if (username != null) {
                // Only remove the player from active room players list if no other open tabs/sessions remain for them
                if (!sessionToUser.containsValue(username)) {
                    players.remove(username);
                }
            }
        }

        public int getActiveSessionCount() {
            return sessionToUser.size();
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

        public Map<String, Integer> getActiveScores() {
            Map<String, Integer> active = new java.util.LinkedHashMap<>();
            if (mode == GameMessage.GameMode.SINGLE) {
                active.put("Player X", scores.getOrDefault("Player X", 0));
                active.put("Player O", scores.getOrDefault("Player O", 0));
            } else {
                for (String p : players) {
                    active.put(p, scores.getOrDefault(p, 0));
                }
            }
            return active;
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

        public void setPausedAt(long time) {
            this.pausedAt = time;
        }

        public long getPausedAt() {
            return pausedAt;
        }

        public void assignPlayerSymbol(String username, String symbol) {
            playerSymbols.put(username, symbol);
        }

        public String getPlayerSymbol(String username) {
            if (mode == GameMessage.GameMode.SINGLE) {
                return null;
            }
            return playerSymbols.get(username);
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
            playerSymbols.clear();
            lastPlayer = null;
            turnStartTime = 0;
            pausedAt = 0;
        }

        public void addChatMessage(String sender, String content) {
            chatHistory.add(new GameMessage.ChatMessage(sender, content, System.currentTimeMillis()));
        }

        public List<GameMessage.ChatMessage> getChatHistory() {
            return chatHistory;
        }
    }
}
