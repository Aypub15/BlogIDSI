package com.example.blog;

import Dao.ImpMetier;
import Dao.ImpMetierMethode;
import Metier.Article;
import Metier.Categorie;
import Metier.Comment;
import Metier.Role;
import Metier.User;
import com.example.blog.dto.ArticleDto;
import com.example.blog.dto.ArticleRequest;
import com.example.blog.dto.CommentDto;
import com.example.blog.dto.CommentRequest;
import com.example.blog.security.AuthService;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.List;

@Path("/articles")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ArticleResource {
    private final ImpMetier metier = new ImpMetierMethode();
    private final AuthService authService = new AuthService(metier);

    @GET
    public Response getAllArticles(@HeaderParam("Authorization") String authorization) {
        User currentUser = authService.currentUser(authorization).orElse(null);
        List<ArticleDto> articles = metier.getArticles()
                .stream()
                .map(article -> new ArticleDto(article, currentUser))
                .toList();
        return Response.ok(articles).build();
    }

    @GET
    @Path("/{id}")
    public Response getArticleById(
            @PathParam("id") Long id,
            @HeaderParam("Authorization") String authorization
    ) {
        Article article = findArticle(id);
        User currentUser = authService.currentUser(authorization).orElse(null);
        return Response.ok(new ArticleDto(article, currentUser)).build();
    }

    @POST
    public Response createArticle(ArticleRequest request, @HeaderParam("Authorization") String authorization) {
        User currentUser = authService.requireUser(authorization);
        validateArticleRequest(request);

        Article article = new Article();
        article.setTitre(request.title.trim());
        article.setContenue(request.content == null ? "" : request.content.trim());
        article.setImage(request.image);
        article.setDate(LocalDateTime.now());
        article.setUser(currentUser);

        if (request.categoryId != null) {
            Categorie category = metier.getCategoryById(request.categoryId);
            if (category == null) {
                throw new WebApplicationException("Catégorie introuvable", Response.Status.BAD_REQUEST);
            }
            article.setCategorie(category);
        }

        metier.addArticle(article);
        return Response.status(Response.Status.CREATED).entity(new ArticleDto(article, currentUser)).build();
    }

    @PUT
    @Path("/{id}")
    public Response updateArticle(
            @PathParam("id") Long id,
            ArticleRequest request,
            @HeaderParam("Authorization") String authorization
    ) {
        User currentUser = authService.requireUser(authorization);
        Article article = findArticle(id);
        requireArticleOwnerOrAdmin(currentUser, article);
        validateArticleRequest(request);

        article.setTitre(request.title.trim());
        article.setContenue(request.content == null ? "" : request.content.trim());
        article.setImage(request.image);
        article.setDate(LocalDateTime.now());

        if (request.categoryId != null) {
            Categorie category = metier.getCategoryById(request.categoryId);
            if (category == null) {
                throw new WebApplicationException("Catégorie introuvable", Response.Status.BAD_REQUEST);
            }
            article.setCategorie(category);
        } else {
            article.setCategorie(null);
        }

        metier.updateArticle(article);
        return Response.ok(new ArticleDto(article, currentUser)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteArticle(@PathParam("id") Long id, @HeaderParam("Authorization") String authorization) {
        User currentUser = authService.requireUser(authorization);
        Article article = findArticle(id);
        requireArticleOwnerOrAdmin(currentUser, article);
        metier.removeArticle(article);
        return Response.noContent().build();
    }

    @GET
    @Path("/{id}/comments")
    public Response getComments(@PathParam("id") Long articleId, @HeaderParam("Authorization") String authorization) {
        findArticle(articleId);
        User currentUser = authService.currentUser(authorization).orElse(null);
        List<CommentDto> comments = metier.getCommentsByArticleId(articleId)
                .stream()
                .map(comment -> new CommentDto(comment, currentUser))
                .toList();
        return Response.ok(comments).build();
    }

    @POST
    @Path("/{id}/comments")
    public Response createComment(
            @PathParam("id") Long articleId,
            CommentRequest request,
            @HeaderParam("Authorization") String authorization
    ) {
        User currentUser = authService.requireUser(authorization);
        Article article = findArticle(articleId);
        if (request == null || request.text == null || request.text.isBlank()) {
            throw new WebApplicationException("Le commentaire est obligatoire", Response.Status.BAD_REQUEST);
        }

        Comment comment = new Comment();
        comment.setText(request.text.trim());
        comment.setArticle(article);
        comment.setUser(currentUser);
        comment.setPostdate(LocalDateTime.now());
        comment.setValitade(true);
        metier.addComment(comment);
        return Response.status(Response.Status.CREATED).entity(new CommentDto(comment, currentUser)).build();
    }

    private Article findArticle(Long id) {
        Article article = metier.getArticleById(id);
        if (article == null) {
            throw new WebApplicationException("Article introuvable", Response.Status.NOT_FOUND);
        }
        return article;
    }

    private void validateArticleRequest(ArticleRequest request) {
        if (request == null || request.title == null || request.title.isBlank()) {
            throw new WebApplicationException("Le titre est obligatoire", Response.Status.BAD_REQUEST);
        }
    }

    private void requireArticleOwnerOrAdmin(User currentUser, Article article) {
        boolean isOwner = article.getUser() != null && article.getUser().getId().equals(currentUser.getId());
        if (currentUser.getRole() != Role.ADMIN && !isOwner) {
            throw new WebApplicationException("Vous ne pouvez gérer que vos propres articles", Response.Status.FORBIDDEN);
        }
    }
}
