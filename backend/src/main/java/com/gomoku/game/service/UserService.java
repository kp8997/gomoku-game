package com.gomoku.game.service;

import com.gomoku.game.dto.ConfrontationDTO;
import com.gomoku.game.dto.ProfileUpdateRequest;
import com.gomoku.game.dto.UserProfileResponse;
import com.gomoku.game.model.User;
import com.gomoku.game.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConfrontationService confrontationService;

    public UserProfileResponse getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ConfrontationDTO> confrontations = confrontationService.getConfrontationsForUser(user.getId());

        return UserProfileResponse.builder()
                .username(user.getUsername())
                .fullName(user.getFullName())
                .avatar(user.getAvatar())
                .confrontations(confrontations)
                .build();
    }

    public UserProfileResponse updateProfile(String username, ProfileUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }

        user = userRepository.save(user);

        List<ConfrontationDTO> confrontations = confrontationService.getConfrontationsForUser(user.getId());

        return UserProfileResponse.builder()
                .username(user.getUsername())
                .fullName(user.getFullName())
                .avatar(user.getAvatar())
                .confrontations(confrontations)
                .build();
    }
}
