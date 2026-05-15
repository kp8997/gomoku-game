package com.gomoku.game.service;

import com.gomoku.game.dto.AuthResponse;
import com.gomoku.game.dto.LoginRequest;
import com.gomoku.game.dto.SignupRequest;
import com.gomoku.game.model.User;
import com.gomoku.game.repository.UserRepository;
import com.gomoku.game.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse signup(SignupRequest request) {
        validateSignup(request);
        
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .avatar(request.getAvatar())
                .build();

        user = userRepository.save(user);

        String token = tokenProvider.generateTokenFromUsername(user.getUsername());

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .avatar(user.getAvatar())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String token = tokenProvider.generateTokenFromUsername(user.getUsername());

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .avatar(user.getAvatar())
                .build();
    }

    private void validateSignup(SignupRequest request) {
        if (request.getUsername() == null || request.getUsername().length() < 3) {
            throw new RuntimeException("Username must be at least 3 characters long");
        }
        
        String password = request.getPassword();
        if (password == null || password.length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters long");
        }
        
        boolean hasLetter = password.chars().anyMatch(Character::isLetter);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = password.matches(".*[!@#$%^&*(),.?\":{}|<>].*");
        
        if (!hasLetter || !hasDigit || !hasSpecial) {
            throw new RuntimeException("Password must contain at least one letter, one number, and one special character");
        }
        
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new RuntimeException("Full name is required");
        }
    }
}
