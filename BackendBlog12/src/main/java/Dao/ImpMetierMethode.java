package Dao;

import Metier.Article;
import Metier.Categorie;
import Metier.Comment;
import Metier.Media;
import Metier.Statut;
import Metier.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.EntityTransaction;
import jakarta.persistence.Persistence;
import jakarta.persistence.TypedQuery;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;
import java.security.CodeSource;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.function.Function;

public class ImpMetierMethode implements ImpMetier {
    private static final Map<String, String> DOTENV = loadDotenv();
    private static final EntityManagerFactory EMF = Persistence.createEntityManagerFactory("default", databaseProperties());

    private static Map<String, Object> databaseProperties() {
        Map<String, Object> properties = new HashMap<>();
        properties.put("jakarta.persistence.jdbc.driver", "org.postgresql.Driver");
        properties.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");

        String databaseUrl = firstNonBlank(env("SUPABASE_DB_URL"), env("DATABASE_URL"));
        if (databaseUrl != null) {
            ParsedDatabaseUrl parsedUrl = parseDatabaseUrl(databaseUrl);
            properties.put("jakarta.persistence.jdbc.url", parsedUrl.jdbcUrl());
            if (parsedUrl.user() != null) {
                properties.put("jakarta.persistence.jdbc.user", parsedUrl.user());
            }
            if (parsedUrl.password() != null) {
                properties.put("jakarta.persistence.jdbc.password", parsedUrl.password());
            }
        }

        putIfPresent(properties, "jakarta.persistence.jdbc.user",
                env("SUPABASE_DB_USER"), env("DB_USER"), env("PGUSER"));
        putIfPresent(properties, "jakarta.persistence.jdbc.password",
                env("SUPABASE_DB_PASSWORD"), env("DB_PASSWORD"), env("PGPASSWORD"));
        return properties;
    }

    private static ParsedDatabaseUrl parseDatabaseUrl(String rawUrl) {
        if (rawUrl.startsWith("jdbc:postgresql:")) {
            return new ParsedDatabaseUrl(ensureSsl(rawUrl), null, null);
        }

        String normalizedUrl = rawUrl.startsWith("postgres://")
                ? "postgresql://" + rawUrl.substring("postgres://".length())
                : rawUrl;
        normalizedUrl = stripPasswordBrackets(normalizedUrl);
        URI uri = URI.create(normalizedUrl);
        String rawUserInfo = uri.getRawUserInfo();
        String user = null;
        String password = null;
        if (rawUserInfo != null) {
            String[] userInfoParts = rawUserInfo.split(":", 2);
            user = decode(userInfoParts[0]);
            if (userInfoParts.length > 1) {
                password = decode(userInfoParts[1]);
            }
        }

        int port = uri.getPort() == -1 ? 5432 : uri.getPort();
        String path = uri.getRawPath() == null || uri.getRawPath().isBlank() ? "/postgres" : uri.getRawPath();
        String query = uri.getRawQuery();
        String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + path;
        if (query == null || query.isBlank()) {
            jdbcUrl += "?sslmode=require";
        } else {
            jdbcUrl += "?" + query;
            if (!query.toLowerCase().contains("sslmode=")) {
                jdbcUrl += "&sslmode=require";
            }
        }

        return new ParsedDatabaseUrl(jdbcUrl, user, password);
    }

    private static String stripPasswordBrackets(String url) {
        int schemeEnd = url.indexOf("://");
        int credentialsEnd = schemeEnd == -1 ? -1 : url.indexOf('@', schemeEnd + 3);
        if (schemeEnd == -1 || credentialsEnd == -1) {
            return url;
        }

        String prefix = url.substring(0, schemeEnd + 3);
        String userInfo = url.substring(schemeEnd + 3, credentialsEnd);
        String suffix = url.substring(credentialsEnd);
        int passwordStart = userInfo.indexOf(':');
        if (passwordStart == -1) {
            return url;
        }

        String user = userInfo.substring(0, passwordStart);
        String password = userInfo.substring(passwordStart + 1);
        if (password.length() >= 2 && password.startsWith("[") && password.endsWith("]")) {
            password = password.substring(1, password.length() - 1);
        }

        return prefix + user + ":" + password + suffix;
    }

    private static String ensureSsl(String jdbcUrl) {
        String lowerUrl = jdbcUrl.toLowerCase();
        if (lowerUrl.contains("sslmode=")) {
            return jdbcUrl;
        }
        return jdbcUrl + (jdbcUrl.contains("?") ? "&" : "?") + "sslmode=require";
    }

    private static void putIfPresent(Map<String, Object> properties, String key, String... values) {
        String value = firstNonBlank(values);
        if (value != null) {
            properties.put(key, value);
        }
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    private static String env(String key) {
        String fileValue = DOTENV.get(key);
        if (fileValue != null && !fileValue.isBlank()) {
            return fileValue;
        }
        String systemValue = System.getenv(key);
        if (systemValue != null && !systemValue.isBlank()) {
            return systemValue;
        }
        return null;
    }

    private static Map<String, String> loadDotenv() {
        Map<String, String> values = new HashMap<>();
        for (Path path : dotenvCandidates()) {
            if (Files.isRegularFile(path)) {
                readDotenv(path, values);
            }
        }
        return Collections.unmodifiableMap(values);
    }

    private static List<Path> dotenvCandidates() {
        Path userDir = Path.of(System.getProperty("user.dir"));
        Path classRoot = classRoot();
        return List.of(
                userDir.resolve(".env"),
                userDir.resolve("BackendBlog12").resolve(".env"),
                classRoot.resolve(".env"),
                classRoot.resolve("../../..").normalize().resolve(".env"),
                Path.of("C:/Users/hp/Desktop/blog/BackendBlog12/.env")
        );
    }

    private static Path classRoot() {
        try {
            CodeSource codeSource = ImpMetierMethode.class.getProtectionDomain().getCodeSource();
            if (codeSource != null && codeSource.getLocation() != null) {
                return Path.of(codeSource.getLocation().toURI());
            }
        } catch (Exception ignored) {
            // Fall back to the process directory when the class location is unavailable.
        }
        return Path.of(System.getProperty("user.dir"));
    }

    private static void readDotenv(Path path, Map<String, String> values) {
        try {
            for (String rawLine : Files.readAllLines(path, StandardCharsets.UTF_8)) {
                String line = rawLine.trim();
                if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                    continue;
                }
                String[] parts = line.split("=", 2);
                String key = parts[0].trim();
                String value = stripQuotes(parts[1].trim());
                values.putIfAbsent(key, value);
            }
        } catch (Exception ignored) {
            // Environment variables still work if the local .env file cannot be read.
        }
    }

    private static String stripQuotes(String value) {
        if (value.length() >= 2) {
            char first = value.charAt(0);
            char last = value.charAt(value.length() - 1);
            if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
                return value.substring(1, value.length() - 1);
            }
        }
        return value;
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private record ParsedDatabaseUrl(String jdbcUrl, String user, String password) {
    }

    private <T> T read(Function<EntityManager, T> work) {
        EntityManager em = EMF.createEntityManager();
        try {
            return work.apply(em);
        } finally {
            em.close();
        }
    }

    private void write(Consumer<EntityManager> work) {
        EntityManager em = EMF.createEntityManager();
        EntityTransaction transaction = em.getTransaction();
        try {
            transaction.begin();
            work.accept(em);
            transaction.commit();
        } catch (RuntimeException exception) {
            if (transaction.isActive()) {
                transaction.rollback();
            }
            throw exception;
        } finally {
            em.close();
        }
    }

    @Override
    public List<Categorie> getCategorieArrayList() {
        return read(em -> em.createQuery(
                        "SELECT DISTINCT c FROM Categorie c LEFT JOIN FETCH c.articles ORDER BY c.libelle",
                        Categorie.class
                )
                .getResultList());
    }

    @Override
    public Categorie getCategoryById(Long id) {
        return read(em -> em.createQuery(
                        "SELECT DISTINCT c FROM Categorie c LEFT JOIN FETCH c.articles WHERE c.id = :id",
                        Categorie.class
                )
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElse(null));
    }

    @Override
    public List<Article> getArticles() {
        return read(em -> em.createQuery(
                        "SELECT DISTINCT a FROM Article a " +
                                "LEFT JOIN FETCH a.user " +
                                "LEFT JOIN FETCH a.categorie " +
                                "LEFT JOIN FETCH a.comments " +
                                "ORDER BY a.date DESC",
                        Article.class
                )
                .getResultList());
    }

    @Override
    public List<Article> listArticles(Long categoryId) {
        return read(em -> em.createQuery(
                        "SELECT DISTINCT a FROM Article a " +
                                "LEFT JOIN FETCH a.user " +
                                "LEFT JOIN FETCH a.categorie " +
                                "LEFT JOIN FETCH a.comments " +
                                "WHERE a.categorie.id = :catId AND a.statut = :statut " +
                                "ORDER BY a.date DESC",
                        Article.class
                )
                .setParameter("catId", categoryId)
                .setParameter("statut", Statut.PUBLISHED)
                .getResultList());
    }

    @Override
    public Article getArticleById(Long id) {
        return read(em -> em.createQuery(
                        "SELECT DISTINCT a FROM Article a " +
                                "LEFT JOIN FETCH a.user " +
                                "LEFT JOIN FETCH a.categorie " +
                                "LEFT JOIN FETCH a.comments " +
                                "WHERE a.id = :id",
                        Article.class
                )
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElse(null));
    }

    @Override
    public void addArticle(Article article) {
        write(em -> {
            if (article.getUser() != null) {
                article.setUser(em.merge(article.getUser()));
            }
            if (article.getCategorie() != null) {
                article.setCategorie(em.merge(article.getCategorie()));
            }
            em.persist(article);
        });
    }

    @Override
    public void updateArticle(Article article) {
        write(em -> em.merge(article));
    }

    @Override
    public void removeArticle(Article article) {
        write(em -> em.remove(em.merge(article)));
    }

    @Override
    public List<Comment> getCommentsByArticleId(Long articleId) {
        return read(em -> em.createQuery(
                        "SELECT c FROM Comment c " +
                                "LEFT JOIN FETCH c.user " +
                                "WHERE c.article.id = :articleId AND c.isValitade = true " +
                                "ORDER BY c.postdate ASC",
                        Comment.class
                )
                .setParameter("articleId", articleId)
                .getResultList());
    }

    @Override
    public Comment getCommentById(Long id) {
        return read(em -> em.createQuery(
                        "SELECT c FROM Comment c LEFT JOIN FETCH c.user WHERE c.id = :id",
                        Comment.class
                )
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElse(null));
    }

    @Override
    public void addComment(Comment comment) {
        write(em -> {
            if (comment.getArticle() != null) {
                comment.setArticle(em.merge(comment.getArticle()));
            }
            if (comment.getUser() != null) {
                comment.setUser(em.merge(comment.getUser()));
            }
            em.persist(comment);
        });
    }

    @Override
    public void updateComment(Comment comment) {
        write(em -> em.merge(comment));
    }

    @Override
    public void removeComment(Comment comment) {
        write(em -> em.remove(em.merge(comment)));
    }

    @Override
    public List<Media> listMedia() {
        return read(em -> em.createQuery("SELECT m FROM Media m", Media.class).getResultList());
    }

    @Override
    public void addMedia(Media media) {
        write(em -> {
            if (media.getArticle() != null) {
                media.setArticle(em.merge(media.getArticle()));
            }
            em.persist(media);
        });
    }

    @Override
    public void removeMedia(Media media) {
        write(em -> em.remove(em.merge(media)));
    }

    @Override
    public void addCategory(Categorie category) {
        write(em -> em.persist(category));
    }

    @Override
    public void updateCategory(Categorie category) {
        write(em -> em.merge(category));
    }

    @Override
    public void removeCategory(Categorie category) {
        write(em -> em.remove(em.merge(category)));
    }

    @Override
    public List<User> getUsers() {
        return read(em -> em.createQuery("SELECT u FROM User u ORDER BY u.id DESC", User.class).getResultList());
    }

    @Override
    public User getUserById(Long id) {
        return read(em -> em.find(User.class, id));
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        return read(em -> {
            TypedQuery<User> query = em.createQuery(
                    "SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email)",
                    User.class
            );
            query.setParameter("email", email);
            query.setMaxResults(1);
            return query.getResultStream().findFirst();
        });
    }

    @Override
    public long countUsers() {
        return read(em -> em.createQuery("SELECT COUNT(u) FROM User u", Long.class).getSingleResult());
    }

    @Override
    public void addUser(User user) {
        write(em -> em.persist(user));
    }

    @Override
    public void updateUser(User user) {
        write(em -> em.merge(user));
    }

    @Override
    public void removeUser(User user) {
        write(em -> em.remove(em.merge(user)));
    }
}
