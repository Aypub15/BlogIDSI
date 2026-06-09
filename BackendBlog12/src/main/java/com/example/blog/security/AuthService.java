package com.example.blog.security;

import Dao.ImpMetier;
import Dao.ImpMetierMethode;
import Metier.Role;
import Metier.User;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;

import java.util.Optional;

public class AuthService {
    private final ImpMetier metier;

    public AuthService() {
        this(new ImpMetierMethode());
    }

    public AuthService(ImpMetier metier) {
        this.metier = metier;
    }

    public Optional<User> currentUser(String authorizationHeader) {
        String token = extractBearerToken(authorizationHeader);
        if (token == null) {
            return Optional.empty();
        }
        return TokenService.verify(token)
                .map(TokenService.TokenPayload::userId)
                .map(metier::getUserById);
    }

    public User requireUser(String authorizationHeader) {
        return currentUser(authorizationHeader)
                .orElseThrow(() -> new WebApplicationException("Authentification requise", Response.Status.UNAUTHORIZED));
    }

    public User requireAdmin(String authorizationHeader) {
        User user = requireUser(authorizationHeader);
        if (user.getRole() != Role.ADMIN) {
            throw new WebApplicationException("Accès administrateur requis", Response.Status.FORBIDDEN);
        }
        return user;
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return null;
        }
        String prefix = "Bearer ";
        if (!authorizationHeader.regionMatches(true, 0, prefix, 0, prefix.length())) {
            return null;
        }
        return authorizationHeader.substring(prefix.length()).trim();
    }
}
