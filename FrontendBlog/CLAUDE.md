# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This repository contains two main applications:
- **FrontendBlog**: React 19 + TypeScript + Vite + Tailwind CSS frontend application.
- **BackendBlog12**: Java 25 + Maven + Jakarta EE (JAX-RS, JPA, CDI) REST API backend.

### FrontendBlog Development Commands
- **Install dependencies**: `npm install`
- **Start development server**: `npm run dev`
- **Lint code**: `npm run lint`
- **Build for production**: `npm run build`
- **Preview build**: `npm run preview`
- **Run tests**: No test runner configured. To add one, consider Vitest/Jest.

### BackendBlog12 Development Commands
- **Install/Update dependencies & Compile**: `mvn clean install` (or `mvn install` if already compiled)
- **Package WAR**: `mvn package`
- **Run tests**: `mvn test` (if tests are configured in pom.xml)
- **Run application**: Application is packaged as a WAR file and typically deployed to a servlet container like Tomcat. Review `pom.xml` for specific deployment plugins or follow guide on how to deploy/run locally.

## High-Level Architecture

### FrontendBlog
The frontend is a Single Page Application built with React 19 and Vite.
- **Routing**: Handled by React Router DOM.
- **Pages**: Located in `src/pages/` (e.g., `ArticleDetail.tsx`, `ArticlesPage.tsx`).
- **Components**: Reusable UI parts live in `src/components/` (e.g., `Navbar`, `BlogCard`).
- **Styling**: Primarily uses Tailwind CSS utility classes; global styles are in `src/styles/` and `src/App.css`.
- **Types**: Core TypeScript definitions reside in `src/types/`.

### BackendBlog12
The backend is a Jakarta EE RESTful API with a layered architecture for business logic separation.
- **Resource Layer (REST Endpoints)**: JAX-RS services (Jersey), primarily in `src/main/java/com/example/blog/`. They handle HTTP requests.
- **Service/Business Layer (DAO)**: Implementations of business logic and data access methods located in `src/main/java/Dao/`.
- **Entity Layer (JPA)**: POJOs mapped to the database via Hibernate ORM, found in `src/main/java/Metier/`.
- **Persistence**: Configuration unit is defined in `src/main/resources/persistence.xml`.
- **Configuration**: CDI configuration for dependency injection is in `src/main/resources/beans.xml` and application setup in `src/main/java/com/example/blog/AppConfig.java`.
- **Database**: Uses SQL Server via `mssql-jdbc` driver. Database schema management should be handled via Hibernate DDL strategies or manual migration scripts referenced in `persistence.xml`.