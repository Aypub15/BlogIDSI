package com.example.blog;

import Dao.ImpMetier;
import Dao.ImpMetierMethode;
import Metier.Role;
import Metier.User;
import com.example.blog.dto.AuthRequest;
import com.example.blog.dto.AuthResponse;
import com.example.blog.dto.ChangePasswordRequest;
import com.example.blog.dto.UserDto;
import com.example.blog.security.AuthService;
import com.example.blog.security.PasswordUtil;
import com.example.blog.security.TokenService;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {
    private final ImpMetier metier = new ImpMetierMethode();
    private final AuthService authService = new AuthService(metier);

    @POST
    @Path("/register")
    public Response register(AuthRequest request) {
        Response validationError = validateAuthRequest(request, true);
        if (validationError != null) {
            return validationError;
        }
        String email = request.email.trim().toLowerCase();

        if (metier.getUserByEmail(email).isPresent()) {
            return plainError("Cet email existe deja", Response.Status.CONFLICT);
        }

        User user = new User();
        user.setNom(request.name == null || request.name.isBlank() ? email.split("@")[0] : request.name.trim());
        user.setEmail(email);
        user.setMot_pass(PasswordUtil.hash(request.password));
        user.setRole(resolveRoleForNewUser(email));
        metier.addUser(user);

        return Response.status(Response.Status.CREATED).entity(toAuthResponse(user)).build();
    }

    @POST
    @Path("/login")
    public Response login(AuthRequest request) {
        Response validationError = validateAuthRequest(request, false);
        if (validationError != null) {
            return validationError;
        }
        String email = request.email.trim().toLowerCase();
        User user = metier.getUserByEmail(email).orElse(null);
        if (user == null) {
            return plainError("Email ou mot de passe incorrect", Response.Status.UNAUTHORIZED);
        }

        boolean passwordMatches = PasswordUtil.verify(request.password, user.getMot_pass());
        boolean legacyPlainTextMatches = request.password.equals(user.getMot_pass());
        if (!passwordMatches && !legacyPlainTextMatches) {
            return plainError("Email ou mot de passe incorrect", Response.Status.UNAUTHORIZED);
        }
        if (legacyPlainTextMatches) {
            user.setMot_pass(PasswordUtil.hash(request.password));
            metier.updateUser(user);
        }

        return Response.ok(toAuthResponse(user)).build();
    }

    @GET
    @Path("/me")
    public Response me(@HeaderParam("Authorization") String authorization) {
        User currentUser = authService.requireUser(authorization);
        return Response.ok(new UserDto(currentUser)).build();
    }

    @POST
    @Path("/change-password")
    public Response changePassword(@HeaderParam("Authorization") String authorization, ChangePasswordRequest request) {
        User currentUser = authService.currentUser(authorization).orElse(null);
        if (currentUser == null) {
            return plainError("Connexion requise", Response.Status.UNAUTHORIZED);
        }
        if (request == null || request.currentPassword == null || request.currentPassword.isBlank()) {
            return plainError("Mot de passe actuel obligatoire", Response.Status.BAD_REQUEST);
        }
        if (request.newPassword == null || request.newPassword.length() < 6) {
            return plainError("Nouveau mot de passe minimum 6 caracteres", Response.Status.BAD_REQUEST);
        }

        boolean passwordMatches = PasswordUtil.verify(request.currentPassword, currentUser.getMot_pass());
        boolean legacyPlainTextMatches = request.currentPassword.equals(currentUser.getMot_pass());
        if (!passwordMatches && !legacyPlainTextMatches) {
            return plainError("Mot de passe actuel incorrect", Response.Status.UNAUTHORIZED);
        }

        currentUser.setMot_pass(PasswordUtil.hash(request.newPassword));
        metier.updateUser(currentUser);
        return Response.noContent().build();
    }

    private Response validateAuthRequest(AuthRequest request, boolean requireName) {
        if (request == null || request.email == null || request.email.isBlank()) {
            return plainError("Email obligatoire", Response.Status.BAD_REQUEST);
        }
        if (request.password == null || request.password.length() < 6) {
            return plainError("Mot de passe minimum 6 caracteres", Response.Status.BAD_REQUEST);
        }
        if (requireName && (request.name == null || request.name.isBlank())) {
            return plainError("Nom obligatoire", Response.Status.BAD_REQUEST);
        }
        return null;
    }

    private Response plainError(String message, Response.Status status) {
        return Response.status(status).type(MediaType.TEXT_PLAIN).entity(message).build();
    }

    private Role resolveRoleForNewUser(String email) {
        if (metier.countUsers() == 0 || email.equalsIgnoreCase("admin@blogidsi.com")) {
            return Role.ADMIN;
        }
        return Role.USER;
    }

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(TokenService.create(user.getId(), user.getRole()), new UserDto(user));
    }
}
