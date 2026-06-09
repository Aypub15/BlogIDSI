package Dao;

import Metier.Article;
import Metier.Categorie;
import Metier.Comment;
import Metier.Media;
import Metier.User;

import java.util.List;
import java.util.Optional;

public interface ImpMetier {
    List<Categorie> getCategorieArrayList();
    Categorie getCategoryById(Long id);
    List<Article> getArticles();
    List<Article> listArticles(Long categorieId);
    Article getArticleById(Long id);
    void addArticle(Article article);
    void updateArticle(Article article);
    void removeArticle(Article article);

    List<Comment> getCommentsByArticleId(Long articleId);
    Comment getCommentById(Long id);
    void addComment(Comment comment);
    void updateComment(Comment comment);
    void removeComment(Comment comment);

    List<Media> listMedia();
    void addMedia(Media media);
    void removeMedia(Media media);

    void addCategory(Categorie category);
    void updateCategory(Categorie category);
    void removeCategory(Categorie category);

    List<User> getUsers();
    User getUserById(Long id);
    Optional<User> getUserByEmail(String email);
    long countUsers();
    void addUser(User user);
    void updateUser(User user);
    void removeUser(User user);
}
