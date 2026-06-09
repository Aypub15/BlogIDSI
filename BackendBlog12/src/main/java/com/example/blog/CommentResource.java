package com.example.blog;

import Dao.ImpMetier;
import Dao.ImpMetierMethode;
import Metier.Comment;
import Metier.Role;
import Metier.User;
import com.example.blog.security.AuthService;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/comments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CommentResource {
    private final ImpMetier metier = new ImpMetierMethode();
    private final AuthService authService = new AuthService(metier);

    @DELETE
    @Path("/{id}")
    public Response deleteComment(@PathParam("id") Long id, @HeaderParam("Authorization") String authorization) {
        User currentUser = authService.requireUser(authorization);
        Comment comment = metier.getCommentById(id);
        if (comment == null) {
            throw new WebApplicationException("Commentaire introuvable", Response.Status.NOT_FOUND);
        }

        boolean isOwner = comment.getUser() != null && comment.getUser().getId().equals(currentUser.getId());
        if (currentUser.getRole() != Role.ADMIN && !isOwner) {
            throw new WebApplicationException("Vous ne pouvez supprimer que vos commentaires", Response.Status.FORBIDDEN);
        }

        metier.removeComment(comment);
        return Response.noContent().build();
    }
}
