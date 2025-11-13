# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Repository overview
- Monorepo with two apps:
  - Backend: revista-cms-api (Node.js + Express + PostgreSQL)
  - Frontend: revista-portal (Next.js + TypeScript + Tailwind)
- Convenience scripts under scripts/: scripts/install.sh, scripts/start.sh, scripts/stop.sh, scripts/validate.sh

Common commands
- Quick start (both apps)
  - Install and configure (interactive):
    - ./scripts/install.sh
  - Start both (backend on 3000, frontend on 3001, logs to logs/*.log):
    - ./scripts/start.sh
  - Stop both:
    - ./scripts/stop.sh
  - Validate setup (structure, deps, ports, endpoints, DB connection):
    - ./scripts/validate.sh

- Backend (revista-cms-api)
  - Dev server (nodemon):
    - cd revista-cms-api && npm run dev
  - Start (prod-style):
    - npm start
  - Lint and format:
    - npm run lint
    - npm run lint:fix
    - npm run format
    - npm run format:check
  - Tests (Jest):
    - All tests: npm test
    - Watch: npm run test:watch
    - Coverage: npm run test:coverage
    - Unit only: npm run test:unit
    - Integration only: npm run test:integration
    - Run a single test file:
      - npx jest src/__tests__/unit/services/AuthService.test.js
    - Run a single test by name:
      - npx jest -t "should login user"
  - Database helpers:
    - Initialize schema locally via psql (env must be set): npm run db:init
    - Create admin user (interactive): npm run create-admin

- Frontend (revista-portal)
  - Dev server (port 3001):
    - cd revista-portal && npm run dev
  - Build and start:
    - npm run build && npm start
  - Lint and typecheck:
    - npm run lint
    - npm run type-check

Key environment
- Backend (revista-cms-api/.env): DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET (>=32 chars), optional ALLOWED_ORIGINS (comma-separated), DB_SSL, BCRYPT_SALT_ROUNDS.
- Frontend (revista-portal/.env.local): NEXT_PUBLIC_API_URL (defaults used in next.config.js/lib/api.ts if not set).
- Supabase/PostgreSQL schema: supabase-schema.sql (apply in your DB service as needed).

Architecture and code structure (big picture)
- Backend (Express + PostgreSQL)
  - Entry point: src/index.js
    - Validates required env vars and JWT secret strength.
    - Security middleware: helmet (CSP tuned for PDFs), CORS with allowed origins, rate limiting (middleware/rateLimiter.js).
    - Global middleware: JSON/urlencoded parsers with size limits; serves /uploads static.
    - Health check: GET /health.
    - Route mounting: /api/auth, /api/publishers, /api/titles, /api/issues (and ratings), /api/favorites.
    - 404 handler, then global error handler (middleware/errorHandler.js) that returns standardized JSON using ResponseDTO.
  - Request flow
    - routes/*.js wires endpoints to controllers and attaches validators, rate limits, and auth middleware as needed.
    - controllers/*Controller.js parse/validate incoming data (validators are in middleware/validators.js), call services, and return ResponseDTO.success/created/updated.
    - services/*Service.js contain business logic, compose repositories, hash/compare passwords (bcryptjs), and issue JWTs (jsonwebtoken). Example: AuthService generates tokens and enforces role rules.
    - repositories/*Repository.js are the data access layer using pg Pool (config/database.js) and parameterized SQL; they shape SELECTs/INSERTs/UPDATEs and return rows.
    - dtos/*.js (e.g., UserDTO, ResponseDTO) map DB rows to API shapes and standardize responses. utils/caseConverter.js handles snake_case↔camelCase conversions where needed.
    - middleware/auth.js provides authenticate (JWT verification and req.user) and authorize(role) for RBAC. middleware/errorHandler.js normalizes errors, supports statusCode/code fields, and includes stack in development.
  - Testing
    - Jest config (jest.config.js) targets src/**/*.js (excluding src/index.js), sets global coverage thresholds at 80%, uses src/test-setup.js, and supports unit and integration tests under src/__tests__.

- Frontend (Next.js App Router)
  - Next.js 16 with TypeScript and Tailwind 4.
  - App structure under revista-portal/src:
    - app/: routed pages (e.g., /login, /admin, /publishers/[id], /issues/[id]) with a shared RootLayout providing Navbar, Providers, and footer.
    - lib/api.ts: centralized Axios instance with baseURL from NEXT_PUBLIC_API_URL, request interceptor injecting Bearer token from localStorage, and response interceptor that clears auth and redirects on 401. Organized API clients for auth, publishers, titles, issues, ratings/comments, and favorites.
    - stores/authStore.ts: Zustand + persist store maintaining user/token; also mirrors token to localStorage for the Axios interceptor.
    - hooks/useRequireAuth.ts: client-side route protection and role gating.
    - components/ui/*: small, typed UI primitives; components/layout/navbar.tsx provides top navigation and auth UI.
    - next.config.js exposes env, configures images, and enables strict mode.

Integration between apps
- Typical auth flow: frontend posts to /api/auth/login → backend AuthService validates, issues JWT → frontend stores token via authStore and localStorage → Axios attaches Authorization: Bearer <token> → backend middleware/auth.js authenticates requests to private routes.
- CORS: backend enforces allowed origins via ALLOWED_ORIGINS (defaults include http://localhost:3000 and http://localhost:3001 in development); ensure this matches your frontend origin when changing ports/domains.

Ports and URLs
- Backend API: http://localhost:3000 (health at /health)
- Frontend: http://localhost:3001

Notes for working effectively in this repo
- Node >= 18 is required (see engines in revista-cms-api/package.json).
- Jest single-test workflow is fastest for backend development; keep tests under src/__tests__/ with unit/integration subfolders to align with existing scripts.
- When initializing a local PostgreSQL instance, npm run db:init uses psql and the .env DB_* values; for hosted DBs, apply supabase-schema.sql directly in your provider.
- The root validate.sh script is useful for quick diagnostics (files, deps, ports, health, DB connectivity) during local dev.
