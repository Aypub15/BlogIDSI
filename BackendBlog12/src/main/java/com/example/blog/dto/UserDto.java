package com.example.blog.dto;

import Metier.Role;
import Metier.User;

public class UserDto {
    public Long id;
    public String name;
    public String email;
    public Role role;

    public UserDto() {
    }

    public UserDto(User user) {
        this.id = user.getId();
        this.name = user.getNom();
        this.email = user.getEmail();
        this.role = user.getRole();
    }
}
