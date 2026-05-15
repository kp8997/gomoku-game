package com.gomoku.game.controller;

import com.gomoku.game.dto.ProfileUpdateRequest;
import com.gomoku.game.dto.UserProfileResponse;
import com.gomoku.game.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

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
}
