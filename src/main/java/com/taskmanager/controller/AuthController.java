package com.taskmanager.controller;

import com.taskmanager.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    // POST /api/auth/login
    // Body: { "username": "alex", "password": "1234" }
    // Returns: { "token": "eyJ..." }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            body.get("username"),
                            body.get("password")
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = jwtTokenProvider.generateToken(authentication);

            return ResponseEntity.ok(Map.of("token", token));

        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
    }
}
