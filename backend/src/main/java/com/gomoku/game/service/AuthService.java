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
}
