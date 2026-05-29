package com.gomoku.game.controller;

import com.gomoku.game.dto.AchievementResponse;
import com.gomoku.game.dto.EquipEffectRequest;
import com.gomoku.game.dto.EquipSkinRequest;
import com.gomoku.game.model.User;
import com.gomoku.game.repository.UserRepository;
import com.gomoku.game.service.AchievementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/achievements")
public class AchievementController {

    @Autowired
    private AchievementService achievementService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<AchievementResponse> getAchievements(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        AchievementResponse response = achievementService.getAchievements(user.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/equip")
    public ResponseEntity<Void> equipEffect(Authentication authentication, @RequestBody EquipEffectRequest request) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        achievementService.equipEffect(user.getId(), request.getEffectKey());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/unequip")
    public ResponseEntity<Void> unequipEffect(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        achievementService.unequipEffect(user.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/equip-skin")
    public ResponseEntity<Void> equipSkin(Authentication authentication, @RequestBody EquipSkinRequest request) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        achievementService.equipSkin(user.getId(), request.getSkinKey());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/unequip-skin")
    public ResponseEntity<Void> unequipSkin(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        achievementService.unequipSkin(user.getId());
        return ResponseEntity.ok().build();
    }
}
