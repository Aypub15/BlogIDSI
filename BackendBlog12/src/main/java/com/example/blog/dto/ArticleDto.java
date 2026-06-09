package com.example.blog.dto;

import Metier.Article;
import Metier.Categorie;
import Metier.User;

import java.time.format.DateTimeFormatter;

public class ArticleDto {
    public Long id;
    public String title;
    public String description;
    public String content;
    public String category;
    public String categoryId;
    public String image;
    public String author;
    public Long authorId;
    public String authorAvatar;
    public String date;
    public int readTime;
    public int likes;
    public int comments;
    public boolean featured;
    public boolean canDelete;

    public ArticleDto() {
    }

    public ArticleDto(Article article) {
        this(article, null);
    }

    public ArticleDto(Article article, User currentUser) {
        Categorie categoryEntity = article.getCategorie();
        User authorEntity = article.getUser();
        String body = article.getContenue() == null ? "" : article.getContenue();
        String plainText = body.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
        String authorName = authorEntity == null ? "Auteur" : authorEntity.getNom();

        this.id = article.getId();
        this.title = article.getTitre();
        this.description = plainText.length() > 180 ? plainText.substring(0, 180) + "..." : plainText;
        this.content = body;
        this.category = categoryEntity == null ? "Général" : categoryEntity.getLibelle();
        this.categoryId = categoryEntity == null || categoryEntity.getId() == null ? null : String.valueOf(categoryEntity.getId());
        this.image = article.getImage() == null || article.getImage().isBlank()
                ? "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900"
                : article.getImage();
        this.author = authorName;
        this.authorId = authorEntity == null ? null : authorEntity.getId();
        this.authorAvatar = "https://ui-avatars.com/api/?name=" + authorName.replace(" ", "+") + "&background=2458D8&color=fff";
        this.date = article.getDate() == null
                ? ""
                : article.getDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
        this.readTime = Math.max(1, (int) Math.ceil(Math.max(plainText.length(), 300) / 900.0));
        this.likes = article.getVues();
        this.comments = article.getComments() == null ? 0 : article.getComments().size();
        this.featured = true;
        this.canDelete = currentUser != null && (
                currentUser.getRole() == Metier.Role.ADMIN ||
                        (authorEntity != null && authorEntity.getId().equals(currentUser.getId()))
        );
    }
}
