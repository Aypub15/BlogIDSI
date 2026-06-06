# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

Monorepo containing:

- **FrontendBlog** - React 19 + TypeScript + Vite SPA
- **BackendBlog12** - Jakarta EE 10 + JPA/Hibernate REST API

Applications run independently; develop concurrently.

---

## Quick Start

### FrontendBlog

```bash
cd FrontendBlog
npm ci
npm run dev
```

### BackendBlog12

```bash
cd BackendBlog12
mvn clean package
# Deploy target/blog.war to Tomcat 10+ / Jetty 11+
```

---

## Common Development Commands

### FrontendBlog (run from `FrontendBlog/`)

```bash
# Install dependencies
npm ci

# Development server (HMR on http://localhost:5173)
npm run dev

# TypeScript check + production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# Run tests (Vitest, watch mode)
npm run test

# Run tests once (CI)
npm run test -- --run

# Run specific test file
npm run test -- --include src/components/Navbar.test.tsx

# Run tests matching pattern
npm run test -- -t "navbar"
```

### BackendBlog12 (run from `BackendBlog12/`)

```bash
# Clean, compile, install to local Maven repo
mvn clean install

# Package WAR (target/blog.war)
mvn package

# Run tests
mvn test

# Run specific test class
mvn test -Dtest=ArticleResourceTest

# Run specific test method
mvn test -Dtest=ArticleResourceTest#testGetArticles

# Skip tests
mvn package -DskipTests
```

---

## Architecture

### Frontend

**Stack**: React 19, TypeScript 6, Vite 8, Tailwind CSS 4, React Router DOM 7, Supabase client.

**Entry**: `src/main.tsx` → `<AuthProvider>` → `App.tsx` (router).

**Key folders**:
- `api/` - fetch wrappers (`blog.ts`, `chat.ts`)
- `auth/` - Supabase client and React context
- `components/` - reusable UI (Navbar, BlogCard, Footer, etc.)
- `pages/` - route components (HomePage, ArticlesPage, ArticleDetail, AuthPage, etc.)
- `styles/` - CSS per page
- `types/` - TypeScript definitions

**Routing**: All routes in `App.tsx` using React Router DOM.

**State**: React Context for theme and auth. No external state library.

**Testing**: Vitest + Testing Library. Colocated `*.test.tsx`. Setup at `src/test/setup.ts`.

**Gotchas**:
- `@/` alias works only in tests (defined in `vitest.config.ts`). Use relative imports in app code or add alias to `vite.config.ts`.
- Env vars must be `VITE_*` to be exposed via `import.meta.env`.

---

### Backend

**Stack**: Java 17, Jakarta EE 10 (JAX-RS 3.1, CDI 4.1, Servlet 6.1), Jersey 3.1, Hibernate ORM 6.4, PostgreSQL, JUnit 5.

**Base path**: `/api` (from `HelloApplication.java`).

**Resources** (`com.example.blog`):
- `AuthResource` - login, register
- `ArticleResource` - article CRUD
- `CategoryResource` - categories
- `CommentResource` - comments
- `AdminResource` - admin-only
- `CORSFilter`, `PreflightResource` - CORS

**DTOs** (`com.example.blog.dto`):
- `AuthRequest`, `AuthResponse`
- `ArticleDto`, `ArticleRequest`
- `CategoryDto`, `CategoryRequest`
- `CommentDto`, `CommentRequest`
- `UserDto`

**Security** (`com.example.blog.security`):
- `AuthService` - business logic (register, verify, login)
- `PasswordUtil` - BCrypt hashing
- `TokenService` - JWT generation/validation

**DAO** (`Dao`):
- `ImpMetier` interface (generic CRUD)
- `ImpMetierMethode` JPA implementation (EntityManager)

**Entities** (`Metier`):
- JPA entities: `Article`, `Categorie`, `Comment`, `User`, `Role`, `Statut`, `Media`
- Relationships: `Article` → User (author), → Categorie, → Media, → Comments (one-to-many)

**Persistence** (`src/main/resources/META-INF/persistence.xml`):
- PostgreSQL JDBC: `jdbc:postgresql://localhost:5432/postgres?sslmode=require`
- `hibernate.hbm2ddl.auto=update` (dev)
- `show_sql` and `format_sql` true

**Build**: WAR file (`target/blog.war`) for Servlet 6.0+ containers.

---

## Environment

### Frontend `.env` (in `FrontendBlog/`)

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Used by `auth/supabaseClient.ts`. If switching to custom backend, adjust `api/client.ts` base URL to `http://localhost:8080/api` (or deployed backend).

### Backend Database

Default `persistence.xml` uses PostgreSQL on localhost, user `postgres`, empty password. Override via system properties:

```bash
mvn package -Djakarta.persistence.jdbc.url=jdbc:postgresql://... -Djakarta.persistence.jdbc.user=... -Djakarta.persistence.jdbc.password=...
```

Alternatively configure JNDI datasource in Tomcat/Jetty and update `persistence.xml` to use `java:comp/env/jdbc/...`.

---

## Testing

### Frontend

- Frameworks: Vitest, @testing-library/react
- Setup: `src/test/setup.ts` (jsdom, global mocks)
- Mocks: `auth/authProvider.tsx` and `@supabase/supabase-js` (see `AGENTS.md`)

Run tests with commands above.

### Backend

- JUnit 5 (Jupiter)
- Place tests in `src/test/java/` following Maven layout
- Use `@Test` from `org.junit.jupiter.api`
- May need test database or Testcontainers for isolated tests

---

## Important Files

**Frontend**:
- `FrontendBlog/src/App.tsx` - routing
- `FrontendBlog/src/api/blog.ts` - backend API calls
- `FrontendBlog/src/auth/authProvider.tsx` - auth state
- `FrontendBlog/vite.config.ts` - dev server/build config
- `FrontendBlog/tsconfig.app.json` - TS options

**Backend**:
- `BackendBlog12/src/main/java/com/example/blog/HelloApplication.java` - JAX-RS setup
- `BackendBlog12/src/main/java/com/example/blog/AuthResource.java` - auth endpoints
- `BackendBlog12/src/main/java/com/example/blog/ArticleResource.java` - articles API
- `BackendBlog12/src/main/java/Dao/ImpMetierMethode.java` - data access
- `BackendBlog12/src/main/resources/META-INF/persistence.xml` - JPA config

**Notes**:
- `BackendBlog12/pom.xml` uses Java 17, Jakarta EE 10, JUnit 5.
- CORS enabled; ensure frontend origin is allowed during development.

### FrontendBlog
- Technology stack: React 19, TypeScript, Vite, Tailwind CSS, React Router DOM
- Entry point: `src/main.tsx`
- Main App component: `src/App.tsx`
- Pages: Located in `src/pages/` (HomePage, ArticleDetail, ArticlesPage, AboutPage, ContactPage, AuthPage, CategoriesPage)
- Components: Located in `src/components/` (Navbar, Footer, BlogCard)
- Styles: CSS files in `src/styles/` and `src/App.css`
- Type definitions: `src/types/`

### BackendBlog12
- Technology stack: Java 25, Maven, Jakarta EE (JAX-RS, JPA, CDI, Servlet), Hibernate ORM
- Build tool: Maven (`pom.xml`)
- Entry point: `src/main/java/com/example/blog/HelloApplication.java`
- REST resources: `src/main/java/com/example/blog/HelloResource.java`
- Configuration: `src/main/java/com/example/blog/AppConfig.java`
- Entity models: `src/main/java/Metier/` (Article, Categorie, Comment, Media, Role, User, Statut)
- DAO implementations: `src/main/java/Dao/` (ImpMetier, ImpMetierMethode)
- Resources: `src/main/resources/` (persistence.xml, beans.xml)

## Common Development Commands

### FrontendBlog
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint linting
npm run lint
```

### BackendBlog12
```bash
# Clean and install dependencies
mvn clean install

# Package as WAR file
mvn package

# Run tests (if any exist)
mvn test

# Start application (would need to deploy toservlet container like Tomcat)
# mvn tomcat7:run  (if Tomcat plugin configured)
```

## Architecture Overview

### Frontend Architecture
- Uses React Router DOM for client-side routing
- Components are organized by feature/pages structure
- Styling uses Tailwind CSS via `@tailwindcss/vite` plugin
- TypeScript for type safety with strict type checking configured in tsconfig files
- Vite as build tool and development server

### Backend Architecture
- Jakarta EE REST API using JAX-RS (Jersey implementation)
- Persistence layer with Hibernate ORM (JPA)
- CDI for dependency injection
- Layered structure:
  - Resource layer: REST endpoints (`com.example.blog` package)
  - Service/business layer: DAO implementations (`Dao` package)
  - Entity layer: JPA entities (`Metier` package)
  - Configuration: JAX-RS application config and Hibernate persistence unit
- Communicates with frontend via JSON over HTTP

## Development Workflow

1. **Frontend Development**: 
   - Modify components in `src/components/`
   - Add/edit pages in `src/pages/`
   - Update styles in corresponding CSS files or use Tailwind classes
   - Run `npm run dev` to see changes with HMR

2. **Backend Development**:
   - Modify entity classes in `src/main/java/Metier/`
   - Update DAO implementations in `src/main/java/Dao/`
   - Add/modify REST endpoints in `src/main/java/com/example/blog/`
   - Configure persistence in `src/main/resources/persistence.xml`
   - Rebuild with `mvn package` and redeploy to test changes

## Testing Guidelines

- Frontend: Consider adding Vitest or Jest for unit tests, React Testing Library for component tests
- Backend: Consider adding JUnit tests for DAO and service classes, integration tests for REST endpoints
- Currently, no test framework is configured in either project

## Code Quality

- Frontend: ESLint configured with basic rules; consider enabling type-aware lint rules as suggested in README
- Backend: No specific code quality tools configured in pom.xml; consider adding Checkstyle, SpotBugs, or similar

## Database

- Backend uses Hibernate ORM with SQL Server JDBC driver (mssql-jdbc)
- Persistence unit configured in `src/main/resources/persistence.xml`
- Database schema should be managed through Hibernate hbm2ddl or migration scripts

## Environment Configuration

- Frontend: Environment variables can be handled via Vite's `import.meta.env`
- Backend: Consider using MicroProfile Config or similar for externalizing configuration
