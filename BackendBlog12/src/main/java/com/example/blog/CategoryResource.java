package com.example.blog;

import Dao.ImpMetier;
import Dao.ImpMetierMethode;
import Metier.Categorie;
import com.example.blog.dto.CategoryDto;
import com.example.blog.dto.CategoryRequest;
import com.example.blog.security.AuthService;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CategoryResource {
    private final ImpMetier metier = new ImpMetierMethode();
    private final AuthService authService = new AuthService(metier);

    @GET
    public Response getAllCategories() {
        List<CategoryDto> categories = metier.getCategorieArrayList()
                .stream()
                .map(CategoryDto::new)
                .toList();
        return Response.ok(categories).build();
    }

    @POST
    public Response createCategory(CategoryRequest request, @HeaderParam("Authorization") String authorization) {
        authService.requireAdmin(authorization);
        if (request == null || request.name == null || request.name.isBlank()) {
            throw new WebApplicationException("Le nom de la catégorie est obligatoire", Response.Status.BAD_REQUEST);
        }

        Categorie category = new Categorie();
        category.setLibelle(request.name.trim());
        category.setDescription(request.description);
        category.setIcon(request.icon);
        metier.addCategory(category);
        return Response.status(Response.Status.CREATED).entity(new CategoryDto(category)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteCategory(@PathParam("id") Long id, @HeaderParam("Authorization") String authorization) {
        authService.requireAdmin(authorization);
        Categorie category = metier.getCategoryById(id);
        if (category == null) {
            throw new WebApplicationException("Catégorie introuvable", Response.Status.NOT_FOUND);
        }
        if (category.getArticles() != null && !category.getArticles().isEmpty()) {
            throw new WebApplicationException(
                    "Impossible de supprimer une catégorie qui contient des articles",
                    Response.Status.CONFLICT
            );
        }
        metier.removeCategory(category);
        return Response.noContent().build();
    }

    @PUT
    @Path("/{id}")
    public Response updateCategory(@PathParam("id") Long id, CategoryRequest request, @HeaderParam("Authorization") String authorization) {
        authService.requireAdmin(authorization);
        Categorie category = metier.getCategoryById(id);
        if (category == null) {
            throw new WebApplicationException("Categorie introuvable", Response.Status.NOT_FOUND);
        }
        if (request == null) {
            throw new WebApplicationException("Donnees categorie obligatoires", Response.Status.BAD_REQUEST);
        }
        if (request.name != null && !request.name.isBlank()) {
            category.setLibelle(request.name.trim());
        }
        if (request.description != null) {
            category.setDescription(request.description);
        }
        if (request.icon != null) {
            category.setIcon(request.icon.isBlank() ? "📁" : request.icon.trim());
        }
        metier.updateCategory(category);
        return Response.ok(new CategoryDto(category)).build();
    }
}
