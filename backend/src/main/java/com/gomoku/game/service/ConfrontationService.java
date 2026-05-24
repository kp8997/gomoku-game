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
        if (userId1 != null && userId2 != null) {
            // Case 1: Both authenticated — H2H record
            Long idA = Math.min(userId1, userId2);
            Long idB = Math.max(userId1, userId2);

            ConfrontationRecord record = confrontationRepository.findBetweenUsers(idA, idB)
                    .orElseGet(() -> {
                        User userA = userRepository.findById(idA).orElseThrow();
                        User userB = userRepository.findById(idB).orElseThrow();
                        return ConfrontationRecord.builder()
                                .userA(userA).userB(userB)
                                .userAWins(0).userBWins(0).build();
                    });

            if (winnerId.equals(idA)) {
                record.setUserAWins(record.getUserAWins() + 1);
            } else if (winnerId.equals(idB)) {
                record.setUserBWins(record.getUserBWins() + 1);
            }
            confrontationRepository.save(record);
        } else {
            // Case 2: Auth vs Anonymous
            Long authUserId = (userId1 != null) ? userId1 : userId2;

            ConfrontationRecord record = confrontationRepository.findAnonymousRecordForUser(authUserId)
                    .orElseGet(() -> {
                        User userA = userRepository.findById(authUserId).orElseThrow();
                        return ConfrontationRecord.builder()
                                .userA(userA).userB(null)
                                .userAWins(0).userBWins(0).build();
                    });

            if (winnerId != null && winnerId.equals(authUserId)) {
                record.setUserAWins(record.getUserAWins() + 1);
            } else {
                record.setUserBWins(record.getUserBWins() + 1);
            }
            confrontationRepository.save(record);
        }
    }

    public com.gomoku.game.dto.UserStatsDTO getUserStats(Long userId) {
        List<ConfrontationRecord> records = confrontationRepository.findAllByUserId(userId);

        int totalWins = 0, totalLosses = 0;

        for (ConfrontationRecord record : records) {
            if (record == null) continue;

            int winsA = record.getUserAWins() != null ? record.getUserAWins() : 0;
            int winsB = record.getUserBWins() != null ? record.getUserBWins() : 0;

            if (record.getUserA() != null && record.getUserA().getId().equals(userId)) {
                totalWins += winsA;
                totalLosses += winsB;
            } else if (record.getUserB() != null && record.getUserB().getId().equals(userId)) {
                totalWins += winsB;
                totalLosses += winsA;
            }
        }

        int totalMatches = totalWins + totalLosses;
        double winRate = (totalMatches > 0)
            ? Math.round((double) totalWins / totalMatches * 1000.0) / 10.0
            : 0.0;

        return new com.gomoku.game.dto.UserStatsDTO(totalWins, totalLosses, totalMatches, winRate);
    }

    public List<ConfrontationDTO> getConfrontationsForUser(Long userId) {
        List<ConfrontationRecord> records = confrontationRepository.findAllByUserId(userId);

        return records.stream()
                .filter(java.util.Objects::nonNull)
                .map(record -> {
            int wins = 0, losses = 0;
            String opponentUsername = "anonymous", opponentFullName = "Anonymous Players", opponentAvatar = null;

            int winsA = record.getUserAWins() != null ? record.getUserAWins() : 0;
            int winsB = record.getUserBWins() != null ? record.getUserBWins() : 0;

            if (record.getUserA() != null && record.getUserA().getId().equals(userId)) {
                wins = winsA;
                losses = winsB;
                if (record.getUserB() != null) {
                    opponentUsername = record.getUserB().getUsername();
                    opponentFullName = record.getUserB().getFullName();
                    opponentAvatar = record.getUserB().getAvatar();
                }
            } else if (record.getUserB() != null && record.getUserB().getId().equals(userId)) {
                opponentUsername = record.getUserA() != null ? record.getUserA().getUsername() : "anonymous";
                opponentFullName = record.getUserA() != null ? record.getUserA().getFullName() : "Anonymous Players";
                opponentAvatar = record.getUserA() != null ? record.getUserA().getAvatar() : null;
                wins = winsB;
                losses = winsA;
            }

            return ConfrontationDTO.builder()
                    .opponentUsername(opponentUsername)
                    .opponentFullName(opponentFullName)
                    .opponentAvatar(opponentAvatar)
                    .wins(wins)
                    .losses(losses)
                    .build();
        }).collect(Collectors.toList());
    }
}
