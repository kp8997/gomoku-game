package com.gomoku.game.controller;

import com.gomoku.game.dto.ProfileUpdateRequest;
import com.gomoku.game.dto.UserProfileResponse;
import com.gomoku.game.dto.UserStatsDTO;
import com.gomoku.game.service.ConfrontationService;
import com.gomoku.game.service.UserService;
import com.gomoku.game.model.User;
import com.gomoku.game.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ConfrontationService confrontationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(userService.getProfile(username));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            Authentication authentication,
            @RequestBody ProfileUpdateRequest request) {
        String username = authentication.getName();
        return ResponseEntity.ok(userService.updateProfile(username, request));
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsDTO> getUserStats(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserStatsDTO stats = confrontationService.getUserStats(user.getId());
        return ResponseEntity.ok(stats);
    }
}
