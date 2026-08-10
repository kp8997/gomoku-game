package com.gomoku.game;

import com.gomoku.game.model.User;
import com.gomoku.game.model.UserEquippedEffect;
import com.gomoku.game.repository.UserEquippedEffectRepository;
import com.gomoku.game.repository.UserRepository;
import com.gomoku.game.service.ConfrontationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameControllerTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private ConfrontationService confrontationService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserEquippedEffectRepository equippedEffectRepository;

    private GameController gameController;

    @Captor
    private ArgumentCaptor<GameMessage> messageCaptor;

    @BeforeEach
    void setUp() {
        gameController = new GameController(messagingTemplate, confrontationService, userRepository, equippedEffectRepository);
    }

    @Test
    void testJoinGame_LoadsCosmeticsCorrectly() {
        // Arrange
        String gameId = "test-game";
        String sessionId = "session-1";
        String username = "player1";

        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create();
        headerAccessor.setSessionId(sessionId);
        headerAccessor.setSessionAttributes(new HashMap<>());

        GameMessage joinMessage = new GameMessage();
        joinMessage.setGameId(gameId);
        joinMessage.setSender(username);
        joinMessage.setMode(GameMessage.GameMode.MULTIPLE);

        User user = new User();
        user.setUsername(username);

        UserEquippedEffect effect = new UserEquippedEffect();
        effect.setUser(user);
        effect.setEffectKey("fire_effect");
        effect.setSymbolSkin("dragon_skin");

        when(equippedEffectRepository.findByUser_UsernameIn(any())).thenReturn(List.of(effect));

        // Act
        gameController.joinGame(joinMessage, headerAccessor);

        // Assert
        verify(messagingTemplate, atLeastOnce()).convertAndSend(eq("/topic/game/" + gameId), messageCaptor.capture());
        
        GameMessage broadcasted = messageCaptor.getAllValues().stream()
                .filter(m -> m.getType() == GameMessage.MessageType.JOIN)
                .findFirst()
                .orElseThrow();

        assertNotNull(broadcasted.getSymbolEffects());
        assertNotNull(broadcasted.getSymbolSkins());
        assertEquals("fire_effect", broadcasted.getSymbolEffects().get(username));
        assertEquals("dragon_skin", broadcasted.getSymbolSkins().get(username));
    }

    @Test
    void testHandleMove_BroadcastsExactlyOnce() {
        // Arrange
        String gameId = "test-game-move";
        String sessionId1 = "session-1";
        String player1 = "player1";
        String sessionId2 = "session-2";
        String player2 = "player2";

        // Join two players to set up the game room
        SimpMessageHeaderAccessor headerAccessor1 = SimpMessageHeaderAccessor.create();
        headerAccessor1.setSessionId(sessionId1);
        headerAccessor1.setSessionAttributes(new HashMap<>());
        GameMessage join1 = new GameMessage();
        join1.setGameId(gameId);
        join1.setSender(player1);
        join1.setMode(GameMessage.GameMode.MULTIPLE);
        gameController.joinGame(join1, headerAccessor1);

        SimpMessageHeaderAccessor headerAccessor2 = SimpMessageHeaderAccessor.create();
        headerAccessor2.setSessionId(sessionId2);
        headerAccessor2.setSessionAttributes(new HashMap<>());
        GameMessage join2 = new GameMessage();
        join2.setGameId(gameId);
        join2.setSender(player2);
        join2.setMode(GameMessage.GameMode.MULTIPLE);
        gameController.joinGame(join2, headerAccessor2);

        // Reset mock to ignore join broadcasts
        reset(messagingTemplate);
        when(equippedEffectRepository.findByUser_UsernameIn(any())).thenReturn(List.of());

        // Act - First move
        GameMessage moveMessage = new GameMessage();
        moveMessage.setGameId(gameId);
        moveMessage.setSender(player1);
        moveMessage.setRow(7);
        moveMessage.setCol(7);
        
        gameController.handleMove(moveMessage);

        // Assert
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/game/" + gameId), messageCaptor.capture());
        
        GameMessage broadcastedMove = messageCaptor.getValue();
        assertEquals(GameMessage.MessageType.MOVE, broadcastedMove.getType());
        assertEquals("X", broadcastedMove.getContent());
        // For the first move, timer is NOT started, turnStartTime should be 0 based on timer logic
        assertEquals(0, broadcastedMove.getTurnStartTime());
    }

    @Test
    void testHandleMove_TimerLogic() {
        // Arrange
        String gameId = "test-game-timer";
        String sessionId1 = "session-1";
        String player1 = "player1";
        String sessionId2 = "session-2";
        String player2 = "player2";

        // Join two players
        SimpMessageHeaderAccessor headerAccessor1 = SimpMessageHeaderAccessor.create();
        headerAccessor1.setSessionId(sessionId1);
        headerAccessor1.setSessionAttributes(new HashMap<>());
        GameMessage join1 = new GameMessage();
        join1.setGameId(gameId);
        join1.setSender(player1);
        join1.setMode(GameMessage.GameMode.MULTIPLE);
        gameController.joinGame(join1, headerAccessor1);

        SimpMessageHeaderAccessor headerAccessor2 = SimpMessageHeaderAccessor.create();
        headerAccessor2.setSessionId(sessionId2);
        headerAccessor2.setSessionAttributes(new HashMap<>());
        GameMessage join2 = new GameMessage();
        join2.setGameId(gameId);
        join2.setSender(player2);
        join2.setMode(GameMessage.GameMode.MULTIPLE);
        gameController.joinGame(join2, headerAccessor2);

        // Act - Player 1 moves (first move in game)
        GameMessage move1 = new GameMessage();
        move1.setGameId(gameId);
        move1.setSender(player1);
        move1.setRow(7);
        move1.setCol(7);
        gameController.handleMove(move1);

        // Player 2 moves (second move in game) - This should start the timer for Player 1
        reset(messagingTemplate);
        when(equippedEffectRepository.findByUser_UsernameIn(any())).thenReturn(List.of());
        
        GameMessage move2 = new GameMessage();
        move2.setGameId(gameId);
        move2.setSender(player2);
        move2.setRow(7);
        move2.setCol(8);
        long beforeMoveTime = System.currentTimeMillis();
        gameController.handleMove(move2);

        // Assert
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/game/" + gameId), messageCaptor.capture());
        
        GameMessage broadcastedMove2 = messageCaptor.getValue();
        assertEquals(GameMessage.MessageType.MOVE, broadcastedMove2.getType());
        assertEquals("O", broadcastedMove2.getContent());
        // Since player1 has already moved, timer starts now
        assertTrue(broadcastedMove2.getTurnStartTime() >= beforeMoveTime);
        assertTrue(broadcastedMove2.getTurnStartTime() <= System.currentTimeMillis());
    }
}
