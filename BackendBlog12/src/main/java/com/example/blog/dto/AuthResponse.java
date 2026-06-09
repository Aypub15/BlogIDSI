package com.example.blog.dto;

public class AuthResponse {
    public String token;
    public UserDto user;

    public AuthResponse() {
    }

    public AuthResponse(String token, UserDto user) {
        this.token = token;
        this.user = user;
    }
}
