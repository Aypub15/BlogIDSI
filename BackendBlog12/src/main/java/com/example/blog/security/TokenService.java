package com.example.blog.security;

import Metier.Role;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

public final class TokenService {
    private static final String SECRET = System.getProperty(
            "blog.auth.secret",
            "change-this-secret-before-production-blogidsi"
    );
    private static final long TTL_SECONDS = 60L * 60L * 24L * 7L;

    private TokenService() {
    }

    public static String create(Long userId, Role role) {
        long expiresAt = Instant.now().getEpochSecond() + TTL_SECONDS;
        String payload = userId + ":" + role.name() + ":" + expiresAt;
        return base64(payload) + "." + sign(payload);
    }

    public static Optional<TokenPayload> verify(String token) {
        if (token == null || token.isBlank() || !token.contains(".")) {
            return Optional.empty();
        }
        String[] parts = token.split("\\.", 2);
        String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
        if (!sign(payload).equals(parts[1])) {
            return Optional.empty();
        }
        String[] values = payload.split(":", 3);
        if (values.length != 3) {
            return Optional.empty();
        }
        long expiresAt = Long.parseLong(values[2]);
        if (expiresAt < Instant.now().getEpochSecond()) {
            return Optional.empty();
        }
        return Optional.of(new TokenPayload(Long.parseLong(values[0]), Role.valueOf(values[1])));
    }

    private static String base64(String value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private static String sign(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Impossible de signer le token", e);
        }
    }

    public record TokenPayload(Long userId, Role role) {
    }
}
