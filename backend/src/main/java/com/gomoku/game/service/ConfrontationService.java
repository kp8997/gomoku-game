package com.gomoku.game.service;

import com.gomoku.game.dto.ConfrontationDTO;
import com.gomoku.game.model.ConfrontationRecord;
import com.gomoku.game.model.User;
import com.gomoku.game.repository.ConfrontationRepository;
import com.gomoku.game.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ConfrontationService {

    @Autowired
    private ConfrontationRepository confrontationRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void recordWin(Long userId1, Long userId2, Long winnerId) {
        Long idA = Math.min(userId1, userId2);
        Long idB = Math.max(userId1, userId2);

        ConfrontationRecord record = confrontationRepository.findBetweenUsers(idA, idB)
                .orElseGet(() -> {
                    User userA = userRepository.findById(idA).orElseThrow();
                    User userB = userRepository.findById(idB).orElseThrow();
                    return ConfrontationRecord.builder()
                            .userA(userA)
                            .userB(userB)
                            .userAWins(0)
                            .userBWins(0)
                            .build();
                });

        if (winnerId.equals(idA)) {
            record.setUserAWins(record.getUserAWins() + 1);
        } else if (winnerId.equals(idB)) {
            record.setUserBWins(record.getUserBWins() + 1);
        }

        confrontationRepository.save(record);
    }

    public List<ConfrontationDTO> getConfrontationsForUser(Long userId) {
        List<ConfrontationRecord> records = confrontationRepository.findAllByUserId(userId);
        
        return records.stream().map(record -> {
            User opponent;
            int wins, losses;
            
            if (record.getUserA().getId().equals(userId)) {
                opponent = record.getUserB();
                wins = record.getUserAWins();
                losses = record.getUserBWins();
            } else {
                opponent = record.getUserA();
                wins = record.getUserBWins();
                losses = record.getUserAWins();
            }
            
            return ConfrontationDTO.builder()
                    .opponentUsername(opponent.getUsername())
                    .opponentFullName(opponent.getFullName())
                    .opponentAvatar(opponent.getAvatar())
                    .wins(wins)
                    .losses(losses)
                    .build();
        }).collect(Collectors.toList());
    }
}
