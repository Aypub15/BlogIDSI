package com.example.blog.dto;

import Metier.Comment;
import Metier.Role;
import Metier.User;

import java.time.format.DateTimeFormatter;

public class CommentDto {
    public Long id;
    public String author;
    public Long authorId;
    public String authorAvatar;
    public String content;
    public String date;
    public int likes;
    public boolean canDelete;

    public CommentDto() {
    }

    public CommentDto(Comment comment, User currentUser) {
        User authorEntity = comment.getUser();
        String authorName = authorEntity == null ? "Utilisateur" : authorEntity.getNom();
        this.id = comment.getId();
        this.author = authorName;
        this.authorId = authorEntity == null ? null : authorEntity.getId();
        this.authorAvatar = "https://ui-avatars.com/api/?name=" + authorName.replace(" ", "+") + "&background=0F8F7B&color=fff";
        this.content = comment.getText();
        this.date = comment.getPostdate() == null
                ? ""
                : comment.getPostdate().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
        this.likes = 0;
        this.canDelete = currentUser != null && (
                currentUser.getRole() == Role.ADMIN ||
                        (authorEntity != null && authorEntity.getId().equals(currentUser.getId()))
        );
    }
}
