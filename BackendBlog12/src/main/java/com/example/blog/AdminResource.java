package com.example.blog;

import Dao.ImpMetier;
import Dao.ImpMetierMethode;
import Metier.User;
import com.example.blog.dto.UserDto;
import com.example.blog.security.AuthService;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/admin")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AdminResource {
    private final ImpMetier metier = new ImpMetierMethode();
    private final AuthService authService = new AuthService(metier);

    @GET
    @Path("/users")
    public Response getUsers(@HeaderParam("Authorization") String authorization) {
        authService.requireAdmin(authorization);
        List<UserDto> users = metier.getUsers().stream().map(UserDto::new).toList();
        return Response.ok(users).build();
    }

    @DELETE
    @Path("/users/{id}")
    public Response deleteUser(@PathParam("id") Long id, @HeaderParam("Authorization") String authorization) {
        User currentUser = authService.requireAdmin(authorization);
        if (currentUser.getId().equals(id)) {
            throw new WebApplicationException("Un administrateur ne peut pas supprimer son propre compte", Response.Status.BAD_REQUEST);
        }

        User user = metier.getUserById(id);
        if (user == null) {
            throw new WebApplicationException("Utilisateur introuvable", Response.Status.NOT_FOUND);
        }

        metier.removeUser(user);
        return Response.noContent().build();
    }
}
