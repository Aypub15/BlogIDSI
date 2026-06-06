# AGENTS.md

**Monorepo:** `FrontendBlog/` (React 19 + Vite 8) + `BackendBlog12/` (Jakarta EE WAR)

## Frontend (FrontendBlog/)

```bash
npm install        # install dependencies
npm run dev        # Vite dev server (HMR)
npm run build      # tsc -b && vite build (typecheck before build)
npm run test       # vitest (jsdom, @testing-library/react)
npm run lint       # eslint flat config (ts-eslint, react-hooks)
```

- **Supabase auth** needs `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` env vars
- **Paths:** `@/` alias works in vitest config only (not in vite.config.ts or tsconfig); use relative imports elsewhere
- Tests mock `auth/authProvider` and `@supabase/supabase-js` — see `src/app.test.tsx` pattern

## Backend (BackendBlog12/)

```bash
mvn clean install  # compile + package WAR
mvn package        # WAR in target/
mvn test           # JUnit 5 tests
```

- Jakarta EE (JAX-RS Jersey 2.39, CDI 4.1, Hibernate ORM 6.4, Servlet 6.1)
- `AppConfig.java` was removed (duplicate of `HelloApplication.java`)
- JPA persistence unit `default` → SQL Server at `jdbc:sqlserver://localhost:1433;databaseName=blog`, DDL auto-update
- WAR deploys to any Servlet 6 container (Tomcat 10+)

## Known issues in existing CLAUDE.md files

- `CLAUDE.md` and `FrontendBlog/CLAUDE.md` claim "no test framework" — **Tests exist** (`npm run test`, Vitest + React Testing Library)
