package com.example.blog.dto;

import Metier.Categorie;

public class CategoryDto {
    public String id;
    public String name;
    public String description;
    public String icon;
    public int count;

    public CategoryDto() {
    }

    public CategoryDto(Categorie category) {
        this.id = String.valueOf(category.getId());
        this.name = category.getLibelle();
        this.description = category.getDescription();
        this.icon = category.getIcon() == null || category.getIcon().isBlank() ? "📁" : category.getIcon();
        this.count = category.getArticles() == null ? 0 : category.getArticles().size();
    }
}
